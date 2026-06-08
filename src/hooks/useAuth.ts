import { VendorAuthContext } from '@/contexts/vendorAuthContext';
import { useContext } from 'react';

export function useAuth() {
  const ctx = useContext(VendorAuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
