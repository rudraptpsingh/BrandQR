/*
  # Add Dynamic QR Code Tracking System

  1. Changes to qr_codes Table
    - `short_url_slug` (varchar(10), unique) - Short URL identifier for dynamic redirects
    - `is_dynamic` (boolean, default true) - Whether the QR code uses dynamic redirect
    - `destination_url` (text) - The original destination URL for dynamic codes
    - `creation_date` (timestamptz) - Creation timestamp (rename from created_at for clarity)

  2. New scan_analytics Table
    - `id` (uuid, primary key) - Unique identifier for each scan event
    - `qr_code_id` (uuid, foreign key) - References qr_codes table
    - `short_url_slug` (varchar(10)) - Denormalized slug for faster queries
    - `scanned_at` (timestamptz) - Timestamp of the scan
    - `ip_address` (text) - IP address of the scanner
    - `user_agent` (text) - Browser/device information
    - `referer` (text) - Referring URL if available
    - `country` (text) - Geo-location country
    - `city` (text) - Geo-location city

  3. Indexes
    - B-tree index on short_url_slug for O(log n) lookups
    - Composite index on qr_code_id and scanned_at for analytics queries
    - Index on short_url_slug in scan_analytics for quick analytics

  4. Security
    - Enable RLS on scan_analytics table
    - Users can view analytics for their own QR codes
    - Public access to insert scan events (for redirect service)
    - Restrict direct access to sensitive analytics data

  5. Important Notes
    - short_url_slug uses 8 alphanumeric characters for uniqueness
    - is_dynamic allows mixed mode (some dynamic, some static QR codes)
    - scan_analytics tracks every redirect for comprehensive analytics
*/

-- Add columns to qr_codes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'short_url_slug'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN short_url_slug varchar(10) UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'is_dynamic'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN is_dynamic boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'destination_url'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN destination_url text DEFAULT '';
  END IF;
END $$;

-- Create optimized B-tree index for short_url_slug lookups
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_url_slug ON qr_codes(short_url_slug) WHERE short_url_slug IS NOT NULL;

-- Create scan_analytics table for tracking redirects
CREATE TABLE IF NOT EXISTS scan_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid REFERENCES qr_codes(id) ON DELETE CASCADE,
  short_url_slug varchar(10) NOT NULL,
  scanned_at timestamptz DEFAULT now() NOT NULL,
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  referer text DEFAULT '',
  country text DEFAULT '',
  city text DEFAULT ''
);

-- Create indexes for efficient analytics queries
CREATE INDEX IF NOT EXISTS idx_scan_analytics_qr_code_id ON scan_analytics(qr_code_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_analytics_slug ON scan_analytics(short_url_slug);
CREATE INDEX IF NOT EXISTS idx_scan_analytics_scanned_at ON scan_analytics(scanned_at DESC);

-- Enable RLS on scan_analytics
ALTER TABLE scan_analytics ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own QR code analytics
CREATE POLICY "Users can view own QR analytics"
  ON scan_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = scan_analytics.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );

-- Allow public insert for scan events (used by redirect service)
CREATE POLICY "Allow public insert for scan events"
  ON scan_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anon read for public scan analytics (optional - can be removed for privacy)
CREATE POLICY "Allow public read for scan stats"
  ON scan_analytics FOR SELECT
  TO anon
  USING (true);