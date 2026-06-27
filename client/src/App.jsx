import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudentsPage from './pages/StudentsPage.jsx';
import StudentProfilePage from './pages/StudentProfilePage.jsx';
import TeachersPage from './pages/TeachersPage.jsx';
import TeacherProfilePage from './pages/TeacherProfilePage.jsx';
import GroupsPage from './pages/GroupsPage.jsx';
import GroupDetailPage from './pages/GroupDetailPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

const STAFF = ['admin', 'staff'];
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
        <Route path="/students" element={guard(<StudentsPage />, STAFF)} />
        <Route path="/students/:id" element={guard(<StudentProfilePage />, STAFF)} />
        <Route path="/teachers" element={guard(<TeachersPage />, STAFF)} />
        <Route path="/teachers/:id" element={guard(<TeacherProfilePage />, STAFF)} />
        <Route path="/groups" element={guard(<GroupsPage />, STAFF)} />
        <Route path="/groups/:id" element={guard(<GroupDetailPage />, STAFF)} />
        <Route path="/attendance" element={guard(<AttendancePage />, STAFF)} />
        <Route path="/payments" element={guard(<PaymentsPage />, STAFF)} />
        <Route path="/reports" element={guard(<ReportsPage />, ['admin', 'accountant'])} />
        <Route path="/settings" element={guard(<SettingsPage />, ['admin'])} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
