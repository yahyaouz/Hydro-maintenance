import * as React from "react";
import {
  LayoutDashboard, Truck, Clock, Wrench, AlertTriangle,
  Disc, Fuel, Package, FileText, Eye, Database,
  Settings, ChevronDown, LogOut, MapPin, RefreshCw,
  Users, CheckCircle2, UserIcon, FileSpreadsheet, Shield,
  Sun, Moon, PlusCircle, Sparkles, ChevronLeft, ChevronRight,
  BookOpen, Calendar, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { SITES, UserRole, User, SiteID } from "@/types";
import { motion, AnimatePresence } from "motion/react";
import { HydrominesLogo } from "./auth/HydrominesLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
// V4-BADGE: Import Firestore methods and db instance
import { collection, query, where, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ activeTab, setActiveTab, className, isOpen, onClose }: SidebarProps) {
  const { user, logout, activeSite, setActiveSite, theme, setTheme, density, setDensity } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // V4-BADGE: Real-time active alerts badge state
  const [alertCount, setAlertCount] = React.useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = React.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hydromines_alerts_sound") === "true";
    }
    return false;
  });

  const showBadge = React.useMemo(() => {
    return !!(user && ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE"].includes(user.role));
  }, [user]);

  React.useEffect(() => {
    if (!showBadge) {
      setAlertCount(0);
      return;
    }

    // V4-BADGE: Query active alerts limited to 100, filter severity client-side to avoid composite index requirements
    const q = query(
      collection(db, "alerts"),
      where("status", "==", "ACTIVE"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data && (data.severity === "RED" || data.severity === "RED_FLASHING")) {
          count++;
        }
      });
      setAlertCount(count);
    }, (err) => {
      console.warn("V4-BADGE: Failed to subscribe to active alerts (handled gracefully):", err);
      setAlertCount(0);
    });

    return () => unsubscribe();
  }, [showBadge]);

  // V4-BADGE: Audio alert mechanism (synthesized sine wave)
  const prevCountRef = React.useRef(0);
  const isFirstLoad = React.useRef(true);

  React.useEffect(() => {
    if (isFirstLoad.current) {
      if (alertCount > 0) {
        prevCountRef.current = alertCount;
      }
      isFirstLoad.current = false;
      return;
    }

    if (isSoundEnabled && alertCount > prevCountRef.current) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.35);
      } catch (e) {
        console.warn("V4-BADGE: Audio play failed", e);
      }
    }
    prevCountRef.current = alertCount;
  }, [alertCount, isSoundEnabled]);

  const toggleSound = React.useCallback(() => {
    setIsSoundEnabled((prev) => {
      const newVal = !prev;
      localStorage.setItem("hydromines_alerts_sound", String(newVal));
      if (newVal) {
        toast.success("Alertes sonores activées");
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.setValueAtTime(600, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) {}
      } else {
        toast.info("Alertes sonores désactivées");
      }
      return newVal;
    });
  }, []);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Custom visual feedback based on the selected site
  const getSiteConfig = React.useCallback((siteId: SiteID) => {
    switch (siteId) {
      case 'SMI':
        return {
          bg: 'bg-blue-50/60 dark:bg-blue-950/15',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-100 dark:border-blue-900/30',
          dot: 'bg-blue-500',
          glow: 'shadow-blue-500/10'
        };
      case 'OUMEJRANE':
        return {
          bg: 'bg-indigo-50/60 dark:bg-indigo-950/15',
          text: 'text-indigo-600 dark:text-indigo-400',
          border: 'border-indigo-100 dark:border-indigo-900/30',
          dot: 'bg-indigo-500',
          glow: 'shadow-indigo-500/10'
        };
      case 'KOUDIA':
        return {
          bg: 'bg-emerald-50/60 dark:bg-emerald-950/15',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-100 dark:border-emerald-900/30',
          dot: 'bg-emerald-500',
          glow: 'shadow-emerald-500/10'
        };
      case 'OUANSIMI':
        return {
          bg: 'bg-amber-50/60 dark:bg-amber-950/15',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-100 dark:border-amber-900/30',
          dot: 'bg-amber-500',
          glow: 'shadow-amber-500/10'
        };
      case 'BOU-AZZER':
        return {
          bg: 'bg-rose-50/60 dark:bg-rose-950/15',
          text: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-100 dark:border-rose-900/30',
          dot: 'bg-rose-500',
          glow: 'shadow-rose-500/10'
        };
      default:
        return {
          bg: 'bg-slate-50/60 dark:bg-slate-900/40',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-100 dark:border-slate-800/40',
          dot: 'bg-slate-500',
          glow: 'shadow-slate-500/5'
        };
    }
  }, []);

  const siteStyle = getSiteConfig(activeSite);

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    analyses: true,
    parc: true,
    operations: true,
    systeme: true
  });

  const toggleGroup = React.useCallback((groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  }, []);

  const navGroups = [
    {
      id: "analyses",
      title: "ANALYSES & SUPERVISION",
      items: [
        { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","VIEWER"] },
        // V4-ALERTES: Adding Alertes tab to the main navigation
        { id: "alertes", label: "Alertes", icon: AlertTriangle, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","VIEWER"] },
        { id: "analyses", label: "Analyses & Rapports", icon: BarChart3, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","MECANICIEN","VIEWER"] },
      ]
    },
    {
      id: "parc",
      title: "GESTION DU PARC",
      items: [
        { id: "engins", label: "État de la Flotte", icon: Truck, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","MECANICIEN","VIEWER"] },
        { id: "referentiel", label: "Référentiel Technique", icon: BookOpen, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","MECANICIEN","SECRETAIRE","VIEWER"] },
      ]
    },
    {
      id: "operations",
      title: "OPÉRATIONS DE TERRAIN",
      items: [
        { id: "taches_planning", label: "Tâches & Planning", icon: Calendar, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","MECANICIEN","VIEWER"] },
        { id: "checklists", label: "Checklists SOU-GMAO", icon: CheckCircle2, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","MECANICIEN","VIEWER"] },
      ]
    },
    {
      id: "systeme",
      title: "SYSTÈME",
      items: [
        { 
          id: "guide_reparation", 
          label: "Guide de Réparation", 
          icon: BookOpen, 
          roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "MECANICIEN"], 
          onClick: () => window.open("https://guide-pannes.hydromines.ma", "_blank") 
        },
        // V4-IMPORT: Add ImportConfig route to the system group
        { id: "import_config", label: "Configuration Imports", icon: Database, roles: ["ADMIN", "RESPONSABLE_MAINTENANCE"] },
        { id: "admin", label: "Configuration Système", icon: Settings, roles: ["ADMIN","VIEWER"] },
      ]
    }
  ];

  const handlePageSelect = React.useCallback((item: any) => {
    if (item.onClick) {
      item.onClick();
      return;
    }
    setActiveTab(item.id);
    if (onClose) onClose();
  }, [setActiveTab, onClose]);

  const filteredGroups = React.useMemo(() => {
    return navGroups.map(group => ({
      ...group,
      items: group.items.filter(item =>
        !user || item.roles.includes(user.role)
      )
    })).filter(group => group.items.length > 0);
  }, [user]);

  React.useEffect(() => {
    const matchingGroup = filteredGroups.find(group => 
      group.items.some(item => item.id === activeTab)
    );
    if (matchingGroup) {
      setExpandedGroups(prev => {
        if (!prev[matchingGroup.id]) {
          return { ...prev, [matchingGroup.id]: true };
        }
        return prev;
      });
    }
  }, [activeTab, filteredGroups]);

  return (
    <>
      {/* Mobile backdrop overlay with high-end blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[45] md:hidden animate-in fade-in duration-250"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-900/80 h-screen fixed md:sticky top-0 left-0 overflow-y-auto flex flex-col transition-all duration-350 ease-out z-50 select-none shadow-md",
        isCollapsed ? "w-20" : "w-68",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className
      )}>

        {/* Visual Premium Ambient Glow on Top Header */}
        {!isCollapsed && (
          <div className="absolute top-0 left-0 right-0 h-44 z-0 pointer-events-none overflow-hidden border-b border-amber-500/5 dark:border-slate-800/10">
            <div className={cn(
              "absolute -top-16 -left-16 w-36 h-36 rounded-full blur-3xl transition-all duration-700 opacity-20 dark:opacity-10",
              activeSite === 'TOUS' ? "bg-amber-400" : 
              activeSite === 'SMI' ? "bg-blue-400" :
              activeSite === 'OUMEJRANE' ? "bg-indigo-400" :
              activeSite === 'KOUDIA' ? "bg-emerald-400" :
              activeSite === 'OUANSIMI' ? "bg-amber-400" : "bg-rose-400"
            )} />
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-amber-500/5 dark:bg-slate-500/5 rounded-full blur-2xl animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-white/20 to-transparent" />
          </div>
        )}

        {/* Top Logo and Header */}
        <div className="p-4 pb-3 flex items-center justify-between border-b border-slate-50 dark:border-slate-900/40 shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md relative z-10">
          {!isCollapsed ? (
            <div className="flex items-center gap-4">
              <HydrominesLogo size={96} className="shrink-0 transition-transform duration-300 hover:rotate-6" />
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter flex flex-col leading-none">
                  <span className="text-[#02A2DE] font-black tracking-tight">HYDRO</span>
                  <span className="text-[#AC1E23] font-black tracking-tight">MINES</span>
                </h1>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full gap-2 relative">
              <div className="cursor-pointer" onClick={() => setIsCollapsed(false)}>
                <HydrominesLogo size={44} />
              </div>
              <span className={cn(
                /* V4-TYPO: replaced text-[7px] with text-tech */
                "text-tech font-black px-1 rounded uppercase tracking-tighter leading-none mt-0.5",
                siteStyle.bg, siteStyle.text
              )}>
                {activeSite === 'TOUS' ? 'GBL' : activeSite.substring(0, 3)}
              </span>
            </div>
          )}

          {/* Collapse Button for desktop with micro-shadow */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 dark:text-slate-400 hover:text-amber-600 transition-all duration-300 hidden md:flex shrink-0 ml-auto border border-transparent hover:border-slate-100 dark:hover:border-slate-800 rounded-lg"
          >
            {isCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
          </Button>

          {/* Close Button for mobile drawer */}
          {isOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 md:hidden border border-transparent hover:border-slate-100 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4 animate-pulse" />
            </Button>
          )}
        </div>

        {/* Site Active Selector - LEVEL GOD PREMIUM TACTICAL CARD */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-900/40 shrink-0 bg-white/90 dark:bg-slate-950/90 relative z-10">
            <div className={cn(
              "rounded-xl p-2.5 border transition-all duration-500 flex items-center gap-3 relative group shadow-xs",
              siteStyle.bg, siteStyle.border, siteStyle.glow
            )}>
              <div className={cn(
                "w-9 h-9 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-850 flex items-center justify-center transition-colors duration-500",
                siteStyle.text
              )}>
                <MapPin className="w-4.5 h-4.5 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                {/* V4-TYPO: replaced text-[9px] with text-caption and font-sans */}
                <span className="text-caption font-sans font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5 leading-none">
                  CHANTIER SÉLECTIONNÉ
                </span>
                {["ADMIN", "DIRECTION"].includes(user?.role || "") ? (
                  <div className="relative flex items-center">
                    <select
                      value={activeSite}
                      onChange={(e) => {
                        const targetSite = e.target.value as SiteID;
                        setActiveSite(targetSite);
                        toast.success(`Cockpit chantier commuté : ${targetSite}`);
                      }}
                      className="w-full bg-transparent text-xs font-black text-slate-850 dark:text-slate-100 outline-none focus:ring-0 cursor-pointer pr-5 appearance-none uppercase tracking-wide border-0 p-0"
                    >
                      <option value="TOUS" className="dark:bg-slate-900">TOUS LES CHANTIERS</option>
                      {SITES.map((s) => (
                        <option key={s.id} value={s.id} className="dark:bg-slate-900">
                          {s.name} ({s.id})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="text-xs font-black text-slate-850 dark:text-slate-100 uppercase truncate tracking-wide flex items-center gap-1.5 mt-0.5">
                    {user?.siteId || "SMI"}
                    <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", siteStyle.dot)} />
                  </div>
                )}
              </div>
              {["ADMIN", "DIRECTION"].includes(user?.role || "") && (
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none group-hover:translate-y-0.5 transition-transform duration-350" />
              )}
            </div>
          </div>
        )}

        {/* Navigation Middle list */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-4 scroll-industrial bg-white dark:bg-slate-950 relative z-10">
          <nav className="flex flex-col gap-4">
            {filteredGroups.map((group) => {
              const isExpanded = expandedGroups[group.id] !== false;
              const hasActiveItem = group.items.some(item => activeTab === item.id);

              return (
                <div key={group.id} className="space-y-1">
                  {!isCollapsed ? (
                    /* Category Accordion Header */
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className={cn(
                        "flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left transition-all duration-200 select-none cursor-pointer group/header",
                        hasActiveItem 
                          ? "text-amber-600 dark:text-amber-400 font-bold bg-amber-500/5" 
                          : "text-slate-400 hover:text-slate-750 dark:hover:text-slate-200"
                      )}
                    >
                      {/* V4-TYPO: replaced text-[9.5px] with text-caption and font-sans */}
                      <h3 className="text-caption font-sans font-black tracking-widest uppercase flex items-center gap-1.5">
                        <span className={cn(
                          "w-1 h-1 rounded-full transition-all duration-350",
                          hasActiveItem ? "bg-amber-500 scale-125" : "bg-slate-300 dark:bg-slate-700"
                        )} />
                        {group.title}
                      </h3>
                      <ChevronDown className={cn(
                        "w-3.5 h-3.5 transition-transform duration-300 text-slate-400 group-hover/header:text-amber-500",
                        isExpanded ? "rotate-0" : "-rotate-90"
                      )} />
                    </button>
                  ) : (
                    <div className="border-t border-slate-100 dark:border-slate-900/60 my-2" />
                  )}

                  {/* Accordion Content with framer motion height */}
                  {isCollapsed ? (
                    <div className="flex flex-col gap-1">
                      {group.items.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                          <Button
                            key={item.id}
                            variant="ghost"
                            className={cn(
                              "justify-center px-0 relative group h-10 w-full transition-all duration-200 rounded-xl touch-manipulation",
                              isActive 
                                ? "bg-amber-500/8 dark:bg-amber-500/12 text-amber-600 dark:text-amber-400 font-bold" 
                                : "text-slate-650 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-50/75 dark:hover:bg-slate-900/60"
                            )}
                            onClick={() => handlePageSelect(item)}
                            title={item.id === "guide_reparation" ? "Plateforme de guide de réparation — disponible prochainement" : item.label}
                          >
                            <div className="relative">
                              <item.icon className={cn(
                                "h-5 w-5 shrink-0 transition-transform duration-350",
                                isActive ? "text-amber-500 dark:text-amber-400" : "text-slate-500 group-hover:scale-110"
                              )} />
                              {/* V4-BADGE: Point rouge clignotant sur l'icône en mode collapsed */}
                              {item.id === "alertes" && showBadge && alertCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                              )}
                            </div>
                            {isActive && (
                              <motion.div 
                                layoutId="activeSideIndicatorCollapsed"
                                className="absolute right-0 top-2 bottom-2 w-1 bg-amber-500 rounded-l" 
                              />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-1 pt-1.5 pl-2 border-l border-slate-100/75 dark:border-slate-900/40 ml-1.5">
                            {group.items.map((item) => {
                              const isActive = activeTab === item.id;
                              return (
                                <Button
                                  key={item.id}
                                  variant="ghost"
                                  className={cn(
                                    "justify-start gap-3 px-3 relative group overflow-hidden h-9.5 w-full text-left transition-all duration-200 rounded-xl touch-manipulation font-medium",
                                    isActive 
                                      ? "bg-amber-500/8 dark:bg-amber-500/12 text-amber-600 dark:text-amber-400 font-black border-l-4 border-amber-500 rounded-l-none pl-2 shadow-2xs" 
                                      : "text-slate-650 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-50/75 dark:hover:bg-slate-900/60"
                                  )}
                                  onClick={() => handlePageSelect(item)}
                                  title={item.id === "guide_reparation" ? "Plateforme de guide de réparation — disponible prochainement" : item.label}
                                >
                                  <item.icon className={cn(
                                    "h-4 w-4 shrink-0 transition-transform duration-350",
                                    isActive ? "text-amber-500 dark:text-amber-400" : "text-slate-500 group-hover:scale-110"
                                  )} />
                                  <span className="text-[11px] tracking-wide uppercase font-black">{item.label}</span>
                                  {/* V4-BADGE: Pilule rouge avec le nombre en mode étendu */}
                                  {item.id === "alertes" && showBadge && alertCount > 0 && (
                                    <span className="ml-auto flex items-center justify-center bg-red-500 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full animate-pulse shadow-sm">
                                      {alertCount > 99 ? "99+" : alertCount}
                                    </span>
                                  )}
                                </Button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Fixe - PREMIUM PANEL */}
        <div className="p-3.5 border-t border-slate-50 dark:border-slate-900/40 shrink-0 bg-white dark:bg-slate-950 mt-auto space-y-3 relative z-10 shadow-md">
          {/* User profile */}
          <div className={cn(
            "flex items-center gap-2.5 py-1.5",
            isCollapsed ? "justify-center" : ""
          )}>
            <Avatar className="h-9 w-9 border border-slate-100 dark:border-slate-850 shadow-sm shrink-0 bg-slate-50 dark:bg-slate-900 ring-2 ring-transparent group-hover:ring-amber-500/25 transition-all">
              {/* V4-TYPO: replaced text-[10.5px] with text-caption */}
              <AvatarFallback className="text-slate-855 text-caption font-black bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
                {user?.displayName?.split(" ").map(n => n[0]).join("") || "HM"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col flex-1 overflow-hidden leading-tight">
                <span className="text-[11px] font-black truncate text-slate-850 dark:text-slate-100">{user?.displayName}</span>
                {/* V4-TYPO: replaced text-[7.5px] with text-caption and font-sans */}
                <span className="text-caption font-sans text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest truncate mt-0.5">
                  {user?.role?.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>

          {/* V4-BADGE: Sound Mute/Unmute Toggle */}
          {showBadge && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "w-full text-caption font-sans font-black uppercase tracking-widest h-8 transition-all border border-transparent hover:text-amber-600 dark:hover:text-amber-400",
                isCollapsed ? "justify-center px-0" : "justify-start px-2",
                isSoundEnabled 
                  ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50/75 dark:hover:bg-slate-900/60"
              )}
              onClick={toggleSound}
              title={isSoundEnabled ? "Désactiver les alertes sonores" : "Activer les alertes sonores"}
            >
              <span className={cn("text-xs shrink-0", isCollapsed ? "" : "mr-2")}>
                {isSoundEnabled ? "🔊" : "🔔"}
              </span>
              {!isCollapsed && (
                <span className="truncate">
                  {isSoundEnabled ? "Alertes sonores : ON" : "Activer les alertes sonores"}
                </span>
              )}
            </Button>
          )}

          {/* Exit / Logout button */}
          {!isCollapsed && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-caption font-sans font-black uppercase tracking-widest h-8 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/10 text-slate-500 dark:text-slate-400 transition-colors"
              onClick={() => {
                logout();
                toast.info("Déconnexion réussie");
              }}
            >
              <LogOut className="h-3.5 w-3.5 mr-2 text-slate-400 hover:text-red-500" />
              Déconnexion
            </Button>
          )}
        </div>

      </aside>
    </>
  );
}
