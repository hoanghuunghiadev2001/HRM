/*
  Warnings:

  - You are about to drop the column `approverId` on the `LeaveApprovalStep` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LeaveApprovalStep" DROP CONSTRAINT "LeaveApprovalStep_approverId_fkey";

-- AlterTable
ALTER TABLE "LeaveApprovalStep" DROP COLUMN "approverId";

-- CreateTable
CREATE TABLE "LeaveApprovalStepApprover" (
    "id" SERIAL NOT NULL,
    "leaveApprovalStepId" INTEGER NOT NULL,
    "approverId" INTEGER NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'pending',
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "LeaveApprovalStepApprover_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaveApprovalStepApprover_leaveApprovalStepId_approverId_key" ON "LeaveApprovalStepApprover"("leaveApprovalStepId", "approverId");

-- AddForeignKey
ALTER TABLE "LeaveApprovalStepApprover" ADD CONSTRAINT "LeaveApprovalStepApprover_leaveApprovalStepId_fkey" FOREIGN KEY ("leaveApprovalStepId") REFERENCES "LeaveApprovalStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApprovalStepApprover" ADD CONSTRAINT "LeaveApprovalStepApprover_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
