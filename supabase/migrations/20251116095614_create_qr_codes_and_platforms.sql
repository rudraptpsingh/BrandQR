/*
  # Multi-Platform QR Code System

  1. New Tables
    - `qr_codes`
      - `id` (uuid, primary key) - Unique identifier for the QR code
      - `slug` (text, unique) - URL-friendly identifier for accessing the landing page
      - `title` (text) - Optional title for the QR code
      - `created_at` (timestamptz) - Creation timestamp
    
    - `platform_links`
      - `id` (uuid, primary key) - Unique identifier for each platform link
      - `qr_code_id` (uuid, foreign key) - References qr_codes table
      - `platform_type` (text) - Type of platform (website, instagram)
      - `platform_value` (text) - The URL or username for the platform
      - `display_order` (integer) - Order to display platforms on landing page
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on both tables
    - Allow public read access for QR code landing pages
    - Currently no user authentication, so policies allow public access

  3. Important Notes
    - Each QR code can have multiple platform links
    - The slug is used to generate the landing page URL (e.g., /qr/abc123)
    - Platform types currently supported: 'website', 'instagram'
    - Display order determines the order platforms appear on the landing page
*/

-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create platform_links table
CREATE TABLE IF NOT EXISTS platform_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  platform_type text NOT NULL,
  platform_value text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_qr_codes_slug ON qr_codes(slug);
CREATE INDEX IF NOT EXISTS idx_platform_links_qr_code_id ON platform_links(qr_code_id);

-- Enable RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_links ENABLE ROW LEVEL SECURITY;

-- Allow public read access for landing pages
CREATE POLICY "Allow public read access to QR codes"
  ON qr_codes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to platform links"
  ON platform_links FOR SELECT
  TO anon
  USING (true);

-- Allow public insert for QR generation
CREATE POLICY "Allow public insert for QR codes"
  ON qr_codes FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public insert for platform links"
  ON platform_links FOR INSERT
  TO anon
  WITH CHECK (true);
