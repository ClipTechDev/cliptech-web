import {
  BarChart3,
  CircleDollarSign,
  FileCheck2,
  ShieldCheck,
  Target,
} from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { Section, SectionIntro } from "@/components/marketing/section";

const REASONS = [
  {
    icon: CircleDollarSign,
    title: "Get paid for views",
    description: "Turn your audience into a source of income.",
  },
  {
    icon: Target,
    title: "Relevant campaigns",
    description: "Only join what fits your content and audience.",
  },
  {
    icon: FileCheck2,
    title: "Content provided",
    description: "Brands supply approved assets. No starting from scratch.",
  },
  {
    icon: BarChart3,
    title: "More opportunities",
    description: "Campaigns you wouldn't find on your own.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable payouts",
    description: "Track earnings live and withdraw when a campaign closes.",
  },
];

export function Reasons() {
  return (
    <Section id="why" className="border-t">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionIntro
          eyebrow="Why ClipTech"
          title="Why creators and pages use ClipTech."
          className="lg:sticky lg:top-28 lg:self-start"
        />

        <RevealGroup
          as="ul"
          className="divide-y overflow-hidden rounded-2xl border"
        >
          {REASONS.map(({ icon: Icon, title, description }) => (
            <RevealItem
              as="li"
              key={title}
              className="flex items-center gap-card bg-background p-5 sm:gap-block sm:p-6"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:size-11">
                <Icon className="size-5 text-primary" />
              </span>
              <div>
                <h3 className="font-heading text-base font-semibold sm:text-lg">
                  {title}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
