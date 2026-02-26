export const SITE_EDITOR_PAGE_SLUGS = ['home', 'about', 'experience', 'retreats', 'faq'] as const

export type SiteEditorSlug = (typeof SITE_EDITOR_PAGE_SLUGS)[number]
