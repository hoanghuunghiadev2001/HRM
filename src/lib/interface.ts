export interface InfoEmployee {
  id: number;
  employeeCode: string;
  name: string;
  gender: string;
  birthDate: string;
  password: string;
  role: string;
  avatar: string;
  workInfo: WorkInfo;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  otherInfo: OtherInfo;
  LeaveRequest: LeaveRequest[];
}

export interface WorkInfo {
  id: number;
  department?: Department;
  position?: Position;
  specialization: string;
  joinedTBD: string;
  joinedTeSCC: string;
  seniorityStart: string;
  seniority: string;
  contractNumber: string;
  contractDate: string;
  contractType: string;
  contractEndDate: string;
  employeeId: number;
}

export interface Department {
  positions: Position[];
  id: number;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: number;
  name: string;
  departmentId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalInfo {
  id: number;
  identityNumber: string;
  issueDate: string;
  issuePlace: string;
  hometown: string;
  idAddress: string;
  education: string;
  drivingLicense: string;
  toyotaCertificate: string;
  taxCode: string;
  insuranceNumber: string;
  insuranceSalary: number;
  employeeId: number;
}

export interface ContactInfo {
  id: number;
  phoneNumber: string;
  relativePhone: string;
  companyPhone: string;
  email: string;
  employeeId: number;
}

export interface OtherInfo {
  id: number;
  workStatus: string;
  resignedDate: string;
  documentsChecked: string;
  updatedAt: string;
  VCB: string;
  MTCV: string;
  PNJ: string;
  employeeId: number;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  reason: string;
  status: string;
  approvedBy: string;
  approvedAt: string;
  createdAt: string;
}
export interface Attendance {
  employeeId: number;
  employeeCode: string;
  avatar: string;
  employeeName: string;
  department: Department;
  position: Position;
  date: string;
  firstCheckIn: string;
  lastCheckOut: string;
  totalHours: number;
}

export interface AttendanceResponse {
  total: number;
  page: number;
  pageSize: number;
  data: Attendance[];
}

export interface UseAttendanceParams {
  msnv?: string;
  name?: string;
  department?: string;
  fromDate?: string | null; // yyyy-mm-dd
  toDate?: string | null; // yyyy-mm-dd
  page?: number;
  pageSize?: number;
}

export interface employeeAddAttendance {
  employeeCode: string;
  timeScan: string;
}

export interface interfaceChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordEmployeeParams {
  employeeCode: string;
  newPassword: string;
}
