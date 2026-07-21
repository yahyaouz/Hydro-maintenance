import React, { useState, useEffect } from "react";
import { useSystematicTasks, SystematicTaskSheet, SystematicTaskItem } from "@/hooks/useSystematicTasks";
import { User } from "@/types";
import { 
  ClipboardCheck, 
  Calendar, 
  Check, 
  X, 
  AlertTriangle, 
  Eye, 
  User as UserIcon, 
  ShieldCheck, 
  MessageSquare,
  Clock,
  Camera,
  Search,
  CheckCircle,
  FileCheck,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { getLocalDateString } from "@/lib/utils";

interface SystematicTaskValidationProps {
  user: User;
  isPreviewMode?: boolean;
}

export const SystematicTaskValidation: React.FC<SystematicTaskValidationProps> = ({ user, isPreviewMode = false }) => {
  const { sheets, validateSheet, loading } = useSystematicTasks();
  const [selectedDate, setSelectedDate] = useState<string>(
    getLocalDateString()
  );
  const [selectedSite, setSelectedSite] = useState<string>("TOUS");
  const [selectedSheet, setSelectedSheet] = useState<SystematicTaskSheet | null>(null);
  const [validatedTasks, setValidatedTasks] = useState<SystematicTaskItem[]>([]);
  const [savingValidation, setSavingValidation] = useState(false);

  // When selectedSheet changes, initialize the local validation states
  useEffect(() => {
    if (selectedSheet) {
      // Map tasks to ensure validation fields are initialized
      const mapped = (selectedSheet.tasks || []).map(t => ({
        ...t,
        validated: t.validated !== undefined ? t.validated : true, // default to Yes
        validationComment: t.validationComment || "",
        validatedBy: t.validatedBy || user.displayName,
        validatedAt: t.validatedAt || new Date().toISOString()
      }));
      setValidatedTasks(mapped);
    } else {
      setValidatedTasks([]);
    }
  }, [selectedSheet, user.displayName]);

  // Sync selectedSheet with fresh sheets data from hook if active
  useEffect(() => {
    if (selectedSheet) {
      const fresh = sheets.find(s => s.id === selectedSheet.id);
      if (fresh) {
        // If status changed or tasks changed behind the scenes, we can sync
        if (fresh.status !== selectedSheet.status) {
          setSelectedSheet(fresh);
        }
      }
    }
  }, [sheets, selectedSheet]);

  // Filters
  const filteredSheets = sheets.filter(s => {
    const matchDate = s.date === selectedDate;
    const matchSite = selectedSite === "TOUS" || s.siteId === selectedSite;
    // We want to show all sheets for validation, especially ones ready ("COMPLET" or "PARTIEL") or already "VALIDÉ"
    return matchDate && matchSite;
  });

  const handleSelectSheet = (sheet: SystematicTaskSheet) => {
    setSelectedSheet(sheet);
  };

  const handleSetTaskValidation = (taskId: string, isValid: boolean) => {
    setValidatedTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { 
              ...t, 
              validated: isValid, 
              validationComment: isValid ? "" : t.validationComment // Clear comment if validated YES
            }
          : t
      )
    );
  };

  const handleTaskCommentChange = (taskId: string, comment: string) => {
    setValidatedTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, validationComment: comment }
          : t
      )
    );
  };

  const handleSaveValidation = async () => {
    if (!selectedSheet) return;

    // Check mandatory comments on rejections
    const missingComments = validatedTasks.some(t => t.validated === false && !t.validationComment?.trim());
    if (missingComments) {
      toast.error("Veuillez saisir un motif obligatoire pour toutes les tâches refusées.");
      return;
    }

    setSavingValidation(true);
    try {
      await validateSheet(selectedSheet.id, validatedTasks, user.displayName);
      toast.success("Validation enregistrée avec succès !");
      setSelectedSheet(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingValidation(false);
    }
  };

  return (
    <div className="space-y-6" id="validation-systematic-container">
      {isPreviewMode && (
        <div className="bg-amber-500 text-white font-bold p-4 rounded-xl flex items-center gap-3 text-xs shadow-sm" id="validation-preview-banner">
          <Info className="h-4.5 w-4.5 shrink-0 animate-bounce" />
          <span>Mode aperçu (Simulation Rôle) — Lecture seule, aucune modification ou enregistrement de données ne sera effectué.</span>
        </div>
      )}

      {/* Filter and Overview header */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-[#D4AF37]/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="validation-filters-card">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-sky-500" />
            Validation des Tournées Journalières
          </h2>
          <p className="text-xs text-slate-500">
            En tant que secrétaire, examinez les fiches journalières complétées et validez la conformité de chaque tâche.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date des tournées</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              id="validation-date-picker"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Site</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              id="validation-site-selector"
            >
              <option value="TOUS">Tous les sites</option>
              <option value="SMI">SMI</option>
              <option value="OUMEJRANE">Oumejrane</option>
              <option value="KOUDIA">Koudia</option>
              <option value="OUANSIMI">Ouansimi</option>
              <option value="BOU-AZZER">Bou-Azzer</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-100 flex flex-col items-center justify-center space-y-3" id="validation-loader">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Chargement des fiches de tournée...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="validation-dashboard-grid">
          {/* Left panel: List of tourneys */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative overflow-hidden bg-white p-4 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-3">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tournées du jour ({filteredSheets.length})
              </h3>

              {filteredSheets.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Calendar className="h-8 w-8 mx-auto text-slate-300" />
                  <p className="text-sm">Aucune tournée enregistrée pour cette date.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {filteredSheets.map((s) => {
                    const completed = s.tasks.filter(t => t.done).length;
                    const total = s.tasks.length;
                    const isCurrent = selectedSheet?.id === s.id;

                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSelectSheet(s)}
                        className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all flex items-center justify-between gap-4 ${
                          isCurrent 
                            ? "bg-sky-50 border-sky-200 shadow-sm" 
                            : "bg-white border-slate-100 hover:border-slate-300"
                        }`}
                        id={`btn-select-sheet-${s.id}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{s.mecanicienNom}</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 text-slate-500 rounded uppercase">
                              {s.siteId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {s.poste} • {completed}/{total} tâches
                          </p>
                        </div>

                        <div>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            s.status === "VALIDÉ"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : s.status === "COMPLET"
                              ? "bg-sky-50 text-sky-700 border border-sky-200"
                              : s.status === "PARTIEL"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-50 text-slate-500"
                          }`}>
                            {s.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Active validation view */}
          <div className="lg:col-span-7">
            {selectedSheet ? (
              <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-[#D4AF37]/50 shadow-sm space-y-6" id="validation-active-card">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-md font-bold text-slate-800">{selectedSheet.mecanicienNom}</h3>
                      <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded font-semibold uppercase">
                        {selectedSheet.siteId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Ronde du {selectedSheet.date} • {selectedSheet.poste}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      selectedSheet.status === "VALIDÉ"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      Statut : {selectedSheet.status}
                    </span>
                  </div>
                </div>

                {/* Photo attachments */}
                {selectedSheet.photo && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Camera className="h-4 w-4 text-slate-400" />
                      Justificatif Photo Transmis par le Mécanicien
                    </h4>
                    <div className="max-w-md overflow-hidden rounded-lg border border-slate-200">
                      <img 
                        src={selectedSheet.photo} 
                        alt="Photo justificative" 
                        className="w-full h-44 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {/* Tasks Validation Form */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Évaluation des tâches complétées ({validatedTasks.length})
                  </h4>

                  <div className="space-y-4 divide-y divide-slate-100">
                    {validatedTasks.map((t, index) => (
                      <div key={t.id} className={`pt-4 ${index === 0 ? "pt-0" : ""} space-y-3`}>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-700">{t.label}</span>
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                t.done ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                              }`}>
                                {t.done ? "COMPLÉTÉ" : "NON FAIT"}
                              </span>
                            </div>
                            
                            {/* Mechanic comment */}
                            {t.comment && (
                              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                <span className="font-bold not-italic text-slate-600 mr-1">Obs mécano:</span>
                                "{t.comment}"
                              </p>
                            )}
                          </div>

                          {/* Secretary Val Choice buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={isPreviewMode}
                              onClick={() => handleSetTaskValidation(t.id, true)}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all ${
                                t.validated === true
                                  ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                              }`}
                              id={`val-btn-yes-${t.id}`}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Validé (Oui)
                            </button>

                            <button
                              type="button"
                              disabled={isPreviewMode}
                              onClick={() => handleSetTaskValidation(t.id, false)}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-all ${
                                t.validated === false
                                  ? "bg-rose-500 border-rose-500 text-white shadow-sm"
                                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                              }`}
                              id={`val-btn-no-${t.id}`}
                            >
                              <X className="h-3.5 w-3.5" />
                              Refusé (Non)
                            </button>
                          </div>
                        </div>

                        {/* Mandatory reason for rejection */}
                        {t.validated === false && (
                          <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 space-y-2" id={`reject-box-${t.id}`}>
                            <label className="block text-xs font-bold text-rose-700 flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Motif du refus de validation <span className="text-rose-500">* obligatoire</span>
                            </label>
                            <input
                              type="text"
                              disabled={isPreviewMode}
                              value={t.validationComment || ""}
                              onChange={(e) => handleTaskCommentChange(t.id, e.target.value)}
                              placeholder="Indiquez pourquoi cette tâche n'est pas validée..."
                              className="w-full px-3 py-1.5 text-xs bg-white border border-rose-200 rounded-lg text-slate-700 placeholder-rose-300 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                              id={`reject-input-${t.id}`}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer validation save actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedSheet(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
                    id="btn-cancel-val"
                  >
                    Fermer
                  </button>

                  <button
                    type="button"
                    disabled={savingValidation || isPreviewMode}
                    onClick={handleSaveValidation}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                    id="btn-save-val"
                  >
                    <FileCheck className="h-4 w-4" />
                    {savingValidation ? "Enregistrement..." : "Enregistrer la Validation"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-100 text-center text-slate-400 h-full flex flex-col items-center justify-center space-y-3" id="validation-empty-card">
                <ShieldCheck className="h-10 w-10 text-slate-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-500">Aucune fiche sélectionnée</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Sélectionnez une tournée de mécanicien sur le panneau de gauche pour l'analyser et la valider.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
