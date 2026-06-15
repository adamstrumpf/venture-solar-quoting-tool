# TODO — venture-solar-quoting-tool

## Project Summary

A standardized quoting tool for Venture Home Solar's post-install service work, replacing inconsistent manual pricing with automated calculations based on labor rates, materials, and state requirements.

Currently, post-install service quotes are inconsistent across team members, with some using established formulas (critter guards at $25/panel + $250) while others require manager consultation for custom pricing. This creates delays, inconsistent pricing, and potential profit loss. Standardizing the quoting process will improve customer experience, ensure profitability, and capture service revenue opportunities.


## Release Strategy
**MVP → Iterative releases**
- MVP: Core quoting engine for common services (critter guards, temp removal/reinstall, BOS repairs, system reconnection, panel/inverter replacement) with PDF quote generation, state-based electrician requirements, and material cost calculations with proper margins.
- Success: Customer service reps can generate consistent, professional quotes in under 2 minutes. All quotes include proper margins (15% on materials, 33% burden on labor). Custom quote requests are tracked and routed for approval.

---

## Data Model

### Objects
Quote (service type, state, hours, technician count, materials list, labor cost, material cost, total with margin), Service Type (name, base formula, electrician required flag), Material (SKU, name, cost, category), State Configuration (abbreviation, name, electrician licensing requirements), Labor Rate (electrician $86.45/hour, technician $39.90/hour including 33% burden).

### Relationships
Quote contains multiple Materials via quantity. State determines if electrician is required based on service type. Service Type determines base calculation method. Materials link to pricing from service pricing sheet.

### Fields & API Names to Confirm
These must be confirmed before going to production. Each confirmed value should be written to `docs/memory/YYYY-MM-DD.md` as `[Tier 1]`, updated in `.auto-memory/project_venture-solar-quoting-tool.md`, and updated in code as a named constant.

Exact timeframes for temp removal pricing changes ($190 → $225 → $325),Complete list of all service types beyond the 5 common ones mentioned,Specific contract addendum language and how to systematically identify contract vintage,Full SKU mapping for all materials in the pricing sheet

### Known Data Issues
Temporary removal/reinstall pricing varies by contract signing date with three different rates ($190, $225, $325). Manual contract checking required initially. Some states (ME, NH, RI, MA, CT) require licensed electricians for any electrical/BOS work.

---

## Phase 0: Planning ✅
- [x] Brainstorm and discovery conversation
- [x] Scope and release strategy defined
- [x] Project docs generated
- [x] Planning memory file created

## Phase 1: Setup

