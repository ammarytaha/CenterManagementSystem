import { Card } from './Card.jsx';
import { Icon } from '../icons.jsx';

const tones = {
  brand: 'bg-brand-softer text-fg-brand-strong',
  success: 'bg-success-soft text-fg-success-strong',
  danger: 'bg-danger-soft text-fg-danger-strong',
  warning: 'bg-warning-soft text-fg-warning',
  gray: 'bg-neutral-secondary-medium text-body',
};

export function StatCard({ label, value, icon, hint, tone = 'brand' }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      {icon && (
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-pill ${tones[tone] || tones.brand}`}>
          <Icon name={icon} className="h-6 w-6" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-body">{label}</p>
        <p className="truncate text-2xl font-semibold text-heading">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-body-subtle">{hint}</p>}
      </div>
    </Card>
  );
}
