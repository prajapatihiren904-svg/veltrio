import AppToaster from '@/components/feedback/AppToaster';
import ErrorBoundary from '@/components/feedback/ErrorBoundary';
import GlobalFinanceBackground from '@/components/GlobalFinanceBackground';
import AppRouter from '@/routes/AppRouter';

export default function App() {
  return (
    <ErrorBoundary>
      {/*
        GlobalFinanceBackground is rendered here — above ErrorBoundary's children
        in the DOM but below all UI via its own fixed z-index (gfb-root class).
        It never unmounts during route navigation, achieving a single persistent
        WebGL context for the entire app lifetime.
      */}
      <GlobalFinanceBackground />
      <AppRouter />
      <AppToaster />
    </ErrorBoundary>
  );
}
