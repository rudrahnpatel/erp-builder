"use client";

import { Image as ImageIcon } from "lucide-react";
import type { BlockConfig } from "@/types/block";

const WIDTH_CLASS: Record<NonNullable<BlockConfig["imageWidth"]>, string> = {
  sm: "max-w-[160px]",
  md: "max-w-[320px]",
  lg: "max-w-[560px]",
  full: "w-full",
};

const ALIGN_CLASS: Record<NonNullable<BlockConfig["imageAlign"]>, string> = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

export function ImageBlock({ config }: { config: BlockConfig }) {
  const url = config.imageUrl?.trim();
  const alt = config.imageAlt?.trim() || "Image";
  const widthClass = WIDTH_CLASS[config.imageWidth || "md"];
  const alignClass = ALIGN_CLASS[config.imageAlign || "center"];

  if (!url) {
    return (
      <div
        className="p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center"
        style={{
          borderColor: "var(--border)",
          color: "var(--foreground-muted)",
          background: "var(--surface-sunken)",
        }}
      >
        <ImageIcon className="h-8 w-8 mb-3 opacity-40" />
        <p className="text-sm font-medium">No image URL set</p>
        <p className="text-xs opacity-70 mt-1">
          Paste a public image URL in this block's configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        className={`block h-auto rounded-lg ${widthClass} ${alignClass}`}
        style={{ border: "1px solid var(--border-subtle)" }}
      />
    </div>
  );
}
