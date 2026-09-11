import Link from "next/link";

import { LEGAL, LEGAL_DOCUMENTS } from "@/lib/legal";

/**
 * Public, and deliberately outside the (app) route group.
 *
 * These pages have to be readable without a session: OAuth reviewers at Meta,
 * Google, X and TikTok are asked for a privacy policy URL and open it signed
 * out, and a creator deciding whether to sign up has not got an account yet.
 * Putting them behind AuthGuard would fail app review.
 *
 * No bottom tab bar for the same reason - there is nothing to navigate to
 * without a session, so the layout is just a page.
 */
export default function LegalLayout({ children }: LayoutProps<"/legal">) {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-card sm:px-6">
      <header className="py-block border-b">
        <Link href="/" className="font-heading text-lg font-semibold tracking-tight">
          {LEGAL.product}
        </Link>
      </header>

      <main className="py-section">{children}</main>

      <footer className="py-section gap-card flex flex-wrap border-t text-sm">
        {LEGAL_DOCUMENTS.map((document) => (
          <Link
            key={document.href}
            href={document.href}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {document.title}
          </Link>
        ))}
      </footer>
    </div>
  );
}
