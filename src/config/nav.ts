import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Eye,
  Images,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Star,
  ToggleLeft,
} from 'lucide-react';

export type NavItem = { to: string; labelKey: string; icon: LucideIcon };

export type NavGroup = {
  labelKey: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'nav.group.overview',
    items: [{ to: '/', labelKey: 'nav.home', icon: LayoutDashboard }],
  },
  {
    labelKey: 'nav.group.business',
    items: [
      { to: '/profile', labelKey: 'nav.profile', icon: Building2 },
      { to: '/portfolio', labelKey: 'nav.portfolio', icon: Images },
      { to: '/preview', labelKey: 'nav.preview', icon: Eye },
    ],
  },
  {
    labelKey: 'nav.group.operations',
    items: [
      { to: '/engagements', labelKey: 'nav.engagements', icon: MessageSquare },
      { to: '/availability', labelKey: 'nav.availability', icon: ToggleLeft },
      { to: '/ratings', labelKey: 'nav.ratings', icon: Star },
    ],
  },
  {
    labelKey: 'nav.group.account',
    items: [{ to: '/settings', labelKey: 'nav.settings', icon: Settings }],
  },
];

/** Flat list for backwards compatibility */
export const NAV_MAIN: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);
