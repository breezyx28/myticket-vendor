import {
  useAcceptEngagementMutation,
  useCompleteEngagementMutation,
  useDeclineEngagementMutation,
  usePostEngagementMessageMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { uploadToCdn } from '@/lib/upload';
import { declineEngagementSchema, engagementMessageSchema } from '@/schemas/engagement';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useEngagementActions() {
  const { t } = useTranslation();
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attaching, setAttaching] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const [acceptEngagement, { isLoading: accepting }] = useAcceptEngagementMutation();
  const [declineEngagement, { isLoading: declining }] = useDeclineEngagementMutation();
  const [postMessage, { isLoading: posting }] = usePostEngagementMessageMutation();
  const [completeEngagement, { isLoading: completing }] = useCompleteEngagementMutation();

  const onAccept = useCallback(
    async (id: string | number) => {
      setActionError(null);
      try {
        await acceptEngagement({ id }).unwrap();
      } catch (err) {
        setActionError(readApiErrorMessage(err, t('common.error')));
      }
    },
    [acceptEngagement, t],
  );

  const onDecline = useCallback(
    async (id: string | number) => {
      setActionError(null);
      try {
        const validated = await declineEngagementSchema.validate({
          reason: declineReason.trim() || undefined,
        });
        await declineEngagement({
          id,
          body: { reason: validated.reason ?? undefined },
        }).unwrap();
        setDeclineReason('');
      } catch (err) {
        setActionError(readApiErrorMessage(err, t('common.error')));
      }
    },
    [declineEngagement, declineReason, t],
  );

  const onAttachFile = useCallback(
    async (file: File) => {
      setAttaching(true);
      setActionError(null);
      try {
        const { url } = await uploadToCdn(file, 'vendor_document');
        setAttachmentUrl(url);
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : readApiErrorMessage(err, t('common.error')),
        );
      } finally {
        setAttaching(false);
      }
    },
    [t],
  );

  const onSendMessage = useCallback(
    async (engagementId: string | number) => {
      setActionError(null);
      try {
        const validated = await engagementMessageSchema.validate({
          body: message,
          attachment_url: attachmentUrl || undefined,
        });
        await postMessage({
          id: engagementId,
          body: { body: validated.body, attachment_url: validated.attachment_url ?? undefined },
        }).unwrap();
        setMessage('');
        setAttachmentUrl('');
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : readApiErrorMessage(err, t('common.error')),
        );
      }
    },
    [attachmentUrl, message, postMessage, t],
  );

  const onComplete = useCallback(
    async (id: string | number) => {
      setActionError(null);
      try {
        await completeEngagement({ id }).unwrap();
      } catch (err) {
        setActionError(readApiErrorMessage(err, t('common.error')));
      }
    },
    [completeEngagement, t],
  );

  return {
    actionError,
    setActionError,
    message,
    setMessage,
    attachmentUrl,
    setAttachmentUrl,
    attaching,
    declineReason,
    setDeclineReason,
    accepting,
    declining,
    posting,
    completing,
    onAccept,
    onDecline,
    onAttachFile,
    onSendMessage,
    onComplete,
  };
}
