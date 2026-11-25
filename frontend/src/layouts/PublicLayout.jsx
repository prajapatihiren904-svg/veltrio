import { Outlet } from 'react-router-dom';

import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/layout/PageTransition';
import PublicNavbar from '@/components/layout/PublicNavbar';
import SkipLink from '@/components/layout/SkipLink';

/**
 * Public layout – used for the landing page, features, how-it-works, about,
 * and FAQ routes.
 *
 * The global animated background (GlobalFinanceBackground) is mounted once at
 * the App root and persists across all routes.  This layout no longer renders
 * its own Aurora instance; it simply positions its content above the global
 * background with z-10.
 */
export default function PublicLayout() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <SkipLink />

      <PublicNavbar />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <Footer />
    </div>
  );
}
