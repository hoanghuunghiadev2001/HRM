import type { NextApiRequest, NextApiResponse } from "next";
// import prisma from '@/lib/prisma';
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = Number(req.query.id);

  if (isNaN(id))
    return res.status(400).json({ message: "Invalid employee id" });

  if (req.method === "PUT") {
    try {
      const {
        employeeCode,
        name,
        gender,
        birthDate,
        password,
        role,

        workInfo,
        personalInfo,
        contactInfo,
        otherInfo,
      } = req.body;

      const dataToUpdate: any = {
        employeeCode,
        name,
        gender,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        role,
      };

      // Nếu có password mới thì hash
      if (password) {
        dataToUpdate.password = await bcrypt.hash(password, 10);
      }

      // Cập nhật nhân viên
      const updatedEmployee = await prisma.employee.update({
        where: { id },
        data: {
          ...dataToUpdate,
          workInfo: workInfo
            ? {
                upsert: {
                  update: workInfo,
                  create: workInfo,
                },
              }
            : undefined,
          personalInfo: personalInfo
            ? {
                upsert: {
                  update: personalInfo,
                  create: personalInfo,
                },
              }
            : undefined,
          contactInfo: contactInfo
            ? {
                upsert: {
                  update: contactInfo,
                  create: contactInfo,
                },
              }
            : undefined,
          otherInfo: otherInfo
            ? {
                upsert: {
                  update: otherInfo,
                  create: otherInfo,
                },
              }
            : undefined,
        },
        include: {
          workInfo: true,
          personalInfo: true,
          contactInfo: true,
          otherInfo: true,
        },
      });

      res.status(200).json(updatedEmployee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }

  if (req.method === "DELETE") {
    try {
      // Xóa employee
      await prisma.employee.delete({
        where: { id },
      });

      res.status(204).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  }
}
