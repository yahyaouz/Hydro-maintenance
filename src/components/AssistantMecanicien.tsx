import * as React from "react";
import { 
  Wrench, Search, AlertTriangle, CheckCircle2, 
  ArrowRight, Clock, BookOpen, ChevronRight, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PageBanner } from "@/components/ui/PageBanner";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { SignalerPanne } from "./SignalerPanne";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SymptomeEntry {
  symptome: string;
  causesProbables: string[];
  gravite: "CRITIQUE" | "MAJEUR" | "AVERTISSEMENT";
  actionImmediate: string;
}

const SYMPTOMES_DB: SymptomeEntry[] = [
  { symptome: "Vibration moteur au ralenti", causesProbables: ["Support moteur usé ou desserré", "Injecteur encrassé / défectueux", "Déséquilibre du volant moteur"], gravite: "MAJEUR", actionImmediate: "Vérifier l'état et le serrage des supports moteur, faire un contrôle d'injection au prochain arrêt." },
  { symptome: "Fuite hydraulique sous cabine", causesProbables: ["Flexible de puissance usé ou frotté", "Raccord rapide desserré", "Joint de distributeur défectueux"], gravite: "CRITIQUE", actionImmediate: "Arrêter immédiatement l'engin, consigner l'énergie résiduelle et sécuriser la zone." },
  { symptome: "Frein SAHR non répondant", causesProbables: ["Chute de pression de pilotage hydraulique", "Disques de frein collés ou usés", "Fuite interne du récepteur de frein"], gravite: "CRITIQUE", actionImmediate: "Ne pas déplacer l'engin, poser l'équipement au sol, caler les roues et isoler le système." },
  { symptome: "Transmission qui patine", causesProbables: ["Pression d'embrayage trop basse", "Disques de friction usés", "Niveau ou qualité d'huile de boîte dégradés"], gravite: "MAJEUR", actionImmediate: "Vérifier le niveau d'huile de transmission à chaud et mesurer la pression de pilotage." },
  { symptome: "Batterie qui se décharge", causesProbables: ["Alternateur défectueux (tension < 24V)", "Courroie d'alternateur lâche ou cassée", "Courant de fuite permanent sur l'équipement"], gravite: "AVERTISSEMENT", actionImmediate: "Mesurer la tension de charge alternateur (doit être > 26.5V) et vérifier la courroie." },
  { symptome: "Vérin de levage lent", causesProbables: ["Pompe hydraulique principale usée", "Niveau d'huile hydraulique bas", "Fuite interne sur les joints de piston"], gravite: "MAJEUR", actionImmediate: "Vérifier le niveau d'huile dans le réservoir et inspecter l'aspiration de la pompe." },
  { symptome: "Pompe hydraulique bruyante", causesProbables: ["Cavitation due à une prise d'air à l'aspiration", "Filtre d'aspiration colmaté", "Usure interne excessive"], gravite: "CRITIQUE", actionImmediate: "Arrêter l'engin, inspecter l'étanchéité de la ligne d'aspiration et nettoyer le filtre." },
  { symptome: "Fuite d'air comprimé", causesProbables: ["Raccord rapide usé", "Flexible pneumatique percé ou pincé", "Joint de compresseur endommagé"], gravite: "AVERTISSEMENT", actionImmediate: "Localiser la fuite avec de l'eau savonneuse et remplacer l'élément défectueux." },
  { symptome: "Surchauffe moteur", causesProbables: ["Manque de liquide de refroidissement", "Radiateur obstrué par des poussières/boue", "Thermostat bloqué en position fermée"], gravite: "CRITIQUE", actionImmediate: "Laisser tourner le moteur au ralenti pour refroidir, ne jamais ouvrir le bouchon à chaud." },
  { symptome: "Démarreur qui tourne dans le vide", causesProbables: ["Solénoïde défectueux", "Couronne de volant moteur usée", "Lanceur grippé ou encrassé"], gravite: "MAJEUR", actionImmediate: "Contrôler la tension d'excitation du solénoïde et inspecter l'état visuel du pignon." },
  { symptome: "Convertisseur qui chauffe", causesProbables: ["Niveau d'huile incorrect", "Surcharge prolongée en rampe", "Refroidisseur d'huile bouché ou encrassé"], gravite: "MAJEUR", actionImmediate: "Repasser au neutre au ralenti pour évacuer les calories, nettoyer l'échangeur thermique." },
  { symptome: "Embrayage qui patine", causesProbables: ["Garde d'embrayage nulle ou insuffisante", "Garnitures de disque usées", "Présence d'huile sur les garnitures"], gravite: "MAJEUR", actionImmediate: "Régler la garde de la pédale d'embrayage et inspecter l'étanchéité du carter." },
  { symptome: "Filtre à air encrassé", causesProbables: ["Milieu de travail très poussiéreux", "Indicateur de colmatage actif", "Préfiltre cyclonique obstrué"], gravite: "AVERTISSEMENT", actionImmediate: "Souffler la cartouche principale de l'intérieur vers l'extérieur (max 2 bars) ou la remplacer." },
  { symptome: "Injection qui fume noir", causesProbables: ["Filtre à air colmaté", "Injecteur grippé ouvert ou qui goutte", "Surcharge moteur prolongée"], gravite: "MAJEUR", actionImmediate: "Contrôler le circuit d'admission d'air puis planifier le remplacement de l'injecteur défaillant." },
  { symptome: "Pneu avant éclaté", causesProbables: ["Coupure par roche tranchante en galerie", "Pression de gonflage inadaptée", "Surcharge sur l'essieu avant"], gravite: "CRITIQUE", actionImmediate: "Sécuriser la zone de travail, baliser l'engin et appeler l'équipe de service pneumatique." },
  { symptome: "Éclairage cabine défectueux", causesProbables: ["Fusible correspondant grillé", "Ampoule ou LED HS", "Faisceau électrique coupé ou oxydé"], gravite: "AVERTISSEMENT", actionImmediate: "Remplacer le fusible dans le coffret électrique cabine et tester les lignes." },
  { symptome: "Klaxon inopérant", causesProbables: ["Fusible grillé", "Avertisseur sonore HS", "Contacteur au volant défectueux"], gravite: "AVERTISSEMENT", actionImmediate: "Contrôler le fusible dédié et tester l'alimentation 24V directement sur les bornes du klaxon." },
  { symptome: "Vitesse qui ne passe pas", causesProbables: ["Câble de commande de boîte grippé", "Synchro usé ou cassé", "Pression d'huile de sélection insuffisante"], gravite: "MAJEUR", actionImmediate: "Graisser la tringlerie de commande et vérifier le niveau d'huile hydraulique de boîte." },
  { symptome: "Huile moteur qui baisse", causesProbables: ["Segmentation ou guides de soupape usés", "Joint de carter d'huile fuyant", "Fuite d'huile par le turbo"], gravite: "MAJEUR", actionImmediate: "Faire l'appoint d'huile quotidiennement, surveiller la fumée d'échappement et planifier le garage." },
  { symptome: "Niveau hydraulique qui chute", causesProbables: ["Fuite majeure sur un flexible de puissance", "Joint de tige de vérin HS", "Bouchon de vidange desserré"], gravite: "CRITIQUE", actionImmediate: "Arrêter l'engin, couper le moteur et rechercher les traces d'huile au sol ou sur les bras." },
  { symptome: "Pression de pilotage basse", causesProbables: ["Accumulateur hydraulique déchargé en azote", "Pompe de pilotage fatiguée", "Limiteur de pression principal déréglé"], gravite: "CRITIQUE", actionImmediate: "Contrôler la charge d'azote de l'accumulateur et la pression au niveau de la prise d'essai." },
  { symptome: "Moteur qui claque", causesProbables: ["Jeu aux soupapes excessif", "Coussinet de bielle ou de palier usé", "Mauvais calage de la pompe d'injection"], gravite: "CRITIQUE", actionImmediate: "Arrêter immédiatement le moteur thermique pour éviter une casse totale irrémédiable." },
  { symptome: "Direction dure", causesProbables: ["Pompe de direction usée ou fuyante", "Filtre de retour hydraulique colmaté", "Manque de lubrification des pivots d'articulation"], gravite: "MAJEUR", actionImmediate: "Graisser les pivots d'articulation, vérifier la pression et le débit de la pompe de direction." },
  { symptome: "Émanation d'odeur de brûlé", causesProbables: ["Court-circuit électrique", "Échauffement d'embrayage", "Fuite de liquide sur collecteur d'échappement chaud"], gravite: "CRITIQUE", actionImmediate: "Couper le moteur, actionner le coupe-circuit principal, préparer l'extincteur par sécurité." },
  { symptome: "Perforateur sans percussion", causesProbables: ["Distributeur interne bloqué par impureté", "Manque de pression azote", "Tirant d'assemblage desserré ou cassé"], gravite: "CRITIQUE", actionImmediate: "Vérifier la pression d'azote de l'accumulateur de percussion et contrôler les tirants." }
];

