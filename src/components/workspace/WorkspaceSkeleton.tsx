"use client";

import { Activity } from "lucide-react";

export function WorkspaceSkeleton() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 animate-fade-in-up">
      {/* ── Hero / Welcome Skeleton ── */}
      <section
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="relative z-10 space-y-4">
          <div className="skeleton h-5 w-32 rounded-full" />
          <div className="skeleton h-10 w-64 rounded-md" />
          <div className="skeleton h-5 w-48 rounded-md" />
          <div className="mt-5 flex gap-3">
            <div className="skeleton h-10 w-36 rounded-xl" />
          </div>
        </div>
      </section>

      {/* ── Stats Grid Skeleton ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl p-5 border"
            style={{
              background: "var(--card)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="skeleton h-4 w-24 rounded-md" />
              <div className="skeleton h-9 w-9 rounded-lg" />
            </div>
            <div className="skeleton h-8 w-16 rounded-md mb-2" />
            <div className="skeleton h-3 w-32 rounded-md" />
          </div>
        ))}
      </div>

      {/* ── Quick Actions Skeleton ── */}
      <div>
        <div className="skeleton h-5 w-32 rounded-md mb-4" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl p-5 border h-full"
              style={{
                background: "var(--card)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <div className="skeleton h-11 w-11 rounded-xl mb-4" />
              <div className="skeleton h-4 w-32 rounded-md mb-2" />
              <div className="skeleton h-3 w-40 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Section Skeleton ── */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="skeleton h-5 w-32 rounded-md mb-4" />
          <div
            className="rounded-xl overflow-hidden border"
            style={{
              background: "var(--card)",
              borderColor: "var(--border-subtle)",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 border-b last:border-b-0"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <div className="skeleton h-9 w-9 rounded-lg shrink-0" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-48 rounded-md mb-1" />
                  <div className="skeleton h-3 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="skeleton h-5 w-32 rounded-md mb-4" />
          <div
            className="rounded-xl p-5 border h-[calc(100%-2rem)]"
            style={{
              background: "var(--card)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton h-3.5 w-3.5 rounded-full shrink-0" />
                  <div className="flex-1">
                    <div className="skeleton h-4 w-24 rounded-md mb-1.5" />
                    <div className="skeleton h-2 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
