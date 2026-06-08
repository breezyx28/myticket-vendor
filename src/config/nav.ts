import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Eye,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Star,
  ToggleLeft,
} from 'lucide-react';

export type NavItem = { to: string; labelKey: string; icon: LucideIcon };

export const NAV_MAIN: NavItem[] = [
  { to: '/', labelKey: 'nav.home', icon: LayoutDashboard },
  { to: '/profile', labelKey: 'nav.profile', icon: Building2 },
  { to: '/engagements', labelKey: 'nav.engagements', icon: MessageSquare },
  { to: '/availability', labelKey: 'nav.availability', icon: ToggleLeft },
  { to: '/ratings', labelKey: 'nav.ratings', icon: Star },
  { to: '/preview', labelKey: 'nav.preview', icon: Eye },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];
