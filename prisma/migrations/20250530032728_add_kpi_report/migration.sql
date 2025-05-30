/*
  Warnings:

  - You are about to drop the `KPIDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KPIRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "KPIDetail" DROP CONSTRAINT "KPIDetail_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "KPIDetail" DROP CONSTRAINT "KPIDetail_kpiRecordId_fkey";

-- DropTable
DROP TABLE "KPIDetail";

-- DropTable
DROP TABLE "KPIRecord";

-- CreateTable
CREATE TABLE "KPI" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIEmployee" (
    "id" SERIAL NOT NULL,
    "kpiId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "targetRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetVehicleCount" INTEGER NOT NULL DEFAULT 0,
    "achievedRevenue" DOUBLE PRECISION DEFAULT 0,
    "achievedVehicleCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPIEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KPIEmployee_kpiId_employeeId_key" ON "KPIEmployee"("kpiId", "employeeId");

-- AddForeignKey
ALTER TABLE "KPIEmployee" ADD CONSTRAINT "KPIEmployee_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIEmployee" ADD CONSTRAINT "KPIEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
