-- AlterTable
ALTER TABLE `leaverequest` ADD COLUMN `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending';
