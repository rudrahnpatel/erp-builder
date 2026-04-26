"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Users,
  SlidersHorizontal,
  UserPlus,
  ShieldCheck,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error((await r.json()).error || "Request failed");
    return r.json();
  });

type TenantUser = {
  id: string;
  username: string;
  role: string;
  createdAt: string;
};

type TabKey = "general" | "preferences" | "users";

const TABS: Array<{ key: TabKey; label: string; icon: typeof SettingsIcon }> = [
  { key: "general", label: "General", icon: SettingsIcon },
  { key: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { key: "users", label: "Users", icon: Users },
];

export function SettingsPage({
  workspaceName,
  workspaceSlug,
}: {
  workspaceName: string;
  workspaceSlug: string;
}) {
  const [tab, setTab] = useState<TabKey>("general");

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--background)" }}>
      {/* Header with tabs */}
      <div
        className="px-4 sm:px-8 pt-6 pb-0 border-b"
        style={{
          borderColor: "var(--border-subtle)",
          background: "color-mix(in oklch, var(--surface-1), transparent 30%)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              Settings
            </h1>
            <nav
              className="flex items-center gap-1 rounded-xl p-1"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {TABS.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className="flex items-center gap-2 px-3.5 py-1.5 text-[13px] rounded-lg transition-all font-medium focus-ring"
                    style={
                      active
                        ? {
                            background: "var(--primary)",
                            color: "var(--primary-foreground)",
                            boxShadow:
                              "0 1px 2px color-mix(in oklch, var(--primary), transparent 70%)",
                          }
                        : { color: "var(--foreground-muted)" }
                    }
                  >
                    <t.icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab body */}
      <div className="flex-1 overflow-auto p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          {tab === "general" && (
            <GeneralTab workspaceName={workspaceName} workspaceSlug={workspaceSlug} />
          )}
          {tab === "preferences" && <PreferencesTab />}
          {tab === "users" && <UsersTab />}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl mb-6"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <header className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
          {title}
        </h2>
        {description && (
          <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>
            {description}
          </p>
        )}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <label
        className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
        style={{ color: "var(--foreground-muted)" }}
      >
        {label}
      </label>
      <input
        readOnly
        value={value}
        className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-subtle)",
          color: "var(--foreground)",
        }}
      />
      {hint && (
        <p className="text-[11px] mt-1.5" style={{ color: "var(--foreground-dimmed)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function GeneralTab({
  workspaceName,
  workspaceSlug,
}: {
  workspaceName: string;
  workspaceSlug: string;
}) {
  return (
    <Card
      title="Workspace"
      description="Basic information about this ERP. Edit these from the builder."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Workspace Name" value={workspaceName} />
        <Field
          label="Subdomain"
          value={`${workspaceSlug}.erpbuilder.app`}
          hint="Your tenant URL."
        />
      </div>
    </Card>
  );
}

function PreferencesTab() {
  return (
    <Card title="Preferences" description="Appearance and regional settings.">
      <div
        className="text-sm py-10 text-center rounded-lg"
        style={{
          color: "var(--foreground-muted)",
          background: "var(--surface-2)",
          border: "1px dashed var(--border-subtle)",
        }}
      >
        Preferences will appear here soon — theme, date format, currency, and more.
      </div>
    </Card>
  );
}

function UsersTab() {
  const { data: users, error, isLoading, mutate } = useSWR<TenantUser[]>(
    "/api/workspace/tenant-users",
    fetcher
  );
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleDelete = async (user: TenantUser) => {
    if (user.role === "admin") {
      toast.error("Admins cannot be removed from here.");
      return;
    }
    if (!confirm(`Remove ${user.username}? They will lose access immediately.`)) {
      return;
    }
    const pending = toast.loading("Removing user…");
    try {
      const res = await fetch(`/api/workspace/tenant-users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("User removed", { id: pending });
      mutate();
    } catch {
      toast.error("Failed to remove user", { id: pending });
    }
  };

  return (
    <>
      <Card
        title="Team Members"
        description="Invite teammates, manage roles and review access for this app."
      >
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
            {users
              ? `${users.length} ${users.length === 1 ? "user" : "users"} have access to this app.`
              : "Loading team…"}
          </p>
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium rounded-xl pressable shrink-0"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              color: "var(--primary-foreground)",
              boxShadow:
                "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
            }}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite User
          </button>
        </div>

        {isLoading && (
          <div
            className="flex items-center justify-center py-8"
            style={{ color: "var(--foreground-muted)" }}
          >
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {error && (
          <div
            className="text-sm px-4 py-3 rounded-lg"
            style={{
              background: "var(--danger-subtle)",
              color: "var(--danger)",
            }}
          >
            Could not load users. You may not be signed in as the workspace owner.
          </div>
        )}

        {users && users.length > 0 && (
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {users.map((u, idx) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderTop:
                    idx === 0 ? "none" : "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background:
                      "color-mix(in oklch, var(--primary), transparent 85%)",
                    color: "var(--primary)",
                  }}
                >
                  {u.role === "admin" ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    u.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {u.username}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--foreground-dimmed)" }}
                  >
                    Added {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      u.role === "admin"
                        ? "color-mix(in oklch, var(--primary), transparent 88%)"
                        : "var(--surface-3)",
                    color:
                      u.role === "admin"
                        ? "var(--primary)"
                        : "var(--foreground-muted)",
                    border:
                      u.role === "admin"
                        ? "1px solid color-mix(in oklch, var(--primary), transparent 75%)"
                        : "1px solid var(--border-subtle)",
                  }}
                >
                  {u.role}
                </span>
                {u.role !== "admin" && (
                  <button
                    onClick={() => handleDelete(u)}
                    className="p-1.5 rounded-lg focus-ring transition-colors"
                    style={{ color: "var(--danger)" }}
                    title="Remove user"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--danger-subtle)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {users && users.length === 0 && (
          <div
            className="text-sm py-10 text-center rounded-lg"
            style={{
              color: "var(--foreground-muted)",
              background: "var(--surface-2)",
              border: "1px dashed var(--border-subtle)",
            }}
          >
            No users yet. Invite your first teammate to get started.
          </div>
        )}
      </Card>

      {inviteOpen && (
        <InviteUserModal
          onClose={() => setInviteOpen(false)}
          onCreated={() => {
            setInviteOpen(false);
            mutate();
          }}
        />
      )}
    </>
  );
}

function InviteUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const pending = toast.loading("Creating user…");
    try {
      const res = await fetch("/api/workspace/tenant-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || "Failed to create user", { id: pending });
      } else {
        toast.success(`${body.username} added`, { id: pending });
        onCreated();
      }
    } catch {
      toast.error("Network error", { id: pending });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 20px 40px oklch(0 0 0 / 0.35)",
        }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Invite user
            </h3>
            <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>
              They will sign in at your app URL with these credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover-bg-subtle focus-ring"
            style={{ color: "var(--foreground-muted)" }}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
              style={{ color: "var(--foreground-muted)" }}
            >
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              autoFocus
              className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-subtle)",
                color: "var(--foreground)",
              }}
              placeholder="e.g. priya"
            />
          </div>

          <div>
            <label
              className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
              style={{ color: "var(--foreground-muted)" }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-subtle)",
                color: "var(--foreground)",
              }}
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label
              className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
              style={{ color: "var(--foreground-muted)" }}
            >
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border-subtle)",
                color: "var(--foreground)",
              }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl"
            style={{
              background: "var(--surface-2)",
              color: "var(--foreground-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl pressable disabled:opacity-70"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--primary-hover))",
              color: "var(--primary-foreground)",
              boxShadow:
                "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" /> Add User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
