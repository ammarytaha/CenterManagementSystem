import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { NAV_ITEMS } from '../../lib/constants.js';
import { Icon } from '../icons.jsx';

// RTL sidebar per sidebars.md — sits on the right; divider faces the content
// (inline-end). Width 256px.
export function Sidebar({ className = '', onNavigate }) {
  const { user, logout } = useAuth();
  const items = NAV_ITEMS.filter((i) => i.roles.includes(user?.role));

  return (
    <aside className={`flex w-64 flex-col border-e border-border-default bg-neutral-primary-soft ${className}`}>
      <div className="flex h-16 items-center gap-3 border-b border-border-default px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-pill bg-brand font-bold text-white">س</div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-heading">السنتر التعليمي</p>
          <p className="text-xs text-body-subtle">إدارة Loop</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-pill px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-secondary-strong text-fg-brand-strong'
                  : 'text-heading hover:bg-neutral-secondary-medium'
              }`
            }
          >
            <Icon name={item.icon} className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border-default p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-pill px-3 py-2 text-sm font-medium text-heading transition-colors hover:bg-neutral-secondary-medium"
        >
          <Icon name="logout" className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
