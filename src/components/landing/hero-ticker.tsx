"use client";

import * as React from "react";
import { IconBrandInstagram } from "@tabler/icons-react";

import { formatCurrency, formatNumber } from "@/components/landing/format";
import { Badge } from "@/components/ui/badge";

const STARTING_VIEWS = 12_400;
const INITIAL_VIEWS = 48_210;
const RATE = 2;

export function HeroTicker() {
  const [views, setViews] = React.useState(INITIAL_VIEWS);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setViews((current) => current + 20 + Math.floor(Math.random() * 180));
    }, 1400);
    return () => window.clearInterval(timer);
  }, []);

  const counted = views - STARTING_VIEWS;
  const earned = (counted / 1000) * RATE;

  return (
    <figure className="w-full max-w-md">
      <div
        aria-hidden
        className="rounded-2xl border bg-card shadow-2xl shadow-primary/10"
      >
        <div className="flex items-center justify-between gap-inline border-b p-card">
          <div className="flex min-w-0 items-center gap-inline">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <IconBrandInstagram className="size-5" />
            </span>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold">Your reel</p>
              <p className="truncate text-xs text-muted-foreground">Submitted 3 days ago</p>
            </div>
          </div>
          <Badge variant="success">Tracking</Badge>
        </div>

        <dl className="divide-y font-mono text-sm">
          <Row label="Views now" value={formatNumber(views)} />
          <Row label="Views at submission" value={`− ${formatNumber(STARTING_VIEWS)}`} muted />
          <Row label="Views that count" value={formatNumber(counted)} />
          <Row label="Rate per 1,000 views" value={`× ${formatCurrency(RATE)}`} muted />
        </dl>

        <div className="flex items-end justify-between gap-inline border-t bg-primary/5 p-card">
          <span className="text-sm text-muted-foreground">Earned so far</span>
          <span className="font-mono text-3xl font-semibold tabular-nums text-primary sm:text-4xl">
            {formatCurrency(earned)}
          </span>
        </div>
      </div>

      <figcaption className="mt-3 text-left text-xs text-muted-foreground">
        Example figures. The rate is set by each campaign.
      </figcaption>
    </figure>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-inline px-card py-3">
      <dt className="font-sans text-muted-foreground">{label}</dt>
      <dd className={muted ? "tabular-nums text-muted-foreground" : "tabular-nums"}>{value}</dd>
    </div>
  );
}
