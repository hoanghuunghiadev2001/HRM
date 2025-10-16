/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/zalo/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";

const APP_ID = process.env.ZALO_APP_ID;
const APP_SECRET = process.env.ZALO_APP_SECRET;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code)
    return NextResponse.json({ error: "No code provided" }, { status: 400 });

  // đổi code lấy access_token và zalo_user_id
  const tokenRes = await axios.post(
    "https://oauth.zaloapp.com/v4/access_token",
    null,
    {
      params: {
        app_id: APP_ID,
        app_secret: APP_SECRET,
        code,
        grant_type: "authorization_code",
      },
    }
  );

  const { zalo_user_id } = tokenRes.data;

  // TODO: lấy employeeId hiện tại, ví dụ từ session auth
  const employeeId = 1;

  // lưu zalo_user_id vào ContactInfo
  await prisma.contactInfo.upsert({
    where: { employeeId },
    create: { employeeId, zalo_user_id },
    update: { zalo_user_id },
  });

  return NextResponse.json({ zalo_user_id });
}
