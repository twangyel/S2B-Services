import type { ReactNode } from 'react';
import { ShieldCheck, Wrench } from 'lucide-react';
import { Link } from 'react-router';

interface AuthPageShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthPageShell({ title, subtitle, children, footer }: AuthPageShellProps) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-lg bg-white px-5 pb-10 pt-safe">
      <div className="pt-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
            <Wrench className="h-5 w-5" />
            <ShieldCheck className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-success" />
          </div>
          <div>
            <p className="text-base font-bold leading-tight text-foreground">S2B Services</p>
            <p className="text-xs text-foreground-muted">Trusted local help</p>
          </div>
        </Link>

        <div className="mt-9">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">{subtitle}</p>
        </div>

        <div className="mt-7">{children}</div>
        {footer && <div className="mt-7 text-center text-sm text-foreground-muted">{footer}</div>}
      </div>
    </div>
  );
}
