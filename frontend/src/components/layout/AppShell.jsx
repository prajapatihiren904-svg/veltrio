import { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { IS_DEV } from '@/constants/app';
import { filterNavSections } from '@/constants/navigation';
import { useDisclosure } from '@/hooks/useDisclosure';
import MobileDrawer from './MobileDrawer';
import PageTransition from './PageTransition';
import Sidebar from './Sidebar';
import SkipLink from './SkipLink';
import TopBar from './TopBar';

export default function AppShell({ navSections, area = 'user' }) {
  const { pathname } = useLocation();
  const drawer = useDisclosure();

  const sections = useMemo(
    () => filterNavSections(navSections, IS_DEV),
    [navSections]
  );

  useEffect(() => {
    drawer.close();
  }, [pathname, drawer.close]);

  return (
    <div className="relative z-10 min-h-screen w-full min-w-0 overflow-x-clip">
      <SkipLink />

      <Sidebar sections={sections} />

      <div className="min-w-0 w-full lg:pl-sidebar">
        <TopBar onMenuClick={drawer.open} area={area} />

        <main
          id="main-content"
          tabIndex={-1}
          className="
            mx-auto w-full min-w-0 max-w-content
            overflow-x-clip
            px-4 py-6
            sm:px-6
            lg:px-8 lg:py-8
          "
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      <MobileDrawer
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        sections={sections}
      />
    </div>
  );
}