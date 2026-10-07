export type EventDay = 1 | 2;

/**
 * Parses URL query parameters, pathnames, and hashes to determine
 * whether the invitation is for Day 1 (10-23) or Day 2 (10-24).
 * Defaults to Day 1 if unspecified.
 */
export function getActiveEventDay(): EventDay {
  if (typeof window === 'undefined') return 1;

  const search = window.location.search.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const full = `${pathname}${search}${hash}`;

  // Check for Day 2 indicators:
  // ?day=2, ?day=24, ?day=10-24, ?date=24, ?d=2, /day2, /day-2, /24, #day2
  if (
    search.includes('day=2') ||
    search.includes('day=24') ||
    search.includes('day=10-24') ||
    search.includes('d=2') ||
    search.includes('date=24') ||
    full.includes('/day2') ||
    full.includes('/day-2') ||
    full.includes('/24') ||
    hash.includes('day=2') ||
    hash.includes('day2')
  ) {
    return 2;
  }

  // Otherwise, strictly Day 1 (10-23)
  return 1;
}

export function getEventDayInfo(day: EventDay) {
  if (day === 2) {
    return {
      dayNumber: 2,
      dayOfMonth: 24,
      month: 10,
      year: 2026,
      weekday: 'Бямба гараг',
      dateFormatted: '10.24 (Бямба)',
      fullLabel: '2 дахь өдөр: 10 сарын 24 (Бямба)',
      shortLabel: '10 сарын 24 (Бямба)',
      eventDayKey: '10-24',
    };
  }

  return {
    dayNumber: 1,
    dayOfMonth: 23,
    month: 10,
    year: 2026,
    weekday: 'Баасан гараг',
    dateFormatted: '10.23 (Баасан)',
    fullLabel: '1 дэх өдөр: 10 сарын 23 (Баасан)',
    shortLabel: '10 сарын 23 (Баасан)',
    eventDayKey: '10-23',
  };
}
