"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  Phone,
  Mail,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function InteractiveCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <section
      ref={sectionRef}
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--background)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="relative overflow-hidden rounded-3xl px-8 sm:px-14 py-14 sm:py-20"
          style={{
            background: `
              radial-gradient(800px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, 
                color-mix(in oklch, var(--primary), transparent 80%), 
                transparent 50%
              ),
              linear-gradient(135deg, 
                color-mix(in oklch, var(--primary), var(--surface-1) 88%), 
                var(--surface-2)
              )
            `,
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-lg)",
            opacity: 0,
          }}
        >
          {/* Animated geometric shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Rotating hexagon */}
            <div
              className="absolute -right-16 -top-16 h-64 w-64 opacity-[0.04]"
              style={{
                border: "2px solid var(--primary)",
                borderRadius: "20%",
                animation: "spin 30s linear infinite",
              }}
            />
            <div
              className="absolute -left-10 -bottom-10 h-48 w-48 opacity-[0.04]"
              style={{
                border: "2px solid var(--primary)",
                borderRadius: "30%",
                animation: "spin 25s linear infinite reverse",
              }}
            />
            {/* Floating dots pattern */}
            <div
              className="absolute right-20 top-10 h-2 w-2 rounded-full opacity-20"
              style={{
                background: "var(--primary)",
                animation: "float 6s ease-in-out infinite",
              }}
            />
            <div
              className="absolute right-40 top-32 h-1.5 w-1.5 rounded-full opacity-15"
              style={{
                background: "var(--accent-emerald)",
                animation: "float 8s ease-in-out infinite 1s",
              }}
            />
            <div
              className="absolute left-1/3 bottom-16 h-2.5 w-2.5 rounded-full opacity-10"
              style={{
                background: "var(--accent-violet)",
                animation: "float 7s ease-in-out infinite 2s",
              }}
            />
          </div>

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-10 lg:col-start-2 text-center flex flex-col items-center">
              <div className="flex items-center gap-2 mb-5 justify-center">
                <Sparkles
                  className="h-5 w-5"
                  style={{ color: "var(--primary)" }}
                />
                <p
                  className="text-[11px] uppercase tracking-[0.14em] font-medium"
                  style={{
                    color: "var(--primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  / let&apos;s build together
                </p>
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight"
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-display)",
                }}
              >
                Ready to stop{" "}
                <em
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    color: "var(--primary)",
                  }}
                >
                  fighting
                </em>{" "}
                your ERP?
              </h2>
              <p
                className="text-base mt-4 max-w-xl leading-relaxed mx-auto"
                style={{ color: "var(--foreground-muted)" }}
              >
                Book a 15-minute call or start building right now. We&apos;ll
                walk you through every feature to ensure it&apos;s the right
                fit for your business.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 w-full">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="gap-3 text-lg px-10 h-14 w-full sm:w-auto font-bold rounded-xl group shadow-lg shadow-primary/10"
                  >
                    <Zap className="h-5 w-5 transition-transform group-hover:scale-110" />
                    Start building, free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 text-lg px-10 h-14 w-full sm:w-auto rounded-xl font-medium"
                  >
                    <Phone className="h-5 w-5" />
                    Book a call
                  </Button>
                </Link>
              </div>

              <div
                className="flex items-center justify-center gap-4 mt-6 text-xs flex-wrap"
                style={{ color: "var(--foreground-dimmed)" }}
              >
                {["No credit card", "Free tier", "Made in India "].map(
                  (t) => (
                    <span key={t} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />{" "}
                      {t}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Glow orb */}
          <div
            className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: "var(--primary-glow)" }}
            aria-hidden="true"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </section>
  );
}
