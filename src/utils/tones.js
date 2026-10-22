/** Severity palette shared by AQI, UV, insights and toasts. */
export const TONES = {
  good: {
    text: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-500/15',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
    border: 'border-emerald-500/30',
    hex: '#34d399',
  },
  ok: {
    text: 'text-yellow-700 dark:text-yellow-300',
    bg: 'bg-yellow-400/15',
    dot: 'bg-yellow-500 dark:bg-yellow-300',
    border: 'border-yellow-400/30',
    hex: '#facc15',
  },
  warn: {
    text: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-500/15',
    dot: 'bg-orange-500 dark:bg-orange-400',
    border: 'border-orange-500/30',
    hex: '#fb923c',
  },
  bad: {
    text: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-500/15',
    dot: 'bg-red-500 dark:bg-red-400',
    border: 'border-red-500/30',
    hex: '#f87171',
  },
  danger: {
    text: 'text-fuchsia-800 dark:text-fuchsia-300',
    bg: 'bg-fuchsia-500/15',
    dot: 'bg-fuchsia-600 dark:bg-fuchsia-400',
    border: 'border-fuchsia-500/30',
    hex: '#e879f9',
  },
  info: {
    text: 'text-sky-700 dark:text-sky-200',
    bg: 'bg-sky-500/15',
    dot: 'bg-sky-500 dark:bg-sky-300',
    border: 'border-sky-500/30',
    hex: '#7dd3fc',
  },
};

export function tone(name) {
  return TONES[name] ?? TONES.info;
}
