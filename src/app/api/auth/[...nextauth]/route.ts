import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth v4 route handler for Next.js 16 App Router.
 *
 * We export individual GET / POST functions so that Next.js can tree-shake
 * and resolve this route file correctly under Turbopack.  The `handler`
 * returned by `NextAuth(options)` already understands the App Router
 * `(request, context)` signature — it awaits `context.params` internally
 * to read the catch-all `[...nextauth]` segments.
 */
const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;

// Force this route to be dynamic — NextAuth endpoints always depend on
// cookies / headers, so static optimisation must be disabled.
export const dynamic = "force-dynamic";
