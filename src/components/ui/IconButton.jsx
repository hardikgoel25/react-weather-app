import clsx from 'clsx';

/** 44px round glass button. `label` is required for screen readers. */
export function IconButton({ label, icon: Icon, className, active = false, size = 'md', children, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        'focus-ring inline-flex shrink-0 items-center justify-center rounded-full border border-card-border transition-colors',
        'hover:bg-card-strong active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
        active ? 'bg-card-strong text-fg' : 'bg-card text-fg',
        size === 'sm' ? 'size-9' : 'size-11',
        className,
      )}
      {...rest}
    >
      {Icon ? <Icon className={size === 'sm' ? 'size-4' : 'size-5'} aria-hidden="true" /> : children}
    </button>
  );
}
