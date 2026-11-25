import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  ShieldCheck,
  Wallet,
  BarChart3,
  CreditCard,
  ChartNoAxesCombined,
  Lightbulb,
  LockKeyhole,
  ChevronDown,
  Sparkles,
  Activity,
} from 'lucide-react';

import { ROUTES } from '@/constants/routes';

const features = [
  {
    icon: TrendingUp,
    title: 'Income Tracking',
    description: 'Organize your income sources and understand how much money you earn.',
    number: '01',
  },
  {
    icon: TrendingDown,
    title: 'Expense Management',
    description: 'Track daily spending and understand where your money goes.',
    number: '02',
  },
  {
    icon: PieChart,
    title: 'Smart Budgets',
    description: 'Create budgets and monitor your monthly spending limits.',
    number: '03',
  },
  {
    icon: Target,
    title: 'Savings Goals',
    description: 'Set financial targets and monitor your savings progress.',
    number: '04',
  },
  {
    icon: BarChart3,
    title: 'Financial Analytics',
    description: 'Explore your financial activity through charts and insights.',
    number: '05',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Account',
    description: 'Access your personal financial workspace through authentication.',
    number: '06',
  },
];

const steps = [
  {
    number: '01',
    icon: LockKeyhole,
    title: 'Create Your Account',
    description: 'Register and set up your personal financial workspace.',
  },
  {
    number: '02',
    icon: CreditCard,
    title: 'Track Your Transactions',
    description: 'Record your income, expenses and other financial activities.',
  },
  {
    number: '03',
    icon: ChartNoAxesCombined,
    title: 'Understand Your Finances',
    description: 'Use your dashboard and analytics to gain financial clarity.',
  },
];

const benefits = [
  {
    icon: Wallet,
    title: 'One Financial Workspace',
    description: 'Keep your financial activities organized in one place.',
  },
  {
    icon: Lightbulb,
    title: 'Better Financial Awareness',
    description: 'Understand your spending habits and financial patterns.',
  },
  {
    icon: ShieldCheck,
    title: 'Personal Account',
    description: 'Access your own financial workspace with protected authentication.',
  },
];

const faqs = [
  {
    question: 'What is VELTRIO?',
    answer: 'VELTRIO is a personal finance management platform that helps you manage income, expenses, budgets and savings goals.',
  },
  {
    question: 'Can I track income and expenses?',
    answer: 'Yes. You can organize income and expenses and review your transaction history.',
  },
  {
    question: 'Can I manage monthly budgets?',
    answer: 'Yes. VELTRIO provides budgeting features to help you plan and monitor spending.',
  },
  {
    question: 'Can I track savings goals?',
    answer: 'Yes. You can create financial goals and monitor your progress.',
  },
  {
    question: 'Does VELTRIO provide analytics?',
    answer: 'Yes. Financial analytics help you understand your financial activity and trends.',
  },
  {
    question: 'How do I get started?',
    answer: 'Create an account using the Get Started button and access your personal dashboard.',
  },
];

const pageContent = {
  '/features': {
    eyebrow: 'POWERFUL FINANCIAL TOOLS',
    title: 'Everything you need to manage your money.',
    description: 'Discover the tools that help you organize, understand and manage your financial life.',
  },
  '/how-it-works': {
    eyebrow: 'SIMPLE PROCESS',
    title: 'Better financial management starts here.',
    description: 'Three simple steps to bring more clarity to your financial activities.',
  },
  '/about': {
    eyebrow: 'ABOUT VELTRIO',
    title: 'Your Money. Your Clarity.',
    description: 'A personal finance platform designed to make money management more organized and understandable.',
  },
  '/faq': {
    eyebrow: 'HELP CENTER',
    title: 'Questions? We have answers.',
    description: 'Find answers to common questions about the VELTRIO platform.',
  },
};

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <div
      data-public-reveal
      style={{ transitionDelay: `${delay}ms` }}
      className={`public-reveal ${className}`}
    >
      {children}
    </div>
  );
}

