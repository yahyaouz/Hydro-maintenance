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
import { SiteID, Mecanicien, MecanicienStats, Visas, Documents, VisaStatus } from "@/types";
export type { Mecanicien, MecanicienStats, Visas, Documents, VisaStatus };

// Default visas and documents structures to prevent undefined crashes
export const DEFAULT_VISAS: Visas = {
  LOTO: { active: false, dateExpiration: null },
  HAUTEUR: { active: false, dateExpiration: null },
  CONFINE: { active: false, dateExpiration: null },
  ELECTRIQUE_HV: { active: false, dateExpiration: null },
  CHARGEUR: { active: false, dateExpiration: null }
};

export const DEFAULT_DOCUMENTS: Documents = {
  contrat: "",
  diplome: "",
  visaMedical: "",
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

// Seed/mock data updated to match the new schema with empty/default visas
const MOCK_MECANICIENS: Mecanicien[] = [
  {
    uid: "meca-01",
    userUid: "user-meca-01",
    matricule: "M-2024-001",
    nom: "Naciri",
    prenom: "Kaddour",
    photo: "", // Empty so it uses UI avatar generation
    siteId: "SMI",
    poste: "Poste 1",
    equipe: "A",
    competences: ["MOTEUR_DIESEL", "HYDRAULIQUE", "ELECTRIQUE", "PNEUMATIQUE"],
    telephone: "+212 661 123456",
    telephoneUrgence: "+212 661 112233",
    email: "k.naciri@hydromines.ma",
    adresse: "Quartier El Houda, Ouarzazate",
    dateNaissance: "1985-03-15",
    dateEmbauche: "2019-03-15",
    visas: {
      LOTO: { active: true, dateExpiration: "2026-12-31" },
      HAUTEUR: { active: false, dateExpiration: null },
      CONFINE: { active: true, dateExpiration: "2026-10-15" }, // Expire bientôt
      ELECTRIQUE_HV: { active: false, dateExpiration: null },
      CHARGEUR: { active: true, dateExpiration: "2027-01-20" }
    },
    documents: DEFAULT_DOCUMENTS,
    stats: {
      totalInterventions: 47,
      interventionsCeMois: 12,
      derniereIntervention: "2026-07-03T14:30:00Z",
      scoreMensuel: 96.5,
      mttrMoyen: 3.2,
      tauxResolutionPremiereFois: 89.0,
      tauxTournéesCompletes: 96.0,
      heuresInterventionCeMois: 156
    },
    active: true,
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-02",
    userUid: null,
    matricule: "M-2024-002",
    nom: "Amrani",
    prenom: "Youssef",
    photo: "",
    siteId: "SMI",
    poste: "Poste 2",
    equipe: "B",
    competences: ["MOTEUR_DIESEL", "HYDRAULIQUE"],
    telephone: "+212 661 987654",
    telephoneUrgence: "+212 661 445566",
    email: "y.amrani@hydromines.ma",
    adresse: "Centre ville, Tinghir",
    dateNaissance: "1990-07-22",
    dateEmbauche: "2021-05-10",
    visas: {
      LOTO: { active: true, dateExpiration: "2026-11-30" },
      HAUTEUR: { active: true, dateExpiration: "2026-12-15" },
      CONFINE: { active: false, dateExpiration: null },
      ELECTRIQUE_HV: { active: false, dateExpiration: null },
      CHARGEUR: { active: false, dateExpiration: null }
    },
    documents: DEFAULT_DOCUMENTS,
    stats: {
      totalInterventions: 38,
      interventionsCeMois: 8,
      derniereIntervention: "2026-07-03T11:15:00Z",
      scoreMensuel: 94.2,
      mttrMoyen: 2.8,
      tauxResolutionPremiereFois: 91.0,
      tauxTournéesCompletes: 98.0,
      heuresInterventionCeMois: 124
    },
    active: true,
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-10",
    userUid: null,
    matricule: "M-2024-010",
    nom: "Faris",
    prenom: "Omar",
    photo: "",
    siteId: "OUMEJRANE",
    poste: "Poste 2",
    equipe: "A",
    competences: ["ELECTRIQUE", "AUTOMATISME"],
    telephone: "+212 668 556677",
    telephoneUrgence: "+212 668 990011",
    email: "o.faris@hydromines.ma",
    adresse: "Alnif, Province de Tinghir",
    dateNaissance: "1993-11-12",
    dateEmbauche: "2021-12-01",
    visas: {
      LOTO: { active: true, dateExpiration: "2026-08-10" }, // Expire très bientôt
      HAUTEUR: { active: true, dateExpiration: "2027-02-15" },
      CONFINE: { active: false, dateExpiration: null },
      ELECTRIQUE_HV: { active: true, dateExpiration: "2026-12-31" },
      CHARGEUR: { active: false, dateExpiration: null }
    },
    documents: DEFAULT_DOCUMENTS,
    stats: {
      totalInterventions: 33,
      interventionsCeMois: 7,
      derniereIntervention: "2026-07-02T11:45:00Z",
      scoreMensuel: 89.5,
      mttrMoyen: 3.3,
      tauxResolutionPremiereFois: 87.0,
      tauxTournéesCompletes: 93.0,
      heuresInterventionCeMois: 105
    },
    active: true,
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-11",
    userUid: null,
    matricule: "M-2024-011",
    nom: "Sabiri",
    prenom: "Khalid",
    photo: "",
    siteId: "KOUDIA",
    poste: "Poste 2",
    equipe: "C",
    competences: ["MOTEUR_DIESEL", "HYDRAULIQUE"],
    telephone: "+212 669 223344",
    email: "k.sabiri@hydromines.ma",
    dateEmbauche: "2020-07-15",
    visas: DEFAULT_VISAS,
    documents: DEFAULT_DOCUMENTS,
    stats: {
      totalInterventions: 41,
      interventionsCeMois: 8,
      derniereIntervention: "2026-07-03T09:30:00Z",
      scoreMensuel: 92.5,
      mttrMoyen: 3.0,
      tauxResolutionPremiereFois: 89.0,
      tauxTournéesCompletes: 96.0,
      heuresInterventionCeMois: 135
    },
    active: true,
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-12",
    userUid: null,
    matricule: "M-2024-012",
    nom: "Radi",
    prenom: "Mustafa",
    photo: "",
    siteId: "BOU-AZZER",
    poste: "Poste 2",
    equipe: "A",
    competences: ["SOUDURE", "HYDRAULIQUE"],
    telephone: "+212 670 889911",
    email: "m.radi@hydromines.ma",
    dateEmbauche: "2023-03-20",
    visas: DEFAULT_VISAS,
    documents: DEFAULT_DOCUMENTS,
    stats: {
      totalInterventions: 28,
      interventionsCeMois: 4,
      derniereIntervention: "2026-06-28T15:30:00Z",
      scoreMensuel: 81.0,
      mttrMoyen: 4.2,
      tauxResolutionPremiereFois: 80.0,
      tauxTournéesCompletes: 90.0,
      heuresInterventionCeMois: 85
    },
    active: true,
    source: "MOCK_SPRINT4"
  }
];

export function useMecaniciens() {
  const [mecaniciens, setMecaniciens] = useState<Mecanicien[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read from 'mecaniciens' Firestore collection in real time
    const unsubscribe = onSnapshot(collection(db, "mecaniciens"), async (snapshot) => {
      if (snapshot.empty) {
        setLoading(true);
        try {
          for (const meca of MOCK_MECANICIENS) {
            await setDoc(doc(db, "mecaniciens", meca.uid), meca);
          }
        } catch (err) {
          console.error("Error seeding mecaniciens collection:", err);
        }
        setMecaniciens(MOCK_MECANICIENS);
        setLoading(false);
      } else {
        const list: Mecanicien[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          
          // Detect older schema that needs non-destructive migration
          const needsMigration = !data.uid || !data.visas || !data.documents || !data.stats || !data.prenom || !data.nom;
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
            visas: data.visas || {
              LOTO: { active: !!data.visaLOTO, dateExpiration: data.visas?.LOTO?.dateExpiration || null },
              HAUTEUR: { active: !!data.visaHauteur, dateExpiration: data.visas?.HAUTEUR?.dateExpiration || null },
              CONFINE: { active: !!data.visaConfine, dateExpiration: data.visas?.CONFINE?.dateExpiration || null },
              ELECTRIQUE_HV: { active: !!data.visas?.ELECTRIQUE_HV?.active, dateExpiration: data.visas?.ELECTRIQUE_HV?.dateExpiration || null },
              CHARGEUR: { active: !!data.visas?.CHARGEUR?.active, dateExpiration: data.visas?.CHARGEUR?.dateExpiration || null }
            },
            documents: data.documents || DEFAULT_DOCUMENTS,
            stats: data.stats || DEFAULT_STATS,
            active: data.active !== false,
            source: data.source || "MIGRATION_SPRINT6",
            userUid: data.userUid || null
          };
          
          if (needsMigration) {
            // Write migrated document back to Firestore asynchronously
            setDoc(doc(db, "mecaniciens", docSnap.id), {
              ...processed,
              updatedAt: new Date().toISOString()
            }, { merge: true }).catch(err => {
              console.error(`Failed to background-migrate mecanicien ${docSnap.id}:`, err);
            });
          }

          list.push(processed);
        });
        setMecaniciens(list);
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching mecaniciens:", err);
      setMecaniciens(MOCK_MECANICIENS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    saveMecanicien, 
    deleteMecanicien, 
    uploadMecanicienFile 
  };
}
