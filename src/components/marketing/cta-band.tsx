import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";

export function CtaBand({
  eyebrow,
  title,
  description,
  href,
  label,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  label: string;
}) {
  return (
    <section className="px-card py-16 sm:px-6 sm:py-20">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[oklch(0.17_0.03_287)] px-6 py-14 text-white sm:px-14 sm:py-20">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_80%_at_100%_50%,black,transparent)] bg-[size:48px_48px]"
        />
        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.14em] text-[oklch(0.78_0.12_287)] uppercase">
              {eyebrow}
            </p>
            <h2 className="mt-4 font-heading text-3xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-lg text-base text-white/65 sm:text-lg">
              {description}
            </p>
          </div>
          <Button
            size="xl"
            className="h-12 shrink-0 bg-white px-6 text-neutral-900 hover:bg-white/90"
            nativeButton={false}
            render={<a href={href} />}
          >
            {label}
            <ArrowRight />
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
