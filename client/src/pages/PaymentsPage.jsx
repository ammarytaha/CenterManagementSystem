import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { paymentsApi, studentsApi } from '../api/resources.js';
import { apiError } from '../api/client.js';
import {
  Button, Card, Field, Input, Select, Badge, Modal,
  TableWrap, Thead, Tbody, Tr, Th, Td, Pagination, EmptyState, Spinner, PageHeader,
} from '../components/ui/index.js';
import { Icon } from '../components/icons.jsx';
import { PAYMENT_METHOD_LABELS } from '../lib/constants.js';
import { formatEGP, formatDate, formatMonthKey, currentMonthKey } from '../lib/format.js';

const METHODS = Object.entries(PAYMENT_METHOD_LABELS);

function ReceiptModal({ payment, onClose }) {
  if (!payment) return null;
  const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4 border-b border-border-default py-2 last:border-0">
      <span className="text-sm text-body">{label}</span>
      <span className="text-sm font-medium text-heading">{value}</span>
    </div>
  );
  return (
    <Modal
      open={!!payment}
      onClose={onClose}
      title="إيصال دفع"
      footer={<><Button variant="ghost" onClick={onClose}>إغلاق</Button><Button onClick={() => window.print()}><Icon name="print" className="h-4 w-4" /> طباعة</Button></>}
    >
      <div className="space-y-1">
        <Row label="رقم الإيصال" value={<span dir="ltr">{payment.receiptNumber}</span>} />
        <Row label="الطالب" value={payment.student?.name} />
        <Row label="الشهر" value={formatMonthKey(payment.month)} />
        <Row label="المبلغ" value={formatEGP(payment.amount)} />
        <Row label="الطريقة" value={PAYMENT_METHOD_LABELS[payment.method]} />
        {payment.reference && <Row label="مرجع التحويل" value={<span dir="ltr">{payment.reference}</span>} />}
        <Row label="التاريخ" value={formatDate(payment.paidAt)} />
        {payment.staff && <Row label="حصّلها" value={payment.staff.name} />}
      </div>
    </Modal>
  );
}

