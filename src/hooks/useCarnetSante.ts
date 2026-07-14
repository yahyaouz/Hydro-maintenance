import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { CarnetSanteProfile } from "@/components/types_gmao";

// CALCUL DE SECOURS — Cette formule est une approximation déterministe pour 
// permettre l'affichage hors ligne ou en l'absence de données historiques.
// Elle sera remplacée par un calcul basé sur l'historique réel des pannes 
// et des interventions au SPRINT 6 (Import + Intégration).
// Les pondérations (moteur 35%, hydraulique 30%, etc.) sont arbitraires 
// et devront être ajustées selon le type d'engin.
export function calculSecoursSante(engin: any): number {
  if (!engin) return 100;
  
  // Starting base score
  let score = 100;
  
  // Hours deduction
  const hours = Number(engin.heuresMarche) || Number(engin.heures) || Number(engin.hours) || Number(engin.km) || Number(engin.compteur) || 0;
  if (hours > 0) {
    // Deduct up to 25 points based on operating hours (aging factor)
    const ageDeduction = Math.min(25, (hours / 10000) * 25);
    score -= ageDeduction;
  }
  
  // Status deduction
  let status = (engin.statut || engin.status || "").toLowerCase();
  if (!status && engin.etat) {
    const et = String(engin.etat).toLowerCase();
    if (et === 'en maintenance') status = 'maintenance';
    else if (et === 'en panne' || et === 'hors service') status = 'panne';
    else if (et === 'opérationnel') status = 'actif';
  }
  if (status === "panne") {
    score -= 40;
  } else if (status === "maintenance") {
    score -= 15;
  }
  
  // Floor the score at 10
  return Math.max(10, Math.round(score));
}

export function useCarnetSante() {
  const [profiles, setProfiles] = useState<CarnetSanteProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "carnetSante"), (snapshot) => {
      const list: CarnetSanteProfile[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as CarnetSanteProfile);
      });
      setProfiles(list);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching carnetSante profiles:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveProfile = async (profile: CarnetSanteProfile) => {
    try {
      await setDoc(doc(db, "carnetSante", profile.id), {
        ...profile,
        lastChecked: new Date().toISOString()
      }, { merge: true });
      toast.success("Fiche santé sauvegardée !");
    } catch (err) {
      console.error("Error saving carnetSante:", err);
      toast.error("Erreur de sauvegarde de la fiche santé");
    }
  };

  // Helper to compute overall health score based on pannes and workorders
  const computeHealthScore = (engin: any, pannes: any[], workorders: any[]): number => {
    if (!engin) return 100;

    // Filter pannes and workorders relevant to this engine
    const activePannes = (pannes || []).filter(p => p.enginId === engin.id && p.statut !== "CLOS" && !p.deleted);
    const activeBT = (workorders || []).filter(w => (w.enginId === engin.id || w.enginId === engin.matricule) && (w.statut === "NON_FAIT" || w.statut === "EN_COURS") && !w.deleted);

    if (activePannes.length === 0 && activeBT.length === 0) {
      // Use secours formula if no active/reported incidents
      return calculSecoursSante(engin);
    }

    let score = 100;

    // Active pannes impact:
    // Moteur (35%), Hydraulique (30%), Transmission (15%), Electrique (10%), Structure (10%)
    activePannes.forEach(p => {
      const category = (p.categorie || p.category || "").toUpperCase();
      const severity = (p.gravite || p.severity || "Moyenne").toLowerCase();
      
      let baseImpact = 10;
      if (severity === "critique" || severity === "haute" || severity === "élevée") baseImpact = 25;
      else if (severity === "basse" || severity === "faible") baseImpact = 5;

      if (category.includes("MOTEUR")) {
        score -= baseImpact * 0.35;
      } else if (category.includes("HYDRAULIQUE")) {
        score -= baseImpact * 0.30;
      } else if (category.includes("TRANSMISSION")) {
        score -= baseImpact * 0.15;
      } else if (category.includes("ÉLECTRIQUE") || category.includes("ELECTRIQUE")) {
        score -= baseImpact * 0.10;
      } else {
        score -= baseImpact * 0.10; // other sub-systems
      }
    });

    // Active BTs impact (unresolved work orders)
    activeBT.forEach(bt => {
      const rawPriority = (bt.priority || bt.priorite || "normal").toLowerCase();
      if (rawPriority === "critique" || rawPriority === "haute") {
        score -= 15;
      } else if (rawPriority === "majeur" || rawPriority === "moyenne") {
        score -= 8;
      } else {
        score -= 3;
      }
    });

    // Age deduction (max 15 points)
    const hours = Number(engin.heuresMarche) || Number(engin.heures) || Number(engin.hours) || Number(engin.km) || Number(engin.compteur) || 0;
    const ageDeduction = Math.min(15, (hours / 15000) * 15);
    score -= ageDeduction;

    return Math.max(10, Math.round(score));
  };

  return { profiles, loading, saveProfile, computeHealthScore, calculSecoursSante };
}
