import { getToken } from '@/api/authToken';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { buildLoginUrl } from '@/lib/mainHandoff';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function RequireAuth() {
  const token = getToken();
  const { isLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (!token) {
    const intended = `${location.pathname}${location.search}`;
    return <Navigate to={buildLoginUrl(intended)} replace />;
  }

  if (isLoading) {
    return <PageSkeleton label={t('common.loading')} />;
  }

  return <Outlet />;
}
