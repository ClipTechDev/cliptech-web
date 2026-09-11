import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LEGAL, LEGAL_DOCUMENTS } from "@/lib/legal";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { FeedbackForm } from "@/components/support/feedback-form";

export const metadata = { title: "Support · ClipTech" };

/**
 * Reached from Profile rather than the tab bar. The bottom bar is the three
 * things a creator does repeatedly - browse, submit, check earnings - and
 * support is not one of them; putting it there would cost a quarter of the
 * navigation to a screen most people open once.
 */
export default function SupportPage() {
  return (
    <>
      <PageHeader title="Support" description="Something broken or unclear? Tell us." />

      <div className="space-y-section pb-card">
        <Link
          href="/dashboard/profile"
          className={buttonVariants({ variant: "ghost", size: "lg" })}
        >
          <ArrowLeft />
          Profile
        </Link>

        <FeedbackForm />

        <section className="space-y-inline">
          <h2 className="font-heading font-semibold">Other ways to reach us</h2>
          <p className="text-sm text-pretty text-muted-foreground">
            You can also email{" "}
            <a
              href={`mailto:${LEGAL.contactEmail}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {LEGAL.contactEmail}
            </a>
            . If your question is about a submission, include the campaign name and
            the post link.
          </p>
        </section>

        <section className="space-y-inline">
          <h2 className="font-heading font-semibold">Policies</h2>
          <ul className="space-y-tight">
            {LEGAL_DOCUMENTS.map((document) => (
              <li key={document.href}>
                <Link
                  href={document.href}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  {document.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
