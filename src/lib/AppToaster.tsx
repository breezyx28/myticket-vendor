import { Toaster as SonnerToaster } from 'sonner';
import { useTranslation } from 'react-i18next';

export function AppToaster() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');

  return (
    <SonnerToaster
      position={isRtl ? 'top-left' : 'top-right'}
      richColors
      closeButton
      duration={4000}
      offset={{ top: '5.5rem' }}
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border border-ink-10 shadow-card-sm font-sans',
          title: 'text-[13px] font-semibold',
          description: 'text-[12px] text-ink-60',
        },
      }}
    />
  );
}
