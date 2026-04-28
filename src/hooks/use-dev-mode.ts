"use client";

import { useState, useEffect, useCallback } from "react";

// Lightweight developer-mode guard.
// Dev mode is activated by entering the dev password in Settings → Developer.
// The flag persists in localStorage so the user stays in dev mode across
// page refreshes until they explicitly deactivate.

const STORAGE_KEY = "erpbuilder:dev-mode";
const EVENT_KEY = "erpbuilder:dev-mode-change";

/** The one and only dev password — hashed check is intentionally omitted
 *  because this is a front-end-only convenience gate, not a security boundary. */
const DEV_PASSWORD = "bunmaska";

export function validateDevPassword(input: string): boolean {
  return input === DEV_PASSWORD;
}

export function useDevMode() {
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setIsDevMode(stored === "true");

    const onChange = (e: Event) => {
      const ce = e as CustomEvent<boolean>;
      setIsDevMode(ce.detail);
    };
    window.addEventListener(EVENT_KEY, onChange);
    return () => window.removeEventListener(EVENT_KEY, onChange);
  }, []);

  const activate = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setIsDevMode(true);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: true }));
  }, []);

  const deactivate = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setIsDevMode(false);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: false }));
  }, []);

  return { isDevMode, activate, deactivate };
}
