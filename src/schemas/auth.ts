import * as yup from 'yup';

export const loginSchema = yup
  .object({
    email: yup
      .string()
      .trim()
      .email('Enter a valid email.')
      .required('Email is required.'),
    password: yup.string().required('Password is required.'),
  })
  .strict();

export type LoginSchema = yup.InferType<typeof loginSchema>;

export const forgotPasswordSchema = yup
  .object({
    email: yup
      .string()
      .trim()
      .email('Enter a valid email.')
      .required('Email is required.'),
  })
  .strict();

export type ForgotPasswordSchema = yup.InferType<typeof forgotPasswordSchema>;

export const resetPasswordSchema = yup
  .object({
    token: yup.string().trim().required('Reset token is required.'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password is too long.')
      .required('Password is required.'),
    password_confirmation: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match.')
      .required('Confirm your new password.'),
  })
  .strict();

export type ResetPasswordSchema = yup.InferType<typeof resetPasswordSchema>;

const password = yup
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password is too long.')
  .required('Password is required.');

export const changePasswordSchema = yup
  .object({
    current_password: yup
      .string()
      .min(1, 'Enter your current password.')
      .required('Enter your current password.'),
    new_password: password,
    new_password_confirmation: yup
      .string()
      .oneOf([yup.ref('new_password')], 'Passwords must match.')
      .required('Confirm your new password.'),
  })
  .strict();

export type ChangePasswordSchema = yup.InferType<typeof changePasswordSchema>;

export const changeEmailSchema = yup
  .object({
    new_email: yup
      .string()
      .trim()
      .email('Enter a valid email address.')
      .required('New email is required.'),
    current_password: yup
      .string()
      .min(1, 'Enter your current password.')
      .required('Enter your current password.'),
  })
  .strict();

export type ChangeEmailSchema = yup.InferType<typeof changeEmailSchema>;

export const updateAccountSchema = yup
  .object({
    full_name: yup.string().trim().min(2).max(120).notRequired(),
    display_name: yup.string().trim().max(120).nullable().notRequired(),
    phone: yup.string().trim().max(20).nullable().notRequired(),
  })
  .strict();

export type UpdateAccountSchema = yup.InferType<typeof updateAccountSchema>;
