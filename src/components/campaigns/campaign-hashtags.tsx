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
 * is how a post ends up failing the campaign's rules.
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
    <div className="space-y-tight">
      <div className="gap-inline flex items-center justify-between">
        <p className="text-sm font-medium">Hashtags in your caption</p>
        <Button variant="ghost" size="sm" onClick={copyAll}>
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <ul className="gap-tight flex flex-wrap">
        {tags.map((tag) => (
          <li
            key={tag}
            className="px-tight rounded-md bg-muted py-1 font-mono text-xs text-muted-foreground"
          >
            #{tag}
          </li>
        ))}
      </ul>
    </div>
  );
}
