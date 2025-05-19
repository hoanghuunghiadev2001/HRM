// pages/api/me.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const user = await prisma.employee.findUnique({
      where: { id: decoded.id },

      select: {
        id: true,
        name: true,
        avatar: true,
        employeeCode: true,
        role: true,
        workInfo: {
          select: {
            department: true,
            position: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}
