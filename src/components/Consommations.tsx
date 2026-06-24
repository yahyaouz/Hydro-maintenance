import * as React from "react";
import { 
  Fuel, 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  BarChart3,
  Calendar,
  History,
  Download,
  AlertTriangle,
  Info,
  Filter,
  Plus,
  ArrowUpRight,
  Cylinder
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageBanner } from "@/components/ui/PageBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

const fuelData = [
  { day: "01/05", consumption: 1200, avg: 145, siteId: "SMI" },
  { day: "02/05", consumption: 1150, avg: 142, siteId: "SMI" },
  { day: "03/05", consumption: 1400, avg: 155, siteId: "SMI" },
  { day: "04/05", consumption: 1080, avg: 138, siteId: "KOUDIA" },
  { day: "05/05", consumption: 1550, avg: 162, siteId: "SMI" },
  { day: "06/05", consumption: 1300, avg: 148, siteId: "KOUDIA" },
  { day: "07/05", consumption: 1250, avg: 144, siteId: "SMI" },
];

const anomalousEngins = [
  { engin: "M-045", avg: 22.5, target: 18.0, drift: "+25%", status: "critical", siteId: "SMI" },
  { engin: "S-012", avg: 19.8, target: 17.5, drift: "+13%", status: "warning", siteId: "SMI" },
  { engin: "P-001", avg: 24.2, target: 20.0, drift: "+21%", status: "critical", siteId: "KOUDIA" },
];

