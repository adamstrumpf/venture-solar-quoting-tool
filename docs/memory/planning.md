# Planning Memory — 2026-06-05
**Contributor**: Project creator (via Ignition planning session)
**Session type**: Initial brainstorm and project definition

---

## What We're Building

We're building a **standardized quoting tool** for Venture Home Solar's post-install service division. When a customer calls in requesting work after their solar system has been installed — things like adding critter guards, temporarily removing panels for roof repairs, replacing damaged equipment, or reconnecting a system after the customer had their own electrical work done — a customer service rep or project manager needs to generate an accurate, professional quote on the spot.

Right now, this process is a mess. Some service types have established formulas (critter guards = $25 × panels + $250), but many don't. For anything non-standard, the rep creates a Case, escalates to a manager, the manager invents a price, and then they route through Fin Ops for invoicing. Different team members quote wildly different prices for the same work. The tool eliminates this inconsistency by encoding pricing logic — labor rates, material costs, state-specific electrician requirements, and profit margins — into a clean web interface that spits out a professional PDF quote.

The MVP is deliberately scoped to **just the quoting engine**: no Salesforce integration, no payment collection, no scheduling. Those are future phases. The goal is to get the pricing math right, make it fast for reps to use during a live call, and produce a quote document that looks professional on Venture Home letterhead with a clear breakdown of labor and materials.

The tool also includes a **"Request New Formula" workflow** so that when users encounter service types that aren't yet templated, they can submit a structured request to the admin (the project creator) for review and eventual addition to the system.

## Why We're Building It

**Inconsistent pricing is costing the company money.** When different team members quote different prices for identical work, Venture Home either loses revenue (quoting too low) or loses customers (quoting too high). There's no margin discipline — custom quotes sometimes don't account for burden costs, material markups, or the premium for licensed electricians in certain states.

**The current process has too many handoffs.** Inbound call → Case creation → manager consultation → custom quote creation → Fin Ops ticket → invoice → payment → scheduling. This tool collapses the first four steps into one: the rep generates the quote during the call.

**Post-install services are a revenue opportunity.** Every critter guard installation, every panel removal for roof work, every system reconnection is billable work. Standardizing pricing with proper margins (15% on materials, 33% burden on labor) ensures these services are consistently profitable.

**If this works**, Venture Home has a foundation for a complete post-install service command center — eventually integrating with Salesforce for Case creation, automating Fin Ops tickets, tracking quote-to-close rates, and surfacing service revenue analytics.

## Decisions Made

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| **Architecture** | Standalone React app (no Salesforce integration in v1) | Keep scope tight; Salesforce integration adds auth complexity, API rate limits, and data sync issues. Prove the quoting engine first. |
| **Frontend framework** | React with Vite | Fast dev server, simple setup, team familiarity assumed. |
| **Styling approach** | Inline styles with design tokens | No CSS framework needed for this scope. Dark theme with amber accents, teal for positive values. Keeps styling co-located with components. |
| **Fonts** | JetBrains Mono (data/numbers), Outfit (UI text) | Mono font makes dollar amounts and calculations scannable; Outfit is clean and modern for labels/descriptions. |
| **Margin structure** | Split application — 33% burden on labor rates, 15% markup on materials | Looks more professional to customers than a single "profit margin" line item. Labor rates appear as clean numbers ($86.45, $39.90) rather than base rate + visible markup. |
| **Labor estimation** | Manual input by rep (hours + technician count) | Job duration varies wildly based on system size, roof pitch, complexity, access. Human judgment is better than a formula here. |
| **Material selection** | System-based (quantity input, not SKU-level selection) | Rep enters "3 panels" and the system calculates average material costs per panel. Way simpler than asking reps to identify specific SKUs during a call. |
| **Custom quote handling** | "Request New Formula" button → email to admin | Captures the need in the moment, routes through proper review. No self-service formula creation — too risky. |
| **PDF output** | Professional quote with line-item breakdown on Venture Home letterhead | Customers see Labor, Materials, Total. Transparent but doesn't expose internal cost/margin details. |
| **Hosting target** | GCP Cloud Run | Lightweight, scales to zero, simple deployment. |
| **Data persistence** | Not in MVP (quote is generated and exported as PDF) | Phase 2 adds backend for persistence, user management, and reporting. |

## MVP Scope

### In Scope (v1)

1. **Service type selector** — dropdown with 6 options:
   - Critter Guards (formula: $25 × panels + $250)
   - Temp Removal/Reinstall for Roof Work (default $325/panel, manual override per contract addendum)
   - BOS Repair for Siding
   - System Reconnection
   - Panel/Inverter Replacement
   - Custom Service (triggers "Request New Formula" flow)

2. **State selector** — dropdown with 9 states: ME, NH, RI, MA, CT, NY, NJ, MD, PA
   - Automatically flags when licensed electrician is required (MA, ME, RI, NH, CT) for electrical/BOS work

