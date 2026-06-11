import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type SettingsSectionId =
  | 'language'
  | 'preferences'
  | 'account'
  | 'security'
  | 'email'
  | 'sessions';

const SECTIONS: { id: SettingsSectionId; labelKey: string }[] = [
  { id: 'language', labelKey: 'settings.language' },
  { id: 'preferences', labelKey: 'settings.notifications' },
  { id: 'account', labelKey: 'settings.account' },
  { id: 'security', labelKey: 'settings.changePassword' },
  { id: 'email', labelKey: 'settings.changeEmail' },
  { id: 'sessions', labelKey: 'settings.sessions' },
];

const sectionScrollClass = 'scroll-mt-[calc(72px+4.5rem)] lg:scroll-mt-28';

export function settingsSectionAnchorClass() {
  return sectionScrollClass;
}

export function SettingsSectionNav({
  showSessions,
  variant,
}: {
  showSessions: boolean;
  variant: 'mobile' | 'desktop';
}) {
  const { t } = useTranslation();
  const items = SECTIONS.filter((section) => section.id !== 'sessions' || showSessions);

  if (variant === 'desktop') {
    return (
      <nav className="hidden lg:block" aria-label={t('settings.title')}>
        <ul className="sticky top-28 space-y-0.5">
          {items.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block rounded-xl px-3 py-2.5 text-[13px] font-semibold text-ink-60 transition-colors duration-200 hover:bg-ink-5 hover:text-ink active:scale-[0.98]"
              >
                {t(section.labelKey)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:hidden"
      aria-label={t('settings.jumpToSection')}
    >
      {items.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={cn(
            'shrink-0 rounded-full border border-ink-10 bg-white px-3.5 py-2 text-[12px] font-semibold text-ink-60',
            'transition-all duration-200 hover:border-ink-20 hover:bg-ink-5 hover:text-ink active:scale-[0.98]',
          )}
        >
          {t(section.labelKey)}
        </a>
      ))}
    </nav>
  );
}
