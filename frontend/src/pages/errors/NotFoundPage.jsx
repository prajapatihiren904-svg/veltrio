import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-content flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-display text-7xl font-bold text-gradient sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">Page not found</h1>
      <p className="mt-2 max-w-md text-content-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <Button as={Link} to={ROUTES.home} className="mt-8">
        <Home className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Button>
    </section>
  );
}
