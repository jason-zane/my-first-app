import { Suspense } from 'react'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { CopyEmail } from '@/components/ui/copy-email'
import { RelativeTime } from '@/components/ui/relative-time'
import { ActionFeedback } from '@/components/ui/action-feedback'
import { InviteUserDialog } from '@/components/dashboard/users/invite-user-dialog'
import { UserRowActions } from '@/components/dashboard/users/user-row-actions'

type ProfileRow = {
  user_id: string
  role: 'admin' | 'staff'
}

type AuthUser = {
  id: string
  email?: string | null
  created_at?: string
  last_sign_in_at?: string | null
}

const feedbackMessages: Record<string, string> = {
  '1': 'Role updated.',
  invited_set_sent: 'Invite sent — they will receive an email to set their password.',
  password_reset_sent: 'Password reset email sent.',
  removed: 'User removed.',
  role_only: 'User already exists — role updated.',
  mfa_reset: 'MFA reset. They will re-enrol on next login.',
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await searchParams

  const adminClient = createAdminClient()
  const supabase = await createClient()
  let users: AuthUser[] = []
  let rolesByUserId = new Map<string, 'admin' | 'staff'>()
  let mfaEnrolledUserIds = new Set<string>()
  let loadError: string | null = null

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!adminClient) {
    loadError = 'Missing SUPABASE_SERVICE_ROLE_KEY in environment.'
  } else {
    const [{ data: usersResult, error: usersError }, { data: profiles, error: profilesError }] =
      await Promise.all([
        adminClient.auth.admin.listUsers(),
        adminClient.from('profiles').select('user_id, role'),
      ])

    if (usersError) {
      loadError = usersError.message
    } else if (profilesError) {
      loadError = profilesError.message
    } else {
      users = (usersResult.users ?? []) as AuthUser[]
      rolesByUserId = new Map(
        ((profiles ?? []) as ProfileRow[]).map((p) => [p.user_id, p.role])
      )

      // Best-effort: fetch all MFA factors to show enrollment status
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && serviceKey) {
        try {
          const res = await fetch(`${supabaseUrl}/auth/v1/admin/factors`, {
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              apikey: serviceKey,
            },
          })
          if (res.ok) {
            const factors = (await res.json()) as Array<{
              user_id: string
              status: string
              factor_type: string
            }>
            for (const factor of factors) {
              if (factor.factor_type === 'totp' && factor.status === 'verified') {
                mfaEnrolledUserIds.add(factor.user_id)
              }
            }
          }
        } catch {
          // MFA status unavailable — degrade gracefully
        }
      }
    }
  }

  return (
    <section>
      <Suspense>
        <ActionFeedback messages={feedbackMessages} />
      </Suspense>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Users</h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            Manage backend access, roles, and authentication.
          </p>
        </div>
        <InviteUserDialog />
      </div>

      {loadError ? (
        <p className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Could not load users: {loadError}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                User
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Role
              </th>
              <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:table-cell">
                MFA
              </th>
              <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 lg:table-cell">
                Last active
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No users yet. Invite the first user to get started.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const role = rolesByUserId.get(user.id) ?? 'staff'
                const mfaEnrolled = mfaEnrolledUserIds.size > 0
                  ? mfaEnrolledUserIds.has(user.id)
                  : null
                const isSelf = user.id === currentUser?.id
                const displayEmail = user.email ?? 'Unknown'

                return (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={displayEmail} />
                        <div className="min-w-0">
                          <CopyEmail email={displayEmail} />
                          {isSelf && (
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">You</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={role}>{role}</Badge>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {mfaEnrolled === null ? (
                        <span className="text-xs text-zinc-400">—</span>
                      ) : mfaEnrolled ? (
                        <Badge variant="enrolled">Enrolled</Badge>
                      ) : (
                        <Badge variant="warning">Not set</Badge>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {user.last_sign_in_at ? (
                          <RelativeTime date={user.last_sign_in_at} />
                        ) : (
                          'Never'
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UserRowActions
                        userId={user.id}
                        email={user.email ?? ''}
                        currentRole={role}
                        isSelf={isSelf}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
