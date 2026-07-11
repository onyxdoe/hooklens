import type { Endpoint, RequestView } from './db/schema.js'

declare module '@hono/inertia' {
  interface InertiaPages {
    home: {
      appUrl: string
    }
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
