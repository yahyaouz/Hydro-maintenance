import * as React from "react";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Filter, 
  ArrowUpDown, 
  Truck as TruckIcon,
  ChevronRight,
  History,
  Activity,
  Droplet,
  Disc,
  FileText,
  Cpu,
  X
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/lib/store";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface Engin {
  id: string;
  matricule: string;
  type: string;
  marque: string;
  modele: string;
  site: string;
  statut: "actif" | "maintenance" | "panne" | "hors service" | "arrêté";
  heures: number;
  dispo: number;
}

const engins: Engin[] = [
  { id: "1", matricule: "M-045", type: "ST2G", marque: "Sandvik", modele: "T-800", site: "Site Nord", statut: "actif", heures: 4520, dispo: 92 },
  { id: "2", matricule: "S-012", type: "ST7", marque: "Epiroc", modele: "MT", site: "Site Sud", statut: "maintenance", heures: 1200, dispo: 0 },
  { id: "3", matricule: "D-004", type: "Dacia Duster", marque: "Renault", modele: "4x4", site: "Siège", statut: "actif", heures: 32000, dispo: 98 },
  { id: "4", matricule: "H-001", type: "Hilux", marque: "Toyota", modele: "Vigo", site: "Site Nord", statut: "panne", heures: 85000, dispo: 0 },
  { id: "5", matricule: "P-002", type: "ST2D", marque: "Sandvik", modele: "X-200", site: "Site Ouest", statut: "actif", heures: 2100, dispo: 85 },
];

import { useCollection } from "@/hooks/useCollection";

