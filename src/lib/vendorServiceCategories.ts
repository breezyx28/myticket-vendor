/** Fallback list until GET /reference/vendor-service-categories ships. */
export const VENDOR_SERVICE_CATEGORIES = [
  { slug: 'catering', nameEn: 'Catering', nameAr: 'تموين الطعام', color: 'bg-amber' },
  { slug: 'venue_rental', nameEn: 'Venue Rental', nameAr: 'تأجير قاعات', color: 'bg-sky' },
  { slug: 'staging', nameEn: 'Staging & Lighting', nameAr: 'منصات وإضاءة', color: 'bg-lavender' },
  { slug: 'sound', nameEn: 'Sound Systems', nameAr: 'أنظمة صوتية', color: 'bg-indigo' },
  { slug: 'av_production', nameEn: 'AV Production', nameAr: 'إنتاج صوتي بصري', color: 'bg-mint' },
  { slug: 'decor', nameEn: 'Decor & Florals', nameAr: 'ديكور وزهور', color: 'bg-blush' },
  { slug: 'photography', nameEn: 'Photography', nameAr: 'تصوير فوتوغرافي', color: 'bg-teal' },
  { slug: 'videography', nameEn: 'Videography', nameAr: 'تصوير فيديو', color: 'bg-coral' },
  { slug: 'printing', nameEn: 'Printing & Signage', nameAr: 'طباعة ولوحات', color: 'bg-lemon' },
  { slug: 'security', nameEn: 'Security', nameAr: 'أمن', color: 'bg-coral' },
  { slug: 'transport', nameEn: 'Transport / Logistics', nameAr: 'نقل ولوجستيات', color: 'bg-sky' },
  { slug: 'hospitality', nameEn: 'Hospitality', nameAr: 'ضيافة', color: 'bg-teal' },
  { slug: 'translation', nameEn: 'Translation', nameAr: 'ترجمة', color: 'bg-lavender' },
  { slug: 'giveaways', nameEn: 'Giveaways & Merch', nameAr: 'هدايا ومنتجات ترويجية', color: 'bg-amber' },
  { slug: 'first_aid', nameEn: 'First Aid / Medical', nameAr: 'إسعافات أولية', color: 'bg-mint' },
] as const;
