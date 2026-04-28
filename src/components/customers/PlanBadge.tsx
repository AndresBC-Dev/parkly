import { Customer } from "@/lib/parking-types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<Customer["plan"], string> = {
  casual: "border-border text-muted-foreground bg-muted/40",
  monthly: "border-foreground/20 text-foreground bg-foreground/[0.04]",
  vip: "border-warning/40 text-warning bg-warning/5",
};

export function PlanBadge({ plan }: { plan: Customer["plan"] }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium capitalize", STYLES[plan])}
    >
      {plan}
    </Badge>
  );
}
