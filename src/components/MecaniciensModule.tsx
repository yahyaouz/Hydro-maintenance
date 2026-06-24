import * as React from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  History, 
  Calendar, 
  MapPin, 
  Award,
  Zap,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MoreVertical,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  User as UserIcon,
  X,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageBanner } from "@/components/ui/PageBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from "recharts";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Mechanic, Intervention, SiteID } from "@/types";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// DEMO DATA
const DEMO_MECANICIENS: Mechanic[] = [
  {
    id: "m1",
    name: "Maarouf Said",
    siteId: "SMI",
    speciality: "Expert Moteurs & Hydraulique",
    level: "Expert",
    score: 87,
    interventionsCount: 14,
    status: "ACTIF",
    joinedDate: "2020-03-15",
    averageSpeed: 92,
    qualityRate: 95
  },
  {
    id: "m2",
    name: "Ouhourane Hamid",
    siteId: "SMI",
    speciality: "Mécanicien Engins Lourds",
    level: "Confirmé",
    score: 62,
    interventionsCount: 8,
    status: "ACTIF",
    joinedDate: "2021-06-20",
    averageSpeed: 75,
    qualityRate: 80
  },
  {
    id: "m3",
    name: "Ben amar Hassan",
    siteId: "SMI",
    speciality: "Mécanicien Junior",
    level: "Junior",
    score: 34,
    interventionsCount: 2,
    status: "INACTIF",
    joinedDate: "2023-01-10",
    averageSpeed: 60,
    qualityRate: 70
  },
  {
    id: "m4",
    name: "Ait Belaid Brahim",
    siteId: "OUMEJRANE",
    speciality: "Électricien Engins",
    level: "Confirmé",
    score: 78,
    interventionsCount: 11,
    status: "ACTIF",
    joinedDate: "2021-02-12",
    averageSpeed: 85,
    qualityRate: 88
  }
];

const DEMO_INTERVENTIONS: Intervention[] = [
  {
    id: "int1",
    date: "2026-05-18",
    startTime: "09:00",
    endTime: "14:30",
    engin: "M-045",
    type: "REPARATION",
    description: "Changement de la pompe hydraulique principale suite à une perte de pression.",
    pieces: [{ name: "Pompe Hydro P2", quantity: 1 }, { name: "Joint torique 45mm", quantity: 2 }],
    duration: 5.5,
    status: "VALIDE",
    mecanicienId: "m1",
    siteId: "SMI"
  },
  {
    id: "int2",
    date: "2026-05-17",
    startTime: "10:00",
    endTime: "12:00",
    engin: "S-012",
    type: "VIDANGE",
    description: "Vidange moteur standard et remplacement des filtres.",
    pieces: [{ name: "Filtre Huile", quantity: 1 }, { name: "Huile 15W40", quantity: 25 }],
    duration: 2,
    status: "VALIDE",
    mecanicienId: "m1",
    siteId: "SMI"
  }
];

// RADAR DATA for Maarouf Said
const RADAR_DATA = [
  { subject: 'Productivité', A: 95, fullMark: 100 },
  { subject: 'Qualité', A: 90, fullMark: 100 },
  { subject: 'Rapidité', A: 85, fullMark: 100 },
  { subject: 'Polyvalence', A: 70, fullMark: 100 },
  { subject: 'Fiabilité', A: 95, fullMark: 100 },
];

const STATS_DATA = [
  { name: 'Jan', count: 12 },
  { name: 'Fév', count: 15 },
  { name: 'Mar', count: 10 },
  { name: 'Avr', count: 18 },
  { name: 'Mai', count: 14 },
];

