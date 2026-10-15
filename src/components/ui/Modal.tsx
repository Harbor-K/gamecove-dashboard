import React, { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Scrim over the whole screen; content centred in the content area (right of the nav) when `contained`.
 */
export function Modal({
  open,
  contained = false,
  labelledBy,
  onEscape,
  children,
}: {
  open: boolean;
  contained?: boolean;
  labelledBy: string;
  onEscape?: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="scrim"
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-scrim"
          style={{ paddingLeft: contained ? "var(--gc-content-left)" : 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          onKeyDown={(e) => e.key === "Escape" && onEscape?.()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
