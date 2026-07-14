import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import AuthNotice from '@/components/auth/AuthNotice';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { homeForRole } from '@/lib/auth-routing';
import { supabase } from '@/lib/supabase';
import type { AppRole } from '@/types/auth';

interface LoginLocationState {
  from?: {
    pathname?: string;
    search?: string;
  };
}

type LoginField = 'identifier' | 'password';
type LoginErrors = Partial<Record<LoginField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeBhutanPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('975')) return digits.slice(3);
  return digits;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, configured } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [errorMessage, setErrorMessage] = useState('');

  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && profile) {
      navigate(homeForRole(profile.role), { replace: true });
    }
  }, [navigate, profile, user]);

  const clearFieldError = (field: LoginField) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!configured) {
      setErrorMessage('Supabase is not connected yet. Add the two Vite environment variables first.');
      return;
    }

    const rawIdentifier = identifier.trim();
    const errors: LoginErrors = {};

    if (!rawIdentifier) {
      errors.identifier = 'Enter your phone number or email address.';
    } else if (rawIdentifier.includes('@') && !EMAIL_PATTERN.test(rawIdentifier.toLowerCase())) {
      errors.identifier = 'Enter a valid email address.';
    } else if (!rawIdentifier.includes('@')) {
      const localPhone = normalizeBhutanPhone(rawIdentifier);
      if (localPhone.length !== 8) {
        errors.identifier = 'Enter a valid 8-digit Bhutan phone number.';
      }
    }

    if (!password) {
      errors.password = 'Enter your password.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      window.requestAnimationFrame(() => {
        if (errors.identifier) identifierRef.current?.focus();
        else passwordRef.current?.focus();
      });
      return;
    }

    setSubmitting(true);

    const credentials = rawIdentifier.includes('@')
      ? {
          email: rawIdentifier.toLowerCase(),
          password,
        }
      : {
          phone: `+975${normalizeBhutanPhone(rawIdentifier)}`,
          password,
        };

    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error || !data.user) {
      setSubmitting(false);
      setErrorMessage('Incorrect phone number, email address or password. Please try again.');
      return;
    }

    const { data: signedInProfile } = await supabase
      .from('profiles')
      .select('role, account_status')
      .eq('id', data.user.id)
      .maybeSingle<{ role: AppRole; account_status: string }>();

    setSubmitting(false);

    if (signedInProfile?.account_status && signedInProfile.account_status !== 'active') {
      navigate('/unauthorized', { replace: true });
      return;
    }

    const state = location.state as LoginLocationState | null;
    const requestedPath = state?.from?.pathname
      ? `${state.from.pathname}${state.from.search ?? ''}`
      : null;

    navigate(requestedPath ?? homeForRole(signedInProfile?.role), { replace: true });
  };

  const fieldShellClass = (field: LoginField) =>
    `flex h-12 items-center rounded-xl border bg-white px-3 transition focus-within:ring-2 ${
      fieldErrors[field]
        ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10'
        : 'border-border focus-within:border-primary focus-within:ring-primary/15'
    }`;

  const FieldError = ({ field }: { field: LoginField }) =>
    fieldErrors[field] ? (
      <span className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        {fieldErrors[field]}
      </span>
    ) : null;

  return (
    <AuthPageShell
      title="Welcome back"
      subtitle="Sign in to manage bookings, provider applications and your S2B Services account."
      footer={
        <>
          New to S2B Services?{' '}
          <Link to="/register" className="font-semibold text-primary">
            Create account
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {!configured && (
          <AuthNotice
            type="info"
            message="Backend variables are not configured in this copy yet. Public browsing remains available."
          />
        )}
        {errorMessage && <AuthNotice type="error" message={errorMessage} />}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Phone number or email
          </span>
          <div className={fieldShellClass('identifier')}>
            <UserRound className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              ref={identifierRef}
              type="text"
              inputMode="email"
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                clearFieldError('identifier');
              }}
              autoComplete="username"
              placeholder="17XXXXXX or name@example.com"
              aria-invalid={Boolean(fieldErrors.identifier)}
              aria-required="true"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
            />
          </div>
          <FieldError field="identifier" />
        </label>

        <label className="block">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Password</span>
            <Link to="/forgot-password" className="text-xs font-semibold text-primary">
              Forgot password?
            </Link>
          </div>
          <div className={fieldShellClass('password')}>
            <LockKeyhole className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError('password');
              }}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-required="true"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
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
          <FieldError field="password" />
        </label>

        <Button
          type="submit"
          disabled={submitting || !configured}
          className="h-12 w-full bg-primary text-white hover:bg-primary-dark"
        >
          {submitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </AuthPageShell>
  );
}
