-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL DEFAULT 'MALE',
    `birthDate` DATETIME(3) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'MANAGER', 'ADMIN') NOT NULL DEFAULT 'USER',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `department` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `joinedTBD` DATETIME(3) NULL,
    `joinedTeSCC` DATETIME(3) NULL,
    `seniorityStart` DATETIME(3) NULL,
    `seniority` INTEGER NULL,
    `contractNumber` VARCHAR(191) NOT NULL,
    `contractDate` DATETIME(3) NOT NULL,
    `contractType` VARCHAR(191) NOT NULL,
    `contractEndDate` DATETIME(3) NOT NULL,
    `employeeId` INTEGER NOT NULL,

    UNIQUE INDEX `WorkInfo_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonalInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `identityNumber` VARCHAR(191) NOT NULL,
    `issueDate` DATETIME(3) NOT NULL,
    `issuePlace` VARCHAR(191) NOT NULL,
    `hometown` VARCHAR(191) NOT NULL,
    `idAddress` VARCHAR(191) NOT NULL,
    `education` VARCHAR(191) NULL,
    `drivingLicense` VARCHAR(191) NULL,
    `toyotaCertificate` VARCHAR(191) NULL,
    `taxCode` VARCHAR(191) NOT NULL,
    `insuranceNumber` INTEGER NOT NULL,
    `insuranceSalary` INTEGER NOT NULL,
    `employeeId` INTEGER NOT NULL,

    UNIQUE INDEX `PersonalInfo_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `relativePhone` VARCHAR(191) NOT NULL,
    `companyPhone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `employeeId` INTEGER NOT NULL,

    UNIQUE INDEX `ContactInfo_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtherInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workStatus` ENUM('OFFICIAL', 'PROBATION', 'RESIGNED') NOT NULL DEFAULT 'OFFICIAL',
    `resignedDate` DATETIME(3) NULL,
    `documentsChecked` BOOLEAN NOT NULL,
    `updatedAt` DATETIME(3) NULL,
    `VCB` VARCHAR(191) NULL,
    `MTCV` BOOLEAN NULL,
    `PNJ` BOOLEAN NULL,
    `employeeId` INTEGER NOT NULL,

    UNIQUE INDEX `OtherInfo_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WorkInfo` ADD CONSTRAINT `WorkInfo_employee_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonalInfo` ADD CONSTRAINT `PersonalInfo_employee_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactInfo` ADD CONSTRAINT `ContactInfo_employee_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherInfo` ADD CONSTRAINT `OtherInfo_employee_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
