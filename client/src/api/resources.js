import { api } from './client.js';

const data = (p) => p.then((r) => r.data);

export const authApi = {
  login: (payload) => data(api.post('/auth/login', payload)),
  me: () => data(api.get('/auth/me')),
};

export const usersApi = {
  list: () => data(api.get('/users')),
  create: (payload) => data(api.post('/users', payload)),
  update: (id, payload) => data(api.put(`/users/${id}`, payload)),
  resetPassword: (id, password) => data(api.patch(`/users/${id}/password`, { password })),
  remove: (id) => data(api.delete(`/users/${id}`)),
};

export const studentsApi = {
  list: (params) => data(api.get('/students', { params })),
  get: (id) => data(api.get(`/students/${id}`)),
  create: (payload) => data(api.post('/students', payload)),
  update: (id, payload) => data(api.put(`/students/${id}`, payload)),
  deactivate: (id) => data(api.patch(`/students/${id}/deactivate`)),
};

export const teachersApi = {
  list: () => data(api.get('/teachers')),
  get: (id, params) => data(api.get(`/teachers/${id}`, { params })),
  me: (params) => data(api.get('/teachers/me', { params })),
  create: (payload) => data(api.post('/teachers', payload)),
  update: (id, payload) => data(api.put(`/teachers/${id}`, payload)),
};

export const groupsApi = {
  list: () => data(api.get('/groups')),
  get: (id) => data(api.get(`/groups/${id}`)),
  create: (payload) => data(api.post('/groups', payload)),
  update: (id, payload) => data(api.put(`/groups/${id}`, payload)),
};

export const attendanceApi = {
  roster: (groupId, date) => data(api.get('/attendance', { params: { groupId, date } })),
  mark: (payload) => data(api.post('/attendance', payload)),
  report: (params) => data(api.get('/attendance/report', { params })),
  flags: () => data(api.get('/attendance/flags')),
};

export const paymentsApi = {
  record: (payload) => data(api.post('/payments', payload)),
  overdue: () => data(api.get('/payments/overdue')),
  studentDue: (id) => data(api.get(`/payments/student/${id}/due`)),
  list: (params) => data(api.get('/payments', { params })),
  receipt: (id) => data(api.get(`/payments/${id}/receipt`)),
};

export const reportsApi = {
  revenue: (month) => data(api.get('/reports/revenue', { params: { month } })),
  attendance: (month) => data(api.get('/reports/attendance', { params: { month } })),
  teacherEarnings: (month) => data(api.get('/reports/teacher-earnings', { params: { month } })),
};

export const dashboardApi = {
  get: () => data(api.get('/dashboard')),
};
