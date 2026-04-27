import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

function getHandler(req: NextRequest) {
  // Dynamically set NEXTAUTH_URL to match the request origin in development.
  // This prevents CLIENT_FETCH_ERROR network errors when accessing the app
  // via tenant subdomains (e.g. bon2vin.erpbuilder.app:3000) instead of localhost.
  if (process.env.NODE_ENV !== "production") {
    process.env.NEXTAUTH_URL = req.nextUrl.origin;
  }
  return NextAuth(authOptions);
}

export async function GET(req: NextRequest, ctx: any) {
  return getHandler(req)(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  return getHandler(req)(req, ctx);
}
