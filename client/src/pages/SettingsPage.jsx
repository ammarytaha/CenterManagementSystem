import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi, teachersApi } from '../api/resources.js';
import { apiError } from '../api/client.js';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  Button, Card, Field, Input, Select, Badge, Modal, ConfirmModal,
  TableWrap, Thead, Tbody, Tr, Th, Td, Spinner, PageHeader,
} from '../components/ui/index.js';
import { Icon } from '../components/icons.jsx';
import { ROLE_LABELS } from '../lib/constants.js';
import { formatDate } from '../lib/format.js';

const ROLE_OPTIONS = [
  ['admin', 'مدير'],
  ['assistant', 'مساعد'],
  ['teacher', 'مدرّس'],
];

function UserFormModal({ open, onClose, editing }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(() =>
    editing
      ? { name: editing.name, email: editing.email, role: editing.role, password: '', teacherId: editing.teacher?.id ? String(editing.teacher.id) : '' }
      : { name: '', email: '', role: 'assistant', password: '', teacherId: '' }
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Teacher profiles to link a teacher login to.
  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: teachersApi.list,
    enabled: form.role === 'teacher',
  });
  const teachers = teachersData?.teachers || [];

  const mutation = useMutation({
    mutationFn: (payload) => (editing ? usersApi.update(editing.id, payload) : usersApi.create(payload)),
    onSuccess: () => {
      toast.success(editing ? 'تم تحديث المستخدم' : 'تمت إضافة المستخدم');
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['teachers'] });
      onClose();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const submit = (e) => {
    e.preventDefault();
    const payload = { name: form.name.trim(), email: form.email.trim(), role: form.role };
    if (!editing) payload.password = form.password;
    if (form.role === 'teacher') payload.teacherId = form.teacherId ? Number(form.teacherId) : null;
    else if (editing) payload.teacherId = null; // unlink when switching away from teacher
    mutation.mutate(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'تعديل المستخدم' : 'إضافة مستخدم'}
      footer={<><Button variant="ghost" onClick={onClose}>إلغاء</Button><Button onClick={submit} loading={mutation.isPending}>{editing ? 'حفظ' : 'إضافة'}</Button></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="الاسم" htmlFor="u-name"><Input id="u-name" value={form.name} onChange={set('name')} required /></Field>
        <Field label="البريد الإلكتروني" htmlFor="u-email"><Input id="u-email" type="email" dir="ltr" value={form.email} onChange={set('email')} required /></Field>
        <Field label="الدور" htmlFor="u-role">
          <Select id="u-role" value={form.role} onChange={set('role')}>
            {ROLE_OPTIONS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </Select>
        </Field>
        {form.role === 'teacher' && (
          <Field label="ربط بملف مدرّس" htmlFor="u-teacher" hint="ملف المدرّس الذي سيستخدم هذا الحساب لتسجيل الدخول">
            <Select id="u-teacher" value={form.teacherId} onChange={set('teacherId')}>
              <option value="">— بدون ربط —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.userId && t.userId !== editing?.id ? ' (مرتبط بحساب آخر)' : ''}
                </option>
              ))}
            </Select>
          </Field>
        )}
        {!editing && (
          <Field label="كلمة المرور" htmlFor="u-pass" hint="6 أحرف على الأقل">
            <Input id="u-pass" type="password" value={form.password} onChange={set('password')} required minLength={6} />
          </Field>
        )}
      </form>
    </Modal>
  );
}

function ResetPasswordModal({ user, onClose }) {
  const [password, setPassword] = useState('');
  const mutation = useMutation({
    mutationFn: () => usersApi.resetPassword(user.id, password),
    onSuccess: () => { toast.success('تم تحديث كلمة المرور'); onClose(); },
    onError: (err) => toast.error(apiError(err)),
  });
  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title={`إعادة تعيين كلمة مرور: ${user?.name}`}
      size="sm"
      footer={<><Button variant="ghost" onClick={onClose}>إلغاء</Button><Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={password.length < 6}>حفظ</Button></>}
    >
      <Field label="كلمة المرور الجديدة" htmlFor="r-pass" hint="6 أحرف على الأقل">
        <Input id="r-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
      </Field>
    </Modal>
  );
}

export default function SettingsPage() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resetting, setResetting] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: usersApi.list });

  const del = useMutation({
    mutationFn: (id) => usersApi.remove(id),
    onSuccess: () => { toast.success('تم حذف المستخدم'); qc.invalidateQueries({ queryKey: ['users'] }); setDeleting(null); },
    onError: (err) => toast.error(apiError(err)),
  });

  const now = new Date();
  const ayStart = now.getMonth() + 1 >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  const academicYear = `${ayStart}/${ayStart + 1}`;

  return (
    <div>
      <PageHeader
        title="الإعدادات"
        subtitle="إدارة المستخدمين وإعدادات النظام"
        actions={<Button onClick={() => { setEditing(null); setFormOpen(true); }}><Icon name="plus" className="h-4 w-4" /> إضافة مستخدم</Button>}
      />

      <Card className="mb-6 flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-body">العام الدراسي الحالي</p>
          <p className="text-lg font-semibold text-heading" dir="ltr">{academicYear}</p>
        </div>
        <Badge variant="brand">يُحتسب تلقائيًا</Badge>
      </Card>

      <h2 className="mb-3 text-lg font-medium text-heading">المستخدمون</h2>
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={28} className="text-brand" /></div>
      ) : (
        <TableWrap>
          <Thead><tr><Th>الاسم</Th><Th>البريد الإلكتروني</Th><Th>الدور</Th><Th>أُنشئ في</Th><Th className="text-end">إجراءات</Th></tr></Thead>
          <Tbody>
            {data.users.map((u) => (
              <Tr key={u.id}>
                <Td className="font-medium text-heading">{u.name}{u.id === me.id && <span className="text-body-subtle"> (أنت)</span>}</Td>
                <Td dir="ltr" className="text-start">{u.email}</Td>
                <Td>
                  <Badge variant={u.role === 'admin' ? 'brand' : 'gray'}>{ROLE_LABELS[u.role]}</Badge>
                  {u.teacher && <span className="ms-2 text-xs text-body-subtle">{u.teacher.name}</span>}
                </Td>
                <Td>{formatDate(u.createdAt)}</Td>
                <Td className="text-end">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(u); setFormOpen(true); }} aria-label="تعديل"><Icon name="edit" className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setResetting(u)}>كلمة المرور</Button>
                    {u.id !== me.id && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleting(u)} aria-label="حذف"><Icon name="trash" className="h-4 w-4" /></Button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableWrap>
      )}

      {formOpen && <UserFormModal key={editing?.id || 'new'} open={formOpen} editing={editing} onClose={() => setFormOpen(false)} />}
      {resetting && <ResetPasswordModal user={resetting} onClose={() => setResetting(null)} />}
      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => del.mutate(deleting.id)}
        loading={del.isPending}
        title="حذف المستخدم"
        message={`هل تريد حذف المستخدم «${deleting?.name}»؟`}
        confirmText="حذف"
      />
    </div>
  );
}
