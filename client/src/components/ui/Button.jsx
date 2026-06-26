import { Spinner } from './Spinner.jsx';

// Pill buttons per buttons.md — every variant except ghost/disabled gets the
// glint shadow and a 4px focus ring.
const base =
  'inline-flex items-center justify-center gap-2 font-medium font-sans rounded-pill border transition-colors focus:outline-none select-none disabled:cursor-not-allowed disabled:shadow-none disabled:bg-disabled disabled:text-fg-disabled disabled:border-border-default-medium';

const sizes = {
  sm: 'px-3 py-2 text-sm',
  base: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
  icon: 'p-2.5',
};

const variants = {
  brand: 'bg-brand text-white border-transparent shadow-glint hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium',
  secondary: 'bg-neutral-secondary-medium text-body border-border-default-medium shadow-glint hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary',
  tertiary: 'bg-neutral-primary-soft text-body border-border-default shadow-glint hover:bg-neutral-secondary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary-soft',
  success: 'bg-success text-white border-transparent shadow-glint hover:bg-success-strong focus:ring-4 focus:ring-success-medium',
  danger: 'bg-danger text-white border-transparent shadow-glint hover:bg-danger-strong focus:ring-4 focus:ring-danger-medium',
  warning: 'bg-warning text-white border-transparent shadow-glint hover:bg-warning-strong focus:ring-4 focus:ring-warning-medium',
  dark: 'bg-dark text-white border-transparent shadow-glint hover:bg-dark-strong focus:ring-4 focus:ring-neutral-tertiary',
  ghost: 'bg-transparent text-heading border-transparent hover:bg-neutral-secondary-medium focus:ring-4 focus:ring-neutral-tertiary',
};

export function Button({
  variant = 'brand',
  size = 'base',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner size={16} className="text-current" />}
      {children}
    </button>
  );
}
