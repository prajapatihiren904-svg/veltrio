import { useEffect, useRef } from 'react';

export default function AnimatedFinanceBackground() {
  const backgroundRef = useRef(null);

  useEffect(() => {
    let frameId;

    const updateBackground = () => {
      cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        if (!backgroundRef.current) return;

        const scrollY = window.scrollY;

        backgroundRef.current.style.setProperty(
          '--scroll-y',
          `${scrollY}`
        );
      });
    };

    window.addEventListener('scroll', updateBackground, {
      passive: true,
    });

    updateBackground();

    return () => {
      window.removeEventListener('scroll', updateBackground);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={backgroundRef}
      aria-hidden="true"
      className="veltrio-universe pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <style>{`

        .veltrio-universe {
          --scroll-y: 0;
          background: #050807;
          isolation: isolate;
        }

        /* ATMOSPHERIC LIGHT */

        .universe-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          will-change: transform;
        }

        .universe-glow-one {
          width: 520px;
          height: 520px;
          left: -180px;
          top: 5%;
          background: rgba(0, 255, 170, .12);
          transform: translate3d(
            0,
            calc(var(--scroll-y) * -.12px),
            0
          );
          animation: universe-float-one 18s ease-in-out infinite alternate;
        }

        .universe-glow-two {
          width: 480px;
          height: 480px;
          right: -170px;
          top: 30%;
          background: rgba(0, 190, 160, .11);
          transform: translate3d(
            0,
            calc(var(--scroll-y) * -.2px),
            0
          );
          animation: universe-float-two 22s ease-in-out infinite alternate;
        }

        .universe-glow-three {
          width: 400px;
          height: 400px;
          left: 35%;
          bottom: -180px;
          background: rgba(16, 185, 129, .09);
          transform: translate3d(
            0,
            calc(var(--scroll-y) * -.08px),
            0
          );
          animation: universe-float-three 20s ease-in-out infinite alternate;
        }

        /* FINANCIAL GRID */

        .universe-grid {
          position: absolute;
          inset: -20%;
          opacity: .17;
          background-image:
            linear-gradient(rgba(16,185,129,.13) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,.13) 1px, transparent 1px);
          background-size: 65px 65px;
          transform: translateY(
            calc(var(--scroll-y) * -.035px)
          );
          mask-image: radial-gradient(ellipse at center, black, transparent 75%);
        }

        /* DATA RINGS */

        .universe-ring {
          position: absolute;
          border: 1px solid rgba(16,185,129,.12);
          border-radius: 50%;
          box-shadow:
            0 0 30px rgba(16,185,129,.025),
            inset 0 0 30px rgba(16,185,129,.025);
        }

        .universe-ring-one {
          width: 460px;
          height: 460px;
          right: -180px;
          top: 10%;
          transform: translateY(
            calc(var(--scroll-y) * -.16px)
          );
          animation: ring-rotate 65s linear infinite;
        }

        .universe-ring-two {
          width: 300px;
          height: 300px;
          left: -130px;
          top: 55%;
          transform: translateY(
            calc(var(--scroll-y) * -.22px)
          );
          animation: ring-rotate 48s linear infinite reverse;
        }

        .universe-ring-three {
          width: 180px;
          height: 180px;
          right: 18%;
          bottom: -70px;
          transform: translateY(
            calc(var(--scroll-y) * -.12px)
          );
          animation: ring-rotate 35s linear infinite;
        }

        /* FLOATING DATA PARTICLES */

        .universe-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 12px 3px rgba(16,185,129,.35);
          animation: particle-float 9s ease-in-out infinite alternate;
        }

        .particle-one {
          left: 12%;
          top: 24%;
        }

        .particle-two {
          left: 76%;
          top: 18%;
          animation-delay: -3s;
        }

        .particle-three {
          left: 42%;
          top: 65%;
          animation-delay: -5s;
        }

        .particle-four {
          left: 88%;
          top: 75%;
          animation-delay: -2s;
        }

        .particle-five {
          left: 24%;
          top: 84%;
          animation-delay: -6s;
        }

        /* FINANCIAL GRAPH */

        .universe-chart {
          position: absolute;
          width: min(850px, 90vw);
          height: 250px;
          left: 50%;
          top: 35%;
          opacity: .13;
          transform:
            translate(-50%, -50%)
            translateY(calc(var(--scroll-y) * -.07px));
        }

        .universe-chart path {
          fill: none;
          stroke: #10b981;
          stroke-width: 1.3;
          stroke-dasharray: 8 12;
          animation: chart-flow 22s linear infinite;
        }

        .universe-chart circle {
          fill: #34d399;
          filter: drop-shadow(0 0 7px #10b981);
        }

        /* ATMOSPHERIC VIGNETTE */

        .universe-vignette {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at center, transparent 20%, #050807 100%),
            linear-gradient(to bottom, rgba(5,8,7,.05), rgba(5,8,7,.5));
        }

        @keyframes universe-float-one {
          from { translate: 0 0; }
          to { translate: 90px 65px; }
        }

        @keyframes universe-float-two {
          from { translate: 0 0; }
          to { translate: -80px 75px; }
        }

        @keyframes universe-float-three {
          from { translate: 0 0; }
          to { translate: 70px -55px; }
        }

        @keyframes ring-rotate {
          to { rotate: 360deg; }
        }

        @keyframes particle-float {
          from {
            opacity: .2;
            translate: 0 15px;
          }
          to {
            opacity: .9;
            translate: 15px -35px;
          }
        }

        @keyframes chart-flow {
          to { stroke-dashoffset: -400; }
        }

        @media (max-width: 768px) {
          .universe-ring-one {
            width: 280px;
            height: 280px;
          }

          .universe-ring-two {
            width: 190px;
            height: 190px;
          }

          .universe-chart {
            opacity: .08;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .veltrio-universe *,
          .veltrio-universe *::before {
            animation: none !important;
            transition: none !important;
          }
        }

      `}</style>

      <div className="universe-glow universe-glow-one" />
      <div className="universe-glow universe-glow-two" />
      <div className="universe-glow universe-glow-three" />

      <div className="universe-grid" />

      <div className="universe-ring universe-ring-one" />
      <div className="universe-ring universe-ring-two" />
      <div className="universe-ring universe-ring-three" />

      {/* Financial data flow */}

      <svg
        className="universe-chart"
        viewBox="0 0 850 250"
        preserveAspectRatio="none"
      >
        <path d="M0 190 L100 170 L170 200 L260 115 L340 145 L430 75 L520 120 L610 45 L700 80 L850 15" />

        <path d="M0 225 L100 205 L170 215 L260 175 L340 185 L430 140 L520 165 L610 110 L700 130 L850 90" />

        <circle cx="610" cy="45" r="4" />
        <circle cx="430" cy="75" r="3" />
        <circle cx="850" cy="15" r="4" />
      </svg>

      <div className="universe-particle particle-one" />
      <div className="universe-particle particle-two" />
      <div className="universe-particle particle-three" />
      <div className="universe-particle particle-four" />
      <div className="universe-particle particle-five" />

      <div className="universe-vignette" />
    </div>
  );
}