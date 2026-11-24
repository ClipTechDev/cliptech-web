"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/marketing/reveal";
import { Section, SectionIntro } from "@/components/marketing/section";

type Tone = "primary" | "warning" | "success";

type Stage = {
  icon: LucideIcon;
  title: string;
  summary: string;
  badge: string;
  tone: Tone;
  views: string;
  progress: number;
  spike: "none" | "flagged" | "removed";
  note: { icon: LucideIcon; title: string; body: string };
};

const STAGES: Stage[] = [
  {
    icon: Activity,
    title: "Monitor",
    summary: "Every placement tracked from the hour it goes live.",
    badge: "Live",
    tone: "primary",
    views: "3.4M",
    progress: 0.4,
    spike: "none",
    note: {
      icon: Activity,
      title: "48 placements live",
      body: "View growth checked against each page's normal pattern.",
    },
  },
  {
    icon: TriangleAlert,
    title: "Flag",
    summary: "Abnormal spikes are caught automatically.",
    badge: "Under review",
    tone: "warning",
    views: "4.5M",
    progress: 0.6,
    spike: "flagged",
    note: {
      icon: TriangleAlert,
      title: "1 placement flagged",
      body: "+2.1M views in 40 minutes. Held from delivery.",
    },
  },
  {
    icon: ClipboardCheck,
    title: "Review",
    summary: "Flagged views never reach your count unverified.",
    badge: "Reviewed",
    tone: "primary",
    views: "5.8M",
    progress: 0.75,
    spike: "removed",
    note: {
      icon: ClipboardCheck,
      title: "2.1M views excluded",
      body: "Placement removed. Only verified views count.",
    },
  },
  {
    icon: ShieldCheck,
    title: "Deliver",
    summary: "Target missed? We extend or refund the shortfall.",
    badge: "Delivered",
    tone: "success",
    views: "10.0M",
    progress: 1,
    spike: "removed",
    note: {
      icon: CheckCircle2,
      title: "Target met",
      body: "Final report with every live link shared.",
    },
  },
];

const TONES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
};

const CLEAN = [
  3, 6, 10, 14, 19, 24, 30, 36, 42, 48, 55, 62, 69, 77, 84, 92, 100,
];
const SPIKE_AT = 9;
const W = 320;
const H = 120;
const STEP_MS = 4500;

function toPath(series: number[]) {
  return series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * W;
      const y = H - (value / 110) * H;
      return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

const CLEAN_LINE = toPath(CLEAN);
const SPIKE_LINE = toPath(CLEAN.map((v, i) => (i >= SPIKE_AT ? v + 22 : v)));
const SPIKE_X = (SPIKE_AT / (CLEAN.length - 1)) * W;
const SPIKE_Y = H - ((CLEAN[SPIKE_AT] + 22) / 110) * H;

function Chart({ stage }: { stage: Stage }) {
  const line = stage.spike === "flagged" ? SPIKE_LINE : CLEAN_LINE;
  const spring = { type: "spring", stiffness: 90, damping: 20 } as const;

  return (
    <svg
      viewBox={`0 0 ${W} ${H + 4}`}
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label={`View growth chart, stage: ${stage.title}`}
    >
      <defs>
        <clipPath id="integrity-clip">
          <motion.rect
            x="0"
            y="-20"
            height={H + 30}
            initial={false}
            animate={{ width: W * stage.progress }}
            transition={spring}
          />
        </clipPath>
      </defs>
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={ratio}
          x1="0"
          x2={W}
          y1={H * ratio}
          y2={H * ratio}
          className="stroke-border"
          strokeDasharray="3 4"
        />
      ))}
      <line
        x1="0"
        x2={W}
        y1={H - (100 / 110) * H}
        y2={H - (100 / 110) * H}
        className="stroke-success/50"
        strokeDasharray="4 4"
      />
      <g clipPath="url(#integrity-clip)">
        <motion.path
          initial={false}
          animate={{ d: `${line} L${W} ${H} L0 ${H} Z` }}
          transition={spring}
          className="fill-primary/10"
        />
        <motion.path
          initial={false}
          animate={{ d: line }}
          transition={spring}
          className="stroke-primary"
          fill="none"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
      <AnimatePresence>
        {stage.spike === "flagged" && (
          <motion.g
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ transformOrigin: `${SPIKE_X}px ${SPIKE_Y}px` }}
          >
            <circle
              cx={SPIKE_X}
              cy={SPIKE_Y}
              r="10"
              className="fill-warning/20"
            />
            <circle
              cx={SPIKE_X}
              cy={SPIKE_Y}
              r="4"
              className="fill-warning stroke-card"
              strokeWidth="2"
            />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

