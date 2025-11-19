/*
  # Add QR Code Type and Content Fields

  1. Changes
    - Add `qr_type` column to qr_codes table to distinguish between different QR code types
      - Possible values: 'multi-platform', 'single-url', 'text', 'wifi'
    - Add `qr_content` column to store the raw content/data for single codes
    - Add `qr_image_data` column to store the generated QR code image as base64
    - Add `logo_data` column to store the logo image if uploaded
    - Add `qr_color` column to store custom QR code color
    - These fields enable saving and restoring single URL/Text/Wi-Fi QR codes
    
  2. Purpose
    - Allow logged-in users to save their single QR codes to database
    - Enable users to access their saved QR codes after refresh
    - Store complete QR code configuration including styling and logo
    
  3. Notes
    - For multi-platform codes, qr_type will be 'multi-platform' and platform_links table is used
    - For single codes, qr_type will be the specific type and qr_content stores the data
    - qr_image_data stores the complete generated QR code (with logo if applicable)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'qr_type'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN qr_type text DEFAULT 'multi-platform';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'qr_content'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN qr_content text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'qr_image_data'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN qr_image_data text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'logo_data'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN logo_data text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'qr_color'
  ) THEN
    ALTER TABLE qr_codes ADD COLUMN qr_color text DEFAULT '#000000';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id_type ON qr_codes(user_id, qr_type);
