"use client";

import useSWR from "swr";
import { RiDatabase2Line, RiLayoutLine, RiPuzzleLine, RiFileList3Line } from "react-icons/ri";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

export function TenantDashboard() {
  const { data, error, isLoading } = useSWR("/api/tenant/dashboard-stats", fetcher);

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
        <div className="skeleton h-10 w-64 rounded-md mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="skeleton h-[300px] rounded-xl" />
          <div className="skeleton h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-10 text-center text-muted-foreground border-2 border-dashed rounded-xl mx-8 mt-8">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Welcome to {data.workspaceName || "Your Workspace"}
        </h1>
        <p className="text-muted-foreground">
          Here is an overview of your installed modules and data. Use the sidebar to navigate to specific applications.
        </p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border bg-card/50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <RiDatabase2Line className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Databases</p>
            <p className="text-2xl font-bold">{data.stats?.totalTables || 0}</p>
          </div>
        </div>
        <div className="p-5 rounded-xl border bg-card/50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <RiFileList3Line className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold">{data.stats?.totalRecords || 0}</p>
          </div>
        </div>
        <div className="p-5 rounded-xl border bg-card/50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <RiLayoutLine className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custom Pages</p>
            <p className="text-2xl font-bold">{data.stats?.totalPages || 0}</p>
          </div>
        </div>
        <div className="p-5 rounded-xl border bg-card/50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
            <RiPuzzleLine className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Plugins</p>
            <p className="text-2xl font-bold">{data.stats?.totalPlugins || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Distribution Pie Chart */}
        <div className="p-6 rounded-xl border bg-card/50 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-6 text-foreground">Module Distribution</h3>
          <div className="flex-1 min-h-[250px]">
            {data.chartData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No modules installed yet
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {data.chartData?.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="capitalize text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tables Bar Chart */}
        <div className="p-6 rounded-xl border bg-card/50 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-6 text-foreground">Top Databases by Records</h3>
          <div className="flex-1 min-h-[250px]">
            {data.tableStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tableStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--foreground-muted)' }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'var(--surface-2)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="records" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No records added yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
