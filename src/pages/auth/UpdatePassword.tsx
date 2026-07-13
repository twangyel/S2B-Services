import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import AuthNotice from '@/components/auth/AuthNotice';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

export default function UpdatePassword() {
  const navigate = useNavigate();
  const { user, loading, configured } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!configured || !user) {
      setErrorMessage('Open this page from the latest password reset link sent to your email.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Use a password with at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('The passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage('Your password has been updated successfully.');
    window.setTimeout(() => navigate('/account', { replace: true }), 800);
  };

  return (
    <AuthPageShell
      title="Create a new password"
      subtitle="Choose a strong password that you haven’t used for this account before."
      footer={
        <Link to="/login" className="font-semibold text-primary">
          Return to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!loading && !user && (
          <AuthNotice
            type="info"
            message="A valid recovery session was not found. Request a new reset link and open it in this browser."
          />
        )}
        {errorMessage && <AuthNotice type="error" message={errorMessage} />}
        {successMessage && <AuthNotice type="success" message={successMessage} />}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">New password</span>
          <div className="flex h-12 items-center rounded-xl border border-border px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <LockKeyhole className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              minLength={8}
              required
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted active:bg-muted"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Confirm new password</span>
          <div className="flex h-12 items-center rounded-xl border border-border px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <LockKeyhole className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Repeat your password"
              minLength={8}
              required
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
            />
          </div>
        </label>

        <Button
          type="submit"
          disabled={submitting || loading || !user}
          className="h-12 w-full bg-primary text-white hover:bg-primary-dark"
        >
          {submitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Update Password
        </Button>
      </form>
    </AuthPageShell>
  );
}
