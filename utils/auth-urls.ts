export function getPasswordRedirectUrl(mode: 'set' | 'reset'): string {
  const destination = mode === 'set' ? '/set-password' : '/reset-password'
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const vercelUrl = process.env.VERCEL_URL?.trim()
  const base = explicit
    ? explicit.replace(/\/$/, '')
    : vercelUrl
      ? `https://${vercelUrl.replace(/\/$/, '')}`
      : 'http://localhost:3000'
  return `${base}${destination}`
}