function ReportCard({ stage }: { stage: Stage }) {
  const Note = stage.note.icon;

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <p className="text-xs text-muted-foreground">Campaign report</p>
          <p className="font-heading text-sm font-semibold">Series launch</p>
        </div>
        <span
          className={cn(
            "rounded-md px-2 py-1 text-xs font-medium transition-colors",
            TONES[stage.tone],
          )}
        >
          {stage.badge}
        </span>
      </div>

      <div className="px-6 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Verified views</p>
            <p className="font-heading text-3xl font-bold tracking-tight tabular-nums">
              {stage.views}
            </p>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            Target 10M
          </p>
        </div>
        <div className="mt-6">
          <Chart stage={stage} />
        </div>
      </div>

      <div className="relative m-6 h-24 sm:h-[4.75rem]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={stage.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "absolute inset-0 flex gap-inline rounded-lg border p-4",
              stage.tone === "warning" && "border-warning/30 bg-warning/5",
              stage.tone === "success" && "border-success/30 bg-success/5",
              stage.tone === "primary" && "bg-muted/40",
            )}
          >
            <Note
              className={cn(
                "mt-0.5 size-4 shrink-0",
                stage.tone === "warning" && "text-warning",
                stage.tone === "success" && "text-success",
                stage.tone === "primary" && "text-primary",
              )}
            />
            <div className="text-sm">
              <p className="font-medium">{stage.note.title}</p>
              <p className="mt-0.5 text-muted-foreground">{stage.note.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Integrity() {
  const [active, setActive] = React.useState(0);
  const [auto, setAuto] = React.useState(true);
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduced = useReducedMotion();
  const playing = auto && inView && !reduced;

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(
      () => setActive((index) => (index + 1) % STAGES.length),
      STEP_MS,
    );
    return () => window.clearTimeout(id);
  }, [playing, active]);

  return (
    <Section id="integrity" className="border-t">
      <div
        ref={ref}
        className="grid items-center gap-6 lg:grid-cols-2 lg:gap-20"
      >
        <div>
          <SectionIntro
            eyebrow="Campaign integrity"
            title="Real views. Accountable delivery."
            description="Watch how every campaign is protected."
          />

          <Reveal delay={0.1}>
            <ul
              role="tablist"
              aria-label="Integrity stages"
              className="mt-8 grid grid-cols-4 gap-1.5 lg:mt-10 lg:block lg:space-y-2"
            >
              {STAGES.map(({ icon: Icon, title, summary }, index) => {
                const selected = index === active;
                return (
                  <li key={title}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => {
                        setAuto(false);
                        setActive(index);
                      }}
                      className={cn(
                        "relative flex h-full w-full flex-col items-center gap-2 overflow-hidden rounded-xl border px-1 py-3 text-center transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:flex-row lg:items-start lg:gap-card lg:p-4 lg:text-left",
                        selected
                          ? "border-border bg-card shadow-sm"
                          : "border-transparent hover:bg-muted/60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span>
                        <span className="block font-heading text-xs font-semibold lg:text-base">
                          <span className="hidden lg:inline">
                            {String(index + 1).padStart(2, "0")} ·{" "}
                          </span>
                          {title}
                        </span>
                        <span className="mt-0.5 hidden text-sm text-muted-foreground lg:block">
                          {summary}
                        </span>
                      </span>
                      {selected && playing && (
                        <motion.span
                          key={active}
                          className="absolute bottom-0 left-0 h-0.5 bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{
                            duration: STEP_MS / 1000,
                            ease: "linear",
                          }}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 min-h-10 text-center text-sm text-muted-foreground lg:hidden">
              {STAGES[active].summary}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <ReportCard stage={STAGES[active]} />
        </Reveal>
      </div>
    </Section>
  );
}
