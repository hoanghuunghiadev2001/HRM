-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('OFFICIAL', 'PROBATION', 'RESIGNED');

-- CreateEnum
CREATE TYPE "LeaveTypeEnum" AS ENUM ('PN', 'NB', 'PC', 'PT', 'Cgt', 'PB', 'TS', 'PR');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Sex" NOT NULL DEFAULT 'MALE',
    "birthDate" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatar" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkInfo" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER,
    "positionId" INTEGER,
    "specialization" TEXT,
    "joinedTBD" TIMESTAMP(3),
    "joinedTeSCC" TIMESTAMP(3),
    "seniorityStart" TIMESTAMP(3),
    "seniority" TEXT,
    "contractNumber" TEXT,
    "contractDate" TIMESTAMP(3),
    "contractType" TEXT,
    "contractEndDate" TIMESTAMP(3),
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "WorkInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalInfo" (
    "id" SERIAL NOT NULL,
    "identityNumber" TEXT,
    "issueDate" TIMESTAMP(3),
    "issuePlace" TEXT,
    "hometown" TEXT,
    "idAddress" TEXT,
    "education" TEXT,
    "drivingLicense" TEXT,
    "toyotaCertificate" TEXT,
    "taxCode" TEXT,
    "insuranceNumber" TEXT,
    "insuranceSalary" INTEGER,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "PersonalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactInfo" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT,
    "relativePhone" TEXT,
    "companyPhone" TEXT,
    "email" TEXT,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "ContactInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtherInfo" (
    "id" SERIAL NOT NULL,
    "workStatus" "WorkStatus" NOT NULL DEFAULT 'OFFICIAL',
    "resignedDate" TIMESTAMP(3),
    "documentsChecked" TEXT,
    "updatedAt" TIMESTAMP(3),
    "VCB" TEXT,
    "MTCV" TEXT,
    "PNJ" TEXT,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "OtherInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "leaveType" "LeaveTypeEnum" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalHours" DOUBLE PRECISION,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_abbreviation_key" ON "Department"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "WorkInfo_employeeId_key" ON "WorkInfo"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalInfo_employeeId_key" ON "PersonalInfo"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactInfo_employeeId_key" ON "ContactInfo"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "OtherInfo_employeeId_key" ON "OtherInfo"("employeeId");

-- CreateIndex
CREATE INDEX "Attendance_employeeId_date_idx" ON "Attendance"("employeeId", "date");

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkInfo" ADD CONSTRAINT "WorkInfo_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkInfo" ADD CONSTRAINT "WorkInfo_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkInfo" ADD CONSTRAINT "WorkInfo_employee_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalInfo" ADD CONSTRAINT "PersonalInfo_employee_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInfo" ADD CONSTRAINT "ContactInfo_employee_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtherInfo" ADD CONSTRAINT "OtherInfo_employee_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
