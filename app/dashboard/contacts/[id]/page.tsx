import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import { addContactNote, updateContactStatus } from '@/app/dashboard/contacts/actions'
import { StatusBadge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { CopyEmail } from '@/components/ui/copy-email'
import { RelativeTime } from '@/components/ui/relative-time'
import { ActionFeedback } from '@/components/ui/action-feedback'
import { ChevronRightIcon } from '@/components/icons'

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

const eventTypeLabel: Record<string, string> = {
  note: 'Note',
  status_change: 'Status changed',
  submission_linked: 'Submission linked',
  contact_created: 'Contact created',
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { id } = await params
  const adminClient = createAdminClient()

  if (!adminClient) {
    return (
      <section>
        <h1 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Contact</h1>
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Missing SUPABASE_SERVICE_ROLE_KEY in environment.
        </p>
      </section>
    )
  }

  const [
    { data: contactRow, error: contactError },
    { data: statuses },
    { data: eventRows, error: eventsError },
  ] = await Promise.all([
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

  if (contactError || !contactRow) notFound()

  const contact = contactRow as Contact
  const statusOptions = (statuses ?? []) as ContactStatus[]
  const events = ((eventsError ? [] : eventRows) ?? []) as ContactEvent[]
  const fullName = `${contact.first_name} ${contact.last_name}`

  return (
    <section>
      <Suspense>
        <ActionFeedback messages={{ note: 'Note saved.', status: 'Status updated.' }} />
      </Suspense>

      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/dashboard/contacts" className="hover:text-zinc-900 dark:hover:text-zinc-200">
          Contacts
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="text-zinc-900 dark:text-zinc-50">{fullName}</span>
      </nav>

      {/* Contact header */}
      <div className="mb-6 flex items-start gap-4">
        <Avatar name={fullName} size="md" />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{fullName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <CopyEmail email={contact.email} />
            <StatusBadge status={contact.status} />
            {contact.source && (
              <span className="text-xs capitalize text-zinc-400">{contact.source}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left column — details + update status + add note */}
        <div className="space-y-5 lg:col-span-1">
          {/* Details card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Details
            </h2>
            <dl className="space-y-2">
              <div className="flex justify-between text-sm">
                <dt className="text-zinc-500 dark:text-zinc-400">Source</dt>
                <dd className="capitalize text-zinc-900 dark:text-zinc-50">
                  {contact.source ?? '—'}
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
                <dd className="text-zinc-900 dark:text-zinc-50">
                  <RelativeTime date={contact.created_at} />
                </dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-zinc-500 dark:text-zinc-400">Updated</dt>
                <dd className="text-zinc-900 dark:text-zinc-50">
                  <RelativeTime date={contact.updated_at} />
                </dd>
              </div>
            </dl>
          </div>

          {/* Update status */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Status
            </h2>
            <form action={updateContactStatus} className="space-y-3">
              <input type="hidden" name="contact_id" value={contact.id} />
              <select
                name="status"
                defaultValue={contact.status}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
              >
                {statusOptions.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Save status
              </button>
            </form>
          </div>

          {/* Add note */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Add note
            </h2>
            <form action={addContactNote} className="space-y-3">
              <input type="hidden" name="contact_id" value={contact.id} />
              <textarea
                name="note"
                rows={3}
                required
                placeholder="Write a note…"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-400"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Save note
              </button>
            </form>
          </div>
        </div>

        {/* Right column — timeline */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Timeline
            </h2>
            {events.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No activity yet.</p>
            ) : (
              <div className="relative space-y-4">
                {/* Vertical line */}
                <div className="absolute left-2 top-2 bottom-2 w-px bg-zinc-200 dark:bg-zinc-700" />

                {events.map((event) => (
                  <div key={event.id} className="relative flex gap-4 pl-7">
                    {/* Dot on timeline */}
                    <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-white bg-zinc-300 dark:border-zinc-900 dark:bg-zinc-600" />

                    <div className="min-w-0 flex-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {eventTypeLabel[event.event_type] ?? event.event_type}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          <RelativeTime date={event.created_at} />
                        </p>
                      </div>
                      {event.note && (
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">{event.note}</p>
                      )}
                      {event.event_data && Object.keys(event.event_data).length > 0 && (
                        <dl className="mt-1.5 space-y-0.5">
                          {Object.entries(event.event_data)
                            .filter(([, v]) => v !== null)
                            .map(([k, v]) => (
                              <div key={k} className="flex gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                <dt className="capitalize">{k.replace(/_/g, ' ')}:</dt>
                                <dd>{v}</dd>
                              </div>
                            ))}
                        </dl>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
