'use client'

import { useMemo, useState } from 'react'
import type { BlockNode, BlockType, PageDocument, SitePageRow } from '@/utils/services/site-builder/types'
import { saveDraftAction, createPreviewAction, publishAction, unpublishAction, updateSeoAction } from '@/app/dashboard/site/actions'
import { SitePageRenderer } from '@/components/site/builder/page-renderer'

type BuilderCategory = 'Structure' | 'Story' | 'Conversion' | 'Retreat'

type BlockCatalogItem = {
  type: BlockType
  label: string
  category: BuilderCategory
  description: string
}

const BLOCKS: BlockCatalogItem[] = [
  { type: 'hero', label: 'Hero', category: 'Structure', description: 'Headline section with optional CTA button.' },
  { type: 'rich_text', label: 'Rich Text', category: 'Story', description: 'Section title plus long-form body copy.' },
  { type: 'image', label: 'Image', category: 'Story', description: 'Single image with alt and caption.' },
  { type: 'image_text_split', label: 'Image + Text', category: 'Story', description: 'Two-column visual and narrative section.' },
  { type: 'quote', label: 'Quote', category: 'Story', description: 'Testimonial or manifesto statement.' },
  { type: 'stats_row', label: 'Stats Row', category: 'Structure', description: 'Numeric proof points in cards.' },
  { type: 'faq_list', label: 'FAQ', category: 'Conversion', description: 'Expandable question and answer list.' },
  { type: 'retreat_cards', label: 'Retreat Cards', category: 'Retreat', description: 'Auto-lists retreat pages from CMS.' },
  { type: 'cta_banner', label: 'CTA Banner', category: 'Conversion', description: 'Focused call-to-action section.' },
  { type: 'form_embed', label: 'Form Embed', category: 'Conversion', description: 'Registration/interest capture block.' },
]

const BLOCK_LABELS: Record<BlockType, string> = Object.fromEntries(
  BLOCKS.map((block) => [block.type, block.label])
) as Record<BlockType, string>

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function defaultProps(type: BlockType): Record<string, unknown> {
  switch (type) {
    case 'hero':
      return {
        eyebrow: 'Miles Between',
        heading: 'Add heading',
        subheading: 'Add subheading',
        ctaLabel: 'Learn more',
        ctaHref: '/retreats',
      }
    case 'rich_text':
      return { title: 'Section title', body: 'Write your content here.' }
    case 'image':
      return { imageUrl: '', alt: '', caption: '' }
    case 'image_text_split':
      return { title: 'Section title', body: 'Section body', imageUrl: '', alt: '' }
    case 'quote':
      return { quote: 'Add quote', author: 'Author name' }
    case 'stats_row':
      return { items: [{ label: 'Guests', value: '12' }] }
    case 'faq_list':
      return { title: 'FAQ', items: [{ question: 'Question?', answer: 'Answer' }] }
    case 'retreat_cards':
      return { title: 'Upcoming retreats' }
    case 'cta_banner':
      return { title: 'Ready to join?', body: 'Add CTA copy.', ctaLabel: 'Get started', ctaHref: '/#register' }
    case 'form_embed':
      return { formType: 'register_interest', source: 'site:builder' }
  }
}

