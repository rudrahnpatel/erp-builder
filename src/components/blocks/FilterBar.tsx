"use client";

import { useState } from "react";
import useSWR from "swr";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FilterBar({ config, tableId }: { config: any; tableId?: string }) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative group w-full max-w-sm">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-secondary/30 border border-border/60 text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
        />
      </div>
      <Button variant="outline" className="gap-2 shrink-0 h-10 rounded-xl bg-background border-border/60 hover:bg-secondary/50">
        <Filter className="h-4 w-4" /> Filter
      </Button>
    </div>
  );
}
