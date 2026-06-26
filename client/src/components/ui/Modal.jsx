import { useEffect } from 'react';
import { Icon } from '../icons.jsx';

// Modal per modals.md — blurred backdrop, 24px card, xl shadow. Closes on Esc
// and backdrop click.
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size] || 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[90vh] w-full ${maxW} flex-col rounded-card bg-neutral-primary shadow-xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border-default p-5">
          <h2 className="text-xl font-semibold text-heading">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-pill p-1.5 text-heading transition-colors hover:bg-neutral-secondary-medium focus:outline-none focus:ring-4 focus:ring-neutral-tertiary"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border-default p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
