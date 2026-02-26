import crypto from 'node:crypto'
import { createAdminClient } from '@/utils/supabase/admin'
import { DEFAULT_PAGE_DOCUMENT, type PageDocument, type SitePageRow, type SitePageVersionRow } from './types'
import { parsePageDocument } from './validation'

function clientOrThrow() {
  const adminClient = createAdminClient()
  if (!adminClient) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }
  return adminClient
}

export async function listSitePages() {
  const client = clientOrThrow()
  const { data, error } = await client
    .from('site_pages')
    .select('id, slug, name, status, seo_title, seo_description, seo_og_image_url, current_draft_version_id, current_published_version_id, updated_at')
    .order('slug', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as SitePageRow[]
}

export async function getSitePageById(pageId: string) {
  const client = clientOrThrow()
  const { data, error } = await client
    .from('site_pages')
    .select('id, slug, name, status, seo_title, seo_description, seo_og_image_url, current_draft_version_id, current_published_version_id, updated_at')
    .eq('id', pageId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as SitePageRow | null) ?? null
}

export async function getSitePageBySlug(slug: string) {
  const client = clientOrThrow()
  const { data, error } = await client
    .from('site_pages')
    .select('id, slug, name, status, seo_title, seo_description, seo_og_image_url, current_draft_version_id, current_published_version_id, updated_at')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as SitePageRow | null) ?? null
}

