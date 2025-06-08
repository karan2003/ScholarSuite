/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Alumni` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Alumni" ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Alumni_username_key" ON "Alumni"("username");
