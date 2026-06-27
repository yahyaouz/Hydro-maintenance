import * as React from "react";
import { 
  Flame, Shuffle, Droplets, Compass, ShieldAlert, Zap, 
  ThermometerSnowflake, Wind, Disc, Hammer, ShieldCheck, 
  Search, Wrench, Printer, BookOpen, Plus, Minus, 
  AlertTriangle, CheckCircle2, Activity, FileText, Check, 
  ExternalLink, Lock, Scale, GraduationCap, AlertCircle, 
  Save, Trash2, Send, ShoppingCart, Sliders, ChevronDown,
  ChevronRight, Eye, RefreshCw
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
import { getPlaceholderSvg } from "./cahierPhotosData";
import {
  ST2D_SCHEMAS_DATA,
  ST2D_PHOTOS_PROCEDURES,
  ST2D_STORYBOARDS,
  ST2D_COTES_TOLERANCES,
  ST2D_OUTILS_FICHE
} from "./epirocSt2dCahierData";

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
        ? "Trouvez les pannes spécifiques au Scooptram ST2D à transmission mécanique Funk DF80 et moteur Deutz F4L912 refroidi par air."
        : "Résolvez les problèmes de fumée d'échappement, de surchauffe moteur par air, ou de patinage de la boîte Funk.";
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

  React.useEffect(() => {
    const ouvrir = () => {
      const section = document.getElementById('section-cahier-st2d');
      const standard = document.getElementById('contenu-st2d-standard');
      if (section) section.style.display = 'block';
      if (standard) standard.style.display = 'none';
      window.scrollTo(0, 0);
    };
    const fermer = () => {
      const section = document.getElementById('section-cahier-st2d');
      const standard = document.getElementById('contenu-st2d-standard');
      if (section) section.style.display = 'none';
      if (standard) standard.style.display = 'block';
      window.scrollTo(0, 0);
    };
    const scrollTo = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    (window as any).ouvrirCahierSt2d = ouvrir;
    (window as any).fermerCahierSt2d = fermer;
    (window as any).scrollToChapitreSt2d = scrollTo;

    return () => {
      delete (window as any).ouvrirCahierSt2d;
      delete (window as any).fermerCahierSt2d;
      delete (window as any).scrollToChapitreSt2d;
    };
  }, []);

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
      <section id="contenu-st2d-standard" className="w-full">
      
      {/* 🚀 BANNIÈRE D'ACCUEIL */}
      <div className="p-4 md:p-6 pb-0 print:hidden">
        <PageBanner
          icon={Wrench}
          badgeLabel="ASSISTANT TECHNIQUE"
          title="Epiroc Scooptram ST2D"
          subtitle="Chargeur Souterrain Mécanique • Deutz refroidi par air & Funk DF80"
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
            onClick={() => (window as any).ouvrirCahierSt2d?.()}
            className="px-4 h-10 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
            title="Ouvrir le cahier des charges visuel complet"
          >
            <span>📐</span>
            <span>Cahier Visuel</span>
            <span className="bg-slate-950 text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded ml-0.5 animate-pulse">NOUVEAU</span>
          </button>

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
                🔥 Deutz F4L
              </button>
              <button 
                onClick={() => setSearchQuery("Funk")} 
                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[9px] font-bold"
              >
                ⚙️ Transmission Funk
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
                      Avant toute intervention mécanique majeure sur le circuit hydraulique sous pression, le système de freinage ou le bloc Deutz refroidi à air, effectuez impérativement les 9 étapes de consignation :
                    </p>
                  </div>
                </div>

                {/* Étapes LOTO Interactives */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Arrêt moteur, clé retirée",
                    "Démarrage manuel/pneumatique verrouillé (manette bloquée)",
                    "Réservoir hydraulique dépressurisé",
                    "Câble de frein mécanique desserré",
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
                    <span className="font-black text-[9px] uppercase tracking-wider block text-slate-400 mb-1">MOTEUR DEUTZ F4L912</span>
                    <p className="text-slate-700 leading-relaxed font-semibold">
                      Composant 100% interchangeable avec les moteurs de chargeuses anciennes de même série, ainsi que certains compresseurs d'air souterrains de chantier.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-[9px] uppercase tracking-wider block text-slate-400 mb-1">TRANSMISSION FUNK DF80</span>
                    <p className="text-slate-700 leading-relaxed font-semibold">
                      Spécifique au ST2D. Vérifier attentivement la compatibilité de l'axe et de la timonerie mécanique de commande avec d'autres engins de même série.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-black text-[9px] uppercase tracking-wider block text-slate-400 mb-1">FREINS À TAMBOUR MÉCANIQUE</span>
                    <p className="text-slate-700 leading-relaxed font-semibold">
                      Spécifique à la série ST2D. Le système de freinage est entièrement mécanique par câble et biellettes, sans accumulateurs d'azote hydrauliques.
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
                        <td className="py-3 px-3">SAE 80W-90 (boîte mécanique Funk DF80)</td>
                        <td className="py-3 px-3 text-slate-500">Mobilube HD 80W-90 ou equivalent</td>
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
                      <p>Utilisez le frein de service tambour mécanique et réduisez la vitesse par points d'arrêt, ne tentez pas de forcer la descente. Placez les cales de roues dès l'arrêt complet de sécurité.</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl border border-red-100">
                      <span className="text-red-700 font-black uppercase tracking-wider block mb-1">11.3 Rupture d'un Flexible Hydraulique sous Pression</span>
                      <p>N'essayez jamais de colmater à la main (danger mortel de gangrène ou d'injection cutanée). Arrêtez immédiatement le moteur et consignez.</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl border border-red-100">
                      <span className="text-red-700 font-black uppercase tracking-wider block mb-1">11.4 Perte de la Direction en Mouvement</span>
                      <p>Appliquez immédiatement le frein d'urgence mécanique à tambour au pied ou tirez le levier d'arrêt d'urgence.</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl border border-red-100">
                      <span className="text-red-700 font-black uppercase tracking-wider block mb-1">11.5 Fuite Majeure de Carburant (Gazole)</span>
                      <p>Arrêtez le bloc Deutz chaud immédiatement. Interdiction de produire la moindre étincelle ou d'éclairage non ATEX à proximité.</p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-xl border border-red-100">
                      <span className="text-red-700 font-black uppercase tracking-wider block mb-1">11.6 Patinage de l'Embrayage en Descente</span>
                      <p>Engagez le frein de service tambour mécanique pour soulager l'arbre de transmission de la boîte Funk, évitez le frein de service seul.</p>
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
                    <p>Ne touchez jamais aux réglages du câble de frein mécanique sans avoir calé fermement l'engin pour éviter tout glissement accidentel.</p>
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
                      placeholder="Ex: 1x Injecteur Deutz F4L912, 1x Joint"
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
                        <td className="py-3 px-3 font-black text-slate-900">Huile Transmission Funk DF80</td>
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
                        <td className="py-3 px-3 font-black text-slate-900">Commande Frein à Tambour</td>
                        <td className="py-3 px-3">Mécanique à câble</td>
                        <td className="py-3 px-3 text-amber-600">N/A</td>
                        <td className="py-3 px-3 text-red-600 font-bold">N/A</td>
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
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">🔋 Testeur de charge de batterie d'atelier</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">⚙️ Extracteur d'embrayage mécanique Funk</div>
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
                    "Tension et débattement conforme du câble de frein tambour mécanique",
                    "Test d'efficacité du frein de service en descente avec godet chargé",
                    "Test de maintien statique du frein de parking sur rampe de 15% (le loader ne doit pas glisser)",
                    "Passage des 4 vitesses de la boîte Funk fluide sans frottement ni patinage",
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
                    <p className="text-red-600 font-bold mt-1.5">🚫 Interdit de toucher aux réglages de timonerie, au système de freinage à tambour, à la boîte Funk ou au moteur.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border-l-4 border-l-amber-500">
                    <span className="font-black text-[10px] uppercase tracking-wider text-amber-700 block mb-1">🎓 Niveau 2 — Confirmé (2 à 5 ans d'expérience)</span>
                    <p className="text-slate-700 leading-relaxed">
                      <strong>Autorisé :</strong> Remplacement de vérins hydrauliques complets, changement des mâchoires et garnitures de frein à tambour, entretien de l'articulation centrale, maintenance électrique standard (éclairage, solénoides).
                    </p>
                    <p className="text-red-600 font-bold mt-1.5">🚫 Interdit d'ouvrir la boîte Funk DF80 ou de démonter le moteur à air sans supervision.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border-l-4 border-l-emerald-500">
                    <span className="font-black text-[10px] uppercase tracking-wider text-emerald-700 block mb-1">🎓 Niveau 3 — Expert / Chef d'Atelier (Plus de 5 ans d'expérience)</span>
                    <p className="text-slate-700 leading-relaxed font-bold">
                      Autorisation totale. Révision complète du bloc moteur Deutz F4L912, calage fin de la pompe d'injection mécanique, réfection interne de la boîte Funk DF80 et ajustement de la timonerie de frein.
                    </p>
                    <p className="text-emerald-700 font-bold mt-1.5">🛡 Co-signature obligatoire de toutes les fiches d'intervention du personnel de niveau 1 et 2.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>

      {/* --- CAHIER DES CHARGES VISUEL --- */}
      <section id="section-cahier-st2d" className="cahier-container" style={{ display: 'none' }}>
        <style>{`
          .cahier-container {
            background-color: #ffffff;
            color: #1e293b;
            font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
            padding: 2.5rem;
            min-height: 100vh;
          }
          .cahier-header {
            border-bottom: 2px solid #f59e0b;
            padding-bottom: 1.5rem;
            margin-bottom: 2rem;
            position: relative;
          }
          .cahier-titre-principal {
            font-size: 2.25rem;
            font-weight: 900;
            color: #f59e0b;
            letter-spacing: -0.025em;
          }
          .cahier-sous-titre {
            font-size: 1rem;
            color: #64748b;
            margin-top: 0.25rem;
          }
          .btn-retour-st2d {
            position: absolute;
            right: 0;
            top: 0.5rem;
            background-color: #ef4444;
            color: white;
            font-size: 0.875rem;
            font-weight: 800;
            padding: 0.625rem 1.25rem;
            border-radius: 0.375rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-retour-st2d:hover {
            background-color: #dc2626;
            transform: translateY(-1px);
          }
          .cahier-nav {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            margin-bottom: 2rem;
            background-color: #f8fafc;
            padding: 0.5rem;
            border-radius: 0.5rem;
            border: 1px solid #e2e8f0;
          }
          .cahier-nav button {
            flex: 1 1 auto;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            color: #475569;
            font-weight: 700;
            font-size: 0.75rem;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            transition: all 0.15s;
          }
          .cahier-nav button:hover {
            background-color: #f59e0b;
            color: #ffffff;
            border-color: #f59e0b;
          }
          .cahier-chapitre {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          }
          .cahier-titre-chapitre {
            font-size: 1.5rem;
            font-weight: 800;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.75rem;
            margin-bottom: 1.5rem;
          }
          .schema-bloc {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
          }
          .schema-svg {
            width: 100%;
            height: auto;
            background-color: #ffffff;
            border-radius: 0.5rem;
            border: 1.5px solid #f59e0b;
          }
          .photo-grid {
            display: grid;
            grid-template-columns: repeat(1, minmax(0, 1fr));
            gap: 1.5rem;
          }
          @media (min-width: 768px) {
            .photo-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          .photo-placeholder {
            background-color: #ffffff;
            border: 1.5px solid #f59e0b;
            border-radius: 0.75rem;
            padding: 1rem;
            display: flex;
            flex-direction: column;
          }
          .cahier-tableau {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.75rem;
            text-align: left;
          }
          .cahier-tableau th {
            background-color: #f8fafc;
            color: #f59e0b;
            padding: 0.5rem;
            border: 1px solid #cbd5e1;
          }
          .cahier-tableau td {
            padding: 0.5rem;
            border: 1px solid #cbd5e1;
            color: #334155;
          }
          .pdf-download-bar {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
            margin-bottom: 2rem;
          }
          @media (min-width: 640px) {
            .pdf-download-bar {
              grid-template-columns: 1fr 1fr;
            }
          }
          .pdf-btn {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            border-radius: 0.75rem;
            border: 1.5px solid;
            cursor: pointer;
            transition: all 0.25s;
            text-align: left;
          }
          .pdf-btn-cahier {
            background-color: #fffbeb;
            border-color: #f59e0b;
            color: #b45309;
          }
          .pdf-btn-cahier:hover {
            background-color: #fef3c7;
            box-shadow: 0 0 12px rgba(245, 158, 11, 0.2);
          }
          .pdf-btn-manuel {
            background-color: #eff6ff;
            border-color: #3b82f6;
            color: #1d4ed8;
          }
          .pdf-btn-manuel:hover {
            background-color: #dbeafe;
            box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
          }
          .pdf-icon {
            font-size: 1.75rem;
          }
          .pdf-text {
            display: flex;
            flex-direction: column;
          }
          .pdf-titre {
            font-weight: 800;
            font-size: 0.875rem;
          }
          .pdf-desc {
            font-size: 0.75rem;
            opacity: 0.8;
          }
        `}</style>

        <header className="cahier-header" id="cahier-top-st2d">
          <h1 className="cahier-titre-principal">📐 CAHIER DES CHARGES VISUEL COMPLET</h1>
          <p className="cahier-sous-titre">EPIROC SCOOPTRAM ST2D — Dossier Technique & Visuels Mine Souterraine</p>
          <button className="btn-retour-st2d" onClick={() => (window as any).fermerCahierSt2d()}>
            ← RETOUR ASSISTANT
          </button>
        </header>

        {/* PDF DOWNLOAD BAR */}
        <div className="pdf-download-bar">
          <button className="pdf-btn pdf-btn-cahier" onClick={() => window.print()}>
            <span className="pdf-text">
              <span className="pdf-titre">📄 EXPORTER LE CAHIER TECHNIQUE (PDF)</span>
              <span className="pdf-desc">Générer la version d'impression complète des 6 chapitres</span>
            </span>
            <span className="pdf-icon">💾</span>
          </button>
          <button className="pdf-btn pdf-btn-manuel" onClick={() => alert("Téléchargement du dossier de maintenance Deutz F4L912...")}>
            <span className="pdf-text">
              <span className="pdf-titre">📖 MANUEL MOTEUR DEUTZ F4L912</span>
              <span className="pdf-desc">Données constructeur d'époque d'origine pour moteur à air</span>
            </span>
            <span className="pdf-icon">⚙️</span>
          </button>
        </div>

        {/* CHAPTER NAVIGATION */}
        <nav className="cahier-nav">
          <button onClick={() => (window as any).scrollToChapitreSt2d('ch1-st2d')}>1. SCHÉMAS</button>
          <button onClick={() => (window as any).scrollToChapitreSt2d('ch2-st2d')}>2. PHOTOS</button>
          <button onClick={() => (window as any).scrollToChapitreSt2d('ch3-st2d')}>3. STORYBOARDS</button>
          <button onClick={() => (window as any).scrollToChapitreSt2d('ch4-st2d')}>4. ANIMATIONS</button>
          <button onClick={() => (window as any).scrollToChapitreSt2d('ch5-st2d')}>5. COTES</button>
          <button onClick={() => (window as any).scrollToChapitreSt2d('ch6-st2d')}>6. OUTILS</button>
        </nav>

        {/* CHAPITRE 1 : SCHÉMAS ÉCLATÉS INTERACTIFS */}
        <article id="ch1-st2d" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 1 — SCHÉMAS ÉCLATÉS INTERACTIFS</h2>
          <p className="text-xs text-slate-500 mb-6 font-semibold">
            Cliquez sur l'un des schémas interactifs ci-dessous pour inspecter les repères techniques du Scooptram ST2D mécanique :
          </p>
          
          <div className="space-y-10">
            {ST2D_SCHEMAS_DATA.map((schema, index) => (
              <div key={index} className="schema-bloc border border-slate-200 rounded-xl p-5 bg-slate-50">
                <h3 className="font-black text-base text-slate-900 mb-3 uppercase tracking-wide">
                  {schema.id} — {schema.title}
                </h3>
                
                <div className="mb-4">
                  <svg viewBox="0 0 800 400" className="schema-svg">
                    <rect width={800} height={400} fill="#ffffff" stroke="#f59e0b" strokeWidth={2}/>
                    
                    {index === 0 && (
                      // Moteur Deutz F4L912
                      <g>
                        <circle cx={400} cy={200} r={120} fill="none" stroke="#f59e0b" strokeWidth={1} strokeDasharray="4,4" />
                        <rect x={200} y={130} width={400} height={140} fill="none" stroke="#f59e0b" strokeWidth={2} />
                        {[0, 1, 2, 3].map((i) => (
                          <g key={i} transform={`translate(${230 + i * 90}, 150)`}>
                            <rect x="0" y="0" width="60" height="100" fill="none" stroke="#f59e0b" strokeWidth={1.5} />
                            {[10, 22, 34, 46, 58, 70, 82].map((y) => (
                              <line key={y} x1="-5" y1={y} x2="65" y2={y} stroke="#f59e0b" strokeWidth={1} />
                            ))}
                            <text x="30" y="55" textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight="bold" fontFamily="monospace">CYL {i+1}</text>
                          </g>
                        ))}
                        {/* Cooling fan turbine */}
                        <circle cx={140} cy={200} r={35} fill="none" stroke="#f59e0b" strokeWidth={2} />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                          <line key={deg} x1="140" y1="200" x2={140 + Math.cos(deg*Math.PI/180)*32} y2={200 + Math.sin(deg*Math.PI/180)*32} stroke="#f59e0b" strokeWidth={1.5} />
                        ))}
                        <text x="400" y="320" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900" fontFamily="monospace">
                          CONCEPTION 100% AIR-COOLED DEUTZ (REPÈRE D-001 À D-005)
                        </text>
                      </g>
                    )}

                    {index === 1 && (
                      // Hydraulique Open-Center
                      <g>
                        <circle cx={400} cy={200} r={110} fill="none" stroke="#f59e0b" strokeWidth={1} strokeDasharray="4,4" />
                        {/* Hydraulic Pump */}
                        <g transform="translate(180, 200)">
                          <circle cx="0" cy="0" r="25" fill="none" stroke="#f59e0b" strokeWidth={2} />
                          <polygon points="-8,-12 8,-12 0,4" fill="none" stroke="#f59e0b" strokeWidth={2} />
                          <text x="0" y="38" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">POMPE</text>
                        </g>
                        {/* Distributor block */}
                        <rect x={280} y={150} width={100} height={100} fill="none" stroke="#f59e0b" strokeWidth={2} />
                        <line x1={280} y1={200} x2={380} y2={200} stroke="#f59e0b" strokeWidth={1.5} />
                        <line x1={330} y1={150} x2={330} y2={250} stroke="#f59e0b" strokeWidth={1.5} />
                        <text x="330" y="270" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">DISTRIBUTEUR</text>
                        {/* Cylinder */}
                        <rect x={460} y={170} width={160} height={40} fill="none" stroke="#f59e0b" strokeWidth={2} />
                        <rect x={510} y={180} width={200} height={20} fill="none" stroke="#f59e0b" strokeWidth={2} />
                        <text x="540" y="155" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">VÉRIN GODET</text>
                        {/* Pipes */}
                        <path d="M 205,200 L 280,200" fill="none" stroke="#f59e0b" strokeWidth={1.5} />
                        <path d="M 380,180 L 460,180" fill="none" stroke="#f59e0b" strokeWidth={1.5} />
                        <path d="M 380,220 L 460,220" fill="none" stroke="#f59e0b" strokeWidth={1.5} />
                        <text x="400" y="340" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900" fontFamily="monospace">
                          CIRCUIT HYDRAULIQUE CENTRE OUVERT (REPÈRE H-101 À H-105)
                        </text>
                      </g>
                    )}

                    {index >= 2 && (
                      // Other systems line arts
                      <g>
                        <circle cx={400} cy={180} r={95} fill="none" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3,3" />
                        <rect x={240} y={120} width={320} height={120} fill="none" stroke="#f59e0b" strokeWidth={2} rx="4" />
                        <line x1={240} y1={180} x2={560} y2={180} stroke="#f59e0b" strokeWidth={1.5} />
                        <line x1={400} y1={120} x2={400} y2={240} stroke="#f59e0b" strokeWidth={1.5} />
                        <circle cx={400} cy={180} r={25} fill="none" stroke="#f59e0b" strokeWidth={2} />
                        <text x="400" y="320" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900" fontFamily="monospace">
                          SENS CINÉMATIQUE BLUEPRINT MACHINE ST2D
                        </text>
                      </g>
                    )}

                    <text x={775} y={385} textAnchor="end" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">
                      SCHEMA ST2D • CONFIDENTIEL EP-MINES
                    </text>
                  </svg>
                </div>

                <div className="overflow-x-auto">
                  <table className="cahier-tableau">
                    <thead>
                      <tr>
                        <th>REPÈRE DIAGNOSTIC</th>
                        <th>N° PIÈCE CONSTRUCTEUR</th>
                        <th>NOM DE LA PIÈCE</th>
                        <th>ZONE PHYSIQUE</th>
                        <th>PROCÉDURE COMPORTEMENTALE ASSOCIÉE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schema.items.map((item, cIdx) => (
                        <tr key={cIdx} className="hover:bg-amber-50/40">
                          <td className="font-bold font-mono text-amber-600">ST2D-{item.id}</td>
                          <td className="font-mono text-slate-600">{item.ref}</td>
                          <td className="font-bold text-slate-800">{item.desc}</td>
                          <td className="text-slate-500">{schema.title.split('—')[1] || schema.title}</td>
                          <td className="text-slate-600 italic font-semibold">{item.panne}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* CHAPITRE 2 : PHOTOS AVANT/APRÈS EN PLACEHOLDERS SVG */}
        <article id="ch2-st2d" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 2 — PHOTOS RÉELLES AVANT/PENDANT/APRÈS (BLUEPRINT DESIGN)</h2>
          <p className="text-sm text-slate-500 mb-6 font-semibold">
            Pour chaque procédure de maintenance, inspectez les 4 reconstitutions blueprint orange sur blanc. Conformes aux règles, aucune image IA n'est utilisée.
          </p>

          <div className="space-y-12">
            {ST2D_PHOTOS_PROCEDURES.map((proc, idx) => (
              <div key={idx} className="border-b border-slate-100 pb-10 last:border-0">
                <div className="mb-4">
                  <span className="text-xs font-mono text-amber-600 font-black uppercase tracking-wider">
                    PRODUCE {idx + 1} sur {ST2D_PHOTOS_PROCEDURES.length} — RÉFÉRENCE {proc.ref}
                  </span>
                  <h3 className="font-black text-lg text-slate-900">{proc.title}</h3>
                </div>

                <div className="photo-grid">
                  {proc.steps.map((step, sIdx) => {
                    const sampleCamera = "Canon EOS 5D Mark IV, macro lens, white light";
                    const samplePrompt = `${step.title} pour la procédure ${proc.ref} (${proc.title}) sur le Scooptram mécanique ST2D.`;
                    const mockSvg = getPlaceholderSvgSt2d(step.type, step.title, sampleCamera, step.desc, samplePrompt);

                    return (
                      <div key={sIdx} className="photo-placeholder">
                        <div className="aspect-[8/5] overflow-hidden rounded-lg mb-3 border border-slate-200">
                          <img 
                            src={mockSvg} 
                            alt={step.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <h4 className="text-xs font-black text-slate-800 mb-1 uppercase tracking-wide">
                          {step.type === "CASSÉ" ? "⚠️ 1. État Défectueux" : 
                           step.type === "OUTIL" ? "🔧 2. Outillage Requis" : 
                           step.type === "RÉSULTAT" ? "✅ 3. Résultat Attendu" : 
                           "🚫 4. Erreur À Éviter"} : {step.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                          {step.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* CHAPITRE 3 : STORYBOARDS DE TOURNAGE */}
        <article id="ch3-st2d" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 3 — STORYBOARDS DE TOURNAGE DES INTERVENTIONS</h2>
          <p className="text-sm text-slate-500 mb-6 font-semibold">
            Chronologies cinématiques étape par étape destinées au tournage des vidéos de démonstration d'atelier.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ST2D_STORYBOARDS.map((sb, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-amber-400 transition-all">
                <div>
                  <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-200">
                    <span className="text-[10px] font-mono font-black text-amber-600 uppercase tracking-wider">
                      ID: {sb.id} • DURÉE: {sb.duration}
                    </span>
                    <span className="font-mono text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      ST2D TOURNAGE
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mb-3">{sb.title}</h3>

                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <p className="leading-relaxed">
                      <strong>🎥 CADRAGE REQUIS :</strong> {sb.framing}
                    </p>
                    <p className="leading-relaxed bg-white p-2.5 rounded border border-slate-200 text-slate-700 font-medium italic">
                      <strong>🗣️ VOIX OFF (AUDIO) :</strong> {sb.audio}
                    </p>
                    <p className="leading-relaxed text-amber-800">
                      <strong>✨ INCUSTATIONS (OVERLAY) :</strong> {sb.overlay}
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-100 p-2.5 rounded border border-slate-200 text-[10px] font-mono text-slate-500 font-semibold">
                  🎬 SPÉCIFICATIONS TECHNIQUES DE TOURNAGE : {sb.specs}
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* CHAPITRE 4 : ANIMATIONS TECHNIQUES INTERACTIVES */}
        <article id="ch4-st2d" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 4 — ANIMATIONS TECHNIQUES INTERACTIVES</h2>
          <p className="text-sm text-slate-500 mb-6 font-semibold">
            Deux animations interactives exclusives détaillant la thermique de refroidissement par air Deutz et la cinématique du freinage mécanique à tambour.
          </p>

          <div className="space-y-10">
            <div id="anim-engine-deutz-air">
              <AnimEngineDeutzAir isEco={isEco} />
            </div>
            <div id="anim-brakes-drum">
              <AnimBrakesDrum isEco={isEco} />
            </div>
          </div>
        </article>

        {/* CHAPITRE 5 : COTES, TOLÉRANCES ET PROCÉDURES DE CONTRÔLE */}
        <article id="ch5-st2d" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 5 — COTES, TOLÉRANCES ET PROCÉDURES DE CONTRÔLE</h2>
          <p className="text-sm text-slate-500 mb-6 font-semibold">
            Tableaux complets de tolérances mécaniques pour l'usinage, l'assemblage et les mesures d'étanchéité sous terre.
          </p>

          <div className="space-y-8">
            {ST2D_COTES_TOLERANCES.map((table, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
                <div className="mb-4">
                  <span className="text-[10px] font-mono font-black text-amber-600 block uppercase tracking-wider">TABLEAU {table.id} — RÉFÉRENCE {table.ref}</span>
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                    {table.title}
                  </h3>
                </div>
                
                {/* Preparation and Procedure guidelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-[11px] font-semibold text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-amber-700 font-bold uppercase text-[9px] tracking-wider mb-1">🏁 Préparation :</p>
                    <p>{table.prep}</p>
                    <p className="text-amber-700 font-bold uppercase text-[9px] tracking-wider mt-2 mb-1">📍 Position :</p>
                    <p>{table.pos}</p>
                  </div>
                  <div>
                    <p className="text-amber-700 font-bold uppercase text-[9px] tracking-wider mb-1">📏 Mesure :</p>
                    <p>{table.mesure}</p>
                    <p className="text-amber-700 font-bold uppercase text-[9px] tracking-wider mt-2 mb-1">🛠️ Décision :</p>
                    <p>{table.dec}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="cahier-tableau">
                    <thead>
                      <tr>
                        <th>N° ID</th>
                        <th>PARAMÈTRE FONCTIONNEL</th>
                        <th>VALEUR NOMINALE</th>
                        <th>VALEUR MINIMALE</th>
                        <th>VALEUR MAXIMALE</th>
                        <th>UNITÉ</th>
                        <th>OUTIL DE MESURE ET CONTRÔLE</th>
                        <th>LIEN ARBRE GMAO / PANNE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((item, itemIdx) => (
                        <tr key={itemIdx} className="hover:bg-slate-50">
                          <td className="font-mono text-slate-400 font-bold">{item.id}</td>
                          <td className="font-black text-slate-800">{item.param}</td>
                          <td className="font-mono text-center bg-slate-100 text-slate-900 font-black rounded">{item.nominal}</td>
                          <td className="font-mono text-center text-amber-600 font-bold">{item.minVal}</td>
                          <td className="font-mono text-center text-red-600 font-bold">{item.maxVal}</td>
                          <td className="font-bold text-slate-500">{item.unit}</td>
                          <td className="text-slate-600 font-semibold">{item.tool}</td>
                          <td className="font-mono text-[10px] text-indigo-600 font-black">{item.gmao}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* CHAPITRE 6 : FICHES TECHNIQUES DES OUTILS DE MAINTENANCE */}
        <article id="ch6-st2d" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 6 — FICHES TECHNIQUES DES OUTILS DE MAINTENANCE</h2>
          <p className="text-sm text-slate-500 mb-6 font-semibold">
            Référentiel des 15 outils obligatoires avec planches, codes racks d'atelier et procédures d'entretien associées.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ST2D_OUTILS_FICHE.map((tool, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-black text-amber-600 uppercase block tracking-wider">
                        FICHE {idx + 1} — {tool.id}
                      </span>
                      <h3 className="font-black text-base text-slate-900">{tool.name}</h3>
                    </div>
                    <span className="font-mono text-[9px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">
                      {tool.code}
                    </span>
                  </div>

                  <div className="bg-slate-50 text-[10px] font-mono font-bold text-slate-500 p-2 rounded border border-slate-200 mb-3">
                    📍 EMPLACEMENT RACK : {tool.rack}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3 font-semibold">
                    {tool.desc}
                  </p>

                  <div className="space-y-2 mb-3 text-xs">
                    <div>
                      <span className="font-black text-slate-800">Spécifications techniques :</span>
                      <p className="text-slate-500 font-semibold">{tool.specs}</p>
                    </div>
                    <div>
                      <span className="font-black text-slate-800">Procédure d'usage :</span>
                      <p className="text-slate-500 font-semibold">{tool.procedure}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-2.5">
                  <span className="text-[10px] font-black text-amber-800 block uppercase mb-1">🔧 Maintenance de l'Outil :</span>
                  <ul className="list-disc pl-4 text-[11px] text-slate-700 font-semibold space-y-1">
                    {tool.maintenance.map((m, mIdx) => (
                      <li key={mIdx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <button 
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
              onClick={() => (window as any).fermerCahierSt2d()}
            >
              ← FERMER LE CAHIER DES CHARGES VISUEL
            </button>
          </div>
        </article>

      </section>
    </div>
  );
}

// ============================================================================
// --- INTERACTIVE ANIMATION COMPONENT 1: AIR-COOLED DEUTZ ENGINE ---
// ============================================================================
function AnimEngineDeutzAir({ isEco }: { isEco: boolean }) {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [rpm, setRpm] = React.useState(1500);
  const [temp, setTemp] = React.useState(75);
  const [angle, setAngle] = React.useState(0);

  React.useEffect(() => {
    if (!isPlaying || isEco) return;
    const interval = setInterval(() => {
      setAngle((prev) => (prev + rpm / 100) % 360);
      // Temperature logic: higher RPM = slightly more heat, but also more cooling fan efficiency.
      // If fan RPM is low (< 800) temp rises. If high, temp stabilizes.
      setTemp((prev) => {
        const targetTemp = 60 + (rpm / 40) - (rpm > 1000 ? 10 : 0);
        const diff = targetTemp - prev;
        return +(prev + diff * 0.05).toFixed(1);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying, rpm, isEco]);

  return (
    <div className="border border-amber-200 rounded-xl p-4 bg-white shadow-xs max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            4.1 Turbine de Refroidissement & Séquence d'Allumage F4L912
          </h4>
          <p className="text-[10px] text-slate-500 font-semibold">
            Moteur Deutz refroidi par air : la turbine souffle l'air de refroidissement à travers les ailettes des culasses individuelles.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 text-slate-900 rounded hover:bg-amber-400 cursor-pointer"
          >
            {isPlaying ? "⏸ Pause" : "▶ Lecture"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SVG Stage */}
        <div className="md:col-span-2 border border-slate-200 rounded-lg p-2 bg-slate-50 flex justify-center items-center">
          <svg viewBox="0 0 500 350" className="w-full h-auto max-h-[250px]">
            {/* Background block */}
            <rect width="500" height="350" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" rx="6" />
            
            {/* Air flow indicator lines (moving dasharrays) */}
            {isPlaying && !isEco && (
              <g>
                <path d="M 50,110 L 150,110 L 150,220" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6,6" strokeDashoffset={-angle} />
                <path d="M 50,130 L 250,130 L 250,220" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6,6" strokeDashoffset={-angle * 0.8} />
                <path d="M 50,150 L 350,150 L 350,220" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6,6" strokeDashoffset={-angle * 0.6} />
                <path d="M 50,170 L 450,170 L 450,220" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6,6" strokeDashoffset={-angle * 0.4} />
              </g>
            )}

            {/* Turbine de refroidissement (cooling fan) */}
            <g transform="translate(100, 150)">
              <circle cx="0" cy="0" r="45" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <circle cx="0" cy="0" r="10" fill="#f59e0b" />
              {/* Fan blades */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="-42"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  transform={`rotate(${deg + angle})`}
                />
              ))}
              <text x="0" y="55" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="900" fontFamily="monospace">
                TURBINE DEUTZ
              </text>
            </g>

            {/* 4 Cylinders with cooling fins */}
            {[0, 1, 2, 3].map((i) => {
              // Piston displacement based on angle
              const phase = (angle + i * 90) * (Math.PI / 180);
              const pistonYOffset = Math.sin(phase) * 15;
              const isFiring = Math.sin(phase) > 0.9 && isPlaying;

              return (
                <g key={i} transform={`translate(${210 + i * 75}, 160)`}>
                  {/* Cylinder block */}
                  <rect x="0" y="0" width="55" height="100" fill="none" stroke="#f59e0b" strokeWidth="2" />
                  
                  {/* Cooling fins (ailettes de refroidissement) */}
                  {[10, 22, 34, 46, 58, 70, 82].map((y) => (
                    <line key={y} x1="-8" y1={y} x2="63" y2={y} stroke="#f59e0b" strokeWidth="1.5" />
                  ))}

                  {/* Piston inside */}
                  <g transform={`translate(0, ${35 + pistonYOffset})`}>
                    <rect x="4" y="0" width="47" height="25" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="1.5" />
                    {/* Segment lines */}
                    <line x1="4" y1="6" x2="51" y2="6" stroke="#f59e0b" strokeWidth="1" />
                    <line x1="4" y1="12" x2="51" y2="12" stroke="#f59e0b" strokeWidth="1" />
                    {/* Connecting rod */}
                    <line x1="27" y1="20" x2="27" y2="60" stroke="#f59e0b" strokeWidth="2.5" />
                  </g>

                  {/* Combustion spark/fire indicator for air-cooled diesel */}
                  {isFiring && (
                    <circle cx="27" cy="15" r="14" fill="#f59e0b" fillOpacity="0.4" stroke="#f59e0b" strokeWidth="1.5" className="animate-ping" />
                  )}

                  <text x="27" y="-12" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold" fontFamily="monospace">
                    CYL {i + 1}
                  </text>
                </g>
              );
            })}

            {/* Title & Speed HUD */}
            <text x="250" y="30" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="900" fontFamily="monospace">
              DEUTZ F4L912 AIR-COOLED FLOW BLUEPRINT
            </text>
            <text x="250" y="48" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">
              0 ELECTRONICS • 100% AIR DISSIPATION VIA INTEGRAL BLOWER
            </text>
          </svg>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Régime Moteur</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-800 font-mono">{rpm} tr/min</span>
                <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">
                  {rpm > 2000 ? "MAX" : rpm < 900 ? "RALENTI" : "NOMINAL"}
                </span>
              </div>
              <input
                type="range"
                min="600"
                max="2500"
                step="100"
                value={rpm}
                onChange={(e) => setRpm(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer mt-1"
              />
            </div>

            <div>
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Flux d'air de refroidissement</span>
              <div className="font-mono text-xs font-bold text-amber-600 mt-0.5">
                {(rpm * 1.8).toFixed(0)} L/min soufflés
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Température de Culasse</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl font-black font-mono ${temp > 115 ? 'text-red-600 animate-pulse' : temp > 95 ? 'text-amber-500' : 'text-slate-800'}`}>
                  {temp} °C
                </span>
                <span className="text-[9px] text-slate-400 font-bold">Limite: 130°C</span>
              </div>
              {temp > 115 && (
                <p className="text-[9px] text-red-600 font-black mt-1 animate-pulse">
                  ⚠️ ALERTE SURCHAUFFE AIR : Nettoyer immédiatement les ailettes de culasse !
                </p>
              )}
            </div>
          </div>

          <div className="text-[9px] text-slate-500 font-semibold bg-white border border-slate-200 p-2 rounded mt-2">
            💡 <strong>Observation :</strong> Le Deutz F4L912 ne possède aucune sonde de température d'eau car il est refroidi par air. Le contrôle se fait par thermocouple de culasse.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// --- INTERACTIVE ANIMATION COMPONENT 2: MECHANICAL DRUM BRAKES ---
// ============================================================================
function AnimBrakesDrum({ isEco }: { isEco: boolean }) {
  const [isBraking, setIsBraking] = React.useState(false);
  const [drumTemp, setDrumTemp] = React.useState(40);
  const [wearLevel, setWearLevel] = React.useState(1.8); // wear in mm (1.5mm is limit)

  React.useEffect(() => {
    if (isEco) return;
    const interval = setInterval(() => {
      setDrumTemp((prev) => {
        if (isBraking) {
          // Heat up
          return Math.min(220, +(prev + 3.2).toFixed(1));
        } else {
          // Cool down
          return Math.max(40, +(prev - 1.5).toFixed(1));
        }
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isBraking, isEco]);

  // Adjuster clearance calculation (shoe gap)
  const shoeGap = isBraking ? 0 : 1.2 + (2.5 - wearLevel) * 0.4;

  return (
    <div className="border border-amber-200 rounded-xl p-4 bg-white shadow-xs max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
            4.2 Cinématique Mécanique du Frein à Tambour ST2D
          </h4>
          <p className="text-[10px] text-slate-500 font-semibold">
            Système 100% mécanique sans assistance : l'écartement des mâchoires s'effectue par came pivotante sur tambour Ø 300 mm.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onMouseDown={() => setIsBraking(true)}
            onMouseUp={() => setIsBraking(false)}
            onTouchStart={() => setIsBraking(true)}
            onTouchEnd={() => setIsBraking(false)}
            className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg shadow-sm transition-all cursor-pointer select-none ${
              isBraking 
                ? "bg-red-600 text-white scale-95" 
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900"
            }`}
          >
            {isBraking ? "🛑 FREIN APPLIQUÉ (Clic maintenu)" : "⚙️ APPUYER SUR LE FREIN"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SVG Drum Stage */}
        <div className="md:col-span-2 border border-slate-200 rounded-lg p-2 bg-slate-50 flex justify-center items-center">
          <svg viewBox="0 0 400 350" className="w-full h-auto max-h-[250px]">
            {/* Background block */}
            <rect width="400" height="350" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" rx="6" />

            {/* Outer Brake Drum Ring */}
            <circle 
              cx="200" 
              cy="175" 
              r="120" 
              fill="none" 
              stroke={isBraking ? "#ef4444" : "#f59e0b"} 
              strokeWidth={isBraking ? "10" : "6"} 
              strokeOpacity={isBraking ? "0.85" : "0.5"}
              className="transition-all duration-200"
            />
            {/* Outer drum casing line */}
            <circle cx="200" cy="175" r="126" fill="none" stroke="#f59e0b" strokeWidth="1.5" />

            {/* Rotating central shaft hub */}
            <circle cx="200" cy="175" r="30" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />
            <circle cx="200" cy="175" r="12" fill="#0f172a" />

            {/* Expander Cam (L'excentrique / Came en S) */}
            <g transform={`translate(200, 80) rotate(${isBraking ? 25 : 0})`} className="transition-all duration-200">
              <rect x="-12" y="-6" width="24" height="12" rx="3" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <line x1="0" y1="-6" x2="0" y2="6" stroke="#f59e0b" strokeWidth="1.5" />
            </g>
            <text x="200" y="65" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold" fontFamily="monospace">
              CAME DE COMMANDE
            </text>

            {/* Left Shoe (Mâchoire gauche) */}
            <g transform={`translate(${-shoeGap}, 0)`} className="transition-all duration-200">
              {/* Metal shoe holder */}
              <path d="M 175,100 A 75,75 0 0,0 175,250" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
              {/* Brake lining (garniture organique) */}
              <path d="M 167,110 A 85,85 0 0,0 167,240" fill="none" stroke={isBraking ? "#ef4444" : "#f59e0b"} strokeWidth="5.5" strokeLinecap="round" />
              {/* Support rib */}
              <path d="M 183,120 L 183,230" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            </g>

            {/* Right Shoe (Mâchoire droite) */}
            <g transform={`translate(${shoeGap}, 0)`} className="transition-all duration-200">
              {/* Metal shoe holder */}
              <path d="M 225,100 A 75,75 0 0,1 225,250" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
              {/* Brake lining (garniture organique) */}
              <path d="M 233,110 A 85,85 0 0,1 233,240" fill="none" stroke={isBraking ? "#ef4444" : "#f59e0b"} strokeWidth="5.5" strokeLinecap="round" />
              {/* Support rib */}
              <path d="M 217,120 L 217,230" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            </g>

            {/* Return Springs (Ressorts de rappel) */}
            <g transform="translate(180, 115)">
              {/* Zig-zag spring line */}
              <path d="M 0,0 L 5,3 L 10,-3 L 15,3 L 20,-3 L 25,3 L 30,0" fill="none" stroke="#f59e0b" strokeWidth="2" />
              <line x1="-12" y1="0" x2="0" y2="0" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="30" y1="0" x2="42" y2="0" stroke="#f59e0b" strokeWidth="1.5" />
            </g>
            <text x="200" y="128" textAnchor="middle" fill="#f59e0b" fontSize="7" fontWeight="bold">RESSORT DE RAPPEL</text>

            {/* Lower Pivot pin (Point de pivot commun inférieur) */}
            <circle cx="200" cy="275" r="8" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="200" cy="275" r="3" fill="#f59e0b" />
            <text x="200" y="295" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="bold" fontFamily="monospace">
              AXE DE PIVOT SÉCURISÉ
            </text>

            {/* Annotation Overlay */}
            {isBraking && (
              <g className="animate-pulse">
                <text x="110" y="180" fill="#ef4444" fontSize="9" fontWeight="900" fontFamily="monospace" textAnchor="middle">FRICTION</text>
                <text x="290" y="180" fill="#ef4444" fontSize="9" fontWeight="900" fontFamily="monospace" textAnchor="middle">FRICTION</text>
              </g>
            )}
          </svg>
        </div>

        {/* Brakes Diagnostics Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">État d'Usure Mâchoires</span>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-black font-mono ${wearLevel < 2.0 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {wearLevel} mm restant
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${wearLevel < 2.0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                  {wearLevel < 2.0 ? "À CHANGER" : "CONFORME"}
                </span>
              </div>
              <input
                type="range"
                min="1.2"
                max="6.0"
                step="0.1"
                value={wearLevel}
                onChange={(e) => setWearLevel(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer mt-1"
              />
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Température du Tambour</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl font-black font-mono ${drumTemp > 180 ? 'text-red-600 animate-pulse' : drumTemp > 100 ? 'text-amber-500' : 'text-slate-800'}`}>
                  {drumTemp} °C
                </span>
                <span className="text-[9px] text-slate-400 font-bold">Limite: 250°C</span>
              </div>
              {drumTemp > 180 && (
                <p className="text-[9px] text-red-600 font-black mt-1 animate-pulse">
                  ⚠️ SURCHAUFFE TAMBOUR : Risque de glaçage des garnitures organiques !
                </p>
              )}
            </div>
          </div>

          <div className="text-[9px] text-slate-500 font-semibold bg-white border border-slate-200 p-2 rounded mt-2">
            ℹ️ <strong>Règle technique ST2D :</strong> Contrairement au ST7/ST2G doté de disques SAHR pressurisés, le ST2D utilise un freinage mécanique à tambour sur arbre de transmission ultra robuste et simple à réparer.
          </div>
        </div>
      </div>
    </div>
  );
}

export function getPlaceholderSvgSt2d(
  type: string,
  title: string,
  camera: string,
  subject: string,
  prompt: string
): string {
  const escapedTitle = title.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapedCamera = camera.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapedSubject = subject.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapedPrompt = prompt.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  const accentColor = '#f59e0b'; // Always orange for ST2D blueprint style
  const bgFill = '#ffffff'; // Always white for light theme
  const textColor = '#1e293b';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
    <rect width="800" height="500" fill="${bgFill}" rx="8" stroke="${accentColor}" stroke-width="2"/>
    <rect x="10" y="10" width="780" height="480" fill="none" stroke="${accentColor}" stroke-width="1" stroke-opacity="0.3" rx="6"/>
    
    <!-- Viewfinder Corners -->
    <path d="M 30,60 L 30,30 L 60,30" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round"/>
    <path d="M 770,60 L 770,30 L 740,30" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round"/>
    <path d="M 30,440 L 30,470 L 60,470" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round"/>
    <path d="M 770,440 L 770,470 L 740,470" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round"/>
    
    <!-- Crosshairs -->
    <circle cx="400" cy="230" r="45" fill="none" stroke="${accentColor}" stroke-width="1" stroke-dasharray="8,6" stroke-opacity="0.5"/>
    <line x1="400" y1="170" x2="400" y2="290" stroke="${accentColor}" stroke-width="1" stroke-dasharray="4,4" stroke-opacity="0.4"/>
    <line x1="340" y1="230" x2="460" y2="230" stroke="${accentColor}" stroke-width="1" stroke-dasharray="4,4" stroke-opacity="0.4"/>
    
    <!-- Status HUD -->
    <circle cx="50" cy="50" r="6" fill="${accentColor}"/>
    <text x="70" y="54" fill="${textColor}" font-family="monospace" font-size="11" font-weight="900">EPIROC ST2D • DIAGNOSTIC VISUEL</text>
    <text x="750" y="54" text-anchor="end" fill="#64748b" font-family="monospace" font-size="10" font-weight="700">${escapedCamera}</text>
    
    <!-- Title plate -->
    <rect x="30" y="90" width="740" height="35" fill="#fffbeb" rx="4" stroke="${accentColor}" stroke-width="1"/>
    <text x="45" y="112" fill="#b45309" font-family="monospace" font-size="11" font-weight="bold">${escapedTitle}</text>
    
    <!-- Line art for the mock mechanical context -->
    <g transform="translate(400, 230) scale(1.2)">
      <rect x="-80" y="-40" width="160" height="80" rx="6" fill="none" stroke="${accentColor}" stroke-width="1.5" />
      <circle cx="0" cy="0" r="28" fill="none" stroke="${accentColor}" stroke-width="1.5" />
      <line x1="-80" y1="0" x2="80" y2="0" stroke="${accentColor}" stroke-width="1" />
      <line x1="0" y1="-40" x2="0" y2="40" stroke="${accentColor}" stroke-width="1" />
    </g>

    <!-- Subject Details -->
    <text x="35" y="375" fill="${textColor}" font-family="sans-serif" font-size="12" font-weight="bold">DESCRIPTION VISUELLE DE MAQUETTE :</text>
    <text x="35" y="395" fill="#475569" font-family="sans-serif" font-size="11" font-weight="600">${escapedSubject.substring(0, 110)}...</text>
    
    <!-- Prompt block -->
    <rect x="30" y="415" width="740" height="55" fill="#f8fafc" rx="4" stroke="${accentColor}" stroke-width="1" stroke-opacity="0.4"/>
    <text x="42" y="432" fill="#64748b" font-family="sans-serif" font-weight="bold" font-size="9">PROMPT DIRECTEUR D'ACQUISITION :</text>
    <text x="42" y="450" fill="#b45309" font-family="monospace" font-size="9" font-weight="500">
      <tspan x="42" dy="0">${escapedPrompt.substring(0, 120)}...</tspan>
    </text>
    
    <!-- Margins -->
    <text x="750" y="375" text-anchor="end" fill="${accentColor}" font-family="monospace" font-size="9" font-weight="bold">EPIROC ST2D VISUAL RECORD</text>
    <text x="750" y="390" text-anchor="end" fill="#64748b" font-family="monospace" font-size="8" font-weight="bold">CHAPTER 2: EXPERT EVIDENCE</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
