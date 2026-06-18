import * as yup from 'yup';
import type { TFunction } from 'i18next';

export function createEngagementSchemas(t: TFunction) {
  const engagementMessageSchema = yup
    .object({
      body: yup
        .string()
        .trim()
        .min(1, t('validation.messageEmpty'))
        .max(4000, t('validation.messageTooLong'))
        .required(t('validation.messageRequired')),
      attachment_url: yup
        .string()
        .trim()
        .url(t('validation.attachmentUrlInvalid'))
        .notRequired(),
    })
    .strict();

  const declineEngagementSchema = yup
    .object({
      reason: yup.string().trim().max(500, t('validation.reasonTooLong')).notRequired(),
    })
    .strict();

  return { engagementMessageSchema, declineEngagementSchema };
}

type EngagementSchemas = ReturnType<typeof createEngagementSchemas>;

export type EngagementMessageSchema = yup.InferType<EngagementSchemas['engagementMessageSchema']>;
export type DeclineEngagementSchema = yup.InferType<EngagementSchemas['declineEngagementSchema']>;
