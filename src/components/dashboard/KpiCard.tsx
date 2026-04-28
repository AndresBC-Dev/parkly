import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "muted";
}

export function KpiCard({ label, value, delta, hint, icon: Icon, accent = "muted" }: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="relative overflow-hidden border-border/70 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg ring-1",
            accent === "primary"
              ? "bg-foreground/5 text-foreground ring-border"
              : "bg-muted text-muted-foreground ring-border",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {(delta !== undefined || hint) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
                positive
                  ? "bg-foreground/5 text-foreground/80 ring-1 ring-border"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
