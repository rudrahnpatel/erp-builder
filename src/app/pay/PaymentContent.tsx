"use client";

import { useSearchParams } from "next/navigation";
import { PaymentUI } from "./PaymentUI";

export function PaymentContent() {
  const searchParams = useSearchParams();
  const pa = searchParams.get("pa");
  const pn = searchParams.get("pn");
  const am = searchParams.get("am");
  const tn = searchParams.get("tn");

  return <PaymentUI pa={pa} pn={pn} am={am} tn={tn} />;
}
