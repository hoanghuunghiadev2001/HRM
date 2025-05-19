/*
  Warnings:

  - You are about to alter the column `documentsChecked` on the `otherinfo` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.
  - You are about to alter the column `MTCV` on the `otherinfo` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.
  - You are about to alter the column `PNJ` on the `otherinfo` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `otherinfo` MODIFY `documentsChecked` VARCHAR(191) NOT NULL,
    MODIFY `MTCV` VARCHAR(191) NULL,
    MODIFY `PNJ` VARCHAR(191) NULL;
