"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, Globe, Shield, HeartHandshake } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const whyUs = [
  {
    icon: Zap,
    title: "Live in minutes, not months",
    desc: "Install a module, configure schemas, deploy. Your custom ERP can be live before your first chai break.",
    accentVar: "--accent-blue",
  },
  {
    icon: Globe,
    title: "Built for India, not bolted on",
    desc: "GST compliance, INR-first invoicing, UPI payments, Hindi language support — not afterthoughts, but core features.",
    accentVar: "--accent-emerald",
  },
  {
    icon: Shield,
    title: "You own your data. Period.",
    desc: "Your data stays in your workspace. No cross-tenant analytics, no selling your business graph to investors.",
    accentVar: "--accent-violet",
  },
  {
    icon: HeartHandshake,
    title: "No consultants required",
    desc: "We built this for business owners who know their business, not for consultants who charge by the hour to figure it out.",
    accentVar: "--accent-amber",
  },
];

export function WhyUsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 65%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--surface-1)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div ref={headingRef} className="mb-14 max-w-2xl" style={{ opacity: 0 }}>
          <p
            className="text-[11px] uppercase tracking-[0.14em] mb-3"
            style={{
              color: "var(--foreground-dimmed)",
              fontFamily: "var(--font-mono)",
            }}
          >
            / why us
          </p>
          <h2
            className="text-3xl sm:text-4xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Built different. On purpose.
          </h2>
          <p
            className="text-base mt-4 leading-relaxed max-w-xl"
            style={{ color: "var(--foreground-muted)" }}
          >
            We didn&apos;t build another Salesforce clone. We built the ERP
            Indian SMEs have been asking for.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {whyUs.map((item, i) => (
            <div
              key={item.title}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="group rounded-2xl p-7 card-interactive relative overflow-hidden"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border-subtle)",
                opacity: 0,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(300px circle at 30% 30%, color-mix(in oklch, var(${item.accentVar}), transparent 92%), transparent 60%)`,
                }}
              />
              <div className="relative z-10">
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `color-mix(in oklch, var(${item.accentVar}), transparent 88%)`,
                    color: `var(${item.accentVar})`,
                  }}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
