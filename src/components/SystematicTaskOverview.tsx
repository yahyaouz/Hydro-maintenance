import React, { useState, useEffect } from "react";
import { useSystematicTasks, SystematicTaskSheet, SystematicTaskConfigItem } from "@/hooks/useSystematicTasks";
import { User, SiteID } from "@/types";
import { 
  BarChart3, 
  Settings, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Check,
  ToggleLeft,
  ToggleRight,
  Save,
  Sliders,
  Award,
  Users,
  Calendar
} from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

interface SystematicTaskOverviewProps {
  user: User;
}

interface WeekDay {
  dateStr: string;
  label: string;
  dayName: string;
}

export const SystematicTaskOverview: React.FC<SystematicTaskOverviewProps> = ({ user }) => {
  const { sheets, configs, getOrCreateConfig, saveConfig, loading } = useSystematicTasks();
  const [activeTab, setActiveTab] = useState<"surveillance" | "config">("surveillance");
  
  // Weekly Matrix states
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [mechanics, setMechanics] = useState<{ id: string; name: string; siteId: SiteID }[]>([]);
  
  // Configuration manager states
  const [confSite, setConfSite] = useState<string>(user.siteId === "TOUS" ? "SMI" : user.siteId);
  const [confPoste, setConfPoste] = useState<string>("Poste 1");
  const [confTasks, setConfTasks] = useState<SystematicTaskConfigItem[]>([]);
  const [newTaskLabel, setNewTaskLabel] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("VISUEL");

  // Load mechanics from database (users with role MECANICIEN)
  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "MECANICIEN"));
        const snap = await getDocs(q);
        const list: { id: string; name: string; siteId: SiteID }[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.displayName || "Mécanicien anonyme",
            siteId: data.siteId as SiteID
          });
        });

        // Also add unique mechanics found in the sheets to ensure we don't miss anyone
        sheets.forEach(s => {
          if (!list.some(m => m.id === s.mecanicienId)) {
            list.push({
              id: s.mecanicienId,
              name: s.mecanicienNom,
              siteId: s.siteId
            });
          }
        });

        setMechanics(list);
      } catch (err) {
        console.error("Error loading mechanics:", err);
      }
    };
    fetchMechanics();
  }, [sheets]);

  // Load configuration for selected site & poste
  const loadConfigData = async () => {
    const activeConf = await getOrCreateConfig(confSite, confPoste);
    setConfTasks(activeConf.tasks || []);
  };

  useEffect(() => {
    loadConfigData();
  }, [confSite, confPoste]);

  // Get start of the week (Monday)
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(date.setDate(diff));
  };

  // Generate days of the week
  const getWeekDays = (start: Date): WeekDay[] => {
    const days: WeekDay[] = [];
    const names = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        dateStr,
        label: `${names[i]} ${d.getDate()}/${d.getMonth() + 1}`,
        dayName: names[i]
      });
    }
    return days;
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = getWeekDays(startOfWeek);

  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  // Filter mechanics by active site
  const filteredMechanics = mechanics.filter(m => {
    if (user.siteId === "TOUS") return true;
    return m.siteId === user.siteId;
  });

  // Calculate compliance score for a mechanic in the current week
  const calculateComplianceScore = (mecId: string) => {
    const mecSheets = sheets.filter(s => s.mecanicienId === mecId);
    const weekDates = weekDays.map(wd => wd.dateStr);
    const weekSheets = mecSheets.filter(s => weekDates.includes(s.date));

    if (weekSheets.length === 0) return null;

    let points = 0;
    weekSheets.forEach(s => {
      if (s.status === "VALIDÉ") points += 100;
      else if (s.status === "COMPLET") points += 80;
      else if (s.status === "PARTIEL") points += 50;
      // NON_FAIT points is 0
    });

    return Math.round(points / weekSheets.length);
  };

  // Configuration management functions
  const handleToggleTaskActive = (taskId: string) => {
    setConfTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, active: !t.active } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setConfTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleAddTask = () => {
    if (!newTaskLabel.trim()) {
      toast.error("Veuillez saisir le libellé de la tâche.");
      return;
    }
    const newId = `t_custom_${Date.now()}`;
    const newTask: SystematicTaskConfigItem = {
      id: newId,
      label: newTaskLabel,
      category: newTaskCategory,
      active: true,
      ordre: confTasks.length + 1
    };
    setConfTasks(prev => [...prev, newTask]);
    setNewTaskLabel("");
    toast.success("Tâche ajoutée à la liste locale. N'oubliez pas d'enregistrer !");
  };

  const handleSaveConfig = async () => {
    await saveConfig(confSite, confPoste, confTasks, user.displayName);
  };

  // Native customized window print triggers elegant PDF generation
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="overview-systematic-container">
      {/* Title & Navigation Tabs */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#D4AF37]/50 shadow-sm" id="overview-header-card">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sky-500" />
            Supervision & Configuration Systématique
          </h2>
          <p className="text-xs text-slate-500">
            Suivi hebdomadaire de l'assiduité des mécaniciens et gestion des tâches réglementaires.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg" id="overview-tabs-pill">
          <button
            type="button"
            onClick={() => setActiveTab("surveillance")}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "surveillance" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Surveillance & Score
          </button>

          {(user.role === "RESPONSABLE_MAINTENANCE" || user.role === "ADMIN") && (
            <button
              type="button"
              onClick={() => setActiveTab("config")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "config" 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              Configuration des Tâches
            </button>
          )}
        </div>
      </div>

      {activeTab === "surveillance" ? (
        <div className="space-y-6" id="overview-surveillance-tab">
          {/* Week Selector & PDF Trigger */}
          <div className="bg-white p-4 rounded-2xl border border-[#D4AF37]/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 no-print" id="surveillance-controls">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrevWeek}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-slate-600"
                id="btn-prev-week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-sky-500" />
                Semaine du {startOfWeek.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>

              <button
                type="button"
                onClick={handleNextWeek}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-slate-600"
                id="btn-next-week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportPDF}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              id="btn-export-pdf"
            >
              <Download className="h-3.5 w-3.5" />
              Imprimer / Exporter PDF de Surveillance
            </button>
          </div>

          {/* Matrix table card */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#D4AF37]/50 shadow-sm" id="print-surveillance-matrix">
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
            <div className="p-5 border-b border-slate-100 flex items-center justify-between no-print">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5 text-slate-400" />
                Matrice Hebdomadaire d'Assiduité des Mécaniciens
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" /> Validé/Complet
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" /> Partiel
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="h-3 w-3 rounded-full bg-slate-300 inline-block" /> Non planifié / Non fait
                </span>
              </div>
            </div>

            {/* Print title (visible only during print) */}
            <div className="hidden print:block p-6 border-b border-slate-200 text-center space-y-2">
              <h1 className="text-2xl font-bold text-slate-800">HYDRO-MAINTENANCE — RAPPORT D'ASSIDUITÉ SYSTÉMATIQUE</h1>
              <p className="text-sm text-slate-500">
                Période de surveillance : Semaine du {startOfWeek.toLocaleDateString("fr-FR")} au {new Date(startOfWeek.getTime() + 6*24*60*60*1000).toLocaleDateString("fr-FR")}
              </p>
              <p className="text-xs text-slate-400">Généré le {new Date().toLocaleString("fr-FR")}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Mécanicien</th>
                    <th className="py-3 px-3 text-center">Site</th>
                    {weekDays.map(wd => (
                      <th key={wd.dateStr} className="py-3 px-3 text-center">
                        {wd.label}
                      </th>
                    ))}
                    <th className="py-3 px-5 text-right">Score Hebdo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredMechanics.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-slate-400">
                        <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                        Aucun mécanicien à surveiller.
                      </td>
                    </tr>
                  ) : (
                    filteredMechanics.map(m => {
                      const score = calculateComplianceScore(m.id);

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-800">{m.name}</td>
                          <td className="py-4 px-3 text-center">
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                              {m.siteId}
                            </span>
                          </td>
                          {weekDays.map(wd => {
                            // Find sheets for this date, mechanic
                            const daySheets = sheets.filter(s => s.mecanicienId === m.id && s.date === wd.dateStr);
                            
                            if (daySheets.length === 0) {
                              return (
                                <td key={wd.dateStr} className="py-4 px-3 text-center text-slate-300">-</td>
                              );
                            }

                            // If we have sheets, show consolidated or main status
                            const status = daySheets[0].status; // pick first as prime

                            return (
                              <td key={wd.dateStr} className="py-4 px-3 text-center">
                                <div className="flex justify-center">
                                  {status === "VALIDÉ" && (
                                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm" title="Tournée validée">
                                      V
                                    </span>
                                  )}
                                  {status === "COMPLET" && (
                                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm" title="Tournée complétée">
                                      C
                                    </span>
                                  )}
                                  {status === "PARTIEL" && (
                                    <span className="h-5 w-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm" title="Tournée partielle">
                                      P
                                    </span>
                                  )}
                                  {status === "NON_FAIT" && (
                                    <span className="h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm" title="Non fait">
                                      NF
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="py-4 px-5 text-right font-bold">
                            {score !== null ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  score >= 85 
                                    ? "bg-emerald-50 text-emerald-700" 
                                    : score >= 50 
                                    ? "bg-amber-50 text-amber-700" 
                                    : "bg-rose-50 text-rose-700"
                                }`}>
                                  {score}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Aucune donnée</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* KPI Dashboard cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print" id="surveillance-kpi-grid">
            <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-5 rounded-xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-4 text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <div className="p-3 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37]">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block uppercase">Taux d'Assiduité Moyen</p>
                <p className="text-2xl font-black text-[#D4AF37] mt-1">
                  {(() => {
                    const scores = filteredMechanics
                      .map(m => calculateComplianceScore(m.id))
                      .filter(s => s !== null) as number[];
                    if (scores.length === 0) return "N/A";
                    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                    return `${avg}%`;
                  })()}
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-5 rounded-xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-4 text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block uppercase">Tournées Validées (Semaine)</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {sheets.filter(s => weekDays.map(wd => wd.dateStr).includes(s.date) && s.status === "VALIDÉ").length}
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-white dark:bg-slate-950 p-5 rounded-xl border border-[#D4AF37]/50 shadow-sm flex items-center gap-4 text-slate-900 dark:text-white hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block uppercase">Tournées Incomplètes/Partielles</p>
                <p className="text-2xl font-black text-[#D4AF37] mt-1">
                  {sheets.filter(s => weekDays.map(wd => wd.dateStr).includes(s.date) && s.status === "PARTIEL").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Configuration Manager tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="overview-config-tab">
          {/* Left selectors and new task input */}
          <div className="space-y-4">
            <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-4" id="config-params-card">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="h-4.5 w-4.5 text-slate-500" />
                Sélection de la Cible
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Site minier</label>
                <select
                  value={confSite}
                  onChange={(e) => setConfSite(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  id="config-site-selector"
                >
                  <option value="SMI">SMI</option>
                  <option value="OUMEJRANE">Oumejrane</option>
                  <option value="KOUDIA">Koudia</option>
                  <option value="OUANSIMI">Ouansimi</option>
                  <option value="BOU-AZZER">Bou-Azzer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Poste (Shift)</label>
                <select
                  value={confPoste}
                  onChange={(e) => setConfPoste(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  id="config-poste-selector"
                >
                  <option value="Poste 1">Poste 1 (Matin)</option>
                  <option value="Poste 2">Poste 2 (Après-midi)</option>
                  <option value="Poste 3">Poste 3 (Nuit)</option>
                </select>
              </div>
            </div>

            {/* Add custom task card */}
            <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-4" id="config-add-task-card">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Plus className="h-4.5 w-4.5 text-slate-500" />
                Ajouter une tâche personnalisée
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Libellé de la tâche</label>
                <input
                  type="text"
                  value={newTaskLabel}
                  onChange={(e) => setNewTaskLabel(e.target.value)}
                  placeholder="Ex : Tester la pression du compresseur..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  id="config-new-task-label"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Catégorie</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  id="config-new-task-category"
                >
                  <option value="VISUEL">Contrôle Visuel</option>
                  <option value="FILTRATION">Filtration</option>
                  <option value="FUITE">Détection Fuite</option>
                  <option value="GRAISSAGE">Graissage</option>
                  <option value="NIVEAUX">Niveaux d'huile / liquides</option>
                  <option value="REFROIDISSEMENT">Système de Refroidissement</option>
                  <option value="PNEUMATIQUES">Pneumatiques / Chenilles</option>
                  <option value="AUTRE">Autre Vérification</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddTask}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                id="btn-add-config-task"
              >
                <Plus className="h-4 w-4" />
                Ajouter à la liste locale
              </button>
            </div>
          </div>

          {/* Right listing and reordering tasks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-[#D4AF37]/50 shadow-sm space-y-4" id="config-tasks-list-card">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-800">
                    Tâches réglementaires ({confTasks.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    S'applique aux futurs lancements de feuilles pour le site {confSite} et le {confPoste}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                  id="btn-save-config-db"
                >
                  <Save className="h-3.5 w-3.5" />
                  Enregistrer Configuration dans Firestore
                </button>
              </div>

              {confTasks.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <AlertTriangle className="h-8 w-8 mx-auto text-amber-500" />
                  <p className="text-sm font-semibold">Aucune tâche configurée.</p>
                  <p className="text-xs">Saisissez une tâche à gauche pour démarrer la configuration.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {confTasks.map((t, index) => (
                    <div 
                      key={t.id} 
                      className={`p-3.5 rounded-lg border flex items-center justify-between gap-4 transition-all ${
                        t.active ? "bg-white border-slate-100" : "bg-slate-50/50 border-slate-100 opacity-60"
                      }`}
                      id={`config-task-row-${t.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-300 w-4">
                          {index + 1}
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-700">{t.label}</p>
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-500 rounded uppercase">
                            {t.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle active state */}
                        <button
                          type="button"
                          onClick={() => handleToggleTaskActive(t.id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-all"
                          title={t.active ? "Désactiver la tâche" : "Activer la tâche"}
                          id={`btn-toggle-config-task-${t.id}`}
                        >
                          {t.active ? (
                            <ToggleRight className="h-6 w-6 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-slate-400" />
                          )}
                        </button>

                        {/* Delete task */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(t.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                          title="Supprimer la tâche"
                          id={`btn-delete-config-task-${t.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
