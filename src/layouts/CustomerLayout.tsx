import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Grid2X2, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/services', label: 'Services', icon: Grid2X2 },
  { path: '/requests', label: 'Bookings', icon: ClipboardList },
  { path: '/account', label: 'Account', icon: User },
];

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isTabRoute = tabs.some((tab) =>
    tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path)
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg bg-white">
      <div className="relative min-h-screen">
        <main className={cn(isTabRoute && 'pb-20')}>
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

        {isTabRoute && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-lg">
              {tabs.map((tab) => {
                const isActive =
                  tab.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(tab.path);
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className={cn(
                      'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors',
                      isActive ? 'text-primary' : 'text-foreground-muted'
                    )}
                  >
                    <tab.icon
                      className={cn(
                        'h-6 w-6 transition-transform duration-150',
                        isActive ? 'scale-105' : 'scale-100'
                      )}
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                    <span className="text-[11px] font-medium leading-none">{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-1 h-1 w-1 rounded-full bg-primary"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
