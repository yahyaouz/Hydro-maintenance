import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { dbService } from "@/services/firestoreService";
import { toast } from "sonner";
import { CarnetSanteProfile } from "@/components/types_gmao";

// CALCUL DE SECOURS — Cette formule est une approximation déterministe pour 
// permettre l'affichage hors ligne ou en l'absence de données de collection.
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
      await dbService.carnetSante.set(profile.id, profile);
      toast.success("Fiche santé sauvegardée !");
    } catch (err) {
      console.error("Error saving carnetSante:", err);
      toast.error("Erreur de sauvegarde de la fiche santé");
    }
  };

  // Helper to compute overall health score based on pannes, workorders, and historical interventions
  const computeHealthScore = (engin: any, pannes: any[], workorders: any[], interventions: any[] = []): number => {
    if (!engin) return 100;

    const nowMs = Date.now();
    const limit90Ms = nowMs - (90 * 24 * 60 * 60 * 1000);

    // Helper to parse multiple date/timestamp formats robustly
    const parseDateToMillis = (dateVal: any): number | null => {
      if (!dateVal) return null;
      if (typeof dateVal === "object" && dateVal.seconds !== undefined) {
        return dateVal.seconds * 1000;
      }
      if (typeof dateVal === "object" && typeof dateVal.toDate === "function") {
        return dateVal.toDate().getTime();
      }
      try {
        const parsed = new Date(dateVal).getTime();
        if (!isNaN(parsed)) return parsed;
      } catch (e) {}
      return null;
    };

    // 1. Filter active pannes (unresolved breakdowns)
    const activePannes = (pannes || []).filter(p => 
      !p.deleted && 
      p.enginId === engin.id && 
      p.statut !== "CLOS"
    );

    // 2. Filter active work orders (unresolved)
    const activeBT = (workorders || []).filter(w => 
      !w.deleted && 
      (w.enginId === engin.id || w.enginId === engin.matricule) && 
      (w.statut === "NON_FAIT" || w.statut === "EN_COURS")
    );

    // 3. Filter historical closed pannes (resolved within last 90 days)
    const closedPannes90 = (pannes || []).filter(p => {
      if (p.deleted || p.statut !== "CLOS" || p.enginId !== engin.id) return false;
      const dateVal = p.dateResolution || p.dateDeclaration || p.createdAt || p.timestamp;
      const ms = parseDateToMillis(dateVal);
      return ms !== null && ms >= limit90Ms;
    });

    // 4. Filter historical interventions (corrective or curative within last 90 days)
    const historicalInterventions90 = (interventions || []).filter(i => {
      if (i.deleted) return false;
      const isMatchingEngine = (i.enginId === engin.id || i.enginMatricule === engin.matricule);
      if (!isMatchingEngine) return false;
      const isCorrective = (i.typeIntervention === 'CORRECTIF' || i.typeIntervention === 'CURATIF' || i.type === 'CORRECTIF' || i.type === 'CURATIF');
      if (!isCorrective) return false;
      
      const dateVal = i.date || i.dateResolution || i.timestamp || i.createdAt;
      const ms = parseDateToMillis(dateVal);
      return ms !== null && ms >= limit90Ms;
    });

    let score = 100;

    // --- COMPONENT A: ACTIVE INCIDENTS & WORK ORDERS ---
    // Active pannes impact based on category and severity:
    activePannes.forEach(p => {
      const category = (p.categorie || p.category || "").toUpperCase();
      const severity = (p.gravite || p.severity || "Moyenne").toLowerCase();
      
      let baseImpact = 10;
      if (severity === "critique" || severity === "haute" || severity === "élevée") baseImpact = 25;
      else if (severity === "basse" || severity === "faible") baseImpact = 5;

      let categoryWeight = 0.10;
      if (category.includes("MOTEUR")) {
        categoryWeight = 0.35;
      } else if (category.includes("HYDRAULIQUE")) {
        categoryWeight = 0.30;
      } else if (category.includes("TRANSMISSION")) {
        categoryWeight = 0.15;
      } else if (category.includes("ÉLECTRIQUE") || category.includes("ELECTRIQUE")) {
        categoryWeight = 0.10;
      }
      
      score -= baseImpact * categoryWeight;
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

    // --- COMPONENT B: HISTORICAL INCIDENTS (90 DAYS) ---
    // 1. Closed pannes in 90 days (adds historical reliability component)
    closedPannes90.forEach(p => {
      const severity = (p.gravite || p.severity || "Moyenne").toLowerCase();
      let baseImpact = 3.5; // deduction per closed panne
      if (severity === "critique" || severity === "haute" || severity === "élevée") baseImpact = 7.0;
      else if (severity === "basse" || severity === "faible") baseImpact = 1.5;

      // Recency decay factor (more recent has higher impact)
      let recencyFactor = 0.3; // default for older than 45 days
      const dateVal = p.dateResolution || p.dateDeclaration || p.createdAt || p.timestamp;
      const ms = parseDateToMillis(dateVal);
      if (ms) {
        const diffDays = (nowMs - ms) / (1000 * 60 * 60 * 24);
        if (diffDays <= 15) recencyFactor = 1.0;
        else if (diffDays <= 45) recencyFactor = 0.6;
      }

      score -= baseImpact * recencyFactor;
    });

    // 2. Historical interventions in 90 days
    historicalInterventions90.forEach(i => {
      const category = (i.categorie || i.category || "").toUpperCase();
      const severity = (i.gravite || i.severity || "Moyenne").toLowerCase();
      
      let baseImpact = 4.0; // deduction per corrective intervention
      if (severity === "critique" || severity === "haute" || severity === "élevée") baseImpact = 8.0;
      else if (severity === "basse" || severity === "faible") baseImpact = 2.0;

      // Recency decay factor
      let recencyFactor = 0.3;
      const dateVal = i.date || i.dateResolution || i.timestamp || i.createdAt;
      const ms = parseDateToMillis(dateVal);
      if (ms) {
        const diffDays = (nowMs - ms) / (1000 * 60 * 60 * 24);
        if (diffDays <= 15) recencyFactor = 1.0;
        else if (diffDays <= 45) recencyFactor = 0.6;
      }

      let categoryWeight = 0.10;
      if (category.includes("MOTEUR")) {
        categoryWeight = 0.35;
      } else if (category.includes("HYDRAULIQUE")) {
        categoryWeight = 0.30;
      } else if (category.includes("TRANSMISSION")) {
        categoryWeight = 0.15;
      } else if (category.includes("ÉLECTRIQUE") || category.includes("ELECTRIQUE")) {
        categoryWeight = 0.10;
      }

      score -= baseImpact * categoryWeight * recencyFactor;
    });

    // --- COMPONENT C: ENGINE AGE / HOURS ---
    // Engine wear and tear based on operating hours is consistently applied to both cases.
    // This represents natural wear over time, regardless of whether there are active incidents.
    const hours = Number(engin.heuresMarche) || Number(engin.heures) || Number(engin.hours) || Number(engin.km) || Number(engin.compteur) || 0;
    const ageDeduction = Math.min(15, (hours / 15000) * 15);
    score -= ageDeduction;

    // Floor the health score at 10 to maintain positive indicators and prevent negative ranges.
    return Math.max(10, Math.round(score));
  };

  return { profiles, loading, saveProfile, computeHealthScore, calculSecoursSante };
}
