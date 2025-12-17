import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { isActive } = await req.json();
  const id = Number((await params).id);

  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  // Nếu bật MAINTENANCE → tắt maintenance khác
  const current = await prisma.notification.findUnique({
    where: { id },
  });

  if (!current) {
    return NextResponse.json(
      { message: "Notification not found" },
      { status: 404 }
    );
  }

  if (isActive && current.type === "MAINTENANCE") {
    await prisma.notification.updateMany({
      where: {
        type: "MAINTENANCE",
        isActive: true,
        NOT: { id },
      },
      data: { isActive: false },
    });
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);

  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  await prisma.notification.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
