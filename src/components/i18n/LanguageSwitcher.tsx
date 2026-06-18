import type { AppLanguage } from '@/i18n';
import { getToken } from '@/api/authToken';
import { useUpdatePreferencesMutation } from '@/api/endpoints';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type LanguageSwitcherVariant = 'compact' | 'segmented' | 'minimal';

export function LanguageSwitcher({
  variant = 'compact',
  className,
}: {
  variant?: LanguageSwitcherVariant;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const [updatePreferences] = useUpdatePreferencesMutation();
  const current = i18n.language.startsWith('ar') ? 'ar' : 'en';

  async function setLanguage(next: AppLanguage) {
    if (current === next) return;
    await i18n.changeLanguage(next);
    if (getToken()) {
      try {
        await updatePreferences({ language: next }).unwrap();
      } catch {
        /* language still switched locally */
      }
    }
  }

  if (variant === 'segmented') {
    return (
      <div className={cn('grid grid-cols-2 gap-2 sm:flex sm:flex-wrap', className)}>
        {(['en', 'ar'] as const).map((lng) => (
          <button
            key={lng}
            type="button"
            onClick={() => void setLanguage(lng)}
            className={cn(
              'rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 active:scale-[0.98]',
              current === lng
                ? 'border-ink bg-ink text-white shadow-card-sm'
                : 'border-ink-10 bg-white text-ink-60 hover:border-ink-20 hover:bg-ink-5 hover:text-ink',
            )}
          >
            {t(`language.${lng}`)}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={() => void setLanguage(current === 'ar' ? 'en' : 'ar')}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-10 bg-white px-3 text-[12px] font-semibold text-ink-60 transition-colors hover:bg-ink-5 hover:text-ink active:scale-[0.98]',
          className,
        )}
        aria-label={t('language.switchAria')}
      >
        <Globe size={14} strokeWidth={2} />
        {current === 'ar' ? 'ع' : 'EN'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void setLanguage(current === 'ar' ? 'en' : 'ar')}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-full border border-ink-10 bg-white px-3 text-[13px] font-semibold text-ink-60 transition-colors hover:bg-ink-5 hover:text-ink active:scale-[0.98] sm:gap-2 sm:px-4',
        className,
      )}
      aria-label={t('language.switchAria')}
    >
      <Globe size={16} strokeWidth={2} />
      <span className="hidden sm:inline">{t(`language.${current}`)}</span>
      <span className="sm:hidden">{current === 'ar' ? 'ع' : 'EN'}</span>
    </button>
  );
}
