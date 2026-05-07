"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Eye, EyeOff, KeyRound, X } from "lucide-react";

const REMEMBERED_USERNAME_KEY = (slug: string) => `erpbuilder:tenant:${slug}:rememberedUsername`;

export default function TenantLoginPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotInfo, setShowForgotInfo] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    const saved = window.localStorage.getItem(REMEMBERED_USERNAME_KEY(slug));
    if (saved) {
      setUsername(saved);
      setRememberMe(true);
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/tenant/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (typeof window !== "undefined" && slug) {
        const key = REMEMBERED_USERNAME_KEY(slug);
        if (rememberMe) {
          window.localStorage.setItem(key, username);
        } else {
          window.localStorage.removeItem(key);
        }
      }

      router.push(`/apps/${slug}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const initial = (slug?.[0] || "W").toUpperCase();

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="text-center mb-8">
        <div
          className="h-16 w-16 mx-auto rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
            boxShadow: "0 10px 25px -5px var(--primary-subtle), inset 0 1px 0 oklch(1 0 0 / 0.18)",
          }}
        >
          <span className="text-2xl font-bold text-white tracking-tight uppercase select-none">
            {initial}
          </span>
        </div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>
          {slug || "Workspace"}
        </h1>
        <p className="mt-2 text-sm mono" style={{ color: "var(--foreground-muted)" }}>
          {slug}.erpbuilder.app
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-2xl border space-y-5" style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}>
        {error && (
          <div className="p-3 text-sm rounded-xl border text-center animate-in fade-in slide-in-from-top-2" style={{ background: "color-mix(in oklch, var(--danger), transparent 90%)", borderColor: "color-mix(in oklch, var(--danger), transparent 70%)", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>
            Username / ID
          </label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="h-11"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded focus-ring"
              style={{ color: "var(--foreground-dimmed)" }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-2 cursor-pointer"
              style={{ borderColor: "var(--border)" }}
            />
            <span style={{ color: "var(--foreground-muted)" }}>Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => setShowForgotInfo(true)}
            className="inline-flex items-center gap-1 font-medium hover:underline focus-ring rounded"
            style={{ color: "var(--primary)" }}
          >
            <KeyRound className="h-3.5 w-3.5" />
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 gap-2 text-base font-semibold mt-2"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          Sign In
        </Button>
      </form>

      <p className="text-center mt-6 text-xs" style={{ color: "var(--foreground-dimmed)" }}>
        Secured by ERP Builder
      </p>

      {showForgotInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForgotInfo(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl border animate-in fade-in zoom-in-95 duration-200"
            style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "color-mix(in oklch, var(--primary), transparent 88%)",
                  color: "var(--primary)",
                }}
              >
                <KeyRound className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowForgotInfo(false)}
                className="rounded-lg p-1 hover-bg-subtle focus-ring"
                style={{ color: "var(--foreground-dimmed)" }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="text-lg font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
              Reset password
            </h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--foreground-muted)" }}>
              Tenant accounts on this workspace are managed by the workspace
              owner. Contact your administrator and they can reset your password
              from <strong>Settings → Users</strong> in the builder.
            </p>
            <Button
              type="button"
              onClick={() => setShowForgotInfo(false)}
              className="w-full h-10"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