export async function getDraftDocument(page: SitePageRow): Promise<{ versionId: string | null; document: PageDocument }> {
  const client = clientOrThrow()
  if (!page.current_draft_version_id) {
    return { versionId: null, document: DEFAULT_PAGE_DOCUMENT }
  }

  const { data, error } = await client
    .from('site_page_versions')
    .select('id, document')
    .eq('id', page.current_draft_version_id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  const row = (data as { id: string; document: unknown } | null) ?? null
  if (!row) return { versionId: null, document: DEFAULT_PAGE_DOCUMENT }
  return { versionId: row.id, document: parsePageDocument(row.document) }
}

async function getNextVersionNumber(pageId: string) {
  const client = clientOrThrow()
  const { data, error } = await client
    .from('site_page_versions')
    .select('version_number')
    .eq('page_id', pageId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return ((data as { version_number?: number } | null)?.version_number ?? 0) + 1
}

async function logAudit(input: {
  actorUserId: string
  action: string
  pageId?: string | null
  versionId?: string | null
  details?: Record<string, string | number | boolean | null>
}) {
  const client = clientOrThrow()
  await client.from('site_audit_logs').insert({
    actor_user_id: input.actorUserId,
    action: input.action,
    page_id: input.pageId ?? null,
    version_id: input.versionId ?? null,
    details: input.details ?? {},
  })
}

export async function saveDraftVersion(input: {
  pageId: string
  actorUserId: string
  document: unknown
  notes?: string | null
}) {
  const client = clientOrThrow()
  const document = parsePageDocument(input.document)
  const versionNumber = await getNextVersionNumber(input.pageId)

  const { data, error } = await client
    .from('site_page_versions')
    .insert({
      page_id: input.pageId,
      version_number: versionNumber,
      document,
      notes: input.notes ?? null,
      created_by_user_id: input.actorUserId,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  const versionId = (data as { id: string }).id

  const { error: pageError } = await client
    .from('site_pages')
    .update({
      current_draft_version_id: versionId,
      updated_by_user_id: input.actorUserId,
      updated_at: new Date().toISOString(),
      status: 'draft',
    })
    .eq('id', input.pageId)

  if (pageError) throw new Error(pageError.message)

  await logAudit({
    actorUserId: input.actorUserId,
    action: 'site_page_draft_saved',
    pageId: input.pageId,
    versionId,
    details: { versionNumber },
  })

  return { versionId, versionNumber }
}

export async function publishVersion(input: {
  pageId: string
  versionId: string
  actorUserId: string
}) {
  const client = clientOrThrow()
  const { error } = await client
    .from('site_pages')
    .update({
      current_published_version_id: input.versionId,
      status: 'published',
      updated_by_user_id: input.actorUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.pageId)

  if (error) throw new Error(error.message)

  await logAudit({
    actorUserId: input.actorUserId,
    action: 'site_page_published',
    pageId: input.pageId,
    versionId: input.versionId,
  })
}

export async function unpublishPage(input: { pageId: string; actorUserId: string }) {
  const client = clientOrThrow()
  const { error } = await client
    .from('site_pages')
    .update({
      current_published_version_id: null,
      status: 'draft',
      updated_by_user_id: input.actorUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.pageId)

  if (error) throw new Error(error.message)

  await logAudit({
    actorUserId: input.actorUserId,
    action: 'site_page_unpublished',
    pageId: input.pageId,
  })
}

export async function listPageVersions(pageId: string) {
  const client = clientOrThrow()
  const { data, error } = await client
    .from('site_page_versions')
    .select('id, page_id, version_number, document, notes, created_by_user_id, created_at')
    .eq('page_id', pageId)
    .order('version_number', { ascending: false })

  if (error) throw new Error(error.message)
  return ((data ?? []) as Array<Omit<SitePageVersionRow, 'document'> & { document: unknown }>).map((row) => ({
    ...row,
    document: parsePageDocument(row.document),
  })) as SitePageVersionRow[]
}

export async function rollbackToVersion(input: {
  pageId: string
  versionId: string
  actorUserId: string
}) {
  await publishVersion({ pageId: input.pageId, versionId: input.versionId, actorUserId: input.actorUserId })

  const client = clientOrThrow()
  await client.from('site_audit_logs').insert({
    actor_user_id: input.actorUserId,
    action: 'site_page_rollback',
    page_id: input.pageId,
    version_id: input.versionId,
    details: {},
  })
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createPreviewToken(input: {
  pageId: string
  versionId: string
  actorUserId: string
  expiresInHours?: number
}) {
  const client = clientOrThrow()
  const token = crypto.randomBytes(24).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + (input.expiresInHours ?? 24) * 60 * 60 * 1000).toISOString()

  const { error } = await client.from('site_preview_tokens').insert({
    page_id: input.pageId,
    version_id: input.versionId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_by_user_id: input.actorUserId,
  })

  if (error) throw new Error(error.message)

  await logAudit({
    actorUserId: input.actorUserId,
    action: 'site_preview_token_created',
    pageId: input.pageId,
    versionId: input.versionId,
  })

  return { token, expiresAt }
}

export async function resolvePreviewToken(token: string) {
  const client = clientOrThrow()
  const tokenHash = hashToken(token)
  const { data, error } = await client
    .from('site_preview_tokens')
    .select('id, page_id, version_id, expires_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (error) throw new Error(error.message)
  const row = (data as { id: string; page_id: string; version_id: string; expires_at: string } | null) ?? null
  if (!row) return null

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    return null
  }

  const [{ data: pageData, error: pageError }, { data: versionData, error: versionError }] = await Promise.all([
    client
      .from('site_pages')
      .select('id, slug, name, status, seo_title, seo_description, seo_og_image_url, current_draft_version_id, current_published_version_id, updated_at')
      .eq('id', row.page_id)
      .maybeSingle(),
    client
      .from('site_page_versions')
      .select('id, page_id, version_number, document, notes, created_by_user_id, created_at')
      .eq('id', row.version_id)
      .maybeSingle(),
  ])

  if (pageError || versionError || !pageData || !versionData) return null

  return {
    page: pageData as SitePageRow,
    version: {
      ...(versionData as Omit<SitePageVersionRow, 'document'> & { document: unknown }),
      document: parsePageDocument((versionData as { document: unknown }).document),
    } as SitePageVersionRow,
  }
}

export async function getPublishedPageBySlug(slug: string) {
  const page = await getSitePageBySlug(slug)
  if (!page?.current_published_version_id) return null

  const client = clientOrThrow()
  const { data, error } = await client
    .from('site_page_versions')
    .select('id, page_id, version_number, document, notes, created_by_user_id, created_at')
    .eq('id', page.current_published_version_id)
    .maybeSingle()

  if (error || !data) return null

  return {
    page,
    version: {
      ...(data as Omit<SitePageVersionRow, 'document'> & { document: unknown }),
      document: parsePageDocument((data as { document: unknown }).document),
    } as SitePageVersionRow,
  }
}

export async function updateSeo(input: {
  pageId: string
  actorUserId: string
  seoTitle: string | null
  seoDescription: string | null
  seoOgImageUrl: string | null
}) {
  const client = clientOrThrow()
  const { error } = await client
    .from('site_pages')
    .update({
      seo_title: input.seoTitle,
      seo_description: input.seoDescription,
      seo_og_image_url: input.seoOgImageUrl,
      updated_by_user_id: input.actorUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.pageId)

  if (error) throw new Error(error.message)

  await logAudit({
    actorUserId: input.actorUserId,
    action: 'site_page_seo_updated',
    pageId: input.pageId,
  })
}

export async function listMediaAssets() {
  const client = clientOrThrow()
  const { data, error } = await client
    .from('site_media_assets')
    .select('id, storage_path, public_url, alt_text, focal_x, focal_y, uploaded_by_user_id, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function uploadMediaAsset(input: {
  file: File
  actorUserId: string
  altText?: string | null
}) {
  const client = clientOrThrow()
  const fileExt = input.file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `site-builder/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${fileExt}`

  const upload = await client.storage.from('site-assets').upload(path, input.file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (upload.error) throw new Error(upload.error.message)

  const { data: publicData } = client.storage.from('site-assets').getPublicUrl(path)
  const publicUrl = publicData.publicUrl

  const { error } = await client.from('site_media_assets').insert({
    storage_path: path,
    public_url: publicUrl,
    alt_text: input.altText ?? null,
    uploaded_by_user_id: input.actorUserId,
  })

  if (error) throw new Error(error.message)

  await logAudit({
    actorUserId: input.actorUserId,
    action: 'site_media_uploaded',
    details: { path },
  })

  return { publicUrl, path }
}
