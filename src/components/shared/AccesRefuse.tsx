import * as React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccesRefuseProps {
  onRedirect: () => void;
  message?: string;
  allowedRoles?: string[];
  userRole?: string;
}

export function AccesRefuse({ onRedirect, message, allowedRoles, userRole }: AccesRefuseProps) {
  const [countdown, setCountdown] = React.useState(7);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRedirect]);

  return (
    <div className="flex-1 min-h-[70vh] flex flex-col justify-center items-center p-6 bg-white dark:bg-[#070b13] transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1220] border border-rose-100 dark:border-rose-950/40 rounded-3xl p-8 shadow-xl dark:shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-red-500 via-rose-500 to-red-600" />

        <div className="inline-flex h-16 w-16 items-center justify-center bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 rounded-2xl animate-pulse">
          <ShieldAlert className="h-9 w-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-900 dark:text-white font-sans italic">
            Accès Non Autorisé
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            {message || "Vous ne disposez pas des habilitations requises pour accéder à ce module sécurisé d'Hydromines."}
          </p>
        </div>

        {(userRole || allowedRoles) && (
          <div className="bg-slate-50 dark:bg-[#05090e] border border-slate-150 dark:border-slate-850/50 rounded-2xl p-4 text-left space-y-2 text-[11px] font-mono">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-900 pb-1.5">
              <span className="text-slate-400 font-bold uppercase text-[9px]">Votre rôle actuel</span>
              <span className="text-rose-600 dark:text-rose-400 font-black uppercase">{userRole || "Non défini"}</span>
            </div>
            {allowedRoles && (
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Accès réservé aux rôles</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-tight truncate max-w-[200px]">
                  {allowedRoles.join(", ")}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <Button
            onClick={onRedirect}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-[#0c1220] font-black rounded-xl text-xs uppercase tracking-wider transition-all border-none flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à l'accueil</span>
          </Button>

          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
            Redirection automatique dans {countdown} secondes...
          </p>
        </div>
      </div>
    </div>
  );
}
