// Card per cards.md — 24px radius, 1px default border, xs shadow. Add your own
// padding (e.g. p-6) in usage; Table brings its own wrapper.
export function Card({ as: Tag = 'div', interactive = false, className = '', ...props }) {
  return (
    <Tag
      className={`bg-neutral-primary-soft border border-border-default rounded-card shadow-xs ${
        interactive ? 'transition-colors hover:bg-neutral-secondary-medium cursor-pointer' : ''
      } ${className}`}
      {...props}
    />
  );
}
