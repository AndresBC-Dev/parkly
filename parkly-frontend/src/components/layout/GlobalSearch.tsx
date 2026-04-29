import { useState, useEffect } from "react";
import { Search, User, MapPin, ListOrdered } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useParkingStore } from "@/lib/parking-store";
import { useNavigate } from "react-router-dom";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const customers = useParkingStore((s) => s.customers);
  const slots = useParkingStore((s) => s.slots);
  const movements = useParkingStore((s) => s.movements);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex relative w-full max-w-sm h-9 items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search plate, customer, slot…</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a plate, name or slot to search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Customers">
            {customers.slice(0, 5).map((c) => (
              <CommandItem
                key={c.id}
                onSelect={() => {
                  navigate("/customers");
                  setOpen(false);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{c.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{c.plates.join(", ")}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Active Slots">
            {slots.filter(s => s.vehicle).slice(0, 5).map((s) => (
              <CommandItem
                key={s.id}
                onSelect={() => {
                  navigate("/map");
                  setOpen(false);
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                <span>Slot {s.label} — {s.vehicle?.plate}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Recent Movements">
            {movements.slice(0, 5).map((m) => (
              <CommandItem
                key={m.id}
                onSelect={() => {
                  navigate("/operations");
                  setOpen(false);
                }}
              >
                <ListOrdered className="mr-2 h-4 w-4" />
                <span>{m.plate} — {m.owner}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
