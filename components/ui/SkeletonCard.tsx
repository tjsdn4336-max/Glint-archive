export default function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="bg-ga-white rounded-2xl  border border-ga-border overflow-hidden animate-pulse">
      <div className={`bg-ga-border ${compact ? 'h-32' : 'h-44'}`} />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-ga-border rounded w-1/3" />
        <div className="h-4 bg-ga-border rounded w-2/3" />
        <div className="h-3 bg-ga-border rounded w-1/2" />
        <div className="h-5 bg-ga-border rounded w-1/3" />
        {!compact && <div className="h-10 bg-ga-border rounded-full mt-2" />}
      </div>
    </div>
  );
}

export function SkeletonShopCard() {
  return (
    <div className="bg-ga-white rounded-2xl  border border-ga-border p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-ga-border rounded w-1/2" />
          <div className="h-3 bg-ga-border rounded w-1/3" />
        </div>
        <div className="h-4 bg-ga-border rounded w-16" />
      </div>
      <div className="h-3 bg-ga-border rounded w-2/3" />
    </div>
  );
}
