import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useDevices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LogOut, ChevronRight, User, Smartphone, Bell, Shield, HelpCircle, Pill } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);

  const startEditing = () => {
    setFullName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
    setEditing(true);
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({ full_name: fullName, phone });
    toast.success("Profile updated");
    setEditing(false);
  };

  const initials = profile?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "U";

  return (
    <div className="px-5 pt-6 pb-4 space-y-5">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Profile Card */}
      <div className="rounded-2xl bg-card border p-5 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-base">{profile?.full_name ?? "User"}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Profile Edit */}
      {editing ? (
        <div className="rounded-2xl bg-card border p-4 space-y-4">
          <h2 className="text-sm font-semibold">Edit Profile</h2>
          <div className="space-y-2">
            <Label className="text-xs">Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={updateProfile.isPending} className="flex-1 h-11 rounded-xl">Save</Button>
            <Button variant="outline" onClick={() => setEditing(false)} className="flex-1 h-11 rounded-xl">Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border overflow-hidden">
          {[
            { label: "Edit Profile", icon: User, action: startEditing },
            { label: "Family Members", icon: Shield, to: "/family" },
            { label: "Notifications", icon: Bell, to: "/notifications" },
            { label: "Devices", icon: Smartphone },
            { label: "Help & Support", icon: HelpCircle },
          ].map((item, i) => (
            <div key={item.label}>
              {i > 0 && <Separator />}
              {item.to ? (
                <Link to={item.to} className="flex items-center justify-between p-4 active:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ) : (
                <button onClick={item.action} className="flex items-center justify-between p-4 w-full active:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* About */}
      <div className="rounded-2xl bg-card border p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Pill className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">MediStock</p>
          <p className="text-[11px] text-muted-foreground">Smart Medicine Dispenser · v1.0.0</p>
        </div>
      </div>

      <Button variant="outline" className="w-full h-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5" onClick={signOut}>
        <LogOut className="h-4 w-4 mr-2" /> Sign Out
      </Button>
    </div>
  );
}
