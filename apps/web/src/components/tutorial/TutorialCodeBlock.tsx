"use client";

/**
 * TutorialCodeBlock - Syntax highlighted code block with copy functionality
 *
 * Features:
 * - Syntax highlighting via highlight.js (through rehype-highlight)
 * - Copy button with success feedback
 * - Optional title bar with filename/description
 * - Optional line numbers
 * - Collapsible for long code blocks
 * - Diff mode for before/after comparisons
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Terminal, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";
import type { CodeLanguage, CodeDiff } from "@/lib/tutorial-types";

// ============================================================================
// Types
// ============================================================================

export interface TutorialCodeBlockProps {
  /** The code to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: CodeLanguage;
  /** Optional title (e.g., filename) */
  title?: string;
  /** Optional description below title */
  description?: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Make the code block collapsible */
  collapsible?: boolean;
  /** Start collapsed (only if collapsible) */
  defaultCollapsed?: boolean;
  /** Alternative: show a diff view */
  diff?: CodeDiff;
  /** Additional CSS classes */
  className?: string;
  /** Max height before scrolling (default: none) */
  maxHeight?: string;
}

// ============================================================================
// Language Mapping
// ============================================================================

const languageLabels: Record<CodeLanguage, string> = {
  bash: "Terminal",
  typescript: "TypeScript",
  javascript: "JavaScript",
  markdown: "Markdown",
  json: "JSON",
  yaml: "YAML",
  text: "Text",
};

const languageIcons: Record<CodeLanguage, React.ReactNode> = {
  bash: <Terminal className="size-4" />,
  typescript: <Code className="size-4" />,
  javascript: <Code className="size-4" />,
  markdown: <Code className="size-4" />,
  json: <Code className="size-4" />,
  yaml: <Code className="size-4" />,
  text: <Code className="size-4" />,
};

// ============================================================================
// Code Line Component
// ============================================================================

function CodeLine({
  line,
  lineNumber,
  showLineNumber,
  diffType,
  language,
}: {
  line: string;
  lineNumber: number;
  showLineNumber: boolean;
  diffType?: "add" | "remove" | "context";
  language?: CodeLanguage;
}) {
  // Render bash lines with colored $ prompt and comments
  const renderBashLine = (text: string) => {
    if (text.startsWith("$")) {
      return (
        <>
          <span className="text-success">$</span>
          <span className="text-foreground">{text.slice(1)}</span>
        </>
      );
    }
    if (text.startsWith("#")) {
      return <span className="text-muted-foreground">{text}</span>;
    }
    return text;
  };

  return (
    <div
      className={cn(
        "flex",
        diffType === "add" && "bg-success/10 border-l-2 border-success",
        diffType === "remove" && "bg-destructive/10 border-l-2 border-destructive line-through opacity-70"
      )}
    >
      {showLineNumber && (
        <span className="select-none w-10 pr-3 text-right text-muted-foreground/30 shrink-0">
          {lineNumber}
        </span>
      )}
      <span className="flex-1 pr-4">
        {diffType === "add" && <span className="text-success mr-1">+</span>}
        {diffType === "remove" && <span className="text-destructive mr-1">-</span>}
        {language === "bash" ? renderBashLine(line) : line || " "}
      </span>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TutorialCodeBlock({
  code,
  language = "text",
  title,
  description,
  showLineNumbers = false,
  collapsible = false,
  defaultCollapsed = false,
  diff,
  className,
  maxHeight,
}: TutorialCodeBlockProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [activeTab, setActiveTab] = React.useState<"before" | "after">("after");

  // If diff mode, use diff data
  const displayCode = diff ? (activeTab === "before" ? diff.before : diff.after) : code;
  const displayLanguage = diff ? diff.language : language;
  const lines = displayCode.split("\n");

  // Calculate if code is "long" (more than 15 lines)
  const isLong = lines.length > 15;

  // Header content - Terminal style with traffic lights (ACFS pattern)
  const headerContent = (
    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-muted/30 border-b border-border/50">
      <div className="flex items-center gap-3 min-w-0">
        {/* Traffic light buttons */}
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-full bg-destructive/60" />
          <div className="size-3 rounded-full bg-amber-500/60" />
          <div className="size-3 rounded-full bg-success/60" />
        </div>

        {/* Title or language label */}
        {title ? (
          <span className="text-xs text-muted-foreground font-mono truncate">{title}</span>
        ) : (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            {languageIcons[displayLanguage]}
            <span className="text-xs font-mono">{languageLabels[displayLanguage]}</span>
          </div>
        )}

        {/* Diff tabs */}
        {diff && (
          <div className="flex items-center gap-1 ml-2">
            <button
              type="button"
              onClick={() => setActiveTab("before")}
              className={cn(
                "px-2 py-0.5 text-xs rounded transition-colors",
                activeTab === "before"
                  ? "bg-destructive/20 text-destructive"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Before
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("after")}
              className={cn(
                "px-2 py-0.5 text-xs rounded transition-colors",
                activeTab === "after"
                  ? "bg-success/20 text-success"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              After
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Collapse toggle */}
        {collapsible && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Expand code" : "Collapse code"}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronDown className="size-4" />
            </motion.div>
          </button>
        )}

        {/* Copy button */}
        <CopyButton
          text={displayCode}
          variant="ghost"
          size="sm"
          label="Copy"
          successMessage={`Copied ${lines.length} lines`}
          showPreview={false}
          className="text-muted-foreground hover:text-foreground"
        />
      </div>
    </div>
  );

  // Description (if provided)
  const descriptionContent = description && (
    <div className="px-4 py-2 text-xs text-muted-foreground bg-muted/30 border-b border-border">
      {description}
    </div>
  );

  // Code content with scroll fade indicators
  const codeContent = (
    <div className="relative">
      <div
        className={cn(
          "overflow-x-auto font-mono text-sm leading-relaxed scrollbar-hide",
          maxHeight && "overflow-y-auto",
          !collapsible && isLong && !maxHeight && "max-h-[400px] overflow-y-auto"
        )}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <pre className="p-4 m-0">
          <code className={`language-${displayLanguage}`}>
            {lines.map((line, i) => (
              <CodeLine
                key={i}
                line={line}
                lineNumber={i + 1}
                showLineNumber={showLineNumbers}
                language={displayLanguage}
              />
            ))}
          </code>
        </pre>
      </div>
      {/* Scroll fade indicators (ACFS pattern) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-[oklch(0.12_0.015_260)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-[oklch(0.12_0.015_260)] to-transparent" />
    </div>
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-[oklch(0.12_0.015_260)] overflow-hidden",
        "shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20",
        className
      )}
    >
      {/* Header */}
      {headerContent}

      {/* Description */}
      {descriptionContent}

      {/* Code (collapsible) */}
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
              {codeContent}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        codeContent
      )}
    </div>
  );
}

// ============================================================================
// Inline Code Component (for inline snippets)
// ============================================================================

export interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
  copyable?: boolean;
}

export function InlineCode({ children, className, copyable = false }: InlineCodeProps) {
  const text = typeof children === "string" ? children : "";

  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-1",
        "px-1.5 py-0.5 rounded-md",
        "bg-muted font-mono text-sm",
        "border border-border/50",
        copyable && "group pr-6",
        className
      )}
    >
      <span>{children}</span>
      {copyable && text && (
        <span className="absolute right-0.5 top-1/2 -translate-y-1/2">
          <CopyButton
            text={text}
            variant="ghost"
            size="sm"
            showPreview={false}
            className="opacity-0 group-hover:opacity-100 p-0.5"
          />
        </span>
      )}
    </span>
  );
}

// Types are already exported with their interface definitions above
