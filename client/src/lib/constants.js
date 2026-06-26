// Arabic labels + shared constants.

export const ROLE_LABELS = { admin: 'مدير', staff: 'موظف', accountant: 'محاسب' };

export const STUDENT_STATUS_LABELS = { active: 'نشط', inactive: 'غير نشط' };

export const ATTENDANCE_LABELS = { present: 'حاضر', absent: 'غائب', late: 'متأخر' };

export const PAYMENT_METHOD_LABELS = {
  vodafone_cash: 'فودافون كاش',
  instapay: 'إنستاباي',
  cash: 'نقدًا',
};

export const COMPENSATION_LABELS = { salary: 'راتب ثابت', percentage: 'نسبة %' };

export const DAYS = [
  { key: 'sat', label: 'السبت' },
  { key: 'sun', label: 'الأحد' },
  { key: 'mon', label: 'الإثنين' },
  { key: 'tue', label: 'الثلاثاء' },
  { key: 'wed', label: 'الأربعاء' },
  { key: 'thu', label: 'الخميس' },
  { key: 'fri', label: 'الجمعة' },
];
export const DAY_LABELS = Object.fromEntries(DAYS.map((d) => [d.key, d.label]));

// Sidebar navigation (filtered by the current user's role).
export const NAV_ITEMS = [
  { to: '/', label: 'لوحة التحكم', icon: 'dashboard', roles: ['admin'] },
  { to: '/students', label: 'الطلاب', icon: 'students', roles: ['admin', 'staff'] },
  { to: '/teachers', label: 'المدرّسون', icon: 'teachers', roles: ['admin', 'staff'] },
  { to: '/groups', label: 'المجموعات', icon: 'groups', roles: ['admin', 'staff'] },
  { to: '/attendance', label: 'الحضور', icon: 'attendance', roles: ['admin', 'staff'] },
  { to: '/payments', label: 'المدفوعات', icon: 'payments', roles: ['admin', 'staff'] },
  { to: '/reports', label: 'التقارير', icon: 'reports', roles: ['admin', 'accountant'] },
  { to: '/settings', label: 'الإعدادات', icon: 'settings', roles: ['admin'] },
];

// Landing route per role after login.
export const HOME_BY_ROLE = { admin: '/', staff: '/students', accountant: '/reports' };
export const homeForRole = (role) => HOME_BY_ROLE[role] || '/students';
