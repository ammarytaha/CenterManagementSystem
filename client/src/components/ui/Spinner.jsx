export function Spinner({ size = 20, className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-pill border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="جارٍ التحميل"
    />
  );
}

export function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-secondary-soft">
      <Spinner size={32} className="text-brand" />
    </div>
  );
}
