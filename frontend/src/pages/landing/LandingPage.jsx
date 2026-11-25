import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  LockKeyhole,
  ChartNoAxesCombined,
  Layers3,
  CreditCard,
  Lightbulb,
  Activity,
} from 'lucide-react';

import { ROUTES } from '@/constants/routes';

/* FEATURES */

const features = [
  {
    icon: TrendingUp,
    title: 'Income Tracking',
    description:
      'Keep every income source organized and understand where your money comes from.',
    number: '01',
  },
  {
    icon: TrendingDown,
    title: 'Expense Management',
    description:
      'Track daily spending, categorize transactions and control unnecessary expenses.',
    number: '02',
  },
  {
    icon: PieChart,
    title: 'Smart Budgets',
    description:
      'Create monthly budgets and stay within your financial limits.',
    number: '03',
  },
  {
    icon: Target,
    title: 'Savings Goals',
    description:
      'Set financial targets, monitor contributions and track your progress.',
    number: '04',
  },
  {
    icon: BarChart3,
    title: 'Financial Analytics',
    description:
      'Understand your financial habits through meaningful charts and insights.',
    number: '05',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Account',
    description:
      'Access your personal financial workspace with protected authentication.',
    number: '06',
  },
];

/* PLATFORM HIGHLIGHTS */

const highlights = [
  {
    icon: Wallet,
    title: 'Income',
    description: 'Organize all your income sources.',
  },
  {
    icon: Activity,
    title: 'Expenses',
    description: 'Understand your spending patterns.',
  },
  {
    icon: Layers3,
    title: 'Budgets',
    description: 'Plan and manage monthly budgets.',
  },
  {
    icon: Target,
    title: 'Savings',
    description: 'Work towards your financial goals.',
  },
];

/* HOW IT WORKS */

const steps = [
  {
    number: '01',
    title: 'Create Your Account',
    description:
      'Sign up and create your personal financial workspace in minutes.',
    icon: LockKeyhole,
  },
  {
    number: '02',
    title: 'Track Your Money',
    description:
      'Add income, expenses, budgets and your savings goals.',
    icon: CreditCard,
  },
  {
    number: '03',
    title: 'Gain Financial Clarity',
    description:
      'Understand your financial performance through your dashboard.',
    icon: ChartNoAxesCombined,
  },
];

/* WHY VELTRIO */

const benefits = [
  {
    icon: Lightbulb,
    title: 'Everything in One Place',
    description:
      'Manage income, expenses, budgets and savings from one organized workspace.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Understand Your Money',
    description:
      'Visualize your financial activity through analytics and meaningful summaries.',
  },
  {
    icon: ShieldCheck,
    title: 'Personal Financial Space',
    description:
      'Use your own account to access and manage your financial records.',
  },
];

/* FAQ */

const faqs = [
  {
    question: 'What is VELTRIO?',
    answer:
      'VELTRIO is a personal finance management platform that helps you track income, manage expenses, create budgets and monitor savings goals.',
  },
  {
    question: 'Is VELTRIO free to use?',
    answer:
      'You can create an account and use the currently available features. Any future paid plans or pricing will be communicated transparently.',
  },
  {
    question: 'Can I track both income and expenses?',
    answer:
      'Yes. VELTRIO provides separate income and expense management features, along with a combined transaction history.',
  },
  {
    question: 'Can I create savings goals?',
    answer:
      'Yes. You can create savings goals, set target amounts and record contributions to monitor your progress.',
  },
  {
    question: 'Does VELTRIO provide financial analytics?',
    answer:
      'Yes. The analytics section helps you understand income, expenses, cash flow and other financial trends.',
  },
  {
    question: 'How do I access my financial dashboard?',
    answer:
      'Create an account or log in using your existing credentials. After authentication, you can access your personal dashboard.',
  },
];

/* DASHBOARD PREVIEW */

