import { createAdminClient } from '@/utils/supabase/admin'
import {
  inviteUser,
  resetUserMfa,
  removeUser,
  sendPasswordResetEmail,
  updateUserRole,
} from '@/app/dashboard/users/actions'

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

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const adminClient = createAdminClient()
  let users: AuthUser[] = []
  let rolesByUserId = new Map<string, 'admin' | 'staff'>()
  let loadError: string | null = null

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
        ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.user_id, profile.role])
      )
    }
  }

  const saved = params.saved === '1'
  const savedCode = typeof params.saved === 'string' ? params.saved : null
  const errorCode = typeof params.error === 'string' ? params.error : null

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Users</h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Manage backend users, roles, and login emails.
      </p>

      {saved || savedCode ? (
        <p className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          {savedCode === 'invited'
            ? 'User invited and email sent.'
            : savedCode === 'invited_set_sent'
              ? 'User created and password setup email sent.'
            : savedCode === 'password_reset_sent'
              ? 'Password reset email sent.'
              : savedCode === 'mfa_reset'
                ? 'MFA reset. User must re-enroll on next login.'
                : savedCode === 'removed'
                  ? 'User removed.'
                  : savedCode === 'role_only'
                    ? 'User already exists; role updated.'
                  : 'User role updated.'}
        </p>
      ) : null}

      {errorCode ? (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {errorCode === 'invite_email_failed'
            ? 'Could not send invite email. Please check Auth email settings and try again.'
            : errorCode === 'invite_redirect_not_allowed'
              ? 'Invite redirect URL is not allowed. Add /set-password URL in Supabase Auth URL Configuration.'
              : errorCode === 'invite_email_provider_failed'
                ? 'Supabase could not send email. Check Auth email provider settings and sender configuration.'
            : errorCode === 'mfa_reset_failed'
              ? 'Could not reset MFA factors for this user.'
              : 'Could not complete user action.'}
        </p>
      ) : null}

      <form
        action={inviteUser}
        className="mb-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-4"
      >
        <input
          type="email"
          name="email"
          placeholder="new.user@example.com"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
          required
        />
        <select
          name="role"
          defaultValue="staff"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
        >
          <option value="staff">staff</option>
          <option value="admin">admin</option>
        </select>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Invite User (Send Password Setup Email)
          </button>
        </div>
      </form>

      {loadError ? (
        <p className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Could not load users: {loadError}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Last Sign In</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const currentRole = rolesByUserId.get(user.id) ?? 'staff'
                return (
                  <tr
                    key={user.id}
                    className="border-t border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:text-zinc-200"
                  >
                    <td className="px-4 py-3">{user.email ?? 'No email'}</td>
                    <td className="px-4 py-3">{currentRole}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <form action={updateUserRole} className="flex items-center gap-2">
                          <input type="hidden" name="user_id" value={user.id} />
                          <select
                            name="role"
                            defaultValue={currentRole}
                            className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
                          >
                            <option value="staff">staff</option>
                            <option value="admin">admin</option>
                          </select>
                          <button
                            type="submit"
                            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
                          >
                            Save Role
                          </button>
                        </form>

                        <form action={sendPasswordResetEmail}>
                          <input type="hidden" name="email" value={user.email ?? ''} />
                          <button
                            type="submit"
                            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
                            disabled={!user.email}
                          >
                            Send Password Reset
                          </button>
                        </form>

                        <form action={resetUserMfa}>
                          <input type="hidden" name="user_id" value={user.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
                          >
                            Reset MFA
                          </button>
                        </form>

                        <form action={removeUser}>
                          <input type="hidden" name="user_id" value={user.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                          >
                            Remove
                          </button>
                        </form>
                      </div>
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
