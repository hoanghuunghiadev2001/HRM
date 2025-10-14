/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import ZKLib from "node-zklib";

const ZK_IP = "192.168.48.49"; // IP máy chấm công
const ZK_PORT = 4370; // Port mặc định

export async function GET() {
  const zk = new ZKLib(ZK_IP, ZK_PORT, 10000, 4000);

  try {
    await zk.createSocket();

    const deviceInfo = await zk.getInfo();
    const logs = await zk.getAttendances();

    await zk.disconnect();

    // 🧠 Lấy ngày hiện tại (theo múi giờ hệ thống)
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // "2025-10-14"

    // 🧩 Lọc log có ngày = hôm nay
    const todayLogs = logs.data.filter((log: any) => {
      if (!log.recordTime) return false;
      const logDate = new Date(log.recordTime).toISOString().split("T")[0];
      return logDate === todayString;
    });

    return NextResponse.json({
      success: true,
      message: "Kết nối thành công!",
      device: deviceInfo,
      logs: todayLogs,
    });
  } catch (err: any) {
    console.error("❌ Lỗi kết nối:", err);
    return NextResponse.json({
      success: false,
      error: err.message || err.toString(),
    });
  }
}
