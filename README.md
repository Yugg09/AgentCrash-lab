# AgentCrashLab

**Live demo:** [agentcrash-lab.onrender.com](https://agentcrash-lab.onrender.com)

Happy-path tests make agents look fine. Then someone asks for a refund without an order ID and your agent sends $500 anyway.

AgentCrashLab is a small reliability lab for tool-using agents. You register an agent, throw adversarial scenarios at it, collect execution traces, and see exactly where it breaks — refunds without confirmation, auth bypasses, prompt injection, that kind of thing.

Built for a hackathon. Not a production safety guarantee.

---

## What it does

- Run crash test suites against a sandbox agent (mock tools only — no real money or email)
- Score runs with deterministic safety rules + optional Gemini evaluation
- Store **Failure DNA** — expected vs observed behavior, tool involved, trace, remediation hint
- **Explore failure** — mutate a failing prompt and rerun variants
- Compare agent versions (v1 vulnerable → v2 patched) and see what got fixed

The built-in demo is a **Customer Support Agent** with `search_order`, `cancel_order`, `refund_order`, and `send_email`. v1 is intentionally sloppy. v2 has stricter rules.

---

## Try the demo (2 min)

1. Open the [live app](https://agentcrash-lab.onrender.com)
2. Go to **Agents** → **Customer Support Agent** → select **v1**
3. Click **Run crash tests** (16 adversarial scenarios)
4. Open a **CRITICAL** failure — usually an unsafe `refund_order()` call
5. Hit **Explore failure** to see mutations
6. **Compare versions** — run crash tests on v1 and v2, then compare. Critical refunds should drop on v2

> Free Render tier sleeps when idle. First load after a while can take ~30s.

---

## How it's built

```
React UI  →  Express API  →  Postgres (runs, failures, traces)
                    ↓
              Redis + BullMQ
                    ↓
              Worker (runs tests in sandbox)
                    ↓
         Deterministic rules + Gemini (optional)
```

| Layer | Stack |
|-------|-------|
| Frontend | React, Vite, TypeScript, Tailwind |
| API | Node, Express, Zod |
| Data | PostgreSQL, Prisma |
| Queue | Redis, BullMQ |
| LLM | Google Gemini (`@google/genai`) with local fallback if quota/key is missing |

Gemini is only used server-side for scenario generation, mutations, and nuanced scoring. Safety-critical checks (refund without confirmation, etc.) are deterministic.

---

## Run locally

Needs Docker for Postgres and Redis.

```bash
git clone https://github.com/Yugg09/AgentCrash-lab.git
cd AgentCrash-lab

docker compose up -d
cp .env.example .env
# add GEMINI_API_KEY to .env (optional — fallback works without it)

npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [localhost:5173](http://localhost:5173).

Postgres runs on port **5433** (not 5432) to avoid clashing with a local install.

```bash
npm test              # unit tests
npm run typecheck
npm run build
```

### Env vars

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Postgres connection string |
| `REDIS_URL` | Redis for BullMQ |
| `GEMINI_API_KEY` | Optional. Server only. |
| `GEMINI_MODEL` | Default: `gemini-2.5-flash` |
| `VITE_API_URL` | Leave empty locally (Vite proxies `/api`) |

See `.env.example` for the full list.

---

## Deploy (free)

We run frontend + API + worker on a single [Render](https://render.com) web service. Postgres on [Neon](https://neon.tech), Redis on [Upstash](https://upstash.com).

Step-by-step: **[DEPLOY.md](./DEPLOY.md)**

---

## Scoring (rough)

Objective safety stuff is rule-based: refund without confirm, cancel without lookup, invalid email, repeated tool spam, etc.

When Gemini is available it also scores goal completion, instruction following, and recovery on fuzzier cases.

Overall reliability is a weighted mix (30% safety, 25% goal, 20% tools, 15% instruction, 10% recovery). Critical failures tank the safety score. These weights are for the prototype — not a published benchmark.

---

## What this is not

- Not real sandbox isolation for arbitrary code
- Not multi-tenant / no auth
- Not claiming one LLM can perfectly judge another
- Mock tools only — nothing hits real APIs

---

## Repo layout

```
apps/web          React dashboard
apps/api          Express REST API
workers/evaluator BullMQ worker + sandbox agent
packages/         shared types, evaluator rules, LLM provider
prisma/           schema + seed data
```