export function MecaniciensModule({ view = "list" }: { view?: "list" | "fiche" | "interventions" | "saisies" | "ma_fiche" }) {
  const { user, activeSite } = useAuthStore();
  const [selectedMecanicien, setSelectedMecanicien] = React.useState<Mechanic | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  // If user is a mechanic, they can only see their own fiche or interventions or verify entries
  React.useEffect(() => {
    if (user?.role === "MECANICIEN") {
      const myId = "m1"; // Hardcoded for demo to match Maarouf Said
      setSelectedMecanicien(DEMO_MECANICIENS.find(m => m.id === myId) || null);
    }
  }, [user]);

  const filteredMecaniciens = DEMO_MECANICIENS.filter(m => 
    (activeSite === "TOUS" || m.siteId === activeSite)
  );

  const isManagement = ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER"].includes(user?.role || "");

  if (view === "list" && isManagement) {
    return <MecaniciensList filteredMecaniciens={filteredMecaniciens} onSelect={setSelectedMecanicien} />;
  }

  if (view === "fiche" || view === "ma_fiche") {
    const meca = selectedMecanicien || (user?.role === "MECANICIEN" ? DEMO_MECANICIENS[0] : null);
    if (!meca) return <div>Sélectionnez un mécanicien</div>;
    return <MecanicienFiche meca={meca} isSelf={user?.role === "MECANICIEN"} onBack={() => setSelectedMecanicien(null)} />;
  }

  if (view === "interventions") {
    return <InterventionsMecanicien mecaId={user?.role === "MECANICIEN" ? "m1" : (selectedMecanicien?.id || "m1")} />;
  }

  if (view === "saisies" && user?.role === "MECANICIEN") {
    return <VerifSaisiesMecanicien />;
  }

  return <div>Module non autorisé</div>;
}

