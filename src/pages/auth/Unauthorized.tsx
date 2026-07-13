import { Ban, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate('/', { replace: true });
    }
  };

  const suspended = profile?.account_status === 'suspended';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg items-center bg-white px-6 py-12">
      <div className="w-full text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-error-light">
          <Ban className="h-8 w-8 text-error" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-foreground">
          {suspended ? 'Account access suspended' : 'You don’t have access here'}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-foreground-muted">
          {suspended
            ? 'Please contact S2B Services support for help with your account.'
            : 'This section is restricted to an approved provider or platform administrator.'}
        </p>
        <div className="mt-7 space-y-3">
          <Button onClick={() => navigate('/')} className="h-12 w-full bg-primary text-white">
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
          <Button variant="outline" onClick={handleSignOut} className="h-12 w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
