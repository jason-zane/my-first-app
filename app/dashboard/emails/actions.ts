'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { isAdminEmail } from '@/utils/admin-access'
import { defaultEmailTemplates, type EmailTemplateKey } from '@/utils/email-templates'

function isTemplateKey(value: string): value is EmailTemplateKey {
  return value in defaultEmailTemplates
}

export async function updateEmailTemplate(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (!isAdminEmail(user.email)) {
    redirect('/dashboard')
  }

  const key = String(formData.get('key') ?? '')
  const subject = String(formData.get('subject') ?? '').trim()
  const htmlBody = String(formData.get('html_body') ?? '').trim()
  const textBodyRaw = String(formData.get('text_body') ?? '').trim()
  const textBody = textBodyRaw.length > 0 ? textBodyRaw : null

  if (!isTemplateKey(key)) {
    redirect('/dashboard/emails?error=invalid_template')
  }

  if (!subject || !htmlBody) {
    redirect('/dashboard/emails?error=missing_fields')
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    redirect('/dashboard/emails?error=missing_service_role')
  }

  const { error } = await adminClient
    .from('email_templates')
    .update({
      subject,
      html_body: htmlBody,
      text_body: textBody,
      updated_at: new Date().toISOString(),
    })
    .eq('key', key)

  if (error) {
    redirect('/dashboard/emails?error=save_failed')
  }

  revalidatePath('/dashboard/emails')
  redirect('/dashboard/emails?saved=1')
}
