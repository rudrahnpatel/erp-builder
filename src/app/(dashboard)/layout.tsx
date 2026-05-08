"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { useWorkspace } from "@/hooks/use-workspace";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { workspace, isLoading } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && workspace?.slug?.startsWith("u-")) {
      router.push("/onboarding");
    }
  }, [workspace, isLoading, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="flex h-[100dvh] w-full overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Noise overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {/* ── Desktop Sidebar — always visible on md+ ── */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile Sidebar — overlay drawer ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{
            background: "oklch(0.08 0.020 260 / 0.55)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:hidden transform transition-transform duration-300 ease-[var(--ease-out-expo)] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6"
        >
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
