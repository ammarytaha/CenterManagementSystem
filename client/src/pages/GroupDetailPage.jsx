import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '../api/resources.js';
import {
  Card, Badge, Button, Spinner, EmptyState,
  TableWrap, Thead, Tbody, Tr, Th, Td,
} from '../components/ui/index.js';
import { Icon } from '../components/icons.jsx';
import { formatEGP } from '../lib/format.js';
import { DAY_LABELS, STUDENT_STATUS_LABELS } from '../lib/constants.js';

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({ queryKey: ['group', id], queryFn: () => groupsApi.get(id) });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size={28} className="text-brand" /></div>;
  if (isError || !data) return <EmptyState icon="alert" title="تعذّر تحميل بيانات المجموعة" />;

  const { group, students } = data;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/groups')} aria-label="رجوع">
          <Icon name="chevronRight" className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-heading">{group.name}</h1>
          <p className="mt-1 text-sm text-body">{group.subject} · {group.teacher?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-body">المواعيد</p>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {group.scheduleDays.map((d) => <Badge key={d} variant="brand">{DAY_LABELS[d]}</Badge>)}
          </div>
          <p className="mt-2 text-sm font-medium text-heading" dir="ltr">{group.startTime} – {group.endTime}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-body">الرسوم الشهرية</p>
          <p className="mt-2 text-2xl font-semibold text-heading">{formatEGP(group.monthlyFee)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-body">عدد الطلاب</p>
          <p className="mt-2 text-2xl font-semibold text-heading">{students.length}</p>
        </Card>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-medium text-heading">الطلاب المشتركون</h2>
        {students.length === 0 ? (
          <Card className="p-2"><EmptyState icon="students" title="لا يوجد طلاب في هذه المجموعة" /></Card>
        ) : (
          <TableWrap>
            <Thead>
              <tr><Th>الاسم</Th><Th>الهاتف</Th><Th>الرسوم</Th><Th>الحالة</Th></tr>
            </Thead>
            <Tbody>
              {students.map((s) => (
                <Tr key={s.id} onClick={() => navigate(`/students/${s.id}`)}>
                  <Td className="font-medium text-heading">{s.name}</Td>
                  <Td dir="ltr" className="text-start">{s.phone}</Td>
                  <Td>{formatEGP(s.monthlyFee)}</Td>
                  <Td><Badge variant={s.status === 'active' ? 'success' : 'gray'}>{STUDENT_STATUS_LABELS[s.status]}</Badge></Td>
                </Tr>
              ))}
            </Tbody>
          </TableWrap>
        )}
      </section>
    </div>
  );
}