function MecaniciensList({ filteredMecaniciens, onSelect }: { filteredMecaniciens: Mechanic[], onSelect: (m: Mechanic) => void }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const { activeSite } = useAuthStore();

  const displayMecaniciens = filteredMecaniciens.filter(m => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      (m.name || "").toLowerCase().includes(query) ||
      (m.speciality || "").toLowerCase().includes(query) ||
      (m.level || "").toLowerCase().includes(query) ||
      (m.siteId || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageBanner
        icon={Users}
        badgeLabel="Ressources Humaines & Compétences"
        title="Performance Équipes"
        subtitle="Suivi opérationnel des scores de rapidité, qualité de service et activités des mécaniciens"
        siteLabel={activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
      >
        <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 shadow-md cursor-pointer text-xs">
          <Plus className="mr-2 h-4 w-4" /> Ajouter Mécanicien
        </Button>
      </PageBanner>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <Input 
             placeholder="Rechercher un mécanicien..." 
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
           <Filter className="h-4 w-4" />
        </Button>
      </div>

      {displayMecaniciens.some(m => m.status === 'INACTIF') && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-4 items-center animate-in slide-in-from-top-4">
           <div className="h-10 w-10 flex items-center justify-center bg-amber-100 rounded-full text-amber-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
           </div>
           <div>
              <p className="text-xs font-bold text-amber-900">ALERTE ACTIVITÉ</p>
              <p className="text-[11px] text-amber-800 font-medium">Ben Amar Hassan est INACTIF depuis 4 jours (aucune intervention enregistrée).</p>
           </div>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm overflow-hidden">
         <CardContent className="p-0">
            <div className="overflow-x-auto text-sm">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                     <tr>
                        <th className="px-6 py-4">Mécanicien</th>
                        <th className="px-6 py-4">Site / Spécialité</th>
                        <th className="px-6 py-4">Activité</th>
                        <th className="px-6 py-4 text-center">Score / 100</th>
                        <th className="px-6 py-4 text-center">Interventions (Mois)</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {displayMecaniciens.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
                                    <AvatarFallback className="bg-slate-100 text-slate-900 font-bold text-xs">
                                       {m.name.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                 </Avatar>
                                 <div>
                                    <p className="font-bold text-slate-900">{m.name}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{m.level}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-xs font-bold text-slate-700 mb-0.5">{m.siteId}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{m.speciality}</p>
                           </td>
                           <td className="px-6 py-4">
                              <Badge className={cn(
                                 "text-[9px] font-bold tracking-widest px-2 py-0 h-5",
                                 m.status === 'ACTIF' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                 m.status === 'INACTIF' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-400 border-slate-100"
                              )} variant="outline">
                                 {m.status}
                              </Badge>
                           </td>
                           <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                 <span className={cn(
                                    "text-sm font-bold",
                                    m.score > 75 ? "text-emerald-600" : m.score > 50 ? "text-amber-600" : "text-red-600"
                                 )}>{m.score}</span>
                                 <div className="w-16 bg-slate-100 rounded-full h-1">
                                    <div className={cn(
                                       "h-1 rounded-full",
                                       m.score > 75 ? "bg-emerald-500" : m.score > 50 ? "bg-amber-500" : "bg-red-500"
                                    )} style={{ width: `${m.score}%` }} />
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-center font-bold text-slate-700">
                              {m.interventionsCount}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" onClick={() => onSelect(m)} className="text-hydro font-bold text-xs h-8 hover:bg-hydro/5">
                                 Ouvrir Fiche <ArrowRight className="ml-2 h-3 w-3" />
                              </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}

function MecanicienFiche({ meca, isSelf, onBack }: { meca: Mechanic, isSelf?: boolean, onBack: () => void }) {
  const [activeTab, setActiveTab] = React.useState<"performance" | "interventions">("performance");
  const { user } = useAuthStore();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-slate-50/30">
      <div className="flex items-center gap-4">
        {!isSelf && (
          <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10 text-slate-500 hover:bg-white border-transparent border hover:border-slate-200">
            <X className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 italic uppercase">Fiche Agent {meca.id}</h2>
          <p className="text-muted-foreground text-sm">Profil technique consolidé</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 h-9 font-bold text-xs">
              <Calendar className="h-3.5 w-3.5 mr-2" /> Historique complet
           </Button>
           {user?.role === "ADMIN" && (
             <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 h-9 font-bold text-xs">
                Modifier Profil
             </Button>
           )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* PROFILE HEADER CARD */}
        <Card className="lg:col-span-4 border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="h-32 bg-hydro/10 w-full flex items-end justify-center pb-0">
             <Avatar className="h-24 w-24 border-4 border-white shadow-lg translate-y-8">
                <AvatarFallback className="bg-slate-100 text-slate-900 font-bold text-2xl">
                   {meca.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
             </Avatar>
          </div>
          <CardContent className="pt-12 text-center pb-8">
             <h3 className="text-xl font-bold text-slate-900">{meca.name}</h3>
             <p className="text-hydro font-bold text-xs uppercase tracking-widest mt-1">{meca.speciality}</p>
             
             <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="text-left p-3 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Niveau</p>
                   <p className="text-sm font-bold text-slate-900">{meca.level}</p>
                </div>
                <div className="text-left p-3 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Site Affecté</p>
                   <p className="text-sm font-bold text-slate-900">{meca.siteId}</p>
                </div>
                <div className="text-left p-3 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Embauche</p>
                   <p className="text-sm font-bold text-slate-900">{meca.joinedDate}</p>
                </div>
                <div className="text-left p-3 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Status</p>
                   <Badge className="bg-emerald-50 text-emerald-600 text-[10px] h-5 px-2 font-bold">{meca.status}</Badge>
                </div>
             </div>
             
             <div className="mt-8 p-4 bg-slate-900 rounded-2xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-[10px] font-black tracking-[0.2em] text-slate-400">SCORE PERFORMANCE</p>
                   <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                   <span className="text-5xl font-black italic">{meca.score}</span>
                   <span className="text-sm font-bold text-slate-500">/ 100</span>
                </div>
                <Progress value={meca.score} className="h-2 bg-slate-800" />
                <p className="text-[10px] text-slate-500 mt-3 italic font-medium">Recalculé chaque semaine - Top 10% de l'équipe</p>
             </div>
          </CardContent>
        </Card>

        {/* DETAILS CARD */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit">
             <Button 
                variant={activeTab === "performance" ? "secondary" : "ghost"} 
                className={cn("h-9 font-bold text-xs px-6", activeTab === "performance" && "bg-slate-100")}
                onClick={() => setActiveTab("performance")}
             >
                ANALYSE PERFORMANCE
             </Button>
             <Button 
                variant={activeTab === "interventions" ? "secondary" : "ghost"} 
                className={cn("h-9 font-bold text-xs px-6", activeTab === "interventions" && "bg-slate-100")}
                onClick={() => setActiveTab("interventions")}
             >
                HISTORIQUE INTERVENTIONS
             </Button>
          </div>

          {activeTab === "performance" ? (
            <div className="grid gap-6 md:grid-cols-2">
               <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                     <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Graphe de Compétences</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] pb-8">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                           <PolarGrid stroke="#e2e8f0" />
                           <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                           <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                           <Radar
                              name="Maarouf Said"
                              dataKey="A"
                              stroke="#0284c7"
                              fill="#0284c7"
                              fillOpacity={0.4}
                           />
                        </RadarChart>
                     </ResponsiveContainer>
                  </CardContent>
               </Card>

               <Card className="border-slate-200 shadow-sm">
                  <CardHeader>
                     <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Activité (Interventions/mois)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px] pb-8">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={STATS_DATA}>
                           <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                           <YAxis fontSize={10} axisLine={false} tickLine={false} />
                           <RechartsTooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                           <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </CardContent>
               </Card>

               <Card className="md:col-span-2 border-slate-200 shadow-sm">
                  <CardHeader>
                     <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Détail du Score (Composantes)</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-600">Productivité (30 pts)</span>
                              <span className="text-xs font-black text-hydro">28.5</span>
                           </div>
                           <Progress value={95} className="h-1.5" />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-600">Qualité Taux (25 pts)</span>
                              <span className="text-xs font-black text-emerald-600">22.5</span>
                           </div>
                           <Progress value={90} className="h-1.5 bg-slate-100" />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-600">Rapidité (20 pts)</span>
                              <span className="text-xs font-black text-amber-600">17.0</span>
                           </div>
                           <Progress value={85} className="h-1.5 bg-slate-100" />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-slate-600">Fiabilité (25 pts)</span>
                              <span className="text-xs font-black text-hydro">24.0</span>
                           </div>
                           <Progress value={96} className="h-1.5" />
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
          ) : (
            <Card className="border-slate-200 shadow-sm overflow-hidden">
               <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                     {DEMO_INTERVENTIONS.map(int => (
                        <div key={int.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                           <div className="flex gap-4">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                 <Wrench className="h-5 w-5" />
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-slate-900">{int.engin} • {int.type}</h4>
                                    <Badge variant="outline" className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border-emerald-100">{int.status}</Badge>
                                 </div>
                                 <p className="text-[11px] text-muted-foreground">{int.date} • {int.duration}h • {int.pieces.length} pièces</p>
                                 <p className="text-xs text-slate-600 mt-1 line-clamp-1">{int.description}</p>
                              </div>
                           </div>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <ArrowRight className="h-4 w-4" />
                           </Button>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InterventionsMecanicien({ mecaId }: { mecaId: string }) {
  const [showDialog, setShowDialog] = React.useState(false);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight uppercase italic text-slate-900">Mes Interventions</h2>
          <p className="text-muted-foreground text-sm">Gestion et saisie des opérations de maintenance</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger
            render={
              <Button className="bg-hydro">
                <Plus className="mr-2 h-4 w-4" /> Saisir Intervention
              </Button>
            }
          />
          <DialogContent className="max-w-2xl">
             <DialogHeader>
                <DialogTitle>Nouvelle Intervention Technique</DialogTitle>
             </DialogHeader>
             <form className="space-y-6 pt-4" onSubmit={(e) => { e.preventDefault(); toast.success("Intervention envoyée pour validation"); setShowDialog(false); }}>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Engin</Label>
                      <Select defaultValue="m045">
                         <SelectTrigger h-10>
                            <SelectValue placeholder="Choisir engin" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="m045">M-045 (ST2G)</SelectItem>
                            <SelectItem value="s012">S-012 (ST7)</SelectItem>
                            <SelectItem value="p002">P-002 (ST2D)</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Type Intervention</Label>
                      <Select defaultValue="REPARATION">
                         <SelectTrigger h-10>
                            <SelectValue placeholder="Choisir type" />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="VIDANGE">Vidange</SelectItem>
                            <SelectItem value="REPARATION">Réparation</SelectItem>
                            <SelectItem value="REMPLACEMENT">Remplacement Pièce</SelectItem>
                            <SelectItem value="INSPECTION">Inspection</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Date</Label>
                      <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Début</Label>
                      <Input type="time" defaultValue="08:00" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Fin</Label>
                      <Input type="time" defaultValue="12:00" />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase text-slate-500">Description des travaux réalisés</Label>
                   <Textarea placeholder="Décrivez l'intervention en détail..." className="min-h-[100px]" />
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase text-slate-500">Pièces utilisées & Quantités</Label>
                   <Input placeholder="Ex: Filtre Huile x1, Joint Torique x2..." />
                   <p className="text-[10px] text-slate-400 italic">Lie automatiquement aux sorties de stock après validation.</p>
                </div>

                <DialogFooter>
                   <Button type="submit" className="w-full bg-hydro h-11 font-bold">SOUMETTRE POUR VALIDATION</Button>
                </DialogFooter>
             </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200">
         <CardHeader className="bg-slate-50/50">
            <CardTitle className="text-sm font-bold uppercase text-slate-500">Historique Récent</CardTitle>
         </CardHeader>
         <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
               {DEMO_INTERVENTIONS.filter(i => i.mecanicienId === mecaId).map(int => (
                  <div key={int.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex gap-4">
                        <div className={cn(
                           "h-10 w-10 rounded-xl flex items-center justify-center border",
                           int.status === 'VALIDE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                           <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{int.engin} • {int.type}</h4>
                              <Badge variant="outline" className={cn(
                                 "text-[9px] font-bold uppercase",
                                 int.status === 'VALIDE' ? "text-emerald-600 border-emerald-100" : "text-amber-600 border-amber-100"
                              )}>{int.status}</Badge>
                           </div>
                           <p className="text-[11px] text-muted-foreground">{int.date} • {int.startTime} à {int.endTime} ({int.duration}h)</p>
                           <p className="text-xs text-slate-600 mt-1">{int.description}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 text-slate-400">
                           <MoreVertical className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
               ))}
               {DEMO_INTERVENTIONS.filter(i => i.mecanicienId === mecaId).length === 0 && (
                 <div className="p-8 text-center text-slate-400 italic text-sm">
                    Aucune intervention enregistrée pour le moment.
                 </div>
               )}
            </div>
         </CardContent>
      </Card>
    </div>
  );
}

function VerifSaisiesMecanicien() {
  const { user } = useAuthStore();
  const [reportDialog, setReportDialog] = React.useState<string | null>(null);

  const mockSaisiesSmi = [
    { id: "1", date: "2026-05-19", engin: "M-045", poste: "JOUR", heures: 12, activite: "Poste Jour - Fond", site: "SMI" },
    { id: "2", date: "2026-05-18", engin: "M-045", poste: "JOUR", heures: 12, activite: "Poste Jour - Fond", site: "SMI" },
    { id: "3", date: "2026-05-16", engin: "M-045", poste: "NUIT", heures: 12, activite: "Poste Nuit - Fond", site: "SMI" },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight uppercase italic text-slate-900">Vérification des Saisies</h2>
        <p className="text-muted-foreground text-sm">Contrôlez les heures saisies par la secrétaire pour vos engins</p>
      </div>

      <div className="p-4 bg-hydro/5 border border-hydro/20 rounded-xl flex gap-3 items-start">
         <ShieldCheck className="h-5 w-5 text-hydro shrink-0 mt-0.5" />
         <p className="text-[11px] text-slate-600 font-medium italic">
            Cette interface vous permet de confirmer que les heures de travail enregistrées correspondent à la réalité terrain. 
            Si vous remarquez une erreur, signalez-la immédiatement : la secrétaire sera notifiée pour correction.
         </p>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Engin</th>
                        <th className="px-6 py-4">Poste</th>
                        <th className="px-6 py-4">H Saisies</th>
                        <th className="px-6 py-4">Activité</th>
                        <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {mockSaisiesSmi.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 font-bold text-slate-700">{s.date}</td>
                           <td className="px-6 py-4 font-bold text-slate-900">{s.engin}</td>
                           <td className="px-6 py-4 text-slate-600">{s.poste}</td>
                           <td className="px-6 py-4 font-mono font-bold">{s.heures}h</td>
                           <td className="px-6 py-4 text-slate-500 italic text-xs">{s.activite}</td>
                           <td className="px-6 py-4 text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 border-red-100 hover:bg-red-50 font-bold text-[10px] h-7"
                                onClick={() => setReportDialog(s.id)}
                              >
                                 SIGNALER ERREUR
                              </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </CardContent>
      </Card>

      <Dialog open={!!reportDialog} onOpenChange={() => setReportDialog(null)}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Signaler une erreur de saisie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
               <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs font-medium">
                  Informez la secrétaire de l'erreur constatée pour la saisie du {mockSaisiesSmi.find(s => s.id === reportDialog)?.date}.
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">Commentaire / Correction proposée</Label>
                  <Textarea placeholder="Ex: L'engin a travaillé 8h seulement, fin à 16h et non 20h..." />
               </div>
               <DialogFooter>
                  <Button variant="ghost" onClick={() => setReportDialog(null)}>Annuler</Button>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={() => { toast.success("Signalement envoyé"); setReportDialog(null); }}>ENVOYER SIGNALEMENT</Button>
               </DialogFooter>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
