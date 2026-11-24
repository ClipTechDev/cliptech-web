"use client";

import { Accordion } from "@base-ui/react/accordion";
import { Plus } from "lucide-react";

import { LEGAL } from "@/lib/legal";
import { Section, SectionIntro } from "@/components/marketing/section";

export function FaqSection({
  items,
  description,
}: {
  items: readonly { question: string; answer: string }[];
  description: string;
}) {
  return (
    <Section id="faq" className="border-t">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionIntro
            eyebrow="FAQ"
            title="Frequently asked questions."
            description={description}
          />
          <p className="mt-6 text-sm text-muted-foreground">
            Something else? Email{" "}
            <a
              href={`mailto:${LEGAL.contactEmail}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {LEGAL.contactEmail}
            </a>
          </p>
        </div>

        <Accordion.Root keepMounted className="border-t">
          {items.map(({ question, answer }) => (
            <Accordion.Item key={question} className="border-b">
              <Accordion.Header>
                <Accordion.Trigger className="group flex min-h-16 w-full items-center justify-between gap-card py-5 text-left font-heading text-base font-semibold outline-none focus-visible:text-primary sm:text-lg">
                  {question}
                  <Plus className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-45" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden text-muted-foreground transition-[height] duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0">
                <p className="max-w-2xl pb-6 leading-relaxed text-pretty">
                  {answer}
                </p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </Section>
  );
}
