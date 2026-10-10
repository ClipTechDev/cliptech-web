import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CampaignsCta({ href }: { href: string }) {
  return (
    <section id="campaigns" className="scroll-mt-20 px-card py-4 sm:px-6">
      <Link
        href={href}
        className="group mx-auto flex max-w-6xl flex-col gap-8 rounded-3xl bg-primary p-block text-primary-foreground sm:p-10 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p className="font-mono text-xs opacity-80">Active campaigns</p>
          <h2 className="mt-3 max-w-2xl font-heading text-4xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl">
            See what is open right now.
          </h2>
        </div>
        <span className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-background px-6 font-medium text-foreground transition-transform group-hover:translate-x-1">
          Browse campaigns
          <ArrowRight className="size-5" />
        </span>
      </Link>
    </section>
  );
}
