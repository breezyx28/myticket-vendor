import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { finalizeVendorSession } from '@/lib/finalizeVendorSession';
import { parseAuthResponse } from '@/lib/authMapper';
import { readMainHandoff, stripSessionHandoffParams } from '@/lib/mainHandoff';
import type { UserMe } from '@/api/types/user';
import { useAppDispatch } from '@/store/hooks';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

function minimalUserFromHandoff(email: string | null): UserMe | null {
  if (!email) return null;
  return {
    id: 0,
    email,
    full_name: email.split('@')[0] ?? email,
    role: 'vendor',
    roles: ['vendor'],
  };
}

export function SessionHandoffBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const ranRef = useRef(false);
  const [establishing, setEstablishing] = useState(false);

  useEffect(() => {
    if (ranRef.current) return;

    const handoff = readMainHandoff(searchParams);
    if (!handoff.sessionHandoff) return;

    ranRef.current = true;
    setEstablishing(true);

    const cleanPath = stripSessionHandoffParams(location.pathname, location.search);
    const redirectTarget = handoff.redirect !== '/' ? handoff.redirect : cleanPath;

    const user =
      minimalUserFromHandoff(handoff.email) ?? {
        id: 0,
        email: handoff.email ?? '',
        full_name: handoff.email?.split('@')[0] ?? 'Vendor',
        role: 'vendor',
        roles: ['vendor'],
      };

    const parsed = parseAuthResponse({
      token: handoff.sessionHandoff.token,
      refresh_token: handoff.sessionHandoff.refreshToken,
      expires_at: handoff.sessionHandoff.expiresAt,
      user,
    });

    if ('twoFactor' in parsed) {
      setEstablishing(false);
      navigate(cleanPath, { replace: true });
      return;
    }

    void finalizeVendorSession(dispatch, parsed)
      .then((result) => {
        if (!result.ok) {
          navigate('/access-denied', { replace: true });
          return;
        }
        const target = result.redirectTo !== '/' ? result.redirectTo : redirectTarget;
        const [path, query = ''] = target.split('?');
        const stripped = stripSessionHandoffParams(path, query ? `?${query}` : '');
        navigate(stripped, { replace: true });
      })
      .catch(() => {
        navigate(cleanPath, { replace: true });
      })
      .finally(() => {
        setEstablishing(false);
      });
  }, [dispatch, location.pathname, location.search, navigate, searchParams]);

  if (establishing) {
    return <PageSkeleton label={t('common.loading')} />;
  }

  return children;
}
