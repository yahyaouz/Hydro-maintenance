import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, QrCode, FileCheck, Package, DollarSign, Info, Shield } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface AssetIdentityProps {
  engine: any;
}

export function UnifiedAssetIdentity({ engine }: AssetIdentityProps) {
  // Mock asset spec records based on Caterpillar / Sandvik chassis reference
  const specs = React.useMemo(() => {
    switch (engine.model) {
      case "ST2D":
        return {
          serial: "CAT-LUX-2D-901B-XT",
          chassis: "Scooptram Standard II-D",
          transmission: "Hydrostatique intégrée Allison 3200",
          engineRef: "Deutz F3L2011 Souterrain standard",
          isoCat: "ISO 14224 Tier 3 (Excavation-H)",
          installDate: "2024-03-12",
        };
      case "ST2G":
        return {
          serial: "CAT-LUX-2G-404C-GL",
          chassis: "Scooptram Diesel High Performance II-G",
          transmission: "Dana Spicer C272 convertisseur",
          engineRef: "Cummins QSB4.5 Underground Purifié",
          isoCat: "ISO 14224 Tier 3 (Chargement-V)",
          installDate: "2023-01-18",
        };
      case "ST7":
        return {
          serial: "EPIROC-ST7-04A-SMI",
          chassis: "Scooptram Heavy Duty 6.8t Payload",
          transmission: "Spicer Off-Highway Serie 32000",
          engineRef: "Volvo Penta TAD850G High Torque Tier 4i",
          isoCat: "ISO 14224 Tier 1 (Haute Criticité)",
          installDate: "2022-11-05",
        };
      default:
        return {
          serial: "MONT-T23-H-019X",
          chassis: "Perforateur de front de taille",
          transmission: "Directe hydraulique double circuit",
          engineRef: "Montalbert Axiaux d'impact",
          isoCat: "ISO 14224 Tier 1 (Forage)",
          installDate: "2023-08-22",
        };
    }
  }, [engine.model]);

  // Simulated TCO PieChart data
  const tcoData = [
    { name: "Pièces de Rechange (CAD)", value: 16500, color: "#38bdf8" },
    { name: "Main d'œuvre Souterraine (CAD)", value: 2400, color: "#f59e0b" },
    { name: "Pertes de Tonnage / Arrêt (CAD)", value: engine.riskOfFailure * 350, color: "#ef4444" },
  ];

  const totalCost = tcoData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Core Equipment Passport & QR verification */}
      <Card className="bg-slate-950 border-slate-800 text-slate-100 flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5"><QrCode className="h-4 w-4 text-sky-400" /> Passeport Unique Industriel</span>
            <Badge variant="outline" className="text-[9px] font-mono font-bold bg-slate-900 border-slate-800 text-sky-400">{engine.id}</Badge>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Fiche d'identité certifiée conforme ISO 14224 et registre mine
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-slate-900/40 rounded-lg border border-slate-850">
            <div className="p-2.5 bg-sky-950 text-sky-400 rounded-lg border border-sky-900/40 flex-shrink-0">
              <QrCode className="h-10 w-10" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">ID Cryptographique Enregistré</span>
              <span className="text-xs font-mono font-black text-slate-200 block truncate leading-none">UUID_SEC_HEX_70444A</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3" /> Blockchain Ledger Sync
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex border-b border-slate-850 py-1.5 justify-between">
              <span className="text-slate-500">Châssis Industriel :</span>
              <span className="font-bold text-white">{specs.chassis}</span>
            </div>
            <div className="flex border-b border-slate-850 py-1.5 justify-between">
              <span className="text-slate-500">N° Série Mine :</span>
              <span className="font-mono font-black text-sky-400">{specs.serial}</span>
            </div>
            <div className="flex border-b border-slate-850 py-1.5 justify-between">
              <span className="text-slate-500">Motorisation :</span>
              <span className="font-bold text-slate-200">{specs.engineRef}</span>
            </div>
            <div className="flex border-b border-slate-850 py-1.5 justify-between">
              <span className="text-slate-500">Catégorie Criticité :</span>
              <span className="font-bold text-red-400">{specs.isoCat}</span>
            </div>
            <div className="flex py-1.5 justify-between">
              <span className="text-slate-500">Date d'installation :</span>
              <span className="font-mono text-slate-300">{specs.installDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Parts replacements & incidents history */}
      <Card className="bg-slate-950 border-slate-800 text-slate-100 flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
            <Package className="h-4 w-4 text-emerald-500" /> Pièces & Consommables Remplacés
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Grand livre des interventions et pièces d'usure montées sur chassis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            <div className="p-2.5 bg-slate-900 rounded border border-slate-850 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-bold text-slate-200">Joint d'arbre rotatif d'accouplement</span>
                <span className="text-[9px] bg-sky-950 text-sky-400 px-1 py-0.5 rounded font-mono">15-Fév</span>
              </div>
              <p className="text-[10px] text-slate-500">Monté par Saïd Maarouf (Qualifié Caterpillar L3). Remplacé préventivement.</p>
            </div>

            <div className="p-2.5 bg-slate-900 rounded border border-slate-850 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-bold text-slate-200">Valve d'impulsion de frein de secours</span>
                <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1 py-0.5 rounded font-mono">02-Jan</span>
              </div>
              <p className="text-[10px] text-slate-500">Composant critique L3 HSE. Après chute de pression signalée sur canbus.</p>
            </div>

            <div className="p-2.5 bg-slate-900 rounded border border-slate-850 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10.5px] font-bold text-slate-200">Filtre anti-particules DPM (Échappement)</span>
                <span className="text-[9px] bg-slate-800 text-slate-300 px-1 py-0.5 rounded font-mono">18-Nov</span>
              </div>
              <p className="text-[10px] text-slate-500">Entretien réglementaire pour galerie profonde bloc 4 souterrain.</p>
            </div>
          </div>

          <div className="p-3 bg-blue-950/20 rounded-lg text-blue-400 border border-blue-900/40 text-[11px] flex gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Toutes les pièces montées reçoivent automatiquement un audit RFID crypté pour prévenir l'usage de contrefaçons dans les galeries souterraines d'Hydromines.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. TCO & Cost breakdowns pie-chart */}
      <Card className="bg-slate-950 border-slate-800 text-slate-100 flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-amber-500" /> Structure TCO (Total Cost of Ownership)
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Répartition globale cumulée des investissements d'entretien et d'indisponibilité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[140px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tcoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {tcoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "11px", color: "white" }}
                  formatter={(val) => [`${val} CAD`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-[10.5px] font-mono">
            {tcoData.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-400">{entry.name.split(" ")[0]} :</span>
                </div>
                <span className="font-bold text-slate-100">{entry.value} CAD</span>
              </div>
            ))}
            <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-xs text-slate-300 font-bold">
              <span>Coût cumulé TCO estimé :</span>
              <span className="text-amber-500 text-sm font-black">{totalCost} CAD</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
