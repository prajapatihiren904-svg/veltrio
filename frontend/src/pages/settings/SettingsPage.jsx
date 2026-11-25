import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Globe2,
  LockKeyhole,
  ShieldAlert,
  CheckCircle2,
  Circle,
  KeyRound,
  Sparkles,
} from 'lucide-react';

import toast from 'react-hot-toast';

import PageHeader from '@/components/common/PageHeader';
import Card from '@/components/common/Card';
import Input from '@/components/forms/Input';
import Select from '@/components/forms/Select';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';

import { useAuth } from '@/contexts/AuthContext';
import { accountService } from '@/services/accountService';
import { TOKEN_STORAGE_KEY } from '@/constants/app';
import { storage } from '@/utils/storage';

const currencies = [
  ['INR', 'Indian Rupee (INR ₹)'],
  ['USD', 'US Dollar (USD $)'],
  ['EUR', 'Euro (EUR €)'],
  ['GBP', 'British Pound (GBP £)'],
  ['JPY', 'Japanese Yen (JPY ¥)'],
];

export default function SettingsPage() {
  const { user, updateUser, clearSession } = useAuth();

  // Currency settings
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [savingCurrency, setSavingCurrency] = useState(false);

  // Password settings
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingPassword, setSavingPassword] = useState(false);

  // Delete account settings
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Keep currency synchronized with user preferences
  useEffect(() => {
    setCurrency(user?.currency || 'INR');
  }, [user?.currency]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const password = passwords.newPassword;

    if (!password) {
      return {
        score: 0,
        label: 'Not entered',
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { score, label: 'Weak' };
    }

    if (score <= 4) {
      return { score, label: 'Medium' };
    }

    return { score, label: 'Strong' };
  }, [passwords.newPassword]);

  // Update currency
  const saveCurrency = async (event) => {
    event.preventDefault();

    if (currency === user?.currency) {
      toast('Your currency preference is already up to date.');
      return;
    }

    setSavingCurrency(true);

    try {
      const updated = await accountService.updatePreferences({
        currency,
      });

      updateUser(updated);

      try {
        localStorage.setItem(
          'veltrio.currency',
          updated.currency
        );
      } catch {
        // Ignore local storage errors.
      }

      toast.success('Currency preference updated successfully.');

      window.location.reload();
    } catch (error) {
      toast.error(
        error.message || 'Could not update currency preference.'
      );
    } finally {
      setSavingCurrency(false);
    }
  };

  // Update password
  const changePassword = async (event) => {
    event.preventDefault();

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('New password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from your current password.');
      return;
    }

    setSavingPassword(true);

    try {
      // Only send fields expected by the existing backend.
      await accountService.changePassword({
        currentPassword,
        newPassword,
      });

      toast.success('Password changed. Please sign in again.');

      storage.remove(TOKEN_STORAGE_KEY);

      clearSession({ redirect: true });
    } catch (error) {
      toast.error(
        error.message || 'Could not change password.'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // Delete account
  const deleteAccount = async (event) => {
    event.preventDefault();

    if (!deletePassword.trim()) {
      toast.error('Please enter your password.');
      return;
    }

    setDeleting(true);

    try {
      await accountService.deleteAccount(deletePassword);

      toast.success('Your account has been deleted.');

      storage.remove(TOKEN_STORAGE_KEY);

      clearSession({ redirect: true });
    } catch (error) {
      toast.error(
        error.message || 'Could not delete your account.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const resetPasswordFields = () => {
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">

      {/* PAGE HEADER */}

      <PageHeader
        title="Settings"
        description="Manage your preferences, password and account security."
      />

      {/* REGIONAL PREFERENCES */}

      <Card className="overflow-hidden p-5 sm:p-6">

        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-brand-500/10 p-3">
            <Globe2
              size={21}
              className="text-brand-400"
            />
          </div>

          <div>
            <h2 className="font-semibold text-content">
              Regional preferences
            </h2>

            <p className="mt-1 text-sm text-content-muted">
              Customize how financial amounts appear throughout VELTRIO.
            </p>
          </div>

        </div>

        <form
          onSubmit={saveCurrency}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >

          <Select
            label="Preferred currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            wrapperClassName="flex-1"
          >

            {currencies.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}

          </Select>

          <Button
            type="submit"
            loading={savingCurrency}
            disabled={savingCurrency}
          >
            Save preference
          </Button>

        </form>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface-elevated p-3">

          <Sparkles
            size={16}
            className="mt-0.5 shrink-0 text-brand-400"
          />

          <p className="text-xs leading-relaxed text-content-muted">
            Changing currency updates how amounts are displayed.
            Existing transaction amounts are not converted.
          </p>

        </div>

      </Card>

      {/* CHANGE PASSWORD */}

      <Card className="overflow-hidden p-5 sm:p-6">

        <div className="mb-6 flex items-start gap-3">

          <div className="rounded-xl bg-brand-500/10 p-3">
            <LockKeyhole
              size={21}
              className="text-brand-400"
            />
          </div>

          <div>
            <h2 className="font-semibold text-content">
              Change password
            </h2>

            <p className="mt-1 text-sm text-content-muted">
              Update your password to keep your account secure.
            </p>
          </div>

        </div>

        <form
          onSubmit={changePassword}
          className="space-y-5"
        >

          <div className="grid gap-4 sm:grid-cols-2">

            <Input
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={passwords.currentPassword}
              onChange={(event) =>
                setPasswords({
                  ...passwords,
                  currentPassword: event.target.value,
                })
              }
              required
            />

            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwords.newPassword}
              onChange={(event) =>
                setPasswords({
                  ...passwords,
                  newPassword: event.target.value,
                })
              }
              hint="Use at least 8 characters."
              required
            />

          </div>

          {/* PASSWORD STRENGTH */}

          {passwords.newPassword && (

            <div className="rounded-xl border border-border bg-surface-elevated p-4">

              <div className="mb-3 flex items-center justify-between">

                <span className="text-sm font-medium text-content">
                  Password strength
                </span>

                <span
                  className={`text-xs font-semibold ${
                    passwordStrength.label === 'Strong'
                      ? 'text-success'
                      : passwordStrength.label === 'Medium'
                        ? 'text-warning'
                        : 'text-danger'
                  }`}
                >
                  {passwordStrength.label}
                </span>

              </div>

              <div className="flex gap-2">

                {[1, 2, 3, 4, 5, 6].map((item) => (

                  <div
                    key={item}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      item <= passwordStrength.score
                        ? passwordStrength.label === 'Strong'
                          ? 'bg-success'
                          : passwordStrength.label === 'Medium'
                            ? 'bg-warning'
                            : 'bg-danger'
                        : 'bg-border'
                    }`}
                  />

                ))}

              </div>

              <div className="mt-3 grid gap-2 text-xs text-content-muted sm:grid-cols-2">

                <div className="flex items-center gap-2">
                  {passwords.newPassword.length >= 8
                    ? <CheckCircle2 size={14} className="text-success" />
                    : <Circle size={14} />}
                  At least 8 characters
                </div>

                <div className="flex items-center gap-2">
                  {/[A-Z]/.test(passwords.newPassword)
                    ? <CheckCircle2 size={14} className="text-success" />
                    : <Circle size={14} />}
                  One uppercase letter
                </div>

                <div className="flex items-center gap-2">
                  {/[0-9]/.test(passwords.newPassword)
                    ? <CheckCircle2 size={14} className="text-success" />
                    : <Circle size={14} />}
                  One number
                </div>

                <div className="flex items-center gap-2">
                  {/[^A-Za-z0-9]/.test(passwords.newPassword)
                    ? <CheckCircle2 size={14} className="text-success" />
                    : <Circle size={14} />}
                  One special character
                </div>

              </div>

            </div>

          )}

          {/* CONFIRM PASSWORD */}

          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={passwords.confirmPassword}
            onChange={(event) =>
              setPasswords({
                ...passwords,
                confirmPassword: event.target.value,
              })
            }
            hint={
              passwords.confirmPassword
                ? passwords.newPassword === passwords.confirmPassword
                  ? 'Passwords match.'
                  : 'Passwords do not match.'
                : 'Re-enter your new password.'
            }
            required
          />

          {passwords.confirmPassword && (

            <div
              className={`flex items-center gap-2 text-xs ${
                passwords.newPassword === passwords.confirmPassword
                  ? 'text-success'
                  : 'text-danger'
              }`}
            >

              {passwords.newPassword === passwords.confirmPassword
                ? <CheckCircle2 size={15} />
                : <AlertTriangle size={15} />}

              {passwords.newPassword === passwords.confirmPassword
                ? 'Password confirmation successful.'
                : 'Your passwords do not match.'}

            </div>

          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2 text-xs text-content-muted">
              <KeyRound size={15} />
              Never share your password with anyone.
            </div>

            <div className="flex gap-2">

              <Button
                type="button"
                variant="secondary"
                onClick={resetPasswordFields}
                disabled={savingPassword}
              >
                Clear
              </Button>

              <Button
                type="submit"
                loading={savingPassword}
                disabled={
                  savingPassword ||
                  passwords.newPassword.length < 8 ||
                  passwords.newPassword !== passwords.confirmPassword
                }
              >
                Update password
              </Button>

            </div>

          </div>

        </form>

      </Card>

      {/* ACCOUNT SECURITY */}

      <Card className="overflow-hidden p-5 sm:p-6">

        <div className="flex items-start gap-3">

          <div className="rounded-xl bg-brand-500/10 p-3">
            <ShieldAlert
              size={21}
              className="text-brand-400"
            />
          </div>

          <div className="flex-1">

            <h2 className="font-semibold text-content">
              Account security
            </h2>

            <p className="mt-1 text-sm text-content-muted">
              Keep your account credentials private and use a strong,
              unique password.
            </p>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 p-3">

              <CheckCircle2
                size={17}
                className="shrink-0 text-success"
              />

              <p className="text-xs text-content-muted">
                Your account is protected by password-based authentication.
              </p>

            </div>

          </div>

        </div>

      </Card>

      {/* DELETE ACCOUNT */}

      <Card className="border-danger/30 p-5 sm:p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-3">

            <div className="rounded-xl bg-danger/10 p-3">

              <ShieldAlert
                size={21}
                className="text-danger"
              />

            </div>

            <div>

              <h2 className="font-semibold text-content">
                Delete account
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-relaxed text-content-muted">
                Permanently delete your account, transactions, budgets,
                savings goals and categories.
              </p>

              <p className="mt-2 text-xs font-medium text-danger">
                This action cannot be undone.
              </p>

            </div>

          </div>

          <Button
            variant="danger"
            onClick={() => {
              setDeletePassword('');
              setDeleteOpen(true);
            }}
          >
            Delete account
          </Button>

        </div>

      </Card>

      {/* DELETE CONFIRMATION MODAL */}

      <Modal
        isOpen={deleteOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false);
          }
        }}
        title="Permanently delete account"
        description="Enter your current password to confirm account deletion."

        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              type="submit"
              form="delete-account-form"
              loading={deleting}
              disabled={deleting || !deletePassword.trim()}
            >
              Confirm deletion
            </Button>
          </>
        }
      >

        <form
          id="delete-account-form"
          onSubmit={deleteAccount}
          className="space-y-4"
        >

          <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4">

            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0 text-danger"
            />

            <div>

              <p className="text-sm font-semibold text-danger">
                Warning: Permanent deletion
              </p>

              <p className="mt-1 text-xs leading-relaxed text-content-muted">
                All your personal financial records will be permanently
                removed. You will not be able to recover this information.
              </p>

            </div>

          </div>

          <Input
            label="Your current password"
            type="password"
            autoComplete="current-password"
            value={deletePassword}
            onChange={(event) => setDeletePassword(event.target.value)}
            required
          />

        </form>

      </Modal>

    </div>
  );
}