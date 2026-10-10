import { cn } from "@/lib/utils";

export function SectionHeading({
  label,
  title,
  description,
  className,
}: {
  label: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-xl", className)}>
      <p className="font-mono text-xs text-muted-foreground">{label}</p>
      <h2 className="mt-3 font-heading text-3xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
