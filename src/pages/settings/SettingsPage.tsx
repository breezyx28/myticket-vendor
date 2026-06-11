import { PageHeader, PageShell, SectionCard, SectionHeading } from '@/components/layout';
import {
  SettingsSectionNav,
  settingsSectionAnchorClass,
} from '@/components/settings/SettingsSectionNav';
import { Button } from '@/components/ui/Button';
import { CheckboxField } from '@/components/ui/CheckboxField';
import { Field } from '@/components/forms/Field';
import { Select } from '@/components/forms/Select';
import { TextInput } from '@/components/forms/TextInput';
import {
  useChangeEmailMutation,
  useChangePasswordMutation,
  useGetMeQuery,
  useGetPreferencesQuery,
  useListSessionsQuery,
  useRevokeSessionMutation,
  useUpdateMeMutation,
  useUpdatePreferencesMutation,
} from '@/api/endpoints';
import type { AppLanguage } from '@/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useMutationToast } from '@/hooks/useMutationToast';
import {
  changeEmailSchema,
  changePasswordSchema,
  updateAccountSchema,
  type ChangeEmailSchema,
  type ChangePasswordSchema,
  type UpdateAccountSchema,
} from '@/schemas/auth';
import { updatePreferencesSchema, type UpdatePreferencesSchema } from '@/schemas/profile';
import { yupResolver } from '@hookform/resolvers/yup';
import { Globe, LogOut, Mail } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const sectionPad = 'p-4 sm:p-6';
const sectionAnchor = settingsSectionAnchorClass();

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const { runMutation } = useMutationToast();
  const { data: me } = useGetMeQuery();
  const { data: preferences } = useGetPreferencesQuery();
  const { data: sessions = [] } = useListSessionsQuery();
  const [updatePreferences, { isLoading: savingPrefs }] = useUpdatePreferencesMutation();
  const [updateMe, { isLoading: savingAccount }] = useUpdateMeMutation();
  const [changePassword, { isLoading: savingPassword }] = useChangePasswordMutation();
  const [changeEmail, { isLoading: savingEmail }] = useChangeEmailMutation();
  const [revokeSession] = useRevokeSessionMutation();

  const displayLang = preferences?.language ?? (i18n.language === 'ar' ? 'ar' : 'en');
  const showSessions = sessions.length > 0;

  const prefsForm = useForm<UpdatePreferencesSchema>({
    resolver: yupResolver(updatePreferencesSchema) as never,
    defaultValues: {
      language: 'en',
      theme: 'system',
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      marketing_emails: false,
    },
  });

  const accountForm = useForm<UpdateAccountSchema>({
    resolver: yupResolver(updateAccountSchema) as never,
    defaultValues: { full_name: '', display_name: '', phone: '' },
  });

  const passwordForm = useForm<ChangePasswordSchema>({
    resolver: yupResolver(changePasswordSchema) as never,
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  const emailForm = useForm<ChangeEmailSchema>({
    resolver: yupResolver(changeEmailSchema) as never,
    defaultValues: { new_email: '', current_password: '' },
  });

  useEffect(() => {
    if (!preferences) return;
    prefsForm.reset({
      language: preferences.language,
      theme: preferences.theme,
      email_notifications: preferences.email_notifications,
      push_notifications: preferences.push_notifications,
      sms_notifications: preferences.sms_notifications,
      marketing_emails: preferences.marketing_emails,
    });
  }, [preferences, prefsForm]);

  useEffect(() => {
    if (!me) return;
    accountForm.reset({
      full_name: me.full_name ?? '',
      display_name: me.display_name ?? '',
      phone: me.phone ?? '',
    });
  }, [me, accountForm]);

  async function setLanguage(next: AppLanguage) {
    await i18n.changeLanguage(next);
    try {
      await updatePreferences({ language: next }).unwrap();
    } catch {
      /* language still switched locally */
    }
  }

  return (
    <PageShell spacing={6} className="w-full max-w-4xl">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="sticky top-[72px] z-20 -mx-1 border-b border-ink-10/80 bg-surface-page/95 py-3 backdrop-blur-md lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:py-0 lg:backdrop-blur-none">
        <SettingsSectionNav showSessions={showSessions} variant="mobile" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] lg:gap-8">
        <SettingsSectionNav showSessions={showSessions} variant="desktop" />

        <div className="min-w-0 space-y-0">
          <SectionCard variant="plain" className="overflow-hidden rounded-2xl sm:rounded-3xl">
            <div id="language" className={cn(sectionPad, sectionAnchor, 'border-b border-ink-10')}>
              <SectionHeading title={t('settings.language')} description={t('settings.languageHint')} />
              <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <Button
                  type="button"
                  variant={displayLang === 'en' ? 'dark' : 'outline'}
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => void setLanguage('en')}
                >
                  <Globe size={16} className="me-2 shrink-0" />
                  English
                </Button>
                <Button
                  type="button"
                  variant={displayLang === 'ar' ? 'dark' : 'outline'}
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => void setLanguage('ar')}
                >
                  <Globe size={16} className="me-2 shrink-0" />
                  العربية
                </Button>
              </div>
            </div>

            <form
              id="preferences"
              className={cn(sectionPad, sectionAnchor, 'space-y-4 border-b border-ink-10')}
              onSubmit={prefsForm.handleSubmit((values) =>
                runMutation(() =>
                  updatePreferences({
                    language: values.language ?? undefined,
                    theme: values.theme ?? undefined,
                    email_notifications: values.email_notifications ?? undefined,
                    push_notifications: values.push_notifications ?? undefined,
                    sms_notifications: values.sms_notifications ?? undefined,
                    marketing_emails: values.marketing_emails ?? undefined,
                  }).unwrap(),
                ),
              )}
            >
              <SectionHeading
                title={t('settings.notifications')}
                description={t('settings.notificationsHint')}
              />
              <Field label={t('settings.theme')} error={prefsForm.formState.errors.theme?.message}>
                <Select {...prefsForm.register('theme')}>
                  <option value="system">{t('settings.themeSystem')}</option>
                  <option value="light">{t('settings.themeLight')}</option>
                  <option value="dark">{t('settings.themeDark')}</option>
                </Select>
              </Field>
              <div className="space-y-3 rounded-2xl border border-ink-10 bg-ink-5/30 p-3 sm:p-4">
                {(
                  [
                    ['email_notifications', t('settings.emailNotifications')],
                    ['push_notifications', t('settings.pushNotifications')],
                    ['sms_notifications', t('settings.smsNotifications')],
                    ['marketing_emails', t('settings.marketingEmails')],
                  ] as const
                ).map(([name, label]) => (
                  <CheckboxField key={name} label={label} {...prefsForm.register(name)} />
                ))}
              </div>
              <Button type="submit" variant="dark" loading={savingPrefs} className="w-full sm:w-auto">
                {t('settings.savePreferences')}
              </Button>
            </form>

            <form
              id="account"
              className={cn(sectionPad, sectionAnchor, 'space-y-4 border-b border-ink-10')}
              onSubmit={accountForm.handleSubmit((values) =>
                runMutation(() =>
                  updateMe({
                    full_name: values.full_name ?? undefined,
                    display_name: values.display_name ?? undefined,
                    phone: values.phone ?? undefined,
                  }).unwrap(),
                ),
              )}
            >
              <SectionHeading title={t('settings.account')} description={t('settings.accountHint')} />
              {me?.email ? (
                <p className="inline-flex max-w-full items-start gap-2 break-all text-[14px] font-semibold text-ink sm:items-center">
                  <Mail size={16} className="mt-0.5 shrink-0 text-ink-40 sm:mt-0" />
                  <span dir="ltr">{me.email}</span>
                </p>
              ) : null}
              <Field label={t('settings.fullName')} error={accountForm.formState.errors.full_name?.message}>
                <TextInput {...accountForm.register('full_name')} />
              </Field>
              <Field label={t('settings.displayName')} error={accountForm.formState.errors.display_name?.message}>
                <TextInput {...accountForm.register('display_name')} />
              </Field>
              <Field label={t('settings.phone')} error={accountForm.formState.errors.phone?.message}>
                <TextInput {...accountForm.register('phone')} dir="ltr" />
              </Field>
              <Button type="submit" variant="dark" loading={savingAccount} className="w-full sm:w-auto">
                {t('settings.saveAccount')}
              </Button>
            </form>

            <form
              id="security"
              className={cn(sectionPad, sectionAnchor, 'space-y-4 border-b border-ink-10')}
              onSubmit={passwordForm.handleSubmit((values) =>
                runMutation(
                  () =>
                    changePassword({
                      current_password: values.current_password,
                      new_password: values.new_password,
                    }).unwrap(),
                  { onSuccess: () => passwordForm.reset() },
                ),
              )}
            >
              <SectionHeading title={t('settings.changePassword')} />
              <Field
                label={t('settings.currentPassword')}
                error={passwordForm.formState.errors.current_password?.message}
              >
                <TextInput
                  {...passwordForm.register('current_password')}
                  type="password"
                  autoComplete="current-password"
                />
              </Field>
              <Field label={t('settings.newPassword')} error={passwordForm.formState.errors.new_password?.message}>
                <TextInput
                  {...passwordForm.register('new_password')}
                  type="password"
                  autoComplete="new-password"
                />
              </Field>
              <Field
                label={t('settings.confirmPassword')}
                error={passwordForm.formState.errors.new_password_confirmation?.message}
              >
                <TextInput
                  {...passwordForm.register('new_password_confirmation')}
                  type="password"
                  autoComplete="new-password"
                />
              </Field>
              <Button type="submit" variant="dark" loading={savingPassword} className="w-full sm:w-auto">
                {t('settings.updatePassword')}
              </Button>
            </form>

            <form
              id="email"
              className={cn(sectionPad, sectionAnchor, 'space-y-4', showSessions && 'border-b border-ink-10')}
              onSubmit={emailForm.handleSubmit((values) =>
                runMutation(
                  async () => {
                    const res = await changeEmail(values).unwrap();
                    emailForm.reset();
                    return res;
                  },
                  { fallbackKey: 'common.error' },
                ),
              )}
            >
              <SectionHeading title={t('settings.changeEmail')} description={t('settings.changeEmailHint')} />
              <Field label={t('settings.newEmail')} error={emailForm.formState.errors.new_email?.message}>
                <TextInput {...emailForm.register('new_email')} type="email" dir="ltr" />
              </Field>
              <Field
                label={t('settings.currentPassword')}
                error={emailForm.formState.errors.current_password?.message}
              >
                <TextInput
                  {...emailForm.register('current_password')}
                  type="password"
                  autoComplete="current-password"
                />
              </Field>
              <Button type="submit" variant="dark" loading={savingEmail} className="w-full sm:w-auto">
                {t('settings.updateEmail')}
              </Button>
            </form>

            {showSessions ? (
              <section id="sessions" className={cn(sectionPad, sectionAnchor)}>
                <SectionHeading title={t('settings.sessions')} />
                <ul className="mt-4 space-y-2">
                  {sessions.map((session) => (
                    <li
                      key={session.id}
                      className="flex flex-col gap-3 rounded-xl border border-ink-10 p-3 text-[13px] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">
                          {session.device_label ?? session.user_agent ?? t('settings.unknownDevice')}
                        </p>
                        {session.last_active_at ? (
                          <p className="mt-0.5 text-[11px] text-ink-40" dir="ltr">
                            {new Date(session.last_active_at).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                      {session.current ? (
                        <span className="shrink-0 self-start rounded-full bg-mint/15 px-2.5 py-1 text-[11px] font-semibold text-mint-dark sm:self-center">
                          {t('settings.currentSession')}
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => void revokeSession({ id: session.id })}
                        >
                          {t('settings.revoke')}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </SectionCard>

          <div className="mt-4 sm:mt-6">
            <Button
              type="button"
              variant="dark"
              className="w-full sm:w-auto"
              onClick={() => void signOut()}
            >
              <LogOut size={16} className="me-2" />
              {t('common.signOut')}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
