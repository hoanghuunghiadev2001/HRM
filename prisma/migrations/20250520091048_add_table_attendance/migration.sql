/*
  Warnings:

  - You are about to drop the column `timeScan` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `attendance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `attendance` DROP COLUMN `timeScan`,
    DROP COLUMN `type`,
    ADD COLUMN `checkInTime` DATETIME(3) NULL,
    ADD COLUMN `checkOutTime` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Attendance_employeeId_date_idx` ON `Attendance`(`employeeId`, `date`);
