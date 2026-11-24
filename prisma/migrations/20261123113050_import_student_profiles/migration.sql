-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'FROZEN', 'COMPLETED', 'PROSPECT');

-- CreateEnum
CREATE TYPE "StudentPaymentStatus" AS ENUM ('PAID', 'DEBT', 'UNPAID', 'UNKNOWN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "jobTitle" TEXT;

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceRow" INTEGER,
    "status" "StudentStatus" NOT NULL DEFAULT 'PROSPECT',
    "courseType" TEXT,
    "teacherName" TEXT,
    "scheduleText" TEXT,
    "timeText" TEXT,
    "trialDate" DATE,
    "startDate" DATE,
    "startDateText" TEXT,
    "paymentStatus" "StudentPaymentStatus" NOT NULL DEFAULT 'UNKNOWN',
    "paymentTiming" TEXT,
    "debtAmount" INTEGER,
    "salesManager" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_sourceRow_key" ON "StudentProfile"("sourceRow");

-- CreateIndex
CREATE INDEX "StudentProfile_status_idx" ON "StudentProfile"("status");

-- CreateIndex
CREATE INDEX "StudentProfile_paymentStatus_idx" ON "StudentProfile"("paymentStatus");

-- CreateIndex
CREATE INDEX "StudentProfile_salesManager_idx" ON "StudentProfile"("salesManager");

-- CreateIndex
CREATE INDEX "StudentProfile_teacherName_scheduleText_timeText_idx" ON "StudentProfile"("teacherName", "scheduleText", "timeText");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
