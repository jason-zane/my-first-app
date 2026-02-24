import Link from 'next/link'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import { requireAdminUser } from '@/utils/dashboard-auth'
import { createClient } from '@/utils/supabase/server'

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/submissions', label: 'Submissions' },
  { href: '/dashboard/contacts', label: 'Contacts' },
  { href: '/dashboard/emails', label: 'Emails' },
  { href: '/dashboard/users', label: 'Users' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = await requireAdminUser()

  if (!auth.authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm dark:bg-zinc-900">
          <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">{auth.user.email}</p>
          <p className="mb-6 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            You do not have access to the admin backend.
            {process.env.ALLOW_ADMIN_EMAIL_BOOTSTRAP !== 'true' ? (
              <span className="mt-2 block text-xs text-amber-600 dark:text-amber-400">
                If you are the first admin, set ALLOW_ADMIN_EMAIL_BOOTSTRAP=true and add your
                email to ADMIN_DASHBOARD_EMAILS in environment variables.
              </span>
            ) : null}
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-full border border-zinc-300 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    )
  }

  const enforceTotp = process.env.ENFORCE_ADMIN_TOTP !== 'false'
  if (enforceTotp) {
    const supabase = await createClient()
    const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    const currentLevel = aalData?.currentLevel ?? null
    if (!aalError && currentLevel !== 'aal2') {
      const { data: factorsData } = await supabase.auth.mfa.listFactors()
      const hasVerifiedTotp = factorsData?.totp?.some((factor) => factor.status === 'verified') ?? false
      const destination = hasVerifiedTotp ? '/mfa/totp/verify' : '/mfa/totp/enroll'
      redirect(`${destination}?next=/dashboard`)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8">
        <aside className="hidden w-64 shrink-0 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:block">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Admin Backend
          </p>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <div className="mb-6 rounded-lg border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{auth.user.email}</p>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
                >
                  Log out
                </button>
              </form>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 md:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md border border-zinc-200 px-3 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
