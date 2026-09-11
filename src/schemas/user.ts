import { z } from "zod";

/**
 * Mirrors user.Response and user.UpdateRequest in
 * internal/features/user/dto.go. Fields the Go side declares as pointers
 * serialise as `null`, not as absent keys.
 */

/** Mirrors user.Status. Only `active` can sign in (user.CanLogin). */
export const USER_STATUSES = ["active", "suspended", "banned", "deleted"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export type CreatorUser = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  country_code: string | null;
  country: string | null;
  profile_picture: string | null;
  available_balance: number;
  total_withdrawn: number;
  lifetime_earnings: number;
  status: UserStatus;
  created_at: string;
  last_login_at: string | null;
};

export type UserResponse = {
  success: boolean;
  user: CreatorUser;
};

/**
 * The PATCH surface is deliberately narrow on the API side: name, country and
 * country_code only. Email, balance and status are not editable by their owner.
 */
export const profileFormSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty"),
  country: z.string().trim(),
  country_code: z
    .string()
    .trim()
    .toUpperCase()
    .refine((value) => value === "" || /^[A-Za-z]{2}$/.test(value), {
      message: "Use a two-letter country code, e.g. US",
    }),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function profileFormDefaults(user?: CreatorUser): ProfileFormValues {
  return {
    name: user?.name ?? "",
    country: user?.country ?? "",
    country_code: user?.country_code ?? "",
  };
}

/**
 * The PATCH body: only what actually changed.
 *
 * user.UpdateRequest takes pointers and the service rejects an empty update
 * with ErrNoChanges (400), so sending the untouched record back would turn a
 * no-op save into an error.
 */
export function profileFormDiff(
  values: ProfileFormValues,
  user: CreatorUser
): Partial<ProfileFormValues> {
  const current = profileFormDefaults(user);
  const diff: Partial<ProfileFormValues> = {};

  for (const key of Object.keys(current) as (keyof ProfileFormValues)[]) {
    if (values[key] !== current[key]) diff[key] = values[key];
  }

  return diff;
}

/** Initials for the avatar fallback: "Jane Doe" -> "JD". */
export function userInitials(user: Pick<CreatorUser, "name" | "email">): string {
  const source = user.name.trim() || user.email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
