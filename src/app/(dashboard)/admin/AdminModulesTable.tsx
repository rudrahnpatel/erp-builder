"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ModuleData = {
  id: string;
  name: string;
  packId: string;
  published: boolean;
  version: string;
  createdAt: Date;
  author: { email: string };
};

export function AdminModulesTable({
  initialModules,
}: {
  initialModules: ModuleData[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const togglePublish = async (id: string, currentlyPublished: boolean) => {
    try {
      setLoadingId(id);
      const res = await fetch(`/api/admin/modules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentlyPublished }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
        return;
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred while updating the module.");
    } finally {
      setLoadingId(null);
    }
  };

  const deleteModule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this module? This action cannot be undone.")) return;

    try {
      setLoadingId(id);
      const res = await fetch(`/api/admin/modules/${id}`, {
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
      alert("An unexpected error occurred while deleting the module.");
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
            <th className="px-4 py-3">Module Name</th>
            <th className="px-4 py-3">Pack ID</th>
            <th className="px-4 py-3">Author Email</th>
            <th className="px-4 py-3">Version</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialModules.map((mod) => (
            <tr key={mod.id} className="border-b border-subtle">
              <td className="px-4 py-3 font-medium">{mod.name}</td>
              <td className="px-4 py-3 font-mono text-xs">{mod.packId}</td>
              <td className="px-4 py-3">{mod.author.email}</td>
              <td className="px-4 py-3">{mod.version}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    mod.published
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-surface-2 text-foreground-muted"
                  }`}
                >
                  {mod.published ? "Published" : "Draft"}
                </span>
              </td>
              <td className="px-4 py-3">
                {new Date(mod.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingId === mod.id}
                    onClick={() => togglePublish(mod.id, mod.published)}
                    className="h-8"
                  >
                    {mod.published ? (
                      <>
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                        Publish
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loadingId === mod.id}
                    onClick={() => deleteModule(mod.id)}
                    className="h-8 text-red-600 border-red-600/20 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {initialModules.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-4 text-center"
                style={{ color: "var(--foreground-muted)" }}
              >
                No custom modules found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
