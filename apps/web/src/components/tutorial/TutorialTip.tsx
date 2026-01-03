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
import { Lightbulb, AlertTriangle, Info, AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TipVariant } from "@/lib/tutorial-types";

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
    icon: <Lightbulb className="size-5" />,
    defaultTitle: "Pro Tip",
    containerClass: "border-[oklch(0.72_0.19_145/0.3)] bg-[oklch(0.72_0.19_145/0.05)]",
    iconContainerClass: "bg-[oklch(0.72_0.19_145/0.2)] text-[oklch(0.72_0.19_145)]",
    titleClass: "text-[oklch(0.72_0.19_145)]",
  },
  warning: {
    icon: <AlertTriangle className="size-5" />,
    defaultTitle: "Warning",
    containerClass: "border-amber-500/30 bg-amber-500/5",
    iconContainerClass: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    titleClass: "text-amber-600 dark:text-amber-400",
  },
  note: {
    icon: <Info className="size-5" />,
    defaultTitle: "Note",
    containerClass: "border-blue-500/30 bg-blue-500/5",
    iconContainerClass: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    titleClass: "text-blue-600 dark:text-blue-400",
  },
  important: {
    icon: <AlertCircle className="size-5" />,
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
            <ChevronDown className="size-4" />
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
