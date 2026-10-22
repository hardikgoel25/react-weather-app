import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export function Spinner({ className, label = 'Loading' }) {
  return <Loader2 className={clsx('size-5 animate-spin', className)} role="img" aria-label={label} />;
}
