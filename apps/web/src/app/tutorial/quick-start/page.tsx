import { Metadata } from "next";
import Link from "next/link";
import { HeroBackground } from "@/components/ui/animated-element";

export const metadata: Metadata = {
  title: "Quick Start",
  description: "Apply the Brenner method to your research question in 30 minutes.",
};

// ============================================================================
// Icons
// ============================================================================

const ArrowLeftIcon = () => (
  <svg className="size-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="size-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const RocketIcon = () => (
  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="size-5 text-[oklch(0.72_0.19_145)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ============================================================================
// Step Data
// ============================================================================

const steps = [
  {
    number: 1,
    title: "Pick a Research Question",
    duration: "~3 min",
    description: "Choose a question you genuinely care about — something you'd love to have a clearer answer to.",
    whatYouLearn: [
      "How to identify questions amenable to the Brenner approach",
      "Distinguishing testable questions from open-ended curiosity",
    ],
  },
  {
    number: 2,
    title: "Form Your Initial Hypothesis",
    duration: "~5 min",
    description: "Write down your best guess. Don't worry about being right — the goal is to have something concrete to test.",
    whatYouLearn: [
      "Why hypothesis-first research is more efficient",
      "The importance of being wrong quickly",
    ],
  },
  {
    number: 3,
    title: "Identify Discriminative Predictions",
    duration: "~5 min",
    description: "What would you observe if your hypothesis is TRUE vs FALSE? Be specific.",
    whatYouLearn: [
      "The key insight: good hypotheses make different predictions than alternatives",
      "How to turn vague ideas into testable claims",
    ],
  },
  {
    number: 4,
    title: "Surface Your Assumptions",
    duration: "~5 min",
    description: "Every hypothesis rests on hidden assumptions. Surface them and assess which are most fragile.",
    whatYouLearn: [
      "Common assumption categories (scale, mechanism, boundary)",
      "How assumptions become vulnerability points",
    ],
  },
  {
    number: 5,
    title: "Design Your First Test",
    duration: "~5 min",
    description: "Design a test that could actually distinguish between your hypothesis and alternatives.",
    whatYouLearn: [
      "What makes a test 'discriminative' vs merely 'supportive'",
      "The Brenner preference for elimination over confirmation",
    ],
  },
  {
    number: 6,
    title: "Run the Test (or Thought Experiment)",
    duration: "~5 min",
    description: "Execute your test — or if that's not feasible, work through what the results would likely be.",
    whatYouLearn: [
      "How to use existing data as a proxy for experiments",
      "When thought experiments are valid vs lazy",
    ],
  },
  {
    number: 7,
    title: "Iterate or Celebrate",
    duration: "~2 min",
    description: "Update your hypothesis based on results. Rinse and repeat.",
    whatYouLearn: [
      "The Brenner Loop as a continuous process",
      "How to build on both success and failure",
    ],
  },
];

// ============================================================================
// Main Component
// ============================================================================

export default function QuickStartPage() {
  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-24">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-0">
        <Link
          href="/tutorial"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon />
          Back to Tutorial Paths
        </Link>
      </div>

      {/* Hero Section */}
      <HeroBackground
        showOrbs
        showGrid
        className="rounded-2xl sm:rounded-3xl"
        primaryOrbClass="bg-[oklch(0.72_0.19_145/0.25)] dark:bg-[oklch(0.72_0.19_145/0.30)]"
        accentOrbClass="bg-accent/20 dark:bg-accent/25"
      >
        <div className="py-10 sm:py-12 lg:py-16 text-center space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-[oklch(0.72_0.19_145/0.2)] text-[oklch(0.72_0.19_145)] mb-4">
            <RocketIcon />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[oklch(0.72_0.19_145/0.1)] text-[oklch(0.72_0.19_145)] text-xs sm:text-sm font-medium">
            Beginner Path
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">Quick Start</span>
          </h1>

          <p className="max-w-xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            Apply the Brenner method to your research question in 30 minutes.
            No special setup required — just your browser and curiosity.
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ClockIcon />
              ~30 min
            </span>
            <span>•</span>
            <span>7 steps</span>
            <span>•</span>
            <span>No setup required</span>
          </div>
        </div>
      </HeroBackground>

      {/* Steps Overview */}
      <section className="px-4 sm:px-0">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-semibold">What You&apos;ll Do</h2>
            <p className="text-sm text-muted-foreground">
              Seven steps from question to tested hypothesis
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group relative flex gap-4 p-4 sm:p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                {/* Step number */}
                <div className="flex-shrink-0 flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary font-bold">
                  {step.number}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <span className="flex-shrink-0 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {step.duration}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  <div className="pt-2 space-y-1.5">
                    {step.whatYouLearn.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircleIcon />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connection line to next step */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[36px] top-full h-4 w-px bg-gradient-to-b from-border to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 px-4 sm:px-0">
        <div className="max-w-xl mx-auto text-center space-y-6 p-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5">
          <h3 className="text-xl font-semibold">Ready to Begin?</h3>
          <p className="text-sm text-muted-foreground">
            The full interactive tutorial with step-by-step guidance is coming soon.
            In the meantime, explore the method documentation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/method"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-[0.98] touch-manipulation"
            >
              Explore the Method
              <ArrowRightIcon />
            </Link>
            <Link
              href="/corpus"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all active:scale-[0.98] touch-manipulation"
            >
              Read the Corpus
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
