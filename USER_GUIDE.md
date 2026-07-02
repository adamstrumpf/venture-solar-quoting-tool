# venture-solar-quoting-tool — User Guide

> A standardized quoting tool for Venture Home Solar's post-install service work, replacing inconsistent manual pricing with automated calculations based on labor rates, materials, and state requirements.

This is the user-facing guide for **venture-solar-quoting-tool**. It documents every feature in the product — what it does, how to use it, and anything important to know about it. When the project is finished, this file is intended to be publishable as-is: paste it into a help center, a README, an onboarding doc, or share it directly with users.

---

## 🤖 For AI Tools Maintaining This File

**This file is NOT optional documentation.** Keeping it current is part of shipping a feature. Before marking any feature "done":

1. **Add a new entry** under _Features_ using the template below
2. **Update the Table of Contents** with a link to the new section
3. **Remove or update** any entry that is being replaced or deprecated
4. **Commit the USER_GUIDE update** in the same commit as the feature itself — not as a separate follow-up

### When to add or update an entry

Add a new entry when:
- A new feature ships that a user can see, click, or interact with
- A new workflow is introduced (sign up, import data, export report, etc.)
- A new setting, preference, or configuration option becomes available
- A new integration is wired up that the user can enable or configure

Update an existing entry when:
- The UI for a feature changes in a way that affects how users interact with it
- Behavior changes (new rules, new defaults, new limits)
- A known limitation is fixed — remove the caveat
- A new limitation is discovered — add a caveat

Remove an entry when:
- A feature is deprecated or removed from the product
- A feature is merged into another feature (consolidate into the surviving entry)

### Writing style for entries

- **Write for the user, not for yourself.** "Click _Export_ to download your data as CSV." Not: "The export handler is wired to the download endpoint."
- **Use present tense and active voice.** "The dashboard shows..." not "The dashboard will show..."
- **Name UI elements exactly as they appear.** If the button says "Export Data", use that label — don't call it "the export option".
- **Keep it concise.** Two to four short paragraphs per feature is usually enough. Link to more detail if needed.
- **No implementation details.** Users don't need to know which API you're calling or what component renders the view. Save that for `PROJECT_INSTRUCTIONS.md` and `docs/memory/`.
- **Screenshots are welcome** — drop them into `docs/screenshots/` and link them inline.

### Entry template (copy this for each new feature)

```markdown
### [Feature Name]

**What it does:** One or two sentences describing the purpose of the feature in user terms.

**How to use it:**
1. Step-by-step instructions a user can follow
2. Name buttons and fields exactly as they appear in the UI
3. Note any prerequisites (e.g. "you must be signed in", "your account must have admin access")

**Good to know:**
- Any limitations, edge cases, or gotchas a user should be aware of
- Keyboard shortcuts or power-user tips
- Known issues, if any, with a link to the tracking item

**Added:** YYYY-MM-DD · **Last updated:** YYYY-MM-DD
```

### When the project is "done"

Before shipping the product publicly, a final pass on this file should:
1. Remove this entire "For AI Tools" section (everything between the 🤖 header and the _Getting Started_ section below)
2. Rewrite the intro at the top to speak directly to the end user
3. Verify every feature entry is accurate and well-written
4. Add screenshots for any feature that benefits from visual reference
5. Publish

---

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#features)
  - [Generate a Quote](#generate-a-quote)
  - [Download a PDF Quote](#download-a-pdf-quote)
- [FAQ](#faq)
- [Support](#support)

---

## Getting Started

_Replace this section when the product has a real first-run experience. For now, it's a placeholder._

To start using **venture-solar-quoting-tool**:

1. [Step one — e.g., "Go to [url]" or "Download and install the app"]
2. [Step two — sign up, connect a data source, configure something]
3. [Step three — you're ready to go]

---

## Features

_As features ship, add a new `###` section here using the template in the "For AI Tools" section above. Keep the newest feature at the top of this list, or organize by category — whichever makes the guide easier to navigate._

### Generate a Quote

**What it does:** Calculates a standardized price for a post-install service job based on the service type, state, panel count, labor, and materials — so every rep quotes the same job the same way.

**How to use it:**
1. Open the app.
2. Under **Quote Details**, choose a **Service Type** and enter the **Customer Address** (both required).
3. Enter the **Number of Panels**.
4. For labor-based services, set **Estimated Hours**, choose the number of **Technicians**, and check any **Materials Needed**.
5. Click **Generate Quote**. The **Quote Preview** on the right shows the labor, materials, and total.

**Good to know:**
- The **Customer Address** field offers Google address suggestions as you type (when the Google Maps key is configured) — pick one to avoid typos. The app reads the state from the address automatically in the background for pricing; if the address is outside Venture's service area (ME, NH, RI, MA, CT, NY, NJ, MD, PA) or is missing a state/ZIP, a short note appears under the field.
- All fields in Quote Details are required.
- Critter Guards and Temp Removal/Reinstall use fixed per-panel formulas, so the hours/technicians/materials fields are hidden for them.
- If the detected state requires a licensed electrician for the selected service (ME, NH, RI, MA, CT), the app shows an alert and prices labor at the electrician rate automatically.
- Service types are: Critter Guards, Temp Removal/Reinstall for Roof Work, BOS Repair for Siding, Component Replacement, and Custom Service.

**Added:** 2026-07-02 · **Last updated:** 2026-07-02

### Download a PDF Quote

**What it does:** Produces a clean, branded Venture Home quote you can save as a PDF or print — with a letterhead, quote number, date, line-item breakdown, and total — ready to email to a customer.

**How to use it:**
1. Generate a quote (see above).
2. In the **Quote Preview**, click **Generate PDF Quote**.
3. Your browser's print dialog opens. Choose **Save as PDF** as the destination (or pick a printer), then save.

**Good to know:**
- Each quote gets an automatic quote number (format `VH-YYYYMMDD-HHMM`) and today's date.
- The quote states it is an estimate valid for 30 days and that final pricing may vary with site conditions.
- No file is stored on a server — the PDF is generated in your browser at the moment you click.

**Added:** 2026-07-02 · **Last updated:** 2026-07-02

---

## FAQ

_Add common questions as they come up from real users._

---

## Support

_Replace with real support channels when the product has them._

- Email: [support@example.com]
- Docs: [link to full documentation]
- Issues: [link to issue tracker]

---

_This guide is maintained alongside the codebase. Last revised: 2026-06-05._
