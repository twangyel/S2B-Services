import { Outlet } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router';
import { Wrench } from 'lucide-react';

const pageTransition = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
};

export default function ProviderLayout() {
  const location = useLocation();

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg bg-white">
      <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-white px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-base font-bold text-foreground">Provider Portal</h1>
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
    </div>
  );
}
