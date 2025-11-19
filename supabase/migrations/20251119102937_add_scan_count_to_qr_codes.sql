/*
  # Add Scan Count Tracking for QR Codes

  1. Changes
    - Add `scan_count` column to qr_codes table to track total scans
    - Initialize with default value of 0
    - Add index for efficient querying by scan count

  2. Purpose
    - Track how many times a QR code has been scanned
    - Particularly useful for dynamic QR codes to show analytics
    - Allow users to see engagement metrics in their dashboard

  3. Notes
    - Scan count will be incremented via application logic or edge function
    - Static QR codes will remain at 0 scans (since they redirect directly)
    - Dynamic QR codes can be tracked when users access the landing page
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'scan_count'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN scan_count integer DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_qr_codes_scan_count ON qr_codes(scan_count DESC);
