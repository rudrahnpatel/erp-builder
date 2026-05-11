export default function PagesLoading() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up">
      {/* Header skeleton */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="skeleton h-3 w-28 rounded mb-3" />
          <div className="skeleton h-9 w-48 rounded-md mb-2" />
          <div className="skeleton h-4 w-96 rounded-md" />
        </div>
        <div className="skeleton h-10 w-32 rounded-xl" />
      </header>

      {/* Tree view skeleton */}
      <div
        className="rounded-xl p-2 border"
        style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <div className="skeleton h-4 w-4 rounded" />
            <div className="skeleton h-4 w-4 rounded" />
            <div className="skeleton h-4 rounded" style={{ width: `${120 + i * 20}px` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
