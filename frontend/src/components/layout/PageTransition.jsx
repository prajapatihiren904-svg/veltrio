import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/** Fades and lifts page content in on every route change. Disabled for reduced-motion users. */
export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
