import {
  BarChart3,
  Crosshair,
  Network,
  Palette,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { Section, SectionIntro } from "@/components/marketing/section";

const REASONS = [
  {
    icon: BarChart3,
    title: "Performance-based pricing",
    description: "Pay per delivered view, not per post.",
  },
  {
    icon: Network,
    title: "Large distribution network",
    description: "100M+ followers across 500+ pages.",
  },
  {
    icon: Crosshair,
    title: "Targeted campaigns",
    description: "Niche, language and region.",
  },
  {
    icon: Palette,
    title: "Content in each page's own style",
    description: "Native edits that earn engagement.",
  },
  {
    icon: ShieldCheck,
    title: "Campaign integrity",
    description: "Fake views never reach your report.",
  },
  {
    icon: Zap,
    title: "Simple and efficient",
    description: "One brief. One point of contact.",
  },
];

export function WhyUs() {
  return (
    <Section className="border-t bg-muted/40">
      <SectionIntro
        eyebrow="Why ClipTech"
        title="Why brands and agencies choose ClipTech."
      />

      <RevealGroup
        as="ul"
        className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:mt-14 lg:mt-16 lg:grid-cols-3"
      >
        {REASONS.map(({ icon: Icon, title, description }) => (
          <li key={title} className="bg-background p-4 sm:p-8">
            <RevealItem>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 sm:size-10">
                <Icon className="size-5 text-primary" />
              </span>
              <h3 className="mt-4 font-heading text-sm font-semibold sm:mt-6 sm:text-lg">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </RevealItem>
          </li>
        ))}
      </RevealGroup>
    </Section>
  );
}
