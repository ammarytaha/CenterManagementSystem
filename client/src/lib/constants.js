// Arabic labels + shared constants.

export const ROLE_LABELS = { admin: 'مدير', teacher: 'مدرّس', assistant: 'مساعد' };

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
//   admin     — full access
//   assistant — all operations except users/settings
//   teacher   — only their own groups + attendance + their profile/earnings
export const NAV_ITEMS = [
  { to: '/', label: 'لوحة التحكم', icon: 'dashboard', roles: ['admin', 'assistant'] },
  { to: '/students', label: 'الطلاب', icon: 'students', roles: ['admin', 'assistant'] },
  { to: '/teachers', label: 'المدرّسون', icon: 'teachers', roles: ['admin', 'assistant'] },
  { to: '/groups', label: 'المجموعات', icon: 'groups', roles: ['admin', 'assistant', 'teacher'] },
  { to: '/attendance', label: 'الحضور', icon: 'attendance', roles: ['admin', 'assistant', 'teacher'] },
  { to: '/payments', label: 'المدفوعات', icon: 'payments', roles: ['admin', 'assistant'] },
  { to: '/reports', label: 'التقارير', icon: 'reports', roles: ['admin', 'assistant'] },
  { to: '/my', label: 'ملفي', icon: 'user', roles: ['teacher'] },
  { to: '/settings', label: 'الإعدادات', icon: 'settings', roles: ['admin'] },
];

// Landing route per role after login.
export const HOME_BY_ROLE = { admin: '/', assistant: '/', teacher: '/my' };
export const homeForRole = (role) => HOME_BY_ROLE[role] || '/';
