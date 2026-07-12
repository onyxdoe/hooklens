# Hooklens

Stop fighting your webhooks.

Hooklens helps you inspect, debug, replay, and test webhooks in one place.

- Create a webhook URL in one click
- See every request live (headers, body, timing)
- Replay past events on demand
- Auto-forward new events to localhost with the relay CLI

Built for Stripe, GitHub, Clerk, Paystack, Resend, Lemon Squeezy, and any webhook source.

## Quick start (local dev)

### 1) Install and run

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2) Create an endpoint

Click **Get a webhook URL**. You will be redirected to a URL like:

```text
http://localhost:3000/h/YOUR_ENDPOINT_ID
```

### 3) Send a test webhook

```bash
curl -X POST http://localhost:3000/h/YOUR_ENDPOINT_ID \
  -H 'Content-Type: application/json' \
  -d '{"hello":"world"}'
```

You should see the request instantly in the dashboard.

## Localhost replay and auto-forward

In the dashboard, open **Setup** and copy the relay command.
Run it in your app terminal (where your local server runs):

```bash
npx @hooklens/cli --endpoint YOUR_ENDPOINT_ID --port 4000
```

When relay status turns green:

- **Replay** sends one captured event again
- **Auto-forward** sends each new event to your local URL

## Environment

Main env vars:

- `PORT` - app port (default `3000`)
- `APP_URL` - public app URL used in generated webhook links
- `DATABASE_URL` - sqlite/libsql connection string

See `.env.example` for all available settings.

## Scripts

- `pnpm dev` - start dev server
- `pnpm build` - build for production
- `pnpm start` - run production build
- `pnpm db:generate` - generate migrations
- `pnpm db:migrate` - apply migrations
- `pnpm db:push` - push schema directly
- `pnpm hooklens` - run relay CLI from this repo

## Contributing

Hooklens is open source and contributions are welcome.

- Open an issue for bugs or feature ideas
- Send a PR if you want to improve something

Repo: [https://github.com/onyxdoe/hooklens](https://github.com/onyxdoe/hooklens)
