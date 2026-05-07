"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Blocks,
  Database,
  LayoutDashboard,
  Puzzle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Blocks,
    eyebrow: "01 · Modules",
    title: "A marketplace, not a template dump",
    desc: "Inventory, CRM, HR & payroll, finance — each pack ships with schemas, pages and sensible defaults. Install in one click, then bend it to your business.",
    accentVar: "--accent-blue",
    // Comes from left
    from: { x: -120, y: -60, rotation: -8 },
  },
  {
    icon: Database,
    eyebrow: "02 · Schema",
    title: "Schema designer that respects your data",
    desc: "Tables, relations, validations — visually. No hand-written migrations, no re-deploys, no downtime.",
    accentVar: "--accent-emerald",
    // Comes from top
    from: { x: 60, y: -120, rotation: 6 },
  },
  {
    icon: LayoutDashboard,
    eyebrow: "03 · Pages",
    title: "Compose pages like Lego, not Photoshop",
    desc: "Drop in tables, kanban boards, charts and forms. Wire them to schemas with a click. Ship the view your team actually uses.",
    accentVar: "--accent-amber",
    // Comes from bottom
    from: { x: -60, y: 120, rotation: -6 },
  },
  {
    icon: Puzzle,
    eyebrow: "04 · Plugins",
    title: "WhatsApp, GST, Razorpay — already wired",
    desc: "Send invoices over WhatsApp. Generate GST-compliant PDFs. Accept payments on Razorpay. Zero code, zero glue.",
    accentVar: "--accent-violet",
    // Comes from right
    from: { x: 120, y: 60, rotation: 8 },
  },
];

export function PuzzleFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate heading
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Animate each card from its unique direction
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const f = features[i];

        gsap.fromTo(
          card,
          {
            opacity: 0,
            x: f.from.x,
            y: f.from.y,
            rotation: f.from.rotation,
            scale: 0.85,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 1,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
      <div ref={headingRef} className="mb-14 max-w-2xl" style={{ opacity: 0 }}>
        <p
          className="text-[11px] uppercase tracking-[0.14em] mb-3"
          style={{
            color: "var(--foreground-dimmed)",
            fontFamily: "var(--font-mono)",
          }}
        >
          / what you get
        </p>
        <h2
          className="text-3xl sm:text-4xl font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Four pieces. One ERP that fits.
        </h2>
        <p
          className="text-base mt-4 leading-relaxed max-w-xl"
          style={{ color: "var(--foreground-muted)" }}
        >
          Each piece is powerful on its own. Together, they become the only
          platform your team needs.
        </p>
      </div>

      <div ref={containerRef} className="grid lg:grid-cols-12 gap-5">
        {features.map((f, i) => (
          <div
            key={f.title}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className={`group rounded-2xl p-7 sm:p-8 card-interactive relative ${
              i === 0 || i === 3 ? "lg:col-span-7" : "lg:col-span-5"
            }`}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-subtle)",
              opacity: 0,
            }}
          >
            {/* Puzzle connector notch — decorative */}
            {i < features.length - 1 && (
              <div
                className="absolute -right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full z-10 hidden lg:block"
                style={{
                  background: `var(${f.accentVar})`,
                  boxShadow: `0 0 12px color-mix(in oklch, var(${f.accentVar}), transparent 60%)`,
                  opacity: 0.6,
                }}
              />
            )}

            <div className="flex items-start justify-between mb-6">
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center"
                style={{
                  background: `color-mix(in oklch, var(${f.accentVar}), transparent 88%)`,
                  color: `var(${f.accentVar})`,
                }}
              >
                <f.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span
                className="text-[10px] uppercase tracking-[0.14em]"
                style={{
                  color: "var(--foreground-dimmed)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {f.eyebrow}
              </span>
            </div>
            <h3
              className="text-xl font-semibold mb-2.5 leading-snug"
              style={{ color: "var(--foreground)" }}
            >
              {f.title}
            </h3>
            <p
              className="text-sm leading-relaxed max-w-[52ch]"
              style={{ color: "var(--foreground-muted)" }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
