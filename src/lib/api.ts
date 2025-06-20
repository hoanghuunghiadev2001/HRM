import { axiosClient } from "./axiosClient";
import {
  AttendanceResponse,
  employeeAddAttendance,
  InfoEmployee,
  interfaceChangePassword,
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
    const res = await axiosClient.get<InfoEmployee>(`/addAttendance`, {
      params,
    });
    return { status: 1, data: res.data };
  } catch (error) {
    console.error("Lỗi khi lấy nhân viên:", error);
    return { status: 0 };
  }
}

export async function postchangePassword(params: interfaceChangePassword) {
  try {
    const res = await axiosClient.post("/employees/changePassword", params);
    return { status: 1, data: res.data };
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    return { status: 0, message: error || "Lỗi hệ thống" };
  }
}

export async function changeEmployeePassword(
  employeeCode: string,
  newPassword: string
) {
  try {
    const res = await axiosClient.patch(
      `/employees/${employeeCode}/changePassword`,
      {
        newPassword,
      }
    );
    return { status: 1, data: res.data };
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    return {
      status: 0,
      message: error || "Lỗi hệ thống",
    };
  }
}

export async function deleteEmployeeApi(employeeCode: string) {
  try {
    await axiosClient.delete(`/employees/${employeeCode}/delete`);
    return { status: 1, message: "xóa thành công" };
  } catch (error) {
    console.error("có lỗi khi xóa:", error);
    return {
      status: 0,
      message: error || "Lỗi hệ thống",
    };
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
