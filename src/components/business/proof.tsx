import { cn } from "@/lib/utils";
import { CountUp, RevealGroup, RevealItem } from "@/components/business/reveal";
import { BrandLogo } from "@/components/business/brand-logo";
import { BRAND_LOGOS, BUSINESS_STATS } from "@/components/business/content";

export function Proof() {
  return (
    <section className="border-y bg-muted/40 px-card sm:px-6">
      <div className="mx-auto max-w-6xl">
        <RevealGroup as="dl" className="grid grid-cols-2 lg:grid-cols-4">
          {BUSINESS_STATS.map(({ value, label }, index) => (
            <RevealItem
              key={label}
              className={cn(
                "py-10 pr-card sm:py-12",
                index % 2 === 1 && "border-l pl-card sm:pl-8",
                index >= 2 && "border-t lg:border-t-0",
                index === 2 && "lg:border-l lg:pl-8",
              )}
            >
              <dt className="sr-only">{label}</dt>
              <dd className="font-heading text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
                <CountUp value={value} />
              </dd>
              <dd className="mt-2 max-w-[14rem] text-sm text-muted-foreground">
                {label}
              </dd>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="border-t py-12 sm:py-14">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Brands and platforms we&apos;ve distributed content for
          </p>
          <RevealGroup
            as="ul"
            className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-16 lg:justify-between lg:gap-x-8 lg:px-8"
          >
            {BRAND_LOGOS.map((logo) => (
              <RevealItem
                as="li"
                key={logo.name}
                className="flex h-10 items-center"
              >
                <BrandLogo {...logo} />
              </RevealItem>
            ))}
          </RevealGroup>
          <p className="mx-auto mt-10 max-w-lg text-center text-xs leading-relaxed text-muted-foreground/80">
            Campaigns were distributed through the brands&apos; agencies or
            agencies hired by those brands. Trademarks belong to their
            respective owners.
          </p>
        </div>
      </div>
    </section>
  );
}
