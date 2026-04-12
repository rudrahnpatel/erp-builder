"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-lg bg-[var(--surface-2)] animate-shimmer" />
    );
  }

  const cycleTheme = () => {
    // Temporarily enable smooth transition
    document.documentElement.classList.add("theme-transition");

    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");

    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 400);
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative h-8 w-8 rounded-lg flex items-center justify-center
        hover:bg-[var(--surface-3)] transition-all duration-200 group"
      title={`Theme: ${theme}`}
    >
      {/* Sun icon */}
      <Sun
        className={`h-4 w-4 absolute transition-all duration-300 ${
          resolvedTheme === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-75"
        }`}
        style={{ color: "var(--foreground-muted)" }}
      />
      {/* Moon icon */}
      <Moon
        className={`h-4 w-4 absolute transition-all duration-300 ${
          resolvedTheme === "dark" && theme !== "system"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-75"
        }`}
        style={{ color: "var(--foreground-muted)" }}
      />
      {/* System icon */}
      <Monitor
        className={`h-4 w-4 absolute transition-all duration-300 ${
          theme === "system"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-75"
        }`}
        style={{ color: "var(--foreground-muted)" }}
      />
    </button>
  );
}
