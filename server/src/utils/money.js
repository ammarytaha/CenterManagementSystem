// Prisma returns Decimal columns as Decimal objects; the center's fees are small
// enough that Number math (rounded to 2 places) is safe for sums and reports.
export const num = (d) => (d === null || d === undefined ? 0 : Number(d));

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
