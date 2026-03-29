const SkeletonCard = () => (
  <div className="overflow-hidden rounded-lg border bg-card">
    <div className="aspect-[4/3] animate-pulse bg-muted" />
    <div className="space-y-2 p-3">
      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      <div className="flex justify-between">
        <div className="h-5 w-12 animate-pulse rounded bg-muted" />
        <div className="h-7 w-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
