import { createAdminClient } from '@/utils/supabase/admin'
import type { Retreat } from '@/lib/retreats'

export type RetreatWorkflowStatus = 'draft' | 'published' | 'archived'

export type RetreatCmsRow = {
  id: string
  slug: string
  name: string
  tagline: string
  location: string
  region: string
  distance_from_city: string
  dates: string
  dates_short: string
  capacity: number
  price_from: number
  deposit: number
  hero_image: string
  hero_image_alt: string
  venue_image: string
  venue_image_alt: string
  description: string
  venue_name: string
  venue_description: string
  venue_highlights: unknown
  routes: unknown
  itinerary: unknown
  included: unknown
  not_included: unknown
  status: 'upcoming' | 'open' | 'sold-out'
  workflow_status: RetreatWorkflowStatus
  current_draft_version_id: string | null
  current_published_version_id: string | null
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  seo_og_image_url: string | null
  created_at: string
  updated_at: string
}

type RetreatCmsSnapshot = {
  slug: string
  name: string
  tagline: string
  location: string
  region: string
  distance_from_city: string
  dates: string
  dates_short: string
  capacity: number
  price_from: number
  deposit: number
  hero_image: string
  hero_image_alt: string
  venue_image: string
  venue_image_alt: string
  description: string
  venue_name: string
  venue_description: string
  venue_highlights: unknown
  routes: unknown
  itinerary: unknown
  included: unknown
  not_included: unknown
  status: 'upcoming' | 'open' | 'sold-out'
  seo_title: string | null
  seo_description: string | null
  seo_og_image_url: string | null
}

function clientOrThrow() {
  const adminClient = createAdminClient()
  if (!adminClient) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return adminClient
}

function ensureStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.filter((item): item is string => typeof item === 'string')
}

function ensureRouteArray(input: unknown): Retreat['routes'] {
  if (!Array.isArray(input)) return []
  return input
    .filter((item) => typeof item === 'object' && item !== null)
    .map((item) => {
      const row = item as Record<string, unknown>
      return {
        name: typeof row.name === 'string' ? row.name : '',
        distance: typeof row.distance === 'string' ? row.distance : '',
        terrain: typeof row.terrain === 'string' ? row.terrain : '',
        elevation: typeof row.elevation === 'string' ? row.elevation : '',
        description: typeof row.description === 'string' ? row.description : '',
      }
    })
    .filter((route) => route.name.length > 0)
}

function ensureItinerary(input: unknown): Retreat['itinerary'] {
  if (!Array.isArray(input)) return []
  return input
    .filter((item) => typeof item === 'object' && item !== null)
    .map((item) => {
      const row = item as Record<string, unknown>
      const events = Array.isArray(row.events)
        ? row.events
            .filter((event) => typeof event === 'object' && event !== null)
            .map((event) => {
              const record = event as Record<string, unknown>
              return {
                time: typeof record.time === 'string' ? record.time : '',
                label: typeof record.label === 'string' ? record.label : '',
              }
            })
            .filter((event) => event.time.length > 0 || event.label.length > 0)
        : []

      return {
        day: typeof row.day === 'string' ? row.day : '',
        date: typeof row.date === 'string' ? row.date : '',
        events,
      }
    })
    .filter((day) => day.day.length > 0)
}

function mapSnapshotToRetreat(snapshot: RetreatCmsSnapshot): Retreat {
  return {
    slug: snapshot.slug,
    name: snapshot.name,
    tagline: snapshot.tagline,
    location: snapshot.location,
    region: snapshot.region,
    distanceFromCity: snapshot.distance_from_city,
    dates: snapshot.dates,
    datesShort: snapshot.dates_short,
    capacity: Number(snapshot.capacity) || 0,
    priceFrom: Number(snapshot.price_from) || 0,
    deposit: Number(snapshot.deposit) || 0,
    heroImage: snapshot.hero_image,
    heroImageAlt: snapshot.hero_image_alt,
    venueImage: snapshot.venue_image,
    venueImageAlt: snapshot.venue_image_alt,
    description: snapshot.description,
    venueName: snapshot.venue_name,
    venueDescription: snapshot.venue_description,
    venueHighlights: ensureStringArray(snapshot.venue_highlights),
    routes: ensureRouteArray(snapshot.routes),
    itinerary: ensureItinerary(snapshot.itinerary),
    included: ensureStringArray(snapshot.included),
    notIncluded: ensureStringArray(snapshot.not_included),
    status: snapshot.status,
  }
}

