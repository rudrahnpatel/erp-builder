"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  UserPlus,
  Blocks,
  Rocket,
  ChevronRight,
  Check,
  Building2,
  LayoutDashboard,
  Database,
  Puzzle,
  FileText,
  Shield,
  Zap,
  Users,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up in 30 seconds. No credit card, no commitments. You get a workspace with a custom subdomain instantly.",
    icon: UserPlus,
    accentVar: "--accent-blue",
    // Visual: login screen mockup
    visual: "login",
  },
  {
    step: "02",
    title: "Pick your modules & plugins",
    desc: "Browse our marketplace — install Inventory, CRM, HR, Finance, or any combination. Add plugins like WhatsApp, GST, Razorpay.",
    icon: Blocks,
    accentVar: "--accent-emerald",
    // Visual: marketplace grid
    visual: "marketplace",
  },
  {
    step: "03",
    title: "Build & deploy your ERP",
    desc: "Configure schemas, compose pages, wire up plugins — then deploy. Your team gets a live ERP at yourname.erpbuilder.app.",
    icon: Rocket,
    accentVar: "--accent-violet",
    // Visual: dashboard deployed
    visual: "deployed",
  },
];

function LoginVisual() {
  return (
    <div
      className="rounded-xl p-6 text-[11px]"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center"
          style={{ background: "var(--primary)" }}
        >
          <Building2 className="h-3.5 w-3.5 text-white" />
        </div>
        <span
          className="font-semibold text-sm"
          style={{ color: "var(--foreground)" }}
        >
          The Ledger
        </span>
      </div>
      <p
        className="text-lg font-semibold mb-1"
        style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
      >
        Create your workspace
      </p>
      <p
        className="text-xs mb-5"
        style={{ color: "var(--foreground-dimmed)" }}
      >
        Get started in 30 seconds — it&apos;s free.
      </p>
      {/* Mock form fields */}
      <div className="space-y-3">
        <div>
          <label
            className="block text-[10px] font-medium mb-1"
            style={{ color: "var(--foreground-muted)" }}
          >
            Business name
          </label>
          <div
            className="h-9 rounded-lg px-3 flex items-center text-xs"
            style={{
              background: "var(--surface-sunken)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            Acme Enterprises
          </div>
        </div>
        <div>
          <label
            className="block text-[10px] font-medium mb-1"
            style={{ color: "var(--foreground-muted)" }}
          >
            Email
          </label>
          <div
            className="h-9 rounded-lg px-3 flex items-center text-xs"
            style={{
              background: "var(--surface-sunken)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            founder@acme.in
          </div>
        </div>
        <div
          className="h-10 rounded-lg flex items-center justify-center text-xs font-medium text-white gap-1.5"
          style={{ background: "var(--primary)" }}
        >
          Create workspace <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}

function MarketplaceVisual() {
  const modules = [
    { name: "Inventory", icon: Database, color: "--accent-blue", installed: true },
    { name: "HR & Payroll", icon: Users, color: "--accent-emerald", installed: true },
    { name: "Finance & GST", icon: Shield, color: "--accent-amber", installed: false },
    { name: "CRM & Sales", icon: Puzzle, color: "--accent-violet", installed: false },
    { name: "Page Builder", icon: FileText, color: "--accent-cyan", installed: true },
    { name: "Automation", icon: Zap, color: "--accent-rose", installed: false },
  ];

  return (
    <div
      className="rounded-xl p-4 text-[11px]"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className="font-semibold text-sm"
          style={{ color: "var(--foreground)" }}
        >
          Marketplace
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{
            background: "color-mix(in oklch, var(--primary), transparent 88%)",
            color: "var(--primary)",
          }}
        >
          3 installed
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {modules.map((mod) => (
          <div
            key={mod.name}
            className="rounded-lg p-3 flex flex-col gap-2 transition-all duration-200"
            style={{
              background: mod.installed
                ? "color-mix(in oklch, var(" + mod.color + "), transparent 92%)"
                : "var(--surface-2)",
              border: mod.installed
                ? `1px solid color-mix(in oklch, var(${mod.color}), transparent 70%)`
                : "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between">
              <mod.icon
                className="h-4 w-4"
                style={{ color: `var(${mod.color})` }}
              />
              {mod.installed && (
                <Check
                  className="h-3 w-3"
                  style={{ color: "var(--success)" }}
                />
              )}
            </div>
            <span
              className="text-[10px] font-medium leading-tight"
              style={{ color: "var(--foreground)" }}
            >
              {mod.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeployedVisual() {
  return (
    <div
      className="rounded-xl overflow-hidden text-[11px]"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Mini browser chrome */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--danger)" }}
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--warning)" }}
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--success)" }}
          />
        </div>
        <div
          className="flex-1 h-5 rounded-md flex items-center px-2 text-[9px]"
          style={{
            background: "var(--surface-sunken)",
            color: "var(--foreground-dimmed)",
          }}
        >
          🔒 acme.erpbuilder.app
        </div>
      </div>
      {/* Mini dashboard */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="h-5 w-5 rounded-md flex items-center justify-center"
            style={{ background: "var(--primary)" }}
          >
            <Building2 className="h-2.5 w-2.5 text-white" />
          </div>
          <span
            className="font-semibold text-xs"
            style={{ color: "var(--foreground)" }}
          >
            Acme ERP
          </span>
          <span
            className="ml-auto flex items-center gap-1 text-[9px]"
            style={{ color: "var(--success)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--success)" }}
            />
            Live
          </span>
        </div>
        {/* Mini sidebar + content */}
        <div className="flex gap-2">
          <div className="w-20 space-y-1">
            {["Dashboard", "Inventory", "HR", "Finance"].map((item, i) => (
              <div
                key={item}
                className="rounded-md px-2 py-1 text-[9px]"
                style={{
                  background: i === 0 ? "var(--primary)" : "transparent",
                  color:
                    i === 0
                      ? "var(--primary-foreground)"
                      : "var(--foreground-dimmed)",
                  fontWeight: i === 0 ? 600 : 400,
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div
            className="flex-1 rounded-lg p-2"
            style={{ background: "var(--surface-sunken)" }}
          >
            <div
              className="text-[10px] font-medium mb-1.5"
              style={{ color: "var(--foreground)" }}
            >
              Welcome back 👋
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: "Modules", value: "4", color: "--primary" },
                { label: "Tables", value: "32", color: "--accent-emerald" },
                { label: "Records", value: "8.2K", color: "--accent-violet" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md p-1.5 text-center"
                  style={{
                    background: `color-mix(in oklch, var(${stat.color}), transparent 90%)`,
                  }}
                >
                  <div
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: `var(${stat.color})` }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-[8px]"
                    style={{ color: "var(--foreground-dimmed)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate section heading
      gsap.fromTo(
        ".hiw-heading",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );

      // Animate each step
      stepRefs.current.forEach((step, i) => {
        if (!step) return;
        gsap.fromTo(
          step,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Auto-advance steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const visuals = [<LoginVisual key="login" />, <MarketplaceVisual key="mp" />, <DeployedVisual key="dep" />];

  return (
    <section
      ref={sectionRef}
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--surface-1)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="hiw-heading mb-14 max-w-2xl" style={{ opacity: 0 }}>
          <p
            className="text-[11px] uppercase tracking-[0.14em] mb-3"
            style={{
              color: "var(--foreground-dimmed)",
              fontFamily: "var(--font-mono)",
            }}
          >
            / how it works
          </p>
          <h2
            className="text-3xl sm:text-4xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            From zero to live ERP in three steps.
          </h2>
          <p
            className="text-base mt-4 leading-relaxed max-w-xl"
            style={{ color: "var(--foreground-muted)" }}
          >
            No consultants. No quarter-long implementations. Just you, your
            business logic, and a platform that gets out of your way.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Steps list */}
          <div className="space-y-2">
            {steps.map((item, i) => {
              const isActive = activeStep === i;
              return (
                <div
                  key={item.step}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  onClick={() => setActiveStep(i)}
                  className="relative rounded-xl p-5 cursor-pointer transition-all duration-300"
                  style={{
                    opacity: 0,
                    background: isActive ? "var(--card)" : "transparent",
                    border: isActive
                      ? "1px solid var(--border-subtle)"
                      : "1px solid transparent",
                    boxShadow: isActive ? "var(--shadow-md)" : "none",
                  }}
                >
                  {/* Progress bar */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full overflow-hidden"
                      style={{ background: "var(--surface-3)" }}
                    >
                      <div
                        className="w-full rounded-full"
                        style={{
                          background: `var(${item.accentVar})`,
                          height: "100%",
                          animation: "progressFill 4s linear forwards",
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: isActive
                          ? `color-mix(in oklch, var(${item.accentVar}), transparent 85%)`
                          : "var(--surface-2)",
                        color: isActive
                          ? `var(${item.accentVar})`
                          : "var(--foreground-dimmed)",
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[10px] font-medium"
                          style={{
                            color: "var(--foreground-dimmed)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          step {item.step}
                        </span>
                      </div>
                      <h3
                        className="text-base font-semibold mb-1"
                        style={{ color: "var(--foreground)" }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: "var(--foreground-muted)",
                          maxHeight: isActive ? "200px" : "0px",
                          overflow: "hidden",
                          opacity: isActive ? 1 : 0,
                          transition:
                            "max-height 0.4s ease, opacity 0.3s ease",
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual preview — sticky on desktop */}
          <div className="lg:sticky lg:top-20">
            <div className="relative">
              {visuals.map((visual, i) => (
                <div
                  key={i}
                  className="transition-all duration-500"
                  style={{
                    opacity: activeStep === i ? 1 : 0,
                    transform:
                      activeStep === i
                        ? "translateY(0) scale(1)"
                        : "translateY(12px) scale(0.97)",
                    position: i === 0 ? "relative" : "absolute",
                    top: i === 0 ? undefined : 0,
                    left: i === 0 ? undefined : 0,
                    right: i === 0 ? undefined : 0,
                    pointerEvents: activeStep === i ? "auto" : "none",
                  }}
                >
                  {visual}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar animation keyframes */}
      <style jsx>{`
        @keyframes progressFill {
          from {
            height: 0%;
          }
          to {
            height: 100%;
          }
        }
      `}</style>
    </section>
  );
}
