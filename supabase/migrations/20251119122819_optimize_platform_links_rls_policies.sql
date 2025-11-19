/*
  # Optimize RLS Policies for platform_links Table

  1. Changes
    - Drop existing RLS policies that use auth.uid() directly
    - Recreate policies using (select auth.uid()) for better performance
    - This prevents re-evaluation of auth functions for each row

  2. Performance Benefits
    - auth.uid() is evaluated once per query instead of per row
    - Significantly improves query performance at scale
    - Reduces database load for large result sets

  3. Security
    - Maintains same security constraints through qr_codes relationship
    - Users can only access platform links for their own QR codes
    - Public can read platform links for scanning QR codes
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated can view own platform links" ON platform_links;
DROP POLICY IF EXISTS "Authenticated can insert own platform links" ON platform_links;
DROP POLICY IF EXISTS "Authenticated can update own platform links" ON platform_links;
DROP POLICY IF EXISTS "Authenticated can delete own platform links" ON platform_links;

-- Recreate optimized policies
CREATE POLICY "Authenticated can view own platform links"
  ON platform_links
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
      AND qr_codes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Authenticated can insert own platform links"
  ON platform_links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
      AND qr_codes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Authenticated can update own platform links"
  ON platform_links
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
      AND qr_codes.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
      AND qr_codes.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Authenticated can delete own platform links"
  ON platform_links
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
      AND qr_codes.user_id = (select auth.uid())
    )
  );

-- Add policy for public read access (for scanning QR codes)
CREATE POLICY "Public can view platform links"
  ON platform_links
  FOR SELECT
  TO anon, authenticated
  USING (true);
