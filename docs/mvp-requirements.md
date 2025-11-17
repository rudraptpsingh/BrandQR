## MVP Requirements: Intent-Driven QR Builder

### 1. Product Framing
- Core promise: “Create a QR in under a minute—single or multi-link—with guardrails that keep it useful forever.”
- Entry question instead of raw form: _“What do you need this QR to do today?”_ with two intent cards (single link vs. multi-link bundle).
- Language across the UI references user jobs (menu, RSVP, promo bundle) rather than technical fields.

### 2. Single-Link Flow
- **Inputs**: Friendly name (optional), destination URL.
- **Guidance**: Placeholder suggestions (menu, RSVP, coupon) and helper text (“Paste any public link. We’ll check it’s safe.”).
- **Validations**: Non-empty URL, basic protocol enforcement, highlight if the domain looks malformed.
- **Output**: Direct QR that points to the normalized URL, live scannability check, CTA to copy / download / create another.
- **Lifecycle hooks**: status chip (Active by default), last-updated timestamp, fast toggle to pause (future backend support).

### 3. Multi-Link Flow
- **Inputs**: Card title (optional) plus an ordered list of links.
- **Link rows**:
  - Each row captures `Label` + `URL`.
  - “Popular presets” (Website, Instagram, RSVP, WhatsApp) prefill labels/emoji to speed up setup.
  - Drag handles or up/down buttons for ordering (initial MVP can use move up/down buttons).
  - Ability to remove rows except when only one exists.
- **Smart defaults**: If a user types a URL and leaves the label blank, auto-fill with the domain name.
- **Validations**: At least one valid URL; each URL normalized with protocol; duplicate detection warning.
- **Persistence**: Multi-link QRs are stored (slug + array of links) so landing pages remain editable later.

### 4. Lifecycle Strip (applies to both intents)
- Surface mini timeline above the preview:
  - Status pill (Active, Scheduled, Expiring, Paused).
  - “Last updated” timestamp (uses `updated_at` column once backend adds it).
  - Slot for “Next switch” showing scheduled target (MVP placeholder copy if scheduling not yet built).
- For now, we mock the UI and wire Active/Last updated based on local actions so the pattern is ready when backend fields arrive.

### 5. Insight Cards
- Lightweight cards next to the QR result:
  - `Scans this week`: placeholder number until analytics arrive; highlight expected future integration.
  - `Link health`: green check for reachable URL, warning if fetch fails (future backend hook).
  - `Top performer` (multi-link only): identifies the first link for now, later replaced with analytics data.
- Cards use friendly headlines + one actionable sentence; copy stored centrally for reuse.

### 6. Data Model / Backend Notes
- Extend `platform_links` with `link_label` and `link_url` so we can store human-readable labels and fully-qualified URLs.
- Keep existing `platform_type/platform_value` for compatibility; new inserts populate both sets of fields.
- Consider adding `qr_type`, `status`, `next_version`, `fallback_url`, `updated_at` to `qr_codes` in subsequent migrations.
- Background jobs needed later:
  - Link health checker (writes to `qr_codes.status_details`).
  - Scheduler for planned swaps.
  - Analytics aggregator for scan counts per QR/link.

### 7. UX Copy / Onboarding
- Hero subtitle: “Single spotlight link or a stack of CTAs—pick one and publish.”
- Empty states explain why each intent exists and link to blog/docs for inspiration.
- Confirmations reinforce free-forever promise and suggest upgrading later for automation/insights.

This spec should guide the immediate engineering work:
1. Build the intent selection experience and simplified forms.
2. Implement the multi-link editor + Supabase persistence for labels/URLs.
3. Add the lifecycle strip + insight card scaffolding so analytics/lifecycle data can plug in seamlessly when backend support lands.
