import { cn } from "@/shared/lib";

type MarqueeProps = {
  items: string[];
  speed?: number;
  reverse?: boolean;
  className?: string;
};

export function Marquee({ items, speed = 24, reverse = false, className }: MarqueeProps) {
  const track = [...items, ...items];

  return (
    <div
      aria-hidden
      data-clip
      className={cn("border-border overflow-hidden border-y-2 py-3", className)}
    >
      <ul
        className="marquee-track spec flex w-max"
        style={
          {
            "--marquee-duration": `${speed}s`,
            "--marquee-direction": reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        {track.map((item, index) => (
          <li key={`${item}-${index}`} className="flex shrink-0 items-center gap-8 pr-8">
            <span>{item}</span>
            <span className="text-accent">▪</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
