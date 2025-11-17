-- Adds lifecycle + analytics metadata to qr_codes and introduces qr_scans table.

ALTER TABLE qr_codes
ADD COLUMN IF NOT EXISTS qr_type text NOT NULL DEFAULT 'single',
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS fallback_url text,
ADD COLUMN IF NOT EXISTS next_version jsonb,
ADD COLUMN IF NOT EXISTS next_version_at timestamptz,
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS last_health_status text NOT NULL DEFAULT 'unknown',
ADD COLUMN IF NOT EXISTS last_health_checked_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_next_version_at ON qr_codes(next_version_at);
CREATE INDEX IF NOT EXISTS idx_qr_codes_updated_at ON qr_codes(updated_at);

CREATE TABLE IF NOT EXISTS qr_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  link_label text,
  link_url text,
  country text,
  device text,
  meta jsonb DEFAULT '{}'::jsonb,
  scanned_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_code_id ON qr_scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned_at ON qr_scans(scanned_at DESC);

ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public read access to qr_scans" ON qr_scans;
  DROP POLICY IF EXISTS "Allow public insert for qr_scans" ON qr_scans;
END $$;

CREATE POLICY "Allow public read access to qr_scans"
  ON qr_scans FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert for qr_scans"
  ON qr_scans FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION set_qr_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_qr_codes_updated_at_trg ON qr_codes;
CREATE TRIGGER set_qr_codes_updated_at_trg
BEFORE UPDATE ON qr_codes
FOR EACH ROW
EXECUTE FUNCTION set_qr_codes_updated_at();
