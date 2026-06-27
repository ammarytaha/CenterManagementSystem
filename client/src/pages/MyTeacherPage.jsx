import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { teachersApi } from '../api/resources.js';
import {
  Card, Badge, Spinner, EmptyState, Input, PageHeader,
  TableWrap, Thead, Tbody, Tr, Th, Td,
} from '../components/ui/index.js';
import { formatEGP, currentMonthKey } from '../lib/format.js';
import { COMPENSATION_LABELS, DAY_LABELS } from '../lib/constants.js';

// The teacher's own dashboard — their groups + monthly earnings.
export default function MyTeacherPage() {
  const [month, setMonth] = useState(currentMonthKey());
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-teacher', month],
    queryFn: () => teachersApi.me({ month }),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size={28} className="text-brand" /></div>;
  if (isError || !data) {
    return (
      <EmptyState
        icon="alert"
        title="لا يوجد ملف مدرّس مرتبط بحسابك"
        message="تواصل مع الإدارة لربط حسابك بملف المدرّس."
      />
    );
  }

  const { teacher, groups, earnings } = data;

  return (
    <div>
      <PageHeader
        title={`أهلاً ${teacher.name}`}
        subtitle={teacher.subject}
        actions={<Input type="month" dir="ltr" value={month} onChange={(e) => setMonth(e.target.value)} className="w-auto" />}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm text-body">أرباح الشهر</p>
          <p className="mt-1 text-3xl font-semibold text-fg-brand-strong">{formatEGP(earnings.earnings)}</p>
          {earnings.type === 'percentage' ? (
            <p className="mt-1 text-sm text-body">{earnings.value}% من محصّل {formatEGP(earnings.collected)}</p>
          ) : (
            <p className="mt-1 text-sm text-body">راتب ثابت شهري</p>
          )}
        </Card>
        <Card className="p-6">
          <p className="text-sm text-body">نوع الأجر</p>
          <p className="mt-1 text-lg font-medium text-heading">{COMPENSATION_LABELS[teacher.compensationType]}</p>
          <p className="mt-2 text-sm text-body">عدد المجموعات: {groups.length}</p>
        </Card>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-medium text-heading">مجموعاتي</h2>
        {groups.length === 0 ? (
          <Card className="p-2"><EmptyState icon="groups" title="لا توجد مجموعات" /></Card>
        ) : (
          <TableWrap>
            <Thead><tr><Th>المجموعة</Th><Th>المادة</Th><Th>المواعيد</Th><Th>الطلاب</Th></tr></Thead>
            <Tbody>
              {groups.map((g) => (
                <Tr key={g.id}>
                  <Td className="font-medium text-heading">{g.name}</Td>
                  <Td>{g.subject}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-1">
                      {g.scheduleDays.map((d) => <Badge key={d} variant="gray">{DAY_LABELS[d]}</Badge>)}
                      <span className="text-body-subtle" dir="ltr">{g.startTime}–{g.endTime}</span>
                    </div>
                  </Td>
                  <Td>{g.studentCount}</Td>
                </Tr>
              ))}
            </Tbody>
          </TableWrap>
        )}
      </section>
    </div>
  );
}
