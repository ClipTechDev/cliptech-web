import { CircleDollarSign, Megaphone, Palette, Zap } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { Section, SectionIntro } from "@/components/marketing/section";

const POINTS = [
  {
    icon: CircleDollarSign,
    title: "Earn from your audience",
    description: "Turn the views you already get into income.",
  },
  {
    icon: Megaphone,
    title: "Work with top brands",
    description: "OTT, sports, apps and consumer brands.",
  },
  {
    icon: Palette,
    title: "Post in your style",
    description: "Adapt the content to fit your page.",
  },
  {
    icon: Zap,
    title: "Keep doing what you do",
    description: "No pitching, no negotiating, no invoices.",
  },
];

export function Value() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionIntro
          eyebrow="Why it matters"
          title="Your audience is valuable. Start earning from it."
          description="ClipTech brings brand campaigns to you, so the views you get turn into income."
        />

        <RevealGroup
          as="ul"
          className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-2xl border bg-border"
        >
          {POINTS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="bg-background p-4 sm:p-7">
              <RevealItem>
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 sm:size-10">
                  <Icon className="size-5 text-primary" />
                </span>
                <h3 className="mt-4 font-heading text-sm font-semibold sm:mt-6 sm:text-lg">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </RevealItem>
            </li>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
