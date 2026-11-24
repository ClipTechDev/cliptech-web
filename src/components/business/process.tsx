import { RevealGroup, RevealItem } from "@/components/business/reveal";
import { Section, SectionIntro } from "@/components/business/section";

const STEPS = [
  {
    title: "Share your content",
    description: "Send footage and your guidelines.",
  },
  {
    title: "We distribute",
    description: "Matched to pages that fit your targeting.",
  },
  {
    title: "Creators adapt",
    description: "Edited in each page's native style.",
  },
  {
    title: "You get views",
    description: "Pay only for delivered views.",
  },
];

export function Process() {
  return (
    <Section id="how-it-works" className="border-t bg-muted/40">
      <SectionIntro
        eyebrow="How it works"
        title="Brief to millions of views in four steps."
      />

      <RevealGroup
        as="ol"
        stagger={0.12}
        className="mt-10 grid grid-cols-2 gap-x-5 gap-y-8 sm:mt-14 lg:mt-16 lg:grid-cols-4 lg:gap-8"
      >
        {STEPS.map(({ title, description }, index) => (
          <RevealItem
            as="li"
            key={title}
            className="border-t-2 border-foreground/10 pt-6 first:border-primary"
          >
            <span className="font-mono text-sm text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 font-heading text-base font-semibold sm:text-lg">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
