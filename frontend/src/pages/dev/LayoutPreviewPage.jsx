import { Wallet } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/feedback/EmptyState';
import Skeleton from '@/components/feedback/Skeleton';
import Input from '@/components/forms/Input';

const copy = {
  app: { title: 'App layout preview', description: 'Sidebar on desktop, drawer on phones. Real pages replace this content from Phase 3.' },
  admin: { title: 'Admin layout preview', description: 'Same shell as the app with admin navigation and an Admin badge.' },
};

function ShellPreview({ variant }) {
  return (
    <>
      <PageHeader title={copy[variant].title} description={copy[variant].description} actions={<Button size="sm">Primary action</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-4 h-8 w-32" />
            <Skeleton className="mt-3 h-3 w-24" />
          </Card>
        ))}
      </div>
      <Card className="mt-4" padded={false}>
        <EmptyState icon={Wallet} title="Content area" description="Cards, tables and charts will live here." />
      </Card>
    </>
  );
}

function AuthPreview() {
  return (
    <Card>
      <h1 className="text-2xl font-semibold">Auth layout preview</h1>
      <p className="mt-1.5 text-sm text-content-muted">Login and register forms render here from Phase 2.</p>
      <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Input label="Password" type="password" placeholder="••••••••" />
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Card>
  );
}

/** Developer-only page that fills each layout so responsive behavior can be checked. */
export default function LayoutPreviewPage({ variant = 'app' }) {
  return variant === 'auth' ? <AuthPreview /> : <ShellPreview variant={variant} />;
}
