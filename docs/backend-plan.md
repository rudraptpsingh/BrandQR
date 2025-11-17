## Backend Plan: Lifecycle & Insights

### 1. Schema extensions
- `qr_codes`
  - `qr_type text` – `'single' | 'multi'`, defaults to `single` for backward compatibility.
  - `status text` – `'active' | 'paused' | 'scheduled' | 'expired'`.
  - `fallback_url text` – optional destination when a campaign ends.
  - `next_version jsonb` – pending payload describing the upcoming destination(s).
  - `next_version_at timestamptz` – when to promote `next_version`.
  - `updated_at timestamptz` – auto-maintained for lifecycle strip.
  - `last_health_status text` / `last_health_checked_at timestamptz` – results from link checks.
- `qr_scans`
  - Stores per-scan events (QR id, resolved link, geo/device metadata, timestamp) to drive trends/anomalies.
  - Works with Supabase Edge Functions/webhooks for ingestion.

### 2. Lifecycle automation
1. **Scheduled swaps**
   - Store the desired payload in `next_version`.
   - Background job runs minutely: promotes payload to active platforms and clears schedule.
   - If no upcoming version, status stays `active`.
2. **Fallback handling**
   - When a QR is paused or expires, redirect service uses `fallback_url` (e.g., info splash) instead of failing.
3. **Status refresh**
   - Trigger updates `updated_at` whenever `qr_codes` row changes.
   - Jobs mutate `status` to `scheduled`, `expiring`, etc., so the UI reflects lifecycle state.

### 3. Link health guardrails
- Worker reads latest destinations (single URL or per-link stack).
- Performs HEAD/GET with timeout, respecting CORS via server-side fetch.
- Results persisted to `last_health_status` (`healthy`, `warning`, `error`) plus timestamp.
- UI displays these values inside the insight card; alerts fire if status flips to `error`.

### 4. Analytics ingestion
- **Capture path**: landing page calls lightweight pixel (`/api/scan`) with slug + optional link metadata.
- **Storage**: insert into `qr_scans`; optionally aggregate into daily rollups for faster dashboards.
- **Insights** driven from queries:
  - Scans this week vs. last.
  - Top link (multi) using `count(*) GROUP BY link_label`.
  - Geo/device breakdown using `country`, `device`.

### 5. Security & policies
- Enable RLS on `qr_scans` with `SELECT` + `INSERT` for `anon` until auth is introduced.
- Keep existing public policies on `qr_codes`/`platform_links`; future enterprise plans can scope via service role.

### 6. Open tasks
- Build Supabase Edge Function (or Vercel cron) for scheduled swaps + health checks.
- Add `/api/scan` endpoint (serverless function or Supabase function) that:
  - Validates slug, resolves active link.
  - Writes scan event.
  - Returns redirect response for scanners that support HTTP.
- Extend landing page to invoke the tracker via `useEffect`.

This plan ensures lifecycle metadata, health signals, and scan analytics exist in the data layer so the current UI scaffolding can light up as soon as the services land.
