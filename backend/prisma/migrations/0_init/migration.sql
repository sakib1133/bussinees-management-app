-- CreateTable User
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable Sale
CREATE TABLE "public"."Sale" (
    "id" SERIAL NOT NULL,
    "contractorName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable LabourPayment
CREATE TABLE "public"."LabourPayment" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabourPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable Medicine
CREATE TABLE "public"."Medicine" (
    "id" SERIAL NOT NULL,
    "medicineName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "purchasedBy" TEXT NOT NULL,
    "quantity" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable Expense
CREATE TABLE "public"."Expense" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable Labour
CREATE TABLE "public"."Labour" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Labour_pkey" PRIMARY KEY ("id")
);

-- CreateTable SalaryRecord
CREATE TABLE "public"."SalaryRecord" (
    "id" SERIAL NOT NULL,
    "labourId" INTEGER NOT NULL,
    "salaryAmount" DOUBLE PRECISION NOT NULL,
    "periodFromDate" TIMESTAMP(3) NOT NULL,
    "periodToDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for User email
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex for Labour name
CREATE UNIQUE INDEX "Labour_name_key" ON "public"."Labour"("name");

-- CreateIndex for SalaryRecord labourId
CREATE INDEX "SalaryRecord_labourId_idx" ON "public"."SalaryRecord"("labourId");

-- AddForeignKey for SalaryRecord
ALTER TABLE "public"."SalaryRecord" ADD CONSTRAINT "SalaryRecord_labourId_fkey" FOREIGN KEY ("labourId") REFERENCES "public"."Labour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
