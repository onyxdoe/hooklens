# Hooklens

**Stop fighting your webhooks.**

The easiest way to inspect, debug, replay, and test webhooks locally and in production.

No localtunnel or ngrok needed to receive webhooks while developing locally. Inspect every event and replay to your localhost as many times as you want.

Built for the webhooks you already use — Stripe, GitHub, Clerk, Paystack, Resend, Lemon Squeezy.

## Run it

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm dev
```

Open [localhost:3000](http://localhost:3000), click **Get a webhook URL**, and send something:

```bash
curl -X POST http://localhost:3000/h/YOUR_ENDPOINT_ID \
  -H 'Content-Type: application/json' \
  -d '{"hello":"world"}'
```

It shows up in the dashboard instantly.

## Replay to localhost

In the dashboard, copy the relay command and run it in your project terminal:

```bash
pnpm hooklens -- --endpoint YOUR_ENDPOINT_ID --port 4000
```

When the dot turns green, you can replay and auto-forward to your local app.

## Scripts

- `pnpm dev` — start the app
- `pnpm build` / `pnpm start` — production
- `pnpm db:generate` / `pnpm db:migrate` — schema changes
- `pnpm hooklens` — run the relay CLI locally
