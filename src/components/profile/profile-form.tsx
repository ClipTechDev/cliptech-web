"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useUpdateProfileMutation } from "@/hooks/use-profile";
import {
  profileFormDefaults,
  profileFormDiff,
  profileFormSchema,
  type CreatorUser,
  type ProfileFormValues,
} from "@/schemas/user";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/components/shared/query-state";

export function ProfileForm({ user }: { user: CreatorUser }) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileFormDefaults(user),
  });

  const updateProfile = useUpdateProfileMutation(user);

  // The server is the source of truth: after a save (or a refetch elsewhere)
  // re-seed the form from the record.
  React.useEffect(() => {
    form.reset(profileFormDefaults(user));
  }, [user, form]);

  // form.watch(), not useWatch(): useWatch types every field as possibly
  // undefined, which the diff helper cannot consume. The React Compiler warns
  // that it can't memoize either one - that is a skipped optimisation on this
  // component, not a correctness problem.
  const values = form.watch();
  const hasChanges = Object.keys(profileFormDiff(values, user)).length > 0;

  function onSubmit(submitted: ProfileFormValues) {
    // The API answers an empty patch with ErrNoChanges, so a no-op save is
    // stopped here rather than turned into a confusing 400.
    if (Object.keys(profileFormDiff(submitted, user)).length === 0) {
      toast.info("Nothing to save");
      return;
    }

    updateProfile.mutate(submitted, {
      onSuccess: () => toast.success("Profile updated"),
      onError: (error) => toast.error(errorMessage(error)),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="United States" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="US"
                    maxLength={2}
                    autoCapitalize="characters"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Two letters, e.g. US.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={updateProfile.isPending || !hasChanges}>
            {updateProfile.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={!hasChanges || updateProfile.isPending}
            onClick={() => form.reset(profileFormDefaults(user))}
          >
            Discard
          </Button>
        </div>
      </form>
    </Form>
  );
}
