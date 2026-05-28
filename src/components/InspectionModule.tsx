import * as React from "react";
import { 
  ShieldAlert, 
  CheckSquare, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Wrench, 
  ClipboardCheck, 
  TrendingUp, 
  PlusCircle, 
  Cpu, 
  History, 
  Gauge,
  Sliders,
  AlertCircle,
  Truck,
  ArrowRight,
  Sparkles,
  Bot,
  User,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Real-world mining equipment structure
const ENGINS_DEMO = [
  { id: "ST7-01", name: "Scooptram ST7-01", model: "ST7", site: "SMI", family: "Scooptram" },
  { id: "ST7-02", name: "Scooptram ST7-02", model: "ST7", site: "SMI", family: "Scooptram" },
  { id: "ST2D-01", name: "Scooptram ST2D-01", model: "ST2D", site: "KOUDIA", family: "Scooptram" },
  { id: "ST2G-03", name: "Scooptram ST2G-03", model: "ST2G", site: "OUMEJRANE", family: "Scooptram" },
  { id: "T23-01", name: "Perforateur Montalbert T23-01", model: "T23", site: "BOU-AZZER", family: "Perforateur" },
  { id: "T23-02", name: "Perforateur Montalbert T23-02", model: "T23", site: "OUANSIMI", family: "Perforateur" },
];

interface InspectionCheck {
  id: string;
  name: string;
  category: "HSE" | "MECANIQUE" | "HYDRAULIQUE" | "ELECTRIQUE";
  isCritical: boolean; // safety-critical: triggers machine stoppage if failed
}

const CHECKLIST_ITEMS: InspectionCheck[] = [
  { id: "ansul", name: "Système incendie Ansul (Goupille, Pression & Tresse)", category: "HSE", isCritical: true },
  { id: "service_brakes", name: "Freins de service & Frein de secours (Essai de freinage sous charge)", category: "HSE", isCritical: true },
  { id: "escape_hatch", name: "Cabine ROPS/FOPS & Trappe d'évacuation d'urgence", category: "HSE", isCritical: true },
  { id: "steering_pivot", name: "Axe d'articulation central & Cylindres de direction", category: "HYDRAULIQUE", isCritical: true },
  { id: "hoses_engine", name: "HP Tuyauteries compartiment moteur (Absence d'usure par friction)", category: "HYDRAULIQUE", isCritical: true },
  { id: "hydro_leaks", name: "Fuites d'huile hydraulique (Absence de jet sous pression)", category: "HYDRAULIQUE", isCritical: false },
  { id: "tire_damage", name: "Pneumatiques (Zéro coupure flanc, vérification serrage écrous)", category: "MECANIQUE", isCritical: false },
  { id: "bucket_teeth", name: "Dents du godet, biellette & axes de levage", category: "MECANIQUE", isCritical: false },
  { id: "lights_horn", name: "Phares de travail AV/AR, Gyrophare & Avertisseur sonore de recul", category: "HSE", isCritical: false },
  { id: "electrical_harness", name: "Câblages électriques & Faisceau moteur (Isolation)", category: "ELECTRIQUE", isCritical: false },
];

interface InspectionReport {
  id: string;
  date: string;
  operator: string;
  enginId: string;
  siteId: string;
  status: "APTE" | "ARRÊTÉ" | "RESTREINT";
  criticalFailures: string[];
  minorFailures: string[];
  notes?: string;
}

interface Anomaly {
  id: string;
  date: string;
  enginId: string;
  siteId: string;
  item: string;
  category: "HSE" | "MECANIQUE" | "HYDRAULIQUE" | "ELECTRIQUE";
  severity: "CRITIQUE" | "CRITIQUE - BLOQUANT" | "MINEURE";
  checklistId: string;
  status: "OUVERT" | "BT_CRÉÉ" | "RÉSOLU";
  btNumber?: string;
  reportedBy: string;
}

export function InspectionModule() {
  const { user, activeSite } = useAuthStore();
  const canCreateBT = ["ADMIN", "SECRETAIRE", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER"].includes(user?.role || "");
  const canResolveAnomaly = ["ADMIN", "MECANICIEN", "RESPONSABLE_MAINTENANCE"].includes(user?.role || "");
  const [activeSubTab, setActiveSubTab] = React.useState<"dashboard" | "new" | "reg">("dashboard");

  // Local storage state persistence for Demo purposes
  const [inspections, setInspections] = React.useState<InspectionReport[]>(() => {
    const saved = localStorage.getItem("hydromines_inspections");
    return saved ? JSON.parse(saved) : [
      { id: "INS-001", date: "2026-05-19T08:00:00Z", operator: "Maarouf Said", enginId: "ST7-01", siteId: "SMI", status: "APTE", criticalFailures: [], minorFailures: [], notes: "Prise de poste nominale." },
      { id: "INS-002", date: "2026-05-18T14:30:00Z", operator: "Kassi Ibrahim", enginId: "ST2G-03", siteId: "OUMEJRANE", status: "ARRÊTÉ", criticalFailures: ["Friction des tuyauteries HP compartiment moteur", "Freins de service non conformes"], minorFailures: ["Phares de travail AR HS"], notes: "Essai de frein sous charge glissant. Machine consignée temporairement." },
      { id: "INS-003", date: "2026-05-17T20:15:00Z", operator: "Yassine B.", enginId: "T23-01", siteId: "BOU-AZZER", status: "RESTREINT", criticalFailures: [], minorFailures: ["Fuite hydraulique sur flexible godet"], notes: "Fonctionnement autorisé mais surveillance de niveau d'huile requise à chaque fin de poste." }
    ];
  });

  const [anomalies, setAnomalies] = React.useState<Anomaly[]>(() => {
    const saved = localStorage.getItem("hydromines_anomalies");
    return saved ? JSON.parse(saved) : [
      { id: "AN-101", date: "2026-05-18T14:30:00Z", enginId: "ST2G-03", siteId: "OUMEJRANE", item: "Freins de service & secours", category: "HSE", severity: "CRITIQUE - BLOQUANT", checklistId: "INS-002", status: "OUVERT", reportedBy: "Kassi Ibrahim" },
      { id: "AN-102", date: "2026-05-18T14:30:00Z", enginId: "ST2G-03", siteId: "OUMEJRANE", item: "Tuyauteries HP compartiment moteur", category: "HYDRAULIQUE", severity: "CRITIQUE - BLOQUANT", checklistId: "INS-002", status: "BT_CRÉÉ", btNumber: "BT-90212", reportedBy: "Kassi Ibrahim" },
      { id: "AN-103", date: "2026-05-17T20:15:00Z", enginId: "T23-01", siteId: "BOU-AZZER", item: "Fuites d'huile hydraulique", category: "HYDRAULIQUE", severity: "MINEURE", checklistId: "INS-003", status: "OUVERT", reportedBy: "Yassine B." }
    ];
  });

  // State for new inspection form
  const [selectedEngin, setSelectedEngin] = React.useState(ENGINS_DEMO[0].id);
  const [operatorName, setOperatorName] = React.useState(user?.displayName || "Superviseur Underground");
  const [notesForm, setNotesForm] = React.useState("");
  const [checks, setChecks] = React.useState<Record<string, "OK" | "FAIL">>({});

  // Chat/Diagnostic helper state
  const [selectedAnomalyForChat, setSelectedAnomalyForChat] = React.useState<Anomaly | null>(null);
  const [chatMessages, setChatMessages] = React.useState<any[]>([
    { role: "assistant", content: "Sélectionnez une anomalie d'inspection pour que je puisse générer un diagnostic d'arbre de défaillance (Fault-Tree Analysis) et des rames de réparation conformes aux directives de Sandvik / Caterpillar." }
  ]);
  const [chatInput, setChatInput] = React.useState("");
  const [isChatLoading, setIsChatLoading] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem("hydromines_inspections", JSON.stringify(inspections));
  }, [inspections]);

  React.useEffect(() => {
    localStorage.setItem("hydromines_anomalies", JSON.stringify(anomalies));
  }, [anomalies]);

  // Filter lists based on selected site
  const filteredInspections = inspections.filter(i => activeSite === "TOUS" || i.siteId === activeSite);
  const filteredAnomalies = anomalies.filter(a => activeSite === "TOUS" || a.siteId === activeSite);

  // KPIs Calculations according to world-class standards
  const complianceRate = filteredInspections.length > 0
    ? Math.round((filteredInspections.filter(i => i.status === "APTE").length / filteredInspections.length) * 100)
    : 100;

  const totalBlockages = filteredInspections.filter(i => i.status === "ARRÊTÉ").length;
  const unresolvedDefects = filteredAnomalies.filter(a => a.status === "OUVERT").length;

  const statsByStatus = [
    { name: "Opérationnels (Apte)", value: filteredInspections.filter(i => i.status === "APTE").length, color: "#10B981" },
    { name: "Arrêtés (Sécurité Conclue)", value: filteredInspections.filter(i => i.status === "ARRÊTÉ").length, color: "#EF4444" },
    { name: "Usage Restreint", value: filteredInspections.filter(i => i.status === "RESTREINT").length, color: "#F59E0B" },
  ];

  // Submission handler
  const handleSubmitInspection = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if machine is locked globally in localStorage LOTO
    const lotoDataStr = localStorage.getItem("sg_safety_loto_statuses");
    if (lotoDataStr) {
      const safetyLotoStatuses = JSON.parse(lotoDataStr);
      const isLotoActive = safetyLotoStatuses[selectedEngin]?.statutLOTO === "ACTIF";
      if (isLotoActive) {
        toast.error(`🚨 ALERTE LOTO - BLOCAGE ABSOLU : L'engin ${selectedEngin} est sous consignation active. Tout essai ou inspection est interdit.`);
        return;
      }
    }

    const selectedEnginObj = ENGINS_DEMO.find(e => e.id === selectedEngin);
    if (!selectedEnginObj) return;

    const criticalFailed: string[] = [];
    const minorFailed: string[] = [];

    CHECKLIST_ITEMS.forEach(item => {
      if (checks[item.id] === "FAIL") {
        if (item.isCritical) {
          criticalFailed.push(item.name);
        } else {
          minorFailed.push(item.name);
        }
      }
    });

    let overallStatus: "APTE" | "ARRÊTÉ" | "RESTREINT" = "APTE";
    if (criticalFailed.length > 0) {
      overallStatus = "ARRÊTÉ";
    } else if (minorFailed.length > 0) {
      overallStatus = "RESTREINT";
    }

    const newInsId = `INS-${Date.now().toString().slice(-4)}`;
    const newIns: InspectionReport = {
      id: newInsId,
      date: new Date().toISOString(),
      operator: operatorName,
      enginId: selectedEngin,
      siteId: selectedEnginObj.site,
      status: overallStatus,
      criticalFailures: criticalFailed,
      minorFailures: minorFailed,
      notes: notesForm || "Inspection réalisée via cockpit digital."
    };

    // Logging resulting anomalies
    const newAnoms: Anomaly[] = [];
    CHECKLIST_ITEMS.forEach(item => {
      if (checks[item.id] === "FAIL") {
        newAnoms.push({
          id: `AN-${Date.now().toString().slice(-3)}-${item.id.slice(0, 3)}`,
          date: new Date().toISOString(),
          enginId: selectedEngin,
          siteId: selectedEnginObj.site,
          item: item.name,
          category: item.category,
          severity: item.isCritical ? "CRITIQUE - BLOQUANT" : "MINEURE",
          checklistId: newInsId,
          status: "OUVERT",
          reportedBy: operatorName
        });
      }
    });

    setInspections(prev => [newIns, ...prev]);
    if (newAnoms.length > 0) {
      setAnomalies(prev => [...newAnoms, ...prev]);
    }

    toast.success(
      overallStatus === "ARRÊTÉ"
        ? "🚨 INSPECTION SECCIEUSE : Engin consigné immédiatement pour des raisons de sécurité !"
        : "Inspection enregistrée avec succès."
    );

    // Reset states
    setNotesForm("");
    setChecks({});
    setActiveSubTab("dashboard");
  };

  const createWorkOrder = (anomalyId: string) => {
    const btId = `BT-${Math.floor(Math.random() * 90000) + 10000}`;
    setAnomalies(prev => prev.map(a => {
      if (a.id === anomalyId) {
        return { ...a, status: "BT_CRÉÉ", btNumber: btId };
      }
      return a;
    }));
    toast.success(`GMAO & SAP PM : Bon de travail ${btId} généré avec succès pour cette déficience.`);
  };

  const resolveAnomaly = (anomalyId: string) => {
    setAnomalies(prev => prev.map(a => {
      if (a.id === anomalyId) {
        return { ...a, status: "RÉSOLU" };
      }
      return a;
    }));
    toast.success("Statut mis à jour : L'anomalie d'inspection a été marquée comme résolue.");
  };

  // Diagnostic generation via dynamic Gemini mockup / prompt simulation
  const startAIDiagnosticChat = async (anomaly: Anomaly) => {
    setSelectedAnomalyForChat(anomaly);
    setChatMessages([
      { role: "assistant", content: `🔍 ANALYSE DE DÉFAILLANCE EN COURS : Anomalie "${anomaly.item}" sur l'engin ${anomaly.enginId}. \n\nBonjour, je lance un diagnostic expert. S'agissant d'un problème classé comme **${anomaly.severity}**, la mine underground recommande le protocole strict.\n\nQuelle est l'allure des pressions, les bruits constatés ou les codes d'erreurs relevés sur le tableau de bord de la cabine ?` }
    ]);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isChatLoading || !selectedAnomalyForChat) return;

    const userMsg = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsLoading(true);

    try {
      // Direct integration of LLM response schema or rule checklist for diagnostics
      setTimeout(() => {
        let answer = "";
        if (selectedAnomalyForChat.item.includes("brakes") || selectedAnomalyForChat.item.includes("Freins")) {
          answer = `📋 **ARBRE DE RÉSULTATS : Perte d'efficacité de Frein de Service (SMI / Sandvik Tech Support)** \n\n1. **Causes Racines Détectées** :\n   - Chute de la pression de pré-charge de l'accumulateur hydraulique (azote).\n   - Dissipation ou usure des disques de friction à bain d'huile du carter d'essieu.\n   - Présence d'air dans le collecteur de signal pilote de freinage.\n\n2. **Plan d'Action Immédiat (HSE / GMAO)** :\n   - Mesurer la pression de commande au niveau du bloc vannes de freinage (Doit être stable à 120-140 bars).\n   - Vérifier le niveau d'huile du circuit de refroidissement des freins.\n   - Purger l'air du circuit hydraulique secondaire. \n\nRecommandé avant levée de consignation : Remplacement du manifold si la vanne solénoïde de décharge fuit.`;
        } else if (selectedAnomalyForChat.item.includes("HP") || selectedAnomalyForChat.item.includes("Tuyauteries")) {
          answer = `📋 ** PROTOCOLE DE RECALIBRAGE : Risque d'incendie sur circuit HP compartiment moteur** \n\n1. **Règle de Sécurité Interne (Ansul NFPA 122)** :\n   - Tout suintement ou usure par friction sur un flexible de pression supérieure à 50 bars compartiment moteur doit entraîner le remplacement immédiat avant remise en service souterraine.\n\n2. **Procédure de réparation** :\n   - Remplacer le tronçon flexible entaché par un flexible renforcé double-tresse métallique (norme SAE 100 R12 ou R15).\n   - Installer des colliers de maintien et gaines de protection thermo-résistantes spiralées afin d'éviter tout frottement futur avec la carlingue moteur.\n   - Tester le régime moteur à pleine charge sous galerie et s'assurer qu'aucun contact dynamique n'existe.`;
        } else {
          answer = `📋 **DIAGNOSTIC TECHNIQUE GÉNÉRIQUE** :\n- **Cause probable** : Desserrage mécanique ou corrosion suite au milieu souterrain très acide.\n- **Action recommandée** : Retirer la pièce usée, réaliser un nettoyage à pression d'eau, brosser et appliquer une protection anti-corrosion.\n- **Statut GMAO** : Générer une demande de pièce (Code SAP / Stock disponible) avant l'arrêt de poste de nuit.`;
        }

        setChatMessages(prev => [...prev, { role: "assistant", content: answer }]);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const setIsLoading = (loading: boolean) => {
    setIsChatLoading(loading);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase italic text-slate-900 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-red-600" /> Mode Inspection Pro
          </h2>
          <p className="text-muted-foreground text-sm">
            Fiches de contrôle digitales Prise de Poste (HSE, Freins, Ansul, HP Hydraulique)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={activeSubTab === "dashboard" ? "secondary" : "ghost"}
            onClick={() => setActiveSubTab("dashboard")}
            className="text-xs font-bold uppercase tracking-wider h-11"
          >
            <Gauge className="mr-1.5 h-4 w-4" /> Cockpit HSE
          </Button>
          <Button 
            variant={activeSubTab === "new" ? "secondary" : "ghost"}
            onClick={() => setActiveSubTab("new")}
            className="text-xs font-bold uppercase tracking-wider h-11 bg-red-600 text-white hover:bg-red-700"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Nouvelle Fiche
          </Button>
          <Button 
            variant={activeSubTab === "reg" ? "secondary" : "ghost"}
            onClick={() => setActiveSubTab("reg")}
            className="text-xs font-bold uppercase tracking-wider h-11"
          >
            <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Defect Book ({filteredAnomalies.length})
          </Button>
        </div>
      </div>

      {/* SUB TAB: DASHBOARD */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {/* Key Indicators Banner */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-red-200 bg-red-50/50 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Arrêts de Sécurité</p>
                    <h3 className="text-3xl font-black text-red-900 mt-2">{totalBlockages}</h3>
                  </div>
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <p className="text-[10px] text-red-700 font-bold mt-2 uppercase">🔴 Risques majeurs ou essais freins KO</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Taux de Conformité</p>
                    <h3 className="text-3xl font-black text-emerald-600 mt-2">{complianceRate}%</h3>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${complianceRate}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/20 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Anomalies Actives</p>
                    <h3 className="text-3xl font-black text-amber-600 mt-2">{unresolvedDefects}</h3>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                </div>
                <p className="text-[10px] text-amber-700 font-semibold mt-2">Défauts en attente d'action corrective</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contrôles Réalisés</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-2">{filteredInspections.length}</h3>
                  </div>
                  <ClipboardCheck className="h-10 w-10 text-hydro" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Inspections transmises ce jour</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase text-slate-700">Conformité par Site Souterrain</CardTitle>
                <CardDescription>Critères de sécurité requis en galerie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "SMI", conformes: 92, nonConformes: 8 },
                      { name: "OUMEJRANE", conformes: 80, nonConformes: 20 },
                      { name: "KOUDIA", conformes: 88, nonConformes: 12 },
                      { name: "BOU-AZZER", conformes: 95, nonConformes: 5 },
                      { name: "OUANSIMI", conformes: 85, nonConformes: 15 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickFormatter={(v) => `${v}%`} />
                      <RechartsTooltip />
                      <Bar dataKey="conformes" name="Compliant" stackId="a" fill="#10B981" />
                      <Bar dataKey="nonConformes" name="Stoppage/Defect" stackId="a" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase text-slate-700">État de la Flotte</CardTitle>
                <CardDescription>Résultat global des contrôles terrain</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statsByStatus.filter(s => s.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold uppercase mt-2">
                  {statsByStatus.map((s, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-slate-600">{s.name} ({s.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transmissions list */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="py-4 bg-slate-50/50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-slate-700 flex items-center gap-2">
                <History className="h-4 w-4 text-slate-500" /> Historique récent des inspections de poste
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {filteredInspections.map((ins) => (
                  <div key={ins.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-all">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
                        ins.status === "APTE" ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                        ins.status === "ARRÊTÉ" ? "bg-red-50 border-red-200 text-red-600" : "bg-amber-50 border-amber-200 text-amber-600"
                      )}>
                        {ins.status === "APTE" ? <CheckCircle2 className="h-5 w-5" /> :
                         ins.status === "ARRÊTÉ" ? <XCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">{ins.id}</span>
                          <span className="font-black text-slate-900 text-sm">{ins.enginId}</span>
                          <Badge variant="outline" className="text-[9px] font-bold uppercase px-2 h-5 bg-white border-slate-200">
                            {ins.siteId}
                          </Badge>
                          <Badge className={cn(
                            "text-[8px] font-bold uppercase tracking-wider",
                            ins.status === "APTE" ? "bg-emerald-500 hover:bg-emerald-600 text-white" :
                            ins.status === "ARRÊTÉ" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"
                          )}>
                            {ins.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Opérateur : <span className="font-semibold text-slate-700">{ins.operator}</span> • Date : <span className="font-medium text-slate-600">{new Date(ins.date).toLocaleString()}</span>
                        </p>
                        {ins.criticalFailures.length > 0 && (
                          <p className="text-xs text-red-600 mt-2 font-semibold">
                            ⚠️ Bloquant : {ins.criticalFailures.join(", ")}
                          </p>
                        )}
                        {ins.minorFailures.length > 0 && (
                          <p className="text-xs text-amber-600 mt-1 font-semibold">
                            ⚠️ Mineur : {ins.minorFailures.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    {ins.notes && (
                      <div className="max-w-md w-full bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs italic text-slate-600">
                        "{ins.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUB TAB: NEW CHECKLIST FORM */}
      {activeSubTab === "new" && (
        <Card className="border-slate-200 shadow-sm max-w-4xl mx-auto">
          <CardHeader className="bg-red-500 text-white rounded-t-xl py-6">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <ShieldAlert className="h-6 w-6" /> Fiche Digitale d'Inspection Prise de Poste
            </CardTitle>
            <CardDescription className="text-red-100">
              Tout résultat non conforme sur un équipement marqué CRITIQUE déclenche un gel opérationnel immédiat de l'engin (LOTO - Lockout Tagout).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmitInspection} className="space-y-6">
              {/* Fleet Selection */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Choisir l'engin à inspecter</label>
                  <select 
                    value={selectedEngin}
                    onChange={(e) => setSelectedEngin(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:border-red-500 outline-none"
                  >
                    {ENGINS_DEMO.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.site})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Nom de l'opérateur / Mécanicien</label>
                  <Input 
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    placeholder="Saisir nom complet" 
                    required 
                    className="h-10 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Checklist details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Éléments de contrôle sécurité obligatoires :</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {CHECKLIST_ITEMS.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start gap-3">
                        {item.isCritical ? (
                          <Badge variant="destructive" className="text-[8px] font-black uppercase tracking-wider h-5 shrink-0 px-1.5 pt-0.5">
                            CRITIQUE
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-wider h-5 shrink-0 px-1.5 pt-0.5 text-slate-500 border-slate-200">
                            STANDARD
                          </Badge>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Catégorie : {item.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setChecks(prev => ({ ...prev, [item.id]: "OK" }))}
                          className={cn(
                            "flex-1 md:flex-none text-[10px] font-bold uppercase tracking-wider h-8 px-4 rounded-lg border transition-all",
                            checks[item.id] === "OK" 
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" 
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          CONFORME (OK)
                        </button>
                        <button
                          type="button"
                          onClick={() => setChecks(prev => ({ ...prev, [item.id]: "FAIL" }))}
                          className={cn(
                            "flex-1 md:flex-none text-[10px] font-bold uppercase tracking-wider h-8 px-4 rounded-lg border transition-all",
                            checks[item.id] === "FAIL" 
                              ? "bg-red-500 border-red-500 text-white shadow-sm font-black animate-pulse" 
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          ANOMALIE (KO)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks area */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500">Observations techniques terrain</label>
                <textarea 
                  value={notesForm}
                  onChange={(e) => setNotesForm(e.target.value)}
                  placeholder="Signaler tout détail pertinent : pressions anormales, fuites lentes, bruits, vibrations tunnels..."
                  className="w-full min-h-[80px] p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none shadow-inner"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveSubTab("dashboard")}
                  className="h-11 font-bold text-xs uppercase tracking-wider border-slate-200"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="h-11 bg-red-600 hover:bg-red-700 font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-red-100"
                >
                  Transmettre la fiche d'inspection
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* SUB TAB: DEFECT BOOK (ANOMALIES) */}
      {activeSubTab === "reg" && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* List of Anomalies */}
          <Card className="md:col-span-2 border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-180px)]">
            <CardHeader className="py-4 bg-slate-50 border-b">
              <CardTitle className="text-sm font-bold uppercase text-slate-700 flex items-center justify-between">
                <span>Registre des Anomalies Actives (Defect Book)</span>
                <Badge className="bg-amber-500 text-white font-mono">{filteredAnomalies.length}</Badge>
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="divide-y divide-slate-100">
                {filteredAnomalies.map((anom) => (
                  <div 
                    key={anom.id} 
                    className={cn(
                      "p-4 relative hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col gap-3",
                      selectedAnomalyForChat?.id === anom.id && "bg-slate-50 border-l-4 border-l-red-500"
                    )}
                    onClick={() => startAIDiagnosticChat(anom)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-400">{anom.id}</span>
                          <span className="font-bold text-slate-900">{anom.enginId}</span>
                          <Badge className="bg-slate-900 text-[8px] uppercase">{anom.siteId}</Badge>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[8px] font-black uppercase tracking-widest",
                              anom.severity.includes("BLOQUANT") 
                                ? "text-red-600 border-red-100 bg-red-50 animate-pulse" 
                                : "text-amber-600 border-amber-100 bg-amber-50"
                            )}
                          >
                            {anom.severity}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-slate-800 italic">"{anom.item}"</p>
                      </div>
                      <Badge className={cn(
                        "text-[9px] font-bold uppercase",
                        anom.status === "OUVERT" ? "bg-amber-100 text-amber-800 border-amber-200" :
                        anom.status === "BT_CRÉÉ" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"
                      )}>
                        {anom.status === "OUVERT" ? "OUVERT" : anom.status === "BT_CRÉÉ" ? `BT CRÉÉ (${anom.btNumber})` : "RÉSOLU"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Signalé par {anom.reportedBy} le {new Date(anom.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-1">
                        {anom.status === "OUVERT" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (!canCreateBT) {
                                  toast.error("Accès réservé Secrétaire / Chantiers / Maintenance");
                                  return;
                                }
                                createWorkOrder(anom.id); 
                              }}
                              className={cn(
                                "text-[11px] h-11 font-black border-slate-200 uppercase px-3 shadow-sm",
                                canCreateBT ? "bg-white text-slate-700 hover:text-hydro hover:bg-slate-50" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                              )}
                            >
                              Créer BT
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                if (!canResolveAnomaly) {
                                  toast.error("Accès réservé Mécanicien / Maintenance / Admin");
                                  return;
                                }
                                resolveAnomaly(anom.id); 
                              }}
                              className={cn(
                                "text-[11px] h-11 font-black border-slate-200 uppercase px-3 shadow-sm",
                                canResolveAnomaly ? "bg-white text-slate-700 hover:text-emerald-600 hover:bg-slate-50" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                              )}
                            >
                              Résoudre
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-[11px] h-11 font-black uppercase text-red-500 flex items-center gap-1.5 hover:bg-slate-100 px-3"
                          onClick={(e) => { e.stopPropagation(); startAIDiagnosticChat(anom); }}
                        >
                          <Sparkles className="h-3.5 w-3.5" /> Diagnostic IA
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Diagnostic & Assistant Frame */}
          <Card className="border-slate-200 shadow-sm flex flex-col h-[calc(100vh-180px)] overflow-hidden">
            <CardHeader className="py-4 border-b bg-gradient-to-r from-red-500 to-slate-900 text-white">
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-1.5">
                <Bot className="h-4 w-4" /> Assistant Mécanique Expert
              </CardTitle>
              <CardDescription className="text-red-100 text-xs">
                {selectedAnomalyForChat 
                  ? `ANALYSE DES CAUSES RACINES • ${selectedAnomalyForChat.enginId}` 
                  : "Sélectionnez un défaut en galerie"}
              </CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1 p-4 bg-slate-50/50">
              <div className="max-w-2xl mx-auto space-y-4">
                {chatMessages.map((m, i) => (
                  <div key={i} className={cn(
                    "flex gap-3 items-start",
                    m.role === "user" ? "flex-row-reverse" : ""
                  )}>
                    <div className={cn(
                      "p-3 rounded-2xl text-xs leading-relaxed shadow-sm",
                      m.role === "user" ? "bg-red-500 text-white" : "bg-white border border-slate-200 text-slate-800"
                    )}>
                      {m.content.split('\n').map((line: string, index: number) => (
                        <p key={index} className="mb-1">{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex gap-3 items-start animate-pulse">
                    <div className="p-3 rounded-2xl bg-white border border-slate-100 w-24 h-8" />
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-3 bg-white border-t border-slate-150">
              <div className="flex items-center gap-2">
                <Input 
                  placeholder={selectedAnomalyForChat ? "Renseigner observations supplémentaires..." : "Veuillez sélectionner un défaut d'inspection..."} 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                  disabled={!selectedAnomalyForChat || isChatLoading}
                  className="text-xs focus-visible:ring-red-500 focus-visible:ring-offset-0 placeholder:text-slate-400 h-9"
                />
                <Button 
                  size="icon" 
                  onClick={handleChatSend}
                  disabled={!selectedAnomalyForChat || !chatInput.trim() || isChatLoading}
                  className="bg-red-600 hover:bg-red-700 h-9 w-9 text-white shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
