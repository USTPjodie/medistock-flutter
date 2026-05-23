import { useDevices, useFamilyMembers } from "@/hooks/useDevices";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Bell, Eye } from "lucide-react";

export default function Family() {
  const { data: devices } = useDevices();
  const deviceId = devices?.[0]?.id;
  const { data: members, isLoading } = useFamilyMembers(deviceId);

  return (
    <div className="px-5 pt-6 pb-4 space-y-5">
      <h1 className="text-xl font-bold">Family Members</h1>

      {isLoading && <div className="flex justify-center py-12"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" /></div>}

      {(!members || members.length === 0) && !isLoading && (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm">No family members yet</p>
          <p className="text-xs mt-1">Invite members to share access</p>
        </div>
      )}

      <div className="space-y-2">
        {members?.map((m) => {
          const name = m.profiles?.full_name ?? "Unknown";
          const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase();
          return (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-card border p-4">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-[11px] text-muted-foreground">{m.profiles?.phone ?? ""}</p>
              </div>
              <div className="flex gap-1.5">
                {m.can_view_dashboard && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                {m.can_receive_notifications && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                    <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
