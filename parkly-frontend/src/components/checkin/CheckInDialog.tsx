import { ReactNode, useEffect, useMemo, useState } from "react";
import { Car, Bike, Loader2, UserPlus, Check, ChevronsUpDown } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useParkingStore } from "@/lib/parking-store";
import type { VehicleType } from "@/lib/parking-types";
import { cn } from "@/lib/utils";

interface CheckInDialogProps {
  trigger: ReactNode;
  defaultSlot?: string;
}

export function CheckInDialog({ trigger, defaultSlot }: CheckInDialogProps) {
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState("");
  const [owner, setOwner] = useState("");
  const [type, setType] = useState<VehicleType>("sedan");
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const checkIn = useParkingStore((s) => s.checkIn);
  const customers = useParkingStore((s) => s.customers);

  const selected = useMemo(
    () => customers.find((c) => c.id === customerId),
    [customers, customerId],
  );

  // Auto-suggest customer when plate matches
  useEffect(() => {
    if (customerId) return;
    if (!plate.trim()) return;
    const match = customers.find((c) => c.plates.includes(plate.toUpperCase()));
    if (match) {
      setCustomerId(match.id);
      setOwner(match.name);
    }
  }, [plate, customers, customerId]);

  const reset = () => {
    setPlate("");
    setOwner("");
    setType("sedan");
    setCustomerId(undefined);
  };

  const handlePickCustomer = (id: string) => {
    const c = customers.find((x) => x.id === id);
    if (!c) return;
    setCustomerId(c.id);
    setOwner(c.name);
    if (!plate && c.plates[0]) setPlate(c.plates[0]);
    setPickerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !owner.trim()) {
      toast.error("Please enter plate and owner.");
      return;
    }
    setSubmitting(true);
    try {
      const slot = await checkIn({ plate, type, owner, customerId, slotId: defaultSlot });
      if (!slot) {
        toast.error("No available slots for this vehicle type.");
        return;
      }
      toast.success(`Checked in ${plate.toUpperCase()} → Slot ${slot.id}`);
      reset();
      setOpen(false);
    } catch (error) {
      toast.error("Check-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight">
            Vehicle check-in
          </DialogTitle>
          <DialogDescription className="text-xs">
            Register a new entry. Link an existing customer or create a one-off entry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Customer picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Customer (optional)
            </Label>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                >
                  {selected ? (
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{selected.name}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {selected.plan}
                      </Badge>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Search customer or leave blank…</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search by name or plate…" />
                  <CommandList>
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      {customers.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={`${c.name} ${c.plates.join(" ")}`}
                          onSelect={() => handlePickCustomer(c.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-3.5 w-3.5",
                              customerId === c.id ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <div className="flex flex-1 items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm">{c.name}</p>
                              <p className="truncate font-mono text-[10px] text-muted-foreground">
                                {c.plates.join(" · ") || "no plates"}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {c.plan}
                            </Badge>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selected && (
              <button
                type="button"
                onClick={() => { setCustomerId(undefined); setOwner(""); }}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Clear selection
              </button>
            )}
          </div>

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
                <SelectItem value="sedan">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>Sedan</span>
                  </div>
                </SelectItem>
                <SelectItem value="suv">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground rotate-90" />
                    <span>SUV (Camioneta)</span>
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
              disabled={!!selected}
            />
            {!selected && (
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <UserPlus className="h-3 w-3" />
                Walk-in entry — not linked to a customer profile.
              </p>
            )}
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
