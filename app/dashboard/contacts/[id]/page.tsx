import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import { addContactNote, updateContactStatus } from '@/app/dashboard/contacts/actions'

type Contact = {
  id: string
  first_name: string
  last_name: string
  email: string
  source: string | null
  status: string
  created_at: string
  updated_at: string
}

type ContactStatus = {
  key: string
  label: string
}

type ContactEvent = {
  id: string
  event_type: string
  event_data: Record<string, string | null> | null
  note: string | null
  created_at: string
}

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const query = await searchParams
  const adminClient = createAdminClient()

  if (!adminClient) {
    return (
      <section>
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Contact</h1>
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Missing SUPABASE_SERVICE_ROLE_KEY in environment.
        </p>
      </section>
    )
  }

  const [{ data: contactRow, error: contactError }, { data: statuses }, { data: eventRows, error: eventsError }] =
    await Promise.all([
      adminClient
        .from('contacts')
        .select('id, first_name, last_name, email, source, status, created_at, updated_at')
        .eq('id', id)
        .maybeSingle(),
      adminClient.from('contact_statuses').select('key, label').order('sort_order', { ascending: true }),
      adminClient
        .from('contact_events')
        .select('id, event_type, event_data, note, created_at')
        .eq('contact_id', id)
        .order('created_at', { ascending: false })
        .limit(100),
    ])

  if (contactError || !contactRow) {
    notFound()
  }

  const contact = contactRow as Contact
  const statusOptions = (statuses ?? []) as ContactStatus[]
  const events = ((eventsError ? [] : eventRows) ?? []) as ContactEvent[]

  const saved = typeof query.saved === 'string' ? query.saved : null
  const hasError = typeof query.error === 'string'

  return (
    <section>
      <div className="mb-4">
        <Link
          href="/dashboard/contacts"
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
        >
          Back to Contacts
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {contact.first_name} {contact.last_name}
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">{contact.email}</p>

      {saved ? (
        <p className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          Saved {saved}.
        </p>
      ) : null}

      {hasError ? (
        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Could not save contact update.
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">Details</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            <span className="font-medium">Source:</span> {contact.source ?? 'N/A'}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            <span className="font-medium">Status:</span> {contact.status}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            <span className="font-medium">Created:</span>{' '}
            {new Date(contact.created_at).toLocaleString()}
          </p>
        </div>

        <form
          action={updateContactStatus}
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <input type="hidden" name="contact_id" value={contact.id} />
          <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">Update Status</h2>
          <select
            name="status"
            defaultValue={contact.status}
            className="mb-3 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
          >
            {statusOptions.map((status) => (
              <option key={status.key} value={status.key}>
                {status.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Save Status
          </button>
        </form>
      </div>

      <form
        action={addContactNote}
        className="mb-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <input type="hidden" name="contact_id" value={contact.id} />
        <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">Add Note</h2>
        <textarea
          name="note"
          className="mb-3 min-h-28 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
          placeholder="Add a contact note..."
          required
        />
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Save Note
        </button>
      </form>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-base font-semibold text-zinc-900 dark:text-zinc-50">Timeline</h2>
        {events.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
                <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {event.event_type} - {new Date(event.created_at).toLocaleString()}
                </p>
                {event.note ? (
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{event.note}</p>
                ) : null}
                {event.event_data && Object.keys(event.event_data).length > 0 ? (
                  <pre className="mt-2 overflow-x-auto text-xs text-zinc-600 dark:text-zinc-300">
                    {JSON.stringify(event.event_data, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
