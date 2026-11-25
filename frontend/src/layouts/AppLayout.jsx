import AppShell from '@/components/layout/AppShell';
import { adminNavSections, userNavSections } from '@/constants/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();

  const navSections = user?.role === 'admin'
    ? [...userNavSections, ...adminNavSections]
    : userNavSections;

  return <AppShell navSections={navSections} area="user" />;
}