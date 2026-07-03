import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { EnginList } from "@/components/EnginList";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { LoginPage } from "@/components/auth/LoginPage";
import { ReferentielTechnique } from "@/components/ReferentielTechnique";
import Checklists from "@/components/Checklists";
import TachesPlanning from "@/components/TachesPlanning";
import Analyses from "@/components/Analyses";
import { Alertes } from "@/components/Alertes";
import { SystematicTasks } from "@/components/SystematicTasks";
import { ImportConfig } from "@/components/ImportConfig";
import { Mecaniciens } from "@/components/Mecaniciens";
import { Pneumatiques } from "@/components/Pneumatiques";
import { startViewerTrackingSession, trackViewerPageTransition } from "@/services/viewerTracking";

function IndustrialSkeleton() {
  return (
    <div className="flex-1 p-8 space-y-6 bg-[#0b0f19] text-slate-400 min-h-screen flex flex-col justify-center items-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-10 w-10 rounded-full border-4 border-slate-800 border-t-sky-500 animate-spin" />
        <p className="text-xs uppercase tracking-wider font-mono text-slate-450 font-bold animate-pulse">
          Sécurisation & Synchronisation du module • Hydromines GMAO
        </p>
      </div>
    </div>
  );
}

import { Admin } from "@/components/Admin";
import { getDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { ShieldAlert, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function AwaitingApprovalScreen() {
  const { user, setUser, logout, theme } = useAuthStore();
  const [checking, setChecking] = React.useState(false);

  const handleCheckStatus = async () => {
    if (!user) return;
    setChecking(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.active !== false) {
          const updatedUser = { 
            ...user, 
            active: true,
            role: data.role || user.role,
            siteId: data.siteId || user.siteId,
            displayName: data.displayName || user.displayName
          };
          setUser(updatedUser);
          toast.success("Habilitation approuvée ! Accès accordé à SOU-GMAO.");
        } else {
          toast.info("Votre demande est toujours en attente d'approbation.");
        }
      } else {
        toast.error("Votre profil n'a pas été trouvé dans le registre de la mine.");
      }
    } catch (err: any) {
      console.error("Status verify error:", err);
      toast.error("Impossible de joindre le serveur d'habilitation central.");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase auth signout failure:", e);
    }
    logout();
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-805 dark:bg-[#070b13] dark:text-white flex flex-col justify-center items-center overflow-x-hidden font-sans select-none p-6 transition-colors duration-500">
      
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-full px-3.5 py-1 text-[10px] font-mono shadow-sm">
        <span className="h-2 w-2 rounded-full bg-amber-500 animate-[bounce_1s_infinite]" />
        <span className="text-amber-600 dark:text-amber-405 font-extrabold uppercase">ACCÈS RESTREINT</span>
      </div>

      <div className="w-full max-w-[450px] bg-white dark:bg-[#0c1220]/80 backdrop-blur-xl border border-rose-500/25 dark:border-amber-500/35 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl relative text-center space-y-6">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

        <div className="inline-flex h-12 w-12 items-center justify-center bg-amber-520/10 border border-amber-500/20 text-amber-500 dark:text-amber-405 rounded-xl mb-2 animate-pulse">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white italic">
            Contrôle d'Habilitation Requis
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Votre fiche d'agent a été enregistrée. L'accès à la GMAO souterraine d'Hydromines est suspendu jusqu'à validation de vos privilèges par la Direction.
          </p>
        </div>

        {/* User Card Metadata */}
        <div className="bg-slate-50 dark:bg-[#05090e] border border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-left space-y-2.5 text-xs">
          <div className="border-b border-slate-200 dark:border-slate-900 pb-2 flex justify-between">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Agent de mine</span>
            <span className="text-slate-800 dark:text-slate-200 font-extrabold">{user?.displayName}</span>
          </div>
          <div className="border-b border-slate-200 dark:border-slate-900 pb-2 flex justify-between">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Email de sécurité</span>
            <span className="text-slate-805 dark:text-slate-200 font-mono truncate max-w-[200px]">{user?.email}</span>
          </div>
          <div className="border-b border-slate-200 dark:border-slate-900 pb-2 flex justify-between">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Rôle demandé</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-black uppercase text-[10px]">{user?.role?.replace(/_/g, " ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Site d'affectation</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">{user?.siteId || "SMI"}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full h-12 bg-[#4a90d9] hover:bg-[#3f84df] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-none"
          >
            {checking ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Vérification...</span>
              </>
            ) : (
              <span>VÉRIFIER LE STATUT LIVE</span>
            )}
          </Button>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full h-11 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-900/40 rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Se Déconnecter
          </Button>
        </div>

        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">
          SOU-GMAO FAILURE PREVENTION SYSTEM • 2026
        </div>
      </div>
    </div>
  );
}

