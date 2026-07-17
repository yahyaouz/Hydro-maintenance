import * as React from "react";
import {
  BookOpen, Truck, Settings, Activity, CheckCircle2,
  AlertTriangle, Clock, ShieldAlert, ChevronRight, Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { DataLoadError } from "@/components/shared/DataLoadError";
import { PageBanner } from "@/components/ui/PageBanner";

export function ReferentielTechnique() {
  const { activeSite } = useAuthStore();
  const { data: engins, loading, error: enginsError } = useCollection<any>("engins");
  const hasLoadError = !!enginsError;
  const [selectedEnginId, setSelectedEnginId] = React.useState<string>("");

  // Filter engins by siteId
  const filteredEngins = React.useMemo(() => {
    if (!engins) return [];
    return engins.filter((e: any) => {
      if (activeSite === "TOUS") return true;
      return e.siteId === activeSite || e.site === activeSite;
    });
  }, [engins, activeSite]);

  // Handle default selection
  React.useEffect(() => {
    if (filteredEngins.length > 0 && !selectedEnginId) {
      setSelectedEnginId(filteredEngins[0].id);
    }
  }, [filteredEngins, selectedEnginId]);

  const selectedEngin = React.useMemo(() => {
    if (!selectedEnginId || !engins) return null;
    return engins.find((e: any) => e.id === selectedEnginId) || null;
  }, [selectedEnginId, engins]);

  const getStatutBadge = (statut: string) => {
    const s = String(statut || "actif").toLowerCase();
    switch (s) {
      case "actif":
      case "disponible":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "maintenance":
      case "en maintenance":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400";
      case "panne":
      case "en panne":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/20 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-6 bg-white min-h-screen text-slate-900 pb-12 border-2 border-amber-500 shadow-xl relative overflow-hidden p-6 rounded-2xl">
      {/* Ligne de haut style Hydromines (Mélange bleu ciel et rouge un peu foncé) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />

      {hasLoadError && <DataLoadError />}

      <PageBanner
        icon={BookOpen}
        badgeLabel="RÉFÉRENTIEL TECHNIQUE"
        title="Fiches Techniques"
        subtitle="Données constructeurs et caractéristiques officielles de la flotte"
        siteLabel={activeSite === "TOUS" ? "TOUS SITES" : activeSite}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Engins Selector (4 cols) */}
        <div className="relative overflow-hidden lg:col-span-4 bg-white border-2 border-amber-500 rounded-2xl p-5 shadow-md flex flex-col gap-4">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mt-1">
            <Truck className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
              Liste des équipements
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[550px] space-y-2 pr-1.5 scrollbar-thin">
            {loading ? (
              <div className="space-y-2 py-4">
                <div className="h-12 bg-slate-50 animate-pulse rounded-xl" />
                <div className="h-12 bg-slate-50 animate-pulse rounded-xl" />
                <div className="h-12 bg-slate-50 animate-pulse rounded-xl" />
              </div>
            ) : filteredEngins.length > 0 ? (
              filteredEngins.map((engin: any) => (
                <button
                  key={engin.id}
                  onClick={() => setSelectedEnginId(engin.id)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start justify-between gap-3 group",
                    selectedEnginId === engin.id
                      ? "border-amber-500 bg-amber-50/10 shadow-xs"
                      : "border-slate-50 hover:border-slate-200 bg-slate-50/30"
                  )}
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-black text-slate-800 tracking-wide uppercase">
                      {engin.matricule || engin.id}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <span>{engin.type || "Équipement"}</span>
                      <span>•</span>
                      <span className="uppercase text-amber-600 font-black">{engin.siteId || engin.site}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-center shrink-0">
                    <span className={cn("px-1.5 py-0.5 text-[8px] font-black tracking-wider uppercase rounded border", getStatutBadge(engin.statut))}>
                      {engin.statut}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                </button>
              ))
            ) : (
              <div className="py-12 text-center text-xs font-medium text-slate-400">
                Aucun équipement disponible pour ce site.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Technical Details (8 cols) */}
        <div className="relative overflow-hidden lg:col-span-8 bg-white border-2 border-amber-500 rounded-2xl p-6 shadow-md flex flex-col gap-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 mt-1">
            <BookOpen className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
              Caractéristiques techniques de l'équipement
            </h2>
          </div>

          {selectedEngin ? (
            <div className="space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border-2 border-slate-100 bg-slate-50/30">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">IDENTITÉ</span>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">
                    {selectedEngin.matricule || selectedEngin.id}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Modèle constructeur : {selectedEngin.type || "Non spécifié"} • {selectedEngin.marque || "Marque inconnue"} {selectedEngin.modele || ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg border shadow-xs", getStatutBadge(selectedEngin.statut))}>
                    {selectedEngin.statut}
                  </span>
                </div>
              </div>

              {/* Grid Data Sheets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                {/* Heures/Kilométrage */}
                <div className="p-4 border-2 border-slate-100 rounded-xl bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-wider">UTILISATION</span>
                  </div>
                  <p className="font-mono text-lg font-black text-slate-800">
                    {(selectedEngin.heuresMarche !== undefined && selectedEngin.heuresMarche !== null) ? `${selectedEngin.heuresMarche} Hrs` : selectedEngin.heures !== undefined ? `${selectedEngin.heures} Hrs` : selectedEngin.km !== undefined ? `${selectedEngin.km} Km` : "—"}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    Compteur cumulé réel
                  </p>
                </div>

                {/* Disponibilité */}
                <div className="p-4 border-2 border-slate-100 rounded-xl bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Gauge className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-wider">DISPONIBILITÉ</span>
                  </div>
                  <p className="font-mono text-lg font-black text-amber-600">
                    {selectedEngin.dispo !== undefined ? `${selectedEngin.dispo}%` : "—"}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    Taux de dispo cible
                  </p>
                </div>

                {/* Site */}
                <div className="p-4 border-2 border-slate-100 rounded-xl bg-white space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Activity className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-wider">AFFECTATION</span>
                  </div>
                  <p className="text-lg font-black text-slate-800 uppercase">
                    {selectedEngin.siteId || selectedEngin.site || "SMI"}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    Chantier d'exploitation
                  </p>
                </div>

              </div>

              {/* Technical Specifications Sheet */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Caractéristiques constructeurs d'usine
                </h4>
                
                {selectedEngin.specs ? (
                  <div className="relative overflow-hidden border-2 border-amber-500 rounded-2xl bg-white shadow-md pt-1.5">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b-2 border-slate-100">
                          <th className="p-3.5 font-black uppercase text-slate-600 tracking-wider">Composant</th>
                          <th className="p-3.5 font-black uppercase text-slate-600 tracking-wider">Donnée Technique</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedEngin.specs.godet && (
                          <tr>
                            <td className="p-3.5 font-bold text-slate-500 uppercase tracking-wide">Volume Godet</td>
                            <td className="p-3.5 font-mono font-bold text-slate-800">{selectedEngin.specs.godet}</td>
                          </tr>
                        )}
                        {selectedEngin.specs.reservoir && (
                          <tr>
                            <td className="p-3.5 font-bold text-slate-500 uppercase tracking-wide">Réservoir Carburant</td>
                            <td className="p-3.5 font-mono font-bold text-slate-800">{selectedEngin.specs.reservoir}</td>
                          </tr>
                        )}
                        {selectedEngin.specs.transmission && (
                          <tr>
                            <td className="p-3.5 font-bold text-slate-500 uppercase tracking-wide">Système Transmission</td>
                            <td className="p-3.5 font-mono font-bold text-slate-800">{selectedEngin.specs.transmission}</td>
                          </tr>
                        )}
                        {selectedEngin.specs.hauteur && (
                          <tr>
                            <td className="p-3.5 font-bold text-slate-500 uppercase tracking-wide">Hauteur d'engin</td>
                            <td className="p-3.5 font-mono font-bold text-slate-800">{selectedEngin.specs.hauteur}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/10 text-center text-xs font-medium text-slate-500">
                    Aucune spécification avancée d'usine enregistrée pour le modèle {selectedEngin.type || "standard"}.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/20 py-24">
              <BookOpen className="h-10 w-10 text-slate-350 mb-3 animate-pulse" />
              <p className="text-xs font-bold text-slate-500">
                Sélectionnez un équipement
              </p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                Cliquez sur l'un des équipements de la liste à gauche pour afficher son référentiel technique complet.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
