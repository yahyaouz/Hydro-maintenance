// ⚠️ ATTENTION : DONNÉES MOCK POUR DÉMO SPRINT 4
// Ces données seront remplacées par les vraies données de la plateforme 
// Production au SPRINT 6 (Import + Intégration).
// La source de vérité finale sera la collection 'users' avec role === 'MECANICIEN'.
// Ce hook lira users (pas mecaniciens) après le SPRINT 6.

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc 
} from "firebase/firestore";
import { toast } from "sonner";
import { SiteID } from "@/types";

export interface MecanicienStats {
  totalInterventions: number;
  interventionsCeMois: number;
  derniereIntervention: string;
  scoreMensuel: number;
  mttrMoyen: number;
  tauxResolutionPremiereFois: number;
  tauxTournéesCompletes: number;
  heuresInterventionCeMois: number;
}

export interface Mecanicien {
  id?: string; // Firestore document ID
  uid: string;
  matricule: string;
  nom: string;
  prenom: string;
  photo: string;
  siteId: SiteID;
  poste: string;
  competences: string[];
  visaLOTO: boolean;
  visaHauteur: boolean;
  visaConfine: boolean;
  telephone: string;
  email: string;
  stats: MecanicienStats;
  active: boolean;
  dateEmbauche: string;
  source: "MOCK_SPRINT4" | "PRODUCTION_IMPORT";
}

