/*
  Warnings:

  - You are about to drop the column `subjectCode` on the `Assignment` table. All the data in the column will be lost.
  - You are about to drop the column `subjectCode` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `requiredCredits` on the `Grade` table. All the data in the column will be lost.
  - You are about to drop the column `subjectCode` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `subjectCode` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `earnedCredits` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `subjectCode` on the `Subject` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Subject_subjectCode_key";

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "subjectCode";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "subjectCode";

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "requiredCredits";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "subjectCode";

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "credits",
DROP COLUMN "subjectCode";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "earnedCredits";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "credits",
DROP COLUMN "subjectCode";
