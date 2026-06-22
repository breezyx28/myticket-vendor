import {
  useCreateVendorServiceCategoryMutation,
  useListVendorServiceCategoriesQuery,
  useSyncVendorApplicationCategoriesMutation,
  useSyncVendorProfileCategoriesMutation,
} from '@/api/endpoints';
import type { VendorApplicationCategory } from '@/api/types/roleApplication';
import type { VendorProfileCategory } from '@/api/types/vendor';
import {
  attachedCategoriesToSelection,
  findMatchingPreset,
  isCategorySelected,
  presetToSelection,
  selectionToSyncPayload,
  togglePresetSelection,
  type CategorySelectionItem,
} from '@/lib/vendorCategorySelection';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutationToast } from '@/hooks/useMutationToast';
import { toast } from 'sonner';

type AttachedCategory = VendorApplicationCategory | VendorProfileCategory;

export function useVendorCategories(input: {
  mode: 'profile' | 'application';
  applicationId?: string | number | null;
  attached?: AttachedCategory[];
}) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { showSaved, showError } = useMutationToast();
  const { data: presets = [], isLoading: loadingPresets } = useListVendorServiceCategoriesQuery();
  const [syncProfileCategories, { isLoading: savingProfile }] = useSyncVendorProfileCategoriesMutation();
  const [syncApplicationCategories, { isLoading: savingApplication }] =
    useSyncVendorApplicationCategoriesMutation();
  const [createVendorServiceCategory, { isLoading: creatingCategory }] =
    useCreateVendorServiceCategoryMutation();
  const [draft, setDraft] = useState<CategorySelectionItem[] | null>(null);

  const serverSelection = useMemo(
    () => attachedCategoriesToSelection(input.attached),
    [input.attached],
  );
  const selection = draft ?? serverSelection;
  const saving = input.mode === 'profile' ? savingProfile : savingApplication;

  const saveCategories = useCallback(async () => {
    if (selection.length === 0) {
      toast.error(t('application.categoriesRequired'));
      return false;
    }
    try {
      if (input.mode === 'profile') {
        await syncProfileCategories(selectionToSyncPayload(selection)).unwrap();
      } else if (input.applicationId) {
        await syncApplicationCategories({
          id: input.applicationId,
          body: selectionToSyncPayload(selection),
        }).unwrap();
      }
      setDraft(null);
      showSaved();
      return true;
    } catch (err) {
      showError(err);
      return false;
    }
  }, [
    input.applicationId,
    input.mode,
    selection,
    showError,
    showSaved,
    syncApplicationCategories,
    syncProfileCategories,
    t,
  ]);

  const persistCategories = useCallback(
    async (items: CategorySelectionItem[]) => {
      if (items.length === 0 || !input.applicationId || input.mode !== 'application') return;
      try {
        await syncApplicationCategories({
          id: input.applicationId,
          body: selectionToSyncPayload(items),
        }).unwrap();
      } catch (err) {
        showError(err);
      }
    },
    [input.applicationId, input.mode, showError, syncApplicationCategories],
  );

  const createAndAddCategory = useCallback(
    async (nameEn: string, nameAr?: string): Promise<boolean> => {
      const trimmed = nameEn.trim();
      if (!trimmed) return false;

      const current = draft ?? serverSelection;
      const match = findMatchingPreset(trimmed, presets);
      if (match) {
        if (!isCategorySelected(current, match)) {
          setDraft(togglePresetSelection(current, match));
        }
        return true;
      }

      try {
        const created = await createVendorServiceCategory({
          name_en: trimmed,
          ...(nameAr?.trim() ? { name_ar: nameAr.trim() } : {}),
        }).unwrap();
        const next = isCategorySelected(current, created)
          ? current
          : [...current, presetToSelection(created)];
        setDraft(next);
        return true;
      } catch (err) {
        showError(err);
        return false;
      }
    },
    [createVendorServiceCategory, draft, presets, serverSelection, showError],
  );

  return {
    isAr,
    presets,
    loadingPresets,
    selection,
    setDraft,
    saving,
    saveCategories,
    persistCategories,
    createAndAddCategory,
    creatingCategory,
    resetDraft: () => setDraft(null),
  };
}
