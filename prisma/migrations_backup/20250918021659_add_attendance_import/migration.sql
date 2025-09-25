-- AlterTable
ALTER TABLE `Attendance` ADD COLUMN `importId` INTEGER NULL;

-- CreateTable
CREATE TABLE `AttendanceImportLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `importedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_importId_fkey` FOREIGN KEY (`importId`) REFERENCES `AttendanceImportLog`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
