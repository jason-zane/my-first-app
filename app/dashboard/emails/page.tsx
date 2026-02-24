import { createAdminClient } from '@/utils/supabase/admin'
import { defaultEmailTemplates, type EmailTemplateKey } from '@/utils/email-templates'
import { updateEmailTemplate } from '@/app/dashboard/emails/actions'

type EmailTemplateRow = {
  key: EmailTemplateKey
  name: string
  description: string | null
  subject: string
  html_body: string
  text_body: string | null
  updated_at: string
}

const templateLabels: Record<EmailTemplateKey, string> = {
  interest_internal_notification: 'Internal Notification',
  interest_user_confirmation: 'User Confirmation',
}

const unknownDateIso = new Date(0).toISOString()

export default async function EmailTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const adminClient = createAdminClient()
  let loadError: string | null = null

  const fallbackRowsByKey = new Map(
    (Object.keys(defaultEmailTemplates) as EmailTemplateKey[]).map((key) => [
      key,
      {
        key,
        name: templateLabels[key],
        description: 'Using in-code fallback. Run latest migrations to make this editable.',
        subject: defaultEmailTemplates[key].subject,
        html_body: defaultEmailTemplates[key].html,
        text_body: defaultEmailTemplates[key].text,
        updated_at: unknownDateIso,
      } satisfies EmailTemplateRow,
    ])
  )

  let templateRows: EmailTemplateRow[] = (Object.keys(defaultEmailTemplates) as EmailTemplateKey[]).map(
    (key) =>
      fallbackRowsByKey.get(key) ?? {
      key,
      name: templateLabels[key],
      description: 'Using in-code fallback. Run latest migrations to make this editable.',
      subject: defaultEmailTemplates[key].subject,
      html_body: defaultEmailTemplates[key].html,
      text_body: defaultEmailTemplates[key].text,
      updated_at: unknownDateIso,
    }
  )

  if (!adminClient) {
    loadError = 'Missing SUPABASE_SERVICE_ROLE_KEY. Cannot load or save email templates.'
  } else {
    const { data, error } = await adminClient
      .from('email_templates')
      .select('key, name, description, subject, html_body, text_body, updated_at')
      .order('key', { ascending: true })

    if (error) {
      loadError = error.message
    } else {
      const dbRows = (data ?? []) as EmailTemplateRow[]
      const templatesByKey = new Map(dbRows.map((row) => [row.key, row]))
      templateRows = (Object.keys(defaultEmailTemplates) as EmailTemplateKey[]).map((key) => {
        return templatesByKey.get(key) ?? fallbackRowsByKey.get(key)!
      })
    }
  }

  const saveSucceeded = params.saved === '1'
  const hasSaveError = typeof params.error === 'string'

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Email Templates</h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Edit transactional email copy and variables.
      </p>

      {saveSucceeded ? (
        <p className="mb-6 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          Email template saved.
        </p>
      ) : null}

      {hasSaveError ? (
        <p className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Could not save template. Please verify migrations are up to date and try again.
        </p>
      ) : null}

      {loadError ? (
        <p className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Could not load templates: {loadError}
        </p>
      ) : null}

      <div className="space-y-6">
        {templateRows.map((template) => (
          <form
            key={template.key}
            action={updateEmailTemplate}
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <input type="hidden" name="key" value={template.key} />
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{template.name}</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {template.description ?? templateLabels[template.key]}
              </p>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                Last updated:{' '}
                {template.updated_at === unknownDateIso
                  ? 'unknown'
                  : new Date(template.updated_at).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Variables: <code>{'{{first_name}}'}</code>, <code>{'{{last_name}}'}</code>,{' '}
                <code>{'{{email}}'}</code>, <code>{'{{source}}'}</code>
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor={`${template.key}-subject`}
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Subject
              </label>
              <input
                id={`${template.key}-subject`}
                name="subject"
                defaultValue={template.subject}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor={`${template.key}-html-body`}
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                HTML Body
              </label>
              <textarea
                id={`${template.key}-html-body`}
                name="html_body"
                defaultValue={template.html_body}
                className="min-h-48 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor={`${template.key}-text-body`}
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Text Body (optional)
              </label>
              <textarea
                id={`${template.key}-text-body`}
                name="text_body"
                defaultValue={template.text_body ?? ''}
                className="min-h-32 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
              />
            </div>

            <button
              type="submit"
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Save Template
            </button>
          </form>
        ))}
      </div>
    </section>
  )
}
