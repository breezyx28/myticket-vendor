import { SectionCard } from '@/components/layout';
import { FileUploadButton } from '@/components/profile/FileUploadButton';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { VendorGalleryEditor } from '@/components/vendor/VendorGalleryEditor';
import { useVendorProfileUploads } from '@/hooks/useVendorProfileUploads';
import type { Vendor } from '@/api/types/vendor';
import { useTranslation } from 'react-i18next';

export function VendorPortfolioSection({ profile }: { profile: Vendor }) {
  const { t } = useTranslation();
  const gallery = profile.gallery ?? [];
  const {
    uploading,
    savingGallery,
    uploadProfileImage,
    uploadGalleryImage,
    removeGalleryImage,
    saveGalleryLayout,
  } = useVendorProfileUploads({ galleryCount: gallery.length });

  return (
    <div className="space-y-6">
      <SectionCard title={t('portfolio.profileImage')} hint={t('portfolio.profileImageHint')}>
        <div className="flex flex-wrap items-center gap-4">
          <ProfileAvatar src={profile.profile_image_url} size="md" />
          <FileUploadButton
            label={t('portfolio.uploadImage')}
            accept="image/*"
            loading={uploading}
            onFile={(file) => void uploadProfileImage(file)}
          />
        </div>
      </SectionCard>

      <SectionCard title={t('portfolio.galleryTitle')} hint={t('portfolio.galleryManageHint')}>
        <VendorGalleryEditor
          items={gallery}
          uploading={uploading}
          saving={savingGallery}
          onUpload={uploadGalleryImage}
          onDelete={removeGalleryImage}
          onSave={saveGalleryLayout}
        />
      </SectionCard>
    </div>
  );
}
