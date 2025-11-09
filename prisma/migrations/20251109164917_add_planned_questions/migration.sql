-- CreateTable
CREATE TABLE "PlannedQuestion" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "startingOn" TIMESTAMP(3),
    "endingOn" TIMESTAMP(3),

    CONSTRAINT "PlannedQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlannedQuestion" ADD CONSTRAINT "PlannedQuestion_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedQuestion" ADD CONSTRAINT "PlannedQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
