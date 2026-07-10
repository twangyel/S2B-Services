import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FolderOpen,
  CreditCard,
  ClipboardList,
  MessageSquare,
  Settings,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/providers', label: 'Providers', icon: Users },
  { path: '/admin/approvals', label: 'Approvals', icon: UserCheck },
  { path: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  { path: '/admin/requests', label: 'Requests', icon: ClipboardList },
  { path: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const pageTransition = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg bg-background lg:max-w-full">
      <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-white px-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="mr-3 flex h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-base font-bold text-foreground">Admin Panel</h1>
        </div>
      </header>

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

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 h-full w-[260px] bg-white shadow-xl"
            >
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">S2B Admin</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted"
                >
                  <X className="h-5 w-5 text-foreground-muted" />
                </button>
              </div>

              <nav className="p-3">
                {adminNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setDrawerOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-light text-primary'
                          : 'text-foreground-muted hover:bg-muted'
                      )}
                    >
                      <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
