import type { Endpoint, RequestView } from './db/schema.js'
import type app from './server.js'

type AuthUserProp = {
  id: string
  name: string
  email: string
  image: string | null
}

declare module '@hono/inertia' {
  interface AppRegistry {
    app: typeof app
  }
  interface InertiaPages {
    home: {
      appUrl: string
      user: AuthUserProp | null
    }
    terms: Record<string, never>
    privacy: Record<string, never>
    'endpoints/index': {
      appUrl: string
      user: AuthUserProp
      endpoints: Array<{
        id: string
        name: string
        createdAt: number
        requestCount: number
        webhookUrl: string
      }>
    }
    'endpoint/show': {
      appUrl: string
      user: AuthUserProp | null
      locked: boolean
      endpoint: Endpoint
      webhookUrl: string
      requests: RequestView[]
      relayConnected: boolean
      isGuestEndpoint?: boolean
    }
  }
}

export {}
