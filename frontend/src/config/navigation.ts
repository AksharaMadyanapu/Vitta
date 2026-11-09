import {
  LayoutDashboard,
  Landmark,
  Users,
  FileSpreadsheet,
  CalendarClock,
  Clock,
  LineChart,
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: 'safe' | 'caution' | 'high' | 'blue' | 'teal';
  description: string;
}

export const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Executive overview, runway horizon, and liquidity pulse',
  },
  {
    id: 'banking',
    label: 'Bank & Transactions',
    shortLabel: 'Banking',
    path: '/banking',
    icon: Landmark,
    badge: 'Sandbox',
    badgeVariant: 'teal',
    description: 'Simulated bank feed, CSV reconciliation, and ledger entries',
  },
  {
    id: 'parties',
    label: 'Customers & Suppliers',
    shortLabel: 'Parties',
    path: '/parties',
    icon: Users,
    description: 'Directory of 12 customers & 8 suppliers with risk profiles',
  },
  {
    id: 'invoices',
    label: 'Invoices & OCR',
    shortLabel: 'Invoices',
    path: '/invoices',
    icon: FileSpreadsheet,
    description: 'Receivables & payables, status tracking, PDF data extraction',
  },
  {
    id: 'reminders',
    label: 'Reminders & Calendar',
    shortLabel: 'Reminders',
    path: '/reminders',
    icon: CalendarClock,
    badge: '3 Due',
    badgeVariant: 'caution',
    description: '7-day advance payment notices and due date calendar',
  },
  {
    id: 'customer-analytics',
    label: 'Customer Behaviour',
    shortLabel: 'Behaviour',
    path: '/customer-analytics',
    icon: Clock,
    description: 'Historical payment delay distributions and bootstrap metrics',
  },
  {
    id: 'forecast',
    label: 'Cash-Flow Forecast',
    shortLabel: 'Forecast',
    path: '/forecast',
    icon: LineChart,
    badge: '2000 Runs',
    badgeVariant: 'blue',
    description: '14/30/60-day p10/p50/p90 simulations and shortfall discovery',
  },
  {
    id: 'risk-alerts',
    label: 'Risk Alerts',
    path: '/risk-alerts',
    icon: ShieldAlert,
    badge: 'Action Needed',
    badgeVariant: 'high',
    description: 'Preventive alerts, shortfall warning dates, recommended steps',
  },
  {
    id: 'pre-transaction',
    label: 'Pre-Transaction Check',
    shortLabel: 'Risk Check',
    path: '/pre-transaction',
    icon: ShieldCheck,
    description: 'Check proposed POs, capital expenditures, or supplier payments',
  },
  {
    id: 'business-analytics',
    label: 'Business Performance',
    shortLabel: 'Analytics',
    path: '/business-analytics',
    icon: BarChart3,
    description: 'Working capital cycles, burn rates, and financial health KPIs',
  },
];

