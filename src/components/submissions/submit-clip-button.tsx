"use client";

import { Plus } from "lucide-react";

import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";

export function SubmitClipButton() {
  const openSubmit = useUiStore((state) => state.openSubmit);

  return (
    <Button size="sm" onClick={() => openSubmit()}>
      <Plus />
      Submit
    </Button>
  );
}
