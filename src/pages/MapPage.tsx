import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { ParkingMap } from "@/components/parking/ParkingMap";
import { Card } from "@/components/ui/card";

const MapPage = () => {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
        <PageHeader
          eyebrow="Live view"
          title="Parking map"
          description="Visual layout of all slots in the facility. Click a slot to check in or out."
        />
        <Card className="border-border/70 p-6">
          <ParkingMap />
        </Card>
      </div>
    </AppLayout>
  );
};

export default MapPage;
