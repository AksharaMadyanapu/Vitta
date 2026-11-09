import {
  Home,
  FileText,
  Users,
  Truck,
  Building,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Clock,
  BarChart2,
  Settings,
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

export const navigationGroups: NavGroup[] = [
  {
    heading: 'HOME',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        path: '/dashboard',
        icon: Home,
      },
    ],
  },
  {
    heading: 'MONEY',
    items: [
      {
        id: 'invoices',
        label: 'Invoices',
        path: '/invoices',
        icon: FileText,
      },
      {
        id: 'customers',
        label: 'Customers',
        path: '/customers',
        icon: Users,
      },
      {
        id: 'suppliers',
        label: 'Suppliers',
        path: '/suppliers',
        icon: Truck,
      },
      {
        id: 'banking',
        label: 'Bank and transactions',
        path: '/banking',
        icon: Building,
      },
    ],
  },
  {
    heading: 'PLANNING',
    items: [
      {
        id: 'forecast',
        label: 'Cash forecast',
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
        id: 'calendar',
        label: 'Calendar',
        path: '/reminders',
        icon: Calendar,
      },
    ],
  },
  {
    heading: 'INSIGHTS',
    items: [
      {
        id: 'payment-behaviour',
        label: 'Payment behaviour',
        path: '/customer-analytics',
        icon: Clock,
      },
      {
        id: 'reports',
        label: 'Reports',
        path: '/business-analytics',
        icon: BarChart2,
      },
    ],
  },
];
