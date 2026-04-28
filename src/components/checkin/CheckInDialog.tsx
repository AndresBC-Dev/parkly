import { ReactNode, useState } from "react";
import { Car, Bike, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParkingStore } from "@/lib/parking-store";
import type { VehicleType } from "@/lib/parking-types";

interface CheckInDialogProps {
  trigger: ReactNode;
  defaultSlot?: string;
}

export function CheckInDialog({ trigger, defaultSlot }: CheckInDialogProps) {
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState("");
  const [owner, setOwner] = useState("");
  const [type, setType] = useState<VehicleType>("car");
  const [submitting, setSubmitting] = useState(false);

  const checkIn = useParkingStore((s) => s.checkIn);

  const reset = () => {
    setPlate("");
    setOwner("");
    setType("car");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !owner.trim()) {
      toast.error("Please enter plate and owner.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const slot = checkIn({ plate, type, owner, slotId: defaultSlot });
      setSubmitting(false);
      if (!slot) {
        toast.error("No available slots for this vehicle type.");
        return;
      }
      toast.success(`Checked in ${plate.toUpperCase()} → Slot ${slot.id}`);
      reset();
      setOpen(false);
    }, 350);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Vehicle check-in
          </DialogTitle>
          <DialogDescription className="text-xs">
            Register a new entry. The system will assign the next free slot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="plate" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              License plate
            </Label>
            <Input
              id="plate"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="MAD-1234"
              autoComplete="off"
              autoFocus
              className="font-mono uppercase tracking-wider"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vehicle type
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as VehicleType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>Car</span>
                  </div>
                </SelectItem>
                <SelectItem value="motorcycle">
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4 text-muted-foreground" />
                    <span>Motorcycle</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="owner" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Owner
            </Label>
            <Input
              id="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Full name"
              autoComplete="off"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Check in
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
