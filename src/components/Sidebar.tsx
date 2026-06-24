import * as React from "react";
import {
  LayoutDashboard, Truck, Clock, Wrench, AlertTriangle,
  Disc, Fuel, Package, FileText, Eye, Database,
  Settings, ChevronDown, LogOut, MapPin, RefreshCw,
  Users, CheckCircle2, UserIcon, FileSpreadsheet, Shield,
  Sun, Moon, PlusCircle, Sparkles, ChevronLeft, ChevronRight,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { SITES, UserRole, User, SiteID } from "@/types";
import { motion } from "motion/react";
import { HydrominesLogo } from "./auth/HydrominesLogo";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  const navGroups = [
    {
      id: "SEP_SYNTHESES",
      title: "1. Synthèses & Flotte",
      items: [
        { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","VIEWER"] },
        { id: "engins", label: "État de la Flotte", icon: Truck, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","MECANICIEN","VIEWER"] },
        { id: "referentiel", label: "Référentiel Technique", icon: BookOpen, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","MECANICIEN","SECRETAIRE","VIEWER"] },
      ]
    },
    {
      id: "SEP_PLANIFICATION",
      title: "2. Planification & Opérations",
      items: [
        { id: "heures", label: "Heures de Travail", icon: Clock, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","SECRETAIRE","VIEWER"] },
        { id: "maintenance", label: "Bons de Travail (GMAO)", icon: Wrench, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","VIEWER"] },
        { id: "vidange", label: "Suivi Vidange", icon: PlusCircle, roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "VIEWER"] },
        { id: "pannes", label: "Suivi Pannes", icon: AlertTriangle, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","VIEWER"] },
        { id: "mecaniciens", label: "Équipe Mécanique", icon: Users, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","VIEWER"] },
      ]
    },
    {
      id: "SEP_TERRAIN",
      title: "3. Saisies de Terrain",
      items: [
        { id: "declaration_panne", label: "Déclarer Panne", icon: AlertTriangle, roles: ["SECRETAIRE"] },
        { id: "import_gasoil", label: "Import Gasoil/Huile", icon: FileSpreadsheet, roles: ["SECRETAIRE"] },
        { id: "mes_saisies", label: "Mes Saisies", icon: FileText, roles: ["SECRETAIRE"] },
        { id: "ma_fiche", label: "Ma Fiche Performance", icon: UserIcon, roles: ["MECANICIEN"] },
        { id: "interventions", label: "Mes Interventions", icon: Wrench, roles: ["MECANICIEN"] },
        { id: "saisies", label: "Vérifier Saisies", icon: CheckCircle2, roles: ["MECANICIEN"] },
      ]
    },
    {
      id: "SEP_LOGISTIQUE",
      title: "4. Logistique & Stock",
      items: [
        { id: "pneus", label: "Suivi Pneumatiques", icon: Disc, roles: ["ADMIN","DIRECTION","VIEWER"] },
        { id: "carburant", label: "Carburant & Huiles", icon: Fuel, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","VIEWER"] },
        { id: "stock", label: "Pièces & Stock", icon: Package, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","VIEWER"] },
        { id: "rapports", label: "Rapports & Audit", icon: FileText, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","VIEWER"] },
      ]
    },
    {
      id: "SEP_SUPERVISION",
      title: "5. Supervision & Admin",
      items: [
        { id: "vision_ia", label: "VISION IA PRO", icon: Eye, roles: ["ADMIN","VIEWER"] },
        { id: "inspection", label: "MODE INSPECTION", icon: Shield, roles: ["ADMIN","VIEWER"] },
        { id: "monde", label: "DOCK MONDE SOU-GMAO", icon: Database, roles: ["ADMIN","DIRECTION","RESPONSABLE_MAINTENANCE","RESPONSABLE_CHANTIER","VIEWER"] },
        { id: "admin", label: "Configuration Système", icon: Settings, roles: ["ADMIN","VIEWER"] },
      ]
    }
  ];

  const handlePageSelect = React.useCallback((tabId: string) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  }, [setActiveTab, onClose]);

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      !user || item.roles.includes(user.role)
    )
  })).filter(group => group.items.length > 0);

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[45] md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "bg-white border-r border-slate-100 h-screen fixed md:sticky top-0 left-0 overflow-y-auto flex flex-col transition-all duration-300 ease-in-out z-50 select-none shadow-sm",
        isCollapsed ? "w-16" : "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className
      )}>

        {/* Visual Effect Top */}
        {!isCollapsed && (
          <div className="absolute top-0 left-0 right-0 h-40 z-0 pointer-events-none overflow-hidden border-b border-amber-50/50 shadow-inner">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-100/15 rounded-full blur-2xl" />
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
          </div>
        )}

        {/* Top Logo and Header */}
        <div className="p-4 pb-3 flex items-center justify-between border-b border-gray-100 shrink-0 bg-white relative z-10">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <HydrominesLogo size={36} className="shrink-0" />
              <div className="flex flex-col">
                <h1 className="text-base font-black tracking-normal flex items-center gap-0.5 leading-none">
                  <span className="text-[#02A2DE] font-black">HYDRO</span>
                  <span className="text-[#AC1E23] font-black">MINES</span>
                  
                  {/* Network State Indicator */}
                  <div className="ml-1 ml-[5px] inline-flex items-center">
                    {isOnline ? (
                      <div className="flex h-1.5 w-1.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-555" title="Réseau connecté"></span>
                      </div>
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Hors-ligne" />
                    )}
                  </div>
                </h1>
                <span className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-[0.05em] mt-1 leading-none">
                  Espace Maintenance
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full relative">
              <HydrominesLogo size={32} />
              {/* Absolutized network indicator on collapsed logo anchor */}
              <div className="absolute top-0 right-1 translate-x-1 -translate-y-1 inline-flex items-center">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full border border-white",
                  isOnline ? "bg-emerald-555 animate-pulse" : "bg-amber-500"
                )} />
              </div>
            </div>
          )}

          {/* Collapse Button for desktop */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 text-slate-600 hover:bg-amber-50/50 hover:text-amber-600 transition-colors hidden md:flex shrink-0 ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          {/* Close Button for mobile drawer */}
          {isOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-600 hover:bg-amber-50/50 hover:text-amber-600 md:hidden"
            >
              <ChevronLeft className="h-4 w-4 animate-pulse" />
            </Button>
          )}
        </div>

        {/* Site Active Selector */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-gray-100 shrink-0 bg-white relative z-10">
            <div className="bg-slate-50/60 rounded-xl p-2 border border-slate-100 flex items-center gap-3 relative group">
              <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center text-amber-500 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 overflow-hidden min-w-0">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0 leading-none">SITE ACTIF</label>
                {["ADMIN", "DIRECTION"].includes(user?.role || "") ? (
                  <select
                    value={activeSite}
                    onChange={(e) => setActiveSite(e.target.value as SiteID)}
                    className="w-full bg-transparent text-sm font-black text-slate-800 outline-none focus:ring-0 cursor-pointer pr-4 appearance-none"
                  >
                    <option value="TOUS">Tous les sites</option>
                    {SITES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs font-bold text-slate-800 uppercase truncate mt-0.5">
                    {user?.siteId || "SMI"}
                  </div>
                )}
              </div>
              {["ADMIN", "DIRECTION"].includes(user?.role || "") && (
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
              )}
            </div>
          </div>
        )}

        {/* Navigation Middle list */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scroll-industrial bg-white relative z-10">
          <nav className="flex flex-col gap-4">
            {filteredGroups.map((group) => (
              <div key={group.id} className="space-y-1">
                {!isCollapsed ? (
                  <h3 className="text-[9.5px] font-black text-amber-600 tracking-wider px-2 uppercase my-1">
                    {group.title}
                  </h3>
                ) : (
                  <div className="border-t border-gray-100 my-2" />
                )}
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={cn(
                          "justify-start gap-2.5 px-3 relative group overflow-hidden h-10 w-full text-left transition-all rounded-lg touch-manipulation font-medium",
                          isActive 
                            ? "bg-amber-50/45 text-amber-700 border border-amber-200/50 font-bold" 
                            : "text-slate-600 hover:text-amber-600 hover:bg-amber-50/30"
                        )}
                        onClick={() => handlePageSelect(item.id)}
                      >
                        <item.icon className={cn(
                          "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                          isActive ? "text-amber-600" : "text-slate-500"
                        )} />
                        {!isCollapsed && <span className="text-[10.5px] tracking-tight uppercase font-bold">{item.label}</span>}
                        {isActive && !isCollapsed && (
                          <motion.div 
                            layoutId="activeSideIndicator"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            className="absolute left-0 top-1 bottom-1 w-[3px] bg-amber-500 rounded-r" 
                          />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Fixe */}
        <div className="p-3 border-t border-gray-100 shrink-0 bg-white mt-auto space-y-2 relative z-10 shadow-xs">
          {/* Density selection */}
          {!isCollapsed && (
            <div className="space-y-1 pb-2 border-b border-gray-100">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">DENSITÉ SOU-GMAO</span>
              <div className="grid grid-cols-3 gap-1">
                {(['compact', 'standard', 'large'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={cn(
                      "h-6 rounded text-[8px] font-black uppercase tracking-wide transition-all border cursor-pointer",
                      density === d
                        ? "bg-amber-500 text-white border-amber-500 font-extrabold"
                        : "bg-white text-slate-600 border-gray-100 hover:bg-amber-50/40"
                    )}
                  >
                    {d === 'compact' ? 'COMP' : d === 'standard' ? 'STD' : 'LARG'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Theme switcher */}
          <div className={cn("flex", isCollapsed ? "justify-center" : "")}>
            <Button 
              variant="outline" 
              size={isCollapsed ? "icon" : "sm"} 
              className={cn(
                "w-full text-left justify-start gap-2 text-[8px] font-black uppercase tracking-widest h-8 text-slate-600 hover:bg-amber-50/50 border-gray-100",
                isCollapsed && "justify-center"
              )}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon className="h-3.5 w-3.5 text-slate-500" /> : <Sun className="h-3.5 w-3.5 text-amber-500 animate-pulse" />}
              {!isCollapsed && (
                <span>MODE {theme === 'light' ? 'SOMBRE' : 'CLAIR'}</span>
              )}
            </Button>
          </div>

          {/* User profile */}
          <div className={cn(
            "flex items-center gap-2.5 py-1",
            isCollapsed ? "justify-center" : ""
          )}>
            <Avatar className="h-8 w-8 border border-gray-100 shadow-xs shrink-0 bg-slate-50">
              <AvatarFallback className="text-slate-800 text-[10px] font-black bg-amber-100 text-amber-700">
                {user?.displayName?.split(" ").map(n => n[0]).join("") || "HM"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col flex-1 overflow-hidden leading-tight">
                <span className="text-[10px] font-bold truncate text-slate-800">{user?.displayName}</span>
                <span className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest truncate">
                  {user?.role?.replace(/_/g, ' ')}
                </span>
              </div>
            )}
          </div>

          {/* Exit / Logout button */}
          {!isCollapsed && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-[8px] font-black uppercase tracking-widest h-8 border-gray-100 hover:text-amber-700 hover:border-amber-200 hover:bg-amber-50/40 text-slate-600"
              onClick={() => logout()}
            >
              <LogOut className="h-3 w-3 mr-1 text-slate-500" />
              Déconnexion
            </Button>
          )}
        </div>

      </aside>
    </>
  );
}
