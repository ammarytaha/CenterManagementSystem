import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { homeForRole } from '../lib/constants.js';
import { FullScreenSpinner } from '../components/ui/Spinner.jsx';

// Gates a route behind authentication and (optionally) a set of roles.
export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }
  return children;
}
