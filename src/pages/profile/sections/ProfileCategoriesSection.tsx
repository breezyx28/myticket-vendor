import { SectionCard } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { VendorCategoryDropdown } from '@/components/vendor/VendorCategoryDropdown';
import { useVendorCategories } from '@/hooks/useVendorCategories';
import type { VendorProfileCategory } from '@/api/types/vendor';
import { useTranslation } from 'react-i18next';

export function ProfileCategoriesSection({
  categories,
}: {
  categories?: VendorProfileCategory[];
}) {
  const { t } = useTranslation();
  const {
    isAr,
    presets,
    loadingPresets,
    selection,
    setDraft,
    saving,
    saveCategories,
    createAndAddCategory,
    creatingCategory,
  } = useVendorCategories({ mode: 'profile', attached: categories });

  return (
    <SectionCard title={t('profile.serviceCategories')} hint={t('profile.serviceCategoriesHint')}>
      {loadingPresets ? (
        <LoadingState className="text-[12px] text-ink-40" />
      ) : (
        <VendorCategoryDropdown
          presets={presets}
          value={selection}
          onChange={setDraft}
          disabled={saving || creatingCategory}
          isAr={isAr}
          onCreateCategory={createAndAddCategory}
          creating={creatingCategory}
        />
      )}
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        loading={saving}
        disabled={creatingCategory}
        onClick={() => void saveCategories()}
      >
        {t('categories.save')}
      </Button>
    </SectionCard>
  );
}
