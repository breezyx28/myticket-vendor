import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { PageHeader, PageShell, SectionCard } from '@/components/layout';
import { SettingsFormFooter, SettingsSubsection } from '@/components/settings/SettingsFormFooter';
import { SettingsTabPanel, SettingsTabs, isSettingsTabId, type SettingsTabId } from '@/components/settings/SettingsTabs';
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
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLocalizedResolver } from '@/hooks/useLocalizedResolver';
import { useMutationToast } from '@/hooks/useMutationToast';
import { formatDateTime } from '@/lib/format';
import {
  createAuthSchemas,
  type ChangeEmailSchema,
  type ChangePasswordSchema,
  type UpdateAccountSchema,
} from '@/schemas/auth';
import { createProfileSchemas, type UpdatePreferencesSchema } from '@/schemas/profile';
import { Laptop, LogOut, Mail, Monitor, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

function SessionDeviceIcon({ label }: { label: string }) {
  const lower = label.toLowerCase();
  if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) {
    return <Smartphone size={18} strokeWidth={2} className="text-ink-40" aria-hidden />;
  }
  if (lower.includes('mac') || lower.includes('windows') || lower.includes('linux')) {
    return <Laptop size={18} strokeWidth={2} className="text-ink-40" aria-hidden />;
  }
  return <Monitor size={18} strokeWidth={2} className="text-ink-40" aria-hidden />;
}

