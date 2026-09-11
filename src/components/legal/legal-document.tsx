import type { ReactNode } from "react";

import { LEGAL } from "@/lib/legal";

/**
 * The shape every legal page takes.
 *
 * Explicit components rather than a prose plugin: this project does not carry
 * @tailwindcss/typography, and a legal document needs exactly five elements -
 * a heading, a paragraph, a list, a term and a link. Building those by hand
 * keeps them on the app's own spacing scale instead of a second one.
 *
 * Sections carry ids so a specific clause can be linked to directly, which is
 * how these documents are actually cited in a support thread.
 */
export function LegalDocument({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <article className="space-y-section">
      <header className="space-y-inline">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        <p className="text-pretty text-muted-foreground">{summary}</p>
        <p className="text-sm text-muted-foreground">Effective {LEGAL.effectiveDate}</p>
      </header>

      <div className="space-y-section">{children}</div>

      <footer className="pt-block border-t">
        <p className="text-sm text-muted-foreground">
          Questions about this document? Email{" "}
          <LegalLink href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </LegalLink>
          .
        </p>
      </footer>
    </article>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="space-y-inline scroll-mt-block">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-balance">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function LegalText({ children }: { children: ReactNode }) {
  return <p className="text-pretty text-muted-foreground">{children}</p>;
}

export function LegalList({ children }: { children: ReactNode }) {
  return (
    <ul className="space-y-tight pl-card list-disc text-pretty text-muted-foreground marker:text-muted-foreground/60">
      {children}
    </ul>
  );
}

export function LegalItem({ children }: { children: ReactNode }) {
  return <li className="pl-tight">{children}</li>;
}

/** A defined term or field name, set apart so it reads as a reference. */
export function LegalTerm({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>;
}

export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-primary underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}
