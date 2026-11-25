import { Navigate, Outlet } from 'react-router-dom';
import PageLoader from '@/components/feedback/PageLoader';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

export default function GuestRoute() {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? ROUTES.admin : ROUTES.dashboard} replace />;
  return <Outlet />;
}
