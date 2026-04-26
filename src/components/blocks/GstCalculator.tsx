"use client";

import { useEffect, useMemo, useState } from "react";
import { IndianRupee, Calculator } from "lucide-react";
import type { BlockConfig } from "@/types/block";

const GST_OPTIONS: NonNullable<BlockConfig["gstDefaultRate"]>[] = [
  "0%",
  "5%",
  "12%",
  "18%",
  "28%",
];

const inr = (n: number) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function GstCalculator({ config }: { config: BlockConfig }) {
  const defaultAmount = config.gstDefaultAmount ?? 1000;
  const defaultRate = config.gstDefaultRate ?? "18%";
  const splitMode = config.gstSplit ?? "intrastate";

  const [amount, setAmount] = useState<string>(String(defaultAmount));
  const [rate, setRate] = useState<NonNullable<BlockConfig["gstDefaultRate"]>>(
    defaultRate
  );

  // Re-sync if the builder updates the defaults from the inspector while the
  // block is mounted.
  useEffect(() => {
    setAmount(String(defaultAmount));
  }, [defaultAmount]);
  useEffect(() => {
    setRate(defaultRate);
  }, [defaultRate]);

  const breakdown = useMemo(() => {
    const baseValue = parseFloat(amount);
    const ratePct = parseInt(rate, 10) || 0;
    const base = Number.isFinite(baseValue) && baseValue > 0 ? baseValue : 0;
    const taxAmount = (base * ratePct) / 100;
    return {
      base,
      taxAmount,
      total: base + taxAmount,
      half: taxAmount / 2,
      ratePct,
    };
  }, [amount, rate]);

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center"
          style={{
            background: "color-mix(in oklch, var(--primary), transparent 88%)",
            color: "var(--primary)",
          }}
        >
          <Calculator className="h-4 w-4" />
        </div>
        <div>
          <h4
            className="text-sm font-semibold leading-tight"
            style={{ color: "var(--foreground)" }}
          >
            GST Calculator
          </h4>
          <p
            className="text-[11px] leading-tight"
            style={{ color: "var(--foreground-dimmed)" }}
          >
            {splitMode === "intrastate" ? "CGST + SGST split" : "IGST (interstate)"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="space-y-1.5">
          <label
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "var(--foreground-muted)" }}
          >
            Base Amount
          </label>
          <div
            className="flex items-stretch rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            <span
              className="px-2.5 flex items-center text-sm shrink-0"
              style={{
                background: "var(--surface-2)",
                color: "var(--foreground-muted)",
                borderRight: "1px solid var(--border)",
              }}
            >
              <IndianRupee className="h-3.5 w-3.5" />
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-sm px-3 py-2 outline-none"
              style={{
                background: "var(--surface-sunken)",
                color: "var(--foreground)",
              }}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "var(--foreground-muted)" }}
          >
            GST Rate
          </label>
          <select
            value={rate}
            onChange={(e) =>
              setRate(e.target.value as NonNullable<BlockConfig["gstDefaultRate"]>)
            }
            className="w-full text-sm px-3 py-2 rounded-lg outline-none"
            style={{
              background: "var(--surface-sunken)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            {GST_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="rounded-lg p-3 space-y-2"
        style={{ background: "var(--surface-2)" }}
      >
        <Row label="Subtotal" value={`₹ ${inr(breakdown.base)}`} />
        {splitMode === "intrastate" ? (
          <>
            <Row
              label={`CGST (${breakdown.ratePct / 2}%)`}
              value={`₹ ${inr(breakdown.half)}`}
              muted
            />
            <Row
              label={`SGST (${breakdown.ratePct / 2}%)`}
              value={`₹ ${inr(breakdown.half)}`}
              muted
            />
          </>
        ) : (
          <Row
            label={`IGST (${breakdown.ratePct}%)`}
            value={`₹ ${inr(breakdown.taxAmount)}`}
            muted
          />
        )}
        <div
          className="pt-2 mt-1 flex items-center justify-between"
          style={{ borderTop: "1px dashed var(--border)" }}
        >
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Total payable
          </span>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: "var(--primary)" }}
          >
            ₹ {inr(breakdown.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span style={{ color: muted ? "var(--foreground-dimmed)" : "var(--foreground-muted)" }}>
        {label}
      </span>
      <span
        className="tabular-nums"
        style={{ color: muted ? "var(--foreground-muted)" : "var(--foreground)" }}
      >
        {value}
      </span>
    </div>
  );
}
