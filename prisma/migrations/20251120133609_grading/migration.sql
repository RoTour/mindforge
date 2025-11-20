/*
  Warnings:

  - You are about to drop the column `assessment` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `Answer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[autoGradeId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherGradeId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "assessment",
DROP COLUMN "grade",
ADD COLUMN     "autoGradeId" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teacherGradeId" TEXT;

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "skillsMastered" TEXT[],
    "skillsToReinforce" TEXT[],
    "comment" TEXT,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Answer_autoGradeId_key" ON "Answer"("autoGradeId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_teacherGradeId_key" ON "Answer"("teacherGradeId");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_autoGradeId_fkey" FOREIGN KEY ("autoGradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_teacherGradeId_fkey" FOREIGN KEY ("teacherGradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
