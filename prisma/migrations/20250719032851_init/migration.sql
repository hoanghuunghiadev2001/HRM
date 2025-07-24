-- CreateTable
CREATE TABLE `EncryptedFile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `encryptedData` LONGBLOB NOT NULL,
    `encryptionKey` VARCHAR(191) NOT NULL,
    `checksum` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EncryptedFile_filename_idx`(`filename`),
    INDEX `EncryptedFile_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL DEFAULT 'MALE',
    `birthDate` DATETIME(3) NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `avatar` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `managerId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Employee_employeeCode_key`(`employeeCode`),
    INDEX `Employee_employeeCode_idx`(`employeeCode`),
    INDEX `Employee_managerId_idx`(`managerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `abbreviation` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `headId` INTEGER NULL,
    `directorId` INTEGER NULL,

    UNIQUE INDEX `Department_name_key`(`name`),
    UNIQUE INDEX `Department_abbreviation_key`(`abbreviation`),
    UNIQUE INDEX `Department_headId_key`(`headId`),
    UNIQUE INDEX `Department_directorId_key`(`directorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Position` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `description` VARCHAR(191) NULL,
    `departmentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Position_departmentId_idx`(`departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `departmentId` INTEGER NULL,
    `positionId` INTEGER NULL,
    `specialization` VARCHAR(191) NULL,
    `joinedTBD` DATETIME(3) NULL,
    `joinedTeSCC` DATETIME(3) NULL,
    `seniorityStart` DATETIME(3) NULL,
    `seniority` VARCHAR(191) NULL,
    `contractNumber` VARCHAR(191) NULL,
    `contractDate` DATETIME(3) NULL,
    `contractType` VARCHAR(191) NULL,
    `contractEndDate` DATETIME(3) NULL,
    `employeeId` INTEGER NOT NULL,

    UNIQUE INDEX `WorkInfo_employeeId_key`(`employeeId`),
    INDEX `WorkInfo_departmentId_idx`(`departmentId`),
    INDEX `WorkInfo_positionId_idx`(`positionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonalInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identityNumber` VARCHAR(191) NULL,
    `issueDate` DATETIME(3) NULL,
    `issuePlace` VARCHAR(191) NULL,
    `hometown` VARCHAR(191) NULL,
    `idAddress` VARCHAR(191) NULL,
    `education` VARCHAR(191) NULL,
    `drivingLicense` VARCHAR(191) NULL,
    `toyotaCertificate` VARCHAR(191) NULL,
    `taxCode` VARCHAR(191) NULL,
    `insuranceNumber` VARCHAR(191) NULL,
    `insuranceSalary` INTEGER NULL,
    `employeeId` INTEGER NOT NULL,

    UNIQUE INDEX `PersonalInfo_identityNumber_key`(`identityNumber`),
    UNIQUE INDEX `PersonalInfo_taxCode_key`(`taxCode`),
    UNIQUE INDEX `PersonalInfo_insuranceNumber_key`(`insuranceNumber`),
    UNIQUE INDEX `PersonalInfo_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phoneNumber` VARCHAR(191) NULL,
    `relativePhone` VARCHAR(191) NULL,
    `companyPhone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `employeeId` INTEGER NOT NULL,

    UNIQUE INDEX `ContactInfo_phoneNumber_key`(`phoneNumber`),
    UNIQUE INDEX `ContactInfo_email_key`(`email`),
    UNIQUE INDEX `ContactInfo_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtherInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workStatus` ENUM('OFFICIAL', 'PROBATION', 'RESIGNED') NOT NULL DEFAULT 'OFFICIAL',
    `resignedDate` DATETIME(3) NULL,
    `documentsChecked` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `VCB` VARCHAR(191) NULL,
    `MTCV` VARCHAR(191) NULL,
    `PNJ` VARCHAR(191) NULL,
    `employeeId` INTEGER NOT NULL,

    UNIQUE INDEX `OtherInfo_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `leaveType` ENUM('PN', 'NB', 'PC', 'PT', 'Cgt', 'PB', 'TS', 'PR') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `totalHours` DOUBLE NULL,
    `reason` VARCHAR(191) NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LeaveRequest_employeeId_idx`(`employeeId`),
    INDEX `LeaveRequest_status_idx`(`status`),
    INDEX `LeaveRequest_startDate_endDate_idx`(`startDate`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveApprovalStep` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaveRequestId` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `approvedAt` DATETIME(3) NULL,

    UNIQUE INDEX `LeaveApprovalStep_leaveRequestId_level_key`(`leaveRequestId`, `level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveApprovalStepApprover` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `leaveApprovalStepId` INTEGER NOT NULL,
    `approverId` INTEGER NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `approvedAt` DATETIME(3) NULL,

    UNIQUE INDEX `LeaveApprovalStepApprover_leaveApprovalStepId_approverId_key`(`leaveApprovalStepId`, `approverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `checkInTime` DATETIME(3) NULL,
    `checkOutTime` DATETIME(3) NULL,
    `workingHours` DOUBLE NULL,

    INDEX `Attendance_date_idx`(`date`),
    UNIQUE INDEX `Attendance_employeeId_date_key`(`employeeId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KPI` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KPI_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KPIEmployee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kpiId` INTEGER NOT NULL,
    `employeeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KPIEmployee_kpiId_employeeId_key`(`kpiId`, `employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KPIEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kpiEmployeeId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `targetValue` DOUBLE NOT NULL,
    `achievedValue` DOUBLE NOT NULL DEFAULT 0,
    `isAchieved` BOOLEAN NOT NULL DEFAULT false,
    `weight` DOUBLE NOT NULL DEFAULT 1.0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KPIEntry_kpiEmployeeId_name_key`(`kpiEmployeeId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Proposal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `fileId` INTEGER NULL,
    `status` ENUM('pending_signatures', 'waiting_approval', 'approved', 'rejected') NOT NULL DEFAULT 'pending_signatures',
    `proposerId` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Proposal_status_idx`(`status`),
    INDEX `Proposal_proposerId_idx`(`proposerId`),
    INDEX `Proposal_createdById_idx`(`createdById`),
    INDEX `Proposal_fileId_idx`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProposalSigner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proposalId` INTEGER NOT NULL,
    `signerId` INTEGER NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `signedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ProposalSigner_proposalId_signerId_key`(`proposalId`, `signerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProposalApprover` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proposalId` INTEGER NOT NULL,
    `approverId` INTEGER NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `approvedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ProposalApprover_proposalId_approverId_key`(`proposalId`, `approverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_headId_fkey` FOREIGN KEY (`headId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_directorId_fkey` FOREIGN KEY (`directorId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Position` ADD CONSTRAINT `Position_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkInfo` ADD CONSTRAINT `WorkInfo_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkInfo` ADD CONSTRAINT `WorkInfo_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `Position`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkInfo` ADD CONSTRAINT `WorkInfo_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonalInfo` ADD CONSTRAINT `PersonalInfo_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactInfo` ADD CONSTRAINT `ContactInfo_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherInfo` ADD CONSTRAINT `OtherInfo_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveApprovalStep` ADD CONSTRAINT `LeaveApprovalStep_leaveRequestId_fkey` FOREIGN KEY (`leaveRequestId`) REFERENCES `LeaveRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveApprovalStepApprover` ADD CONSTRAINT `LeaveApprovalStepApprover_leaveApprovalStepId_fkey` FOREIGN KEY (`leaveApprovalStepId`) REFERENCES `LeaveApprovalStep`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveApprovalStepApprover` ADD CONSTRAINT `LeaveApprovalStepApprover_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KPIEmployee` ADD CONSTRAINT `KPIEmployee_kpiId_fkey` FOREIGN KEY (`kpiId`) REFERENCES `KPI`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KPIEmployee` ADD CONSTRAINT `KPIEmployee_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KPIEntry` ADD CONSTRAINT `KPIEntry_kpiEmployeeId_fkey` FOREIGN KEY (`kpiEmployeeId`) REFERENCES `KPIEmployee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proposal` ADD CONSTRAINT `Proposal_proposerId_fkey` FOREIGN KEY (`proposerId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proposal` ADD CONSTRAINT `Proposal_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proposal` ADD CONSTRAINT `Proposal_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `EncryptedFile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProposalSigner` ADD CONSTRAINT `ProposalSigner_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `Proposal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProposalSigner` ADD CONSTRAINT `ProposalSigner_signerId_fkey` FOREIGN KEY (`signerId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProposalApprover` ADD CONSTRAINT `ProposalApprover_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `Proposal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProposalApprover` ADD CONSTRAINT `ProposalApprover_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
