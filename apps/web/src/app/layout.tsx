import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brenner Bot Lab",
  description:
    "Research lab for operationalizing the Brenner method via multi-agent collaboration.",
};

const NAV_ITEMS = [
  { href: "/corpus", label: "Corpus" },
  { href: "/distillations", label: "Distillations" },
  { href: "/method", label: "Method" },
] as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const labModeValue = (process.env.BRENNER_LAB_MODE ?? "").trim().toLowerCase();
  const labModeEnabled = labModeValue === "1" || labModeValue === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-dvh bg-background text-foreground">
          <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-[var(--space-container-x)] py-4">
              <Link
                href="/"
                className="font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
              >
                Brenner Bot Lab
              </Link>
              <nav className="flex items-center gap-6 text-sm">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                {labModeEnabled && (
                  <Link
                    href="/sessions/new"
                    className="rounded-lg bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    New Session
                  </Link>
                )}
              </nav>
            </div>
          </header>

          <main className="mx-auto w-full max-w-5xl px-[var(--space-container-x)] py-[var(--space-section-y)]">
            {children}
          </main>

          <footer className="border-t border-border/50 bg-muted/30">
            <div className="mx-auto max-w-5xl px-[var(--space-container-x)] py-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Research lab for operationalizing the Brenner method.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <a
                    href="https://github.com/Dicklesworthstone/brenner_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://github.com/Dicklesworthstone/mcp_agent_mail"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    Agent Mail
                  </a>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground/60">
                Built with Next.js + Bun. Coordinated via Agent Mail (MCP).
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
