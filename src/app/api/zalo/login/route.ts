/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/zalo/login/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const APP_ID = process.env.ZALO_APP_ID!;
const REDIRECT_URI = process.env.ZALO_REDIRECT_URI!;

export async function GET(req: Request) {
  // tạo state chống CSRF
  const state = randomUUID();
  console.log(APP_ID, REDIRECT_URI);
  // URL redirect đến Zalo login
  const url = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&state=${state}&scope=openid`;

  return NextResponse.redirect(url);
}
