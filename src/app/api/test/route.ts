/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import ZKLib from "node-zklib";

const MACHINES = [
  { ip: "192.168.48.49", port: 4370 },
  { ip: "192.168.48.48", port: 4370 },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qDate = url.searchParams.get("date"); // "YYYY-MM-DD"
  const targetDate = qDate ?? new Date().toISOString().split("T")[0];

  const allLogs: any[] = [];
  const deviceInfos: any[] = [];
  const errors: string[] = [];

  for (const { ip, port } of MACHINES) {
    const zk = new ZKLib(ip, port, 10000, 4000);
    try {
      await zk.createSocket();
      const deviceInfo = await zk.getInfo();
      const logs = await zk.getAttendances();
      await zk.disconnect();

      // Lọc log theo ngày targetDate
      const filteredLogs = logs.data.filter((log: any) => {
        if (!log.recordTime) return false;
        const logDate = new Date(log.recordTime).toISOString().split("T")[0];
        return logDate === targetDate;
      });

      allLogs.push(...filteredLogs);
      deviceInfos.push({
        ip,
        info: deviceInfo,
        logsCount: filteredLogs.length,
      });
    } catch (err: any) {
      console.error(`❌ Lỗi máy ${ip}:`, err);
      errors.push(`Máy ${ip}: ${err.message || err.toString()}`);
      try {
        await zk.disconnect();
      } catch {}
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    date: targetDate,
    totalLogs: allLogs.length,
    devices: deviceInfos,
    errors,
    logs: allLogs,
  });
}
