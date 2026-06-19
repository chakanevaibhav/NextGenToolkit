import { NextResponse } from "next-auth/next";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Reset daily quota if it's a new day
  const today = new Date().setHours(0, 0, 0, 0);
  const lastAction = new Date(user.lastActionDate).setHours(0, 0, 0, 0);

  if (lastAction < today) {
    await prisma.user.update({
      where: { id: user.id },
      data: { actionsUsed: 0, lastActionDate: new Date() },
    });
    user.actionsUsed = 0;
  }

  const maxActions = user.subscriptionPlan === "premium" ? Infinity : 3;
  const maxFileSizeMB = user.subscriptionPlan === "premium" ? 100 : 10;

  return Response.json({
    subscriptionPlan: user.subscriptionPlan,
    actionsUsed: user.actionsUsed,
    maxActions,
    maxFileSizeMB,
    canPerformAction: user.subscriptionPlan === "premium" || user.actionsUsed < 3,
  });
}

export async function POST() {
  const session = await getServerSession();

  if (!session || !session.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
  });

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  if (user.subscriptionPlan !== "premium" && user.actionsUsed >= 3) {
    return Response.json({ error: "Daily limit reached. Please upgrade to Premium." }, { status: 403 });
  }

  // Increment action
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      actionsUsed: { increment: 1 },
      lastActionDate: new Date(),
    },
  });

  return Response.json({ success: true });
}
