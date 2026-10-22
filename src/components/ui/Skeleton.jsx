import clsx from 'clsx';

export function Skeleton({ className, ...rest }) {
  return (
    <div
      className={clsx('animate-pulse rounded-lg bg-fg/10', className)}
      aria-hidden="true"
      {...rest}
    />
  );
}

/** Card-shaped placeholder used while a section loads. */
export function SkeletonCard({ lines = 3, className }) {
  return (
    <div className={clsx('glass p-4 sm:p-5', className)} role="status" aria-label="Loading">
      <Skeleton className="mb-4 h-3 w-24" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${90 - i * 15}%` }} />
        ))}
      </div>
    </div>
  );
}
