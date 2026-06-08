import * as yup from 'yup';
import {
  BUSINESS_NAME_MAX,
  CONTACT_PHONE_MAX,
  COVERAGE_AREA_MAX,
  MEDIA_URL_MAX,
  VENDOR_BIO_MAX_CHARS,
  VENDOR_BIO_MIN_CHARS,
} from '@/lib/onboardingValidation';

export const createVendorApplicationSchema = yup
  .object({
    profile_name: yup
      .string()
      .trim()
      .min(2, 'Business name is required.')
      .max(BUSINESS_NAME_MAX, `Maximum ${BUSINESS_NAME_MAX} characters.`)
      .required('Business name is required.'),
    contact_email: yup
      .string()
      .trim()
      .email('Enter a valid email.')
      .required('Contact email is required.'),
    contact_phone: yup
      .string()
      .trim()
      .max(CONTACT_PHONE_MAX)
      .matches(/^\+?[0-9 ()-]{0,20}$/, 'Enter a valid phone number.')
      .notRequired(),
    bio: yup
      .string()
      .trim()
      .min(VENDOR_BIO_MIN_CHARS, `Bio must be at least ${VENDOR_BIO_MIN_CHARS} characters.`)
      .max(VENDOR_BIO_MAX_CHARS)
      .notRequired(),
  })
  .strict();

export type CreateVendorApplicationSchema = yup.InferType<typeof createVendorApplicationSchema>;

export const vendorApplicationPatchSchema = yup
  .object({
    business_name: yup.string().trim().max(BUSINESS_NAME_MAX).notRequired(),
    contact_email: yup.string().trim().email().notRequired(),
    contact_phone: yup.string().trim().max(CONTACT_PHONE_MAX).notRequired(),
    bio: yup
      .string()
      .trim()
      .min(VENDOR_BIO_MIN_CHARS, `Bio must be at least ${VENDOR_BIO_MIN_CHARS} characters.`)
      .max(VENDOR_BIO_MAX_CHARS)
      .notRequired(),
    city: yup.number().integer().positive().notRequired(),
    coverage_area: yup.string().trim().max(COVERAGE_AREA_MAX).notRequired(),
    internal_note: yup.string().trim().notRequired(),
  })
  .strict()
  .noUnknown(true, 'Use business_name on PATCH, not profile_name.');

export type VendorApplicationPatchSchema = yup.InferType<typeof vendorApplicationPatchSchema>;

export const vendorDocumentSchema = yup
  .object({
    kind: yup
      .string()
      .oneOf(['url', 'document'], 'Kind must be url or document.')
      .required('Document kind is required.'),
    value: yup
      .string()
      .trim()
      .max(MEDIA_URL_MAX)
      .url('Must be a valid URL.')
      .required('URL is required.'),
    label: yup.string().trim().max(255).notRequired(),
    position: yup.number().integer().min(0).notRequired(),
  })
  .strict();

export type VendorDocumentSchema = yup.InferType<typeof vendorDocumentSchema>;

export const vendorGalleryItemSchema = yup
  .object({
    image_url: yup
      .string()
      .trim()
      .max(MEDIA_URL_MAX)
      .url('Must be a valid URL.')
      .required('Image URL is required.'),
    caption: yup.string().trim().max(255).notRequired(),
    position: yup.number().integer().min(0).notRequired(),
  })
  .strict();

export type VendorGalleryItemSchema = yup.InferType<typeof vendorGalleryItemSchema>;
