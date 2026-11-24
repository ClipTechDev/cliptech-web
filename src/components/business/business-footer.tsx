import Link from "next/link";

import { LEGAL, LEGAL_DOCUMENTS } from "@/lib/legal";

export function BusinessFooter() {
  return (
    <footer className="border-t px-card py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/"
            className="font-heading text-xl font-extrabold tracking-tight"
          >
            Clip<span className="text-primary">Tech</span>
          </Link>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Short-form content distribution for brands and agencies.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-0 sm:gap-y-tight text-sm">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0"
          >
            For creators
          </Link>
          {LEGAL_DOCUMENTS.map((document) => (
            <Link
              key={document.href}
              href={document.href}
              className="inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0"
            >
              {document.title}
            </Link>
          ))}
          <a
            href={`mailto:${LEGAL.contactEmail}`}
            className="inline-flex min-h-10 items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0"
          >
            Contact
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t pt-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} {LEGAL.entity}
      </p>
    </footer>
  );
}
