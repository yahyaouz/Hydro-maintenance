import * as React from "react";
import { 
  Clock, 
  Calendar, 
  User, 
  Truck, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Filter,
  Check,
  X,
  History,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Saisie {
  id: string;
  date: string;
  engin: string;
  poste: "JOUR" | "NUIT";
  debut: string;
  fin: string;
  heures: number;
  activite: string;
  statut: "EN_ATTENTE" | "VALIDE" | "REJETE";
  siteId: string;
  saisiPar: string;
}

const MOCK_SAISIES: Saisie[] = [
  { id: "1", date: "2026-05-19", engin: "M-045", poste: "JOUR", debut: "08:00", fin: "20:00", heures: 12, activite: "Poste Jour", statut: "VALIDE", siteId: "SMI", saisiPar: "Ouacha M." },
  { id: "2", date: "2026-05-19", engin: "S-012", poste: "NUIT", debut: "20:00", fin: "08:00", heures: 12, activite: "Poste Nuit", statut: "EN_ATTENTE", siteId: "SMI", saisiPar: "Ouacha M." },
  { id: "3", date: "2026-05-19", engin: "P-002", poste: "JOUR", debut: "08:00", fin: "16:00", heures: 8, activite: "Poste Jour", statut: "VALIDE", siteId: "KOUDIA", saisiPar: "System" },
];

export function HeuresTravail() {
  const { user, activeSite } = useAuthStore();
  const [submitting, setSubmitting] = React.useState(false);
  const [dateSaisie, setDateSaisie] = React.useState(new Date().toISOString().split('T')[0]);
  const [hDebut, setHDebut] = React.useState("08:00");
  const [hFin, setHFin] = React.useState("20:00");
  const [computedHours, setComputedHours] = React.useState(12);

  // Calculate hours automatically
  React.useEffect(() => {
    if (hDebut && hFin) {
      const start = hDebut.split(':').map(Number);
      const end = hFin.split(':').map(Number);
      
      let diff = (end[0] + end[1]/60) - (start[0] + start[1]/60);
      if (diff < 0) diff += 24; // Handle overnight shifts
      
      setComputedHours(parseFloat(diff.toFixed(2)));
    }
  }, [hDebut, hFin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (computedHours > 24) {
      toast.error("Erreur: Une saisie ne peut pas dépasser 24h.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Heures de travail enregistrées avec succès (En attente de validation)");
    }, 1000);
  };

  const isSecretary = user?.role === "SECRETAIRE" || user?.role === "ADMIN";
  const isRespo = user?.role === "RESPONSABLE_MAINTENANCE" || user?.role === "ADMIN" || user?.role === "DIRECTION" || user?.role === "RESPONSABLE_CHANTIER";
  const canValidate = user?.role === "RESPONSABLE_MAINTENANCE" || user?.role === "ADMIN";

  const filteredSaisies = MOCK_SAISIES.filter(s => 
    (activeSite === "TOUS" || s.siteId === activeSite)
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight uppercase italic text-slate-900">Heures de Travail</h2>
          <p className="text-muted-foreground text-sm">
            {isSecretary ? "Saisie journalière et suivi des postes" : "Consultation et validation des heures"}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-hydro/5 text-hydro border-hydro/20">
              SITE: {activeSite === "TOUS" ? "TOUS LES SITES" : activeSite}
           </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          {isSecretary && (
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 bg-hydro w-full" />
              <CardHeader>
                <CardTitle className="text-lg">Nouvelle Saisie Manuelle</CardTitle>
                <CardDescription>⚠️ Aucun engin n'a de compteur physique. Saisie obligatoire.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-xs font-bold uppercase text-slate-500">Journée du</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={dateSaisie} 
                        onChange={(e) => setDateSaisie(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="poste" className="text-xs font-bold uppercase text-slate-500">Poste</Label>
                      <Select defaultValue="JOUR">
                        <SelectTrigger id="poste" className="h-10">
                          <SelectValue placeholder="Sélectionner poste" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="JOUR">Jour (08h - 20h)</SelectItem>
                          <SelectItem value="NUIT">Nuit (20h - 08h)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="engin" className="text-xs font-bold uppercase text-slate-500">Engin concerné</Label>
                    <Select>
                      <SelectTrigger id="engin" className="h-10">
                        <SelectValue placeholder="Sélectionner l'engin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m045">M-045 (ST2G) - SMI</SelectItem>
                        <SelectItem value="s012">S-012 (ST7) - SMI</SelectItem>
                        <SelectItem value="p002">P-002 (ST2D) - KOUDIA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="debut" className="text-xs font-bold uppercase text-slate-500">Début</Label>
                      <Input 
                        id="debut" 
                        type="time" 
                        value={hDebut} 
                        onChange={(e) => setHDebut(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fin" className="text-xs font-bold uppercase text-slate-500">Fin</Label>
                      <Input 
                        id="fin" 
                        type="time" 
                        value={hFin} 
                        onChange={(e) => setHFin(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Total H</Label>
                      <div className={cn(
                        "h-10 px-3 flex items-center rounded-md border font-bold text-sm",
                        computedHours > 13 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-slate-50 border-slate-200 text-slate-700"
                      )}>
                        {computedHours}h
                      </div>
                    </div>
                  </div>

                  {computedHours > 13 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 items-start animate-in slide-in-from-top-2">
                       <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                       <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                          <span className="font-bold">Poste long détecté ({computedHours}h).</span> 
                          Cette saisie sera signalée au responsable pour vérification de la sécurité au travail.
                       </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="production" className="text-xs font-bold uppercase text-slate-500">Activité de l'engin</Label>
                    <Input id="production" placeholder="Ex: Creusement, Chargement, Attente..." className="h-10" />
                  </div>

                  <Button type="submit" className="w-full bg-hydro hover:bg-hydro/90 h-11 font-bold shadow-lg shadow-hydro/20" disabled={submitting}>
                    {submitting ? "Traitement..." : "ENREGISTRER LA SAISIE"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {canValidate && (
             <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                         <CardTitle className="text-lg">Saisies à Valider</CardTitle>
                         <Badge variant="secondary" className="bg-amber-100 text-amber-700 font-bold">1 EN ATTENTE</Badge>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="secondary" size="sm" className="h-7 text-[10px] bg-white border border-slate-200">TOUTES</Button>
                         <Button variant="ghost" size="sm" className="h-7 text-[10px] text-slate-500 hover:bg-white border border-transparent hover:border-slate-200">AUJOURD'HUI</Button>
                         <Button variant="ghost" size="sm" className="h-7 text-[10px] text-slate-500 hover:bg-white border border-transparent hover:border-slate-200">CETTE SEMAINE</Button>
                         <Button variant="ghost" size="sm" className="h-7 text-[10px] text-slate-500 hover:bg-white border border-transparent hover:border-slate-200">NON VALIDÉES</Button>
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-slate-100">
                      {filteredSaisies.filter(s => s.statut === "EN_ATTENTE").map(s => (
                        <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                           <div className="flex gap-4">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                 <Truck className="h-5 w-5" />
                              </div>
                              <div>
                                 <h4 className="text-sm font-bold text-slate-900">{s.engin} • {s.siteId}</h4>
                                 <p className="text-[11px] text-muted-foreground">{s.date} • {s.poste} ({s.heures}h) • {s.saisiPar}</p>
                                 <p className="text-[11px] font-medium text-hydro mt-0.5 italic">{s.activite}</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                                 <X className="h-4 w-4" />
                              </Button>
                              <Button size="sm" className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px]">
                                 VALIDER
                              </Button>
                           </div>
                        </div>
                      ))}
                      {filteredSaisies.filter(s => s.statut === "EN_ATTENTE").length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm italic">
                           Aucune saisie en attente de validation pour ce site.
                        </div>
                      )}
                   </div>
                </CardContent>
             </Card>
          )}

          {user?.role === "SECRETAIRE" && (
            <Card className="border-slate-200">
               <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-slate-500">Statut de mes saisies</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                     {MOCK_SAISIES.filter(s => s.siteId === user.siteId).map(s => (
                        <div key={s.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-700">{s.engin} - {s.date}</span>
                              <span className="text-[10px] text-slate-400">{s.poste} • {s.heures}h</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <Badge 
                                 variant="outline" 
                                 className={cn(
                                    "text-[9px] uppercase font-bold",
                                    s.statut === "VALIDE" ? "text-emerald-600 border-emerald-100 bg-emerald-50" : "text-amber-600 border-amber-100 bg-amber-50"
                                 )}
                              >
                                 {s.statut}
                              </Badge>
                              {s.statut !== "VALIDE" && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-hydro hover:bg-hydro/5">
                                   <History className="h-3 w-3" />
                                </Button>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-5 space-y-6">
          {isRespo && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                   <Clock className="h-4 w-4 text-hydro" /> Cumul depuis Vidange
                </CardTitle>
                <CardDescription className="text-[10px]">Heures cumulées validées vs Seuil maintenance</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 border-y border-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                         <tr>
                            <th className="px-4 py-2">Engin</th>
                            <th className="px-4 py-2">H Cumulées</th>
                            <th className="px-4 py-2">Restant</th>
                            <th className="px-4 py-2">Statut</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {[
                           { id: "M-045", h: 238, limit: 250, site: "SMI" },
                           { id: "S-012", h: 105, limit: 250, site: "SMI" },
                           { id: "P-002", h: 200, limit: 250, site: "KOUDIA" },
                           { id: "M-078", h: 12, limit: 250, site: "SMI" },
                         ].filter(e => activeSite === "TOUS" || e.site === activeSite).map((item) => (
                           <tr key={item.id} className="text-xs hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-900">{item.id}</td>
                              <td className="px-4 py-3 font-mono">{item.h}h</td>
                              <td className={cn(
                                "px-4 py-3 font-bold",
                                (item.limit - item.h) < 20 ? "text-red-600" : "text-emerald-600"
                              )}>
                                {item.limit - item.h}h
                              </td>
                              <td className="px-4 py-3">
                                 { (item.limit - item.h) < 20 ? (
                                   <Badge className="bg-red-500 text-[9px] py-0 px-1 font-bold">ALERTE</Badge>
                                 ) : (
                                   <Badge variant="outline" className="text-emerald-600 border-emerald-100 text-[9px] py-0 px-1 font-bold">OK</Badge>
                                 )}
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-start gap-2">
                   <Info className="h-3 w-3 text-hydro shrink-0 mt-0.5" />
                   <p className="text-[9px] text-slate-500 leading-tight italic">
                      Les heures sont extraites uniquement des saisies VALIDÉES par le responsable maintenance. Les saisies non validées ne sont pas comptabilisées dans le cumul vidange.
                   </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-hydro/30 bg-hydro/5 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-hydro">
                <AlertCircle className="h-4 w-4" /> Intégrité des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               <div>
                  <div className="flex items-center justify-between mb-1">
                     <span className="text-[10px] font-bold text-slate-600 uppercase">Saisies Manquantes</span>
                     <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] h-4">3 JOURS</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Engins SMI sans saisie pour les 3 derniers jours (calculs possiblement faussés).</p>
               </div>
               
               {isRespo && (
                 <div className="pt-2 border-t border-hydro/10">
                    <p className="text-[10px] mb-2 font-medium text-slate-600">Saisies non validées depuis &gt; 24h :</p>
                    <div className="flex gap-2 items-center">
                       <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">OM</div>
                       <div className="flex-1">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold">Ouacha Mohamed</span>
                             <span className="text-[10px] text-amber-600 font-bold">42h ago</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                             <div className="bg-amber-500 h-1 rounded-full w-[80%]" />
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
             <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Réalité Terrain</CardTitle>
             </CardHeader>
             <CardContent className="text-xs text-muted-foreground leading-relaxed italic space-y-2">
                <p>⚠️ Aucun engin n'a de compteur horaire physique sur ce site.</p>
                <p>Le calcul "Heures depuis dernière vidange" repose exclusivement sur la somme des heures saisies manuellement par la secrétaire après validation par le responsable.</p>
                <p>Une journée non saisie = 0 heure comptabilisée (peut fausser les rapports L/H).</p>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

