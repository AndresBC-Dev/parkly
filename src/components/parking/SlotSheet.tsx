import { Car, Bike, Clock, User, MapPin, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Slot } from "@/lib/parking-types";
import { useParkingStore } from "@/lib/parking-store";
import { CheckInDialog } from "@/components/checkin/CheckInDialog";
import { toast } from "sonner";

interface SlotSheetProps {
  slot: Slot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDuration(from: Date) {
  const minutes = Math.max(1, Math.floor((Date.now() - from.getTime()) / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function SlotSheet({ slot, open, onOpenChange }: SlotSheetProps) {
  const checkOut = useParkingStore((s) => s.checkOut);
  if (!slot) return null;
  const occupied = !!slot.vehicle;
  const Icon = slot.type === "car" ? Car : Bike;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="space-y-2 border-b border-border p-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest">
                Zone {slot.zone}
              </Badge>
              <Badge
                variant="outline"
                className={
                  occupied
                    ? "border-destructive/40 text-destructive"
                    : "border-primary/40 text-primary"
                }
              >
                {occupied ? "Occupied" : "Available"}
              </Badge>
            </div>
            <SheetTitle className="text-2xl font-semibold tracking-tight">
              Slot {slot.label}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-1.5 text-xs">
              <Icon className="h-3.5 w-3.5" />
              {slot.type === "car" ? "Car space" : "Motorcycle space"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {occupied ? (
              <>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    License plate
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold tracking-wider">
                    {slot.vehicle?.plate}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <InfoRow icon={User} label="Owner" value={slot.vehicle!.owner} />
                  <InfoRow
                    icon={Clock}
                    label="Time parked"
                    value={formatDuration(slot.vehicle!.enteredAt)}
                  />
                  <InfoRow
                    icon={MapPin}
                    label="Entered at"
                    value={slot.vehicle!.enteredAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">Slot is available</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Assign a new check-in directly to this space.
                </p>
              </div>
            )}
          </div>

          <Separator />

          <SheetFooter className="p-6">
            {occupied ? (
              <Button
                variant="destructive"
                className="w-full gap-1.5"
                onClick={() => {
                  checkOut(slot.id);
                  toast.success(`Checked out ${slot.vehicle?.plate}`);
                  onOpenChange(false);
                }}
              >
                <LogOut className="h-4 w-4" />
                Check out vehicle
              </Button>
            ) : (
              <CheckInDialog
                defaultSlot={slot.id}
                trigger={<Button className="w-full">Assign vehicle to slot</Button>}
              />
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Car;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3.5 py-2.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