const MOCK_MECANICIENS: Mecanicien[] = [
  {
    uid: "meca-01",
    matricule: "M-2024-001",
    nom: "Naciri",
    prenom: "Kaddour",
    photo: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150",
    siteId: "SMI",
    poste: "Poste 1",
    competences: ["MOTEUR_DIESEL", "HYDRAULIQUE", "ELECTRIQUE", "PNEUMATIQUE"],
    visaLOTO: true,
    visaHauteur: false,
    visaConfine: true,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 661 123456",
    email: "k.naciri@hydromines.ma",
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
    dateEmbauche: "2019-03-15",
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-02",
    matricule: "M-2024-002",
    nom: "Amrani",
    prenom: "Youssef",
    photo: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150",
    siteId: "SMI",
    poste: "Poste 2",
    competences: ["MOTEUR_DIESEL", "HYDRAULIQUE", "SOUDURE"],
    visaLOTO: true,
    visaHauteur: true,
    visaConfine: false,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 661 987654",
    email: "y.amrani@hydromines.ma",
    stats: {
      totalInterventions: 38,
      interventionsCeMois: 8,
      derniereIntervention: "2026-07-03T11:15:00Z",
      scoreMensuel: 82.0,
      mttrMoyen: 4.1,
      tauxResolutionPremiereFois: 78.0,
      tauxTournéesCompletes: 89.0,
      heuresInterventionCeMois: 120
    },
    active: true,
    dateEmbauche: "2021-06-10",
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-03",
    matricule: "M-2024-003",
    nom: "El Fassi",
    prenom: "Brahim",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    siteId: "OUMEJRANE",
    poste: "Poste 1",
    competences: ["MOTEUR_DIESEL", "TRANSMISSION", "HYDRAULIQUE"],
    visaLOTO: true,
    visaHauteur: true,
    visaConfine: true,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 661 456123",
    email: "b.elfassi@hydromines.ma",
    stats: {
      totalInterventions: 52,
      interventionsCeMois: 10,
      derniereIntervention: "2026-07-02T18:30:00Z",
      scoreMensuel: 94.0,
      mttrMoyen: 2.8,
      tauxResolutionPremiereFois: 92.0,
      tauxTournéesCompletes: 98.0,
      heuresInterventionCeMois: 145
    },
    active: true,
    dateEmbauche: "2018-11-20",
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-04",
    matricule: "M-2024-004",
    nom: "Mansouri",
    prenom: "Ahmed",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    siteId: "SMI",
    poste: "Poste 1",
    competences: ["ELECTRIQUE", "CLIMATISATION", "ELECTRONIQUE"],
    visaLOTO: true,
    visaHauteur: false,
    visaConfine: false,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 662 334455",
    email: "a.mansouri@hydromines.ma",
    stats: {
      totalInterventions: 31,
      interventionsCeMois: 6,
      derniereIntervention: "2026-07-01T09:45:00Z",
      scoreMensuel: 88.0,
      mttrMoyen: 3.5,
      tauxResolutionPremiereFois: 85.0,
      tauxTournéesCompletes: 94.0,
      heuresInterventionCeMois: 95
    },
    active: true,
    dateEmbauche: "2022-02-15",
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-05",
    matricule: "M-2024-005",
    nom: "Ait",
    prenom: "Youssef",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    siteId: "OUMEJRANE",
    poste: "Poste 1",
    competences: ["HYDRAULIQUE", "PNEUMATIQUE", "GRAISSAGE"],
    visaLOTO: false,
    visaHauteur: true,
    visaConfine: false,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 663 889900",
    email: "y.ait@hydromines.ma",
    stats: {
      totalInterventions: 25,
      interventionsCeMois: 5,
      derniereIntervention: "2026-06-30T16:20:00Z",
      scoreMensuel: 79.5,
      mttrMoyen: 4.5,
      tauxResolutionPremiereFois: 80.0,
      tauxTournéesCompletes: 91.0,
      heuresInterventionCeMois: 88
    },
    active: true,
    dateEmbauche: "2023-08-01",
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-06",
    matricule: "M-2024-006",
    nom: "El Alami",
    prenom: "Said",
    photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
    siteId: "KOUDIA",
    poste: "Poste 1",
    competences: ["MOTEUR_DIESEL", "HYDRAULIQUE", "CHASSIS"],
    visaLOTO: true,
    visaHauteur: false,
    visaConfine: true,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 664 112233",
    email: "s.elalami@hydromines.ma",
    stats: {
      totalInterventions: 40,
      interventionsCeMois: 7,
      derniereIntervention: "2026-07-02T15:00:00Z",
      scoreMensuel: 91.5,
      mttrMoyen: 3.1,
      tauxResolutionPremiereFois: 88.0,
      tauxTournéesCompletes: 95.0,
      heuresInterventionCeMois: 130
    },
    active: true,
    dateEmbauche: "2020-04-12",
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-07",
    matricule: "M-2024-007",
    nom: "Benali",
    prenom: "Rachid",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    siteId: "OUANSIMI",
    poste: "Poste 2",
    competences: ["ELECTRIQUE", "HYDRAULIQUE", "PNEUMATIQUE"],
    visaLOTO: true,
    visaHauteur: true,
    visaConfine: false,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 665 445566",
    email: "r.benali@hydromines.ma",
    stats: {
      totalInterventions: 29,
      interventionsCeMois: 4,
      derniereIntervention: "2026-06-29T10:30:00Z",
      scoreMensuel: 84.0,
      mttrMoyen: 3.8,
      tauxResolutionPremiereFois: 82.0,
      tauxTournéesCompletes: 90.0,
      heuresInterventionCeMois: 92
    },
    active: true,
    dateEmbauche: "2022-09-01",
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-08",
    matricule: "M-2024-008",
    nom: "Mourad",
    prenom: "Hassan",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    siteId: "BOU-AZZER",
    poste: "Poste 1",
    competences: ["MOTEUR_DIESEL", "TRANSMISSION", "SOUDURE"],
    visaLOTO: true,
    visaHauteur: true,
    visaConfine: true,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 666 778899",
    email: "h.mourad@hydromines.ma",
    stats: {
      totalInterventions: 45,
      interventionsCeMois: 9,
      derniereIntervention: "2026-07-02T16:15:00Z",
      scoreMensuel: 93.0,
      mttrMoyen: 2.9,
      tauxResolutionPremiereFois: 90.0,
      tauxTournéesCompletes: 97.0,
      heuresInterventionCeMois: 140
    },
    active: true,
    dateEmbauche: "2019-10-10",
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-09",
    matricule: "M-2024-009",
    nom: "Chafik",
    prenom: "Mohamed",
    photo: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150",
    siteId: "SMI",
    poste: "Poste 3",
    competences: ["GRAISSAGE", "PNEUMATIQUE", "INSPECTION"],
    visaLOTO: false,
    visaHauteur: false,
    visaConfine: true,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 667 112244",
    email: "m.chafik@hydromines.ma",
    stats: {
      totalInterventions: 22,
      interventionsCeMois: 3,
      derniereIntervention: "2026-07-01T14:00:00Z",
      scoreMensuel: 76.0,
      mttrMoyen: 4.8,
      tauxResolutionPremiereFois: 75.0,
      tauxTournéesCompletes: 88.0,
      heuresInterventionCeMois: 75
    },
    active: true,
    dateEmbauche: "2024-01-15",
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-10",
    matricule: "M-2024-10",
    nom: "Faris",
    prenom: "Omar",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    siteId: "OUMEJRANE",
    poste: "Poste 2",
    competences: ["ELECTRIQUE", "AUTOMATISME", "CLIMATISATION"],
    visaLOTO: true,
    visaHauteur: true,
    visaConfine: false,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 668 556677",
    email: "o.faris@hydromines.ma",
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
    dateEmbauche: "2021-12-01",
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-11",
    matricule: "M-2024-011",
    nom: "Sabiri",
    prenom: "Khalid",
    photo: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150",
    siteId: "KOUDIA",
    poste: "Poste 2",
    competences: ["MOTEUR_DIESEL", "TRANSMISSION", "HYDRAULIQUE"],
    visaLOTO: true,
    visaHauteur: false,
    visaConfine: true,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 669 223344",
    email: "k.sabiri@hydromines.ma",
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
    dateEmbauche: "2020-07-15",
    source: "MOCK_SPRINT4"
  },
  {
    uid: "meca-12",
    matricule: "M-2024-012",
    nom: "Radi",
    prenom: "Mustafa",
    photo: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150",
    siteId: "BOU-AZZER",
    poste: "Poste 2",
    competences: ["SOUDURE", "HYDRAULIQUE", "CHASSIS"],
    visaLOTO: true,
    visaHauteur: true,
    visaConfine: false,
    // Téléphone mock - À remplacer par le vrai numéro depuis la Configuration Système
    telephone: "+212 670 889911",
    email: "m.radi@hydromines.ma",
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
    dateEmbauche: "2023-03-20",
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
        // Seed database if empty
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
          list.push({ id: docSnap.id, ...docSnap.data() } as Mecanicien);
        });
        setMecaniciens(list);
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching mecaniciens:", err);
      // Fallback to mock data offline
      setMecaniciens(MOCK_MECANICIENS);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveMecanicien = async (meca: Mecanicien) => {
    try {
      await setDoc(doc(db, "mecaniciens", meca.uid), {
        ...meca,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success("Fiche mécanicien mise à jour !");
    } catch (err) {
      console.error("Error saving mecanicien:", err);
      toast.error("Erreur d'écriture dans la collection");
    }
  };

  return { mecaniciens, loading, saveMecanicien };
}
