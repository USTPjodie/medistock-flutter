import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDevices, useCompartments, useMedicationSchedule, useDoseEvents, useCreateDevice } from "@/hooks/useDevices";
import { useRealtimeSubscriptions } from "@/hooks/useRealtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PillRing from "@/components/PillRing";
import { Pill, Plus, Wifi, WifiOff, Clock, CheckCircle2, Circle, XCircle } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";

export default function Index() {
  const { user } = useAuth();
  const { data: devices, isLoading: devicesLoading } = useDevices();
  const createDevice = useCreateDevice();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>();

  const activeDevice = devices?.find((d) => d.id === selectedDeviceId) ?? devices?.[0];
  const deviceId = activeDevice?.id;

  useEffect(() => {
    if (devices?.length && !selectedDeviceId) setSelectedDeviceId(devices[0].id);
  }, [devices, selectedDeviceId]);

  useRealtimeSubscriptions(deviceId, user?.id);

  const { data: compartments } = useCompartments(deviceId);
  const { data: schedules } = useMedicationSchedule(deviceId);
  const { data: doseEvents } = useDoseEvents(deviceId);

  const todayEvents = doseEvents?.filter((e) => isToday(parseISO(e.scheduled_time))) ?? [];
  const taken = todayEvents.filter((e) => e.status === "taken").length;
  const missed = todayEvents.filter((e) => e.status === "missed").length;
  const pending = todayEvents.filter((e) => e.status === "pending").length;
  const total = todayEvents.length;
  const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

  if (devicesLoading) {
    return <div className="flex min-h-[100dvh] items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!devices?.length) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
          <Pill className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Welcome to MediStock</h1>
        <p className="text-center text-muted-foreground text-sm">Set up your first smart dispenser to get started.</p>
        <Button onClick={() => createDevice.mutate("My Dispenser")} disabled={createDevice.isPending} className="rounded-xl h-12 px-6">
          <Plus className="h-4 w-4 mr-2" /> Add Dispenser
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"} 👋</p>
          <h1 className="text-xl font-bold mt-0.5">{activeDevice?.name}</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 border">
          {activeDevice?.last_seen ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
              <span className="text-xs font-medium text-muted-foreground">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Today's Progress */}
      <div className="rounded-2xl bg-card p-4 border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Today's Progress</h2>
          <span className="text-xs text-muted-foreground">{format(new Date(), "MMM d")}</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Circle progress */}
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" className="stroke-muted/40" />
              <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={213.6} strokeDashoffset={213.6 - (adherence / 100) * 213.6}
                className="stroke-primary transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{adherence}%</span>
            </div>
          </div>
          {/* Stats */}
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                <span className="text-lg font-bold text-[hsl(var(--accent))]">{taken}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Taken</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Circle className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
                <span className="text-lg font-bold text-[hsl(var(--warning))]">{pending}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Pending</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <XCircle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-lg font-bold text-destructive">{missed}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Missed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pill Inventory */}
      <div className="rounded-2xl bg-card p-4 border">
        <h2 className="text-sm font-semibold mb-3">Pill Inventory</h2>
        <div className="flex justify-around">
          {compartments?.map((c) => (
            <PillRing key={c.id} current={c.current_count} capacity={c.capacity} label={`Slot ${c.index}`} medicationName={c.medication_name} />
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="rounded-2xl bg-card p-4 border">
        <h2 className="text-sm font-semibold mb-3">Upcoming Doses</h2>
        <div className="space-y-2">
          {schedules?.filter((s) => s.enabled).slice(0, 4).map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl bg-background p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{s.medication_name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.dosage}</p>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-lg text-xs font-semibold">{s.dose_time.slice(0, 5)}</Badge>
            </div>
          ))}
          {(!schedules || schedules.filter((s) => s.enabled).length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">No schedules yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
