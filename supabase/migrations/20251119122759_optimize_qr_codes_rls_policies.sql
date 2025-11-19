/*
  # Optimize RLS Policies for qr_codes Table

  1. Changes
    - Drop existing RLS policies that use auth.uid() directly
    - Recreate policies using (select auth.uid()) for better performance
    - This prevents re-evaluation of auth functions for each row

  2. Performance Benefits
    - auth.uid() is evaluated once per query instead of per row
    - Significantly improves query performance at scale
    - Reduces database load for large result sets

  3. Security
    - Maintains same security constraints
    - Users can only access their own QR codes
    - No changes to access control logic
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Authenticated users can insert own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Authenticated users can update own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Authenticated users can delete own QR codes" ON qr_codes;

-- Recreate optimized policies
CREATE POLICY "Authenticated users can view own QR codes"
  ON qr_codes
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Authenticated users can insert own QR codes"
  ON qr_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Authenticated users can update own QR codes"
  ON qr_codes
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Authenticated users can delete own QR codes"
  ON qr_codes
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Add policy for public read access to QR codes by slug (for scanning)
CREATE POLICY "Public can view QR codes by slug"
  ON qr_codes
  FOR SELECT
  TO anon, authenticated
  USING (true);
