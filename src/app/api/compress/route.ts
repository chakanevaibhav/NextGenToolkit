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

    // --- PLACEHOLDER FOR COMPRESSION ENGINE ---
    // In a real scenario, this is where you would either:
    // 1. Invoke a child process running Ghostscript (if hosted on a VPS/EC2).
    // 2. Upload to S3 and trigger an AWS Lambda function for heavy lifting to avoid Vercel limits.
    // 3. Call a third-party compression API.
    
    // For this mockup, we'll pretend the file was compressed and return the original.
    const arrayBuffer = await file.arrayBuffer();
    const mockCompressedBuffer = Buffer.from(arrayBuffer); // Mocking it by just taking original
    
    // Increment action usage since the action was "successful"
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        actionsUsed: { increment: 1 },
        lastActionDate: new Date(),
      },
    });

    // Return the "compressed" file
    return new NextResponse(mockCompressedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="compressed_${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Compression error:", error);
    return NextResponse.json({ error: "Compression failed" }, { status: 500 });
  }
}
