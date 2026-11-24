"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function StickyCta() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    const proposal = document.getElementById("proposal");
    if (!hero || !proposal) return;

    const seen = new Map<Element, boolean>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => seen.set(entry.target, entry.isIntersecting));
      setVisible(!seen.get(hero) && !seen.get(proposal));
    });
    observer.observe(hero);
    observer.observe(proposal);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
        >
          <div className="flex items-center justify-between gap-card rounded-2xl border bg-background/85 py-2 pr-2 pl-4 shadow-lg shadow-black/10 backdrop-blur-md sm:pl-5">
            <p className="text-sm whitespace-nowrap">
              <span className="font-semibold">Campaigns from 1M views</span>
              <span className="hidden text-muted-foreground sm:inline">
                {" "}
                · Proposal within one business day
              </span>
            </p>
            <a
              href="#proposal"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Get a proposal
              <ArrowRight className="size-4" />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
