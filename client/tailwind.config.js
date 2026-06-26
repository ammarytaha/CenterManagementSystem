/** @type {import('tailwindcss').Config} */
// Maps the design-system tokens (CSS custom properties defined in index.css) to
// Tailwind utilities. Use these semantic names everywhere — never raw hex.
const v = (name) => `var(--${name})`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // neutral backgrounds
        'neutral-primary-soft': v('neutral-primary-soft'),
        'neutral-primary': v('neutral-primary'),
        'neutral-primary-medium': v('neutral-primary-medium'),
        'neutral-primary-strong': v('neutral-primary-strong'),
        'neutral-secondary-soft': v('neutral-secondary-soft'),
        'neutral-secondary': v('neutral-secondary'),
        'neutral-secondary-medium': v('neutral-secondary-medium'),
        'neutral-secondary-strong': v('neutral-secondary-strong'),
        'neutral-tertiary-soft': v('neutral-tertiary-soft'),
        'neutral-tertiary': v('neutral-tertiary'),
        'neutral-tertiary-medium': v('neutral-tertiary-medium'),
        'neutral-quaternary': v('neutral-quaternary'),
        // brand
        'brand-softer': v('brand-softer'),
        'brand-soft': v('brand-soft'),
        brand: v('brand'),
        'brand-medium': v('brand-medium'),
        'brand-strong': v('brand-strong'),
        // status
        'success-soft': v('success-soft'),
        success: v('success'),
        'success-medium': v('success-medium'),
        'success-strong': v('success-strong'),
        'danger-soft': v('danger-soft'),
        danger: v('danger'),
        'danger-medium': v('danger-medium'),
        'danger-strong': v('danger-strong'),
        'warning-soft': v('warning-soft'),
        warning: v('warning'),
        'warning-medium': v('warning-medium'),
        'warning-strong': v('warning-strong'),
        // utility
        dark: v('dark'),
        'dark-strong': v('dark-strong'),
        disabled: v('disabled'),
        // text / foreground
        white: v('white'),
        heading: v('heading'),
        body: v('body'),
        'body-subtle': v('body-subtle'),
        'fg-brand-subtle': v('fg-brand-subtle'),
        'fg-brand': v('fg-brand'),
        'fg-brand-strong': v('fg-brand-strong'),
        'fg-success': v('fg-success'),
        'fg-success-strong': v('fg-success-strong'),
        'fg-danger': v('fg-danger'),
        'fg-danger-strong': v('fg-danger-strong'),
        'fg-warning': v('fg-warning'),
        'fg-warning-subtle': v('fg-warning-subtle'),
        'fg-disabled': v('fg-disabled'),
        // borders (usable as border-* and ring-*)
        'border-default-subtle': v('border-default-subtle'),
        'border-default': v('border-default'),
        'border-default-medium': v('border-default-medium'),
        'border-default-strong': v('border-default-strong'),
        'border-success-subtle': v('border-success-subtle'),
        'border-success': v('border-success'),
        'border-danger-subtle': v('border-danger-subtle'),
        'border-danger': v('border-danger'),
        'border-warning-subtle': v('border-warning-subtle'),
        'border-warning': v('border-warning'),
        'border-brand-subtle': v('border-brand-subtle'),
        'border-brand': v('border-brand'),
        'border-buffer': v('border-buffer'),
      },
      borderRadius: {
        pill: '9999px',
        card: '24px',
        sm: '4px',
      },
      boxShadow: {
        xs: v('shadow-xs'),
        sm: v('shadow-sm'),
        md: v('shadow-md'),
        lg: v('shadow-lg'),
        xl: v('shadow-xl'),
        // pill-button glint: base shadow + inset top highlight + soft outer glow
        glint: `${v('shadow-xs')}, inset ${v('color-1-400')} 0 6px 0px -5px, ${v('color-1-700')} 0 4px 10px -5px`,
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
