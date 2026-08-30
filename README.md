# Mandate Doctor

Agentic payment and mandate revenue recovery system for recurring (eMandate/UPI-autorize) collections: a failed payment is diagnosed, an AI agent proposes a recovery plan, a policy engine decides what is actually allowed, a recovery value is computed, and an action layer executes — every step recorded to an append-only audit log.

> **Important: this project operates entirely in SIMULATION / TEST mode.**
> The action layer marks every execution `simulated: true`. The pipeline never
> calls Razorpay's real payment/order/subscription APIs, never debits a real
> customer, and never moves real money. All recovery figures are **expected /
> simulated** values computed by a deterministic model over a synthetic
> dataset; no realised payment outcomes exist in the data.

---

## The problem

Recurring collections leak revenue. Payments on valid mandates fail for many reasons — empty balances, bank timeouts, expired or revoked mandates, exceeded limits — and naive "retry every day" loops debitting blindly are both ineffective and risky: they cannot debit an invalid mandate, they hazard revoked/expired collections, and they ignore cooling-off periods and legal/policy constraints.

The system exists to answer, per failed payment:

1. **Diagnosis** — *why* did this payment fail?
2. **Proposal** — the AI recovery agent proposes what to do.
3. **Policy** — what is the *safest compliant* recovery plan?
4. **Value** — how much recovery is *expected* and *at risk*?
5. **Action** — what is actually executed (in simulation)?
6. **Audit** — every decision is persisted, append-only, for review.

---

## Architecture

```
Payment failure event (synthetic dataset or Razorpay TEST webhook)
        │
        ▼
┌───────────────┐   ┌─────────────────┐    ┌─────────────────────┐
│  DIAGNOSIS    │──▶│  AI PROPOSAL    │──▶│  POLICY ENGINE      │
│ (failure code │   │ (recovery agent │   │ (retries, cooling    │
│  → root cause)│   │  proposes plan) │   │  off, human-approval │
└───────────────┘   └─────────────────┘   │  threshold, kill     │
                                          │  switch; decides     │
      ┌───────────────────────────────────┴───────┐              │
      │      final decision: APPROVE / REVIEW / BLOCK            │
      └───────────────────────────────────┬───────┘              │
                                          ▼                      │
                              ┌─────────────────────┐            │
                              │  RECOVERY VALUE     │            │
                              │  expected recovery  │            │
                              │  probability, loss  │            │
                              └──────────┬──────────┘            │
                                         ▼                       │
                              ┌─────────────────────┐            │
                              │  ACTION LAYER       │            │
                              │  (SIMULATION mode)  │            │
                              └──────────┬──────────┘            │
                                         ▼                       │
                              ┌─────────────────────┐            │
                              │  AUDIT LOG          │            │
                              │  (append-only JSON) │            │
                              └─────────────────────┘            │
                                                                 ▼
                                            Command center dashboard :8080
```

### Design principles

- **AI proposes, policy decides.** The recovery agent suggests an action and a confidence; the policy engine independently evaluates eligibility and produces the final `APPROVE` / `REVIEW` / `BLOCK` decision. A proposal is never executed because an AI liked it.
- **LLM assists the proposal, never the decision or the execution.** When `LLM_API_KEY` is configured, the proposal step consults a real LLM (strict, validated structured output); any failure falls back to the built-in deterministic proposal. The policy engine is the only authority that decides, and only the action layer executes — in simulation, and only on `APPROVE`.
- **Policy first.** Policy runs before value and action. Hard blocks (`REVOKED`, `EXPIRED_MANDATE`, non-recoverable, retry limit exceeded, kill switch) are absolute.
- **Human-in-the-loop without override risk.** High-value payments (> `human_approval_threshold`) and unknown failures become `REVIEW` and require a human approval recorded as a `HUMAN_APPROVAL` audit event. A human **cannot override a hard policy block**: approving a `BLOCK`ed case still results in no action (`backend/app/main.py` `/api/approvals`).
- **Deterministic and auditable.** Diagnosis, decision, expected recovery and evaluation are deterministic. Every decision is appended to `backend/data/audit_logs.json` (they are never mutated; the file is append-only).

