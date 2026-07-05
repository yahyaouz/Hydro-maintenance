import * as React from "react";
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
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}

const SITES_LIST = [
  "SMI",
  "OUMEJRANE",
  "KOUDIAT AICHA",
  "BOU-AZZER",
  "OUANSIMI"
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
}: SidebarProps) {
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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

  // Original categories and page names/labels
  const menuCategories: MenuCategory[] = [
    {
      title: "SUPERVISION & OPÉRATIONS",
      items: [
        { id: "dashboard", label: "Supervision Flotte", icon: LayoutDashboard },
        { id: "alertes", label: "Alertes & Vigilance Métier", icon: Bell },
      ]
    },
    {
      title: "MAINTENANCE PRÉVENTIVE",
      items: [
        { id: "carnet_sante", label: "Carnet de Santé Flotte", icon: HeartPulse },
        { id: "systematique", label: "TÂCHES SYSTÉMATIQUES", icon: ClipboardCheck },
        { id: "taches_planning", label: "Planning des Tâches", icon: ClipboardCheck },
        { id: "checklists", label: "Fiches de Contrôle", icon: ClipboardCheck },
      ]
    },
    {
      title: "RESSOURCES & PARC",
      items: [
        { id: "engins", label: "Gestion du Parc", icon: Circle },
        { id: "mecaniciens", label: "Collaborateurs", icon: Wrench },
        { id: "pneumatiques", label: "Pneumatiques", icon: Circle },
      ]
    },
    {
      title: "AMÉLIORATION CONTINUE",
      items: [
        { id: "rca", label: "Analyse de Cause Racine (RCA)", icon: Microscope },
        { id: "analyses", label: "Analyses & KPI", icon: FileText },
      ]
    },
    {
      title: "CONFIGURATION & SYSTÈME",
      items: [
        { id: "referentiel", label: "Référentiel Technique", icon: Settings },
        { id: "import_config", label: "Import & Paramètres", icon: Download },
      ]
    }
  ];

  // Dynamically add Admin module for admin users
  if (isAdmin) {
    const systemCategory = menuCategories.find(cat => cat.title === "CONFIGURATION & SYSTÈME");
    if (systemCategory) {
      systemCategory.items.push({ id: "admin", label: "Privilèges & Droits", icon: Shield });
    }
  }

  // Common render of the sidebar content to keep it DRY for Desktop & Mobile
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-900 border-r border-slate-200 select-none font-sans">
      {/* Header with Logo */}
      <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="shiny-logo flex items-center text-xl tracking-tight font-black uppercase">
            <span className="logo-hydro text-sky-500 font-black">HYDRO</span>
            <span className="logo-mines text-red-600 font-black ml-1">MINES</span>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Site Selector Dropdown */}
      <div className="p-4 border-b border-slate-100 shrink-0 relative" ref={dropdownRef}>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">
          Site d'exploitation
        </label>
        <button
          onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
          className="w-full flex items-center justify-between h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
        >
          <span className="truncate">{currentSite || "SMI"}</span>
          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isSiteDropdownOpen && "rotate-180")} />
        </button>

        {isSiteDropdownOpen && (
          <div className="absolute left-4 right-4 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden py-1">
            {SITES_LIST.map((site) => (
              <button
                key={site}
                onClick={() => {
                  setSite(site);
                  setIsSiteDropdownOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer",
                  currentSite === site
                    ? "bg-sky-50 text-sky-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {site}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation menu list grouped by categories */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4" role="navigation" aria-label="Menu principal">
        {menuCategories.map((category) => (
          <div key={category.title} className="space-y-1">
            {/* Category title header */}
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider mb-1.5 px-3 uppercase">
              {category.title}
            </div>
            
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
                      onClose(); // auto close drawer on mobile selection
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 h-10 px-3 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer text-left relative",
                      isActive
                        ? "bg-sky-50 text-sky-700 border-l-[3px] border-sky-500 rounded-l-none pl-2.5"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-sky-500" : "text-slate-400")} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom area: User section, notifications bell, dark/light toggle and log-out */}
      <div className="p-4 border-t border-slate-150 bg-slate-50/50 shrink-0 space-y-3.5">
        {/* User Card */}
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-black uppercase text-slate-600 font-mono">
              {user?.displayName ? user.displayName.substring(0, 2) : "HM"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-800 truncate leading-none mb-1">
              {user?.displayName || "Collaborateur"}
            </h4>
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest leading-none">
              {user?.role?.replace(/_/g, " ") || "Agent"}
            </span>
          </div>
        </div>

        {/* Action buttons footer */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          {/* Notifications Bell Button */}
          <button
            onClick={() => {
              const bellElement = document.querySelector('button[aria-label="Alerts button"]');
              if (bellElement) {
                (bellElement as HTMLButtonElement).click();
              }
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-sky-50/50 hover:text-sky-600 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className={cn("h-4 w-4", unreadCount > 0 && "text-amber-500 animate-pulse")} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-red-650" />
            )}
          </button>

          {/* Theme switcher */}
          <button
            onClick={onToggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-sky-50/50 hover:text-sky-600 transition-colors cursor-pointer"
            aria-label="Changer de thème"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />
            ) : (
              <Moon className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={onSignOut}
            className="flex-1 flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors font-bold text-xs uppercase cursor-pointer"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sortie</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-full border-r border-slate-200 bg-white shrink-0 z-30">
        {renderSidebarContent()}
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
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </>
  );
}
