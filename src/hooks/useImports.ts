import { useState } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  writeBatch, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { csvToObjects, normalizeSite, isValidDate } from "@/lib/csvParser";

export interface ImportError {
  line: number;
  message: string;
  raw?: string;
}

export interface ImportResult {
  successCount: number;
  ignoredCount: number;
  errorCount: number;
  errors: ImportError[];
}

export function useImports() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  /**
   * Helper to write documents in chunks of 400 to avoid Firestore's 500 limits in a single batch
   */
  const commitInChunks = async (operations: (() => void)[]) => {
    let batch = writeBatch(db);
    let count = 0;

    for (let i = 0; i < operations.length; i++) {
      operations[i]();
      count++;

      if (count === 400) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
  };

  /**
   * 1. IMPORT ESPACE MAGASINIER (Consommations de pièces)
   */
  const importEspaceMagasinier = async (fileContent: string, activeSite: string): Promise<ImportResult> => {
    setLoading(true);
    const result: ImportResult = { successCount: 0, ignoredCount: 0, errorCount: 0, errors: [] };

    try {
      // 1. Fetch current pieces and engins from Firestore for strict validation
      const piecesSnap = await getDocs(collection(db, "pieces"));
      const piecesMap = new Map<string, any>(); // key: ref or id
      piecesSnap.forEach(d => {
        const p = d.data();
        piecesMap.set((p.ref || d.id).toUpperCase().trim(), { id: d.id, ...p });
      });

      const enginsSnap = await getDocs(collection(db, "engins"));
      const enginsSet = new Set<string>(); // uppercase matricules
      enginsSnap.forEach(d => {
        const e = d.data();
        if (e.matricule) {
          enginsSet.add(e.matricule.toUpperCase().trim());
        }
      });

      const rows = csvToObjects(fileContent);
      if (rows.length === 0) {
        throw new Error("Le fichier CSV est vide ou n'a pas pu être parsé.");
      }

      const operations: (() => void)[] = [];

      for (const row of rows) {
        const lineNum = parseInt(row._lineNumber || "0", 10);
        const rawLine = row._rawLine || "";

        const codePiece = (row.code_piece || "").toUpperCase().trim();
        const designation = row.designation || "";
        const quantite = parseFloat(row.quantite || "0");
        const unite = row.unite || "UNITE";
        const enginMatricule = (row.engin_matricule || "").toUpperCase().trim();
        const enginType = row.engin_type || "";
        const site = normalizeSite(row.site || "");
        const dateConso = row.date_conso || "";
        const mecanicienMatricule = row.mecanicien_matricule || "";
        const coutUnite = parseFloat(row.cout_unite_dh || "0");
        const coutTotal = parseFloat(row.cout_total_dh || "0");

        // VALIDATIONS
        if (!codePiece) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: "Code pièce manquant.", raw: rawLine });
          continue;
        }

        // Validate code piece in referentiel
        const matchedPiece = piecesMap.get(codePiece);
        if (!matchedPiece) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: `Code pièce ${codePiece} inconnu dans le référentiel des pièces.`, raw: rawLine });
          continue;
        }

        if (isNaN(quantite) || quantite <= 0) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: `Quantité négative ou invalide (${row.quantite}).`, raw: rawLine });
          continue;
        }

        if (!enginMatricule) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: "Matricule engin manquant.", raw: rawLine });
          continue;
        }

        // Validate engin existence
        if (!enginsSet.has(enginMatricule)) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: `Engin ${enginMatricule} non trouvé dans la base de la flotte.`, raw: rawLine });
          continue;
        }

        if (!isValidDate(dateConso)) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: `Date '${dateConso}' invalide ou format incorrect (attendu: YYYY-MM-DD).`, raw: rawLine });
          continue;
        }

        // Site isolation filter
        if (activeSite !== "TOUS" && site !== activeSite) {
          result.ignoredCount++;
          continue; // skip other sites silently or with notice
        }

        // Prepare database actions
        const consoId = `conso_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        operations.push(() => {
          // 1. Add consumption entry
          const consoRef = doc(collection(db, "consommations"), consoId);
          writeBatch(db).set(consoRef, {
            id: consoId,
            codePiece,
            designation: designation || matchedPiece.nom || "",
            quantite,
            unite,
            enginMatricule,
            enginType,
            site,
            dateConso,
            mecanicienMatricule,
            coutUnite,
            coutTotal: coutTotal || (quantite * (coutUnite || matchedPiece.prix || 0)),
            importedAt: new Date().toISOString()
          });

          // 2. Decrement piece stock
          const pieceRef = doc(db, "pieces", matchedPiece.id);
          const newStock = Math.max(0, (matchedPiece.stock || 0) - quantite);
          writeBatch(db).update(pieceRef, { stock: newStock });
          // Update local map to reflect stock changes across multi-line imports of same piece
          matchedPiece.stock = newStock;
        });

        result.successCount++;
      }

      if (operations.length > 0) {
        await commitInChunks(operations);
      }

      // Record in import history log
      await addDoc(collection(db, "config/imports/history"), {
        timestamp: serverTimestamp(),
        platform: "magasinier",
        status: result.errorCount > 0 ? (result.successCount > 0 ? "warning" : "error") : "success",
        elementsImported: `${result.successCount} pièces consommées réconciliées`,
        message: `Importation Espace Magasinier finalisée. ${result.successCount} succès, ${result.ignoredCount} ignorés, ${result.errorCount} erreurs.`,
        operator: user?.displayName || user?.email || "Responsable Maintenance"
      });

      return result;
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur lors de l'import Espace Magasinier");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. IMPORT CARBURANTS & LUBRIFIANTS (Heures compteur + consommations)
   */
  const importCarburants = async (fileContent: string, activeSite: string): Promise<ImportResult> => {
    setLoading(true);
    const result: ImportResult = { successCount: 0, ignoredCount: 0, errorCount: 0, errors: [] };

    try {
      // 1. Fetch current engins to validate and update
      const enginsSnap = await getDocs(collection(db, "engins"));
      const enginsMap = new Map<string, any>(); // key: matricule
      enginsSnap.forEach(d => {
        const e = d.data();
        if (e.matricule) {
          enginsMap.set(e.matricule.toUpperCase().trim(), { id: d.id, ...e });
        }
      });

      const rows = csvToObjects(fileContent);
      if (rows.length === 0) {
        throw new Error("Le fichier CSV est vide ou n'a pas pu être parsé.");
      }

      const operations: (() => void)[] = [];

      for (const row of rows) {
        const lineNum = parseInt(row._lineNumber || "0", 10);
        const rawLine = row._rawLine || "";

        const matriculeEngin = (row.matricule_engin || "").toUpperCase().trim();
        const typeEngin = row.type_engin || "";
        const site = normalizeSite(row.site || "");
        const dateReleve = row.date_releve || "";
        const heuresMoteur = parseFloat(row.heures_moteur || "0");
        const consoGasoil = parseFloat(row.conso_gasoil_litres || "0");
        const consoHuileMoteur = parseFloat(row.conso_huile_moteur_litres || "0");
        const consoHuileHydraulique = parseFloat(row.conso_huile_hydraulique_litres || "0");
        const consoAutresLubrifiants = parseFloat(row.conso_autres_lubrifiants_litres || "0");

        // VALIDATIONS
        if (!matriculeEngin) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: "Matricule engin manquant.", raw: rawLine });
          continue;
        }

        const matchedEngin = enginsMap.get(matriculeEngin);
        if (!matchedEngin) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: `Engin ${matriculeEngin} non trouvé dans la base.`, raw: rawLine });
          continue;
        }

        if (isNaN(heuresMoteur) || heuresMoteur < 0) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: `Heures moteur invalides ou négatives (${row.heures_moteur}).`, raw: rawLine });
          continue;
        }

        if (!isValidDate(dateReleve)) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: `Date '${dateReleve}' invalide. Format attendu: YYYY-MM-DD.`, raw: rawLine });
          continue;
        }

        // Site isolation filter
        if (activeSite !== "TOUS" && site !== activeSite) {
          result.ignoredCount++;
          continue;
        }

        const carbId = `carb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        operations.push(() => {
          // 1. Add history entry to carburants collection
          const carbRef = doc(collection(db, "carburants"), carbId);
          writeBatch(db).set(carbRef, {
            id: carbId,
            matriculeEngin,
            typeEngin,
            site,
            dateReleve,
            heuresMoteur,
            consoGasoil,
            consoHuileMoteur,
            consoHuileHydraulique,
            consoAutresLubrifiants,
            importedAt: new Date().toISOString()
          });

          // 2. Update engine hours in engins collection
          const enginRef = doc(db, "engins", matchedEngin.id);
          // Only update if the imported counter is greater or equal to current to avoid reverting
          if (heuresMoteur >= (matchedEngin.heures || 0)) {
            writeBatch(db).update(enginRef, { heures: heuresMoteur });
            matchedEngin.heures = heuresMoteur;
          }
        });

        result.successCount++;
      }

      if (operations.length > 0) {
        await commitInChunks(operations);
      }

      await addDoc(collection(db, "config/imports/history"), {
        timestamp: serverTimestamp(),
        platform: "carburants",
        status: result.errorCount > 0 ? (result.successCount > 0 ? "warning" : "error") : "success",
        elementsImported: `${result.successCount} relevés carburants traités`,
        message: `Importation Carburants & Lubrifiants finalisée. Compteurs d'engins mis à jour. ${result.successCount} succès, ${result.errorCount} erreurs.`,
        operator: user?.displayName || user?.email || "Responsable Maintenance"
      });

      return result;
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur lors de l'import Carburants & Lubrifiants");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 3. IMPORT PLATEFORME PRODUCTION (Planification)
   */
  const importPlanification = async (fileContent: string, activeSite: string): Promise<ImportResult> => {
    setLoading(true);
    const result: ImportResult = { successCount: 0, ignoredCount: 0, errorCount: 0, errors: [] };

    try {
      // Fetch users with MECANICIEN role to prevent duplicates (Correction 1)
      const usersQuery = query(collection(db, "users"), where("role", "==", "MECANICIEN"));
      const usersSnap = await getDocs(usersQuery);
      const usersMap = new Map<string, any>(); // key: matricule
      usersSnap.forEach(d => {
        const u = d.data();
        if (u.matricule) {
          usersMap.set(u.matricule.toUpperCase().trim(), { id: d.id, ...u });
        }
      });

      const rows = csvToObjects(fileContent);
      if (rows.length === 0) {
        throw new Error("Le fichier CSV est vide ou n'a pas pu être parsé.");
      }

      const operations: (() => void)[] = [];

      for (const row of rows) {
        const lineNum = parseInt(row._lineNumber || "0", 10);
        const rawLine = row._rawLine || "";

        const matriculeMec = (row.mecanicien_matricule || "").toUpperCase().trim();
        const nomMec = row.mecanicien_nom || "";
        const telMec = row.telephone || "";
        const emailMec = row.email || "";
        const dateStr = row.date || "";
        const poste = row.poste || "Poste 1";
        const site = normalizeSite(row.site || "");
        const enginMatricule = (row.engin_matricule || "").toUpperCase().trim();
        const typeIntervention = (row.type_intervention || "PREVENTIF").toUpperCase().trim();
        const heureDebutPrevue = row.heure_debut_prevue || "08:00";
        const heureFinPrevue = row.heure_fin_prevue || "16:00";

        // VALIDATIONS
        if (!matriculeMec) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: "Matricule mécanicien manquant.", raw: rawLine });
          continue;
        }

        if (!nomMec) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: "Nom mécanicien manquant.", raw: rawLine });
          continue;
        }

        if (!isValidDate(dateStr)) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: `Date '${dateStr}' invalide.`, raw: rawLine });
          continue;
        }

        // Site isolation filter
        if (activeSite !== "TOUS" && site !== activeSite) {
          result.ignoredCount++;
          continue;
        }

        operations.push(() => {
          const matchedMec = usersMap.get(matriculeMec);

          // Correction 1 & 2: Update/create basic user profile in the "users" collection (Correction 1)
          // Mise à jour basique du profil (nom, téléphone, email, site).
          // Le profil COMPLET (matricule, compétences, date d'embauche, etc.)
          // sera enrichi dans l'ÉTAPE 7 (Configuration Système — Analyse approfondie).
          if (matchedMec) {
            const mecRef = doc(db, "users", matchedMec.id);
            writeBatch(db).update(mecRef, {
              displayName: nomMec,
              telephone: telMec || matchedMec.telephone || "",
              email: emailMec || matchedMec.email || "",
              siteId: site,
              updatedAt: new Date().toISOString()
            });
          } else {
            const newUserId = `mec_${matriculeMec}_${Math.random().toString(36).substring(2, 5)}`;
            const mecRef = doc(db, "users", newUserId);
            writeBatch(db).set(mecRef, {
              uid: newUserId,
              matricule: matriculeMec,
              displayName: nomMec,
              telephone: telMec,
              email: emailMec || `${matriculeMec.toLowerCase()}@hydromines.ma`,
              role: "MECANICIEN",
              siteId: site,
              active: true,
              authProvider: "local",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            // Update local map to handle same mechanic listed multiple times in the same file
            usersMap.set(matriculeMec, { id: newUserId, displayName: nomMec });
          }

          // 2. Add maintenance task planning entry
          const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const taskRef = doc(collection(db, "maintenanceTasks"), taskId);
          writeBatch(db).set(taskRef, {
            id: taskId,
            enginId: enginMatricule,
            machineCode: enginMatricule,
            type: typeIntervention,
            category: typeIntervention,
            assignedTech: nomMec,
            assignedTechMatricule: matriculeMec,
            date: dateStr,
            poste,
            siteId: site,
            durationPlannedHours: 4,
            heureDebutPrevue,
            heureFinPrevue,
            status: "PLANIFIÉ",
            createdAt: new Date().toISOString(),
            importedAt: new Date().toISOString()
          });
        });

        result.successCount++;
      }

      if (operations.length > 0) {
        await commitInChunks(operations);
      }

      await addDoc(collection(db, "config/imports/history"), {
        timestamp: serverTimestamp(),
        platform: "planification",
        status: result.errorCount > 0 ? (result.successCount > 0 ? "warning" : "error") : "success",
        elementsImported: `${result.successCount} plannings de mécaniciens importés`,
        message: `Planification Production importée. ${result.successCount} fiches générées, mécaniciens synchronisés dans users.`,
        operator: user?.displayName || user?.email || "Responsable Maintenance"
      });

      return result;
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur lors de l'import de la Planification");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 4. IMPORT PLATEFORME PRODUCTION (Réalisation)
   */
  const importRealisation = async (fileContent: string, activeSite: string): Promise<ImportResult> => {
    setLoading(true);
    const result: ImportResult = { successCount: 0, ignoredCount: 0, errorCount: 0, errors: [] };

    try {
      // Fetch users (mecs) to update stats (Correction 1)
      const usersQuery = query(collection(db, "users"), where("role", "==", "MECANICIEN"));
      const usersSnap = await getDocs(usersQuery);
      const usersMap = new Map<string, any>();
      usersSnap.forEach(d => {
        const u = d.data();
        if (u.matricule) {
          usersMap.set(u.matricule.toUpperCase().trim(), { id: d.id, ...u });
        }
      });

      const rows = csvToObjects(fileContent);
      if (rows.length === 0) {
        throw new Error("Le fichier CSV est vide ou n'a pas pu être parsé.");
      }

      const operations: (() => void)[] = [];

      for (const row of rows) {
        const lineNum = parseInt(row._lineNumber || "0", 10);
        const rawLine = row._rawLine || "";

        const matriculeMec = (row.mecanicien_matricule || "").toUpperCase().trim();
        const dateStr = row.date || "";
        const enginMatricule = (row.engin_matricule || "").toUpperCase().trim();
        const typeIntervention = (row.type_intervention || "CORRECTIF").toUpperCase().trim();
        const heureDebutReelle = row.heure_debut_reelle || "";
        const heureFinReelle = row.heure_fin_reelle || "";
        const dureeHeures = parseFloat(row.duree_heures || "0");
        const descriptionTravaux = row.description_travaux || "";
        const status = (row.statut || "FERME").toUpperCase().trim();
        const piecesUtiliseesRaw = row.pieces_utilisees || "";

        // VALIDATIONS
        if (!matriculeMec) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: "Matricule mécanicien manquant.", raw: rawLine });
          continue;
        }

        if (!enginMatricule) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: "Matricule engin manquant.", raw: rawLine });
          continue;
        }

        if (isNaN(dureeHeures) || dureeHeures <= 0) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: `Durée réelle invalide ou négative (${row.duree_heures}).`, raw: rawLine });
          continue;
        }

        if (!isValidDate(dateStr)) {
          result.errorCount++;
          result.errors.push({ line: lineNum, message: `Date '${dateStr}' invalide.`, raw: rawLine });
          continue;
        }

        const piecesArray = piecesUtiliseesRaw
          ? piecesUtiliseesRaw.split(",").map(p => p.trim()).filter(Boolean)
          : [];

        // Determine site from user map or fallback to SMI
        const matchedMec = usersMap.get(matriculeMec);
        const site = matchedMec?.siteId || "SMI";

        // Site isolation filter
        if (activeSite !== "TOUS" && site !== activeSite) {
          result.ignoredCount++;
          continue;
        }

        const intervId = `interv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        operations.push(() => {
          // 1. Create intervention record in interventions collection
          const intervRef = doc(collection(db, "interventions"), intervId);
          writeBatch(db).set(intervRef, {
            id: intervId,
            mecanicienMatricule: matriculeMec,
            mecanicienNom: matchedMec?.displayName || `Tech ${matriculeMec}`,
            date: dateStr,
            enginMatricule,
            typeIntervention,
            heureDebutReelle,
            heureFinReelle,
            dureeHeures,
            descriptionTravaux,
            status,
            piecesUtilisees: piecesArray,
            siteId: site,
            importedAt: new Date().toISOString()
          });

          // 2. Update user / mechanic stats (Correction 1: updates "users" collection)
          if (matchedMec) {
            const mecRef = doc(db, "users", matchedMec.id);
            const currentTotalInt = matchedMec.totalInterventions || 0;
            const currentTotalHours = matchedMec.totalHours || 0;

            writeBatch(db).update(mecRef, {
              totalInterventions: currentTotalInt + 1,
              totalHours: currentTotalHours + dureeHeures,
              lastInterventionDate: dateStr,
              updatedAt: new Date().toISOString()
            });

            // Update in-memory map to accumulate values across lines for the same mechanic
            matchedMec.totalInterventions = currentTotalInt + 1;
            matchedMec.totalHours = currentTotalHours + dureeHeures;
          }
        });

        result.successCount++;
      }

      if (operations.length > 0) {
        await commitInChunks(operations);
      }

      await addDoc(collection(db, "config/imports/history"), {
        timestamp: serverTimestamp(),
        platform: "realisation",
        status: result.errorCount > 0 ? (result.successCount > 0 ? "warning" : "error") : "success",
        elementsImported: `${result.successCount} interventions réelles enregistrées`,
        message: `Réalisation de Production importée. Interventions ajoutées et statistiques des mécaniciens mises à jour.`,
        operator: user?.displayName || user?.email || "Responsable Maintenance"
      });

      return result;
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur lors de l'import de la Réalisation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    importEspaceMagasinier,
    importCarburants,
    importPlanification,
    importRealisation
  };
}
