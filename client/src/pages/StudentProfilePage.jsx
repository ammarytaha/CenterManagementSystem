import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studentsApi, groupsApi } from '../api/resources.js';
import { apiError } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  Card, Badge, Button, Spinner, EmptyState, Modal, ConfirmModal, Field, Select, Input,
  TableWrap, Thead, Tbody, Tr, Th, Td,
} from '../components/ui/index.js';
import { Icon } from '../components/icons.jsx';
import { formatEGP, formatDate, formatMonthKey } from '../lib/format.js';
import {
  STUDENT_STATUS_LABELS, ATTENDANCE_LABELS, PAYMENT_METHOD_LABELS,
} from '../lib/constants.js';

const attendanceVariant = { present: 'success', absent: 'danger', late: 'warning' };

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <span className="text-sm text-body">{label}</span>
      <span className="text-sm font-medium text-heading">{value || '—'}</span>
    </div>
  );
}

// Subscriptions card with add/remove (admin + assistant).
function SubscriptionsManager({ student }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === 'admin' || user?.role === 'assistant';
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [form, setForm] = useState({ groupId: '', monthlyFee: '' });

  const { data: groupsData } = useQuery({ queryKey: ['groups'], queryFn: groupsApi.list, enabled: canManage });
  const enrolledIds = new Set(student.subscriptions.map((s) => s.group.id));
  const available = (groupsData?.groups || []).filter((g) => !enrolledIds.has(g.id));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['student'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
  const add = useMutation({
    mutationFn: () => studentsApi.addSubscription(student.id, {
      groupId: Number(form.groupId),
      ...(form.monthlyFee !== '' ? { monthlyFee: Number(form.monthlyFee) } : {}),
    }),
    onSuccess: () => { toast.success('تمت إضافة الاشتراك'); invalidate(); setAddOpen(false); setForm({ groupId: '', monthlyFee: '' }); },
    onError: (err) => toast.error(apiError(err)),
  });
  const remove = useMutation({
    mutationFn: (subId) => studentsApi.removeSubscription(student.id, subId),
    onSuccess: () => { toast.success('تم إلغاء الاشتراك'); invalidate(); setRemoving(null); },
    onError: (err) => toast.error(apiError(err)),
  });

  return (
    <Card className="p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium text-heading">الاشتراكات</h2>
        {canManage && (
          <Button variant="tertiary" size="sm" onClick={() => setAddOpen(true)} disabled={available.length === 0}>
            <Icon name="plus" className="h-4 w-4" /> إضافة
          </Button>
        )}
      </div>
      {student.subscriptions.length === 0 ? (
        <p className="text-sm text-body">لا توجد اشتراكات.</p>
      ) : (
        <ul className="space-y-2">
          {student.subscriptions.map((sub) => (
            <li key={sub.id} className="flex items-center justify-between gap-3 rounded-card border border-border-default p-3">
              <span className="text-sm font-medium text-heading">{sub.group.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-body">{formatEGP(sub.monthlyFee)}</span>
                {canManage && (
                  <Button variant="ghost" size="icon" onClick={() => setRemoving(sub)} aria-label="إلغاء">
                    <Icon name="trash" className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {addOpen && (
        <Modal open onClose={() => setAddOpen(false)} title="إضافة اشتراك" size="sm"
          footer={<><Button variant="ghost" onClick={() => setAddOpen(false)}>إلغاء</Button><Button onClick={() => add.mutate()} loading={add.isPending} disabled={!form.groupId}>إضافة</Button></>}>
          <div className="space-y-4">
            <Field label="المجموعة" htmlFor="sub-group">
              <Select id="sub-group" value={form.groupId} onChange={(e) => setForm((f) => ({ ...f, groupId: e.target.value }))}>
                <option value="">— اختر —</option>
                {available.map((g) => <option key={g.id} value={g.id}>{g.name} ({formatEGP(g.monthlyFee)})</option>)}
              </Select>
            </Field>
            <Field label="رسوم مخصّصة (اختياري)" htmlFor="sub-fee" hint="اتركه فارغًا لاستخدام رسوم المجموعة">
              <Input id="sub-fee" type="number" min="0" step="0.01" dir="ltr" value={form.monthlyFee} onChange={(e) => setForm((f) => ({ ...f, monthlyFee: e.target.value }))} />
            </Field>
          </div>
        </Modal>
      )}

      <ConfirmModal
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => remove.mutate(removing.id)}
        loading={remove.isPending}
        title="إلغاء الاشتراك"
        message={`إلغاء اشتراك الطالب في «${removing?.group.name}»؟`}
        confirmText="إلغاء الاشتراك"
      />
    </Card>
  );
}

export default function StudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsApi.get(id),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner size={28} className="text-brand" /></div>;
  if (isError || !data) return <EmptyState icon="alert" title="تعذّر تحميل بيانات الطالب" />;

  const { student, balance } = data;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/students')} aria-label="رجوع">
          <Icon name="chevronRight" className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-heading">
            {student.name}
            <Badge variant={student.status === 'active' ? 'success' : 'gray'}>
              {STUDENT_STATUS_LABELS[student.status]}
            </Badge>
          </h1>
          <p className="mt-1 text-sm text-body">{student.group?.name || 'بدون مجموعة أساسية'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="mb-2 text-lg font-medium text-heading">البيانات</h2>
          <div className="divide-y divide-border-default">
            <InfoRow label="رقم الهاتف" value={<span dir="ltr">{student.phone}</span>} />
            <InfoRow label="العنوان" value={student.address} />
            <InfoRow label="ولي الأمر" value={student.parentName} />
            <InfoRow label="هاتف ولي الأمر" value={student.parentPhone ? <span dir="ltr">{student.parentPhone}</span> : null} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-2 text-lg font-medium text-heading">الرصيد المستحق</h2>
          <p className={`text-3xl font-semibold ${balance.totalRemaining > 0 ? 'text-fg-danger-strong' : 'text-fg-success-strong'}`}>
            {formatEGP(balance.totalRemaining)}
          </p>
          <p className="mt-1 text-sm text-body">{balance.monthsOverdue} شهر غير مسدّد</p>
        </Card>

        <SubscriptionsManager student={student} />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-medium text-heading">سجل المدفوعات</h2>
        {student.payments.length === 0 ? (
          <Card className="p-2"><EmptyState icon="payments" title="لا توجد مدفوعات" /></Card>
        ) : (
          <TableWrap>
            <Thead>
              <tr>
                <Th>التاريخ</Th><Th>الشهر</Th><Th>المبلغ</Th><Th>الطريقة</Th><Th>الإيصال</Th>
              </tr>
            </Thead>
            <Tbody>
              {student.payments.map((p) => (
                <Tr key={p.id}>
                  <Td>{formatDate(p.paidAt)}</Td>
                  <Td>{formatMonthKey(p.month)}</Td>
                  <Td className="font-medium text-heading">{formatEGP(p.amount)}</Td>
                  <Td>{PAYMENT_METHOD_LABELS[p.method]}</Td>
                  <Td dir="ltr" className="text-start text-body-subtle">{p.receiptNumber}</Td>
                </Tr>
              ))}
            </Tbody>
          </TableWrap>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-medium text-heading">سجل الحضور</h2>
        {student.attendance.length === 0 ? (
          <Card className="p-2"><EmptyState icon="attendance" title="لا يوجد سجل حضور" /></Card>
        ) : (
          <TableWrap>
            <Thead>
              <tr><Th>التاريخ</Th><Th>المجموعة</Th><Th>الحالة</Th><Th>ملاحظة</Th></tr>
            </Thead>
            <Tbody>
              {student.attendance.map((a) => (
                <Tr key={a.id}>
                  <Td>{formatDate(a.date)}</Td>
                  <Td>{a.group?.name || '—'}</Td>
                  <Td><Badge variant={attendanceVariant[a.status]}>{ATTENDANCE_LABELS[a.status]}</Badge></Td>
                  <Td className="text-body-subtle">{a.note || '—'}</Td>
                </Tr>
              ))}
            </Tbody>
          </TableWrap>
        )}
      </section>
    </div>
  );
}
