import { Link } from "react-router-dom";
import {
  CircleParking,
  Wallet,
  CarFront,
  Activity,
  ArrowUpRight,
  Plus,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ParkingMap } from "@/components/parking/ParkingMap";
import { MovementsTable } from "@/components/operations/MovementsTable";
import { CheckInDialog } from "@/components/checkin/CheckInDialog";
import { useParkingStore } from "@/lib/parking-store";
import { formatCurrency } from "@/lib/utils";
import { sumConverted } from "@/lib/currency-utils";

const Dashboard = () => {
  const slots = useParkingStore((s) => s.slots);
  const movements = useParkingStore((s) => s.movements);
  const currency = useParkingStore((s) => s.currency);

  const total = slots.length;
  const occupied = slots.filter((s) => s.vehicle).length;
  const occupancy = total > 0 ? Math.round((occupied / total) * 100) : 0;
  
  const sedansActive = slots.filter((s) => s.vehicle && s.type === "sedan").length;
  const suvsActive = slots.filter((s) => s.vehicle && s.type === "suv").length;
  const bikesActive = slots.filter((s) => s.vehicle && s.type === "motorcycle").length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const movementsToday = movements.filter((m) => {
    const d = new Date(m.checkIn);
    return d >= today;
  });

  const revenueToday = sumConverted(
    movementsToday.filter((m) => m.status === "completed"),
    currency
  );

  // Calculate Average Stay
  const completedToday = movementsToday.filter((m) => m.status === "completed" && m.checkOut);
  let avgStayLabel = "No data";
  if (completedToday.length > 0) {
    const totalMs = completedToday.reduce((sum, m) => {
      const start = new Date(m.checkIn).getTime();
      const end = new Date(m.checkOut!).getTime();
      return sum + (end - start);
    }, 0);
    const avgMin = Math.floor(totalMs / completedToday.length / 60000);
    const h = Math.floor(avgMin / 60);
    const m = avgMin % 60;
    avgStayLabel = h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  return (
    <AppLayout>
      <div>
        <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
          <PageHeader
            eyebrow="Garage 01 · Calle Serrano"
            title="Operations dashboard"
            description="Live overview of your parking facility — occupancy, revenue and current vehicles."
            actions={
              <CheckInDialog
                trigger={
                  <Button className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    New check-in
                  </Button>
                }
              />
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Occupancy"
              value={`${occupancy}%`}
              delta={4}
              hint="vs. yesterday"
              icon={CircleParking}
            />
            <KpiCard
              label="Revenue today"
              value={formatCurrency(revenueToday, currency)}
              delta={12}
              hint="vs. yesterday"
              icon={Wallet}
            />
            <KpiCard
              label="Active vehicles"
              value={String(occupied)}
              hint={`${sedansActive + suvsActive} cars · ${bikesActive} bikes`}
              icon={CarFront}
            />
            <KpiCard
              label="Avg. stay"
              value={avgStayLabel}
              delta={-3}
              hint="vs. yesterday"
              icon={Activity}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-border/70 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">Live parking map</h2>
                  <p className="text-xs text-muted-foreground">
                    Tap any slot to manage. Updates in real time.
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                  <Link to="/map">
                    Open full map
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <ParkingMap compact />
            </Card>

            <Card className="border-border/70 p-6">
              <h2 className="text-sm font-semibold tracking-tight">Capacity by zone</h2>
              <p className="text-xs text-muted-foreground">Real-time fill rate.</p>

              <div className="mt-5 space-y-5">
                {["A", "B", "C"].map((z) => {
                  const zoneSlots = slots.filter((s) => s.zone === z);
                  const zOcc = zoneSlots.filter((s) => s.vehicle).length;
                  const pct = Math.round((zOcc / zoneSlots.length) * 100);
                  return (
                    <div key={z} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono uppercase tracking-wider text-muted-foreground">
                          Zone {z}
                        </span>
                        <span className="tabular-nums font-medium">
                          {zOcc}/{zoneSlots.length} · {pct}%
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Peak hour
                </p>
                <p className="mt-1 font-display text-xl font-semibold tracking-tight">
                  18:00 – 19:00
                </p>
                <p className="text-xs text-muted-foreground">94% avg. occupancy</p>
              </div>
            </Card>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight">Recent movements</h2>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                <Link to="/operations">
                  View all
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <MovementsTable movements={movements} limit={6} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
