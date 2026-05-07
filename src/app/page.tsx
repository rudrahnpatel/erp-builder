import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { LandingHero } from "@/components/landing/LandingHero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PuzzleFeatures } from "@/components/landing/PuzzleFeatures";
import { InteractiveCTA } from "@/components/landing/InteractiveCTA";
import { WhyUsSection } from "@/components/landing/WhyUsSection";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/workspace");

  return (
    <div
      id="main-content"
      className="relative"
      style={{ background: "var(--background)" }}
    >
      {/* ─── Hero Section ─── */}
      <LandingHero />

      {/* ─── How It Works (right after hero) ─── */}
      <div id="how-it-works">
        <HowItWorks />
      </div>

      {/* ─── Features — GSAP puzzle animation ─── */}
      <div id="features">
        <PuzzleFeatures />
      </div>

      {/* ─── Why Us ─── */}
      <div id="why-us">
        <WhyUsSection />
      </div>

      {/* ─── CTA — Interactive ─── */}
      <div id="cta">
        <InteractiveCTA />
      </div>

      {/* ─── Footer ─── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--surface-1)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--primary)" }}
              >
                <Building2
                  className="h-3.5 w-3.5 text-white"
                  aria-hidden="true"
                />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--foreground-muted)" }}
              >
                The Ledger
              </span>
              <span
                className="text-xs ml-2"
                style={{
                  color: "var(--foreground-dimmed)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                © 2026
              </span>
            </div>

            <nav
              aria-label="Footer"
              className="flex items-center gap-6 text-xs"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              <Link
                href="#features"
                className="transition-colors hover:text-[var(--foreground)]"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="transition-colors hover:text-[var(--foreground)]"
              >
                How it works
              </Link>
              <Link
                href="/login"
                className="transition-colors hover:text-[var(--foreground)]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="transition-colors hover:text-[var(--foreground)]"
              >
                Sign up
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
