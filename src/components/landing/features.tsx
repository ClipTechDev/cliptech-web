import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { SectionHeading } from "@/components/landing/section-heading";

function Fragment({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      className="flex min-h-28 flex-1 flex-col justify-center gap-tight rounded-lg bg-muted/60 p-card text-sm"
    >
      {children}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-inline">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}

const FEATURES: { title: string; description: string; wide?: boolean; header: ReactNode }[] = [
  {
    title: "Clear briefs, up front",
    description:
      "See the pay rate, budget, rules, accepted platforms and any required hashtags before you make anything.",
    wide: true,
    header: (
      <Fragment>
        <Line label="Rate" value="$2.00 / 1,000 views" />
        <Line label="Budget left" value="$3,480.00" />
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="outline">#launchweek</Badge>
          <Badge variant="outline">#ad</Badge>
          <Badge variant="secondary">Instagram</Badge>
          <Badge variant="secondary">YouTube</Badge>
        </div>
      </Fragment>
    ),
  },
  {
    title: "Submit with a link",
    description: "Paste the post URL. We check the post belongs to your connected account.",
    header: (
      <Fragment>
        <div className="truncate rounded-md border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
          instagram.com/reel/…
        </div>
        <div className="rounded-md bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground">
          Submit clip
        </div>
      </Fragment>
    ),
  },
  {
    title: "Views tracked for you",
    description:
      "We re-check approved posts on a schedule while the campaign runs, and every reading is kept on the submission.",
    header: (
      <Fragment>
        <svg viewBox="0 0 200 60" className="h-16 w-full text-primary" preserveAspectRatio="none">
          <polyline
            points="0,54 25,50 50,47 75,38 100,34 125,22 150,18 175,9 200,4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </Fragment>
    ),
  },
  {
    title: "Know where every clip stands",
    description:
      "Each submission shows whether it is awaiting review, being tracked, rejected or invalidated, with the reason given.",
    wide: true,
    header: (
      <Fragment>
        <div className="flex items-center justify-between gap-inline">
          <span>Reel, 2 hours ago</span>
          <Badge variant="secondary">Awaiting review</Badge>
        </div>
        <div className="flex items-center justify-between gap-inline">
          <span>Short, 4 days ago</span>
          <Badge variant="success">Tracking</Badge>
        </div>
        <div className="flex items-center justify-between gap-inline">
          <span>Post, 6 days ago</span>
          <Badge variant="destructive">Rejected</Badge>
        </div>
      </Fragment>
    ),
  },
  {
    title: "Earnings you can follow",
    description:
      "Pending, available and paid out, each with its own list of what makes up the total.",
    wide: true,
    header: (
      <Fragment>
        <Line label="Pending" value="$71.62" />
        <Line label="Available" value="$208.40" />
        <Line label="Paid out" value="$1,150.00" />
      </Fragment>
    ),
  },
  {
    title: "Real views only",
    description: "A submission found to have bought or botted views is invalidated and stops earning.",
    header: (
      <Fragment>
        {["Bought views", "Bots", "View exchanges"].map((item) => (
          <span key={item} className="text-muted-foreground line-through decoration-destructive">
            {item}
          </span>
        ))}
      </Fragment>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-t px-card py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          label="Features"
          title="Everything between the brief and the payout."
          description="The screens below are examples of what you see in the app."
        />

        <BentoGrid className="mt-10 max-w-none sm:mt-14 md:auto-rows-[19rem]">
          {FEATURES.map(({ title, description, wide, header }) => (
            <BentoGridItem
              key={title}
              title={title}
              description={description}
              header={header}
              className={wide ? "md:col-span-2" : undefined}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
