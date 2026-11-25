import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ArrowRight, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-500/20 bg-[#080b0a]/75 backdrop-blur-xl shadow-lg shadow-black/10">

      {/* TOP GLOW LINE */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

      <nav className="relative mx-auto flex min-h-[82px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">

       {/* VELTRIO PREMIUM BRAND */}

<Link
  to={ROUTES.home}
  onClick={closeMenu}
  aria-label="VELTRIO home"
  className="group flex shrink-0 items-center gap-3"
>
  <div className="veltrio-logo-box">
    <span className="veltrio-logo-v">V</span>
    <span className="veltrio-logo-dot" />
  </div>

  <div className="flex flex-col">
    <span className="veltrio-wordmark">
      VELTRIO
    </span>

    <span className="veltrio-tagline">
      YOUR MONEY. YOUR CLARITY.
    </span>
  </div>
</Link>
        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                `group relative rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-emerald-400/[0.08] text-emerald-400'
                    : 'text-white/65 hover:bg-white/[0.04] hover:text-emerald-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}

                  <span
                    className={`absolute bottom-1.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-emerald-400 transition-all duration-300 ${
                      isActive
                        ? 'w-1/2 opacity-100 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                        : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-100'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-3 lg:flex">

          <Link
            to={ROUTES.login}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-white/75 transition-all duration-300 hover:bg-white/[0.05] hover:text-emerald-400
            "
            
          >
            Login
          </Link>

          <Link
  to={ROUTES.register}
  className="veltrio-cta group inline-flex items-center rounded-xl px-5 py-3 text-sm font-bold"
  style={{
    background: '#10B981',
    color: '#03110c',
    boxShadow: '0 5px 25px rgba(16,185,129,0.25)',
  }}
>
  Get Started

  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
</Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition-all duration-300 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-400 lg:hidden"
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

      </nav>

      {/* MOBILE MENU */}
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
          mobileOpen
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <div className="border-t border-white/[0.08] bg-[#080b0a]/95 px-5 py-5 backdrop-blur-2xl">

            <div className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  end={item.href === '/'}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-400'
                        : 'border-transparent text-white/65 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-emerald-300'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-5">

              <Link
                to={ROUTES.login}
                onClick={closeMenu}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-center text-sm font-semibold text-white transition-all duration-300 hover:border-emerald-400/30 hover:text-emerald-400"
              >
                Login
              </Link>

              <Link
                to={ROUTES.register}
                onClick={closeMenu}
                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-3.5 text-sm font-bold text-[#03110c] transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

            </div>
          </div>
        </div>
      </div>

    </header>
  );
}