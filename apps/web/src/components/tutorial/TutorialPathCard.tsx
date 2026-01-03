"use client";

/**
 * TutorialPathCard - Card for selecting tutorial paths
 *
 * Adapted from ACFS LessonCard patterns with:
 * - Glassmorphic design with ambient glow
 * - Status indicators (available, locked, completed)
 * - Difficulty and time estimates
 * - Hover animations with reduced motion support
 * - Mobile-friendly touch targets (44px minimum)
 */

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Lock, Play, Clock, ChevronRight, Rocket, Cpu, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TutorialPath, DifficultyLevel } from "@/lib/tutorial-types";

// ============================================================================
// Types
// ============================================================================

export type PathStatus = "available" | "locked" | "completed" | "in_progress";

export interface TutorialPathCardProps {
  /** Path data */
  path: TutorialPath;
  /** Current status of this path */
  status: PathStatus;
  /** Whether this is the recommended path */
  recommended?: boolean;
  /** Callback when card is clicked (if not using href) */
  onClick?: () => void;
  /** Whether to prefer reduced motion */
  prefersReducedMotion?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const pathIcons: Record<string, React.ReactNode> = {
  "quick-start": <Rocket className="size-6" />,
  "agent-assisted": <Cpu className="size-6" />,
  "multi-agent-cockpit": <Users className="size-6" />,
};

const difficultyColors: Record<DifficultyLevel, { bg: string; text: string }> = {
  beginner: { bg: "bg-[oklch(0.72_0.19_145/0.2)]", text: "text-[oklch(0.72_0.19_145)]" },
  intermediate: { bg: "bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
  advanced: { bg: "bg-destructive/20", text: "text-destructive" },
};

const statusConfig = {
  available: {
    icon: <Play className="size-4" />,
    iconBg: "bg-primary",
    iconText: "text-primary-foreground",
    border: "border-primary/30",
    bg: "bg-primary/5",
    pulse: true,
  },
  in_progress: {
    icon: <Play className="size-4" />,
    iconBg: "bg-accent",
    iconText: "text-accent-foreground",
    border: "border-accent/30",
    bg: "bg-accent/5",
    pulse: true,
  },
  completed: {
    icon: <Check className="size-4" strokeWidth={2.5} />,
    iconBg: "bg-[oklch(0.72_0.19_145)]",
    iconText: "text-[oklch(0.15_0.02_145)]",
    border: "border-[oklch(0.72_0.19_145/0.3)]",
    bg: "bg-[oklch(0.72_0.19_145/0.05)]",
    pulse: false,
  },
  locked: {
    icon: <Lock className="size-4" />,
    iconBg: "bg-muted",
    iconText: "text-muted-foreground",
    border: "border-border",
    bg: "bg-muted/30",
    pulse: false,
  },
};

// ============================================================================
// Main Component
// ============================================================================

export function TutorialPathCard({
  path,
  status,
  recommended = false,
  onClick,
  prefersReducedMotion = false,
  className,
}: TutorialPathCardProps) {
  const isAccessible = status !== "locked";
  const config = statusConfig[status];
  const diffColors = difficultyColors[path.difficulty];
  const icon = pathIcons[path.id] || <Rocket className="size-6" />;

  const cardContent = (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 300, damping: 25 }
      }
      whileHover={
        isAccessible && !prefersReducedMotion
          ? { y: -6, scale: 1.02 }
          : undefined
      }
      whileTap={
        isAccessible && !prefersReducedMotion ? { scale: 0.98 } : undefined
      }
      className="h-full"
    >
      <div
        className={cn(
          "group relative h-full overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-300",
          config.border,
          config.bg,
          isAccessible
            ? "cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
            : "cursor-not-allowed opacity-60",
          className
        )}
        style={{ minHeight: 44 }} // Touch target
      >
        {/* Ambient glow on hover */}
        {isAccessible && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        )}

        {/* Top gradient line for available/in_progress */}
        {(status === "available" || status === "in_progress") && (
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        )}

