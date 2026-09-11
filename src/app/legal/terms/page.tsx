import { LEGAL } from "@/lib/legal";
import {
  LegalDocument,
  LegalItem,
  LegalLink,
  LegalList,
  LegalSection,
  LegalTerm,
  LegalText,
} from "@/components/legal/legal-document";

export const metadata = {
  title: "Terms of Service · ClipTech",
  description: `The agreement between creators and ${LEGAL.product}.`,
};

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      title="Terms of Service"
      summary={`These terms govern your use of ${LEGAL.product}. By signing in, you agree to them.`}
    >
      <LegalSection id="agreement" title="1. The agreement">
        <LegalText>
          These terms are between you and {LEGAL.entity}. By signing in to{" "}
          {LEGAL.product} you accept them. If you do not accept them, do not use
          the service. Participation in campaigns is also subject to our{" "}
          <LegalLink href="/legal/rules">Campaign Rules</LegalLink>, which form
          part of this agreement.
        </LegalText>
      </LegalSection>

      <LegalSection id="eligibility" title="2. Who can use ClipTech">
        <LegalText>
          You must be at least 18 years old and able to enter a binding contract.
          You must own, or be authorised to act for, every social media account
          you connect. One person may hold one account; creating multiple accounts
          to claim the same campaign more than once is grounds for termination and
          forfeiture of unpaid earnings.
        </LegalText>
      </LegalSection>

      <LegalSection id="account" title="3. Your account">
        <LegalText>
          There is no password. We create your account the first time you verify a
          one-time code sent to your email, and that email address is your
          identity on the service. Keep access to it secure: anyone who can read
          your email can sign in as you. Tell us immediately if you believe
          someone else has access.
        </LegalText>
      </LegalSection>

      <LegalSection id="campaigns" title="4. Campaigns and submissions">
        <LegalText>
          Campaigns are posted by advertisers and specify a rate per thousand
          views, a budget, the platforms accepted, and any content requirements.
          Submitting a clip means you confirm that you published the post, that it
          comes from a social account you have connected, and that it complies
          with the campaign&apos;s rules and the platform&apos;s own terms.
        </LegalText>
        <LegalText>
          We review every submission. A submission may be{" "}
          <LegalTerm>rejected</LegalTerm> if it does not meet the campaign&apos;s
          requirements, or <LegalTerm>invalidated</LegalTerm> if we later find the
          post was deleted or made private, the connected account was
          disconnected, ownership cannot be confirmed, or the views are not
          genuine. Rejection and invalidation carry a reason, which you can see on
          the submission.
        </LegalText>
        <LegalText>
          A campaign stops accepting submissions when it ends, is paused, or its
          budget is exhausted. We do not guarantee that any campaign will remain
          open, or that budget will remain available.
        </LegalText>
      </LegalSection>

      <LegalSection id="earnings" title="5. Earnings">
        <LegalText>
          Earnings accrue on <LegalTerm>payable views</LegalTerm> — the views we
          count as eligible for a campaign after applying its minimum view
          threshold, any per-post payout cap, and the views your post already had
          when you submitted it. Views recorded before submission are not payable.
        </LegalText>
        <LegalText>
          View counts come from the social platforms, and we record them
          periodically rather than continuously. Figures shown in the app are our
          record of what a platform reported and may differ from what you see
          there. Earnings on a submission that is later invalidated are reversed.
        </LegalText>
        <LegalText>
          Nothing here is a guarantee of income. What you earn depends on
          campaigns being available, your submissions being approved, and the
          views your posts genuinely attract.
        </LegalText>
      </LegalSection>

      <LegalSection id="withdrawals" title="6. Withdrawals">
        <LegalText>
          You can request a withdrawal of your available balance to a payout
          method you have added. Requests are reviewed before they are paid, and
          we may hold or refuse one while we investigate suspected fraud or a
          breach of these terms. You are responsible for the accuracy of your
          payout details; we cannot recover money sent to an incorrect
          destination you supplied.
        </LegalText>
        <LegalText>
          You are responsible for any tax owed on what you earn. We do not deduct
          or remit tax on your behalf unless the law requires us to.
        </LegalText>
      </LegalSection>

      <LegalSection id="conduct" title="7. Things you must not do">
        <LegalList>
          <LegalItem>
            Inflate views or engagement by any artificial means, including bots,
            paid view services, view exchanges, or incentivised traffic.
          </LegalItem>
          <LegalItem>
            Submit a post you did not publish, or publish from an account you do
            not control.
          </LegalItem>
          <LegalItem>
            Delete, hide or make private a post that is being tracked for a
            campaign.
          </LegalItem>
          <LegalItem>
            Misrepresent an advertiser or their product, or present campaign
            content in a way that is misleading, defamatory or unlawful.
          </LegalItem>
          <LegalItem>
            Interfere with the service, attempt to access another creator&apos;s
            account, or automate access to the platform without our consent.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="content" title="8. Your content">
        <LegalText>
          You keep ownership of everything you post. By submitting a clip to a
          campaign you grant us and the advertiser a non-exclusive, worldwide,
          royalty-free licence to view, track and report on that post for the
          purpose of running and measuring the campaign. This does not let us or
          the advertiser republish your content elsewhere unless the campaign
          says so and you agree to it.
        </LegalText>
      </LegalSection>

      <LegalSection id="suspension" title="9. Suspension and termination">
        <LegalText>
          We may suspend or terminate your account if you breach these terms or
          the Campaign Rules, or where we reasonably suspect fraud. Where we do,
          we may withhold unpaid earnings connected to the breach. You can stop
          using the service at any time and ask us to close your account.
        </LegalText>
      </LegalSection>

      <LegalSection id="availability" title="10. Availability">
        <LegalText>
          The service is provided as it is, without warranties of any kind. We do
          not promise that it will be uninterrupted, that view tracking will be
          free of error, or that the social platforms will keep providing us the
          data we rely on. Features may change or be withdrawn.
        </LegalText>
      </LegalSection>

      <LegalSection id="liability" title="11. Limitation of liability">
        <LegalText>
          To the extent the law allows, we are not liable for indirect or
          consequential loss, or for lost profits or lost opportunity. Our total
          liability to you for any claim is limited to the total amount we paid
          you in the twelve months before the claim arose. Nothing here excludes
          liability that cannot lawfully be excluded.
        </LegalText>
      </LegalSection>

      <LegalSection id="changes" title="12. Changes to these terms">
        <LegalText>
          We may update these terms. We will change the effective date above, and
          for material changes we will tell you in the app or by email before they
          take effect. Continuing to use {LEGAL.product} after that means you
          accept the updated terms.
        </LegalText>
      </LegalSection>

      <LegalSection id="law" title="13. Governing law">
        <LegalText>
          These terms are governed by the laws of {LEGAL.governingLaw}, and the
          courts of {LEGAL.governingLaw} have exclusive jurisdiction over any
          dispute arising from them.
        </LegalText>
      </LegalSection>
    </LegalDocument>
  );
}
