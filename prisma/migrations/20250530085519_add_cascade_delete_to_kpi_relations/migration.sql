-- DropForeignKey
ALTER TABLE "KPIEmployee" DROP CONSTRAINT "KPIEmployee_kpiId_fkey";

-- DropForeignKey
ALTER TABLE "KPIEntry" DROP CONSTRAINT "KPIEntry_kpiEmployeeId_fkey";

-- AddForeignKey
ALTER TABLE "KPIEmployee" ADD CONSTRAINT "KPIEmployee_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIEntry" ADD CONSTRAINT "KPIEntry_kpiEmployeeId_fkey" FOREIGN KEY ("kpiEmployeeId") REFERENCES "KPIEmployee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