### Pipeline services (backend directory)

| Stage | Service | Responsibility |
|---|---|---|
| Diagnosis | `services/diagnosis.py` | `failure_code`/`mandate_status` → root cause + confidence + recoverability |
| AI proposal | `services/recovery_agent.py` (`services/llm_provider.py`) | proposes `RETRY_LATER` / `REQUEST_FRESH_MANDATE` / `NO_ACTION` / `ESCALATE` with delay + confidence. Real LLM when configured and reachable, otherwise the deterministic proposal. Each proposal carries `proposal_source: "llm" \| "deterministic_fallback"` |
| Policy | `services/policy_engine.py` | retry limits, cooling off, human-approval threshold, high-value reviews, kill switch; decides APPROVE/REVIEW/BLOCK |
| Value | `services/recovery_value.py` | banded recovery probability per root cause → expected recovery, potential loss |
| Action layer | `services/action_layer.py` | executes only on APPROVE, in simulation mode |
| Orchestration | `services/recovery_engine.py` | `make_recovery_decision(...)` — diagnosis → proposal → policy → value → action → audit |

### LLM-assisted proposal layer (optional, server-side)

One real AI/LLM capability is wired into the existing pipeline as the **proposal/reasoning** stage only:

```
Payment failure → Diagnosis (deterministic) → REAL LLM Proposal → Policy Engine (decides) → Action Layer (executes only if allowed) → Audit
```

- **Propose, never execute.** The LLM returns strict structured JSON (`proposed_action`, `reason`, `confidence`, optional `customer_message` / `retry_after_hours`). The caller validates every field; the deterministic policy engine still decides and only the action layer executes — in simulation, and only on `APPROVE`. The LLM cannot charge a payment, call payment APIs, change retry limits or cooling-off, override a block or human approval, compute recovery value, flip the kill switch, or modify the audit log (enforced by design and by test).
- **Strict structured output with validation.** The response is parsed as JSON (a markdown fence is tolerated) and validated field-by-field (`proposed_action` ∈ `{RETRY_LATER, REQUEST_FRESH_MANDATE, NO_ACTION, ESCALATE}`, `confidence` ∈ 0..1, `retry_after_hours` ∈ 1..168). Anything invalid — bad JSON, unknown action, out-of-range confidence — is discarded.
- **Deterministic fallback, always.** No key configured, model timeout, rate limit, HTTP error or malformed reply ⇒ the pipeline uses the existing deterministic proposal (e.g. `BANK_TIMEOUT` → `RETRY_LATER` 12h). The application never 500s because the LLM provider is unavailable.
- **Server-side only, environment-configured.** Credentials live in environment variables (`LLM_API_KEY`), optionally loaded from `backend/.env`; the key is never logged, returned by an API, or exposed to the frontend. A new dependency is not required: the adapter (`services/llm_provider.py`) calls an OpenAI-compatible `/chat/completions` endpoint with `httpx` (already a pinned dependency).
- **Auditable provenance.** Every proposal records `proposal_source: "llm"` or `"deterministic_fallback"` inside `ai_proposal`, surfaced in the audit log and in the UI ("LLM" / "Deterministic fallback" badge and timeline labels).
- **Evaluation stays reproducible without an API key.** The bulk/cached case pipeline, the metrics overview and the evaluation harness force the deterministic proposal path, so `evaluate_dataset.py` and the reported baseline numbers require no LLM and no network. Live per-payment decisions (`POST /api/recovery/decision`) and webhook ingestion consult the LLM when it is configured.

---

## Evaluation methodology (honest by construction)

