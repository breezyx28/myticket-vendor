import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/forms/TextInput';
import { StatusPill } from '@/components/vendor/StatusPill';
import { useListEngagementMessagesQuery } from '@/api/endpoints';
import type { Engagement } from '@/api/types/engagement';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { Paperclip } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function EngagementThread({
  engagement,
  message,
  setMessage,
  attachmentUrl,
  setAttachmentUrl,
  onAttachFile,
  attaching,
  declineReason,
  setDeclineReason,
  onAccept,
  onDecline,
  onSendMessage,
  onComplete,
  accepting,
  declining,
  posting,
  completing,
}: {
  engagement: Engagement;
  message: string;
  setMessage: (v: string) => void;
  attachmentUrl?: string;
  setAttachmentUrl?: (v: string) => void;
  onAttachFile?: (file: File) => void;
  attaching?: boolean;
  declineReason: string;
  setDeclineReason: (v: string) => void;
  onAccept: () => void;
  onDecline: () => void;
  onSendMessage: () => void;
  onComplete: () => void;
  accepting: boolean;
  declining: boolean;
  posting: boolean;
  completing: boolean;
}) {
  const { t, i18n } = useTranslation();
  const { data: fetchedMessages } = useListEngagementMessagesQuery(
    { id: engagement.id },
    { pollingInterval: 30_000 },
  );
  const messages = fetchedMessages ?? engagement.messages ?? [];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-ink">{engagement.topic}</h2>
          <p className="mt-1 text-[13px] text-ink-40">
            {engagement.organizer_profile_snapshot?.display_name ?? t('engagements.organizerFallback')} ·{' '}
            <span dir="ltr">{formatDateTime(engagement.created_at, i18n.language)}</span>
          </p>
        </div>
        <StatusPill
          status={engagement.status}
          label={t(`engagements.status_${engagement.status}` as 'engagements.status_pending')}
        />
      </div>

      {engagement.preview ? (
        <p className="mt-4 rounded-xl border border-ink-10 bg-ink-5/50 px-4 py-3 text-[14px] leading-relaxed text-ink-60">
          {engagement.preview}
        </p>
      ) : null}

      <div className="mt-5 rounded-xl border border-ink-10 bg-ink-5/30 p-4">
        <ul className="max-h-[280px] space-y-2 overflow-y-auto pe-1">
          {messages.length === 0 ? (
            <li className="rounded-xl border border-dashed border-ink-20 bg-white px-3 py-6 text-center text-[12px] text-ink-40">
              {t('engagements.noMessages')}
            </li>
          ) : (
            messages.map((msg) => (
              <li
                key={msg.id}
                className={cn(
                  'rounded-xl px-3 py-2 text-[12px]',
                  msg.sender === 'vendor'
                    ? 'ms-8 bg-ink text-white'
                    : 'me-8 border border-ink-10 bg-white text-ink-60',
                )}
              >
                <p>{msg.body}</p>
                {msg.attachment_url ? (
                  <a
                    href={msg.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      'mt-1 inline-block text-[11px] font-semibold underline',
                      msg.sender === 'vendor' ? 'text-white/90' : 'text-coral',
                    )}
                  >
                    {t('engagements.viewAttachment')}
                  </a>
                ) : null}
                <p
                  className={cn('mt-1 text-[10px]', msg.sender === 'vendor' ? 'text-white/70' : 'text-ink-40')}
                  dir="ltr"
                >
                  {formatDateTime(msg.created_at, i18n.language)}
                </p>
              </li>
            ))
          )}
        </ul>
        {engagement.status === 'accepted' ? (
          <div className="mt-3 space-y-2">
            {attachmentUrl ? (
              <p className="text-[11px] text-ink-40">
                {t('engagements.attachmentReady')}{' '}
                <button
                  type="button"
                  className="font-semibold text-coral"
                  onClick={() => setAttachmentUrl?.('')}
                >
                  {t('common.cancel')}
                </button>
              </p>
            ) : null}
            <div className="flex gap-2">
              <TextInput
                value={message}
                disabled={posting}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('engagements.messagePlaceholder')}
                className="flex-1"
              />
              <label
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-ink-10 bg-white px-3 text-ink-60 transition-colors hover:bg-ink-5"
                aria-label={t('accessibility.attachFile')}
              >
                <Paperclip size={16} />
                <input
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  className="hidden"
                  disabled={attaching || posting}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) onAttachFile?.(file);
                  }}
                />
              </label>
              <Button variant="dark" disabled={posting || !message.trim()} onClick={onSendMessage}>
                {posting ? t('common.saving') : t('engagements.sendMessage')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {engagement.status === 'pending' ? (
        <div className="mt-6 space-y-3">
          <TextInput
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder={t('engagements.declineReason')}
          />
          <div className="flex flex-wrap gap-3">
            <Button variant="dark" loading={accepting} disabled={declining} onClick={onAccept}>
              {t('engagements.accept')}
            </Button>
            <Button variant="outline" loading={declining} disabled={accepting} onClick={onDecline}>
              {t('engagements.decline')}
            </Button>
          </div>
        </div>
      ) : null}

      {engagement.status === 'accepted' ? (
        <Button className="mt-6" variant="primary" loading={completing} onClick={onComplete}>
          {t('engagements.complete')}
        </Button>
      ) : null}
    </>
  );
}
