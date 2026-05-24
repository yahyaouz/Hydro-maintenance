import * as React from "react";
import { 
  Disc, 
  RotateCw, 
  Settings2, 
  TrendingDown, 
  ArrowRightLeft,
  Search,
  Plus,
  AlertTriangle,
  Info,
  Thermometer,
  Gauge,
  Calendar,
  History,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Pneu {
  id: string;
  marque: string;
  dimension: string;
  position: string;
  engin: string;
  usure: number;
  dateMontage: string;
  etat: "neuf" | "bon" | "usé" | "critique";
  pression: number; // in bars
  temp: number; // in Celsius
  tkph: number;
  siteId: string;
}

const pneusData: Pneu[] = [
  { id: "1", marque: "Michelin XDR3", dimension: "17.5R25", position: "AV G", engin: "M-045", usure: 45, dateMontage: "2026-01-12", etat: "bon", pression: 8.2, temp: 42, tkph: 125, siteId: "SMI" },
  { id: "2", marque: "Bridgestone V-Steel", dimension: "17.5R25", position: "AV D", engin: "M-045", usure: 82, dateMontage: "2025-11-05", etat: "critique", pression: 7.8, temp: 58, tkph: 142, siteId: "SMI" },
  { id: "3", marque: "Goodyear RT-4A", dimension: "26.5R25", position: "AR G", engin: "S-012", usure: 15, dateMontage: "2026-04-20", etat: "neuf", pression: 9.0, temp: 35, tkph: 98, siteId: "SMI" },
  { id: "4", marque: "Michelin X-Quarry", dimension: "24.00R35", position: "AR D", engin: "P-002", usure: 60, dateMontage: "2025-08-15", etat: "usé", pression: 8.5, temp: 48, tkph: 110, siteId: "KOUDIA" },
];

export function Pneumatiques() {
  const { activeSite, user } = useAuthStore();
  const filteredPneus = pneusData.filter(p => activeSite === "TOUS" || p.siteId === activeSite);

  const canEdit = user?.role === "ADMIN" || user?.role === "RESPONSABLE_MAINTENANCE" || user?.role === "MECANICIEN";

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-slate-50/30">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight uppercase italic text-slate-900">Gestion Pneumatiques</h2>
          <p className="text-muted-foreground text-sm">Suivi thermique, pressions et calcul TKPH</p>
        </div>
        {canEdit && (
          <Button className="bg-hydro shadow-lg shadow-hydro/20 font-bold h-10">
            <Plus className="mr-2 h-4 w-4" /> ENREGISTRER UN PNEU
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="py-4">
             <CardTitle className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <Disc className="h-3 w-3 text-hydro" /> Pneus Actifs
             </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">172</div>
            <p className="text-[10px] text-muted-foreground font-medium italic mt-1">Sur l'ensemble du parc</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="py-4">
             <CardTitle className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-red-500" /> Alertes Usure
             </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-600">14</div>
            <p className="text-[10px] text-muted-foreground font-medium italic mt-1">Pneus à remplacer d'urgence</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="py-4">
             <CardTitle className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <Thermometer className="h-3 w-3 text-amber-500" /> Surchauffe
             </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">3</div>
            <p className="text-[10px] text-muted-foreground font-medium italic mt-1">Dépassement seuils critiques</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="py-4">
             <CardTitle className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <TrendingDown className="h-3 w-3 text-hydro" /> Coût / Heure
             </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">1,450 <span className="text-xs">CFA/H</span></div>
            <p className="text-[10px] text-muted-foreground font-medium italic mt-1">-2% ce trimestre</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
         <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Rechercher engin ou marque..." className="pl-9 h-10 border-slate-200" />
         </div>
         <Button variant="outline" className="h-10 border-slate-200 font-bold text-xs"><RotateCw className="mr-2 h-4 w-4" /> ROTATION</Button>
         <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 ml-auto">
            <Filter className="h-4 w-4 text-slate-500" />
         </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <TooltipProvider>
            {filteredPneus.map((pneu) => (
              <Card key={pneu.id} className={cn(
                "overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all group",
                pneu.etat === 'critique' && "ring-1 ring-red-500"
              )}>
                 <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                       <div className="flex gap-4">
                          <div className={cn(
                             "h-14 w-14 rounded-2xl flex items-center justify-center border-2 border-dashed transition-colors",
                             pneu.etat === 'critique' ? "bg-red-50 text-red-500 border-red-200" : "bg-slate-50 text-slate-300 group-hover:bg-hydro/5 group-hover:text-hydro group-hover:border-hydro/20"
                          )}>
                             <Disc className="h-8 w-8 rotate-12 transition-transform group-hover:rotate-45" />
                          </div>
                          <div>
                             <div className="flex items-center gap-2">
                                <h4 className="font-black text-lg text-slate-900 tracking-tighter italic">{pneu.engin} • {pneu.position}</h4>
                                <Badge variant="outline" className={cn(
                                   "text-[9px] font-bold uppercase py-0 px-1",
                                   pneu.etat === 'critique' ? "text-red-600 border-red-100 bg-red-50" : 
                                   pneu.etat === 'neuf' ? "text-emerald-600 border-emerald-100 bg-emerald-50" : "text-slate-500 border-slate-100"
                                )}>
                                   {pneu.etat}
                                </Badge>
                             </div>
                             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{pneu.marque} {pneu.dimension}</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                       <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1 mb-1">
                             <Gauge className="h-3 w-3 text-slate-400" />
                             <span className="text-[10px] font-bold text-slate-500">PRESSION</span>
                          </div>
                          <p className={cn(
                             "text-sm font-black italic",
                             pneu.pression < 8 ? "text-amber-600" : "text-slate-700"
                          )}>{pneu.pression} bar</p>
                       </div>
                       <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1 mb-1">
                             <Thermometer className="h-3 w-3 text-slate-400" />
                             <span className="text-[10px] font-bold text-slate-500">TEMP</span>
                          </div>
                          <p className={cn(
                             "text-sm font-black italic",
                             pneu.temp > 55 ? "text-red-600" : "text-slate-700"
                          )}>{pneu.temp}°C</p>
                       </div>
                       <div className="p-2 bg-slate-900 rounded-xl text-white">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-[9px] font-bold text-slate-500">TKPH</span>
                             <Tooltip>
                                <TooltipTrigger
                                   render={<Info className="h-2.5 w-2.5 text-slate-500 cursor-help" />}
                                />
                                <TooltipContent className="text-[10px] p-2 max-w-[200px]">
                                   Calcul de la charge thermique par heure (Tons Kilometers Per Hour). Seuil critique constructeur : 150 TKPH.
                                </TooltipContent>
                             </Tooltip>
                          </div>
                          <p className={cn(
                             "text-sm font-black italic",
                             pneu.tkph > 140 ? "text-amber-400" : "text-white"
                          )}>{pneu.tkph}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-1.5">
                       <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-slate-400">Usure relative</span>
                          <span className={cn(
                             pneu.usure > 80 ? "text-red-600 font-black animate-pulse" : "text-slate-700"
                          )}>{pneu.usure}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-700 ease-out",
                              pneu.usure > 80 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : 
                              pneu.usure > 50 ? "bg-amber-500" : "bg-emerald-500"
                            )} 
                            style={{ width: `${pneu.usure}%` }} 
                          />
                       </div>
                    </div>

                    <div className="pt-3 flex justify-between items-center text-[10px] text-muted-foreground border-t border-slate-100">
                       <div className="flex items-center gap-1 font-medium">
                          <Calendar className="h-3 w-3" /> {pneu.dateMontage}
                       </div>
                       <Button variant="ghost" size="sm" className="h-7 text-hydro font-bold text-[10px] hover:bg-hydro/5">
                          <History className="h-3 w-3 mr-1" /> ANALYSE USURE
                       </Button>
                    </div>
                 </div>
              </Card>
            ))}
         </TooltipProvider>

         {filteredPneus.length === 0 && (
           <div className="col-span-full p-20 text-center text-slate-400 italic text-sm">
              Aucun pneumatique répertorié pour ce site.
           </div>
         )}
      </div>

      <Card className="border-slate-200 bg-slate-50/50 border-dashed">
         <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
               <Info className="h-4 w-4 text-hydro" /> Intégrité Opérationnelle
            </CardTitle>
         </CardHeader>
         <CardContent className="text-[11px] text-slate-500 leading-relaxed font-medium italic">
            <p>Le calcul du **TKPH** est mis à jour en temps réel selon les cycles de production saisis. Un TKPH supérieur à 150 entraîne une alerte automatique de ralentissement de l'engin pour préserver la structure interne du pneu.</p>
            <p className="mt-2">⚠️ <span className="font-bold text-slate-700 uppercase">Attention :</span> Les pressions affichées proviennent des capteurs TPMS (si équipés) ou de la dernière vérification manuelle hebdomadaire.</p>
         </CardContent>
      </Card>
    </div>
  );
}