The evaluation harness (`backend/evaluate_dataset.py`, service: `services/evaluation.py`) runs the **exact production pipeline** over every record of the synthetic dataset and compares it with a naive baseline. It is **side-effect free**: audit persistence is disabled, settings are never written, and repeated runs return identical metrics plus a stable `reproducibility_digest`.

The synthetic dataset (`data/synthetic/failed_mandates.csv`) contains **no realised future payment outcomes**, so no `recovered vs not` truth can be asserted. Every recovery figure is an **expected value** from the shared deterministic model (`calculate_recovery_value`) — nothing is invented from outside the data.

Two baselines are reported so a single number cannot hide unfairness:

- **`comparison` (defensible baseline)** — a *mechanically honest* naive: a blind daily retry loop with no diagnosis, no policy, no cooling off and no outreach. A retry can only debit a currently-valid (`active`) mandate, so revoked/expired mandates yield `0.0`; the naive receives no re-onboarding credit it could not actually perform. Recovery on the valid subset uses the **shared model bands**.
- **`comparison_raw` (transparency-only baseline)** — an *unrestricted* naive that receives a recovery probability for every payment regardless of mandate validity. This over-credits the naive with Mandate Doctor's customer re-onboarding capability and with debits on invalid mandates that Mandate Doctor blocks; it is **not achievable by a real retry loop** and is kept only so the comparison is fully disclosed.

A third comparison restricts **both** strategies to the 226 policy-approved ("safe recoverable") cases and reports efficiency on that comparable subset.

---

## Current results (expected / simulated)

Dataset: `data/synthetic/failed_mandates.csv` — 300 records, generated with `random.seed(42)`.
Settings: defaults (`retry_limit=3`, `cooling_off_hours=12`, `human_approval_threshold=75000`, `max_contact_attempts=2`, `kill_switch=false`).
Reproducibility digest: `d6ae5d5acaadf6a3286962c5bef5cbea3438a01dad4e0e5eed55937d08d7a531`.

| Metric | Value |
|---|---|
| Revenue at risk | **₹692,500** |
| Diagnosis accuracy | **100%** |
| Policy decisions | **226 APPROVE / 74 BLOCK** |
| Action layer result | 226 `EXECUTED` / 74 `SKIPPED` (all simulated) |
| Mandate Doctor expected recovery | **₹289,818.30 (41.85% of revenue at risk)** |
| Recovery rate on safe exposure (₹481,774 across 226 cases) | **60.16%** |
| Uncollectable, deliberately blocked | **74 cases / ₹210,726 — never hazarded** |
| Policy violations (Mandate Doctor) | **0** |
| Unsafe/invalid retries a naive would have performed but MD avoided | **74 / ₹210,726** |
| Naive policy violations (what the retry loop would commit) | 74 |

### By diagnosis (expected recovery, doctor vs naive)

| Root cause | Count | At risk | MD expected | Naive expected |
|---|---|---|---|---|
| BANK_TIMEOUT | 98 | ₹202,702.00 | ₹152,026.50 | ₹152,026.50 |
| BALANCE | 80 | ₹174,420.00 | ₹95,931.00 | ₹95,931.00 |
| EXPIRED_MANDATE | 44 | ₹120,856.00 | ₹0.00 | ₹0.00 |
| LIMIT_EXCEEDED | 48 | ₹104,652.00 | ₹41,860.80 | ₹41,860.80 |
| REVOKED | 30 | ₹89,870.00 | ₹0.00 | ₹0.00 |
| **Total** | **300** | **₹692,500.00** | **₹289,818.30** | **₹289,818.30** |

### Honest comparison with the naive baselines

