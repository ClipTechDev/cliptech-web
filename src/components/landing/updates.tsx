import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { SectionHeading } from "@/components/landing/section-heading";

const UPDATES = [
  {
    name: "New campaign",
    title: "Campaigns",
    quote: "A new campaign is open for submissions. Check the rules and get your clip in early.",
  },
  {
    name: "Your post was approved",
    title: "Submissions",
    quote: "Your post is now being tracked and earning for the views it gains.",
  },
  {
    name: "Campaign ending soon",
    title: "Campaigns",
    quote: "Submissions close shortly. Anything already approved keeps tracking until the campaign closes.",
  },
  {
    name: "You earned",
    title: "Earnings",
    quote: "Earnings from a finished campaign have been added to your available balance.",
  },
  {
    name: "Withdrawal paid",
    title: "Withdrawals",
    quote: "Your withdrawal has been sent to your payout method.",
  },
  {
    name: "Reconnect your account",
    title: "Accounts",
    quote: "We tell you when a connected account needs attention, so your posts keep earning.",
  },
];

export function Updates() {
  return (
    <section className="py-16 sm:py-24">
      <div className="px-card sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            label="Notifications"
            title="You hear about it when it happens."
            description="Updates land in the app and in your inbox."
          />
        </div>
      </div>

      <InfiniteMovingCards
        items={UPDATES}
        speed="slow"
        className="mx-auto mt-10 max-w-none sm:mt-14"
      />
    </section>
  );
}
