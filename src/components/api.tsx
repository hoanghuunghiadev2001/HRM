export interface ProfileInfo {
  id: number;
  employeeCode: string;
  name: string;
  gender: string;
  birthDate: string;
  password: string;
  role: string;
  avatar: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  workInfo: WorkInfo;
  otherInfo: OtherInfo;
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
  insuranceNumber: number;
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

export interface WorkInfo {
  id: number;
  department: string;
  position: string;
  specialization: string;
  joinedTBD: string;
  joinedTeSCC: string;
  seniorityStart: string;
  seniority: number;
  contractNumber: string;
  contractDate: string;
  contractType: string;
  contractEndDate: string;
  employeeId: number;
}

export interface OtherInfo {
  id: number;
  workStatus: string;
  resignedDate: any;
  documentsChecked: boolean;
  updatedAt: string;
  VCB: string;
  MTCV: boolean;
  PNJ: boolean;
  employeeId: number;
}

export interface RequestLeave {
  id: number;
  employeeId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  reason: string;
  status: string;
  createdAt: string;
  employee: Employee;
}

export interface WorkInfo {
  department: string;
  position: string;
}
export interface Employee {
  name: string;
  employeeCode: string;
  avatar: string;
  workInfo: WorkInfo;
}

export type ListRequestLeave = RequestLeave[];

export const fetchUser = async () => {
  const controller = new AbortController();

  try {
    const res = await fetch("/api/me", { signal: controller.signal });
    if (res.ok) {
      const data = await res.json();

      // ✅ Lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(data));
    } else {
      console.error("Không lấy được dữ liệu user");
    }
  } catch (error) {
    console.error("Lỗi khi gọi API /api/me:", error);
  } finally {
  }

  return () => controller.abort();
};

export const getUserFromLocalStorage = () => {
  if (typeof window === "undefined") {
    // Chạy trên server, không có localStorage
    return null;
  }

  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

// export const getUserFromLocalStorage = () => {
//   try {
//     const storedUser = localStorage.getItem("user");
//     if (!storedUser) return null;

//     return JSON.parse(storedUser);
//   } catch (error) {
//     console.error("Lỗi khi lấy user từ localStorage:", error);
//     return null;
//   }
// };

export interface AllRequests {
  data: RequestsLeave[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RequestsLeave {
  id: number;
  employeeId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  reason: string;
  status: string;
  approvedBy: any;
  createdAt: string;
  employee: Employee;
}

export interface Employee {
  name: string;
  employeeCode: string;
  workInfo: WorkInfo;
}

export interface WorkInfo {
  department: string;
  position: string;
}

type LeaveFilters = {
  page?: number;
  pageSize?: number;
  name?: string;
  employeeCode?: string;
  department?: string;
  status?: string;
};

export async function fetchLeaveRequests(filters: LeaveFilters = {}) {
  const queryParams = new URLSearchParams();

  // Thêm từng biến vào query nếu có giá trị
  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.pageSize)
    queryParams.append("pageSize", filters.pageSize.toString());
  if (filters.name) queryParams.append("name", filters.name);
  if (filters.employeeCode)
    queryParams.append("employeeCode", filters.employeeCode);
  if (filters.department) queryParams.append("department", filters.department);
  if (filters.status) queryParams.append("status", filters.status);

  const res = await fetch(`/api/leave/all-requests?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error("Lỗi khi gọi API lấy danh sách nghỉ phép");
  }
  return await res.json();
}
