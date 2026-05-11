"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// Lightweight developer-mode guard.
// Dev mode is activated by entering the dev password in Settings → Developer.
// The flag persists in localStorage so the user stays in dev mode across
// page refreshes until they explicitly deactivate.

const STORAGE_KEY = "erpbuilder:dev-mode";
const EVENT_KEY = "erpbuilder:dev-mode-change";

export function useDevMode() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [isDevModeActive, setIsDevModeActive] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    const onChange = (e: Event) => {
      const ce = e as CustomEvent<boolean>;
      setIsDevModeActive(ce.detail);
    };
    window.addEventListener(EVENT_KEY, onChange);
    return () => window.removeEventListener(EVENT_KEY, onChange);
  }, []);

  const activate = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setIsDevModeActive(true);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: true }));
  }, []);

  const deactivate = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setIsDevModeActive(false);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: false }));
  }, []);

  // Admin users are always in dev mode effectively, or we can use the manual toggle.
  // We combine the explicit toggle with the admin role.
  return { 
    isDevMode: isAdmin || isDevModeActive, 
    activate, 
    deactivate 
  };
}
