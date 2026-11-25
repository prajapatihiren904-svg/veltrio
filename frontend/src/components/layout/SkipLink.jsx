// Keyboard users can jump straight to the page content.
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only rounded-control bg-brand-500 px-4 py-2 text-sm font-semibold text-brand-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
    >
      Skip to content
    </a>
  );
}
