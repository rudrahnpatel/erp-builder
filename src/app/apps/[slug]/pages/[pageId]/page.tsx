"use client";

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Table2,
  Kanban,
  Filter,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Runtime custom-page view. Renders blocks the merchant composed in the
 * builder's page composer. Ported from the old /erp/pages/[pageId] preview.
 */
export default function TenantCustomPage({
  params,
}: {
  params: Promise<{ slug: string; pageId: string }>;
}) {
  const { slug, pageId } = use(params);
  const { data: page, error } = useSWR(`/api/pages/${pageId}`, fetcher);

  if (!page && !error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const blocks = Array.isArray(page?.blocks) ? page.blocks : [];

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--background)" }}
    >
      <div
        className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b shrink-0 glass"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Link
          href={`/apps/${slug}`}
          className="text-muted-foreground hover:text-foreground transition-colors mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span
          className="font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          {page?.title || "Custom Page"}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {blocks.length === 0 ? (
            <div
              className="text-center p-12 text-sm border-2 border-dashed rounded-xl"
              style={{
                borderColor: "var(--border-subtle)",
                color: "var(--foreground-muted)",
              }}
            >
              This page has no content blocks yet.
              <br />
              <Link
                href={`/pages/${pageId}/edit`}
                className="text-primary hover:underline mt-2 inline-block"
              >
                Edit this page in composer
              </Link>
            </div>
          ) : (
            blocks.map((block: any) => (
              <div
                key={block.id}
                className="rounded-xl overflow-hidden border shadow-sm"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div className="p-5">
                  {block.type === "TEXT" && (
                    <h2
                      className="text-xl font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      {block.label}
                    </h2>
                  )}

                  {block.type === "TABLE_VIEW" && (
                    <div className="overflow-x-auto">
                      <div className="mb-4 flex items-center gap-2 font-semibold">
                        <Table2 className="h-4 w-4 text-primary" />{" "}
                        {block.label}
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr
                            style={{
                              borderBottom: "1px solid var(--border-subtle)",
                            }}
                          >
                            <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">
                              Name
                            </th>
                            <th className="text-left px-3 py-2 text-xs text-muted-foreground font-medium">
                              Data
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td
                              className="px-3 py-3"
                              colSpan={2}
                              style={{ color: "var(--foreground-dimmed)" }}
                            >
                              Table view block placeholder for {block.label}.
                              Wire real `tableId` in config.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {block.type === "FILTER_BAR" && (
                    <div className="flex gap-2">
                      <input
                        className="flex-1 h-9 bg-surface-2 border border-border-subtle rounded-md px-3 text-sm"
                        placeholder={`Search ${block.label}...`}
                        disabled
                      />
                      <Button size="sm" variant="outline">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                      </Button>
                    </div>
                  )}

                  {block.type === "CHART" && (
                    <div className="h-48 flex items-center justify-center border border-dashed rounded-lg bg-surface-2 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 opacity-20 mb-2" />
                      <span className="text-xs">{block.label} Preview</span>
                    </div>
                  )}

                  {block.type === "KANBAN_VIEW" && (
                    <div className="h-32 flex items-center justify-center border border-dashed rounded-lg bg-surface-2 text-muted-foreground">
                      <Kanban className="h-12 w-12 opacity-20 mb-2" />
                      <span className="text-xs">
                        {block.label} View Preview
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
