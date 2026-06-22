import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type SettingsTabId =
  | 'preferences'
  | 'account'
  | 'password'
  | 'email'
  | 'sessions'
  | 'signout';

type TabItem = { id: SettingsTabId; labelKey: string };

const BASE_TABS: TabItem[] = [
  { id: 'preferences', labelKey: 'settings.preferences' },
  { id: 'account', labelKey: 'settings.account' },
  { id: 'password', labelKey: 'settings.changePassword' },
  { id: 'email', labelKey: 'settings.changeEmail' },
];

const SESSIONS_TAB: TabItem = { id: 'sessions', labelKey: 'settings.sessions' };
const SIGNOUT_TAB: TabItem = { id: 'signout', labelKey: 'settings.signOutTitle' };

export function isSettingsTabId(value: string | null): value is SettingsTabId {
  return (
    value === 'preferences' ||
    value === 'account' ||
    value === 'password' ||
    value === 'email' ||
    value === 'sessions' ||
    value === 'signout'
  );
}

export function SettingsTabs({
  active,
  onChange,
  showSessions,
}: {
  active: SettingsTabId;
  onChange: (tab: SettingsTabId) => void;
  showSessions: boolean;
}) {
  const { t } = useTranslation();

  const tabs = useMemo(() => {
    const items = [...BASE_TABS];
    if (showSessions) items.push(SESSIONS_TAB);
    items.push(SIGNOUT_TAB);
    return items;
  }, [showSessions]);

  return (
    <div
      role="tablist"
      aria-label={t('settings.jumpToSection')}
      className="flex gap-1 overflow-x-auto border-b border-ink-10 pb-px scrollbar-hide"
    >
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`settings-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`settings-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              'shrink-0 rounded-t-xl px-4 py-3 text-[13px] font-semibold transition-[color,background-color,box-shadow,transform] duration-200',
              'min-h-10 active:scale-[0.98]',
              selected
                ? 'bg-white text-ink shadow-[0_1px_0_0_white,inset_0_-2px_0_0_var(--color-ink)]'
                : 'text-ink-60 hover:bg-ink-5/80 hover:text-ink',
              tab.id === 'signout' && !selected && 'text-coral hover:text-coral',
              tab.id === 'signout' && selected && 'text-coral shadow-[0_1px_0_0_white,inset_0_-2px_0_0_var(--color-coral)]',
            )}
          >
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

export function SettingsTabPanel({
  id,
  active,
  children,
}: {
  id: SettingsTabId;
  active: SettingsTabId;
  children: ReactNode;
}) {
  if (active !== id) return null;

  return (
    <div
      role="tabpanel"
      id={`settings-panel-${id}`}
      aria-labelledby={`settings-tab-${id}`}
      tabIndex={0}
      className="outline-none focus-visible:ring-2 focus-visible:ring-coral/30 focus-visible:ring-offset-2"
    >
      {children}
    </div>
  );
}
