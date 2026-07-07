import React, { useState, useMemo } from "react";
import { usePneumatiques, Pneumatique } from "@/hooks/usePneumatiques";
import { useAuthStore } from "@/lib/store";
import { SiteID } from "@/types";
import { 
  CircleDot, Plus, Calendar, DollarSign, Activity, FileSpreadsheet, 
  ChevronDown, Search, Filter, AlertTriangle, Check, X, Truck, Wrench, Shield,
  TrendingUp, BarChart2, PieChart as PieIcon, RefreshCw, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { toast } from "sonner";

const POSITIONS = ["AV-G", "AV-D", "AR-G-EXT", "AR-G-INT", "AR-D-EXT", "AR-D-INT"] as const;
const RAISONS_RETIRET = [
  "Usure normale bande de roulement",
  "Crevaison flanc / coupure roche",
  "Impact rocheux profond",
  "Surchauffe / délamination interne",
  "Usure prononcée d'épaulement",
  "Coupure flanc par herse d'éboulis"
];

const COLORS = ["#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"];

export function Pneumatiques() {
  const { pneumatiques, loading, addPneumatiqueRecord } = usePneumatiques();
  const { activeSite, user } = useAuthStore();

  const [activeSubTab, setActiveSubTab] = useState<"historique" | "stats">("historique");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("TOUTES");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmittingConso, setIsSubmittingConso] = useState<boolean>(false);

  // Form State
  const [newRecord, setNewRecord] = useState({
    enginId: "",
    enginModele: "CAT 777D",
    siteId: "SMI" as SiteID,
    position: "AV-G" as Pneumatique["position"],
    marque: "Michelin",
    dimension: "27.00R49",
    type: "X-Traction",
    numeroSerie: "",
    datePose: new Date().toISOString().substring(0, 10),
    heurePose: 10000,
    ancienPneuDureeHeures: 4000,
    ancienPneuRaison: "Usure normale bande de roulement",
    cout: 12500,
    fournisseur: "SOREC PNEUS",
    changePar: "",
    validePar: ""
  });

  // Automatically adjust form site to activeSite if not "TOUS"
  React.useEffect(() => {
    if (activeSite !== "TOUS") {
      setNewRecord(prev => ({ ...prev, siteId: activeSite }));
    }
  }, [activeSite]);

  // Unique list of brands for filter
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    pneumatiques.forEach(p => brandSet.add(p.marque));
    return Array.from(brandSet);
  }, [pneumatiques]);

  // Filtered list based on search and site context
  const filteredPneumatiques = useMemo(() => {
    return pneumatiques.filter(p => {
      const matchSite = activeSite === "TOUS" || p.siteId === activeSite;
      const matchSearch = 
        p.enginId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.marque.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBrand = selectedBrand === "TOUTES" || p.marque === selectedBrand;
      return matchSite && matchSearch && matchBrand;
    });
  }, [pneumatiques, activeSite, searchTerm, selectedBrand]);

  // Key performance indicators
  const kpis = useMemo(() => {
    if (filteredPneumatiques.length === 0) {
      return { totalCount: 0, totalCost: 0, avgLifespan: 0, accidentalRate: 0 };
    }
    const totalCount = filteredPneumatiques.length;
    const totalCost = filteredPneumatiques.reduce((acc, p) => acc + p.cout, 0);
    const avgLifespan = filteredPneumatiques.reduce((acc, p) => acc + p.ancienPneuDureeHeures, 0) / totalCount;
    
    // Count of pre-mature or accidental tire failures
    const accidentalCount = filteredPneumatiques.filter(p => 
      p.ancienPneuRaison.toLowerCase().includes("crevaison") || 
      p.ancienPneuRaison.toLowerCase().includes("coupure") ||
      p.ancienPneuRaison.toLowerCase().includes("impact") ||
      p.ancienPneuRaison.toLowerCase().includes("surchauffe")
    ).length;

    return {
      totalCount,
      totalCost,
      avgLifespan: Math.round(avgLifespan),
      accidentalRate: Math.round((accidentalCount / totalCount) * 100)
    };
  }, [filteredPneumatiques]);

  // Chart data 1: Reasons for replacement (Pie Chart)
  const reasonsChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredPneumatiques.forEach(p => {
      counts[p.ancienPneuRaison] = (counts[p.ancienPneuRaison] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredPneumatiques]);

  // Chart data 2: Costs per Engine / Truck (Bar Chart)
  const costsChartData = useMemo(() => {
    const costsByEngin: Record<string, number> = {};
    filteredPneumatiques.forEach(p => {
      costsByEngin[p.enginId] = (costsByEngin[p.enginId] || 0) + p.cout;
    });
    return Object.entries(costsByEngin).map(([name, cost]) => ({ name, cost }));
  }, [filteredPneumatiques]);

  // Handles tire report form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingConso) return;

    if (!newRecord.enginId || !newRecord.numeroSerie || !newRecord.changePar || !newRecord.validePar) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmittingConso(true);
    try {
      await addPneumatiqueRecord(newRecord);
      setShowAddForm(false);
      // Reset form (keeping defaults)
      setNewRecord(prev => ({
        ...prev,
        enginId: "",
        numeroSerie: "",
        changePar: "",
        validePar: ""
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingConso(false);
    }
  };

  const getReasonColor = (reason: string) => {
    if (reason.toLowerCase().includes("normal")) {
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    }
    if (reason.toLowerCase().includes("surchauffe") || reason.toLowerCase().includes("prononcée")) {
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    }
    return "bg-rose-500/10 text-rose-600 border-rose-500/20";
  };

  const getSiteColor = (site: string) => {
    switch (site) {
      case "SMI": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "OUMEJRANE": return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "KOUDIA": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "OUANSIMI": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "BOU-AZZER": return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  const exportCSV = () => {
    try {
      const headers = "ID;Engin;Modele;Site;Position;Marque;Dimension;NumeroSerie;DatePose;HeuresPose;AncienDuree;AncienRaison;Cout;ChangePar;ValidePar\n";
      const rows = filteredPneumatiques.map(p => 
        `"${p.id || ""}";"${p.enginId}";"${p.enginModele}";"${p.siteId}";"${p.position}";"${p.marque}";"${p.dimension}";"${p.numeroSerie}";"${p.datePose}";${p.heurePose};${p.ancienPneuDureeHeures};"${p.ancienPneuRaison}";${p.cout};"${p.changePar}";"${p.validePar}"`
      ).join("\n");
      
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `suivi_pneumatiques_${activeSite}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Rapport CSV exporté avec succès !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'export du fichier CSV");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Chargement du registre pneumatiques...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0">
      {/* Module Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
            <CircleDot className="w-6 h-6 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            Suivi des Pneumatiques & Usure
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Registre de remplacement des pneus géants (OTR), durabilité moyenne et traçabilité des coûts.
          </p>
        </div>

        {/* Action and local tabs */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveSubTab("historique")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === "historique"
                  ? "bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Registre & Formulaires
            </button>
            <button
              onClick={() => setActiveSubTab("stats")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
                activeSubTab === "stats"
                  ? "bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
              Statistiques d'Usure
            </button>
          </div>

          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs px-4 h-9 tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Enregistrer un Pneu
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-4 pt-5 rounded-2xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-4 text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="p-3 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block uppercase">Remplacements Enregistrés</span>
            <span className="text-2xl font-black text-[#D4AF37]">{kpis.totalCount}</span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-4 pt-5 rounded-2xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-4 text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block uppercase">Coût d'Investissement</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {kpis.totalCost.toLocaleString()} DH
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-4 pt-5 rounded-2xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-4 text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="p-3 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block uppercase">Durée de vie Moyenne</span>
            <span className="text-2xl font-black text-[#D4AF37]">{kpis.avgLifespan}h</span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-4 pt-5 rounded-2xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-4 text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block uppercase">Accidentologie / Surchauffe</span>
            <span className="text-2xl font-black text-red-600 dark:text-red-400">{kpis.accidentalRate}%</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Switch */}
      <AnimatePresence mode="wait">
        {activeSubTab === "historique" ? (
          <motion.div
            key="historique"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Filter and Search Bar */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-4 rounded-2xl border border-[#D4AF37]/30 shadow-sm flex flex-col md:flex-row justify-between gap-4">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <div className="flex flex-1 gap-2 max-w-lg">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher engin, marque, n° de série..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs py-1.5 px-3 rounded-lg outline-none focus:border-amber-500 uppercase font-bold"
                >
                  <option value="TOUTES">Toutes les marques</option>
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                onClick={exportCSV}
                className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 text-xs h-9 font-black uppercase tracking-wider flex items-center gap-1.5 rounded-lg"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export CSV
              </Button>
            </div>

            {/* Flat Table */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-950 rounded-2xl border border-[#D4AF37]/50 overflow-x-auto shadow-sm scroll-industrial">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-50 dark:border-slate-900/60 text-[10px] text-slate-400 font-mono uppercase">
                    <th className="p-4">Engin (Modèle)</th>
                    <th className="p-4 text-center">Chantier</th>
                    <th className="p-4 text-center">Position</th>
                    <th className="p-4">Pneu Posé</th>
                    <th className="p-4 text-center">Numéro Série</th>
                    <th className="p-4">Ancien Pneu</th>
                    <th className="p-4 text-right">Coût</th>
                    <th className="p-4">Opérateur / Validateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-xs text-slate-700 dark:text-slate-300">
                  {filteredPneumatiques.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="block">{p.enginId}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{p.enginModele}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getSiteColor(p.siteId)}`}>
                          {p.siteId}
                        </span>
                      </td>
                      <td className="p-4 text-center font-black text-amber-600 font-mono">{p.position}</td>
                      <td className="p-4">
                        <span className="font-bold block">{p.marque} {p.type}</span>
                        <span className="text-[10px] text-slate-400">{p.dimension}</span>
                      </td>
                      <td className="p-4 text-center font-mono text-xs">{p.numeroSerie}</td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="font-mono text-xs block font-bold">{p.ancienPneuDureeHeures}h</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase block truncate max-w-[150px] ${getReasonColor(p.ancienPneuRaison)}`} title={p.ancienPneuRaison}>
                            {p.ancienPneuRaison}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono font-black text-slate-900 dark:text-white">
                        {p.cout.toLocaleString()} DH
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-amber-500" />
                            {p.changePar}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-500" />
                            {p.validePar}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPneumatiques.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                        Aucun changement pneumatique enregistré pour ce chantier.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Chart 1: Reasons Distribution */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-6 rounded-2xl border border-[#D4AF37]/50 shadow-sm flex flex-col h-[380px]">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Distribution des Causes de Retrait
              </h3>
              <div className="flex-1">
                {reasonsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reasonsChartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {reasonsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 font-mono text-xs">
                    Pas de données d'analyse d'usure.
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Cumulative Tire Costs per Truck */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-6 rounded-2xl border border-[#D4AF37]/50 shadow-sm flex flex-col h-[380px]">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Investissements Pneumatiques par Engin
              </h3>
              <div className="flex-1">
                {costsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costsChartData}>
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="cost" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                        {costsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#f59e0b" fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 font-mono text-xs">
                    Aucun investissement répertorié.
                  </div>
                )}
              </div>
            </div>

            {/* Predictive Smart Alert card */}
            <div className="relative overflow-hidden bg-amber-500/5 dark:bg-slate-900/40 p-6 rounded-2xl border border-[#D4AF37]/40 dark:border-slate-900/60 space-y-3">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <h4 className="text-xs font-black text-amber-800 dark:text-amber-500 uppercase flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" /> Module d'Analyse Prédictive & Durabilité SOU-GMAO
              </h4>
              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-mono">
                Sur la base des {kpis.totalCount} derniers remplacements de pneus géants OTR sur vos chantiers, 
                la durée de vie moyenne théorique avant rupture ou usure critique est estimée à <strong className="text-amber-600 dark:text-amber-400">{kpis.avgLifespan} heures</strong>. 
                Une inspection de rotation systématique est recommandée toutes les <strong className="text-amber-600 dark:text-amber-400">1000 heures de marche</strong> pour maximiser le retour sur investissement pneumatique.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register replacement report modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-y-auto shadow-2xl relative scroll-industrial p-6 md:p-8"
            >
              <button
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 p-1.5 bg-slate-50 hover:bg-slate-150 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-800 transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-1.5 flex items-center gap-2">
                <CircleDot className="w-5 h-5 text-amber-500" /> Enregistrer un Remplacement Pneumatique
              </h3>
              <p className="text-xs text-slate-500 font-mono mb-6">
                Saisie obligatoire pour la traçabilité des pneus OTR et le calcul de durée de vie de la flotte.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Engin ID */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">ID de l'Engin *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: SMI-TR-01"
                      value={newRecord.enginId}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, enginId: e.target.value.toUpperCase() }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500 font-bold"
                    />
                  </div>

                  {/* Engin Modele */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Modèle d'Engin</label>
                    <input
                      type="text"
                      value={newRecord.enginModele}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, enginModele: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Site Select */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Chantier (Site)</label>
                    <select
                      value={newRecord.siteId}
                      disabled={activeSite !== "TOUS"}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, siteId: e.target.value as any }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500"
                    >
                      <option value="SMI">SMI</option>
                      <option value="OUMEJRANE">Oumejrane</option>
                      <option value="KOUDIA">Koudia</option>
                      <option value="OUANSIMI">Ouansimi</option>
                      <option value="BOU-AZZER">Bou-Azzer</option>
                    </select>
                  </div>

                  {/* Position */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Position Pneumatique</label>
                    <select
                      value={newRecord.position}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, position: e.target.value as any }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500 font-bold"
                    >
                      {POSITIONS.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Marque *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Michelin"
                      value={newRecord.marque}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, marque: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500 font-bold"
                    />
                  </div>

                  {/* Dimension */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Dimension *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 27.00R49"
                      value={newRecord.dimension}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, dimension: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500 font-bold"
                    />
                  </div>

                  {/* Serial Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Numéro de Série *</label>
                    <input
                      type="text"
                      required
                      placeholder="Saisir code de gravage"
                      value={newRecord.numeroSerie}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, numeroSerie: e.target.value.toUpperCase() }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>

                  {/* Cost */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Coût du Pneu (DH) *</label>
                    <input
                      type="number"
                      required
                      value={newRecord.cout}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, cout: Number(e.target.value) }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>

                  {/* Date Pose */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Date de Pose</label>
                    <input
                      type="date"
                      value={newRecord.datePose}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, datePose: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Compteur d'Heures Engin à la pose */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Compteur Engin (heures)</label>
                    <input
                      type="number"
                      value={newRecord.heurePose}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, heurePose: Number(e.target.value) }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Ancien Pneu Durée de vie */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Durée Ancien Pneu (heures)</label>
                    <input
                      type="number"
                      value={newRecord.ancienPneuDureeHeures}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, ancienPneuDureeHeures: Number(e.target.value) }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Raison Retrait */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Cause du Retrait de l'ancien</label>
                    <select
                      value={newRecord.ancienPneuRaison}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, ancienPneuRaison: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500"
                    >
                      {RAISONS_RETIRET.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Change par */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Changé Par (Mécanicien) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nom complet"
                      value={newRecord.changePar}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, changePar: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Valide par */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">Validé Par (Superviseur) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nom complet"
                      value={newRecord.validePar}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, validePar: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs rounded-lg py-2 px-3 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-900">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddForm(false)}
                    className="border border-slate-200 dark:border-slate-800 text-xs text-slate-500 rounded-lg px-4"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingConso}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs rounded-lg px-6"
                  >
                    {isSubmittingConso ? "Enregistrement..." : "Enregistrer Rapport"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
