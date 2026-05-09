import { AnimatedAuth } from "@/components/auth/AnimatedAuth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | The Ledger",
};

export default function RegisterPage() {
  return <AnimatedAuth initialMode="register" />;
}
