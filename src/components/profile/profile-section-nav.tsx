"use client";

import * as React from "react";

import { tabPillClassName } from "@/components/shared/tab-pill";

export type ProfileSectionLink = {
  id: string;
  label: string;
};

function sectionOffset(element: HTMLElement) {
  const margin = parseFloat(window.getComputedStyle(element).scrollMarginTop);
  return Number.isNaN(margin) ? 0 : margin;
}

export function ProfileSectionNav({ sections }: { sections: ProfileSectionLink[] }) {
  const [active, setActive] = React.useState(sections[0]?.id);
  const locked = React.useRef(false);
  const unlockTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const key = sections.map((section) => section.id).join(",");

  const releaseWhenSettled = React.useCallback(() => {
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
    unlockTimer.current = setTimeout(() => {
      locked.current = false;
    }, 150);
  }, []);

  React.useEffect(() => {
    const ids = key.split(",");

    let tracked: { id: string; element: HTMLElement; offset: number }[] = [];
    let frame = 0;

    const measure = () => {
      tracked = ids
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null)
        .map((element) => ({
          id: element.id,
          element,
          offset: sectionOffset(element),
        }));
    };

    const read = () => {
      frame = 0;
      if (locked.current) {
        releaseWhenSettled();
        return;
      }

      let current = ids[0];
      for (const section of tracked) {
        if (section.element.getBoundingClientRect().top - section.offset <= 1) {
          current = section.id;
        }
      }
      setActive((previous) => (previous === current ? previous : current));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [key, releaseWhenSettled]);

  React.useEffect(() => {
    return () => {
      if (unlockTimer.current) clearTimeout(unlockTimer.current);
    };
  }, []);

  function go(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    locked.current = true;
    setActive(id);
    releaseWhenSettled();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav aria-label="Profile sections">
      <ul className="-mx-card px-card gap-tight flex snap-x overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:mx-0 lg:snap-none lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {sections.map((section) => {
          const current = section.id === active;

          return (
            <li key={section.id} className="shrink-0 snap-start lg:w-full">
              <a
                href={`#${section.id}`}
                onClick={(event) => go(event, section.id)}
                aria-current={current ? "true" : undefined}
                className={tabPillClassName(current, "block")}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
