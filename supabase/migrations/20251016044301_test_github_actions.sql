-- Test migration to verify GitHub Actions workflow
-- This migration doesn't change anything, just tests the deployment pipeline

-- Verify tables exist (no-op query)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'coffee_beans'
  ) THEN
    RAISE NOTICE 'GitHub Actions test migration executed successfully';
  END IF;
END $$;

