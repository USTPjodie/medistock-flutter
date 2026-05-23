import { useNotifications, useMarkNotificationRead } from "@/hooks/useDevices";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Package, Cpu, ShieldAlert } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const typeConfig = {
  missed_dose: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
  low_stock: { icon: Package, color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning))]/10" },
  system: { icon: Cpu, color: "text-muted-foreground", bg: "bg-muted" },
  high_risk: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="px-5 pt-6 pb-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Notifications</h1>
        {unread > 0 && <Badge variant="destructive" className="rounded-full px-2.5 text-[10px]">{unread}</Badge>}
      </div>

      {isLoading && <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>}

      {notifications?.length === 0 && !isLoading && (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm">All caught up!</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications?.map((n) => {
          const config = typeConfig[n.type as keyof typeof typeConfig] ?? typeConfig.system;
          const Icon = config.icon;
          return (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-3 rounded-2xl bg-card border p-4 transition-all active:scale-[0.98]",
                !n.read && "border-primary/20 bg-primary/[0.03]"
              )}
              onClick={() => !n.read && markRead.mutate(n.id)}
            >
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl shrink-0 mt-0.5", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
