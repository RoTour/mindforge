/*
  Warnings:

  - Added the required column `teacherId` to the `Promotion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "teacherId" TEXT NOT NULL DEFAULT 'Teacher-019a2f70-f835-73ae-bc3e-0f6b23e8521a';

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- Insert default teacher so foreign key can be satisfied
INSERT INTO "Teacher" ("id", "authUserId") VALUES ('Teacher-019a2f70-f835-73ae-bc3e-0f6b23e8521a', 'default-auth-id-for-migration');

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_authUserId_key" ON "Teacher"("authUserId");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the default after backfilling
ALTER TABLE "Promotion" ALTER COLUMN "teacherId" DROP DEFAULT;
