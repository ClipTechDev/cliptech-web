import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { Reveal } from "@/components/marketing/reveal";
import { SectionIntro } from "@/components/marketing/section";

const UPDATES = [
  {
    name: "New campaign",
    title: "Campaigns",
    quote:
      "A new campaign is open for submissions. Check the rules and get your clip in early.",
  },
  {
    name: "Your post was approved",
    title: "Submissions",
    quote:
      "Your post is now being tracked for the campaign. Earnings update as it gains views.",
  },
  {
    name: "Campaign ending soon",
    title: "Campaigns",
    quote:
      "Submissions close shortly. Anything already approved keeps tracking until the campaign closes.",
  },
  {
    name: "You earned",
    title: "Earnings",
    quote:
      "Earnings from a campaign have been added to your available balance and are ready to withdraw.",
  },
  {
    name: "Withdrawal paid",
    title: "Withdrawals",
    quote: "Your withdrawal has been sent to your payout method.",
  },
  {
    name: "Reconnect your account",
    title: "Accounts",
    quote:
      "We tell you when a connected account needs attention, so your posts keep earning.",
  },
];

export function Updates() {
  return (
    <section className="border-t py-20 sm:py-28">
      <div className="px-card sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionIntro
            eyebrow="Notifications"
            title="You hear about it when it happens."
            description="Every update is emailed to you, and sent as a push notification if you turn those on."
          />
        </div>
      </div>

      <Reveal delay={0.1}>
        <InfiniteMovingCards
          items={UPDATES}
          speed="slow"
          className="mx-auto mt-10 max-w-none sm:mt-14"
        />
      </Reveal>
    </section>
  );
}
