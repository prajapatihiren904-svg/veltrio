import { useEffect, useRef } from 'react';

const PARTICLES = [
  [8, 15], [23, 42], [37, 8], [55, 71],
  [68, 29], [81, 56], [91, 12], [14, 83],
  [46, 90], [72, 78], [29, 60], [60, 48],
  [85, 35], [5, 50], [95, 65], [42, 25],
  [76, 92], [18, 70], [33, 32], [52, 18],
  [88, 84], [12, 62], [63, 10], [74, 44]
];

export default function GlobalFinanceBackground() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    if (reducedMotion.matches) return;

    let frame = 0;

    const handlePointerMove = (event) => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;

        root.style.setProperty('--mouse-x', x.toFixed(3));
        root.style.setProperty('--mouse-y', y.toFixed(3));
      });
    };

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="gfb-root"
      aria-hidden="true"
    >
      {/* Background base */}
      <div className="gfb-base" />

      {/* Animated financial grid */}
      <div className="gfb-grid" />

      {/* Aurora-inspired glowing atmosphere */}
      <div className="gfb-aurora-css">
        <div className="gfb-wave gfb-wave-one" />
        <div className="gfb-wave gfb-wave-two" />
        <div className="gfb-wave gfb-wave-three" />
      </div>

      {/* Floating emerald orbs */}
      <div className="gfb-orb gfb-orb--1" />
      <div className="gfb-orb gfb-orb--2" />
      <div className="gfb-orb gfb-orb--3" />

      {/* Orbital rings */}
      <div className="gfb-rings">
        <div className="gfb-ring gfb-ring--a" />
        <div className="gfb-ring gfb-ring--b" />
        <div className="gfb-ring gfb-ring--c" />
      </div>

      {/* Animated financial chart */}
      <svg
        className="gfb-chart"
        viewBox="0 0 900 220"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          className="gfb-chart__glow"
          d="M0 180 C60 170 120 100 200 95 C280 90 320 145 400 130 C480 115 540 60 620 50 C700 40 760 90 840 80 L900 75"
          strokeLinecap="round"
        />

        <path
          className="gfb-chart__line"
          d="M0 180 C60 170 120 100 200 95 C280 90 320 145 400 130 C480 115 540 60 620 50 C700 40 760 90 840 80 L900 75"
          strokeLinecap="round"
        />
      </svg>

      {/* Floating particles */}
      <div className="gfb-particles">
        {PARTICLES.map(([left, top], index) => (
          <span
            key={index}
            className={`gfb-particle ${
              index % 3 === 0
                ? 'gfb-particle--md'
                : 'gfb-particle--sm'
            }`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${(index * 0.47) % 7}s`,
              animationDuration: `${7 + (index % 5) * 2}s`
            }}
          />
        ))}
      </div>

      {/* Bottom ambient glow */}
      <div className="gfb-bottom-glow" />
    </div>
  );
}