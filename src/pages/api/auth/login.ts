import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { employeeCode, password, remember } = req.body;

  if (!employeeCode || !password) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ" });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeCode },
    });

    if (!employee || !(await bcrypt.compare(password, employee.password))) {
      return res.status(401).json({ message: "Tài khoản không chính xác" });
    }

    const payload = {
      id: employee.id,
      employeeCode: employee.employeeCode,
      role: employee.role,
    };

    const expiresIn = remember ? "7d" : "1d";

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    const maxAge = remember ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // seconds

    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge,
      })
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
