import * as React from 'react';
import { collection, addDoc, doc, updateDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import { useCollection } from '@/hooks/useCollection';
import { useNotificationStore } from '@/services/notificationStore';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Camera, X, Wrench, Zap, Droplets, CircleDot, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignalerPanneProps {
  isOpen: boolean;
  onClose: () => void;
  enginIdPrefill?: string;
  descriptionPrefill?: string;
  gravitePrefill?: "Critique" | "Élevée" | "Moyenne" | "Faible";
}

export function SignalerPanne({ isOpen, onClose, enginIdPrefill, descriptionPrefill, gravitePrefill }: SignalerPanneProps) {
  const { user } = useAuthStore();
  const { data: engins } = useCollection<any>('engins');

  const [enginId, setEnginId] = React.useState('');
  const [categorie, setCategorie] = React.useState<"Mécanique" | "Hydraulique" | "Électrique" | "Pneumatique" | "Transmission" | "Freinage" | "Autre">('Mécanique');
  const [piecesConcernees, setPiecesConcernees] = React.useState<string[]>([]);
  const [newPiece, setNewPiece] = React.useState('');
  const [gravite, setGravite] = React.useState<"Critique" | "Élevée" | "Moyenne" | "Faible">('Moyenne');
  const [arretMachine, setArretMachine] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddPiece = (e: React.MouseEvent) => {
    e.preventDefault();
    if (newPiece.trim()) {
      if (!piecesConcernees.includes(newPiece.trim())) {
        setPiecesConcernees([...piecesConcernees, newPiece.trim()]);
      }
      setNewPiece('');
    }
  };

  const handleRemovePiece = (indexToRemove: number) => {
    setPiecesConcernees(piecesConcernees.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePieceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newPiece.trim()) {
        if (!piecesConcernees.includes(newPiece.trim())) {
          setPiecesConcernees([...piecesConcernees, newPiece.trim()]);
        }
        setNewPiece('');
      }
    }
  };

  // Set prefilled values
  React.useEffect(() => {
    if (enginIdPrefill) {
      setEnginId(enginIdPrefill);
    } else {
      setEnginId('');
    }
    // Reset other fields on open
    if (isOpen) {
      setDescription(descriptionPrefill || '');
      setPhoto(null);
      setArretMachine(false);
      setGravite(gravitePrefill || 'Moyenne');
      setCategorie('Mécanique');
      setPiecesConcernees([]);
      setNewPiece('');
    }
  }, [isOpen, enginIdPrefill, descriptionPrefill, gravitePrefill]);

  // Filter engins by user site
  const filteredEngins = React.useMemo(() => {
    if (!engins) return [];
    if (!user) return [];
    if (user.role === 'ADMIN' || user.role === 'DIRECTION') {
      return engins;
    }
    return engins.filter((e: any) => e.siteId === user.siteId);
  }, [engins, user]);

  // Auto pre-select first engine if there are filtered engins and enginId is not set
  React.useEffect(() => {
    if (filteredEngins.length > 0 && !enginId && !enginIdPrefill) {
      setEnginId(filteredEngins[0].id);
    }
  }, [filteredEngins, enginId, enginIdPrefill]);

  // Handle Photo input (Base64 conversion)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La taille de l'image dépasse la limite de 2 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  async function generateNumeroPanne(): Promise<string> {
    const year = new Date().getFullYear();
    const q = query(
      collection(db, 'pannes'),
      where('numero', '>=', `PAN-${year}-`),
      where('numero', '<', `PAN-${year + 1}-`),
      orderBy('numero', 'desc')
    );
    const snap = await getDocs(q);
    let lastNum = 0;
    if (!snap.empty) {
      const numStr = snap.docs[0].data().numero || "";
      const parts = numStr.split('-');
      if (parts.length >= 3) {
        const parsed = parseInt(parts[2], 10);
        if (!isNaN(parsed)) {
          lastNum = parsed;
        }
      }
    }
    return `PAN-${year}-${String(lastNum + 1).padStart(4, '0')}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vous devez être authentifié.");
      return;
    }
    if (!enginId) {
      toast.error("Veuillez sélectionner un engin.");
      return;
    }
    if (description.length < 10) {
      toast.error("La description doit faire au moins 10 caractères.");
      return;
    }
    if (description.length > 500) {
      toast.error("La description ne doit pas dépasser 500 caractères.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedEngin = engins?.find((e: any) => e.id === enginId);
      const numero = await generateNumeroPanne();

      const newPanne = {
        numero,
        enginId,
        enginModele: selectedEngin?.modele || selectedEngin?.marque || '',
        siteId: selectedEngin?.siteId || user.siteId,
        categorie,
        piecesConcernees,
        gravite,
        statut: 'DECLAREE',
        description,
        photo: photo || null,
        declarePar: user.uid || user.email,
        declareParNom: user.displayName || user.email,
        dateDeclaration: new Date().toISOString(),
        arretMachine,
        deleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'pannes'), newPanne);

      // Si arrêt machine : mettre à jour l'état de l'engin
      if (arretMachine) {
        await updateDoc(doc(db, 'engins', enginId), {
          etat: 'En maintenance',
          statut: 'panne',
          status: 'EN_PANNE',
          dispo: 0,
          updatedAt: Timestamp.now()
        });
      }

      // Créer la notification pour le responsable du site
      useNotificationStore.getState().addNotification({
        type: gravite === 'Critique' ? 'CRITIQUE' : gravite === 'Élevée' ? 'MAJEUR' : 'AVERTISSEMENT',
        title: `NOUVELLE PANNE • ${selectedEngin?.id || enginId}`,
        message: `${categorie} — ${description.substring(0, 80)}${description.length > 80 ? '...' : ''}`,
        triggerSource: 'PANNE_TERRAIN',
        siteId: selectedEngin?.siteId || user.siteId
      });

      toast.success(`Panne ${numero} signalée avec succès.`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du signalement de la panne.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { name: 'Mécanique', icon: Wrench, color: 'text-blue-500' },
    { name: 'Hydraulique', icon: Droplets, color: 'text-indigo-500' },
    { name: 'Électrique', icon: Zap, color: 'text-yellow-500' },
    { name: 'Pneumatique', icon: CircleDot, color: 'text-emerald-500' },
    { name: 'Transmission', icon: Settings, color: 'text-purple-500' },
    { name: 'Freinage', icon: AlertTriangle, color: 'text-red-500' },
    { name: 'Autre', icon: CircleDot, color: 'text-slate-500' },
  ] as const;

  const gravites = [
    { name: 'Critique', desc: 'Arrêt total nécessaire', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100', activeBg: 'bg-red-600 text-white' },
    { name: 'Élevée', desc: 'Fonctionnement dégradé', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100', activeBg: 'bg-orange-500 text-white' },
    { name: 'Moyenne', desc: 'À traiter sous 48h', color: 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100', activeBg: 'bg-yellow-500 text-black' },
    { name: 'Faible', desc: 'Surveillance', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100', activeBg: 'bg-blue-600 text-white' },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 stroke-[2.2] text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider">Signaler une Panne Terrain</h2>
                  <p className="text-[11px] text-red-100 font-bold uppercase tracking-widest">Workflow Correctif Hydromines</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-black/15 hover:bg-black/25 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* 1. Sélection Engin */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#b8860b]">
                  1. Équipement concerné *
                </label>
                <select
                  disabled={!!enginIdPrefill}
                  value={enginId}
                  onChange={(e) => setEnginId(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Sélectionner un engin...</option>
                  {filteredEngins.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      [{e.id}] — {e.marque || ''} {e.modele || e.type} ({e.siteId})
                    </option>
                  ))}
                </select>
                {enginIdPrefill && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Engin pré-sélectionné</p>
                )}
              </div>

              {/* 2. Catégorie */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#b8860b]">
                  2. Catégorie d'organe *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => {
                    const IconComponent = cat.icon;
                    const isSelected = categorie === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setCategorie(cat.name)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-rose-500 bg-rose-50 text-rose-700 font-extrabold ring-1 ring-rose-500'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-655'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 mb-1.5 ${isSelected ? 'text-rose-600' : cat.color}`} />
                        <span className="text-[10.5px] uppercase tracking-wider">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Gravité */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#b8860b]">
                  3. Gravité de l'alerte *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {gravites.map((grav) => {
                    const isSelected = gravite === grav.name;
                    return (
                      <button
                        key={grav.name}
                        type="button"
                        onClick={() => setGravite(grav.name)}
                        className={`p-3 rounded-xl border flex flex-col items-start transition-all text-left ${
                          isSelected
                            ? `${grav.activeBg} ring-1 ring-offset-1 ring-slate-800`
                            : `${grav.color}`
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider">{grav.name}</span>
                        <span className="text-[10px] opacity-90 font-medium">{grav.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Toggle Arrêt Machine */}
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
                    <span className="text-xs font-black uppercase text-red-900 tracking-wider">Arrêt machine immédiat</span>
                  </div>
                  <p className="text-[10px] text-red-700 font-medium">Cochez si l'engin est immobilisé au fond et inutilisable.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={arretMachine}
                    onChange={(e) => setArretMachine(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* 5. Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#b8860b]">
                  5. Description détaillée des symptômes *
                </label>
                <textarea
                  required
                  minLength={10}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez précisément l'anomalie rencontrée (Ex: Bruit suspect au niveau du pont avant lors des braquages, baisse de puissance hydraulique...)"
                  className="w-full h-24 p-3 border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <div className="flex justify-between text-[9px] font-bold uppercase text-slate-400 font-mono">
                  <span>Min. 10 / Max. 500 caractères</span>
                  <span className={description.length < 10 ? 'text-red-500' : 'text-slate-500'}>
                    {description.length} caractères
                  </span>
                </div>
              </div>

              {/* Pièces Concernées */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#b8860b]">
                  Pièces concernées (optionnel, une par une)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPiece}
                    onChange={(e) => setNewPiece(e.target.value)}
                    onKeyDown={handlePieceKeyDown}
                    placeholder="Saisissez une pièce (Ex: Joint, Vérin, Démarreur...)"
                    className="flex-1 h-11 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <Button
                    type="button"
                    onClick={handleAddPiece}
                    className="h-11 bg-slate-800 hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs px-4 rounded-lg shrink-0"
                  >
                    Ajouter
                  </Button>
                </div>
                {piecesConcernees.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {piecesConcernees.map((piece, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200"
                      >
                        {piece}
                        <button
                          type="button"
                          onClick={() => handleRemovePiece(idx)}
                          className="p-0.5 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Photo */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#b8860b] flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-[#b8860b]" /> 6. Photo de l'anomalie (Optionnel)
                </label>
                
                {photo ? (
                  <div className="relative w-40 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                    <img src={photo} alt="Panne" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-amber-500/50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-3 pb-4">
                        <Camera className="h-6 w-6 text-slate-400 mb-1" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ajouter une photo</p>
                        <p className="text-[9px] text-slate-400 font-mono">Max. 2 Mo (PNG/JPG)</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="font-bold text-xs uppercase tracking-wider"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider text-xs px-6"
                >
                  {isSubmitting ? 'Envoi...' : '🚨 Signaler la Panne'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
