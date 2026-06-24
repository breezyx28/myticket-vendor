import { FileUploadButton } from '@/components/profile/FileUploadButton';
import { TextInput } from '@/components/forms/TextInput';
import { Button } from '@/components/ui/Button';
import type { VendorProfileGalleryItem } from '@/api/types/vendor';
import {
  isGalleryEditorDirty,
  moveGalleryEditorItem,
  profileGalleryToEditorItems,
  updateGalleryCaption,
  type GalleryEditorItem,
} from '@/lib/vendorGalleryEditor';
import { resolveStorageUrl } from '@/lib/mediaUrl';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, GripVertical, ImagePlus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function VendorGalleryEditor({
  items,
  uploading,
  saving,
  onUpload,
  onDelete,
  onSave,
}: {
  items: VendorProfileGalleryItem[];
  uploading?: boolean;
  saving?: boolean;
  onUpload: (file: File, caption?: string) => Promise<void>;
  onDelete: (itemId: number) => Promise<void>;
  onSave: (draft: GalleryEditorItem[]) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [newCaption, setNewCaption] = useState('');
  const [draft, setDraft] = useState<GalleryEditorItem[] | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const serverItems = useMemo(() => profileGalleryToEditorItems(items), [items]);
  const editorItems = draft ?? serverItems;
  const dirty = draft != null && isGalleryEditorDirty(serverItems, draft);
  const busy = Boolean(uploading || saving || deletingId != null);

  function resetDraft() {
    setDraft(null);
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await onDelete(id);
      resetDraft();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-ink-10 bg-gradient-to-br from-lemon/15 via-white to-coral/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
            <ImagePlus size={18} strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-[14px] font-bold text-ink">{t('portfolio.addPhoto')}</p>
              <p className="mt-0.5 text-[12px] text-ink-60">{t('portfolio.addPhotoHint')}</p>
            </div>
            <TextInput
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder={t('portfolio.captionPlaceholder')}
              disabled={busy}
              maxLength={255}
            />
            <FileUploadButton
              label={t('portfolio.choosePhoto')}
              accept="image/*"
              loading={uploading}
              disabled={busy}
              onFile={(file) =>
                void onUpload(file, newCaption.trim() || undefined).then(() => {
                  setNewCaption('');
                  resetDraft();
                })
              }
            />
          </div>
        </div>
      </div>

      {editorItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-20 bg-ink-5/40 px-4 py-8 text-center">
          <p className="text-[13px] font-medium text-ink-60">{t('portfolio.emptyGallery')}</p>
          <p className="mt-1 text-[12px] text-ink-40">{t('portfolio.emptyGalleryHint')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">
              {t('portfolio.photosCount', { count: editorItems.length })}
            </p>
            {dirty ? (
              <span className="rounded-full bg-coral/10 px-2.5 py-1 text-[11px] font-semibold text-coral">
                {t('portfolio.unsavedChanges')}
              </span>
            ) : null}
          </div>

          <ul className="space-y-3">
            {editorItems.map((item, index) => (
              <li
                key={item.id}
                className="rounded-2xl border border-ink-10 bg-white p-3 shadow-card-sm sm:p-4"
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={resolveStorageUrl(item.image_url) ?? item.image_url}
                      alt={item.caption || t('portfolio.galleryPhotoAlt', { index: index + 1 })}
                      className="h-24 w-24 rounded-2xl object-cover ring-1 ring-ink-10 sm:h-28 sm:w-28"
                    />
                    <span className="absolute -start-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1.5 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                          <GripVertical size={14} className="text-ink-40" />
                          {t('portfolio.photoLabel', { index: index + 1 })}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-ink-40" dir="ltr">
                          {item.image_url.split('/').pop()}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleDelete(item.id)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-coral/20 bg-coral/5 px-2.5 py-1.5 text-[11px] font-semibold text-coral transition-colors hover:bg-coral/10 disabled:opacity-50"
                        aria-label={t('portfolio.removePhoto')}
                      >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">{t('portfolio.removePhoto')}</span>
                      </button>
                    </div>

                    <TextInput
                      value={item.caption}
                      onChange={(e) =>
                        setDraft((current) =>
                          updateGalleryCaption(current ?? serverItems, item.id, e.target.value),
                        )
                      }
                      placeholder={t('portfolio.captionPlaceholder')}
                      disabled={busy}
                      maxLength={255}
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy || index === 0}
                        onClick={() =>
                          setDraft((current) =>
                            moveGalleryEditorItem(current ?? serverItems, item.id, 'up'),
                          )
                        }
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors',
                          index === 0
                            ? 'cursor-not-allowed border-ink-10 text-ink-40'
                            : 'border-ink-10 text-ink hover:bg-ink-5',
                        )}
                      >
                        <ArrowUp size={13} />
                        {t('portfolio.moveUp')}
                      </button>
                      <button
                        type="button"
                        disabled={busy || index === editorItems.length - 1}
                        onClick={() =>
                          setDraft((current) =>
                            moveGalleryEditorItem(current ?? serverItems, item.id, 'down'),
                          )
                        }
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors',
                          index === editorItems.length - 1
                            ? 'cursor-not-allowed border-ink-10 text-ink-40'
                            : 'border-ink-10 text-ink hover:bg-ink-5',
                        )}
                      >
                        <ArrowDown size={13} />
                        {t('portfolio.moveDown')}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dirty ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-10 bg-ink-5/50 px-4 py-3">
          <p className="flex-1 text-[12px] text-ink-60">{t('portfolio.saveGalleryHint')}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={resetDraft}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="dark"
            size="sm"
            loading={saving}
            disabled={busy}
            onClick={() =>
              void onSave(draft ?? serverItems).then(() => {
                resetDraft();
              })
            }
          >
            {t('portfolio.saveGallery')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
