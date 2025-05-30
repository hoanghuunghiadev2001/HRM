/*
  Warnings:

  - You are about to drop the column `achievedRevenue` on the `KPIEmployee` table. All the data in the column will be lost.
  - You are about to drop the column `achievedVehicleCount` on the `KPIEmployee` table. All the data in the column will be lost.
  - You are about to drop the column `targetRevenue` on the `KPIEmployee` table. All the data in the column will be lost.
  - You are about to drop the column `targetVehicleCount` on the `KPIEmployee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "KPIEmployee" DROP COLUMN "achievedRevenue",
DROP COLUMN "achievedVehicleCount",
DROP COLUMN "targetRevenue",
DROP COLUMN "targetVehicleCount";

-- CreateTable
CREATE TABLE "KPIEntry" (
    "id" SERIAL NOT NULL,
    "kpiEmployeeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "achievedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isAchieved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPIEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KPIEntry_kpiEmployeeId_name_key" ON "KPIEntry"("kpiEmployeeId", "name");

-- AddForeignKey
ALTER TABLE "KPIEntry" ADD CONSTRAINT "KPIEntry_kpiEmployeeId_fkey" FOREIGN KEY ("kpiEmployeeId") REFERENCES "KPIEmployee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
