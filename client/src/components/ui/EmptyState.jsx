import { Icon } from '../icons.jsx';

export function EmptyState({ icon = 'search', title = 'لا توجد بيانات', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-pill bg-neutral-secondary-medium text-body">
        <Icon name={icon} className="h-7 w-7" />
      </div>
      <h3 className="text-base font-medium text-heading">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-body">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
