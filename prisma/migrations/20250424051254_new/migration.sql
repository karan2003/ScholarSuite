/*
  Warnings:

  - A unique constraint covering the columns `[subjectCode]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subjectCode` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectCode` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requiredCredits` to the `Grade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectCode` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credits` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectCode` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credits` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectCode` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "subjectCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "subjectCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "requiredCredits" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "subjectCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "credits" INTEGER NOT NULL,
ADD COLUMN     "subjectCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "earnedCredits" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "credits" INTEGER NOT NULL,
ADD COLUMN     "subjectCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subjectCode_key" ON "Subject"("subjectCode");
