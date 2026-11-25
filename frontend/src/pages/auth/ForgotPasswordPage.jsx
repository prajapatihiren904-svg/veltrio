import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/forms/Input';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); setError(''); setLoading(true);
    try { await authService.forgotPassword(email); setSent(true); }
    catch (err) { setError(err.message || 'Unable to request a reset link.'); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Account recovery</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Forgot password?</h1>
      <p className="mt-2 text-sm text-content-muted">Enter your account email and we will send a reset link if it exists.</p>
      <Card className="mt-7">
        {sent ? (
          <div role="status" className="space-y-3">
            <p className="font-medium">Check your inbox</p>
            <p className="text-sm text-content-muted">If an account exists for that email, a password reset link has been sent. In local development without SMTP, check the backend terminal for the link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email address" type="email" required autoComplete="email" icon={Mail} value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
          </form>
        )}
      </Card>
      <Link to={ROUTES.login} className="mt-6 inline-flex items-center gap-2 text-sm text-content-muted hover:text-content"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>
    </div>
  );
}
