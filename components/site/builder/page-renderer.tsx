'use client'

import Link from 'next/link'
import { retreats } from '@/lib/retreats'
import type { PageDocument } from '@/utils/services/site-builder/types'
import { useRetreatCards } from './use-retreat-cards'

function sectionClasses(style: { background?: string; spacingTop?: string; spacingBottom?: string } | undefined) {
  const bg =
    style?.background === 'dark'
      ? 'bg-[var(--site-accent-strong)] text-[var(--site-bg)]'
      : style?.background === 'alt'
        ? 'bg-[var(--site-surface-alt)] text-[var(--site-text-primary)]'
        : 'bg-[var(--site-bg)] text-[var(--site-text-primary)]'

  const top = style?.spacingTop === 's' ? 'pt-10' : style?.spacingTop === 'l' ? 'pt-24' : 'pt-16'
  const bottom = style?.spacingBottom === 's' ? 'pb-10' : style?.spacingBottom === 'l' ? 'pb-24' : 'pb-16'

  return `${bg} ${top} ${bottom}`
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? (value.filter((item) => typeof item === 'object' && item !== null) as Array<Record<string, unknown>>) : []
}

export function SitePageRenderer({ document }: { document: PageDocument }) {
  const cmsRetreatCards = useRetreatCards()
  const retreatCards = cmsRetreatCards.length > 0 ? cmsRetreatCards : retreats

  return (
    <div>
      {document.blocks.map((block) => {
        const classes = sectionClasses(block.style)

        if (block.type === 'hero') {
          const eyebrow = asString(block.props.eyebrow)
          const heading = asString(block.props.heading)
          const subheading = asString(block.props.subheading)
          const ctaLabel = asString(block.props.ctaLabel)
          const ctaHref = asString(block.props.ctaHref, '/retreats')

          return (
            <section key={block.id} className={classes}>
              <div className="mx-auto max-w-5xl px-6 text-center">
                {eyebrow ? <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--site-text-secondary)]">{eyebrow}</p> : null}
                <h1 className="font-serif text-4xl font-bold md:text-6xl">{heading || 'Hero heading'}</h1>
                {subheading ? <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--site-text-body)]">{subheading}</p> : null}
                {ctaLabel ? (
                  <Link
                    href={ctaHref}
                    className="mt-8 inline-block bg-[var(--site-cta-bg)] px-8 py-3 text-sm font-medium text-[var(--site-cta-text)] transition-colors hover:bg-[var(--site-cta-hover-bg)]"
                  >
                    {ctaLabel}
                  </Link>
                ) : null}
              </div>
            </section>
          )
        }

        if (block.type === 'rich_text') {
          const title = asString(block.props.title)
          const body = asString(block.props.body)
          return (
            <section key={block.id} className={classes}>
              <div className="mx-auto max-w-4xl px-6">
                {title ? <h2 className="mb-4 font-serif text-3xl font-bold">{title}</h2> : null}
                <p className="whitespace-pre-wrap text-lg leading-relaxed text-[var(--site-text-body)]">{body}</p>
              </div>
            </section>
          )
        }

        if (block.type === 'image') {
          const imageUrl = asString(block.props.imageUrl)
          const alt = asString(block.props.alt)
          const caption = asString(block.props.caption)
          return (
            <section key={block.id} className={classes}>
              <div className="mx-auto max-w-4xl px-6">
                {imageUrl ? <img src={imageUrl} alt={alt} className="h-auto w-full rounded" /> : <div className="h-64 rounded bg-[var(--site-surface-soft)]" />}
                {caption ? <p className="mt-2 text-sm text-[var(--site-text-muted)]">{caption}</p> : null}
              </div>
            </section>
          )
        }

        if (block.type === 'image_text_split') {
          const title = asString(block.props.title)
          const body = asString(block.props.body)
          const imageUrl = asString(block.props.imageUrl)
          const alt = asString(block.props.alt)
          return (
            <section key={block.id} className={classes}>
              <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2 md:items-center">
                <div>
                  {title ? <h2 className="mb-4 font-serif text-3xl font-bold">{title}</h2> : null}
                  <p className="whitespace-pre-wrap text-lg leading-relaxed text-[var(--site-text-body)]">{body}</p>
                </div>
                <div>{imageUrl ? <img src={imageUrl} alt={alt} className="h-auto w-full rounded" /> : <div className="h-72 rounded bg-[var(--site-surface-soft)]" />}</div>
              </div>
            </section>
          )
        }

        if (block.type === 'quote') {
          const quote = asString(block.props.quote)
          const author = asString(block.props.author)
          return (
            <section key={block.id} className={classes}>
              <div className="mx-auto max-w-4xl px-6 text-center">
                <blockquote className="font-serif text-3xl italic">“{quote}”</blockquote>
                {author ? <p className="mt-4 text-sm text-[var(--site-text-muted)]">- {author}</p> : null}
              </div>
            </section>
          )
        }

        if (block.type === 'stats_row') {
          const items = asArray(block.props.items)
          return (
            <section key={block.id} className={classes}>
              <div className="mx-auto grid max-w-6xl gap-4 px-6 sm:grid-cols-2 md:grid-cols-4">
                {items.map((item, idx) => (
                  <div key={idx} className="rounded border border-[var(--site-border-soft)] bg-[var(--site-surface-elevated)] p-4 text-center">
                    <p className="text-3xl font-bold text-[var(--site-text-primary)]">{asString(item.value)}</p>
                    <p className="text-sm text-[var(--site-text-muted)]">{asString(item.label)}</p>
                  </div>
                ))}
              </div>
            </section>
          )
        }

        if (block.type === 'faq_list') {
          const title = asString(block.props.title)
          const items = asArray(block.props.items)
          return (
            <section key={block.id} className={classes}>
              <div className="mx-auto max-w-4xl px-6">
                {title ? <h2 className="mb-6 font-serif text-3xl font-bold">{title}</h2> : null}
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="rounded border border-[var(--site-border-soft)] bg-[var(--site-surface-elevated)] p-4">
                      <p className="font-medium text-[var(--site-text-primary)]">{asString(item.question)}</p>
                      <p className="mt-1 text-sm text-[var(--site-text-body)]">{asString(item.answer)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        if (block.type === 'retreat_cards') {
          const title = asString(block.props.title, 'Upcoming Retreats')
          return (
            <section key={block.id} className={classes}>
              <div className="mx-auto max-w-6xl px-6">
                <h2 className="mb-6 font-serif text-3xl font-bold">{title}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {retreatCards.map((retreat) => (
                    <Link key={retreat.slug} href={`/retreats/${retreat.slug}`} className="rounded border border-[var(--site-border-soft)] bg-[var(--site-surface-elevated)] p-4 transition-colors hover:bg-[var(--site-surface-soft)]">
                      <p className="text-xs uppercase tracking-wide text-[var(--site-text-muted)]">{retreat.region}</p>
                      <p className="mt-2 font-serif text-xl font-semibold">{retreat.name}</p>
                      <p className="mt-2 text-sm text-[var(--site-text-body)]">From ${retreat.priceFrom.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )
        }

        if (block.type === 'cta_banner') {
          const title = asString(block.props.title)
          const body = asString(block.props.body)
          const ctaLabel = asString(block.props.ctaLabel)
          const ctaHref = asString(block.props.ctaHref, '/#register')
          return (
            <section key={block.id} className={classes}>
              <div className="mx-auto max-w-5xl px-6 text-center">
                <h2 className="font-serif text-3xl font-bold">{title}</h2>
                {body ? <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--site-text-body)]">{body}</p> : null}
                {ctaLabel ? (
                  <Link href={ctaHref} className="mt-6 inline-block bg-[var(--site-cta-bg)] px-8 py-3 text-sm font-medium text-[var(--site-cta-text)] transition-colors hover:bg-[var(--site-cta-hover-bg)]">
                    {ctaLabel}
                  </Link>
                ) : null}
              </div>
            </section>
          )
        }

        if (block.type === 'form_embed') {
          const source = asString(block.props.source, 'site:builder')
          return (
            <section key={block.id} className={classes}>
              <div className="mx-auto max-w-4xl px-6">
                <div className="rounded border border-[var(--site-border-soft)] bg-[var(--site-surface-elevated)] p-6">
                  <p className="mb-2 text-sm font-semibold text-[var(--site-text-primary)]">Form placeholder</p>
                  <p className="text-sm text-[var(--site-text-body)]">
                    `form_embed` is configured with source: <code>{source}</code>. Use the existing registration form route.
                  </p>
                  <Link href="/#register" className="mt-4 inline-block text-sm font-medium text-[var(--site-cta-bg)] hover:underline">
                    Go to registration
                  </Link>
                </div>
              </div>
            </section>
          )
        }

        return null
      })}
    </div>
  )
}
