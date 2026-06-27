import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { groupsApi, teachersApi } from '../api/resources.js';
import { apiError } from '../api/client.js';
import {
  Button, Card, Field, Input, Select, Badge, Modal,
  TableWrap, Thead, Tbody, Tr, Th, Td, EmptyState, Spinner, PageHeader,
} from '../components/ui/index.js';
import { Icon } from '../components/icons.jsx';
import { DAYS, DAY_LABELS } from '../lib/constants.js';
import { formatEGP } from '../lib/format.js';

const blank = { name: '', teacherId: '', subject: '', scheduleDays: [], startTime: '16:00', endTime: '18:00', monthlyFee: '' };

function GroupFormModal({ open, onClose, teachers, editing }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(() =>
    editing
      ? {
          name: editing.name, teacherId: String(editing.teacherId), subject: editing.subject,
          scheduleDays: editing.scheduleDays || [], startTime: editing.startTime,
          endTime: editing.endTime, monthlyFee: String(editing.monthlyFee),
        }
      : blank
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleDay = (d) =>
    setForm((f) => ({ ...f, scheduleDays: f.scheduleDays.includes(d) ? f.scheduleDays.filter((x) => x !== d) : [...f.scheduleDays, d] }));

  const mutation = useMutation({
    mutationFn: (payload) => (editing ? groupsApi.update(editing.id, payload) : groupsApi.create(payload)),
    onSuccess: () => {
      toast.success(editing ? 'تم تحديث المجموعة' : 'تمت إضافة المجموعة');
      qc.invalidateQueries({ queryKey: ['groups'] });
      onClose();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const submit = (e) => {
    e.preventDefault();
    if (form.scheduleDays.length === 0) { toast.error('اختر يومًا واحدًا على الأقل'); return; }
    mutation.mutate({
      name: form.name.trim(), teacherId: Number(form.teacherId), subject: form.subject.trim(),
      scheduleDays: form.scheduleDays, startTime: form.startTime, endTime: form.endTime,
      monthlyFee: Number(form.monthlyFee),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'تعديل المجموعة' : 'إضافة مجموعة'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button onClick={submit} loading={mutation.isPending}>{editing ? 'حفظ' : 'إضافة'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="اسم المجموعة" htmlFor="g-name"><Input id="g-name" value={form.name} onChange={set('name')} required /></Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="المدرّس" htmlFor="g-teacher">
            <Select id="g-teacher" value={form.teacherId} onChange={set('teacherId')} required>
              <option value="">— اختر —</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </Field>
          <Field label="المادة" htmlFor="g-subject"><Input id="g-subject" value={form.subject} onChange={set('subject')} required /></Field>
        </div>
        <Field label="أيام المحاضرات">
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const active = form.scheduleDays.includes(d.key);
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => toggleDay(d.key)}
                  className={`rounded-pill border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
                    active ? 'border-transparent bg-brand text-white' : 'border-border-default-medium bg-neutral-secondary-medium text-body hover:text-heading'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="من" htmlFor="g-start"><Input id="g-start" type="time" dir="ltr" value={form.startTime} onChange={set('startTime')} required /></Field>
          <Field label="إلى" htmlFor="g-end"><Input id="g-end" type="time" dir="ltr" value={form.endTime} onChange={set('endTime')} required /></Field>
          <Field label="الرسوم الشهرية (ج.م)" htmlFor="g-fee"><Input id="g-fee" type="number" min="0" step="0.01" dir="ltr" value={form.monthlyFee} onChange={set('monthlyFee')} required /></Field>
        </div>
      </form>
    </Modal>
  );
}

export default function GroupsPage() {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data, isLoading } = useQuery({ queryKey: ['groups'], queryFn: groupsApi.list });
  const { data: teachersData } = useQuery({ queryKey: ['teachers'], queryFn: teachersApi.list });
  const teachers = teachersData?.teachers || [];

  return (
    <div>
      <PageHeader
        title="المجموعات"
        subtitle="إدارة المجموعات والمواعيد والرسوم"
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} disabled={teachers.length === 0}>
            <Icon name="plus" className="h-4 w-4" /> إضافة مجموعة
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={28} className="text-brand" /></div>
      ) : !data?.groups.length ? (
        <Card className="p-2">
          <EmptyState
            icon="groups"
            title="لا توجد مجموعات"
            message={teachers.length === 0 ? 'أضف مدرّسًا أولًا ثم أنشئ مجموعة.' : 'ابدأ بإضافة مجموعة.'}
          />
        </Card>
      ) : (
        <TableWrap>
          <Thead>
            <tr>
              <Th>المجموعة</Th><Th>المدرّس</Th><Th>المواعيد</Th><Th>الرسوم</Th><Th>الطلاب</Th><Th className="text-end">إجراءات</Th>
            </tr>
          </Thead>
          <Tbody>
            {data.groups.map((g) => (
              <Tr key={g.id} onClick={() => navigate(`/groups/${g.id}`)}>
                <Td className="font-medium text-heading">{g.name}</Td>
                <Td>{g.teacher?.name || '—'}</Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-1">
                    {g.scheduleDays.map((d) => <Badge key={d} variant="gray">{DAY_LABELS[d]}</Badge>)}
                    <span className="text-body-subtle" dir="ltr">{g.startTime}–{g.endTime}</span>
                  </div>
                </Td>
                <Td>{formatEGP(g.monthlyFee)}</Td>
                <Td>{g.studentCount}</Td>
                <Td className="text-end" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(g); setFormOpen(true); }} aria-label="تعديل">
                    <Icon name="edit" className="h-4 w-4" />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableWrap>
      )}

      {formOpen && (
        <GroupFormModal key={editing?.id || 'new'} open={formOpen} editing={editing} teachers={teachers} onClose={() => setFormOpen(false)} />
      )}
    </div>
  );
}
