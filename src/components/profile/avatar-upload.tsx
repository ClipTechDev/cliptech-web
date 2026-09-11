"use client";

import * as React from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { avatarRejectionReason, useUploadAvatarMutation } from "@/hooks/use-profile";
import { userInitials, type CreatorUser } from "@/schemas/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { errorMessage } from "@/components/shared/query-state";

export function AvatarUpload({ user }: { user: CreatorUser }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatarMutation();

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset immediately, or picking the same file twice after a failure fires
    // no change event.
    event.target.value = "";
    if (!file) return;

    // The API enforces these too; checking first turns a 400 round trip into
    // an instant, specific message.
    const rejection = avatarRejectionReason(file);
    if (rejection) {
      toast.error(rejection);
      return;
    }

    uploadAvatar.mutate(file, {
      onSuccess: () => toast.success("Photo updated"),
      onError: (error) => toast.error(errorMessage(error)),
    });
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploadAvatar.isPending}
        className="group relative rounded-full focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label="Change profile photo"
      >
        <Avatar className="size-16">
          <AvatarImage src={user.profile_picture ?? undefined} alt="" />
          <AvatarFallback className="text-lg">{userInitials(user)}</AvatarFallback>
        </Avatar>
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {uploadAvatar.isPending ? (
            <Loader2 className="size-5 animate-spin text-white" />
          ) : (
            <Camera className="size-5 text-white" />
          )}
        </span>
      </button>

      <div className="min-w-0">
        <p className="truncate font-medium">{user.name || "Unnamed creator"}</p>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onPick}
        className="hidden"
      />
    </div>
  );
}
