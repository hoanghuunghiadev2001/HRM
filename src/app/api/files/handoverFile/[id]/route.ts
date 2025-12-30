import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id);

    if (Number.isNaN(id)) {
      return new Response("Invalid id", { status: 400 });
    }

    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      return new Response("File not found", { status: 404 });
    }

    // 🔹 CHUYỂN data -> ArrayBuffer "chuẩn"
    const safeArray = new Uint8Array(file.data); // tạo bản copy an toàn
    const arrayBuffer = safeArray.buffer;

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Content-Length": file.fileSize.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("GET /api/files/[id] error:", err);
    return new Response("Server error", { status: 500 });
  }
}
