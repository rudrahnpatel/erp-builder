import useSWR from "swr";

export type WorkspaceData = {
  id: string;
  name: string;
  slug: string;
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

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to fetch workspace");
  return res.json();
});

export function useWorkspace() {
  const { data, error, isLoading, mutate } = useSWR<WorkspaceData>("/api/workspace", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  return {
    workspace: data,
    isLoading,
    isError: error,
    refetch: mutate,
  };
}
