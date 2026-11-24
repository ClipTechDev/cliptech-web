import { BarChart3, FolderOpen, Upload, UserRound } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { Eyebrow } from "@/components/marketing/section";

const STEPS = [
  {
    icon: UserRound,
    title: "Join",
    description:
      "Sign in with your email and connect the accounts you post from.",
  },
  {
    icon: FolderOpen,
    title: "Choose",
    description:
      "Pick campaigns that fit your page. Rates and rules are shown up front.",
  },
  {
    icon: Upload,
    title: "Post",
    description: "Post the content on your account and submit the link.",
  },
  {
    icon: BarChart3,
    title: "Earn",
    description: "Get paid for the views it gains. Withdraw to PayPal or USDT.",
  },
];

export function Steps() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-[oklch(0.17_0.03_287)] px-card py-20 text-white sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <Eyebrow className="text-[oklch(0.78_0.12_287)]">
            How it works
          </Eyebrow>
          <h2 className="mt-4 font-heading text-3xl leading-[1.1] font-bold tracking-tight text-balance sm:text-[2.75rem]">
            Four steps to start earning.
          </h2>
        </Reveal>

        <RevealGroup
          as="ol"
          stagger={0.12}
          className="mt-12 grid grid-cols-2 gap-3 sm:mt-16 lg:grid-cols-4 lg:gap-4"
        >
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <RevealItem
              as="li"
              key={title}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-white/50 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon className="size-5 text-[oklch(0.78_0.12_287)]" />
              </div>
              <h3 className="mt-8 font-heading text-lg font-semibold sm:mt-12 sm:text-xl">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {description}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
