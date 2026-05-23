import { Link, useLocation } from "react-router-dom";
import { Home, BarChart3, Calendar, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/analytics", icon: BarChart3, label: "Stats" },
  { to: "/schedule", icon: Calendar, label: "Schedule" },
  { to: "/notifications", icon: Bell, label: "Alerts" },
  { to: "/settings", icon: Settings, label: "Profile" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all",
                active
                  ? "text-primary"
                  : "text-muted-foreground active:scale-95"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl transition-all",
                active && "bg-primary/10"
              )}>
                <Icon className={cn("h-[22px] w-[22px]", active && "stroke-[2.5]")} />
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
