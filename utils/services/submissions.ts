import type { SupabaseClient } from '@supabase/supabase-js'

export type CreateInterestSubmissionInput = {
  firstName: string
  lastName: string
  email: string
  source: string | null
  ipAddress: string | null
  userAgent: string | null
}

type ServiceResult<T> = {
  data: T | null
  error: string | null
  missingTable: boolean
}

export async function createInterestSubmission(
  client: SupabaseClient,
  input: CreateInterestSubmissionInput
): Promise<ServiceResult<{ id: string }>> {
  const { data, error } = await client
    .from('interest_submissions')
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      source: input.source,
      ip_address: input.ipAddress,
      user_agent: input.userAgent,
    })
    .select('id')
    .single()

  if (!error) {
    return {
      data: { id: data.id as string },
      error: null,
      missingTable: false,
    }
  }

  const message = error.message.toLowerCase()
  return {
    data: null,
    error: error.message,
    missingTable: message.includes('relation') && message.includes('interest_submissions'),
  }
}

export async function linkSubmissionToContact(
  client: SupabaseClient,
  submissionId: string,
  contactId: string
): Promise<{ error: string | null }> {
  const { error } = await client
    .from('interest_submissions')
    .update({ contact_id: contactId })
    .eq('id', submissionId)

  return { error: error?.message ?? null }
}
