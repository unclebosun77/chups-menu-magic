/**
 * Opening hours utilities — calculates real-time open/closed status
 * from the JSON structure saved during onboarding.
 *
 * Expected hours JSON shape (per day):
 *   { open: "09:00", close: "22:00", closed: false }
 *
 * The legacy format "9:00-22:00" (flat string) is also handled.
 */

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export interface DayHours {
  open: string;   // "09:00"
  close: string;  // "22:00"
  closed: boolean;
}

type HoursMap = Record<string, DayHours | string>;

/** Normalise a single day entry into DayHours */
function parseDayEntry(entry: DayHours | string | undefined): DayHours | null {
  if (!entry) return null;

  if (typeof entry === 'string') {
    // Legacy "9:00-22:00" format
    const parts = entry.split('-');
    if (parts.length === 2) {
      return { open: parts[0].trim(), close: parts[1].trim(), closed: false };
    }
    return null;
  }

  return entry;
}

/** Convert "HH:MM" to minutes since midnight */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Format "HH:MM" as human-readable, e.g. "10pm" or "9:30am" */
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m > 0 ? `${hour12}:${m.toString().padStart(2, '0')}${suffix}` : `${hour12}${suffix}`;
}

/**
 * Returns whether the restaurant is currently open based on opening hours.
 * If `isTemporarilyClosed` is true, always returns false.
 */
export function isRestaurantOpen(
  hours: HoursMap | null | undefined,
  isTemporarilyClosed = false,
): boolean {
  if (isTemporarilyClosed) return false;
  if (!hours || Object.keys(hours).length === 0) return true; // no hours set = assume open

  const now = new Date();
  const dayName = DAYS[now.getDay()];
  const entry = parseDayEntry(hours[dayName]);

  if (!entry || entry.closed) return false;

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = toMinutes(entry.open);
  const closeMins = toMinutes(entry.close);

  // Handle overnight (e.g. 18:00 - 02:00)
  if (closeMins <= openMins) {
    return nowMins >= openMins || nowMins < closeMins;
  }

  return nowMins >= openMins && nowMins < closeMins;
}

/**
 * Returns a human-readable opening status string.
 *  - "Open · Closes at 10pm"
 *  - "Closed · Opens at 9am"
 *  - "Closed today · Opens tomorrow at 10am"
 *  - "Temporarily closed"
 */
export function getOpeningStatus(
  hours: HoursMap | null | undefined,
  isTemporarilyClosed = false,
): { label: string; isOpen: boolean } {
  if (isTemporarilyClosed) {
    return { label: 'Temporarily closed', isOpen: false };
  }

  if (!hours || Object.keys(hours).length === 0) {
    return { label: 'Hours not set', isOpen: true };
  }

  const now = new Date();
  const dayIndex = now.getDay();
  const dayName = DAYS[dayIndex];
  const entry = parseDayEntry(hours[dayName]);

  const open = isRestaurantOpen(hours, false);

  if (open && entry && !entry.closed) {
    return { label: `Open · Closes at ${formatTime(entry.close)}`, isOpen: true };
  }

  // Find next opening
  for (let offset = 0; offset < 7; offset++) {
    const checkDay = DAYS[(dayIndex + offset) % 7];
    const checkEntry = parseDayEntry(hours[checkDay]);

    if (!checkEntry || checkEntry.closed) continue;

    if (offset === 0) {
      // Same day — might open later today
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const openMins = toMinutes(checkEntry.open);
      if (nowMins < openMins) {
        return { label: `Closed · Opens at ${formatTime(checkEntry.open)}`, isOpen: false };
      }
      // Already past closing — fall through to next day
      continue;
    }

    const dayLabel = offset === 1 ? 'tomorrow' : DAYS[(dayIndex + offset) % 7];
    return {
      label: `Closed · Opens ${dayLabel} at ${formatTime(checkEntry.open)}`,
      isOpen: false,
    };
  }

  return { label: 'Closed', isOpen: false };
}
