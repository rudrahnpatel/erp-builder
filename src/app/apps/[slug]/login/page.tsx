"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, LogIn, Eye, EyeOff } from "lucide-react";

export default function TenantLoginPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      router.push(`/apps/${slug}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="text-center mb-8">
        <div className="h-16 w-16 mx-auto rounded-2xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))", boxShadow: "0 10px 25px -5px var(--primary-subtle)" }}>
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>Sign In</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
          Welcome back to {slug}.erpbuilder.app
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
    </div>
  );
}
