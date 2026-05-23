import { useState } from "react";
import { useDevices, useMedicationSchedule, useDoseEvents, useUpdateDoseEvent, useCreateSchedule } from "@/hooks/useDevices";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, Circle, XCircle, AlertTriangle, Plus, Clock } from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusConfig = {
  taken: { icon: CheckCircle2, color: "text-[hsl(var(--accent))]", bg: "bg-[hsl(var(--accent))]/10", label: "Taken" },
  pending: { icon: Circle, color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning))]/10", label: "Pending" },
  missed: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Missed" },
  skipped: { icon: AlertTriangle, color: "text-muted-foreground", bg: "bg-muted", label: "Skipped" },
  upcoming: { icon: Clock, color: "text-primary", bg: "bg-primary/10", label: "Upcoming" },
};

export default function Schedule() {
  const { data: devices } = useDevices();
  const deviceId = devices?.[0]?.id;
  const { data: schedules } = useMedicationSchedule(deviceId);
  const { data: doseEvents } = useDoseEvents(deviceId);
  const updateDose = useUpdateDoseEvent();
  const createSchedule = useCreateSchedule();
  const [open, setOpen] = useState(false);
  const [medName, setMedName] = useState("");
  const [doseTime, setDoseTime] = useState("08:00");
  const [dosage, setDosage] = useState("1 pill");

  const todayEvents = doseEvents?.filter((e) => isToday(parseISO(e.scheduled_time))) ?? [];

  const handleMarkTaken = async (id: string) => {
    await updateDose.mutateAsync({ id, status: "taken" });
    toast.success("Dose marked as taken");
  };

  const handleAddSchedule = async () => {
    if (!deviceId || !medName) return;
    await createSchedule.mutateAsync({ device_id: deviceId, medication_name: medName, dose_time: doseTime, dosage, enabled: true });
    toast.success("Schedule added");
    setOpen(false);
    setMedName("");
  };

  return (
    <div className="px-5 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Schedule</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl h-9 gap-1.5"><Plus className="h-4 w-4" /> Add</Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader><DialogTitle>New Schedule</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Medication Name</Label>
                <Input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="e.g. Aspirin" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Time</Label>
                <Input type="time" value={doseTime} onChange={(e) => setDoseTime(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Dosage</Label>
                <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="1 pill" className="h-11 rounded-xl" />
              </div>
              <Button onClick={handleAddSchedule} className="w-full h-11 rounded-xl" disabled={createSchedule.isPending}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today */}
      <div className="rounded-2xl bg-card border p-4">
        <h2 className="text-sm font-semibold mb-3">{format(new Date(), "EEEE, MMM d")}</h2>
        <div className="space-y-2">
          {todayEvents.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No doses today</p>}
          {todayEvents.map((event) => {
            const config = statusConfig[event.status as keyof typeof statusConfig] ?? statusConfig.pending;
            const Icon = config.icon;
            const schedule = event.medication_schedule;
            return (
              <div key={event.id} className="flex items-center justify-between rounded-xl bg-background p-3">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", config.bg)}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{schedule?.medication_name ?? "Medication"}</p>
                    <p className="text-[11px] text-muted-foreground">{format(parseISO(event.scheduled_time), "HH:mm")} · {schedule?.dosage}</p>
                  </div>
                </div>
                {event.status === "pending" ? (
                  <Button size="sm" variant="outline" className="rounded-lg text-xs h-8" onClick={() => handleMarkTaken(event.id)}>Take</Button>
                ) : (
                  <span className={cn("text-xs font-medium", config.color)}>{config.label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* All Schedules */}
      <div className="rounded-2xl bg-card border p-4">
        <h2 className="text-sm font-semibold mb-3">All Schedules</h2>
        <div className="space-y-2">
          {schedules?.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl bg-background p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Pill className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{s.medication_name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.dosage} · {s.dose_time.slice(0, 5)}</p>
                </div>
              </div>
              <Badge variant={s.enabled ? "default" : "secondary"} className="rounded-lg text-[10px]">{s.enabled ? "Active" : "Off"}</Badge>
            </div>
          ))}
          {(!schedules || schedules.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No schedules</p>}
        </div>
      </div>
    </div>
  );
}

function Pill(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  );
}
