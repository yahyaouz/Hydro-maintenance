import * as React from "react";
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2,
  Filter,
  MoreVertical,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageBanner } from "@/components/ui/PageBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Alerte {
  id: string;
  title: string;
  description: string;
  type: "maintenance" | "panne" | "conso" | "ia";
  severity: "critique" | "moyenne" | "info";
  time: string;
  read: boolean;
}

const alertesData: Alerte[] = [
  { id: "1", title: "Maintenance Critique", description: "L'engin M-045 dépasse l'échéance de vidange de 12h.", type: "maintenance", severity: "critique", time: "Il y a 10 min", read: false },
  { id: "2", title: "Surconsommation détectée", description: "L'IA a détecté une hausse de 8% de L/H sur le site Sud.", type: "conso", severity: "moyenne", time: "Il y a 2h", read: false },
  { id: "3", title: "Panne résolue", description: "La réparation de PAN-2026-0001 est terminée.", type: "panne", severity: "info", time: "Il y a 5h", read: true },
];

export function AlertesModule() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-fade-in">
      <PageBanner
        icon={Bell}
        badgeLabel="Sécurité de l'Exploitation"
        title="Centre d'Alertes"
        subtitle="Notifications en temps réel et anomalies système critiques"
      >
        <Button variant="outline" size="sm" className="cursor-pointer">Tout marquer comme lu</Button>
      </PageBanner>

      <div className="space-y-2">
        {alertesData.map((a) => (
          <Card key={a.id} className={cn(
            "transition-all border-l-4",
            !a.read ? "bg-accent/5 shadow-md" : "opacity-70",
            a.severity === 'critique' ? "border-l-critical-red" : 
            a.severity === 'moyenne' ? "border-l-alert-orange" : "border-l-ok-green"
          )}>
            <div className="p-4 flex gap-4 items-start">
               <div className={cn(
                 "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                 a.severity === 'critique' ? "bg-critical-red/10 text-critical-red" : 
                 a.severity === 'moyenne' ? "bg-alert-orange/10 text-alert-orange" : "bg-ok-green/10 text-ok-green"
               )}>
                  {a.severity === 'critique' ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn("font-bold truncate", !a.read ? "text-foreground" : "text-muted-foreground text-sm")}>
                      {a.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                       <Clock className="h-3 w-3" /> {a.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                  <div className="flex gap-2 mt-3">
                     <Badge variant="outline" className="text-[10px] capitalize font-bold">{a.type}</Badge>
                     <Button variant="link" className="h-auto p-0 text-[10px] text-hydro font-bold">Voir détails</Button>
                  </div>
               </div>
               <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Marquer comme lu</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
