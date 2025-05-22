import { axiosClient } from "./axiosClient";
import {
  AttendanceResponse,
  employeeAddAttendance,
  InfoEmployee,
  UseAttendanceParams,
} from "./interface";

export async function logoutApi(): Promise<{
  success: boolean;
  message?: string;
}> {
  const res = await axiosClient.post("/auth/logout");
  return res.data;
}

export async function fetchEmployeeByCode(employeeCode: string) {
  try {
    const res = await axiosClient.get<InfoEmployee>(
      `/employees/${employeeCode}`
    );
    return { status: 1, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy nhân viên:", error);
    return { status: 0 };
  }
}

export async function updateEmployee(employeeCode: string, data: InfoEmployee) {
  try {
    const res = await axiosClient.patch<InfoEmployee>(
      `/employees/${employeeCode}`,
      data
    );
    return { status: 1, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy nhân viên:", error);
    return { status: 0 };
  }
}

export const fetchAttendances = async (params: UseAttendanceParams) => {
  try {
    const res = await axiosClient.get<AttendanceResponse>("/attendance", {
      params,
    });
    return { status: 1, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy nhân viên:", error);
    return { status: 0 };
  }
};

export async function getEmployeeAddAttendance(params: employeeAddAttendance) {
  try {
    const res = await axiosClient.get<InfoEmployee>(`/employees`, {
      params,
    });
    return { status: 1, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy nhân viên:", error);
    return { status: 0 };
  }
}

// const fetchUser = async () => {
//   const controller = new AbortController();

//   try {
//     const res = await fetch("/api/me", { signal: controller.signal });
//     if (res.ok) {
//       const data = await res.json();

//       // ✅ Lưu user vào localStorage
//       localStorage.setItem("user", JSON.stringify(data));
//       return data;
//     } else {
//       console.error("Không lấy được dữ liệu user");
//     }
//   } catch (error) {
//     console.error("Lỗi khi gọi API /api/me:", error);
//   } finally {
//   }

//   return () => controller.abort();
// };

// export function useAttendances(params: UseAttendanceParams, anable: boolean) {
//   // Đặt default page=1, pageSize=20 nếu không có params truyền vào
//   const { msnv, name, fromDate, toDate, page = 1, pageSize = 20 } = params;

//   return useQuery({
//     queryKey: ["attendances", msnv, name, fromDate, toDate, page, pageSize],
//     queryFn: () =>
//       fetchAttendances({ msnv, name, fromDate, toDate, page, pageSize }),
//     enabled: anable,
//   });
// }