function DashboardPreview() {
  const demoCards = [
    { label: 'Balance', value: '₹45,250', icon: Wallet },
    { label: 'Income', value: '₹60,000', icon: TrendingUp },
    { label: 'Expenses', value: '₹14,750', icon: TrendingDown },
    { label: 'Savings', value: '75.4%', icon: Target },
  ];

  const activities = [
    { name: 'Monthly Salary', amount: '+₹40,000', positive: true },
    { name: 'Shopping', amount: '-₹2,500', positive: false },
    { name: 'Freelancing', amount: '+₹8,000', positive: true },
  ];

  return (
    <div className="dashboard-float relative mx-auto w-full max-w-2xl">
      <div className="pointer-events-none absolute -inset-16 rounded-[40%] bg-gradient-to-br from-brand-500/15 via-brand-500/10 to-transparent blur-[90px]" />

      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/40">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-white">
              Financial Overview
            </p>
            <p className="mt-1 text-xs text-muted">
              Dashboard preview · Sample data
            </p>
          </div>

          <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs text-brand-400">
            Demo
          </span>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
          {demoCards.map((item) => (
            <div
              key={item.label}
              className="dashboard-card rounded-xl border border-line bg-canvas p-3 transition"
            >
              <item.icon size={17} className="mb-3 text-brand-400" />

              <p className="text-xs text-muted">{item.label}</p>

              <p className="mt-1 text-base font-bold text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* CHART AND ACTIVITY */}

        <div className="grid gap-4 px-4 pb-4 sm:grid-cols-5">

          <div className="rounded-xl border border-line bg-canvas p-4 sm:col-span-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Cash Flow</p>
              <span className="text-xs text-muted">Monthly demo</span>
            </div>

            <div className="mt-6 flex h-36 items-end gap-3">
              {[40, 65, 48, 85, 55, 95, 70].map((height, index) => (
                <div key={index} className="flex h-full flex-1 items-end">
                  <div
                    className="chart-bar w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 opacity-80 transition-all duration-300 hover:opacity-100"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between text-xs text-muted">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(
                (month) => (
                  <span key={month}>{month}</span>
                ),
              )}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-canvas p-4 sm:col-span-2">
            <p className="text-sm font-semibold text-white">
              Recent Activity
            </p>

            <div className="mt-5 space-y-5">
              {activities.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-xs font-medium text-white">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Sample transaction
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold ${
                      item.positive ? 'text-brand-400' : 'text-red-400'
                    }`}
                  >
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PREVIEW FOOTER */}

        <div className="flex flex-col gap-3 border-t border-line bg-white/[0.015] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-500/10">
              <CheckCircle2 size={15} className="text-brand-400" />
            </div>

            <div>
              <p className="text-xs font-semibold text-white">
                Preview Environment
              </p>
              <p className="mt-1 text-[10px] text-muted">
                Illustrative data · Not connected to your account
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full border border-brand-500/20 bg-brand-500/[0.07] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand-400">
            Demo Mode
          </span>
        </div>
      </div>
    </div>
  );
}

/* MAIN LANDING PAGE */
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const elements = document.querySelectorAll(
      '.veltrio-landing [data-reveal]',
    );

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="veltrio-landing relative isolate min-h-screen text-white">
      {/* Global animated background (GlobalFinanceBackground) is mounted once
          at App root and is visible through this transparent container. */}

      <style>{`
        .veltrio-landing {
          --veltrio-green: 16, 185, 129;
          background-color: #080b0a;
        }

        /* REVEAL ANIMATION */

        .veltrio-landing [data-reveal] {
          opacity: 0;
          transform: translateY(38px) scale(.985);
          filter: blur(5px);
          transition:
            opacity .85s ease,
            transform .85s cubic-bezier(.2,.75,.25,1),
            filter .85s ease;
        }

        .veltrio-landing [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        /* MOVING BACKGROUND ORBS */

        .veltrio-landing .ambient-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(85px);
          will-change: transform;
        }

        .veltrio-landing .ambient-orb-one {
          animation: veltrio-drift-one 19s ease-in-out infinite alternate;
        }

        .veltrio-landing .ambient-orb-two {
          animation: veltrio-drift-two 23s ease-in-out infinite alternate;
        }

        .veltrio-landing .ambient-orb-three {
          animation: veltrio-drift-three 17s ease-in-out infinite alternate;
        }

        .veltrio-landing .ambient-orb-four {
          animation: veltrio-drift-four 21s ease-in-out infinite alternate;
        }

        /* ANIMATED GRID */

        .veltrio-landing .ambient-grid {
          background-image:
            linear-gradient(rgba(16,185,129,.075) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,.075) 1px, transparent 1px);
          background-size: 58px 58px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
          animation: veltrio-grid-drift 28s linear infinite;
        }

        /* CENTRAL GLOW */

        .veltrio-landing .ambient-glow {
          background:
            radial-gradient(ellipse at 50% 20%, rgba(16,185,129,.13), transparent 55%),
            radial-gradient(ellipse at 80% 60%, rgba(20,184,166,.08), transparent 55%);
          animation: veltrio-pulse 8s ease-in-out infinite;
        }

        /* BACKGROUND LIGHT BEAM */

        .veltrio-landing .ambient-beam {
          position: absolute;
          left: -20%;
          top: 35%;
          width: 140%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(16,185,129,.35),
            rgba(45,212,191,.15),
            transparent
          );
          transform: rotate(-18deg);
          animation: veltrio-beam 12s ease-in-out infinite;
          box-shadow: 0 0 30px rgba(16,185,129,.18);
        }

        /* DASHBOARD FLOAT */

        .veltrio-landing .dashboard-float {
          animation: veltrio-float 7s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        .veltrio-landing .dashboard-card {
          transition:
            transform .35s ease,
            border-color .35s ease,
            box-shadow .35s ease;
        }

        .veltrio-landing .dashboard-card:hover {
          transform: translateY(-5px);
          border-color: rgba(16,185,129,.5);
          box-shadow: 0 12px 30px rgba(16,185,129,.08);
        }

        /* CHART BARS */

        .veltrio-landing .chart-bar {
          transform-origin: bottom;
          animation: veltrio-bars 1.25s cubic-bezier(.2,.75,.25,1) both;
        }

        .veltrio-landing .chart-bar:nth-child(2) {
          animation-delay: .08s;
        }

        .veltrio-landing .chart-bar:nth-child(3) {
          animation-delay: .16s;
        }

        .veltrio-landing .chart-bar:nth-child(4) {
          animation-delay: .24s;
        }

        .veltrio-landing .chart-bar:nth-child(5) {
          animation-delay: .32s;
        }

        .veltrio-landing .chart-bar:nth-child(6) {
          animation-delay: .4s;
        }

        .veltrio-landing .chart-bar:nth-child(7) {
          animation-delay: .48s;
        }

        /* HERO ENTRANCE */

        .veltrio-landing .hero-copy > * {
          animation: veltrio-rise .8s cubic-bezier(.2,.75,.25,1) both;
        }

        .veltrio-landing .hero-copy > *:nth-child(2) {
          animation-delay: .12s;
        }

        .veltrio-landing .hero-copy > *:nth-child(3) {
          animation-delay: .22s;
        }

        .veltrio-landing .hero-copy > *:nth-child(4) {
          animation-delay: .32s;
        }

        .veltrio-landing .hero-copy > *:nth-child(5) {
          animation-delay: .42s;
        }

        .veltrio-landing .hero-title-glow {
          text-shadow: 0 0 45px rgba(16,185,129,.18);
        }

        /* FEATURE CARD GLOW */

        .veltrio-landing .feature-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(16,185,129,.10),
            transparent 70%
          );
          opacity: 0;
          transition: opacity .35s ease;
          pointer-events: none;
        }

        .veltrio-landing .feature-card:hover::before {
          opacity: 1;
        }

        .veltrio-landing .feature-card:hover {
          box-shadow: 0 20px 55px rgba(16,185,129,.07);
        }

        /* KEYFRAMES */

        @keyframes veltrio-drift-one {
          from {
            transform: translate3d(-4%,0,0) scale(.92);
          }
          to {
            transform: translate3d(12%,14%,0) scale(1.12);
          }
        }

        @keyframes veltrio-drift-two {
          from {
            transform: translate3d(8%,-4%,0) scale(1);
          }
          to {
            transform: translate3d(-12%,16%,0) scale(1.16);
          }
        }

        @keyframes veltrio-drift-three {
          from {
            transform: translate3d(0,8%,0) scale(.9);
          }
          to {
            transform: translate3d(12%,-8%,0) scale(1.1);
          }
        }

        @keyframes veltrio-drift-four {
          from {
            transform: translate3d(0,0,0) scale(.9);
          }
          to {
            transform: translate3d(-10%,-12%,0) scale(1.2);
          }
        }

        @keyframes veltrio-grid-drift {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 58px 58px;
          }
        }

        @keyframes veltrio-pulse {
          0%, 100% {
            opacity: .4;
            transform: scale(.92);
          }
          50% {
            opacity: .9;
            transform: scale(1.08);
          }
        }

        @keyframes veltrio-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-13px);
          }
        }

        @keyframes veltrio-bars {
          from {
            transform: scaleY(.08);
            opacity: .25;
          }
          to {
            transform: scaleY(1);
            opacity: .85;
          }
        }

        @keyframes veltrio-rise {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes veltrio-beam {
          0%, 100% {
            opacity: .15;
            transform: translateX(-5%) rotate(-18deg);
          }
          50% {
            opacity: .65;
            transform: translateX(5%) rotate(-18deg);
          }
        }

        /* REDUCED MOTION ACCESSIBILITY */

        @media (prefers-reduced-motion: reduce) {
          .veltrio-landing *,
          .veltrio-landing *::before,
          .veltrio-landing *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }

          .veltrio-landing [data-reveal] {
            opacity: 1;
            transform: none;
            filter: none;
          }
        }

        /* =====================================================
           VELTRIO HOME — COORDINATED PREMIUM CARD + CTA POLISH
           Scoped to this landing page only.
        ===================================================== */

        .veltrio-landing {
          background-color: transparent !important;
        }

        /* Shared glass-card treatment */
        .veltrio-landing .dashboard-card,
        .veltrio-landing .feature-card,
        .veltrio-landing #how-it-works .grid > div,
        .veltrio-landing #about .space-y-4 > div,
        .veltrio-landing [data-home-card] {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          background:
            linear-gradient(145deg, rgba(12, 35, 25, .82), rgba(5, 15, 11, .78)) !important;
          border-color: rgba(52, 211, 153, .20) !important;
          box-shadow: 0 12px 34px rgba(0, 0, 0, .16);
          transition:
            transform .38s cubic-bezier(.2,.75,.25,1),
            border-color .38s ease,
            box-shadow .38s ease,
            background .38s ease;
        }

        .veltrio-landing .dashboard-card::after,
        .veltrio-landing .feature-card::after,
        .veltrio-landing #how-it-works .grid > div::after,
        .veltrio-landing #about .space-y-4 > div::after,
        .veltrio-landing [data-home-card]::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: 0;
          background: radial-gradient(
            360px circle at var(--card-pointer-x, 50%) var(--card-pointer-y, 0%),
            rgba(52, 211, 153, .14),
            transparent 68%
          );
          transition: opacity .35s ease;
        }

        .veltrio-landing .dashboard-card:hover,
        .veltrio-landing .feature-card:hover,
        .veltrio-landing #how-it-works .grid > div:hover,
        .veltrio-landing #about .space-y-4 > div:hover,
        .veltrio-landing [data-home-card]:hover {
          transform: translateY(-6px);
          border-color: rgba(110, 231, 183, .55) !important;
          background:
            linear-gradient(145deg, rgba(13, 45, 31, .92), rgba(5, 20, 14, .88)) !important;
          box-shadow:
            0 18px 42px rgba(0, 0, 0, .24),
            0 0 26px rgba(16, 185, 129, .11);
        }

        .veltrio-landing .dashboard-card:hover::after,
        .veltrio-landing .feature-card:hover::after,
        .veltrio-landing #how-it-works .grid > div:hover::after,
        .veltrio-landing #about .space-y-4 > div:hover::after,
        .veltrio-landing [data-home-card]:hover::after {
          opacity: 1;
        }

        /* Highlight cards */
        .veltrio-landing section.border-b .grid.grid-cols-2 > div {
          border-color: rgba(52, 211, 153, .20);
          background: rgba(7, 22, 15, .72);
          box-shadow: 0 10px 28px rgba(0, 0, 0, .14);
        }

        /* Feature card icon — refined glow, no excessive rotation */
        .veltrio-landing .feature-card > div {
          box-shadow: inset 0 0 16px rgba(16, 185, 129, .07);
        }

        .veltrio-landing .feature-card:hover > div {
          box-shadow:
            0 0 22px rgba(16, 185, 129, .18),
            inset 0 0 16px rgba(16, 185, 129, .12);
        }

        /* Dashboard preview shell and inner panels */
        .veltrio-landing .dashboard-float > .relative.overflow-hidden {
          border-color: rgba(52, 211, 153, .30) !important;
          background: rgba(5, 17, 12, .88) !important;
          box-shadow:
            0 24px 65px rgba(0, 0, 0, .34),
            0 0 34px rgba(16, 185, 129, .08);
          backdrop-filter: blur(20px);
        }

        .veltrio-landing .dashboard-float .rounded-xl:not(.dashboard-card) {
          border-color: rgba(52, 211, 153, .16);
        }

        .veltrio-landing .chart-bar {
          filter: drop-shadow(0 0 7px rgba(16, 185, 129, .18));
        }

        /* FAQ accordion */
        .veltrio-landing #faq > .mt-12 > div {
          border-color: rgba(52, 211, 153, .18);
          background: rgba(7, 22, 15, .72);
          backdrop-filter: blur(14px);
          transition:
            border-color .3s ease,
            background .3s ease,
            box-shadow .3s ease;
        }

        .veltrio-landing #faq > .mt-12 > div:hover,
        .veltrio-landing #faq > .mt-12 > div:has(button[aria-expanded="true"]) {
          border-color: rgba(52, 211, 153, .42);
          box-shadow: 0 10px 28px rgba(16, 185, 129, .07);
        }

        /* Main call-to-action buttons */
        .veltrio-landing .veltrio-action-button {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          border: 1px solid rgba(167, 243, 208, .35);
          background: linear-gradient(105deg, #059669, #10b981 48%, #34d399) !important;
          color: #03110c !important;
          box-shadow: 0 8px 25px rgba(16, 185, 129, .18);
          transition:
            transform .3s cubic-bezier(.2,.8,.2,1),
            box-shadow .3s ease,
            border-color .3s ease,
            filter .3s ease;
        }

        .veltrio-landing .veltrio-action-button::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background: linear-gradient(
            110deg,
            transparent 18%,
            rgba(255,255,255,.48) 48%,
            transparent 78%
          );
          transform: translateX(-135%);
          transition: transform .7s ease;
        }

        .veltrio-landing .veltrio-action-button:hover {
          transform: translateY(-3px);
          border-color: rgba(209, 250, 229, .8);
          filter: saturate(1.12) brightness(1.06);
          box-shadow:
            0 12px 30px rgba(16, 185, 129, .30),
            0 0 28px rgba(16, 185, 129, .16);
        }

        .veltrio-landing .veltrio-action-button:hover::before {
          transform: translateX(135%);
        }

        .veltrio-landing .veltrio-action-button:active {
          transform: translateY(0) scale(.97);
        }

        .veltrio-landing .veltrio-action-button svg {
          transition: transform .3s ease;
        }

        .veltrio-landing .veltrio-action-button:hover svg {
          transform: translateX(5px);
        }

        .veltrio-landing .veltrio-action-button:focus-visible {
          outline: 2px solid #a7f3d0;
          outline-offset: 4px;
        }

        /* Final CTA panel */
        .veltrio-landing section:last-child > div {
          border-color: rgba(52, 211, 153, .30);
          background:
            radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, .18), transparent 62%),
            linear-gradient(145deg, rgba(9, 34, 23, .94), rgba(5, 15, 11, .92));
          box-shadow:
            0 22px 60px rgba(0, 0, 0, .22),
            0 0 35px rgba(16, 185, 129, .07);
        }

        @media (max-width: 768px) {
          .veltrio-landing .dashboard-card:hover,
          .veltrio-landing .feature-card:hover,
          .veltrio-landing #how-it-works .grid > div:hover,
          .veltrio-landing #about .space-y-4 > div:hover,
          .veltrio-landing [data-home-card]:hover {
            transform: translateY(-2px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .veltrio-landing .dashboard-card,
          .veltrio-landing .feature-card,
          .veltrio-landing #how-it-works .grid > div,
          .veltrio-landing #about .space-y-4 > div,
          .veltrio-landing .veltrio-action-button,
          .veltrio-landing .veltrio-action-button::before {
            transition: none !important;
            animation: none !important;
          }
        }

      `}</style>

      <div className="relative z-10">

        {/* HERO */}

       <section
  id="home"
  className="relative isolate min-h-screen overflow-hidden border-b border-white/10 text-white"
>

  {/* Dark overlay for text readability */}
  <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#050807]/10 via-[#050807]/20 to-[#050807]/80" />

  {/* Existing Hero Content goes here */}
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />

          <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[130px]" />

          <div className="pointer-events-none absolute -right-40 top-40 h-[450px] w-[450px] rounded-full bg-emerald-400/10 blur-[130px]" />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-32">

            {/* LEFT SIDE */}

            <div className="hero-copy relative z-10">

              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/[0.08] px-4 py-2 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
                </span>

                <span className="text-[11px] font-semibold uppercase tracking-[0.17em] text-brand-400">
                  A smarter way to manage money
                </span>

                <Sparkles size={13} className="text-brand-400" />
              </div>

              <h1 className="hero-title-glow mt-9 max-w-3xl text-[42px] font-bold leading-[1.08] tracking-[-0.055em] text-white sm:text-6xl lg:text-[72px]">
                Your Money.
                <br />
                Your Decisions.
                <br />
                <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-brand-300 bg-clip-text text-transparent">
                  Your Future.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-base leading-8 text-muted sm:text-lg">
                Take charge of your financial life with one intelligent workspace.
                Track spending, plan budgets, build savings and turn financial
                data into meaningful decisions.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to={ROUTES.register}
                  className="veltrio-action-button group inline-flex items-center justify-center rounded-xl px-7 py-4 text-sm font-bold"
                >
                  Get Started for Free
                  <ArrowRight
                    size={18}
                    className="ml-3 transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-xl border border-line bg-white/[0.03] px-7 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-1 hover:border-brand-500/40 hover:bg-brand-500/[0.06]"
                >
                  Explore Platform
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 border-t border-line pt-7">
                {[
                  'Simple financial tracking',
                  'Personalized workspace',
                  'Protected account access',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-muted"
                  >
                    <CheckCircle2 size={15} className="shrink-0 text-brand-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE */}

            <div className="relative mx-auto w-full max-w-2xl lg:ml-auto">

              <div className="pointer-events-none absolute inset-0 scale-90 rounded-full bg-brand-500/15 blur-[100px]" />
              <div className="relative z-10">
                <DashboardPreview />
              </div>

              {/* FLOATING CARD */}

              <div className="dashboard-float absolute -right-2 -top-7 z-20 hidden rounded-xl border border-brand-500/20 bg-surface/95 px-4 py-3 shadow-xl backdrop-blur-xl sm:block lg:-right-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10">
                    <TrendingUp size={18} className="text-brand-400" />
                  </div>

                  <div>
                    <p className="text-[10px] text-muted">Savings overview</p>
                    <p className="mt-1 text-sm font-bold text-white">
                      75.4% <span className="text-xs text-brand-400">Demo</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM HIGHLIGHTS */}

        <section data-reveal className="border-b border-line bg-surface/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">

            <div className="mb-10 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                One platform. Complete clarity.
              </span>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Everything your money needs.
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {highlights.map((item, index) => (
                <div
                  key={item.title}
                  data-reveal
                  style={{ transitionDelay: `${(index % 4) * 90}ms` }}
                  className="group rounded-2xl border border-line bg-canvas/80 p-5 backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10 sm:p-7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 transition duration-300 group-hover:rotate-6 group-hover:bg-brand-500 group-hover:text-black">
                    <item.icon size={22} />
                  </div>

                  <h3 className="mt-5 font-semibold text-white">{item.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-muted">
                    {item.description}
                  </p>

                  <div className="mt-5 h-1 w-10 rounded-full bg-brand-500/50 transition-all duration-500 group-hover:w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}

        <section
          data-reveal
          id="features"
          className="mx-auto max-w-7xl px-5 py-24 sm:px-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
              Powerful financial tools
            </span>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Your finances. <span className="text-brand-400">Your control.</span>
            </h2>

            <p className="mt-5 leading-7 text-muted">
              Powerful tools designed to make personal financial management
              simpler, clearer and more organized.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                data-reveal
                style={{ transitionDelay: `${(index % 3) * 100}ms` }}
                className="feature-card group relative overflow-hidden rounded-2xl border border-line bg-surface/90 p-7 backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:border-brand-500/40"
              >
                <span className="absolute right-6 top-5 text-4xl font-bold text-white/[0.035]">
                  {feature.number}
                </span>

                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400 transition duration-300 group-hover:rotate-6 group-hover:bg-brand-500 group-hover:text-black">
                  <feature.icon size={23} />
                </div>

                <h3 className="relative mt-6 text-lg font-semibold">
                  {feature.title}
                </h3>

                <p className="relative mt-3 text-sm leading-7 text-muted">
                  {feature.description}
                </p>

                <a
                  href="#how-it-works"
                  className="relative mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-400 transition group-hover:gap-3"
                >
                  Explore <ChevronRight size={15} />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* PRODUCT SHOWCASE */}

        <section
          data-reveal
          className="relative overflow-hidden border-y border-line bg-surface/35 backdrop-blur-sm"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />

          <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                Your financial command center
              </span>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                A clearer view of <span className="text-brand-400">your money.</span>
              </h2>

              <p className="mt-5 leading-7 text-muted">
                Bring your financial activities together in one intuitive
                dashboard designed to make money management easier.
              </p>
            </div>

            <div className="mx-auto max-w-5xl">
              <DashboardPreview />
            </div>

            <p className="mt-5 text-center text-xs text-muted">
              Demonstration interface using illustrative sample data.
            </p>
          </div>
        </section>

        {/* HOW IT WORKS */}

        <section
          data-reveal
          id="how-it-works"
          className="mx-auto max-w-7xl px-5 py-24 sm:px-8"
        >
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
              Simple process
            </span>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Financial clarity in <span className="text-brand-400">3 steps.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-muted">
              Getting started with better money management doesn't need to be complicated.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.number}
                data-reveal
                style={{ transitionDelay: `${index * 110}ms` }}
                className="group relative rounded-2xl border border-line bg-surface/90 p-8 backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold text-brand-500/30 transition group-hover:text-brand-400/70">
                    {step.number}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 transition duration-300 group-hover:rotate-6 group-hover:bg-brand-500 group-hover:text-black">
                    <step.icon size={23} />
                  </div>
                </div>

                <h3 className="mt-7 text-xl font-semibold">{step.title}</h3>

                <p className="mt-3 text-sm leading-7 text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY VELTRIO */}

        <section
          data-reveal
          id="about"
          className="border-y border-line bg-surface/35 backdrop-blur-sm"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2">

            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                Why VELTRIO
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">
                Less confusion.
                <span className="mt-2 block text-brand-400">
                  More financial clarity.
                </span>
              </h2>

              <p className="mt-6 max-w-xl leading-8 text-muted">
                VELTRIO brings your financial activities into one organized
                workspace. From tracking everyday spending to planning savings,
                understand your financial picture with greater clarity.
              </p>

              <Link
                to={ROUTES.register}
                className="veltrio-action-button mt-8 inline-flex items-center rounded-xl px-6 py-3.5 text-sm font-semibold"
              >
                Create Your Account
                <ArrowUpRight size={17} className="ml-2" />
              </Link>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  data-reveal
                  style={{ transitionDelay: `${index * 100}ms` }}
                  className="group flex gap-5 rounded-2xl border border-line bg-canvas/80 p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-brand-500/40"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 transition duration-300 group-hover:rotate-6 group-hover:bg-brand-500 group-hover:text-black">
                    <benefit.icon size={23} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-muted">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}

        <section
          data-reveal
          id="faq"
          className="mx-auto max-w-4xl px-5 py-24 sm:px-8"
        >
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
              <CircleHelp size={25} />
            </div>

            <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
              Got questions?
            </span>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Frequently asked <span className="text-brand-400">questions.</span>
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted">
              Find answers to common questions about VELTRIO.
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className={`overflow-hidden rounded-xl border transition-colors duration-300 ${
                    isOpen
                      ? 'border-brand-500/40 bg-brand-500/[0.04]'
                      : 'border-line bg-surface'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                  >
                    <span className="text-sm font-semibold text-white sm:text-base">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-brand-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-7 text-muted sm:px-6">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA */}

        <section data-reveal className="px-5 pb-24 sm:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-500/15 via-surface to-surface px-6 py-20 text-center shadow-2xl shadow-brand-500/[0.04] sm:px-12">

            <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-brand-500/15 blur-[100px]" />

            <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-brand-300/15 blur-[100px]" />

            <div className="relative">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                Your next chapter starts here
              </span>

              <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-bold sm:text-5xl">
                Make every financial decision count.
              </h2>

              <p className="mx-auto mt-5 max-w-xl leading-7 text-muted">
                Bring clarity to your finances and take the first step towards
                better money management.
              </p>

              <Link
                to={ROUTES.register}
                className="veltrio-action-button mt-9 inline-flex items-center rounded-xl px-7 py-4 font-semibold"
              >
                Get Started Free
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}