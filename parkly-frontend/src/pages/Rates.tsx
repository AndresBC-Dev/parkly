import { useState } from "react";
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
import { Plus, Trash2, Edit2, Info, Banknote, Clock, Zap } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParkingStore } from "@/lib/parking-store";
import { formatCurrency } from "@/lib/utils";
import type { Rate, VehicleType, RateUnit } from "@/lib/parking-types";
import { toast } from "sonner";

const Rates = () => {
  const rates = useParkingStore((s) => s.rates);
  const addRate = useParkingStore((s) => s.addRate);
  const updateRate = useParkingStore((s) => s.updateRate);
  const deleteRate = useParkingStore((s) => s.deleteRate);
  const currency = useParkingStore((s) => s.currency);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  
  const [formData, setFormData] = useState<Omit<Rate, "id">>({
    vehicleType: "sedan",
    unit: "minute",
    value: 0,
    fractionMin: 15,
  });

  const handleOpenAdd = () => {
    setEditingRate(null);
    setFormData({ vehicleType: "sedan", unit: "minute", value: 0, fractionMin: 15 });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (rate: Rate) => {
    setEditingRate(rate);
    setFormData({
      vehicleType: rate.vehicleType,
      unit: rate.unit,
      value: rate.value,
      fractionMin: rate.fractionMin || 15,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRate) {
      await updateRate(editingRate.id, formData);
      toast.success("Rate updated successfully");
    } else {
      await addRate(formData);
      toast.success("Rate created successfully");
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteRate(id);
    toast.success("Rate deleted");
  };

  const getUnitLabel = (unit: RateUnit, fraction?: number) => {
    switch (unit) {
      case "minute": return "Per Minute";
      case "hour": return "Per Hour";
      case "day": return "Per Day (24h)";
      case "fraction": return `Per ${fraction || 15} Min Fraction`;
      default: return unit;
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
        <PageHeader
          eyebrow="Configuration"
          title="Rate Management"
          description="Manage pricing for different vehicle categories and time units."
          actions={
            <Button onClick={handleOpenAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Rate
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-3 overflow-hidden border-border/70">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[180px]">Vehicle Type</TableHead>
                  <TableHead>Charge Unit</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No rates configured yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  rates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium capitalize">
                        <Badge variant="outline" className="capitalize">
                          {rate.vehicleType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {getUnitLabel(rate.unit, rate.fractionMin)}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {formatCurrency(rate.value, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleOpenEdit(rate)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Pricing Rate?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the pricing for <strong>{rate.vehicleType}</strong> ({rate.unit}). This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(rate.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 p-5 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">Pricing Logic</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Rates are snapshotted at check-in. Any changes made here will only apply to vehicles entering after the update.
                  </p>
                </div>
              </div>
            </Card>

            <div className="rounded-xl border border-border p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pricing Strategy
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2.5">
                  <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                  <p className="text-[11px] text-muted-foreground">
                    Minute billing is ideal for high-rotation city garages.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <Banknote className="h-4 w-4 text-emerald-500 shrink-0" />
                  <p className="text-[11px] text-muted-foreground">
                    Day billing is recommended for long-stay airport facilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingRate ? "Edit Rate" : "New Rate"}</DialogTitle>
              <DialogDescription>
                Configure how much to charge for a specific vehicle category.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Vehicle Category</Label>
                  <Select 
                    value={formData.vehicleType} 
                    onValueChange={(v) => setFormData({...formData, vehicleType: v as VehicleType})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV (Camioneta)</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Time Unit</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(v) => setFormData({...formData, unit: v as RateUnit})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minute">Minute</SelectItem>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="fraction">Fraction</SelectItem>
                      <SelectItem value="day">Day (24h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.unit === "fraction" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Fraction Size (Minutes)</Label>
                  <Input 
                    type="number"
                    value={formData.fractionMin}
                    onChange={(e) => setFormData({...formData, fractionMin: parseInt(e.target.value)})}
                    placeholder="15"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Price (Value)</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRate ? "Update Rate" : "Create Rate"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Rates;
