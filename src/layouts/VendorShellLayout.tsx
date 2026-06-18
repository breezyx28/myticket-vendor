import { NotificationBell } from '@/components/notifications/NotificationBell';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { NotificationProvider } from '@/contexts/NotificationProvider';
import { NAV_GROUPS } from '@/config/nav';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Building2, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router-dom';

export function VendorShellLayout() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <NotificationProvider>
      <div className="min-h-dvh bg-surface-page text-ink">
        <header className="sticky top-0 z-50 h-[72px] border-b border-ink-10 bg-white/90 shadow-ink-sm backdrop-blur-md">
          <div className="mx-auto flex h-full max-w-full items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="inline-flex shrink-0 rounded-full border border-ink-10 p-2 transition-colors hover:bg-ink-5 md:hidden"
                aria-label={t('accessibility.openMenu')}
                onClick={() => setOpen(true)}
              >
                <Menu size={20} strokeWidth={2} />
              </button>
              <NavLink
                to="/"
                className="flex min-w-0 items-center gap-2 font-extrabold tracking-tight text-ink"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-lemon shadow-card-sm ring-1 ring-ink/5">
                  <Building2 size={18} strokeWidth={2} className="text-ink" />
                </span>
                <span className="hidden truncate leading-tight sm:inline">
                  {t('brand.name')}
                </span>
              </NavLink>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <NotificationBell />
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => void signOut()}
                className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-ink bg-white px-3 text-[13px] font-semibold shadow-sm transition-all hover:bg-ink-5 active:scale-[0.98] sm:px-4"
              >
                <LogOut size={16} strokeWidth={2} />
                <span className="hidden md:inline">{t('common.signOut')}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          <aside
            className={cn(
              'fixed inset-y-0 start-0 z-40 flex w-[86%] max-w-[320px] flex-col bg-white/95 p-6 transition-transform',
              'md:top-[72px] md:z-30 md:h-[calc(100dvh-72px)] md:w-72 md:max-w-none md:translate-x-0 md:overflow-y-auto md:border-e md:border-ink-10 md:bg-white md:p-5 md:pt-6',
              open ? 'translate-x-0' : '-translate-x-full md:translate-x-0 rtl:translate-x-full rtl:md:translate-x-0',
            )}
          >
            <div className="mb-4 flex items-center justify-between md:hidden">
              <LanguageSwitcher variant="segmented" />
              <button
                type="button"
                className="rounded-full p-2 transition-colors hover:bg-ink-5"
                aria-label={t('accessibility.closeMenu')}
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-5">
              {NAV_GROUPS.map((group) => (
                <div key={group.labelKey}>
                  <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-40">
                    {t(group.labelKey)}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[14px] font-semibold transition-colors duration-200',
                            isActive
                              ? 'bg-ink text-white shadow-card-md'
                              : 'text-ink-60 hover:bg-ink-5 hover:text-ink',
                          )
                        }
                      >
                        <item.icon size={18} strokeWidth={2} />
                        {t(item.labelKey)}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="mt-6 space-y-3 border-t border-ink-10 pt-4">
              {user?.email ? (
                <div className="rounded-2xl border border-ink-10 bg-ink-5/50 px-3 py-2.5">
                  <p className="truncate text-[12px] font-semibold text-ink">{user.email}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ink-40">{t('brand.role')}</p>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  void signOut();
                  setOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-10 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-ink-5 md:hidden"
              >
                <LogOut size={16} />
                {t('common.signOut')}
              </button>
            </div>
          </aside>

          <main className="min-h-[calc(100dvh-72px)] flex-1 px-4 py-8 md:ms-72 md:px-8 lg:px-10">
            <Outlet />
          </main>
        </div>

        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-ink/40 md:hidden"
            aria-label={t('accessibility.closeOverlay')}
            onClick={() => setOpen(false)}
          />
        ) : null}
      </div>
    </NotificationProvider>
  );
}
