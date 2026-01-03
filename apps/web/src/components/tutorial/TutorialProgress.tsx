"use client";

/**
 * TutorialProgress - Step progress indicator
 *
 * Adapted from agentic_coding_flywheel_setup's battle-tested stepper component.
 *
 * Shows the user's progress through a tutorial path:
 * - Desktop: Vertical step list in sidebar with connection lines
 * - Mobile: Touch-friendly dots (44px targets) with swipe gesture navigation
 *
 * Features:
 * - Current step highlighted with pulse animation
 * - Completed steps show animated checkmarks
 * - Swipe gestures on mobile
 * - Click-to-navigate with completion gating
 * - Estimated time remaining
 */

import * as React from "react";
import { motion } from "framer-motion";
import { useDrag } from "@use-gesture/react";
import { Check, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TutorialStepMeta } from "@/lib/tutorial-types";

// ============================================================================
// Types
// ============================================================================

export interface TutorialProgressProps {
  /** All steps in the tutorial */
  steps: TutorialStepMeta[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Set of completed step indices */
  completedSteps: number[];
  /** Callback when a step is clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Whether to allow jumping ahead to uncompleted steps */
  allowJumpAhead?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Force a specific variant (otherwise responsive) */
  variant?: "sidebar" | "header";
}

// ============================================================================
// Helpers
// ============================================================================

function calculateTimeRemaining(
  steps: TutorialStepMeta[],
  completedSteps: number[]
): string {
  const completedSet = new Set(completedSteps);
  let totalMinutes = 0;

  for (let i = 0; i < steps.length; i++) {
    if (!completedSet.has(i)) {
      // Parse "~5 min" or "5 min" or "5m"
      const match = steps[i].estimatedTime.match(/(\d+)/);
      if (match) {
        totalMinutes += parseInt(match[1], 10);
      }
    }
  }

  if (totalMinutes === 0) return "Complete!";
  if (totalMinutes < 60) return `~${totalMinutes} min left`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `~${hours}h ${mins}m left` : `~${hours}h left`;
}

// ============================================================================
// Sidebar Variant (Desktop)
// ============================================================================

function SidebarProgress({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowJumpAhead = false,
  className,
}: TutorialProgressProps) {
  const completedSet = new Set(completedSteps);
  const timeRemaining = calculateTimeRemaining(steps, completedSteps);

  return (
    <nav
      className={cn("flex flex-col gap-2", className)}
      aria-label="Tutorial progress"
    >
      {/* Time remaining */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2">
        <Clock className="size-4" />
        <span>{timeRemaining}</span>
      </div>

      {/* Step list with connection lines (ACFS pattern) */}
      <ol className="flex flex-col" role="list">
        {steps.map((step, index) => {
          const isCompleted = completedSet.has(index);
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;
          const highestCompleted = completedSteps.length > 0 ? Math.max(...completedSteps) : -1;
          const canClick =
            onStepClick &&
            (isCompleted || isCurrent || index <= highestCompleted + 1 || allowJumpAhead);

          return (
            <li key={step.id} className={cn(!isLast && "pb-1")}>
              <button
                type="button"
                onClick={() => canClick && onStepClick?.(index)}
                disabled={!canClick}
                className={cn(
                  "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isCurrent && "bg-primary/10 shadow-sm",
                  isCompleted && !isCurrent && "hover:bg-muted/50",
                  !isCompleted && !isCurrent && (canClick ? "hover:bg-muted/30" : "opacity-40 cursor-not-allowed"),
                  canClick && !isCurrent && "cursor-pointer",
                  canClick && "touch-manipulation active:scale-[0.98]"
                )}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${step.stepNumber}: ${step.title}${isCompleted ? " (completed)" : ""}${isCurrent ? " (current)" : ""}`}
              >
                {/* Connection line to next step */}
                {!isLast && (
                  <div className="absolute left-[22px] top-[42px] h-[calc(100%-16px)] w-px bg-gradient-to-b from-border/50 to-transparent" />
                )}

                {/* Step indicator */}
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center size-8 rounded-full shrink-0 text-sm font-medium transition-all duration-300",
                    isCurrent && "bg-primary text-primary-foreground shadow-sm shadow-primary/30 animate-glow-pulse",
                    isCompleted && !isCurrent && "bg-[oklch(0.72_0.19_145)] text-[oklch(0.15_0.02_145)] shadow-sm shadow-[oklch(0.72_0.19_145/0.3)]",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Check className="size-4" strokeWidth={2.5} />
                    </motion.div>
                  ) : isCurrent ? (
                    <Circle className="size-3 fill-current" />
                  ) : (
                    <span className="font-mono text-xs">{step.stepNumber}</span>
                  )}
                </div>

                {/* Step info */}
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-sm font-medium truncate transition-colors",
                      isCurrent && "text-foreground",
                      isCompleted && !isCurrent && "text-muted-foreground",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </div>
                  {isCurrent && (
                    <div className="mt-0.5 text-xs text-primary">In progress</div>
                  )}
                  {isCompleted && (
                    <div className="mt-0.5 text-xs text-[oklch(0.72_0.19_145)]">Complete</div>
                  )}
                </div>

                {/* Hover effect border */}
                {canClick && !isCurrent && (
                  <div className="absolute inset-0 rounded-xl border border-transparent transition-colors group-hover:border-border/50" />
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Progress bar */}
      <div className="px-3 pt-4">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((completedSteps.length) / steps.length) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
        <div className="text-xs text-muted-foreground text-center mt-2">
          {completedSteps.length} of {steps.length} steps completed
        </div>
      </div>
    </nav>
  );
}

// ============================================================================
// Header Variant (Mobile) - 44px touch targets + swipe gestures
// ============================================================================

function HeaderProgress({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  allowJumpAhead = false,
  className,
}: TutorialProgressProps) {
  const completedSet = new Set(completedSteps);
  const highestCompleted = completedSteps.length > 0 ? Math.max(...completedSteps) : -1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Swipe gesture handler (from ACFS)
  const bind = useDrag(
    ({ direction: [dx], velocity: [vx], active, movement: [mx] }) => {
      // Only trigger on release with sufficient velocity or distance
      if (!active && onStepClick && (Math.abs(vx) > 0.3 || Math.abs(mx) > 50)) {
        if (dx > 0 && currentStep > 0) {
          // Swipe right = go back
          const prevStep = currentStep - 1;
          if (completedSet.has(prevStep) || prevStep <= highestCompleted + 1 || allowJumpAhead) {
            onStepClick(prevStep);
          }
        } else if (dx < 0 && currentStep < steps.length - 1) {
          // Swipe left = go forward
          const nextStep = currentStep + 1;
          if (completedSet.has(nextStep) || nextStep <= highestCompleted + 1 || allowJumpAhead) {
            onStepClick(nextStep);
          }
        }
      }
    },
    { axis: "x", filterTaps: true, threshold: 10 }
  );

  return (
    <nav
      {...bind()}
      className={cn(
        "flex flex-col gap-3 px-4 py-3 bg-card border-b border-border touch-pan-x select-none",
        className
      )}
      aria-label="Tutorial progress"
    >
      {/* Progress bar with gradient */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Touch-friendly step dots - 44px minimum touch targets */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isCompleted = completedSet.has(index);
          const isCurrent = index === currentStep;
          const canClick =
            onStepClick &&
            (isCompleted || isCurrent || index <= highestCompleted + 1 || allowJumpAhead);

          return (
            <motion.button
              key={step.id}
              type="button"
              onClick={canClick ? () => onStepClick?.(index) : undefined}
              disabled={!canClick}
              className={cn(
                "relative flex items-center justify-center touch-manipulation",
                canClick ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              )}
              style={{ minWidth: 44, minHeight: 44 }}
              aria-label={`Go to step ${index + 1}: ${step.title}`}
              aria-current={isCurrent ? "step" : undefined}
              whileTap={canClick ? { scale: 0.9 } : undefined}
            >
              {/* The visible dot */}
              <motion.div
                className={cn(
                  "rounded-full transition-colors",
                  isCompleted && "bg-[oklch(0.72_0.19_145)]",
                  isCurrent && !isCompleted && "bg-primary",
                  !isCompleted && !isCurrent && "bg-muted-foreground/30"
                )}
                initial={false}
                animate={{
                  width: isCurrent ? 14 : 10,
                  height: isCurrent ? 14 : 10,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />

              {/* Active step pulse ring */}
              {isCurrent && (
                <motion.div
                  className="absolute rounded-full border-2 border-primary/50"
                  initial={{ width: 14, height: 14, opacity: 0.8 }}
                  animate={{
                    width: [14, 28, 14],
                    height: [14, 28, 14],
                    opacity: [0.8, 0, 0.8],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Completed checkmark overlay */}
              {isCompleted && (
                <motion.div
                  className="absolute flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Check className="size-2.5 text-[oklch(0.15_0.02_145)]" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Current step label and swipe hint */}
      <div className="text-center">
        <motion.span
          key={currentStep}
          className="text-sm font-medium text-foreground"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {steps[currentStep]?.title}
        </motion.span>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
          <span className="mx-1.5 opacity-50">|</span>
          <span className="opacity-70">Swipe to navigate</span>
        </p>
      </div>
    </nav>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TutorialProgress({
  variant,
  ...props
}: TutorialProgressProps) {
  // If variant is specified, use it; otherwise this is controlled by parent
  if (variant === "header") {
    return <HeaderProgress {...props} />;
  }

  if (variant === "sidebar") {
    return <SidebarProgress {...props} />;
  }

  // Default: render both with responsive visibility
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <SidebarProgress {...props} />
      </div>
      {/* Mobile header */}
      <div className="lg:hidden">
        <HeaderProgress {...props} />
      </div>
    </>
  );
}

// ============================================================================
// Exports
// ============================================================================

export { SidebarProgress, HeaderProgress };
