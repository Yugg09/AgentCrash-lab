# Free deployment (hackathon)

Deploy **AgentCrashLab** for **$0** using:

| Service | Role | Free tier |
| --- | --- | --- |
| [Neon](https://neon.tech) | PostgreSQL | 0.5 GB, no credit card |
| [Upstash](https://upstash.com) | Redis (BullMQ) | 10k commands/day |
| [Render](https://render.com) | API + worker + frontend | 750 hrs/mo (sleeps after 15 min idle) |

You get **one live URL** — the API serves the built React app and `/api/*` on the same domain.

---

## 1. Neon (database)

1. Sign up at [neon.tech](https://neon.tech)
2. **New project** → copy the **connection string** (use the pooled URL if offered)
3. It looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

## 2. Upstash (Redis)

1. Sign up at [upstash.com](https://upstash.com)
2. **Create database** → Redis → pick a region near you
3. Copy the **Redis URL** (`rediss://...` is fine)

---

## 3. Render (app)

1. Push this repo to GitHub (already at `Yugg09/AgentCrash-lab`)
2. [render.com](https://render.com) → **New** → **Blueprint**
3. Connect the GitHub repo — Render reads `render.yaml`
4. Set these **secret** env vars when prompted:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon connection string |
| `REDIS_URL` | Upstash Redis URL |
| `GEMINI_API_KEY` | Optional — demo works without it (local fallback) |

5. Click **Apply** and wait for the first deploy (~5–10 min)

---

## 4. Seed the database

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

## 5. Open your live link

Render gives you a URL like:

`https://agentcrashlab.onrender.com`

- **First visit after idle** may take 30–60s (free tier cold start)
- Health check: `https://your-app.onrender.com/api/health`

---

## Optional: Gemini

Add `GEMINI_API_KEY` in Render env vars for LLM-powered scenario generation. Without it, the local fallback catalog still runs the full demo.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Test runs stuck on **queued** | Worker not running — check Render logs for `AgentCrashLab worker ready` |
| Empty dashboard | Redeploy (auto-seed) or run `DATABASE_URL=... npm run db:seed` locally |
| 500 on API | Check `DATABASE_URL` and `REDIS_URL` in Render env vars |
| Slow first load | Normal on Render free tier — service woke from sleep |

---

## Alternative: Vercel frontend (split deploy)

If you prefer a faster frontend (no cold start on static assets):

1. Deploy API on Render as above (skip static serving — set `VITE_API_URL` instead)
2. [Vercel](https://vercel.com) → import repo → root `apps/web`
3. Env: `VITE_API_URL=https://your-render-api.onrender.com`
4. Set `CORS_ORIGIN=https://your-app.vercel.app` on Render

The single-URL Render setup is simpler for hackathon judging.
