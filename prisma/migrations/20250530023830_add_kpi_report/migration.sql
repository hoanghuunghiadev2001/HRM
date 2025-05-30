/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,period,kpiName]` on the table `KPIReport` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kpiName` to the `KPIReport` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "KPIReport_employeeId_period_key";

-- AlterTable
ALTER TABLE "KPIReport" ADD COLUMN     "kpiName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "KPIReport_employeeId_period_kpiName_key" ON "KPIReport"("employeeId", "period", "kpiName");
