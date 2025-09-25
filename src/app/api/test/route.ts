/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "templates", "test.docx");
    const content = fs.readFileSync(filePath, "binary");

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    doc.render({
      username: "Hoàng Hữu Nghĩa",
    });

    // Node Buffer
    const buffer = doc.getZip().generate({
      type: "nodebuffer",
    });

    // ✅ Chuyển Node Buffer -> Uint8Array
    const uint8Array = new Uint8Array(buffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="output.docx"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    });
  } catch (error: any) {
    console.error("generateDocxFromTemplate error:", error);
    return NextResponse.json(
      { error: "Failed to generate DOCX", details: error.message },
      { status: 500 }
    );
  }
}
