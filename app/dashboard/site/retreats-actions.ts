'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireDashboardUser } from '@/utils/dashboard-auth'
import {
  createRetreatCms,
  publishRetreatCms,
  saveRetreatCmsDraft,
  unpublishRetreatCms,
} from '@/utils/services/site-builder/retreats'

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function ensureAuthorized() {
  const auth = await requireDashboardUser()
  if (!auth.authorized) {
    redirect('/dashboard')
  }
  return auth
}

async function ensureAdmin() {
  const auth = await ensureAuthorized()
  if (auth.role !== 'admin') {
    redirect('/dashboard/site/retreats?error=admin_only')
  }
  return auth
}

function parseLines(value: FormDataEntryValue | null) {
  return String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  const raw = String(value ?? '').trim()
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function createRetreatAction(formData: FormData) {
  const auth = await ensureAuthorized()

  const name = String(formData.get('name') ?? '').trim()
  const slugInput = String(formData.get('slug') ?? '').trim()
  const slug = slugify(slugInput || name)

  if (!name || !slug) {
    redirect('/dashboard/site/retreats?error=missing_name')
  }

  const id = await createRetreatCms({ slug, name, actorUserId: auth.user.id })
  revalidatePath('/dashboard/site/retreats')
  redirect(`/dashboard/site/retreats/${id}?saved=created`)
}

export async function saveRetreatDraftAction(formData: FormData) {
  const auth = await ensureAuthorized()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) {
    redirect('/dashboard/site/retreats?error=missing_id')
  }

  const payload = {
    slug: slugify(String(formData.get('slug') ?? '')),
    name: String(formData.get('name') ?? '').trim(),
    tagline: String(formData.get('tagline') ?? '').trim(),
    location: String(formData.get('location') ?? '').trim(),
    region: String(formData.get('region') ?? '').trim(),
    distance_from_city: String(formData.get('distance_from_city') ?? '').trim(),
    dates: String(formData.get('dates') ?? '').trim(),
    dates_short: String(formData.get('dates_short') ?? '').trim(),
    capacity: Math.max(1, Number(formData.get('capacity') ?? 12) || 12),
    price_from: Math.max(0, Number(formData.get('price_from') ?? 0) || 0),
    deposit: Math.max(0, Number(formData.get('deposit') ?? 0) || 0),
    hero_image: String(formData.get('hero_image') ?? '').trim(),
    hero_image_alt: String(formData.get('hero_image_alt') ?? '').trim(),
    venue_image: String(formData.get('venue_image') ?? '').trim(),
    venue_image_alt: String(formData.get('venue_image_alt') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    venue_name: String(formData.get('venue_name') ?? '').trim(),
    venue_description: String(formData.get('venue_description') ?? '').trim(),
    venue_highlights: parseLines(formData.get('venue_highlights')),
    included: parseLines(formData.get('included')),
    not_included: parseLines(formData.get('not_included')),
    routes: parseJsonField(formData.get('routes_json'), [] as Array<Record<string, unknown>>),
    itinerary: parseJsonField(formData.get('itinerary_json'), [] as Array<Record<string, unknown>>),
    status:
      String(formData.get('status') ?? 'upcoming').trim() === 'open'
        ? 'open'
        : String(formData.get('status') ?? 'upcoming').trim() === 'sold-out'
          ? 'sold-out'
          : 'upcoming',
    seo_title: String(formData.get('seo_title') ?? '').trim() || null,
    seo_description: String(formData.get('seo_description') ?? '').trim() || null,
    seo_og_image_url: String(formData.get('seo_og_image_url') ?? '').trim() || null,
  }

  if (!payload.name || !payload.slug) {
    redirect(`/dashboard/site/retreats/${id}?error=missing_name`)
  }

  const result = await saveRetreatCmsDraft({ id, actorUserId: auth.user.id, payload })

  revalidatePath('/dashboard/site/retreats')
  revalidatePath(`/dashboard/site/retreats/${id}`)
  revalidatePath('/retreats')
  revalidatePath(`/retreats/${result.slug}`)
  redirect(`/dashboard/site/retreats/${id}?saved=draft`)
}

export async function publishRetreatAction(formData: FormData) {
  const auth = await ensureAdmin()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) redirect('/dashboard/site/retreats?error=missing_id')

  const result = await publishRetreatCms({ id, actorUserId: auth.user.id })

  revalidatePath('/dashboard/site/retreats')
  revalidatePath(`/dashboard/site/retreats/${id}`)
  revalidatePath('/retreats')
  revalidatePath(`/retreats/${result.slug}`)
  redirect(`/dashboard/site/retreats/${id}?saved=published`)
}

export async function unpublishRetreatAction(formData: FormData) {
  const auth = await ensureAdmin()

  const id = String(formData.get('id') ?? '').trim()
  if (!id) redirect('/dashboard/site/retreats?error=missing_id')

  const result = await unpublishRetreatCms({ id, actorUserId: auth.user.id })

  revalidatePath('/dashboard/site/retreats')
  revalidatePath(`/dashboard/site/retreats/${id}`)
  revalidatePath('/retreats')
  revalidatePath(`/retreats/${result.slug}`)
  redirect(`/dashboard/site/retreats/${id}?saved=unpublished`)
}
