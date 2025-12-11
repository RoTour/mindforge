/*
  Warnings:

  - You are about to drop the column `questionSessionId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the `QuestionSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[questionSlotId,studentId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questionSlotId` to the `Answer` table without a default value. This is not possible if the table is not empty.

*/

-- Clean slate: Delete all existing QuestionSession-related data
DELETE FROM "Answer" WHERE "questionSessionId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionSessionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionSession" DROP CONSTRAINT "QuestionSession_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionSession" DROP CONSTRAINT "QuestionSession_questionId_fkey";

-- DropIndex
DROP INDEX "Answer_questionSessionId_studentId_key";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "questionSessionId",
ADD COLUMN     "questionSlotId" TEXT NOT NULL;

-- DropTable
DROP TABLE "QuestionSession";

-- CreateTable
CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "lockPreviousOnUnlock" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionSlot" (
    "id" TEXT NOT NULL,
    "liveSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "QuestionSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionSlot_liveSessionId_order_key" ON "QuestionSlot"("liveSessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_questionSlotId_studentId_key" ON "Answer"("questionSlotId", "studentId");

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSlot" ADD CONSTRAINT "QuestionSlot_liveSessionId_fkey" FOREIGN KEY ("liveSessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSlot" ADD CONSTRAINT "QuestionSlot_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionSlotId_fkey" FOREIGN KEY ("questionSlotId") REFERENCES "QuestionSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
