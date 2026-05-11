export default function ModulesLoading() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up">
      {/* Header skeleton */}
      <header>
        <div className="skeleton h-3 w-28 rounded mb-3" />
        <div className="skeleton h-9 w-56 rounded-md mb-2" />
        <div className="skeleton h-4 w-96 rounded-md" />
      </header>

      {/* Search + categories skeleton */}
      <div className="space-y-4">
        <div className="skeleton h-10 w-full max-w-md rounded-lg" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-8 rounded-lg" style={{ width: `${60 + i * 12}px` }} />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 stagger-children">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-5 border h-64 flex flex-col"
            style={{ background: "var(--card)", borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="flex-1">
                <div className="skeleton h-4 w-24 rounded-md mb-1.5" />
                <div className="skeleton h-3 w-16 rounded-md" />
              </div>
            </div>
            <div className="skeleton h-4 w-full rounded-md mb-2" />
            <div className="skeleton h-4 w-3/4 rounded-md mb-4" />
            <div className="mt-auto">
              <div className="skeleton h-9 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
