import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { teachersApi } from '../api/resources.js';
import { apiError } from '../api/client.js';
import {
  Button, Card, Field, Input, Select, Badge, Modal,
  TableWrap, Thead, Tbody, Tr, Th, Td, EmptyState, Spinner, PageHeader,
} from '../components/ui/index.js';
import { Icon } from '../components/icons.jsx';
import { COMPENSATION_LABELS } from '../lib/constants.js';
import { formatEGP } from '../lib/format.js';

const blank = { name: '', phone: '', subject: '', compensationType: 'salary', compensationValue: '' };

function TeacherFormModal({ open, onClose, editing }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(() =>
    editing
      ? {
          name: editing.name, phone: editing.phone, subject: editing.subject,
          compensationType: editing.compensationType, compensationValue: String(editing.compensationValue),
        }
      : blank
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: (payload) => (editing ? teachersApi.update(editing.id, payload) : teachersApi.create(payload)),
    onSuccess: () => {
      toast.success(editing ? 'تم تحديث بيانات المدرّس' : 'تمت إضافة المدرّس');
      qc.invalidateQueries({ queryKey: ['teachers'] });
      onClose();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const submit = (e) => {
    e.preventDefault();
    mutation.mutate({
      name: form.name.trim(), phone: form.phone.trim(), subject: form.subject.trim(),
      compensationType: form.compensationType, compensationValue: Number(form.compensationValue),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'تعديل المدرّس' : 'إضافة مدرّس'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button onClick={submit} loading={mutation.isPending}>{editing ? 'حفظ' : 'إضافة'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="الاسم" htmlFor="t-name"><Input id="t-name" value={form.name} onChange={set('name')} required /></Field>
          <Field label="رقم الهاتف" htmlFor="t-phone"><Input id="t-phone" dir="ltr" value={form.phone} onChange={set('phone')} required /></Field>
        </div>
        <Field label="المادة" htmlFor="t-subject"><Input id="t-subject" value={form.subject} onChange={set('subject')} required /></Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="نوع الأجر" htmlFor="t-ctype">
            <Select id="t-ctype" value={form.compensationType} onChange={set('compensationType')}>
              <option value="salary">راتب ثابت</option>
              <option value="percentage">نسبة %</option>
            </Select>
          </Field>
          <Field
            label={form.compensationType === 'salary' ? 'قيمة الراتب (ج.م)' : 'النسبة (%)'}
            htmlFor="t-cvalue"
          >
            <Input id="t-cvalue" type="number" min="0" step="0.01" dir="ltr" value={form.compensationValue} onChange={set('compensationValue')} required />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

export default function TeachersPage() {
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { data, isLoading } = useQuery({ queryKey: ['teachers'], queryFn: teachersApi.list });

  return (
    <div>
      <PageHeader
        title="المدرّسون"
        subtitle="إدارة المدرّسين ونظام الأجور"
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Icon name="plus" className="h-4 w-4" /> إضافة مدرّس
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={28} className="text-brand" /></div>
      ) : !data?.teachers.length ? (
        <Card className="p-2"><EmptyState icon="teachers" title="لا يوجد مدرّسون" message="ابدأ بإضافة مدرّس." /></Card>
      ) : (
        <TableWrap>
          <Thead>
            <tr>
              <Th>الاسم</Th><Th>المادة</Th><Th>الهاتف</Th><Th>نوع الأجر</Th><Th>المجموعات</Th><Th className="text-end">إجراءات</Th>
            </tr>
          </Thead>
          <Tbody>
            {data.teachers.map((t) => (
              <Tr key={t.id} onClick={() => navigate(`/teachers/${t.id}`)}>
                <Td className="font-medium text-heading">{t.name}</Td>
                <Td>{t.subject}</Td>
                <Td dir="ltr" className="text-start">{t.phone}</Td>
                <Td>
                  <Badge variant="brand">
                    {COMPENSATION_LABELS[t.compensationType]}
                    {' · '}
                    {t.compensationType === 'salary' ? formatEGP(t.compensationValue) : `${t.compensationValue}%`}
                  </Badge>
                </Td>
                <Td>{t.groupCount}</Td>
                <Td className="text-end" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setFormOpen(true); }} aria-label="تعديل">
                    <Icon name="edit" className="h-4 w-4" />
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableWrap>
      )}

      {formOpen && (
        <TeacherFormModal key={editing?.id || 'new'} open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />
      )}
    </div>
  );
}
