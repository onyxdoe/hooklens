import type { Context } from 'hono'
import { app } from './routes.js'

export default app

export type AppType = typeof app
export type AppContext = Context
