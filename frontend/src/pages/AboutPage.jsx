import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Target,
  PieChart,
  ShieldCheck,
  Sparkles,
  Github,
  Linkedin,
  Mail,
  Code2,
  Database,
  Layers3,
  BarChart3,
  Heart,
  Zap,
  Globe2,
  ChevronRight,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';

const features = [
  {
    icon: Wallet,
    number: '01',
    title: 'Income Tracking',
    description: 'Keep your income sources organized and understand your earnings.',
  },
  {
    icon: TrendingUp,
    number: '02',
    title: 'Expense Management',
    description: 'Monitor daily spending and build better financial habits.',
  },
  {
    icon: PieChart,
    number: '03',
    title: 'Smart Budgeting',
    description: 'Plan monthly budgets and stay in control of your money.',
  },
  {
    icon: Target,
    number: '04',
    title: 'Savings Goals',
    description: 'Set financial targets and track your progress.',
  },
  {
    icon: BarChart3,
    number: '05',
    title: 'Financial Analytics',
    description: 'Understand your financial patterns through meaningful insights.',
  },
  {
    icon: ShieldCheck,
    number: '06',
    title: 'Account Security',
    description: 'Access your personal financial workspace through protected authentication.',
  },
];

const technologies = [
  { name: 'React.js', category: 'Frontend', icon: Code2 },
  { name: 'Tailwind CSS', category: 'Styling', icon: Layers3 },
  { name: 'Node.js', category: 'Runtime', icon: Zap },
  { name: 'Express.js', category: 'Backend', icon: Globe2 },
  { name: 'MongoDB', category: 'Database', icon: Database },
];

function SectionTitle({ label, title, description }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
        {label}
      </p>

      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-content-muted sm:text-base">
        {description}
      </p>
    </div>
  );
}

