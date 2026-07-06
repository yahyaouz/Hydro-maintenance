// Hook useMecaniciens.ts - Phase 2 Refactoring
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs
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
  scoreMensuel: 100,
  mttrMoyen: 0,
  tauxResolutionPremiereFois: 100,
  tauxTournéesCompletes: 100,
  heuresInterventionCeMois: 0
};


export function useMecaniciens() {
  const [mecaniciens, setMecaniciens] = useState<Mecanicien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || user.active === false) {
      setLoading(false);
      return;
    }

    // Read from 'mecaniciens' Firestore collection in real time
    const unsubscribe = onSnapshot(collection(db, "mecaniciens"), async (snapshot) => {
      setError(null);
      if (snapshot.empty) {
        setMecaniciens([]);
        setLoading(false);
      } else {
        const list: Mecanicien[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          
          // Detect older schema that needs non-destructive migration
          const needsMigration = !data.uid || !data.documents || !data.stats || !data.prenom || !data.nom;
          const docUid = data.uid || docSnap.id;
          
          // Split old full name if present
          let finalNom = data.nom || "";
          let finalPrenom = data.prenom || "";
          if (!finalNom && !finalPrenom && data.nomComplet) {
            const parts = data.nomComplet.trim().split(/\s+/);
            finalPrenom = parts[0] || "";
            finalNom = parts.slice(1).join(" ") || "";
          }

          const processed: Mecanicien = {
            id: docSnap.id,
            uid: docUid,
            matricule: data.matricule || docSnap.id,
            nom: finalNom || "Nom",
            prenom: finalPrenom || "Prénom",
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
            dateEmbauche: data.dateEmbauche || new Date().toISOString().split('T')[0],
            documents: data.documents || DEFAULT_DOCUMENTS,
            stats: data.stats || DEFAULT_STATS,
            active: data.active !== false,
            source: data.source || "MIGRATION_SPRINT6",
            userUid: data.userUid || null
          };
          
          const canMigrate = user?.role === "ADMIN" || user?.role === "RESPONSABLE_MAINTENANCE";
          if (needsMigration && canMigrate) {
            // Write migrated document back to Firestore asynchronously only if user is authorized
            setDoc(doc(db, "mecaniciens", docSnap.id), {
              ...processed,
              updatedAt: new Date().toISOString()
            }, { merge: true }).catch(err => {
              console.warn(`Could not update mecanicien ${docSnap.id} schema:`, err);
            });
          }

          list.push(processed);
        });
        setMecaniciens(list);
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching mecaniciens:", err);
      setError("Erreur de connexion Firestore");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.role, user?.uid, user?.active]);

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

  return { 
    mecaniciens, 
    loading, 
    error,
    saveMecanicien, 
    deleteMecanicien, 
    uploadMecanicienFile 
  };
}
