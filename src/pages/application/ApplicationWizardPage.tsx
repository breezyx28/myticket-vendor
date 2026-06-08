import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { Select } from '@/components/forms/Select';
import { TextArea } from '@/components/forms/TextArea';
import { TextInput } from '@/components/forms/TextInput';
import { ApplicationStatusBanner } from '@/components/vendor/ApplicationStatusBanner';
import {
  useAddVendorCategoryMutation,
  useAddVendorDocumentMutation,
  useAddVendorGalleryItemMutation,
  useCreateVendorApplicationMutation,
  useDeleteVendorCategoryMutation,
  useDeleteVendorDocumentMutation,
  useDeleteVendorGalleryItemMutation,
  useGetMyRoleApplicationsQuery,
  useGetRoleApplicationQuery,
  useGetSaudiRegionsQuery,
  useGetVendorServiceCategoriesQuery,
  useSubmitVendorApplicationMutation,
  useUpdateVendorApplicationMutation,
} from '@/api/endpoints';
import type { VendorServiceCategory } from '@/api/types/reference';
import {
  isVendorApplicationReady,
  VENDOR_BIO_MAX_CHARS,
} from '@/lib/onboardingValidation';
import { readApiErrorMessage, readApiFieldErrors } from '@/lib/apiErrors';
import { uploadToCdn } from '@/lib/upload';
import { vendorCategoryLabel } from '@/lib/vendorCategoryLabel';
import {
  createVendorApplicationSchema,
  vendorApplicationPatchSchema,
  type CreateVendorApplicationSchema,
  type VendorApplicationPatchSchema,
} from '@/schemas';
import type { VendorApplicationDetail } from '@/types/domain';
import { yupResolver } from '@hookform/resolvers/yup';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const STEPS = ['identity', 'services', 'verification', 'review'] as const;

