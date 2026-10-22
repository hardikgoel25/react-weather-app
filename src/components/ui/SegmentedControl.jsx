import clsx from 'clsx';

/**
 * Accessible radio-group styled as a pill switcher.
 * options: [{ value, label }]
 */
export function SegmentedControl({ label, options, value, onChange, size = 'md', className }) {
  const onKeyDown = (event) => {
    const index = options.findIndex((o) => o.value === value);
    if (index === -1) return;
    let next = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % options.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = options.length - 1;
    if (next != null) {
      event.preventDefault();
      onChange(options[next].value);
      event.currentTarget.querySelectorAll('[role="radio"]')[next]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={clsx('inline-flex rounded-full border border-card-border bg-input p-0.5', className)}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={clsx(
              'focus-ring rounded-full font-medium transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
              checked ? 'bg-fg text-[var(--bg-base)] shadow-sm' : 'text-fg-muted hover:text-fg',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
