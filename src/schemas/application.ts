import * as yup from 'yup';
import type { TFunction } from 'i18next';
import {
  BUSINESS_NAME_MAX,
  CONTACT_PHONE_MAX,
  COVERAGE_AREA_MAX,
  MEDIA_URL_MAX,
  VENDOR_BIO_MAX_CHARS,
  VENDOR_BIO_MIN_CHARS,
} from '@/lib/onboardingValidation';

export function createApplicationSchemas(t: TFunction) {
  const createVendorApplicationSchema = yup
    .object({
      profile_name: yup
        .string()
        .trim()
        .min(2, t('validation.businessNameRequired'))
        .max(BUSINESS_NAME_MAX, t('validation.businessNameMax', { max: BUSINESS_NAME_MAX }))
        .required(t('validation.businessNameRequired')),
      contact_email: yup
        .string()
        .trim()
        .email(t('validation.email'))
        .required(t('validation.contactEmailRequired')),
      contact_phone: yup
        .string()
        .trim()
        .max(CONTACT_PHONE_MAX)
        .matches(/^\+?[0-9 ()-]{0,20}$/, t('validation.phoneInvalid'))
        .notRequired(),
      bio: yup
        .string()
        .trim()
        .min(VENDOR_BIO_MIN_CHARS, t('validation.bioMin', { min: VENDOR_BIO_MIN_CHARS }))
        .max(VENDOR_BIO_MAX_CHARS)
        .notRequired(),
    })
    .strict();

  const vendorApplicationPatchSchema = yup
    .object({
      business_name: yup.string().trim().max(BUSINESS_NAME_MAX).notRequired(),
      contact_email: yup.string().trim().email(t('validation.email')).notRequired(),
      contact_phone: yup.string().trim().max(CONTACT_PHONE_MAX).notRequired(),
      bio: yup
        .string()
        .trim()
        .min(VENDOR_BIO_MIN_CHARS, t('validation.bioMin', { min: VENDOR_BIO_MIN_CHARS }))
        .max(VENDOR_BIO_MAX_CHARS)
        .notRequired(),
      city: yup.number().integer().positive().notRequired(),
      coverage_area: yup.string().trim().max(COVERAGE_AREA_MAX).notRequired(),
      internal_note: yup.string().trim().notRequired(),
    })
    .strict()
    .noUnknown(true, t('validation.patchProfileName'));

  const vendorDocumentSchema = yup
    .object({
      kind: yup
        .string()
        .oneOf(['url', 'document'], t('validation.documentKindInvalid'))
        .required(t('validation.documentKindRequired')),
      value: yup
        .string()
        .trim()
        .max(MEDIA_URL_MAX)
        .url(t('validation.urlInvalid'))
        .required(t('validation.urlRequired')),
      label: yup.string().trim().max(255).notRequired(),
      position: yup.number().integer().min(0).notRequired(),
    })
    .strict();

  const vendorGalleryItemSchema = yup
    .object({
      image_url: yup
        .string()
        .trim()
        .max(MEDIA_URL_MAX)
        .url(t('validation.urlInvalid'))
        .required(t('validation.imageUrlRequired')),
      caption: yup.string().trim().max(255).notRequired(),
      position: yup.number().integer().min(0).notRequired(),
    })
    .strict();

  return {
    createVendorApplicationSchema,
    vendorApplicationPatchSchema,
    vendorDocumentSchema,
    vendorGalleryItemSchema,
  };
}

type ApplicationSchemas = ReturnType<typeof createApplicationSchemas>;

export type CreateVendorApplicationSchema = yup.InferType<
  ApplicationSchemas['createVendorApplicationSchema']
>;
export type VendorApplicationPatchSchema = yup.InferType<
  ApplicationSchemas['vendorApplicationPatchSchema']
>;
export type VendorDocumentSchema = yup.InferType<ApplicationSchemas['vendorDocumentSchema']>;
export type VendorGalleryItemSchema = yup.InferType<ApplicationSchemas['vendorGalleryItemSchema']>;
