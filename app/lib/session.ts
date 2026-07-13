import type { Context } from 'hono'
import { auth, type SessionUser } from './auth.js'
import { appUrl } from './app-url.js'

export async function getSessionUser(c: Context): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session?.user) return null
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  }
}

export function toAuthUserProp(user: SessionUser | null) {
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
  }
}

export function isAllowedOrigin(c: Context) {
  const origin = c.req.header('origin')
  const referer = c.req.header('referer')
  const allowed = appUrl()

  if (origin) {
    try {
      return new URL(origin).origin === new URL(allowed).origin
    } catch {
      return false
    }
  }

  if (referer) {
    try {
      return new URL(referer).origin === new URL(allowed).origin
    } catch {
      return false
    }
  }

  // Same-origin navigations / non-browser clients without Origin are rejected for mutating API.
  return false
}

export function isSafeCallbackPath(path: string) {
  if (!path.startsWith('/') || path.startsWith('//')) return false
  if (path.includes('\\') || path.includes('\n') || path.includes('\r')) return false
  try {
    const url = new URL(path, 'http://local.invalid')
    return url.origin === 'http://local.invalid'
  } catch {
    return false
  }
}

const NAME_MAX = 80

export function normalizeEndpointName(raw: unknown, fallbackId: string) {
  if (typeof raw !== 'string') return fallbackId
  const cleaned = raw
    .trim()
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .slice(0, NAME_MAX)
  return cleaned || fallbackId
}
