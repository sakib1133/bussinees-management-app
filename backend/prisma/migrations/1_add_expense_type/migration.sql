-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "expenseType" TEXT;

-- Update existing records with a default value
UPDATE "Expense" SET "expenseType" = 'Other' WHERE "expenseType" IS NULL;

-- Make expenseType required
ALTER TABLE "Expense" ALTER COLUMN "expenseType" SET NOT NULL;
