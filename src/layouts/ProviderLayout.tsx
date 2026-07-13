import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, Crown, LayoutDashboard, UserRound, Wrench } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import NotificationBell from '@/components/common/NotificationBell';
import { cn } from '@/lib/utils';

const pageTransition = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
};

const providerNav = [
  { path: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/provider/requests', label: 'Requests', icon: ClipboardList },
  { path: '/provider/profile', label: 'Profile', icon: UserRound },
  { path: '/provider/subscription', label: 'Plan', icon: Crown },
];

export default function ProviderLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const showProviderNav = location.pathname.startsWith('/provider/');

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg bg-white">
      <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-white px-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-base font-bold text-foreground">Provider Portal</h1>
        </div>
        <NotificationBell />
      </header>

      {showProviderNav && (
        <nav className="sticky top-14 z-40 grid grid-cols-4 border-b border-border bg-white px-2 py-2">
          {providerNav.map((item) => {
            const active = location.pathname === item.path || (
              item.path === '/provider/requests' && location.pathname.startsWith('/provider/requests/')
            );
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium',
                  active ? 'bg-primary-light text-primary' : 'text-foreground-muted'
                )}
              >
                <item.icon className="h-4 w-4" strokeWidth={active ? 2.5 : 1.7} />
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      <main className="min-h-[calc(100vh-56px)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
