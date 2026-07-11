import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import { integer, text } from 'drizzle-orm/sqlite-core'

const timestampMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`

export function baseColumns() {
  return {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    createdAt: integer('created_at').notNull().default(timestampMs).$defaultFn(() => Date.now()),
    updatedAt: integer('updated_at')
      .notNull()
      .default(timestampMs)
      .$defaultFn(() => Date.now())
      .$onUpdateFn(() => Date.now()),
  }
}
