import { AnimatedAuth } from "@/components/auth/AnimatedAuth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | The Ledger",
};

export default function LoginPage() {
  return <AnimatedAuth initialMode="login" />;
}
