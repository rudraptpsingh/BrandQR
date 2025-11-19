/*
  # Fix Search Path for increment_scan_count Function

  1. Changes
    - Recreate increment_scan_count function with immutable search_path
    - Set search_path to empty string to prevent mutable search path vulnerability
    - Use fully qualified table name (public.qr_codes)

  2. Security Benefits
    - Prevents potential search_path hijacking attacks
    - Ensures function always references correct schema
    - Follows PostgreSQL security best practices

  3. Functionality
    - Maintains same behavior as before
    - Still safely increments scan count atomically
    - No changes to calling code needed
*/

CREATE OR REPLACE FUNCTION increment_scan_count(qr_code_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.qr_codes
  SET scan_count = scan_count + 1
  WHERE id = qr_code_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_scan_count(uuid) TO anon;
GRANT EXECUTE ON FUNCTION increment_scan_count(uuid) TO authenticated;
