import { Toaster } from 'react-hot-toast';

// Toast styling uses the design-token CSS variables, so it follows the palette automatically.
// Trigger toasts anywhere with: import toast from 'react-hot-toast'; toast.success('Saved').
export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgb(var(--color-surface-overlay))',
          color: 'rgb(var(--color-content))',
          border: '1px solid rgb(var(--color-line))',
          borderRadius: 'var(--radius-control)',
          fontSize: '0.875rem',
        },
        success: { iconTheme: { primary: 'rgb(var(--color-success))', secondary: 'rgb(var(--color-canvas))' } },
        error: { iconTheme: { primary: 'rgb(var(--color-danger))', secondary: 'rgb(var(--color-canvas))' } },
      }}
    />
  );
}
