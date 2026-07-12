type WindowConfig = {
  windowMs: number
  max: number
}

type Bucket = {
  count: number
  resetAt: number
}

type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number }

const buckets = new Map<string, Bucket>()

const DEFAULT_WINDOWS: WindowConfig[] = [
  { windowMs: 60_000, max: 5 },
  { windowMs: 3_600_000, max: 20 },
  { windowMs: 86_400_000, max: 50 },
]

function pruneExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export function checkRateLimit(
  key: string,
  windows: WindowConfig[] = DEFAULT_WINDOWS,
): RateLimitResult {
  const now = Date.now()

  if (buckets.size > 10_000) pruneExpired(now)

  let retryAfterSec = 0

  for (const window of windows) {
    const bucketKey = `${key}:${window.windowMs}`
    let bucket = buckets.get(bucketKey)

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + window.windowMs }
      buckets.set(bucketKey, bucket)
    }

    if (bucket.count >= window.max) {
      const waitSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
      if (waitSec > retryAfterSec) retryAfterSec = waitSec
    }
  }

  if (retryAfterSec > 0) {
    return { ok: false, retryAfterSec }
  }

  for (const window of windows) {
    const bucketKey = `${key}:${window.windowMs}`
    const bucket = buckets.get(bucketKey)!
    bucket.count += 1
  }

  return { ok: true }
}

export function resetRateLimits() {
  buckets.clear()
}
