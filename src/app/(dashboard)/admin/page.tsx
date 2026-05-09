import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ShieldCheck, Users, Briefcase, Package, Database, Activity, LayoutTemplate, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { PlatformUsersTable } from "./PlatformUsersTable";
import { TenantUsersTable } from "./TenantUsersTable";
import { WorkspacesTable } from "./WorkspacesTable";
import { AdminModulesTable } from "./AdminModulesTable";
import { AuditLogsTable } from "./AuditLogsTable";
import { SystemSettingsForm } from "./SystemSettingsForm";

export const metadata = {
  title: "Admin Panel | ERP Builder",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "admin") {
    redirect("/workspace");
  }

  // Fetch all required data in parallel
  const [
    platformUsers,
    tenantUsers,
    workspaces,
    modules,
    auditLogs,
    globalSettings
  ] = await Promise.all([
    db.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    }),
    db.tenantUser.findMany({
      select: { id: true, username: true, role: true, workspaceId: true, createdAt: true, workspace: { select: { slug: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    db.workspace.findMany({
      select: { 
        id: true, name: true, slug: true, createdAt: true, 
        user: { select: { email: true } },
        _count: { select: { tenantUsers: true, tables: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    db.moduleDefinition.findMany({
      select: { id: true, name: true, packId: true, published: true, version: true, createdAt: true, author: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 logs
    }),
    db.systemSetting.findUnique({
      where: { id: "global" }
    })
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Admin Panel
        </h1>
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          Manage the entire ERP Builder platform from one place.
        </p>
      </header>

      {/* Analytics Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border p-4 bg-surface-1 shadow-sm border-subtle flex items-center gap-4">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-foreground-muted">Platform Users</p>
            <p className="text-2xl font-bold">{platformUsers.length}</p>
          </div>
        </div>
        <div className="rounded-xl border p-4 bg-surface-1 shadow-sm border-subtle flex items-center gap-4">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-foreground-muted">Workspaces</p>
            <p className="text-2xl font-bold">{workspaces.length}</p>
          </div>
        </div>
        <div className="rounded-xl border p-4 bg-surface-1 shadow-sm border-subtle flex items-center gap-4">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-foreground-muted">Tenant Users</p>
            <p className="text-2xl font-bold">{tenantUsers.length}</p>
          </div>
        </div>
        <div className="rounded-xl border p-4 bg-surface-1 shadow-sm border-subtle flex items-center gap-4">
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-foreground-muted">Custom Modules</p>
            <p className="text-2xl font-bold">{modules.length}</p>
          </div>
        </div>
      </div>

      {/* Dev Tools Section */}
      <section
        className="rounded-xl border p-5"
        style={{
          background: "var(--surface-1)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <LayoutTemplate className="h-5 w-5 text-accent-emerald" />
          <h2 className="text-lg font-medium">Developer Mode Active</h2>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--foreground-muted)" }}>
          You have developer access. The page builder and table designer are unlocked for creating and editing module content.
        </p>
        <div className="flex gap-4">
          <Link href="/dev/modules">
            <Button variant="default" className="gap-2 bg-accent-emerald hover:bg-accent-emerald/90 text-white">
              <Package className="h-4 w-4" />
              Manage My Modules
            </Button>
          </Link>
        </div>
      </section>

      {/* Main Tabs */}
      <Tabs defaultValue="platform-users" className="w-full">
        <TabsList className="mb-6 flex flex-wrap gap-3 bg-transparent h-auto p-0">
          <TabsTrigger value="platform-users" className="border border-subtle bg-surface-1 data-active:border-primary data-active:bg-primary/10 data-active:text-primary gap-2 px-4 py-2 rounded-lg"><Users className="h-4 w-4" /> Platform Users</TabsTrigger>
          <TabsTrigger value="tenant-users" className="border border-subtle bg-surface-1 data-active:border-primary data-active:bg-primary/10 data-active:text-primary gap-2 px-4 py-2 rounded-lg"><Database className="h-4 w-4" /> Tenant Users</TabsTrigger>
          <TabsTrigger value="workspaces" className="border border-subtle bg-surface-1 data-active:border-primary data-active:bg-primary/10 data-active:text-primary gap-2 px-4 py-2 rounded-lg"><Briefcase className="h-4 w-4" /> Workspaces</TabsTrigger>
          <TabsTrigger value="modules" className="border border-subtle bg-surface-1 data-active:border-primary data-active:bg-primary/10 data-active:text-primary gap-2 px-4 py-2 rounded-lg"><Package className="h-4 w-4" /> Modules Registry</TabsTrigger>
          <TabsTrigger value="settings-logs" className="border border-subtle bg-surface-1 data-active:border-primary data-active:bg-primary/10 data-active:text-primary gap-2 px-4 py-2 rounded-lg"><Activity className="h-4 w-4" /> Settings & Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="platform-users" className="rounded-xl border p-5 bg-surface-1 border-subtle">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Platform Users (Builders)</h2>
            <p className="text-sm text-foreground-muted">Users who can log in to the ERP Builder dashboard and create workspaces.</p>
          </div>
          <PlatformUsersTable initialUsers={platformUsers} currentUserId={session.user.id} />
        </TabsContent>

        <TabsContent value="tenant-users" className="rounded-xl border p-5 bg-surface-1 border-subtle">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Tenant Users (App Users)</h2>
            <p className="text-sm text-foreground-muted">End-users who log into individual ERP apps created by builders.</p>
          </div>
          <TenantUsersTable initialUsers={tenantUsers as any} />
        </TabsContent>

        <TabsContent value="workspaces" className="rounded-xl border p-5 bg-surface-1 border-subtle">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Workspaces</h2>
            <p className="text-sm text-foreground-muted">All tenants created on the platform.</p>
          </div>
          <WorkspacesTable initialWorkspaces={workspaces as any} />
        </TabsContent>

        <TabsContent value="modules" className="rounded-xl border p-5 bg-surface-1 border-subtle">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Global Modules Registry</h2>
            <p className="text-sm text-foreground-muted">Manage custom modules submitted by platform users. Only published modules appear in the marketplace.</p>
          </div>
          <AdminModulesTable initialModules={modules as any} />
        </TabsContent>

        <TabsContent value="settings-logs" className="space-y-6">
          <div className="rounded-xl border p-5 bg-surface-1 border-subtle">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">Global Settings</h2>
            </div>
            <SystemSettingsForm initialData={globalSettings?.data || {}} />
          </div>

          <div className="rounded-xl border p-5 bg-surface-1 border-subtle">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">Audit Logs</h2>
            </div>
            <AuditLogsTable initialLogs={auditLogs as any} />
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
