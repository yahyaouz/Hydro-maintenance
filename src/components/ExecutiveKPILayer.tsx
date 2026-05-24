import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, Coins, ShieldAlert, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ExecutiveProps {
  engines: any[];
}

export function ExecutiveKPILayer({ engines }: ExecutiveProps) {
  // Compute aggregate executive figures
  const totalDowntimeHours = engines.reduce((acc, curr) => acc + (curr.unplannedDowntime || 0), 0);
  const averageAvailability = React.useMemo(() => {
    const sum = engines.reduce((acc, curr) => acc + (curr.healthScore || 0), 0);
    return engines.length > 0 ? Math.round(sum / engines.length) : 85;
  }, [engines]);

  const productionLostUsd = Math.round(totalDowntimeHours * 850); // $850 USD lost per hour of halt across fleet

  // Sites benchmark database for charts
  const siteBenchmarkData = [
    { name: "SMI", costPerTon: 3.45, availability: 88, riskPct: 15 },
    { name: "OUMEJRANE", costPerTon: 4.85, availability: 72, riskPct: 38 },
    { name: "KOUDIA", costPerTon: 3.92, availability: 81, riskPct: 22 },
    { name: "BOU-AZZER", costPerTon: 4.25, availability: 79, riskPct: 28 },
    { name: "OUANSIMI", costPerTon: 3.10, availability: 91, riskPct: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Senior Executive Strategic KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Cost per Ton */}
        <Card className="bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl border-l-4 border-l-amber-500 hover:shadow-2xl hover:scale-[1.01] transition-all duration-200">
          <CardContent className="pt-4 pb-3">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Coût Maintenance / Tonne</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-500">3.86 $</span>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-300">/ Tonne d'or</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">Cible COMEX : &lt; 4.00 $. Conforme.</p>
          </CardContent>
        </Card>

        {/* Global availability */}
        <Card className="bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl border-l-4 border-l-sky-500 hover:shadow-2xl hover:scale-[1.01] transition-all duration-200">
          <CardContent className="pt-4 pb-3">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Disponibilité Physique Globale</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black font-mono text-sky-600 dark:text-sky-450">{averageAvailability}%</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">▲ +1.5%</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-2">Moyenne flotte (Objectif contractualisé : 85%)</p>
          </CardContent>
        </Card>

        {/* Output Losses */}
        <Card className="bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl border-l-4 border-l-red-500 hover:shadow-2xl hover:scale-[1.01] transition-all duration-200">
          <CardContent className="pt-4 pb-3">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Manque à Gagner Production</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black font-mono text-red-650 dark:text-red-500">{productionLostUsd.toLocaleString("fr-FR")} $</span>
              <span className="text-xs text-slate-500 dark:text-slate-450 font-mono">USD</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-2">Pertes par pannes non programmées sous-sol</p>
          </CardContent>
        </Card>

        {/* Maintenance Efficiency */}
        <Card className="bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl border-l-4 border-l-emerald-500 hover:shadow-2xl hover:scale-[1.01] transition-all duration-200">
          <CardContent className="pt-4 pb-3">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Efficacité Planification (OME)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">85.5%</span>
              <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border-none font-mono text-[9px] hover:bg-emerald-100 dark:hover:bg-emerald-950">OPTIMAL</Badge>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-2">Proportion d'interventions préventives vs curatives</p>
          </CardContent>
        </Card>

        {/* Operational risk rate */}
        <Card className="bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl border-l-4 border-l-indigo-500 hover:shadow-2xl hover:scale-[1.01] transition-all duration-200">
          <CardContent className="pt-4 pb-3">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Indice de Risque Opérationnel</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">Low-Moderate</span>
              <ShieldAlert className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-455 mt-2">Mesuré sur conformité LOTO & Gaz souterrain</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Analytical Comparison Chart for COMEX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 lg:col-span-2">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-amber-500" /> Benchmark de Performance d'Exploitation Inter-Sites
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Disponibilité physique vs Coût d'entretien par tonne extraite comparés par mine
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={siteBenchmarkData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis yAxisId="left" orientation="left" stroke="#0284c7" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <YAxis yAxisId="right" orientation="right" stroke="#d97706" fontSize={10} tickFormatter={(v) => `${v}$`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px", fontFamily: "monospace" }}
                  itemStyle={{ fontSize: "11px", color: "#fff" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                <Bar yAxisId="left" dataKey="availability" name="Disponibilité (%)" fill="#0284c7" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar yAxisId="right" dataKey="costPerTon" name="Coût par Tonne ($)" fill="#d97706" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Site audit logs and COMEX takeaways */}
        <Card className="bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 lg:col-span-1 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">Synthese Directoire COMEX</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/45 rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold uppercase">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Rapport Vigilance OUMEJRANE :</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Le site d'OUMEJRANE montre un décalage de performance avec un coût par tonne culminant à <span className="font-bold">4.85 $</span> et une disponibilité globale basse de <span className="font-bold">72%</span>.
              </p>
              <p className="text-[10px] text-slate-600 dark:text-slate-500 leading-relaxed">
                Recommandation prioritaire : Redéployer deux spécialistes hydrauliques Caterpillar L3 de SMI vers Oumejrane pour optimiser le MTTR d'urgence.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/45 rounded-lg text-xs space-y-1">
              <span className="font-bold uppercase block">Félicitations opérationnelles :</span>
              <p className="leading-relaxed text-[11px]">
                Le site d'OUANSIMI surclasse les prévisions avec un coût de <span className="font-bold">3.10 $/tonne</span> et une disponibilité de <span className="font-bold">91%</span> grâce à l'application préventive stricte de la maintenance opportuniste d'Hydromines.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
