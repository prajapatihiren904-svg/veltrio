import { useCallback, useEffect, useState } from 'react';

import {
  Monitor,
  Smartphone,
  Tablet,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Clock3,
  Globe2,
  Laptop,
} from 'lucide-react';

import toast from 'react-hot-toast';

import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

import { sessionService } from '@/services/sessionService';
import { useAuth } from '@/contexts/AuthContext';

function getDeviceIcon(device) {
  if (device === 'Mobile') return Smartphone;
  if (device === 'Tablet') return Tablet;

  return Monitor;
}

function formatDate(value) {
  if (!value) return 'Unknown';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function LoginSessionsPanel() {
 const { clearSession } = useAuth();

  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadSessions = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await sessionService.getSessions();

      setSessions(result);
    } catch (error) {
      toast.error(
        error.message || 'Unable to load sessions'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const revokeOne = async (session) => {
    const confirmed = window.confirm(
      `Sign out this ${session.device} session?`
    );

    if (!confirmed) return;

    setProcessing(true);

    try {
      await sessionService.revokeSession(session.id);

      toast.success('Device signed out successfully');

      if (session.isCurrent) {
        await logout();
        return;
      }

      await loadSessions(true);
    } catch (error) {
      toast.error(
        error.message || 'Unable to revoke session'
      );
    } finally {
      setProcessing(false);
    }
  };

  const revokeOthers = async () => {
    const confirmed = window.confirm(
      'Sign out from all other devices? Your current device will remain signed in.'
    );

    if (!confirmed) return;

    setProcessing(true);

    try {
      const result =
        await sessionService.revokeOtherSessions();

      toast.success(
        result.message || 'Other devices signed out successfully'
      );

      await loadSessions(true);
    } catch (error) {
      toast.error(
        error.message || 'Unable to revoke other sessions'
      );
    } finally {
      setProcessing(false);
    }
  };

  const revokeAll = async () => {
    const confirmed = window.confirm(
      'Sign out from every device? You will need to sign in again.'
    );

    if (!confirmed) return;

    setProcessing(true);

    try {
      await sessionService.revokeAllSessions();

      toast.success('All sessions have been signed out');

      await logout();
    } catch (error) {
      toast.error(
        error.message || 'Unable to revoke sessions'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="space-y-6 p-5 sm:p-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-400">
            <ShieldCheck size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Login sessions
            </h2>

            <p className="text-xs text-content-muted">
              Manage devices connected to your account.
            </p>
          </div>

        </div>

        <Button
          type="button"
          variant="secondary"
          loading={refreshing}
          onClick={() => loadSessions(true)}
        >
          <RefreshCw size={15} />
          Refresh
        </Button>

      </div>

      <div className="grid gap-3 sm:grid-cols-2">

        <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/[0.05] p-4">
          <p className="text-xs text-content-muted">
            Active devices
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            {loading ? '—' : sessions.length}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface-overlay/30 p-4">
          <p className="text-xs text-content-muted">
            Current device
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {loading
              ? '—'
              : sessions.some((session) => session.isCurrent)
                ? 'Active'
                : 'Unknown'}
          </p>
        </div>

      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-content-muted">
          Loading your active sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">

          <ShieldCheck
            size={32}
            className="mx-auto text-content-muted"
          />

          <p className="mt-3 font-medium text-white">
            No active sessions found
          </p>

          <p className="mt-1 text-xs text-content-muted">
            Your active device sessions will appear here.
          </p>

        </div>
      ) : (
        <div className="space-y-3">

          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device);

            return (
              <div
                key={session.id}
                className={`rounded-xl border p-4 transition-colors ${
                  session.isCurrent
                    ? 'border-emerald-400/30 bg-emerald-500/[0.05]'
                    : 'border-line bg-surface-overlay/30 hover:border-emerald-400/20'
                }`}
              >

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                  <div className="flex min-w-0 gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      <DeviceIcon size={21} />
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="font-semibold text-white">
                          {session.device}
                        </p>

                        {session.isCurrent && (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                            This device
                          </span>
                        )}

                      </div>

                      <p className="mt-1 text-xs text-content-muted">
                        {session.browser} · {session.operatingSystem}
                      </p>

                      <div className="mt-3 space-y-2">

                        <p className="flex items-center gap-2 text-xs text-content-muted">
                          <Globe2 size={13} />
                          IP: {session.ipAddress || 'Unavailable'}
                        </p>

                        <p className="flex items-center gap-2 text-xs text-content-muted">
                          <Clock3 size={13} />
                          Last active: {formatDate(session.lastActiveAt)}
                        </p>

                        <p className="flex items-center gap-2 text-xs text-content-muted">
                          <Laptop size={13} />
                          Signed in: {formatDate(session.createdAt)}
                        </p>

                      </div>

                    </div>

                  </div>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => revokeOne(session)}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-400/15 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:border-red-400/30 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <LogOut size={14} />

                    {session.isCurrent
                      ? 'Sign out'
                      : 'Revoke session'}
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {sessions.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">

          <Button
            type="button"
            variant="secondary"
            disabled={
              processing ||
              !sessions.some((session) => !session.isCurrent)
            }
            onClick={revokeOthers}
          >
            Sign out other devices
          </Button>

          <Button
            type="button"
            variant="danger"
            disabled={processing}
            onClick={revokeAll}
          >
            Sign out all devices
          </Button>

        </div>
      )}

      <div className="rounded-xl border border-emerald-400/10 bg-emerald-500/[0.04] p-4">

        <div className="flex items-start gap-3">

          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-emerald-400"
          />

          <div>
            <p className="text-xs font-semibold text-white">
              Account security
            </p>

            <p className="mt-1 text-xs leading-relaxed text-content-muted">
              If you notice an unfamiliar device, revoke its session
              immediately and change your account password.
            </p>
          </div>

        </div>

      </div>

    </Card>
  );
}