-- Drop the old createdBy column from Sale table (no longer needed, using userId instead)
ALTER TABLE "Sale" DROP COLUMN IF EXISTS "createdBy";
