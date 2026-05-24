import { Component, ReactNode, ErrorInfo } from "react";
import { AlertCircle, RefreshCw, ShieldAlert } from "lucide-react";
import { ErrorMonitoringService } from "../services/errorMonitoring";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    ErrorMonitoringService.captureError({
      level: 'FATAL',
      message: `React Crash: ${error.message}`,
      stack: error.stack || errorInfo.componentStack || undefined,
      source: 'REACT_ERROR_BOUNDARY'
    });
  }


  handleRestartSystem = () => {
    window.location.reload();
  };

  handleDisasterPurge = () => {
    if (window.confirm("CRITIQUE : Voulez-vous purger complètement le cache SOU-GMAO ? Ceci effacera le cache local, mais réinitialisera l'application pour corriger les freezes d'anciennes tablettes. Les dossiers indispensables sont sauvegardés.")) {
      try {
        // Clear common caches but preserve credential references
        const savedUser = localStorage.getItem('sg_current_user');
        const queueBackup = localStorage.getItem('sg_offline_queue_all_backup');
        
        localStorage.clear();
        
        if (savedUser) localStorage.setItem('sg_current_user', savedUser);
        if (queueBackup) {
          localStorage.setItem('sg_offline_queue_all', queueBackup);
          localStorage.setItem('sg_offline_queue_all_backup', queueBackup);
        }
        
        alert("Purger réussie. Redémarrage du cockpit GMAO...");
        window.location.reload();
      } catch (err) {
        alert("Erreur lors de la purge d'urgence.");
      }
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b13] text-slate-100 flex items-center justify-center p-6 font-sans antialiased">
          <div className="max-w-xl w-full bg-[#0a0f1c] border border-red-500/20 rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Visual warning indicator stripe */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-red-650" />
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-500 shrink-0">
                <ShieldAlert className="h-8 w-8 animate-pulse" />
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#4A90D9] uppercase block">HYDROMINES PROTECTION ENGINE</span>
                <h1 className="text-xl font-black text-white uppercase tracking-tight">RÉTABLISSEMENT DU SYSTÈME SOUTERRAIN</h1>
                <p className="text-xs text-slate-400 leading-relaxed uppercase">
                  Une anomalie d'exécution critique s'est produite lors de l'actualisation dynamique du DOM ou de la liaison de données. Le système de confinement a isolé le processus.
                </p>
              </div>
            </div>

            {/* Error detail */}
            <div className="p-4 bg-[#05080e] border border-slate-900 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 uppercase">
                <HeartCircleWarning className="h-4 w-4 text-rose-500 shrink-0" />
                <span>Régulateur de Collision :</span>
              </div>
              <p className="text-[11px] font-mono text-rose-450 dark:text-rose-400 bg-red-950/20 p-2.5 rounded border border-red-950/40 break-words leading-relaxed select-text">
                {this.state.error?.message || "Erreur de module non répertoriée"}
              </p>
            </div>

            {/* Subsystem health status checklist */}
            <div className="grid grid-cols-2 gap-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <div className="p-3.5 bg-slate-950/30 rounded-lg flex items-center justify-between border border-slate-900/40">
                <span>Réseau Physique</span>
                <span className={navigator.onLine ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                  {navigator.onLine ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <div className="p-3.5 bg-slate-950/30 rounded-lg flex items-center justify-between border border-slate-900/40">
                <span>Mémoire Tampon Cache</span>
                <span className="text-sky-400 font-bold">RÉDUITE</span>
              </div>
            </div>

            {/* Tactical action triggers */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleRestartSystem}
                className="flex-1 h-11 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" /> RECHARGER L'INTERFACE
              </button>
              <button
                onClick={this.handleDisasterPurge}
                className="flex-1 h-11 bg-transparent hover:bg-red-950/10 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <AlertCircle className="h-4 w-4" /> PURGE CACHE & REBOOT
              </button>
            </div>

            <div className="text-[9px] text-center text-slate-650 uppercase font-mono tracking-widest pt-2 border-t border-slate-900/40">
              HYDROMINES SOU-GMAO PRO • LOCKDOWN ACTIVE
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Visual small helper
function HeartCircleWarning({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
