export const ENV = {
  apiBase: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  apiPrefix: import.meta.env.VITE_API_PREFIX ?? '/api/v1/main',
  mainWebsiteUrl: import.meta.env.VITE_MAIN_WEBSITE_URL ?? 'http://localhost:5173',
  vendorDashboardUrl: import.meta.env.VITE_VENDOR_DASHBOARD_URL ?? 'http://localhost:5176',
  uploadUrl: import.meta.env.VITE_UPLOAD_URL ?? '',
} as const;
