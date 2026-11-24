import {
  Clapperboard,
  Megaphone,
  ShoppingBag,
  Smartphone,
  Trophy,
} from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/business/reveal";
import { Section, SectionIntro } from "@/components/business/section";

const CATEGORIES = [
  {
    icon: Clapperboard,
    title: "OTT and movie promotions",
    description: "Trailers and moments that drive viewership.",
  },
  {
    icon: Trophy,
    title: "Sports campaigns",
    description: "Match-day content for engaged fans.",
  },
  {
    icon: ShoppingBag,
    title: "Consumer brands",
    description: "Awareness that feels native to the feed.",
  },
  {
    icon: Smartphone,
    title: "App promotions",
    description: "Relevant users, at scale.",
  },
  {
    icon: Megaphone,
    title: "Product launches",
    description: "Concentrated buzz around a release.",
  },
];

export function Categories() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <SectionIntro
          eyebrow="Use cases"
          title="Content that fits your brand."
          description="Creators adapt it to their audience, so it feels native."
        />

        <RevealGroup
          as="ul"
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border"
        >
          {CATEGORIES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="bg-background p-4 sm:p-7">
              <RevealItem>
                <Icon className="size-5 text-primary" />
                <h3 className="mt-4 font-heading text-sm font-semibold sm:mt-5 sm:text-base">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </RevealItem>
            </li>
          ))}
          <li className="bg-muted/50 p-4 sm:p-7">
            <RevealItem>
              <p className="font-heading text-sm font-semibold sm:text-base">
                Something else?
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                We work across a wide range of industries.{" "}
                <a
                  href="#proposal"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Tell us about it
                </a>
                .
              </p>
            </RevealItem>
          </li>
        </RevealGroup>
      </div>
    </Section>
  );
}
