import { useEffect, useRef } from 'react';

/**
 * Decorative, pointer-safe finance atmosphere.
 * CSS-only motion keeps the background lightweight and independent of app data.
 */
export default function AnimatedFinanceBackground() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY * 0.12, 140);
        root.style.setProperty('--finance-scroll', `${offset}px`);
        frame = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="finance-atmosphere" aria-hidden="true">
      <div className="finance-atmosphere__grid" />
      <div className="finance-orb finance-orb--one" />
      <div className="finance-orb finance-orb--two" />
      <div className="finance-orb finance-orb--three" />
      <div className="finance-ring finance-ring--one" />
      <div className="finance-ring finance-ring--two" />
      <div className="finance-particles">
        {Array.from({ length: 18 }, (_, index) => (
          <span key={index} style={{ '--particle-index': index }} />
        ))}
      </div>
      <svg className="finance-chart-line" viewBox="0 0 720 260" fill="none">
        <path d="M5 210 C85 205 90 160 155 174 S245 205 300 135 S390 145 445 90 S540 120 590 55 S660 60 715 12" />
        <path className="finance-chart-line__glow" d="M5 210 C85 205 90 160 155 174 S245 205 300 135 S390 145 445 90 S540 120 590 55 S660 60 715 12" />
      </svg>
    </div>
  );
}
