"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type WorkspaceData = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  user: { email: string };
  _count: {
    tenantUsers: number;
    tables: number;
  };
};

export function WorkspacesTable({
  initialWorkspaces,
}: {
  initialWorkspaces: WorkspaceData[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const deleteWorkspace = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this workspace? This will permanently delete all its tables, records, pages, and tenant users. This action CANNOT be undone."
      )
    )
      return;

    try {
      setLoadingId(id);
      const res = await fetch(`/api/admin/workspaces/${id}`, {
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
      alert("An unexpected error occurred while deleting the workspace.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead
          className="text-xs uppercase bg-surface-2"
          style={{ color: "var(--foreground-muted)" }}
        >
          <tr>
            <th className="px-4 py-3">Workspace Name</th>
            <th className="px-4 py-3">Slug (URL)</th>
            <th className="px-4 py-3">Owner Email</th>
            <th className="px-4 py-3">Users</th>
            <th className="px-4 py-3">Tables</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialWorkspaces.map((ws) => (
            <tr key={ws.id} className="border-b border-subtle">
              <td className="px-4 py-3 font-medium">{ws.name}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/apps/${ws.slug}`}
                  target="_blank"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  {ws.slug}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </td>
              <td className="px-4 py-3">{ws.user.email}</td>
              <td className="px-4 py-3">{ws._count.tenantUsers}</td>
              <td className="px-4 py-3">{ws._count.tables}</td>
              <td className="px-4 py-3">
                {new Date(ws.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingId === ws.id}
                    onClick={() => deleteWorkspace(ws.id)}
                    className="h-8 text-red-600 border-red-600/20 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {initialWorkspaces.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-4 text-center"
                style={{ color: "var(--foreground-muted)" }}
              >
                No workspaces found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
