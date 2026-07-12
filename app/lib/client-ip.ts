import type { Context } from 'hono'

export function getClientIp(c: Context) {
  const forwarded = c.req.header('cf-connecting-ip')
    ?? c.req.header('x-real-ip')
    ?? c.req.header('x-forwarded-for')?.split(',')[0]?.trim()

  if (forwarded) return forwarded
  return 'unknown'
}
