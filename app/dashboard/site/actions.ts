'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireDashboardUser } from '@/utils/dashboard-auth'
import {
  createPreviewToken,
  getSitePageById,
  listMediaAssets,
  publishVersion,
  rollbackToVersion,
  saveDraftVersion,
  unpublishPage,
  updateSeo,
  uploadMediaAsset,
} from '@/utils/services/site-builder/data'

function ensureAuthorized() {
  return requireDashboardUser().then((auth) => {
    if (!auth.authorized) {
      redirect('/dashboard')
    }
    return auth
  })
}

async function ensurePublishAuthorized() {
  const auth = await ensureAuthorized()
  if (auth.role !== 'admin') {
    redirect('/dashboard/site?error=publish_not_allowed')
  }
  return auth
}

function normalizeNullable(input: FormDataEntryValue | null) {
  const value = String(input ?? '').trim()
  return value.length > 0 ? value : null
}

export async function saveDraftAction(formData: FormData) {
  const auth = await ensureAuthorized()
  const pageId = String(formData.get('page_id') ?? '').trim()
  const documentRaw = String(formData.get('document') ?? '').trim()
  const notes = normalizeNullable(formData.get('notes'))

  if (!pageId || !documentRaw) {
    redirect('/dashboard/site?error=invalid_payload')
  }

  let parsed: unknown = null
  try {
    parsed = JSON.parse(documentRaw)
  } catch {
    redirect(`/dashboard/site/${pageId}?error=invalid_json`)
  }

  await saveDraftVersion({ pageId, actorUserId: auth.user.id, document: parsed, notes })

  revalidatePath('/dashboard/site')
  revalidatePath(`/dashboard/site/${pageId}`)
  redirect(`/dashboard/site/${pageId}?saved=draft`)
}

export async function publishAction(formData: FormData) {
  const auth = await ensurePublishAuthorized()
  const pageId = String(formData.get('page_id') ?? '').trim()
  const versionId = String(formData.get('version_id') ?? '').trim()

  if (!pageId || !versionId) {
    redirect('/dashboard/site?error=invalid_payload')
  }

  await publishVersion({ pageId, versionId, actorUserId: auth.user.id })
  revalidatePath('/dashboard/site')
  revalidatePath(`/dashboard/site/${pageId}`)
  redirect(`/dashboard/site/${pageId}?saved=published`)
}

export async function unpublishAction(formData: FormData) {
  const auth = await ensurePublishAuthorized()
  const pageId = String(formData.get('page_id') ?? '').trim()
  if (!pageId) {
    redirect('/dashboard/site?error=invalid_payload')
  }

  await unpublishPage({ pageId, actorUserId: auth.user.id })
  revalidatePath('/dashboard/site')
  revalidatePath(`/dashboard/site/${pageId}`)
  redirect(`/dashboard/site/${pageId}?saved=unpublished`)
}

export async function rollbackAction(formData: FormData) {
  const auth = await ensurePublishAuthorized()
  const pageId = String(formData.get('page_id') ?? '').trim()
  const versionId = String(formData.get('version_id') ?? '').trim()
  if (!pageId || !versionId) {
    redirect('/dashboard/site?error=invalid_payload')
  }

  await rollbackToVersion({ pageId, versionId, actorUserId: auth.user.id })
  revalidatePath('/dashboard/site')
  revalidatePath(`/dashboard/site/${pageId}`)
  revalidatePath(`/dashboard/site/${pageId}/history`)
  redirect(`/dashboard/site/${pageId}/history?saved=rolled_back`)
}

export async function createPreviewAction(formData: FormData) {
  const auth = await ensureAuthorized()
  const pageId = String(formData.get('page_id') ?? '').trim()
  const versionId = String(formData.get('version_id') ?? '').trim()
  if (!pageId || !versionId) {
    redirect('/dashboard/site?error=invalid_payload')
  }

  const { token } = await createPreviewToken({ pageId, versionId, actorUserId: auth.user.id })
  redirect(`/preview/${token}`)
}

export async function updateSeoAction(formData: FormData) {
  const auth = await ensureAuthorized()
  const pageId = String(formData.get('page_id') ?? '').trim()
  if (!pageId) {
    redirect('/dashboard/site?error=invalid_payload')
  }

  await updateSeo({
    pageId,
    actorUserId: auth.user.id,
    seoTitle: normalizeNullable(formData.get('seo_title')),
    seoDescription: normalizeNullable(formData.get('seo_description')),
    seoOgImageUrl: normalizeNullable(formData.get('seo_og_image_url')),
  })

  revalidatePath('/dashboard/site')
  revalidatePath(`/dashboard/site/${pageId}`)
  redirect(`/dashboard/site/${pageId}?saved=seo`)
}

export async function uploadMediaAction(formData: FormData) {
  const auth = await ensureAuthorized()
  const fileEntry = formData.get('file')
  const altText = normalizeNullable(formData.get('alt_text'))

  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    redirect('/dashboard/site/media?error=missing_file')
  }

  await uploadMediaAsset({ file: fileEntry, actorUserId: auth.user.id, altText })

  revalidatePath('/dashboard/site/media')
  redirect('/dashboard/site/media?saved=uploaded')
}

export async function refreshMediaAction() {
  await ensureAuthorized()
  await listMediaAssets()
  revalidatePath('/dashboard/site/media')
  redirect('/dashboard/site/media?saved=refreshed')
}

export async function ensurePageExistsAction(formData: FormData) {
  const auth = await ensureAuthorized()
  const pageId = String(formData.get('page_id') ?? '').trim()
  if (!pageId) {
    redirect('/dashboard/site?error=invalid_page')
  }

  const page = await getSitePageById(pageId)
  if (!page) {
    redirect('/dashboard/site?error=invalid_page')
  }

  if (!page.current_draft_version_id) {
    await saveDraftVersion({ pageId: page.id, actorUserId: auth.user.id, document: { schemaVersion: 1, blocks: [] } })
    revalidatePath('/dashboard/site')
    revalidatePath(`/dashboard/site/${page.id}`)
  }

  redirect(`/dashboard/site/${page.id}`)
}
