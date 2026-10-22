/**
 * Interleave sunrise/sunset markers with the next-48h hour buckets for the
 * hourly strip. Returns items of kind 'hour' | 'sunrise' | 'sunset'.
 */
export function buildTimeline(model) {
  const events = [];
  for (const day of [model.today, model.tomorrow, model.days[model.todayIndex + 2]]) {
    if (!day) continue;
    if (day.sunrise) events.push({ kind: 'sunrise', time: day.sunrise });
    if (day.sunset) events.push({ kind: 'sunset', time: day.sunset });
  }
  events.sort((a, b) => a.time.localeCompare(b.time));

  const items = [];
  model.next48.forEach((hour, i) => {
    items.push({ kind: 'hour', hour, isNow: i === 0 });
    const until = model.next48[i + 1]?.time ?? null;
    for (const ev of events) {
      if (ev.time >= model.nowKey && ev.time >= hour.time && (until == null || ev.time < until)) {
        items.push({ kind: ev.kind, time: ev.time });
      }
    }
  });
  return items;
}
