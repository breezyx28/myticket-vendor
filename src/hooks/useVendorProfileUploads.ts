import {
  useAddVendorProfileGalleryItemMutation,
  useDeleteVendorProfileGalleryItemMutation,
  useSyncVendorProfileGalleryMutation,
  useUpdateVendorProfileMutation,
  useUploadVendorProfileGalleryFileMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { editorItemsToSyncPayload, type GalleryEditorItem } from '@/lib/vendorGalleryEditor';
import { uploadToCdn } from '@/lib/upload';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function useVendorProfileUploads(input: { galleryCount?: number }) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [updateProfile] = useUpdateVendorProfileMutation();
  const [uploadGalleryFile] = useUploadVendorProfileGalleryFileMutation();
  const [addGalleryItem] = useAddVendorProfileGalleryItemMutation();
  const [deleteGalleryItem] = useDeleteVendorProfileGalleryItemMutation();
  const [syncGallery, { isLoading: savingGallery }] = useSyncVendorProfileGalleryMutation();

  const uploadProfileImage = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const { url } = await uploadToCdn(file, 'vendor_profile');
        await updateProfile({ profile_image: url }).unwrap();
        toast.success(t('common.saved'));
      } catch (err) {
        toast.error(readApiErrorMessage(err, t('portfolio.imageUpdateFailed')));
      } finally {
        setUploading(false);
      }
    },
    [t, updateProfile],
  );

  const uploadGalleryImage = useCallback(
    async (file: File, caption?: string) => {
      setUploading(true);
      try {
        await uploadGalleryFile({ file, caption }).unwrap();
        toast.success(t('common.saved'));
      } catch (directErr) {
        try {
          const { url } = await uploadToCdn(file, 'vendor_profile_gallery');
          await addGalleryItem({
            image_url: url,
            caption: caption?.trim() || undefined,
            position: input.galleryCount ?? 0,
          }).unwrap();
          toast.success(t('common.saved'));
        } catch (fallbackErr) {
          toast.error(
            readApiErrorMessage(fallbackErr ?? directErr, t('portfolio.galleryUpdateFailed')),
          );
        }
      } finally {
        setUploading(false);
      }
    },
    [addGalleryItem, input.galleryCount, t, uploadGalleryFile],
  );

  const removeGalleryImage = useCallback(
    async (itemId: string | number) => {
      try {
        await deleteGalleryItem({ itemId }).unwrap();
        toast.success(t('common.saved'));
      } catch (err) {
        toast.error(readApiErrorMessage(err, t('common.error')));
      }
    },
    [deleteGalleryItem, t],
  );

  const saveGalleryLayout = useCallback(
    async (items: GalleryEditorItem[]) => {
      if (items.length === 0) return;
      try {
        await syncGallery(editorItemsToSyncPayload(items)).unwrap();
        toast.success(t('portfolio.gallerySaved'));
      } catch (err) {
        toast.error(readApiErrorMessage(err, t('portfolio.galleryUpdateFailed')));
        throw err;
      }
    },
    [syncGallery, t],
  );

  return {
    uploading,
    savingGallery,
    uploadProfileImage,
    uploadGalleryImage,
    removeGalleryImage,
    saveGalleryLayout,
  };
}
