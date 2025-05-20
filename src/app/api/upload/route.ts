import { writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("image") as File;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);

  // Tạo thư mục nếu chưa tồn tại (nếu muốn)
  // import fs from "fs";
  // if (!fs.existsSync(uploadDir)) {
  //   fs.mkdirSync(uploadDir, { recursive: true });
  // }

  await writeFile(filepath, buffer);

  const imageUrl = `/uploads/${filename}`;
  return NextResponse.json({ imageUrl });
}
