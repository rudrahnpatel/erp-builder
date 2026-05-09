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

      {/* ─── Features — GSAP puzzle animation ─── */}
      <div id="features">
        <PuzzleFeatures />
      </div>

      {/* ─── How It Works (right after hero) ─── */}
      <div id="how-it-works">
        <HowItWorks />
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
              <img src="/logo/logo.png" alt="Mosaic" className="h-10 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
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
                href="/docs"
                className="transition-colors hover:text-[var(--foreground)]"
              >
                Docs
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
