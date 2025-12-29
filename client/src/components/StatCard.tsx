import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, color = "text-primary", className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-card p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4",
      className
    )}>
      <div className={cn("p-3 rounded-xl bg-background border border-border/50 shadow-inner", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs mb-0.5">{label}</p>
        <p className="text-2xl font-bold font-display tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  );
}
