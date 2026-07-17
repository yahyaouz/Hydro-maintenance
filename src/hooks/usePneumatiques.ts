import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  doc
} from "firebase/firestore";
import { dbService } from "@/services/firestoreService";
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


export function usePneumatiques() {
  const [pneumatiques, setPneumatiques] = useState<Pneumatique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pneumatiques"), async (snapshot) => {
      setError(null);
      if (snapshot.empty) {
        setPneumatiques([]);
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
      setError("Erreur de connexion Firestore");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addPneumatiqueRecord = async (record: Omit<Pneumatique, "id" | "createdAt">) => {
    try {
      const docRef = doc(collection(db, "pneumatiques"));
      await dbService.pneumatiques.set(docRef.id, {
        ...record,
        id: docRef.id,
        createdAt: new Date().toISOString()
      });
      toast.success("Rapport de remplacement pneumatique enregistré !");
      return docRef.id;
    } catch (err) {
      console.error("Error adding pneumatique:", err);
      toast.error("Erreur d'écriture dans la collection pneumatiques");
      throw err;
    }
  };

  return { pneumatiques, loading, error, addPneumatiqueRecord };
}
