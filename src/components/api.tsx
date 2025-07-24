export interface EmployeeCreateData {
  employeeCode: string; // Mã nhân viên
  name: string; // Họ tên
  gender: string; // Giới tính
  birthDate: string; // Ngày sinh (ISO string hoặc định dạng yyyy-mm-dd)
  password: string; // Mật khẩu
  role: string; // Vai trò
  avatarBase64: string | null; // Ảnh đại diện (Base64) hoặc null

  workInfo: {
    department: string; // Phòng ban
    position: string; // Chức vụ
    specialization: string; // Chuyên môn
    joinedTBD: string; // Ngày vào TBD
    joinedTeSCC: string; // Ngày vào TeSCC
    seniorityStart: string; // Ngày tính thâm niên
    seniority: number | null; // Số năm thâm niên
    contractNumber: string; // Số hợp đồng
    contractDate: string; // Ngày ký hợp đồng
    contractType: string; // Loại hợp đồng
    contractEndDate: string; // Ngày hết hạn hợp đồng
  };

  personalInfo: {
    identityNumber: string; // Số CMND/CCCD
    issueDate: string; // Ngày cấp
    issuePlace: string; // Nơi cấp
    hometown: string; // Quê quán
    idAddress: string; // Địa chỉ thường trú
    education: string; // Trình độ học vấn
    drivingLicense: string; // Bằng lái xe
    toyotaCertificate: string; // Chứng chỉ Toyota
    taxCode: string; // Mã số thuế
    insuranceNumber: string; // Số sổ BHXH
    insuranceSalary: number; // Mức lương đóng BHXH
  };

  contactInfo: {
    phoneNumber: string; // SĐT cá nhân
    relativePhone: string; // SĐT người thân
    companyPhone: string; // SĐT công ty
    email: string; // Email cá nhân hoặc công ty
  };

  otherInfo: {
    workStatus: string; // Trạng thái làm việc (Đang làm/Nghỉ việc)
    resignedDate: string | null; // Ngày nghỉ việc (nếu có)
    documentsChecked: string; // Đã kiểm tra hồ sơ
    updatedAt: string; // Ngày cập nhật gần nhất
    VCB: string; // Tài khoản Vietcombank
    MTCV: string; // Mã tiêu chuẩn công việc
    PNJ: string; // Có tham gia PNJ?
  };
}

export interface EmployeesSumary {
  id: string;
  employeeCode: string;
  name: string;
  gender: string;
  avatar: string;
  workInfo: WorkInfo;
}

export interface WorkInfo {
  department?: Department;
  position?: Position;
}
export interface Department {
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
  insuranceNumber: number | string;
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
  department?: Department;
  position?: Position;
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
  resignedDate: string;
  documentsChecked: string;
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
  approvedBy: string;
}

export interface Employee {
  name: string;
  employeeCode: string;
  avatar: string;
  workInfo: WorkInfo;
}

export interface FormattedEmployee {
  id: string;
  name: string;
  avatar: string | null;
  email: string | null;
  position: string | null;
}

export interface CreateProposalRequest {
  name: string
  title: string
  description?: string
  file?: File // Thay đổi từ fileUrl thành file
  proposerId: number
  signerIds: number[]
  approverIds: number[]
}

// Thêm interface cho form data
export interface CreateProposalFormData {
  name: string
  title: string
  description?: string
  proposerId: number
  signerIds: number[]
  approverIds: number[]
}

export interface ProposalResponse {
  id: number
  name: string
  title: string
  status: string
  createdAt: string
}

export interface SignApproveRequest {
  proposalId: number
  employeeId: number
  action: "sign" | "approve"
  status: "approved" | "rejected"
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
      return data;
    } else {
      console.error("Không lấy được dữ liệu user");
    }
  } catch (error) {
    console.error("Lỗi khi gọi API /api/me:", error);
  } finally {
  }

  return () => controller.abort();
};

// export const getUserFromLocalStorage = () => {
//   if (typeof window === "undefined") {
//     // Chạy trên server, không có localStorage
//     return null;
//   }

