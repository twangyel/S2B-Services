import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full',
                  variant === 'danger' ? 'bg-error-light' : 'bg-primary-light'
                )}
              >
                {variant === 'danger' ? (
                  <AlertTriangle className="h-7 w-7 text-error" />
                ) : (
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                )}
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{message}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-border text-foreground hover:bg-muted"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                className={cn(
                  'flex-1',
                  variant === 'danger'
                    ? 'bg-error text-white hover:bg-error/90'
                    : 'bg-primary text-white hover:bg-primary-dark'
                )}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
