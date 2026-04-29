import { ReactNode, useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useParkingStore } from "@/lib/parking-store";
import type { Customer } from "@/lib/parking-types";

interface CustomerDialogProps {
  trigger: ReactNode;
  customer?: Customer;
}

const PLANS: { value: Customer["plan"]; label: string; description: string }[] = [
  { value: "casual", label: "Casual", description: "Pay-per-stay" },
  { value: "monthly", label: "Monthly", description: "Recurring access" },
  { value: "vip", label: "VIP", description: "Reserved spot · priority" },
];

export function CustomerDialog({ trigger, customer }: CustomerDialogProps) {
  const isEdit = !!customer;
  const addCustomer = useParkingStore((s) => s.addCustomer);
  const updateCustomer = useParkingStore((s) => s.updateCustomer);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<Customer["plan"]>("casual");
  const [plates, setPlates] = useState<string[]>([]);
  const [plateDraft, setPlateDraft] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(customer?.name ?? "");
      setEmail(customer?.email ?? "");
      setPhone(customer?.phone ?? "");
      setPlan(customer?.plan ?? "casual");
      setPlates(customer?.plates ?? []);
      setNotes(customer?.notes ?? "");
      setPlateDraft("");
    }
  }, [open, customer]);

  const addPlate = () => {
    const value = plateDraft.trim().toUpperCase();
    if (!value) return;
    if (plates.includes(value)) {
      setPlateDraft("");
      return;
    }
    setPlates((p) => [...p, value]);
    setPlateDraft("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && customer) {
        await updateCustomer(customer.id, { name, email, phone, plan, plates, notes });
        toast.success("Customer updated");
      } else {
        await addCustomer({ name, email, phone, plan, plates, notes });
        toast.success("Customer registered");
      }
      setOpen(false);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold tracking-tight">
            {isEdit ? "Edit customer" : "New customer"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEdit
              ? "Update contact details, plan and registered plates."
              : "Register a new customer with their vehicles."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="cname" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Full name
              </Label>
              <Input
                id="cname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cemail" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </Label>
              <Input
                id="cemail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@parkly.io"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cphone" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Phone
              </Label>
              <Input
                id="cphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Plan
            </Label>
            <Select value={plan} onValueChange={(v) => setPlan(v as Customer["plan"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <div className="flex flex-col">
                      <span className="text-sm">{p.label}</span>
                      <span className="text-[11px] text-muted-foreground">{p.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vehicle plates
            </Label>
            <div className="flex gap-2">
              <Input
                value={plateDraft}
                onChange={(e) => setPlateDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPlate();
                  }
                }}
                placeholder="MAD-1234"
                className="font-mono uppercase tracking-wider"
              />
              <Button type="button" variant="outline" onClick={addPlate} className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            {plates.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {plates.map((p) => (
                  <Badge
                    key={p}
                    variant="outline"
                    className="gap-1 font-mono text-[11px] tracking-wider"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => setPlates((arr) => arr.filter((x) => x !== p))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cnotes" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Notes
            </Label>
            <Textarea
              id="cnotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional internal notes…"
              rows={2}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Save changes" : "Create customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
