import * as React from "react";
import { 
  LayoutDashboard, 
  Truck, 
  Clock, 
  Wrench, 
  AlertTriangle, 
  Disc, 
  Fuel, 
  Package, 
  FileText, 
  Cpu, 
  Bell, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Sparkles,
  Shield,
  Eye,
  FileSpreadsheet,
  PlusCircle,
  Users,
  Search,
  Database,
  Lock,
  Flag,
  CheckCircle2,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store";
import { SITES, UserRole, User, SiteID } from "@/types";
import { motion } from "motion/react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  className?: string;
}

export function Sidebar({ activeTab, setActiveTab, className }: SidebarProps) {
  const { user, setUser, logout, activeSite, setActiveSite, theme, setTheme } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navGroups = [
    {
      title: "SYNTHÈSES & FLOTTE",
      items: [
        { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard, roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "VIEWER"] },
        { id: "engins", label: "État de la Flotte", icon: Truck, roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "MECANICIEN", "VIEWER"] },
      ]
    },
    {
      title: "PLANIFICATION & OPÉRATIONS",
      items: [
        { id: "heures", label: "Heures de Travail", icon: Clock, roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "SECRETAIRE", "VIEWER"] },
        { id: "maintenance", label: "Bons de Travail (GMAO)", icon: Wrench, roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "VIEWER"] },
        { id: "vidange", label: "Suivi Vidange", icon: PlusCircle, roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "VIEWER"] },
        { id: "pannes", label: "Suivi Pannes", icon: AlertTriangle, color: "text-red-500", roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "VIEWER"] },
        { id: "mecaniciens", label: "Équipe Mécanique", icon: Users, roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "VIEWER"] },
      ]
    },
    {
      title: "SAISIES DE TERRAIN",
      items: [
        { id: "declaration_panne", label: "Déclarer Panne", icon: AlertTriangle, color: "text-amber-500", roles: ["SECRETAIRE"] },
        { id: "import_gasoil", label: "Import Gasoil/Huile", icon: FileSpreadsheet, roles: ["SECRETAIRE"] },
        { id: "mes_saisies", label: "Mes Saisies", icon: FileText, roles: ["SECRETAIRE"] },
        { id: "ma_fiche", label: "Ma Fiche Performance", icon: UserIcon, roles: ["MECANICIEN"] },
        { id: "interventions", label: "Mes Interventions", icon: Wrench, roles: ["MECANICIEN"] },
        { id: "saisies", label: "Vérifier Saisies", icon: CheckCircle2, roles: ["MECANICIEN"] },
      ]
    },
    {
      title: "LOGISTIQUE & STOCK",
      items: [
        { id: "pneus", label: "Suivi Pneumatiques", icon: Disc, roles: ["ADMIN", "DIRECTION", "VIEWER"] },
        { id: "carburant", label: "Carburant & Huiles", icon: Fuel, roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "VIEWER"] },
        { id: "stock", label: "Pièces & Stock", icon: Package, roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "VIEWER"] },
        { id: "rapports", label: "Rapports & Audit Logs", icon: FileText, roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "VIEWER"] },
      ]
    },
    {
      title: "SUPERVISION COGNITIVE",
      items: [
        { id: "vision_ia", label: "VISION IA PRO", icon: Eye, color: "text-[#4A90D9] font-black", roles: ["ADMIN", "VIEWER"] },
        { id: "inspection", label: "MODE INSPECTION", icon: Shield, color: "text-red-650", roles: ["ADMIN", "VIEWER"] },
        { id: "monde", label: "DOCK MONDE SOU-GMAO", icon: Database, roles: ["ADMIN", "DIRECTION", "RESPONSABLE_MAINTENANCE", "RESPONSABLE_CHANTIER", "VIEWER"] },
        { id: "admin", label: "Configuration Système", icon: Settings, roles: ["ADMIN", "VIEWER"] },
      ]
    }
  ];

  const demoUsers: Record<UserRole, Partial<User>> = {
    ADMIN: { uid: "1", displayName: "Yahya Ouzrirou", email: "yahya@gmail.com", role: "ADMIN", siteId: "TOUS" },
    DIRECTION: { uid: "2", displayName: "Direction Générale", email: "dir@hydromines.com", role: "DIRECTION", siteId: "TOUS" },
    RESPONSABLE_MAINTENANCE: { uid: "3", displayName: "Yassine Boudaoud", email: "yassine@hydromines.com", role: "RESPONSABLE_MAINTENANCE", siteId: "SMI" },
    RESPONSABLE_CHANTIER: { uid: "4", displayName: "M. Benali", email: "benali@hydromines.com", role: "RESPONSABLE_CHANTIER", siteId: "OUMEJRANE" },
    MECANICIEN: { uid: "5", displayName: "Maarouf Said", email: "maarouf@hydromines.com", role: "MECANICIEN", siteId: "SMI" },
    SECRETAIRE: { uid: "6", displayName: "Ouacha Mohamed", email: "ouacha@hydromines.com", role: "SECRETAIRE", siteId: "SMI" },
    VIEWER: { uid: "7", displayName: "HYDROMINES VIEWER", email: "viewer@hydromines.com", role: "VIEWER", siteId: "SMI" },
  };

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

  return (
    <div className={cn(
      "relative flex flex-col h-screen border-r bg-card transition-all duration-300 shrink-0 select-none",
      isCollapsed ? "w-16" : "w-60",
      user?.role === "ADMIN" && activeTab === "inspection" ? "bg-slate-950 border-red-900/30 text-white" : "bg-white dark:bg-[#111726] text-slate-900 dark:text-slate-100 dark:border-slate-850",
      className
    )}>
      {/* HEADER FIXE */}
      <div className={cn(
        "flex items-center justify-between px-3 py-3 border-b shrink-0",
        user?.role === "ADMIN" && activeTab === "inspection" && "border-red-900/20 bg-red-950/10"
      )}>
        {!isCollapsed && (
          <div className="font-sans font-black text-lg tracking-tighter flex items-center gap-1.5 leading-none">
            <span className={user?.role === "ADMIN" && activeTab === "inspection" ? "text-red-500" : "text-hydro"}>HYDRO</span>
            <span className={user?.role === "ADMIN" && activeTab === "inspection" ? "text-slate-400" : "text-mines"}>MINES</span>
            
            {/* Real network state indicator badge */}
            <div className="ml-1.5 flex items-center">
              {isOnline ? (
                <div className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-550" title="Réseau connecté"></span>
                </div>
              ) : (
                <div className="h-2 w-2 rounded-full bg-amber-500" title="Mode Hors-ligne (Stockage local actif)" />
              )}
            </div>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("h-8 w-8 ml-auto hover:bg-slate-100 dark:hover:bg-slate-800", user?.role === "ADMIN" && activeTab === "inspection" && "hover:bg-red-950/30 text-slate-300")}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* COMPACT LOCATION & STATUS */}
      <div className="px-3 py-2.5 border-b shrink-0 bg-slate-50/15 dark:bg-slate-950/20">
        {!isCollapsed && (
           <div className="space-y-2">
              <div className="flex items-center gap-2">
                 {user?.role === "ADMIN" && (
                   <span className="bg-red-600 text-[8.5px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded text-white leading-none">IT ADMIN</span>
                 )}
                 {user?.role === "RESPONSABLE_CHANTIER" && (
                   <span className="text-slate-500 text-[8.5px] font-black uppercase px-1.5 py-0.5 border border-slate-200 dark:border-slate-850 rounded bg-white dark:bg-card leading-none">Lecture seule</span>
                 )}
                 {user?.role === "RESPONSABLE_MAINTENANCE" && (
                   <span className="bg-sky-600 text-[8.5px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded text-white leading-none">MAINT SUP</span>
                 )}
              </div>
              
              <div className="space-y-0.5">
                <p className="text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1">
                  <Flag className="h-2 w-2 text-hydro" /> Localisation
                </p>
                {["ADMIN", "DIRECTION"].includes(user?.role || "") ? (
                  <Select value={activeSite} onValueChange={(v) => setActiveSite(v as SiteID)}>
                    <SelectTrigger className="h-8.5 text-[11px] font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-card hover:bg-slate-50 transition-colors py-1">
                      <SelectValue placeholder="Choisir un site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOUS">Tous les sites</SelectItem>
                      {SITES.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="px-2 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-md">
                     <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase">{user?.siteId}</span>
                  </div>
                )}
              </div>
           </div>
        )}
      </div>

      {/* ZONE SCROLLABLE INTELLIGENTE */}
      <div className="flex-1 scroll-industrial overflow-y-auto px-1 py-2 space-y-2.5">
        <nav className="flex flex-col gap-2.5">
          {navGroups.map((group) => {
            const filteredItems = group.items.filter(item => user && item.roles.includes(user.role));
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-0.5">
                {!isCollapsed && (
                  <h3 className="text-[8px] font-black text-slate-400 dark:text-slate-500 tracking-wider px-2 uppercase opacity-85">
                    {group.title}
                  </h3>
                )}
                <div className="flex flex-col gap-0.5">
                  {filteredItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start gap-2.5 px-2.5 relative group overflow-hidden h-11 w-full text-left transition-all rounded-md touch-manipulation",
                        activeTab === item.id 
                          ? "bg-slate-100 dark:bg-slate-900 font-bold text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-800 shadow-sm" 
                          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-950/40",
                        user?.role === "ADMIN" && activeTab === "inspection" && item.id === "inspection" && "bg-red-750 text-white border-none hover:bg-red-700 hover:text-white"
                      )}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon className={cn(
                        "h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105",
                        activeTab === item.id && !item.color ? "text-hydro" : "",
                        item.color || ""
                      )} />
                      {!isCollapsed && <span className="text-[10px] font-black tracking-tight uppercase">{item.label}</span>}
                      {activeTab === item.id && !isCollapsed && (
                        <motion.div 
                          layoutId="activeSideIndicator"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          className="absolute right-0 top-0 bottom-0 w-1 bg-hydro rounded-l-full" 
                        />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* FOOTER FIXE */}
      <div className="p-2.5 border-t shrink-0 bg-slate-50/5 dark:bg-slate-950/20 dark:border-slate-800 mt-auto space-y-2">
        {/* Modern Theme Toggler */}
        <div className={cn("flex", isCollapsed ? "justify-center" : "px-0.5")}>
          <Button 
            variant="outline" 
            size={isCollapsed ? "icon" : "sm"} 
            className={cn(
              "w-full text-left justify-start gap-2 text-[8px] font-black uppercase tracking-widest h-8 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800",
              isCollapsed && "justify-center"
            )}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? <Moon className="h-3.5 w-3.5 text-slate-500" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
            {!isCollapsed && (
              <span>MODE {theme === 'light' ? 'SOMBRE' : 'CLAIR'}</span>
            )}
          </Button>
        </div>

        <div className={cn(
          "flex items-center gap-2",
          isCollapsed ? "justify-center" : "px-0.5"
        )}>
          <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
            <AvatarFallback className="bg-slate-105 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[9px] font-black">
              {user?.displayName?.split(" ").map(n => n[0]).join("") || "HM"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col flex-1 overflow-hidden leading-tight">
              <span className="text-[10px] font-black truncate text-slate-900 dark:text-slate-100">{user?.displayName}</span>
              <span className="text-[7.5px] text-muted-foreground uppercase font-black tracking-widest truncate">{user?.role?.replace(/_/g, ' ')}</span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-[8px] font-black uppercase tracking-widest h-8 border-slate-200 dark:border-slate-800 hover:text-red-650 dark:text-slate-300 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={() => logout()}
          >
            <LogOut className="h-3 w-3 mr-1" />
            Déconnexion
          </Button>
        )}
      </div>
    </div>
  );
}