export function ApplicationWizardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stepIndex = Math.min(
    Math.max(Number(searchParams.get('step') ?? 0), 0),
    STEPS.length - 1,
  );

  const { data: myApps, isLoading: loadingApps } = useGetMyRoleApplicationsQuery();
  const applicationId = myApps?.vendor?.id;
  const applicationStatus = myApps?.vendor?.status;

  const { data: detail, refetch: refetchDetail } = useGetRoleApplicationQuery(
    { role: 'vendor', id: applicationId! },
    { skip: applicationId == null },
  );

  const { data: regionsData } = useGetSaudiRegionsQuery();
  const regions = regionsData?.data ?? [];
  const { data: serviceCategories = [], isLoading: loadingCategories } =
    useGetVendorServiceCategoriesQuery();

  const [createApplication] = useCreateVendorApplicationMutation();
  const [updateApplication] = useUpdateVendorApplicationMutation();
  const [submitApplication, { isLoading: submitting }] = useSubmitVendorApplicationMutation();
  const [addDocument] = useAddVendorDocumentMutation();
  const [deleteDocument] = useDeleteVendorDocumentMutation();
  const [addGalleryItem] = useAddVendorGalleryItemMutation();
  const [deleteGalleryItem] = useDeleteVendorGalleryItemMutation();
  const [addCategory] = useAddVendorCategoryMutation();
  const [deleteCategory] = useDeleteVendorCategoryMutation();

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [uploading, setUploading] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [localAppId, setLocalAppId] = useState<string | number | null>(null);
  const [docLabel, setDocLabel] = useState('');
  const [docUrl, setDocUrl] = useState('');

  const effectiveId = applicationId ?? localAppId;

  const identityForm = useForm<CreateVendorApplicationSchema>({
    resolver: yupResolver(createVendorApplicationSchema) as never,
    defaultValues: { profile_name: '', contact_email: '', contact_phone: '', bio: '' },
  });

  const servicesForm = useForm<VendorApplicationPatchSchema>({
    resolver: yupResolver(vendorApplicationPatchSchema) as never,
    defaultValues: { business_name: '', city: undefined, coverage_area: '' },
  });

  useEffect(() => {
    const va = detail?.vendor_application;
    if (!va) return;
    identityForm.reset({
      profile_name: va.profile_name ?? va.business_name ?? '',
      contact_email: va.contact_email ?? '',
      contact_phone: va.contact_phone ?? '',
      bio: va.bio ?? '',
    });
    servicesForm.reset({
      business_name: va.business_name ?? va.profile_name ?? '',
      city: va.city != null ? Number(va.city) : undefined,
      coverage_area: va.coverage_area ?? '',
      bio: va.bio ?? '',
    });
  }, [detail, identityForm, servicesForm]);

  const selectedRegionId = useMemo(() => {
    const cityId = servicesForm.watch('city');
    if (!cityId) return undefined;
    return regions.find((r) => r.cities.some((c) => c.id === cityId))?.id;
  }, [regions, servicesForm]);

  const cities = useMemo(() => {
    const region = regions.find((r) => r.id === selectedRegionId);
    return region?.cities ?? regions.flatMap((r) => r.cities);
  }, [regions, selectedRegionId]);

  const goToStep = useCallback(
    (index: number) => {
      setSearchParams({ step: String(index) }, { replace: true });
    },
    [setSearchParams],
  );

  const persistPatch = useCallback(
    async (body: Record<string, unknown>) => {
      if (!effectiveId) return;
      setSaveState('saving');
      try {
        await updateApplication({ id: effectiveId, body }).unwrap();
        setSaveState('saved');
        void refetchDetail();
      } catch (err) {
        setSaveState('idle');
        toast.error(readApiErrorMessage(err, t('common.error')));
      }
    },
    [effectiveId, refetchDetail, t, updateApplication],
  );

  async function ensureApplication(values: CreateVendorApplicationSchema) {
    const patchBody = {
      business_name: values.profile_name,
      contact_email: values.contact_email,
      contact_phone: values.contact_phone || undefined,
      bio: values.bio || undefined,
    };

    if (effectiveId) {
      await persistPatch(patchBody);
      return effectiveId;
    }

    setSaveState('saving');
    try {
      const created = await createApplication({
        profile_name: values.profile_name,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone || undefined,
      }).unwrap();
      setLocalAppId(created.id);
      await updateApplication({ id: created.id, body: patchBody }).unwrap();
      setSaveState('saved');
      return created.id;
    } catch (err) {
      setSaveState('idle');
      toast.error(readApiErrorMessage(err, t('common.error')));
      return null;
    }
  }

  async function onIdentityNext() {
    const valid = await identityForm.trigger();
    if (!valid) return;
    const id = await ensureApplication(identityForm.getValues());
    if (id) {
      servicesForm.setValue('business_name', identityForm.getValues('profile_name'));
      servicesForm.setValue('bio', identityForm.getValues('bio') ?? '');
      goToStep(1);
    }
  }

  async function onServicesNext() {
    const valid = await servicesForm.trigger();
    if (!valid || !effectiveId) return;
    const categoryCount = detail?.vendor_application?.categories?.length ?? 0;
    if (categoryCount === 0) {
      toast.error(t('application.categoriesRequired'));
      return;
    }
    const values = servicesForm.getValues();
    await persistPatch({
      business_name: values.business_name || identityForm.getValues('profile_name'),
      bio: values.bio || identityForm.getValues('bio'),
      city: values.city,
      coverage_area: values.coverage_area,
    });
    goToStep(2);
  }

  async function toggleCategory(category: VendorServiceCategory) {
    if (!effectiveId) return;
    const applicationCategories = detail?.vendor_application?.categories ?? [];
    const existing = applicationCategories.find(
      (item) => item.slug === category.slug || item.service_category_id === category.id,
    );

    setCategorySaving(true);
    try {
      if (existing) {
        await deleteCategory({ id: effectiveId, rowId: existing.id }).unwrap();
      } else {
        await addCategory({ id: effectiveId, body: { slug: category.slug } }).unwrap();
      }
      void refetchDetail();
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    } finally {
      setCategorySaving(false);
    }
  }

  async function onDocumentUpload(file: File, kind: 'document' | 'url' = 'document') {
    if (!effectiveId) return;
    setUploading(true);
    try {
      const { url } = await uploadToCdn(file, 'vendor_document');
      await addDocument({
        id: effectiveId,
        body: {
          kind,
          value: url,
          label: docLabel || file.name,
          position: detail?.vendor_application?.documents?.length ?? 0,
        },
      }).unwrap();
      setDocLabel('');
      void refetchDetail();
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setUploading(false);
    }
  }

  async function onAddDocumentUrl() {
    if (!effectiveId || !docUrl.trim()) return;
    try {
      await addDocument({
        id: effectiveId,
        body: {
          kind: 'url',
          value: docUrl.trim(),
          label: docLabel || 'Document',
          position: detail?.vendor_application?.documents?.length ?? 0,
        },
      }).unwrap();
      setDocUrl('');
      setDocLabel('');
      void refetchDetail();
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  async function onGalleryUpload(file: File) {
    if (!effectiveId) return;
    setUploading(true);
    try {
      const { url } = await uploadToCdn(file, 'vendor_application');
      await addGalleryItem({
        id: effectiveId,
        body: {
          image_url: url,
          position: detail?.vendor_application?.gallery?.length ?? 0,
        },
      }).unwrap();
      void refetchDetail();
      toast.success(t('common.saved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit() {
    if (!effectiveId || !detail) return;
    const ready = isVendorApplicationReady(detail as VendorApplicationDetail);
    if (!ready) {
      toast.error(t('application.incomplete'));
      return;
    }
    try {
      await submitApplication({ id: effectiveId }).unwrap();
      navigate('/application/status', { replace: true });
    } catch (err) {
      const fieldErrors = readApiFieldErrors(err);
      const keys = Object.keys(fieldErrors);
      if (keys.length > 0) {
        const summary = keys.flatMap((key) => fieldErrors[key]).join(' ');
        toast.error(summary || readApiErrorMessage(err, t('common.error')));
        if (fieldErrors.bio || fieldErrors.profile_name || fieldErrors.contact_email) {
          goToStep(0);
        } else if (fieldErrors.categories) {
          goToStep(1);
        } else if (fieldErrors.documents || fieldErrors.gallery) {
          goToStep(2);
        }
        return;
      }
      toast.error(readApiErrorMessage(err, t('common.error')));
    }
  }

  if (loadingApps) {
    return <p className="text-[14px] text-ink-60">{t('common.loading')}</p>;
  }

  if (applicationStatus === 'submitted') {
    return <Navigate to="/application/status" replace />;
  }

  if (applicationStatus === 'approved') {
    return <Navigate to="/" replace />;
  }

  const documents = detail?.vendor_application?.documents ?? [];
  const gallery = detail?.vendor_application?.gallery ?? [];
  const applicationCategories = detail?.vendor_application?.categories ?? [];
  const readyForSubmit = detail ? isVendorApplicationReady(detail as VendorApplicationDetail) : false;
  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-6">
      {applicationStatus && applicationStatus !== 'draft' && applicationStatus !== 'not_started' ? (
        <ApplicationStatusBanner status={applicationStatus} />
      ) : null}

      <div className="rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm md:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-ink">
            {t(`application.step_${STEPS[stepIndex]}` as 'application.step_identity')}
          </h2>
          <span className="text-[12px] font-medium text-ink-40">
            {saveState === 'saving'
              ? t('common.saving')
              : saveState === 'saved'
                ? t('common.saved')
                : null}
          </span>
        </div>

        {stepIndex === 0 ? (
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label={t('application.businessName')} error={identityForm.formState.errors.profile_name?.message}>
              <TextInput {...identityForm.register('profile_name')} hasError={Boolean(identityForm.formState.errors.profile_name)} />
            </Field>
            <Field label={t('application.contactEmail')} error={identityForm.formState.errors.contact_email?.message}>
              <TextInput
                {...identityForm.register('contact_email')}
                type="email"
                dir="ltr"
                hasError={Boolean(identityForm.formState.errors.contact_email)}
              />
            </Field>
            <Field label={t('application.contactPhone')} error={identityForm.formState.errors.contact_phone?.message}>
              <TextInput
                {...identityForm.register('contact_phone')}
                dir="ltr"
                hasError={Boolean(identityForm.formState.errors.contact_phone)}
              />
            </Field>
            <Field label={t('application.bio')} error={identityForm.formState.errors.bio?.message}>
              <TextArea
                {...identityForm.register('bio')}
                rows={5}
                maxLength={VENDOR_BIO_MAX_CHARS}
                hasError={Boolean(identityForm.formState.errors.bio)}
              />
            </Field>
            <Button type="button" variant="dark" onClick={() => void onIdentityNext()}>
              {t('common.continue')}
            </Button>
          </form>
        ) : null}

        {stepIndex === 1 ? (
          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label={t('application.coverageArea')} error={servicesForm.formState.errors.coverage_area?.message}>
              <TextInput {...servicesForm.register('coverage_area')} hasError={Boolean(servicesForm.formState.errors.coverage_area)} />
            </Field>
            <Field label={t('application.city')}>
              <Select {...servicesForm.register('city', { valueAsNumber: true })}>
                <option value="">—</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <div>
              <p className="mb-2 text-[14px] font-semibold text-ink">{t('application.serviceCategories')}</p>
              {loadingCategories ? (
                <p className="text-[12px] text-ink-40">{t('common.loading')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {serviceCategories.map((cat) => {
                    const selected = applicationCategories.some(
                      (item) => item.slug === cat.slug || item.service_category_id === cat.id,
                    );
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        disabled={categorySaving || !effectiveId}
                        onClick={() => void toggleCategory(cat)}
                        className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${selected ? 'bg-ink text-white' : 'border border-ink-10 bg-white text-ink-60'}`}
                      >
                        {vendorCategoryLabel(cat, isAr)}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="mt-2 text-[11px] text-ink-40">{t('application.categoriesNote')}</p>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => goToStep(0)}>
                {t('common.back')}
              </Button>
              <Button type="button" variant="dark" onClick={() => void onServicesNext()}>
                {t('common.continue')}
              </Button>
            </div>
          </form>
        ) : null}

        {stepIndex === 2 ? (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-ink-10 bg-ink-5/40 p-4">
              <p className="text-[12px] font-semibold text-ink-60">{t('application.documents')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <TextInput
                  value={docLabel}
                  onChange={(e) => setDocLabel(e.target.value)}
                  placeholder={t('application.documentLabel')}
                  className="max-w-[200px]"
                />
                <TextInput
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://"
                  dir="ltr"
                  className="min-w-[200px] flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => void onAddDocumentUrl()}>
                  {t('application.addUrl')}
                </Button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink-10 bg-white px-3 py-2 text-[12px] font-semibold hover:bg-ink-5">
                  <Upload size={14} />
                  {t('application.uploadFile')}
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void onDocumentUpload(file);
                    }}
                  />
                </label>
              </div>
              <ul className="mt-4 space-y-2">
                {documents.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-ink-10 bg-white px-3 py-2 text-[12px]">
                    <span className="truncate font-medium text-ink">
                      {item.label ?? item.kind}: {item.value}
                    </span>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-coral hover:bg-coral/10"
                      onClick={() =>
                        effectiveId &&
                        void deleteDocument({ id: effectiveId, docId: item.id }).then(() => refetchDetail())
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-ink-10 bg-ink-5/40 p-4">
              <p className="text-[12px] font-semibold text-ink-60">{t('application.gallery')}</p>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink-10 bg-white px-3 py-2 text-[12px] font-semibold hover:bg-ink-5">
                <Upload size={14} />
                {t('application.uploadGallery')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void onGalleryUpload(file);
                  }}
                />
              </label>
              {uploading ? <Loader2 size={18} className="ms-2 inline animate-spin text-ink-40" /> : null}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {gallery.map((item) => (
                  <div key={item.id} className="relative">
                    <img src={item.image_url} alt={item.caption ?? ''} className="aspect-square rounded-xl object-cover" />
                    <button
                      type="button"
                      className="absolute end-1 top-1 rounded-full bg-white/90 p-1 text-coral"
                      onClick={() =>
                        effectiveId &&
                        void deleteGalleryItem({ id: effectiveId, itemId: item.id }).then(() => refetchDetail())
                      }
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => goToStep(1)}>
                {t('common.back')}
              </Button>
              <Button type="button" variant="dark" onClick={() => goToStep(3)}>
                {t('common.continue')}
              </Button>
            </div>
          </div>
        ) : null}

        {stepIndex === 3 ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-ink-10 bg-ink-5/30 p-4 text-[14px] text-ink-60">
              <p>
                <strong className="text-ink">{identityForm.getValues('profile_name')}</strong> ·{' '}
                {identityForm.getValues('contact_email')}
              </p>
              <p className="mt-2 line-clamp-3">{identityForm.getValues('bio')}</p>
              <p className="mt-2 text-[12px]">
                {applicationCategories.length} {t('application.serviceCategories')} · {documents.length}{' '}
                {t('application.documents')} · {gallery.length} {t('application.gallery')}
              </p>
            </div>
            {!readyForSubmit ? (
              <p className="rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-[13px] font-medium text-coral">
                {t('application.incomplete')}
              </p>
            ) : null}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => goToStep(2)}>
                {t('common.back')}
              </Button>
              <Button
                type="button"
                variant="dark"
                loading={submitting}
                disabled={!readyForSubmit}
                onClick={() => void onSubmit()}
              >
                {t('application.submit')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