export default function PublicInfoPage() {
  const location = useLocation();
  const [openFaq, setOpenFaq] = useState(0);

  const currentPath = location.pathname;
  const page = pageContent[currentPath] || pageContent['/features'];

  useEffect(() => {
    setOpenFaq(0);

    const elements = document.querySelectorAll('[data-public-reveal]');

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <main className="public-info-page relative min-h-screen overflow-hidden bg-transparent text-white">

      <style>{`
        .public-info-page {
          animation: public-page-enter .65s cubic-bezier(.2,.75,.25,1) both;
        }

        @keyframes public-page-enter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .public-reveal {
          opacity: 0;
          transform: translateY(35px);
          filter: blur(4px);
          transition:
            opacity .75s ease,
            transform .75s cubic-bezier(.2,.75,.25,1),
            filter .75s ease;
        }

        .public-reveal.visible {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }

        .public-info-card {
          transition: transform .35s ease, border-color .35s ease, box-shadow .35s ease;
        }

        .public-info-card:hover {
          transform: translateY(-7px);
          border-color: rgba(16,185,129,.5);
          box-shadow: 0 18px 50px rgba(16,185,129,.08);
        }

        @media (prefers-reduced-motion: reduce) {
          .public-info-page,
          .public-reveal,
          .public-info-card {
            animation: none !important;
            transition: none !important;
          }

          .public-reveal {
            opacity: 1;
            transform: none;
            filter: none;
          }
        }
      `}</style>

      {/* GLOBAL ANIMATED BACKGROUND IS PROVIDED BY APP.JSX */}

      {/* PAGE HERO */}

      <section className="relative border-b border-white/10 px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-5xl text-center">

          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-emerald-400">
              <Sparkles size={14} />
              {page.eyebrow}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              {page.title}
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">
              {page.description}
            </p>
          </Reveal>

          <Reveal delay={300}>
            <Link
              to={ROUTES.register}
              className="mt-10 inline-flex items-center rounded-xl bg-emerald-500 px-7 py-4 text-sm font-bold text-black transition hover:-translate-y-1 hover:bg-emerald-400"
            >
              Get Started
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </Reveal>

        </div>
      </section>

      {/* FEATURES PAGE */}

      {currentPath === '/features' && (
        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={(index % 3) * 100}>
                <div className="public-info-card relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-8 backdrop-blur-xl">

                  <span className="absolute right-6 top-5 text-4xl font-bold text-white/[0.04]">
                    {feature.number}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <feature.icon size={24} />
                  </div>

                  <h2 className="mt-7 text-xl font-semibold">
                    {feature.title}
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-gray-400">
                    {feature.description}
                  </p>

                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* HOW IT WORKS PAGE */}

      {currentPath === '/how-it-works' && (
        <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <div className="grid gap-7 md:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 130}>
                <div className="public-info-card h-full rounded-2xl border border-white/10 bg-white/[0.025] p-8">

                  <div className="flex items-center justify-between">
                    <span className="text-5xl font-bold text-emerald-500/40">
                      {step.number}
                    </span>

                    <step.icon size={30} className="text-emerald-400" />
                  </div>

                  <h2 className="mt-8 text-xl font-semibold">
                    {step.title}
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-gray-400">
                    {step.description}
                  </p>

                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ABOUT PAGE */}

      {currentPath === '/about' && (
        <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">

          <Reveal>
            <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.10] to-white/[0.015] p-8 sm:p-14">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Activity size={32} />
              </div>

              <h2 className="mt-8 text-3xl font-bold sm:text-4xl">
                Making personal finance easier to understand.
              </h2>

              <p className="mt-6 max-w-3xl text-base leading-8 text-gray-400">
                VELTRIO brings everyday financial management into one organized
                digital workspace. The platform focuses on helping users
                understand their income, expenses, budgets and savings goals
                through accessible tools and clear financial information.
              </p>

            </div>
          </Reveal>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {benefits.map((item, index) => (
              <Reveal key={item.title} delay={index * 100}>
                <div className="public-info-card h-full rounded-2xl border border-white/10 bg-white/[0.025] p-7">

                  <item.icon size={27} className="text-emerald-400" />

                  <h3 className="mt-5 font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-gray-400">
                    {item.description}
                  </p>

                </div>
              </Reveal>
            ))}
          </div>

        </section>
      )}

      {/* FAQ PAGE */}

      {currentPath === '/faq' && (
        <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
          <div className="space-y-4">

            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <Reveal key={faq.question} delay={(index % 3) * 70}>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">

                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-5 px-6 py-6 text-left"
                    >
                      <span className="font-semibold">
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-emerald-400 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <div
                      className={`grid transition-all duration-300 ${
                        isOpen
                          ? 'grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-6 text-sm leading-7 text-gray-400">
                          {faq.answer}
                        </p>
                      </div>
                    </div>

                  </div>
                </Reveal>
              );
            })}

          </div>
        </section>
      )}

      {/* BOTTOM CTA */}

      <section className="px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] px-7 py-16 text-center sm:px-12">

            <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-500/15 blur-[100px]" />

            <h2 className="relative text-3xl font-bold sm:text-4xl">
              Take control of your financial future.
            </h2>

            <p className="relative mx-auto mt-5 max-w-xl text-sm leading-7 text-gray-400">
              Start organizing your money with VELTRIO.
            </p>

            <Link
              to={ROUTES.register}
              className="relative mt-8 inline-flex items-center rounded-xl bg-emerald-500 px-7 py-4 text-sm font-bold text-black transition hover:-translate-y-1 hover:bg-emerald-400"
            >
              Create Your Account
              <ArrowUpRight size={18} className="ml-2" />
            </Link>

          </div>
        </Reveal>
      </section>

    </main>
  );
}