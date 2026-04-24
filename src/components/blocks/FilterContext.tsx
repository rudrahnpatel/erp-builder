"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FilterState {
  query: string;
  setQuery: (q: string) => void;
}

const FilterContext = createContext<FilterState | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  return (
    <FilterContext.Provider value={{ query, setQuery }}>
      {children}
    </FilterContext.Provider>
  );
}

// Safe to call outside a provider — returns a no-op state. Useful so blocks
// can optionally participate in filtering when a FilterBar is on the page,
// without crashing in contexts where there isn't one (e.g. the composer preview).
export function useFilter(): FilterState {
  const ctx = useContext(FilterContext);
  if (ctx) return ctx;
  return { query: "", setQuery: () => {} };
}

/**
 * Shallow record-matcher used by Table/Kanban/Chart to participate in filtering.
 * Stringifies every value in the record's `data` and checks for a case-insensitive
 * substring match — matches the expectations of the search input UI.
 */
export function matchesQuery(record: any, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const data = record?.data || {};
  for (const v of Object.values(data)) {
    if (v == null) continue;
    if (String(v).toLowerCase().includes(q)) return true;
  }
  return false;
}
