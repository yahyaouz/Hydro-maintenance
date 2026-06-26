import * as React from "react";
import { 
  Flame, Shuffle, Droplets, Compass, ShieldAlert, Zap, 
  ThermometerSnowflake, Wind, Disc, Hammer, ShieldCheck, 
  Search, Wrench, Printer, BookOpen, Plus, Minus, 
  AlertTriangle, CheckCircle2, Activity, FileText, Check, 
  ExternalLink, Lock, Scale, GraduationCap, AlertCircle, 
  Save, Trash2, Send, ShoppingCart, Sliders
} from "lucide-react";
import { 
  EPIROC_ST2D_PANNES, EPIROC_ST2D_SYSTEMS, EPIROC_ST2D_ERRORS, 
  EPIROC_ST2D_STOCK, EPIROC_ST2D_PROCEDURES, 
  EPIROC_ST2D_REFERENCES, EPIROC_ST2D_COUPLES, 
  EPIROC_ST2D_KITS, EPIROC_ST2D_SYMPTOMS_INDEX, 
  EpirocSt2dPanne 
} from "./epirocSt2dData";
import { PageBanner } from "@/components/ui/PageBanner";
import { useAuthStore } from "@/lib/store";
import { HydrominesLogo } from "./auth/HydrominesLogo";

