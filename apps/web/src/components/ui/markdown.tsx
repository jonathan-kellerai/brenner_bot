"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Custom components for beautiful rendering
const components: Components = {
  // Headings with proper hierarchy and styling
  h1: ({ children }) => (
    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mt-12 mb-6 first:mt-0 pb-4 border-b border-border">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground mt-10 mb-4 pb-2 border-b border-border/50">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl lg:text-2xl font-semibold text-foreground mt-8 mb-3">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg font-semibold text-foreground mt-6 mb-2">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-base font-semibold text-foreground mt-4 mb-2">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-2">
      {children}
    </h6>
  ),

  // Paragraphs with optimal reading typography
  p: ({ children }) => (
    <p className="text-base lg:text-lg leading-relaxed text-foreground/90 mb-4 [&:last-child]:mb-0">
      {children}
    </p>
  ),

  // Blockquotes with distinctive styling
  blockquote: ({ children }) => (
    <blockquote className="relative my-6 pl-6 py-4 pr-4 border-l-4 border-primary bg-primary/5 rounded-r-xl italic text-foreground/80">
      <div className="absolute -left-3 -top-3 text-4xl text-primary/30 font-serif">&ldquo;</div>
      {children}
    </blockquote>
  ),

  // Lists with proper spacing and bullets
  ul: ({ children }) => (
    <ul className="my-4 ml-6 space-y-2 list-none">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 ml-6 space-y-2 list-none counter-reset-item">
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => {
    const isOrdered = props.node?.position?.start.column === 1;
    return (
      <li className="relative pl-6 text-base lg:text-lg leading-relaxed text-foreground/90">
        <span className="absolute left-0 top-0 text-primary font-medium">
          {isOrdered ? "•" : "•"}
        </span>
        {children}
      </li>
    );
  },

  // Code blocks with syntax highlighting style
  pre: ({ children }) => (
    <pre className="my-6 p-4 lg:p-6 rounded-xl bg-muted/80 border border-border overflow-x-auto text-sm lg:text-base font-mono leading-relaxed">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return <code className="text-foreground">{children}</code>;
    }
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-muted text-primary font-mono text-sm border border-border/50">
        {children}
      </code>
    );
  },

  // Links with hover effects
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary font-medium underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-colors"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),

  // Strong and emphasis
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-foreground/90">{children}</em>
  ),

  // Horizontal rules
  hr: () => (
    <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  ),

  // Tables with responsive styling
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm lg:text-base">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted/50 border-b border-border">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-border">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-muted/30 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-foreground/90">
      {children}
    </td>
  ),

  // Images
  img: ({ src, alt }) => (
    <figure className="my-6">
      <img
        src={src}
        alt={alt || ""}
        className="rounded-xl border border-border shadow-lg max-w-full h-auto"
      />
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground italic">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
};

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <article className={`prose-custom max-w-none ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}

// Export individual styled components for use elsewhere
export const MarkdownHeading = {
  H1: components.h1,
  H2: components.h2,
  H3: components.h3,
  H4: components.h4,
};

export const MarkdownBlockquote = components.blockquote;
