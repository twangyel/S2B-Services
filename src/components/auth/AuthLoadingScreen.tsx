import { LoaderCircle } from 'lucide-react';

export default function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="text-center">
        <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-primary" />
        <p className="mt-3 text-sm font-medium text-foreground-muted">Checking your account…</p>
      </div>
    </div>
  );
}
