import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  UserRound,
  ShieldCheck,
} from 'lucide-react';

import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/forms/Input';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('user');

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function changeTab(tab) {
    setActiveTab(tab);
    setError('');
    setForm({ email: '', password: '' });
  }

  async function handleSubmit(event) {
  event.preventDefault();

  setError('');
  setLoading(true);

  try {
const expectedRole = activeTab === 'admin' ? 'admin' : 'user';
    const signedInUser = await login(form, expectedRole);

    const fallback =
      expectedRole === 'admin'
        ? ROUTES.admin
        : ROUTES.dashboard;

    const requestedPath = location.state?.from?.pathname;

    navigate(requestedPath || fallback, { replace: true });

  } catch (err) {
    setError(err.message || 'Unable to sign in. Please try again.');
  } finally {
    setLoading(false);
  }
}

  return (
    <div>
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
          Welcome back
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Sign in to VELTRIO
        </h1>

        <p className="mt-2 text-sm text-content-muted">
          Your money. Your clarity.
        </p>
      </div>

      {/* Login Role Tabs */}
      <div className="mt-7 grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-1.5">

        <button
          type="button"
          onClick={() => changeTab('user')}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition-all ${
            activeTab === 'user'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
              : 'text-content-muted hover:bg-surface-elevated hover:text-content'
          }`}
        >
          <UserRound size={17} />
          User Login
        </button>

        <button
          type="button"
          onClick={() => changeTab('admin')}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition-all ${
            activeTab === 'admin'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
              : 'text-content-muted hover:bg-surface-elevated hover:text-content'
          }`}
        >
          <ShieldCheck size={17} />
          Admin Login
        </button>

      </div>

      {/* Login Description */}
      <div className="mt-5">
        <h2 className="text-lg font-semibold">
          {activeTab === 'admin'
            ? 'Administrator Access'
            : 'Personal Account'}
        </h2>

        <p className="mt-1 text-sm text-content-muted">
          {activeTab === 'admin'
            ? 'Sign in using your administrator credentials.'
            : 'Sign in to manage your income, expenses and savings.'}
        </p>
      </div>

      {location.state?.notice && (
        <p
          role="status"
          className="mt-5 rounded-control border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {location.state.notice}
        </p>
      )}

      {/* Login Form */}
      <Card className="mt-5">
        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            label="Email address"
            type="email"
            autoComplete="off"
            required
            icon={Mail}
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            icon={LockKeyhole}
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            placeholder="Enter your password"
          />

          {error && (
            <p
              role="alert"
              className="rounded-control border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <Link
              className="text-sm text-brand-400 hover:text-brand-300"
              to={ROUTES.forgotPassword}
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            {activeTab === 'admin'
              ? 'Admin Sign In'
              : 'Sign In'}

            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

        </form>
      </Card>

      {/* Registration Link */}
      {activeTab === 'user' ? (
        <p className="mt-6 text-center text-sm text-content-muted">
          New to VELTRIO?{' '}
          <Link
            className="font-medium text-brand-400 hover:text-brand-300"
            to={ROUTES.register}
          >
            Create an account
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-center text-sm text-content-muted">
          Restricted area. Authorized administrators only.
        </p>
      )}

    </div>
  );
}