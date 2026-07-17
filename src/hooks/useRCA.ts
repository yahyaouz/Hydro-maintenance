import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { dbService } from "@/services/firestoreService";
import { toast } from "sonner";
import { RootCauseAnalysis } from "@/components/types_gmao";

export function useRCA() {
  const [rcas, setRcas] = useState<RootCauseAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rootCauseAnalysis"), (snapshot) => {
      const list: RootCauseAnalysis[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as RootCauseAnalysis);
      });
      setRcas(list);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching RootCauseAnalysis:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveRCA = async (rca: RootCauseAnalysis) => {
    try {
      await dbService.rca.set(rca.id, rca);
      toast.success("Rapport d'analyse RCA enregistré !");
    } catch (err) {
      console.error("Error saving RCA:", err);
      toast.error("Erreur lors de l'enregistrement de l'analyse RCA.");
      throw err;
    }
  };

  const deleteRCA = async (id: string) => {
    try {
      await dbService.rca.delete(id);
      toast.success("Rapport d'analyse RCA supprimé !");
    } catch (err) {
      console.error("Error deleting RCA:", err);
      toast.error("Erreur lors de la suppression de l'analyse RCA.");
      throw err;
    }
  };

  return { rcas, loading, saveRCA, deleteRCA };
}
