import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { teachersApi } from '../api/resources.js';
import {
  Card, Badge, Button, Spinner, EmptyState, Input,
  TableWrap, Thead, Tbody, Tr, Th, Td,
} from '../components/ui/index.js';
import { Icon } from '../components/icons.jsx';
import { TeacherFormModal } from './TeachersPage.jsx';
import { formatEGP, currentMonthKey } from '../lib/format.js';
import { COMPENSATION_LABELS, DAY_LABELS } from '../lib/constants.js';

export default function TeacherProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentMonthKey());
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['teacher', id, month],
    queryFn: () => teachersApi.get(id, { month }),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size={28} className="text-brand" /></div>;
  if (isError || !data) return <EmptyState icon="alert" title="تعذّر تحميل بيانات المدرّس" />;

  const { teacher, groups, earnings } = data;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/teachers')} aria-label="رجوع">
            <Icon name="chevronRight" className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-heading">{teacher.name}</h1>
            <p className="mt-1 text-sm text-body">{teacher.subject}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          <Icon name="edit" className="h-4 w-4" /> تعديل البيانات
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="mb-2 text-lg font-medium text-heading">البيانات</h2>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span className="text-body">الهاتف</span><span dir="ltr" className="font-medium text-heading">{teacher.phone}</span></p>
            <p className="flex justify-between"><span className="text-body">نوع الأجر</span><span className="font-medium text-heading">{COMPENSATION_LABELS[teacher.compensationType]}</span></p>
            <p className="flex justify-between">
              <span className="text-body">القيمة</span>
              <span className="font-medium text-heading">
                {teacher.compensationType === 'salary' ? formatEGP(teacher.compensationValue) : `${teacher.compensationValue}%`}
              </span>
            </p>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-heading">أرباح الشهر</h2>
            <Input type="month" dir="ltr" value={month} onChange={(e) => setMonth(e.target.value)} className="w-auto" />
          </div>
          <p className="text-3xl font-semibold text-fg-brand-strong">{formatEGP(earnings.earnings)}</p>
          {earnings.type === 'percentage' ? (
            <p className="mt-1 text-sm text-body">
              {earnings.value}% من إجمالي محصّل {formatEGP(earnings.collected)} خلال الشهر
            </p>
          ) : (
            <p className="mt-1 text-sm text-body">راتب ثابت شهري</p>
          )}
        </Card>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-medium text-heading">المجموعات</h2>
        {groups.length === 0 ? (
          <Card className="p-2"><EmptyState icon="groups" title="لا توجد مجموعات لهذا المدرّس" /></Card>
        ) : (
          <TableWrap>
            <Thead>
              <tr><Th>المجموعة</Th><Th>المادة</Th><Th>المواعيد</Th><Th>الرسوم</Th><Th>الطلاب</Th></tr>
            </Thead>
            <Tbody>
              {groups.map((g) => (
                <Tr key={g.id}>
                  <Td className="font-medium text-heading">{g.name}</Td>
                  <Td>{g.subject}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {g.scheduleDays.map((d) => <Badge key={d} variant="gray">{DAY_LABELS[d]}</Badge>)}
                      <span className="text-body-subtle" dir="ltr">{g.startTime}–{g.endTime}</span>
                    </div>
                  </Td>
                  <Td>{formatEGP(g.monthlyFee)}</Td>
                  <Td>{g.studentCount}</Td>
                </Tr>
              ))}
            </Tbody>
          </TableWrap>
        )}
      </section>

      {editOpen && (
        <TeacherFormModal open={editOpen} editing={teacher} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}
