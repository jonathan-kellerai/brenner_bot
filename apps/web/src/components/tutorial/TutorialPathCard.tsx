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
import { cn } from "@/lib/utils";
import type { TutorialPath, DifficultyLevel } from "@/lib/tutorial-types";

// ============================================================================
// Icons
// ============================================================================

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-4", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-4", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-4", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-4", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-5", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

// Path-specific icons
const RocketIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-6", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
    />
  </svg>
);

const CpuChipIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-6", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"
    />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    className={cn("size-6", className)}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
    />
  </svg>
);

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
  "quick-start": <RocketIcon />,
  "agent-assisted": <CpuChipIcon />,
  "multi-agent-cockpit": <UsersIcon />,
};

const difficultyColors: Record<DifficultyLevel, { bg: string; text: string }> = {
  beginner: { bg: "bg-success/20", text: "text-success" },
  intermediate: { bg: "bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
  advanced: { bg: "bg-destructive/20", text: "text-destructive" },
};

const statusConfig = {
  available: {
    icon: <PlayIcon />,
    iconBg: "bg-primary",
    iconText: "text-primary-foreground",
    border: "border-primary/30",
    bg: "bg-primary/5",
    pulse: true,
  },
  in_progress: {
    icon: <PlayIcon />,
    iconBg: "bg-accent",
    iconText: "text-accent-foreground",
    border: "border-accent/30",
    bg: "bg-accent/5",
    pulse: true,
  },
  completed: {
    icon: <CheckIcon />,
    iconBg: "bg-success",
    iconText: "text-success-foreground",
    border: "border-success/30",
    bg: "bg-success/5",
    pulse: false,
  },
  locked: {
    icon: <LockIcon />,
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
  const icon = pathIcons[path.id] || <RocketIcon />;

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

        {/* Recommended badge */}
        {recommended && isAccessible && (
          <div className="absolute -right-8 top-4 rotate-45 bg-primary px-10 py-1 text-xs font-semibold text-primary-foreground shadow-md">
            Recommended
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
              ? "bg-success/20 text-success"
              : status === "locked"
                ? "bg-muted text-muted-foreground"
                : "bg-primary/20 text-primary group-hover:bg-primary/30"
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
            <ClockIcon className="size-3.5" />
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
          <ChevronRightIcon className="absolute bottom-4 right-4 text-primary/40 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary group-hover:opacity-100" />
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
