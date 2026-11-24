import { Globe2, Heart, Languages, MapPin } from "lucide-react";

import { Eyebrow } from "@/components/business/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/business/reveal";

const DIMENSIONS = [
  {
    icon: Globe2,
    title: "Niche",
    options: ["Entertainment", "Sports", "Gaming", "Tech", "Lifestyle"],
  },
  {
    icon: Languages,
    title: "Language",
    options: ["Hindi", "English", "Tamil", "Telugu", "Bengali"],
  },
  {
    icon: MapPin,
    title: "Region",
    options: ["Pan-India", "Maharashtra", "Delhi NCR", "Karnataka"],
  },
  {
    icon: Heart,
    title: "Audience interests",
    options: ["Movie fans", "Cricket", "Gamers", "Tech enthusiasts"],
  },
];

export function Targeting() {
  return (
    <section
      id="targeting"
      className="scroll-mt-20 bg-[oklch(0.17_0.03_287)] px-card py-20 text-white sm:px-6 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow className="text-[oklch(0.78_0.12_287)]">Targeting</Eyebrow>
          <h2 className="mt-4 font-heading text-3xl leading-[1.1] font-bold tracking-tight text-balance sm:text-[2.75rem]">
            Reach the right audience at scale.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-pretty text-white/65 sm:text-lg">
            Every page is tagged by niche, language, region and audience.
          </p>
        </Reveal>

        <RevealGroup
          as="ul"
          stagger={0.1}
          className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
        >
          {DIMENSIONS.map(({ icon: Icon, title, options }) => (
            <RevealItem
              as="li"
              key={title}
              className="flex items-center gap-block p-5 sm:p-6"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                <Icon className="size-5 text-[oklch(0.78_0.12_287)]" />
              </span>
              <div className="min-w-0">
                <h3 className="font-heading text-lg font-semibold">{title}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {options.map((option) => (
                    <li
                      key={option}
                      className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/75"
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
