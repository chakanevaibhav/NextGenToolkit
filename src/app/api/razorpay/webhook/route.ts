import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "dummy_secret")
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured" || event.event === "subscription.charged") {
      // Typically, you'd pass user ID in the notes of the order to know which user to upgrade.
      // For this mockup, we'll assume the email matches if provided, or rely on order notes.
      const userEmail = event.payload.payment.entity.email;

      if (userEmail) {
        await prisma.user.update({
          where: { email: userEmail },
          data: { subscriptionPlan: "premium" },
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
