import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "@/lib/store";
import { ShieldAlert, Check, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RestrictedActionModal() {
  const { isRestrictedModalOpen, closeRestrictedModal } = useAuthStore();

  React.useEffect(() => {
    if (isRestrictedModalOpen) {
      try {
        // Soft tactile feedback for rugged Android tablets
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([40, 30, 40]);
        }
      } catch (e) {
        // Silently catch if not supported
      }
    }
  }, [isRestrictedModalOpen]);

  return (
    <AnimatePresence>
      {isRestrictedModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Blur Glass backdrop effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeRestrictedModal}
            className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md"
          />

          {/* Premium Dialog Structure */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white/95 dark:bg-[#121929]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-center select-none"
          >
            {/* Elegant warning icon header */}
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900/30 flex items-center justify-center mb-4">
              <ShieldAlert className="h-6 w-6 text-red-650" />
            </div>

            {/* Title with distinctive corporate color scheme */}
            <h3 className="text-xl font-black tracking-tight uppercase leading-none mb-3">
              <span className="text-[#4A90D9]">HYDRO</span>
              <span className="text-red-600 dark:text-[#ff5252]">MINES</span>
            </h3>

            <p className="text-xs font-mono font-black text-red-650 dark:text-red-400 tracking-wider uppercase mb-4">
              CONTROLE D’ACCÈS STRATÉGIQUE
            </p>

            {/* Informational Message */}
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mb-6 px-2">
              Accès restreint. Le mode Viewer autorise uniquement la consultation des données opérationnelles Hydromines. Veuillez contacter l’administration centrale pour obtenir des privilèges supplémentaires.
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={closeRestrictedModal}
                className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900/50 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Retour
              </Button>
              <Button
                onClick={closeRestrictedModal}
                className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 flex items-center justify-center gap-1.5 active:scale-95 transition-all border-none"
              >
                <Check className="h-4 w-4" />
                Compris
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
