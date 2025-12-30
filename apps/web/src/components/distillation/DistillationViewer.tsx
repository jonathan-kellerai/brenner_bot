"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type {
  ParsedDistillation,
  DistillationPart,
  DistillationSection,
  DistillationContent,
} from "@/lib/distillation-parser";
import { getDistillationMeta, getModelFromId } from "@/lib/distillation-parser";

// ============================================================================
// MODEL THEME SYSTEM - Stripe-level color consistency
// ============================================================================

type ModelTheme = {
  // Primary accent colors with proper contrast
  accent: string;
  accentLight: string;
  accentDark: string;
  // Background treatments
  bgGradient: string;
  bgSubtle: string;
  // Text colors that work in both modes
  textOnAccent: string;
  // Border and shadow
  borderAccent: string;
  shadowAccent: string;
  // Glow effect
  glowColor: string;
};

const MODEL_THEMES: Record<string, ModelTheme> = {
  "distillation-gpt-52": {
    accent: "bg-emerald-500",
    accentLight: "bg-emerald-400",
    accentDark: "bg-emerald-600",
    bgGradient: "from-emerald-500/15 via-emerald-600/10 to-teal-500/5",
    bgSubtle: "bg-emerald-500/8",
    textOnAccent: "text-white",
    borderAccent: "border-emerald-500/30",
    shadowAccent: "shadow-emerald-500/20",
    glowColor: "emerald",
  },
  "distillation-opus-45": {
    accent: "bg-violet-500",
    accentLight: "bg-violet-400",
    accentDark: "bg-violet-600",
    bgGradient: "from-violet-500/15 via-violet-600/10 to-purple-500/5",
    bgSubtle: "bg-violet-500/8",
    textOnAccent: "text-white",
    borderAccent: "border-violet-500/30",
    shadowAccent: "shadow-violet-500/20",
    glowColor: "violet",
  },
  "distillation-gemini-3": {
    accent: "bg-blue-500",
    accentLight: "bg-blue-400",
    accentDark: "bg-blue-600",
    bgGradient: "from-blue-500/15 via-blue-600/10 to-cyan-500/5",
    bgSubtle: "bg-blue-500/8",
    textOnAccent: "text-white",
    borderAccent: "border-blue-500/30",
    shadowAccent: "shadow-blue-500/20",
    glowColor: "blue",
  },
};

function getModelTheme(docId: string): ModelTheme {
  return MODEL_THEMES[docId] ?? MODEL_THEMES["distillation-opus-45"];
}

// ============================================================================
// DISTILLATION HERO - Stripe-level polish
// ============================================================================

interface DistillationHeroProps {
  title: string;
  wordCount: number;
  docId: string;
}

