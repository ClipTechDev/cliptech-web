export const BUSINESS_STATS = [
  { value: "250M+", label: "Total views delivered" },
  { value: "100M+", label: "Combined followers across the network" },
  { value: "500+", label: "Active pages and creators" },
  { value: "10+", label: "Major brands and platforms" },
] as const;

export const BRAND_LOGOS = [
  {
    name: "Netflix",
    src: "/brands/Netflix_2014.svg",
    ratio: 1000 / 268.7,
    height: 24,
  },
  {
    name: "Prime Video",
    src: "/brands/Amazon_Prime_Video_2024.svg",
    ratio: 1040 / 309.36,
    height: 32,
  },
  {
    name: "Hulu",
    src: "/brands/Hulu_2019.svg",
    ratio: 1000 / 329.813,
    height: 24,
  },
  {
    name: "Apple TV",
    src: "/brands/Apple_TV_logo.svg",
    ratio: 53.231 / 26.889,
    height: 30,
    invertOnDark: true,
  },
  {
    name: "Feastables by MrBeast",
    src: "/brands/feastables.webp",
    ratio: 900 / 297,
    height: 40,
  },
] as const;

export const HERO_REELS = [
  { src: "/business/reel-1.jpg", views: 18_412_305 },
  { src: "/business/reel-2.jpg", views: 12_406_118 },
  { src: "/business/reel-3.jpg", views: 8_731_442 },
] as const;

export const PROMOTION_TYPES = [
  "OTT or movie release",
  "Sports event or league",
  "Consumer brand",
  "App install campaign",
  "Product launch",
  "Something else",
] as const;

export const BUSINESS_FAQ = [
  {
    question: "What types of campaigns do you run?",
    answer:
      "Film and series releases, sports events, consumer brands, app installs and product launches. If your content works as a short vertical video, we can distribute it.",
  },
  {
    question: "What is the minimum campaign size?",
    answer:
      "Campaigns start at 1 million delivered views. That is the point where distribution across multiple pages starts to produce consistent, measurable reach.",
  },
  {
    question: "How do you prevent fake or suspicious views?",
    answer:
      "Every placement is tracked from the moment it goes live. We watch view growth over time, flag spikes that don't match a page's normal pattern, and review flagged activity before it is counted toward your delivery.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "Instagram Reels, YouTube Shorts, TikTok and X. Most campaigns run primarily on Instagram and YouTube, and we'll recommend a mix based on your audience.",
  },
  {
    question: "How do you report campaign performance?",
    answer:
      "You get a report listing every placement with its live link and view count, along with totals against your target. Reports are shared during the campaign and again at close.",
  },
  {
    question: "Can we target specific niches, languages or regions?",
    answer:
      "Yes. Pages in the network are categorised by niche, language and audience region, so a campaign can be limited to, for example, Hindi-language sports pages or English entertainment pages in specific states.",
  },
  {
    question: "Do you create the content?",
    answer:
      "You provide raw footage or approved assets along with your guidelines. Page owners then cut and caption it in the format their audience already responds to, within the rules you set.",
  },
  {
    question: "What if the target views aren't delivered?",
    answer:
      "We extend the campaign at no extra cost until the target is met, or refund the shortfall. You pay for delivered views, not for placements.",
  },
  {
    question: "How long does the content stay live?",
    answer:
      "Placements stay live on the pages that posted them. The minimum duration is agreed in your proposal before the campaign starts.",
  },
  {
    question: "How do we get started?",
    answer:
      "Send a few details through the proposal form. We'll reply within one business day with a plan covering reach, targeting, timeline and pricing.",
  },
] as const;
