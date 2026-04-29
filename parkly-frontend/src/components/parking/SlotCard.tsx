import { Car, Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Slot } from "@/lib/parking-types";
import { CarSilhouette, MotorcycleSilhouette } from "@/components/icons/VehicleSprites";

interface SlotCardProps {
  slot: Slot;
  onClick?: () => void;
}

export function SlotCard({ slot, onClick }: SlotCardProps) {
  const occupied = !!slot.vehicle;
  const Icon = slot.type === "motorcycle" ? Bike : Car;
  const Sprite = slot.type === "motorcycle" ? MotorcycleSilhouette : CarSilhouette;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex aspect-[4/3] flex-col rounded-xl border border-border bg-card p-2.5 text-left transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-accent/40",
        occupied ? "slot-state-occupied" : "slot-state-available bg-muted/30",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold tracking-wider text-muted-foreground">
          {slot.label}
        </span>
        <div className="flex items-center gap-1">
          <Icon className="h-3 w-3 text-muted-foreground" strokeWidth={2} />
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              occupied ? "bg-destructive/80" : "bg-muted-foreground/40",
            )}
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-1.5">
        {occupied ? (
          <Sprite className="w-full max-h-12 text-foreground/80" />
        ) : (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            Free
          </span>
        )}
      </div>

      {occupied && (
        <div className="truncate text-center font-mono text-[10px] tracking-wider text-foreground/60">
          {slot.vehicle?.plate}
        </div>
      )}
    </button>
  );
}
