/**
 * Time helpers for Open-Meteo's "local ISO" strings ("YYYY-MM-DDTHH:mm").
 *
 * Open-Meteo returns every timestamp in the *location's* timezone with no UTC
 * offset. Feeding such a string to `new Date()` would re-interpret it in the
 * browser's timezone, so every helper here parses the string itself and only
 * uses `Date` in UTC mode as a formatting vehicle.
 */

const LOCAL_ISO = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;

const pad = (n) => String(n).padStart(2, '0');

/** Parse a local ISO string into its parts. Returns null for anything else. */
export function parseLocal(value) {
  if (typeof value !== 'string') return null;
  const match = LOCAL_ISO.exec(value);
  if (!match) return null;
  const [, y, mo, d, h = '00', mi = '00'] = match;
  return {
    year: Number(y),
    month: Number(mo),
    day: Number(d),
    hour: Number(h),
    minute: Number(mi),
    date: `${y}-${mo}-${d}`,
    key: `${y}-${mo}-${d}T${h}:${mi}`,
  };
}

/** A `Date` whose *UTC* fields equal the local parts (formatting vehicle only). */
export function toUtcDate(value) {
  const p = parseLocal(value);
  if (!p) return null;
  return new Date(Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute));
}

/** Current wall-clock time in a timezone as a local ISO string. */
export function nowInZone(timeZone, date = new Date()) {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const parts = {};
    for (const part of fmt.formatToParts(date)) {
      if (part.type !== 'literal') parts[part.type] = part.value;
    }
    const hour = parts.hour === '24' ? '00' : parts.hour;
    return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`;
  } catch {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  }
}

/** Floor a local ISO string to the hour ("...T14:00"). */
export function hourKey(value) {
  const p = parseLocal(value);
  return p ? `${p.date}T${pad(p.hour)}:00` : null;
}

/** Whole minutes from `a` to `b` (both local ISO strings in the same zone). */
export function minutesBetween(a, b) {
  const da = toUtcDate(a);
  const db = toUtcDate(b);
  if (!da || !db) return null;
  return Math.round((db.getTime() - da.getTime()) / 60000);
}

/** Add whole days to a "YYYY-MM-DD" string. */
export function addDays(dateStr, days) {
  const d = toUtcDate(dateStr);
  if (!d) return null;
  d.setUTCDate(d.getUTCDate() + days);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function fmt(value, options, locale) {
  const d = toUtcDate(value);
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(d);
  } catch {
    return '';
  }
}

/** "3 PM" / "15:00" */
export function formatHour(value, { hour12 = true, locale } = {}) {
  return hour12
    ? fmt(value, { hour: 'numeric', hour12: true }, locale)
    : fmt(value, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }, locale);
}

/** "6:32 AM" / "06:32" */
export function formatClock(value, { hour12 = true, locale } = {}) {
  return hour12
    ? fmt(value, { hour: 'numeric', minute: '2-digit', hour12: true }, locale)
    : fmt(value, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }, locale);
}

/** "Mon" / "Monday" */
export function formatWeekday(value, { long = false, locale } = {}) {
  return fmt(value, { weekday: long ? 'long' : 'short' }, locale);
}

/** "22 Oct" */
export function formatDayMonth(value, { locale } = {}) {
  return fmt(value, { day: 'numeric', month: 'short' }, locale);
}

/** "Wednesday, 22 October" */
export function formatFullDate(value, { locale } = {}) {
  return fmt(value, { weekday: 'long', day: 'numeric', month: 'long' }, locale);
}

/** "Today" / "Tomorrow" / weekday for a date relative to `todayDate` ("YYYY-MM-DD"). */
export function dayLabel(value, todayDate, { long = false, locale } = {}) {
  const p = parseLocal(value);
  if (!p) return '';
  if (p.date === todayDate) return 'Today';
  if (p.date === addDays(todayDate, 1)) return 'Tomorrow';
  if (p.date === addDays(todayDate, -1)) return 'Yesterday';
  return formatWeekday(value, { long, locale });
}

/** Seconds → "11h 24m" */
export function formatDuration(seconds) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) return '—';
  const total = Math.round(seconds / 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Signed minutes → "+2m 14s"-style daylight delta ("+3 min", "−1 min"). */
export function formatSignedMinutes(seconds) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return '';
  const minutes = Math.round(seconds / 60);
  if (minutes === 0) return 'same as yesterday';
  const abs = Math.abs(minutes);
  const unit = abs === 1 ? 'min' : 'min';
  return `${minutes > 0 ? '+' : '−'}${abs} ${unit} vs yesterday`;
}

/** Human "updated" label from an epoch-ms timestamp. */
export function relativeTime(timestampMs, nowMs = Date.now()) {
  if (typeof timestampMs !== 'number') return '';
  const diff = Math.max(0, nowMs - timestampMs);
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}
