import Link from "next/link";
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { ArrowRight } from "lucide-react";

import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import { HeroTicker } from "@/components/landing/hero-ticker";

const PLATFORMS = [
  { label: "Instagram", icon: IconBrandInstagram },
  { label: "TikTok", icon: IconBrandTiktok },
  { label: "YouTube", icon: IconBrandYoutube },
  { label: "X", icon: IconBrandX },
];

export function Hero({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  return (
    <section className="relative isolate overflow-hidden px-card pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-24">
      <BackgroundBeams className="-z-10 opacity-60" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <h1 className="font-heading text-5xl leading-[0.95] font-extrabold tracking-tighter text-balance sm:text-7xl lg:text-[5.5rem]">
            Post the clip.
            <br />
            Get paid <span className="text-primary">per view.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg text-pretty text-muted-foreground sm:text-xl">
            Join a campaign, post on your own account, and earn on the views the clip
            picks up after you submit it.
          </p>

          <div className="mt-8 flex flex-col gap-inline sm:flex-row">
            <Button
              size="xl"
              className="h-12 w-full px-6 sm:w-auto"
              nativeButton={false}
              render={<Link href={ctaHref} />}
            >
              {ctaLabel}
              <ArrowRight />
            </Button>
            <Button
              size="xl"
              variant="ghost"
              className="h-12 w-full px-6 sm:w-auto"
              nativeButton={false}
              render={<a href="#how-it-works" />}
            >
              See how it works
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap items-center gap-x-block gap-y-tight text-sm text-muted-foreground">
            <li>Works with</li>
            {PLATFORMS.map(({ label, icon: Icon }) => (
              <li key={label} className="flex items-center gap-1.5 text-foreground">
                <Icon className="size-4" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroTicker />
        </div>
      </div>
    </section>
  );
}