- **Defensible baseline (valid mandates only): parity.** MD expected recovery ₹289,818.30 (41.85%) equals the mechanically honest retry loop ₹289,818.30 (41.85%). On this synthetic dataset the two strategies converge because every valid-mandate record is policy-eligible and below the human-approval threshold. The differentiators are **safety and governance**, not raw yield: MD refuses the 74 unsafe retries (₹210,726) the naive would blindly attempt against revoked/expired mandates.
- **Unrestricted baseline (transparency only): MD is lower.** Unrestricted naive ₹313,989.50 (45.34%) vs MD ₹289,818.30 (41.85%) — difference −₹24,171.20 (−7.70%). This is expected and intentional: the unrestricted baseline is credited ₹24,171.20 of EXPIRED-mandate re-onboarding recovery plus debits on invalid mandates that Mandate Doctor blocks on safety grounds. It is shown to avoid cherry-picking a favourable baseline.
- **Safe subset:** both strategies achieve 60.16% of the ₹481,774 of safe legitimate exposure.

### Notes on the blocked cases

74 cases (₹210,726) are `BLOCK`ed because their mandates are **revoked** (30) or **expired** (44). This is deliberate policy behavior, not a defect: a revoked or expired mandate cannot be legally/safely debited, and the naive loop that would try is counted as a policy violation against it. MD would instead re-onboard these customers via a fresh-mandate request — which, in this simulation, the naive is never credited with.

---

## Repository layout

```
mandate-doctor/
├── docker-compose.yml            # one-command stack (backend + frontend + volume)
├── .env.example                  # env template (webhook + LLM placeholders)
├── data/synthetic/               # seed dataset CSV + deterministic generator
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app: /health, /api/overview, /api/approvals
│   │   ├── api/                  # routers: diagnosis, cases, metrics, evaluation,
│   │   │                         #            settings, webhooks, audit, policy,
│   │   │                         #            recovery, dataset
│   │   └── services/             # the pipeline engines described above
│   ├── test_*.py                 # 76 pytest tests (pipeline + webhook + settings + LLM proposal layer)
│   ├── evaluate_dataset.py       # side-effect-free evaluation harness
│   ├── send_test_webhook.py      # local signed-webhook test harness (Razorpay-compatible)
│   ├── requirements.txt          # pinned Python dependencies
│   └── Dockerfile                # python:3.14-slim + uvicorn
└── frontend/
    ├── Dockerfile                # node:24-slim + bun@1.3.13 (pinned) + vite dev
    ├── package.json / bun.lock   # bun is the canonical package manager
    └── src/                      # TanStack Start / Vite app + UI components
```

Runtime-generated state (`backend/data/settings.json`, `backend/data/audit_logs.json`, `backend/data/webhook_events.json`, `backend/.env`, build caches) is **git-ignored**, not committed.

---

## Quick start

### Option A — Docker Compose (recommended)

Requires Docker (Compose v2).

```bash
docker compose up --build
```

- Frontend command center → **http://localhost:8080**
- Backend health → **http://localhost:8000/health**
- FastAPI interactive docs → **http://localhost:8000/docs**

Then inspect the stack:

```bash
docker compose ps                # mandate-doctor-backend / mandate-doctor-frontend
docker compose logs -f backend   # follow backend logs
docker compose stop              # stop (state persists in the mandate_backend_data volume)
```

The backend serves FastAPI on `:8000`; the frontend is served by `vite dev` inside its container on `:8080`. The browser talks directly to `http://127.0.0.1:8000` (see `frontend/src/lib/api.ts`), so the backend port is published on the host. Runtime JSON state lives in the named volume `mandate_backend_data` mounted at `/app/backend/data`, so settings, audit log and webhook state survive restarts.

> `RAZORPAY_WEBHOOK_SECRET`, `AI_PROPOSAL_ENABLED`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL` and `LLM_TIMEOUT_SECONDS` are read from a repository-root `.env` (copy `.env.example`) and passed into the backend by Compose. With no values set the whole stack still runs; only webhook ingestion is inert (`500 server_not_configured`) and the proposal layer stays deterministic (LLM disabled until a key is provided). Never commit a real key — `backend/.env` and any root `.env` are git-ignored.

### Option B — Local development

Backend (Python 3.12+; tested on 3.14):

```bash
cd backend
python -m venv venv
venv\Scripts\activate                 # Windows; macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Frontend (bun — the canonical package manager; `bun.lock` is authoritative and no `package-lock.json` is committed, so use bun):

