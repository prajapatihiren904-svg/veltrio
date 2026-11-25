import { Link } from 'react-router-dom';
import Logo from '@/components/common/Logo';
import { ROUTES } from '@/constants/routes';
import SidebarNav from './SidebarNav';

/** Fixed desktop sidebar (visible from the lg breakpoint up). Phones use MobileDrawer. */
export default function Sidebar({ sections }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-header shrink-0 items-center border-b border-line px-5">
        <Link to={ROUTES.home} aria-label="VELTRIO home" className="rounded-control">
          <Logo />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <SidebarNav sections={sections} />
      </div>
    </aside>
  );
}
