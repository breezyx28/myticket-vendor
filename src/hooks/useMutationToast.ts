import { readApiErrorMessage } from '@/lib/apiErrors';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function useMutationToast() {
  const { t } = useTranslation();

  const showSaved = useCallback(() => {
    toast.success(t('common.saved'));
  }, [t]);

  const showError = useCallback(
    (err: unknown, fallbackKey = 'common.error') => {
      toast.error(readApiErrorMessage(err, t(fallbackKey)));
    },
    [t],
  );

  const runMutation = useCallback(
    async <T>(fn: () => Promise<T>, options?: { fallbackKey?: string; onSuccess?: (result: T) => void }) => {
      try {
        const result = await fn();
        showSaved();
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        showError(err, options?.fallbackKey);
        throw err;
      }
    },
    [showError, showSaved],
  );

  return { showSaved, showError, runMutation };
}
