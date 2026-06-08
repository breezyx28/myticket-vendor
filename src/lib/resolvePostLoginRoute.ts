import type { RoleApplicationStatus } from '@/types/domain';

export function resolvePostLoginRoute(input: {
  role: string | null;
  hasVendorApplication: boolean;
  applicationStatus: RoleApplicationStatus | null;
  hasVendorProfile: boolean;
}): string {
  const { role, hasVendorApplication, applicationStatus, hasVendorProfile } = input;

  if (role === 'talent' || role === 'organizer') return '/access-denied';
  if (hasVendorProfile || role === 'vendor') return '/';
  if (!hasVendorApplication) return '/application';
  if (applicationStatus === 'submitted') return '/application/status';
  if (applicationStatus === 'draft' || applicationStatus === 'rejected') return '/application';
  if (applicationStatus === 'approved') return '/';
  return '/application';
}
