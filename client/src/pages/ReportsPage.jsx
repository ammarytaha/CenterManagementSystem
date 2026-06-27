import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/resources.js';
import {
  Card, Input, StatCard, Spinner, EmptyState, PageHeader, Button,
  TableWrap, Thead, Tbody, Tr, Th, Td, Badge,
} from '../components/ui/index.js';
import { formatEGP, formatNumber, currentMonthKey } from '../lib/format.js';
import { COMPENSATION_LABELS } from '../lib/constants.js';

function RevenueReport({ month }) {
  const { data, isLoading } = useQuery({ queryKey: ['report-revenue', month], queryFn: () => reportsApi.revenue(month) });
  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="text-brand" /></div>;
  if (!data) return null;
  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="المحصّل" value={formatEGP(data.totalCollected)} icon="payments" tone="success" />
        <StatCard label="المتوقع" value={formatEGP(data.totalExpected)} icon="reports" tone="brand" />
        <StatCard label="المتأخر" value={formatEGP(data.totalOverdue)} icon="alert" tone="danger" />
      </div>
      {data.breakdown.length === 0 ? (
        <Card className="p-2"><EmptyState icon="reports" title="لا توجد بيانات لهذا الشهر" /></Card>
      ) : (
        <TableWrap>
          <Thead><tr><Th>المجموعة</Th><Th>المتوقع</Th><Th>المحصّل</Th><Th>المتأخر</Th></tr></Thead>
          <Tbody>
            {data.breakdown.map((b) => (
              <Tr key={b.group.id}>
                <Td className="font-medium text-heading">{b.group.name}</Td>
                <Td>{formatEGP(b.expected)}</Td>
                <Td className="text-fg-success-strong">{formatEGP(b.collected)}</Td>
                <Td className="text-fg-danger-strong">{formatEGP(b.overdue)}</Td>
              </Tr>
            ))}
          </Tbody>
        </TableWrap>
      )}
    </div>
  );
}

function AttendanceReport({ month }) {
  const { data, isLoading } = useQuery({ queryKey: ['report-attendance', month], queryFn: () => reportsApi.attendance(month) });
  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="text-brand" /></div>;
  if (!data) return null;
  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="نسبة الحضور" value={`${data.totals.attendanceRate}%`} icon="attendance" tone="success" />
        <StatCard label="حاضر" value={formatNumber(data.totals.present)} icon="check" tone="gray" />
        <StatCard label="متأخر" value={formatNumber(data.totals.late)} icon="calendar" tone="warning" />
        <StatCard label="غائب" value={formatNumber(data.totals.absent)} icon="alert" tone="danger" />
      </div>
      {data.breakdown.length === 0 ? (
        <Card className="p-2"><EmptyState icon="attendance" title="لا توجد بيانات لهذا الشهر" /></Card>
      ) : (
        <TableWrap>
          <Thead><tr><Th>المجموعة</Th><Th>حاضر</Th><Th>متأخر</Th><Th>غائب</Th><Th>النسبة</Th></tr></Thead>
          <Tbody>
            {data.breakdown.map((b) => (
              <Tr key={b.group.id}>
                <Td className="font-medium text-heading">{b.group.name}</Td>
                <Td>{b.present}</Td><Td>{b.late}</Td><Td>{b.absent}</Td>
                <Td><Badge variant={b.attendanceRate >= 75 ? 'success' : b.attendanceRate >= 50 ? 'warning' : 'danger'}>{b.attendanceRate}%</Badge></Td>
              </Tr>
            ))}
          </Tbody>
        </TableWrap>
      )}
    </div>
  );
}

function EarningsReport({ month }) {
  const { data, isLoading } = useQuery({ queryKey: ['report-earnings', month], queryFn: () => reportsApi.teacherEarnings(month) });
  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="text-brand" /></div>;
  if (!data) return null;
  return (
    <div>
      <div className="mb-6"><StatCard label="إجمالي أجور المدرّسين" value={formatEGP(data.total)} icon="teachers" tone="brand" /></div>
      <TableWrap>
        <Thead><tr><Th>المدرّس</Th><Th>المادة</Th><Th>نوع الأجر</Th><Th>المحصّل</Th><Th>الأجر</Th></tr></Thead>
        <Tbody>
          {data.teachers.map((t) => (
            <Tr key={t.teacher.id}>
              <Td className="font-medium text-heading">{t.teacher.name}</Td>
              <Td>{t.teacher.subject}</Td>
              <Td>{COMPENSATION_LABELS[t.type]}{t.type === 'percentage' ? ` (${t.value}%)` : ''}</Td>
              <Td>{t.collected == null ? '—' : formatEGP(t.collected)}</Td>
              <Td className="font-medium text-fg-brand-strong">{formatEGP(t.earnings)}</Td>
            </Tr>
          ))}
        </Tbody>
      </TableWrap>
    </div>
  );
}

export default function ReportsPage() {
  const [month, setMonth] = useState(currentMonthKey());
  const [tab, setTab] = useState('revenue');
  const tabs = [
    ['revenue', 'الإيرادات'],
    ['attendance', 'الحضور'],
    ['earnings', 'أجور المدرّسين'],
  ];

  return (
    <div>
      <PageHeader
        title="التقارير"
        subtitle="ملخّص شهري للإيرادات والحضور والأجور"
        actions={<Input type="month" dir="ltr" value={month} onChange={(e) => setMonth(e.target.value)} className="w-auto" />}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(([key, label]) => (
          <Button key={key} variant={tab === key ? 'brand' : 'tertiary'} size="sm" onClick={() => setTab(key)}>{label}</Button>
        ))}
      </div>

      {tab === 'revenue' && <RevenueReport month={month} />}
      {tab === 'attendance' && <AttendanceReport month={month} />}
      {tab === 'earnings' && <EarningsReport month={month} />}
    </div>
  );
}
