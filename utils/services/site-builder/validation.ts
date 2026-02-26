import { BLOCK_TYPES, DEFAULT_PAGE_DOCUMENT, type BlockNode, type PageDocument } from './types'

const allowedBlockType = new Set<string>(BLOCK_TYPES)

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isBlockNode(value: unknown): value is BlockNode {
  if (!isObject(value)) return false
  if (typeof value.id !== 'string' || value.id.length === 0) return false
  if (typeof value.type !== 'string' || !allowedBlockType.has(value.type)) return false
  if (!isObject(value.props)) return false
  if (value.style !== undefined) {
    if (!isObject(value.style)) return false
    const { background, spacingTop, spacingBottom } = value.style
    if (background !== undefined && !['default', 'alt', 'dark'].includes(String(background))) return false
    if (spacingTop !== undefined && !['s', 'm', 'l'].includes(String(spacingTop))) return false
    if (spacingBottom !== undefined && !['s', 'm', 'l'].includes(String(spacingBottom))) return false
  }
  return true
}

export function parsePageDocument(input: unknown): PageDocument {
  if (!isObject(input)) return DEFAULT_PAGE_DOCUMENT
  if (input.schemaVersion !== 1 || !Array.isArray(input.blocks)) return DEFAULT_PAGE_DOCUMENT

  const blocks = input.blocks.filter((block) => isBlockNode(block))
  return {
    schemaVersion: 1,
    blocks,
  }
}
