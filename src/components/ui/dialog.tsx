"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, description, children, className }: DialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!mounted) return null;

  const modalRoot = document.body;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className={cn(
              "relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-glass-border bg-surface-50/95 p-6 shadow-cinematic backdrop-blur-lg focus:outline-hidden",
              className
            )}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer"
            >
              <X className="h-4 w-4 text-text-secondary" />
              <span className="sr-only">Close</span>
            </button>

            {/* Header */}
            {(title || description) && (
              <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
                {title && (
                  <h2 className="text-lg font-semibold leading-none tracking-tight text-text-primary">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-text-secondary">
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Content */}
            <div className="text-sm text-text-primary">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    modalRoot
  );
}
