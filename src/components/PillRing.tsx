import { cn } from "@/lib/utils";

interface PillRingProps {
  current: number;
  capacity: number;
  label: string;
  medicationName?: string | null;
  size?: "sm" | "md";
}

export default function PillRing({ current, capacity, label, medicationName, size = "md" }: PillRingProps) {
  const percentage = capacity > 0 ? (current / capacity) * 100 : 0;
  const isLow = percentage < 20;
  const isMedium = percentage >= 20 && percentage < 50;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const dim = size === "sm" ? "w-20 h-20" : "w-28 h-28";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("relative", dim)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" className="stroke-muted" />
          <circle
            cx="50" cy="50" r="40" fill="none" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-all duration-700",
              isLow ? "stroke-destructive" : isMedium ? "stroke-[hsl(var(--warning))]" : "stroke-[hsl(var(--accent))]"
            )}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", size === "sm" ? "text-sm" : "text-lg")}>{current}</span>
          <span className="text-[10px] text-muted-foreground">/{capacity}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {medicationName && <span className="text-xs text-foreground truncate max-w-[80px]">{medicationName}</span>}
    </div>
  );
}
