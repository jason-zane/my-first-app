'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireDashboardUser } from '@/utils/dashboard-auth'
import { upsertContactByEmail, createContactEvent } from '@/utils/services/contacts'
import { linkSubmissionToContact } from '@/utils/services/submissions'

async function ensureDashboardUser() {
  const auth = await requireDashboardUser()
  if (!auth.authorized) {
    redirect('/dashboard')
  }
}

export async function linkSubmissionContact(formData: FormData) {
  await ensureDashboardUser()

  const submissionId = String(formData.get('submission_id') ?? '').trim()
  const firstName = String(formData.get('first_name') ?? '').trim()
  const lastName = String(formData.get('last_name') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const sourceRaw = String(formData.get('source') ?? '').trim()
  const source = sourceRaw || null

  if (!submissionId || !firstName || !lastName || !email) {
    redirect('/dashboard/submissions?error=invalid_submission')
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    redirect('/dashboard/submissions?error=missing_service_role')
  }

  const contactResult = await upsertContactByEmail(adminClient, {
    firstName,
    lastName,
    email,
    source,
  })

  if (!contactResult.data?.id || contactResult.error) {
    redirect('/dashboard/submissions?error=contact_upsert_failed')
  }

  const contactId = contactResult.data.id
  const { error: linkError } = await linkSubmissionToContact(adminClient, submissionId, contactId)
  if (linkError) {
    redirect('/dashboard/submissions?error=contact_link_failed')
  }

  await createContactEvent(adminClient, {
    contactId,
    eventType: 'submission_linked',
    eventData: {
      submission_id: submissionId,
      source,
    },
  })

  revalidatePath('/dashboard/submissions')
  revalidatePath('/dashboard/contacts')
  revalidatePath(`/dashboard/contacts/${contactId}`)
  redirect('/dashboard/submissions?saved=linked')
}

export async function updateSubmissionStatus(formData: FormData) {
  await ensureDashboardUser()

  const submissionId = String(formData.get('submission_id') ?? '').trim()
  const nextStatus = String(formData.get('status') ?? '').trim()
  const contactIdRaw = String(formData.get('contact_id') ?? '').trim()
  const contactId = contactIdRaw || null

  if (!submissionId || !nextStatus) {
    redirect('/dashboard/submissions?error=invalid_status_update')
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    redirect('/dashboard/submissions?error=missing_service_role')
  }

  const { error } = await adminClient
    .from('interest_submissions')
    .update({
      status: nextStatus,
    })
    .eq('id', submissionId)

  if (error) {
    redirect('/dashboard/submissions?error=submission_status_failed')
  }

  if (contactId) {
    await createContactEvent(adminClient, {
      contactId,
      eventType: 'submission_status_changed',
      eventData: {
        submission_id: submissionId,
        status: nextStatus,
      },
    })
    revalidatePath(`/dashboard/contacts/${contactId}`)
  }

  revalidatePath('/dashboard/submissions')
  redirect('/dashboard/submissions?saved=status')
}
