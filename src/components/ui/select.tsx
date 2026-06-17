"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  emoji?: string;
}

interface SelectProps {
  id?: string;
  options: readonly Option[] | Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({ id, options, value, onChange, placeholder = "Select option", className, disabled }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-11 w-full items-center justify-between rounded-md border border-glass-border bg-surface-50/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer"
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.emoji && <span>{selectedOption.emoji}</span>}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-text-muted">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-text-secondary transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-glass-border bg-surface-50 p-1 shadow-cinematic backdrop-blur-md"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-100 transition-colors cursor-pointer text-left",
                    isSelected && "text-brand-400 font-medium bg-brand-500/10 hover:bg-brand-500/15"
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.emoji && <span>{opt.emoji}</span>}
                    <span>{opt.label}</span>
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-brand-400" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