function RecordTab({ presetStudentId, onRecorded }) {
  const qc = useQueryClient();
  const [studentId, setStudentId] = useState(presetStudentId || '');
  const [form, setForm] = useState({ amount: '', month: currentMonthKey(), method: 'vodafone_cash', reference: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const { data: studentsData } = useQuery({
    queryKey: ['students', { pageSize: 500, status: 'active' }],
    queryFn: () => studentsApi.list({ pageSize: 500, status: 'active' }),
  });
  const students = studentsData?.students || [];

  const dueQuery = useQuery({
    queryKey: ['student-due', studentId],
    queryFn: () => paymentsApi.studentDue(studentId),
    enabled: !!studentId,
  });

  const record = useMutation({
    mutationFn: () =>
      paymentsApi.record({
        studentId: Number(studentId),
        amount: Number(form.amount),
        month: form.month,
        method: form.method,
        reference: form.reference || null,
      }),
    onSuccess: (res) => {
      toast.success('تم تسجيل الدفعة');
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['payment-overdue'] });
      qc.invalidateQueries({ queryKey: ['student-due', studentId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setForm((f) => ({ ...f, amount: '', reference: '' }));
      onRecorded(res.payment);
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!studentId) { toast.error('اختر طالبًا'); return; }
    record.mutate();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-medium text-heading">تسجيل دفعة</h2>
        <form onSubmit={submit} className="space-y-4">
          <Field label="الطالب" htmlFor="p-student">
            <Select id="p-student" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
              <option value="">— اختر —</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="الشهر" htmlFor="p-month"><Input id="p-month" type="month" dir="ltr" value={form.month} onChange={set('month')} required /></Field>
            <Field label="المبلغ (ج.م)" htmlFor="p-amount"><Input id="p-amount" type="number" min="0" step="0.01" dir="ltr" value={form.amount} onChange={set('amount')} required /></Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="طريقة الدفع" htmlFor="p-method">
              <Select id="p-method" value={form.method} onChange={set('method')}>
                {METHODS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </Select>
            </Field>
            <Field label="مرجع التحويل (اختياري)" htmlFor="p-ref"><Input id="p-ref" dir="ltr" value={form.reference} onChange={set('reference')} placeholder="رقم عملية فودافون/إنستاباي" /></Field>
          </div>
          <Button type="submit" loading={record.isPending} className="w-full">تسجيل الدفعة</Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-medium text-heading">الأشهر المستحقة</h2>
        {!studentId ? (
          <p className="text-sm text-body">اختر طالبًا لعرض الأشهر غير المسدّدة.</p>
        ) : dueQuery.isLoading ? (
          <div className="flex justify-center py-8"><Spinner className="text-brand" /></div>
        ) : dueQuery.data?.due.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-fg-success-strong"><Icon name="check" className="h-5 w-5" /> لا توجد مستحقات على هذا الطالب.</div>
        ) : (
          <>
            <p className="mb-3 text-sm text-body">الإجمالي المستحق: <span className="font-semibold text-fg-danger-strong">{formatEGP(dueQuery.data?.balance.totalRemaining)}</span></p>
            <ul className="space-y-2">
              {dueQuery.data?.due.map((d) => (
                <li key={d.month}>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, month: d.month, amount: String(d.remaining) }))}
                    className="flex w-full items-center justify-between rounded-card border border-border-default p-3 text-start transition-colors hover:bg-neutral-secondary-medium"
                  >
                    <span className="text-sm font-medium text-heading">{formatMonthKey(d.month)}</span>
                    <Badge variant="danger">{formatEGP(d.remaining)}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}

function OverdueTab({ onPick }) {
  const { data, isLoading } = useQuery({ queryKey: ['payment-overdue'], queryFn: paymentsApi.overdue });
  if (isLoading) return <div className="flex justify-center py-16"><Spinner size={28} className="text-brand" /></div>;
  if (!data?.students.length) return <Card className="p-2"><EmptyState icon="check" title="لا يوجد متأخرون" message="جميع الطلاب سدّدوا مستحقاتهم." /></Card>;
  return (
    <>
      <Card className="mb-4 flex items-center gap-3 border-border-danger-subtle bg-danger-soft p-4">
        <Icon name="alert" className="h-5 w-5 text-fg-danger-strong" />
        <p className="text-sm text-fg-danger-strong">{data.count} طالب متأخر بإجمالي {formatEGP(data.totalAmount)}</p>
      </Card>
      <TableWrap>
        <Thead><tr><Th>الطالب</Th><Th>المجموعة</Th><Th>أشهر متأخرة</Th><Th>المبلغ</Th><Th className="text-end">إجراء</Th></tr></Thead>
        <Tbody>
          {data.students.map((row) => (
            <Tr key={row.student.id}>
              <Td className="font-medium text-heading">{row.student.name}</Td>
              <Td>{row.student.group?.name || '—'}</Td>
              <Td>{row.monthsOverdue}</Td>
              <Td className="font-medium text-fg-danger-strong">{formatEGP(row.totalRemaining)}</Td>
              <Td className="text-end">
                <Button variant="tertiary" size="sm" onClick={() => onPick(String(row.student.id))}>تسجيل دفعة</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </TableWrap>
    </>
  );
}

const PAGE_SIZE = 10;
function HistoryTab({ onReceipt }) {
  const [page, setPage] = useState(1);
  const [method, setMethod] = useState('');
  const [month, setMonth] = useState('');
  const params = { page, pageSize: PAGE_SIZE, ...(method ? { method } : {}), ...(month ? { month } : {}) };
  const { data, isLoading } = useQuery({ queryKey: ['payments', params], queryFn: () => paymentsApi.list(params) });

  return (
    <>
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }}>
            <option value="">كل الطرق</option>
            {METHODS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </Select>
          <Input type="month" dir="ltr" value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }} />
        </div>
      </Card>
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={28} className="text-brand" /></div>
      ) : !data?.payments.length ? (
        <Card className="p-2"><EmptyState icon="payments" title="لا توجد مدفوعات" /></Card>
      ) : (
        <>
          <TableWrap>
            <Thead><tr><Th>التاريخ</Th><Th>الطالب</Th><Th>الشهر</Th><Th>المبلغ</Th><Th>الطريقة</Th><Th className="text-end">الإيصال</Th></tr></Thead>
            <Tbody>
              {data.payments.map((p) => (
                <Tr key={p.id}>
                  <Td>{formatDate(p.paidAt)}</Td>
                  <Td className="font-medium text-heading">{p.student?.name}</Td>
                  <Td>{formatMonthKey(p.month)}</Td>
                  <Td className="font-medium text-heading">{formatEGP(p.amount)}</Td>
                  <Td>{PAYMENT_METHOD_LABELS[p.method]}</Td>
                  <Td className="text-end">
                    <Button variant="ghost" size="sm" onClick={() => onReceipt(p)}><Icon name="print" className="h-4 w-4" /> إيصال</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableWrap>
          <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPage={setPage} />
        </>
      )}
    </>
  );
}

export default function PaymentsPage() {
  const [tab, setTab] = useState('record');
  const [presetStudent, setPresetStudent] = useState('');
  const [receipt, setReceipt] = useState(null);

  const tabs = [
    ['record', 'تسجيل دفعة'],
    ['overdue', 'المتأخرون'],
    ['history', 'السجل'],
  ];

  return (
    <div>
      <PageHeader title="المدفوعات" subtitle="تسجيل المدفوعات ومتابعة المتأخرات" />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(([key, label]) => (
          <Button key={key} variant={tab === key ? 'brand' : 'tertiary'} size="sm" onClick={() => setTab(key)}>{label}</Button>
        ))}
      </div>

      {tab === 'record' && (
        <RecordTab key={presetStudent || 'blank'} presetStudentId={presetStudent} onRecorded={(p) => setReceipt(p)} />
      )}
      {tab === 'overdue' && <OverdueTab onPick={(id) => { setPresetStudent(id); setTab('record'); }} />}
      {tab === 'history' && <HistoryTab onReceipt={(p) => setReceipt(p)} />}

      <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
