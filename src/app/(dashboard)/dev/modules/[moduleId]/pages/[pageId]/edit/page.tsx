"use client";

/**
 * Module-scoped Page Composer wrapper.
 * 
 * Instead of duplicating the 1500-line composer, this page dynamically imports
 * and renders it, but wraps it in a module context that the composer can read
 * to scope its left-rail page list and "new page" creation to this module.
 */

import { use } from "react";
import { ModuleComposerContext } from "@/lib/module-composer-context";
import dynamic from "next/dynamic";

// Dynamically import the original composer to avoid circular issues
const PageComposerPage = dynamic(
  () => import("@/app/(dashboard)/pages/[pageId]/edit/page"),
  { ssr: false, loading: () => (
    <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 animate-pulse" style={{ color: "var(--foreground-muted)" }}>
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
        <p className="text-sm font-medium">Loading composer…</p>
      </div>
    </div>
  )}
);

export default function ModulePageComposerPage({
  params,
}: {
  params: Promise<{ moduleId: string; pageId: string }>;
}) {
  const { moduleId, pageId } = use(params);

  return (
    <ModuleComposerContext.Provider
      value={{
        moduleId,
        basePath: `/dev/modules/${moduleId}/pages`,
        pagesApiUrl: `/api/dev/modules/${moduleId}/pages`,
      }}
    >
      <PageComposerPage params={Promise.resolve({ pageId })} />
    </ModuleComposerContext.Provider>
  );
}
