import { useNavigate } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-primary">404</h1>
        <p className="mt-2 text-lg font-semibold text-foreground">Page not found</p>
        <p className="mt-1 text-sm text-foreground-muted">
          The page you are looking for does not exist.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-button"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 rounded-xl bg-muted px-6 py-3 text-sm font-semibold text-foreground"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
