import Link from "next/link";
import { readCorpusDoc, CORPUS_DOCS } from "@/lib/corpus";
import { MarkdownRenderer } from "@/components/ui/markdown";
import type { Metadata } from "next";

export const runtime = "nodejs";

// Generate metadata for the document
export async function generateMetadata({
  params,
}: {
  params: Promise<{ doc: string }>;
}): Promise<Metadata> {
  const { doc: docId } = await params;
  const docInfo = CORPUS_DOCS.find((d) => d.id === docId);

  return {
    title: docInfo?.title || "Document",
    description: docInfo?.description || `Read ${docInfo?.title || "this document"} from the Brenner Bot corpus.`,
  };
}

// Icons
const ChevronRightIcon = () => (
  <svg className="size-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const ClockIcon = () => (
  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

function getReadTime(id: string): string {
  const times: Record<string, string> = {
    transcript: "2+ hours",
    "quote-bank": "45 min",
    metaprompt: "10 min",
    "initial-metaprompt": "5 min",
    "distillation-gpt-52": "30 min",
    "distillation-opus-45": "45 min",
    "distillation-gemini-3": "20 min",
  };
  return times[id] || "15 min";
}

function getWordCount(content: string): string {
  const words = content.split(/\s+/).filter(Boolean).length;
  if (words >= 1000) {
    return `${Math.round(words / 1000)}k words`;
  }
  return `${words} words`;
}

function getNavLinks(currentId: string) {
  const currentIndex = CORPUS_DOCS.findIndex((d) => d.id === currentId);
  const prev = currentIndex > 0 ? CORPUS_DOCS[currentIndex - 1] : null;
  const next = currentIndex < CORPUS_DOCS.length - 1 ? CORPUS_DOCS[currentIndex + 1] : null;
  return { prev, next };
}

export default async function CorpusDocPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc: docId } = await params;
  const { doc, content } = await readCorpusDoc(docId);
  const { prev, next } = getNavLinks(docId);
  const wordCount = getWordCount(content);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6 animate-fade-in" aria-label="Breadcrumb">
        <Link href="/corpus" className="hover:text-foreground transition-colors link-underline">
          Corpus
        </Link>
        <ChevronRightIcon />
        <span className="text-foreground font-medium truncate">{doc.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10 pb-8 border-b border-border animate-fade-in-up">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
          {doc.title}
        </h1>

        {doc.description && (
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
            {doc.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border/50">
            <ClockIcon />
            {getReadTime(docId)} read
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border/50">
            <DocumentIcon />
            {wordCount}
          </span>
          <span className="font-mono text-xs px-3 py-1.5 rounded-full bg-muted border border-border/50">
            {doc.filename}
          </span>
        </div>
      </header>

      {/* Content - Beautiful Markdown Rendering */}
      <div className="animate-fade-in-up stagger-1">
        <MarkdownRenderer content={content} />
      </div>

      {/* Navigation */}
      <nav className="mt-16 pt-8 border-t border-border animate-fade-in-up">
        <div className="grid gap-4 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/corpus/${prev.id}`}
              className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-center size-10 rounded-lg bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                <ArrowLeftIcon />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground">Previous</span>
                <div className="font-medium group-hover:text-primary transition-colors truncate">
                  {prev.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {next ? (
            <Link
              href={`/corpus/${next.id}`}
              className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-right sm:flex-row-reverse"
            >
              <div className="flex items-center justify-center size-10 rounded-lg bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                <ArrowRightIcon />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground">Next</span>
                <div className="font-medium group-hover:text-primary transition-colors truncate">
                  {next.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/corpus"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon />
            Back to Corpus
          </Link>
        </div>
      </nav>
    </div>
  );
}
