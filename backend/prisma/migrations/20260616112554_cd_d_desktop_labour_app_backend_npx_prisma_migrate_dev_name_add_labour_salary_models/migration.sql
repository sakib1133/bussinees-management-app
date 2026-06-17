/*
  Warnings:

  - You are about to drop the column `date` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Medicine` table. All the data in the column will be lost.
  - Added the required column `medicineName` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseDate` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasedBy` to the `Medicine` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Labour" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SalaryRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "labourId" INTEGER NOT NULL,
    "salaryAmount" REAL NOT NULL,
    "periodFromDate" DATETIME NOT NULL,
    "periodToDate" DATETIME NOT NULL,
    "paymentDate" DATETIME NOT NULL,
    "paidAmount" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalaryRecord_labourId_fkey" FOREIGN KEY ("labourId") REFERENCES "Labour" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Medicine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "medicineName" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "purchaseDate" DATETIME NOT NULL,
    "purchasedBy" TEXT NOT NULL,
    "quantity" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Medicine" ("amount", "createdAt", "id", "updatedAt") SELECT "amount", "createdAt", "id", "updatedAt" FROM "Medicine";
DROP TABLE "Medicine";
ALTER TABLE "new_Medicine" RENAME TO "Medicine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Labour_name_key" ON "Labour"("name");

-- CreateIndex
CREATE INDEX "SalaryRecord_labourId_idx" ON "SalaryRecord"("labourId");
