import { useAuth } from '../../auth/AuthContext.jsx';
import { useTheme } from '../../theme/ThemeProvider.jsx';
import { ROLE_LABELS } from '../../lib/constants.js';
import { Icon } from '../icons.jsx';

const iconBtn =
  'rounded-pill p-2 text-heading transition-colors hover:bg-neutral-secondary-medium focus:outline-none focus:ring-4 focus:ring-neutral-tertiary';

export function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border-default bg-neutral-primary-soft px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenu} aria-label="فتح القائمة" className={`${iconBtn} lg:hidden`}>
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <span className="font-semibold text-heading lg:hidden">السنتر التعليمي</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
          title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
          className={iconBtn}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="h-5 w-5" />
        </button>

        <div className="hidden text-end sm:block">
          <p className="text-sm font-medium leading-tight text-heading">{user?.name}</p>
          <p className="text-xs text-body-subtle">{ROLE_LABELS[user?.role]}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-brand-softer font-medium text-fg-brand-strong">
          {user?.name?.[0] || '؟'}
        </div>

        <button
          type="button"
          onClick={logout}
          aria-label="تسجيل الخروج"
          title="تسجيل الخروج"
          className={iconBtn}
        >
          <Icon name="logout" className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
