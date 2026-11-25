// Central route registry. Components link through these constants, never raw strings.

export const ROUTES = {
  home: '/',

  // Authentication
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password/:token',

  // Private app
  dashboard: '/dashboard',
  income: '/income',
  expenses: '/expenses',
  transactions: '/transactions',
  dataImport: '/import',
  budgets: '/budgets',
  goals: '/goals',
  purchasePlanner: '/purchases',
  analytics: '/analytics',
  profile: '/profile',
  settings: '/settings',
  feedback: '/feedback',

  // Admin
  adminLogin: '/admin-login',
  admin: '/admin',
  adminUsers: '/admin/users',
  adminFeedback: '/admin/feedback',

  // Other developer routes
  devDesignSystem: '/design-system',
  devPreviewAuth: '/design-system/auth',
};