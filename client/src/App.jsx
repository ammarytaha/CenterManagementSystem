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
import MyTeacherPage from './pages/MyTeacherPage.jsx';

const OPS = ['admin', 'assistant']; // full operations, no user/system admin
const VIEW = ['admin', 'assistant', 'teacher']; // teacher scoped server-side
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
        <Route path="/" element={guard(<DashboardPage />, OPS)} />
        <Route path="/students" element={guard(<StudentsPage />, OPS)} />
        <Route path="/students/:id" element={guard(<StudentProfilePage />, OPS)} />
        <Route path="/teachers" element={guard(<TeachersPage />, OPS)} />
        <Route path="/teachers/:id" element={guard(<TeacherProfilePage />, OPS)} />
        <Route path="/groups" element={guard(<GroupsPage />, VIEW)} />
        <Route path="/groups/:id" element={guard(<GroupDetailPage />, VIEW)} />
        <Route path="/attendance" element={guard(<AttendancePage />, VIEW)} />
        <Route path="/payments" element={guard(<PaymentsPage />, OPS)} />
        <Route path="/reports" element={guard(<ReportsPage />, OPS)} />
        <Route path="/my" element={guard(<MyTeacherPage />, ['teacher'])} />
        <Route path="/settings" element={guard(<SettingsPage />, ['admin'])} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
