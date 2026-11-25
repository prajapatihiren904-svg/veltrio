import AppShell from '@/components/layout/AppShell';
import { adminNavSections } from '@/constants/navigation';

/** Shell for the admin area. Protected by AdminRoute from Phase 2. */
export default function AdminLayout() {
  return <AppShell navSections={adminNavSections} area="admin" />;
}
