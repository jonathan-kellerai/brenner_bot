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
import { cn } from "@/lib/utils";
import type { TutorialStep as TutorialStepType, TroubleshootingItem } from "@/lib/tutorial-types";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

// ============================================================================
// Icons
// ============================================================================

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={cn("size-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={cn("size-4", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={cn("size-4", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const BookIcon = ({ className }: { className?: string }) => (
  <svg className={cn("size-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const WrenchIcon = ({ className }: { className?: string }) => (
  <svg className={cn("size-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={cn("size-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={cn("size-5", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

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
          <BookIcon />
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
        <CheckIcon className="text-success" />
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
          <WrenchIcon />
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
            <SparklesIcon className="text-primary" />
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
                <ClockIcon className="size-3.5" />
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
          <ChevronLeftIcon className="mr-1" />
          Back
        </Button>

        <Button
          onClick={onNext}
          disabled={disableNext || !onNext}
        >
          {step.stepNumber === totalSteps ? "Complete" : "Next"}
          <ChevronRightIcon className="ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

// Type is already exported with the interface definition above
