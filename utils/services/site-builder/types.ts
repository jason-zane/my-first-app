export const BLOCK_TYPES = [
  'hero',
  'rich_text',
  'image',
  'image_text_split',
  'quote',
  'stats_row',
  'faq_list',
  'retreat_cards',
  'cta_banner',
  'form_embed',
] as const

export type BlockType = (typeof BLOCK_TYPES)[number]

export type BlockNode = {
  id: string
  type: BlockType
  props: Record<string, unknown>
  style?: {
    background?: 'default' | 'alt' | 'dark'
    spacingTop?: 's' | 'm' | 'l'
    spacingBottom?: 's' | 'm' | 'l'
  }
}

export type PageDocument = {
  schemaVersion: 1
  blocks: BlockNode[]
}

export type SitePageStatus = 'draft' | 'published' | 'archived'

export type SitePageRow = {
  id: string
  slug: string
  name: string
  status: SitePageStatus
  seo_title: string | null
  seo_description: string | null
  seo_og_image_url: string | null
  current_draft_version_id: string | null
  current_published_version_id: string | null
  updated_at: string
}

export type SitePageVersionRow = {
  id: string
  page_id: string
  version_number: number
  document: PageDocument
  notes: string | null
  created_by_user_id: string | null
  created_at: string
}

export const DEFAULT_PAGE_DOCUMENT: PageDocument = {
  schemaVersion: 1,
  blocks: [],
}
