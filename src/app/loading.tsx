/** Main panel skeleton — vice palette */
export default function Loading() {
  return (
    <div className="px-8 py-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-3 w-24 bg-neon-pink/20 rounded mb-3" />
      <div className="h-9 w-64 bg-vice-border rounded mb-6" />
      <div className="h-10 w-full max-w-md bg-white border border-vice-border rounded-lg mb-6" />
      <div className="rounded-xl border border-vice-border bg-white overflow-hidden shadow-sm">
        <div className="h-10 bg-eggplant-900/10" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-12 border-t border-vice-border flex gap-4 px-4 items-center"
          >
            <div className="h-3 w-16 bg-vice-border rounded" />
            <div className="h-3 flex-1 max-w-xs bg-vice-border rounded" />
            <div className="h-3 w-20 bg-vice-border rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
