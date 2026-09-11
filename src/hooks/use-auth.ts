"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { MessageResponse } from "@/schemas/common";
import type { SendOtpValues, VerifyOtpResponse } from "@/schemas/auth";
import type { UserResponse } from "@/schemas/user";

/**
 * Session and identity.
 *
 * There is no client-readable token to key off: cliptech-api's session is an
 * HttpOnly cookie, so "am I signed in" is answered by asking the API. That
 * makes `GET /users/me` the session itself, and its 401 the only signal that
 * the cookie has expired.
 */
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function meOptions() {
  return queryOptions({
    queryKey: authKeys.me(),
    queryFn: () => apiFetch<UserResponse>("/users/me"),
    select: (response: UserResponse) => response.user,
    // A 401 here is a fact, not a blip. Retrying it delays the redirect to
    // the login screen by the length of the backoff and never succeeds.
    retry: false,
    // The session outlives any single screen, and every tab mounts something
    // that reads it, so refetching it on each mount is pure noise.
    staleTime: 5 * 60 * 1000,
  });
}

export function useMeQuery() {
  return useQuery(meOptions());
}

/**
 * Step one of sign-in. Note that in the current API this is very nearly a
 * no-op: user.Service.SendOTP validates the email and returns nil without
 * sending anything, and VerifyOTP compares against a hardcoded DevOTP. The
 * two-step shape is still the real contract, so the UI implements it.
 */
export function useSendOtpMutation() {
  return useMutation({
    mutationFn: (values: SendOtpValues) =>
      apiFetch<MessageResponse>("/auth/send-otp", { method: "POST", body: values }),
  });
}

export function useVerifyOtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: { email: string; otp: string }) =>
      apiFetch<VerifyOtpResponse>("/auth/verify-otp", { method: "POST", body: values }),
    onSuccess: (response) => {
      // The response carries the same user.Response shape /users/me returns,
      // so seeding the cache here means the dashboard does not flash a
      // loading state on the very first navigation after signing in.
      queryClient.setQueryData(authKeys.me(), { success: true, user: response.user });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch<MessageResponse>("/auth/logout", { method: "POST" }),
    // onSettled, not onSuccess: logout sits behind the auth middleware, so an
    // already-expired session answers 401. The local session must be cleared
    // either way, or a failed sign-out leaves stale data on screen.
    onSettled: () => {
      queryClient.clear();
    },
  });
}
