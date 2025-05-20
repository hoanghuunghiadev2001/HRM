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
  department: string;
  position: string;
  specialization: string;
  joinedTBD: string;
  joinedTeSCC: any;
  seniorityStart: any;
  seniority: number;
  contractNumber: string;
  contractDate: string;
  contractType: string;
  contractEndDate: string;
  employeeId: number;
}

export interface PersonalInfo {
  id: number;
  identityNumber: string;
  issueDate: string;
  issuePlace: string;
  hometown: string;
  idAddress: string;
  education: string;
  drivingLicense: any;
  toyotaCertificate: any;
  taxCode: string;
  insuranceNumber: string;
  insuranceSalary: number;
  employeeId: number;
}

export interface ContactInfo {
  id: number;
  phoneNumber: string;
  relativePhone: string;
  companyPhone: any;
  email: string;
  employeeId: number;
}

export interface OtherInfo {
  id: number;
  workStatus: string;
  resignedDate: any;
  documentsChecked: string;
  updatedAt: any;
  VCB: any;
  MTCV: any;
  PNJ: any;
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
  approvedAt: any;
  createdAt: string;
}
export interface Attendance {
  employeeId: number;
  employeeCode: string;
  avatar: string;
  employeeName: string;
  department: string;
  position: string;
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
  deparment?: string;
  fromDate?: string; // yyyy-mm-dd
  toDate?: string; // yyyy-mm-dd
  page?: number;
  pageSize?: number;
}
