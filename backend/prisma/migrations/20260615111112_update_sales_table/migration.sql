/*
  Warnings:

  - You are about to drop the column `date` on the `Sale` table. All the data in the column will be lost.
  - Added the required column `contractorName` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saleDate` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "contractorName" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "saleDate" DATETIME NOT NULL,
    "description" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Sale" ("amount", "createdAt", "description", "id", "updatedAt") SELECT "amount", "createdAt", "description", "id", "updatedAt" FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