```bash
cd frontend
bun install
bun run dev -- --host 0.0.0.0 --port 8080
```

Open **http://localhost:8080**.

---

## Configuration

| Variable | Where | Effect |
|---|---|---|
| `RAZORPAY_WEBHOOK_SECRET` | root `.env` (passed to backend container) or `backend/.env` | Enables signed webhook ingestion; empty ⇒ `500 server_not_configured` on `POST /api/webhooks/razorpay` |
| `AI_PROPOSAL_ENABLED` | root `.env` (passed to backend container) or `backend/.env` | Master switch for the LLM proposal layer. Default `true`; the layer is active only when an API key is also present, otherwise proposals are deterministic |
| `LLM_API_KEY` | root `.env` (passed to backend container) or `backend/.env` | Server-side LLM credentials. Leave empty to keep the pipeline fully deterministic with no LLM/network dependency |
| `LLM_MODEL` | same | Model name; default `gpt-4o-mini` |
| `LLM_BASE_URL` | same | OpenAI-compatible base URL; default `https://api.openai.com/v1` |
| `LLM_TIMEOUT_SECONDS` | same | Provider timeout before falling back to the deterministic proposal; default `10` |

Copy the template and set a test value **only** if you want to exercise webhook ingestion:

```bash
cp .env.example .env        # macOS/Linux
copy .env.example .env      # Windows
```

**Never commit real secret values.** The repository contains only the empty template; the runtime `backend/.env` is git-ignored.

---

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Liveness probe |
| GET | `/api/overview` | Revenue at risk, expected recovery, decision counts (cold-cache full run) |
| GET | `/api/cases` | Recovery case list, enriched with latest `HUMAN_APPROVAL` |
| GET | `/api/metrics/analytics` | Aggregated analytics from the cached pipeline |
| GET | `/api/evaluation` | Deterministic evaluation metrics (side-effect free) |
| GET/PUT | `/api/settings` | Read / validate + persist policy settings |
| GET | `/api/audit` | Append-only decision + approval log |
| POST | `/api/approvals` | Human-in-the-loop APPROVE/REJECT (cannot override a hard BLOCK) |
| POST | `/api/diagnosis` | Diagnose a single payment |
| POST | `/api/policy` | Evaluate policy for an amount + diagnosis |
| POST | `/api/recovery/decision` | Full pipeline decision for one payment |
| POST | `/api/webhooks/razorpay` | Ingest a signed Razorpay TEST webhook event |
| GET | `/api/dataset/stats` | Dataset stats |
| GET | `/api/dataset/failed-mandates` | Dataset records |

---

## Settings

Defaults persisted by `PUT /api/settings` to `backend/data/settings.json` (falls back to defaults if missing/unreadable):

| Key | Default | Meaning |
|---|---|---|
| `retry_limit` | `3` | max retries after the first attempt (limits `attempt_number`) |
| `cooling_off_hours` | `12` | cooling-off window between attempts |
| `human_approval_threshold` | `75000` | amounts above this require `REVIEW` + human approval |
| `max_contact_attempts` | `2` | customer contact cap (proposal metadata) |
| `kill_switch` | `false` | globally disables recovery execution when true |

---

## Webhook integration (TEST mode only)

`POST /api/webhooks/razorpay` ingests `payment.failed` and `subscription.charged.failed`:

