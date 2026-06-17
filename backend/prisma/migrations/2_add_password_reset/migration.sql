-- CreateTable PasswordReset
CREATE TABLE "PasswordReset" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "token" VARCHAR(255) NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "PasswordReset_email_idx" ON "PasswordReset"("email");
CREATE INDEX "PasswordReset_token_idx" ON "PasswordReset"("token");
CREATE INDEX "PasswordReset_expiresAt_idx" ON "PasswordReset"("expiresAt");
