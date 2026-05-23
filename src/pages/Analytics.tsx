import { useMemo } from "react";
import { useDevices, useDoseEvents } from "@/hooks/useDevices";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { startOfWeek, addDays, format, parseISO, isSameDay } from "date-fns";
import { TrendingUp, Target, Calendar } from "lucide-react";

export default function Analytics() {
  const { data: devices } = useDevices();
  const deviceId = devices?.[0]?.id;
  const { data: doseEvents } = useDoseEvents(deviceId);

  const weekData = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(start, i);
      const dayEvents = doseEvents?.filter((e) => isSameDay(parseISO(e.scheduled_time), day)) ?? [];
      return {
        day: format(day, "EEE"),
        taken: dayEvents.filter((e) => e.status === "taken").length,
        missed: dayEvents.filter((e) => e.status === "missed").length,
      };
    });
  }, [doseEvents]);

  const totalTaken = doseEvents?.filter((e) => e.status === "taken").length ?? 0;
  const totalAll = doseEvents?.length ?? 0;
  const adherenceRate = totalAll > 0 ? Math.round((totalTaken / totalAll) * 100) : 0;
  const streak = 5; // Mock streak

  return (
    <div className="px-5 pt-6 pb-4 space-y-5">
      <h1 className="text-xl font-bold">Analytics</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card border p-3 text-center">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 mx-auto mb-2">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xl font-bold">{adherenceRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Adherence</p>
        </div>
        <div className="rounded-2xl bg-card border p-3 text-center">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[hsl(var(--accent))]/10 mx-auto mb-2">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--accent))]" />
          </div>
          <p className="text-xl font-bold">{totalTaken}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Doses Taken</p>
        </div>
        <div className="rounded-2xl bg-card border p-3 text-center">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-[hsl(var(--warning))]/10 mx-auto mb-2">
            <Calendar className="h-4 w-4 text-[hsl(var(--warning))]" />
          </div>
          <p className="text-xl font-bold">{streak}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Day Streak</p>
        </div>
      </div>

      {/* Compliance Ring */}
      <div className="rounded-2xl bg-card border p-5">
        <h2 className="text-sm font-semibold mb-4">Compliance Rate</h2>
        <div className="flex items-center justify-center">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted/30" />
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={264} strokeDashoffset={264 - (adherenceRate / 100) * 264}
                className="stroke-primary transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{adherenceRate}%</span>
              <span className="text-[10px] text-muted-foreground">overall</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="rounded-2xl bg-card border p-5">
        <h2 className="text-sm font-semibold mb-4">Weekly Overview</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekData} barGap={2}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis hide allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }}
            />
            <Bar dataKey="taken" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} name="Taken" />
            <Bar dataKey="missed" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} name="Missed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
