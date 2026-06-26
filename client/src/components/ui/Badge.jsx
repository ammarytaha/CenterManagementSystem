// Pill badges per badges.md.
const variants = {
  brand: 'bg-brand-softer border-border-brand-subtle text-fg-brand-strong',
  gray: 'bg-neutral-secondary-medium border-border-default text-heading',
  success: 'bg-success-soft border-border-success-subtle text-fg-success-strong',
  danger: 'bg-danger-soft border-border-danger-subtle text-fg-danger-strong',
  warning: 'bg-warning-soft border-border-warning-subtle text-fg-warning',
  dark: 'bg-dark border-transparent text-white',
};

export function Badge({ variant = 'gray', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill border px-1.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
