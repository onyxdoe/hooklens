function isLocalHost(host: string) {
  const hostname = host.split(':')[0].toLowerCase()
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  )
}

export function normalizeAppUrl(raw: string) {
  const trimmed = raw.trim().replace(/\/$/, '')
  if (!trimmed) return 'http://localhost:3000'

  if (/^https?:\/\//i.test(trimmed)) {
    const url = new URL(trimmed)
    if (!isLocalHost(url.hostname) && url.protocol === 'http:') {
      url.protocol = 'https:'
    }
    return `${url.protocol}//${url.host}`
  }

  const host = trimmed.split('/')[0]
  const protocol = isLocalHost(host) ? 'http' : 'https'
  return `${protocol}://${host}`
}

export function appUrl() {
  return normalizeAppUrl(process.env.APP_URL ?? 'http://localhost:3000')
}

export function isLocalAppUrl(url: string) {
  try {
    return isLocalHost(new URL(url).hostname)
  } catch {
    const host = url.replace(/^https?:\/\//i, '').split('/')[0]
    return isLocalHost(host)
  }
}
