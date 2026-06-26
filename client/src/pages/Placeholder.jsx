import { PageHeader, Card } from '../components/ui/index.js';
import { Icon } from '../components/icons.jsx';

// Temporary stand-in for pages built in Milestone 7.
export function Placeholder({ title }) {
  return (
    <div>
      <PageHeader title={title} subtitle="قيد الإنشاء" />
      <Card className="p-12 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-pill bg-brand-softer text-fg-brand-strong">
          <Icon name="settings" className="h-7 w-7" />
        </div>
        <p className="text-body">هذه الصفحة ستكتمل في المرحلة التالية.</p>
      </Card>
    </div>
  );
}
