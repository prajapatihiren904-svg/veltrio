import {
  BarChart3,
  LayoutDashboard,
  PieChart,
  Settings,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  User,
  Users,
  MessageSquareText,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';

import {
  ShoppingBag,
} from 'lucide-react';

import { ROUTES } from './routes';

export const userNavSections = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        to: ROUTES.dashboard,
        icon: LayoutDashboard,
        available: true,
      },
    ],
  },

  {
    label: 'Money',
    items: [
      {
        label: 'Income',
        to: ROUTES.income,
        icon: TrendingUp,
        available: true,
      },
      {
        label: 'Expenses',
        to: ROUTES.expenses,
        icon: TrendingDown,
        available: true,
      },
      {
        label: 'Transactions',
        to: ROUTES.transactions,
        icon: ArrowLeftRight,
        available: true,
      },
      {
        label: 'Import Data',
        to: ROUTES.dataImport,
        icon: FileSpreadsheet,
        available: true,
      },
    ],
  },

  {
    label: 'Planning',
    items: [
      {
        label: 'Budgets',
        to: ROUTES.budgets,
        icon: PieChart,
        available: true,
      },
      {
        label: 'Savings goals',
        to: ROUTES.goals,
        icon: Target,
        available: true,
      },

      {
  label: 'Purchase Planner',
  to: ROUTES.purchasePlanner,
  icon: ShoppingBag,
  available: true,
},
      {
        label: 'Analytics',
        to: ROUTES.analytics,
        icon: BarChart3,
        available: true,
      },
      {
        label: 'Reports',
        to: '/reports',
        icon: FileText,
        available: true,
      },
    ],
  },

  {
    label: 'Account',
    items: [
      {
        label: 'Profile',
        to: ROUTES.profile,
        icon: User,
        available: true,
      },
      {
        label: 'Settings',
        to: ROUTES.settings,
        icon: Settings,
        available: true,
      },
    ],
  },

  {
    label: 'Support',
    items: [
      {
        label: 'Feedback & Support',
        to: ROUTES.feedback,
        icon: MessageSquareText,
        available: true,
      },
    ],
  },
];

export const adminNavSections = [
  {
    label: 'Administration',
    items: [
      {
        label: 'Overview',
        to: ROUTES.admin,
        icon: ShieldCheck,
        available: true,
      },
      {
        label: 'Users',
        to: ROUTES.adminUsers,
        icon: Users,
        available: true,
      },
      {
        label: 'Feedback Management',
        to: ROUTES.adminFeedback,
        icon: MessageSquareText,
        available: true,
      },
    ],
  },
];

export function filterNavSections(sections, isDev) {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => isDev || !item.devOnly
      ),
    }))
    .filter((section) => section.items.length > 0);
}