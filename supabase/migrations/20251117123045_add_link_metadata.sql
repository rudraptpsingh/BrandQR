-- Adds explicit metadata for multi-link landing pages
ALTER TABLE platform_links
ADD COLUMN IF NOT EXISTS link_label text DEFAULT '',
ADD COLUMN IF NOT EXISTS link_url text DEFAULT '';

-- Backfill label data for legacy rows
UPDATE platform_links
SET link_label = CASE
  WHEN link_label IS NOT NULL AND link_label <> '' THEN link_label
  WHEN platform_type = 'website' THEN 'Visit Website'
  WHEN platform_type = 'instagram' THEN 'Instagram'
  ELSE COALESCE(platform_type, 'Link')
END
WHERE link_label IS NULL OR link_label = '';

-- Backfill normalized URLs for legacy rows
UPDATE platform_links
SET link_url = CASE
  WHEN link_url IS NOT NULL AND link_url <> '' THEN link_url
  WHEN platform_type = 'instagram' THEN
    'https://instagram.com/' || regexp_replace(platform_value, '^@', '')
  WHEN platform_type = 'website' AND platform_value NOT LIKE 'http%' THEN
    'https://' || platform_value
  ELSE platform_value
END
WHERE link_url IS NULL OR link_url = '';

-- Ensure NULLs are not left hanging after ALTER defaults
ALTER TABLE platform_links
ALTER COLUMN link_label SET DEFAULT '',
ALTER COLUMN link_url SET DEFAULT '';
