import { ArrowRight, BadgeCheck, Crosshair, Play } from "lucide-react";

import { HeroReels } from "@/components/marketing/hero-reels";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/marketing/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";

const POINTS = [
  { icon: BadgeCheck, label: "Pay only for delivered views" },
  { icon: Crosshair, label: "Niche, language and region targeting" },
  { icon: Play, label: "Campaigns from 1M views" },
];

export function BusinessHero() {
  return (
    <section
      data-hero
      className="relative isolate overflow-hidden px-card pt-32 pb-20 sm:px-6 sm:pt-40 sm:pb-28"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] bg-[size:56px_56px] opacity-60"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        <RevealGroup stagger={0.1}>
          <RevealItem>
            <Eyebrow>For brands and agencies</Eyebrow>
          </RevealItem>
          <RevealItem>
            <h1 className="mt-5 font-heading text-[2.75rem] leading-[1.02] font-bold tracking-tight text-balance sm:text-6xl lg:text-[4.25rem]">
              Turn your campaigns into millions of{" "}
              <span className="text-primary">real views.</span>
            </h1>
          </RevealItem>
          <RevealItem>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
              Your content, distributed across 500+ pages and creators. You pay
              only for the views we deliver.
            </p>
          </RevealItem>

          <RevealItem>
            <div className="mt-9 flex flex-col gap-inline sm:flex-row">
              <Button
                size="xl"
                className="h-12 px-6"
                nativeButton={false}
                render={<a href="#proposal" />}
              >
                Get a campaign proposal
                <ArrowRight />
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="h-12 px-6"
                nativeButton={false}
                render={<a href="#how-it-works" />}
              >
                How it works
              </Button>
            </div>
          </RevealItem>

          <RevealItem>
            <ul className="mt-10 grid gap-3 border-t pt-8 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-card">
              {POINTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-tight">
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {label}
                </li>
              ))}
            </ul>
          </RevealItem>
        </RevealGroup>

        <Reveal
          delay={0.3}
          className="relative mx-auto flex w-full max-w-md items-center justify-center lg:max-w-none"
        >
          <div
            aria-hidden
            className="absolute inset-x-6 top-1/2 -z-10 h-3/4 -translate-y-1/2 rounded-[2.5rem] bg-primary/10 dark:bg-primary/15"
          />
          <HeroReels />
        </Reveal>
      </div>
    </section>
  );
}
