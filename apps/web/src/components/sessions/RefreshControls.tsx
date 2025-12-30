"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type RefreshControlsProps = {
  autoIntervalMs?: number;
  defaultAuto?: boolean;
  className?: string;
};

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992m0 0v4.992m0-4.992l-3.181 3.182a8.25 8.25 0 11-2.679-5.656l1.656 1.657"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
      />
    </svg>
  );
}

export function RefreshControls({ autoIntervalMs = 15_000, defaultAuto = false, className }: RefreshControlsProps) {
  const router = useRouter();
  const [auto, setAuto] = React.useState(defaultAuto);

  React.useEffect(() => {
    if (!auto) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
    }, autoIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [auto, autoIntervalMs, router]);

  const intervalSeconds = Math.max(1, Math.round(autoIntervalMs / 1000));

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => router.refresh()} aria-label="Refresh">
          <RefreshIcon className="size-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        <Button
          type="button"
          variant={auto ? "secondary" : "outline"}
          size="sm"
          aria-pressed={auto}
          onClick={() => setAuto((v) => !v)}
          aria-label={auto ? `Auto refresh on (${intervalSeconds}s)` : `Auto refresh off (${intervalSeconds}s)`}
        >
          <ClockIcon className="size-4" />
          <span className="hidden sm:inline">Auto</span>
          <span className="hidden md:inline text-xs text-muted-foreground">{intervalSeconds}s</span>
        </Button>
      </div>
    </div>
  );
}

