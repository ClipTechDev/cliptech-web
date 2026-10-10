"use client";

import Link from "next/link";
import { Accordion } from "@base-ui/react/accordion";
import { Plus } from "lucide-react";

import { LEGAL } from "@/lib/legal";
import { SectionHeading } from "@/components/landing/section-heading";

const QUESTIONS = [
  {
    question: `How do campaigns work on ${LEGAL.product}?`,
    answer:
      "A campaign sets a rate per 1,000 views, a total budget and rules for the content. You join, post a clip that follows the rules on your own account, and submit the link. You earn on the views that post gains.",
  },
  {
    question: "How do I start?",
    answer:
      "Sign in with your email and the code we send you. There is no password. Then connect the social accounts you post from and browse the campaigns that are open.",
  },
  {
    question: "Which platforms can I post on?",
    answer:
      "Instagram, TikTok, YouTube and X. Each campaign lists which of them it accepts, so check before you post.",
  },
  {
    question: "How do I submit a clip?",
    answer:
      "Post it publicly on a connected account, then paste the full post link into the campaign. Each post can be submitted once, to one campaign.",
  },
  {
    question: "When does my post start earning?",
    answer:
      "We record the view count at the moment you submit and only growth after that counts. If the campaign sets a minimum view threshold, nothing is payable until the post passes it.",
  },
  {
    question: "How do payouts work?",
    answer:
      "Earnings build up while a campaign runs and are released to your available balance once it ends. From there you can request a withdrawal to PayPal or USDT (Ethereum / ERC-20). Withdrawals are reviewed before they are paid.",
  },
  {
    question: "Why was my post rejected?",
    answer:
      "Usually missing hashtags, a platform the campaign does not accept, or content that does not follow the campaign's rules. The reason is shown on the submission, and you can fix it and submit a new clip.",
  },
];

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

        <Accordion.Root className="border-t">
          {QUESTIONS.map(({ question, answer }) => (
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
