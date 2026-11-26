-- CreateTable
CREATE TABLE "SupportSignup" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportSignup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupportSignup_lessonId_idx" ON "SupportSignup"("lessonId");

-- CreateIndex
CREATE INDEX "SupportSignup_studentId_createdAt_idx" ON "SupportSignup"("studentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SupportSignup_lessonId_studentId_key" ON "SupportSignup"("lessonId", "studentId");

-- AddForeignKey
ALTER TABLE "SupportSignup" ADD CONSTRAINT "SupportSignup_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportSignup" ADD CONSTRAINT "SupportSignup_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