function rowToSnapshot(row: RetreatCmsRow): RetreatCmsSnapshot {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    location: row.location,
    region: row.region,
    distance_from_city: row.distance_from_city,
    dates: row.dates,
    dates_short: row.dates_short,
    capacity: row.capacity,
    price_from: row.price_from,
    deposit: row.deposit,
    hero_image: row.hero_image,
    hero_image_alt: row.hero_image_alt,
    venue_image: row.venue_image,
    venue_image_alt: row.venue_image_alt,
    description: row.description,
    venue_name: row.venue_name,
    venue_description: row.venue_description,
    venue_highlights: row.venue_highlights,
    routes: row.routes,
    itinerary: row.itinerary,
    included: row.included,
    not_included: row.not_included,
    status: row.status,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    seo_og_image_url: row.seo_og_image_url,
  }
}

async function createVersionFromSnapshot(input: {
  retreatId: string
  actorUserId: string
  snapshot: RetreatCmsSnapshot
}) {
  const client = clientOrThrow()
  const { data: latest, error: latestError } = await client
    .from('retreats_cms_versions')
    .select('version_number')
    .eq('retreat_id', input.retreatId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) throw new Error(latestError.message)

  const nextVersionNumber = (latest?.version_number ?? 0) + 1

  const { data, error } = await client
    .from('retreats_cms_versions')
    .insert({
      retreat_id: input.retreatId,
      version_number: nextVersionNumber,
      snapshot: input.snapshot,
      created_by_user_id: input.actorUserId,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return (data as { id: string }).id
}

const RETREAT_SELECT = `
  id,
  slug,
  name,
  tagline,
  location,
  region,
  distance_from_city,
  dates,
  dates_short,
  capacity,
  price_from,
  deposit,
  hero_image,
  hero_image_alt,
  venue_image,
  venue_image_alt,
  description,
  venue_name,
  venue_description,
  venue_highlights,
  routes,
  itinerary,
  included,
  not_included,
  status,
  workflow_status,
  current_draft_version_id,
  current_published_version_id,
  published_at,
  seo_title,
  seo_description,
  seo_og_image_url,
  created_at,
  updated_at
`

export async function listRetreatCmsRows() {
  const client = clientOrThrow()
  const { data, error } = await client
    .from('retreats_cms')
    .select(RETREAT_SELECT)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as RetreatCmsRow[]
}

export async function getRetreatCmsById(id: string) {
  const client = clientOrThrow()
  const { data, error } = await client.from('retreats_cms').select(RETREAT_SELECT).eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return (data as RetreatCmsRow | null) ?? null
}

export async function getPublishedRetreats() {
  const client = clientOrThrow()
  const { data: rows, error } = await client
    .from('retreats_cms')
    .select('id,current_published_version_id,published_at')
    .eq('workflow_status', 'published')
    .not('current_published_version_id', 'is', null)
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error || !rows || rows.length === 0) return []

  const versionIds = rows
    .map((row) => row.current_published_version_id)
    .filter((id): id is string => typeof id === 'string')

  if (versionIds.length === 0) return []

  const { data: versions, error: versionsError } = await client
    .from('retreats_cms_versions')
    .select('id,snapshot')
    .in('id', versionIds)

  if (versionsError || !versions) return []

  const byId = new Map(
    versions.map((version) => [version.id as string, version.snapshot as RetreatCmsSnapshot])
  )

  const retreats: Retreat[] = []
  for (const row of rows) {
    const id = row.current_published_version_id
    if (!id || typeof id !== 'string') continue
    const snapshot = byId.get(id)
    if (!snapshot) continue
    retreats.push(mapSnapshotToRetreat(snapshot))
  }

  return retreats
}

export async function getRetreatForPublicBySlug(slug: string) {
  const client = clientOrThrow()
  const { data: retreatRow, error: rowError } = await client
    .from('retreats_cms')
    .select('current_published_version_id')
    .eq('slug', slug)
    .eq('workflow_status', 'published')
    .maybeSingle()

  if (rowError || !retreatRow?.current_published_version_id) return null

  const { data: versionRow, error: versionError } = await client
    .from('retreats_cms_versions')
    .select('snapshot')
    .eq('id', retreatRow.current_published_version_id)
    .maybeSingle()

  if (versionError || !versionRow?.snapshot) return null

  return mapSnapshotToRetreat(versionRow.snapshot as RetreatCmsSnapshot)
}

export async function createRetreatCms(input: {
  slug: string
  name: string
  actorUserId: string
}) {
  const client = clientOrThrow()
  const { data, error } = await client
    .from('retreats_cms')
    .insert({
      slug: input.slug,
      name: input.name,
      workflow_status: 'draft',
      updated_at: new Date().toISOString(),
    })
    .select(RETREAT_SELECT)
    .single()

  if (error) throw new Error(error.message)

  const row = data as RetreatCmsRow
  const draftVersionId = await createVersionFromSnapshot({
    retreatId: row.id,
    actorUserId: input.actorUserId,
    snapshot: rowToSnapshot(row),
  })

  const { error: pointerError } = await client
    .from('retreats_cms')
    .update({ current_draft_version_id: draftVersionId })
    .eq('id', row.id)

  if (pointerError) throw new Error(pointerError.message)

  await client.from('site_audit_logs').insert({
    actor_user_id: input.actorUserId,
    action: 'retreat_cms_created',
    details: { slug: input.slug },
  })

  return row.id
}

export async function saveRetreatCmsDraft(input: {
  id: string
  actorUserId: string
  payload: Record<string, unknown>
}) {
  const client = clientOrThrow()

  const { data: updatedRow, error: updateError } = await client
    .from('retreats_cms')
    .update({
      ...input.payload,
      workflow_status: 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .select(RETREAT_SELECT)
    .single()

  if (updateError) throw new Error(updateError.message)

  const row = updatedRow as RetreatCmsRow
  const draftVersionId = await createVersionFromSnapshot({
    retreatId: row.id,
    actorUserId: input.actorUserId,
    snapshot: rowToSnapshot(row),
  })

  const { error: pointerError } = await client
    .from('retreats_cms')
    .update({ current_draft_version_id: draftVersionId, updated_at: new Date().toISOString() })
    .eq('id', row.id)

  if (pointerError) throw new Error(pointerError.message)

  await client.from('site_audit_logs').insert({
    actor_user_id: input.actorUserId,
    action: 'retreat_cms_draft_saved',
    details: { retreat_id: input.id, draft_version_id: draftVersionId },
  })

  return { retreatId: row.id, slug: row.slug, draftVersionId }
}

export async function publishRetreatCms(input: { id: string; actorUserId: string }) {
  const client = clientOrThrow()

  const { data: retreat, error: retreatError } = await client
    .from('retreats_cms')
    .select(RETREAT_SELECT)
    .eq('id', input.id)
    .maybeSingle()

  if (retreatError || !retreat) throw new Error(retreatError?.message ?? 'Retreat not found')

  let draftVersionId = retreat.current_draft_version_id

  if (!draftVersionId) {
    draftVersionId = await createVersionFromSnapshot({
      retreatId: retreat.id,
      actorUserId: input.actorUserId,
      snapshot: rowToSnapshot(retreat as RetreatCmsRow),
    })
  }

  const nowIso = new Date().toISOString()
  const { error: publishError } = await client
    .from('retreats_cms')
    .update({
      current_draft_version_id: draftVersionId,
      current_published_version_id: draftVersionId,
      workflow_status: 'published',
      published_at: nowIso,
      updated_at: nowIso,
    })
    .eq('id', input.id)

  if (publishError) throw new Error(publishError.message)

  await client.from('site_audit_logs').insert({
    actor_user_id: input.actorUserId,
    action: 'retreat_cms_published',
    details: { retreat_id: input.id, version_id: draftVersionId },
  })

  return { slug: retreat.slug }
}

export async function unpublishRetreatCms(input: { id: string; actorUserId: string }) {
  const client = clientOrThrow()

  const { data: retreat, error: retreatError } = await client
    .from('retreats_cms')
    .select('slug')
    .eq('id', input.id)
    .maybeSingle()

  if (retreatError || !retreat) throw new Error(retreatError?.message ?? 'Retreat not found')

  const { error: unpublishError } = await client
    .from('retreats_cms')
    .update({
      workflow_status: 'draft',
      current_published_version_id: null,
      published_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)

  if (unpublishError) throw new Error(unpublishError.message)

  await client.from('site_audit_logs').insert({
    actor_user_id: input.actorUserId,
    action: 'retreat_cms_unpublished',
    details: { retreat_id: input.id },
  })

  return { slug: retreat.slug }
}
