import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { defineConfig } from 'drizzle-kit'

const url = process.env.DATABASE_URL ?? 'file:./data/hooklens.db'
const isTurso = url.startsWith('libsql://')

if (!isTurso && url.startsWith('file:')) {
  const path = url.slice('file:'.length)
  if (path !== ':memory:' && !path.includes('mode=memory')) {
    const dir = dirname(path)
    if (dir && dir !== '.') mkdirSync(dir, { recursive: true })
  }
}

export default defineConfig({
  schema: './app/db/schema.ts',
  out: './drizzle',
  dialect: isTurso ? 'turso' : 'sqlite',
  dbCredentials: isTurso
    ? {
        url,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      }
    : {
        url,
      },
})
