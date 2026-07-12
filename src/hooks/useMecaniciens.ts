// Hook useMecaniciens.ts - Phase 2 Refactoring with Dynamic Real-time Stats
import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { getLocalDateString } from "@/lib/utils";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { SiteID, Mecanicien, MecanicienStats, Documents } from "@/types";
export type { Mecanicien, MecanicienStats, Documents };

export const DEFAULT_DOCUMENTS: Documents = {
  contrat: "",
  diplome: "",
  attestationFormation: "",
  caces: ""
};

export const DEFAULT_STATS: MecanicienStats = {
  totalInterventions: 0,
  interventionsCeMois: 0,
  derniereIntervention: "",
  scoreMensuel: null,
  mttrMoyen: null,
  tauxResolutionPremiereFois: null,
  tauxTournéesCompletes: null,
  heuresInterventionCeMois: 0
};

export function useMecaniciens() {
  const [mecaniciensRaw, setMecaniciensRaw] = useState<any[]>([]);
  const [tasksRaw, setTasksRaw] = useState<any[]>([]);
  const [pannesRaw, setPannesRaw] = useState<any[]>([]);
  
  const [loadingMeca, setLoadingMeca] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingPannes, setLoadingPannes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || user.active === false) {
      setLoadingMeca(false);
      setLoadingTasks(false);
      setLoadingPannes(false);
      return;
    }

    // 1. Read from 'mecaniciens' Firestore collection
    const unsubMeca = onSnapshot(collection(db, "mecaniciens"), (snapshot) => {
      setError(null);
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setMecaniciensRaw(list);
      setLoadingMeca(false);
    }, (err) => {
      console.error("Error fetching mecaniciens:", err);
      setError("Erreur de connexion Firestore");
      setLoadingMeca(false);
    });

    // 2. Read from 'maintenanceTasks' Firestore collection
    const unsubTasks = onSnapshot(collection(db, "maintenanceTasks"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setTasksRaw(list);
      setLoadingTasks(false);
    }, (err) => {
      console.error("Error fetching maintenanceTasks:", err);
      setLoadingTasks(false);
    });

    // 3. Read from 'pannes' Firestore collection
    const unsubPannes = onSnapshot(collection(db, "pannes"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPannesRaw(list);
      setLoadingPannes(false);
    }, (err) => {
      console.error("Error fetching pannes:", err);
      setLoadingPannes(false);
    });

    return () => {
      unsubMeca();
      unsubTasks();
      unsubPannes();
    };
  }, [user?.role, user?.uid, user?.active]);

  // Compute stats and mecaniciens list dynamically
  const mecaniciens = useMemo(() => {
    const currentMonthStr = new Date().toISOString().substring(0, 7);

    const getHoursFromDuree = (duree: string): number => {
      if (duree === '15min') return 0.25;
      if (duree === '30min') return 0.5;
      if (duree === '1h') return 1;
      if (duree === '2h') return 2;
      if (duree === '4h') return 4;
      if (duree === '6h') return 6;
      if (duree === '1j') return 8;
      return 0;
    };

    const parseToDate = (field: any): Date | null => {
      if (!field) return null;
      if (field && typeof field === 'object' && field.seconds !== undefined) {
        return new Date(field.seconds * 1000);
      }
      const d = new Date(field);
      return isNaN(d.getTime()) ? null : d;
    };

    return mecaniciensRaw.map((data) => {
      const docUid = data.uid || data.id;

      // Split old full name if present
      let finalNom = data.nom || "";
      let finalPrenom = data.prenom || "";
      if (!finalNom && !finalPrenom && data.nomComplet) {
        const parts = String(data.nomComplet || "").trim().split(/\s+/);
        finalPrenom = parts[0] || "";
        finalNom = parts.slice(1).join(" ") || "";
      }

      // --- CRITÈRE 1: tauxTournéesCompletes ---
      const tasksMeca = tasksRaw.filter(t => 
        t.mecanicienId === data.id && 
        t.datePlanifiee?.startsWith(currentMonthStr) &&
        t.deleted !== true
      );
      const totalTasks = tasksMeca.length;
      const faitesTasks = tasksMeca.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE').length;
      const tauxTournéesCompletes = totalTasks > 0 ? Math.round((faitesTasks / totalTasks) * 100) : null;

      // --- CRITÈRE 2: mttrMoyen ---
      const mecaPannes = pannesRaw.filter(p => 
        (p.mecanicienAssigne === data.id || p.mecanicienAssigne === docUid) &&
        p.statut === 'CLOS' &&
        p.deleted !== true &&
        p.datePriseEnCharge &&
        p.dateResolution
      );

      let mttrMoyen: number | null = null;
      if (mecaPannes.length > 0) {
        let totalRepairHours = 0;
        let validCount = 0;
        mecaPannes.forEach(p => {
          const dPrise = parseToDate(p.datePriseEnCharge);
          const dRes = parseToDate(p.dateResolution);
          if (dPrise && dRes) {
            const diffMs = dRes.getTime() - dPrise.getTime();
            const diffHours = Math.max(0, diffMs / (1000 * 60 * 60)); // in hours
            totalRepairHours += diffHours;
            validCount++;
          }
        });
        if (validCount > 0) {
          mttrMoyen = Math.round((totalRepairHours / validCount) * 10) / 10;
        }
      }

      // --- CRITÈRE 3: tauxResolutionPremiereFois ---
      // Toujours null car aucun champ 'reouverte: boolean' n'existe actuellement pour le tracer proprement.
      const tauxResolutionPremiereFois = null;

      // Dynamic workload & intervention stats
      const mecaTasksAll = tasksRaw.filter(t => t.mecanicienId === data.id && t.deleted !== true);
      const mecaTasksFaitAll = mecaTasksAll.filter(t => t.statut === 'FAIT' || t.statut === 'VALIDE');

      let derniereIntervention = data.stats?.derniereIntervention || "";
      if (mecaTasksFaitAll.length > 0) {
        const sorted = [...mecaTasksFaitAll].sort((a, b) => (b.datePlanifiee || "").localeCompare(a.datePlanifiee || ""));
        derniereIntervention = sorted[0].datePlanifiee || "";
      }

      const totalInterventions = mecaTasksFaitAll.length;
      
      const mecaTasksFaitCeMois = mecaTasksFaitAll.filter(t => t.datePlanifiee?.startsWith(currentMonthStr));
      const interventionsCeMois = mecaTasksFaitCeMois.length;

      const heuresInterventionCeMois = Math.round(mecaTasksFaitCeMois.reduce((sum, t) => sum + getHoursFromDuree(t.dureeEstimee || ''), 0) * 10) / 10;

      // Compute general monthly performance score based on tauxTournéesCompletes
      const scoreMensuel = tauxTournéesCompletes !== null ? tauxTournéesCompletes : (data.stats?.scoreMensuel ?? null);

      const processedStats: MecanicienStats = {
        totalInterventions,
        interventionsCeMois,
        derniereIntervention,
        scoreMensuel,
        mttrMoyen,
        tauxResolutionPremiereFois,
        tauxTournéesCompletes,
        heuresInterventionCeMois
      };

      const processed: Mecanicien = {
        id: data.id,
        uid: docUid,
        matricule: data.matricule || data.id,
        nom: finalNom || "Nom",
        prenom: finalPrenom || "Prénom",
        nomComplet: data.nomComplet || `${finalPrenom || ""} ${finalNom || ""}`.trim() || data.id || "",
        photo: data.photo || "",
        siteId: data.siteId || "SMI",
        poste: data.poste || "Poste 1",
        equipe: data.equipe || "A",
        competences: data.competences || [],
        telephone: data.telephone || "",
        telephoneUrgence: data.telephoneUrgence || "",
        email: data.email || "",
        adresse: data.adresse || "",
        dateNaissance: data.dateNaissance || "",
        dateEmbauche: data.dateEmbauche || getLocalDateString(),
        documents: data.documents || DEFAULT_DOCUMENTS,
        stats: processedStats,
        active: data.active !== false,
        statut: data.statut || (data.active !== false ? "Actif" : "Inactif"),
        source: data.source || "MIGRATION_SPRINT6",
        userUid: data.userUid || null
      };

      return processed;
    });
  }, [mecaniciensRaw, tasksRaw, pannesRaw]);

  // Handle automatic schema migration in the background
  useEffect(() => {
    const canMigrate = user?.role === "ADMIN" || user?.role === "RESPONSABLE_MAINTENANCE";
    if (!canMigrate || mecaniciens.length === 0) return;

    mecaniciens.forEach((m) => {
      const raw = mecaniciensRaw.find(r => r.id === m.id);
      if (!raw) return;
      const needsMigration = !raw.uid || !raw.documents || !raw.stats || !raw.prenom || !raw.nom;
      if (needsMigration) {
        setDoc(doc(db, "mecaniciens", m.id), {
          ...m,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => {
          console.warn(`Could not update mecanicien ${m.id} schema:`, err);
        });
      }
    });
  }, [mecaniciens, user?.role, mecaniciensRaw]);

  const saveMecanicien = async (meca: Mecanicien) => {
    try {
      const docRef = doc(db, "mecaniciens", meca.uid);
      await setDoc(docRef, {
        ...meca,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success(`Fiche de ${meca.prenom} ${meca.nom} enregistrée !`);
      return true;
    } catch (err) {
      console.error("Error saving mecanicien:", err);
      toast.error("Erreur d'écriture de la fiche mécanicien");
      return false;
    }
  };

  const deleteMecanicien = async (uid: string) => {
    try {
      await deleteDoc(doc(db, "mecaniciens", uid));
      toast.success("Mécanicien supprimé avec succès de la Configuration.");
      return true;
    } catch (err) {
      console.error("Error deleting mecanicien:", err);
      toast.error("Erreur lors de la suppression de la fiche.");
      return false;
    }
  };

  const uploadMecanicienFile = async (
    matricule: string,
    type: "avatar" | "document",
    file: File,
    documentKey?: string
  ): Promise<string> => {
    try {
      const storage = getStorage();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const path = type === "avatar" 
        ? `mecaniciens/${matricule}/avatar_${cleanFileName}`
        : `mecaniciens/${matricule}/documents/${documentKey || "doc"}_${Date.now()}_${cleanFileName}`;
      
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      console.warn("Firebase Storage non configuré ou inaccessible, encodage Base64 activé :", err);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    }
  };

  const loading = loadingMeca || loadingTasks || loadingPannes;

  return { 
    mecaniciens, 
    loading, 
    error,
    saveMecanicien, 
    deleteMecanicien, 
    uploadMecanicienFile 
  };
}
