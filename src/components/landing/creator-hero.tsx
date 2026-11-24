import Link from "next/link";
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { ArrowRight, BadgeCheck, CircleDollarSign, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeroReels } from "@/components/marketing/hero-reels";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { Eyebrow } from "@/components/marketing/section";

const POINTS = [
  { icon: BadgeCheck, label: "Free to join" },
  { icon: Wallet, label: "No upfront cost" },
  { icon: CircleDollarSign, label: "Paid per view" },
];

const PLATFORMS = [
  { icon: IconBrandInstagram, label: "Instagram" },
  { icon: IconBrandYoutube, label: "YouTube" },
  { icon: IconBrandTiktok, label: "TikTok" },
  { icon: IconBrandX, label: "X" },
];

export function CreatorHero({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <section className="relative isolate overflow-hidden px-card pt-32 pb-20 sm:px-6 sm:pt-40 sm:pb-28">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] bg-[size:56px_56px] opacity-60"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
        <RevealGroup stagger={0.1}>
          <RevealItem>
            <Eyebrow>For creators and page owners</Eyebrow>
          </RevealItem>
          <RevealItem>
            <h1 className="mt-5 font-heading text-[2.75rem] leading-[1.02] font-bold tracking-tight text-balance sm:text-6xl lg:text-[4.25rem]">
              Get paid for the views your page{" "}
              <span className="text-primary">already gets.</span>
            </h1>
          </RevealItem>
          <RevealItem>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
              Post sponsored short-form campaigns from top brands on your own
              account, and earn on every view.
            </p>
          </RevealItem>
          <RevealItem>
            <div className="mt-9 flex flex-col gap-inline sm:flex-row">
              <Button
                size="xl"
                className="h-12 px-6"
                nativeButton={false}
                render={<Link href={ctaHref} />}
              >
                {ctaLabel}
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
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t pt-8 text-sm text-muted-foreground">
              {POINTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-tight">
                  <Icon className="size-4 shrink-0 text-primary" />
                  {label}
                </li>
              ))}
            </ul>
          </RevealItem>
        </RevealGroup>

        <div>
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
          <Reveal delay={0.45}>
            <ul className="mt-10 flex items-center justify-center gap-6 text-muted-foreground sm:gap-8">
              {PLATFORMS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5 text-sm">
                  <Icon className="size-5" stroke={1.6} />
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
