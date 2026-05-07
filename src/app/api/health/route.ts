import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Lightweight keepalive — prevents Neon serverless Postgres from going to sleep
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
