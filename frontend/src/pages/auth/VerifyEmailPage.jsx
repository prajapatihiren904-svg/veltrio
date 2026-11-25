import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/forms/Input';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { establishSession } = useAuth();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleVerify(event) {
    event.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(otp)) {
      setError('Enter a valid 6-digit verification code');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.verifyEmail({ email, otp });

      establishSession(result);

      toast.success('Email verified successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');

    try {
      await authService.resendVerificationOtp(email);

      setCountdown(60);
      setOtp('');

      toast.success('A new verification code has been sent');
    } catch (err) {
      setError(err.message || 'Could not resend verification code');
    } finally {
      setResending(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-500/10 text-brand-400">
        <ShieldCheck size={32} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
        Account verification
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Verify your email
      </h1>

      <p className="mt-3 text-sm leading-6 text-content-muted">
        We sent a 6-digit verification code to:
      </p>

      <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-brand-400">
        <Mail size={17} />
        <span className="break-all">{email}</span>
      </div>

      <Card className="mt-7">
        <form onSubmit={handleVerify} className="space-y-5">
          <Input
            label="Verification code"
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="Enter 6-digit OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
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
            Verify email
          </Button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-content-muted">
                Resend code in{' '}
                <span className="font-semibold text-brand-400">
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300 disabled:opacity-50"
              >
                <RefreshCw size={15} />
                {resending ? 'Sending...' : 'Resend verification code'}
              </button>
            )}
          </div>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-content-muted">
        Wrong email?{' '}
        <Link
          to="/register"
          className="font-medium text-brand-400 hover:text-brand-300"
        >
          Register again
        </Link>
      </p>
    </div>
  );
}