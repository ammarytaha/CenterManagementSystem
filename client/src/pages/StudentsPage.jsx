import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studentsApi, groupsApi } from '../api/resources.js';
import { apiError } from '../api/client.js';
import {
  Button, Card, Field, Input, Select, Badge, Modal, ConfirmModal,
  TableWrap, Thead, Tbody, Tr, Th, Td, Pagination, EmptyState, Spinner, PageHeader,
} from '../components/ui/index.js';
import { Icon } from '../components/icons.jsx';
import { STUDENT_STATUS_LABELS } from '../lib/constants.js';

const PAGE_SIZE = 10;
const blank = { name: '', phone: '', address: '', parentName: '', parentPhone: '', groupId: '', status: 'active' };

function StudentFormModal({ open, onClose, groups, editing }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(() =>
    editing
      ? {
          name: editing.name || '', phone: editing.phone || '', address: editing.address || '',
          parentName: editing.parentName || '', parentPhone: editing.parentPhone || '',
          groupId: editing.groupId ? String(editing.groupId) : '', status: editing.status || 'active',
        }
      : blank
  );
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: (payload) => (editing ? studentsApi.update(editing.id, payload) : studentsApi.create(payload)),
    onSuccess: () => {
      toast.success(editing ? 'تم تحديث بيانات الطالب' : 'تمت إضافة الطالب');
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address || null,
      parentName: form.parentName || null,
      parentPhone: form.parentPhone || null,
    };
    if (form.groupId) payload.groupId = Number(form.groupId);
    if (editing) payload.status = form.status;
    mutation.mutate(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'تعديل بيانات الطالب' : 'إضافة طالب'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button onClick={submit} loading={mutation.isPending}>{editing ? 'حفظ' : 'إضافة'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="الاسم" htmlFor="s-name">
          <Input id="s-name" value={form.name} onChange={set('name')} required />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="رقم الهاتف" htmlFor="s-phone">
            <Input id="s-phone" dir="ltr" value={form.phone} onChange={set('phone')} required />
          </Field>
          <Field label="المجموعة" htmlFor="s-group">
            <Select id="s-group" value={form.groupId} onChange={set('groupId')}>
              <option value="">— بدون —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="العنوان" htmlFor="s-address">
          <Input id="s-address" value={form.address} onChange={set('address')} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="اسم ولي الأمر" htmlFor="s-pname">
            <Input id="s-pname" value={form.parentName} onChange={set('parentName')} />
          </Field>
          <Field label="هاتف ولي الأمر" htmlFor="s-pphone">
            <Input id="s-pphone" dir="ltr" value={form.parentPhone} onChange={set('parentPhone')} />
          </Field>
        </div>
        {editing && (
          <Field label="الحالة" htmlFor="s-status">
            <Select id="s-status" value={form.status} onChange={set('status')}>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </Select>
          </Field>
        )}
      </form>
    </Modal>
  );
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [groupId, setGroupId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deactivating, setDeactivating] = useState(null);

  const { data: groupsData } = useQuery({ queryKey: ['groups'], queryFn: groupsApi.list });
  const groups = groupsData?.groups || [];

  const params = {
    page, pageSize: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(groupId ? { groupId: Number(groupId) } : {}),
    ...(status ? { status } : {}),
  };
  const { data, isLoading } = useQuery({ queryKey: ['students', params], queryFn: () => studentsApi.list(params) });

  const deactivate = useMutation({
    mutationFn: (id) => studentsApi.deactivate(id),
    onSuccess: () => {
      toast.success('تم إلغاء تنشيط الطالب');
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setDeactivating(null);
    },
    onError: (err) => toast.error(apiError(err)),
  });

  const resetFilter = (setter) => (e) => { setter(e.target.value); setPage(1); };

  return (
    <div>
      <PageHeader
        title="الطلاب"
        subtitle="إدارة بيانات الطلاب واشتراكاتهم"
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Icon name="plus" className="h-4 w-4" /> إضافة طالب
          </Button>
        }
      />

      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-body">
              <Icon name="search" className="h-4 w-4" />
            </span>
            <Input
              className="ps-9"
              placeholder="بحث بالاسم أو الهاتف"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={groupId} onChange={resetFilter(setGroupId)}>
            <option value="">كل المجموعات</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
          <Select value={status} onChange={resetFilter(setStatus)}>
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={28} className="text-brand" /></div>
      ) : !data?.students.length ? (
        <Card className="p-2"><EmptyState title="لا يوجد طلاب" message="ابدأ بإضافة طالب جديد." /></Card>
      ) : (
        <>
          <TableWrap>
            <Thead>
              <tr>
                <Th>الاسم</Th>
                <Th>الهاتف</Th>
                <Th>المجموعة</Th>
                <Th>الحالة</Th>
                <Th className="text-end">إجراءات</Th>
              </tr>
            </Thead>
            <Tbody>
              {data.students.map((s) => (
                <Tr key={s.id} onClick={() => navigate(`/students/${s.id}`)}>
                  <Td className="font-medium text-heading">{s.name}</Td>
                  <Td dir="ltr" className="text-start">{s.phone}</Td>
                  <Td>{s.group?.name || '—'}</Td>
                  <Td>
                    <Badge variant={s.status === 'active' ? 'success' : 'gray'}>
                      {STUDENT_STATUS_LABELS[s.status]}
                    </Badge>
                  </Td>
                  <Td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setFormOpen(true); }} aria-label="تعديل">
                        <Icon name="edit" className="h-4 w-4" />
                      </Button>
                      {s.status === 'active' && (
                        <Button variant="ghost" size="icon" onClick={() => setDeactivating(s)} aria-label="إلغاء التنشيط">
                          <Icon name="trash" className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableWrap>
          <Pagination page={page} pageSize={PAGE_SIZE} total={data.total} onPage={setPage} />
        </>
      )}

      {formOpen && (
        <StudentFormModal
          key={editing?.id || 'new'}
          open={formOpen}
          editing={editing}
          groups={groups}
          onClose={() => setFormOpen(false)}
        />
      )}

      <ConfirmModal
        open={!!deactivating}
        onClose={() => setDeactivating(null)}
        onConfirm={() => deactivate.mutate(deactivating.id)}
        loading={deactivate.isPending}
        title="إلغاء تنشيط الطالب"
        message={`هل تريد إلغاء تنشيط الطالب «${deactivating?.name}»؟`}
        confirmText="إلغاء التنشيط"
      />
    </div>
  );
}
