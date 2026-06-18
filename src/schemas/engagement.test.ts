import { describe, expect, it } from 'vitest';
import { createEngagementSchemas } from '@/schemas/engagement';
import { testT } from '@/schemas/testI18n';

const { declineEngagementSchema, engagementMessageSchema } = createEngagementSchemas(testT);

describe('engagementMessageSchema', () => {
  it('accepts a non-empty message', async () => {
    await expect(engagementMessageSchema.validate({ body: 'Hello' })).resolves.toMatchObject({
      body: 'Hello',
    });
  });

  it('rejects empty messages', async () => {
    await expect(engagementMessageSchema.validate({ body: '' })).rejects.toThrow();
  });

  it('rejects invalid attachment URLs', async () => {
    await expect(
      engagementMessageSchema.validate({ body: 'Hi', attachment_url: 'not-a-url' }),
    ).rejects.toThrow();
  });
});

describe('declineEngagementSchema', () => {
  it('allows optional decline reason', async () => {
    await expect(declineEngagementSchema.validate({})).resolves.toEqual({});
  });

  it('rejects overly long reasons', async () => {
    await expect(
      declineEngagementSchema.validate({ reason: 'x'.repeat(501) }),
    ).rejects.toThrow();
  });
});