3. **Labor inputs** (shown for non-formula services):
   - Estimated hours (manual input, 0.5 increments)
   - Technician count (1 or 2)
   - Auto-selects electrician vs. tech rate based on state + service type

4. **Materials multi-select** with quantity (shown for non-formula services):
   - Solar Panels
   - Inverters/Microinverters
   - Wiring/Conduit
   - Other Components
   - Quantities derived from panel count input (system-based calculation)

5. **Pricing engine** — calculates:
   - Labor: hours × technicians × hourly rate (with 33% burden baked in)
   - Materials: component costs from price sheet averages × quantity × 1.15 (15% margin)
   - Total: labor + materials

6. **Quote preview** — live breakdown showing labor cost, material cost, total

7. **PDF generation** — professional document on Venture Home letterhead with:
   - Service type and description
   - State and panel count
   - Line-item breakdown (Labor, Materials, Total)
   - Standard terms (e.g., "Quote valid for 30 days", "Payment required before work begins")

8. **Electrician requirement alert** — visual indicator when state requires licensed electrician

9. **"Request New Formula" button** — for Custom Service type, triggers a structured form (service description, estimated materials/labor, special considerations) that sends an email to the admin for review

### Explicitly Out of Scope (v1)

- Salesforce integration (Case creation, customer data lookup, system details pull)
- Fin Ops ticket auto-generation
- Payment collection
- Scheduling/appointment creation
- Equipment ordering
- User authentication / role-based access
- Quote persistence / database storage
- Reporting dashboard (quote volumes, revenue, trends)
- Manager approval workflows (beyond the email-based formula request)
- Contract addendum lookup (manual checking required)
- SKU-level material selection

## Data Model

### Quote (generated, not persisted in v1)
| Field | Type | Notes |
|-------|------|-------|
| `serviceType` | string | One of 6 predefined types |
| `state` | string | 2-letter state abbreviation |
| `panelQuantity` | integer | Number of panels (min: 1) |
| `estimatedHours` | float | Manual input, 0.5 increments |
| `technicianCount` | integer | 1 or 2 |
| `materials` | string[] | Multi-select from 4 categories |
| `requiresElectrician` | boolean | **Derived** from state + service type |
| `laborCost` | float | **Calculated** |
| `materialCost` | float | **Calculated** with 15% margin |
| `totalQuote` | float | **Calculated** sum |

### Service Type (hardcoded configuration)
| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name |
| `formulaType` | string | `"fixed_formula"`, `"labor_plus_materials"`, or `"custom"` |
| `electricianRequired` | boolean | Whether this service involves electrical work |
| `baseFormula` | function/null | For critter guards, temp removal — specific calculation |

### Material Category (hardcoded configuration)
| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name |
| `averageCostPerUnit` | float | Averaged from price sheet — **confirmed values below** |
| `quantityDerivation` | string | How quantity relates to panel count |

### State Configuration (hardcoded)
| Field | Type | Notes |
|-------|------|-------|
| `abbreviation` | string | 2-letter code |
| `requiresLicensedElectrician` | boolean | MA, ME, RI, NH, CT = true; others = false |

### Labor Rate (hardcoded constants)
| Role | Base Rate | Burden (33%) | Effective Rate |
|------|-----------|-------------|----------------|
| Licensed Electrician | $65.00/hr | $21.45 | **$86.45/hr** |
| Solar Service Technician | $30.00/hr | $9.90 | **$39.90/hr** |

## Fields & API Names to Confirm

- [ ] **Material average costs** — Current values derived from price sheet averages. Need to verify these are the right averages to use:
  - Solar Panels: $238.50 (averaged from Jasolar $157 to Hanwha $320)
  - Inverters/Microinverters: $122.50 (averaged from Enphase range $103–$142)
  - Wiring/Conduit: $45.00 per panel-worth (assumed from THHN/conduit pricing)
  - Other Components: $25.00 (assumed baseline for misc mounting hardware)
- [ ] **Critter Guard formula** — Confirmed as $25 × panels + $250, universal across all states
- [ ] **Temp Removal default rate** — Confirmed as $325/panel (current rate), with $190 and $225 as historical rates
- [ ] **Electrician-required states** — Confirmed: MA, ME, RI, NH, CT
- [ ] **Service states list** — Currently ME, NH, RI, MA, CT, NY, NJ, MD, PA — confirm this is the complete list of states Venture Home operates in
- [ ] **Burden percentage** — Confirmed as 33% (covers insurance, 401k, workers comp)
- [ ] **Material margin** — Confirmed as 15%
- [ ] **Technician count options** — Currently 1 or 2 — confirm whether 3+ is ever needed
- [ ] **PDF terms and conditions** — Need exact language for quote validity period, payment terms, disclaimers
- [ ] **Venture Home letterhead** — Need logo file, brand colors, address for PDF header
- [ ] **"Request New Formula" email recipient** — Confirm email address
- [ ] **Service type descriptions** — Need customer-facing descriptions for each service type to include on PDF

