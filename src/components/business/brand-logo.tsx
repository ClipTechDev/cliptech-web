import { cn } from "@/lib/utils";

export function BrandLogo({
  name,
  src,
  ratio,
  height,
  invertOnDark,
}: {
  name: string;
  src: string;
  ratio: number;
  height: number;
  invertOnDark?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      loading="lazy"
      width={Math.round(height * ratio)}
      height={height}
      style={
        { "--logo-h": `${height}px`, aspectRatio: ratio } as React.CSSProperties
      }
      className={cn(
        "h-[calc(var(--logo-h)*0.8)] w-auto sm:h-(--logo-h)",
        invertOnDark && "dark:invert",
      )}
    />
  );
}