export function DistillationHero({
  title,
  wordCount,
  docId,
}: DistillationHeroProps) {
  const meta = getDistillationMeta(docId);
  const theme = getModelTheme(docId);
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-8 sm:mb-12 border border-border/50">
      {/* Layered gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-background/30" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Accent glow orbs */}
      <div className={`absolute -top-16 -right-16 sm:-top-24 sm:-right-24 size-48 sm:size-80 rounded-full ${theme.accent} opacity-15 blur-[80px]`} />
      <div className={`absolute -bottom-12 -left-12 sm:-bottom-20 sm:-left-20 size-36 sm:size-60 rounded-full ${theme.accent} opacity-10 blur-[60px]`} />

      <div className="relative px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        {/* Top row: Model identity + Date */}
        <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          {/* Model identity */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Model icon with glow */}
            <div className="relative">
              <div className={`absolute inset-0 ${theme.accent} rounded-xl sm:rounded-2xl blur-xl opacity-40`} />
              <div className={`relative size-12 sm:size-16 rounded-xl sm:rounded-2xl ${theme.accent} flex items-center justify-center ${theme.textOnAccent} text-xl sm:text-3xl font-bold shadow-2xl ${theme.shadowAccent}`}>
                {meta.icon}
              </div>
            </div>

            <div className="space-y-0.5">
              {/* Model type label */}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${theme.bgSubtle} ${theme.borderAccent} border`}>
                <span className={`size-1.5 rounded-full ${theme.accent} animate-pulse`} />
                Model Distillation
              </div>

              {/* Model name - high contrast */}
              <h2 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
                {meta.name}
              </h2>

              {/* Tagline - visible in both modes */}
              <p className="text-sm sm:text-base font-medium text-foreground/70">
                {meta.tagline}
              </p>
            </div>
          </div>

          {/* Date badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/5 border border-border/50">
            <CalendarIcon className="size-3.5 text-muted-foreground" />
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
              {meta.date}
            </span>
          </div>
        </div>

        {/* Document title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-foreground mb-5 sm:mb-6 max-w-4xl leading-[1.15]">
          {title}
        </h1>

        {/* Approach description */}
        <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-foreground/75 max-w-3xl mb-8 sm:mb-10">
          {meta.approach}
        </p>

        {/* Key Strengths - Premium cards */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircleIcon className={`size-4 ${theme.accent.replace('bg-', 'text-')}`} />
            <span className="text-xs sm:text-sm font-semibold text-foreground/80 uppercase tracking-wider">
              Key Strengths
            </span>
          </div>

          {/* Horizontal scroll on mobile, wrap on desktop */}
          <div className="relative -mx-5 sm:mx-0">
            <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-hide px-5 sm:px-0 snap-x snap-mandatory">
              {meta.strengths.map((strength, i) => (
                <StrengthPill
                  key={i}
                  strength={strength}
                  theme={theme}
                  index={i}
                />
              ))}
            </div>
            {/* Fade hint on mobile */}
            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
          </div>
        </div>

        {/* Stats row - refined design */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-6 border-t border-border/40">
          <StatChip icon={<ClockIcon />} value={`${readTime} min`} label="read time" />
          <StatChip icon={<DocumentIcon />} value={formatNumber(wordCount)} label="words" />
          <StatChip icon={<SparklesIcon />} value="Frontier" label="model class" accent />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STRENGTH PILL - Premium badge design
// ============================================================================

interface StrengthPillProps {
  strength: string;
  theme: ModelTheme;
  index: number;
}

function StrengthPill({ strength, theme, index }: StrengthPillProps) {
  return (
    <div
      className={`
        group flex-shrink-0 snap-start
        flex items-start gap-2.5 sm:gap-3
        px-4 py-3 sm:px-5 sm:py-3.5
        rounded-xl sm:rounded-2xl
        bg-card/80 backdrop-blur-sm
        border border-border/60
        shadow-sm hover:shadow-md
        hover:border-border
        transition-all duration-200
        max-w-[280px] sm:max-w-none
      `}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Checkmark with accent background */}
      <div className={`
        flex-shrink-0 size-5 sm:size-6 rounded-lg
        ${theme.accent} ${theme.textOnAccent}
        flex items-center justify-center
        shadow-sm ${theme.shadowAccent}
        group-hover:scale-110 transition-transform
      `}>
        <CheckIcon className="size-3 sm:size-3.5" />
      </div>

      {/* Strength text */}
      <span className="text-sm sm:text-[15px] text-foreground/90 leading-snug font-medium">
        {strength}
      </span>
    </div>
  );
}

// ============================================================================
// STAT CHIP - Clean, minimal stats
// ============================================================================

interface StatChipProps {
  icon: ReactNode;
  value: string;
  label: string;
  accent?: boolean;
}

function StatChip({ icon, value, label, accent }: StatChipProps) {
  return (
    <div className={`
      inline-flex items-center gap-2 sm:gap-2.5
      px-3 sm:px-4 py-2 sm:py-2.5
      rounded-xl
      ${accent
        ? "bg-primary/10 border-primary/20"
        : "bg-foreground/5 border-border/50"
      }
      border
      transition-colors
    `}>
      <span className={accent ? "text-primary" : "text-muted-foreground"}>
        {icon}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-semibold text-foreground text-sm sm:text-base">
          {value}
        </span>
        <span className="text-muted-foreground text-xs sm:text-sm">
          {label}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// UTILITY
// ============================================================================

function formatNumber(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  return n.toString();
}

// ============================================================================
// ICONS - Clean, consistent
// ============================================================================

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

// ============================================================================
// PART HEADER
// ============================================================================

interface PartHeaderProps {
  part: DistillationPart;
  docId: string;
}

function PartHeader({ part, docId }: PartHeaderProps) {
  const theme = getModelTheme(docId);

  return (
    <div className="relative my-12 sm:my-16 py-8 sm:py-12">
      {/* Decorative line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Part badge */}
      <div className="relative flex flex-col items-center gap-3 sm:gap-4">
        <div className={`
          relative inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl
          ${theme.accent} ${theme.textOnAccent} shadow-xl ${theme.shadowAccent}
        `}>
          <span className="text-xs sm:text-sm font-medium opacity-80">Part</span>
          <span className="text-xl sm:text-2xl font-bold">{toRoman(part.number)}</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-foreground tracking-tight px-4">
          {part.title}
        </h2>
      </div>
    </div>
  );
}

function toRoman(num: number): string {
  const romans: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  for (const [value, symbol] of romans) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}

// ============================================================================
// SECTION
// ============================================================================

interface SectionProps {
  section: DistillationSection;
  docId: string;
}

function Section({ section, docId }: SectionProps) {
  const HeadingTag = `h${section.level + 1}` as "h2" | "h3" | "h4";
  const headingClasses = {
    1: "text-2xl lg:text-3xl font-bold mb-6 mt-12 first:mt-0",
    2: "text-xl lg:text-2xl font-semibold mb-4 mt-10",
    3: "text-lg lg:text-xl font-semibold mb-3 mt-8",
    4: "text-base lg:text-lg font-semibold mb-2 mt-6",
  };

  return (
    <section className="scroll-mt-24">
      <HeadingTag className={`text-foreground tracking-tight ${headingClasses[section.level]}`}>
        {section.title}
      </HeadingTag>

      <div className="space-y-4">
        {section.content.map((content, i) => (
          <ContentRenderer key={i} content={content} docId={docId} />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// CONTENT RENDERER
// ============================================================================

interface ContentRendererProps {
  content: DistillationContent;
  docId: string;
}

function ContentRenderer({ content, docId }: ContentRendererProps) {
  const theme = getModelTheme(docId);

  switch (content.type) {
    case "paragraph":
      return (
        <p className="text-base lg:text-lg leading-relaxed text-foreground/85">
          {content.text}
        </p>
      );

    case "quote":
      return (
        <figure className="my-6">
          <blockquote className="relative pl-5 sm:pl-6 pr-4 py-4 rounded-xl border-l-4 border-primary bg-primary/5">
            {/* Quote mark */}
            <div className="absolute -left-2 -top-2 text-3xl sm:text-4xl text-primary/30 font-serif select-none">
              &ldquo;
            </div>
            <p className="text-base lg:text-lg leading-relaxed text-foreground/90 italic font-serif">
              {content.text}
            </p>
          </blockquote>
          {content.reference && (
            <figcaption className="mt-2 text-sm text-muted-foreground text-right">
              <span className="font-mono px-2 py-0.5 rounded bg-muted text-xs">
                §{content.reference}
              </span>
            </figcaption>
          )}
        </figure>
      );

    case "list":
      if (content.ordered) {
        return (
          <ol className="my-4 space-y-2.5 sm:space-y-3 ml-1 sm:ml-2">
            {content.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-base lg:text-lg text-foreground/85">
                <span className={`
                  flex-shrink-0 size-6 rounded-lg
                  ${theme.accent} ${theme.textOnAccent}
                  flex items-center justify-center text-xs font-bold
                  shadow-sm ${theme.shadowAccent}
                `}>
                  {i + 1}
                </span>
                <span className="leading-relaxed pt-0.5">{item}</span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="my-4 space-y-2 ml-1 sm:ml-2">
          {content.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-base lg:text-lg text-foreground/85">
              <span className={`flex-shrink-0 size-1.5 rounded-full ${theme.accent} mt-2.5`} />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "code":
      return (
        <pre className="my-4 p-4 rounded-xl bg-muted/50 border border-border overflow-x-auto">
          <code className="text-sm font-mono text-foreground/90">{content.text}</code>
        </pre>
      );

    default:
      return null;
  }
}

// ============================================================================
// RAW CONTENT FALLBACK (for unstructured files)
// ============================================================================

function RawContentFallback({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-base lg:text-lg leading-relaxed text-foreground/85 mb-4">
          {para}
        </p>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN VIEWER
// ============================================================================

interface DistillationViewerProps {
  data: ParsedDistillation;
  docId: string;
}

export function DistillationViewer({ data, docId }: DistillationViewerProps) {
  const [progress, setProgress] = useState(0);
  const theme = getModelTheme(docId);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border/30">
        <div
          className={`h-full ${theme.accent} transition-all duration-150`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <DistillationHero
        title={data.title}
        wordCount={data.wordCount}
        docId={docId}
      />

      <div className="max-w-3xl mx-auto">
        {data.parts.length > 0 ? (
          data.parts.map((part) => (
            <div key={part.number}>
              {data.parts.length > 1 && <PartHeader part={part} docId={docId} />}

              {part.sections.map((section, i) => (
                <Section key={i} section={section} docId={docId} />
              ))}
            </div>
          ))
        ) : data.rawContent ? (
          <RawContentFallback content={data.rawContent} />
        ) : null}
      </div>

      {/* Back to top */}
      <BackToTopButton />
    </>
  );
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 size-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      aria-label="Back to top"
    >
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
}
