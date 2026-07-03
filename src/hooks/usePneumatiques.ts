import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc 
} from "firebase/firestore";
import { toast } from "sonner";
import { SiteID } from "@/types";

export interface Pneumatique {
  id?: string; // document id
  enginId: string;
  enginModele: string;
  siteId: SiteID;
  position: "AV-G" | "AV-D" | "AR-G-EXT" | "AR-G-INT" | "AR-D-EXT" | "AR-D-INT";
  marque: string;
  dimension: string;
  type: string;
  numeroSerie: string;
  datePose: string;
  heurePose: number;
  ancienPneuDureeHeures: number;
  ancienPneuRaison: string;
  cout: number;
  fournisseur: string;
  changePar: string;
  validePar: string;
  createdAt: string;
}

const MOCK_PNEUMATIQUES: Pneumatique[] = [
  {
    enginId: "SMI-TR-01",
    enginModele: "CAT 777D",
    siteId: "SMI",
    position: "AV-G",
    marque: "Michelin",
    dimension: "27.00R49",
    type: "X-Traction",
    numeroSerie: "MICH-8849202",
    datePose: "2026-06-15",
    heurePose: 14500,
    ancienPneuDureeHeures: 4500,
    ancienPneuRaison: "Crevaison flanc / coupure roche",
    cout: 12500,
    fournisseur: "SOREC PNEUS",
    changePar: "Kaddour Naciri",
    validePar: "Brahim El Fassi",
    createdAt: "2026-06-15T10:00:00Z"
  },
  {
    enginId: "OUM-TR-03",
    enginModele: "CAT 777D",
    siteId: "OUMEJRANE",
    position: "AR-D-EXT",
    marque: "Bridgestone",
    dimension: "27.00R49",
    type: "VSDT",
    numeroSerie: "BS-9042814",
    datePose: "2026-06-20",
    heurePose: 8200,
    ancienPneuDureeHeures: 5200,
    ancienPneuRaison: "Usure normale bande de roulement",
    cout: 13200,
    fournisseur: "ATLAS PNEUS",
    changePar: "Brahim El Fassi",
    validePar: "Kaddour Naciri",
    createdAt: "2026-06-20T14:30:00Z"
  },
  {
    enginId: "SMI-TR-02",
    enginModele: "CAT 777D",
    siteId: "SMI",
    position: "AV-D",
    marque: "Michelin",
    dimension: "27.00R49",
    type: "X-Traction",
    numeroSerie: "MICH-7482910",
    datePose: "2026-07-01",
    heurePose: 12800,
    ancienPneuDureeHeures: 4200,
    ancienPneuRaison: "Usure prononcée d'épaulement",
    cout: 12500,
    fournisseur: "SOREC PNEUS",
    changePar: "Ahmed Mansouri",
    validePar: "Kaddour Naciri",
    createdAt: "2026-07-01T16:00:00Z"
  },
  {
    enginId: "KOU-TR-05",
    enginModele: "Komatsu HD465",
    siteId: "KOUDIA",
    position: "AR-G-EXT",
    marque: "Goodyear",
    dimension: "24.00R35",
    type: "GP-4D",
    numeroSerie: "GY-3849102",
    datePose: "2026-05-12",
    heurePose: 9400,
    ancienPneuDureeHeures: 3800,
    ancienPneuRaison: "Impact rocheux profond",
    cout: 9800,
    fournisseur: "ATLAS PNEUS",
    changePar: "Said El Alami",
    validePar: "Khalid Sabiri",
    createdAt: "2026-05-12T09:15:00Z"
  },
  {
    enginId: "BOU-TR-08",
    enginModele: "CAT 777D",
    siteId: "BOU-AZZER",
    position: "AR-D-INT",
    marque: "Michelin",
    dimension: "27.00R49",
    type: "X-Traction",
    numeroSerie: "MICH-1920485",
    datePose: "2026-04-18",
    heurePose: 16100,
    ancienPneuDureeHeures: 4900,
    ancienPneuRaison: "Surchauffe / délamination interne",
    cout: 12500,
    fournisseur: "SOREC PNEUS",
    changePar: "Hassan Mourad",
    validePar: "Mustafa Radi",
    createdAt: "2026-04-18T11:00:00Z"
  },
  {
    enginId: "OUA-TR-01",
    enginModele: "Komatsu HD465",
    siteId: "OUANSIMI",
    position: "AV-G",
    marque: "Bridgestone",
    dimension: "24.00R35",
    type: "V-Steel",
    numeroSerie: "BS-2239401",
    datePose: "2026-06-05",
    heurePose: 11200,
    ancienPneuDureeHeures: 4100,
    ancienPneuRaison: "Coupure flanc par herse d'éboulis",
    cout: 10200,
    fournisseur: "SOREC PNEUS",
    changePar: "Rachid Benali",
    validePar: "Kaddour Naciri",
    createdAt: "2026-06-05T15:20:00Z"
  }
];

export function usePneumatiques() {
  const [pneumatiques, setPneumatiques] = useState<Pneumatique[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pneumatiques"), async (snapshot) => {
      if (snapshot.empty) {
        setLoading(true);
        try {
          for (const pneu of MOCK_PNEUMATIQUES) {
            const tempDocRef = doc(collection(db, "pneumatiques"));
            await setDoc(tempDocRef, { ...pneu, id: tempDocRef.id });
          }
        } catch (err) {
          console.error("Error seeding pneumatiques collection:", err);
        }
        // Will trigger next snapshot, but let's set local list in the meantime
        setPneumatiques(MOCK_PNEUMATIQUES);
        setLoading(false);
      } else {
        const list: Pneumatique[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Pneumatique);
        });
        setPneumatiques(list);
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching pneumatiques:", err);
      setPneumatiques(MOCK_PNEUMATIQUES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPneumatiqueRecord = async (record: Omit<Pneumatique, "id" | "createdAt">) => {
    try {
      const docRef = await addDoc(collection(db, "pneumatiques"), {
        ...record,
        createdAt: new Date().toISOString()
      });
      // Update with its own ID
      await setDoc(doc(db, "pneumatiques", docRef.id), { id: docRef.id }, { merge: true });
      toast.success("Rapport de remplacement pneumatique enregistré !");
      return docRef.id;
    } catch (err) {
      console.error("Error adding pneumatique:", err);
      toast.error("Erreur d'écriture dans la collection pneumatiques");
      throw err;
    }
  };

  return { pneumatiques, loading, addPneumatiqueRecord };
}
