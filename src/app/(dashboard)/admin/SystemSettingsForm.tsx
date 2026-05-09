"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SystemSettingsForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(
    initialData?.maintenanceMode || false
  );
  const [maxWorkspacesPerUser, setMaxWorkspacesPerUser] = useState(
    initialData?.maxWorkspacesPerUser || 1
  );

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode,
          maxWorkspacesPerUser,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
        return;
      }
      alert("Settings saved successfully.");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-subtle pb-4">
          <div>
            <h3 className="font-medium">Maintenance Mode</h3>
            <p className="text-sm text-foreground-muted">
              Enable maintenance mode to restrict access to the entire platform.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
            />
            <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between border-b border-subtle pb-4">
          <div>
            <h3 className="font-medium">Max Workspaces Per User</h3>
            <p className="text-sm text-foreground-muted">
              The default limit of workspaces a new builder can create.
            </p>
          </div>
          <input
            type="number"
            min={1}
            className="w-20 px-3 py-1.5 rounded-md border border-subtle bg-surface-1 focus:outline-none focus:ring-2 focus:ring-primary"
            value={maxWorkspacesPerUser}
            onChange={(e) => setMaxWorkspacesPerUser(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Global Settings"}
      </Button>
    </div>
  );
}
