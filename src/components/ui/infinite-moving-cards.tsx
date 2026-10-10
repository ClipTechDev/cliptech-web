"use client";

import { cn } from "@/lib/utils";
import React from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const duration = { fast: "20s", normal: "40s", slow: "80s" }[speed];

  return (
    <div
      style={
        {
          "--animation-duration": duration,
          "--animation-direction": direction === "left" ? "forwards" : "reverse",
        } as React.CSSProperties
      }
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_8%,white_92%,transparent)]",
        className,
      )}
    >
      <ul
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {[...items, ...items].map((item, idx) => (
          <li
            className="relative max-w-full shrink-0 rounded-xl border bg-card px-5 py-4 w-[280px] sm:w-[340px]"
            key={idx}
            aria-hidden={idx >= items.length || undefined}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">{item.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{item.title}</span>
            </div>
            <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">{item.quote}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
