import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useDocumentTitle(titleKey: string) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const page = t(titleKey);
    document.title = t('meta.pageTitle', { page });
  }, [t, titleKey, i18n.language]);
}
