import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (renamed from Middleware).
 *
 * Responsibility: subdomain → tenant rewrite.
 *   - <slug>.erpbuilder.app/<path>   →  /apps/<slug>/<path>   (runtime ERP)
 *   - <slug>.localhost:3000/<path>   →  /apps/<slug>/<path>   (dev: browsers
 *                                       auto-resolve *.localhost to 127.0.0.1)
 *   - erpbuilder.app / www.* / apex  →  untouched (builder dashboard)
 *   - localhost:3000 / 127.0.0.1     →  untouched
 *
 * The direct path /apps/<slug>/... also keeps working on the apex domain,
 * which is useful for preview links from the builder and for dev when you
 * don't want to touch the host header.
 *
 * Docs: node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md
 */

// Hostnames that are never treated as a tenant subdomain — the "www" subdomain
// and the common localhost forms all route to the builder apex.
const RESERVED_SUBDOMAINS = new Set(["www", "app"]);

// Apex hosts — anything matching one of these is the apex, and requests to it
// should fall through to the builder routes untouched.
const APEX_HOSTS = new Set([
  "erpbuilder.app",
  "www.erpbuilder.app",
  "localhost:3000",
  "localhost",
  "127.0.0.1:3000",
  "127.0.0.1",
]);

function extractTenantSlug(host: string | null): string | null {
  if (!host) return null;

  // Strip port for apex comparison but keep it for dev (localhost:3000)
  const normalized = host.toLowerCase();
  if (APEX_HOSTS.has(normalized)) return null;

  // Drop the port if present so we only reason about the hostname itself
  const hostname = normalized.split(":")[0];

  // Production: something like "myerp.erpbuilder.app"
  if (hostname.endsWith(".erpbuilder.app")) {
    const sub = hostname.slice(0, -".erpbuilder.app".length);
    if (!sub || sub.includes(".")) return null; // nested subdomains ignored
    if (RESERVED_SUBDOMAINS.has(sub)) return null;
    return sub;
  }

  // Dev: something like "myerp.localhost"
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    if (!sub || sub.includes(".")) return null;
    if (RESERVED_SUBDOMAINS.has(sub)) return null;
    return sub;
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const host = request.headers.get("host");
  const slug = extractTenantSlug(host);

  if (!slug) return NextResponse.next();

  // Already rewritten or hitting the API / static assets — let it through.
  const path = nextUrl.pathname;
  if (
    path.startsWith("/apps/") ||
    path.startsWith("/api/") ||
    path.startsWith("/_next/") ||
    path.startsWith("/favicon") ||
    path === "/robots.txt" ||
    path === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const rewritten = new URL(`/apps/${slug}${path}`, request.url);
  rewritten.search = nextUrl.search;
  return NextResponse.rewrite(rewritten);
}

// Run on every request except static assets and _next internals so we can see
// the host header. The matcher excludes the noisy stuff Proxy doesn't need to
// touch, per the Next 16 proxy docs.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
