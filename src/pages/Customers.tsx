import { useMemo, useState } from "react";
import { Mail, Phone, MoreHorizontal, Pencil, Trash2, Search, Plus, Car } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { PlanBadge } from "@/components/customers/PlanBadge";
import { useParkingStore } from "@/lib/parking-store";
import { cn } from "@/lib/utils";

const Customers = () => {
  const customers = useParkingStore((s) => s.customers);
  const movements = useParkingStore((s) => s.movements);
  const slots = useParkingStore((s) => s.slots);
  const deleteCustomer = useParkingStore((s) => s.deleteCustomer);

  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "casual" | "monthly" | "vip">("all");

  const stats = useMemo(() => {
    const byPlan = customers.reduce(
      (acc, c) => {
        acc[c.plan]++;
        return acc;
      },
      { casual: 0, monthly: 0, vip: 0 },
    );
    return { total: customers.length, ...byPlan };
  }, [customers]);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (planFilter !== "all" && c.plan !== planFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.plates.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [customers, query, planFilter]);

  const isActive = (customerId: string) =>
    slots.some((s) => s.vehicle?.customerId === customerId);

  const visitsCount = (customerId: string) =>
    movements.filter((m) => m.customerId === customerId).length;

  const tabs = [
    { id: "all" as const, label: "All", count: stats.total },
    { id: "casual" as const, label: "Casual", count: stats.casual },
    { id: "monthly" as const, label: "Monthly", count: stats.monthly },
    { id: "vip" as const, label: "VIP", count: stats.vip },
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
        <PageHeader
          eyebrow="Directory"
          title="Customers"
          description="Manage registered drivers, vehicles and subscription plans."
          actions={
            <CustomerDialog
              trigger={
                <Button className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  New customer
                </Button>
              }
            />
          }
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total customers" value={String(stats.total)} />
          <StatCard label="Casual" value={String(stats.casual)} />
          <StatCard label="Monthly" value={String(stats.monthly)} />
          <StatCard label="VIP" value={String(stats.vip)} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 p-1">
            {tabs.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant="ghost"
                onClick={() => setPlanFilter(t.id)}
                className={cn(
                  "h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium",
                  planFilter === t.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                <span className="rounded bg-muted px-1.5 py-px text-[10px] tabular-nums text-muted-foreground">
                  {t.count}
                </span>
              </Button>
            ))}
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, plate…"
              className="h-9 pl-8 text-sm"
            />
          </div>
        </div>

        <Card className="overflow-hidden border-border/70 p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Contact</TableHead>
                <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Plates</TableHead>
                <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Plan</TableHead>
                <TableHead className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Visits</TableHead>
                <TableHead className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                    No customers match your filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c) => {
                const initials = c.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                const active = isActive(c.id);
                return (
                  <TableRow key={c.id} className="border-border/60">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground ring-1 ring-border">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{c.name}</p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            Joined {c.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5 text-xs">
                        <p className="flex items-center gap-1.5 text-foreground/80">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {c.email}
                        </p>
                        <p className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {c.phone || "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.plates.length === 0 && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {c.plates.map((p) => (
                          <Badge
                            key={p}
                            variant="outline"
                            className="font-mono text-[10px] tracking-wider"
                          >
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={c.plan} />
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums text-foreground/80">
                      {visitsCount(c.id)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1.5 font-medium capitalize",
                          active
                            ? "border-foreground/20 text-foreground bg-foreground/[0.04]"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            active ? "bg-foreground/70 animate-subtle-pulse" : "bg-muted-foreground/50",
                          )}
                        />
                        {active ? "parked" : "idle"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <CustomerDialog
                            customer={c}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuItem disabled={!active}>
                            <Car className="mr-2 h-3.5 w-3.5" />
                            View active slot
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => {
                              deleteCustomer(c.id);
                              toast.success(`${c.name} removed`);
                            }}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AppLayout>
  );
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/70 p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{value}</p>
    </Card>
  );
}

export default Customers;
