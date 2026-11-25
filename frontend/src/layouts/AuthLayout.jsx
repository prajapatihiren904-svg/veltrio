import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import Logo from '@/components/common/Logo';
import PageTransition from '@/components/layout/PageTransition';
import SkipLink from '@/components/layout/SkipLink';
import { APP_TAGLINE } from '@/constants/app';
import { ROUTES } from '@/constants/routes';

const highlights = [
  { icon: TrendingUp, text: 'See where every rupee goes' },
  { icon: ShieldCheck, text: 'Your data stays private to you' },
  { icon: Sparkles, text: 'Budgets and goals that keep you on track' },
];

/**
 * Split-screen shell for login, register and password pages.
 * Brand panel appears from lg up. Both columns sit at z-10 above the
 * global animated background (GlobalFinanceBackground at z-0).
 * The left aside uses a semi-transparent background so the global
 * background glows through it.
 */
export default function AuthLayout() {
  return (
    <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
      <SkipLink />

      {/* ── Brand panel (desktop left column) ───────────────────── */}
      <aside
        className="bg-grid relative hidden flex-col justify-between overflow-hidden border-r border-line p-12 lg:flex"
        style={{ background: 'rgb(var(--color-surface) / 0.75)', backdropFilter: 'blur(18px)' }}
      >
        {/* Soft brand glow — matches global background colour */}
        <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />

        <Link to={ROUTES.home} aria-label="VELTRIO home" className="relative w-fit rounded-control">
          <Logo />
        </Link>

        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">
            Your Money.
            <br />
            <span className="text-gradient">Your Clarity.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-content-muted">
                <span className="flex h-9 w-9 items-center justify-center rounded-control border border-line bg-surface-raised text-brand-400">
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-content-subtle">{APP_TAGLINE}</p>
      </aside>

      {/* ── Form panel (right column, full width on mobile) ──────── */}
      <main id="main-content" tabIndex={-1} className="flex flex-col px-4 py-8 sm:px-8">
        <div className="mb-8 lg:hidden">
          <Link to={ROUTES.home} aria-label="VELTRIO home" className="inline-block rounded-control">
            <Logo />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </div>
      </main>
    </div>
  );
}
