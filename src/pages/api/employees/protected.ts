import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/middleware/requireAuth";
import prisma from "@/lib/prisma";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const employees = await prisma.employee.findMany();
    return res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch employees" });
  }
}

export default requireAuth(handler, "ADMIN");
