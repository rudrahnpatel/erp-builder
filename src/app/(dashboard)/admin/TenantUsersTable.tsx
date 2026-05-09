"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, ShieldCheck, User, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";


type TenantUserData = {
  id: string;
  username: string;
  role: string;
  createdAt: Date;
  workspace: { slug: string };
};

export function TenantUsersTable({
  initialUsers,
}: {
  initialUsers: TenantUserData[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateUserRole = async (id: string, newRole: string) => {
    try {
      setLoadingId(id);
      const res = await fetch(`/api/admin/tenant-users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred while updating the tenant user role.");
    } finally {
      setLoadingId(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tenant user? This action cannot be undone.")) return;

    try {
      setLoadingId(id);
      const res = await fetch(`/api/admin/tenant-users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred while deleting the tenant user.");
    } finally {
      setLoadingId(null);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Username", "Workspace Slug", "Role", "Joined Date"];
    const csvRows = [
      headers.join(","),
      ...initialUsers.map((user) =>
        [
          user.id,
          `"${(user.username || "").replace(/"/g, '""')}"`,
          `"${(user.workspace.slug || "").replace(/"/g, '""')}"`,
          user.role,
          new Date(user.createdAt).toISOString(),
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tenant_users_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead
            className="text-xs uppercase bg-surface-2"
            style={{ color: "var(--foreground-muted)" }}
          >
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Workspace Slug</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialUsers.map((user) => (
              <tr key={user.id} className="border-b border-subtle">
                <td className="px-4 py-3 font-medium">{user.username}</td>
                <td className="px-4 py-3">{user.workspace.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-2 text-foreground-muted"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {user.role === "admin" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loadingId === user.id}
                        onClick={() => updateUserRole(user.id, "user")}
                        className="h-8"
                      >
                        <User className="mr-1.5 h-3.5 w-3.5" />
                        Make User
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loadingId === user.id}
                        onClick={() => updateUserRole(user.id, "admin")}
                        className="h-8 text-primary border-primary/20 hover:bg-primary/10"
                      >
                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                        Make Admin
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loadingId === user.id}
                      onClick={() => deleteUser(user.id)}
                      className="h-8 text-red-600 border-red-600/20 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {initialUsers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  No tenant users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
