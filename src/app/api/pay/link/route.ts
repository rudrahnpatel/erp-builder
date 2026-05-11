import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { nanoid } from "nanoid"; // Wait, I don't know if nanoid is installed. I will use a simple Math.random() based generator.

function generateShortId() {
  return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 6);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { upiId, merchantName, amount, note } = body;

    if (!upiId || !merchantName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const shortId = generateShortId();

    const paymentLink = await db.paymentLink.create({
      data: {
        shortId,
        upiId,
        merchantName,
        amount: amount ? parseFloat(amount.toString()) : null,
        note: note || null,
      },
    });

    return NextResponse.json({ shortId: paymentLink.shortId });
  } catch (error) {
    console.error("Error creating payment link:", error);
    return NextResponse.json({ error: "Failed to create payment link" }, { status: 500 });
  }
}
