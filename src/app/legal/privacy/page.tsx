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
  title: "Privacy Policy · ClipTech",
  description: `How ${LEGAL.product} collects, uses and shares creator data.`,
};

/**
 * Written against what the code actually stores and sends, not from a
 * template: every field named here exists in cliptech-api, and every third
 * party listed is one the service genuinely talks to. Keeping it that way is
 * the point - a privacy policy that describes a different system is worse than
 * none, and OAuth reviewers check it against the scopes being requested.
 */
export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      summary={`This explains what ${LEGAL.product} collects when you post clips for campaigns, why we collect it, and who else sees it.`}
    >
      <LegalSection id="who-we-are" title="1. Who we are">
        <LegalText>
          {LEGAL.entity} operates {LEGAL.product}, a platform where creators post
          clips for advertising campaigns and are paid based on the views those
          clips earn. We are the data controller for the information described
          here. You can reach us at{" "}
          <LegalLink href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </LegalLink>
          .
        </LegalText>
      </LegalSection>

      <LegalSection id="what-we-collect" title="2. What we collect">
        <LegalText>
          <LegalTerm>Account details.</LegalTerm> Your email address, which is also
          how you sign in; your name; your country and country code; and a profile
          picture if you upload one. We record when your email was verified, when
          your account was created, and when you last signed in.
        </LegalText>
        <LegalText>
          <LegalTerm>Connected social accounts.</LegalTerm> When you connect
          Instagram, X, YouTube or TikTok, we store the account identifier and
          username on that platform, the permissions you granted, and the access
          credentials the platform issues us. We use those credentials only to
          confirm you own the posts you submit and to read their view counts.
        </LegalText>
        <LegalText>
          <LegalTerm>Submissions and performance.</LegalTerm> For every clip you
          submit: the post URL and the platform&apos;s identifier for it, the view
          count when you submitted, and the raw, eligible and payable view counts
          we record each time we check. We keep the review status of each
          submission and, where it applies, the reason it was rejected or
          invalidated.
        </LegalText>
        <LegalText>
          <LegalTerm>Earnings and payouts.</LegalTerm> Your balance, lifetime
          earnings and amounts paid out; a transaction record for every change to
          your balance; the payout methods you add (such as a UPI ID, bank
          details or a PayPal address); and your withdrawal requests and their
          status.
        </LegalText>
        <LegalText>
          <LegalTerm>Notifications.</LegalTerm> The notifications we have sent you
          and whether they were read. If you turn on push notifications, we store
          the registration token your browser issues so that messages can reach
          that browser.
        </LegalText>
        <LegalText>
          <LegalTerm>Support requests.</LegalTerm> Anything you write in the
          support form, and any screenshot you attach to it.
        </LegalText>
      </LegalSection>

      <LegalSection id="why-we-collect" title="3. Why we collect it">
        <LegalList>
          <LegalItem>
            <LegalTerm>To run your account.</LegalTerm> Your email is your sign-in
            identity — we send a one-time code to it each time you sign in.
          </LegalItem>
          <LegalItem>
            <LegalTerm>To verify that a submitted post is yours.</LegalTerm> We
            check the post against the connected account it claims to come from.
            Without this, anyone could submit anyone else&apos;s clip.
          </LegalItem>
          <LegalItem>
            <LegalTerm>To count views and calculate what you are owed.</LegalTerm>{" "}
            We re-check each approved post&apos;s view count on a schedule for as
            long as the campaign is tracking it.
          </LegalItem>
          <LegalItem>
            <LegalTerm>To pay you.</LegalTerm> Payout details exist solely to send
            you money you have earned.
          </LegalItem>
          <LegalItem>
            <LegalTerm>To tell you when something changes.</LegalTerm> Approvals,
            rejections, credited earnings and withdrawal outcomes.
          </LegalItem>
          <LegalItem>
            <LegalTerm>To detect abuse.</LegalTerm> We review submissions for
            artificially inflated views and for posts that break campaign rules.
          </LegalItem>
        </LegalList>
      </LegalSection>

      <LegalSection id="who-we-share-with" title="4. Who we share it with">
        <LegalText>
          We do not sell your personal information. We share it only with the
          services needed to run the platform:
        </LegalText>
        <LegalList>
          <LegalItem>
            <LegalTerm>The social platforms you connect.</LegalTerm> Instagram, X,
            YouTube and TikTok, when we verify a post or read its metrics. What we
            can see is limited to the permissions you granted, and you can revoke
            them at any time.
          </LegalItem>
          <LegalItem>
            <LegalTerm>Our hosting and storage providers.</LegalTerm> Images you
            upload — profile pictures and support screenshots — are stored with
            our cloud storage provider.
          </LegalItem>
          <LegalItem>
            <LegalTerm>Google Firebase.</LegalTerm> If you turn on push
            notifications, the notification title, body and link pass through
            Firebase Cloud Messaging to reach your browser.
          </LegalItem>
          <LegalItem>
            <LegalTerm>Our email provider.</LegalTerm> To deliver your sign-in
            codes.
          </LegalItem>
          <LegalItem>
            <LegalTerm>Payment providers.</LegalTerm> When we pay a withdrawal, we
            pass the payout details you gave us to the provider making the
            transfer.
          </LegalItem>
          <LegalItem>
            <LegalTerm>Advertisers.</LegalTerm> Campaign owners see aggregate
            performance for their campaign. They do not receive your email address
            or payout details.
          </LegalItem>
        </LegalList>
        <LegalText>
          We may also disclose information where the law requires it, or to
          establish or defend a legal claim.
        </LegalText>
      </LegalSection>

      <LegalSection id="retention" title="5. How long we keep it">
        <LegalText>
          We keep account, submission and earnings records for as long as your
          account is open, and afterwards for as long as we need them to meet tax,
          accounting and anti-fraud obligations. Disconnecting a social account
          removes its stored credentials. Turning off push notifications deletes
          the stored token for that browser.
        </LegalText>
      </LegalSection>

      <LegalSection id="your-rights" title="6. Your rights">
        <LegalText>
          You can access and correct your name, country and profile picture in the
          app at any time, disconnect any social account, and turn notifications
          off. Depending on where you live, you may also have the right to request
          a copy of your data, ask us to delete it, or object to how we use it.
          Email{" "}
          <LegalLink href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </LegalLink>{" "}
          and we will respond within the period the applicable law allows.
        </LegalText>
        <LegalText>
          Deleting your account does not erase records we are required to keep,
          such as the history of payments already made to you.
        </LegalText>
      </LegalSection>

      <LegalSection id="security" title="7. Security">
        <LegalText>
          Your session is held in a cookie that JavaScript cannot read. We do not
          store passwords, because there are none — sign-in is a one-time code
          sent to your email. Access credentials for connected platforms are
          stored server-side and are never sent to your browser. No system is
          perfectly secure, and we cannot guarantee absolute security.
        </LegalText>
      </LegalSection>

      <LegalSection id="children" title="8. Children">
        <LegalText>
          {LEGAL.product} is not intended for anyone under 18, and we do not
          knowingly collect information from them. If you believe a minor has an
          account, contact us and we will remove it.
        </LegalText>
      </LegalSection>

      <LegalSection id="changes" title="9. Changes to this policy">
        <LegalText>
          We will update the effective date above when this policy changes. If a
          change materially affects how we use your information, we will tell you
          in the app or by email before it takes effect.
        </LegalText>
      </LegalSection>
    </LegalDocument>
  );
}
