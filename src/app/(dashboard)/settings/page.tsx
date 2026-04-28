"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Trash2, Code2, ShieldCheck, Eye, EyeOff, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubdomainEditor } from "@/components/workspace/SubdomainEditor";
import { useWorkspace } from "@/hooks/use-workspace";
import { useDevMode, validateDevPassword } from "@/hooks/use-dev-mode";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { workspace, refetch } = useWorkspace();
  const [liveSlug, setLiveSlug] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Developer mode
  const { isDevMode, activate, deactivate } = useDevMode();
  const [devPassword, setDevPassword] = useState("");
  const [showDevPassword, setShowDevPassword] = useState(false);
  const [devActivating, setDevActivating] = useState(false);

  const canDelete = confirmText === "DELETE" && password.length > 0 && !deleting;

  async function handleDelete() {
    setDeleting(true);
    const pending = toast.loading("Deleting your account…");
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirm: confirmText }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Couldn't delete account.", { id: pending });
        setDeleting(false);
        return;
      }
      toast.success("Account deleted.", { id: pending });
      await signOut({ callbackUrl: "/login" });
    } catch {
      toast.error("Network error.", { id: pending });
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          Manage your account and workspace preferences.
        </p>
      </header>

      {/* Account section */}
      <section
        className="rounded-xl border p-5"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <h2 className="text-sm font-medium mb-3">Account</h2>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: "var(--foreground-muted)" }}>Name</span>
            <span>{session?.user?.name || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--foreground-muted)" }}>Email</span>
            <span>{session?.user?.email || "—"}</span>
          </div>
        </div>
      </section>

      {/* Workspace section */}
      {workspace && (
        <section
          className="rounded-xl border p-5"
          style={{
            background: "var(--surface-1)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h2 className="text-sm font-medium mb-1">Workspace</h2>
          <p
            className="text-xs mb-4"
            style={{ color: "var(--foreground-dimmed)" }}
          >
            Your ERP is accessible at this subdomain. Changing it invalidates
            any shared links using the old address.
          </p>
          <SubdomainEditor
            currentSlug={liveSlug ?? workspace.slug}
            onSaved={(newSlug) => {
              setLiveSlug(newSlug);
              refetch();
            }}
          />
        </section>
      )}

      {/* Admin Credentials Section */}
      {workspace && (
        <section
          className="rounded-xl border p-5"
          style={{
            background: "var(--surface-1)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h2 className="text-sm font-medium mb-1">Tenant Admin Credentials</h2>
          <p
            className="text-xs mb-4"
            style={{ color: "var(--foreground-dimmed)" }}
          >
            Update the admin ID and password used to log in to the tenant ERP app at <span className="font-mono">{liveSlug ?? workspace.slug}.erpbuilder.app</span>.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const adminId = (form.elements.namedItem("adminId") as HTMLInputElement).value;
              const adminPassword = (form.elements.namedItem("adminPassword") as HTMLInputElement).value;
              const accountPassword = (form.elements.namedItem("accountPassword") as HTMLInputElement | null)?.value;
              
              if (adminPassword.length < 6) {
                toast.error("Password must be at least 6 characters");
                return;
              }

              const pending = toast.loading("Updating admin credentials...");
              try {
                const res = await fetch("/api/workspace/admin", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ adminId, adminPassword, accountPassword }),
                });
                
                if (!res.ok) {
                  const errData = await res.json().catch(() => ({}));
                  throw new Error(errData.error || "Failed to update");
                }
                toast.success("Admin credentials updated!", { id: pending });
                form.reset();
                refetch();
              } catch (err: any) {
                toast.error(err.message || "Network error.", { id: pending });
              }
            }}
            className="space-y-4 max-w-sm"
          >
            {workspace.hasTenantAdmin && (
              <div className="rounded-lg border p-3.5 mb-2" style={{ background: "color-mix(in oklch, var(--warning), transparent 90%)", borderColor: "color-mix(in oklch, var(--warning), transparent 60%)" }}>
                <p className="text-[11px] leading-relaxed mb-2.5" style={{ color: "var(--foreground-muted)" }}>
                  <span className="font-semibold" style={{ color: "var(--warning)" }}>Verify identity —</span>{" "}
                  Enter the account password for <span className="font-medium" style={{ color: "var(--foreground)" }}>{session?.user?.email}</span> to authorize this change.
                </p>
                <Input name="accountPassword" type="password" placeholder="Account password" required className="h-9" />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Admin Username / ID</label>
              <Input name="adminId" placeholder="e.g. admin" required className="h-9" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>Password</label>
              <Input name="adminPassword" type="password" placeholder="Min. 6 characters" required minLength={6} className="h-9" />
            </div>
            <Button type="submit" size="sm" className="mt-1">
              {workspace.hasTenantAdmin ? "Update Credentials" : "Set Credentials"}
            </Button>
          </form>
        </section>
      )}

      {/* ── Developer Account ── */}
      <section
        className="rounded-xl border p-5 relative overflow-hidden"
        style={{
          background: isDevMode
            ? "linear-gradient(135deg, color-mix(in oklch, var(--accent-emerald), transparent 94%), color-mix(in oklch, var(--primary), transparent 96%))"
            : "var(--surface-1)",
          borderColor: isDevMode
            ? "color-mix(in oklch, var(--accent-emerald), transparent 55%)"
            : "var(--border-subtle)",
          transition: "all 0.4s ease",
        }}
      >
        {/* Subtle noise texture for premium feel */}
        {isDevMode && (
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            }}
            aria-hidden="true"
          />
        )}

        <div className="flex items-start gap-3 relative">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
            style={{
              background: isDevMode
                ? "linear-gradient(135deg, var(--accent-emerald), var(--primary))"
                : "var(--surface-2)",
              color: isDevMode ? "#fff" : "var(--foreground-muted)",
              boxShadow: isDevMode
                ? "0 4px 14px color-mix(in oklch, var(--accent-emerald), transparent 55%), inset 0 1px 0 oklch(1 0 0 / 0.18)"
                : "none",
            }}
          >
            {isDevMode ? <ShieldCheck className="h-5 w-5" /> : <Terminal className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-sm font-medium">Developer Account</h2>
              {isDevMode && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full animate-fade-in-up"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-emerald), color-mix(in oklch, var(--accent-emerald), var(--primary) 40%))",
                    color: "#fff",
                    boxShadow: "0 2px 8px color-mix(in oklch, var(--accent-emerald), transparent 60%)",
                  }}
                >
                  <Code2 className="h-2.5 w-2.5" />
                  Active
                </span>
              )}
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "var(--foreground-dimmed)" }}
            >
              {isDevMode
                ? "You have developer access. The page builder and table designer are unlocked for creating and editing module content."
                : "Activate developer mode to access the visual page builder and table schema designer. Build custom pages and tables for your modules."}
            </p>
          </div>
        </div>

        {isDevMode ? (
          /* ── Active state — show features + deactivate ── */
          <div className="mt-4 space-y-3 relative">
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {[
                { icon: "📄", label: "Page Builder", desc: "Drag-and-drop page composer" },
                { icon: "🗄️", label: "Table Designer", desc: "Schema editor with fields & records" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{
                    background: "color-mix(in oklch, var(--background), transparent 40%)",
                    border: "1px solid color-mix(in oklch, var(--border-subtle), transparent 40%)",
                  }}
                >
                  <span className="text-lg">{f.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{f.label}</p>
                    <p className="text-[10px]" style={{ color: "var(--foreground-dimmed)" }}>{f.desc}</p>
                  </div>
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{
                      background: "var(--accent-emerald)",
                      boxShadow: "0 0 6px var(--accent-emerald)",
                    }}
                  />
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                deactivate();
                toast.success("Developer mode deactivated");
              }}
              className="text-xs"
            >
              Deactivate Developer Mode
            </Button>
          </div>
        ) : (
          /* ── Inactive state — password input to activate ── */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDevActivating(true);
              // Small delay for visual feedback
              setTimeout(() => {
                if (validateDevPassword(devPassword)) {
                  activate();
                  setDevPassword("");
                  setShowDevPassword(false);
                  toast.success("🚀 Developer mode activated! Page builder and table designer are now accessible.");
                } else {
                  toast.error("Incorrect developer password");
                }
                setDevActivating(false);
              }, 400);
            }}
            className="mt-4 max-w-sm space-y-3"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--foreground-muted)" }}>
                Developer Password
              </label>
              <div className="relative">
                <Input
                  value={devPassword}
                  onChange={(e) => setDevPassword(e.target.value)}
                  type={showDevPassword ? "text" : "password"}
                  placeholder="Enter developer password"
                  required
                  className="h-9 pr-9"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowDevPassword(!showDevPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded"
                  style={{ color: "var(--foreground-dimmed)" }}
                  tabIndex={-1}
                >
                  {showDevPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={devActivating || devPassword.length === 0}
              className="gap-2 font-semibold rounded-lg pressable"
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
                color: "var(--primary-foreground)",
                boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
              }}
            >
              {devActivating ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Activating…</>
              ) : (
                <><Code2 className="h-3.5 w-3.5" /> Activate Developer Mode</>
              )}
            </Button>
          </form>
        )}
      </section>

      {/* Danger zone */}
      <section
        className="rounded-xl border p-5"
        style={{
          background: "var(--surface-1)",
          borderColor: "color-mix(in oklch, var(--danger), transparent 70%)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "color-mix(in oklch, var(--danger), transparent 85%)",
              color: "var(--danger)",
            }}
          >
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-sm font-medium">Delete account</h2>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--foreground-muted)" }}
              >
                Permanently remove your account, workspace, and all tables,
                pages, records, and installed modules. This action cannot be
                undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                setPassword("");
                setConfirmText("");
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete my account
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account permanently?</DialogTitle>
            <DialogDescription>
              This will wipe your workspace and every table, page, record, and
              installed module tied to it. There's no recovery path.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Confirm your password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">
                Type <span className="font-mono">DELETE</span> to confirm
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoComplete="off"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!canDelete}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete forever
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
