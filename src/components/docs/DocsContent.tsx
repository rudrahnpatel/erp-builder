"use client";

import { useState, useEffect, useRef } from "react";
import { RiMenuLine } from "react-icons/ri";
import { DocsSidebar, ALL_SECTION_IDS } from "./DocsSidebar";
import {
  SectionGettingStarted,
  SectionModules,
  SectionPageBuilder,
} from "./DocsSections1";
import { SectionSchema, SectionPlugins, SectionTenantAccess } from "./DocsSections2";

export function DocsContent() {
  const [activeSection, setActiveSection] = useState(ALL_SECTION_IDS[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  /* Scroll-spy */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ALL_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      {/* Hide all native scrollbars in the docs layout */}
      <style>{`
        .docs-sidebar-nav::-webkit-scrollbar { display: none; }
        .docs-sidebar-nav { scrollbar-width: none; -ms-overflow-style: none; }
        .docs-main::-webkit-scrollbar { width: 6px; }
        .docs-main::-webkit-scrollbar-track { background: transparent; }
        .docs-main::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 999px;
        }
        .docs-main::-webkit-scrollbar-thumb:hover {
          background: var(--foreground-dimmed);
        }
      `}</style>

      <div
        className="flex h-[100dvh] overflow-hidden"
        style={{ background: "var(--background)" }}
      >
        {/* Desktop Sidebar */}
        <div
          className="hidden md:flex shrink-0 w-[240px] h-full border-r"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <DocsSidebar activeSection={activeSection} />
        </div>

        {/* Mobile overlay */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-[240px] md:hidden shadow-2xl border-r" style={{ borderColor: "var(--border-subtle)" }}>
              <DocsSidebar activeSection={activeSection} onClose={() => setMobileOpen(false)} />
            </div>
          </>
        )}

        {/* Main scroll area */}
        <div ref={contentRef} className="docs-main flex-1 overflow-y-auto">
          {/* Mobile topbar */}
          <div
            className="sticky top-0 z-30 flex items-center gap-3 px-4 h-12 border-b md:hidden"
            style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}
          >
            <button
              onClick={() => setMobileOpen(true)}
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--surface-2)", color: "var(--foreground-muted)" }}
              aria-label="Open menu"
            >
              <RiMenuLine className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
              Mosaic Docs
            </span>
          </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
            <SectionGettingStarted />
            <SectionModules />
            <SectionPageBuilder />
            <SectionSchema />
            <SectionPlugins />
            <SectionTenantAccess />
          </div>
        </div>
      </div>
    </>
  );
}
