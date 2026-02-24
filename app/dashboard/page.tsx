import Link from 'next/link'
import { createAdminClient } from '@/utils/supabase/admin'

export default async function DashboardOverviewPage() {
  const adminClient = createAdminClient()

  let submissionsCount: number | null = null
  let emailTemplatesCount: number | null = null
  let loadError: string | null = null

  if (!adminClient) {
    loadError = 'Missing SUPABASE_SERVICE_ROLE_KEY in environment.'
  } else {
    const [{ count: submissionCount, error: submissionsError }, { count: templatesCount, error: templatesError }] =
      await Promise.all([
        adminClient.from('interest_submissions').select('*', { count: 'exact', head: true }),
        adminClient.from('email_templates').select('*', { count: 'exact', head: true }),
      ])

    if (submissionsError) {
      loadError = submissionsError.message
    } else if (templatesError) {
      loadError = templatesError.message
    } else {
      submissionsCount = submissionCount ?? 0
      emailTemplatesCount = templatesCount ?? 0
    }
  }

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Overview</h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Core backend modules for operations and CRM growth.
      </p>

      {loadError ? (
        <p className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Could not load overview metrics: {loadError}
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Submissions</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            {submissionsCount ?? '-'}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Email Templates</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            {emailTemplatesCount ?? '-'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/submissions"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Submissions</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            View and triage interest form submissions.
          </p>
        </Link>
        <Link
          href="/dashboard/contacts"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Contacts</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            CRM records and relationship activity.
          </p>
        </Link>
        <Link
          href="/dashboard/emails"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Email Templates</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Edit transactional message content.
          </p>
        </Link>
        <Link
          href="/dashboard/users"
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Users</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage admin backend access.
          </p>
        </Link>
      </div>
    </section>
  )
}
