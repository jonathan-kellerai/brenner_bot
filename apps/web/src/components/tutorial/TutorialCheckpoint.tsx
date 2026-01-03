"use client";

/**
 * TutorialCheckpoint - Celebration milestone component
 *
 * Shown between major steps to celebrate progress and preview what's next.
 * Features celebratory animation and a clear call-to-action to continue.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CheckpointData } from "@/lib/tutorial-types";

// ============================================================================
// Icons
// ============================================================================

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={cn("size-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={cn("size-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={cn("size-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

export interface TutorialCheckpointProps {
  /** Checkpoint data */
  data: CheckpointData;
  /** Continue callback */
  onContinue: () => void;
  /** Whether to show the confetti animation */
  showConfetti?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Confetti Particle
// ============================================================================

// Seeded random function for deterministic confetti
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

interface ConfettiParticleProps {
  delay: number;
  index: number;
}

function ConfettiParticle({ delay, index }: ConfettiParticleProps) {
  // Use index as seed for deterministic randomness
  const seed1 = seededRandom(index * 1);
  const seed2 = seededRandom(index * 2);
  const seed3 = seededRandom(index * 3);
  const seed4 = seededRandom(index * 4);
  const seed5 = seededRandom(index * 5);

  const colors = [
    "bg-primary",
    "bg-accent",
    "bg-success",
    "bg-amber-500",
    "bg-pink-500",
  ];
  const color = colors[index % colors.length];
  const size = seed1 > 0.5 ? "size-2" : "size-1.5";
  const duration = 1.5 + seed2 * 1;
  const xOffset = (seed3 - 0.5) * 200;
  const yExtra = seed4 * 40;
  const rotation = seed5 * 720;

  return (
    <motion.div
      className={cn("absolute rounded-full", color, size)}
      initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0],
        y: [-10, -80 - yExtra],
        x: xOffset,
        rotate: rotation,
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      style={{
        top: "30%",
        left: "50%",
      }}
    />
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TutorialCheckpoint({
  data,
  onContinue,
  showConfetti = true,
  className,
}: TutorialCheckpointProps) {
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    setHasAnimated(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-success/30 bg-gradient-to-br from-success/10 via-success/5 to-primary/5 p-8 text-center",
        className
      )}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-10 size-40 bg-success/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 size-32 bg-primary/20 rounded-full blur-3xl" />
      </div>

      {/* Confetti */}
      {showConfetti && hasAnimated && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <ConfettiParticle key={i} delay={i * 0.05} index={i} />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative space-y-6">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
          className="mx-auto flex items-center justify-center size-16 rounded-2xl bg-success shadow-lg shadow-success/30"
        >
          <SparklesIcon className="text-success-foreground" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-foreground"
        >
          {data.title}
        </motion.h2>

        {/* Accomplishments */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <p className="text-sm font-medium text-success">You&apos;ve accomplished:</p>
          <ul className="space-y-2 text-left max-w-md mx-auto">
            {data.accomplishments.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <CheckCircleIcon className="text-success shrink-0" />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Next preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="pt-2"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Coming up:</span>{" "}
            {data.nextPreview}
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="pt-4"
        >
          <Button
            onClick={onContinue}
            size="lg"
            className="bg-success text-success-foreground hover:bg-success/90 shadow-lg shadow-success/25"
          >
            Continue
            <ArrowRightIcon className="ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Type is already exported with the interface definition above
