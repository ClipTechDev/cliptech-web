"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * The tags a creator has to put in their caption.
 *
 * With a copy button, because that is the entire interaction: these get pasted
 * into another app, usually on the same phone, and retyping five tags by hand
 * is how a post ends up failing the campaign's rules. The one interactive
 * island on an otherwise server-rendered page.
 */
export function CampaignHashtags({ tags }: { tags: string[] }) {
  const [copied, setCopied] = React.useState(false);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(tags.map((tag) => `#${tag}`).join(" "));
      setCopied(true);
      // Reverts on its own; a button stuck on "Copied" reads as broken the
      // next time they come back to it.
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused outright (insecure origin, denied
      // permission). Say so rather than leaving the button silent.
      toast.error("Couldn't copy. Select the tags and copy them manually.");
    }
  }

  return (
    <div className="gap-inline flex items-center justify-between">
      <h2 className="font-heading font-semibold">Required hashtags</h2>
      <Button variant="ghost" size="lg" onClick={copyAll}>
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied" : "Copy all"}
      </Button>
    </div>
  );
}
