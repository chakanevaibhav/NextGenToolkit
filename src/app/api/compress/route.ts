import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.subscriptionPlan !== "premium" && user.actionsUsed >= 3) {
    return NextResponse.json({ error: "Daily limit reached. Please upgrade to Premium." }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const compressionLevel = formData.get("level") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxFileSizeMB = user.subscriptionPlan === "premium" ? 100 : 10;
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      return NextResponse.json({ error: `File exceeds the ${maxFileSizeMB}MB limit for your plan.` }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create temporary files for ghostscript
    const os = require("os");
    const fs = require("fs");
    const path = require("path");
    const { execFile } = require("child_process");
    const util = require("util");
    const execFileAsync = util.promisify(execFile);

    const tmpDir = os.tmpdir();
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(7);
    const inputPath = path.join(tmpDir, `input_${uniqueId}.pdf`);
    const outputPath = path.join(tmpDir, `output_${uniqueId}.pdf`);

    // Write input buffer to disk
    fs.writeFileSync(inputPath, buffer);

    const gsLevel = compressionLevel === "extreme" ? "/screen" : "/ebook";

    try {
      // Run Ghostscript
      await execFileAsync("gs", [
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        `-dPDFSETTINGS=${gsLevel}`,
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        `-sOutputFile=${outputPath}`,
        inputPath
      ]);

      // Read compressed file
      const compressedBuffer = fs.readFileSync(outputPath);
      const actualCompressedSize = compressedBuffer.byteLength;

      // Clean up temp files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      // Increment action usage since the action was "successful"
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          actionsUsed: { increment: 1 },
          lastActionDate: new Date(),
        },
      });

      // Return the actually compressed file
      return new NextResponse(compressedBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="compressed_${file.name}"`,
          "X-File-Size": actualCompressedSize.toString(),
        },
      });
    } catch (gsError) {
      console.error("Ghostscript error:", gsError);
      // Clean up on failure
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      return NextResponse.json({ error: "Ghostscript compression failed. Please ensure Ghostscript is installed." }, { status: 500 });
    }
  } catch (error) {
    console.error("Compression error:", error);
    return NextResponse.json({ error: "Compression failed" }, { status: 500 });
  }
}
