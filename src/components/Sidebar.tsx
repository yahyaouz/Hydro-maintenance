import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  HeartPulse,
  Microscope,
  ClipboardCheck,
  Wrench,
  Circle,
  Download,
  Settings,
  FileText,
  Shield,
  Bell,
  Sun,
  Moon,
  LogOut,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Radar,
  Type,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCollection } from "@/hooks/useCollection";
import { DataLoadError } from "@/components/shared/DataLoadError";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentSite: string;
  setSite: (site: string) => void;
  user: any;
  isAdmin: boolean;
  notifications: any[];
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  textDensity: 'LARGE' | 'COMPACT';
  setTextDensity: (density: 'LARGE' | 'COMPACT') => void;
}

const SITES_LIST = [
  { value: "SMI", label: "SMI" },
  { value: "OUMEJRANE", label: "OUMEJRANE" },
  { value: "KOUDIA", label: "KOUDIAT AICHA" },
  { value: "BOU-AZZER", label: "BOU-AZZER" },
  { value: "OUANSIMI", label: "OUANSIMI" }
];

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export function Sidebar({
  currentPage,
  onNavigate,
  currentSite,
  setSite,
  user,
  isAdmin,
  notifications,
  isOpen,
  onClose,
  onSignOut,
  isDarkMode,
  onToggleDarkMode,
  textDensity,
  setTextDensity,
}: SidebarProps) {
  const { data: pannes, error: pannesError } = useCollection<any>('pannes', [], { unlimited: true });
  const { data: engins, error: enginsError } = useCollection<any>('engins', [], { unlimited: true });

  const hasLoadError = !!(pannesError || enginsError);

  const siteStatuses = React.useMemo(() => {
    const statuses: Record<string, string> = {};
    
    SITES_LIST.forEach(site => {
      const activeCriticalPannesCount = pannes
        ? pannes.filter((p: any) => p.siteId === site.value && p.statut !== 'CLOS' && p.gravite === 'CRITIQUE').length
        : 0;
        
      if (activeCriticalPannesCount === 0) {
        statuses[site.value] = 'bg-emerald-500';
      } else if (activeCriticalPannesCount <= 2) {
        statuses[site.value] = 'bg-amber-500';
      } else {
        statuses[site.value] = 'bg-red-500';
      }
    });
    
    return statuses;
  }, [pannes]);

  const hasCriticalPannes = React.useMemo(() => {
    if (!pannes) return false;
    return pannes.some((p: any) => 
      p.statut !== 'CLOS' && 
      p.gravite === 'CRITIQUE' && 
      (!currentSite || p.siteId === currentSite)
    );
  }, [pannes, currentSite]);

  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = React.useState(false);
  const [hoveredItem, setHoveredItem] = React.useState<{ label: string; top: number } | null>(null);
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved === "true";
  });
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      localStorage.setItem("sidebar_collapsed", String(!prev));
      return !prev;
    });
  };

  // Close site selector dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSiteDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = React.useMemo(() => {
    return notifications ? notifications.filter((n) => !n.read).length : 0;
  }, [notifications]);

  const MENU_VISIBILITY: Record<string, string[]> = {
    centre_commandement: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE"],
    dashboard: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "MECANICIEN", "SECRETAIRE"],
    alertes: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "MECANICIEN", "SECRETAIRE"],
    carnet_sante: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER"],
    systematique: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "MECANICIEN", "SECRETAIRE"],
    taches_planning: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "MECANICIEN", "SECRETAIRE"],
    checklists: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "MECANICIEN", "SECRETAIRE"],
    engins: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "MECANICIEN"],
    mecaniciens: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER"],
    pneumatiques: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "MECANICIEN"],
    rca: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE"],
    analyses: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE"],
    referentiel: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "MECANICIEN", "SECRETAIRE"],
    import_config: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "SECRETAIRE"],
    admin: ["ADMIN"]
  };

  // Original categories and page names/labels
  const menuCategories: MenuCategory[] = [
    {
      title: "DIRECTION",
      items: [
        { id: "centre_commandement", label: "Centre de Commandement", icon: Crown }
      ]
    },
    {
      title: "VUE D'ENSEMBLE",
      items: [
        { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
        { id: "alertes", label: "Alertes & Pannes", icon: Bell },
      ]
    },
    {
      title: "MAINTENANCE PRÉVENTIVE",
      items: [
        { id: "carnet_sante", label: "Santé des Engins", icon: HeartPulse },
        { id: "systematique", label: "Contrôles Réguliers", icon: ClipboardCheck },
        { id: "taches_planning", label: "Planning des Tâches", icon: ClipboardCheck },
        { id: "checklists", label: "Fiches de Contrôle", icon: ClipboardCheck },
      ]
    },
    {
      title: "ENGINS & ÉQUIPE",
      items: [
        { id: "engins", label: "Les Engins", icon: Circle },
        { id: "mecaniciens", label: "Mécaniciens", icon: Wrench },
        { id: "pneumatiques", label: "Pneumatiques", icon: Circle },
      ]
    },
    {
      title: "STATISTIQUES",
      items: [
        { id: "rca", label: "Causes des Pannes", icon: Microscope },
        { id: "analyses", label: "Chiffres & Résultats", icon: FileText },
      ]
    },
    {
      title: "RÉGLAGES",
      items: [
        { id: "referentiel", label: "Fiches Techniques", icon: Settings },
        { id: "import_config", label: "Import & Paramètres", icon: Download },
      ]
    }
  ];

  // Dynamically add Admin module for admin users
  if (isAdmin) {
    const systemCategory = menuCategories.find(cat => cat.title === "RÉGLAGES");
    if (systemCategory) {
      systemCategory.items.push({ id: "admin", label: "Comptes & Accès", icon: Shield });
    }
  }

  // Filter categories by user role
  const userRole = user?.role || "MECANICIEN";
  const filteredCategories = menuCategories
    .map(category => ({
      ...category,
      items: category.items.filter(item => {
        const allowedRoles = MENU_VISIBILITY[item.id];
        return allowedRoles ? allowedRoles.includes(userRole) : true;
      })
    }))
    .filter(category => category.items.length > 0);

  // Common render of the sidebar content to keep it DRY for Desktop & Mobile
  const renderSidebarContent = (isMobile = false, isCollapsedDesktop = false) => (
    <div className="flex flex-col h-full bg-white text-slate-900 border-r border-slate-200 select-none font-sans">
      {hasLoadError && (
        <div className="p-2 shrink-0">
          <DataLoadError message="Données hors-ligne ou inaccessibles" />
        </div>
      )}
      {/* Header with Logo */}
      <div className={cn(
        "h-16 border-b border-slate-100 flex items-center shrink-0",
        isCollapsedDesktop ? "justify-center px-2" : "justify-between px-6"
      )}>
        {!isCollapsedDesktop ? (
          <div className="flex items-center gap-2">
            <div className="shiny-logo flex items-center text-xl tracking-tight font-black uppercase">
              <span className="logo-hydro text-sky-500 font-black">HYDRO</span>
              <span className="logo-mines text-red-600 font-black ml-1.5 pl-1.5 border-l border-[rgba(212,175,55,0.4)]">MINES</span>
            </div>
          </div>
        ) : (
          <div className="shiny-logo flex items-center text-lg tracking-tight font-black uppercase" title="HYDRO MINES">
            <span className="logo-hydro text-sky-500 font-black">H</span>
            <span className="logo-mines text-red-600 font-black ml-1 pl-1 border-l border-[rgba(212,175,55,0.4)]">M</span>
          </div>
        )}
        
        {/* Collapse Button for Desktop */}
        {!isMobile && (
          <button
            onClick={toggleCollapse}
            className={cn(
              "p-1 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer hidden md:flex items-center justify-center",
              isCollapsedDesktop ? "absolute top-14 bg-white shadow-sm z-50 h-5 w-5 rounded-full border border-slate-200" : ""
            )}
            title={isCollapsedDesktop ? "Développer" : "Masquer"}
          >
            {isCollapsedDesktop ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        {/* Mobile close button */}
        {isMobile && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Site Selector Dropdown */}
      {!isCollapsedDesktop && (
        <div className="p-4 border-b border-slate-100 shrink-0 relative" ref={dropdownRef}>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">
            Site d'exploitation
          </label>
          <button
            onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
            className="w-full flex items-center justify-between h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", siteStatuses[currentSite] || "bg-emerald-500")} />
              <span className="truncate">
                {SITES_LIST.find((s) => s.value === currentSite)?.label || currentSite || "SMI"}
              </span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isSiteDropdownOpen && "rotate-180")} />
          </button>

          {isSiteDropdownOpen && (
            <div className="absolute left-4 right-4 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden py-1">
              {SITES_LIST.map((site) => (
                <button
                  key={site.value}
                  onClick={() => {
                    setSite(site.value);
                    setIsSiteDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                    currentSite === site.value
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", siteStatuses[site.value] || "bg-emerald-500")} />
                  <span className="truncate">{site.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation menu list grouped by categories */}
      <nav className={cn("flex-1 overflow-y-auto py-4 space-y-4 gold-scrollbar", isCollapsedDesktop ? "px-1.5" : "px-3")} role="navigation" aria-label="Menu principal">
        {filteredCategories.map((category) => (
          <div key={category.title} className="space-y-1">
            {/* Category title header */}
            {!isCollapsedDesktop && (
              <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-1.5 px-3 uppercase">
                {category.title}
              </div>
            )}
            
            {/* Category items */}
            <div className="space-y-1">
              {category.items.map((item) => {
                const isActive = currentPage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      if (isMobile) onClose(); // auto close drawer on mobile selection
                    }}
                    onMouseEnter={(e) => {
                      if (isCollapsedDesktop) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredItem({
                          label: item.label,
                          top: rect.top + (rect.height / 2)
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      "w-full flex items-center h-10 rounded-lg transition-all duration-150 cursor-pointer text-left relative",
                      isCollapsedDesktop ? "justify-center px-0" : "gap-3 px-3 text-[11.5px] font-semibold",
                      isActive
                        ? isCollapsedDesktop
                          ? "bg-transparent text-slate-850 dark:text-slate-200 border-l-[2px] border-slate-400 dark:border-slate-500 rounded-l-none"
                          : "bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white border-l-[2px] border-slate-400 dark:border-slate-500 rounded-r-xl rounded-l-none pl-2.5 font-bold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center transition-colors",
                      isCollapsedDesktop && "h-8 w-8 rounded-lg",
                      isCollapsedDesktop && isActive && "bg-slate-100 dark:bg-slate-800"
                    )}>
                      <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-slate-600 dark:text-slate-300" : "text-slate-400")} />
                    </div>
                    {!isCollapsedDesktop && (
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <span className="truncate">{item.label}</span>
                        {(item.id === "alertes" || item.id === "centre_commandement") && hasCriticalPannes && (
                          <span 
                            className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] shrink-0 ml-2" 
                            style={{ boxShadow: "0 0 6px 1.5px rgba(212, 175, 55, 0.6)" }} 
                            title="Attention requise"
                          />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom area: User section, notifications bell, dark/light toggle and log-out */}
      <div className={cn(
        "border-t border-slate-150 bg-slate-50/50 shrink-0 space-y-3.5",
        isCollapsedDesktop ? "p-2" : "p-4"
      )}>
        {/* User Card */}
        <div className={cn("flex items-center px-1 py-1", isCollapsedDesktop ? "justify-center" : "gap-3")}>
          <div className="relative shrink-0">
            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center" title={user?.displayName || "Collaborateur"}>
              <span className="text-xs font-black uppercase text-slate-600 font-mono">
                {user?.displayName ? user.displayName.substring(0, 2) : "HM"}
              </span>
            </div>
            <span className="absolute bottom-0 right-0 h-1 w-1 rounded-full bg-emerald-400 animate-gentle-breath" />
          </div>
          {!isCollapsedDesktop && (
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 truncate leading-none mb-1">
                {user?.displayName || "Collaborateur"}
              </h4>
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest leading-none">
                {user?.role?.replace(/_/g, " ") || "Agent"}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons footer */}
        <div className={cn(
          "flex gap-2 border-t border-slate-100 pt-3",
          isCollapsedDesktop ? "flex-col items-center" : "items-center justify-between"
        )}>
          {/* Notifications Bell Button */}
          <button
            onClick={() => {
              const bellElement = document.querySelector('button[aria-label="Alerts button"]');
              if (bellElement) {
                (bellElement as HTMLButtonElement).click();
              }
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-sky-50/50 hover:text-sky-600 transition-colors cursor-pointer shrink-0"
            aria-label="Notifications"
            title={isCollapsedDesktop ? undefined : "Alertes"}
            onMouseEnter={(e) => {
              if (isCollapsedDesktop) {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({
                  label: "Alertes",
                  top: rect.top + (rect.height / 2)
                });
              }
            }}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Bell className={cn("h-4 w-4", unreadCount > 0 && "text-amber-500 animate-pulse")} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-red-650" />
            )}
          </button>

          {/* Theme switcher */}
          <button
            onClick={onToggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-sky-50/50 hover:text-sky-600 transition-colors cursor-pointer shrink-0"
            aria-label="Changer de thème"
            title={isCollapsedDesktop ? undefined : "Changer de thème"}
            onMouseEnter={(e) => {
              if (isCollapsedDesktop) {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({
                  label: isDarkMode ? "Mode Clair" : "Mode Sombre",
                  top: rect.top + (rect.height / 2)
                });
              }
            }}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />
            ) : (
              <Moon className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {/* Text Density toggle */}
          <button
            onClick={() => setTextDensity(textDensity === 'LARGE' ? 'COMPACT' : 'LARGE')}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors cursor-pointer shrink-0",
              textDensity === 'COMPACT'
                ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                : "border-slate-200 bg-white text-slate-500 hover:bg-sky-50/50 hover:text-sky-600"
            )}
            aria-label="Changer la densité du texte"
            title={isCollapsedDesktop ? undefined : (textDensity === 'COMPACT' ? "Format compact activé" : "Format large")}
            onMouseEnter={(e) => {
              if (isCollapsedDesktop) {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({
                  label: textDensity === 'COMPACT' ? "Format Large" : "Format Compact",
                  top: rect.top + (rect.height / 2)
                });
              }
            }}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Type className="h-4 w-4" />
          </button>

          {/* Logout Button */}
          <button
            onClick={onSignOut}
            className={cn(
              "flex items-center justify-center rounded-lg border transition-colors font-bold text-xs uppercase cursor-pointer shrink-0",
              isCollapsedDesktop
                ? "h-9 w-9 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                : "flex-1 gap-2 h-9 px-3 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
            )}
            aria-label="Se déconnecter"
            title={isCollapsedDesktop ? undefined : "Se déconnecter"}
            onMouseEnter={(e) => {
              if (isCollapsedDesktop) {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({
                  label: "Sortie / Déconnexion",
                  top: rect.top + (rect.height / 2)
                });
              }
            }}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsedDesktop && <span>Sortie</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col h-full border-r border-slate-200 bg-white shrink-0 z-30 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {renderSidebarContent(false, isCollapsed)}
      </aside>

      {/* Mobile Sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Sidebar drawer body */}
          <aside className="relative flex flex-col w-64 h-full max-w-[280px] bg-white shadow-xl animate-in slide-in-from-left duration-200 z-50">
            {renderSidebarContent(true, false)}
          </aside>
        </div>
      )}

      {/* High-Fidelity Floating Tooltip for Collapsed Sidebar */}
      <AnimatePresence>
        {hoveredItem && isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            style={{ top: hoveredItem.top, transform: "translateY(-50%)" }}
            className="fixed left-[84px] z-[99999] bg-[#b8860b] text-white border border-[#b8860b]/30 text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.4)] pointer-events-none whitespace-nowrap flex items-center gap-2"
          >
            {/* Point bleu ciel pulsant */}
            <motion.div 
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-[#00BFFF] shadow-[0_0_8px_#00BFFF]" 
            />
            {hoveredItem.label}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
