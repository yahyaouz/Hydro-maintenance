import * as React from "react";
import { 
  AlertTriangle, 
  Search, 
  Plus, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Stethoscope,
  Wrench,
  FlaskConical,
  Play
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

interface Panne {
  id: string;
  numero: string;
  engin: string;
  categorie: string;
  gravite: "critique" | "élevée" | "moyenne" | "faible";
  statut: "déclarée" | "diagnostic" | "validation" | "réparation" | "test" | "résolue";
  date: string;
  description: string;
  siteId: string;
}

const pannes: Panne[] = [
  { id: "1", numero: "PAN-2026-0001", engin: "M-045", categorie: "Hydraulique", gravite: "critique", statut: "réparation", date: "2026-05-18", description: "Fuite majeure sur vérin de levage", siteId: "SMI" },
  { id: "2", numero: "PAN-2026-0002", engin: "S-012", categorie: "Mécanique", gravite: "élevée", statut: "diagnostic", date: "2026-05-18", description: "Bruit anormal moteur", siteId: "SMI" },
  { id: "3", numero: "PAN-2026-0003", engin: "P-002", categorie: "Électrique", gravite: "moyenne", statut: "déclarée", date: "2026-05-17", description: "Problème démarrage", siteId: "KOUDIA" },
];

const statusSteps = [
  { label: "Déclarée", icon: AlertTriangle },
  { label: "Diagnostic", icon: Stethoscope },
  { label: "Validation", icon: CheckCircle2 },
  { label: "Réparation", icon: Wrench },
  { label: "Test", icon: FlaskConical },
  { label: "Résolue", icon: Play },
];

import { useCollection } from "@/hooks/useCollection";

export function PannesList() {
  const [selectedPanne, setSelectedPanne] = React.useState<any | null>(null);
  const { activeSite, user } = useAuthStore();
  const { data: pannesData, loading } = useCollection<any>('pannes');

  const [search, setSearch] = React.useState("");
  const [selectedGravity, setSelectedGravity] = React.useState<string>("TOUTES");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("TOUT");
  const [pageSize, setPageSize] = React.useState(12);

  const [isDeclareOpen, setIsDeclareOpen] = React.useState(false);
  const [newEngin, setNewEngin] = React.useState("M-045");
  const [newCategory, setNewCategory] = React.useState("Hydraulique");
  const [newGravity, setNewGravity] = React.useState<"critique" | "élevée" | "moyenne" | "faible">("élevée");
  const [newDescription, setNewDescription] = React.useState("");

  const canDeclarePanne = ["ADMIN", "MECANICIEN", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "SECRETAIRE"].includes(user?.role || "");
  const canValidateStep = ["ADMIN", "MECANICIEN", "RESPONSABLE_MAINTENANCE"].includes(user?.role || "");

  const filteredPannes = React.useMemo(() => {
    return pannesData.filter(p => {
      const matchesSite = activeSite === "TOUS" || p.siteId === activeSite;
      const matchesGravity = selectedGravity === "TOUTES" || p.gravite === selectedGravity.toLowerCase();
      const matchesStatus = selectedStatus === "TOUT" || p.statut === selectedStatus.toLowerCase();
      
      const term = search.toLowerCase().trim();
      const matchesSearch = !term || 
        (p.numero && p.numero.toLowerCase().includes(term)) ||
        (p.engin && p.engin.toLowerCase().includes(term)) ||
        (p.categorie && p.categorie.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term));

      return matchesSite && matchesGravity && matchesStatus && matchesSearch;
    });
  }, [pannesData, activeSite, selectedGravity, selectedStatus, search]);

  const paginatedPannes = React.useMemo(() => {
    return filteredPannes.slice(0, pageSize);
  }, [filteredPannes, pageSize]);

  const handleDeclarePanne = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      toast.error("Veuillez saisir une description technique détaillée.");
      return;
    }
    const fakeNum = `PAN-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
    toast.success(`Panne enregistrée avec succès sous la référence ${fakeNum} !`);
    setIsDeclareOpen(false);
    setNewDescription("");
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 min-h-screen select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight uppercase text-slate-950 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-650" /> Gestion des Pannes Terrains
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Suivi temps réel des anomalies d'engins, diagnostics et statuts d'ateliers</p>
        </div>
        {canDeclarePanne ? (
          <Button 
            className="bg-red-600 hover:bg-red-700 dark:bg-red-650 dark:hover:bg-red-700 text-white shadow-lg h-12 font-black uppercase tracking-wider no-double-tap-zoom px-5 rounded-xl block"
            onClick={() => setIsDeclareOpen(true)}
          >
            <AlertTriangle className="mr-2 h-4.5 w-4.5 inline-block -mt-0.5" /> DÉCLARER UNE PANNE
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <Button disabled className="bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed h-12 rounded-xl">
              <AlertTriangle className="mr-2 h-4 w-4" /> DÉCLARER UNE PANNE
            </Button>
            <span className="text-[9px] text-slate-500 dark:text-slate-500 font-mono uppercase tracking-widest">Lecture seule</span>
          </div>
        )}
      </div>

      {/* SEARCH AND FILTERS LAYER */}
      <div className="grid gap-4 md:grid-cols-4 bg-white dark:bg-[#131b2e] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="col-span-1 md:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPageSize(12); }}
            placeholder="Rechercher par numéro, engin, description..." 
            className="pl-10 h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-red-500 rounded-xl select-text" 
          />
        </div>
        
        <div>
          <select 
            value={selectedGravity}
            onChange={(e) => { setSelectedGravity(e.target.value); setPageSize(12); }}
            className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs font-bold uppercase text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="TOUTES">Gravité: Toutes</option>
            <option value="CRITIQUE">🔴 Critique</option>
            <option value="ÉLEVÉE">🟠 Élevée</option>
            <option value="MOYENNE">🟡 Moyenne</option>
            <option value="FAIBLE">🔵 Faible</option>
          </select>
        </div>

        <div>
          <select 
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPageSize(12); }}
            className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-xs font-bold uppercase text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="TOUT">Statut: Tous</option>
            <option value="DÉCLARÉE">Déclarée</option>
            <option value="DIAGNOSTIC">Diagnostic</option>
            <option value="VALIDATION">Validation</option>
            <option value="RÉPARATION">Réparation</option>
            <option value="TEST">Test</option>
            <option value="RÉSOLUE">Résolue</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {paginatedPannes.map((panne) => (
          <Card 
            key={panne.id} 
            className={cn(
              "cursor-pointer hover:shadow-md transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] shadow-sm relative no-double-tap-zoom overflow-hidden",
              panne.gravite === "critique" ? "border-l-4 border-l-red-650" : "border-l-4 border-l-amber-500",
              selectedPanne?.id === panne.id && "ring-2 ring-red-500"
            )}
            onClick={() => setSelectedPanne(panne)}
          >
            <CardHeader className="py-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-black text-slate-900 dark:text-white font-mono">{panne.numero}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[8px] uppercase font-black tracking-wider px-2 py-0.5",
                    panne.gravite === "critique" 
                      ? "text-red-700 dark:text-red-400 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20" 
                      : "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20"
                  )}
                >
                  {panne.gravite}
                </Badge>
              </div>
              <CardDescription className="text-xs font-extrabold text-[#4A90D9] uppercase tracking-wider font-mono mt-1">{panne.engin} • Site: {panne.siteId}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-2 text-[10.5px]">
                <span className="font-black uppercase text-slate-500 dark:text-slate-450 tracking-wide flex items-center gap-1">
                  🌐 Status: {panne.statut}
                </span>
                <span className="text-slate-400 dark:text-slate-500 font-mono font-bold">{panne.date}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 mt-3 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all",
                    panne.statut === "résolue" ? "bg-emerald-500" : "bg-red-500"
                  )} 
                  style={{ width: `${((statusSteps.findIndex(s => s.label.toLowerCase() === panne.statut) + 1) / statusSteps.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPannes.length === 0 && (
          <div className="col-span-4 p-16 bg-white dark:bg-[#131b2e] dark:border-slate-800 border border-slate-200 text-center rounded-2xl shadow-inner text-slate-500 dark:text-slate-450 italic text-sm">
             🔍 Aucune anomalie active répertoriée avec ces filtres sur {activeSite === "TOUS" ? "les galeries" : activeSite}.
          </div>
        )}
      </div>

      {/* PROGRESSIVE SHIFT LOAD-MORE BUTTON */}
      {filteredPannes.length > pageSize && (
        <div className="flex justify-center pt-2">
          <Button 
            onClick={() => setPageSize(prev => prev + 12)}
            variant="outline"
            className="h-12 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-black uppercase tracking-wider px-6 rounded-xl no-double-tap-zoom"
          >
            CHARGER LA SUITE DES PANNES ({filteredPannes.length - pageSize} en attente)
          </Button>
        </div>
      )}

      {selectedPanne && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131b2e] shadow-xl overflow-hidden animate-in slide-in-from-bottom-5">
          <CardHeader className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-black italic tracking-tighter text-slate-950 dark:text-white font-mono">{selectedPanne.numero}</CardTitle>
                <CardDescription className="font-black text-blue-600 dark:text-[#4A90D9] uppercase text-xs tracking-wider mt-1">{selectedPanne.engin} • {selectedPanne.categorie} • Site {selectedPanne.siteId}</CardDescription>
              </div>
              <Badge className="bg-red-600 dark:bg-red-650 text-white font-black px-4 py-1.5 uppercase tracking-widest text-xs h-9 rounded-lg">
                📋 STATUT: {selectedPanne.statut}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-800/80 rounded-2xl relative overflow-hidden select-none">
               {statusSteps.map((step, index) => {
                 const stepLower = step.label.toLowerCase();
                 const currentIndex = statusSteps.findIndex(s => s.label.toLowerCase() === selectedPanne.statut);
                 const isActive = index <= currentIndex;
                 const isCurrent = index === currentIndex;

                 return (
                   <div key={step.label} className="flex md:flex-col items-center gap-3 relative z-10 flex-1">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center border-2 transition-all shadow-sm shrink-0",
                        isCurrent ? "bg-red-600 dark:bg-red-650 border-red-600 text-white scale-110" : 
                        isActive ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600"
                      )}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider",
                        isCurrent ? "text-red-600 dark:text-red-400 font-extrabold" : isActive ? "text-emerald-600" : "text-slate-400 dark:text-slate-500"
                      )}>{step.label}</span>
                   </div>
                 );
               })}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
               <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                     <AlertTriangle className="h-4 w-4 text-red-500" /> DESCRIPTION TECHNIQUE SIGNALÉE
                  </h4>
                  <div className="p-5 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-2xl text-xs italic font-medium text-slate-800 dark:text-slate-200 leading-relaxed shadow-inner">
                     "{selectedPanne.description}"
                  </div>
               </div>
               <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                     <Wrench className="h-4 w-4 text-blue-600 dark:text-[#4A90D9]" /> JALON PROTOCOLES ATELIER
                  </h4>
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 text-xs p-3.5 border border-emerald-100 dark:border-emerald-900/20 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/5 group">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 select-none animate-pulse" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">Contrôle visuel effectué - <span className="text-slate-900 dark:text-white font-black">Maarouf S. (Glove Checked)</span></span>
                     </div>
                     <div className="flex items-center gap-3 text-xs p-3.5 border border-emerald-100 dark:border-emerald-900/20 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/5 group">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 select-none" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">Diagnostic hydraulique validé - <span className="text-slate-900 dark:text-white font-black">Responsable SMI</span></span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800 select-none">
               <Button variant="outline" className="font-black text-xs h-12 border-slate-200 dark:border-slate-850 dark:bg-[#131b2e] dark:hover:bg-slate-800 no-double-tap-zoom" onClick={() => setSelectedPanne(null)}>FERMER</Button>
               <Button 
                 className={cn(
                   "font-black text-xs h-12 transition-all no-double-tap-zoom px-5 rounded-lg",
                   canValidateStep 
                     ? "bg-blue-600 dark:bg-[#4A90D9] text-white dark:text-slate-900 shadow-md hover:bg-blue-700 dark:hover:bg-[#3572b2]" 
                     : "bg-slate-200 dark:bg-slate-850 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                 )}
                 onClick={() => {
                   if (!canValidateStep) {
                     toast.error("Accès réservé Mécanicien / Maintenance / Admin");
                     return;
                   }
                   toast.success("Étape suivante validée avec succès !");
                 }}
               >
                 VALIDER ÉTAPE SUIVANTE ATELIER
               </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MILITARY GRADE PANNE DECLARATION MODAL (No Alert Prototype feel!) */}
      {isDeclareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in select-none">
          <div className="w-full max-w-lg bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white flex items-center gap-2 tracking-wider">
                <AlertTriangle className="h-5 w-5 text-red-650" /> NOUVEL ENREGISTREMENT DE PANNE SOU-SOL
              </h3>
              <Button variant="ghost" className="h-9 w-9 p-0" onClick={() => setIsDeclareOpen(false)}>×</Button>
            </div>
            <form onSubmit={handleDeclarePanne} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">CODE ENGINE</label>
                  <select 
                    value={newEngin}
                    onChange={(e) => setNewEngin(e.target.value)}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 text-xs font-bold text-slate-850 dark:text-slate-100"
                  >
                    <option value="M-045">M-045 (Dumper)</option>
                    <option value="S-012">S-012 (Sandvik Loader)</option>
                    <option value="P-002">P-002 (Pelle)</option>
                    <option value="C-009">C-009 (Compresseur)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">CATÉGORIE SYSTEME</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 text-xs font-bold text-slate-850 dark:text-slate-100"
                  >
                    <option value="Hydraulique">💧 Hydraulique</option>
                    <option value="Mécanique">⚙️ Mécanique</option>
                    <option value="Électrique">⚡ Électrique</option>
                    <option value="Pneumatique">⭕ Pneumatique</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">GRAVITÉ OPÉRATIONNELLE</label>
                <div className="flex gap-2">
                  {(["critique", "élevée", "moyenne", "faible"] as const).map((g) => (
                    <Button
                      key={g}
                      type="button"
                      variant={newGravity === g ? "default" : "outline"}
                      onClick={() => setNewGravity(g)}
                      className={cn(
                        "flex-1 h-10 text-[9px] font-extrabold uppercase tracking-wide no-double-tap-zoom rounded-lg transition-transform active:scale-95",
                        newGravity === g && g === "critique" && "bg-red-650 hover:bg-red-700 text-white border-none",
                        newGravity === g && g === "élevée" && "bg-amber-500 hover:bg-amber-650 text-white border-none",
                        newGravity === g && g === "moyenne" && "bg-yellow-500 hover:bg-yellow-650 text-slate-900 border-none",
                        newGravity === g && g === "faible" && "bg-blue-600 hover:bg-blue-700 text-white border-none"
                      )}
                    >
                      {g}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">DESCRIPTION DU COMPORTEMENT ANORMAL</label>
                
                {/* Glove-friendly quick operational composition taps */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    { text: "Fuite d'huile hydraulique au niveau du vérin principal", label: "💧 Fuite Huile", cat: "Hydraulique", grav: "critique" as const },
                    { text: "Production de fumée noire intense à l'accélération (échappement moteur)", label: "💨 Fumée Noire", cat: "Mécanique", grav: "élevée" as const },
                    { text: "Baisse de pression d'air / Filtre à air sévèrement colmaté de poussière", label: "⚙️ Filtre Colmaté", cat: "Mécanique", grav: "élevée" as const },
                    { text: "Bruit sec anormal et vibrations suspectes dans la boite Caterpillar", label: "🔩 Bruit Boite", cat: "Mécanique", grav: "élevée" as const },
                    { text: "Court-circuit électrique tableau de bord / Batterie déchargée", label: "⚡ Défaut Élec", cat: "Électrique", grav: "moyenne" as const },
                  ].map((symptom) => (
                    <button
                      key={symptom.label}
                      type="button"
                      onClick={() => {
                        setNewDescription(symptom.text);
                        setNewCategory(symptom.cat);
                        setNewGravity(symptom.grav);
                        toast.success(`Sélectionné : ${symptom.label}`);
                      }}
                      className="text-[9.5px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-extrabold uppercase hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-all text-slate-700 dark:text-slate-300"
                    >
                      {symptom.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Décrivez les symptômes observés (fumée anormale, baisse de pression de 12 bar, fuite hydraulique au vérin principal...)"
                  rows={4}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-medium text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500 select-text"
                />
              </div>

              <div className="flex gap-2.5 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12 font-black uppercase text-xs rounded-xl border-slate-200 no-double-tap-zoom"
                  onClick={() => setIsDeclareOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 font-black uppercase text-xs rounded-xl bg-red-650 text-white shadow-lg shadow-red-500/10 hover:bg-red-700 no-double-tap-zoom"
                >
                  ENREGISTRER À SMI-{activeSite}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
