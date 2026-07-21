import React, { useState } from "react";
import { User, USER_ROLES } from "@/types";
import { SystematicTaskMechanic } from "./SystematicTaskMechanic";
import { SystematicTaskValidation } from "./SystematicTaskValidation";
import { SystematicTaskOverview } from "./SystematicTaskOverview";
import { ClipboardList, ClipboardCheck, BarChart3, Sliders } from "lucide-react";
import { useAuthStore } from "@/lib/store";

interface SystematicTasksProps {
  // We can pass user optionally, or load from context
}

export const SystematicTasks: React.FC<SystematicTasksProps> = () => {
  const { user } = useAuthStore(); // Retrieve user profile from the global store.
  
  // State to allow ADMIN and RESPONSABLE_MAINTENANCE to switch views for testing / auditing
  const [activeSubTab, setActiveSubTab] = useState<string>("");

  if (!user) {
    return (
      <div className="relative overflow-hidden p-8 text-center text-slate-400 bg-white border border-[#D4AF37]/50 rounded-2xl shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
        Veuillez vous connecter pour accéder aux tâches systématiques.
      </div>
    );
  }

  // Determine initial view based on role
  const isMechanic = user.role === "MECANICIEN";
  const isSecretary = user.role === "SECRETAIRE";
  const isSupervisor = [
    "RESPONSABLE_MAINTENANCE",
    "ADMIN",
    "DIRECTION"
  ].includes(user.role);

  // Set default view if not set
  let currentView = activeSubTab;
  if (!currentView) {
    if (isMechanic) currentView = "mecanicien";
    else if (isSecretary) currentView = "secretaire";
    else currentView = "supervision";
  }

  return (
    <div className="space-y-6" id="systematic-tasks-root">
      {/* Role switching tab for Admins/Supervisors to inspect other screens */}
      {isSupervisor && (
        <div className="relative overflow-hidden bg-white px-5 py-3 rounded-2xl border border-[#D4AF37]/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 no-print" id="role-override-pills">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
          <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
            <Sliders className="h-3.5 w-3.5" />
            Mode d'affichage (Simulateur Rôle) :
          </span>

          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSubTab("mecanicien")}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 ${
                currentView === "mecanicien" 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ClipboardList className="h-3 w-3" />
              Rondier (Mécanicien)
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("secretaire")}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 ${
                currentView === "secretaire" 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ClipboardCheck className="h-3 w-3" />
              Validateur (Secrétaire)
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("supervision")}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all flex items-center gap-1.5 ${
                currentView === "supervision" 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <BarChart3 className="h-3 w-3" />
              Supervision (Responsable)
            </button>
          </div>
        </div>
      )}

      {/* Render selected view */}
      <div id="systematic-subview-wrapper">
        {currentView === "mecanicien" && <SystematicTaskMechanic user={user} isPreviewMode={user.role !== "MECANICIEN"} />}
        {currentView === "secretaire" && <SystematicTaskValidation user={user} isPreviewMode={user.role !== "SECRETAIRE"} />}
        {currentView === "supervision" && <SystematicTaskOverview user={user} />}
      </div>
    </div>
  );
};
