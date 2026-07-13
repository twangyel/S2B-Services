import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user && profile) {
      navigate(homeForRole(profile.role), { replace: true });
    }
  }, [navigate, profile, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!configured) {
      setErrorMessage('Supabase is not connected yet. Add the two Vite environment variables first.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      setSubmitting(false);
      setErrorMessage(error?.message ?? 'Unable to sign in. Please check your details.');
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {!configured && (
          <AuthNotice
            type="info"
            message="Backend variables are not configured in this copy yet. Public browsing remains available."
          />
        )}
        {errorMessage && <AuthNotice type="error" message={errorMessage} />}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Email address</span>
          <div className="flex h-12 items-center rounded-xl border border-border bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <Mail className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="name@example.com"
              required
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
            />
          </div>
        </label>

        <label className="block">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Password</span>
            <Link to="/forgot-password" className="text-xs font-semibold text-primary">
              Forgot password?
            </Link>
          </div>
          <div className="flex h-12 items-center rounded-xl border border-border bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <LockKeyhole className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
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
        </label>

        <Button
          type="submit"
          disabled={submitting || !configured}
          className="h-12 w-full bg-primary text-white hover:bg-primary-dark"
        >
          {submitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </AuthPageShell>
  );
}
