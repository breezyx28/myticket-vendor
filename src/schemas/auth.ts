import * as yup from 'yup';
import type { TFunction } from 'i18next';

export function createAuthSchemas(t: TFunction) {
  const password = yup
    .string()
    .min(8, t('validation.passwordMin'))
    .max(128, t('validation.passwordMax'))
    .required(t('validation.passwordRequired'));

  const loginSchema = yup
    .object({
      email: yup
        .string()
        .trim()
        .email(t('validation.email'))
        .required(t('validation.emailRequired')),
      password: yup.string().required(t('validation.passwordRequired')),
    })
    .strict();

  const forgotPasswordSchema = yup
    .object({
      email: yup
        .string()
        .trim()
        .email(t('validation.email'))
        .required(t('validation.emailRequired')),
    })
    .strict();

  const resetPasswordSchema = yup
    .object({
      token: yup.string().trim().required(t('validation.resetTokenRequired')),
      password: password,
      password_confirmation: yup
        .string()
        .oneOf([yup.ref('password')], t('validation.passwordMatch'))
        .required(t('validation.confirmPassword')),
    })
    .strict();

  const otpVerificationSchema = yup
    .object({
      otp: yup.string().trim().required(t('validation.verificationCodeRequired')),
    })
    .strict();

  const changePasswordSchema = yup
    .object({
      current_password: yup
        .string()
        .min(1, t('validation.currentPassword'))
        .required(t('validation.currentPassword')),
      new_password: password,
      new_password_confirmation: yup
        .string()
        .oneOf([yup.ref('new_password')], t('validation.passwordMatch'))
        .required(t('validation.confirmPassword')),
    })
    .strict();

  const changeEmailSchema = yup
    .object({
      new_email: yup
        .string()
        .trim()
        .email(t('validation.email'))
        .required(t('validation.newEmailRequired')),
      current_password: yup
        .string()
        .min(1, t('validation.currentPassword'))
        .required(t('validation.currentPassword')),
    })
    .strict();

  const updateAccountSchema = yup
    .object({
      full_name: yup
        .string()
        .trim()
        .min(2, t('validation.fullNameMin'))
        .max(120)
        .notRequired(),
      display_name: yup.string().trim().max(120).nullable().notRequired(),
      phone: yup.string().trim().max(20).nullable().notRequired(),
    })
    .strict();

  return {
    loginSchema,
    otpVerificationSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    changeEmailSchema,
    updateAccountSchema,
  };
}

type AuthSchemas = ReturnType<typeof createAuthSchemas>;

export type LoginSchema = yup.InferType<AuthSchemas['loginSchema']>;
export type OtpVerificationSchema = yup.InferType<AuthSchemas['otpVerificationSchema']>;
export type ForgotPasswordSchema = yup.InferType<AuthSchemas['forgotPasswordSchema']>;
export type ResetPasswordSchema = yup.InferType<AuthSchemas['resetPasswordSchema']>;
export type ChangePasswordSchema = yup.InferType<AuthSchemas['changePasswordSchema']>;
export type ChangeEmailSchema = yup.InferType<AuthSchemas['changeEmailSchema']>;
export type UpdateAccountSchema = yup.InferType<AuthSchemas['updateAccountSchema']>;
