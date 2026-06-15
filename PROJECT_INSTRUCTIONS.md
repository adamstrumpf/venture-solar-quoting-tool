# Project: venture-solar-quoting-tool

## What This Is

A standardized quoting tool for Venture Home Solar's post-install service work, replacing inconsistent manual pricing with automated calculations based on labor rates, materials, and state requirements.

Currently, post-install service quotes are inconsistent across team members, with some using established formulas (critter guards at $25/panel + $250) while others require manager consultation for custom pricing. This creates delays, inconsistent pricing, and potential profit loss. Standardizing the quoting process will improve customer experience, ensure profitability, and capture service revenue opportunities.


## Repo Setup

- **Local project directory**: `~/Documents/Claude/projects/venture-solar-quoting-tool` (extracted from scaffold zip or cloned from GitHub)
- **GitHub repo**: `[your-gh-org]/venture-solar-quoting-tool`
- **Cloud Run service**: `venture-solar-quoting-tool`
- **GCP project ID**: `venture-solar-quoting-tool`
- **Branch strategy**: `main` is production. Work on feature branches (`feature/[name]`) and merge via PR.

When asked to make changes, commit to the current working branch with clear commit messages. Push to GitHub when asked to "push" or "ship it."

## Tech Stack

- **Frontend**: React (JSX), Vite
- **Styling**: Inline styles, dark theme with Venture Home design tokens
- **Data Sources**: Service Pricing Template spreadsheet, contract addendums, state licensing requirements
- **Integrations**: Standalone initially, future Salesforce integration planned for Case creation and customer data


## Hosting & Deployment

- **Runtime**: Google Cloud Run (containerized, port 8080)
- **Static/File Storage**: Google Cloud Storage
- **Container Registry**: Google Artifact Registry
- **Region**: us-east1

### Key deployment rules:
- Cloud Run URL format: `https://venture-solar-quoting-tool-HASH-ue.a.run.app`
- Environment variables are set via Cloud Run service configuration — never baked into the container
- `.env.local` is for local dev only — never deployed, never committed
- For server-side API calls, use the Cloud Run service URL as the base, not localhost
- Always test Docker builds locally before deploying: `docker build -t venture-solar-quoting-tool . && docker run -p 8080:8080 venture-solar-quoting-tool`

### Deployment Commands
All commands run from the repo root (`~/Documents/Claude/projects/venture-solar-quoting-tool`).

```bash
# Verify required tools first
which node && which npm && which git && which docker && which gcloud
# If any are missing, install before proceeding

# First-time GCP setup (run once)
gcloud auth login
gcloud config set project venture-solar-quoting-tool
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com storage.googleapis.com

# Create Artifact Registry repo (once)
gcloud artifacts repositories create venture-solar-quoting-tool --repository-format=docker --location=us-east1

# Build and deploy
gcloud builds submit --tag us-east1-docker.pkg.dev/venture-solar-quoting-tool/venture-solar-quoting-tool/venture-solar-quoting-tool:latest .
gcloud run deploy venture-solar-quoting-tool \
  --image us-east1-docker.pkg.dev/venture-solar-quoting-tool/venture-solar-quoting-tool/venture-solar-quoting-tool:latest \
  --region us-east1 --platform managed --allow-unauthenticated

# Update environment variables
gcloud run services update venture-solar-quoting-tool --region us-east1 \
  --update-env-vars="KEY=value,KEY2=value2"
```

## Project Structure

```
venture-solar-quoting-tool/
├── .auto-memory/
│   ├── MEMORY.md                  # Canonical index — read first every session
│   ├── reference_venture-solar-quoting-tool.md       # Infra: GCP project, Cloud Run URL, env vars
│   └── project_venture-solar-quoting-tool.md         # Tech stack, components, architecture decisions
├── src/
│   ├── main.jsx
│   ├── app.jsx
│   ├── components/                 # React (JSX), Vite components (.jsx)
│   ├── views/
│   ├── data/
│   ├── auth/
│   └── utils/
├── docs/
│   └── memory/
│       └── planning.md            # Bootstrap planning artifact from Ignition
├── PROJECT_INSTRUCTIONS.md
├── AGENTS.md
├── TODO.md
├── STARTER_PROMPTS.md
├── USER_GUIDE.md                  # Living user-facing reference — updated as features ship
├── Dockerfile
├── .dockerignore
├── .gcloudignore
├── .env.example
├── .env.local                     # Local dev only — git-ignored
├── .gitignore
├── package.json
├── vite.config.js
├── index.html
└── README.md
```

## Current State

✅ Main quoting interface with service type selection
✅ State-based electrician requirement logic
✅ Material multi-select with quantity inputs
✅ Labor calculation with burden rates ($86.45 electrician, $39.90 tech)
✅ 15% material margin calculation
✅ Quote breakdown display (labor, materials, total)
✅ Service state filtering (ME, NH, RI, MA, CT, NY, NJ, MD, PA)

## Design

- **Theme**: Professional, clean interface for rapid quote generation with clear breakdown visibility
- **Fonts**: JetBrains Mono for data/numbers, Outfit for UI text

