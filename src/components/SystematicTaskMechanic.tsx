import React, { useState, useEffect } from "react";
import { useSystematicTasks, SystematicTaskSheet, SystematicTaskItem } from "@/hooks/useSystematicTasks";
import { User } from "@/types";
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Save, 
  Camera, 
  Trash2, 
  Check, 
  AlertTriangle,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface SystematicTaskMechanicProps {
  user: User;
}

export const SystematicTaskMechanic: React.FC<SystematicTaskMechanicProps> = ({ user }) => {
  const { getOrCreateDailySheet, saveSheetProgress } = useSystematicTasks();
  const [selectedPoste, setSelectedPoste] = useState<string>("Poste 1");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [sheet, setSheet] = useState<SystematicTaskSheet | null>(null);
  const [localTasks, setLocalTasks] = useState<SystematicTaskItem[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Load or create sheet
  const loadSheet = async () => {
    setLoadingSheet(true);
    try {
      const activeSheet = await getOrCreateDailySheet(
        selectedDate,
        user.uid,
        user.displayName,
        user.siteId,
        selectedPoste
      );
      setSheet(activeSheet);
      setLocalTasks(activeSheet.tasks || []);
      setPhotoUrl(activeSheet.photo || "");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger ou créer la tournée.");
    } finally {
      setLoadingSheet(false);
    }
  };

  useEffect(() => {
    loadSheet();
  }, [selectedDate, selectedPoste]);

  // Handle checking a task
  const handleToggleTask = (taskId: string, checked: boolean) => {
    setLocalTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, done: checked, doneAt: checked ? new Date().toISOString() : undefined, doneBy: checked ? user.displayName : undefined }
          : t
      )
    );
  };

  // Handle comment update
  const handleCommentChange = (taskId: string, comment: string) => {
    setLocalTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, comment } : t))
    );
  };

  // Handle image upload to Firebase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La photo est trop lourde. Limite : 2 Mo.");
      return;
    }

    if (!sheet) {
      toast.error("Impossible d'associer la photo : aucune tournée chargée.");
      return;
    }

    setUploadingPhoto(true);
    const toastId = toast.loading("Téléchargement de la photo...");
    try {
      const storage = getStorage();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const timestamp = Date.now();
      const path = `systematicTasks/${sheet.id}/${timestamp}_${cleanFileName}`;
      
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      setPhotoUrl(url);
      toast.success("Photo chargée avec succès !", { id: toastId });
    } catch (err) {
      console.error("Erreur lors de l'upload de la photo :", err);
      toast.error("Erreur lors de l'envoi de la photo vers Firebase Storage.", { id: toastId });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl("");
    toast.info("Photo supprimée.");
  };

  // Save current progress as draft
  const handleSaveDraft = async () => {
    if (!sheet) return;
    setSavingProgress(true);
    try {
      await saveSheetProgress(sheet.id, localTasks, photoUrl || undefined, false);
      // Reload sheet to get fresh statuses
      await loadSheet();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Finalize tourney
  const handleFinalize = async () => {
    if (!sheet) return;
    const countCompleted = localTasks.filter(t => t.done).length;
    
    if (countCompleted === 0) {
      toast.error("Veuillez cocher au moins une tâche réalisée avant de finaliser.");
      return;
    }

    const confirmCloture = window.confirm(
      `Êtes-vous sûr de vouloir finaliser votre tournée ?\nVous avez complété ${countCompleted}/${localTasks.length} tâches.`
    );
    if (!confirmCloture) return;

    setSavingProgress(true);
    try {
      await saveSheetProgress(sheet.id, localTasks, photoUrl || undefined, true);
      await loadSheet();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  const completedCount = localTasks.filter(t => t.done).length;
  const totalCount = localTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isSheetLocked = sheet?.status === "COMPLET" || sheet?.status === "VALIDÉ";

  return (
    <div className="space-y-6" id="mechanic-systematic-container">
      {/* Filters and controls */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-[#D4AF37]/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="mechanic-filters-card">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-sky-500" />
            Ma Tournée Systématique
          </h2>
          <p className="text-xs text-slate-500">
            Complétez vos tâches systématiques quotidiennes pour votre poste de travail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date de tournée</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              id="mechanic-date-picker"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Poste (Shift)</label>
            <select
              value={selectedPoste}
              onChange={(e) => setSelectedPoste(e.target.value)}
              className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              id="mechanic-poste-selector"
            >
              <option value="Poste 1">Poste 1 (Matin)</option>
              <option value="Poste 2">Poste 2 (Après-midi)</option>
              <option value="Poste 3">Poste 3 (Nuit)</option>
            </select>
          </div>
        </div>
      </div>

      {loadingSheet ? (
        <div className="bg-white p-12 rounded-xl border border-slate-100 flex flex-col items-center justify-center space-y-3" id="mechanic-loader">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-sm text-slate-500">Chargement de la tournée...</p>
        </div>
      ) : sheet ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="mechanic-content-grid">
          {/* Tasks List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-[#D4AF37]/50 shadow-sm space-y-4">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${
                    sheet.status === "VALIDÉ" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : sheet.status === "COMPLET"
                      ? "bg-sky-50 text-sky-700 border border-sky-100"
                      : sheet.status === "PARTIEL"
                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : "bg-slate-50 text-slate-500 border border-slate-100"
                  }`}>
                    {sheet.status === "VALIDÉ" && <CheckCircle className="h-3.5 w-3.5" />}
                    {sheet.status === "COMPLET" && <CheckCircle className="h-3.5 w-3.5" />}
                    {sheet.status === "PARTIEL" && <Clock className="h-3.5 w-3.5" />}
                    {sheet.status === "NON_FAIT" && <AlertCircle className="h-3.5 w-3.5" />}
                    Status: {sheet.status}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">Progression : {completedCount} / {totalCount}</p>
                  <div className="w-40 bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        progressPercent === 100 ? "bg-emerald-500" : "bg-sky-500"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {isSheetLocked && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start gap-2.5 text-xs">
                  <Info className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Tournée Verrouillée.</span> Cette feuille a été validée ou finalisée. Les modifications ne sont plus autorisées pour conserver l'historique réglementaire de sécurité.
                  </div>
                </div>
              )}

              {localTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <AlertTriangle className="h-8 w-8 mx-auto text-amber-500" />
                  <p className="text-sm">Aucune tâche active configurée pour ce site et ce poste.</p>
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-slate-50">
                  {localTasks.map((t) => (
                    <div 
                      key={t.id} 
                      className={`pt-4 first:pt-0 flex flex-col md:flex-row md:items-start gap-4 transition-all ${
                        t.done ? "opacity-100" : "opacity-80"
                      }`}
                      id={`task-row-${t.id}`}
                    >
                      {/* Checkbox trigger */}
                      <button
                        type="button"
                        disabled={isSheetLocked}
                        onClick={() => handleToggleTask(t.id, !t.done)}
                        className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all shrink-0 mt-1 ${
                          t.done 
                            ? "bg-emerald-500 border-emerald-500 text-white" 
                            : "border-slate-300 hover:border-sky-500 bg-white"
                        }`}
                        id={`btn-toggle-task-${t.id}`}
                      >
                        {t.done && <Check className="h-4 w-4 stroke-[3]" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-slate-800">{t.label}</span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full">
                            {t.category}
                          </span>
                        </div>

                        {/* Optional comments input always visible if task is done */}
                        {t.done && (
                          <div className="mt-1.5" id={`comment-area-${t.id}`}>
                            <input
                              type="text"
                              disabled={isSheetLocked}
                              value={t.comment || ""}
                              onChange={(e) => handleCommentChange(t.id, e.target.value)}
                              placeholder="Ajouter une observation ou anomalie constatée (optionnel)..."
                              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 placeholder-slate-400 focus:ring-1 focus:ring-sky-500 focus:bg-white focus:outline-none"
                              id={`input-comment-${t.id}`}
                            />
                          </div>
                        )}

                        {/* Display Secretary feedback if present */}
                        {t.validated !== undefined && (
                          <div className={`mt-2 p-2 rounded-lg text-xs ${
                            t.validated 
                              ? "bg-emerald-50 border border-emerald-100 text-emerald-800" 
                              : "bg-rose-50 border border-rose-100 text-rose-800"
                          }`}>
                            <div className="font-semibold flex items-center gap-1">
                              {t.validated ? (
                                <span className="text-emerald-600">✓ Validé</span>
                              ) : (
                                <span className="text-rose-600">✗ Rejeté</span>
                              )}
                              <span className="text-slate-400 font-normal">
                                par {t.validatedBy || "Secrétaire"}
                              </span>
                            </div>
                            {t.validationComment && (
                              <p className="mt-1 text-slate-600 italic">"{t.validationComment}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar with photo & saving */}
          <div className="space-y-4">
            {/* Photo upload card */}
            <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-4" id="mechanic-photo-card">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Camera className="h-4.5 w-4.5 text-slate-500" />
                Photo Justificative
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uploadez une image de fin de tournée pour prouver la propreté du poste ou l'anomalie détectée.
              </p>

              {uploadingPhoto ? (
                <div className="border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center space-y-3" id="photo-uploading-spinner">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
                  <span className="text-xs text-slate-500">Téléchargement en cours...</span>
                </div>
              ) : photoUrl ? (
                <div className="relative group rounded-lg overflow-hidden border border-slate-200" id="photo-preview-container">
                  <img 
                    src={photoUrl} 
                    alt="Tournée justificatif" 
                    className="w-full h-44 object-cover"
                  />
                  {!isSheetLocked && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white font-medium text-xs gap-1"
                      id="btn-remove-photo"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer la photo
                    </button>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 hover:border-sky-500 rounded-xl p-6 transition-all text-center">
                  <input
                    type="file"
                    accept="image/*"
                    id="systematic-photo-file-input"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isSheetLocked || uploadingPhoto}
                  />
                  <label 
                    htmlFor={isSheetLocked || uploadingPhoto ? undefined : "systematic-photo-file-input"}
                    className={`flex flex-col items-center justify-center cursor-pointer space-y-2 ${isSheetLocked || uploadingPhoto ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="p-3 bg-slate-50 text-slate-500 rounded-full">
                      <Camera className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-sky-600">Parcourir un fichier</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG jusqu'à 2 Mo</span>
                  </label>
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-3" id="mechanic-actions-card">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#38BDF8] via-purple-600 to-[#991B1B]" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actions de tournée</h3>
              
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isSheetLocked || savingProgress}
                  onClick={handleSaveDraft}
                  className="w-full bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all"
                  id="btn-save-draft"
                >
                  <Save className="h-4 w-4 animate-pulse" />
                  {savingProgress ? "Enregistrement..." : "Sauvegarder Brouillon"}
                </button>

                <button
                  type="button"
                  disabled={isSheetLocked || savingProgress}
                  onClick={handleFinalize}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                  id="btn-finalize-sheet"
                >
                  <CheckCircle className="h-4 w-4 animate-pulse" />
                  {savingProgress ? "Enregistrement..." : "Finaliser & Clôturer la Tournée"}
                </button>
              </div>

              {isSheetLocked && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-[11px] text-center font-medium">
                  ✓ Cette tournée est validée ou soumise pour validation !
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-slate-100 text-center text-slate-400" id="mechanic-no-sheet-card">
          <AlertTriangle className="h-10 w-10 mx-auto text-amber-500 mb-3" />
          <p className="text-sm font-semibold">Erreur d'initialisation de la tournée.</p>
        </div>
      )}
    </div>
  );
};
