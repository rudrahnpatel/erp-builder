"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
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

export default function SettingsPage() {
  const { data: session } = useSession();
  const { workspace, refetch } = useWorkspace();
  const [liveSlug, setLiveSlug] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

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
