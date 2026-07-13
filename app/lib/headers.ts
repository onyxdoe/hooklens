const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'proxy-connection',
  'upgrade',
  'te',
  'trailer',
])

const PROXY_EXACT = new Set([
  'forwarded',
  'x-real-ip',
  'via',
  'cdn-loop',
  'true-client-ip',
])

function isProxyOrInfraHeader(key: string) {
  const lower = key.toLowerCase()
  if (HOP_BY_HOP.has(lower) || PROXY_EXACT.has(lower)) return true
  if (lower.startsWith('x-forwarded-')) return true
  if (lower.startsWith('cf-')) return true
  return false
}

/** Strip hop-by-hop and proxy/edge headers; keep provider-sent headers. */
export function cleanCaptureHeaders(headers: Record<string, string>) {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (isProxyOrInfraHeader(key)) continue
    result[key] = value
  }
  return result
}
