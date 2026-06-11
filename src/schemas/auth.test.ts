import { describe, expect, it } from 'vitest';
import { changeEmailSchema, changePasswordSchema } from '@/schemas/auth';

describe('changePasswordSchema', () => {
  it('requires matching confirmation', async () => {
    await expect(
      changePasswordSchema.validate({
        current_password: 'old-pass-1',
        new_password: 'new-pass-12',
        new_password_confirmation: 'different',
      }),
    ).rejects.toThrow();
  });

  it('passes with valid payload', async () => {
    const result = await changePasswordSchema.validate({
      current_password: 'old-pass-1',
      new_password: 'new-pass-12',
      new_password_confirmation: 'new-pass-12',
    });
    expect(result.new_password).toBe('new-pass-12');
  });
});

describe('changeEmailSchema', () => {
  it('requires current password', async () => {
    await expect(
      changeEmailSchema.validate({ new_email: 'vendor@example.com', current_password: '' }),
    ).rejects.toThrow();
  });
});
