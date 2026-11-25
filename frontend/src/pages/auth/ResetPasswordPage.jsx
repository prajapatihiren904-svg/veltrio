import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/forms/Input';
import { ROUTES } from '@/constants/routes';
import { authService } from '@/services/authService';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try { await authService.resetPassword(token, password); navigate(ROUTES.login, { replace: true, state: { notice: 'Password reset successfully. Please sign in.' } }); }
    catch (err) { setError(err.message || 'This reset link is invalid or expired.'); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Secure your account</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Set a new password</h1>
      <p className="mt-2 text-sm text-content-muted">Choose a strong password you have not used before.</p>
      <Card className="mt-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="New password" type="password" required autoComplete="new-password" icon={LockKeyhole} hint="At least 8 characters."
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <Input label="Confirm new password" type="password" required autoComplete="new-password" icon={LockKeyhole}
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">Update password</Button>
        </form>
      </Card>
      <p className="mt-6 text-sm text-content-muted"><Link className="text-brand-400 hover:text-brand-300" to={ROUTES.login}>Back to sign in</Link></p>
    </div>
  );
}
