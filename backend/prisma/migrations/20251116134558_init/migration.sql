/*
  Warnings:

  - Added the required column `deadline` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `efficiency` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeLogged` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "deadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "efficiency" INTEGER NOT NULL,
ADD COLUMN     "gradientColors" TEXT[],
ADD COLUMN     "timeLogged" INTEGER NOT NULL;
