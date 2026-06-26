import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/resources.js';
import { StatCard, Card, Spinner, EmptyState, PageHeader } from '../components/ui/index.js';
import { Icon } from '../components/icons.jsx';
import { formatEGP, formatNumber } from '../lib/format.js';

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} className="text-brand" />
      </div>
    );
  }
  if (isError || !data) {
    return <EmptyState icon="alert" title="تعذّر تحميل البيانات" message="حاول تحديث الصفحة." />;
  }

  const revDelta = data.revenue.thisMonth - data.revenue.lastMonth;

  return (
    <div>
      <PageHeader title="لوحة التحكم" subtitle="نظرة عامة على نشاط السنتر" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        <StatCard label="الطلاب النشطون" value={formatNumber(data.totals.students)} icon="students" tone="brand" />
        <StatCard label="المدرّسون" value={formatNumber(data.totals.teachers)} icon="teachers" tone="gray" />
        <StatCard label="المجموعات" value={formatNumber(data.totals.groups)} icon="groups" tone="gray" />
        <StatCard label="نسبة الحضور هذا الأسبوع" value={`${data.attendanceRateThisWeek}%`} icon="attendance" tone="success" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-medium text-heading">الإيرادات</h2>
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="text-sm text-body">هذا الشهر</p>
              <p className="text-2xl font-semibold text-heading">{formatEGP(data.revenue.thisMonth)}</p>
            </div>
            <div>
              <p className="text-sm text-body">الشهر الماضي</p>
              <p className="text-2xl font-semibold text-heading">{formatEGP(data.revenue.lastMonth)}</p>
            </div>
            <div>
              <p className="text-sm text-body">الفرق</p>
              <p className={`flex items-center gap-1 text-2xl font-semibold ${revDelta >= 0 ? 'text-fg-success-strong' : 'text-fg-danger-strong'}`}>
                <Icon name={revDelta >= 0 ? 'trendingUp' : 'trendingDown'} className="h-5 w-5" />
                {formatEGP(Math.abs(revDelta))}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-card border border-border-danger-subtle bg-danger-soft p-4">
            <Icon name="alert" className="h-5 w-5 shrink-0 text-fg-danger-strong" />
            <p className="text-sm text-fg-danger-strong">
              {formatNumber(data.overdue.count)} طالب متأخر في السداد بإجمالي {formatEGP(data.overdue.amount)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-medium text-heading">آخر النشاطات</h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-body">لا يوجد نشاط حديث.</p>
          ) : (
            <ul className="space-y-3">
              {data.recentActivity.map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-pill ${a.type === 'payment' ? 'bg-success' : 'bg-brand'}`} />
                  <p className="text-sm leading-snug text-body">{a.text}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
