-- CreateTable
CREATE TABLE "KPIReport" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "targetRevenue" DOUBLE PRECISION,
    "achievedRevenue" DOUBLE PRECISION,
    "targetVehicleCount" INTEGER,
    "achievedVehicleCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPIReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KPIReport_employeeId_period_key" ON "KPIReport"("employeeId", "period");

-- AddForeignKey
ALTER TABLE "KPIReport" ADD CONSTRAINT "KPIReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
