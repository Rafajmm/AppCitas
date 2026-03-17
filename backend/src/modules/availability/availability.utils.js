function timeToMinutes(t) {
  // pg TIME -> string 'HH:MM:SS' or 'HH:MM'
  const parts = String(t).split(':').map((x) => Number(x));
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  return h * 60 + m;
}

function minutesToTime(mins) {
  const m = Math.max(0, Math.min(24 * 60, Math.floor(mins)));
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function getWeekday0Sunday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00.000Z');
  return d.getUTCDay();
}

function intersectRanges(aRanges, bRanges) {
  // each is [[start,end]] (single range usage here). returns single range [s,e] or [null,null]
  if (!aRanges.length || !bRanges.length) return [null, null];
  const [aS, aE] = aRanges[0];
  const [bS, bE] = bRanges[0];
  const s = Math.max(aS, bS);
  const e = Math.min(aE, bE);
  if (e <= s) return [null, null];
  return [s, e];
}

function subtractRanges(baseRanges, busyRanges) {
  // baseRanges: [[s,e]]; busyRanges: [[s,e]] merged & sorted
  const result = [];
  for (const [baseS, baseE] of baseRanges) {
    let cursor = baseS;
    for (const [busyS, busyE] of busyRanges) {
      if (busyE <= cursor) continue;
      if (busyS >= baseE) break;
      if (busyS > cursor) {
        result.push([cursor, Math.min(busyS, baseE)]);
      }
      cursor = Math.max(cursor, busyE);
      if (cursor >= baseE) break;
    }
    if (cursor < baseE) result.push([cursor, baseE]);
  }
  return result.filter(([s, e]) => e > s);
}

function clampRange(range, bounds) {
  const s = Math.max(range[0], bounds[0]);
  const e = Math.min(range[1], bounds[1]);
  if (e <= s) return null;
  return [s, e];
}

module.exports = {
  timeToMinutes,
  minutesToTime,
  getWeekday0Sunday,
  intersectRanges,
  subtractRanges,
  clampRange,
};
