import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';

export default function SessionPage() {
  const { user, logout } = useAuth();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Welcome, ${user?.name?.split(' ')[0] || 'back'}`} description="Your VELTRIO account is authenticated and ready." />
      <Card>
        <p className="text-sm text-content-muted">Signed in as</p>
        <p className="mt-1 font-medium">{user?.email}</p>
        <p className="mt-3 text-sm text-content-muted">Role: <span className="text-content">{user?.role}</span></p>
        <Button className="mt-6" variant="secondary" onClick={logout}>Sign out</Button>
      </Card>
    </div>
  );
}
