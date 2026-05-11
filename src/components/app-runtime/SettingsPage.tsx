"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { QuotationLayoutEditor } from "@/components/QuotationLayoutEditor";

import { Eye, EyeOff } from "lucide-react";


import {
  RiSettings4Line,
  RiGroupLine,
  RiShieldCheckLine,
  RiLoader4Line,
  RiDeleteBinLine,
  RiCloseLine,
  RiBuilding4Line,
  RiDashboardLine,
  RiListSettingsLine,
  RiUserAddLine
} from "react-icons/ri";


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

type TabKey = "general" | "preferences" | "company" | "layout" | "users";

const TABS: Array<{ key: TabKey; label: string; icon: typeof Settings }> = [
  { key: "general", label: "General", icon: RiSettings4Line },
  { key: "company", label: "Company", icon: RiBuilding4Line },
  { key: "layout", label: "Layout", icon: RiDashboardLine },
  { key: "preferences", label: "Preferences", icon: RiListSettingsLine },
  { key: "users", label: "RiGroupLine", icon: RiGroupLine },
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
          {tab === "company" && <CompanyProfileTab />}
          {tab === "layout" && (
            <Card
              title="Quotation Layout"
              description="Drag sections to reorder them on the quotation canvas. Toggle the eye icon to show/hide a section. Click Save Layout when done."
            >
              <QuotationLayoutEditor />
            </Card>
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

function CompanyProfileTab() {
  const [profile, setProfile] = useState({
    name: "",
    tagline: "",
    logo: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    pan: "",
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/workspace")
      .then((r) => r.json())
      .then((ws) => {
        if (ws?.settings?.companyProfile) {
          setProfile((prev) => ({ ...prev, ...ws.settings.companyProfile }));
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const save = async () => {
    setSaving(true);
    const pending = toast.loading("Saving company profile…");
    try {
      // First get current settings to merge
      const wsRes = await fetch("/api/workspace");
      const ws = await wsRes.json();
      const currentSettings = ws?.settings || {};
      const res = await fetch("/api/workspace/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentSettings, companyProfile: profile }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Company profile saved!", { id: pending });
    } catch {
      toast.error("Failed to save", { id: pending });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: "var(--surface-2)",
    border: "1px solid var(--border-subtle)",
    color: "var(--foreground)",
  } as React.CSSProperties;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-16" style={{ color: "var(--foreground-muted)" }}>
        <RiLoader4Line className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const fields: Array<{ key: keyof typeof profile; label: string; placeholder: string; type?: string; colSpan?: boolean }> = [
    { key: "name", label: "Company Name", placeholder: "e.g. Acme Corp" },
    { key: "tagline", label: "Tagline", placeholder: "e.g. Built for the future" },
    { key: "logo", label: "Logo URL", placeholder: "https://yoursite.com/logo.png", colSpan: true },
    { key: "address", label: "Address", placeholder: "123 Main St, City, State, Country", colSpan: true },
    { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
    { key: "email", label: "Email", placeholder: "contact@acme.com", type: "email" },
    { key: "website", label: "Website", placeholder: "https://acme.com" },
    { key: "pan", label: "Tax ID / PAN / GST", placeholder: "ABCDE1234F" },
  ];

  return (
    <Card
      title="Company Profile"
      description="These details auto-fill on every new Quotation and Estimate. Save once, use everywhere."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {fields.map((f) => (
          <div key={f.key} className={f.colSpan ? "sm:col-span-2" : ""}>
            <label
              className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5"
              style={{ color: "var(--foreground-muted)" }}
            >
              {f.label}
            </label>
            <input
              type={f.type || "text"}
              value={profile[f.key]}
              onChange={(e) => setProfile((prev) => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2"
              style={inputStyle}
            />
          </div>
        ))}
      </div>

      {profile.logo && (
        <div className="mb-5 p-3 rounded-xl flex items-center gap-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}>
          <img src={profile.logo} alt="Logo preview" className="h-10 w-10 object-contain rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="text-xs" style={{ color: "var(--foreground-muted)" }}>Logo preview</span>
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl pressable disabled:opacity-70"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
          color: "var(--primary-foreground)",
          boxShadow: "0 2px 8px color-mix(in oklch, var(--primary), transparent 65%)",
        }}
      >
        {saving ? (
          <><RiLoader4Line className="h-3.5 w-3.5 animate-spin" /> Saving…</>
        ) : (
          <><RiBuilding4Line className="h-3.5 w-3.5" /> Save Company Profile</>
        )}
      </button>
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
        Preferences will appear here soon : theme, date format, currency, and more.
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
            <RiUserAddLine className="h-3.5 w-3.5" />
            Invite User
          </button>
        </div>

        {isLoading && (
          <div
            className="flex items-center justify-center py-8"
            style={{ color: "var(--foreground-muted)" }}
          >
            <RiLoader4Line className="h-5 w-5 animate-spin" />
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
                    <RiShieldCheckLine className="h-4 w-4" />
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
                    <RiDeleteBinLine className="h-3.5 w-3.5" />
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
  const [showPassword, setShowPassword] = useState(false);

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
            <RiCloseLine className="h-4 w-4" />
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none focus:ring-2 pr-10"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--foreground)",
                }}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
                <RiLoader4Line className="h-3.5 w-3.5 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <RiUserAddLine className="h-3.5 w-3.5" /> Add User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
