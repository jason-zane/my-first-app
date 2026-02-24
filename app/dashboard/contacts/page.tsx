import Link from 'next/link'
import { createAdminClient } from '@/utils/supabase/admin'

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

type ContactEvent = {
  contact_id: string
  created_at: string
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const adminClient = createAdminClient()
  let contacts: Contact[] = []
  let eventsByContactId = new Map<string, string>()
  let statusOptions: string[] = []
  let sourceOptions: string[] = []
  let loadError: string | null = null
  const q =
    typeof params.q === 'string' ? params.q.trim().replaceAll(',', ' ').replaceAll('%', '') : ''
  const statusFilter = typeof params.status === 'string' ? params.status : 'all'
  const sourceFilter = typeof params.source === 'string' ? params.source : 'all'

  if (!adminClient) {
    loadError = 'Missing SUPABASE_SERVICE_ROLE_KEY in environment.'
  } else {
    let contactQuery = adminClient
      .from('contacts')
      .select('id, first_name, last_name, email, source, status, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (statusFilter !== 'all') {
      contactQuery = contactQuery.eq('status', statusFilter)
    }
    if (sourceFilter !== 'all') {
      contactQuery = contactQuery.eq('source', sourceFilter)
    }
    if (q) {
      contactQuery = contactQuery.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
      )
    }

    const [
      { data: contactRows, error: contactsError },
      { data: eventRows, error: eventsError },
      { data: allContactsRows },
      { data: statusesRows },
    ] = await Promise.all([
      contactQuery,
      adminClient
        .from('contact_events')
        .select('contact_id, created_at')
        .order('created_at', { ascending: false })
        .limit(1000),
      adminClient.from('contacts').select('source'),
      adminClient.from('contact_statuses').select('key').order('sort_order', { ascending: true }),
    ])

    if (contactsError) {
      loadError = contactsError.message
    } else if (eventsError) {
      loadError = eventsError.message
    } else {
      contacts = (contactRows ?? []) as Contact[]
      const events = (eventRows ?? []) as ContactEvent[]
      eventsByContactId = new Map(
        events
          .filter((event) => event.contact_id)
          .map((event) => [event.contact_id, event.created_at])
      )
      statusOptions = ((statusesRows ?? []) as Array<{ key: string }>).map((row) => row.key)
      sourceOptions = Array.from(
        new Set(
          ((allContactsRows ?? []) as Array<{ source: string | null }>)
            .map((row) => row.source)
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b))
    }
  }

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Contacts</h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        CRM contacts created from interest submissions.
      </p>

      <form className="mb-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
        >
          <option value="all">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          name="source"
          defaultValue={sourceFilter}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
        >
          <option value="all">All Sources</option>
          {sourceOptions.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Apply
          </button>
          <Link
            href="/dashboard/contacts"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Reset
          </Link>
        </div>
      </form>

      {loadError ? (
        <p className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Could not load contacts: {loadError}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-zinc-500 dark:text-zinc-400">
                  No contacts yet.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-t border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:text-zinc-200"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/dashboard/contacts/${contact.id}`}
                      className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
                    >
                      {contact.first_name} {contact.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{contact.email}</td>
                  <td className="px-4 py-3">{contact.source ?? 'N/A'}</td>
                  <td className="px-4 py-3">{contact.status}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(contact.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {eventsByContactId.get(contact.id)
                      ? new Date(eventsByContactId.get(contact.id)!).toLocaleString()
                      : new Date(contact.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
