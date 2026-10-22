import clsx from 'clsx';
import { Card } from '../ui/Card.jsx';

/** Small metric card: title row, large value, optional body and a caption pinned to the bottom. */
export function DetailCard({ title, icon, value, unit, caption, className, children }) {
  return (
    <Card title={title} icon={icon} className={clsx('flex min-h-[10rem] flex-col', className)}>
      {value != null && (
        <p className="text-3xl font-semibold leading-none tabular">
          {value}
          {unit && <span className="ml-1 text-base font-normal text-fg-muted">{unit}</span>}
        </p>
      )}
      {children}
      {caption && <p className="mt-auto pt-3 text-xs leading-relaxed text-fg-muted">{caption}</p>}
    </Card>
  );
}
