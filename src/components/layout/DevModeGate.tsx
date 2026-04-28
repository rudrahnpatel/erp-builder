"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDevMode } from "@/hooks/use-dev-mode";

/**
 * Gate component — wraps pages/tables routes and redirects to /settings
 * if the user hasn't activated developer mode.
 */
export function DevModeGate({ children }: { children: React.ReactNode }) {
  const { isDevMode } = useDevMode();
  const router = useRouter();

  useEffect(() => {
    // We wait one tick so hydration settles and localStorage is read.
    // Once stable, if not in dev mode, redirect.
    if (isDevMode === false) {
      // Give a small delay for the hook to read localStorage
      const t = setTimeout(() => {
        const stored = window.localStorage.getItem("erpbuilder:dev-mode");
        if (stored !== "true") {
          router.replace("/settings");
        }
      }, 100);
      return () => clearTimeout(t);
    }
  }, [isDevMode, router]);

  // During initial hydration, show nothing (prevents flash of content)
  if (!isDevMode) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--surface-2)",
              color: "var(--foreground-muted)",
            }}
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--foreground-muted)" }}>
            Developer mode required
          </p>
          <p className="text-xs max-w-xs text-center" style={{ color: "var(--foreground-dimmed)" }}>
            Activate developer mode in Settings to access the page builder and table designer.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
