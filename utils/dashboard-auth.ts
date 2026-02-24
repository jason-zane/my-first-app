import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isAdminEmail } from '@/utils/admin-access'
import { createAdminClient } from '@/utils/supabase/admin'

// Access is granted in two ways:
// 1) Profile row with role='admin' in the database (normal operation)
// 2) Email in ADMIN_DASHBOARD_EMAILS + ALLOW_ADMIN_EMAIL_BOOTSTRAP=true (initial setup only)
// Once an admin account exists in the database, disable bootstrap by setting
// ALLOW_ADMIN_EMAIL_BOOTSTRAP=false (or removing it).

type ProfileRoleRow = {
  role: 'admin' | 'staff'
}

export async function requireAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  if (adminClient) {
    const { data } = await adminClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    const role = (data as ProfileRoleRow | null)?.role ?? null
    if (role === 'admin') {
      return { user, authorized: true as const }
    }
  }

  const allowBootstrap = process.env.ALLOW_ADMIN_EMAIL_BOOTSTRAP === 'true'
  if (allowBootstrap && isAdminEmail(user.email)) {
    return { user, authorized: true as const, bootstrap: true as const }
  }

  return { user, authorized: false as const }
}
