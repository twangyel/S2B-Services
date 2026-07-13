import { useState, type FormEvent } from 'react';
import { LoaderCircle, Mail } from 'lucide-react';
import { Link } from 'react-router';
import AuthNotice from '@/components/auth/AuthNotice';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const { configured } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');

    if (!configured) {
      setErrorMessage('Supabase is not connected yet.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage('Password reset instructions have been sent if an account exists for this email.');
  };

  return (
    <AuthPageShell
      title="Reset your password"
      subtitle="Enter your registered email. We’ll send a secure link to create a new password."
      footer={
        <Link to="/login" className="font-semibold text-primary">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && <AuthNotice type="success" message={message} />}
        {errorMessage && <AuthNotice type="error" message={errorMessage} />}

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

        <Button
          type="submit"
          disabled={submitting || !configured}
          className="h-12 w-full bg-primary text-white hover:bg-primary-dark"
        >
          {submitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Send Reset Link
        </Button>
      </form>
    </AuthPageShell>
  );
}
