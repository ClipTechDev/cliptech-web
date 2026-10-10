"use client";

import Link from "next/link";
import { Accordion } from "@base-ui/react/accordion";
import { Plus } from "lucide-react";

import { LEGAL } from "@/lib/legal";
import { FAQ_QUESTIONS } from "@/components/landing/faq-data";
import { SectionHeading } from "@/components/landing/section-heading";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t px-card py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading label="FAQ" title="Questions creators ask first." />
          <p className="mt-6 text-sm text-muted-foreground">
            More detail in the{" "}
            <Link href="/legal/rules" className="text-primary underline-offset-4 hover:underline">
              Campaign Rules
            </Link>
            , or email{" "}
            <a
              href={`mailto:${LEGAL.contactEmail}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {LEGAL.contactEmail}
            </a>
            .
          </p>
        </div>

        <Accordion.Root keepMounted className="border-t">
          {FAQ_QUESTIONS.map(({ question, answer }) => (
            <Accordion.Item key={question} className="border-b">
              <Accordion.Header>
                <Accordion.Trigger className="group flex min-h-16 w-full items-center justify-between gap-card py-4 text-left font-heading text-lg font-semibold outline-none focus-visible:text-primary sm:text-xl">
                  {question}
                  <Plus className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-45" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden text-muted-foreground transition-[height] duration-200 data-[ending-style]:h-0 data-[starting-style]:h-0">
                <p className="max-w-xl pb-block text-pretty">{answer}</p>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
