-- Add userId column to Sale table
ALTER TABLE "Sale" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 1;

-- Add userId column to Expense table
ALTER TABLE "Expense" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 1;

-- Add userId column to Medicine table
ALTER TABLE "Medicine" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 1;

-- Add userId column to LabourPayment table
ALTER TABLE "LabourPayment" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 1;

-- Rename and update Labour table: add userId, change name to unique per user
ALTER TABLE "Labour" ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Labour" DROP CONSTRAINT IF EXISTS "Labour_name_key";
ALTER TABLE "Labour" ADD CONSTRAINT "Labour_userId_name_key" UNIQUE ("userId", "name");

-- Add foreign key constraints
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "LabourPayment" ADD CONSTRAINT "LabourPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Labour" ADD CONSTRAINT "Labour_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "Sale_userId_idx" ON "Sale"("userId");
CREATE INDEX IF NOT EXISTS "Expense_userId_idx" ON "Expense"("userId");
CREATE INDEX IF NOT EXISTS "Medicine_userId_idx" ON "Medicine"("userId");
CREATE INDEX IF NOT EXISTS "LabourPayment_userId_idx" ON "LabourPayment"("userId");
CREATE INDEX IF NOT EXISTS "Labour_userId_idx" ON "Labour"("userId");
