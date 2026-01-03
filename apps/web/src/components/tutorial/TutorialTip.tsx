"use client";

/**
 * TutorialTip - Callout boxes for tips, warnings, notes, and important info
 *
 * Variants:
 * - pro: Green, lightbulb icon - best practices and pro tips
 * - warning: Amber, warning triangle - things to watch out for
 * - note: Blue, info icon - additional context
 * - important: Red, exclamation - critical information
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TipVariant } from "@/lib/tutorial-types";

// ============================================================================
// Icons
// ============================================================================

const LightbulbIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-5", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
    />
  </svg>
);

const WarningIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-5", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-5", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
    />
  </svg>
);

const ExclamationIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-5", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
    />
  </svg>
);

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-4", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

export interface TutorialTipProps {
  /** Tip variant determines colors and icon */
  variant: TipVariant;
  /** Optional title (if not provided, uses default for variant) */
  title?: string;
  /** Content of the tip */
  children: React.ReactNode;
  /** Make the tip collapsible */
  collapsible?: boolean;
  /** Start collapsed (only if collapsible) */
  defaultCollapsed?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Variant Config
// ============================================================================

interface VariantConfig {
  icon: React.ReactNode;
  defaultTitle: string;
  containerClass: string;
  iconContainerClass: string;
  titleClass: string;
}

const variantConfigs: Record<TipVariant, VariantConfig> = {
  pro: {
    icon: <LightbulbIcon />,
    defaultTitle: "Pro Tip",
    containerClass: "border-success/30 bg-success/5",
    iconContainerClass: "bg-success/20 text-success",
    titleClass: "text-success",
  },
  warning: {
    icon: <WarningIcon />,
    defaultTitle: "Warning",
    containerClass: "border-amber-500/30 bg-amber-500/5",
    iconContainerClass: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    titleClass: "text-amber-600 dark:text-amber-400",
  },
  note: {
    icon: <InfoIcon />,
    defaultTitle: "Note",
    containerClass: "border-blue-500/30 bg-blue-500/5",
    iconContainerClass: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    titleClass: "text-blue-600 dark:text-blue-400",
  },
  important: {
    icon: <ExclamationIcon />,
    defaultTitle: "Important",
    containerClass: "border-destructive/30 bg-destructive/5",
    iconContainerClass: "bg-destructive/20 text-destructive",
    titleClass: "text-destructive",
  },
};

// ============================================================================
// Main Component
// ============================================================================

export function TutorialTip({
  variant,
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: TutorialTipProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const config = variantConfigs[variant];

  const displayTitle = title || config.defaultTitle;

  // Header (clickable if collapsible)
  const HeaderWrapper = collapsible ? "button" : "div";
  const headerProps = collapsible
    ? {
        type: "button" as const,
        onClick: () => setIsCollapsed(!isCollapsed),
        "aria-expanded": !isCollapsed,
        className: cn(
          "w-full flex items-center gap-3 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg",
          "touch-manipulation active:scale-[0.99] transition-transform"
        ),
      }
    : { className: "flex items-center gap-3" };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        config.containerClass,
        className
      )}
      role={variant === "warning" || variant === "important" ? "alert" : "note"}
    >
      <HeaderWrapper {...headerProps}>
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center size-8 rounded-lg shrink-0",
            config.iconContainerClass
          )}
        >
          {config.icon}
        </div>

        {/* Title */}
        <span className={cn("font-semibold text-sm flex-1", config.titleClass)}>
          {displayTitle}
        </span>

        {/* Collapse toggle */}
        {collapsible && (
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="text-muted-foreground"
          >
            <ChevronIcon />
          </motion.div>
        )}
      </HeaderWrapper>

      {/* Content */}
      {collapsible ? (
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="pt-3 pl-11 text-sm text-muted-foreground leading-relaxed">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="pt-3 pl-11 text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Convenience Components
// ============================================================================

export function ProTip({
  title,
  children,
  ...props
}: Omit<TutorialTipProps, "variant">) {
  return (
    <TutorialTip variant="pro" title={title} {...props}>
      {children}
    </TutorialTip>
  );
}

export function Warning({
  title,
  children,
  ...props
}: Omit<TutorialTipProps, "variant">) {
  return (
    <TutorialTip variant="warning" title={title} {...props}>
      {children}
    </TutorialTip>
  );
}

export function Note({
  title,
  children,
  ...props
}: Omit<TutorialTipProps, "variant">) {
  return (
    <TutorialTip variant="note" title={title} {...props}>
      {children}
    </TutorialTip>
  );
}

export function Important({
  title,
  children,
  ...props
}: Omit<TutorialTipProps, "variant">) {
  return (
    <TutorialTip variant="important" title={title} {...props}>
      {children}
    </TutorialTip>
  );
}

// Type is already exported with the interface definition above
