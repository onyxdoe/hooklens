import type { Endpoint, RequestView } from './db/schema.js'

declare module '@hono/inertia' {
  interface InertiaPages {
    home: {
      appUrl: string
    }
    terms: Record<string, never>
    privacy: Record<string, never>
    'endpoint/show': {
      appUrl: string
      endpoint: Endpoint
      webhookUrl: string
      requests: RequestView[]
      relayConnected: boolean
    }
  }
}

export {}
