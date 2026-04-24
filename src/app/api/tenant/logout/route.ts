import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { slug } = await req.json();
  if (!slug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }
  const cookieStore = await cookies();
  cookieStore.delete(`tenant_auth_${slug}`);
  return NextResponse.json({ success: true });
}
