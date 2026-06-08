import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

export function RequireVendorCandidate() {
  const { user } = useAuth();

  if (user?.role === 'organizer' || user?.role === 'talent') {
    return <Navigate to="/access-denied" replace />;
  }

  if (user?.role === 'vendor') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
