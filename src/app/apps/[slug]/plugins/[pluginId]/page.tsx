import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getWorkspaceBySlug } from "@/lib/get-workspace";
import { PLUGIN_EXECUTORS } from "@/lib/plugins/executors";
import { UPIExecutor, PDFExecutor, TallyExecutor, SimulatedExecutor } from "@/components/plugins/SharedExecutors";
import { RiErrorWarningLine } from "react-icons/ri";

export default async function TenantPluginPage({
  params,
}: {
  params: Promise<{ slug: string; pluginId: string }>;
}) {
  const { slug, pluginId } = await params;
  const workspace = await getWorkspaceBySlug(slug);

  if (!workspace) notFound();

  const installedPlugin = await db.installedPlugin.findFirst({
    where: {
      workspaceId: workspace.id,
      pluginId,
      enabled: true,
    },
  });

  if (!installedPlugin) {
    notFound();
  }

  const executorInfo = PLUGIN_EXECUTORS[pluginId];
  if (!executorInfo) {
    notFound();
  }

  const config = (installedPlugin.config as Record<string, unknown>) || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8 px-4 animate-fade-in-up">
      <header className="flex flex-col gap-1 mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold" style={{ color: "var(--foreground)" }}>
          {executorInfo.label || "Plugin Tool"}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
          {executorInfo.description}
        </p>
      </header>

      <div className="p-6 bg-surface-1 border border-border-subtle rounded-xl shadow-sm">
        {pluginId === "upi-payment-link" && <UPIExecutor config={config} />}
        {pluginId === "pdf-invoice-generator" && <PDFExecutor config={config} />}
        {pluginId === "tally-export" && <TallyExecutor config={config} />}
        {executorInfo.type === "simulated" && <SimulatedExecutor pluginId={pluginId} config={config} />}
        {executorInfo.type === "external" && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed text-sm" style={{ borderColor: "var(--border-subtle)", color: "var(--foreground-muted)", background: "var(--surface-2)" }}>
            <RiErrorWarningLine className="h-5 w-5 shrink-0" style={{ color: "var(--foreground-dimmed)" }} />
            This plugin requires external setup or integration with a built-in module. It cannot be executed directly here.
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; pluginId: string }>;
}) {
  const { pluginId } = await params;
  const executorInfo = PLUGIN_EXECUTORS[pluginId];
  return {
    title: executorInfo ? executorInfo.label : "Plugin Tool",
  };
}
