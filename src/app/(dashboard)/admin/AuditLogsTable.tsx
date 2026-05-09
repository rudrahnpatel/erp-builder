"use client";

type AuditLogData = {
  id: string;
  action: string;
  actorEmail: string | null;
  targetId: string | null;
  details: any;
  createdAt: Date;
};

export function AuditLogsTable({
  initialLogs,
}: {
  initialLogs: AuditLogData[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead
          className="text-xs uppercase bg-surface-2"
          style={{ color: "var(--foreground-muted)" }}
        >
          <tr>
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Actor (Email)</th>
            <th className="px-4 py-3">Target ID</th>
            <th className="px-4 py-3">Details</th>
          </tr>
        </thead>
        <tbody>
          {initialLogs.map((log) => (
            <tr key={log.id} className="border-b border-subtle">
              <td className="px-4 py-3 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3 font-semibold text-primary">
                {log.action}
              </td>
              <td className="px-4 py-3">{log.actorEmail || "System"}</td>
              <td className="px-4 py-3 font-mono text-xs">{log.targetId || "-"}</td>
              <td className="px-4 py-3 text-xs">
                <pre className="max-w-xs overflow-auto bg-surface-2 p-1.5 rounded-md" style={{ color: "var(--foreground-muted)" }}>
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
          {initialLogs.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-4 text-center"
                style={{ color: "var(--foreground-muted)" }}
              >
                No audit logs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