- **Visual rules**: Dark theme throughout, amber accents for primary actions, teal for positive values, clear section separation

## Data Model

### Objects
Quote (service type, state, hours, technician count, materials list, labor cost, material cost, total with margin), Service Type (name, base formula, electrician required flag), Material (SKU, name, cost, category), State Configuration (abbreviation, name, electrician licensing requirements), Labor Rate (electrician $86.45/hour, technician $39.90/hour including 33% burden).

### Relationships
Quote contains multiple Materials via quantity. State determines if electrician is required based on service type. Service Type determines base calculation method. Materials link to pricing from service pricing sheet.

### Fields to Confirm Before Going Live
Exact timeframes for temp removal pricing changes ($190 → $225 → $325),Complete list of all service types beyond the 5 common ones mentioned,Specific contract addendum language and how to systematically identify contract vintage,Full SKU mapping for all materials in the pricing sheet

### Known Data Issues
Temporary removal/reinstall pricing varies by contract signing date with three different rates ($190, $225, $325). Manual contract checking required initially. Some states (ME, NH, RI, MA, CT) require licensed electricians for any electrical/BOS work.

## Architecture Notes

Phase 1: Standalone React app with local quote generation and PDF export. Phase 2: Add backend for quote persistence, user management, and reporting. Phase 3: Salesforce integration for Case creation and customer data sync. Eventually may integrate with existing Fin Ops ticketing system.


## Multi-User Collaboration

These docs are **AI-agnostic** — they work with Claude, GPT, Gemini, Copilot, or any LLM.
- **Team**: small team


## How to Work in This Project

1. **Read in this order every session**: `.auto-memory/MEMORY.md` (follow its links) → `AGENTS.md` → `docs/memory/` (newest first) → `TODO.md` → this file → `USER_GUIDE.md` (to see the current feature surface area from the user's perspective). The project spec is distributed across these files — no single file has the complete picture. Give a brief status summary before starting work.

2. **Follow AGENTS.md.** It defines agent roles, the memory system (tiers, auto-memory, golden snapshots), and session lifecycle. Read it and follow it.

3. **Keep mock data working at all times.** Every feature must be testable with mock/demo data before live data is wired up. The mock mode should always work.

4. **Field names and API names are placeholders until confirmed.** Keep them as configurable constants. When a field name is confirmed, update the constant, write it to today's session file in `docs/memory/` as `[Tier 1]`, and update `.auto-memory/project_venture-solar-quoting-tool.md`.

5. **Design rules are not suggestions.** Dark theme throughout, amber accents for primary actions, teal for positive values, clear section separation

6. **Ambiguous or multi-step work goes through the PM agent first.** When a feature is described in business terms, scope it before building: data source needed, API calls required, UI components to build, which agents are involved, and what goes in TODO.md as follow-up. See AGENTS.md → Fast Path for when to skip PM.

7. **Write to memory incrementally.** The moment a field name is confirmed, a decision is made, or a bug is fixed — write it to today's session file in `docs/memory/YYYY-MM-DD.md`. If it's a Tier 1 fact (infra, architecture, confirmed field name, deployment state), also update the relevant `.auto-memory/` file. See AGENTS.md → Memory System for the full rules.

8. **Commit often in small chunks.** After each logical unit of work (a component, a data integration, a view), commit with a descriptive message.

9. **Memory files and TODO.md are committed to GitHub.** They are project artifacts, not ephemeral notes. Every session should end with a commit and push that includes updated memory and TODO files.

10. **Keep USER_GUIDE.md current as features ship.** `USER_GUIDE.md` is the living, user-facing reference for this product. Every time a user-facing feature ships or changes, add or update an entry in the **same commit** as the feature — name, what it does (user terms), how to use it (step-by-step), and anything important to know. When the project is done, this file is publishable as-is. See AGENTS.md → "User Guide Maintenance" for the full rules and entry template.

11. **End every session the same way.** Finalize today's session file in `docs/memory/`. If any Tier 1 context changed, update the relevant `.auto-memory/` files. If any user-facing feature shipped or changed, update `USER_GUIDE.md`. Update TODO.md, commit everything, push to GitHub, confirm what was shipped. (Ultra-fast-path fixes can bundle into the next real commit — see AGENTS.md.)

12. **Cloud Run deploys**: test locally in Docker first. `docker build -t venture-solar-quoting-tool . && docker run -p 8080:8080 venture-solar-quoting-tool`

13. **Environment variables**: `.env.local` for local dev. Set production vars via `gcloud run services update --update-env-vars` (never `--set-env-vars` — it wipes all existing vars). Never commit secrets.

## Reference Data

Labor rates: Electrician $65/hour + 33% burden = $86.45, Technician $30/hour + 33% burden = $39.90. Critter guard formula: $25 × panels + $250. Temp removal rates: $190/$225/$325 per panel based on contract date. States requiring licensed electricians: ME, NH, RI, MA, CT. Material costs from Service Pricing Template with components ranging from $157-320 for panels, $103-142 for Enphase equipment, plus mounting and electrical components.
