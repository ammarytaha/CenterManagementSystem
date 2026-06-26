import { Icon } from '../icons.jsx';

export function Pagination({ page, pageSize, total, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const btn =
    'inline-flex items-center gap-1 h-9 px-3 text-sm font-medium border border-border-default-medium bg-neutral-secondary-medium text-body transition-colors hover:bg-neutral-tertiary-medium hover:text-heading disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <p className="text-sm text-body">
        صفحة {page} من {totalPages} · {total} عنصر
      </p>
      <div className="flex">
        <button className={`${btn} rounded-s-pill`} disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <Icon name="chevronRight" className="h-4 w-4" />
          السابق
        </button>
        <button className={`${btn} -ms-px rounded-e-pill`} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          التالي
          <Icon name="chevronLeft" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