export function EnginList() {
  const [selectedEngin, setSelectedEngin] = React.useState<any | null>(null);
  const { user, activeSite } = useAuthStore();
  const canAddEngin = ["ADMIN", "SECRETAIRE", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER"].includes(user?.role || "");
  
  const { data: engins, loading } = useCollection<any>('engins');

  // Search & Modal States
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);

  // Form States
  const [newMatricule, setNewMatricule] = React.useState("");
  const [newType, setNewType] = React.useState("ST2G");
  const [newMarque, setNewMarque] = React.useState("");
  const [newModele, setNewModele] = React.useState("");
  const [newSite, setNewSite] = React.useState<string>(activeSite === "TOUS" ? "SMI" : activeSite);
  const [newHeures, setNewHeures] = React.useState<number>(0);
  const [newStatut, setNewStatut] = React.useState<"actif" | "maintenance" | "panne" | "hors service" | "arrêté">("actif");

  const filteredEngins = React.useMemo(() => {
    return engins.filter(e => {
      const siteMatch = activeSite === "TOUS" || e.site.toUpperCase().includes(activeSite.toUpperCase());
      const query = searchTerm.toLowerCase().trim();
      if (!query) return siteMatch;

      const matriculeMatch = (e.matricule || "").toLowerCase().includes(query);
      const typeMatch = (e.type || "").toLowerCase().includes(query);
      const marqueMatch = (e.marque || "").toLowerCase().includes(query);
      const modeleMatch = (e.modele || "").toLowerCase().includes(query);

      return siteMatch && (matriculeMatch || typeMatch || marqueMatch || modeleMatch);
    });
  }, [engins, activeSite, searchTerm]);

  const handleAddEngin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMatricule.trim()) {
      toast.error("Le matricule est obligatoire.");
      return;
    }
    if (!newMarque.trim()) {
      toast.error("La marque est obligatoire.");
      return;
    }

    setIsSubmitLoading(true);

    try {
      const initialDispo = newStatut === "actif" ? 100 : 0;
      await addDoc(collection(db, "engins"), {
        matricule: newMatricule.toUpperCase().trim(),
        type: newType,
        marque: newMarque.trim(),
        modele: newModele.trim() || "N/A",
        site: newSite,
        heures: Number(newHeures) || 0,
        statut: newStatut,
        dispo: initialDispo
      });

      toast.success(`L'engin ${newMatricule.toUpperCase()} a été ajouté au parc de véhicules avec succès !`);
      
      // Reset fields
      setNewMatricule("");
      setNewMarque("");
      setNewModele("");
      setNewHeures(0);
      setNewStatut("actif");
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error("Error adding engin: ", err);
      toast.error("Erreur lors de l'enregistrement de l'engin.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "actif": return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-bold px-2 py-0">Actif</Badge>;
      case "maintenance": return <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[10px] font-bold px-2 py-0">Maintenance</Badge>;
      case "panne": return <Badge variant="destructive" className="text-[10px] font-bold px-2 py-0">Panne</Badge>;
      case "hors service": return <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0">Hors Service</Badge>;
      default: return <Badge variant="outline" className="text-[10px] font-bold px-2 py-0">Arrêté</Badge>;
    }
  };

  if (selectedEngin) {
    return <EnginDetail engin={selectedEngin} onBack={() => setSelectedEngin(null)} />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight uppercase italic text-slate-900">Parc Engins</h2>
          <p className="text-muted-foreground text-sm">Gestion des actifs miniers et véhicules</p>
        </div>
        {canAddEngin ? (
          <Button 
            className="bg-hydro shadow-lg shadow-hydro/20 font-bold h-10 tracking-wider hover:bg-hydro/90"
            onClick={() => {
              setIsAddModalOpen(true);
              setNewSite(activeSite === "TOUS" ? "SMI" : activeSite);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> AJOUTER ENGIN
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <Button disabled className="bg-slate-200 text-slate-400 cursor-not-allowed h-10 font-bold">
              <Plus className="mr-2 h-4 w-4" /> AJOUTER ENGIN
            </Button>
            <span className="text-[10px] text-slate-400 font-mono">Accès réservé Secrétaire/Chantiers/Maintenance</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Rechercher matricule, type..." 
            className="pl-9 h-10 border-slate-200" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSearchTerm("")}
            className="text-xs text-slate-400 p-2 h-10 hover:text-slate-900"
          >
            Effacer
          </Button>
        )}
        <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200">
           <Filter className="h-4 w-4 text-slate-500" />
        </Button>
        <div className="ml-auto">
           <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">
              {filteredEngins.length} MACHINE(S)
           </Badge>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="grid grid-cols-6 p-4 border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="col-span-2">Matricule / Type</div>
          <div>Site</div>
          <div>Heures</div>
          <div>Statut</div>
          <div className="text-right">Actions</div>
        </div>
        <ScrollArea className="h-[calc(100vh-320px)]">
           {filteredEngins.map((engin) => (
             <div 
               key={engin.id} 
               className="grid grid-cols-6 p-4 border-b border-slate-55 items-center hover:bg-slate-50/80 cursor-pointer transition-colors"
               onClick={() => setSelectedEngin(engin)}
             >
                <div className="col-span-2 flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-hydro/10 group-hover:text-hydro transition-colors">
                      <TruckIcon className="h-5 w-5" />
                   </div>
                   <div>
                     <p className="font-bold text-slate-800">{engin.matricule}</p>
                     <p className="text-[10px] text-slate-400 font-medium uppercase">{engin.marque} {engin.type}</p>
                   </div>
                </div>
                <div className="text-xs font-bold text-slate-600">{engin.site}</div>
                <div className="text-xs font-mono font-bold text-slate-500">{engin.heures} h</div>
                <div>{getStatutBadge(engin.statut)}</div>
                <div className="text-right">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={(e) => { e.stopPropagation(); setSelectedEngin(engin); }}>
                      <MoreHorizontal className="h-4 w-4" />
                   </Button>
                </div>
             </div>
           ))}
           {filteredEngins.length === 0 && (
             <div className="p-12 text-center text-muted-foreground italic text-sm">
                Aucun engin trouvé pour ce site.
             </div>
           )}
        </ScrollArea>
      </div>

      {/* ============================================== */}
      {/* MODAL : AJOUTER ENGIN (HYDRO-MINES COMPLIANT) */}
      {/* ============================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-hydro/10 flex items-center justify-center text-hydro">
                    <TruckIcon className="h-4 w-4" />
                  </div>
                  <span>AJOUTER UN NOUVEL ENGIN</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Enregistrement d'un nouvel équipement d'extraction ou d’analyse</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 hover:bg-slate-200 rounded-full"
              >
                <X className="h-4 w-4 text-slate-500" />
              </Button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddEngin} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Matricule Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block select-none uppercase tracking-wide">
                    Matricule / Code Engin *
                  </label>
                  <Input 
                    placeholder="Ex: ST7-14, D-008" 
                    className="h-11 border-slate-300 focus-visible:ring-hydro text-slate-800 font-semibold"
                    value={newMatricule}
                    onChange={(e) => setNewMatricule(e.target.value)}
                    required
                  />
                </div>

                {/* Type selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block select-none uppercase tracking-wide">
                    Type d'Engin *
                  </label>
                  <select
                    className="w-full bg-white border border-slate-300 h-11 px-3 rounded-md text-sm text-slate-800 font-medium focus:border-hydro focus:outline-none focus:ring-1 focus:ring-hydro"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="ST2G">ST2G (Chargeuse Souterrain)</option>
                    <option value="ST7">ST7 (Scraper Mine)</option>
                    <option value="ST2D">ST2D (Foreuse Electrique)</option>
                    <option value="Hilux">Toyota Hilux (Liaison)</option>
                    <option value="Duster">Dacia Duster (Supervision)</option>
                    <option value="Loader">Caterpillar Loader (Surface)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Marque */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block select-none uppercase tracking-wide">
                    Marque *
                  </label>
                  <Input 
                    placeholder="Ex: Sandvik, Epiroc, Toyota" 
                    className="h-11 border-slate-300 focus-visible:ring-hydro"
                    value={newMarque}
                    onChange={(e) => setNewMarque(e.target.value)}
                    required
                  />
                </div>

                {/* Modele */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block select-none uppercase tracking-wide">
                    Modèle / Série
                  </label>
                  <Input 
                    placeholder="Ex: T-800, Vigo, MT" 
                    className="h-11 border-slate-300 focus-visible:ring-hydro"
                    value={newModele}
                    onChange={(e) => setNewModele(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Site assignment */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block select-none uppercase tracking-wide">
                    Affectation Site *
                  </label>
                  <select
                    className="w-full bg-white border border-slate-300 h-11 px-3 rounded-md text-sm text-slate-800 font-medium focus:border-hydro focus:outline-none focus:ring-1 focus:ring-hydro"
                    value={newSite}
                    onChange={(e) => setNewSite(e.target.value)}
                  >
                    <option value="SMI">SMI (Mine Centrale)</option>
                    <option value="KOUDIA">Koudia (Site Sud)</option>
                    <option value="Site Nord">Site Nord</option>
                    <option value="Site Sud">Site Sud</option>
                    <option value="Site Ouest">Site Ouest</option>
                    <option value="Siège">Siège Casablanca</option>
                  </select>
                </div>

                {/* Compteur horaire */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block select-none uppercase tracking-wide">
                    Heures Compteur Initial *
                  </label>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="0" 
                    className="h-11 border-slate-300 focus-visible:ring-hydro font-mono"
                    value={newHeures || ""}
                    onChange={(e) => setNewHeures(Math.max(0, parseInt(e.target.value) || 0))}
                    required
                  />
                </div>
              </div>

              {/* Statut initial */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block select-none uppercase tracking-wide">
                  Statut Opérationnel Initial *
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { val: "actif", label: "🟢 Actif / En Service" },
                    { val: "maintenance", label: "🟡 En Maintenance" },
                    { val: "panne", label: "🔴 En Panne d'Urgence" },
                    { val: "hors service", label: "⚪ Hors service" }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setNewStatut(opt.val as any)}
                      className={`h-11 px-3 text-xs font-semibold rounded-lg border text-left flex items-center justify-between transition-all ${
                        newStatut === opt.val
                          ? "bg-hydro/5 border-hydro text-hydro ring-2 ring-hydro/10"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warnings and Info footnotes */}
              <div className="p-3 bg-amber-50 rounded-lg text-[10px] leading-snug text-amber-800 border border-amber-200 font-mono">
                ⚠️ Tout enregistrement d'engin initie automatiquement son carnet numérique légal d'intervention (HSE CFR Part 11).
              </div>

              {/* Footer Buttons inside Scroll Form */}
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-150">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-12 px-6 hover:bg-slate-100 text-slate-700 font-bold tracking-wider uppercase text-xs"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitLoading}
                  className="h-12 px-8 bg-hydro text-white font-heavy tracking-wider hover:bg-hydro/90 uppercase text-xs shadow-lg shadow-hydro/20"
                >
                  {isSubmitLoading ? "Enregistrement..." : "Créer l'Équipement"}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EnginDetail({ engin, onBack }: { engin: Engin; onBack: () => void }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          Engins
        </Button>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{engin.matricule}</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-hydro flex items-center justify-center text-white shadow-lg shadow-hydro/20">
             <TruckIcon className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{engin.matricule}</h2>
            <p className="text-muted-foreground">{engin.marque} {engin.modele} • {engin.site}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline">Générer Rapport</Button>
           <Button className="bg-mines hover:bg-mines/90">Signaler Panne</Button>
        </div>
      </div>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="resume">Résumé</TabsTrigger>
          <TabsTrigger value="conso">Conso</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="pannes">Pannes</TabsTrigger>
          <TabsTrigger value="pneus">Pneus</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="ia" className="text-hydro font-bold">IA Analyse</TabsTrigger>
        </TabsList>
        <TabsContent value="resume" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Disponibilité</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-ok-green">{engin.dispo}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Heures Travail</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engin.heures} h</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Cout Total</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.4 M F CFA</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm font-medium">Statut</CardTitle></CardHeader>
              <CardContent>
                <Badge className={engin.statut === 'actif' ? 'bg-ok-green' : 'bg-alert-orange'}>{engin.statut}</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
             <Card>
               <CardHeader><CardTitle>Dernières Activités</CardTitle></CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="flex gap-4 items-start">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                             <History className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Saisie d'heures - Poste Jour</p>
                            <p className="text-xs text-muted-foreground">Il y a 3 heures par Alice (Secrétaire)</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </CardContent>
             </Card>
             <Card>
               <CardHeader><CardTitle>Entretien Proche (IA)</CardTitle></CardHeader>
               <CardContent>
                  <div className="p-4 rounded-xl bg-hydro/5 border border-hydro/20 flex flex-col gap-3">
                     <div className="flex items-center gap-2 text-hydro font-bold">
                        <Cpu className="h-5 w-5" />
                        <span>Suggestion IA</span>
                     </div>
                     <p className="text-sm">L'engin atteint bientôt les 5000h. Prévoir une vidange complète et vérification du système hydraulique.</p>
                     <Button size="sm" className="w-fit bg-hydro">Planifier</Button>
                  </div>
               </CardContent>
             </Card>
          </div>
        </TabsContent>
        {/* Fill other tabs as needed or with placeholders */}
        <TabsContent value="ia" className="pt-4">
           <Card className="border-hydro/30 shadow-lg shadow-hydro/10">
              <CardHeader className="bg-hydro text-white rounded-t-xl">
                 <CardTitle className="flex items-center gap-2">
                   <Cpu className="h-6 w-6" />
                   Analyse Prédictive IA - {engin.matricule}
                 </CardTitle>
                 <CardDescription className="text-hydro-foreground/80">Diagnostic avancé basé sur l'historique et les capteurs</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-xl space-y-2">
                       <h4 className="font-bold flex items-center gap-2 text-alert-orange">
                          <Activity className="h-4 w-4" /> Risques Détectés
                       </h4>
                       <p className="text-sm text-muted-foreground">Surconsommation de 5% observée sur les 3 derniers postes. Possible encrassement filtres.</p>
                    </div>
                    <div className="p-4 border rounded-xl space-y-2">
                       <h4 className="font-bold flex items-center gap-2 text-ok-green">
                          <Disc className="h-4 w-4" /> État Pneus
                       </h4>
                       <p className="text-sm text-muted-foreground">Usure uniforme. Fin de vie estimée dans 800h.</p>
                    </div>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Poser une question spécifique à l'IA :</label>
                    <div className="flex gap-2">
                       <Input placeholder="Pourquoi la consommation a augmenté ?" />
                       <Button className="bg-hydro">Analyser</Button>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
