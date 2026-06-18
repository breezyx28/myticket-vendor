import * as yup from 'yup';
import type { TFunction } from 'i18next';

export function createGovernmentIdSchemas(t: TFunction) {
  const urlField = yup
    .string()
    .trim()
    .url(t('validation.urlInvalid'))
    .max(500)
    .required(t('validation.imageRequired'));

  const governmentIdVerificationSchema = yup
    .object({
      document_type: yup
        .string()
        .oneOf(['national_id', 'iqama', 'passport'], t('validation.documentTypeInvalid'))
        .required(t('validation.documentTypeRequired')),
      document_number: yup.string().trim().max(64).nullable().notRequired(),
      front_image_url: urlField,
      back_image_url: yup
        .string()
        .trim()
        .url(t('validation.urlInvalid'))
        .max(500)
        .nullable()
        .notRequired(),
      selfie_url: yup
        .string()
        .trim()
        .url(t('validation.urlInvalid'))
        .max(500)
        .nullable()
        .notRequired(),
      issue_date: yup.string().trim().nullable().notRequired(),
      expiry_date: yup.string().trim().nullable().notRequired(),
    })
    .strict();

  return { governmentIdVerificationSchema };
}

type GovernmentIdSchemas = ReturnType<typeof createGovernmentIdSchemas>;

export type GovernmentIdVerificationSchema = yup.InferType<
  GovernmentIdSchemas['governmentIdVerificationSchema']
>;
