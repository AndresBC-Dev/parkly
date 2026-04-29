import { Car, Bike } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useParkingStore } from "@/lib/parking-store";
import { formatCurrency, cn } from "@/lib/utils";
import type { Movement } from "@/lib/parking-types";

interface MovementsTableProps {
  movements: Movement[];
  limit?: number;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MovementsTable({ movements, limit }: MovementsTableProps) {
  const currency = useParkingStore((s) => s.currency);
  const list = limit ? movements.slice(0, limit) : movements;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Plate</TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Owner</TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Slot</TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">In</TableHead>
            <TableHead className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Out</TableHead>
            <TableHead className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Amount</TableHead>
            <TableHead className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((m) => {
            const Icon = m.type === "motorcycle" ? Bike : Car;
            return (
              <TableRow key={m.id} className="border-border/60">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-mono text-sm font-medium tracking-wider">
                      {m.plate}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-foreground/80">{m.owner}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">{m.slot}</span>
                </TableCell>
                <TableCell className="text-sm tabular-nums text-foreground/80">
                  {formatTime(m.checkIn)}
                </TableCell>
                <TableCell className="text-sm tabular-nums text-foreground/80">
                  {m.checkOut ? formatTime(m.checkOut) : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {m.amount > 0 ? formatCurrency(m.amount, currency) : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className={cn(
                      "gap-1.5 font-medium capitalize",
                      m.status === "active" &&
                        "border-foreground/20 text-foreground bg-foreground/[0.04]",
                      m.status === "completed" &&
                        "border-border text-muted-foreground",
                      m.status === "overdue" &&
                        "border-destructive/40 text-destructive bg-destructive/5",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        m.status === "active" && "bg-foreground/70 animate-subtle-pulse",
                        m.status === "completed" && "bg-muted-foreground/60",
                        m.status === "overdue" && "bg-destructive",
                      )}
                    />
                    {m.status}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