//   try {
//     const storedUser = localStorage.getItem("user");
//     if (!storedUser) return null;
//     console.log(storedUser);

//     return JSON.parse(storedUser);
//   } catch {
//     return null;
//   }
// };

export const getUserFromLocalStorage = () => {
  if (typeof window === "undefined") return null; // chỉ chạy trên trình duyệt
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Lỗi khi lấy user từ localStorage:", error);
    return null;
  }
};

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
  approvedBy: string;
  createdAt: string;
  employee: Employee;
}

export interface Employee {
  name: string;
  employeeCode: string;
  workInfo: WorkInfo;
}

type LeaveFilters = {
  page: number;
  pageSize: number;
  role: string;
  department: string;
  employeeCode: string;
  name: string;
  status: string;
};

type LeavePendingFilters = {
  role: string;
  department: string;
  name: string;
  employeeCode: string;
};

type EmployeeFilters = {
  workStatus?: string;
  page?: number;
  pageSize?: number;
  role: string; // "ADMIN" | "MANAGER"
  department?: string;
  name?: string;
  employeeCode?: string;
};

export async function fetchLeaveRequests(
  filters: LeaveFilters = {
    page: 0,
    pageSize: 0,
    role: "",
    department: "",
    employeeCode: "",
    name: "",
    status: "",
  }
) {
  const queryParams = new URLSearchParams();

  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.pageSize)
    queryParams.append("pageSize", filters.pageSize.toString());
  if (filters.role) queryParams.append("role", filters.role);
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

export async function getApiAllRequestsNeedApprove(
  filters: LeavePendingFilters
) {
  const queryParams = new URLSearchParams();

  if (filters.role) queryParams.append("role", filters.role);
  if (filters.department) queryParams.append("department", filters.department);
  if (filters.name) queryParams.append("name", filters.name);
  if (filters.employeeCode) queryParams.append("userId", filters.employeeCode);

  const res = await fetch(
    `/api/leave/all-requests-need-approve?${queryParams.toString()}`
  );

  if (!res.ok) {
    throw new Error("Lỗi khi lấy danh sách đơn cần duyệt");
  }

  return await res.json();
}

// export async function fetchPendingLeaveRequests(
//   filters: LeavePendingFilters = {
//     role: "",
//     department: "",
//   }
// ) {
//   const queryParams = new URLSearchParams();
//   if (filters.role) queryParams.append("role", filters.role);
//   if (filters.department) queryParams.append("department", filters.department);

//   const res = await fetch(
//     `/api/leave/all-requests-need-approve?${queryParams.toString()}`
//   );

//   if (!res.ok) {
//     throw new Error("Lỗi khi gọi API lấy đơn nghỉ đang chờ duyệt");
//   }

//   return await res.json();
// }

export async function approveLeaveRequest(
  id: number | string,
  status: string,
  approvedByName: string
) {
  const res = await fetch("/api/leave/approve", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ leaveRequestId: id, status, approvedByName }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Lỗi khi phê duyệt đơn");
  }

  return await res.json();
}

// lấy danh sách nhân sự
export async function fetchEmployeeSummary(
  filters: EmployeeFilters = {
    workStatus: "",
    role: "MANAGER",
    department: "",
    name: "",
    employeeCode: "",
    page: 1,
    pageSize: undefined,
  }
) {
  const queryParams = new URLSearchParams();
  if (filters.workStatus)
    queryParams.append("workStatus", filters.workStatus.toString());

  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.pageSize)
    queryParams.append("pageSize", filters.pageSize.toString());
  if (filters.role) queryParams.append("role", filters.role);
  if (filters.department) queryParams.append("department", filters.department);
  if (filters.name) queryParams.append("name", filters.name);
  if (filters.employeeCode)
    queryParams.append("employeeCode", filters.employeeCode);

  const res = await fetch(`/api/employees/summary?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error("Lỗi khi gọi API lấy danh sách nhân viên");
  }

  return await res.json();
}