- **Signature verification** — HMAC-SHA256 over the **exact raw request body** using `RAZORPAY_WEBHOOK_SECRET`, identical to the official Razorpay SDK (`razorpay.utility.Utility`). The secret is never logged or returned.
- **Normalisation** — Razorpay `amount` (paise) is converted with `Decimal` (no float corruption); failure signals are mapped onto the diagnosis taxonomy; unmappable signals degrade to `UNKNOWN` → human `REVIEW` rather than a silent guess. Fields Razorpay does not send in a failure event (`attempt_number`, `previous_*`) use documented safe defaults.
- **Idempotency** — events are keyed `event|payment_id` with an atomic claim/complete/release store (`services/webhook_events.py`), so Razorpay redeliveries are recognised as `duplicate` and never processed twice.
- **No real API calls** — ingestion feeds the existing simulation pipeline; nothing downstream touches Razorpay production.

Test it locally (server running on `:8000` with the secret set, then post the same signed event twice to observe the duplicate):

```bash
cd backend
# Windows PowerShell:
$env:RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret_123"
venv\Scripts\python send_test_webhook.py http://127.0.0.1:8000 --secret test_webhook_secret_123
# macOS/Linux (bun-style shell): export RAZORPAY_WEBHOOK_SECRET=test_webhook_secret_123
```

> Actual Razorpay **dashboard-delivered** webhooks are NOT part of this repository's verification; that still requires Razorpay dashboard credentials/configuration. See the NOTE printed by the harness.

---

## Testing

76 pytest tests cover diagnosis, policy, recovery value, action layer, settings validation, audit, webhook signature/idempotency, the full decision flow, and the LLM proposal layer (valid structured proposals, invalid output/timeout/API failure ⇒ deterministic fallback, LLM cannot override a policy block, LLM cannot execute directly, key not exposed to the frontend, evaluation stays deterministic with no API key). All tests pass with no LLM configured and no network access.

```bash
cd backend
venv\Scripts\python -m pytest -v     # Windows
# macOS/Linux: source venv/bin/activate && pytest -v
```

## Evaluation harness

```bash
cd backend
venv\Scripts\python evaluate_dataset.py
```

Prints the full evaluation report (diagnosis, decisions, revenue breakdown, both baseline comparisons, unsafe retries avoided, by-diagnosis table, reproducibility digest). Side-effect free: no audit records are written, settings are never mutated, and the deterministic proposal path is used (no live LLM call), so it runs with no API key and reproduces the exact numbers above.

---

## Frontend pages

| Route | Page |
|---|---|
| `/` | Overview — revenue at risk, expected recovery, decision summary |
| `/recovery-cases` | Case list + per-case replay of diagnosis/proposal/policy/action (proposal badge: "LLM" or "Deterministic fallback") |
| `/approvals` | Human-in-the-loop approval queue (REVIEW cases) |
| `/analytics` | Trends and aggregated metrics |
| `/audit-replay` | Append-only audit log viewer |
| `/settings` | Policy settings editor (incl. kill switch) |

---

## Known limitations & honest scoping

- **Simulation only.** Actions are never performed against a real processor; nothing is claimed as actually-recovered money.
- **Expected, not realised, recovery.** Figures come from the shared model (`BANK_TIMEOUT 75%`, `BALANCE 55%`, `LIMIT_EXCEEDED 40%`, `EXPIRED 20%`, `REVOKED 0%`) over a synthetic dataset with no real outcomes.
- **Parity with the defensible naive on this dataset.** Value here is safety/governance (74 unsafe retries refused, 0 policy violations, deterministic audit) and architecture, not out-yielding a retry loop on these 300 synthetic rows.
- **No database.** State persists as JSON files under `backend/data/`; the audit log grows append-only (one ~300-row batch per cold-cache full run).
- **LLM proposal layer is optional and proposal-only.** It needs a real `LLM_API_KEY`; without one (or on timeout/rate-limit/API error/invalid output) proposals fall back to the deterministic logic, so behavior and evaluation numbers are unchanged. The LLM only ever proposes — it never decides or executes.
- **Frontend is served by `vite dev`**, not a production build, matching the project's existing workflow.
- **Webhook ingestion is inert** until `RAZORPAY_WEBHOOK_SECRET` is configured.
- **API endpoints are unauthenticated** in this simulation/demo and are intended for local/demo use.
