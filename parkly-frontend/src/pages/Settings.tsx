import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Layout, Settings as SettingsIcon, ShieldCheck, MapPin } from "lucide-react";
import { useParkingStore } from "@/lib/parking-store";
import type { VehicleType, Currency } from "@/lib/parking-types";
import { toast } from "sonner";
import { Coins } from "lucide-react";

const Settings = () => {
  const slots = useParkingStore((s) => s.slots);
  const addSlot = useParkingStore((s) => s.addSlot);
  const deleteSlot = useParkingStore((s) => s.deleteSlot);
  const updateSlot = useParkingStore((s) => s.updateSlot);
  const currency = useParkingStore((s) => s.currency);
  const setCurrency = useParkingStore((s) => s.setCurrency);
  const migrateRates = useParkingStore((s) => s.migrateRates);

  const [newSlot, setNewSlot] = useState({
    label: "",
    zone: "A",
    type: "sedan" as VehicleType,
  });

  const handleAddSlot = async () => {
    if (!newSlot.label) {
      toast.error("Please enter a slot label (e.g. A-10)");
      return;
    }
    await addSlot(newSlot);
    setNewSlot({ ...newSlot, label: "" });
    toast.success("Slot added successfully");
  };

  const zones = Array.from(new Set(slots.map((s) => s.zone))).sort();

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
        <PageHeader
          eyebrow="System"
          title="Settings"
          description="Configure your facility layout, security, and general preferences."
        />

        <Tabs defaultValue="facility" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="facility" className="gap-2">
              <Layout className="h-4 w-4" />
              Parking Layout
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="facility" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="p-6 space-y-4 h-fit border-border/70">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Plus className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold">Add New Slot</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Slot Label</Label>
                    <Input 
                      placeholder="e.g. D-01" 
                      value={newSlot.label}
                      onChange={(e) => setNewSlot({...newSlot, label: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Zone Name</Label>
                      <Input 
                        placeholder="e.g. Basement" 
                        value={newSlot.zone}
                        onChange={(e) => setNewSlot({...newSlot, zone: e.target.value.toUpperCase()})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Type</Label>
                      <Select 
                        value={newSlot.type} 
                        onValueChange={(v) => setNewSlot({...newSlot, type: v as VehicleType})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full mt-2" onClick={handleAddSlot}>
                    Create Slot
                  </Button>
                </div>
              </Card>

              <div className="lg:col-span-2 space-y-6">
                <Card className="overflow-hidden border-border/70">
                  <div className="bg-muted/30 px-6 py-3 border-b border-border/60 flex justify-between items-center">
                    <h3 className="text-sm font-medium">Slot Directory</h3>
                    <Badge variant="outline" className="text-[10px]">
                      {slots.length} Total Slots
                    </Badge>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-[100px]">Label</TableHead>
                          <TableHead>Zone</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {slots.map((slot) => (
                          <TableRow key={slot.id}>
                            <TableCell className="font-mono font-medium">{slot.label}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-xs">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                Zone {slot.zone}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="capitalize text-[10px]">
                                {slot.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {slot.vehicle ? (
                                <Badge variant="destructive" className="text-[10px]">Occupied</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px]">Free</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    disabled={!!slot.vehicle}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently remove slot <strong>{slot.label}</strong> from Zone {slot.zone}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteSlot(slot.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete Slot
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="general">
            <Card className="p-8 border-border/70 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">General Preferences</h3>
                  <p className="text-xs text-muted-foreground">Adjust system-wide settings.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="space-y-0.5">
                    <Label>System Currency</Label>
                    <p className="text-xs text-muted-foreground">Used for all rates and revenue calculations.</p>
                  </div>
                  <Select 
                    value={currency} 
                    onValueChange={async (v) => {
                      const newCurr = v as Currency;
                      if (confirm(`Do you want to automatically convert all your existing Pricing Rates to ${newCurr}? (Using current exchange rates)`)) {
                        await migrateRates(newCurr);
                        toast.success(`Currency changed to ${v} and rates converted!`);
                      } else {
                        setCurrency(newCurr);
                        toast.success(`Currency changed to ${v} (Values left unchanged)`);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="COP">COP ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card className="p-12 text-center border-dashed border-border/60">
              <p className="text-sm text-muted-foreground">Security and User management coming soon.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
