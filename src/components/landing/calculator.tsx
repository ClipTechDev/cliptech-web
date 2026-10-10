"use client";

import * as React from "react";

import { formatCurrency, formatNumber } from "@/components/landing/format";
import { SectionHeading } from "@/components/landing/section-heading";

const VIEW_STEPS = [
  10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000,
];

export function Calculator() {
  const [viewStep, setViewStep] = React.useState(3);
  const [rate, setRate] = React.useState(2);

  const views = VIEW_STEPS[viewStep];
  const payout = (views / 1000) * rate;

  return (
    <section className="border-t px-card py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
        <SectionHeading
          label="Do the math"
          title="Views ÷ 1,000 × the campaign rate."
          description="That is the whole formula. Only views gained after you submit count. A campaign can set a minimum view count or a cap per post, and it stops paying once its budget is spent."
        />

        <div className="rounded-2xl border bg-card p-block sm:p-8">
          <Slider
            label="Views your clip gains"
            value={formatNumber(views)}
            min={0}
            max={VIEW_STEPS.length - 1}
            step={1}
            current={viewStep}
            onChange={setViewStep}
          />
          <Slider
            label="Campaign rate per 1,000 views"
            value={formatCurrency(rate)}
            min={0.5}
            max={5}
            step={0.25}
            current={rate}
            onChange={setRate}
            className="mt-6"
          />

          <div className="mt-8 border-t pt-6">
            <p className="text-sm text-muted-foreground">You would earn</p>
            <p
              aria-live="polite"
              className="mt-1 font-mono text-5xl font-semibold tracking-tight tabular-nums text-primary sm:text-6xl"
            >
              {formatCurrency(payout)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
  className,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  const id = React.useId();

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-inline">
        <label htmlFor={id} className="text-sm text-muted-foreground">
          {label}
        </label>
        <span className="font-mono text-lg tabular-nums">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        aria-valuetext={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-11 w-full cursor-pointer accent-primary"
      />
    </div>
  );
}
