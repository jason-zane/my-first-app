'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdminUser } from '@/utils/dashboard-auth'
import { getPasswordRedirectUrl } from '@/utils/auth-urls'

const allowedRoles = new Set(['admin', 'staff'])

async function ensureAdmin() {
  const auth = await requireAdminUser()
  if (!auth.authorized) {
    redirect('/dashboard')
  }
  return auth.user
}

function createPublicAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    return null
  }

  return createSupabaseClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function findAuthUserIdByEmail(email: string) {
  const adminClient = createAdminClient()
  if (!adminClient) {
    return null
  }

  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (error) {
    return null
  }

  const user = data.users.find((candidate) => (candidate.email ?? '').toLowerCase() === email)
  return user?.id ?? null
}

export async function updateUserRole(formData: FormData) {
  const currentUser = await ensureAdmin()

  const userId = String(formData.get('user_id') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim()

  if (!userId || !allowedRoles.has(role)) {
    redirect('/dashboard/users?error=invalid_role')
  }
  if (currentUser.id === userId && role !== 'admin') {
    redirect('/dashboard/users?error=cannot_demote_self')
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    redirect('/dashboard/users?error=missing_service_role')
  }

  const { error } = await adminClient.from('profiles').upsert(
    {
      user_id: userId,
      role,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    redirect('/dashboard/users?error=role_update_failed')
  }

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users?saved=1')
}

export async function inviteUser(formData: FormData) {
  await ensureAdmin()

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const role = String(formData.get('role') ?? 'staff').trim()

  if (!email || !allowedRoles.has(role) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect('/dashboard/users?error=invalid_invite')
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    redirect('/dashboard/users?error=missing_service_role')
  }

  const { data: listResult, error: listError } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (listError) {
    redirect('/dashboard/users?error=invite_failed')
  }

  const existingUser = listResult.users.find((user) => (user.email ?? '').toLowerCase() === email)

  if (existingUser) {
    const { error: upsertExistingError } = await adminClient.from('profiles').upsert(
      {
        user_id: existingUser.id,
        role,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (upsertExistingError) {
      redirect('/dashboard/users?error=invite_failed')
    }

    revalidatePath('/dashboard/users')
    redirect('/dashboard/users?saved=role_only')
  }

  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: getPasswordRedirectUrl('set'),
  })
  if (inviteError) {
    const message = inviteError.message.toLowerCase()
    const errorCode = message.includes('redirect')
      ? 'invite_redirect_not_allowed'
      : message.includes('smtp') || message.includes('email')
        ? 'invite_email_provider_failed'
        : 'invite_email_failed'
    redirect(`/dashboard/users?error=${errorCode}`)
  }

  const invitedUserId = invited.user?.id ?? (await findAuthUserIdByEmail(email))
  if (!invitedUserId) {
    redirect('/dashboard/users?error=invite_failed')
  }

  const { error: profileError } = await adminClient.from('profiles').upsert(
    {
      user_id: invitedUserId,
      role,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (profileError) {
    redirect('/dashboard/users?error=profile_failed')
  }

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users?saved=invited_set_sent')
}

export async function sendPasswordResetEmail(formData: FormData) {
  await ensureAdmin()

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect('/dashboard/users?error=invalid_email')
  }

  const authClient = createPublicAuthClient()
  if (!authClient) {
    redirect('/dashboard/users?error=missing_public_supabase')
  }

  const { error } = await authClient.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordRedirectUrl('reset'),
  })

  if (error) {
    redirect('/dashboard/users?error=password_reset_email_failed')
  }

  redirect('/dashboard/users?saved=password_reset_sent')
}

export async function resetUserMfa(formData: FormData) {
  await ensureAdmin()

  const userId = String(formData.get('user_id') ?? '').trim()
  if (!userId) {
    redirect('/dashboard/users?error=invalid_user')
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    redirect('/dashboard/users?error=missing_service_role')
  }

  const { data, error: listError } = await adminClient.auth.admin.mfa.listFactors({
    userId,
  })
  if (listError) {
    redirect('/dashboard/users?error=mfa_reset_failed')
  }

  for (const factor of data?.factors ?? []) {
    const { error: deleteError } = await adminClient.auth.admin.mfa.deleteFactor({
      userId,
      id: factor.id,
    })
    if (deleteError) {
      redirect('/dashboard/users?error=mfa_reset_failed')
    }
  }

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users?saved=mfa_reset')
}

export async function removeUser(formData: FormData) {
  const currentUser = await ensureAdmin()
  const userId = String(formData.get('user_id') ?? '').trim()

  if (!userId) {
    redirect('/dashboard/users?error=invalid_user')
  }
  if (userId === currentUser.id) {
    redirect('/dashboard/users?error=cannot_remove_self')
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    redirect('/dashboard/users?error=missing_service_role')
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) {
    redirect('/dashboard/users?error=remove_failed')
  }

  revalidatePath('/dashboard/users')
  redirect('/dashboard/users?saved=removed')
}
