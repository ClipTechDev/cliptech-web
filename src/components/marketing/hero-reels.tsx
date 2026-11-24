"use client";

import * as React from "react";
import { useReducedMotion } from "motion/react";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";

const HERO_REELS = [
  { src: "/reels/reel-1.jpg", views: 18_412_305 },
  { src: "/reels/reel-2.jpg", views: 12_406_118 },
  { src: "/reels/reel-3.jpg", views: 8_731_442 },
] as const;

const SLOTS = [
  "z-0 w-[34%] translate-x-6 -rotate-6 opacity-80",
  "z-10 w-[42%]",
  "z-0 w-[34%] -translate-x-6 rotate-6 opacity-80",
];

const format = new Intl.NumberFormat("en-US", {
  notation: "compact",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function useTicker(base: number, active: boolean) {
  const [value, setValue] = React.useState(base);
  React.useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setValue(
        (current) =>
          current + Math.floor(base * (0.001 + Math.random() * 0.003)),
      );
    }, 900);
    return () => window.clearInterval(id);
  }, [active, base]);
  return value;
}

function Phone({
  src,
  views,
  featured,
  live,
}: {
  src: string;
  views: number;
  featured: boolean;
  live: boolean;
}) {
  const count = useTicker(views, live);

  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${src}), linear-gradient(to bottom, #404040, #171717)`,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 to-transparent" />
      <div className="absolute top-2.5 left-1/2 h-4 w-14 -translate-x-1/2 rounded-full bg-neutral-900" />
      {featured && (
        <span className="absolute top-9 left-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm sm:left-4">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-red-500" />
          </span>
          Live
        </span>
      )}
      <p className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap text-white tabular-nums sm:bottom-4 sm:left-4 sm:gap-1.5 sm:text-sm">
        <Play className="size-3.5 shrink-0 fill-white" />
        {format.format(count)}
        <span
          className={cn("font-normal text-white/70", !featured && "hidden")}
        >
          views
        </span>
      </p>
    </>
  );
}

export function HeroReels() {
  const reduced = useReducedMotion();

  return (
    <>
      {HERO_REELS.map((reel, slot) => (
        <div
          key={reel.src}
          className={cn(
            "relative aspect-[9/19] overflow-hidden rounded-[2rem] border-[6px] border-neutral-900 bg-neutral-800 shadow-2xl shadow-black/25 dark:border-neutral-700",
            SLOTS[slot],
          )}
        >
          <Phone {...reel} featured={slot === 1} live={!reduced} />
        </div>
      ))}
    </>
  );
}
