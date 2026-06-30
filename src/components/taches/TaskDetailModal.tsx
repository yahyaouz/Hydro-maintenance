import React from 'react';
import { X, Camera, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MaintenanceTask } from './types';

interface TaskDetailModalProps {
  task: MaintenanceTask;
  isOpen: boolean;
  onClose: () => void;
  isModeDirecteur: boolean;
  onUpdateTask: (taskId: string, fields: Partial<MaintenanceTask>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  isModeDirecteur,
  onUpdateTask,
  onDeleteTask,
}: TaskDetailModalProps) {
  const [localComment, setLocalComment] = React.useState(task.commentaire || "");
  const [localMotif, setLocalMotif] = React.useState(task.motifReport || "");
  const [localStatus, setLocalStatus] = React.useState(task.statut);

  React.useEffect(() => {
    setLocalComment(task.commentaire || "");
    setLocalMotif(task.motifReport || "");
    setLocalStatus(task.statut);
  }, [task]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const fields: Partial<MaintenanceTask> = {
      commentaire: localComment,
      statut: localStatus,
    };
    if (localStatus === 'REPORTE') {
      fields.motifReport = localMotif;
    }
    await onUpdateTask(task.id, fields);
    onClose();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Limite dépassée : 2 Mo maximum.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await onUpdateTask(task.id, { photo: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    if (confirm('Supprimer cette photo ?')) {
      await onUpdateTask(task.id, { photo: "" });
    }
  };

  const handleValidateByDirector = async () => {
    await onUpdateTask(task.id, { statut: 'VALIDE' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                task.type === 'PREVENTIF' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' :
                task.type === 'CORRECTIF' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}>
                {task.type}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                task.priorite === 'CRITIQUE' ? 'bg-red-500 text-white animate-pulse' :
                task.priorite === 'HAUTE' ? 'bg-amber-500 text-slate-950' :
                'bg-slate-100 text-slate-600'
              }`}>
                {task.priorite}
              </span>
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight">
              🔍 Détails de l'intervention
            </h3>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Description de la fiche</span>
            <p className="text-sm font-black text-slate-900 mt-1">{task.label}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Engin</span>
              <span className="font-bold text-slate-800">{task.enginId} ({task.enginModele})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Intervenant</span>
              <span className="font-bold text-slate-800">{task.mecanicienNom}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Date et Shift</span>
              <span className="font-bold text-slate-800">{task.datePlanifiee} — {task.poste}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Durée estimée</span>
              <span className="font-bold text-slate-800">{task.dureeEstimee}</span>
            </div>
          </div>

          {/* Saisie de Statut */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 block">État d'avancement</label>
            <div className="grid grid-cols-4 gap-2">
              {(['NON_FAIT', 'EN_COURS', 'FAIT', 'REPORTE'] as const).map(status => {
                const label = status === 'NON_FAIT' ? 'À faire' : status === 'EN_COURS' ? 'En cours' : status === 'FAIT' ? 'Réalisé' : 'Reporté';
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setLocalStatus(status)}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                      localStatus === status
                        ? "bg-slate-900 text-white border-slate-950"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saisie de Motif de Report */}
          {localStatus === 'REPORTE' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-150">
              <label className="text-[10px] font-bold uppercase text-rose-500 block">Motif du report obligatoire</label>
              <textarea
                value={localMotif}
                onChange={(e) => setLocalMotif(e.target.value)}
                placeholder="Raison technique, manque de pièce..."
                className="w-full h-16 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-950 font-medium"
              />
            </div>
          )}

          {/* Commentaire de l'Intervenant */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 block">Commentaires & Pièces Remplacées</label>
            <textarea
              value={localComment}
              onChange={(e) => setLocalComment(e.target.value)}
              placeholder="Saisissez les observations ou références de pièces..."
              className="w-full h-16 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-950 font-medium"
            />
          </div>

          {/* Photo de Preuve d'Exécution */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Photo justificative</span>
            {task.photo ? (
              <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <img
                  src={task.photo}
                  alt="Preuve d'intervention"
                  className="w-full h-32 object-contain"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                  title="Supprimer la photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition-colors">
                <Camera className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-500">Ajouter une photo justificative</span>
                <span className="text-[8px] text-slate-400 mt-0.5">Max 1 photo, 2 Mo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => onDeleteTask(task.id)}
            className="border-rose-200 text-rose-600 bg-white hover:bg-rose-50 text-xs"
          >
            Supprimer
          </Button>

          <div className="flex gap-2">
            {isModeDirecteur && task.statut === "FAIT" && (
              <Button
                onClick={handleValidateByDirector}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1"
              >
                <ShieldCheck className="h-4 w-4" /> Valider Fiche
              </Button>
            )}
            <Button
              onClick={handleSave}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Enregistrer
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="text-xs"
            >
              Annuler
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
