export default function TablesLoading() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up">
      {/* Header skeleton */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="skeleton h-3 w-28 rounded mb-3" />
          <div className="skeleton h-9 w-48 rounded-md mb-2" />
          <div className="skeleton h-4 w-80 rounded-md" />
        </div>
      </header>

      {/* Table list skeleton */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4"
            style={{ borderBottom: i < 8 ? "1px solid var(--border-subtle)" : "none" }}
          >
            <div className="skeleton h-9 w-9 rounded-lg shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-4 w-32 rounded-md mb-1" />
              <div className="skeleton h-3 w-20 rounded-md" />
            </div>
            <div className="skeleton h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
