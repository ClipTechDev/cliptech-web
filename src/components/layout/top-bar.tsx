"use client";

import Link from "next/link";

import { useMeQuery } from "@/hooks/use-auth";
import { userInitials } from "@/schemas/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopBar() {
  const { data: user } = useMeQuery();

  return (
    <header
      className="-mx-4 sticky top-0 z-40 flex items-center justify-between border-b bg-background/85 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6"
      style={{ height: "var(--app-topbar-height)" }}
    >
      <Link
        href="/dashboard"
        aria-label="ClipTech home"
        className="flex items-center gap-2 font-heading text-lg font-extrabold tracking-tight"
      >
        <svg viewBox="0 0 64 64" aria-hidden className="size-7">
          <rect width="64" height="64" rx="14" fill="#6d4de6" />
          <path
            d="M42.5 22.5a14 14 0 1 0 0 19"
            fill="none"
            stroke="#fff"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
        <span>
          Clip<span className="text-primary">Tech</span>
        </span>
      </Link>

      {user && (
        <Link href="/dashboard/profile" aria-label="Your profile" className="rounded-full">
          <Avatar size="sm" className="size-8">
            <AvatarImage src={user.profile_picture ?? undefined} alt="" />
            <AvatarFallback className="text-xs">{userInitials(user)}</AvatarFallback>
          </Avatar>
        </Link>
      )}
    </header>
  );
}
