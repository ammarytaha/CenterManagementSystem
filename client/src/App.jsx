import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import { Placeholder } from './pages/Placeholder.jsx';

// Wraps an element in a role guard (auth is enforced by the layout route).
const guard = (element, roles) => <ProtectedRoute roles={roles}>{element}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={guard(<DashboardPage />, ['admin'])} />
        <Route path="/students" element={guard(<Placeholder title="الطلاب" />, ['admin', 'staff'])} />
        <Route path="/teachers" element={guard(<Placeholder title="المدرّسون" />, ['admin', 'staff'])} />
        <Route path="/groups" element={guard(<Placeholder title="المجموعات" />, ['admin', 'staff'])} />
        <Route path="/attendance" element={guard(<Placeholder title="الحضور" />, ['admin', 'staff'])} />
        <Route path="/payments" element={guard(<Placeholder title="المدفوعات" />, ['admin', 'staff'])} />
        <Route path="/reports" element={guard(<Placeholder title="التقارير" />, ['admin', 'accountant'])} />
        <Route path="/settings" element={guard(<Placeholder title="الإعدادات" />, ['admin'])} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
