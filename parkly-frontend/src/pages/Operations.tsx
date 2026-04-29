import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { MovementsTable } from "@/components/operations/MovementsTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParkingStore } from "@/lib/parking-store";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useTranslation } from "@/lib/translations";

type Filter = "all" | "active" | "completed";

const Operations = () => {
  const language = useParkingStore((s) => s.language);
  const { t } = useTranslation(language);
  const movements = useParkingStore((s) => s.movements);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      if (filter !== "all" && m.status !== filter) return false;
      if (query && !`${m.plate} ${m.owner} ${m.slot}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [movements, filter, query]);

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: t("viewAll"), count: movements.length },
    { id: "active", label: t("active"), count: movements.filter((m) => m.status === "active").length },
    { id: "completed", label: t("completed"), count: movements.filter((m) => m.status === "completed").length },
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
        <PageHeader
          eyebrow="Operations"
          title={t("operations")}
          description="A historical and real-time log of every check-in and check-out."
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 p-1">
            {tabs.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant="ghost"
                onClick={() => setFilter(t.id)}
                className={cn(
                  "h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium",
                  filter === t.id
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
              placeholder={t("search")}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </div>

        <MovementsTable movements={filtered} />
      </div>
    </AppLayout>
  );
};

export default Operations;
