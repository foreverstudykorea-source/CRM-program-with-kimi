-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN', 'FINANCE');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('GENERAL', 'ATTENDANCE', 'PAYMENT');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('PAID', 'PARTIAL', 'UNPAID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'CLICK', 'PAYME', 'BANK_TRANSFER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPrice" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "weekDays" "WeekDay"[],
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT,
    "startDate" DATE NOT NULL,
    "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupStudent" (
    "groupId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMPTZ(6),

    CONSTRAINT "GroupStudent_pkey" PRIMARY KEY ("groupId","studentId")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "topic" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "note" TEXT,
    "markedById" TEXT NOT NULL,
    "markedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Homework" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "dueDate" DATE NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "groupId" TEXT,
    "type" "MessageType" NOT NULL DEFAULT 'GENERAL',
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "amount" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "status" "ChargeStatus" NOT NULL DEFAULT 'UNPAID',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "chargeId" TEXT,
    "amount" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "paidAt" TIMESTAMPTZ(6) NOT NULL,
    "receivedById" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "identifierHash" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "wasSuccessful" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- CreateIndex
CREATE INDEX "User_fullName_idx" ON "User"("fullName");

-- CreateIndex
CREATE INDEX "Course_name_idx" ON "Course"("name");

-- CreateIndex
CREATE INDEX "Group_courseId_idx" ON "Group"("courseId");

-- CreateIndex
CREATE INDEX "Group_teacherId_status_idx" ON "Group"("teacherId", "status");

-- CreateIndex
CREATE INDEX "Group_status_startDate_idx" ON "Group"("status", "startDate");

-- CreateIndex
CREATE INDEX "GroupStudent_studentId_leftAt_idx" ON "GroupStudent"("studentId", "leftAt");

-- CreateIndex
CREATE INDEX "GroupStudent_groupId_leftAt_idx" ON "GroupStudent"("groupId", "leftAt");

-- CreateIndex
CREATE INDEX "Lesson_date_idx" ON "Lesson"("date");

-- CreateIndex
CREATE INDEX "Lesson_groupId_date_idx" ON "Lesson"("groupId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_groupId_date_key" ON "Lesson"("groupId", "date");

-- CreateIndex
CREATE INDEX "Attendance_studentId_status_idx" ON "Attendance"("studentId", "status");

-- CreateIndex
CREATE INDEX "Attendance_markedById_idx" ON "Attendance"("markedById");

-- CreateIndex
CREATE INDEX "Attendance_status_idx" ON "Attendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_lessonId_studentId_key" ON "Attendance"("lessonId", "studentId");

-- CreateIndex
CREATE INDEX "Homework_groupId_dueDate_idx" ON "Homework"("groupId", "dueDate");

-- CreateIndex
CREATE INDEX "Homework_createdById_idx" ON "Homework"("createdById");

-- CreateIndex
CREATE INDEX "Homework_dueDate_idx" ON "Homework"("dueDate");

-- CreateIndex
CREATE INDEX "Message_senderId_createdAt_idx" ON "Message"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_recipientId_readAt_createdAt_idx" ON "Message"("recipientId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Message_groupId_idx" ON "Message"("groupId");

-- CreateIndex
CREATE INDEX "Message_type_createdAt_idx" ON "Message"("type", "createdAt");

-- CreateIndex
CREATE INDEX "Charge_studentId_status_month_idx" ON "Charge"("studentId", "status", "month");

-- CreateIndex
CREATE INDEX "Charge_groupId_month_idx" ON "Charge"("groupId", "month");

-- CreateIndex
CREATE INDEX "Charge_month_status_idx" ON "Charge"("month", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Charge_studentId_groupId_month_key" ON "Charge"("studentId", "groupId", "month");

-- CreateIndex
CREATE INDEX "Payment_studentId_paidAt_idx" ON "Payment"("studentId", "paidAt");

-- CreateIndex
CREATE INDEX "Payment_chargeId_idx" ON "Payment"("chargeId");

-- CreateIndex
CREATE INDEX "Payment_receivedById_idx" ON "Payment"("receivedById");

-- CreateIndex
CREATE INDEX "Payment_paidAt_method_idx" ON "Payment"("paidAt", "method");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_identifierHash_wasSuccessful_createdAt_idx" ON "LoginAttempt"("identifierHash", "wasSuccessful", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipHash_wasSuccessful_createdAt_idx" ON "LoginAttempt"("ipHash", "wasSuccessful", "createdAt");

-- CreateIndex
CREATE INDEX "LoginAttempt_createdAt_idx" ON "LoginAttempt"("createdAt");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupStudent" ADD CONSTRAINT "GroupStudent_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupStudent" ADD CONSTRAINT "GroupStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES "Charge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
