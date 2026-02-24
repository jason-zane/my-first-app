import type { SupabaseClient } from '@supabase/supabase-js'
import {
  defaultEmailTemplates,
  type EmailTemplateKey,
  type EmailTemplateRecord,
  type TemplateRuntimeShape,
} from '@/utils/email-templates'

type RuntimeTemplates = Record<EmailTemplateKey, TemplateRuntimeShape>

export async function getRuntimeEmailTemplates(
  client: SupabaseClient | null
): Promise<RuntimeTemplates> {
  if (!client) {
    return defaultEmailTemplates
  }

  const { data, error } = await client
    .from('email_templates')
    .select('key, subject, html_body, text_body')

  if (error || !data) {
    return defaultEmailTemplates
  }

  const byKey = new Map(
    (data as EmailTemplateRecord[]).map((row) => [
      row.key,
      {
        subject: row.subject,
        html: row.html_body,
        text: row.text_body,
      },
    ])
  )

  return {
    interest_internal_notification:
      byKey.get('interest_internal_notification') ??
      defaultEmailTemplates.interest_internal_notification,
    interest_user_confirmation:
      byKey.get('interest_user_confirmation') ?? defaultEmailTemplates.interest_user_confirmation,
  }
}
