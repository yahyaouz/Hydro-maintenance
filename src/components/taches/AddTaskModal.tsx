import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskType, TaskPriority, Engin, Mecanicien } from './types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  engins: Engin[];
  mecaniciens: Mecanicien[];
  onCreateTask: (taskData: {
    type: TaskType;
    label: string;
    enginId: string;
    mecanicienId: string;
    poste: 'Poste 1' | 'Poste 2' | 'Poste 3';
    datePlanifiee: string;
    dureeEstimee: '15min' | '30min' | '1h' | '2h' | '4h' | '6h' | '1j';
    priorite: TaskPriority;
  }) => Promise<void>;
}

export function AddTaskModal({
  isOpen,
  onClose,
  engins,
  mecaniciens,
  onCreateTask,
}: AddTaskModalProps) {
  const [newType, setNewType] = React.useState<TaskType>("PREVENTIF");
  const [newLabel, setNewLabel] = React.useState("");
  const [newEnginId, setNewEnginId] = React.useState("");
  const [newMecaId, setNewMecaId] = React.useState("");
  const [newPoste, setNewPoste] = React.useState<'Poste 1' | 'Poste 2' | 'Poste 3'>("Poste 1");
  const [newDate, setNewDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [newDuree, setNewDuree] = React.useState<'15min' | '30min' | '1h' | '2h' | '4h' | '6h' | '1j'>("1h");
  const [newPrioriteManual, setNewPrioriteManual] = React.useState<"BASSE" | "NORMALE" | "HAUTE">("NORMALE");

  React.useEffect(() => {
    if (engins.length > 0) setNewEnginId(engins[0].id);
    if (mecaniciens.length > 0) setNewMecaId(mecaniciens[0].id);
  }, [engins, mecaniciens]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!newLabel.trim()) {
      alert("Veuillez saisir la description de la tâche.");
      return;
    }

    let priorite: TaskPriority = "NORMALE";
    if (newType === "QUOTIDIEN") {
      priorite = "QUOTIDIENNE";
    } else if (newType === "CORRECTIF") {
      priorite = newPrioriteManual === "HAUTE" ? "CRITIQUE" : "NORMALE";
    } else {
      priorite = newPrioriteManual === "HAUTE" ? "HAUTE" : "NORMALE";
    }

    await onCreateTask({
      type: newType,
      label: newLabel.trim() + (newType === "CORRECTIF" ? " [CORRECTIF PANNE]" : ""),
      enginId: newEnginId,
      mecanicienId: newMecaId,
      poste: newPoste,
      datePlanifiee: newDate,
      dureeEstimee: newDuree,
      priorite,
    });

    setNewLabel("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-800">
        
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block mb-0.5">
              Planification manuelle
            </span>
            <h3 className="text-sm font-black uppercase tracking-tight">
              ➕ Créer une tâche
            </h3>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          
          {/* Type de tâche */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 block">Type d'entretien</label>
            <div className="grid grid-cols-3 gap-2">
              {(["PREVENTIF", "CORRECTIF", "QUOTIDIEN"] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setNewType(type);
                    if (type === "QUOTIDIEN") {
                      setNewLabel("Graissage pivots");
                    } else if (type === "CORRECTIF") {
                      setNewLabel("Réparation fuite flexible hydraulique");
                    } else {
                      setNewLabel("Vidange préventive");
                    }
                  }}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                    newType === type
                      ? "bg-slate-900 text-white border-slate-950"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {type === "PREVENTIF" ? "🔧 Prév" : type === "CORRECTIF" ? "🚨 Correctif" : "📅 Quotid"}
                </button>
              ))}
            </div>
          </div>

          {/* Description de la tâche */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 block">Description de l'intervention</label>
            <input
              type="text"
              placeholder="Ex: Vidange moteur ou réparation fuite hydraulique..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Engin compatible */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 block">Sélection de l'engin</label>
            <select
              value={newEnginId}
              onChange={(e) => setNewEnginId(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {engins.map(e => (
                <option key={e.id} value={e.id}>{e.id} - {e.modele}</option>
              ))}
            </select>
          </div>

          {/* Affectation mécanicien */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 block">Mécanicien en charge</label>
            <select
              value={newMecaId}
              onChange={(e) => setNewMecaId(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {mecaniciens.map(m => (
                <option key={m.id} value={m.id}>{m.nomComplet}</option>
              ))}
            </select>
          </div>

          {/* Shift et Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 block">Poste / Quart</label>
              <select
                value={newPoste}
                onChange={(e) => setNewPoste(e.target.value as any)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="Poste 1">Poste 1</option>
                <option value="Poste 2">Poste 2</option>
                <option value="Poste 3">Poste 3</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400 block">Date prévue</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Durée estimée d'intervention */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 block font-black">Durée estimée de l'intervention</label>
            <select
              value={newDuree}
              onChange={(e) => setNewDuree(e.target.value as any)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="15min">15 Minutes</option>
              <option value="30min">30 Minutes</option>
              <option value="1h">1 Heure</option>
              <option value="2h">2 Heures</option>
              <option value="4h">4 Heures</option>
              <option value="6h">6 Heures</option>
              <option value="1j">1 Jour complet (8h)</option>
            </select>
          </div>

          {/* Niveau de Priorité de départ */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400 block">Priorité manuelle</label>
            <select
              value={newPrioriteManual}
              onChange={(e) => setNewPrioriteManual(e.target.value as any)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="BASSE">Basse (Simple vérification)</option>
              <option value="NORMALE">Normale (Planification classique)</option>
              <option value="HAUTE">Haute (Cruciale mécanique)</option>
            </select>
          </div>

        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-end gap-2.5">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-600 bg-white hover:bg-slate-100"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 font-black"
          >
            Enregistrer la tâche
          </Button>
        </div>

      </div>
    </div>
  );
}