export function AssistantEpirocSt2d() {
  const { activeSite } = useAuthStore();

  // ⚙️ Mode opérationnel : DEP (Dépannage), APP (Apprentissage), CHF (Chef d'Atelier), ECO (Mode ÉCO)
  const [mode, setMode] = React.useState<"DEP" | "APP" | "CHF" | "ECO">("DEP");

  // ⚠️ Mode Urgence Actif (Seulement pannes rouges)
  const [isEmergencyActive, setIsEmergencyActive] = React.useState(false);

  // 📂 Onglets de navigation principaux
  const [activeTab, setActiveTab] = React.useState<"depannage" | "procedures" | "magasin" | "securite" | "fiche" | "referentiel" | "certification">("depannage");

  // State for the interactive tab explanation guide
  const [activeTabGuide, setActiveTabGuide] = React.useState<{ tabId: string; step: number } | null>(null);

  // Reset tab guide step to 1 when tab changes, only showing it if it hasn't been shown in the last 7 days
  React.useEffect(() => {
    const key = `guide_shown_st2d_${activeTab}`;
    const lastShown = localStorage.getItem(key);
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    
    if (!lastShown || now - parseInt(lastShown, 10) > oneWeekInMs) {
      setActiveTabGuide({ tabId: activeTab, step: 1 });
      localStorage.setItem(key, now.toString());
    } else {
      setActiveTabGuide(null);
    }
  }, [activeTab]);

  // Helper data for the tab guides
  const getGuideTabName = (tabId: string) => {
    switch (tabId) {
      case "depannage": return "Diagnostic & Pannes";
      case "procedures": return "Procédures & LOTO";
      case "magasin": return "Stock & Consommables";
      case "securite": return "Urgences & Sécurité";
      case "fiche": return "Suivi d'Intervention";
      case "referentiel": return "Valeurs & Couples";
      case "certification": return "Niveaux & Contrôles";
      default: return "Guide";
    }
  };

  const getGuideTotalSteps = (tabId: string) => {
    return 2; // All tabs have 2 elegant steps
  };

  const getGuideStepTitle = (tabId: string, step: number) => {
    if (tabId === "depannage") {
      return step === 1 ? "🔧 Diagnostic & Pannes (ST2D)" : "⚙️ Symptômes Moteur & Boîte";
    }
    if (tabId === "procedures") {
      return step === 1 ? "⚙️ Procédures & Consignation LOTO" : "🔧 Maintenance Deutz";
    }
    if (tabId === "magasin") {
      return step === 1 ? "📦 Stock & Consommables" : "🔄 Équivalences Filtres";
    }
    if (tabId === "securite") {
      return step === 1 ? "🆘 Urgences & Sécurité" : "⚠️ Anomalies Visuelles";
    }
    if (tabId === "fiche") {
      return step === 1 ? "✍️ Suivi d'Intervention" : "📂 Archives Locales";
    }
    if (tabId === "referentiel") {
      return step === 1 ? "⚖️ Valeurs & Couples de Serrage" : "📐 Pressions de Circuits";
    }
    if (tabId === "certification") {
      return step === 1 ? "🎓 Niveaux & Contrôles" : "📋 Préparatifs de Poste";
    }
    return "";
  };

  const getGuideStepText = (tabId: string, step: number) => {
    if (tabId === "depannage") {
      return step === 1 
        ? "Trouvez les pannes spécifiques au Scooptram ST2D à transmission mécanique Dana et moteur Deutz F6L912W refroidi par air."
        : "Résolvez les problèmes de fumée d'échappement, de surchauffe moteur par air, ou de patinage du convertisseur.";
    }
    if (tabId === "procedures") {
      return step === 1 
        ? "Règles obligatoires de mise hors tension et décompression hydraulique du ST2D pour travailler sans danger."
        : "Instructions pas-à-pas pour régler le jeu de soupapes et nettoyer la turbine de refroidissement par air.";
    }
    if (tabId === "magasin") {
      return step === 1 
        ? "Vérifiez la disponibilité des filtres à air à bain d'huile, courroies de ventilateur et injecteurs Deutz."
        : "Consultez la table d'équivalence des filtres pour l'entretien périodique du ST2D.";
    }
    if (tabId === "securite") {
      return step === 1 
        ? "Protocoles d'extinction d'incendie moteur et consignes de conduite sécurisée dans les rampes."
        : "Sachez identifier visuellement une fuite de collecteur ou une courroie de turbine lâche avant la rupture.";
    }
    if (tabId === "fiche") {
      return step === 1 
        ? "Rédigez et signez le rapport d'intervention mécanique suite au dépannage ou à la maintenance préventive du ST2D."
        : "Suivez l'historique des travaux par numéro de parc pour repérer les anomalies chroniques.";
    }
    if (tabId === "referentiel") {
      return step === 1 
        ? "Données de serrage de culasse moteur Deutz, couples de roues et pressions limites d'utilisation."
        : "Valeurs nominales des pressions de direction, de freinage et de pilotage hydraulique.";
    }
    if (tabId === "certification") {
      return step === 1 
        ? "Apprenez à vérifier correctement le niveau de boîte de transfert, le niveau d'huile moteur, et le graissage centralisé."
        : "Checklist de sécurité obligatoire avant de démarrer l'engin à chaque début de poste.";
    }
    return "";
  };

  // 🔍 Barre de recherche et filtres système / gravité
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSystemFilter, setSelectedSystemFilter] = React.useState<string>("TOUS");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = React.useState<string>("TOUS");

  // 📦 Stock interactif en localStorage
  const [stocks, setStocks] = React.useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem("epiroc_st2d_stock_qty");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    const defaults: { [key: string]: number } = {};
    Object.keys(EPIROC_ST2D_STOCK).forEach(key => {
      defaults[key] = (EPIROC_ST2D_STOCK as any)[key].qty;
    });
    return defaults;
  });

  React.useEffect(() => {
    localStorage.setItem("epiroc_st2d_stock_qty", JSON.stringify(stocks));
  }, [stocks]);

  const updateStockQty = (key: string, delta: number) => {
    setStocks(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  // 📋 Progression des check-lists de procédures
  const [procedureProgress, setProcedureProgress] = React.useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("epiroc_st2d_proc_checklist");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {};
  });

  const toggleStep = (procId: string, index: number) => {
    const key = `${procId}_${index}`;
    setProcedureProgress(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("epiroc_st2d_proc_checklist", JSON.stringify(updated));
      return updated;
    });
  };

  // Check-list LOTO interactive
  const [lotoCompleted, setLotoCompleted] = React.useState<{ [key: number]: boolean }>(() => {
    const saved = localStorage.getItem("epiroc_st2d_loto_steps");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {};
  });

  const toggleLotoStep = (idx: number) => {
    setLotoCompleted(prev => {
      const updated = { ...prev, [idx]: !prev[idx] };
      localStorage.setItem("epiroc_st2d_loto_steps", JSON.stringify(updated));
      return updated;
    });
  };

  // ✍️ Fiche d'intervention active
  const [formState, setFormState] = React.useState({
    date: new Date().toISOString().split("T")[0],
    machineHours: "",
    mecoName: "",
    level: "1",
    parkNo: "ST2D-01",
    symptom: "",
    context: "Démarrage",
    panneNo: "",
    repaired: "oui",
    partsUsed: "",
    diagTime: "",
    repairTime: "",
    downTime: "",
    partsWaitTime: "",
    validationSigned: false,
    supervisorSigned: false,
    comments: ""
  });

  // Historique des interventions
  const [interventionHistory, setInterventionHistory] = React.useState<any[]>(() => {
    const saved = localStorage.getItem("epiroc_st2d_interventions_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const submitInterventionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.mecoName || !formState.machineHours) {
      alert("Veuillez remplir au moins le nom du mécanicien et les heures de l'engin.");
      return;
    }
    const newRecord = {
      id: Date.now(),
      ...formState
    };
    const updatedHistory = [newRecord, ...interventionHistory].slice(0, 10);
    setInterventionHistory(updatedHistory);
    localStorage.setItem("epiroc_st2d_interventions_history", JSON.stringify(updatedHistory));
    
    // Reset partiel
    setFormState(prev => ({
      ...prev,
      symptom: "",
      panneNo: "",
      machineHours: "",
      partsUsed: "",
      diagTime: "",
      repairTime: "",
      downTime: "",
      partsWaitTime: "",
      comments: "",
      validationSigned: false,
      supervisorSigned: false
    }));
    alert("Fiche d'intervention enregistrée localement dans l'historique !");
  };

  const deleteInterventionRecord = (id: number) => {
    const updated = interventionHistory.filter(r => r.id !== id);
    setInterventionHistory(updated);
    localStorage.setItem("epiroc_st2d_interventions_history", JSON.stringify(updated));
  };

  // Clic sur l'index inversé de symptômes
  const triggerSymptomSearch = (tag: string) => {
    setSearchQuery(tag);
    setActiveTab("depannage");
  };

  // Liste des pannes filtrées
  const filteredPannes = React.useMemo(() => {
    return EPIROC_ST2D_PANNES.filter(p => {
      if (isEmergencyActive && p.severity !== "ROUGE") return false;
      if (selectedSystemFilter !== "TOUS" && p.system !== selectedSystemFilter) return false;
      if (selectedSeverityFilter !== "TOUS" && p.severity !== selectedSeverityFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesSymptoms = p.symptoms.toLowerCase().includes(query);
        const matchesCause = p.cause.toLowerCase().includes(query);
        const matchesAction = p.action.toLowerCase().includes(query);
        return p.id.toLowerCase().includes(query) || matchesTitle || matchesSymptoms || matchesCause || matchesAction;
      }
      return true;
    });
  }, [isEmergencyActive, selectedSystemFilter, selectedSeverityFilter, searchQuery]);

  const isEco = mode === "ECO";

  // Rendu de l'icône système
  const renderSystemIcon = (sysId: string) => {
    switch (sysId) {
      case "SYS1": return <Flame className="w-4 h-4 text-orange-500" />;
      case "SYS2": return <Shuffle className="w-4 h-4 text-blue-500" />;
      case "SYS3": return <Droplets className="w-4 h-4 text-sky-500" />;
      case "SYS4": return <Compass className="w-4 h-4 text-teal-500" />;
      case "SYS5": return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case "SYS6": return <Zap className="w-4 h-4 text-yellow-500" />;
      case "SYS7": return <ThermometerSnowflake className="w-4 h-4 text-indigo-400" />;
      case "SYS8": return <Wind className="w-4 h-4 text-slate-400" />;
      case "SYS9": return <Disc className="w-4 h-4 text-purple-500" />;
      case "SYS10": return <Hammer className="w-4 h-4 text-amber-600" />;
      case "SYS11": return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default: return <Wrench className="w-4 h-4" />;
    }
  };

  return (
    <div className={`w-full min-h-screen bg-slate-50 text-slate-900 font-sans ${isEco ? 'contrast-125' : ''}`}>
      
      {/* 🚀 BANNIÈRE D'ACCUEIL */}
      <div className="p-4 md:p-6 pb-0 print:hidden">
        <PageBanner
          icon={Wrench}
          badgeLabel="ASSISTANT TECHNIQUE"
          title="Epiroc Scooptram ST2D"
          subtitle="Chargeur Souterrain Mécanique • Deutz refroidi par air & Dana C-270"
          siteLabel={activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
          logo={<HydrominesLogo size={110} variant="full" className="mb-1" />}
        >
          {/* Bouton d'urgence */}
          <button
            onClick={() => setIsEmergencyActive(!isEmergencyActive)}
            className={`px-4 h-10 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 shadow-sm cursor-pointer ${
              isEmergencyActive 
                ? "bg-red-600 text-white animate-bounce border border-white" 
                : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>{isEmergencyActive ? "⚠️ URGENCE ACTIVE" : "🚨 MODE URGENCE"}</span>
          </button>

          {/* Sélecteur de mode */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 h-10 items-center">
            <button 
              onClick={() => setMode("DEP")} 
              className={`px-2.5 py-1 text-[11px] font-black rounded-md transition-all cursor-pointer ${mode === "DEP" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Mode standard : actions directes de dépannage"
            >
              🛠️ DEP
            </button>
            <button 
              onClick={() => setMode("APP")} 
              className={`px-2.5 py-1 text-[11px] font-black rounded-md transition-all cursor-pointer ${mode === "APP" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Mode Apprentissage : explications pédagogiques"
            >
              🎓 APP
            </button>
            <button 
              onClick={() => setMode("CHF")} 
              className={`px-2.5 py-1 text-[11px] font-black rounded-md transition-all cursor-pointer ${mode === "CHF" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Mode Chef d'Atelier : responsabilités et signatures"
            >
              👨‍✈️ CHEF
            </button>
            <button 
              onClick={() => setMode("ECO")} 
              className={`px-2.5 py-1 text-[11px] font-black rounded-md transition-all cursor-pointer ${mode === "ECO" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Mode ÉCO : contraste élevé sans animations lourdes"
            >
              🔋 ÉCO
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 h-10 w-10 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 flex items-center justify-center cursor-pointer transition-all shadow-sm"
            title="Imprimer la page"
          >
            <Printer className="w-4 h-4" />
          </button>
        </PageBanner>
      </div>

      {/* 🚨 MESSAGE ALERTE URGENCE CRITIQUE */}
      {isEmergencyActive && (
        <div className="bg-red-50 text-red-700 px-4 py-3 border-b border-red-200 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-3 animate-pulse">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>Filtre de crise actif : seules les pannes critiques entraînant un arrêt immédiat (ROUGE) s'affichent !</span>
          <button 
            onClick={() => setIsEmergencyActive(false)}
            className="underline ml-4 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-[10px] font-bold"
          >
            Désactiver
          </button>
        </div>
      )}

      {/* 🧭 NAVIGATION SECONDAIRE */}
      <div className="bg-slate-100 border-b border-slate-200 p-2 grid grid-cols-2 md:grid-cols-5 gap-1.5 md:gap-2 print:hidden mb-4 rounded-xl mx-4 shadow-sm">
        <button
          onClick={() => { setActiveTab("depannage"); setActiveTabGuide({ tabId: "depannage", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "depannage" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Wrench className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">1. Pannes</span>
        </button>
        <button
          onClick={() => { setActiveTab("procedures"); setActiveTabGuide({ tabId: "procedures", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "procedures" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Activity className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">2. Procédures LOTO</span>
        </button>
        <button
          onClick={() => { setActiveTab("magasin"); setActiveTabGuide({ tabId: "magasin", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "magasin" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">3. Magasin Stock</span>
        </button>
        <button
          onClick={() => { setActiveTab("securite"); setActiveTabGuide({ tabId: "securite", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "securite" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">4. Sécurité & Urgences</span>
        </button>
        <button
          onClick={() => { setActiveTab("fiche"); setActiveTabGuide({ tabId: "fiche", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "fiche" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">5. Suivi</span>
        </button>
        <button
          onClick={() => { setActiveTab("referentiel"); setActiveTabGuide({ tabId: "referentiel", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "referentiel" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Scale className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">6. Couples</span>
        </button>
        <button
          onClick={() => { setActiveTab("certification"); setActiveTabGuide({ tabId: "certification", step: 1 }); }}
          className={`px-3 py-2.5 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            activeTab === "certification" ? "bg-amber-500 text-slate-900 border-amber-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">7. Contrôles</span>
        </button>
      </div>

      {/* 🧭 TAB GUIDE OVERLAY */}
      {activeTabGuide && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase">
                Guide : {getGuideTabName(activeTabGuide.tabId)} (Étape {activeTabGuide.step} sur {getGuideTotalSteps(activeTabGuide.tabId)})
              </span>
              <button 
                onClick={() => setActiveTabGuide(null)} 
                className="text-xs text-slate-400 hover:text-slate-600 uppercase font-bold cursor-pointer"
              >
                Passer ✕
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm md:text-base font-black text-slate-900">
                {getGuideStepTitle(activeTabGuide.tabId, activeTabGuide.step)}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {getGuideStepText(activeTabGuide.tabId, activeTabGuide.step)}
              </p>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
              {activeTabGuide.step > 1 ? (
                <button 
                  onClick={() => setActiveTabGuide(prev => prev ? { ...prev, step: prev.step - 1 } : null)} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Précédent
                </button>
              ) : <div />}
              
              {activeTabGuide.step < getGuideTotalSteps(activeTabGuide.tabId) ? (
                <button 
                  onClick={() => setActiveTabGuide(prev => prev ? { ...prev, step: prev.step + 1 } : null)} 
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black rounded-lg cursor-pointer shadow-sm"
                >
                  Continuer
                </button>
              ) : (
                <button 
                  onClick={() => setActiveTabGuide(null)} 
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg cursor-pointer shadow-sm"
                >
                  Ouvrir l'onglet
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📐 CONTENU CENTRAL */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLONNE GAUCHE (Filtres, Index Symptômes, Erreurs de conduite) */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          
          {/* RECHERCHE AVANCÉE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-500" />
              Recherche Avancée
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mot-clé, symptôme, référence..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded px-1.5 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <button 
                onClick={() => { setSelectedSystemFilter("TOUS"); setSelectedSeverityFilter("TOUS"); setSearchQuery(""); }} 
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[9px] font-bold"
              >
                🔄 Reset Filtres
              </button>
              <button 
                onClick={() => setSearchQuery("Deutz")} 
                className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded text-[9px] font-bold"
              >
                🔥 Deutz F6L
              </button>
              <button 
                onClick={() => setSearchQuery("Dana")} 
                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[9px] font-bold"
              >
                ⚙️ Transmission
              </button>
              <button 
                onClick={() => setSelectedSeverityFilter("ROUGE")} 
                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[9px] font-bold"
              >
                🔴 Arrêt Critique
              </button>
            </div>
          </div>

          {/* INDEX INVERSÉ PAR SYMPTÔME */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              Index par Symptômes Physiques
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">
              Sélectionnez un symptôme pour filtrer instantanément les fiches techniques corrélées :
            </p>

            <div className="space-y-3">
              {Object.entries(EPIROC_ST2D_SYMPTOMS_INDEX).map(([category, items]) => (
                <div key={category} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1">
                    {category}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => {
                      const idCode = item.split(" ")[0];
                      const label = item.substring(item.indexOf(" ") + 1);
                      return (
                        <button
                          key={item}
                          onClick={() => triggerSymptomSearch(idCode)}
                          className="px-2 py-1.5 rounded bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-[10px] font-semibold text-slate-700 hover:text-amber-800 transition-all cursor-pointer text-left flex items-center justify-between gap-1 w-full"
                        >
                          <span className="truncate">{label}</span>
                          <span className="font-mono text-[9px] bg-slate-200 px-1 py-0.5 rounded text-slate-600 font-bold shrink-0">
                            {idCode}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PIÈGES ET ERREURS À ÉVITER */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              15 Erreurs Communes (Casse)
            </h3>
            <p className="text-[10px] text-amber-700 mb-3">
              Erreurs fatales de conduite ou de maintenance entraînant des pannes destructives immédiates :
            </p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {EPIROC_ST2D_ERRORS.map((err) => (
                <div key={err.id} className="text-[10px] text-slate-700 leading-relaxed border-l-2 border-amber-400 pl-2">
                  <span className="font-bold text-amber-800">#{err.id}</span> {err.text}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* COLONNE DROITE : CONTENU PRINCIPAL DES ONGLETS (8/12 WIDTH) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* --- ONGLET 1 : DIAGNOSTIC & PANNES --- */}
          {activeTab === "depannage" && (
            <div className="space-y-6">
              
              {/* FILTRES PAR SYSTÈMES ET GRAVITÉ */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs print:hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Système Mécanique</label>
                    <select
                      value={selectedSystemFilter}
                      onChange={(e) => setSelectedSystemFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="TOUS">🌍 TOUS LES SYSTÈMES (83 pannes)</option>
                      {EPIROC_ST2D_SYSTEMS.map((sys) => (
                        <option key={sys.id} value={sys.id}>{sys.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Sévérité / Conséquence</label>
                    <select
                      value={selectedSeverityFilter}
                      onChange={(e) => setSelectedSeverityFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="TOUS">🟡 TOUTES LES SEVERITES</option>
                      <option value="ROUGE">🔴 ROUGE : Arrêt Immédiat (Critique)</option>
                      <option value="JAUNE">🟡 JAUNE : Alerte / Réparation requise</option>
                      <option value="VERT">🟢 VERT : Information / Périodique</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* LISTE DES PANNES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                    Fiches de pannes correspondantes ({filteredPannes.length})
                  </h2>
                  <span className="text-[10px] text-slate-400 font-bold">ST2D - Moteur à air Deutz</span>
                </div>

                {filteredPannes.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-slate-500">Aucune panne trouvée pour ces filtres ou cette recherche.</p>
                    <button 
                      onClick={() => { setSelectedSystemFilter("TOUS"); setSelectedSeverityFilter("TOUS"); setSearchQuery(""); }}
                      className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg"
                    >
                      Réinitialiser la recherche
                    </button>
                  </div>
                ) : (
                  filteredPannes.map((panne) => (
                    <div 
                      key={panne.id} 
                      className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300 relative break-inside-avoid ${
                        panne.severity === "ROUGE" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-amber-400"
                      }`}
                    >
                      {/* En-tête de carte */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            {panne.id}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            {renderSystemIcon(panne.system)}
                            {EPIROC_ST2D_SYSTEMS.find(s => s.id === panne.system)?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            ⌛ Temps : <strong className="text-slate-800">{panne.repTime} h</strong>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            panne.severity === "ROUGE" 
                              ? "bg-red-50 text-red-700 border border-red-200" 
                              : panne.severity === "JAUNE" 
                              ? "bg-amber-50 text-amber-700 border border-amber-200" 
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {panne.severity === "ROUGE" ? "🛑 CRITIQUE - ARRÊT" : "⚠️ ALERTE GMAO"}
                          </span>
                        </div>
                      </div>

                      {/* Titre */}
                      <h3 className="text-sm font-black text-slate-900 mb-3.5 tracking-tight">
                        {panne.title}
                      </h3>

                      {/* Contenu technique détaillé */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">🔍 Symptôme observé</label>
                          <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{panne.symptoms}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">⚙️ Cause probable</label>
                          <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{panne.cause}</p>
                        </div>
                        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/60">
                          <label className="text-[9px] font-black text-amber-600 uppercase tracking-wider block mb-1">🛠️ Remède & Action</label>
                          <p className="text-[11px] text-slate-800 leading-relaxed font-semibold">{panne.action}</p>
                        </div>
                      </div>

                      {/* MODE APPRENTISSAGE (EXPLICATIONS PÉDAGOGIQUES) */}
                      {mode === "APP" && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 mb-3 text-indigo-950 text-xs space-y-2">
                          <span className="font-black text-[9px] uppercase tracking-wider block text-indigo-700">🎓 Explication théorique & Pédagogie (Chef Mécano)</span>
                          <p className="leading-relaxed">
                            Sur cette machine ancienne brute à air <strong>ST2D</strong>, le dysfonctionnement mentionné perturbe l'équilibre thermique ou cinématique. En agissant sur la commande ou en démontant le sous-ensemble, veillez à toujours inspecter la limaille et à purger l'air restant. C'est l'écoute et le toucher mécanique qui évitent d'empirer la situation.
                          </p>
                          <div className="flex items-center gap-2 font-mono text-[10px] text-indigo-700">
                            <span>🎓 Requis : Niveau {panne.severity === "ROUGE" ? "3 (Expert / Chef)" : "2 (Confirmé)"}</span>
                          </div>
                        </div>
                      )}

                      {/* MODE CHEF D'ATELIER */}
                      {mode === "CHF" && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-3 text-emerald-950 text-xs">
                          <span className="font-black text-[9px] uppercase tracking-wider block text-emerald-700">👨‍✈️ Suivi Administratif & GMAO (Chef d'Atelier)</span>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-[10px]">
                            <div>
                              <span>Signature d'arrêt : <strong>Requis</strong></span>
                            </div>
                            <div>
                              <span>Code d'imputation : <strong>ST2D-{panne.id.replace(/\./g, "")}</strong></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* --- ONGLET 2 : PROCÉDURES DE DÉMONTAGE & LOTO --- */}
          {activeTab === "procedures" && (
            <div className="space-y-6">
              
              {/* BANNIÈRE DE SÉCURITÉ LOTO */}
              <div className="bg-red-950 text-white rounded-2xl p-5 border border-red-800">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-600 rounded-xl">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-red-200">PROCÉDURE LOTO ST2D — CONSIGNATION</h3>
                    <p className="text-xs text-red-300 leading-relaxed mt-1">
                      Avant toute intervention mécanique majeure sur le circuit hydraulique sous pression, l'accumulateur de frein HASR ou le bloc Deutz refroidi à air, effectuez impérativement les 9 étapes de consignation :
                    </p>
                  </div>
                </div>

                {/* Étapes LOTO Interactives */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Arrêt moteur, clé retirée",
                    "Batterie débranchée (+ et -)",
                    "Réservoir hydraulique dépressurisé",
                    "Accumulateur frein dépressurisé",
                    "Cales de roues de secours placées",
                    "Boom baissé et calé mécaniquement",
                    "Godet à plat sur le sol",
                    "Panneau d'avertissement en place",
                    "Clé de cadenas conservée par le mécano"
                  ].map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleLotoStep(idx)}
                      className={`p-2.5 rounded-xl text-left text-[11px] font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                        lotoCompleted[idx] 
                          ? "bg-red-800/40 border-red-500 text-white line-through" 
                          : "bg-red-900/40 border-red-800/60 text-red-200 hover:bg-red-900/80"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                        lotoCompleted[idx] ? "bg-red-500 text-white" : "bg-red-800 text-red-300"
                      }`}>
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* LISTE DES PROCÉDURES DE DÉMONTAGE */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Procédures de Démontage & Remontage Pas-à-Pas
                </h3>

                {EPIROC_ST2D_PROCEDURES.map((proc) => (
                  <div key={proc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-100">
                      <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-black">
                        {proc.id}
                      </span>
                      <h4 className="text-xs font-black uppercase text-slate-900">{proc.title}</h4>
                    </div>

                    <div className="space-y-2">
                      {proc.steps.map((step, sIdx) => {
                        const isDone = procedureProgress[`${proc.id}_${sIdx}`];
                        return (
                          <div 
                            key={sIdx}
                            onClick={() => toggleStep(proc.id, sIdx)}
                            className={`p-2.5 rounded-xl border text-xs flex items-start gap-3 transition-all cursor-pointer ${
                              isDone 
                                ? "bg-slate-50 border-emerald-200 text-slate-400 line-through" 
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isDone ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-600"
                            }`}>
                              {sIdx + 1}
                            </span>
                            <span className="leading-relaxed font-semibold">{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* --- ONGLET 3 : STOCKS & CONSOMMABLES --- */}
          {activeTab === "magasin" && (
            <div className="space-y-6">
              
              {/* TABLEAU DES PIÈCES SOU-MAG MINE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Tableau des Pièces de Rechange (SOU-MAG Stock Mine)
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Contrôlez les quantités physiques disponibles et gérez les prélèvements d'urgence :
                    </p>
                  </div>
                  <ShoppingCart className="w-5 h-5 text-amber-500" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Désignation technique</th>
                        <th className="py-2.5 px-3 text-center">Quantité en Stock</th>
                        <th className="py-2.5 px-3 text-right">Actions de stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {Object.entries(EPIROC_ST2D_STOCK).map(([key, item]) => (
                        <tr key={key} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <span className="block font-black text-slate-950">{item.desc}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Réf : SOU-ST2D-{key.toUpperCase()}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              stocks[key] === 0 
                                ? "bg-red-100 text-red-700 font-black" 
                                : stocks[key] === 1 
                                ? "bg-amber-100 text-amber-800" 
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {stocks[key]} dispo{stocks[key] === 0 ? "s (RUPTURE!)" : ""}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-1">
                              <button
                                onClick={() => updateStockQty(key, -1)}
                                className="w-7 h-7 bg-white hover:bg-red-50 text-red-600 rounded flex items-center justify-center font-bold shadow-xs cursor-pointer"
                                title="Sortir une pièce"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => updateStockQty(key, 1)}
                                className="w-7 h-7 bg-white hover:bg-emerald-50 text-emerald-600 rounded flex items-center justify-center font-bold shadow-xs cursor-pointer"
                                title="Ajouter au stock"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* INTERCHANGEABILITÉ DES PIÈCES */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  Matrice d'Interchangeabilité de secours
                </h3>
                <p className="text-[10px] text-slate-500 mb-4">
                  Sur les chantiers reculés, l'interchangeabilité mécanique permet d'économiser de longues heures d'arrêt :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-[9px] uppercase tracking-wider block text-slate-400 mb-1">MOTEUR DEUTZ F6L-912W</span>
                    <p className="text-slate-700 leading-relaxed font-semibold">
                      Composant 100% interchangeable avec les moteurs de chargeuses Wagner anciennes, ainsi que certains compresseurs d'air souterrains de chantier.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-[9px] uppercase tracking-wider block text-slate-400 mb-1">TRANSMISSION DANA R32000</span>
                    <p className="text-slate-700 leading-relaxed font-semibold">
                      Spécifique au ST2D. Vérifier attentivement la compatibilité des cannelures d'arbres avec la transmission du ST2G avant tout montage.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-[9px] uppercase tracking-wider block text-slate-400 mb-1">CONVERTISSEUR C-270</span>
                    <p className="text-slate-700 leading-relaxed font-semibold">
                      Spécifique à la série ST2D. Ne pas interchanger avec d'autres séries sans l'aval du chef d'atelier de la mine.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-[9px] uppercase tracking-wider block text-slate-400 mb-1">VÉRINS HYDRAULIQUES</span>
                    <p className="text-slate-700 leading-relaxed font-semibold">
                      Diamètres de pistons standardisés (125 / 180 / 180 mm). Compatibilité physique possible avec le chargeur ST2G.
                    </p>
                  </div>
                </div>
              </div>

              {/* CONSOMMABLES EXACTS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  Spécification des Consomables d'Origine
                </h3>
                <p className="text-[10px] text-slate-500 mb-4">
                  Ne jamais mélanger les types d'huiles pour éviter le grippage précoce des pompes à engrenages :
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Produit</th>
                        <th className="py-2.5 px-3">Spécification Technique exacte</th>
                        <th className="py-2.5 px-3">Alternative d'Urgence autorisée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-950">Huile Moteur</td>
                        <td className="py-3 px-3">Deutz spec, Viscosité 15W-40</td>
                        <td className="py-3 px-3 text-slate-500">Shell Rimula R4X 15W-40</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-950">Huile Transmission</td>
                        <td className="py-3 px-3">Dexron III ou spécification officielle DANA</td>
                        <td className="py-3 px-3 text-slate-500">Mobil Delvac ATF</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-950">Huile Hydraulique</td>
                        <td className="py-3 px-3">ISO VG 46, Additif anti-usure</td>
                        <td className="py-3 px-3 text-slate-500">Shell Tellus S2 MX 46</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-950">Graisse Manuelle</td>
                        <td className="py-3 px-3">NLGI 2, Complexe Lithium, EP (Extrême Pression)</td>
                        <td className="py-3 px-3 text-slate-500">Mobil Greaserex XHP 222</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-950">Liquide Refroidissement</td>
                        <td className="py-3 px-3 text-red-600 font-bold uppercase">⚠️ PAS DE LIQUIDE</td>
                        <td className="py-3 px-3 text-slate-400">Moteur refroidi par air uniquement !</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* --- ONGLET 4 : URGENCES VITALES & URGENCE ANSUL --- */}
          {activeTab === "securite" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-red-50 text-red-950 border border-red-200 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-sm font-black uppercase text-red-900 tracking-wider flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-5 h-5 text-red-600 animate-bounce" />
                    Protocoles d'Urgences Vitales ST2D
                  </h3>
                  
                  <div className="space-y-4 text-xs leading-relaxed font-semibold text-slate-700">
                    <div className="p-3 bg-white/60 rounded-xl border border-red-100">
                      <span className="text-red-700 font-black uppercase tracking-wider block mb-1">11.1 Incendie Compartiment Moteur</span>
                      <p>Arrêtez immédiatement le moteur, activez le bouton poussoir Ansul de secours, évacuez la machine et quittez la zone vers un abri.</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl border border-red-100">
                      <span className="text-red-700 font-black uppercase tracking-wider block mb-1">11.2 Freins Bloqués en Descente de Rampe</span>
                      <p>Utilisez le frein moteur au ralenti accéléré, ne tentez pas de forcer la descente. Placez les cales de roues dès l'arrêt complet de sécurité.</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl border border-red-100">
                      <span className="text-red-700 font-black uppercase tracking-wider block mb-1">11.3 Rupture d'un Flexible Hydraulique sous Pression</span>
                      <p>N'essayez jamais de colmater à la main (danger mortel de gangrène ou d'injection cutanée). Arrêtez immédiatement le moteur et consignez.</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl border border-red-100">
                      <span className="text-red-700 font-black uppercase tracking-wider block mb-1">11.4 Perte de la Direction en Mouvement</span>
                      <p>Appliquez immédiatement le frein d'urgence HASR au pied ou serrez l'interrupteur d'urgence de la boîte.</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl border border-red-100">
                      <span className="text-red-700 font-black uppercase tracking-wider block mb-1">11.5 Fuite Majeure de Carburant (Gazole)</span>
                      <p>Arrêtez le bloc Deutz chaud immédiatement. Interdiction de produire la moindre étincelle ou d'éclairage non ATEX à proximité.</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl border border-red-100">
                      <span className="text-red-700 font-black uppercase tracking-wider block mb-1">11.6 Patinage du Convertisseur en Descente</span>
                      <p>Engagez le frein moteur mécanique pour soulager l'arbre de transmission de la boîte Dana, évitez le frein de service seul.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[4px] flex overflow-hidden z-10">
                    <div className="bg-sky-400 h-full flex-1"></div>
                    <div className="bg-red-600 h-full flex-1"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-amber-500 tracking-wider flex items-center gap-2 mb-3">
                      <Sliders className="w-5 h-5" />
                      Pratiques et Conseils du Chef Mécano
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      Le <strong>Scooptram ST2D</strong> est une machine brute de mine, entièrement mécanique et très robuste. Contrairement aux modèles plus récents, il n'y a pas d'électronique pour corriger vos erreurs.
                    </p>
                    <blockquote className="border-l-4 border-amber-500 pl-3 py-1 text-xs text-slate-200 italic mb-4">
                      "C'est la brosse métallique sur les ailettes Deutz, le contrôle régulier des tensions de chaînes, et un graissage manuel fait consciencieusement à chaque début de poste qui font durer cette machine sur des dizaines de milliers d'heures."
                    </blockquote>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs space-y-2 text-slate-300">
                    <span className="font-bold text-amber-500 uppercase block text-[10px]">🚨 RÈGLE D'OR SÉCURITÉ</span>
                    <p>Ne touchez jamais à l'accumulateur d'azote HASR sans avoir pompé 20 fois sur la pédale de frein moteur éteint pour libérer la pression résiduelle.</p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* --- ONGLET 5 : FICHE INTERVENTION & HISTORIQUE --- */}
          {activeTab === "fiche" && (
            <div className="space-y-6">
              
              {/* FORMULAIRE HTML5 DE REMPLISSAGE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-slate-100">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Nouvelle Fiche de Suivi d'Intervention ST2D
                  </h3>
                </div>

                <form onSubmit={submitInterventionForm} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Date</label>
                      <input
                        type="date"
                        value={formState.date}
                        onChange={(e) => setFormState(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Heures Machine</label>
                      <input
                        type="number"
                        placeholder="Ex: 14500"
                        value={formState.machineHours}
                        onChange={(e) => setFormState(prev => ({ ...prev, machineHours: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nom du Mécanicien</label>
                      <input
                        type="text"
                        placeholder="Ex: Yahya O."
                        value={formState.mecoName}
                        onChange={(e) => setFormState(prev => ({ ...prev, mecoName: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Niveau d'intervention</label>
                      <select
                        value={formState.level}
                        onChange={(e) => setFormState(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                      >
                        <option value="1">Niveau 1 — Apprenti / Périodique</option>
                        <option value="2">Niveau 2 — Confirmé (Organes extérieurs)</option>
                        <option value="3">Niveau 3 — Expert (Moteur/Boîte/Azote)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Numéro de Parc Engin</label>
                      <input
                        type="text"
                        placeholder="Ex: ST2D-01"
                        value={formState.parkNo}
                        onChange={(e) => setFormState(prev => ({ ...prev, parkNo: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Contexte opérationnel</label>
                      <select
                        value={formState.context}
                        onChange={(e) => setFormState(prev => ({ ...prev, context: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                      >
                        <option value="Démarrage">Démarrage poste</option>
                        <option value="Charge">En phase de chargement</option>
                        <option value="Descente">En descente de rampe</option>
                        <option value="Montée">En montée de rampe</option>
                        <option value="Entretien">Entretien périodique</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Symptôme physique observé</label>
                      <input
                        type="text"
                        placeholder="Ex: Fumée noire, cliquetis, manque force"
                        value={formState.symptom}
                        onChange={(e) => setFormState(prev => ({ ...prev, symptom: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Code / N° de la panne identifiée</label>
                      <input
                        type="text"
                        placeholder="Ex: 1.1.2.B"
                        value={formState.panneNo}
                        onChange={(e) => setFormState(prev => ({ ...prev, panneNo: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Diagnostic (min)</label>
                      <input
                        type="number"
                        placeholder="Ex: 30"
                        value={formState.diagTime}
                        onChange={(e) => setFormState(prev => ({ ...prev, diagTime: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Réparation (h)</label>
                      <input
                        type="number"
                        placeholder="Ex: 2.5"
                        value={formState.repairTime}
                        onChange={(e) => setFormState(prev => ({ ...prev, repairTime: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Immobilisation (h)</label>
                      <input
                        type="number"
                        placeholder="Ex: 3"
                        value={formState.downTime}
                        onChange={(e) => setFormState(prev => ({ ...prev, downTime: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Attente pièces (h)</label>
                      <input
                        type="number"
                        placeholder="Ex: 0.5"
                        value={formState.partsWaitTime}
                        onChange={(e) => setFormState(prev => ({ ...prev, partsWaitTime: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Pièces prélevées du Stock (références)</label>
                    <input
                      type="text"
                      placeholder="Ex: 1x Injecteur Deutz F6L-912W, 1x Joint"
                      value={formState.partsUsed}
                      onChange={(e) => setFormState(prev => ({ ...prev, partsUsed: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Observations / Notes de diagnostic</label>
                    <textarea
                      placeholder="Indiquez les détails de l'intervention ou de la révision..."
                      value={formState.comments}
                      onChange={(e) => setFormState(prev => ({ ...prev, comments: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold h-16"
                    />
                  </div>

                  {/* SIGNATURES INTERACTIVES */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.validationSigned}
                        onChange={(e) => setFormState(prev => ({ ...prev, validationSigned: e.target.checked }))}
                        className="w-4 h-4 text-amber-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">✍️ Signature Mécanicien intervenant</span>
                        <span className="text-[9px] text-slate-500">Je certifie avoir réalisé les tests de validation d'après-panne</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formState.supervisorSigned}
                        onChange={(e) => setFormState(prev => ({ ...prev, supervisorSigned: e.target.checked }))}
                        className="w-4 h-4 text-amber-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">✍️ Validation du Chef de Section Mine</span>
                        <span className="text-[9px] text-slate-500">Validation et archivage de la sortie de stock correspondante</span>
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer l'Intervention ST2D
                  </button>

                </form>
              </div>

              {/* HISTORIQUE LOCAL DES 10 DERNIÈRES INTERVENTIONS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
                  Historique des 10 dernières interventions (ST2D)
                </h3>

                {interventionHistory.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 font-semibold text-xs border border-dashed border-slate-200 rounded-xl">
                    Aucune fiche enregistrée dans cet historique local pour le moment.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {interventionHistory.map((rec) => (
                      <div key={rec.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200 relative text-xs font-medium text-slate-700">
                        <button
                          onClick={() => deleteInterventionRecord(rec.id)}
                          className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-600 transition-all"
                          title="Supprimer cet enregistrement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 pb-2 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase">
                          <div>Machine : <strong className="text-slate-800">{rec.parkNo}</strong></div>
                          <div>Heures : <strong className="text-slate-800">{rec.machineHours} h</strong></div>
                          <div>Mécano : <strong className="text-slate-800">{rec.mecoName}</strong></div>
                          <div>Date : <strong className="text-slate-800">{rec.date}</strong></div>
                        </div>

                        <div className="space-y-1">
                          {rec.panneNo && <div>Panne identifiée : <span className="font-bold font-mono bg-slate-200 px-1 py-0.5 rounded text-[10px] text-slate-700">{rec.panneNo}</span></div>}
                          {rec.symptom && <div>Symptôme : <strong>{rec.symptom}</strong></div>}
                          {rec.partsUsed && <div>Pièces utilisées : <span className="text-slate-900 font-bold">{rec.partsUsed}</span></div>}
                          {rec.comments && <div className="text-slate-500 italic mt-1">"{rec.comments}"</div>}
                        </div>

                        <div className="mt-2.5 flex flex-wrap gap-2 text-[9px] font-black uppercase">
                          <span className={`px-2 py-0.5 rounded ${rec.validationSigned ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                            {rec.validationSigned ? "✔ Signée Mécano" : "❌ Non Signée Mécano"}
                          </span>
                          <span className={`px-2 py-0.5 rounded ${rec.supervisorSigned ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                            {rec.supervisorSigned ? "✔ Signée Chef" : "❌ Non Signée Chef"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* --- ONGLET 6 : VALEURS DE RÉFÉRENCE & COUPLES DE SERRAGE --- */}
          {activeTab === "referentiel" && (
            <div className="space-y-6">
              
              {/* TABLEAU DES VALEURS DE RÉFÉRENCE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  12. Limites Opérationnelles & Valeurs de Référence (ST2D)
                </h3>
                <p className="text-[10px] text-slate-500 mb-4">
                  Seuils de surveillance critiques pour garantir la longévité mécanique des organes :
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Organe / Capteur</th>
                        <th className="py-2.5 px-3">Valeur Nominale</th>
                        <th className="py-2.5 px-3 text-red-600">Seuil d'Alarme</th>
                        <th className="py-2.5 px-3 text-red-800">Seuil d'Arrêt Immédiat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-900">Huile Moteur Deutz</td>
                        <td className="py-3 px-3">3.5 à 4.5 bar (2300 rpm)</td>
                        <td className="py-3 px-3 text-amber-600">&lt; 1.5 bar</td>
                        <td className="py-3 px-3 text-red-600 font-bold">&lt; 1.0 bar</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-900">Température de culasse (à air)</td>
                        <td className="py-3 px-3">110°C - 150°C (mesure thermomètre)</td>
                        <td className="py-3 px-3 text-amber-600">&gt; 165°C</td>
                        <td className="py-3 px-3 text-red-600 font-bold">&gt; 175°C (serrage cyl.!)</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-900">Huile Transmission Dana</td>
                        <td className="py-3 px-3">18.0 à 21.0 bar (pression d'embrayage)</td>
                        <td className="py-3 px-3 text-amber-600">&lt; 15.0 bar</td>
                        <td className="py-3 px-3 text-red-600 font-bold">&lt; 12.0 bar</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-900">Hydraulique Travail (Pression benne)</td>
                        <td className="py-3 px-3">11.4 MPa (1650 psi)</td>
                        <td className="py-3 px-3 text-amber-600">&lt; 10.0 MPa</td>
                        <td className="py-3 px-3 text-slate-400">N/A</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-900">Hydraulique Direction (Pression braquage)</td>
                        <td className="py-3 px-3">13.1 MPa (1900 psi)</td>
                        <td className="py-3 px-3 text-amber-600">&lt; 11.5 MPa</td>
                        <td className="py-3 px-3 text-slate-400">N/A</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-900">Pression Accumulateur Frein HASR</td>
                        <td className="py-3 px-3">110 - 120 bar</td>
                        <td className="py-3 px-3 text-amber-600">&lt; 85 bar</td>
                        <td className="py-3 px-3 text-red-600 font-bold">&lt; 70 bar</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-900">Tension Électrique batteries</td>
                        <td className="py-3 px-3">25.2V à 27.8V (en marche)</td>
                        <td className="py-3 px-3 text-amber-600">&lt; 23.5V</td>
                        <td className="py-3 px-3 text-red-600 font-bold">&lt; 21.0V</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-900">Pression de gonflage pneus</td>
                        <td className="py-3 px-3">4.5 bar (65 psi)</td>
                        <td className="py-3 px-3 text-slate-400">N/A</td>
                        <td className="py-3 px-3 text-slate-400">N/A</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-900">Épaisseur disque de frein immergé</td>
                        <td className="py-3 px-3">12.0 mm (nominal)</td>
                        <td className="py-3 px-3 text-amber-600">N/A</td>
                        <td className="py-3 px-3 text-red-600 font-bold">&lt; 9.5 mm</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-black text-slate-900">Jeu d'articulation centrale</td>
                        <td className="py-3 px-3">&lt; 0.5 mm</td>
                        <td className="py-3 px-3 text-amber-600">&gt; 1.5 mm</td>
                        <td className="py-3 px-3 text-red-600 font-bold">&gt; 2.0 mm (arrêt immédiat)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABLEAU DES COUPLES DE SERRAGE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  13. Tableau des Couples de Serrage & d'Assemblage
                </h3>
                <p className="text-[10px] text-slate-500 mb-4">
                  Le non-respect de ces couples peut entraîner la rupture d'axes sous forte vibration souterraine :
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Assemblage mécanique</th>
                        <th className="py-2.5 px-3">Filetage</th>
                        <th className="py-2.5 px-3">Couple (Nm)</th>
                        <th className="py-2.5 px-3">Freinage / Fixation</th>
                        <th className="py-2.5 px-3">Contrôle périodique</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {EPIROC_ST2D_COUPLES.map((cp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-black text-slate-900">{cp.assemblage}</td>
                          <td className="py-3 px-3 font-mono text-[10px] bg-slate-100 rounded text-center">{cp.filetage}</td>
                          <td className="py-3 px-3 font-black text-amber-600">{cp.couple}</td>
                          <td className="py-3 px-3 text-slate-500">{cp.freinage}</td>
                          <td className="py-3 px-3 text-slate-500">{cp.controle}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* OUTILLAGE SPÉCIFIQUE ST2D */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  16. Outillage Spécifique d'Atelier Mine (ST2D)
                </h3>
                <p className="text-[10px] text-slate-500 mb-3">
                  Outils obligatoires pour réaliser les diagnostics physiques précis sans détruire l'engin :
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-bold text-slate-700">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">🔧 Clé dynamométrique haute capacité (&gt;800 Nm)</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">📐 Testeur de pression hydraulique (0 à 25 MPa)</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">🔋 Testeur de charge accumulateur d'azote</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">⚙️ Extracteur de cannelures pour convertisseur Dana</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">🚗 Clé à fourche géante pour excentrique de chaîne</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">🔥 Outil de calage et de pigeage moteur Deutz</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">🔩 Testeur de compression moteur (adaptateur bougie)</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">💡 Multimètre numérique d'atelier d'extraction</div>
                </div>
              </div>

            </div>
          )}

          {/* --- ONGLET 7 : NIVEAUX CERTIFICATION & TESTS VALIDATION --- */}
          {activeTab === "certification" && (
            <div className="space-y-6">
              
              {/* TESTS DE VALIDATION FINALES D'INTERVENTION */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  14. Protocole de Tests & Validation d'Après-Panne
                </h3>
                <p className="text-[10px] text-slate-500 mb-4">
                  Avant de restituer la machine à l'exploitation, vous devez impérativement réaliser et cocher les tests physiques suivants :
                </p>

                <div className="space-y-2 text-xs">
                  {[
                    "Démarrage moteur et ralenti stable pendant 5 minutes sans fumée inhabituelle",
                    "Pression hydraulique de travail testée en charge maximale (doit atteindre 11.4 MPa)",
                    "Pression hydraulique de direction vérifiée à plein braquage à gauche et à droite (13.1 MPa)",
                    "Montée et maintien de la pression de l'accumulateur de frein HASR sans à-coups",
                    "Test d'efficacité du frein de service en descente avec godet chargé",
                    "Test de maintien statique du frein de parking sur rampe de 15% (le loader ne doit pas glisser)",
                    "Passage des 4 rapports de la boîte Powershift fluide sans patinage du convertisseur",
                    "Vérification d'absence de fuite d'huile externe sur l'axe d'articulation et les vérins",
                    "Contrôle de température des culasses à l'aide du manomètre de carter d'air",
                    "Signature de conformité d'intervention co-signée par le mécanicien et le chef"
                  ].map((test, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                      <span className="font-semibold text-slate-700 leading-relaxed">{test}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* NIVEAUX DE CERTIFICATION DES MÉCANICIENS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  20. Grille de Niveaux de Certification d'Atelier
                </h3>
                <p className="text-[10px] text-slate-500 mb-4">
                  Afin de garantir la sécurité vitale sous terre, respectez scrupuleusement la grille de compétences autorisées :
                </p>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="p-3.5 bg-slate-50 rounded-xl border-l-4 border-l-slate-400">
                    <span className="font-black text-[10px] uppercase tracking-wider text-slate-600 block mb-1">🎓 Niveau 1 — Apprenti (0 à 2 ans d'expérience)</span>
                    <p className="text-slate-700 leading-relaxed">
                      <strong>Autorisé :</strong> Quick Fixes, changement de filtres (moteur, air, carburant), graissage manuel centralisé, contrôles de niveaux d'huile standards, nettoyage des ailettes de refroidissement Deutz.
                    </p>
                    <p className="text-red-600 font-bold mt-1.5">🚫 Interdit de toucher aux accumulateurs sous pression, au circuit de freinage HASR, à la boîte Dana ou au moteur.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border-l-4 border-l-amber-500">
                    <span className="font-black text-[10px] uppercase tracking-wider text-amber-700 block mb-1">🎓 Niveau 2 — Confirmé (2 à 5 ans d'expérience)</span>
                    <p className="text-slate-700 leading-relaxed">
                      <strong>Autorisé :</strong> Remplacement de vérins hydrauliques complets, changement des disques et plaquettes HASR extérieures, entretien de l'articulation centrale, maintenance électrique standard (éclairage, solénoides).
                    </p>
                    <p className="text-red-600 font-bold mt-1.5">🚫 Interdit d'ouvrir la boîte Powershift Dana, de démonter le moteur à air ou de purger les accumulateurs de gaz d'azote.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border-l-4 border-l-emerald-500">
                    <span className="font-black text-[10px] uppercase tracking-wider text-emerald-700 block mb-1">🎓 Niveau 3 — Expert / Chef d'Atelier (Plus de 5 ans d'expérience)</span>
                    <p className="text-slate-700 leading-relaxed font-bold">
                      Autorisation totale. Révision complète du bloc moteur Deutz F6L, calage fin de la pompe d'injection, réfection interne de la boîte Powershift Dana R32000, recharge et manipulation des accumulateurs d'azote sous haute pression.
                    </p>
                    <p className="text-emerald-700 font-bold mt-1.5">🛡 Co-signature obligatoire de toutes les fiches d'intervention du personnel de niveau 1 et 2.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
