"use client";

/**
 * TutorialStep - Container for step content
 *
 * Adapted from ACFS wizard step patterns.
 *
 * Provides:
 * - Step header with number, title, and time estimate
 * - Learning objectives and action checklist
 * - Main content area
 * - Collapsible "More details" and "Troubleshooting" sections
 * - Back/Next navigation footer
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Clock, Check, BookOpen, Wrench, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TutorialStep as TutorialStepType, TroubleshootingItem } from "@/lib/tutorial-types";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

// ============================================================================
// Types
// ============================================================================

export interface TutorialStepProps {
  /** Step data */
  step: TutorialStepType;
  /** Total number of steps in this path */
  totalSteps: number;
  /** Navigation callbacks */
  onBack?: () => void;
  onNext?: () => void;
  /** Whether back navigation is disabled */
  disableBack?: boolean;
  /** Whether next navigation is disabled */
  disableNext?: boolean;
  /** Main content of the step */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

function LearningObjectives({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <Collapsible defaultOpen className="rounded-xl border border-primary/20 bg-primary/5">
      <CollapsibleTrigger className="w-full px-4 py-3 flex items-center gap-3 text-left">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-primary">
          <BookOpen className="size-5" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-primary">What you&apos;ll learn</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="px-4 pb-4 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ActionChecklist({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Check className="size-4 text-[oklch(0.72_0.19_145)]" />
        <span>What you&apos;ll do</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-4 rounded border border-muted shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TroubleshootingSection({ items }: { items: TroubleshootingItem[] }) {
  if (items.length === 0) return null;

  return (
    <Collapsible className="rounded-xl border border-amber-500/20 bg-amber-500/5">
      <CollapsibleTrigger className="w-full px-4 py-3 flex items-center gap-3 text-left">
        <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
          <Wrench className="size-5" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Troubleshooting</span>
          <span className="text-xs text-muted-foreground ml-2">({items.length} common issues)</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-4">
          {items.map((item, i) => (
            <div key={i} className="space-y-2">
              <p className="text-sm font-medium text-foreground">{item.problem}</p>
              {item.symptoms && item.symptoms.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {item.symptoms.map((symptom, j) => (
                    <li key={j} className="flex items-center gap-1.5">
                      <span className="size-1 rounded-full bg-amber-500" />
                      {symptom}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-muted-foreground">{item.solution}</p>
              {item.commands && item.commands.length > 0 && (
                <div className="space-y-1">
                  {item.commands.map((cmd, j) => (
                    <code key={j} className="block px-2 py-1 rounded bg-muted text-xs font-mono text-foreground">
                      {cmd}
                    </code>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TutorialStep({
  step,
  totalSteps,
  onBack,
  onNext,
  disableBack = false,
  disableNext = false,
  children,
  className,
}: TutorialStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn("space-y-6", className)}
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 shadow-lg shadow-primary/10">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {step.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-mono text-primary">
                  {step.stepNumber}
                </span>
                <span>of {totalSteps}</span>
              </span>
              <span className="opacity-50">·</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {step.estimatedTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning objectives */}
      <LearningObjectives items={step.whatYouLearn} />

      {/* Action checklist */}
      <ActionChecklist items={step.whatYouDo} />

      {/* Main content */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {children}
      </div>

      {/* More details (if provided) */}
      {step.moreDetails && (
        <Collapsible className="rounded-xl border border-border bg-muted/30">
          <CollapsibleTrigger className="w-full px-4 py-3 flex items-center gap-3 text-left">
            <span className="text-sm font-medium text-muted-foreground">More details</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 text-sm text-muted-foreground">
              {step.moreDetails}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Troubleshooting */}
      {step.troubleshooting && step.troubleshooting.length > 0 && (
        <TroubleshootingSection items={step.troubleshooting} />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={disableBack || !onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-5 mr-1" />
          Back
        </Button>

        <Button
          onClick={onNext}
          disabled={disableNext || !onNext}
        >
          {step.stepNumber === totalSteps ? "Complete" : "Next"}
          <ChevronRight className="size-5 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

// Type is already exported with the interface definition above
