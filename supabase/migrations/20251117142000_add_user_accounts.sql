-- User account support: tie qr_codes to auth.users and expose a public RPC for landing pages.

ALTER TABLE qr_codes
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public read access to QR codes" ON qr_codes;
  DROP POLICY IF EXISTS "Allow public insert for QR codes" ON qr_codes;
END $$;

CREATE POLICY "Users select own qr_codes"
  ON qr_codes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert qr_codes"
  ON qr_codes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own qr_codes"
  ON qr_codes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own qr_codes"
  ON qr_codes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow public read access to platform links" ON platform_links;
  DROP POLICY IF EXISTS "Allow public insert for platform links" ON platform_links;
END $$;

CREATE POLICY "Users select own platform_links"
  ON platform_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
        AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert platform_links"
  ON platform_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
        AND qr_codes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users update own platform_links"
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

CREATE POLICY "Users delete own platform_links"
  ON platform_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM qr_codes
      WHERE qr_codes.id = platform_links.qr_code_id
        AND qr_codes.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public_get_qr_payload(slug_input text)
RETURNS TABLE (
  qr_id uuid,
  title text,
  qr_type text,
  slug text,
  platforms jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.title,
    q.qr_type,
    q.slug,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'platform_type', pl.platform_type,
          'platform_value', pl.platform_value,
          'display_order', pl.display_order,
          'link_label', pl.link_label,
          'link_url', pl.link_url
        )
        ORDER BY pl.display_order
      ) FILTER (WHERE pl.id IS NOT NULL),
      '[]'::jsonb
    ) AS platforms
  FROM qr_codes q
  LEFT JOIN platform_links pl ON pl.qr_code_id = q.id
  WHERE q.slug = slug_input
  GROUP BY q.id;
END;
$$;

REVOKE ALL ON FUNCTION public_get_qr_payload(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public_get_qr_payload(text) TO anon, authenticated;
