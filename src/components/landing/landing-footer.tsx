import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LEGAL, LEGAL_DOCUMENTS } from "@/lib/legal";
import { Button } from "@/components/ui/button";

export function LandingFooter({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  return (
    <footer className="overflow-hidden border-t px-card pt-16 sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-2xl font-heading text-4xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl">
            All you need is an email and an account to post from.
          </h2>
          <Button
            size="xl"
            className="h-12 w-full shrink-0 px-6 sm:w-auto"
            nativeButton={false}
            render={<Link href={ctaHref} />}
          >
            {ctaLabel}
            <ArrowRight />
          </Button>
        </div>

        <div className="mt-16 flex flex-col gap-card border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} {LEGAL.entity}
          </p>
          <nav className="flex flex-wrap gap-x-card gap-y-tight">
            {LEGAL_DOCUMENTS.map((document) => (
              <Link
                key={document.href}
                href={document.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {document.title}
              </Link>
            ))}
            <a
              href={`mailto:${LEGAL.contactEmail}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </nav>
        </div>

        <p
          aria-hidden
          className="mt-8 -mb-[0.18em] text-center font-heading text-[23vw] leading-none font-extrabold tracking-tighter text-foreground/[0.06] select-none lg:text-[17rem]"
        >
          ClipTech
        </p>
      </div>
    </footer>
  );
}
