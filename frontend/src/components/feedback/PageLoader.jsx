import Spinner from '@/components/common/Spinner';

/** Full-area loading state, used as the Suspense fallback for lazy routes. */
export default function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner size="lg" label="Loading page" />
    </div>
  );
}
