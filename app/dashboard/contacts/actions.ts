'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdminUser } from '@/utils/dashboard-auth'

async function ensureAdmin() {
  const auth = await requireAdminUser()
  if (!auth.authorized) {
    redirect('/dashboard')
  }
}

export async function updateContactStatus(formData: FormData) {
  await ensureAdmin()

  const contactId = String(formData.get('contact_id') ?? '').trim()
  const nextStatus = String(formData.get('status') ?? '').trim()

  if (!contactId || !nextStatus) {
    redirect('/dashboard/contacts?error=invalid_status_update')
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    redirect(`/dashboard/contacts/${contactId}?error=missing_service_role`)
  }

  const { error } = await adminClient
    .from('contacts')
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contactId)

  if (error) {
    redirect(`/dashboard/contacts/${contactId}?error=status_update_failed`)
  }

  await adminClient.from('contact_events').insert({
    contact_id: contactId,
    event_type: 'status_changed',
    event_data: { status: nextStatus },
  })

  revalidatePath('/dashboard/contacts')
  revalidatePath(`/dashboard/contacts/${contactId}`)
  redirect(`/dashboard/contacts/${contactId}?saved=status`)
}

export async function addContactNote(formData: FormData) {
  await ensureAdmin()

  const contactId = String(formData.get('contact_id') ?? '').trim()
  const note = String(formData.get('note') ?? '').trim()

  if (!contactId || !note) {
    redirect(`/dashboard/contacts/${contactId}?error=invalid_note`)
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    redirect(`/dashboard/contacts/${contactId}?error=missing_service_role`)
  }

  const { error: eventError } = await adminClient.from('contact_events').insert({
    contact_id: contactId,
    event_type: 'note',
    event_data: {},
    note,
  })

  if (eventError) {
    redirect(`/dashboard/contacts/${contactId}?error=note_save_failed`)
  }

  await adminClient
    .from('contacts')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', contactId)

  revalidatePath('/dashboard/contacts')
  revalidatePath(`/dashboard/contacts/${contactId}`)
  redirect(`/dashboard/contacts/${contactId}?saved=note`)
}
