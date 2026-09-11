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
  title: "Campaign Rules · ClipTech",
  description:
    "What a clip has to do to be approved, how views are counted, and what gets a submission rejected.",
};

/**
 * The operational rules, kept separate from the Terms on purpose: this is the
 * document a creator actually reads before submitting, and burying it inside a
 * contract is how a post ends up rejected for a reason nobody looked up.
 *
 * The rejection and invalidation reasons below are the ones the API really
 * stores (submission.RECOVERABLE_INVALID_REASONS and the review flow), so a
 * creator reading this can map it to the reason shown on their submission.
 */
export default function CampaignRulesPage() {
  return (
    <LegalDocument
      title="Campaign Rules"
      summary="What your clip has to do to be approved, how views are counted, and the things that get a submission rejected."
    >
      <LegalSection id="before-you-post" title="1. Before you post">
        <LegalList>
          <LegalItem>
            <LegalTerm>Connect the account first.</LegalTerm> You can only submit
            a post from a social account connected to {LEGAL.product}. We check
            the post against that account to confirm it is yours.
          </LegalItem>
          <LegalItem>
            <LegalTerm>Check the platform is accepted.</LegalTerm> Campaigns list
            which of Instagram, X, YouTube and TikTok they take. A post from a
            platform a campaign does not accept will be rejected.
          </LegalItem>
          <LegalItem>
            <LegalTerm>Read the campaign&apos;s rules and hashtags.</LegalTerm> If
            a campaign requires specific hashtags, they must appear in your
            caption. The campaign page has a copy button for exactly this.
          </LegalItem>
          <LegalItem>
            <LegalTerm>Check the campaign is still open.</LegalTerm> A campaign
            stops accepting submissions when it ends, is paused, or spends its
            budget.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="submitting" title="2. Submitting a clip">
        <LegalText>
          Post to your own account first, then paste the link. The post must be
          public — we cannot read a private post, and one that is private when we
          check will be invalidated. Shortened links do not carry the post
          identifier we need, so paste the full URL from the post itself.
        </LegalText>
        <LegalText>
          Submit each post once. The same post cannot be entered into more than
          one campaign.
        </LegalText>
      </LegalSection>

      <LegalSection id="how-views-count" title="3. How views are counted">
        <LegalText>
          <LegalTerm>Starting views.</LegalTerm> We record the post&apos;s view
          count at the moment you submit. Views it already had do not earn — only
          growth after submission counts. This is why a post that was already
          popular before you submitted it shows a payable count lower than the
          number on the platform.
        </LegalText>
        <LegalText>
          <LegalTerm>Eligible views.</LegalTerm> Growth after submission, once the
          campaign&apos;s minimum view threshold is met. If a campaign sets a
          minimum, nothing is payable until the post passes it.
        </LegalText>
        <LegalText>
          <LegalTerm>Payable views.</LegalTerm> Eligible views after any
          per-post payout cap the campaign sets, and after any remaining budget
          limit. If a campaign runs out of budget, payable views stop there.
        </LegalText>
        <LegalText>
          We re-check tracked posts periodically rather than continuously, so
          figures in the app lag what you see on the platform. Keep the post live
          and public for as long as the campaign is tracking it.
        </LegalText>
      </LegalSection>

      <LegalSection id="rejected" title="4. Why a submission gets rejected">
        <LegalText>
          A rejection happens at review, before tracking starts. The usual
          reasons:
        </LegalText>
        <LegalList>
          <LegalItem>The post does not meet the campaign&apos;s content rules.</LegalItem>
          <LegalItem>Required hashtags are missing from the caption.</LegalItem>
          <LegalItem>The platform is not one the campaign accepts.</LegalItem>
          <LegalItem>The post predates the campaign, or was reused from another campaign.</LegalItem>
          <LegalItem>The content misrepresents the advertiser or their product.</LegalItem>
        </LegalList>
        <LegalText>
          The reason is shown on the submission. Fix it and post again — a
          rejection does not stop you entering the campaign with a new clip.
        </LegalText>
      </LegalSection>

      <LegalSection id="invalidated" title="5. Why a submission gets invalidated">
        <LegalText>
          Invalidation happens after approval, when something changes. Earnings
          already accrued on an invalidated submission are reversed.
        </LegalText>
        <LegalList>
          <LegalItem>
            <LegalTerm>The post was deleted or made private.</LegalTerm> We can no
            longer read its views.
          </LegalItem>
          <LegalItem>
            <LegalTerm>The connected account was disconnected</LegalTerm>, or its
            authorisation expired. Reconnect it and use Revalidate on the
            submission — this one is recoverable.
          </LegalItem>
          <LegalItem>
            <LegalTerm>Ownership no longer matches.</LegalTerm> The post is not
            from the account it was submitted under.
          </LegalItem>
          <LegalItem>
            <LegalTerm>The views are not genuine.</LegalTerm> See below.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="fake-views" title="6. Artificial views">
        <LegalText>
          Buying views, using bots or view-exchange services, or otherwise
          inflating a post&apos;s numbers is the one thing that ends an account
          rather than a submission. We look for it, and where we find it we
          invalidate the submission, withhold the earnings attached to it, and may
          suspend or close the account.
        </LegalText>
        <LegalText>
          Organic promotion is fine: sharing your own post, posting at a good
          time, or being featured by the platform.
        </LegalText>
      </LegalSection>

      <LegalSection id="getting-paid" title="7. Getting paid">
        <LegalText>
          Approved submissions accrue earnings as views come in. Earnings become
          available once credited, at which point you can request a withdrawal to
          a payout method you have added. Withdrawals are reviewed before they are
          paid.
        </LegalText>
      </LegalSection>

      <LegalSection id="questions" title="8. Questions and disputes">
        <LegalText>
          If you think a submission was reviewed incorrectly, or a view count
          looks wrong, use the support form in the app or email{" "}
          <LegalLink href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </LegalLink>
          . Include the campaign name and the post link — it is what we need to
          look anything up.
        </LegalText>
        <LegalText>
          These rules sit alongside our{" "}
          <LegalLink href="/legal/terms">Terms of Service</LegalLink>, which
          govern the agreement as a whole.
        </LegalText>
      </LegalSection>
    </LegalDocument>
  );
}
