/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Thiếu token xác thực" }, { status: 401 });
    }

    let employeeId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      employeeId = decoded.id;
    } catch (err) {
      return NextResponse.json({ error: "Token không hợp lệ hoặc đã hết hạn" }, { status: 401 });
    }

    // Lấy tham số phân trang
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const skip = (page - 1) * pageSize;

    // 1. Đề xuất đã tạo (tham gia ký hoặc duyệt)
    const created = await prisma.proposal.findMany({
      where: {
        OR: [
          { signers: { some: { signerId: employeeId } } },
          { approvers: { some: { approverId: employeeId } } },
        ],
      },
      include: defaultInclude(),
      skip,
      take: pageSize,
       orderBy: {
    createdAt: "desc",
  },
    });

    const createdTotal = await prisma.proposal.count({
      where: {
        OR: [
          { signers: { some: { signerId: employeeId } } },
          { approvers: { some: { approverId: employeeId } } },
        ],
      },
    });

    // 2. Đề xuất cần ký
    const need_to_sign = await prisma.proposal.findMany({
      where: {
        signers: {
          some: {
            signerId: employeeId,
            status: "pending",
          },
        },
      },
      include: defaultInclude(),
      skip,
      take: pageSize,
       orderBy: {
     updatedAt: "desc",
  },
    });

    const needToSignTotal = await prisma.proposal.count({
      where: {
        signers: {
          some: {
            signerId: employeeId,
            status: "pending",
          },
        },
      },
    });

    // 3. Đề xuất cần phê duyệt
    const need_to_approve = await prisma.proposal.findMany({
      where: {
        approvers: {
          some: {
            approverId: employeeId,
            status: "pending",
          },
        },
        status: "waiting_approval",
      },
      include: defaultInclude(),
      skip,
      take: pageSize,
       orderBy: {
     updatedAt: "desc",
  },
    });

    const needToApproveTotal = await prisma.proposal.count({
      where: {
        approvers: {
          some: {
            approverId: employeeId,
            status: "pending",
          },
        },
        status: "waiting_approval",
      },
    });

    return NextResponse.json({
      page,
      pageSize,
      created: {
        data: created,
        total: createdTotal,
      },
      need_to_sign: {
        data: need_to_sign,
        total: needToSignTotal,
      },
      need_to_approve: {
        data: need_to_approve,
        total: needToApproveTotal,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy proposal:", error);
    return NextResponse.json({ message: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}

// Hàm include mặc định
function defaultInclude() {
  return {
    file: {
      select: {
        id: true,
        filename: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
      },
    },
    proposer: {
      select: {
        id: true,
        name: true,
        employeeCode: true,
      },
    },
    signers: {
      include: {
        signer: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
          },
        },
      },
    },
    approvers: {
      include: {
        approver: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
          },
        },
      },
    },
  };
}
