import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { createClient, type Config } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema.js'

const url = process.env.DATABASE_URL ?? 'file:./data/hooklens.db'
const isLocalFile = url.startsWith('file:')

function localFileClient(): Config {
  return {
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
    syncUrl: process.env.DATABASE_SYNC_URL,
    syncInterval: Number(process.env.DATABASE_SYNC_INTERVAL ?? 60),
  }
}

function remoteClient(): Config {
  return {
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
    concurrency: Number(process.env.DATABASE_CONCURRENCY ?? 20),
  }
}

function ensureLocalDbDir() {
  if (!isLocalFile) return
  const path = url.slice('file:'.length)
  if (path === ':memory:' || path.includes('mode=memory')) return
  const dir = dirname(path)
  if (dir && dir !== '.') mkdirSync(dir, { recursive: true })
}

ensureLocalDbDir()

export const client = createClient(isLocalFile ? localFileClient() : remoteClient())
export const db = drizzle(client, { schema })

const FILE_PRAGMAS = `
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;
PRAGMA cache_size = -64000;
PRAGMA mmap_size = 268435456;
PRAGMA temp_store = MEMORY;
PRAGMA wal_autocheckpoint = 1000;
`

export async function initDatabase() {
  if (!isLocalFile) return
  await client.executeMultiple(FILE_PRAGMAS)
}
