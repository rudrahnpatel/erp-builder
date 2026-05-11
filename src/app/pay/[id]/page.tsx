import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PaymentUI } from "../PaymentUI";

export default async function ShortPayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const paymentLink = await db.paymentLink.findUnique({
    where: { shortId: id },
  });

  if (!paymentLink) {
    notFound();
  }

  return (
    <PaymentUI
      pa={paymentLink.upiId}
      pn={paymentLink.merchantName}
      am={paymentLink.amount ? paymentLink.amount.toString() : null}
      tn={paymentLink.note}
    />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const paymentLink = await db.paymentLink.findUnique({
    where: { shortId: id },
  });

  if (!paymentLink) {
    return { title: "Payment Link Not Found" };
  }

  return {
    title: `Pay ${paymentLink.merchantName} - Secure UPI Payment`,
  };
}
