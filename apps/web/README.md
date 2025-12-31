This is the BrennerBot web app (Next.js App Router + React 19), bootstrapped with `create-next-app` and using **Bun** for all JS/TS tooling.

## Getting Started

### 1) Configure Agent Mail (optional but recommended)

Copy `apps/web/.env.example` to `apps/web/.env.local` and set:
- `AGENT_MAIL_BASE_URL` (default `http://127.0.0.1:8765`)
- `AGENT_MAIL_PATH` (default `/mcp/`)
- `AGENT_MAIL_BEARER_TOKEN` (if auth is enabled)
- `BRENNER_LAB_MODE=1` (required to enable `/sessions/new` orchestration; fail-closed by default)
- `BRENNER_PUBLIC_BASE_URL` (optional: absolute site URL used for server-side corpus fetch fallbacks)

### 2) Run the development server

```bash
cd apps/web
bun install --save-text-lockfile
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Key routes:
- `/corpus`: browse primary docs in this repo (read server-side from repo root)
- `/sessions/new`: compose a "Brenner Loop kickoff" prompt and send it to agents via Agent Mail

## Lab Mode & Session Orchestration

The `/sessions/new` route is **fail-closed by default** and requires lab mode to be enabled.

### Enabling Lab Mode

Set `BRENNER_LAB_MODE=1` in your environment. Additionally, one of these auth methods must be satisfied:

1. **Cloudflare Access** (production): Set `BRENNER_TRUST_CF_ACCESS_HEADERS=1` and deploy behind Cloudflare Access
2. **Shared Secret** (local dev): Set `BRENNER_LAB_SECRET=your-secret` and provide it via:
   - Header: `x-brenner-lab-secret: your-secret`
   - Cookie: `brenner_lab_secret=your-secret`

### Session Form with Role Assignment

The session kickoff form supports **explicit roster-based role assignment**:

1. Enter recipients as comma-separated Agent Mail names (e.g., `BlueLake, PurpleMountain, RedForest`)
2. The **Role Assignment** section appears automatically
3. Assign roles per recipient using dropdowns:
   - **Hypothesis Generator**: Generates candidates, hunts paradoxes
   - **Test Designer**: Designs discriminative tests with potency controls
   - **Adversarial Critic**: Attacks framing, checks scale, quarantines anomalies
4. Click **"Default 3-Agent"** for automatic role assignment in standard order
5. Toggle **Unified Mode** to send the same prompt to all (no role differentiation)

The form uses the same `composeKickoffMessages()` logic as the CLI, ensuring consistent role-specific prompts.

## Generated Files

The search index is **generated at build time** and must not be edited manually.

### Search Index Generator

**Location:** `scripts/build-search-index.ts`

The generator parses the corpus files (transcript, quote-bank, distillations, metaprompts) and builds a MiniSearch index for client-side full-text search.

**Output files** (in `public/search/`):
- `index.json` — Serialized MiniSearch index (~650KB)
- `stats.json` — Index metadata (entry counts, size)

**Regenerate the index:**
```bash
cd apps/web
bun run scripts/build-search-index.ts
```

**Automatic generation:** The index is rebuilt automatically during `bun run build` via the `prebuild` script.

**Current statistics:**
- 431 indexed entries
- 236 transcript sections, 63 quotes, 117 distillation sections, 15 metaprompt sections

## Quality Gates

```bash
cd apps/web
bun run build
bun run lint
```