import { useNotificationStore } from "@/services/notificationStore";
import { OfflineQueueManager } from "@/services/offlineQueueManager";
import { dbService } from "@/services/firestoreService";
import { Bell, Activity, CheckSquare, CheckCheck, Trash2, Moon, Sun } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const { isAuthenticated, user, setUser, theme, setTheme, activeSite } = useAuthStore();

  // Notifications State Management
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [offlineActionCount, setOfflineActionCount] = React.useState(0);
  const { notifications, markAsRead, markAllAsRead, clearAll, addNotification } = useNotificationStore();
  const [networkOnline, setNetworkOnline] = React.useState(navigator.onLine);

  // Memoized offline queue synchronizer
  const syncOfflineQueue = React.useCallback(async () => {
    if (!navigator.onLine) return;
    const pending = OfflineQueueManager.getPending();
    if (pending.length === 0) return;

    let successCount = 0;
    let failCount = 0;

    for (const tx of pending) {
      try {
        await dbService.offlineQueue.replayAction(tx);
        OfflineQueueManager.updateStatus(tx.id, 'REPLAYED');
        successCount++;
      } catch (err: any) {
        console.error("Erreur replay action offline:", err);
        OfflineQueueManager.updateStatus(tx.id, 'FAILED', err.message || String(err));
        failCount++;
      }
    }

    OfflineQueueManager.clearReplayed();

    if (successCount > 0 && failCount === 0) {
      toast.success(`[Mode Hors-ligne] Synchronisation réussie : ${successCount} actions synchronisées avec la base centrale.`);
    } else if (successCount > 0 && failCount > 0) {
      toast.warning(`[Mode Hors-ligne] Synchronisation partielle : ${successCount} réussies, ${failCount} échecs.`);
    } else if (failCount > 0) {
      toast.error(`[Mode Hors-ligne] Échec de synchronisation : ${failCount} actions en erreur.`);
    }

    try {
      const queue = OfflineQueueManager.getQueue();
      setOfflineActionCount(queue.length);
    } catch {}
  }, []);

  React.useEffect(() => {
    // Synchronize HTML theme class
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Network heartbeat and offline queue monitoring
  React.useEffect(() => {
    const handleOnline = () => {
      setNetworkOnline(true);
      addNotification({
        type: 'INFORMATION',
        title: 'CONNEXION RÉSEAU RÉTABLIE',
        message: 'L\'interface a ré-établi le contact avec le node central GMAO sous terre.',
        triggerSource: 'OFFLINE_MONITOR',
        siteId: activeSite
      });
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setNetworkOnline(false);
      addNotification({
        type: 'AVERTISSEMENT',
        title: 'MODE DEGRADÉ SECTEUR ACCIDÉ',
        message: 'Déconnexion réseau détectée. Vos fiches et BT seront mis en cache résilient localement.',
        triggerSource: 'OFFLINE_MONITOR',
        siteId: activeSite
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(() => {
      try {
        const queue = OfflineQueueManager.getQueue();
        setOfflineActionCount(queue.length);
      } catch {
        setOfflineActionCount(0);
      }
    }, 2500);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [activeSite, syncOfflineQueue]);

  // Trigger sync on mount (if online) and configure periodic 15s check
  React.useEffect(() => {
    if (navigator.onLine) {
      syncOfflineQueue();
    }

    const interval = setInterval(() => {
      if (navigator.onLine) {
        const pending = OfflineQueueManager.getPending();
        if (pending.length > 0) {
          syncOfflineQueue();
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [syncOfflineQueue]);

  // Prevent Privilege Escalation - Silent real-time revalidation
  React.useEffect(() => {
    if (isAuthenticated && user && user.role !== "VIEWER" && navigator.onLine) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          const synchronized = {
            ...user,
            active: data.active !== false,
            role: data.role || user.role,
            siteId: data.siteId || user.siteId,
            displayName: data.displayName || user.displayName
          };
          
          // Overwrite local memory session instantly
          setUser(synchronized);
        }
      }).catch(err => {
        console.warn("Silent session revalidation deferred:", err);
      });
    }
  }, [isAuthenticated]);

  // Viewer Telemetry Session Hooks
  React.useEffect(() => {
    if (user?.role === "VIEWER") {
      const stopSession = startViewerTrackingSession(activeTab);
      return () => {
        if (stopSession) stopSession();
      };
    }
  }, [user]);

  React.useEffect(() => {
    if (user?.role === "VIEWER") {
      trackViewerPageTransition(activeTab);
    }
  }, [activeTab, user]);

  const unreadCount = React.useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Dynamic header titles
  const getTabTitle = () => {
    switch(activeTab) {
      case "dashboard": return "Supervision Flotte";
      case "alertes": return "Alertes & Vigilance Métier";
      case "engins": return "Gestion du Parc";
      case "admin": return "Privilèges & Droits";
      case "referentiel": return "Référentiel Technique";
      case "checklists": return "Fiches de Contrôle";
      case "taches_planning": return "Planning des Tâches";
      case "analyses": return "Analyses & KPI";
      case "systematique": return "Tâches Systématiques";
      case "import_config": return "Import & Paramètres";
      default: return "Hydromines GMAO";
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster position="top-right" />
      </>
    );
  }

  // Intercept and load approval block for unapproved accounts
  if (user && user.active === false) {
    return (
      <>
        <AwaitingApprovalScreen />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-sans relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        {/* Centered Master Branding Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-6 border-gray-100 shrink-0 relative">
          <div className="flex items-center gap-4">
            <h1 className="text-xs font-black uppercase tracking-widest text-[#0F172A] font-sans">
              {getTabTitle()}
            </h1>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#00BFFF] bg-sky-50 border border-sky-100">
                Site: {activeSite === 'TOUS' ? 'TOUS SITES' : activeSite}
              </span>
              {offlineActionCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 animate-pulse">
                  🔄 Fil d'attente: {offlineActionCount} Actions
                </span>
              )}
            </div>
          </div>

          {/* Centered title simplified */}
          <div className="hidden lg:flex items-center justify-center gap-1.5 absolute left-1/2 -translate-x-1/2 transform text-xs font-black uppercase tracking-widest text-slate-800 font-sans">
            <span>HYDROMINES</span>
            <span className="text-slate-400 font-normal">•</span>
            <span className="text-slate-500 font-medium">GMAO</span>
          </div>

          {/* Connected telemetry widgetry */}
          <div className="flex items-center gap-3">
            {/* Real Network Status Pin */}
            <div className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-mono font-black border uppercase transition-all shadow-xs",
              networkOnline 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                : "bg-rose-50 text-[#9E1A1A] border-rose-100"
            )}>
              <Activity className={cn("h-3.5 w-3.5", networkOnline ? "text-emerald-500 animate-pulse" : "text-[#9E1A1A] animate-bounce")} />
              <span>{networkOnline ? "Réseau OK" : "Hors-ligne"}</span>
            </div>

            {/* Notification trigger bell */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 bg-white text-slate-700 hover:bg-sky-50/50 transition-all cursor-pointer"
              aria-label="Alerts button"
            >
              <Bell className={cn("h-4 w-4", unreadCount > 0 && "animate-bounce text-amber-500")} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#9E1A1A] text-[8px] font-black text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mode Sombre / Clair toggle */}
            <button
              onClick={() => {
                setTheme(theme === 'light' ? 'dark' : 'light');
                toast.success(`Mode ${theme === 'light' ? 'SOMBRE' : 'CLAIR'} activé`);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-100 bg-white text-slate-700 hover:bg-sky-50/50 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-slate-500" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
              )}
            </button>
          </div>
        </header>

        {/* Scrolling content container */}
        <div className="flex-1 overflow-y-auto relative bg-white">
          <div className="relative z-10 w-full h-full p-6">
            <React.Suspense fallback={<IndustrialSkeleton />}>
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "alertes" && <Alertes />}
              {activeTab === "engins" && <EnginList />}
              {activeTab === "import_config" && <ImportConfig />}
              {activeTab === "admin" && <Admin />}
              {activeTab === "referentiel" && <ReferentielTechnique />}
              {activeTab === "checklists" && <Checklists />}
              {activeTab === "taches_planning" && <TachesPlanning />}
              {activeTab === "analyses" && <Analyses />}
              {activeTab === "systematique" && <SystematicTasks />}
              {activeTab === "mecaniciens" && <Mecaniciens />}
              {activeTab === "pneumatiques" && <Pneumatiques />}
              
              {!["dashboard", "alertes", "engins", "referentiel", "admin", "checklists", "taches_planning", "analyses", "systematique", "import_config", "mecaniciens", "pneumatiques"].includes(activeTab) && (
                <div className="flex items-center justify-center h-full text-muted-foreground bg-white dark:bg-slate-900">
                  Module {activeTab} en cours d'implémentation...
                </div>
              )}
            </React.Suspense>
          </div>
        </div>
      </div>

      {/* Notifications Right Slide Drawer */}
      <AnimatePresence>
        {showNotifications && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />

            {/* Panel */}
            <motion.aside 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f18] shadow-2xl flex flex-col"
              id="notification-center-drawer"
            >
              {/* Header */}
              <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Alertes Industrielles</span>
                  {unreadCount > 0 && (
                    <span className="rounded bg-rose-500/10 text-rose-500 px-1.5 py-0.5 text-[9px] font-black">{unreadCount}</span>
                  )}
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-mono uppercase tracking-widest cursor-pointer"
                >
                  Fermer
                </button>
              </div>

              {/* Actions toolbar */}
              {notifications.length > 0 && (
                <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 px-6 py-2 border-b border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-sky-500 hover:text-sky-400 uppercase cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Tout acquitter
                  </button>
                  <button 
                    onClick={clearAll}
                    className="flex items-center gap-1.5 text-[10px] font-bold font-mono text-rose-450 hover:text-rose-450 uppercase cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Vider la liste
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <CheckSquare className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2 animate-bounce" />
                    <p className="text-[10px] font-mono uppercase tracking-widest">Aucune alerte active</p>
                    <p className="text-[9px] text-slate-500 uppercase mt-1">L\'exploitation est sous contrôle</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isCritical = notif.type === 'CRITIQUE';
                    const isMajor = notif.type === 'MAJEUR';
                    const isWarn = notif.type === 'AVERTISSEMENT';
                    
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={cn(
                          "p-3.5 rounded-lg border text-left transition-all relative overflow-hidden group hover:scale-[1.01] duration-150 cursor-pointer",
                          notif.read ? "bg-slate-50/40 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850 opacity-60" : "bg-white dark:bg-slate-900/70 shadow-sm",
                          !notif.read && isCritical && "border-l-4 border-l-rose-500 border-rose-100 dark:border-rose-950/50",
                          !notif.read && isMajor && "border-l-4 border-l-amber-500 border-amber-100 dark:border-amber-950/50",
                          !notif.read && isWarn && "border-l-4 border-l-yellow-400 border-yellow-100 dark:border-yellow-950/50",
                          !notif.read && notif.type === 'INFORMATION' && "border-l-4 border-l-emerald-500 border-emerald-100 dark:border-emerald-950/50"
                        )}
                      >
                        {/* Bullet status */}
                        <div className="flex items-start justify-between gap-2">
                          <span className={cn(
                            "text-[9px] font-mono font-bold tracking-wider uppercase inline-flex items-center gap-1",
                            isCritical && "text-rose-500",
                            isMajor && "text-amber-500",
                            isWarn && "text-yellow-500",
                            notif.type === 'INFORMATION' && "text-emerald-500"
                          )}>
                            {isCritical && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />}
                            {notif.type} • {notif.triggerSource}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <h4 className="text-xs font-black uppercase tracking-wide text-slate-800 dark:text-slate-100 mt-1">
                          {notif.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-sans leading-relaxed">
                          {notif.message}
                        </p>

                        {!notif.read && (
                          <span className="absolute right-2 bottom-2 text-[8px] font-mono text-sky-500 uppercase opacity-0 group-hover:opacity-100 transition-all">
                            Cliquer pour acquitter
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Toaster position="top-right" />
    </div>
  );
}
