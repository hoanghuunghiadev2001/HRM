-- AlterTable
ALTER TABLE `AttendanceImportLog` ADD COLUMN `importedById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `AttendanceImportLog` ADD CONSTRAINT `AttendanceImportLog_importedById_fkey` FOREIGN KEY (`importedById`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
