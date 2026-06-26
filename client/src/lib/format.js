// Display formatters. Western digits + Arabic labels (Egyptian users read both,
// but Western digits are clearer for money/IDs).

export const formatEGP = (n) =>
  `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(n || 0))} ج.م`;

export const formatNumber = (n) => new Intl.NumberFormat('en-US').format(Number(n || 0));

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

// "YYYY-MM" -> "يونيو 2026"
export const formatMonthKey = (key) => {
  if (!key) return '';
  const [y, m] = key.split('-').map(Number);
  return `${AR_MONTHS[m - 1]} ${y}`;
};

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '');

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : '';

// Current month as "YYYY-MM".
export const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
