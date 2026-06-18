import { API_BASE_URL } from '@/api/baseApi';
import { getToken } from '@/api/authToken';
import i18n from '@/i18n';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { apiLanguageHeader } from '@/lib/locale';
import { unwrapData } from '@/api/types/common';

export interface UploadResult {
  url: string;
  contentType: string;
}

export type UploadContext =
  | 'vendor_application'
  | 'vendor_document'
  | 'vendor_profile'
  | 'vendor_profile_gallery';

interface UploadResponseBody {
  url: string;
  content_type?: string;
  size_bytes?: number;
}

/**
 * Upload via `POST /api/v1/main/uploads` (Bearer auth).
 * Returns a public URL for role-application documents/gallery endpoints.
 */
export async function uploadToCdn(
  file: File,
  context: UploadContext = 'vendor_application',
): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('context', context);

  const headers: HeadersInit = {
    Accept: 'application/json',
    'Accept-Language': apiLanguageHeader(i18n.language),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    body: form,
    headers,
  });

  if (!res.ok) {
    let message = i18n.t('upload.failed');
    try {
      const json = (await res.json()) as unknown;
      message = readApiErrorMessage({ data: json }, message);
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }

  const json = (await res.json()) as UploadResponseBody | { data: UploadResponseBody };
  const data = unwrapData(json) ?? (json as UploadResponseBody);

  if (!data?.url) {
    throw new Error(i18n.t('upload.noUrl'));
  }

  return {
    url: data.url,
    contentType: data.content_type ?? file.type,
  };
}
