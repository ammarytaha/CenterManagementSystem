import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { attendanceApi, groupsApi } from '../api/resources.js';
import { apiError } from '../api/client.js';
import {
  Button, Card, Field, Input, Select, Badge,
  TableWrap, Thead, Tbody, Tr, Th, Td, EmptyState, Spinner, PageHeader,
} from '../components/ui/index.js';
import { Icon } from '../components/icons.jsx';
import { ATTENDANCE_LABELS } from '../lib/constants.js';

const STATUS_TONES = { present: 'success', absent: 'danger', late: 'warning' };
const today = () => new Date().toISOString().slice(0, 10);

function StatusToggle({ value, onChange }) {
  const opts = [
    ['present', 'حاضر', 'success'],
    ['late', 'متأخر', 'warning'],
    ['absent', 'غائب', 'danger'],
  ];
  const activeCls = {
    success: 'bg-success text-white border-transparent',
    warning: 'bg-warning text-white border-transparent',
    danger: 'bg-danger text-white border-transparent',
  };
  return (
    <div className="flex">
      {opts.map(([key, label, tone], i) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
            i === 0 ? 'rounded-s-pill' : ''
          } ${i === opts.length - 1 ? 'rounded-e-pill' : ''} ${i > 0 ? '-ms-px' : ''} ${
            value === key ? activeCls[tone] : 'border-border-default-medium bg-neutral-secondary-medium text-body hover:text-heading'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function AbsenceFlags() {
  const { data } = useQuery({ queryKey: ['attendance-flags'], queryFn: attendanceApi.flags });
  if (!data?.flagged.length) return null;
  return (
    <Card className="mb-6 border-border-warning-subtle bg-warning-soft p-4">
      <div className="flex items-start gap-3">
        <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0 text-fg-warning" />
        <div>
          <p className="text-sm font-medium text-fg-warning">طلاب تجاوزوا 3 غيابات هذا الشهر</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.flagged.map((f) => (
              <Badge key={f.student.id} variant="warning">{f.student.name} · {f.absences} غياب</Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function GroupReport({ groupId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['attendance-report', groupId],
    queryFn: () => attendanceApi.report({ groupId: Number(groupId) }),
    enabled: !!groupId,
  });
  if (isLoading) return <div className="flex justify-center py-10"><Spinner className="text-brand" /></div>;
  if (!data?.report.length) return <Card className="p-2"><EmptyState icon="attendance" title="لا توجد بيانات حضور" /></Card>;
  return (
    <TableWrap>
      <Thead><tr><Th>الطالب</Th><Th>حاضر</Th><Th>متأخر</Th><Th>غائب</Th><Th>النسبة</Th></tr></Thead>
      <Tbody>
        {data.report.map((r) => (
          <Tr key={r.student.id}>
            <Td className="font-medium text-heading">{r.student.name}</Td>
            <Td>{r.present}</Td><Td>{r.late}</Td><Td>{r.absent}</Td>
            <Td>
              <Badge variant={r.attendanceRate >= 75 ? 'success' : r.attendanceRate >= 50 ? 'warning' : 'danger'}>
                {r.attendanceRate}%
              </Badge>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableWrap>
  );
}

export default function AttendancePage() {
  const [groupId, setGroupId] = useState('');
  const [date, setDate] = useState(today());
  const [tab, setTab] = useState('mark');
  const [marks, setMarks] = useState({});

  const { data: groupsData } = useQuery({ queryKey: ['groups'], queryFn: groupsApi.list });
  const groups = groupsData?.groups || [];

  const rosterQuery = useQuery({
    queryKey: ['roster', groupId, date],
    queryFn: () => attendanceApi.roster(Number(groupId), date),
    enabled: !!groupId && !!date,
  });

  useEffect(() => {
    if (rosterQuery.data) {
      const m = {};
      for (const r of rosterQuery.data.roster) m[r.student.id] = { status: r.status, note: r.note || '' };
      setMarks(m);
    }
  }, [rosterQuery.data]);

  const save = useMutation({
    mutationFn: () => {
      const records = rosterQuery.data.roster
        .filter((r) => marks[r.student.id]?.status)
        .map((r) => ({ studentId: r.student.id, status: marks[r.student.id].status, note: marks[r.student.id].note || null }));
      if (records.length === 0) return Promise.reject(new Error('لم يتم تحديد أي حالة'));
      return attendanceApi.mark({ groupId: Number(groupId), date, records });
    },
    onSuccess: () => toast.success('تم حفظ الحضور'),
    onError: (err) => toast.error(err.message || apiError(err)),
  });

  const setStatus = (sid, status) => setMarks((m) => ({ ...m, [sid]: { ...m[sid], status } }));
  const setNote = (sid, note) => setMarks((m) => ({ ...m, [sid]: { ...m[sid], note } }));
  const markAllPresent = () => {
    const m = { ...marks };
    for (const r of rosterQuery.data.roster) m[r.student.id] = { ...m[r.student.id], status: 'present' };
    setMarks(m);
  };

  const roster = rosterQuery.data?.roster || [];

  return (
    <div>
      <PageHeader title="الحضور" subtitle="تسجيل ومتابعة حضور الطلاب" />
      <AbsenceFlags />

      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="المجموعة" htmlFor="a-group">
            <Select id="a-group" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              <option value="">— اختر مجموعة —</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </Select>
          </Field>
          <Field label="التاريخ" htmlFor="a-date">
            <Input id="a-date" type="date" dir="ltr" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
      </Card>

      {!groupId ? (
        <Card className="p-2"><EmptyState icon="attendance" title="اختر مجموعة" message="اختر مجموعة وتاريخًا لعرض الطلاب." /></Card>
      ) : (
        <>
          <div className="mb-4 flex gap-2">
            <Button variant={tab === 'mark' ? 'brand' : 'tertiary'} size="sm" onClick={() => setTab('mark')}>تسجيل الحضور</Button>
            <Button variant={tab === 'report' ? 'brand' : 'tertiary'} size="sm" onClick={() => setTab('report')}>نسب الحضور</Button>
          </div>

          {tab === 'report' ? (
            <GroupReport groupId={groupId} />
          ) : rosterQuery.isLoading ? (
            <div className="flex justify-center py-16"><Spinner size={28} className="text-brand" /></div>
          ) : roster.length === 0 ? (
            <Card className="p-2"><EmptyState icon="students" title="لا يوجد طلاب في هذه المجموعة" /></Card>
          ) : (
            <>
              <div className="mb-3 flex justify-end">
                <Button variant="secondary" size="sm" onClick={markAllPresent}>
                  <Icon name="check" className="h-4 w-4" /> تحديد الكل حاضر
                </Button>
              </div>
              <div className="space-y-3">
                {roster.map((r) => (
                  <Card key={r.student.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-heading">{r.student.name}</p>
                      <p className="text-sm text-body-subtle" dir="ltr">{r.student.phone}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Input
                        className="w-40"
                        placeholder="ملاحظة"
                        value={marks[r.student.id]?.note || ''}
                        onChange={(e) => setNote(r.student.id, e.target.value)}
                      />
                      <StatusToggle value={marks[r.student.id]?.status} onChange={(s) => setStatus(r.student.id, s)} />
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => save.mutate()} loading={save.isPending}>
                  <Icon name="check" className="h-4 w-4" /> حفظ الحضور
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
