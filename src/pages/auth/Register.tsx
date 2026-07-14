import { useRef, useState, type FormEvent, type RefObject } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import AuthNotice from '@/components/auth/AuthNotice';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

type RegisterField = 'fullName' | 'phone' | 'email' | 'password' | 'confirmPassword';
type RegisterErrors = Partial<Record<RegisterField, string>>;

interface RegistrationPreparation {
  phone_exists?: boolean;
  email_exists?: boolean;
  auth_email?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyRegistrationError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('already registered') ||
    normalized.includes('already exists') ||
    normalized.includes('duplicate') ||
    normalized.includes('unique')
  ) {
    return 'This phone number or email is already registered. Please sign in instead.';
  }

  if (normalized.includes('signup is disabled') || normalized.includes('email signups are disabled')) {
    return 'Account registration is currently unavailable. Enable Email sign-ups in Supabase Authentication.';
  }

  if (normalized.includes('rate limit')) {
    return 'Too many registration attempts. Please wait a moment and try again.';
  }

  return 'We could not create your account. Please check your details and try again.';
}

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
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
  const [errorMessage, setErrorMessage] = useState('');

  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const clearFieldError = (field: RegisterField) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const focusFirstError = (errors: RegisterErrors) => {
    const refs: Record<RegisterField, RefObject<HTMLInputElement | null>> = {
      fullName: fullNameRef,
      phone: phoneRef,
      email: emailRef,
      password: passwordRef,
      confirmPassword: confirmPasswordRef,
    };

    const firstField = (
      ['fullName', 'phone', 'email', 'password', 'confirmPassword'] as RegisterField[]
    ).find((field) => errors[field]);

    if (firstField) {
      window.requestAnimationFrame(() => refs[firstField].current?.focus());
    }
  };

  const validateForm = () => {
    const errors: RegisterErrors = {};
    const cleanedPhone = phone.replace(/\D/g, '');
    const normalizedEmail = email.trim().toLowerCase();

    if (fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name.';
    }

    if (cleanedPhone.length !== 8) {
      errors.phone = 'Enter a valid 8-digit Bhutan phone number.';
    }

    if (normalizedEmail && !EMAIL_PATTERN.test(normalizedEmail)) {
      errors.email = 'Enter a valid email address or leave this field blank.';
    }

    if (password.length < 8) {
      errors.password = 'Use a password with at least 8 characters.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'The passwords do not match.';
    }

    setFieldErrors(errors);
    focusFirstError(errors);

    return {
      valid: Object.keys(errors).length === 0,
      cleanedPhone,
      normalizedEmail,
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!configured) {
      setErrorMessage('Supabase is not connected yet. Add the two Vite environment variables first.');
      return;
    }

    const { valid, cleanedPhone, normalizedEmail } = validateForm();
    if (!valid) return;

    setSubmitting(true);

    try {
      const { data: preparationData, error: preparationError } = await supabase.rpc(
        'prepare_phone_registration',
        {
          p_phone: cleanedPhone,
          p_email: normalizedEmail || null,
        }
      );

      if (preparationError) {
        setErrorMessage(
          'Registration setup is incomplete. Run the latest S2B phone-first authentication SQL and try again.'
        );
        return;
      }

      const preparation = preparationData as RegistrationPreparation | null;
      const duplicateErrors: RegisterErrors = {};

      if (preparation?.phone_exists) {
        duplicateErrors.phone = 'This phone number is already registered. Please sign in instead.';
      }

      if (normalizedEmail && preparation?.email_exists) {
        duplicateErrors.email = 'This email address is already registered. Please sign in instead.';
      }

      if (Object.keys(duplicateErrors).length > 0) {
        setFieldErrors(duplicateErrors);
        focusFirstError(duplicateErrors);
        setErrorMessage('An account already exists with the highlighted information.');
        return;
      }

      const authEmail = preparation?.auth_email;
      if (!authEmail) {
        setErrorMessage('Registration could not be prepared. Please try again.');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password,
        options: {
          data: {
            auth_mode: 'phone_alias',
            full_name: fullName.trim(),
            phone: cleanedPhone,
            contact_email: normalizedEmail || null,
          },
        },
      });

      if (error) {
        setErrorMessage(friendlyRegistrationError(error.message));
        return;
      }

      if (!data.session) {
        setErrorMessage(
          'The account was created, but automatic sign-in is blocked. Turn off Confirm email in Supabase Authentication, then sign in with your phone number.'
        );
        return;
      }

      navigate('/account', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldShellClass = (field: RegisterField) =>
    `flex h-12 items-center rounded-xl border bg-white px-3 transition focus-within:ring-2 ${
      fieldErrors[field]
        ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-500/10'
        : 'border-border focus-within:border-primary focus-within:ring-primary/15'
    }`;

  const FieldError = ({ field }: { field: RegisterField }) =>
    fieldErrors[field] ? (
      <span className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        {fieldErrors[field]}
      </span>
    ) : null;

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
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {!configured && (
          <AuthNotice
            type="info"
            message="Backend variables are not configured in this copy yet. Add them before registration testing."
          />
        )}
        {errorMessage && <AuthNotice type="error" message={errorMessage} />}

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Full name</span>
          <div className={fieldShellClass('fullName')}>
            <User className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              ref={fullNameRef}
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                clearFieldError('fullName');
              }}
              autoComplete="name"
              placeholder="Your full name"
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-required="true"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
            />
          </div>
          <FieldError field="fullName" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Bhutan phone number
          </span>
          <div className={fieldShellClass('phone')}>
            <Phone className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <span className="mr-2 text-sm text-foreground-muted">+975</span>
            <input
              ref={phoneRef}
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value.replace(/\D/g, '').slice(0, 8));
                clearFieldError('phone');
              }}
              autoComplete="tel-national"
              placeholder="17XXXXXX"
              maxLength={8}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-required="true"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
            />
          </div>
          <FieldError field="phone" />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground">
            <span>Email address</span>
            <span className="text-xs font-normal text-foreground-muted">Optional</span>
          </span>
          <div className={fieldShellClass('email')}>
            <Mail className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError('email');
              }}
              autoComplete="email"
              placeholder="name@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
            />
          </div>
          <FieldError field="email" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">Password</span>
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
              autoComplete="new-password"
              placeholder="At least 8 characters"
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

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Confirm password
          </span>
          <div className={fieldShellClass('confirmPassword')}>
            <LockKeyhole className="mr-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              ref={confirmPasswordRef}
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                clearFieldError('confirmPassword');
              }}
              autoComplete="new-password"
              placeholder="Repeat your password"
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-required="true"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
            />
          </div>
          <FieldError field="confirmPassword" />
        </label>

        <p className="text-xs leading-5 text-foreground-muted">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="font-medium text-primary">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="font-medium text-primary">
            Privacy Policy
          </Link>
          .
        </p>

        <Button
          type="submit"
          disabled={submitting || !configured}
          className="h-12 w-full bg-primary text-white hover:bg-primary-dark"
        >
          {submitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          {submitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </AuthPageShell>
  );
}
