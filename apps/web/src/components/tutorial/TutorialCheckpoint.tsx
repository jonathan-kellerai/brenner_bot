"use client";

/**
 * TutorialCheckpoint - Celebration milestone component
 *
 * Shown between major steps to celebrate progress and preview what's next.
 * Features celebratory animation and a clear call-to-action to continue.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CheckpointData } from "@/lib/tutorial-types";

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
          <Sparkles className="size-6 text-[oklch(0.15_0.02_145)]" />
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
                <CheckCircle className="size-5 text-[oklch(0.72_0.19_145)] shrink-0" />
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
            <ArrowRight className="size-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Type is already exported with the interface definition above