export function AssistantMecanicien() {
  const { user, activeSite } = useAuthStore();
  const { data: engins, loading: enginsLoading } = useCollection<any>("engins");
  const { data: pannes, loading: pannesLoading } = useCollection<any>("pannes");

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSymptom, setSelectedSymptom] = React.useState<SymptomeEntry | null>(null);
  const [selectedEnginId, setSelectedEnginId] = React.useState<string>("");
  const [isSignalerOpen, setIsSignalerOpen] = React.useState(false);

  // Filter symptoms database
  const filteredSymptoms = React.useMemo(() => {
    if (searchQuery.trim().length < 3) return [];
    const queryLower = searchQuery.toLowerCase();
    return SYMPTOMES_DB.filter(
      (s) =>
        s.symptome.toLowerCase().includes(queryLower) ||
        s.causesProbables.some((c) => c.toLowerCase().includes(queryLower)) ||
        s.actionImmediate.toLowerCase().includes(queryLower)
    );
  }, [searchQuery]);

  // Filter engins by site
  const filteredEngins = React.useMemo(() => {
    if (!engins) return [];
    return engins.filter((e: any) => {
      if (activeSite === "TOUS") return true;
      return e.siteId === activeSite;
    });
  }, [engins, activeSite]);

  // Default select first engin when loaded
  React.useEffect(() => {
    if (filteredEngins.length > 0 && !selectedEnginId) {
      setSelectedEnginId(filteredEngins[0].id);
    }
  }, [filteredEngins, selectedEnginId]);

  // Filter last 5 pannes for selected engin
  const lastPannesForEngin = React.useMemo(() => {
    if (!selectedEnginId || !pannes) return [];
    return pannes
      .filter((p: any) => p.enginId === selectedEnginId)
      .slice(0, 5);
  }, [selectedEnginId, pannes]);

  const getGravityColor = (g: SymptomeEntry["gravite"]) => {
    switch (g) {
      case "CRITIQUE":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30";
      case "MAJEUR":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
      case "AVERTISSEMENT":
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30";
    }
  };

  const mapGravityToSignaler = (g: SymptomeEntry["gravite"]) => {
    switch (g) {
      case "CRITIQUE":
        return "Critique";
      case "MAJEUR":
        return "Élevée";
      case "AVERTISSEMENT":
        return "Moyenne";
    }
  };

  return (
    <div className="space-y-6 bg-white min-h-screen text-slate-900 pb-12">
      <PageBanner
        icon={Wrench}
        badgeLabel="ASSISTANCE RAPIDE"
        title="Diagnostic Rapide"
        subtitle="Outil d'orientation technique terrain et historique d'engins"
        siteLabel={activeSite === "TOUS" ? "TOUS SITES" : activeSite}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Colonne 1: Rechercher un symptôme (4 cols) */}
        <div className="lg:col-span-4 bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Search className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
              Rechercher un symptôme
            </h2>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Symptôme observé
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Décrivez le symptôme (ex: 'vibration moteur')..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-100 text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>

          {searchQuery.trim().length >= 3 ? (
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[380px] pr-1.5 scrollbar-thin">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Résultats de recherche ({filteredSymptoms.length})
              </p>
              {filteredSymptoms.length > 0 ? (
                filteredSymptoms.map((entry, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSymptom(entry)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border-2 transition-all flex items-start justify-between gap-3 group",
                      selectedSymptom?.symptome === entry.symptome
                        ? "border-amber-500 bg-amber-50/20"
                        : "border-slate-50 hover:border-slate-200 bg-slate-50/40"
                    )}
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors truncate">
                        {entry.symptome}
                      </p>
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 text-[8px] font-black tracking-widest uppercase rounded border",
                          getGravityColor(entry.gravite)
                        )}
                      >
                        {entry.gravite}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0 self-center" />
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs font-medium text-slate-400">
                  Aucun symptôme trouvé pour "{searchQuery}"
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/20 py-12">
              <Search className="h-8 w-8 text-slate-350 mb-3 animate-pulse" />
              <p className="text-xs font-bold text-slate-500">
                Saisissez au moins 3 caractères
              </p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                Tapez le symptôme constaté pour activer l'analyse des pannes.
              </p>
            </div>
          )}
        </div>

        {/* Colonne 2: Détail du diagnostic (4 cols) */}
        <div className="lg:col-span-4 bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Wrench className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
              Détail du diagnostic
            </h2>
          </div>

          {selectedSymptom ? (
            <div className="flex flex-col h-full justify-between gap-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 text-[8px] font-black tracking-widest uppercase rounded border",
                      getGravityColor(selectedSymptom.gravite)
                    )}
                  >
                    NIVEAU D'URGENCE : {selectedSymptom.gravite}
                  </span>
                  <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight">
                    {selectedSymptom.symptome}
                  </h3>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Causes probables
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedSymptom.causesProbables.map((cause, cIdx) => (
                      <li key={cIdx} className="text-xs font-medium text-slate-650 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Action immédiate terrain
                  </h4>
                  <div className="bg-amber-50/30 border border-amber-200/50 rounded-xl p-3.5">
                    <p className="text-xs font-bold text-amber-900 leading-relaxed">
                      {selectedSymptom.actionImmediate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                <Button
                  onClick={() => setIsSignalerOpen(true)}
                  className="w-full bg-[#121c26] hover:bg-[#121c26]/90 text-white font-bold text-xs py-2.5 rounded-xl h-10 flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Signaler une panne
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.open("https://guide-pannes.hydromines.ma", "_blank")}
                  title="Plateforme de guide de réparation — disponible prochainement"
                  className="w-full border-2 border-slate-100 hover:border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl h-10 flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
                >
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  Voir dans le Guide
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/20 py-24">
              <Wrench className="h-10 w-10 text-slate-350 mb-3 animate-bounce" />
              <p className="text-xs font-bold text-slate-500">
                Sélectionnez un symptôme
              </p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                Recherchez et cliquez sur un symptôme observé à gauche pour voir les causes probables et actions.
              </p>
            </div>
          )}
        </div>

        {/* Colonne 3: Historique pannes de l'engin (4 cols) */}
        <div className="lg:col-span-4 bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
              Historique de l'engin
            </h2>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Sélectionner l'engin de la flotte
            </label>
            {enginsLoading ? (
              <div className="h-10 bg-slate-50 animate-pulse rounded-xl" />
            ) : (
              <select
                value={selectedEnginId}
                onChange={(e) => setSelectedEnginId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-100 text-xs font-bold bg-white focus:outline-none focus:border-amber-500"
              >
                {filteredEngins.map((e: any) => (
                  <option key={e.id} value={e.id}>
                    {e.id} — {e.modele || e.marque || "Engin"} ({e.siteId})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-1.5 scrollbar-thin">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">
              5 dernières pannes signalées
            </p>

            {pannesLoading ? (
              <div className="space-y-2 py-4">
                <div className="h-12 bg-slate-50 animate-pulse rounded-xl" />
                <div className="h-12 bg-slate-50 animate-pulse rounded-xl" />
              </div>
            ) : lastPannesForEngin.length > 0 ? (
              lastPannesForEngin.map((panne: any) => (
                <div
                  key={panne.id}
                  className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col gap-2 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black text-slate-700 tracking-wide">
                      {panne.numero || panne.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                      {panne.dateDeclaration
                        ? new Date(panne.dateDeclaration).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        : "Date inconnue"}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-650 line-clamp-2 leading-relaxed">
                    {panne.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/60">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#b8860b]">
                      {panne.categorie}
                    </span>
                    <div className="flex gap-1.5">
                      <span className="inline-block px-1.5 py-0.5 text-[8px] font-black uppercase rounded bg-slate-200 text-slate-800">
                        {panne.statut}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs font-medium text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-400/80 mx-auto mb-2" />
                Aucune panne active signalée pour cet engin.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal de Signalement de Panne pré-remplie */}
      {selectedSymptom && (
        <SignalerPanne
          isOpen={isSignalerOpen}
          onClose={() => setIsSignalerOpen(false)}
          enginIdPrefill={selectedEnginId}
          descriptionPrefill={`Symptôme constaté : ${selectedSymptom.symptome}.\nCauses probables : ${selectedSymptom.causesProbables.join(", ")}.\nAction terrain menée : ${selectedSymptom.actionImmediate}`}
          gravitePrefill={mapGravityToSignaler(selectedSymptom.gravite)}
        />
      )}
    </div>
  );
}