function AboutPage() {
  const [isPortraitOpen, setIsPortraitOpen] = useState(false);

  return (
    <main className="veltrio-about-page relative isolate min-h-screen overflow-hidden bg-[#080d0b] text-white">

      {/* ANIMATED BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-emerald-500/[0.08] blur-[120px]" />

        <div className="absolute -right-40 top-[35%] h-[450px] w-[450px] animate-pulse rounded-full bg-teal-500/[0.07] blur-[140px]" />

        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-emerald-400/[0.05] blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(16,185,129,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.25) 1px, transparent 1px)',
            backgroundSize: '55px 55px',
          }}
        />
      </div>

      {/* ANIMATED ORBIT LINES + FLOATING PARTICLES */}
      <div className="about-orbit-layer" aria-hidden="true">
        <svg className="about-orbit-svg" viewBox="0 0 1600 1000" preserveAspectRatio="none">
          <path className="about-orbit-path about-orbit-path-one" d="M-120 620 C180 330 380 820 700 510 S1180 120 1730 340" />
          <path className="about-orbit-path about-orbit-path-two" d="M-100 780 C260 980 480 420 820 600 S1280 850 1710 500" />
          <path className="about-orbit-path about-orbit-path-three" d="M1180 -80 C1050 180 1320 360 1540 280 S1660 80 1710 20" />
        </svg>
        <span className="about-particle about-particle-one" />
        <span className="about-particle about-particle-two" />
        <span className="about-particle about-particle-three" />
        <span className="about-particle about-particle-four" />
        <span className="about-particle about-particle-five" />
      </div>

      {/* HERO */}
      <section className="relative flex min-h-[620px] items-center px-5 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-2">

          <div className="animate-[fadeUp_0.8s_ease-out_both]">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-4 py-2">
              <Sparkles size={15} className="text-emerald-400" />

              <span className="text-xs font-semibold tracking-wide text-emerald-300">
                ABOUT VELTRIO
              </span>
            </div>

            <h1 className="max-w-2xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Your Money.
              <br />

              <span className="bg-gradient-to-r from-[#00E6A0] via-[#00C98C] to-[#35F0BD] to-emerald-500 bg-clip-text text-transparent">
                Your Clarity.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-content-muted sm:text-lg">
              VELTRIO is a personal finance management platform
              designed to make managing money simpler, smarter
              and more organized.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/dashboard"
                className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-[#042c22] shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400"
              >
                Explore Dashboard

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#our-story"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.07]"
              >
                Discover Our Story
                <ChevronRight size={16} />
              </a>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="about-hero-visual relative mx-auto w-full max-w-md animate-[fadeUp_1s_ease-out_both]">
            <div className="about-hero-aura pointer-events-none absolute inset-[-12%] scale-90 rounded-full bg-emerald-400/10 blur-[90px]" />

            <div className="about-dashboard-panel relative rounded-[32px] border border-emerald-400/20 bg-[#101a16]/85 p-7 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl sm:p-9">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-content-muted">
                    YOUR FINANCIAL SPACE
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    VELTRIO
                  </h3>
                </div>

                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-400">
                  <Wallet size={23} />
                </div>
              </div>

              <div className="about-dashboard-intro mt-9 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <p className="text-xs text-content-muted">
                  Financial clarity starts here
                </p>

                <p className="mt-3 text-3xl font-bold tracking-tight">
                  Manage smarter.
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                  <span className="text-xs text-emerald-400">
                    Your personal finance workspace
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { icon: TrendingUp, label: 'Income' },
                  { icon: PieChart, label: 'Expenses' },
                  { icon: Target, label: 'Savings' },
                  { icon: BarChart3, label: 'Analytics' },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{ animationDelay: `${0.25 + (['Income', 'Expenses', 'Savings', 'Analytics'].indexOf(item.label) * 0.12)}s` }}
                    className="about-dashboard-tile flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30"
                  >
                    <item.icon size={18} className="text-emerald-400" />

                    <span className="text-xs font-medium text-white">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="text-xs text-content-muted">
                  Your Money. Your Clarity.
                </span>

                <Sparkles size={17} className="text-emerald-400" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* OUR STORY */}
      <section
        id="our-story"
        className="scroll-mt-20 border-t border-white/[0.06] px-5 py-24 sm:px-10 lg:px-16"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
              OUR STORY
            </p>

            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              A clearer way to understand your money.
            </h2>
          </div>

          <div className="space-y-5 text-sm leading-8 text-content-muted sm:text-base">
            <p>
              Managing personal finances can become complicated when
              income, expenses, budgets and savings are scattered
              across different places.
            </p>

            <p>
              VELTRIO brings these essential financial activities
              together in one organized digital workspace.
            </p>

            <p>
              Our goal is to make financial information easier to
              understand and help people make more informed decisions
              about their money.
            </p>
          </div>

        </div>
      </section>

      {/* MISSION */}
      <section className="px-5 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[30px] border border-emerald-400/20 bg-gradient-to-br from-emerald-950/70 via-[#102019] to-[#0a100d] p-8 sm:p-14">

          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-5 inline-flex rounded-xl bg-emerald-400/10 p-3 text-emerald-400">
                <Target size={24} />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
                OUR MISSION
              </p>

              <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
                Making personal finance management

                <span className="text-emerald-400">
                  {' '}simple and accessible.
                </span>
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-8 text-content-muted">
                We believe that understanding your money should not
                be complicated. VELTRIO aims to bring clarity,
                organization and confidence to everyday financial
                management.
              </p>
            </div>

            <div className="hidden h-36 w-36 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-400 md:flex">
              <Heart size={60} strokeWidth={1.2} />
            </div>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="px-5 py-24 sm:px-10 lg:px-16">
        <SectionTitle
          label="WHAT WE OFFER"
          title="Everything in one place."
          description="Explore the core capabilities designed to help you organize and understand your personal finances."
        />

        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="about-animated-card about-feature-card group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111815]/80 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-400/30 hover:shadow-xl hover:shadow-emerald-950/30"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-400/[0.04] blur-2xl transition-all duration-500 group-hover:bg-emerald-400/10" />

              <div className="relative flex items-center justify-between">
                <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.08] p-3 text-emerald-400 transition-transform duration-300 group-hover:scale-110">
                  <feature.icon size={22} />
                </div>

                <span className="text-xs font-bold tracking-widest text-white/20">
                  {feature.number}
                </span>
              </div>

              <h3 className="relative mt-7 text-lg font-semibold text-white">
                {feature.title}
              </h3>

              <p className="relative mt-3 text-sm leading-7 text-content-muted">
                {feature.description}
              </p>

              <div className="mt-6 h-px w-10 bg-emerald-400/40 transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </section>

      {/* TECHNOLOGY STACK */}
      <section className="border-y border-white/[0.06] bg-white/[0.015] px-5 py-24 sm:px-10 lg:px-16">
        <SectionTitle
          label="THE TECHNOLOGY"
          title="Built with modern technology."
          description="The technologies behind the VELTRIO application."
        />

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="about-animated-card about-tech-card group rounded-2xl border border-white/[0.08] bg-[#111815]/80 p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:border-emerald-400/30"
            >
              <tech.icon
                size={29}
                className="mx-auto text-emerald-400 transition-transform duration-300 group-hover:scale-110"
              />

              <h3 className="mt-4 text-sm font-semibold text-white">
                {tech.name}
              </h3>

              <p className="mt-1 text-xs text-content-muted">
                {tech.category}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          CINEMATIC FOUNDER SECTION
      ===================================================== */}

      <section className="founder-section relative isolate min-h-[900px] overflow-hidden bg-[#050907]">

        {/* EMERALD BACKGROUND COLOR GRADING */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

          <div className="founder-glow-main absolute right-[4%] top-[12%] h-[760px] w-[760px] rounded-full bg-emerald-500/[0.19] blur-[170px]" />

          <div className="absolute right-[27%] top-[34%] h-[520px] w-[520px] rounded-full bg-teal-500/[0.12] blur-[150px]" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />

          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050907] to-transparent" />
        </div>

        {/* <div className="founder-container relative mx-auto grid w-full max-w-[1600px] items-center px-6 sm:px-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-16"> */}
{/* CENTERED FOUNDER CONTENT */}
<div className="founder-copy relative z-20 mx-auto flex w-full max-w-[760px] flex-col items-start px-6 py-14 text-left lg:py-20">

  {/* SECTION LABEL */}
  <p className="mb-5 flex items-center justify-start gap-4 text-[11px] font-extrabold uppercase tracking-[0.38em] text-emerald-300">
    <span className="h-[3px] w-12 bg-emerald-400" />
    THE PERSON BEHIND THE VISION
  </p>

  <p className="text-base font-semibold text-white/90">
    Meet the Creator
  </p>

  {/* NAME */}
  <h2 className="mt-4 text-6xl font-black leading-[0.94] tracking-[-0.065em] text-white sm:text-7xl lg:text-[5.8rem]">
    Hiren

    <span className="mt-1 block bg-gradient-to-r from-[#00E6A0] via-[#00C98C] to-[#35F0BD] bg-clip-text text-transparent">
      Prajapati.
    </span>
  </h2>

  {/* DESIGNATION */}
  <p className="mt-7 max-w-xl text-base font-bold leading-7 text-white sm:text-lg">
    Developer · Technology Enthusiast · Creator of VELTRIO
  </p>

  {/* ABOUT */}
  <p className="mt-5 max-w-[590px] text-sm leading-7 text-white/80 sm:text-base">
    I'm an Artificial Intelligence and Data Science student passionate about
    technology, programming and building meaningful digital experiences.
  </p>

  <p className="mt-4 max-w-[590px] text-sm leading-7 text-white/80 sm:text-base">
    VELTRIO represents my vision of transforming an idea into a practical
    digital product. Through this project, I explore modern web technologies,
    full-stack development and user-focused design.
  </p>

  {/* FIELD OF STUDY / CURRENT FOCUS */}
  <div className="mt-8 grid w-full max-w-[560px] grid-cols-1 gap-6 text-left sm:grid-cols-2">

    <div className="border-t border-white/20 pt-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-300">
        FIELD OF STUDY
      </p>

      <p className="mt-2 text-sm font-bold leading-6 text-white">
        Artificial Intelligence<br />
        & Data Science
      </p>
    </div>

    <div className="border-t border-white/20 pt-4">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-300">
        CURRENT FOCUS
      </p>

      <p className="mt-2 text-sm font-bold leading-6 text-white">
        Full-Stack Development<br />
        & Product Building
      </p>
    </div>

  </div>

  {/* SOCIAL LINKS */}
  <div className="mt-9 flex flex-wrap justify-start gap-3">

    <a
      href="https://github.com/prajapatihiren904-svg"
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-3 rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-extrabold text-[#04130d] shadow-[0_8px_35px_rgba(16,185,129,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-300"
    >
      <Github size={20} />
      GitHub
      <ArrowUpRight size={17} />
    </a>

    <a
      href="https://www.linkedin.com/in/hiren-prajapati-03bb7b394/"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-3 rounded-xl border border-emerald-400 bg-black/20 px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400/10"
    >
      <Linkedin size={20} />
      LinkedIn
      <ArrowUpRight size={17} />
    </a>

  </div>

  {/* SIGNATURE */}
  <div className="mt-9 w-full max-w-[510px] border-t border-white/20 pt-4 text-left">
    <p className="text-sm text-white/85">
      Designed, developed and brought to life with curiosity.
    </p>

    <p className="mt-1 text-xl font-bold italic text-emerald-300">
      Hiren Prajapati
    </p>
  </div>

</div>
   
   {/* FLOATING BUILT WITH PASSION BADGE */}
<div className="founder-passion-badge absolute right-8 top-[22%] z-30 hidden items-center gap-3 rounded-2xl border border-emerald-400/50 bg-[#061510]/90 px-5 py-4 shadow-[0_10px_45px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:flex lg:right-16">

  <Sparkles
    size={26}
    className="text-emerald-300"
  />

  <div>
    <p className="text-sm font-bold text-white">
      Built with passion
    </p>

    <p className="mt-0.5 text-xs text-white/70">
      Idea into reality
    </p>
  </div>

</div>

            

        {/* FULLSCREEN IMAGE ON CLICK */}
        {isPortraitOpen && (
          <div
            className="founder-lightbox fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#020604]/95 px-4 py-8 backdrop-blur-2xl"
            onClick={() => setIsPortraitOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Hiren Prajapati portrait"
          >

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.20),transparent_65%)]" />

            <button
              type="button"
              onClick={() => setIsPortraitOpen(false)}
              aria-label="Close portrait"
              className="absolute right-6 top-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/30 bg-black/40 text-3xl text-white transition-all duration-300 hover:rotate-90 hover:bg-emerald-400 hover:text-black"
            >
              ×
            </button>

            <img
              src="/images/hiren-profile-cutout.png"
              alt="Hiren Prajapati"
              onClick={(event) => event.stopPropagation()}
              className="founder-lightbox-image relative z-10 max-h-[90vh] max-w-[94vw] object-contain"
            />

            <p className="absolute bottom-6 z-20 text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
              Hiren Prajapati · Creator of VELTRIO
            </p>

          </div>
        )}

      </section>S

      {/* MY JOURNEY */}
      <section className="relative overflow-hidden px-5 py-24 sm:px-10 lg:px-16">
        <div className="relative mx-auto max-w-7xl">

          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-400">
                The journey behind the code
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                From curiosity to creation<span className="text-emerald-400">.</span>
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-content-muted">
              A continuous process of learning, experimenting and turning ideas into useful digital experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: '01',
                title: 'The Beginning',
                text: 'Started exploring programming and discovering the world of technology.',
              },
              {
                number: '02',
                title: 'Learning & Building',
                text: 'Explored Java, programming fundamentals and web development.',
              },
              {
                number: '03',
                title: 'Full-Stack Development',
                text: 'Started working with frontend, backend, databases and application design.',
              },
              {
                number: '04',
                title: 'Building VELTRIO',
                text: 'Turned an idea into a personal finance management platform.',
              },
            ].map((item) => (
              <article
                key={item.number}
                className="about-animated-card about-journey-card group relative min-h-[220px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#101713]/85 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-400/40 hover:shadow-xl hover:shadow-emerald-950/25"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/[0.04] blur-2xl transition-colors group-hover:bg-emerald-400/[0.12]" />

                <div className="relative flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/[0.08] text-sm font-bold text-emerald-300">
                    {item.number}
                  </span>

                  <ArrowUpRight size={18} className="text-white/25 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-emerald-300" />
                </div>

                <h3 className="relative mt-8 text-lg font-semibold text-white">
                  {item.title}
                </h3>

                <p className="relative mt-3 text-sm leading-7 text-content-muted">
                  {item.text}
                </p>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* CREATOR ANIMATIONS */}
      <style>{`
 .founder-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(
      ellipse at 76% 48%,
      rgba(0, 220, 145, 0.19) 0%,
      rgba(0, 120, 85, 0.10) 30%,
      transparent 65%
    ),
    linear-gradient(
      110deg,
      #050907 0%,
      #07130e 55%,
      #06110c 100%
    );
  font-family: 'Poppins', sans-serif;
}

.founder-copy {
  animation: founderCopyReveal 900ms ease-out both;
}

.founder-portrait {
  display: block;
  object-fit: contain;
  object-position: center bottom;
  animation: founderPortraitFloat 7s ease-in-out infinite;
  filter: saturate(1.08) contrast(1.04);
  transition: filter 0.5s ease, transform 0.5s ease;
}

.founder-portrait:hover {
  filter: saturate(1.2) contrast(1.06)
    drop-shadow(0 0 35px rgba(0, 220, 145, 0.15));
}

.founder-image-halo {
  background: rgba(0, 220, 145, 0.23);
  filter: blur(135px);
  animation: founderHalo 7s ease-in-out infinite;
}

.founder-image-halo-secondary {
  animation: founderHalo 9s ease-in-out infinite reverse;
}

.founder-passion-badge {
  border-color: rgba(0, 220, 145, 0.5);
  background: rgba(3, 25, 17, 0.78);
  backdrop-filter: blur(20px);
  animation: founderBadgeFloat 6s ease-in-out infinite;
}

@keyframes founderPortraitFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@keyframes founderHalo {
  0%, 100% {
    opacity: 0.55;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

@keyframes founderBadgeFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-9px);
  }
}

@keyframes founderCopyReveal {
  from {
    opacity: 0;
    transform: translateX(-25px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 1023px) {
  .founder-visual {
    height: 620px;
    max-width: 680px;
  }

  .founder-portrait {
    width: 116%;
    left: -8%;
  }
}

@media (max-width: 640px) {
  .founder-visual {
    height: 470px;
  }

  .founder-portrait {
    width: 116%;
    left: -8%;
  }
}

        .founder-section::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: .035;
          background-image:
            linear-gradient(rgba(16,185,129,.35) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,.35) 1px, transparent 1px);
          background-size: 64px 64px;
        }

        .founder-copy {
          animation: founderCopyReveal 900ms cubic-bezier(.2,.8,.2,1) both;
        }

        .founder-portrait {
          display: block;
          transform-origin: bottom center;
          animation: founderPortraitFloat 7s ease-in-out infinite;
          filter: saturate(1.12) contrast(1.05) drop-shadow(0 18px 55px rgba(0,0,0,.18));
          transition: transform 750ms cubic-bezier(.2,.8,.2,1), filter 750ms ease;
          will-change: transform;
        }

        .founder-portrait:hover {
          transform: translateY(-8px) scale(1.025);
          filter: saturate(1.18) contrast(1.07) drop-shadow(0 22px 65px rgba(16,185,129,.20));
        }

        .founder-glow-main {
          animation: founderGlowPulse 8s ease-in-out infinite;
        }

        .founder-image-halo,
        .founder-image-halo-secondary {
          animation: founderHaloPulse 7s ease-in-out infinite;
        }

        .founder-image-halo-secondary {
          animation-delay: -3.5s;
        }

        .founder-passion-badge {
          animation: founderBadgeFloat 6s ease-in-out infinite;
        }

        .founder-lightbox {
          animation: founderOverlayIn 300ms ease-out both;
        }

        .founder-lightbox-image {
          animation: founderZoomIn 550ms cubic-bezier(.2,.8,.2,1) both;
          filter: drop-shadow(0 20px 70px rgba(16,185,129,.16));
        }

        @keyframes founderPortraitFloat {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes founderCopyReveal {
          from {
            opacity: 0;
            transform: translate3d(-28px,0,0);
          }

          to {
            opacity: 1;
            transform: translate3d(0,0,0);
          }
        }

        @keyframes founderGlowPulse {
          0%,100% {
            opacity: .65;
            transform: scale(.94);
          }

          50% {
            opacity: 1;
            transform: scale(1.07);
          }
        }

        @keyframes founderHaloPulse {
          0%,100% {
            opacity: .55;
            transform: scale(.96);
          }

          50% {
            opacity: 1;
            transform: scale(1.06);
          }
        }

        @keyframes founderBadgeFloat {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-9px);
          }
        }

        @keyframes founderOverlayIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes founderZoomIn {
          from {
            opacity: 0;
            transform: scale(.82);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 1023px) {
          .founder-visual {
            height: 620px;
            max-width: 680px;
          }

          .founder-portrait {
            left: -8%;
            width: 116%;
          }
        }

        @media (max-width: 640px) {
          .founder-visual {
            height: 470px;
            min-height: 0;
          }

          .founder-passion-badge {
            top: 4%;
            right: 0;
            transform: scale(.86);
            transform-origin: top right;
          }

          .founder-portrait {
            left: -8%;
            width: 116%;
            max-height: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .founder-copy,
          .founder-portrait,
          .founder-glow-main,
          .founder-image-halo,
          .founder-image-halo-secondary,
          .founder-passion-badge,
          .founder-lightbox,
          .founder-lightbox-image {
            animation: none !important;
            transition: none !important;
          }
        }
          /* EXACT FOUNDER LAYOUT REFINEMENT */

.founder-section {
  min-height: 900px !important;
  background:
    radial-gradient(
      ellipse at 75% 48%,
      rgba(0, 220, 145, 0.20),
      transparent 55%
    ),
    linear-gradient(
      110deg,
      #050907 0%,
      #07140e 60%,
      #06100b 100%
    ) !important;
  font-family: 'Poppins', sans-serif;
}

.founder-container {
  min-height: 900px !important;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 0;
}

/* LEFT TEXT */

.founder-copy {
  width: 100%;
  max-width: 650px;
  padding-top: 70px !important;
  padding-bottom: 70px !important;
}

.founder-copy > p:first-child {
  font-size: 13px !important;
  letter-spacing: 0.34em !important;
}

.founder-copy h2 {
  font-size: clamp(65px, 6vw, 88px) !important;
  line-height: 0.98 !important;
  letter-spacing: -0.065em !important;
}

.founder-copy > p:nth-of-type(2) {
  font-size: 18px !important;
  line-height: 1.6 !important;
}

.founder-copy > p:nth-of-type(3),
.founder-copy > p:nth-of-type(4) {
  font-size: 16px !important;
  line-height: 1.65 !important;
}

/* STUDY AND FOCUS */

.founder-copy .grid.grid-cols-2 {
  max-width: 570px;
  gap: 36px;
}

.founder-copy .grid.grid-cols-2 p {
  font-size: 15px;
  line-height: 1.6;
}

/* RIGHT PORTRAIT */

.founder-visual {
  position: relative;
  width: 100%;
  height: 900px !important;
  max-width: none !important;
  overflow: visible;
}

.founder-portrait {
  position: absolute !important;
  bottom: 0 !important;
  left: -15% !important;
  width: 130% !important;
  height: 100% !important;
  max-width: none !important;
  object-fit: contain !important;
  object-position: center bottom !important;
  transform-origin: center bottom;
}

/* PASSION BADGE */

.founder-passion-badge {
  top: 15% !important;
  right: 0 !important;
  padding: 16px 22px !important;
}

.founder-passion-badge p:first-child {
  font-size: 15px !important;
}

.founder-passion-badge p:last-child {
  font-size: 13px !important;
}

/* SOCIAL BUTTONS */

.founder-copy a {
  font-size: 15px !important;
  min-height: 55px;
}

.founder-copy a:first-child {
  background: #00dca0 !important;
  color: #03140e !important;
}

.founder-copy a:first-child svg {
  color: #03140e !important;
}

.founder-copy a:last-child {
  border-color: #00dca0 !important;
  color: white !important;
}

/* TABLET */

@media (max-width: 1023px) {
  .founder-section {
    min-height: auto !important;
  }

  .founder-container {
    min-height: auto !important;
    grid-template-columns: 1fr !important;
  }

  .founder-visual {
    height: 650px !important;
    max-width: 700px !important;
    margin: auto;
  }

  .founder-portrait {
    left: -8% !important;
    width: 116% !important;
  }

  .founder-copy {
    order: 2;
    padding: 50px 0 !important;
  }
}

/* MOBILE */

@media (max-width: 640px) {
  .founder-visual {
    height: 470px !important;
  }

  .founder-copy h2 {
    font-size: 58px !important;
  }

  .founder-copy > p:nth-of-type(3),
  .founder-copy > p:nth-of-type(4) {
    font-size: 14px !important;
  }
}

/* NATURAL GREEN FOG — NO BLACK BAND */

.founder-visual {
  position: relative;
  isolation: isolate;
  overflow: visible !important;
}

/* Softer portrait bottom fade */
.founder-portrait {
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 88%,
    rgba(0, 0, 0, 0.8) 94%,
    transparent 100%
  );

  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 88%,
    rgba(0, 0, 0, 0.8) 94%,
    transparent 100%
  );
}

/* Remove previous dark overlay and use soft green fog */
.founder-visual::after {
  content: "";
  position: absolute;
  z-index: 15;
  pointer-events: none;
  left: -35%;
  right: -35%;
  bottom: -20px;
  height: 200px;

  background: radial-gradient(
    ellipse at center,
    rgba(0, 210, 135, 0.22) 0%,
    rgba(0, 150, 100, 0.12) 35%,
    transparent 75%
  );

  filter: blur(35px);
}

/* Natural green atmosphere */
.founder-image-halo-secondary {
  background: rgba(0, 210, 135, 0.18) !important;
  filter: blur(150px) !important;
  opacity: 0.75;
} 
      `}</style>

      

      {/* PROJECT INFORMATION */}
      <section className="px-5 pb-24 sm:px-10 lg:px-16">
        <div className="about-animated-card about-project-card mx-auto max-w-6xl rounded-2xl border border-white/[0.08] bg-[#111815]/70 p-7 sm:p-9">

          <div className="mb-7 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-400">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Project information
              </h2>

              <p className="text-xs text-content-muted">
                A closer look at the VELTRIO project.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Project', 'VELTRIO'],
              ['Category', 'Personal Finance Management'],
              ['Version', '1.0.0'],
              ['Developer', 'Hiren Prajapati'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-content-muted">{label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#080d0b]/90 px-5 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row">

          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500 p-2 text-[#042c22]">
                <Wallet size={19} />
              </div>

              <span className="text-xl font-bold tracking-wide">
                VELTRIO
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-content-muted">
              Your personal financial workspace.
              Manage your money with clarity and confidence.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-content-muted">
            <Link to="/dashboard" className="transition hover:text-emerald-400">
              Dashboard
            </Link>

            <Link to="/profile" className="transition hover:text-emerald-400">
              Profile
            </Link>

            <a href="#our-story" className="transition hover:text-emerald-400">
              Our Story
            </a>

            <a
              href="mailto:prajapatihiren904@gmail.com"
              className="transition hover:text-emerald-400"
            >
              Contact
            </a>
          </div>
        </div>

        <div className="mx-auto mt-9 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/[0.07] pt-6 text-xs text-content-muted sm:flex-row">
          <p>© 2026 VELTRIO. All rights reserved.</p>
          <p>Designed & Developed with care by Hiren Prajapati.</p>
        </div>
      </footer>

      {/* GENERAL ANIMATION + PREMIUM BACKGROUND + BOX MOTION */}
      <style>{`
        .veltrio-about-page {
          position: relative;
          isolation: isolate;
          background: #070d0a;
        }

        /* HERO: cinematic emerald atmosphere and floating dashboard */
        .about-hero-visual {
          perspective: 1200px;
          isolation: isolate;
        }

        .about-hero-aura {
          background: radial-gradient(ellipse, rgba(0, 230, 160, .22) 0%, rgba(0, 150, 105, .12) 38%, transparent 72%);
          animation: heroAuraBreathe 8s ease-in-out infinite alternate;
        }

        .about-dashboard-panel {
          transform: translate3d(0, 0, 0);
          animation: dashboardFloat 7s ease-in-out infinite;
          transition: border-color .45s ease, box-shadow .45s ease, transform .45s ease;
          box-shadow: 0 28px 80px rgba(0,0,0,.32), 0 0 55px rgba(0,210,145,.07);
        }

        .about-dashboard-panel:hover {
          animation-play-state: paused;
          transform: translateY(-8px) rotateX(1deg);
          border-color: rgba(0,230,160,.48);
          box-shadow: 0 35px 90px rgba(0,0,0,.38), 0 0 65px rgba(0,210,145,.14);
        }

        .about-dashboard-intro {
          position: relative;
          overflow: hidden;
          background: linear-gradient(120deg, rgba(255,255,255,.045), rgba(0,220,145,.035), rgba(255,255,255,.02));
        }

        .about-dashboard-intro::after {
          content: "";
          position: absolute;
          inset: 0 auto 0 -80%;
          width: 55%;
          pointer-events: none;
          transform: skewX(-22deg);
          background: linear-gradient(90deg, transparent, rgba(0,230,160,.09), transparent);
          animation: dashboardSheen 7s ease-in-out infinite;
        }

        .about-dashboard-tile {
          position: relative;
          overflow: hidden;
          animation: dashboardTileIn .7s cubic-bezier(.2,.75,.25,1) both;
          transition: transform .3s ease, border-color .3s ease, background .3s ease, box-shadow .3s ease;
        }

        .about-dashboard-tile:hover {
          transform: translateY(-5px) scale(1.025);
          border-color: rgba(0,230,160,.55);
          background: rgba(0,220,145,.075);
          box-shadow: 0 10px 28px rgba(0,210,145,.10);
        }

        .about-dashboard-tile svg { transition: transform .3s ease, filter .3s ease; }
        .about-dashboard-tile:hover svg { transform: scale(1.16); filter: drop-shadow(0 0 7px rgba(0,230,160,.55)); }

        @keyframes dashboardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes heroAuraBreathe {
          from { opacity: .55; transform: scale(.92); }
          to { opacity: 1; transform: scale(1.08); }
        }
        @keyframes dashboardSheen {
          0%, 58% { left: -80%; opacity: 0; }
          68% { opacity: 1; }
          88%, 100% { left: 145%; opacity: 0; }
        }
        @keyframes dashboardTileIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .veltrio-about-page::before,
        .veltrio-about-page::after {
          content: "";
          position: fixed;
          inset: -20%;
          z-index: -1;
          pointer-events: none;
        }

        .veltrio-about-page::before {
          background: radial-gradient(ellipse at 12% 18%, rgba(0, 220, 145, .13), transparent 34%),
                      radial-gradient(ellipse at 88% 42%, rgba(0, 170, 120, .12), transparent 38%),
                      radial-gradient(ellipse at 48% 92%, rgba(0, 120, 85, .10), transparent 36%);
          filter: blur(28px);
          animation: aboutAmbientDrift 18s ease-in-out infinite alternate;
        }

        .veltrio-about-page::after {
          inset: 0;
          opacity: .10;
          background-image: linear-gradient(rgba(16,185,129,.20) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(16,185,129,.20) 1px, transparent 1px);
          background-size: 58px 58px;
          mask-image: linear-gradient(to bottom, black, transparent 92%);
        }

        .about-animated-card {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          transform: translateY(0);
          border-color: rgba(148, 163, 184, .19);
          background: linear-gradient(145deg, rgba(16, 27, 22, .94), rgba(8, 17, 13, .90));
          box-shadow: 0 12px 35px rgba(0,0,0,.12);
          animation: aboutCardReveal .75s cubic-bezier(.2,.75,.25,1) both;
          transition: transform .45s cubic-bezier(.2,.8,.2,1),
                      border-color .45s ease, box-shadow .45s ease, background .45s ease;
        }

        .about-animated-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          z-index: -1;
          pointer-events: none;
          opacity: 0;
          background: radial-gradient(circle at 50% 0%, rgba(0,230,160,.17), transparent 65%);
          transition: opacity .45s ease;
        }

        .about-animated-card::after {
          content: "";
          position: absolute;
          top: -130%;
          left: -60%;
          width: 45%;
          height: 360%;
          pointer-events: none;
          opacity: 0;
          transform: rotate(25deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.07), transparent);
          transition: left .8s ease, opacity .35s ease;
        }

        .about-animated-card:hover {
          transform: translateY(-9px) scale(1.012);
          border-color: rgba(0, 230, 160, .48);
          box-shadow: 0 22px 55px rgba(0, 190, 130, .12), 0 8px 24px rgba(0,0,0,.22);
        }

        .about-animated-card:hover::before { opacity: 1; }
        .about-animated-card:hover::after { left: 125%; opacity: 1; }

        .about-feature-card:nth-child(2), .about-tech-card:nth-child(2), .about-journey-card:nth-child(2) { animation-delay: .08s; }
        .about-feature-card:nth-child(3), .about-tech-card:nth-child(3), .about-journey-card:nth-child(3) { animation-delay: .16s; }
        .about-feature-card:nth-child(4), .about-tech-card:nth-child(4), .about-journey-card:nth-child(4) { animation-delay: .24s; }
        .about-feature-card:nth-child(5) { animation-delay: .32s; }
        .about-feature-card:nth-child(6) { animation-delay: .40s; }

        @keyframes aboutAmbientDrift {
          0% { transform: translate3d(-1%, -1%, 0) scale(1); }
          50% { transform: translate3d(1.5%, 1%, 0) scale(1.04); }
          100% { transform: translate3d(-.5%, 2%, 0) scale(1.02); }
        }

        @keyframes aboutCardReveal {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* REFERENCE-STYLE MOVING ORBIT BACKGROUND */
        .about-orbit-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          opacity: .72;
          contain: strict;
        }
        .about-orbit-svg { width: 100%; height: 100%; overflow: visible; }
        .about-orbit-path {
          fill: none;
          stroke: rgba(0, 224, 153, .27);
          stroke-width: 1.35;
          stroke-dasharray: 7 12;
          vector-effect: non-scaling-stroke;
          animation: orbitDash 34s linear infinite;
        }
        .about-orbit-path-two { stroke: rgba(0, 190, 135, .18); stroke-dasharray: 3 15; animation-duration: 46s; animation-direction: reverse; }
        .about-orbit-path-three { stroke: rgba(0, 230, 160, .13); stroke-dasharray: 2 10; animation-duration: 55s; }
        .about-particle {
          position: absolute;
          width: 4px; height: 4px; border-radius: 50%;
          background: #39e6b0;
          box-shadow: 0 0 12px 3px rgba(0, 230, 160, .38);
          animation: particleDrift 8s ease-in-out infinite;
        }
        .about-particle-one { left: 8%; top: 54%; animation-delay: -2s; }
        .about-particle-two { left: 28%; top: 78%; width: 3px; height: 3px; animation-delay: -5s; }
        .about-particle-three { left: 57%; top: 38%; animation-delay: -3s; }
        .about-particle-four { left: 83%; top: 22%; width: 3px; height: 3px; animation-delay: -6s; }
        .about-particle-five { left: 92%; top: 72%; animation-delay: -1s; }
        .about-feature-card {
          border-color: rgba(0, 218, 148, .22) !important;
          background: linear-gradient(145deg, rgba(5, 24, 17, .82), rgba(5, 14, 11, .91)) !important;
          backdrop-filter: blur(10px);
        }
        .about-feature-card:hover {
          border-color: rgba(0, 238, 166, .62) !important;
          background: linear-gradient(145deg, rgba(7, 43, 29, .94), rgba(5, 20, 14, .96)) !important;
          box-shadow: 0 20px 55px rgba(0, 210, 145, .14), inset 0 1px 0 rgba(100,255,205,.10) !important;
        }
        .about-feature-card .rounded-xl {
          border-color: rgba(0, 220, 150, .24) !important;
          box-shadow: 0 0 22px rgba(0, 220, 150, .045);
        }
        @keyframes orbitDash { to { stroke-dashoffset: -420; } }
        @keyframes particleDrift {
          0%, 100% { transform: translate3d(0, 0, 0); opacity: .25; }
          50% { transform: translate3d(12px, -22px, 0); opacity: .95; }
        }

        @media (prefers-reduced-motion: reduce) {
          .about-orbit-path, .about-particle { animation: none !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .veltrio-about-page::before, .about-animated-card, .about-dashboard-panel, .about-hero-aura, .about-dashboard-tile, .about-dashboard-intro::after { animation: none !important; }
          .about-animated-card, .about-animated-card::before, .about-animated-card::after, .about-dashboard-panel, .about-dashboard-tile { transition: none !important; }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

    </main>
  );
}

export default AboutPage;