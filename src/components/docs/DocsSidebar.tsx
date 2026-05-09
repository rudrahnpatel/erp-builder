"use client";

import Link from "next/link";
import { Building2, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const DOC_SECTIONS = [
  {
    title: "Getting Started",
    items: [
      { id: "what-is-mosaic", label: "What is Mosaic?" },
      { id: "two-user-types", label: "Builder vs Tenant" },
      { id: "quick-start", label: "Quick Start (5 min)" },
    ],
  },
  {
    title: "Modules",
    items: [
      { id: "what-are-modules", label: "What are Modules?" },
      { id: "installing-modules", label: "Installing a Module" },
      { id: "available-modules", label: "Available Modules" },
    ],
  },
  {
    title: "Page Builder",
    items: [
      { id: "composing-pages", label: "Composing a Page" },
      { id: "block-types", label: "What Each Block Does" },
      { id: "page-tips", label: "Tips & Tricks" },
    ],
  },
  {
    title: "Tables & Data",
    items: [
      { id: "tables-overview", label: "Tables Overview" },
      { id: "field-types", label: "Field Types" },
      { id: "adding-records", label: "Adding Records" },
    ],
  },
  {
    title: "Plugins",
    items: [
      { id: "what-are-plugins", label: "What are Plugins?" },
      { id: "installing-plugins", label: "Installing a Plugin" },
    ],
  },
  {
    title: "Tenant Access",
    items: [
      { id: "inviting-staff", label: "Inviting Your Staff" },
      { id: "tenant-login", label: "Staff Login" },
    ],
  },
];

export const ALL_SECTION_IDS = DOC_SECTIONS.flatMap((s) =>
  s.items.map((i) => i.id)
);

export function DocsSidebar({
  activeSection,
  onClose,
}: {
  activeSection: string;
  onClose?: () => void;
}) {
  return (
    <aside className="flex flex-col h-full w-full" style={{ background: "var(--surface-1)" }}>
      {/* Header */}
      <div
        className="h-14 flex items-center justify-between px-4 border-b shrink-0"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--primary)" }}
          >
            <Building2 className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Mosaic Docs
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {onClose && (
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "var(--foreground-dimmed)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nav — scrollbar hidden */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 docs-sidebar-nav">
        {DOC_SECTIONS.map((section) => (
          <div key={section.title} className="mb-5">
            <p
              className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={onClose}
                      className="flex items-center gap-2 px-2 py-1.5 text-[13px] rounded-md transition-all duration-150"
                      style={{
                        color: isActive ? "var(--primary)" : "var(--foreground-muted)",
                        background: isActive ? "var(--primary-glow)" : "transparent",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {isActive && (
                        <span
                          className="w-1 h-1 rounded-full shrink-0"
                          style={{ background: "var(--primary)" }}
                        />
                      )}
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Link
          href="/workspace"
          className="text-xs transition-colors"
          style={{ color: "var(--foreground-dimmed)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--foreground-dimmed)")}
        >
          ← Back to Builder
        </Link>
      </div>
    </aside>
  );
}
