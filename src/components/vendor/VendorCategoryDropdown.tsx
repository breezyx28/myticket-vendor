import { TextInput } from '@/components/forms/TextInput';
import type { VendorServiceCategory } from '@/api/types/reference';
import {
  isCategorySelected,
  removeSelectionItem,
  togglePresetSelection,
  type CategorySelectionItem,
} from '@/lib/vendorCategorySelection';
import { vendorCategoryLabel } from '@/lib/vendorCategoryLabel';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Loader2, Plus, Search, Sparkles, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function VendorCategoryDropdown({
  presets,
  value,
  onChange,
  disabled,
  isAr,
  onCreateCategory,
  creating = false,
}: {
  presets: VendorServiceCategory[];
  value: CategorySelectionItem[];
  onChange: (next: CategorySelectionItem[]) => void;
  disabled?: boolean;
  isAr: boolean;
  onCreateCategory: (nameEn: string, nameAr?: string) => Promise<boolean>;
  creating?: boolean;
}) {
  const { t } = useTranslation();
  const unavailableLabel = t('common.notAvailable');
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [customNameAr, setCustomNameAr] = useState('');
  const [showCustomFields, setShowCustomFields] = useState(false);

  const activePresets = useMemo(
    () => [...presets.filter((cat) => cat.is_active !== false)].sort((a, b) => a.display_order - b.display_order),
    [presets],
  );

  const filteredPresets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activePresets;
    return activePresets.filter((cat) => {
      const label = vendorCategoryLabel(cat, isAr, undefined, unavailableLabel).toLowerCase();
      return label.includes(q) || cat.slug.includes(q);
    });
  }, [activePresets, query, isAr, unavailableLabel]);

  const exactMatch = useMemo(() => {
    const q = query.trim();
    if (!q) return undefined;
    const lower = q.toLowerCase();
    return activePresets.find(
      (cat) =>
        cat.name_en.trim().toLowerCase() === lower ||
        cat.name_ar?.trim() === q ||
        cat.slug.replace(/_/g, ' ').toLowerCase() === lower,
    );
  }, [activePresets, query]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setShowCustomFields(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setShowCustomFields(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  async function handleCreate() {
    const nameEn = query.trim();
    if (!nameEn) {
      setShowCustomFields(true);
      return;
    }
    const ok = await onCreateCategory(nameEn, customNameAr.trim() || undefined);
    if (!ok) return;
    setQuery('');
    setCustomNameAr('');
    setShowCustomFields(false);
    setOpen(false);
  }

  const canCreateFromQuery = query.trim().length >= 2 && !exactMatch;

  return (
    <div className="space-y-4" ref={rootRef}>
      {value.length > 0 ? (
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
              <span className="truncate">{isAr && item.name_ar ? item.name_ar : item.name_en}</span>
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
      ) : (
        <p className="text-[13px] text-ink-40">{t('categories.emptySelectionHint')}</p>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-start text-[14px] font-semibold transition-colors',
            open ? 'border-coral ring-2 ring-coral/20' : 'border-ink-10 hover:border-ink-20',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <span className="text-ink-60">{t('categories.dropdownPlaceholder')}</span>
          <ChevronDown
            size={18}
            className={cn('shrink-0 text-ink-40 transition-transform', open && 'rotate-180')}
          />
        </button>

        {open ? (
          <div
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-ink-10 bg-white shadow-card-lg"
          >
            <div className="border-b border-ink-10 p-2">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-40"
                />
                <TextInput
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('categories.searchPlaceholder')}
                  className="ps-9"
                  disabled={disabled}
                  aria-label={t('categories.searchPlaceholder')}
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto p-1">
              {filteredPresets.length === 0 ? (
                <p className="px-3 py-4 text-center text-[13px] text-ink-40">{t('categories.noResults')}</p>
              ) : (
                filteredPresets.map((cat) => {
                  const selected = isCategorySelected(value, cat);
                  const label = vendorCategoryLabel(cat, isAr, undefined, unavailableLabel);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={disabled}
                      onClick={() => onChange(togglePresetSelection(value, cat))}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-start text-[13px] font-medium transition-colors',
                        selected ? 'bg-lemon/25 text-ink' : 'text-ink-60 hover:bg-ink-5 hover:text-ink',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                          selected ? 'border-ink bg-ink text-white' : 'border-ink-20 bg-white',
                        )}
                      >
                        {selected ? <Check size={12} strokeWidth={3} /> : null}
                      </span>
                      {cat.is_custom ? (
                        <Sparkles size={14} className="shrink-0 text-coral" aria-hidden />
                      ) : null}
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-ink-10 bg-ink-5/40 p-2">
              {showCustomFields && !query.trim() ? (
                <div className="space-y-2 rounded-xl border border-ink-10 bg-white p-3">
                  <TextInput
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('categories.customNameEn')}
                    disabled={disabled || creating}
                  />
                  <TextInput
                    value={customNameAr}
                    onChange={(e) => setCustomNameAr(e.target.value)}
                    placeholder={t('categories.customNameAr')}
                    disabled={disabled || creating}
                    dir="auto"
                  />
                </div>
              ) : canCreateFromQuery ? (
                <TextInput
                  value={customNameAr}
                  onChange={(e) => setCustomNameAr(e.target.value)}
                  placeholder={t('categories.customNameAr')}
                  disabled={disabled || creating}
                  dir="auto"
                  className="mb-2"
                />
              ) : null}

              <button
                type="button"
                disabled={disabled || creating || (showCustomFields && !query.trim())}
                onClick={() => void handleCreate()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-coral/50 bg-coral/5 px-3 py-2.5 text-[13px] font-semibold text-coral transition-colors hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} strokeWidth={2.5} />
                )}
                {canCreateFromQuery
                  ? t('categories.createFromSearch', { name: query.trim() })
                  : t('categories.createCustom')}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
