import * as yup from 'yup';
import { BUSINESS_NAME_MAX, COVERAGE_AREA_MAX } from '@/lib/onboardingValidation';

export const updateVendorProfileSchema = yup
  .object({
    business_name: yup.string().trim().max(BUSINESS_NAME_MAX).notRequired(),
    bio: yup.string().trim().max(2000).nullable().notRequired(),
    website_url: yup.string().trim().url().max(500).nullable().notRequired(),
    instagram_handle: yup.string().trim().max(120).nullable().notRequired(),
    coverage_area: yup.string().trim().max(COVERAGE_AREA_MAX).nullable().notRequired(),
  })
  .strict();

export type UpdateVendorProfileSchema = yup.InferType<typeof updateVendorProfileSchema>;

export const updatePreferencesSchema = yup
  .object({
    language: yup.string().oneOf(['en', 'ar']).notRequired(),
    theme: yup.string().oneOf(['system', 'light', 'dark']).notRequired(),
    email_notifications: yup.boolean().notRequired(),
    push_notifications: yup.boolean().notRequired(),
    sms_notifications: yup.boolean().notRequired(),
    marketing_emails: yup.boolean().notRequired(),
  })
  .strict();

export type UpdatePreferencesSchema = yup.InferType<typeof updatePreferencesSchema>;
