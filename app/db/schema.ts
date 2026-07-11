import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { baseColumns } from './base.js'

export const endpoints = sqliteTable('endpoints', {
  ...baseColumns(),
  forwardEnabled: integer('forward_enabled', { mode: 'boolean' }).notNull().default(false),
  forwardUrl: text('forward_url'),
})

export const requests = sqliteTable(
  'requests',
  {
    ...baseColumns(),
    endpointId: text('endpoint_id')
      .notNull()
      .references(() => endpoints.id),
    method: text('method').notNull(),
    headers: text('headers').notNull(),
    query: text('query').notNull(),
    body: text('body'),
    contentType: text('content_type'),
    clientIp: text('client_ip'),
    userAgent: text('user_agent'),
    sizeBytes: integer('size_bytes').notNull(),
    latencyMs: integer('latency_ms').notNull(),
    forwardStatus: integer('forward_status'),
    forwardError: text('forward_error'),
    forwardMs: integer('forward_ms'),
  },
  (table) => [
    index('requests_endpoint_id_idx').on(table.endpointId),
    index('requests_created_at_idx').on(table.createdAt),
  ],
)

export type Endpoint = typeof endpoints.$inferSelect
export type Request = typeof requests.$inferSelect

export type RequestView = Omit<Request, 'headers' | 'query'> & {
  headers: Record<string, string>
  query: Record<string, string>
}
