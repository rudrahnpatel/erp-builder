import useSWR from "swr";

export type WorkspaceData = {
  id: string;
  name: string;
  slug: string;
  settings?: any;
  stats: {
    tables: number;
    totalRecords: number;
    pages: number;
    installedPacks: number;
    installedPlugins: number;
    tenantUsers: number;
  };
  hasTenantAdmin?: boolean;
  tables: Array<{
    id: string;
    name: string;
    icon: string | null;
    packSource: string | null;
    fieldCount: number;
    recordCount: number;
  }>;
  pages: Array<{
    id: string;
    title: string;
    icon: string | null;
    packSource: string | null;
    packPageKey: string | null;
  }>;
  installedPacks: string[];
  installedPackDetails?: Array<{
    packId: string;
    packVersion: string;
  }>;
  installedPlugins: Array<{
    pluginId: string;
    enabled: boolean;
  }>;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error: any = new Error("Failed to fetch workspace");
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export function useWorkspace() {
  const { data, error, isLoading, mutate } = useSWR<WorkspaceData>("/api/workspace", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,       // 30s — prevent duplicate calls on fast navigation
    revalidateIfStale: true,
    focusThrottleInterval: 60000,  // 1 min — don't hammer DB on every alt-tab
    keepPreviousData: true,        // Show stale data while revalidating (no flash)
    errorRetryCount: 3,
    errorRetryInterval: 2000,
    revalidateOnReconnect: true,   // Refresh when network comes back online
  });

  return {
    workspace: data,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}
