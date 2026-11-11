import {
  Home,
  Wallet,
  TrendingUp,
  ShieldCheck,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

export const navigationItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    path: '/dashboard',
    icon: Home,
  },
  {
    id: 'money',
    label: 'Money',
    path: '/money',
    icon: Wallet,
  },
  {
    id: 'forecast',
    label: 'Forecast',
    path: '/forecast',
    icon: TrendingUp,
  },
  {
    id: 'check-purchase',
    label: 'Check a purchase',
    path: '/pre-transaction',
    icon: ShieldCheck,
  },
  {
    id: 'more',
    label: 'More',
    path: '/more',
    icon: MoreHorizontal,
  },
];

export const navigationGroups: NavGroup[] = [
  {
    heading: 'RUNWAY',
    items: navigationItems,
  },
];
