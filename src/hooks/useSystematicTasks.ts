import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { dbService } from "@/services/firestoreService";
import { SiteID } from "@/types";
import { toast } from "sonner";

export interface SystematicTaskItem {
  id: string;
  label: string;
  category: string;
  done: boolean;
  doneAt?: string;
  doneBy?: string;
  comment?: string;
  
  // Validation
  validated?: boolean;
  validatedBy?: string;
  validatedAt?: string;
  validationComment?: string;
}

export interface SystematicTaskConfigItem {
  id: string;
  label: string;
  category: string;
  active: boolean;
  ordre: number;
}

export interface SystematicTaskConfig {
  id: string; // siteId_poste
  siteId: string;
  poste: string;
  tasks: SystematicTaskConfigItem[];
  updatedBy?: string;
  updatedAt?: string;
}

export interface SystematicTaskSheet {
  id: string; // date_mecanicienId_poste
  date: string;
  mecanicienId: string;
  mecanicienNom: string;
  siteId: SiteID;
  poste: string;
  tasks: SystematicTaskItem[];
  status: "NON_FAIT" | "PARTIEL" | "COMPLET" | "VALIDÉ";
  photo?: string;
  alertSent?: boolean;
  alertSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_TASKS_CONFIG: SystematicTaskConfigItem[] = [
  { id: "t1", label: "Checklist visuelle des engins (niveaux, fuites, état)", category: "VISUEL", active: true, ordre: 1 },
  { id: "t2", label: "Soufflage du filtre à air des engins actifs", category: "FILTRATION", active: true, ordre: 2 },
  { id: "t3", label: "Détection des fuites (hydraulique, gasoil, air comprimé)", category: "FUITE", active: true, ordre: 3 },
  { id: "t4", label: "Graissage des points de pivot et articulations", category: "GRAISSAGE", active: true, ordre: 4 },
  { id: "t5", label: "Vérification des niveaux d'huile moteur et hydraulique", category: "NIVEAUX", active: true, ordre: 5 },
  { id: "t6", label: "Nettoyage des radiateurs et grilles de refroidissement", category: "REFROIDISSEMENT", active: true, ordre: 6 },
  { id: "t7", label: "Contrôle des pneus (pression, usure, coupures)", category: "PNEUMATIQUES", active: true, ordre: 7 }
];

export function useSystematicTasks() {
  const [configs, setConfigs] = useState<SystematicTaskConfig[]>([]);
  const [sheets, setSheets] = useState<SystematicTaskSheet[]>([]);
  const [loading, setLoading] = useState(true);

  // Load configs
  useEffect(() => {
    const q = query(collection(db, "systematicTaskConfigs"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: SystematicTaskConfig[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as SystematicTaskConfig);
      });
      setConfigs(list);
    }, (err) => {
      console.error("Error fetching configs:", err);
    });
    return () => unsubscribe();
  }, []);

  // Load active sheets
  useEffect(() => {
    const q = query(collection(db, "systematicTasks"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: SystematicTaskSheet[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as SystematicTaskSheet);
      });
      setSheets(list);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching systematic tasks sheets:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch or create systematic task config for a specific site/poste
  const getOrCreateConfig = useCallback(async (siteId: string, poste: string): Promise<SystematicTaskConfig> => {
    const configId = `${siteId}_${poste.replace(/\s+/g, "")}`;
    const docRef = doc(db, "systematicTaskConfigs", configId);
    
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as SystematicTaskConfig;
      } else {
        // Create initial config using default tasks
        const newConfig: SystematicTaskConfig = {
          id: configId,
          siteId,
          poste,
          tasks: DEFAULT_TASKS_CONFIG,
          updatedAt: new Date().toISOString(),
          updatedBy: "System"
        };
        await dbService.systematicTaskConfigs.set(configId, newConfig);
        return newConfig;
      }
    } catch (err) {
      console.error("Error in getOrCreateConfig:", err);
      // fallback
      return {
        id: configId,
        siteId,
        poste,
        tasks: DEFAULT_TASKS_CONFIG
      };
    }
  }, []);

  // Save/Update config
  const saveConfig = useCallback(async (siteId: string, poste: string, tasks: SystematicTaskConfigItem[], userNom: string) => {
    const configId = `${siteId}_${poste.replace(/\s+/g, "")}`;
    try {
      await dbService.systematicTaskConfigs.set(configId, {
        id: configId,
        siteId,
        poste,
        tasks,
        updatedAt: new Date().toISOString(),
        updatedBy: userNom
      });
      toast.success("Configuration des tâches enregistrée avec succès !");
    } catch (err) {
      console.error("Error saving config:", err);
      toast.error("Erreur lors de l'enregistrement de la configuration.");
    }
  }, []);

  // Start or get daily sheet for a mechanic
  const getOrCreateDailySheet = useCallback(async (
    date: string,
    mecanicienId: string,
    mecanicienNom: string,
    siteId: SiteID,
    poste: string
  ): Promise<SystematicTaskSheet> => {
    const sheetId = `${date}_${mecanicienId}_${poste.replace(/\s+/g, "")}`;
    const docRef = doc(db, "systematicTasks", sheetId);
    
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as SystematicTaskSheet;
      } else {
        // Fetch config for this site and poste
        const activeConfig = await getOrCreateConfig(siteId, poste);
        const activeTasks = activeConfig.tasks
          .filter(t => t.active)
          .sort((a, b) => a.ordre - b.ordre)
          .map(t => ({
            id: t.id,
            label: t.label,
            category: t.category,
            done: false,
            comment: ""
          }));

        const newSheet: SystematicTaskSheet = {
          id: sheetId,
          date,
          mecanicienId,
          mecanicienNom,
          siteId,
          poste,
          tasks: activeTasks,
          status: "NON_FAIT",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await dbService.systematicTasks.set(sheetId, newSheet);
        return newSheet;
      }
    } catch (err) {
      console.error("Error starting daily systematic sheet:", err);
      throw err;
    }
  }, [getOrCreateConfig]);

  // Update sheet progress (mechanic checking off tasks)
  const saveSheetProgress = useCallback(async (
    sheetId: string,
    tasks: SystematicTaskItem[],
    photo: string | undefined,
    finished: boolean
  ) => {
    // Determine overall status
    const allDone = tasks.every(t => t.done);
    const anyDone = tasks.some(t => t.done);
    let status: SystematicTaskSheet["status"] = "NON_FAIT";
    if (finished) {
      status = allDone ? "COMPLET" : "PARTIEL";
    } else if (anyDone) {
      status = "PARTIEL";
    }

    try {
      const updateData: Partial<SystematicTaskSheet> = {
        tasks,
        status,
        updatedAt: new Date().toISOString()
      };
      if (photo !== undefined) {
        updateData.photo = photo;
      }
      await dbService.systematicTasks.update(sheetId, updateData);
      toast.success(finished ? "Tournée enregistrée et finalisée !" : "Progression enregistrée avec succès !");
    } catch (err) {
      console.error("Error saving progress:", err);
      toast.error("Erreur lors de la sauvegarde de la progression.");
    }
  }, []);

  // Secretary validation
  const validateSheet = useCallback(async (
    sheetId: string,
    validatedTasks: SystematicTaskItem[],
    secretaryNom: string
  ) => {
    // Check if any validated task is marked with validated=false
    // Every task must be evaluated. If all validated are true => STATUS is VALIDÉ.
    // If any is false => STATUS is PARTIEL (since some tasks were rejected or failed validation).
    const allValidatedYes = validatedTasks.every(t => t.validated === true);
    const updatedStatus: SystematicTaskSheet["status"] = allValidatedYes ? "VALIDÉ" : "PARTIEL";

    // Also check for mandatory comments on non-validations (handled in UI, but good to double check)
    try {
      await dbService.systematicTasks.update(sheetId, {
        tasks: validatedTasks,
        status: updatedStatus,
        updatedAt: new Date().toISOString()
      });

      // If there are unvalidated tasks (marked validated: false), we should log alerts or trigger them
      const failedTasks = validatedTasks.filter(t => t.validated === false);
      if (failedTasks.length > 0) {
        // Trigger alerts
        for (const ft of failedTasks) {
          const alertId = `syst_${sheetId}_${ft.id}`;
          await dbService.alerts.create(alertId, {
            id: alertId,
            type: "MAJEUR",
            titre: `Tâche non validée : ${ft.label}`,
            description: `Le secrétaire ${secretaryNom} a refusé la validation. Commentaire : ${ft.validationComment || "Aucun"}`,
            site: "SMI", // Default fallback, but we should lookup actual site
            mecanicienNom: secretaryNom, // reporter or related
            date: new Date().toISOString(),
            status: "OUVERT",
            createdAt: new Date().toISOString()
          });
        }
        toast.warning(`Validation enregistrée. ${failedTasks.length} alerte(s) générée(s) pour tâches refusées.`);
      } else {
        toast.success("Tournée validée avec succès !");
      }
    } catch (err) {
      console.error("Error validating sheet:", err);
      toast.error("Erreur lors de la validation de la tournée.");
    }
  }, []);

  return {
    configs,
    sheets,
    loading,
    getOrCreateConfig,
    saveConfig,
    getOrCreateDailySheet,
    saveSheetProgress,
    validateSheet
  };
}
