import { TextInput } from '@/components/forms/TextInput';
import type { VendorServiceCategory } from '@/api/types/reference';
import {
  addCustomToSelection,
  isCategorySelected,
  removeSelectionItem,
  togglePresetSelection,
  type CategorySelectionItem,
} from '@/lib/vendorCategorySelection';
import { vendorCategoryLabel } from '@/lib/vendorCategoryLabel';
import { cn } from '@/lib/utils';
import { Check, Plus, Search, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function VendorCategoryPicker({
  presets,
  value,
  onChange,
  disabled,
  isAr,
}: {
  presets: VendorServiceCategory[];
  value: CategorySelectionItem[];
  onChange: (next: CategorySelectionItem[]) => void;
  disabled?: boolean;
  isAr: boolean;
}) {
  const { t } = useTranslation();
  const unavailableLabel = t('common.notAvailable');
  const [query, setQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customNameAr, setCustomNameAr] = useState('');

  const filteredPresets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter((cat) => {
      const label = vendorCategoryLabel(cat, isAr, undefined, unavailableLabel).toLowerCase();
      return label.includes(q) || cat.slug.includes(q);
    });
  }, [presets, query, isAr, unavailableLabel]);

  const systemPresets = useMemo(
    () => filteredPresets.filter((cat) => !cat.is_custom),
    [filteredPresets],
  );
  const customPresets = useMemo(
    () => filteredPresets.filter((cat) => cat.is_custom),
    [filteredPresets],
  );

  function handleAddCustom() {
    const trimmed = customName.trim();
    if (!trimmed) return;
    onChange(
      addCustomToSelection(value, trimmed, customNameAr.trim() || undefined, presets),
    );
    setCustomName('');
    setCustomNameAr('');
  }

  return (
    <div className="space-y-4">
      {value.length > 0 ? (
        <div className="rounded-2xl border border-ink-10 bg-gradient-to-br from-lemon/20 via-white to-coral/5 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">
              {t('categories.selected', { count: value.length })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {value.map((item) => (
              <span
                key={item.key}
                className={cn(
                  'inline-flex max-w-full items-center gap-1.5 rounded-full py-1.5 ps-3 pe-1.5 text-[12px] font-semibold shadow-sm',
                  item.is_custom
                    ? 'border border-dashed border-coral/50 bg-coral/10 text-ink'
                    : 'bg-ink text-white',
                )}
              >
                {item.is_custom ? <Sparkles size={12} className="shrink-0 text-coral" /> : null}
                <span className="truncate">
                  {isAr && item.name_ar ? item.name_ar : item.name_en}
                </span>
                {item.is_custom ? (
                  <span className="rounded-full bg-coral/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-coral">
                    {t('categories.customBadge')}
                  </span>
                ) : null}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(removeSelectionItem(value, item.key))}
                  className={cn(
                    'rounded-full p-1 transition-colors',
                    item.is_custom ? 'hover:bg-coral/20' : 'hover:bg-white/20',
                  )}
                  aria-label={t('categories.remove')}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink-20 bg-ink-5/40 px-4 py-6 text-center">
          <p className="text-[13px] font-medium text-ink-60">{t('categories.emptySelection')}</p>
          <p className="mt-1 text-[12px] text-ink-40">{t('categories.emptySelectionHint')}</p>
        </div>
      )}

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-40"
        />
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('categories.searchPlaceholder')}
          className="ps-9"
          disabled={disabled}
        />
      </div>

      {systemPresets.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-40">
            {t('categories.presetBadges')}
          </p>
          <div className="flex flex-wrap gap-2">
            {systemPresets.map((cat) => {
              const selected = isCategorySelected(value, cat);
              return (
                <button
                  key={cat.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(togglePresetSelection(value, cat))}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition-all',
                    selected
                      ? 'bg-ink text-white shadow-card-sm ring-2 ring-ink/20'
                      : 'border border-ink-10 bg-white text-ink-60 hover:border-ink-20 hover:bg-ink-5 hover:text-ink',
                  )}
                >
                  {selected ? <Check size={14} strokeWidth={2.5} /> : null}
                  {vendorCategoryLabel(cat, isAr, undefined, unavailableLabel)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {customPresets.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-40">
            {t('categories.communityBadges')}
          </p>
          <div className="flex flex-wrap gap-2">
            {customPresets.map((cat) => {
              const selected = isCategorySelected(value, cat);
              return (
                <button
                  key={cat.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(togglePresetSelection(value, cat))}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition-all',
                    selected
                      ? 'border-2 border-coral bg-coral/15 text-ink shadow-sm'
                      : 'border border-dashed border-coral/40 bg-white text-ink-60 hover:bg-coral/5',
                  )}
                >
                  <Sparkles size={12} className={selected ? 'text-coral' : 'text-ink-40'} />
                  {vendorCategoryLabel(cat, isAr, undefined, unavailableLabel)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-ink-10 bg-white p-4 shadow-card-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral">
            <Plus size={18} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-[14px] font-bold text-ink">{t('categories.createCustom')}</p>
              <p className="mt-0.5 text-[12px] text-ink-60">{t('categories.createCustomHint')}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <TextInput
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t('categories.customNameEn')}
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
              />
              <TextInput
                value={customNameAr}
                onChange={(e) => setCustomNameAr(e.target.value)}
                placeholder={t('categories.customNameAr')}
                disabled={disabled}
                dir="auto"
              />
            </div>
            <button
              type="button"
              disabled={disabled || !customName.trim()}
              onClick={handleAddCustom}
              className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-[12px] font-semibold text-ink transition-colors hover:bg-ink-5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={14} className="text-coral" />
              {t('categories.addCustom')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
