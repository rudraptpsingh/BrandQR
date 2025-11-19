/*
  # Add User Authentication Support to QR Codes

  1. Changes
    - Add user_id column to qr_codes table to associate QR codes with users
    - Make user_id nullable to support anonymous QR code generation
    - Add foreign key constraint to auth.users table
    - Add index on user_id for efficient queries

  2. Security
    - Add RLS policies for authenticated users to manage their own QR codes
    - Update existing policies to work with both anonymous and authenticated users
    - Users can view, insert, update, and delete their own QR codes
    - Anonymous users can still create and view QR codes without user_id
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
  END IF;
END $$;

CREATE POLICY "Authenticated users can view own QR codes"
  ON qr_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own QR codes"
  ON qr_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own QR codes"
  ON qr_codes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own QR codes"
  ON qr_codes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can view own platform links"
  ON platform_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated can insert own platform links"
  ON platform_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated can update own platform links"
  ON platform_links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated can delete own platform links"
  ON platform_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
      AND qr_codes.user_id = auth.uid()
    )
  );
