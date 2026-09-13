import { z } from "zod";

/**
 * The post URL shapes submission/posturl.go accepts, checked here so an
 * obviously wrong paste fails instantly instead of after a 20-second round
 * trip to the provider. The server remains the authority - this only catches
 * the cases it would certainly reject.
 */
const POST_URL_PATTERNS: RegExp[] = [
  /instagram\.com\/(p|reel|reels|tv)\/[\w-]+/i,
  /(twitter|x)\.com\/[\w.]+\/status\/\d+/i,
  /tiktok\.com\/@[\w.-]+\/(video|photo)\/\d+/i,
  /youtube\.com\/watch\?.*\bv=[\w-]{11}/i,
  /youtu\.be\/[\w-]{11}/i,
  /youtube\.com\/(shorts|embed|live)\/[\w-]{11}/i,
];

/** Shortened TikTok links carry no post id, so the API rejects them outright. */
const SHORTENED_TIKTOK = /(vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com\/t\/)/i;

export const submissionFormSchema = z.object({
  campaign_id: z.string().min(1, "Pick a campaign"),
  post_url: z
    .string()
    .trim()
    .min(1, "Paste the link to your post")
    .refine((value) => !SHORTENED_TIKTOK.test(value), {
      message:
        "Shortened TikTok links don't include the post id. Open the post and copy the full URL.",
    })
    .refine((value) => POST_URL_PATTERNS.some((pattern) => pattern.test(value)), {
      message: "That doesn't look like an Instagram, X, TikTok or YouTube post link.",
    }),
});

export type SubmissionFormValues = z.infer<typeof submissionFormSchema>;
