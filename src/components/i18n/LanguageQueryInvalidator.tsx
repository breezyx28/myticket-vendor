import { baseApi } from '@/api/baseApi';
import i18n from '@/i18n';
import { useAppDispatch } from '@/store/hooks';
import { useEffect } from 'react';

export function LanguageQueryInvalidator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onLanguageChanged = () => {
      dispatch(
        baseApi.util.invalidateTags([
          'Me',
          'VendorProfile',
          'SaudiRegion',
          'VendorServiceCategory',
          'Preferences',
          'Notification',
        ]),
      );
    };

    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, [dispatch]);

  return null;
}
