/*
  # Create Scan Count Increment Function

  1. New Function
    - `increment_scan_count(qr_code_id uuid)`
    - Safely increments the scan_count for a given QR code
    - Uses atomic operation to prevent race conditions

  2. Purpose
    - Provide a reliable way to track QR code scans
    - Ensure accurate counting even with concurrent access
    - Called when users access dynamic QR code landing pages

  3. Security
    - Function is available to anonymous users (for public QR codes)
    - Only increments count, no other modifications allowed
*/

CREATE OR REPLACE FUNCTION increment_scan_count(qr_code_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE qr_codes
  SET scan_count = scan_count + 1
  WHERE id = qr_code_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_scan_count(uuid) TO anon;
GRANT EXECUTE ON FUNCTION increment_scan_count(uuid) TO authenticated;
