"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { imageRejectionReason } from "@/lib/upload";
import { authKeys } from "@/hooks/use-auth";
import type { CreatorUser, ProfileFormValues, UserResponse } from "@/schemas/user";
import { profileFormDiff } from "@/schemas/user";

/**
 * Profile writes. Reads come from useMeQuery - the profile screen and the
 * session are the same record, so giving them separate cache entries would
 * let the two disagree after a save.
 */
export function useUpdateProfileMutation(user: CreatorUser) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProfileFormValues) =>
      apiFetch<UserResponse>("/users/me", {
        method: "PATCH",
        // user.UpdateRequest takes pointers and rejects an empty patch with
        // 400, so only changed fields go up.
        body: profileFormDiff(values, user),
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.me(), response);
    },
  });
}

/**
 * Avatars and feedback screenshots go through the same storage.ValidateImage
 * on the API side, so they share one set of rules here too - see
 * lib/upload.ts. Re-exported under the old name because that is what the
 * avatar UI reads it as.
 */
export const avatarRejectionReason = imageRejectionReason;

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      // The field name is `picture`, per user.Handler.SetAvatar. FormData is
      // passed through apiFetch untouched so the browser sets its own
      // multipart boundary.
      const body = new FormData();
      body.append("picture", file);
      return apiFetch<UserResponse>("/users/me/avatar", { method: "POST", body });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.me(), response);
    },
  });
}
