import { useState } from 'react';
import { Menu, LogOut, UserRound } from 'lucide-react';
import Badge from '@/components/common/Badge';
import { useAuth } from '@/contexts/AuthContext';

export default function TopBar({ onMenuClick, area = 'user' }) {
  const { logout, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-header items-center justify-between border-b border-line bg-canvas/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="ml-2 rounded-control p-2 text-content-muted transition-colors hover:bg-surface-overlay hover:text-content lg:hidden"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">

          {area === 'admin' && (
            <Badge tone="warning">Admin</Badge>
          )}

          <div className="hidden items-center gap-2 sm:flex">
            <UserRound size={17} className="text-brand-400" />
            <span className="text-sm text-content">
              {user?.name || 'Account'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 rounded-control border border-line px-3 py-2 text-sm text-content-muted transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            title="Logout"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

        </div>
      </header>

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogoutConfirm(false);
            }
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
            <div className="mb-4 flex items-center gap-3">
              <LogOut className="text-red-400" size={24} />
              <h2 id="logout-title" className="text-lg font-semibold">
                Confirm Logout
              </h2>
            </div>

            <p className="mb-6 text-sm text-content-muted">
              Are you sure you want to logout from your VELTRIO account?
            </p>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-lg border border-line px-4 py-2 text-sm transition-colors hover:bg-surface-overlay"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600"
              >
                Yes, Logout
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