        {/* Recommended badge - premium inline style */}
        {recommended && isAccessible && (
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
            <Sparkles className="size-3" />
            <span>Recommended</span>
          </div>
        )}

        {/* Status indicator */}
        <div className="absolute right-4 top-4">
          <motion.div
            className={cn(
              "flex items-center justify-center size-8 rounded-full shadow-lg",
              config.iconBg,
              config.iconText
            )}
            animate={
              config.pulse && !prefersReducedMotion
                ? { scale: [1, 1.1, 1] }
                : undefined
            }
            transition={
              config.pulse && !prefersReducedMotion
                ? { duration: 2, repeat: Infinity }
                : undefined
            }
          >
            {config.icon}
          </motion.div>
        </div>

        {/* Path icon */}
        <div
          className={cn(
            "mb-4 flex items-center justify-center size-12 rounded-xl transition-all duration-300",
            status === "completed"
              ? "bg-[oklch(0.72_0.19_145/0.2)] text-[oklch(0.72_0.19_145)]"
              : status === "locked"
                ? "bg-muted text-muted-foreground"
                : "bg-primary/20 text-primary group-hover:bg-primary/30",
            recommended && isAccessible && "mt-8" // Make room for badge
          )}
        >
          {icon}
        </div>

        {/* Title */}
        <h3
          className={cn(
            "mb-2 text-lg sm:text-xl font-bold transition-colors",
            status === "locked"
              ? "text-muted-foreground"
              : "text-foreground group-hover:text-primary"
          )}
        >
          {path.title}
        </h3>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {path.description}
        </p>

        {/* Meta info row */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Difficulty badge */}
          <span
            className={cn(
              "px-2 py-0.5 rounded-full font-medium capitalize",
              diffColors.bg,
              diffColors.text
            )}
          >
            {path.difficulty}
          </span>

          {/* Duration */}
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3.5" />
            {path.estimatedDuration}
          </span>

          {/* Step count */}
          <span className="text-muted-foreground">
            {path.totalSteps} steps
          </span>
        </div>

        {/* Prerequisites (if locked) */}
        {status === "locked" && path.prerequisites && path.prerequisites.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Prerequisites:</span>{" "}
              {path.prerequisites.join(", ")}
            </p>
          </div>
        )}

        {/* Hover arrow */}
        {isAccessible && (
          <ChevronRight className="absolute bottom-4 right-4 size-5 text-primary/40 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary group-hover:opacity-100" />
        )}
      </div>
    </motion.div>
  );

  // If there's an href, wrap in Link
  if (isAccessible && path.href) {
    return (
      <Link href={path.href} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  // If there's an onClick handler
  if (isAccessible && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block h-full w-full text-left"
        style={{ minHeight: 44 }}
      >
        {cardContent}
      </button>
    );
  }

  // Otherwise just render the card
  return cardContent;
}

// ============================================================================
// Path Selection Grid
// ============================================================================

export interface TutorialPathGridProps {
  /** Available paths */
  paths: TutorialPath[];
  /** Status for each path by ID */
  pathStatus: Record<string, PathStatus>;
  /** ID of the recommended path */
  recommendedPathId?: string;
  /** Whether to prefer reduced motion */
  prefersReducedMotion?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function TutorialPathGrid({
  paths,
  pathStatus,
  recommendedPathId,
  prefersReducedMotion = false,
  className,
}: TutorialPathGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-6",
        paths.length <= 2
          ? "sm:grid-cols-2"
          : "sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {paths.map((path, index) => (
        <motion.div
          key={path.id}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { delay: index * 0.1, type: "spring", stiffness: 300, damping: 25 }
          }
        >
          <TutorialPathCard
            path={path}
            status={pathStatus[path.id] || "locked"}
            recommended={path.id === recommendedPathId}
            prefersReducedMotion={prefersReducedMotion}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Types are already exported with their interface definitions above
