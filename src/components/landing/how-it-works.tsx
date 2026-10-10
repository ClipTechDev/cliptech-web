import { SectionHeading } from "@/components/landing/section-heading";

const STEPS = [
  {
    title: "Connect your accounts",
    body: "Sign in with just your email, then link the Instagram, TikTok, YouTube or X accounts you post from.",
  },
  {
    title: "Pick a campaign",
    body: "Every campaign shows its rate per 1,000 views, budget and rules up front. Some are open to all, others check your account or review your request to join.",
  },
  {
    title: "Post and submit",
    body: "Post the video on the account you joined with and paste the link. Once it is approved, the views it gains from there count.",
  },
  {
    title: "Cash out",
    body: "After a campaign ends and its numbers are final, your earnings are released and you can withdraw to PayPal or USDT.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t px-card py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <SectionHeading
          label="How it works"
          title="Four steps from sign-up to payout."
          className="lg:sticky lg:top-28 lg:self-start"
        />

        <ol>
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[3rem_1fr] gap-x-card border-t py-block first:border-t-0 first:pt-0 sm:grid-cols-[5rem_1fr] sm:py-8"
            >
              <span className="font-mono text-sm text-primary sm:text-base">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-heading text-xl font-bold sm:text-2xl">{step.title}</h3>
                <p className="mt-2 max-w-md text-pretty text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
