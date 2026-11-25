import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/forms/Input';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const signedInUser = await login(form);

      if (signedInUser.role !== 'admin') {
        await logout();
        setError('Access denied. Admin credentials are required.');
        return;
      }

      navigate(ROUTES.admin, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
        <ShieldCheck size={25} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
        Restricted access
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Admin Portal
      </h1>

      <p className="mt-2 text-sm text-content-muted">
        Sign in with your administrator credentials.
      </p>

      <Card className="mt-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Admin email"
            type="email"
            autoComplete="username"
            required
            icon={Mail}
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            placeholder="admin@example.com"
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            icon={LockKeyhole}
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            placeholder="Enter admin password"
          />

          {error && (
            <p
              role="alert"
              className="rounded-control border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            Admin Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-xs text-content-muted">
        Authorized administrators only.
      </p>
    </div>
  );
}