function safeDocument(input: PageDocument | null | undefined): PageDocument {
  if (!input || input.schemaVersion !== 1 || !Array.isArray(input.blocks)) {
    return { schemaVersion: 1, blocks: [] }
  }
  return input
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asRecordArray(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return []
  return value.filter((item) => typeof item === 'object' && item !== null) as Array<Record<string, unknown>>
}

function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function SitePageEditor({
  page,
  initialDocument,
  draftVersionId,
  role,
}: {
  page: SitePageRow
  initialDocument: PageDocument
  draftVersionId: string | null
  role: 'admin' | 'staff'
}) {
  const [documentState, setDocumentState] = useState<PageDocument>(safeDocument(initialDocument))
  const [selectedIndex, setSelectedIndex] = useState<number>(documentState.blocks.length > 0 ? 0 : -1)
  const [blockSearch, setBlockSearch] = useState('')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const selectedBlock = selectedIndex >= 0 ? documentState.blocks[selectedIndex] : null
  const initialJson = useMemo(() => JSON.stringify(safeDocument(initialDocument)), [initialDocument])
  const documentJson = useMemo(() => JSON.stringify(documentState), [documentState])
  const isDirty = documentJson !== initialJson

  const filteredBlocks = BLOCKS.filter((block) => {
    const q = blockSearch.trim().toLowerCase()
    if (!q) return true
    return (
      block.label.toLowerCase().includes(q) ||
      block.category.toLowerCase().includes(q) ||
      block.description.toLowerCase().includes(q)
    )
  })

  const blockGroups = ['Structure', 'Story', 'Conversion', 'Retreat'].map((category) => ({
    category,
    items: filteredBlocks.filter((block) => block.category === category),
  }))

  function addBlock(type: BlockType) {
    const next: BlockNode = {
      id: makeId(),
      type,
      props: defaultProps(type),
      style: { background: 'default', spacingTop: 'm', spacingBottom: 'm' },
    }

    setDocumentState((prev) => ({ ...prev, blocks: [...prev.blocks, next] }))
    setSelectedIndex(documentState.blocks.length)
  }

  function duplicateBlock(index: number) {
    setDocumentState((prev) => {
      const source = prev.blocks[index]
      if (!source) return prev
      const copy: BlockNode = {
        ...source,
        id: makeId(),
        props: JSON.parse(JSON.stringify(source.props)) as Record<string, unknown>,
      }
      const blocks = [...prev.blocks]
      blocks.splice(index + 1, 0, copy)
      return { ...prev, blocks }
    })
    setSelectedIndex(index + 1)
  }

  function removeBlock(index: number) {
    setDocumentState((prev) => {
      const blocks = prev.blocks.filter((_, i) => i !== index)
      return { ...prev, blocks }
    })
    setSelectedIndex((prev) => {
      if (prev === index) return -1
      if (prev > index) return prev - 1
      return prev
    })
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setDocumentState((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.blocks.length) return prev
      const blocks = [...prev.blocks]
      ;[blocks[index], blocks[target]] = [blocks[target], blocks[index]]
      return { ...prev, blocks }
    })
    setSelectedIndex((prev) => (prev === index ? index + direction : prev === index + direction ? index : prev))
  }

  function updateSelectedStyle<K extends 'background' | 'spacingTop' | 'spacingBottom'>(key: K, value: string) {
    if (selectedIndex < 0) return
    setDocumentState((prev) => {
      const blocks = [...prev.blocks]
      blocks[selectedIndex] = {
        ...blocks[selectedIndex],
        style: { ...blocks[selectedIndex].style, [key]: value },
      }
      return { ...prev, blocks }
    })
  }

  function updateSelectedProp(key: string, value: unknown) {
    if (selectedIndex < 0) return
    setDocumentState((prev) => {
      const blocks = [...prev.blocks]
      blocks[selectedIndex] = {
        ...blocks[selectedIndex],
        props: {
          ...blocks[selectedIndex].props,
          [key]: value,
        },
      }
      return { ...prev, blocks }
    })
  }

  function updateSelectedArrayItem(key: string, index: number, patch: Record<string, unknown>) {
    if (selectedIndex < 0) return
    const items = asRecordArray(selectedBlock?.props[key])
    const nextItems = items.map((item, i) => (i === index ? { ...item, ...patch } : item))
    updateSelectedProp(key, nextItems)
  }

  function removeSelectedArrayItem(key: string, index: number) {
    if (selectedIndex < 0) return
    const items = asRecordArray(selectedBlock?.props[key])
    updateSelectedProp(
      key,
      items.filter((_, i) => i !== index)
    )
  }

  function addSelectedArrayItem(key: string, value: Record<string, unknown>) {
    if (selectedIndex < 0) return
    const items = asRecordArray(selectedBlock?.props[key])
    updateSelectedProp(key, [...items, value])
  }

  function renderPropertyFields() {
    if (!selectedBlock) return null

    if (selectedBlock.type === 'hero') {
      return (
        <div className="space-y-2">
          <input value={asString(selectedBlock.props.eyebrow)} onChange={(e) => updateSelectedProp('eyebrow', e.target.value)} placeholder="Eyebrow" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <input value={asString(selectedBlock.props.heading)} onChange={(e) => updateSelectedProp('heading', e.target.value)} placeholder="Heading" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <textarea value={asString(selectedBlock.props.subheading)} onChange={(e) => updateSelectedProp('subheading', e.target.value)} placeholder="Subheading" rows={3} className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <div className="grid gap-2 md:grid-cols-2">
            <input value={asString(selectedBlock.props.ctaLabel)} onChange={(e) => updateSelectedProp('ctaLabel', e.target.value)} placeholder="CTA label" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
            <input value={asString(selectedBlock.props.ctaHref)} onChange={(e) => updateSelectedProp('ctaHref', e.target.value)} placeholder="CTA href" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          </div>
        </div>
      )
    }

    if (selectedBlock.type === 'rich_text') {
      return (
        <div className="space-y-2">
          <input value={asString(selectedBlock.props.title)} onChange={(e) => updateSelectedProp('title', e.target.value)} placeholder="Title" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <textarea value={asString(selectedBlock.props.body)} onChange={(e) => updateSelectedProp('body', e.target.value)} placeholder="Body" rows={7} className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
        </div>
      )
    }

    if (selectedBlock.type === 'image') {
      return (
        <div className="space-y-2">
          <input value={asString(selectedBlock.props.imageUrl)} onChange={(e) => updateSelectedProp('imageUrl', e.target.value)} placeholder="Image URL" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <input value={asString(selectedBlock.props.alt)} onChange={(e) => updateSelectedProp('alt', e.target.value)} placeholder="Alt text" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <input value={asString(selectedBlock.props.caption)} onChange={(e) => updateSelectedProp('caption', e.target.value)} placeholder="Caption" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
        </div>
      )
    }

    if (selectedBlock.type === 'image_text_split') {
      return (
        <div className="space-y-2">
          <input value={asString(selectedBlock.props.title)} onChange={(e) => updateSelectedProp('title', e.target.value)} placeholder="Title" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <textarea value={asString(selectedBlock.props.body)} onChange={(e) => updateSelectedProp('body', e.target.value)} placeholder="Body" rows={5} className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <input value={asString(selectedBlock.props.imageUrl)} onChange={(e) => updateSelectedProp('imageUrl', e.target.value)} placeholder="Image URL" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <input value={asString(selectedBlock.props.alt)} onChange={(e) => updateSelectedProp('alt', e.target.value)} placeholder="Alt text" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
        </div>
      )
    }

    if (selectedBlock.type === 'quote') {
      return (
        <div className="space-y-2">
          <textarea value={asString(selectedBlock.props.quote)} onChange={(e) => updateSelectedProp('quote', e.target.value)} placeholder="Quote" rows={4} className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <input value={asString(selectedBlock.props.author)} onChange={(e) => updateSelectedProp('author', e.target.value)} placeholder="Author" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
        </div>
      )
    }

    if (selectedBlock.type === 'stats_row') {
      const items = asRecordArray(selectedBlock.props.items)
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Stats</p>
            <button type="button" onClick={() => addSelectedArrayItem('items', { label: 'Label', value: '0' })} className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Add</button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input value={asString(item.label)} onChange={(e) => updateSelectedArrayItem('items', index, { label: e.target.value })} placeholder="Label" className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
              <input value={asString(item.value)} onChange={(e) => updateSelectedArrayItem('items', index, { value: e.target.value })} placeholder="Value" className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
              <button type="button" onClick={() => removeSelectedArrayItem('items', index)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20">Remove</button>
            </div>
          ))}
        </div>
      )
    }

    if (selectedBlock.type === 'faq_list') {
      const items = asRecordArray(selectedBlock.props.items)
      return (
        <div className="space-y-2">
          <input value={asString(selectedBlock.props.title)} onChange={(e) => updateSelectedProp('title', e.target.value)} placeholder="Section title" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-500">Questions</p>
            <button type="button" onClick={() => addSelectedArrayItem('items', { question: 'Question?', answer: 'Answer' })} className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Add</button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="space-y-2 rounded border border-zinc-200 p-2 dark:border-zinc-700">
              <input value={asString(item.question)} onChange={(e) => updateSelectedArrayItem('items', index, { question: e.target.value })} placeholder="Question" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
              <textarea value={asString(item.answer)} onChange={(e) => updateSelectedArrayItem('items', index, { answer: e.target.value })} placeholder="Answer" rows={3} className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
              <button type="button" onClick={() => removeSelectedArrayItem('items', index)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20">Remove question</button>
            </div>
          ))}
        </div>
      )
    }

    if (selectedBlock.type === 'retreat_cards') {
      return <input value={asString(selectedBlock.props.title)} onChange={(e) => updateSelectedProp('title', e.target.value)} placeholder="Section title" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
    }

    if (selectedBlock.type === 'cta_banner') {
      return (
        <div className="space-y-2">
          <input value={asString(selectedBlock.props.title)} onChange={(e) => updateSelectedProp('title', e.target.value)} placeholder="Title" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <textarea value={asString(selectedBlock.props.body)} onChange={(e) => updateSelectedProp('body', e.target.value)} placeholder="Body" rows={4} className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <div className="grid gap-2 md:grid-cols-2">
            <input value={asString(selectedBlock.props.ctaLabel)} onChange={(e) => updateSelectedProp('ctaLabel', e.target.value)} placeholder="CTA label" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
            <input value={asString(selectedBlock.props.ctaHref)} onChange={(e) => updateSelectedProp('ctaHref', e.target.value)} placeholder="CTA href" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          </div>
        </div>
      )
    }

    if (selectedBlock.type === 'form_embed') {
      return (
        <div className="space-y-2">
          <input value={asString(selectedBlock.props.formType)} onChange={(e) => updateSelectedProp('formType', e.target.value)} placeholder="Form type" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
          <input value={asString(selectedBlock.props.source)} onChange={(e) => updateSelectedProp('source', e.target.value)} placeholder="Source tracking" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-16 z-20 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{page.name}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">/{page.slug}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={clsx('rounded-full px-2 py-1 text-xs font-medium', isDirty ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300')}>
              {isDirty ? 'Unsaved changes' : 'Up to date'}
            </span>

            <form action={saveDraftAction}>
              <input type="hidden" name="page_id" value={page.id} />
              <input type="hidden" name="document" value={documentJson} />
              <button type="submit" className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Save Draft</button>
            </form>

            {draftVersionId ? (
              <form action={createPreviewAction}>
                <input type="hidden" name="page_id" value={page.id} />
                <input type="hidden" name="version_id" value={draftVersionId} />
                <button type="submit" className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Open Preview</button>
              </form>
            ) : null}

            {role === 'admin' && draftVersionId ? (
              <form action={publishAction}>
                <input type="hidden" name="page_id" value={page.id} />
                <input type="hidden" name="version_id" value={draftVersionId} />
                <button type="submit" className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">Publish</button>
              </form>
            ) : null}

            {role === 'admin' && page.current_published_version_id ? (
              <form action={unpublishAction}>
                <input type="hidden" name="page_id" value={page.id} />
                <button type="submit" className="rounded-md border border-amber-300 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/20">Unpublish</button>
              </form>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_1fr_380px]">
        <aside className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Add Sections</p>
          <input
            value={blockSearch}
            onChange={(e) => setBlockSearch(e.target.value)}
            placeholder="Search blocks"
            className="mb-3 w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
          />

          <div className="space-y-3">
            {blockGroups.map((group) => (
              <div key={group.category}>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{group.category}</p>
                <div className="space-y-1.5">
                  {group.items.length === 0 ? <p className="text-xs text-zinc-400">No matches</p> : null}
                  {group.items.map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => addBlock(item.type)}
                      className="w-full rounded border border-zinc-300 px-2.5 py-2 text-left hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{item.label}</p>
                      <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{item.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Page Structure</p>
            <div className="space-y-2">
              {documentState.blocks.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No sections yet. Add one from the left panel.</p>
              ) : (
                documentState.blocks.map((block, index) => (
                  <div key={block.id} className={clsx('rounded border p-3', selectedIndex === index ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800' : 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900')}>
                    <button type="button" onClick={() => setSelectedIndex(index)} className="mb-2 w-full text-left">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{BLOCK_LABELS[block.type]}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Section {index + 1}</p>
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => moveBlock(index, -1)} className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Up</button>
                      <button type="button" onClick={() => moveBlock(index, 1)} className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Down</button>
                      <button type="button" onClick={() => duplicateBlock(index)} className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Duplicate</button>
                      <button type="button" onClick={() => removeBlock(index)} className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20">Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Live Layout Preview</p>
              <div className="flex gap-1">
                {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                  <button
                    key={device}
                    type="button"
                    onClick={() => setPreviewDevice(device)}
                    className={clsx('rounded px-2 py-1 text-xs', previewDevice === device ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800')}
                  >
                    {device}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-auto rounded border border-zinc-200 p-3 dark:border-zinc-800">
              <div className={clsx('mx-auto origin-top', previewDevice === 'desktop' && 'max-w-5xl', previewDevice === 'tablet' && 'max-w-2xl', previewDevice === 'mobile' && 'max-w-sm')}>
                <div className="site-theme-v1 overflow-hidden rounded border border-[var(--site-border-soft)] bg-[var(--site-bg)] text-[var(--site-text-primary)]">
                  <SitePageRenderer document={documentState} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Section Settings</p>
          {selectedBlock ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{BLOCK_LABELS[selectedBlock.type]}</p>

              <div className="grid gap-2">
                <label className="text-xs text-zinc-500">Background</label>
                <select value={selectedBlock.style?.background ?? 'default'} onChange={(e) => updateSelectedStyle('background', e.target.value)} className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                  <option value="default">Default</option>
                  <option value="alt">Alt</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Top spacing</label>
                  <select value={selectedBlock.style?.spacingTop ?? 'm'} onChange={(e) => updateSelectedStyle('spacingTop', e.target.value)} className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                    <option value="s">Small</option>
                    <option value="m">Medium</option>
                    <option value="l">Large</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Bottom spacing</label>
                  <select value={selectedBlock.style?.spacingBottom ?? 'm'} onChange={(e) => updateSelectedStyle('spacingBottom', e.target.value)} className="w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                    <option value="s">Small</option>
                    <option value="m">Medium</option>
                    <option value="l">Large</option>
                  </select>
                </div>
              </div>

              {renderPropertyFields()}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a section to edit its content.</p>
          )}

          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <form action={updateSeoAction} className="space-y-2">
              <input type="hidden" name="page_id" value={page.id} />
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">SEO</p>
              <input name="seo_title" defaultValue={page.seo_title ?? ''} placeholder="SEO title" className="w-full rounded border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
              <textarea name="seo_description" defaultValue={page.seo_description ?? ''} placeholder="SEO description" rows={3} className="w-full rounded border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
              <input name="seo_og_image_url" defaultValue={page.seo_og_image_url ?? ''} placeholder="OG image URL" className="w-full rounded border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800" />
              <button type="submit" className="w-full rounded border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Save SEO</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  )
}
