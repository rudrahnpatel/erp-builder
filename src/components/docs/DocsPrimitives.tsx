"use client";

import { ReactNode } from "react";

/* ─── Prose primitives ─── */

export function DocH1({ children }: { children: ReactNode }) {
  return (
    <h1
      className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
      style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
    >
      {children}
    </h1>
  );
}

export function DocH2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="text-xl font-semibold mt-12 mb-3 scroll-mt-24"
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </h2>
  );
}

export function DocP({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-[15px] leading-relaxed mb-4"
      style={{ color: "var(--foreground-muted)" }}
    >
      {children}
    </p>
  );
}

export function DocCallout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "tip";
  children: ReactNode;
}) {
  const styles = {
    info: { bg: "var(--info-subtle)", border: "var(--info)", color: "#818cf8", label: "Note" },
    warning: { bg: "var(--warning-subtle)", border: "var(--warning)", color: "var(--warning)", label: "Heads up" },
    tip: { bg: "var(--success-subtle)", border: "var(--success)", color: "var(--success)", label: "Tip" },
  };
  const s = styles[type];
  return (
    <div
      className="rounded-xl px-4 py-3 mb-5 text-[14px] leading-relaxed"
      style={{ background: s.bg, borderLeft: `3px solid ${s.border}`, color: "var(--foreground-muted)" }}
    >
      <span className="font-semibold mr-1.5" style={{ color: s.color }}>{s.label}:</span>
      {children}
    </div>
  );
}

export function DocSteps({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <ol className="space-y-4 mb-6">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-4">
          <span
            className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
            style={{
              background: "var(--primary-glow)",
              color: "var(--primary)",
              border: "1px solid color-mix(in oklch, var(--primary), transparent 60%)",
            }}
          >
            {i + 1}
          </span>
          <div>
            <p className="text-[14px] font-semibold mb-0.5" style={{ color: "var(--foreground)" }}>
              {s.title}
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
              {s.desc}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DocCards({ items }: { items: { icon: string; title: string; desc: string }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl p-4"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="text-xl mb-2">{item.icon}</div>
          <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--foreground)" }}>
            {item.title}
          </p>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

export function DocList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mb-5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-[14px]" style={{ color: "var(--foreground-muted)" }}>
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--primary)" }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function DocDivider() {
  return <hr className="my-8" style={{ borderColor: "var(--border-subtle)" }} />;
}