function resolveTab(param: string | null, showSessions: boolean): SettingsTabId {
  if (param === 'sessions' && !showSessions) return 'preferences';
  if (isSettingsTabId(param)) return param;
  return 'preferences';
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle('settings.title');
  const [searchParams, setSearchParams] = useSearchParams();
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

  const showSessions = sessions.length > 0;
  const tabFromUrl = resolveTab(searchParams.get('tab'), showSessions);
  const [activeTab, setActiveTab] = useState<SettingsTabId>(tabFromUrl);

  useEffect(() => {
    setActiveTab(resolveTab(searchParams.get('tab'), showSessions));
  }, [searchParams, showSessions]);

  function selectTab(tab: SettingsTabId) {
    setActiveTab(tab);
    setSearchParams(tab === 'preferences' ? {} : { tab }, { replace: true });
  }

  const authSchemas = useMemo(() => createAuthSchemas(t), [t]);
  const { updatePreferencesSchema } = useMemo(() => createProfileSchemas(t), [t]);
  const prefsResolver = useLocalizedResolver(updatePreferencesSchema);
  const accountResolver = useLocalizedResolver(authSchemas.updateAccountSchema);
  const passwordResolver = useLocalizedResolver(authSchemas.changePasswordSchema);
  const emailResolver = useLocalizedResolver(authSchemas.changeEmailSchema);

  const prefsForm = useForm<UpdatePreferencesSchema>({
    resolver: prefsResolver,
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
    resolver: accountResolver,
    defaultValues: { full_name: '', display_name: '', phone: '' },
  });

  const passwordForm = useForm<ChangePasswordSchema>({
    resolver: passwordResolver,
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  const emailForm = useForm<ChangeEmailSchema>({
    resolver: emailResolver,
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

  return (
    <PageShell spacing={6} className="w-full max-w-3xl">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <SectionCard variant="plain" className="overflow-hidden rounded-2xl sm:rounded-3xl">
        <div className="bg-ink-5/30 px-2 pt-2 sm:px-3 sm:pt-3">
          <SettingsTabs active={activeTab} onChange={selectTab} showSessions={showSessions} />
        </div>

        <div className="p-5 sm:p-8">
          <SettingsTabPanel id="preferences" active={activeTab}>
            <div className="mb-6">
              <h2 className="text-balance text-lg font-extrabold tracking-tight text-ink">
                {t('settings.preferences')}
              </h2>
              <p className="mt-1 text-pretty text-[13px] text-ink-60">{t('settings.preferencesHint')}</p>
            </div>
            <form
              className="space-y-8"
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
              <SettingsSubsection title={t('settings.language')} description={t('settings.languageHint')}>
                <LanguageSwitcher variant="segmented" />
              </SettingsSubsection>

              <SettingsSubsection title={t('settings.theme')}>
                <div className="sm:max-w-xs">
                  <Select {...prefsForm.register('theme')} aria-invalid={Boolean(prefsForm.formState.errors.theme)}>
                    <option value="system">{t('settings.themeSystem')}</option>
                    <option value="light">{t('settings.themeLight')}</option>
                    <option value="dark">{t('settings.themeDark')}</option>
                  </Select>
                  {prefsForm.formState.errors.theme?.message ? (
                    <p className="mt-1.5 text-[12px] font-medium text-coral">
                      {prefsForm.formState.errors.theme.message}
                    </p>
                  ) : null}
                </div>
              </SettingsSubsection>

              <SettingsSubsection
                title={t('settings.notifications')}
                description={t('settings.notificationsHint')}
              >
                <div className="space-y-1 rounded-2xl border border-ink-10 bg-ink-5/30 p-1">
                  {(
                    [
                      ['email_notifications', t('settings.emailNotifications')],
                      ['push_notifications', t('settings.pushNotifications')],
                      ['sms_notifications', t('settings.smsNotifications')],
                      ['marketing_emails', t('settings.marketingEmails')],
                    ] as const
                  ).map(([name, label]) => (
                    <div
                      key={name}
                      className="rounded-xl px-3 py-2.5 transition-colors hover:bg-white/80"
                    >
                      <CheckboxField label={label} {...prefsForm.register(name)} />
                    </div>
                  ))}
                </div>
              </SettingsSubsection>

              <SettingsFormFooter label={t('settings.savePreferences')} loading={savingPrefs} />
            </form>
          </SettingsTabPanel>

          <SettingsTabPanel id="account" active={activeTab}>
            <div className="mb-6">
              <h2 className="text-balance text-lg font-extrabold tracking-tight text-ink">
                {t('settings.account')}
              </h2>
              <p className="mt-1 text-pretty text-[13px] text-ink-60">{t('settings.accountHint')}</p>
            </div>
            <form
              className="space-y-5"
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
              {me?.email ? (
                <div className="flex items-start gap-3 rounded-2xl border border-ink-10 bg-ink-5/40 px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-card-sm">
                    <Mail size={18} className="text-ink-40" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-40">
                      {t('auth.email')}
                    </p>
                    <p className="mt-1 break-all text-[14px] font-semibold text-ink" dir="ltr">
                      {me.email}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('settings.fullName')} error={accountForm.formState.errors.full_name?.message}>
                  <TextInput {...accountForm.register('full_name')} />
                </Field>
                <Field label={t('settings.displayName')} error={accountForm.formState.errors.display_name?.message}>
                  <TextInput {...accountForm.register('display_name')} />
                </Field>
              </div>
              <Field label={t('settings.phone')} error={accountForm.formState.errors.phone?.message}>
                <TextInput {...accountForm.register('phone')} dir="ltr" className="sm:max-w-xs" />
              </Field>

              <SettingsFormFooter label={t('settings.saveAccount')} loading={savingAccount} />
            </form>
          </SettingsTabPanel>

          <SettingsTabPanel id="password" active={activeTab}>
            <div className="mb-6">
              <h2 className="text-balance text-lg font-extrabold tracking-tight text-ink">
                {t('settings.changePassword')}
              </h2>
              <p className="mt-1 text-pretty text-[13px] text-ink-60">{t('settings.securityHint')}</p>
            </div>
            <form
              className="space-y-5"
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
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

              <SettingsFormFooter label={t('settings.updatePassword')} loading={savingPassword} />
            </form>
          </SettingsTabPanel>

          <SettingsTabPanel id="email" active={activeTab}>
            <div className="mb-6">
              <h2 className="text-balance text-lg font-extrabold tracking-tight text-ink">
                {t('settings.changeEmail')}
              </h2>
              <p className="mt-1 text-pretty text-[13px] text-ink-60">{t('settings.changeEmailHint')}</p>
            </div>
            <form
              className="space-y-5"
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
                  className="sm:max-w-md"
                />
              </Field>

              <SettingsFormFooter label={t('settings.updateEmail')} loading={savingEmail} />
            </form>
          </SettingsTabPanel>

          <SettingsTabPanel id="sessions" active={activeTab}>
            <div className="mb-6">
              <h2 className="text-balance text-lg font-extrabold tracking-tight text-ink">
                {t('settings.sessions')}
              </h2>
              <p className="mt-1 text-pretty text-[13px] text-ink-60">{t('settings.sessionsHint')}</p>
            </div>
            <ul className="space-y-2">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-col gap-3 rounded-2xl border border-ink-10 bg-ink-5/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-card-sm">
                      <SessionDeviceIcon label={session.device_label ?? session.user_agent ?? ''} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {session.device_label ?? session.user_agent ?? t('settings.unknownDevice')}
                      </p>
                      {session.last_active_at ? (
                        <p className="mt-0.5 tabular-nums text-[11px] text-ink-40" dir="ltr">
                          {formatDateTime(session.last_active_at, i18n.language)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {session.current ? (
                    <span className="shrink-0 self-start rounded-full bg-mint/15 px-3 py-1.5 text-[11px] font-semibold text-mint-dark sm:self-center">
                      {t('settings.currentSession')}
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-10 w-full transition-transform active:scale-[0.96] sm:w-auto"
                      onClick={() => void revokeSession({ id: session.id })}
                    >
                      {t('settings.revoke')}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </SettingsTabPanel>

          <SettingsTabPanel id="signout" active={activeTab}>
            <div className="mb-6">
              <h2 className="text-balance text-lg font-extrabold tracking-tight text-ink">
                {t('settings.signOutTitle')}
              </h2>
              <p className="mt-1 text-pretty text-[13px] text-ink-60">{t('settings.signOutHint')}</p>
            </div>
            <div className="rounded-2xl border border-coral/20 bg-coral/5 p-5 sm:p-6">
              <Button
                type="button"
                variant="danger"
                className="w-full transition-transform active:scale-[0.96] sm:w-auto"
                onClick={() => void signOut()}
              >
                <LogOut size={16} aria-hidden />
                {t('common.signOut')}
              </Button>
            </div>
          </SettingsTabPanel>
        </div>
      </SectionCard>
    </PageShell>
  );
}