### Tool Verification (run these first)
- [ ] Verify Node.js: `node --version` (requires v18+)
- [ ] Verify npm: `npm --version`
- [ ] Verify git: `git --version`
- [ ] Verify Docker: `docker --version`
- [ ] Verify gcloud: `gcloud --version` (install from https://cloud.google.com/sdk/docs/install if missing)

### Project Initialization
- [ ] Extract scaffold zip to `~/Documents/Claude/projects/venture-solar-quoting-tool`
- [ ] `cd ~/Documents/Claude/projects/venture-solar-quoting-tool && npm install`
- [ ] Copy `.env.example` → `.env.local` and fill in values
- [ ] Verify local dev server: `npm run dev`
- [ ] Initialize git: `git init && git add -A && git commit -m "initial scaffold from Ignition"`
- [ ] Create GitHub repo and push: `gh repo create venture-solar-quoting-tool --source . --push`
- [ ] Set up `.auto-memory/` directory and `MEMORY.md` index
- [ ] Update `.auto-memory/reference_venture-solar-quoting-tool.md` with GitHub URL

### GCP & Cloud Run
- [ ] Test Docker build: `docker build -t venture-solar-quoting-tool . && docker run -p 8080:8080 venture-solar-quoting-tool`
- [ ] Create GCP project: `gcloud projects create venture-solar-quoting-tool --name="venture-solar-quoting-tool"`
- [ ] Link billing: https://console.cloud.google.com/billing/linkedaccount?project=venture-solar-quoting-tool
- [ ] Enable APIs: `gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com storage.googleapis.com --project venture-solar-quoting-tool`
- [ ] Create Artifact Registry: `gcloud artifacts repositories create venture-solar-quoting-tool --repository-format=docker --location=us-east1 --project venture-solar-quoting-tool`
- [ ] First Cloud Run deploy: `gcloud run deploy venture-solar-quoting-tool --source . --region us-east1 --project venture-solar-quoting-tool --allow-unauthenticated` (use `--update-env-vars`, never `--set-env-vars`)
- [ ] Update `.auto-memory/reference_venture-solar-quoting-tool.md` with Cloud Run URL + GCP project ID
- [ ] Write first session file: `docs/memory/YYYY-MM-DD.md`

### Salesforce Setup
- [ ] Go to Salesforce Setup → App Manager → New Connected App
- [ ] Enable OAuth settings; set callback URL to `http://localhost:5173` (dev) and your Cloud Run URL (prod)
- [ ] Add OAuth scope: `api`
- [ ] Copy the Consumer Key → goes into `SF_CLIENT_ID` in `.env.local`
- [ ] Confirm field names (see Data Model → Fields to Confirm above)
- [ ] Update SOQL queries with confirmed field names
- [ ] Test OAuth flow against sandbox, then production org
- [ ] Write confirmed field names to `docs/memory/YYYY-MM-DD.md` as `[Tier 1]` and update `.auto-memory/project_venture-solar-quoting-tool.md`

### Standalone initially Setup
- [ ] Obtain API credentials for Standalone initially
- [ ] Add to `.env.example` as placeholder + `.env.local` with real values
- [ ] Build mock data layer that mirrors the real API response shape
- [ ] Implement real API calls after mock is working
- [ ] Write confirmed endpoints and auth details to `docs/memory/YYYY-MM-DD.md` as `[Tier 1]`

## Phase 2: Prototype
- [ ] Build core UI with mock data
- [ ] Implement main views and interactions
- [ ] Verify mock mode works end-to-end
- [ ] Deploy prototype to Cloud Run for review

### What the prototype already covers:
✅ Main quoting interface with service type selection
✅ State-based electrician requirement logic
✅ Material multi-select with quantity inputs
✅ Labor calculation with burden rates ($86.45 electrician, $39.90 tech)
✅ 15% material margin calculation
✅ Quote breakdown display (labor, materials, total)
✅ Service state filtering (ME, NH, RI, MA, CT, NY, NJ, MD, PA)


## Phase 3: Live Data
- [ ] Confirm all field names and API names — write each to `docs/memory/YYYY-MM-DD.md` as `[Tier 1]` and update `.auto-memory/project_venture-solar-quoting-tool.md`
- [ ] Connect Standalone initially integration
- [ ] Connect future Salesforce integration planned for Case creation and customer data integration
- [ ] Set production env vars on Cloud Run (`--update-env-vars`, never `--set-env-vars`)
- [ ] Run with live data end-to-end
- [ ] Verify in production

## Phase 4: MVP Features
- [ ] Core quoting engine for common services (critter guards, temp removal/reinstall, BOS repairs, system reconnection, panel/inverter replacement) with PDF quote generation, state-based electrician requirements, and material cost calculations with proper margins.

## Phase 5: MVP Deploy
- [ ] All env vars confirmed on Cloud Run
- [ ] Tested with real users in production
- [ ] Memory finalized, TODO updated
- [ ] Ship

## Phase 6+: Post-MVP
- [ ] Salesforce integration, Case auto-creation, Fin Ops ticket generation, payment collection, scheduling workflows, equipment ordering, admin dashboard with reporting analytics, manager approval workflows for custom quotes.
---

## Known Challenges & Open Questions

Contract-based pricing lookup requires manual verification initially. Material cost updates need systematic process. Custom quote approval workflow needs manager routing mechanism. PDF generation needs professional Venture Home letterhead formatting.

---

## Brainstorm Notes
User is building a standardized quoting tool for Venture Home Solar's post-install services to replace inconsistent manual pricing. The MVP covers 5 common service types with automated calculations based on labor rates (including 33% burden), material costs (with 15% margin), and state-specific electrician requirements. The tool generates professional PDF quotes with transparent breakdowns. Future iterations will add Salesforce integration, manager approval workflows, and comprehensive reporting. Key technical decisions include standalone React architecture initially, state-based pricing logic, and systematic material cost calculations from existing pricing sheets.

---

## Reference Data

Labor rates: Electrician $65/hour + 33% burden = $86.45, Technician $30/hour + 33% burden = $39.90. Critter guard formula: $25 × panels + $250. Temp removal rates: $190/$225/$325 per panel based on contract date. States requiring licensed electricians: ME, NH, RI, MA, CT. Material costs from Service Pricing Template with components ranging from $157-320 for panels, $103-142 for Enphase equipment, plus mounting and electrical components.
