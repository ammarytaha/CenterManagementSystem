// Month keys are "YYYY-MM". All month math uses UTC to line up with @db.Date
// values (which Prisma returns as UTC-midnight Dates).

export const toMonthKey = (date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

export const currentMonthKey = () => toMonthKey(new Date());

export const isValidMonthKey = (k) => /^\d{4}-(0[1-9]|1[0-2])$/.test(k);

// First UTC day of `monthKey` (inclusive lower bound).
export const startOfMonth = (monthKey) => {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
};

// First UTC day of the following month (exclusive upper bound for ranges).
export const endOfMonthExclusive = (monthKey) => {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(y, m, 1));
};

// Inclusive list of month keys from `startDate`'s month through `endKey`.
export const enumerateMonths = (startDate, endKey = currentMonthKey()) => {
  const start = new Date(startDate);
  let y = start.getUTCFullYear();
  let m = start.getUTCMonth() + 1;
  const [ey, em] = endKey.split('-').map(Number);
  const out = [];
  let guard = 0; // safety against malformed ranges
  while ((y < ey || (y === ey && m <= em)) && guard < 600) {
    out.push(`${y}-${String(m).padStart(2, '0')}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    guard += 1;
  }
  return out;
};
