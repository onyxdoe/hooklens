import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { db } from '../db/index.js'
import * as schema from '../db/schema.js'
import { appUrl } from './app-url.js'

function requireEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

const githubClientId = process.env.GITHUB_CLIENT_ID?.trim() ?? ''
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim() ?? ''
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? ''
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? ''

const socialProviders: NonNullable<Parameters<typeof betterAuth>[0]['socialProviders']> = {}

if (githubClientId && githubClientSecret) {
  socialProviders.github = {
    clientId: githubClientId,
    clientSecret: githubClientSecret,
  }
}

if (googleClientId && googleClientSecret) {
  socialProviders.google = {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
  }
}

if (!socialProviders.github && !socialProviders.google) {
  console.warn(
    '[auth] No social providers configured. Set GITHUB_CLIENT_ID/SECRET and/or GOOGLE_CLIENT_ID/SECRET in .env',
  )
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  baseURL: process.env.BETTER_AUTH_URL ?? appUrl(),
  secret: requireEnv('BETTER_AUTH_SECRET'),
  trustedOrigins: [appUrl()],
  socialProviders,
})

export type SessionUser = {
  id: string
  name: string
  email: string
  image?: string | null
}
