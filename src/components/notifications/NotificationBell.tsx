import { useNotifications } from '@/hooks/useNotifications';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function NotificationBell() {
  const { t, i18n } = useTranslation();
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const preview = items.slice(0, 8);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-10 bg-white text-ink-60 transition-colors hover:bg-ink-5 hover:text-ink"
        aria-label={t('notifications.title')}
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 ? (
          <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute end-0 top-[calc(100%+8px)] z-[60] w-[min(100vw-2rem,20rem)] rounded-2xl border border-ink-10 bg-white py-2 shadow-card-lg">
          <div className="flex items-center justify-between border-b border-ink-10 px-3 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
              {t('notifications.title')}
            </span>
            {unreadCount > 0 ? (
              <button
                type="button"
                className="text-[11px] font-semibold text-coral hover:underline"
                onClick={() => markAllRead()}
              >
                {t('notifications.markAllRead')}
              </button>
            ) : null}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {preview.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-ink-40">{t('notifications.empty')}</p>
            ) : (
              preview.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'border-b border-ink-5 px-3 py-2.5 last:border-0',
                    !n.read && 'bg-lemon/10',
                  )}
                >
                  {n.href ? (
                    <Link
                      to={n.href}
                      className="block text-start"
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                      }}
                    >
                      <p className="text-[13px] font-bold text-ink">{n.title}</p>
                      <p className="mt-0.5 text-[12px] text-ink-60">{n.body}</p>
                      <p className="mt-1 text-[10px] text-ink-40" dir="ltr">
                        {formatDateTime(n.createdAt, i18n.language)}
                      </p>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="w-full text-start"
                      onClick={() => markRead(n.id)}
                    >
                      <p className="text-[13px] font-bold text-ink">{n.title}</p>
                      <p className="mt-0.5 text-[12px] text-ink-60">{n.body}</p>
                      <p className="mt-1 text-[10px] text-ink-40" dir="ltr">
                        {formatDateTime(n.createdAt, i18n.language)}
                      </p>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="border-t border-ink-10 px-3 pt-2">
            <Link
              to="/notifications"
              className="block py-2 text-center text-[12px] font-semibold text-coral hover:underline"
              onClick={() => setOpen(false)}
            >
              {t('notifications.viewAll')}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
