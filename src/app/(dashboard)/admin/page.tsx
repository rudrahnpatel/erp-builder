import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ShieldCheck, Users, Briefcase, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin Panel | ERP Builder",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    redirect("/workspace");
  }

  // Fetch users
  const platformUsers = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });

  const tenantUsers = await db.tenantUser.findMany({
    select: { id: true, username: true, role: true, workspaceId: true, createdAt: true, workspace: { select: { slug: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Admin Panel
        </h1>
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          Manage platform users, tenant users, and access developer tools.
        </p>
      </header>

      {/* Dev Tools Section */}
      <section
        className="rounded-xl border p-5"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-accent-emerald" />
          <h2 className="text-lg font-medium">Developer Mode Active</h2>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--foreground-muted)" }}>
          You have developer access. The page builder and table designer are unlocked for creating and editing module content.
        </p>
        <div className="flex gap-4">
          <Link href="/dev/modules">
            <Button variant="default" className="gap-2">
              <Package className="h-4 w-4" />
              Manage My Modules
            </Button>
          </Link>
        </div>
      </section>

      {/* Platform Users */}
      <section
        className="rounded-xl border p-5"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">Platform Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-surface-2" style={{ color: "var(--foreground-muted)" }}>
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {platformUsers.map(user => (
                <tr key={user.id} className="border-b border-subtle">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-foreground-muted'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tenant Users */}
      <section
        className="rounded-xl border p-5"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">Tenant Users (ERP Apps)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-surface-2" style={{ color: "var(--foreground-muted)" }}>
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Tenant Slug</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {tenantUsers.map(tu => (
                <tr key={tu.id} className="border-b border-subtle">
                  <td className="px-4 py-3 font-medium">{tu.username}</td>
                  <td className="px-4 py-3">{tu.workspace.slug}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-surface-2 text-foreground-muted">
                      {tu.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(tu.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {tenantUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center" style={{ color: "var(--foreground-muted)" }}>
                    No tenant users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
