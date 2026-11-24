"use client";

import * as React from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

function useItemVariants(): Variants {
  const reduced = useReducedMotion();
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  };
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const variants = useItemVariants();
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

const GROUP_TAGS = {
  div: motion.div,
  ul: motion.ul,
  ol: motion.ol,
  dl: motion.dl,
};
const ITEM_TAGS = { div: motion.div, li: motion.li };

export function RevealGroup({
  as = "div",
  stagger = 0.08,
  className,
  children,
}: {
  as?: keyof typeof GROUP_TAGS;
  stagger?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const Tag = GROUP_TAGS[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  as = "div",
  className,
  children,
}: {
  as?: keyof typeof ITEM_TAGS;
  className?: string;
  children: React.ReactNode;
}) {
  const Tag = ITEM_TAGS[as];
  return (
    <Tag className={className} variants={useItemVariants()}>
      {children}
    </Tag>
  );
}

export function CountUp({ value }: { value: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
    const node = ref.current;
    if (!inView || reduced || !match || !node) return;
    const decimals = match[1].split(".")[1]?.length ?? 0;
    const controls = animate(0, Number(match[1]), {
      duration: 1.4,
      ease: EASE,
      onUpdate: (latest) => {
        node.textContent = latest.toFixed(decimals) + match[2];
      },
    });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return <span ref={ref}>{value}</span>;
}
