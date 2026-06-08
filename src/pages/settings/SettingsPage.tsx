import { Button } from '@/components/ui/Button';
import {
  useGetMeQuery,
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
} from '@/api/endpoints';
import { ENV } from '@/config/env';
import type { AppLanguage } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { Globe, LogOut, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const { data: me } = useGetMeQuery();
  const { data: preferences } = useGetPreferencesQuery();
  const [updatePreferences, { isLoading: savingLanguage }] = useUpdatePreferencesMutation();

  const displayLang = preferences?.language ?? (i18n.language === 'ar' ? 'ar' : 'en');

  async function setLanguage(next: AppLanguage) {
    await i18n.changeLanguage(next);
    try {
      await updatePreferences({ language: next }).unwrap();
    } catch {
      /* language still switched locally */
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">{t('settings.title')}</h1>
        <p className="mt-2 text-[14px] text-ink-60">{t('settings.subtitle')}</p>
      </header>

      <section className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
        <h2 className="text-[15px] font-bold text-ink">{t('settings.language')}</h2>
        <p className="mt-1 text-[13px] text-ink-60">{t('settings.languageHint')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant={displayLang === 'en' ? 'dark' : 'outline'}
            size="md"
            loading={savingLanguage && displayLang !== 'en'}
            onClick={() => void setLanguage('en')}
          >
            <Globe size={16} strokeWidth={2} className="me-2" />
            English
          </Button>
          <Button
            type="button"
            variant={displayLang === 'ar' ? 'dark' : 'outline'}
            size="md"
            loading={savingLanguage && displayLang !== 'ar'}
            onClick={() => void setLanguage('ar')}
          >
            <Globe size={16} strokeWidth={2} className="me-2" />
            العربية
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
        <h2 className="text-[15px] font-bold text-ink">{t('settings.notifications')}</h2>
        <p className="mt-1 text-[13px] text-ink-60">{t('settings.notificationsHint')}</p>
        <ul className="mt-4 space-y-2 text-[13px] text-ink-60">
          <li>
            {t('settings.emailNotifications')}:{' '}
            <span className="font-semibold text-ink">
              {preferences?.email_notifications ? t('settings.on') : t('settings.off')}
            </span>
          </li>
          <li>
            {t('settings.pushNotifications')}:{' '}
            <span className="font-semibold text-ink">
              {preferences?.push_notifications ? t('settings.on') : t('settings.off')}
            </span>
          </li>
        </ul>
        <a
          href={ENV.mainWebsiteUrl}
          className="mt-4 inline-flex text-[13px] font-semibold text-coral hover:underline"
          rel="noreferrer"
        >
          {t('settings.manageOnMain')}
        </a>
      </section>

      <section className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm">
        <h2 className="text-[15px] font-bold text-ink">{t('settings.account')}</h2>
        <p className="mt-1 text-[13px] text-ink-60">{t('settings.accountHint')}</p>
        {me?.email ? (
          <p className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-ink">
            <Mail size={16} strokeWidth={2} className="text-ink-40" />
            {me.email}
          </p>
        ) : null}
        <a
          href={ENV.mainWebsiteUrl}
          className="mt-4 inline-flex text-[13px] font-semibold text-coral hover:underline"
          rel="noreferrer"
        >
          {t('settings.editOnMain')}
        </a>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="dark" onClick={() => void signOut()}>
          <LogOut size={16} strokeWidth={2} className="me-2" />
          {t('common.signOut')}
        </Button>
        <a
          href={ENV.mainWebsiteUrl}
          className="inline-flex items-center rounded-full border-2 border-ink-10 px-5 py-3 text-[14px] font-semibold text-ink hover:bg-ink-5"
          rel="noreferrer"
        >
          {t('auth.backToMain')}
        </a>
      </div>
    </div>
  );
}
