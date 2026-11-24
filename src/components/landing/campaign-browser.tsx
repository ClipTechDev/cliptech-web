"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Clapperboard,
  Gamepad2,
  ShoppingBag,
  Smartphone,
  Trophy,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { IconBrandInstagram, IconBrandYoutube } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/marketing/reveal";
import { Section, SectionIntro } from "@/components/marketing/section";

type Category = "Entertainment" | "Sports" | "Apps" | "Brands";

const FILTERS: ("All" | Category)[] = [
  "All",
  "Entertainment",
  "Sports",
  "Apps",
  "Brands",
];

const CAMPAIGNS: {
  name: string;
  category: Category;
  rate: string;
  icon: LucideIcon;
  tint: string;
}[] = [
  {
    name: "OTT series launch",
    category: "Entertainment",
    rate: "$1.50",
    icon: Clapperboard,
    tint: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    name: "Cricket league highlights",
    category: "Sports",
    rate: "$1.20",
    icon: Trophy,
    tint: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    name: "Snack brand drop",
    category: "Brands",
    rate: "$1.00",
    icon: ShoppingBag,
    tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    name: "Mobile game install",
    category: "Apps",
    rate: "$1.40",
    icon: Gamepad2,
    tint: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    name: "Movie trailer clips",
    category: "Entertainment",
    rate: "$1.10",
    icon: Tv,
    tint: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    name: "Fintech app promo",
    category: "Apps",
    rate: "$0.90",
    icon: Smartphone,
    tint: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
];

function PhoneScreen() {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("All");
  const visible = CAMPAIGNS.filter(
    (c) => filter === "All" || c.category === filter,
  );

  return (
    <div className="relative mx-auto w-full max-w-[22rem] rounded-[2.75rem] border-[8px] border-neutral-900 bg-background shadow-2xl shadow-black/20 dark:border-neutral-700">
      <div className="absolute top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-neutral-900" />
      <div className="flex h-[34rem] flex-col overflow-hidden rounded-[2.2rem] px-4 pt-12 pb-4">
        <p className="font-heading text-lg font-semibold">
          Available campaigns
        </p>

        <div
          role="tablist"
          aria-label="Campaign categories"
          className="-mx-4 mt-4 flex shrink-0 gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
        >
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={filter === item}
              onClick={() => setFilter(item)}
              className={cn(
                "h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors",
                filter === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <motion.ul
          layout
          className="mt-4 min-h-0 flex-1 space-y-2 overflow-hidden"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map(({ name, category, rate, icon: Icon, tint }) => (
              <motion.li
                key={name}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 rounded-xl border bg-card p-3"
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    tint,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground tabular-nums">
                      {rate}
                    </span>
                    per 1K views
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    {category}
                  </span>
                  <span className="flex gap-1 text-muted-foreground">
                    <IconBrandInstagram className="size-3.5" />
                    <IconBrandYoutube className="size-3.5" />
                  </span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </div>
  );
}

export function CampaignBrowser() {
  return (
    <Section id="campaigns" className="border-t bg-muted/40">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionIntro
            eyebrow="Campaigns"
            title="Choose campaigns that fit your page."
            description="Pick from campaigns across categories, languages and regions. The rate, budget and rules are shown before you join."
          />
          <Reveal delay={0.1}>
            <p className="mt-8 text-sm text-muted-foreground">
              Try the filters. Campaigns and rates shown are examples.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <PhoneScreen />
        </Reveal>
      </div>
    </Section>
  );
}
