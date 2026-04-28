import { useMemo, useState } from "react";
import { Car, Bike, LayoutGrid } from "lucide-react";
import { useParkingStore } from "@/lib/parking-store";
import { SlotCard } from "@/components/parking/SlotCard";
import { SlotSheet } from "@/components/parking/SlotSheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Slot, VehicleType } from "@/lib/parking-types";

type Filter = "all" | VehicleType;

interface ParkingMapProps {
  compact?: boolean;
}

export function ParkingMap({ compact = false }: ParkingMapProps) {
  const slots = useParkingStore((s) => s.slots);
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<Slot | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? slots : slots.filter((s) => s.type === filter)),
    [slots, filter],
  );

  const zones = useMemo(() => {
    const grouped = new Map<string, Slot[]>();
    visible.forEach((s) => {
      if (!grouped.has(s.zone)) grouped.set(s.zone, []);
      grouped.get(s.zone)!.push(s);
    });
    return Array.from(grouped.entries());
  }, [visible]);

  const total = visible.length;
  const occupied = visible.filter((s) => s.vehicle).length;

  const filters: { id: Filter; label: string; icon: typeof Car }[] = [
    { id: "all", label: "All", icon: LayoutGrid },
    { id: "car", label: "Cars", icon: Car },
    { id: "motorcycle", label: "Bikes", icon: Bike },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 p-1">
          {filters.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant="ghost"
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium",
                filter === f.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>{total - occupied} free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            <span>{occupied} occupied</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {zones.map(([zone, list]) => (
          <div key={zone} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="font-mono text-[10px] uppercase tracking-widest"
              >
                Zone {zone}
              </Badge>
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-[11px] text-muted-foreground">
                {list.filter((s) => !s.vehicle).length}/{list.length} free
              </span>
            </div>
            <div
              className={cn(
                "grid gap-2.5",
                compact
                  ? "grid-cols-4 sm:grid-cols-6 md:grid-cols-8"
                  : "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
              )}
            >
              {list.map((slot) => (
                <SlotCard key={slot.id} slot={slot} onClick={() => setActive(slot)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <SlotSheet
        slot={active}
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
      />
    </div>
  );
}
