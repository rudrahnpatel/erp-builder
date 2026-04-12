/**
 * Slug rules for tenant subdomains. One source of truth used by the
 * onboarding launch route, the availability check route, and (eventually)
 * any admin tooling that manipulates workspace slugs.
 *
 * Rules:
 *   - lowercase a-z, 0-9, hyphen
 *   - 3..32 characters
 *   - no leading/trailing hyphen, no consecutive hyphens
 */

const MIN_LEN = 3;
const MAX_LEN = 32;

/** Reserved words we never let a tenant claim. */
export const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "apps",
  "api",
  "admin",
  "dashboard",
  "workspace",
  "onboarding",
  "auth",
  "login",
  "signup",
  "marketplace",
  "plugins",
  "modules",
  "schema",
  "pages",
  "settings",
  "billing",
  "support",
  "docs",
  "status",
  "test",
  "demo",
  "staging",
  "dev",
]);

/**
 * Normalize raw user input into a slug. Returns an empty string if the input
 * can't produce a legal slug.
 */
export function normalizeSlug(raw: string): string {
  if (typeof raw !== "string") return "";
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (cleaned.length < MIN_LEN || cleaned.length > MAX_LEN) return "";
  return cleaned;
}

/** Describe why a slug is invalid, for user-facing errors. */
export function slugProblem(raw: string): string | null {
  if (!raw) return "Pick a subdomain first.";
  const cleaned = normalizeSlug(raw);
  if (!cleaned) {
    if (raw.length < MIN_LEN) return `Too short — at least ${MIN_LEN} characters.`;
    if (raw.length > MAX_LEN) return `Too long — at most ${MAX_LEN} characters.`;
    return "Only lowercase letters, numbers, and hyphens.";
  }
  if (RESERVED_SLUGS.has(cleaned)) return "That subdomain is reserved.";
  return null;
}
