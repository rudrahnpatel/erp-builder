"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, Play, Sun, Moon } from "lucide-react";
import { DashboardPreview } from "./DashboardPreview";

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

function InteractiveDashboard() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  const rotateX = isHovering ? (mousePos.y - 0.5) * -10 : 0;
  const rotateY = isHovering ? (mousePos.x - 0.5) * 10 : 0;

  return (
    <div
      className="relative group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        perspective: "1200px",
      }}
    >
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: isHovering
            ? "transform 0.1s ease-out"
            : "transform 0.5s ease-out",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Shine overlay */}
        <div
          className="absolute inset-0 z-20 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: isHovering
              ? `radial-gradient(600px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.08), transparent 60%)`
              : "none",
          }}
        />
        <DashboardPreview />
      </div>
    </div>
  );
}

function LandingThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300"
      style={{
        background: "var(--hero-badge-bg)",
        border: "1px solid var(--hero-badge-border)",
        backdropFilter: "blur(8px)",
      }}
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <Sun
        className={`h-4 w-4 absolute transition-all duration-300 ${
          resolvedTheme === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-75"
        }`}
        style={{ color: "var(--foreground)" }}
      />
      <Moon
        className={`h-4 w-4 absolute transition-all duration-300 ${
          resolvedTheme === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-75"
        }`}
        style={{ color: "var(--foreground)" }}
      />
    </button>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* ── Background Video ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{
          filter: `brightness(var(--hero-video-brightness)) saturate(var(--hero-video-saturate))`,
        }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
          type="video/mp4"
        />
      </video>

      {/* Theme-aware overlay gradient */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `linear-gradient(180deg, var(--hero-overlay-top) 0%, var(--hero-overlay-mid) 50%, var(--background) 100%)`,
        }}
      />

      {/* ── Navbar ── */}
      <header className="relative z-10">
        <nav
          aria-label="Primary"
          className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-5"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{
                background: "var(--primary)",
                boxShadow: "inset 0 1px 0 oklch(1 0 0 / 0.15)",
              }}
            >
              <Building2
                className="h-4 w-4 text-white"
                aria-hidden="true"
              />
            </div>
            <span
              className="text-xl font-semibold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              The Ledger
            </span>
          </Link>

          {/* Nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Home", href: "/" },
              { label: "Features", href: "#features" },
              { label: "How it Works", href: "#how-it-works" },
              { label: "Contact", href: "#cta" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm transition-colors duration-200 hover:text-[var(--foreground)]"
                style={{ color: "var(--foreground-muted)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + Theme Toggle */}
          <div className="flex items-center gap-3">
            <LandingThemeToggle />
            <Link href="/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className="text-sm">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="gap-1.5 text-sm font-medium rounded-full px-5"
              >
                Start building <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero Content ── */}
      <div className="relative z-10 flex flex-col items-center w-full px-4 sm:px-6 pt-12 sm:pt-20 pb-0">
        {/* Badge */}
        <motion.div {...fadeUp(0)}>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm mb-6"
            style={{
              background: "var(--hero-badge-bg)",
              border: "1px solid var(--hero-badge-border)",
              color: "var(--foreground-muted)",
              fontFamily: "var(--font-body)",
              backdropFilter: "blur(8px)",
            }}
          >
            Built for Indian SMEs · v0.1 ✨
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1)}
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] leading-[0.95] tracking-tight max-w-3xl"
          style={{
            color: "var(--foreground)",
            fontFamily: "var(--font-display)",
          }}
        >
          Build the ERP your business{" "}
          <em
            className="not-italic"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              color: "var(--primary)",
            }}
          >
            actually
          </em>{" "}
          needs.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          {...fadeUp(0.2)}
          className="mt-5 text-center text-base md:text-lg max-w-[650px] leading-relaxed"
          style={{
            color: "var(--foreground-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          Install module packs, configure schemas, compose pages — deploy a
          custom ERP tailored to your business. No consultants. No
          quarter-long implementations. No code.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          {...fadeUp(0.3)}
          className="mt-7 flex items-center gap-3"
        >
          <Link href="/register">
            <Button
              size="lg"
              className="gap-2 text-sm px-6 py-5 font-medium rounded-full"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Start building, free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full border-0 h-12 w-12 p-0"
              style={{
                background: "var(--hero-badge-bg)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Play
                className="h-4 w-4"
                style={{
                  color: "var(--foreground)",
                  fill: "var(--foreground)",
                }}
              />
            </Button>
          </Link>
        </motion.div>

        {/* Interactive Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-10 w-full max-w-5xl"
        >
          <InteractiveDashboard />
        </motion.div>
      </div>
    </section>
  );
}