export function Consommations() {
  const { activeSite, user } = useAuthStore();
  
  const filteredFuelData = fuelData.filter(d => activeSite === "TOUS" || d.siteId === activeSite);
  const filteredAnomalies = anomalousEngins.filter(a => activeSite === "TOUS" || a.siteId === activeSite);
  
  const totalConsumption = filteredFuelData.reduce((acc, curr) => acc + curr.consumption, 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageBanner
        icon={Fuel}
        badgeLabel="Efficacité Énergétique & Fluides"
        title="Carburant & Huiles"
        subtitle="Gestion analytique des fluides de production, stocks volants et ravitaillement"
        siteLabel={activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
      >
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 border-slate-200 font-bold text-xs cursor-pointer">
            <Download className="mr-2 h-4 w-4" /> EXPORT CSV
          </Button>
          <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 shadow-md cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> SAISIE GAZOLINE
          </Button>
        </div>
      </PageBanner>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Consommation Totale</CardTitle>
            <Fuel className="h-4 w-4 text-hydro" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-black text-slate-900">{totalConsumption.toLocaleString()} <span className="text-xs text-slate-400">L</span></div>
             <p className="text-[10px] text-muted-foreground font-medium italic mt-1">+4.5% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Moyenne L/H</CardTitle>
            <BarChart3 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-black text-slate-900">148.2 <span className="text-xs text-slate-400">L/H</span></div>
             <p className="text-[10px] text-hydro font-bold uppercase tracking-tight mt-1">Cible : 145 L/H</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm border-l-4 border-l-red-500">
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-slate-500">Alertes Surconso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-black text-red-600">{filteredAnomalies.length}</div>
             <p className="text-[10px] text-muted-foreground font-medium italic mt-1">Engins en dérive critique</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-bold uppercase text-slate-400">Citerne Mobile</CardTitle>
            <Cylinder className="h-4 w-4 text-hydro" />
          </CardHeader>
          <CardContent>
             <div className="flex justify-between items-end mb-2">
                <div className="text-2xl font-black">12,400 <span className="text-xs text-slate-400">L</span></div>
                <div className="text-[10px] font-bold text-hydro">62% Restant</div>
             </div>
             <Progress value={62} className="h-1.5 bg-slate-800" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
         <Card className="lg:col-span-4 border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-900">Historique Journalier</CardTitle>
                  <CardDescription className="text-xs italic">Données synchronisées de la citerne mobile</CardDescription>
               </div>
               <Badge variant="outline" className="text-[10px] font-bold">30 DERNIERS JOURS</Badge>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredFuelData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                       dataKey="day" 
                       fontSize={10} 
                       tickLine={false} 
                       axisLine={false} 
                       tick={{ fill: '#94a3b8', fontWeight: 600 }}
                     />
                     <YAxis 
                       fontSize={10} 
                       tickLine={false} 
                       axisLine={false} 
                       tick={{ fill: '#94a3b8', fontWeight: 600 }}
                     />
                     <Tooltip 
                       cursor={{ fill: '#f8fafc' }}
                       contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     />
                     <Bar dataKey="consumption" radius={[6, 6, 0, 0]}>
                        {filteredFuelData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.consumption > 1300 ? '#ef4444' : '#4A90D9'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>
         
         <Card className="lg:col-span-3 border-slate-200 shadow-sm">
            <CardHeader>
               <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-900">Suivi des Huiles (Appoints)</CardTitle>
               <CardDescription className="text-xs italic">Consommation par type de fluide ce mois</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-6">
                  {[
                    { label: "Huile Moteur 15W40", value: 450, total: 2000, trend: "+2%", status: "ok" },
                    { label: "Huile Hydraulique ISO 46", value: 1200, total: 2000, trend: "+15%", status: "warning" },
                    { label: "Graisse EP2 (Cartouches)", value: 12, total: 50, trend: "-5%", status: "ok" },
                    { label: "Liquide de Refroidissement", value: 85, total: 500, trend: "0%", status: "ok" },
                  ].map(oil => (
                    <div key={oil.label} className="space-y-2">
                       <div className="flex justify-between items-end">
                          <div className="space-y-0.5">
                             <span className="text-[11px] font-black uppercase text-slate-700">{oil.label}</span>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground font-mono">{oil.value} / {oil.total} L</span>
                                <Badge variant="secondary" className="text-[8px] py-0 px-1 font-bold">{oil.trend}</Badge>
                             </div>
                          </div>
                          <span className={cn(
                             "text-xs font-black italic",
                             oil.status === 'warning' ? "text-amber-600" : "text-emerald-600"
                          )}>{Math.round((oil.value / oil.total) * 100)}%</span>
                       </div>
                       <Progress 
                         value={(oil.value / oil.total) * 100} 
                         className="h-1.5 bg-slate-100" 
                         // Note: In standard shadcn/ui progress doesn't support custom indicator classes easily via props, 
                         // but we can wrap or use utility if available. Here we assume standard.
                       />
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
               <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-900">Anomalies de Consommation</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                  {filteredAnomalies.map((anom, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className={cn(
                             "h-10 w-10 rounded-xl flex items-center justify-center",
                             anom.status === 'critical' ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
                          )}>
                             <TrendingUp className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900">{anom.engin}</p>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <span>RÉEL: {anom.avg} L/H</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span>CIBLE: {anom.target} L/H</span>
                             </div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className={cn(
                             "text-sm font-black italic",
                             anom.status === 'critical' ? "text-red-600" : "text-amber-600"
                          )}>{anom.drift}</div>
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-hydro p-0 hover:bg-transparent">DÉTAILS</Button>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
               <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-900">Dernières Opérations</CardTitle>
                  <History className="h-4 w-4 text-slate-400" />
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-50">
                  {[
                    { engin: "M-045", qte: 450, date: "18/05 08:30", type: "Gazole", agent: "Diallo S." },
                    { engin: "S-012", qte: 820, date: "18/05 06:15", type: "Gazole", agent: "Diallo S." },
                    { engin: "M-045", qte: 15, date: "17/05 18:45", type: "Huile Hyd", agent: "Traoré M." },
                    { engin: "P-002", qte: 580, date: "17/05 14:20", type: "Gazole", agent: "Diallo S." },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                             <Fuel className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="font-bold text-slate-800">{r.engin} <span className="text-[10px] font-normal text-slate-400 mx-2">by {r.agent}</span></p>
                             <p className="text-[10px] font-bold text-hydro uppercase tracking-widest">{r.type}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-900 italic">{r.qte} <span className="text-xs text-slate-400">L</span></p>
                          <p className="text-[10px] font-mono text-muted-foreground">{r.date}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
