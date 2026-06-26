import { forwardRef } from 'react';

// Form controls per inputs.md — pill shape, focus ring in brand.
export const Label = ({ htmlFor, children, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-heading mb-2 ${className}`}>
    {children}
  </label>
);

const fieldBase =
  'block w-full rounded-pill bg-neutral-secondary-medium text-sm text-heading shadow-xs px-3 py-2.5 transition placeholder:text-body focus:outline-none disabled:bg-disabled disabled:text-fg-disabled disabled:cursor-not-allowed';
const ok = 'border border-border-default-medium hover:border-border-default-strong focus:border-border-brand focus:ring-1 focus:ring-brand';
const bad = 'border border-border-danger focus:border-border-danger focus:ring-1 focus:ring-danger';

export const Input = forwardRef(({ error, className = '', ...props }, ref) => (
  <input ref={ref} className={`${fieldBase} ${error ? bad : ok} ${className}`} {...props} />
));
Input.displayName = 'Input';

export const Select = forwardRef(({ error, className = '', children, ...props }, ref) => (
  <select ref={ref} className={`${fieldBase} ${error ? bad : ok} ${className}`} {...props}>
    {children}
  </select>
));
Select.displayName = 'Select';

// Label + control + hint/error wrapper.
export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-body-subtle">{hint}</p>}
      {error && <p className="mt-1 text-xs text-fg-danger">{error}</p>}
    </div>
  );
}