## Integrations

### Email (Request New Formula)
- **What it does**: Sends structured service request to admin when a user selects "Custom Service" and fills out the formula request form
- **Auth**: TBD — could use a simple email API (SendGrid, AWS SES, or even a mailto link for MVP)
- **Setup needed**: Email API credentials or admin email address
- **Unknown**: Whether this should be a proper email integration or just a mailto link with pre-populated fields for v1

### PDF Generation
- **What it does**: Generates a professional PDF quote on Venture Home letterhead
- **Auth**: None (client-side generation)
- **Setup needed**: PDF library (likely jsPDF or react-pdf), Venture Home logo asset, brand guidelines
- **Unknown**: Exact letterhead design, whether to include terms & conditions, legal disclaimers

### Future: Salesforce (Phase 3)
- **What it would do**: Pull customer info, system details (panel count, equipment type), auto-create Cases with quote details
- **Not needed for MVP** — keeping standalone for now

### Future: Fin Ops Ticketing System
- **What it would do**: Auto-generate out-of-pocket payment tickets
- **Timeline unknown** — depends on what system Fin Ops uses

## Technical Architecture

### Phase 1 (MVP) — Standalone Client-Side App
```
React (Vite) → Client-side pricing engine → PDF generation → Download
```
- All pricing logic lives in the frontend as configuration objects
- No backend, no database, no auth
- Quote is calculated in real-time as inputs change
- PDF generated client-side using jsPDF or similar
- Deployed to GCP Cloud Run as a static site (or Cloud Storage + CDN)

### Phase 2 — Add Backend for Persistence & Reporting
```
React → Express/FastAPI backend → PostgreSQL/Firestore
```
- Store every generated quote for analytics
- Add user authentication (who generated which quotes)
- Build reporting dashboard:
  - Total quotes generated / total value / breakdown by service type
  - Average quote value by state
  - Most common service requests
  - Month-over-month trends
- Add admin panel for managing pricing formulas, material costs, labor rates

### Phase 3 — Salesforce Integration
```
React → Backend → Salesforce API
```
- Pull customer data to pre-populate quotes
- Auto-create Cases with quote details attached
- Pre-populate Fin Ops ticket details
- Show system details (panel count, equipment type, contract date) to streamline quoting

### Key Architectural Decisions

**Why client-side pricing engine?** The pricing formulas are simple arithmetic. There's no security concern with exposing them (they're specific to Venture Home's internal tool). Client-side calculation means instant feedback — no API latency. When we add a backend in Phase 2, we'll duplicate the calculation server-side for persistence but keep client-side for UX.

**Why not start with a backend?** The value proposition is the quoting interface and pricing logic, not data persistence. Getting a backend right (auth, database schema, API design) would double the MVP timeline for features that aren't needed yet.

**Why GCP Cloud Run?** Scales to zero (low cost for internal tool with intermittent usage), simple container deployment, easy to add a backend later in the same service.

## Known Challenges & Open Questions

### 1. Temp Removal/Reinstall Contract Pricing
**Problem**: Historical pricing changed from $190 → $225 → $325 per panel, but exact date cutoffs are unknown. The tool defaults to $325 but the signed contract addendum ("Venture Solar System Removal Addendum for Residential PV Systems") takes precedence.

**Options**:
- **(Chosen for MVP)** Default to $325, display a note: "Check customer's signed addendum — contract rate overrides this quote." Let the rep manually override.
- **(Phase 2)** Add a dropdown: "Contract vintage: Pre-2022 ($190) / 2022-2023 ($225) / Current ($325)" once date ranges are confirmed.
- **(Phase 3)** Pull contract date from Salesforce and auto-select the rate.

### 2. Material Cost Accuracy
**Problem**: The price sheet contains specific SKUs with varying costs (panels range $157–$320, inverters $103–$142). Using averages simplifies the UI but may over/under-quote for specific equipment.

**Options**:
- **(Chosen for MVP)** Use averaged costs per category. Acceptable because the 15% margin provides a buffer.
- **(Phase 2)** Add equipment brand/model selection that narrows cost estimates.
- **(Future)** Pull installed equipment details from Salesforce to use exact replacement costs.

### 3. Material Cost Updates
**Problem**: Component prices change. The tool needs a systematic way to update pricing without code changes.

**Options**:
- **(MVP)** Hardcoded in source — update via code deployment.
- **(Phase 2)** Admin panel with editable pricing tables stored in database.
- **(Phase 2 alt)** CSV upload that updates pricing from a spreadsheet.

### 4. PDF Professional Quality
**Problem**: Client-side PDF generation (jsPDF) can produce mediocre-looking documents. The quote needs to look professional with Venture Home letter