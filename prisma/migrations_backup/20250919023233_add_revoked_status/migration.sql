-- AlterTable
ALTER TABLE `LeaveApprovalStep` MODIFY `status` ENUM('pending', 'approved', 'rejected', 'revoked') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `LeaveApprovalStepApprover` MODIFY `status` ENUM('pending', 'approved', 'rejected', 'revoked') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `LeaveRequest` MODIFY `status` ENUM('pending', 'approved', 'rejected', 'revoked') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `ProposalApprover` MODIFY `status` ENUM('pending', 'approved', 'rejected', 'revoked') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `ProposalSigner` MODIFY `status` ENUM('pending', 'approved', 'rejected', 'revoked') NOT NULL DEFAULT 'pending';
