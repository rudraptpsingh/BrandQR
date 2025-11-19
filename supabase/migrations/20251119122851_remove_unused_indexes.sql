/*
  # Remove Unused Indexes

  1. Changes
    - Drop idx_qr_codes_slug (unused, slug lookups work fine without it)
    - Drop idx_qr_codes_user_id (covered by RLS policies and foreign key)
    - Drop idx_qr_codes_scan_count (not needed for current query patterns)

  2. Benefits
    - Reduces storage overhead
    - Improves INSERT/UPDATE/DELETE performance
    - Simplifies index maintenance
    - No impact on query performance (indexes are unused)

  3. Notes
    - Indexes can be recreated later if usage patterns change
    - PostgreSQL's default indexes on primary/foreign keys remain
    - RLS policies still function efficiently with existing indexes
*/

DROP INDEX IF EXISTS idx_qr_codes_slug;
DROP INDEX IF EXISTS idx_qr_codes_user_id;
DROP INDEX IF EXISTS idx_qr_codes_scan_count;
