import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ShieldCheck,
  Wallet,
  BarChart3,
  Target,
} from 'lucide-react';

import Logo from '@/components/common/Logo';
import { APP_TAGLINE } from '@/constants/app';
import { ROUTES } from '@/constants/routes';

const footerLinks = {
  platform: [
    { label: 'Features', href: `${ROUTES.home}#features` },
    { label: 'How It Works', href: `${ROUTES.home}#how-it-works` },
    { label: 'About Us', href: `${ROUTES.home}#about` },
    { label: 'FAQs', href: `${ROUTES.home}#faq` },
  ],

  account: [
    { label: 'Login', href: ROUTES.login },
    { label: 'Create Account', href: ROUTES.register },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface/50">

      {/* MAIN FOOTER */}
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* BRAND */}
          <div className="lg:col-span-2">

            <Logo />

            <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
              {APP_TAGLINE}. Take control of your finances with smarter
              tracking, better planning and meaningful financial insights.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2">
                <Wallet size={16} className="text-brand-400" />
                <span className="text-xs text-muted">Money Tracking</span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2">
                <BarChart3 size={16} className="text-brand-400" />
                <span className="text-xs text-muted">Analytics</span>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2">
                <Target size={16} className="text-brand-400" />
                <span className="text-xs text-muted">Savings Goals</span>
              </div>

            </div>

          </div>

          {/* PLATFORM LINKS */}
          <div>

            <h3 className="text-sm font-bold text-white">
              Platform
            </h3>

            <ul className="mt-6 space-y-4">

              {footerLinks.platform.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-brand-400"
                  >
                    {item.label}
                    <ArrowUpRight size={13} />
                  </Link>
                </li>
              ))}

            </ul>

          </div>

          {/* ACCOUNT LINKS */}
          <div>

            <h3 className="text-sm font-bold text-white">
              Your Account
            </h3>

            <ul className="mt-6 space-y-4">

              {footerLinks.account.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-brand-400"
                  >
                    {item.label}
                    <ArrowUpRight size={13} />
                  </Link>
                </li>
              ))}

            </ul>

            <div className="mt-7 flex items-center gap-2 text-xs text-brand-400">
              <ShieldCheck size={16} />
              <span>Protected Account Access</span>
            </div>

          </div>

        </div>

        {/* BOTTOM FOOTER */}
        <div className="mt-14 flex flex-col gap-5 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-xs text-muted">
            © {new Date().getFullYear()} VELTRIO. All rights reserved.
          </p>

          <p className="text-xs font-medium tracking-wide text-muted">
            YOUR MONEY. YOUR CLARITY.
          </p>

        </div>

      </div>

    </footer>
  );
}