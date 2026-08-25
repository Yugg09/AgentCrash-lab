# Free deployment (hackathon)

Deploy **AgentCrashLab** for **$0** using:

| Service | Role | Free tier |
| --- | --- | --- |
| [Neon](https://neon.tech) | PostgreSQL | 0.5 GB, no credit card |
| [Render](https://render.com) | API + frontend | 750 hrs/mo (sleeps after 15 min idle) |

You get **one live URL** — the API serves the built React app and `/api/*` on the same domain.

**Redis is optional on Render.** Without `REDIS_URL`, test runs execute in-process in the API (no Upstash needed). For local dev, use Docker Redis + BullMQ worker as usual.

---

## 1. Neon (database)

1. Sign up at [neon.tech](https://neon.tech)
2. **New project** → copy the **connection string** (use the pooled URL if offered)
3. It looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

## 2. Render (app)

1. Push this repo to GitHub
2. [render.com](https://render.com) → **New** → **Blueprint**
3. Connect the GitHub repo — Render reads `render.yaml`
4. Set these **secret** env vars when prompted:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon connection string |
| `GEMINI_API_KEY` | Optional — demo works without it (local fallback) |

5. **Remove `REDIS_URL`** from Render if it was set previously (Upstash not required).
6. Click **Apply** and wait for the first deploy (~5–10 min)

`/api/health` should report `"jobDispatch": "in-process"` and `"redisConfigured": false`.

---

## 3. Seed the database

**Render free tier has no Shell.** Use one of these:

### Option A — Automatic (recommended)

Push the latest code and redeploy. On first start, the app detects an empty database and runs `db:seed` automatically.

### Option B — Seed from your laptop

Copy `DATABASE_URL` from Render → **Environment** (same value as Neon), then run locally:

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

Only run this once — re-running wipes existing runs and failures.

---

## 4. Open your live link

Render gives you a URL like:

`https://agentcrashlab.onrender.com`

- **First visit after idle** may take 30–60s (free tier cold start)
- Health check: `https://your-app.onrender.com/api/health`
- Optional: ping `/api/health` every 10 min (e.g. cron-job.org) to reduce cold starts

---

## Optional: Gemini

Add `GEMINI_API_KEY` in Render env vars for LLM-powered scenario generation. Without it, the local fallback catalog still runs the full demo.

---

## Optional: Redis (local dev only)

For `npm run dev` with BullMQ + a separate worker:

```bash
docker compose up -d redis
```

Set in local `.env`:

```env
REDIS_URL=redis://localhost:6379
```

Do **not** set this on Render unless you want queue-based dispatch and have a Redis provider.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Test runs stuck on **queued** | Check `/api/health`. If `jobDispatch` is `in-process`, the API should process runs without Redis. Redeploy latest code and remove `REDIS_URL` from Render. |
| Empty dashboard | Redeploy (auto-seed) or run `DATABASE_URL=... npm run db:seed` locally |
| 500 on API | Check `DATABASE_URL` in Render env vars |
| Slow first load | Normal on Render free tier — service woke from sleep |

---

## Alternative: Vercel frontend (split deploy)

If you prefer a faster frontend (no cold start on static assets):

1. Deploy API on Render as above (skip static serving — set `VITE_API_URL` instead)
2. [Vercel](https://vercel.com) → import repo → root `apps/web`
3. Env: `VITE_API_URL=https://your-render-api.onrender.com`
4. Set `CORS_ORIGIN=https://your-app.vercel.app` on Render

The single-URL Render setup is simpler for hackathon judging.
