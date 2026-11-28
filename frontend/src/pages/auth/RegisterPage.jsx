import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';

import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/forms/Input';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to create your account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
        Start with clarity
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Create your account
      </h1>

      <p className="mt-2 text-sm text-content-muted">
        A clearer picture of your money starts here.
      </p>

      <Card className="mt-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            required
            autoComplete="name"
            icon={UserRound}
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            placeholder="Your name"
          />

          <Input
            label="Email address"
            type="email"
            required
            autoComplete="email"
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
            required
            autoComplete="new-password"
            icon={LockKeyhole}
            hint="Use at least 8 characters."
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            placeholder="Create a password"
          />

          <Input
            label="Confirm password"
            type="password"
            required
            autoComplete="new-password"
            icon={LockKeyhole}
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            placeholder="Repeat your password"
          />

          {error && (
            <p
              role="alert"
              className="rounded-control border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Create account
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-content-muted">
        Already registered?{' '}
        <Link
          className="font-medium text-brand-400 hover:text-brand-300"
          to={ROUTES.login}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}