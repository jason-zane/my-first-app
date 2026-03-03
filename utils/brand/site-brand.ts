import type { BrandCtaVariant } from '@/utils/brand/brand-guidelines'

export const siteButtonClasses = {
  primary:
    'font-ui tracking-[0.015em] bg-[var(--site-cta-bg)] text-[var(--site-cta-text)] hover:bg-[var(--site-cta-hover-bg)]',
  secondary:
    'font-ui tracking-[0.015em] bg-[var(--site-accent-strong)] text-[var(--site-on-dark-primary)] hover:bg-[var(--site-accent-deep)]',
  ghost: 'font-ui tracking-[0.015em] bg-transparent text-[var(--site-text-primary)] hover:bg-[var(--site-surface-soft)]',
  outlineLight:
    'font-ui tracking-[0.015em] border border-[var(--site-accent-strong)] text-[var(--site-accent-strong)] hover:bg-[var(--site-accent-strong)] hover:text-[var(--site-on-dark-primary)]',
  outlineDark:
    'font-ui tracking-[0.015em] border border-[color:var(--site-on-dark-primary)]/70 text-[var(--site-on-dark-primary)] hover:bg-[var(--site-on-dark-primary)] hover:text-[var(--site-cta-bg)]',
  outlineAccent:
    'font-ui tracking-[0.015em] border border-[var(--site-cta-bg)] text-[var(--site-cta-bg)] hover:bg-[var(--site-cta-bg)] hover:text-[var(--site-cta-text)]',
} as const

export function getCtaButtonClass(variant: BrandCtaVariant) {
  return siteButtonClasses[variant]
}

export const siteTextClasses = {
  onDarkPrimary: 'text-[var(--site-on-dark-primary)]',
  onDarkMuted: 'text-[var(--site-on-dark-muted)]',
  body: 'text-[var(--site-text-body)]',
  heading: 'text-[var(--site-text-primary)]',
  muted: 'text-[var(--site-text-muted)]',
  eyebrow: 'font-ui text-[12px] font-semibold uppercase tracking-[0.12em]',
  nav: 'font-ui text-[15px] font-medium tracking-[0.015em]',
  meta: 'font-ui text-[13px] font-medium tracking-[0.01em]',
} as const

export const siteCardClasses = {
  default: 'border border-[var(--site-border-soft)] bg-[var(--site-surface-elevated)] shadow-[0_2px_10px_rgba(18,63,56,0.05)]',
  interactive:
    'border border-[var(--site-divider)] bg-[var(--site-surface-elevated)] shadow-[0_2px_10px_rgba(18,63,56,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(18,63,56,0.14)]',
  soft: 'border border-[var(--site-border-soft)] bg-[var(--site-surface-soft)]',
} as const

export const siteStatusClasses = {
  upcoming:
    'border border-[var(--site-accent-strong)]/20 bg-[var(--site-surface-elevated)] text-[var(--site-accent-deep)]',
  open: 'border border-[var(--site-cta-bg)]/15 bg-[var(--site-cta-bg)] text-[var(--site-cta-text)]',
  'sold-out': 'border border-[var(--site-border-soft)] bg-[var(--site-surface-soft)] text-[var(--site-text-primary)]',
  interest:
    'border border-[var(--site-cta-bg)]/45 bg-[color:var(--site-surface-elevated)]/95 text-[var(--site-cta-bg)]',
} as const

export const siteAccentClasses = {
  label: 'text-[var(--site-cta-bg)]',
  divider: 'border-[var(--site-cta-bg)]/40',
  icon: 'text-[var(--site-cta-bg)]',
  chipSoft: 'border border-[var(--site-cta-bg)]/25 bg-[var(--site-cta-soft)] text-[var(--site-cta-bg)]',
} as const
