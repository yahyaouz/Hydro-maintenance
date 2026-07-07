import React, { useState, useMemo } from "react";
import { useMecaniciens, Mecanicien } from "@/hooks/useMecaniciens";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { MaintenanceTask } from "@/components/taches/types";
import { 
  Users, Award, Search, Filter, CheckCircle2, XCircle, 
  Wrench, Clock, Phone, Mail, Calendar, MapPin, 
  Sparkles, Star, Percent, TrendingUp, X, Check, ShieldAlert, CheckSquare,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from "recharts";
import { toast } from "sonner";

export function Mecaniciens() {
  const { mecaniciens, loading } = useMecaniciens();
  const { activeSite, user } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("TOUTES");
  const [activeSubTab, setActiveSubTab] = useState<"liste" | "classement">("liste");
  const [selectedMeca, setSelectedMeca] = useState<Mecanicien | null>(null);

  // Load tasks for real workload analysis
  const { data: tasks, loading: tasksLoading } = useCollection<MaintenanceTask>('maintenanceTasks', [], { limitNum: 1000 });

  const isPrivileged = user?.role && ['ADMIN', 'DIRECTION', 'RESPONSABLE_MAINTENANCE'].includes(user.role);

  const workloadData = useMemo(() => {
    if (!mecaniciens) return [];
    
    // Filter active mechanics
    const activeMecas = mecaniciens.filter(m => m.active !== false);

    // Apply activeSite filter if not TOUS
    const filteredMecas = activeSite === "TOUS" 
      ? activeMecas 
      : activeMecas.filter(m => m.siteId === activeSite);

    return filteredMecas.map(m => {
      // Find open tasks for this mechanic
      const openTasks = tasks ? tasks.filter(t => 
        t.mecanicienId === m.id && 
        (t.statut === 'NON_FAIT' || t.statut === 'EN_COURS') && 
        t.deleted !== true
      ) : [];

      const totalOpen = openTasks.length;
      
      // Breakdown by type (PREVENTIF/QUOTIDIEN vs CORRECTIF)
      const preventifCount = openTasks.filter(t => t.type === 'PREVENTIF' || t.type === 'QUOTIDIEN').length;
      const correctifCount = openTasks.filter(t => t.type === 'CORRECTIF').length;

      return {
        mecanicien: m,
        totalOpen,
        preventifCount,
        correctifCount,
        siteId: m.siteId
      };
    }).sort((a, b) => b.totalOpen - a.totalOpen); // Sort by workload descending
  }, [mecaniciens, tasks, activeSite]);

  // List of unique skills across all mechanics
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    mecaniciens.forEach(m => m.competences.forEach(c => skillsSet.add(c)));
    return Array.from(skillsSet);
  }, [mecaniciens]);

  // Filter mechanics based on global site context, search terms, and selected skills
  const filteredMecaniciens = useMemo(() => {
    return mecaniciens.filter(m => {
      const matchSite = activeSite === "TOUS" || m.siteId === activeSite;
      const matchSearch = 
        m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.matricule.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSkill = selectedSkill === "TOUTES" || m.competences.includes(selectedSkill);
      return matchSite && matchSearch && matchSkill;
    });
  }, [mecaniciens, activeSite, searchTerm, selectedSkill]);

  // Global KPIs based on filtered list
  const kpis = useMemo(() => {
    if (filteredMecaniciens.length === 0) {
      return { total: 0, avgScore: 0, avgResolution: 0, avgMttr: 0 };
    }
    const total = filteredMecaniciens.length;
    const avgScore = filteredMecaniciens.reduce((acc, m) => acc + m.stats.scoreMensuel, 0) / total;
    const avgResolution = filteredMecaniciens.reduce((acc, m) => acc + m.stats.tauxResolutionPremiereFois, 0) / total;
    const avgMttr = filteredMecaniciens.reduce((acc, m) => acc + m.stats.mttrMoyen, 0) / total;

    return {
      total,
      avgScore: Math.round(avgScore * 10) / 10,
      avgResolution: Math.round(avgResolution * 10) / 10,
      avgMttr: Math.round(avgMttr * 10) / 10
    };
  }, [filteredMecaniciens]);

  // Sorted mechanics for leaderboard
  const leaderboardMecaniciens = useMemo(() => {
    return [...filteredMecaniciens].sort((a, b) => b.stats.scoreMensuel - a.stats.scoreMensuel);
  }, [filteredMecaniciens]);

  // Prepare radar data for selected mechanic details
  const radarData = useMemo(() => {
    if (!selectedMeca) return [];
    return [
      { subject: "Score Mensuel", value: selectedMeca.stats.scoreMensuel },
      { subject: "Résol. 1ère Fois", value: selectedMeca.stats.tauxResolutionPremiereFois },
      { subject: "Tournées Compl.", value: selectedMeca.stats.tauxTournéesCompletes },
      { subject: "Heures/1.5", value: Math.min(100, (selectedMeca.stats.heuresInterventionCeMois / 160) * 100) },
      { subject: "Rapidité (MTTR)", value: Math.max(0, 100 - (selectedMeca.stats.mttrMoyen * 15)) }
    ];
  }, [selectedMeca]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papiers`);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-mono">Chargement des fiches mécaniciens...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-0">
      {/* Module Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Gestion des Équipes & Mécaniciens
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Visualisation des fiches de compétences, certifications LOTO et score de performance.
          </p>
        </div>

        {/* Local sub tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start">
          <button
            onClick={() => setActiveSubTab("liste")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
              activeSubTab === "liste"
                ? "bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            Liste des Mécaniciens
          </button>
          <button
            onClick={() => setActiveSubTab("classement")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === "classement"
                ? "bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Score & Classement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-4 pt-5 rounded-xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-4 text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="p-3 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block uppercase">Mécaniciens Actifs</span>
            <span className="text-2xl font-black text-[#D4AF37]">{kpis.total}</span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-4 pt-5 rounded-xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-4 text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block uppercase">Score Mensuel Moyen</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{kpis.avgScore}%</span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-4 pt-5 rounded-xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-4 text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="p-3 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block uppercase">Résol. 1er coup moyen</span>
            <span className="text-2xl font-black text-[#D4AF37]">{kpis.avgResolution}%</span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-4 pt-5 rounded-xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-4 text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block uppercase">MTTR Moyen (heures)</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{kpis.avgMttr}h</span>
          </div>
        </div>
      </div>

      {/* Charge de Travail Réelle & Équilibrage des Équipes */}
      {isPrivileged && (
        <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-6 rounded-2xl border border-amber-500/30 shadow-sm">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                Charge de Travail Réelle & Équilibrage des Équipes
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Tâches ouvertes (NON_FAIT, EN_COURS) actuellement assignées à chaque mécanicien actif pour repérer et rééquilibrer la charge.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> &gt;8 Tâches (Surchargé)
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 4-8 Tâches (Modéré)
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> &lt;4 Tâches (Disponible)
              </span>
            </div>
          </div>

          {tasksLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-slate-400 font-mono ml-2">Analyse de la charge de travail...</span>
            </div>
          ) : workloadData.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-mono">
              Aucun mécanicien actif trouvé pour cette sélection.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workloadData.map(({ mecanicien, totalOpen, preventifCount, correctifCount, siteId }) => {
                const getStatusColor = (count: number) => {
                  if (count > 8) return "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50";
                  if (count >= 4) return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50";
                  return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50";
                };

                const getStatusText = (count: number) => {
                  if (count > 8) return "Surchargé";
                  if (count >= 4) return "Modéré";
                  return "Disponible";
                };

                const preventifPct = totalOpen > 0 ? Math.round((preventifCount / totalOpen) * 100) : 0;
                const correctifPct = totalOpen > 0 ? Math.round((correctifCount / totalOpen) * 100) : 0;

                return (
                  <div 
                    key={mecanicien.uid}
                    className="relative bg-slate-50 dark:bg-slate-900/30 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-amber-500/30 transition-all group"
                  >
                    {/* Site badge highlighted in top right */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-xs ${getSiteColor(siteId)}`}>
                        {siteId}
                      </span>
                    </div>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <img 
                          src={mecanicien.photo || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150"} 
                          alt="" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
                          {mecanicien.prenom} {mecanicien.nom}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-mono uppercase block">{mecanicien.matricule}</span>
                      </div>
                    </div>

                    {/* Stats & Badge */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">Tâches assignées</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${getStatusColor(totalOpen)}`}>
                          {totalOpen} {totalOpen === 1 ? "tâche" : "tâches"} • {getStatusText(totalOpen)}
                        </span>
                      </div>

                      {/* Distribution breakdown */}
                      {totalOpen > 0 ? (
                        <div className="space-y-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                          <div className="flex justify-between text-[9px] font-mono uppercase text-slate-400">
                            <span>🔩 Prev: {preventifCount} ({preventifPct}%)</span>
                            <span>🚨 Corr: {correctifCount} ({correctifPct}%)</span>
                          </div>
                          
                          {/* Split Progress Bar */}
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                            {preventifCount > 0 && (
                              <div 
                                className="bg-indigo-500 h-full transition-all" 
                                style={{ width: `${preventifPct}%` }}
                                title={`Préventif: ${preventifPct}%`}
                              />
                            )}
                            {correctifCount > 0 && (
                              <div 
                                className="bg-amber-500 h-full transition-all" 
                                style={{ width: `${correctifPct}%` }}
                                title={`Correctif: ${correctifPct}%`}
                              />
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[9.5px] text-slate-400 dark:text-slate-500 italic font-mono text-center pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                          Aucune tâche ouverte assignée.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-4 rounded-2xl border border-[#D4AF37]/30 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-400 font-mono uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Compétence:
          </span>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs py-1.5 px-3 rounded-lg outline-none focus:border-amber-500 uppercase font-bold"
          >
            <option value="TOUTES">Toutes les compétences</option>
            {allSkills.map(s => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Render */}
      <AnimatePresence mode="wait">
        {activeSubTab === "liste" ? (
          <motion.div
            key="liste"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredMecaniciens.map((m) => (
              <div 
                key={m.uid}
                className="bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 overflow-hidden shadow-xs hover:shadow-md hover:border-amber-500/30 transition-all flex flex-col group relative"
              >
                {/* Site badge in top right corner */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getSiteColor(m.siteId)}`}>
                    {m.siteId}
                  </span>
                </div>

                {/* Profile Header Block */}
                <div className="p-5 flex items-start gap-4 border-b border-slate-50 dark:border-slate-900/60">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100 dark:border-slate-850">
                    <img 
                      src={m.photo || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150"} 
                      alt={`${m.prenom} ${m.nom}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] text-slate-400 font-mono uppercase block leading-none mb-1">{m.matricule}</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate uppercase">
                      {m.prenom} {m.nom}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {m.poste}
                    </p>
                  </div>
                </div>

                {/* Body: Competencies */}
                <div className="p-5 flex-1 space-y-4">


                  {/* Competencies badges */}
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase mb-1.5">Compétences Clés</span>
                    <div className="flex flex-wrap gap-1">
                      {m.competences.slice(0, 3).map((comp) => (
                        <span key={comp} className="text-[9px] font-black uppercase bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                          {comp.replace(/_/g, " ")}
                        </span>
                      ))}
                      {m.competences.length > 3 && (
                        <span className="text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded border border-amber-500/20">
                          +{m.competences.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main stats glance */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900">
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono uppercase block">Score Mensuel</span>
                      <span className="text-xs font-black text-slate-850 dark:text-white">{m.stats.scoreMensuel}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-mono uppercase block">Total Interventions</span>
                      <span className="text-xs font-black text-slate-850 dark:text-white">{m.stats.totalInterventions}</span>
                    </div>
                  </div>
                </div>

                {/* Footer details button */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-50 dark:border-slate-900/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Embauche: {m.dateEmbauche}
                  </span>
                  <Button
                    onClick={() => setSelectedMeca(m)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-[10px] px-3 h-7 tracking-wider rounded-lg"
                  >
                    Voir Détails
                  </Button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="classement"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Top 3 Podium (Desktop only, responsive fall back) */}
            <div className="hidden md:grid grid-cols-3 gap-6 items-end max-w-3xl mx-auto pt-6">
              {/* 2nd place */}
              {leaderboardMecaniciens[1] && (
                <div className="flex flex-col items-center">
                  <div className="text-center mb-2">
                    <span className="text-xs font-black text-slate-500 font-mono block">2ème Place</span>
                    <span className="text-[11px] text-slate-400 font-mono">{leaderboardMecaniciens[1].stats.scoreMensuel}%</span>
                  </div>
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-slate-300 shadow-md">
                    <img 
                      src={leaderboardMecaniciens[1].photo} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full h-28 rounded-t-2xl mt-4 flex flex-col justify-center items-center p-3 text-center shadow-xs">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-full">
                      {leaderboardMecaniciens[1].prenom} {leaderboardMecaniciens[1].nom}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase mt-1">SMI</span>
                    <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-black text-sm mt-2 shadow-xs">
                      2
                    </div>
                  </div>
                </div>
              )}

              {/* 1st place */}
              {leaderboardMecaniciens[0] && (
                <div className="flex flex-col items-center">
                  <div className="text-center mb-2">
                    <span className="text-xs font-black text-amber-600 font-mono block flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      1ère Place
                    </span>
                    <span className="text-sm font-black text-amber-500 font-mono">{leaderboardMecaniciens[0].stats.scoreMensuel}%</span>
                  </div>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-amber-500 shadow-lg scale-105">
                    <img 
                      src={leaderboardMecaniciens[0].photo} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-amber-500/10 dark:bg-amber-950/20 border-2 border-amber-500/30 w-full h-36 rounded-t-2xl mt-4 flex flex-col justify-center items-center p-3 text-center shadow-md">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase truncate max-w-full">
                      {leaderboardMecaniciens[0].prenom} {leaderboardMecaniciens[0].nom}
                    </span>
                    <span className="text-[9px] font-mono text-amber-600 uppercase mt-1">SMI</span>
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base mt-2 shadow-sm">
                      👑
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd place */}
              {leaderboardMecaniciens[2] && (
                <div className="flex flex-col items-center">
                  <div className="text-center mb-2">
                    <span className="text-xs font-black text-amber-700 font-mono block">3ème Place</span>
                    <span className="text-[11px] text-slate-400 font-mono">{leaderboardMecaniciens[2].stats.scoreMensuel}%</span>
                  </div>
                  <div className="relative w-18 h-18 rounded-full overflow-hidden border-4 border-amber-700/60 shadow-md">
                    <img 
                      src={leaderboardMecaniciens[2].photo} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full h-24 rounded-t-2xl mt-4 flex flex-col justify-center items-center p-3 text-center shadow-xs">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-full">
                      {leaderboardMecaniciens[2].prenom} {leaderboardMecaniciens[2].nom}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase mt-1">BOU-AZZER</span>
                    <div className="w-8 h-8 rounded-full bg-amber-750 text-amber-100 flex items-center justify-center font-black text-sm mt-2 shadow-xs">
                      3
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Flat List Leaderboard */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-950 rounded-2xl border border-[#D4AF37]/50 shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-50 dark:border-slate-900/60 grid grid-cols-12 text-[10px] text-slate-400 font-mono uppercase">
                <div className="col-span-1 text-center">Rang</div>
                <div className="col-span-5 md:col-span-4">Mécanicien</div>
                <div className="col-span-2 text-center">Chantier</div>
                <div className="col-span-2 text-center">Interventions (Mois)</div>
                <div className="col-span-2 text-center">Heures (Mois)</div>
                <div className="col-span-2 hidden md:block text-right">Score Mensuel</div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-900">
                {leaderboardMecaniciens.map((m, idx) => (
                  <div 
                    key={m.uid}
                    className="p-4 grid grid-cols-12 items-center hover:bg-slate-50/50 dark:hover:bg-slate-900/20 cursor-pointer"
                    onClick={() => setSelectedMeca(m)}
                  >
                    <div className="col-span-1 text-center font-black font-mono text-xs">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                    </div>
                    <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 hidden sm:block bg-slate-100">
                        <img src={m.photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase block truncate">
                          {m.prenom} {m.nom}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono uppercase">{m.matricule}</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getSiteColor(m.siteId)}`}>
                        {m.siteId}
                      </span>
                    </div>
                    <div className="col-span-2 text-center text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {m.stats.interventionsCeMois}
                    </div>
                    <div className="col-span-2 text-center text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {m.stats.heuresInterventionCeMois}h
                    </div>
                    <div className="col-span-2 text-right hidden md:block">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-16 bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full rounded-full" 
                            style={{ width: `${m.stats.scoreMensuel}%` }}
                          />
                        </div>
                        <span className="text-xs font-black font-mono text-slate-850 dark:text-white">{m.stats.scoreMensuel}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Dialog / Modal */}
      <AnimatePresence>
        {selectedMeca && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-y-auto shadow-2xl relative scroll-industrial"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMeca(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-50 hover:bg-slate-150 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-800 transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Banner Area */}
              <div className="h-28 bg-gradient-to-r from-amber-500 to-amber-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="absolute bottom-3 left-6">
                  <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded bg-white text-amber-700 shadow-xs border`}>
                    Chantier {selectedMeca.siteId}
                  </span>
                </div>
              </div>

              {/* Photo & Profile positioning */}
              <div className="px-6 md:px-8 pb-8 relative">
                <div className="flex flex-col md:flex-row gap-6 items-start -mt-10 relative z-10">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 p-1 border-4 border-white dark:border-slate-950 shadow-md">
                    <img 
                      src={selectedMeca.photo} 
                      alt="" 
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 mt-2 md:mt-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">
                        {selectedMeca.prenom} {selectedMeca.nom}
                      </h3>
                      <span className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase border border-emerald-500/20">
                        {selectedMeca.active ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-slate-500 font-mono">
                      <span>Matricule: {selectedMeca.matricule}</span>
                      <span>•</span>
                      <span>Poste: {selectedMeca.poste}</span>
                      <span>•</span>
                      <span>Embauche: {selectedMeca.dateEmbauche}</span>
                    </div>
                  </div>
                </div>

                {/* Main Tab Details Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
                  {/* Left Column: Coordinates (4 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Contact details */}
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-900">
                      <h4 className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">Coordonnées de Contact</h4>
                      
                      <div className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{selectedMeca.telephone}</span>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => copyToClipboard(selectedMeca.telephone, "Numéro de téléphone")}
                          className="h-6 text-[9px] font-mono hover:text-amber-500 text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                        >
                          Copier
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="truncate max-w-[180px]">{selectedMeca.email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => copyToClipboard(selectedMeca.email, "Adresse email")}
                          className="h-6 text-[9px] font-mono hover:text-amber-500 text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                        >
                          Copier
                        </Button>
                      </div>
                    </div>



                    {/* Competences */}
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-900">
                      <h4 className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">Catalogue de Compétences</h4>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedMeca.competences.map((c) => (
                          <span key={c} className="text-[10px] font-bold uppercase bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-800 px-2.5 py-1 rounded-lg">
                            {c.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Performance Analysis (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Performance metrics charts */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-100 dark:border-slate-900">
                      <h4 className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider mb-4">Analyse de Performance Radar</h4>
                      
                      <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                            <Radar
                              name={selectedMeca.nom}
                              dataKey="value"
                              stroke="#f59e0b"
                              fill="#f59e0b"
                              fillOpacity={0.3}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-slate-150 dark:border-slate-800 pt-4">
                        <div className="text-center">
                          <span className="text-[9px] text-slate-400 font-mono block uppercase">MTTR Moyen</span>
                          <span className="text-sm font-black text-slate-850 dark:text-white mt-1 block">{selectedMeca.stats.mttrMoyen}h</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] text-slate-400 font-mono block uppercase">Tournées Compl.</span>
                          <span className="text-sm font-black text-slate-850 dark:text-white mt-1 block">{selectedMeca.stats.tauxTournéesCompletes}%</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] text-slate-400 font-mono block uppercase">Résol. 1er coup</span>
                          <span className="text-sm font-black text-slate-850 dark:text-white mt-1 block">{selectedMeca.stats.tauxResolutionPremiereFois}%</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] text-slate-400 font-mono block uppercase">Dernière act.</span>
                          <span className="text-xs font-black text-slate-850 dark:text-white mt-1 block truncate">
                            {new Date(selectedMeca.stats.derniereIntervention).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational trace details */}
                    <div className="bg-amber-500/5 dark:bg-slate-900/40 p-4 rounded-xl border border-amber-500/10 dark:border-slate-900/60 flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></div>
                      <div className="text-[10px] text-amber-800 dark:text-amber-400 font-mono leading-relaxed">
                        <strong>LOG SPRINT 4 :</strong> Cette fiche est actuellement alimentée par des données mockées identifiées 
                        par la source <code className="bg-amber-500/10 px-1 rounded uppercase font-black">{selectedMeca.source}</code>. 
                        Au Sprint 6, ce profil sera synchronisé automatiquement avec les données d'import SAP/GMAO.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
