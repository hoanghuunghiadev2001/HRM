/*
  Warnings:

  - You are about to drop the `KPIReport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "KPIReport" DROP CONSTRAINT "KPIReport_employeeId_fkey";

-- DropTable
DROP TABLE "KPIReport";

-- CreateTable
CREATE TABLE "KPIRecord" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPIRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIDetail" (
    "id" SERIAL NOT NULL,
    "kpiRecordId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "targetRevenue" DOUBLE PRECISION,
    "achievedRevenue" DOUBLE PRECISION,
    "targetVehicleCount" INTEGER,
    "achievedVehicleCount" INTEGER,

    CONSTRAINT "KPIDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KPIDetail_kpiRecordId_employeeId_key" ON "KPIDetail"("kpiRecordId", "employeeId");

-- AddForeignKey
ALTER TABLE "KPIDetail" ADD CONSTRAINT "KPIDetail_kpiRecordId_fkey" FOREIGN KEY ("kpiRecordId") REFERENCES "KPIRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIDetail" ADD CONSTRAINT "KPIDetail_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
