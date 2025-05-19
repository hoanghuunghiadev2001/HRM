/*
  Warnings:

  - You are about to alter the column `insuranceSalary` on the `personalinfo` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `personalinfo` MODIFY `insuranceSalary` INTEGER NULL;
