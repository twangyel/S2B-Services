import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Phone, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import AuthNotice from '@/components/auth/AuthNotice';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

export default function Register() {
  const navigate = useNavigate();
  const { configured } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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

    if (!configured) {
      setErrorMessage('Supabase is not connected yet. Add the two Vite environment variables first.');
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 8) {
      setErrorMessage('Enter a valid 8-digit Bhutan phone number.');
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
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: {
          full_name: fullName.trim(),
          phone: cleanedPhone,
        },
      },
    });

    setSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data.session) {
      navigate('/account', { replace: true });
      return;
    }

    setSuccessMessage(
      'Account created. Check your email and confirm your address before signing in.'
    );
  };

  return (
    <AuthPageShell
      title="Create your account"
      subtitle="Browse freely as a guest, or register to send bookings, review providers and apply as a service provider."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!configured && (
          <AuthNotice
            type="info"
            message="Backend variables are not configured in this copy yet. Add them before registration testing."
          />
        )}
        {errorMessage && <AuthNotice type="error" message={errorMessage} />}
        {successMessage && <AuthNotice type="success" message={successMessage} />}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Full name</span>
          <div className="flex h-12 items-center rounded-xl border border-border px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <User className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              placeholder="Your full name"
              minLength={2}
              required
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Bhutan phone number</span>
          <div className="flex h-12 items-center rounded-xl border border-border px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <Phone className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <span className="mr-2 text-sm text-foreground-muted">+975</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              placeholder="17XXXXXX"
              maxLength={8}
              required
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Email address</span>
          <div className="flex h-12 items-center rounded-xl border border-border px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <Mail className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="name@example.com"
              required
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Password</span>
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
          <span className="mb-1.5 block text-sm font-medium text-foreground">Confirm password</span>
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

        <p className="text-xs leading-5 text-foreground-muted">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="font-medium text-primary">Terms</Link> and{' '}
          <Link to="/privacy" className="font-medium text-primary">Privacy Policy</Link>.
        </p>

        <Button
          type="submit"
          disabled={submitting || !configured}
          className="h-12 w-full bg-primary text-white hover:bg-primary-dark"
        >
          {submitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </AuthPageShell>
  );
}
