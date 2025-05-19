-- AlterTable
ALTER TABLE `contactinfo` MODIFY `phoneNumber` VARCHAR(191) NULL,
    MODIFY `relativePhone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `otherinfo` MODIFY `documentsChecked` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `personalinfo` MODIFY `identityNumber` VARCHAR(191) NULL,
    MODIFY `issueDate` DATETIME(3) NULL,
    MODIFY `issuePlace` VARCHAR(191) NULL,
    MODIFY `hometown` VARCHAR(191) NULL,
    MODIFY `idAddress` VARCHAR(191) NULL,
    MODIFY `taxCode` VARCHAR(191) NULL,
    MODIFY `insuranceNumber` INTEGER NULL,
    MODIFY `insuranceSalary` INTEGER NULL;

-- AlterTable
ALTER TABLE `workinfo` MODIFY `specialization` VARCHAR(191) NULL,
    MODIFY `contractNumber` VARCHAR(191) NULL,
    MODIFY `contractDate` DATETIME(3) NULL,
    MODIFY `contractType` VARCHAR(191) NULL,
    MODIFY `contractEndDate` DATETIME(3) NULL;
