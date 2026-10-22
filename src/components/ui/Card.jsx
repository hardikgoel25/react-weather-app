import { useId } from 'react';
import clsx from 'clsx';

/**
 * Glass card with an optional Apple-style small-caps title row.
 * `icon` is a lucide component; `action` renders at the right of the title.
 */
export function Card({ title, icon: Icon, subtitle, action, className, children, as: Tag = 'section', ...rest }) {
  const id = useId();
  return (
    <Tag className={clsx('glass p-4 sm:p-5', className)} aria-labelledby={title ? id : undefined} {...rest}>
      {title && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id={id}
              className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-fg-muted"
            >
              {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
              <span className="truncate">{title}</span>
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-fg-faint">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}
