import type { RequestView } from '../db/schema.js'

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

export function buildCurl(request: RequestView, webhookUrl: string) {
  const parts = ['curl', '-X', request.method, shellQuote(webhookUrl)]

  for (const [key, value] of Object.entries(request.headers)) {
    const lower = key.toLowerCase()
    if (lower === 'host' || lower === 'content-length') continue
    parts.push('-H', shellQuote(`${key}: ${value}`))
  }

  if (request.body) {
    parts.push('-d', shellQuote(request.body))
  }

  return parts.join(' ')
}
