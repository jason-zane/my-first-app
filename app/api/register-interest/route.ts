import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { renderTemplate } from '@/utils/email-templates'
import { getRuntimeEmailTemplates } from '@/utils/services/email-templates'
import { createInterestSubmission, linkSubmissionToContact } from '@/utils/services/submissions'
import { createContactEvent, upsertContactByEmail } from '@/utils/services/contacts'

const resendApiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL
const notificationTo = process.env.RESEND_NOTIFICATION_TO
const replyTo = process.env.RESEND_REPLY_TO

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  try {
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'Email service is not configured.' },
        { status: 500 }
      )
    }
    if (!fromEmail || !notificationTo) {
      return NextResponse.json(
        { error: 'Email sender/recipient is not configured.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const firstName = String(formData.get('firstName') ?? '').trim()
    const lastName = String(formData.get('lastName') ?? '').trim()
    const email = String(formData.get('email') ?? '')
      .trim()
      .toLowerCase()
    const source = String(formData.get('source') ?? '').trim() || null
    const notesRaw = String(formData.get('notes') ?? '').trim() || null

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const adminClient =
      supabaseUrl && supabaseServiceRoleKey
        ? createClient(supabaseUrl, supabaseServiceRoleKey)
        : null

    if (adminClient) {
      const submissionResult = await createInterestSubmission(adminClient, {
        firstName,
        lastName,
        email,
        source,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
        userAgent: request.headers.get('user-agent') ?? null,
      })

      if (submissionResult.error) {
        if (submissionResult.missingTable) {
          return NextResponse.json(
            {
              error:
                'Database table is missing. Run the interest_submissions SQL migration in Supabase.',
            },
            { status: 500 }
          )
        }

        return NextResponse.json(
          { error: `Could not save your registration. ${submissionResult.error}` },
          { status: 500 }
        )
      }

      if (submissionResult.data?.id) {
        const contactResult = await upsertContactByEmail(adminClient, {
          firstName,
          lastName,
          email,
          source,
        })

        if (contactResult.data?.id) {
          const contactId = contactResult.data.id
          await linkSubmissionToContact(adminClient, submissionResult.data.id, contactId)
          await createContactEvent(adminClient, {
            contactId,
            eventType: 'submission',
            eventData: {
              submission_id: submissionResult.data.id,
              source,
              status: 'new',
            },
          })
        } else if (contactResult.error) {
          console.error('contact upsert failed:', contactResult.error)
        }
      }
    }

    const resend = new Resend(resendApiKey)
    const sourceLabel = source ?? 'Not provided'
    const templates = await getRuntimeEmailTemplates(adminClient)
    const notesHtml = notesRaw
      ? `<p><strong>Additional details:</strong></p><pre style="white-space:pre-wrap;font-size:13px">${notesRaw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
      : ''

    const templateVars = {
      first_name: firstName,
      last_name: lastName,
      email,
      source: sourceLabel,
      notes: notesHtml,
    }

    const internalNotification = renderTemplate(
      templates.interest_internal_notification,
      templateVars,
      true
    )
    const confirmation = renderTemplate(templates.interest_user_confirmation, templateVars, true)

    const internalEmailResult = await resend.emails.send({
      from: fromEmail,
      to: notificationTo,
      replyTo: replyTo ?? email,
      subject: internalNotification.subject,
      html: internalNotification.html,
      text: internalNotification.text ?? undefined,
    })

    if (internalEmailResult.error) {
      return NextResponse.json(
        {
          error:
            'Could not send notification email. Verify your Resend sender domain and from address.',
        },
        { status: 500 }
      )
    }

    const confirmationEmailResult = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: replyTo ?? notificationTo,
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text ?? undefined,
    })

    if (confirmationEmailResult.error) {
      return NextResponse.json(
        { error: 'Saved registration, but confirmation email could not be sent.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error.'
    console.error('register-interest error:', message)
    return NextResponse.json({ error: `Unexpected error: ${message}` }, { status: 500 })
  }
}
