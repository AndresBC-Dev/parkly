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
  const Icon = slot.type === "car" ? Car : Bike;
  const Sprite = slot.type === "car" ? CarSilhouette : MotorcycleSilhouette;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex aspect-[4/3] flex-col rounded-xl border bg-card p-2.5 text-left transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-foreground/20",
        occupied
          ? "border-destructive/30 slot-glow-occupied"
          : "border-primary/25 slot-glow-available",
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
              occupied ? "bg-destructive" : "bg-primary animate-subtle-pulse",
            )}
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-1.5">
        {occupied ? (
          <Sprite className="w-full max-h-12 text-foreground/85" />
        ) : (
          <span className="text-[10px] uppercase tracking-[0.18em] text-primary/80">
            Free
          </span>
        )}
      </div>

      {occupied && (
        <div className="truncate text-center font-mono text-[10px] tracking-wider text-foreground/70">
          {slot.vehicle?.plate}
        </div>
      )}
    </button>
  );
}
