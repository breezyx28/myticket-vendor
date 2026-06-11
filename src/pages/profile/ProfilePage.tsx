import { PageHeader, PageShell, SectionCard } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { SectionSkeleton } from '@/components/ui/SectionSkeleton';
import { FileUploadButton } from '@/components/profile/FileUploadButton';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { Field } from '@/components/forms/Field';
import { TextArea } from '@/components/forms/TextArea';
import { TextInput } from '@/components/forms/TextInput';
import {
  useGetSaudiRegionsQuery,
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
} from '@/api/endpoints';
import { useMutationToast } from '@/hooks/useMutationToast';
import { useVendorProfileUploads } from '@/hooks/useVendorProfileUploads';
import { ProfileCategoriesSection } from '@/pages/profile/sections/ProfileCategoriesSection';
import { ProfilePublicLinkSection } from '@/pages/profile/sections/ProfilePublicLinkSection';
import { updateVendorProfileSchema, type UpdateVendorProfileSchema } from '@/schemas/profile';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { t } = useTranslation();
  const { data: profile, isLoading: profileLoading } = useGetVendorProfileQuery();
  const { data: regionsData } = useGetSaudiRegionsQuery();
  const [updateProfile, { isLoading }] = useUpdateVendorProfileMutation();
  const { runMutation } = useMutationToast();
  const { uploading, uploadProfileImage } = useVendorProfileUploads({
    galleryCount: profile?.gallery?.length ?? 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateVendorProfileSchema>({
    resolver: yupResolver(updateVendorProfileSchema) as never,
    defaultValues: {
      business_name: '',
      bio: '',
      website_url: '',
      instagram_handle: '',
      coverage_area: '',
    },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      business_name: profile.business_name,
      bio: profile.bio ?? '',
      website_url: profile.website_url ?? '',
      instagram_handle: profile.instagram_handle ?? '',
      coverage_area: profile.coverage_area ?? '',
    });
  }, [profile, reset]);

  const regionLabel = useMemo(() => {
    if (!profile?.region_id) return null;
    const region = regionsData?.data.find((r) => r.id === profile.region_id);
    const city = region?.cities.find((c) => c.id === profile.city_id);
    return [region?.name, city?.name].filter(Boolean).join(', ');
  }, [profile, regionsData]);

  async function onSubmit(values: UpdateVendorProfileSchema) {
    await runMutation(() =>
      updateProfile({
        business_name: values.business_name ?? undefined,
        bio: values.bio ?? null,
        website_url: values.website_url ?? null,
        instagram_handle: values.instagram_handle ?? null,
        coverage_area: values.coverage_area ?? null,
      }).unwrap(),
    );
  }

  if (profileLoading || !profile) {
    return <SectionSkeleton rows={2} />;
  }

  return (
    <PageShell>
      <PageHeader title={t('profile.title')} />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <ProfileAvatar src={profile.profile_image_url} size="lg" />
          <FileUploadButton
            label={t('portfolio.uploadImage')}
            accept="image/*"
            loading={uploading}
            onFile={(file) => void uploadProfileImage(file)}
          />
          <Link
            to="/portfolio"
            className="inline-block text-[13px] font-semibold text-coral transition-colors hover:underline"
          >
            {t('portfolio.manageGallery')}
          </Link>
        </div>

        <div className="space-y-6">
          <SectionCard title={t('profile.businessName')}>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Field label={t('profile.businessName')} error={errors.business_name?.message}>
                <TextInput {...register('business_name')} hasError={Boolean(errors.business_name)} />
              </Field>
              <Field label={t('profile.bio')} error={errors.bio?.message}>
                <TextArea {...register('bio')} rows={5} hasError={Boolean(errors.bio)} />
              </Field>
              <Field label={t('profile.website')} error={errors.website_url?.message}>
                <TextInput {...register('website_url')} dir="ltr" hasError={Boolean(errors.website_url)} />
              </Field>
              <Field label={t('profile.instagram')} error={errors.instagram_handle?.message}>
                <TextInput
                  {...register('instagram_handle')}
                  dir="ltr"
                  hasError={Boolean(errors.instagram_handle)}
                />
              </Field>
              <Field label={t('profile.coverageArea')} error={errors.coverage_area?.message}>
                <TextInput {...register('coverage_area')} hasError={Boolean(errors.coverage_area)} />
              </Field>
              <Button type="submit" variant="dark" loading={isLoading}>
                {t('profile.saveChanges')}
              </Button>
            </form>
          </SectionCard>

          <ProfilePublicLinkSection profile={profile} regionLabel={regionLabel} />
          <ProfileCategoriesSection categories={profile.categories} />
        </div>
      </div>
    </PageShell>
  );
}
