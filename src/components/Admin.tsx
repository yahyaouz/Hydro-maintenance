// RECONSTRUIT : Fichier de configuration système complet avec CRUD complet Firestore pour les 4 onglets : Engins, Équipe, Chantiers, Intervalles de Maintenance.
import * as React from "react";
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  User, 
  Users, 
  Wrench, 
  Cpu, 
  MapPin, 
  CheckCircle, 
  X, 
  Download, 
  ChevronRight,
  Shield,
  Gauge,
  Clock,
  Car,
  Tag,
  Stethoscope,
  Activity,
  ShieldAlert,
  Copy,
  Target
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageBanner } from "@/components/ui/PageBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCollection } from "@/hooks/useCollection";
import { DataLoadError } from "@/components/shared/DataLoadError";
import { 
  collection, doc, onSnapshot, query, where, orderBy,
  writeBatch, Timestamp, getDocs, limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { dbService } from '@/services/firestoreService';
import { useAuthStore } from '@/lib/store';
import { getLocalDateString, escapeCsvField } from '@/lib/utils';
import { AdminMecaniciens } from "./admin/AdminMecaniciens";

// RECONSTRUIT : Interfaces TypeScript pour typer proprement les collections stockées
interface Engin {
  id: string; // nParc unique
  modele: "ST2D" | "ST2G" | "ST7" | "ST1030" | "Autre";
  marque: string;
  type: "Scooptram" | "Camion" | "Perforateur" | "Chargeuse" | "Autre";
  siteId: string; // standard de l'app (pas chantierAssigne)
  heuresMarche: number;
  dateEntreeService: string;
  etat: "Opérationnel" | "En maintenance" | "Hors service" | "Vendu";
  conducteurAssigne: string;
  statut?: string;
  dispo?: number;
}

interface Mecanicien {
  id: string; // Matricule unique
  nomComplet: string;
  poste: "Poste 1" | "Poste 2" | "Poste 3";
  specialite: "Moteur" | "Hydraulique" | "Électrique" | "Transmission" | "Généraliste";
  telephone: string;
  dateEmbauche: string;
  statut: "Actif" | "En congé" | "Inactif";
  siteId: string; // Affectation site mécanicien
}

interface Chantier {
  id: string; // Code unique
  nomComplet: string;
  type: "Mine souterraine" | "Mine à ciel ouvert" | "Traitement" | "Stockage";
  localisation: string;
  responsableId: string; // Matricule du mécanicien responsable
  statut: "Actif" | "Inactif" | "En préparation";
}

interface IntervalleMaintenance {
  id: string; // ID unique docId
  typeEngin: "ST2D" | "ST2G" | "ST7" | "ST1030" | "Générique";
  operation: string;
  intervalleHeures: number;
  produitHuile: string;
  quantite: string;
  priorite: "Critique" | "Haute" | "Normale" | "Basse";
}

export function Admin() {
  const { user } = useAuthStore();

  // RECONSTRUIT : États de navigation des onglets
  const [activeTab, setActiveTab] = React.useState<"engins" | "mecaniciens" | "chantiers" | "intervalles" | "comptes" | "sante_donnees" | "objectifs" | "logs_erreurs">("engins");

  const [systemLogs, setSystemLogs] = React.useState<any[]>([]);
  const [logsLoading, setLogsLoading] = React.useState(false);
  const [logLevelFilter, setLogLevelFilter] = React.useState<string>("ALL");

  const SITES_LIST = ['SMI', 'OUMEJRANE', 'KOUDIA', 'OUANSIMI', 'BOU-AZZER'];
  const { data: objectifsSitesRaw, loading: objectifsLoading, error: objectifsError } = useCollection<any>('objectifsSites');

  const hasLoadError = !!objectifsError;

  const [editedTargets, setEditedTargets] = React.useState<Record<string, {
    dispoTarget: string;
    mttrTarget: string;
    complianceTarget: string;
    coutTarget: string;
  }>>({});

  React.useEffect(() => {
    if (objectifsSitesRaw) {
      const initial: Record<string, any> = {};
      SITES_LIST.forEach(site => {
        const found = objectifsSitesRaw.find(o => o.id === site);
        initial[site] = {
          dispoTarget: found?.dispoTarget !== undefined && found?.dispoTarget !== null ? String(found.dispoTarget) : "",
          mttrTarget: found?.mttrTarget !== undefined && found?.mttrTarget !== null ? String(found.mttrTarget) : "",
          complianceTarget: found?.complianceTarget !== undefined && found?.complianceTarget !== null ? String(found.complianceTarget) : "",
          coutTarget: found?.coutTarget !== undefined && found?.coutTarget !== null ? String(found.coutTarget) : "",
        };
      });
      setEditedTargets(initial);
    }
  }, [objectifsSitesRaw]);

  React.useEffect(() => {
    if (activeTab !== "logs_erreurs") return;

    setLogsLoading(true);
    const logsRef = collection(db, "systemLogs");
    const q = query(logsRef, orderBy("createdAt", "desc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs: any[] = [];
      snapshot.forEach((doc) => {
        fetchedLogs.push({ id: doc.id, ...doc.data() });
      });

      if (fetchedLogs.length === 0) {
        // Try query with dbTimestamp
        const qFallback = query(logsRef, orderBy("dbTimestamp", "desc"), limit(100));
        getDocs(qFallback).then((fallbackSnapshot) => {
          const fbLogs: any[] = [];
          fallbackSnapshot.forEach((doc) => {
            fbLogs.push({ id: doc.id, ...doc.data() });
          });
          if (fbLogs.length === 0) {
            // Try query with timestamp
            const qFallbackTime = query(logsRef, orderBy("timestamp", "desc"), limit(100));
            getDocs(qFallbackTime).then((timeSnapshot) => {
              const timeLogs: any[] = [];
              timeSnapshot.forEach((doc) => {
                timeLogs.push({ id: doc.id, ...doc.data() });
              });
              setSystemLogs(timeLogs);
              setLogsLoading(false);
            }).catch(() => {
              setSystemLogs([]);
              setLogsLoading(false);
            });
          } else {
            setSystemLogs(fbLogs);
            setLogsLoading(false);
          }
        }).catch(() => {
          setSystemLogs([]);
          setLogsLoading(false);
        });
      } else {
        setSystemLogs(fetchedLogs);
        setLogsLoading(false);
      }
    }, (err) => {
      console.warn("Error loading systemLogs with createdAt, falling back:", err);
      const qFallback = query(logsRef, orderBy("dbTimestamp", "desc"), limit(100));
      getDocs(qFallback).then((fallbackSnapshot) => {
        const fbLogs: any[] = [];
        fallbackSnapshot.forEach((doc) => {
          fbLogs.push({ id: doc.id, ...doc.data() });
        });
        setSystemLogs(fbLogs);
        setLogsLoading(false);
      }).catch((err2) => {
        console.error("Fallback query failed:", err2);
        const qFallbackTime = query(logsRef, orderBy("timestamp", "desc"), limit(100));
        getDocs(qFallbackTime).then((timeSnapshot) => {
          const timeLogs: any[] = [];
          timeSnapshot.forEach((doc) => {
            timeLogs.push({ id: doc.id, ...doc.data() });
          });
          setSystemLogs(timeLogs);
          setLogsLoading(false);
        }).catch(() => {
          setSystemLogs([]);
          setLogsLoading(false);
        });
      });
    });

    return () => unsubscribe();
  }, [activeTab]);

  const handleSaveObjectif = async (siteId: string) => {
    const vals = editedTargets[siteId];
    if (!vals) return;

    try {
      const dispoNum = vals.dispoTarget.trim() === "" ? null : Number(vals.dispoTarget);
      const mttrNum = vals.mttrTarget.trim() === "" ? null : Number(vals.mttrTarget);
      const complianceNum = vals.complianceTarget.trim() === "" ? null : Number(vals.complianceTarget);
      const coutNum = vals.coutTarget.trim() === "" ? null : Number(vals.coutTarget);

      // Validate numbers if they are not null
      if (dispoNum !== null && (isNaN(dispoNum) || dispoNum < 0 || dispoNum > 100)) {
        toast.error("La disponibilité doit être un nombre entre 0 et 100.");
        return;
      }
      if (mttrNum !== null && (isNaN(mttrNum) || mttrNum < 0)) {
        toast.error("Le MTTR doit être un nombre positif.");
        return;
      }
      if (complianceNum !== null && (isNaN(complianceNum) || complianceNum < 0 || complianceNum > 100)) {
        toast.error("La conformité PM doit être un nombre entre 0 et 100.");
        return;
      }
      if (coutNum !== null && (isNaN(coutNum) || coutNum < 0)) {
        toast.error("Le coût horaire doit être un nombre positif.");
        return;
      }

      const docData = {
        dispoTarget: dispoNum,
        mttrTarget: mttrNum,
        complianceTarget: complianceNum,
        coutTarget: coutNum,
        updatedAt: Timestamp.now(),
        updatedBy: user?.displayName || user?.email || "Responsable Maintenance"
      };

      await dbService.objectifsSites.set(siteId, docData);
      toast.success(`Objectifs pour le site ${siteId} enregistrés avec succès !`);
    } catch (err: any) {
      console.error("Error saving site objectives: ", err);
      toast.error(`Erreur d'enregistrement : ${err.message}`);
    }
  };

  // États de diagnostic "Santé des Données"
  const [diagnosticLoading, setDiagnosticLoading] = React.useState(false);
  const [diagnosticRun, setDiagnosticRun] = React.useState(false);
  const [diagnosticResults, setDiagnosticResults] = React.useState<{
    wrongEngins: any[];
    wrongMecs: any[];
    invalidSites: any[];
    missingSites: any[];
  } | null>(null);

  // RECONSTRUIT : Données stockées localement
  const [unapprovedUsers, setUnapprovedUsers] = React.useState<any[]>([]);
  const [engins, setEngins] = React.useState<Engin[]>([]);
  const [mecaniciens, setMecaniciens] = React.useState<Mecanicien[]>([]);
  const [chantiers, setChantiers] = React.useState<Chantier[]>([]);
  const [intervalles, setIntervalles] = React.useState<IntervalleMaintenance[]>([]);

  // RECONSTRUIT : États de filtrage & recherche
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterOption1, setFilterOption1] = React.useState("Tous");
  const [filterOption2, setFilterOption2] = React.useState("Tous");

  // RECONSTRUIT : États des modals (Ajout/Modification)
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any | null>(null);

  // RECONSTRUIT : États de suppression et confirmation
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);

  // RECONSTRUIT : Indicateur visuel simple de chargement
  const [loading, setLoading] = React.useState(true);


  // RECONSTRUIT : Lecture Firestore en temps réel via onSnapshot
  React.useEffect(() => {
    setLoading(true);

    const getMs = (val: any) => {
      if (!val) return 0;
      if (typeof val.toMillis === 'function') return val.toMillis();
      if (typeof val.toDate === 'function') return val.toDate().getTime();
      if (typeof val.seconds === 'number') return val.seconds * 1000;
      const d = new Date(val).getTime();
      return isNaN(d) ? 0 : d;
    };

    // 1. ENGINS
    let qEngins = query(collection(db, 'engins'));
    if (user?.role !== 'ADMIN' && user?.role !== 'DIRECTION') {
      qEngins = query(collection(db, 'engins'), where('siteId', '==', user?.siteId || 'SMI'));
    }
    const unsubEngins = onSnapshot(qEngins, (snap) => {
      const allData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      const data = allData.filter(e => !e.deleted) as Engin[];
      data.sort((a: any, b: any) => {
        const tA = getMs(a.updatedAt);
        const tB = getMs(b.updatedAt);
        return tB - tA;
      });
      setEngins(data);
    }, (err) => {
      console.error(err);
      toast.error("Erreur de chargement des engins.");
    });

    // 2. MECANICIENS
    let qMecaniciens = query(collection(db, 'mecaniciens'));
    if (user?.role !== 'ADMIN' && user?.role !== 'DIRECTION') {
      qMecaniciens = query(collection(db, 'mecaniciens'), where('siteId', '==', user?.siteId || 'SMI'));
    }
    const unsubMecaniciens = onSnapshot(qMecaniciens, (snap) => {
      const allData = snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          nomComplet: d.nomComplet || `${d.prenom || ""} ${d.nom || ""}`.trim() || doc.id,
          statut: d.statut || (d.active !== false ? "Actif" : "Inactif")
        };
      }) as any[];
      const data = allData.filter(m => !m.deleted) as Mecanicien[];
      data.sort((a: any, b: any) => {
        const tA = getMs(a.updatedAt);
        const tB = getMs(b.updatedAt);
        return tB - tA;
      });
      setMecaniciens(data);
    }, (err) => {
      console.error(err);
      toast.error("Erreur de chargement des mécaniciens.");
    });

    // 3. CHANTIERS
    const unsubChantiers = onSnapshot(query(collection(db, 'chantiers')), (snap) => {
      let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      data = data.filter(c => !c.deleted) as Chantier[];
      if (user?.role !== 'ADMIN' && user?.role !== 'DIRECTION') {
        data = data.filter(c => c.id === (user?.siteId || 'SMI'));
      }
      data.sort((a: any, b: any) => {
        const tA = getMs(a.updatedAt);
        const tB = getMs(b.updatedAt);
        return tB - tA;
      });
      setChantiers(data);
    }, (err) => {
      console.error(err);
      toast.error("Erreur de chargement des chantiers.");
    });

    // 4. INTERVALLES
    const unsubIntervalles = onSnapshot(query(collection(db, 'pmIntervalles')), (snap) => {
      const allData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      const data = allData.filter(i => !i.deleted) as IntervalleMaintenance[];
      data.sort((a: any, b: any) => {
        const tA = getMs(a.updatedAt);
        const tB = getMs(b.updatedAt);
        return tB - tA;
      });
      setIntervalles(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Erreur de chargement des intervalles.");
      setLoading(false);
    });

    // 5. COMPTES UTILISATEURS EN ATTENTE
    const qUsers = query(collection(db, 'users'), where('active', '==', false));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const data = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      setUnapprovedUsers(data);
    }, (err) => {
      console.error(err);
      toast.error("Erreur de chargement des comptes en attente.");
    });

    return () => {
      unsubEngins();
      unsubMecaniciens();
      unsubChantiers();
      unsubIntervalles();
      unsubUsers();
    };
  }, [user]);

  // RECONSTRUIT : Réinitialiser la recherche lors du changement d'onglet
  React.useEffect(() => {
    setSearchQuery("");
    setFilterOption1("Tous");
    setFilterOption2("Tous");
  }, [activeTab]);

  // ==========================================
  // LOGIQUE DE CRUD : ENGINS
  // ==========================================
  const handleSaveEngin = async (data: Partial<Engin>) => {
    if (!data.id || !data.heuresMarche) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const selectedEtat = data.etat || "Opérationnel";
      let resolvedStatut = "actif";
      let resolvedDispo = 100;
      let resolvedStatus = "DISPONIBLE";

      if (selectedEtat === "En maintenance") {
        resolvedStatut = "maintenance";
        resolvedDispo = 50;
        resolvedStatus = "EN_MAINTENANCE";
      } else if (selectedEtat === "Hors service") {
        resolvedStatut = "panne";
        resolvedDispo = 0;
        resolvedStatus = "EN_PANNE";
      } else if (selectedEtat === "Vendu") {
        resolvedStatut = "vendu";
        resolvedDispo = 0;
        resolvedStatus = "RESTREINT";
      }

      if (editingItem) {
        const payload = {
          modele: data.modele || "ST2G",
          marque: data.marque || "Epiroc",
          type: data.type || "Scooptram",
          siteId: data.siteId || "SMI",
          heuresMarche: Number(data.heuresMarche) || 0,
          dateEntreeService: data.dateEntreeService || getLocalDateString(),
          etat: selectedEtat,
          statut: resolvedStatut,
          status: resolvedStatus,
          dispo: resolvedDispo,
          conducteurAssigne: data.conducteurAssigne || "Non assigné",
          updatedAt: Timestamp.now()
        };
        await dbService.engines.update(editingItem.id, payload);
        toast.success(`Engin ${editingItem.id} mis à jour avec succès !`);
      } else {
        if (engins.some(e => (e.id || "").toLowerCase() === (data.id || "").toLowerCase())) {
          toast.error(`Le N° de Parc ${data.id} existe déjà.`);
          return;
        }
        const payload = {
          id: data.id,
          modele: data.modele || "ST2G",
          marque: data.marque || "Epiroc",
          type: data.type || "Scooptram",
          siteId: data.siteId || "SMI",
          heuresMarche: Number(data.heuresMarche) || 0,
          dateEntreeService: data.dateEntreeService || getLocalDateString(),
          etat: selectedEtat,
          statut: resolvedStatut,
          status: resolvedStatus,
          dispo: resolvedDispo,
          conducteurAssigne: data.conducteurAssigne || "Non assigné",
          deleted: false,
          updatedAt: Timestamp.now()
        };
        await dbService.engines.create(data.id, payload);
        toast.success(`Engin ${data.id} ajouté avec succès !`);
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de connexion Firestore. Vérifiez votre réseau.");
    }
  };

  const handleDeleteEngin = async (id: string) => {
    try {
      await dbService.engines.update(id, {
        deleted: true,
        updatedAt: Timestamp.now()
      });
      toast.success(`L'engin ${id} a été supprimé.`);
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de connexion Firestore. Vérifiez votre réseau.");
    }
  };

  // ==========================================
  // LOGIQUE DE CRUD : MÉCANICIENS
  // ==========================================
  const handleSaveMecanicien = async (data: Partial<Mecanicien>) => {
    if (!data.nomComplet || !data.id) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      if (editingItem) {
        const payload = {
          nomComplet: data.nomComplet,
          poste: data.poste || "Poste 1",
          specialite: data.specialite || "Généraliste",
          telephone: data.telephone || "",
          dateEmbauche: data.dateEmbauche || getLocalDateString(),
          statut: data.statut || "Actif",
          siteId: data.siteId || "SMI"
        };
        await dbService.mecaniciens.set(editingItem.id, payload);
        toast.success(`Mécanicien ${data.nomComplet} mis à jour !`);
      } else {
        if (mecaniciens.some(m => (m.id || "").toLowerCase() === (data.id || "").toLowerCase())) {
          toast.error(`Le matricule ${data.id} existe déjà.`);
          return;
        }
        const payload = {
          id: data.id,
          nomComplet: data.nomComplet,
          poste: data.poste || "Poste 1",
          specialite: data.specialite || "Généraliste",
          telephone: data.telephone || "",
          dateEmbauche: data.dateEmbauche || getLocalDateString(),
          statut: data.statut || "Actif",
          siteId: data.siteId || "SMI",
          deleted: false
        };
        await dbService.mecaniciens.set(data.id, payload);
        toast.success(`Mécanicien ${data.nomComplet} enregistré avec succès !`);
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de connexion Firestore. Vérifiez votre réseau.");
    }
  };

  const handleDeleteMecanicien = async (id: string) => {
    try {
      await dbService.mecaniciens.set(id, {
        deleted: true
      });
      toast.success(`Le mécanicien a été supprimé.`);
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de connexion Firestore. Vérifiez votre réseau.");
    }
  };

  // ==========================================
  // LOGIQUE DE CRUD : CHANTIERS
  // ==========================================
  const handleSaveChantier = async (data: Partial<Chantier>) => {
    if (!data.id || !data.nomComplet) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const docId = data.id.toUpperCase();

    try {
      if (editingItem) {
        const payload = {
          nomComplet: data.nomComplet,
          type: data.type || "Mine souterraine",
          localisation: data.localisation || "",
          responsableId: data.responsableId || "",
          statut: data.statut || "Actif"
        };
        await dbService.chantiers.update(editingItem.id, payload);
        toast.success(`Chantier ${data.nomComplet} mis à jour.`);
      } else {
        if (chantiers.some(c => c.id.toUpperCase() === docId)) {
          toast.error(`Le code chantier ${data.id} existe déjà.`);
          return;
        }
        const payload = {
          id: docId,
          nomComplet: data.nomComplet,
          type: data.type || "Mine souterraine",
          localisation: data.localisation || "",
          responsableId: data.responsableId || "",
          statut: data.statut || "Actif",
          deleted: false
        };
        await dbService.chantiers.set(docId, payload);
        toast.success(`Chantier ${data.nomComplet} créé avec succès !`);
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de connexion Firestore. Vérifiez votre réseau.");
    }
  };

  const handleDeleteChantier = async (id: string) => {
    try {
      await dbService.chantiers.update(id, {
        deleted: true
      });
      toast.success(`Le chantier ${id} a été supprimé.`);
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de connexion Firestore. Vérifiez votre réseau.");
    }
  };

  // ==========================================
  // LOGIQUE DE CRUD : INTERVALLES
  // ==========================================
  const handleSaveIntervalle = async (data: Partial<IntervalleMaintenance>) => {
    if (!data.operation || !data.intervalleHeures) {
      toast.error("Veuillez remplir les champs obligatoires.");
      return;
    }

    try {
      if (editingItem) {
        const payload = {
          typeEngin: data.typeEngin || "Générique",
          operation: data.operation,
          intervalleHeures: Number(data.intervalleHeures),
          produitHuile: data.produitHuile || "N/A",
          quantite: data.quantite || "N/A",
          priorite: data.priorite || "Normale"
        };
        await dbService.pmIntervalles.update(editingItem.id, payload);
        toast.success("Intervalle de maintenance mis à jour.");
      } else {
        const payload = {
          typeEngin: data.typeEngin || "Générique",
          operation: data.operation,
          intervalleHeures: Number(data.intervalleHeures),
          produitHuile: data.produitHuile || "N/A",
          quantite: data.quantite || "N/A",
          priorite: data.priorite || "Normale",
          deleted: false
        };
        await dbService.pmIntervalles.create(payload);
        toast.success("Nouvel intervalle de maintenance ajouté !");
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de connexion Firestore. Vérifiez votre réseau.");
    }
  };

  const handleDeleteIntervalle = async (id: string) => {
    try {
      await dbService.pmIntervalles.update(id, {
        deleted: true
      });
      toast.success("L'intervalle a été supprimé.");
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de connexion Firestore. Vérifiez votre réseau.");
    }
  };

  // ==========================================
  // EXPORT DE DONNÉES EN CSV
  // ==========================================
  const exportToCSV = () => {
    let csvRows: string[] = [];
    
    if (activeTab === "engins") {
      csvRows.push("No Parc,Modele,Marque,Type,Site,Heures de Marche,Entree en Service,Etat,Conducteur");
      engins.forEach(e => {
        csvRows.push([
          e.id,
          e.modele,
          e.marque,
          e.type,
          e.siteId,
          e.heuresMarche,
          e.dateEntreeService,
          e.etat,
          e.conducteurAssigne
        ].map(escapeCsvField).join(","));
      });
    } else if (activeTab === "mecaniciens") {
      csvRows.push("Matricule,Nom Complet,Poste,Specialite,Telephone,Embauche,Statut,Site");
      mecaniciens.forEach(m => {
        csvRows.push([
          m.id,
          m.nomComplet,
          m.poste,
          m.specialite,
          m.telephone,
          m.dateEmbauche,
          m.statut,
          m.siteId || ''
        ].map(escapeCsvField).join(","));
      });
    } else if (activeTab === "chantiers") {
      csvRows.push("Code,Nom Complet,Type,Localisation,Responsable,Statut");
      chantiers.forEach(c => {
        csvRows.push([
          c.id,
          c.nomComplet,
          c.type,
          c.localisation,
          c.responsableId,
          c.statut
        ].map(escapeCsvField).join(","));
      });
    } else {
      csvRows.push("Type Engin,Operation,Intervalle (heures),Huile/Produit,Quantite,Priorite");
      intervalles.forEach(i => {
        csvRows.push([
          i.typeEngin,
          i.operation,
          i.intervalleHeures,
          i.produitHuile,
          i.quantite,
          i.priorite
        ].map(escapeCsvField).join(","));
      });
    }

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `export_${activeTab}_hydromines_espace_maintenance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Fichier CSV généré avec succès !");
  };

  // ==========================================
  // FILTRAGE EN TEMPS RÉEL DES DONNÉES
  // ==========================================
  const getFilteredData = () => {
    const q = searchQuery.toLowerCase();

    if (activeTab === "engins") {
      return engins.filter(e => {
        const matchesQuery = (e.id || "").toLowerCase().includes(q) || (e.modele || "").toLowerCase().includes(q) || (e.conducteurAssigne || "").toLowerCase().includes(q);
        const matchesChantier = filterOption1 === "Tous" || e.siteId === filterOption1;
        const currentEtat = e.statut !== undefined 
          ? (e.statut === "actif" ? "Opérationnel" : e.statut === "maintenance" ? "En maintenance" : "Hors service")
          : e.etat;
        const matchesEtat = filterOption2 === "Tous" || currentEtat === filterOption2;
        return matchesQuery && matchesChantier && matchesEtat;
      });
    }

    if (activeTab === "mecaniciens") {
      return mecaniciens.filter(m => {
        const matchesQuery = (m.nomComplet || "").toLowerCase().includes(q) || (m.id || "").toLowerCase().includes(q) || (m.specialite || "").toLowerCase().includes(q);
        const matchesPoste = filterOption1 === "Tous" || m.poste === filterOption1;
        const matchesStatut = filterOption2 === "Tous" || m.statut === filterOption2;
        return matchesQuery && matchesPoste && matchesStatut;
      });
    }

    if (activeTab === "chantiers") {
      return chantiers.filter(c => {
        const matchesQuery = (c.nomComplet || "").toLowerCase().includes(q) || (c.id || "").toLowerCase().includes(q) || (c.localisation || "").toLowerCase().includes(q);
        const matchesType = filterOption1 === "Tous" || c.type === filterOption1;
        const matchesStatut = filterOption2 === "Tous" || c.statut === filterOption2;
        return matchesQuery && matchesType && matchesStatut;
      });
    }

    // Intervalles
    return intervalles.filter(i => {
      const matchesQuery = (i.operation || "").toLowerCase().includes(q) || (i.produitHuile || "").toLowerCase().includes(q);
      const matchesType = filterOption1 === "Tous" || i.typeEngin === filterOption1;
      const matchesPriorite = filterOption2 === "Tous" || i.priorite === filterOption2;
      return matchesQuery && matchesType && matchesPriorite;
    });
  };

  const filteredData = getFilteredData();

  // ==========================================
  // STATISTIQUES EN HAUT DES ONGLETS
  // ==========================================
  const renderStats = () => {
    if (activeTab === "engins") {
      const total = engins.length;
      const operationnels = engins.filter(e => {
        if (e.statut !== undefined) return e.statut === "actif";
        return e.etat === "Opérationnel";
      }).length;
      const maintenance = engins.filter(e => {
        if (e.statut !== undefined) return e.statut === "maintenance";
        return e.etat === "En maintenance";
      }).length;
      const hs = engins.filter(e => {
        if (e.statut !== undefined) return e.statut === "panne" || e.statut === "hors service" || e.statut === "arrêté";
        return e.etat === "Hors service";
      }).length;

      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-slate-500 uppercase">Total Engins</p>
                <p className="text-2xl font-black text-slate-900 m-0">{total}</p>
              </div>
              <Cpu className="h-8 w-8 text-amber-500/30" />
            </div>
          </Card>
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-600 uppercase">Opérationnels</p>
                <p className="text-2xl font-black text-emerald-600 m-0">{operationnels}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500/20" />
            </div>
          </Card>
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-amber-600 uppercase">En Maintenance</p>
                <p className="text-2xl font-black text-amber-600 m-0">{maintenance}</p>
              </div>
              <Wrench className="h-8 w-8 text-amber-500/20" />
            </div>
          </Card>
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-rose-600 uppercase">Hors Service</p>
                <p className="text-2xl font-black text-rose-600 m-0">{hs}</p>
              </div>
              <X className="h-8 w-8 text-rose-500/20" />
            </div>
          </Card>
        </div>
      );
    }

    if (activeTab === "mecaniciens") {
      const total = mecaniciens.length;
      const p1 = mecaniciens.filter(m => m.poste === "Poste 1").length;
      const p2 = mecaniciens.filter(m => m.poste === "Poste 2").length;
      const p3 = mecaniciens.filter(m => m.poste === "Poste 3").length;

      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-slate-500 uppercase">Total Équipe</p>
                <p className="text-2xl font-black text-slate-900 m-0">{total}</p>
              </div>
              <Users className="h-8 w-8 text-amber-500/30" />
            </div>
          </Card>
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-[#4FC3F7] uppercase">Poste 1</p>
                <p className="text-2xl font-black text-slate-900 m-0">{p1}</p>
              </div>
              <User className="h-8 w-8 text-sky-500/20" />
            </div>
          </Card>
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-teal-600 uppercase">Poste 2</p>
                <p className="text-2xl font-black text-teal-600 m-0">{p2}</p>
              </div>
              <User className="h-8 w-8 text-teal-500/20" />
            </div>
          </Card>
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-violet-600 uppercase">Poste 3</p>
                <p className="text-2xl font-black text-violet-600 m-0">{p3}</p>
              </div>
              <User className="h-8 w-8 text-violet-500/20" />
            </div>
          </Card>
        </div>
      );
    }

    if (activeTab === "chantiers") {
      const total = chantiers.length;
      const actifs = chantiers.filter(c => c.statut === "Actif").length;
      const prep = chantiers.filter(c => c.statut === "En préparation").length;
      const inactifs = chantiers.filter(c => c.statut === "Inactif").length;

      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-slate-500 uppercase">Total Chantiers</p>
                <p className="text-2xl font-black text-slate-900 m-0">{total}</p>
              </div>
              <MapPin className="h-8 w-8 text-amber-500/30" />
            </div>
          </Card>
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-600 uppercase">Actifs</p>
                <p className="text-2xl font-black text-emerald-600 m-0">{actifs}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500/20" />
            </div>
          </Card>
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-amber-600 uppercase">En Préparation</p>
                <p className="text-2xl font-black text-amber-600 m-0">{prep}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/20" />
            </div>
          </Card>
          <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
            <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-rose-600 uppercase">Inactifs</p>
                <p className="text-2xl font-black text-rose-600 m-0">{inactifs}</p>
              </div>
              <X className="h-8 w-8 text-rose-500/20" />
            </div>
          </Card>
        </div>
      );
    }

    // Intervalles
    const total = intervalles.length;
    const critiques = intervalles.filter(i => i.priorite === "Critique").length;
    const hautes = intervalles.filter(i => i.priorite === "Haute").length;
    const normales = intervalles.filter(i => i.priorite === "Normale").length;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
          <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-slate-500 uppercase">Total Intervalles</p>
              <p className="text-2xl font-black text-slate-900 m-0">{total}</p>
            </div>
            <Gauge className="h-8 w-8 text-amber-500/30" />
          </div>
        </Card>
        <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
          <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-rose-600 uppercase">Critiques (Réglementaires)</p>
              <p className="text-2xl font-black text-rose-600 m-0">{critiques}</p>
            </div>
            <Shield className="h-8 w-8 text-rose-500/20" />
          </div>
        </Card>
        <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
          <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-amber-600 uppercase">Priorité Haute</p>
              <p className="text-2xl font-black text-amber-600 m-0">{hautes}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500/20" />
          </div>
        </Card>
        <Card className="bg-slate-50 border-2 border-amber-500 rounded-xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
          <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-blue-600 uppercase">Priorité Normale</p>
              <p className="text-2xl font-black text-blue-600 m-0">{normales}</p>
            </div>
            <Settings className="h-8 w-8 text-blue-500/20" />
          </div>
        </Card>
      </div>
    );
  };

  // RECONSTRUIT : Calcul auto du nombre d'engins assignés à un chantier
  const getEnginsCountForChantier = (chantierId: string) => {
    return engins.filter(e => e.siteId === chantierId).length;
  };

  const SITE_LABELS: Record<string, string> = {
    SMI: "SMI (Imiter)",
    OUMEJRANE: "Oumejrane",
    KOUDIA: "Koudiat Aïcha",
    "KOUDIAT AICHA": "Koudiat Aïcha",
    OUANSIMI: "Ouansimi",
    "BOU-AZZER": "Bou-Azzer"
  };

  const ROLE_LABELS: Record<string, string> = {
    ADMIN: "Admin / Dir. Technique",
    DIRECTION: "Direction / Dir. Général",
    RESPONSABLE_MAINTENANCE: "Resp. Maintenance",
    RESPONSABLE_CHANTIER: "Resp. / Chef Chantier",
    MECANICIEN: "Mécanicien",
    SECRETAIRE: "Secrétaire Chantier"
  };

  const handleApproveUser = async (userToApprove: any) => {
    if (user?.role !== 'ADMIN') {
      toast.error("Seul un Administrateur est autorisé à approuver les comptes.");
      return;
    }
    try {
      const roleToSet = userToApprove.requestedRole || userToApprove.role || 'MECANICIEN';
      await dbService.users.update(userToApprove.uid, {
        role: roleToSet,
        active: true,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Le compte de ${userToApprove.displayName} a été approuvé avec le rôle ${ROLE_LABELS[roleToSet] || roleToSet}.`);
    } catch (err: any) {
      console.error("Error approving user:", err);
      toast.error(`Erreur d'approbation du compte : ${err.message}`);
    }
  };

  const handleRejectUser = async (userToReject: any) => {
    if (user?.role !== 'ADMIN') {
      toast.error("Seul un Administrateur est autorisé à rejeter les comptes.");
      return;
    }
    if (!confirm(`Voulez-vous vraiment rejeter et supprimer la demande de ${userToReject.displayName} ?`)) {
      return;
    }
    try {
      await dbService.users.set(userToReject.uid, {
        ...userToReject,
        active: false,
        rejected: true,
        updatedAt: new Date().toISOString()
      });
      toast.success(`La demande de ${userToReject.displayName} a été rejetée.`);
    } catch (err: any) {
      console.error("Error rejecting user:", err);
      toast.error(`Erreur lors du rejet : ${err.message}`);
    }
  };

  const renderUserApprovals = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border-2 border-amber-500 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
              <span>🔑</span> Approbations des Comptes d'Agents
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Validation sécuritaire des habilitations et rôles des collaborateurs avant ouverture d'accès à HYDROMINES - Espace Maintenance.
            </p>
          </div>
          <Badge className="bg-amber-100 text-amber-900 font-mono text-[10px] uppercase font-bold border-amber-200">
            {unapprovedUsers.length} en attente
          </Badge>
        </div>

        <Card className="border-2 border-amber-500 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
          <CardContent className="p-0 pt-1.5">
            {unapprovedUsers.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/30" />
                <p className="font-bold text-sm text-slate-700">Aucun compte en attente d'approbation</p>
                <p className="text-xs max-w-xs mx-auto text-slate-400">Tous les agents enregistrés disposent de fiches actives ou validées.</p>
              </div>
            ) : (
              <div className="overflow-x-auto animate-fade-in">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-sky-100/80 border-b-2 border-rose-900/40 text-rose-950 font-mono text-[9px] uppercase tracking-wider font-black">
                      <th className="py-3.5 px-5">Agent de mine</th>
                      <th className="py-3.5 px-5">Email</th>
                      <th className="py-3.5 px-5">Rôle demandé (Habilitation)</th>
                      <th className="py-3.5 px-5">Site d'affectation</th>
                      <th className="py-3.5 px-5">Date d'inscription</th>
                      <th className="py-3.5 px-5 text-right">Actions de direction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    {unapprovedUsers.map((u) => {
                      const reqRole = u.requestedRole || u.role || "MECANICIEN";
                      const dateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString([], {dateStyle: 'medium'}) : "Non spécifiée";
                      return (
                        <tr key={u.uid} className="hover:bg-slate-50/50 transition-all">
                          {/* Name / Display Name */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-150 border border-slate-250 flex-shrink-0 flex items-center justify-center font-mono font-bold text-slate-600">
                                {u.displayName ? u.displayName.substring(0, 2).toUpperCase() : "??"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{u.displayName || "Sans Nom"}</p>
                                <span className="text-[10px] font-mono text-slate-400 uppercase">UID: {u.uid.substring(0, 8)}...</span>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-4 px-5 font-mono text-xs text-slate-600">
                            {u.email}
                          </td>

                          {/* Requested Role */}
                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-200 text-amber-700 bg-amber-50/50 text-[10px] font-bold uppercase tracking-wide">
                              <Shield className="w-3.5 h-3.5 text-amber-600" />
                              {ROLE_LABELS[reqRole] || reqRole}
                            </span>
                          </td>

                          {/* Site Id */}
                          <td className="py-4 px-5">
                            <span className="font-bold text-slate-800 text-xs">
                              {SITE_LABELS[u.siteId] || u.siteId || "Tous les chantiers"}
                            </span>
                          </td>

                          {/* Created Date */}
                          <td className="py-4 px-5 text-slate-500 text-xs">
                            {dateStr}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                onClick={() => handleApproveUser(u)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3.5 rounded-xl gap-1"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approuver
                              </Button>
                              <Button
                                onClick={() => handleRejectUser(u)}
                                variant="outline"
                                className="border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3.5 rounded-xl gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                Rejeter
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const handleRunDiagnostic = async () => {
    setDiagnosticLoading(true);
    try {
      // Lecture ponctuelle de maintenanceTasks et pannes
      const tasksSnap = await getDocs(collection(db, "maintenanceTasks"));
      const pannesSnap = await getDocs(collection(db, "pannes"));
      
      const tasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const pannes = pannesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const validSites = ["SMI", "OUMEJRANE", "KOUDIA", "OUANSIMI", "BOU-AZZER"];
      
      // 1. Engins avec ID technique ≠ matricule
      const wrongEngins = engins.filter((e: any) => e.id && e.matricule && e.id !== e.matricule);
      
      // 2. Mécaniciens avec ID technique ≠ matricule
      const wrongMecs = mecaniciens.filter((m: any) => m.uid && m.matricule && m.uid !== m.matricule);
      
      // 3. Sites invalides
      const invalidSites: any[] = [];
      const checkSiteInvalid = (doc: any, collectionName: string) => {
        const sId = doc.siteId !== undefined ? doc.siteId : doc.site;
        if (sId !== undefined && sId !== null && String(sId).trim() !== "") {
          if (!validSites.includes(String(sId).trim())) {
            invalidSites.push({
              collection: collectionName,
              id: doc.id,
              siteValue: String(sId),
              docDesc: doc.matricule || doc.nomComplet || doc.nom || doc.description || doc.id
            });
          }
        }
      };
      
      // 4. Site manquant
      const missingSites: any[] = [];
      const checkSiteMissing = (doc: any, collectionName: string) => {
        const sId = doc.siteId;
        if (sId === undefined || sId === null || String(sId).trim() === "") {
          missingSites.push({
            collection: collectionName,
            id: doc.id,
            docDesc: doc.matricule || doc.nomComplet || doc.nom || doc.description || doc.id
          });
        }
      };
      
      // Analyse des 4 collections
      engins.forEach(e => {
        checkSiteInvalid(e, "engins");
        checkSiteMissing(e, "engins");
      });
      
      mecaniciens.forEach(m => {
        checkSiteInvalid(m, "mecaniciens");
        checkSiteMissing(m, "mecaniciens");
      });
      
      tasks.forEach(t => {
        checkSiteInvalid(t, "maintenanceTasks");
        checkSiteMissing(t, "maintenanceTasks");
      });
      
      pannes.forEach(p => {
        checkSiteInvalid(p, "pannes");
        checkSiteMissing(p, "pannes");
      });
      
      setDiagnosticResults({
        wrongEngins,
        wrongMecs,
        invalidSites,
        missingSites
      });
      setDiagnosticRun(true);
      toast.success("Diagnostic de la base de données terminé !");
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur durant le diagnostic : " + error.message);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const handleCopySection = (title: string, list: any[], formatter: (item: any) => string) => {
    if (list.length === 0) {
      toast.info("La liste est vide, rien à copier.");
      return;
    }
    const text = list.map(formatter).join("\n");
    navigator.clipboard.writeText(`${title}:\n${text}`);
    toast.success("Liste copiée avec succès !");
  };

  const renderSanteDonnees = () => {
    const results = diagnosticResults;
    const formatWrongEngin = (e: any) => `- N° Parc/Matricule: ${e.matricule || "N/A"}, ID Firestore: ${e.id || "N/A"}, Site: ${e.siteId || e.site || "N/A"}`;
    const formatWrongMec = (m: any) => `- Nom: ${m.nomComplet || `${m.prenom || ""} ${m.nom || ""}`.trim() || "N/A"}, Matricule: ${m.matricule || "N/A"}, UID Firestore: ${m.uid || m.id || "N/A"}, Site: ${m.siteId || "N/A"}`;
    const formatInvalidSite = (x: any) => `- Collection: ${x.collection}, ID: ${x.id}, Valeur site trouvée: "${x.siteValue}"`;
    const formatMissingSite = (x: any) => `- Collection: ${x.collection}, ID: ${x.id}, Description/Matricule: ${x.docDesc || "N/A"}`;

    return (
      <div className="space-y-6">
        <Card className="bg-white border-2 border-amber-500/20 shadow-md rounded-xl overflow-hidden animate-fade-in" id="card-sante-donnees">
          <CardHeader className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-slate-100 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-amber-500" />
                  Diagnostic de Santé des Données Firestore
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Examine la cohérence structurelle des identifiants (Matricule vs Firestore ID) et valide les codes sites.
                </p>
              </div>
              <Button
                onClick={handleRunDiagnostic}
                disabled={diagnosticLoading}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
                id="btn-run-diagnostic"
              >
                {diagnosticLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Diagnostic en cours...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 animate-pulse" />
                    Lancer le diagnostic
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {!diagnosticRun ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <ShieldAlert className="h-12 w-12 text-amber-500/40" />
                <p className="text-sm font-semibold text-slate-700">Aucun diagnostic n'a encore été lancé.</p>
                <p className="text-xs text-slate-400 max-w-md">
                  Cliquez sur le bouton "Lancer le diagnostic" pour charger et analyser les collections d'engins, mécaniciens, tâches et pannes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                
                {/* 1. Engins avec ID ≠ matricule */}
                <Card className="border border-slate-200 rounded-xl overflow-hidden" id="section-wrong-engins">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">1. Engins avec ID technique ≠ matricule</span>
                      {results && results.wrongEngins.length > 0 ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {results.wrongEngins.length} anomalie{results.wrongEngins.length > 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          Aucune anomalie
                        </Badge>
                      )}
                    </div>
                    {results && results.wrongEngins.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopySection("Engins avec ID ≠ matricule", results.wrongEngins, formatWrongEngin)}
                        className="h-8 text-xs flex items-center gap-1.5"
                        id="btn-copy-wrong-engins"
                      >
                        <Copy className="h-3 w-3" /> Copier la liste
                      </Button>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-500 mb-3">
                      Ces engins ont été créés par un ancien formulaire avec un système d'ID différent (l'ID du document Firestore ne correspond pas au matricule saisi).
                    </p>
                    {results && results.wrongEngins.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 uppercase font-mono font-bold">
                            <tr>
                              <th className="py-2.5 px-3">Matricule</th>
                              <th className="py-2.5 px-3">ID Firestore Réel</th>
                              <th className="py-2.5 px-3">Site</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                            {results.wrongEngins.map((e: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 font-bold text-slate-950">{e.matricule || "N/A"}</td>
                                <td className="py-2 px-3 text-red-600 font-bold">{e.id || "N/A"}</td>
                                <td className="py-2 px-3">{e.siteId || e.site || "N/A"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-slate-400">Aucun engin concerné.</div>
                    )}
                  </div>
                </Card>

                {/* 2. Mécaniciens avec ID ≠ matricule */}
                <Card className="border border-slate-200 rounded-xl overflow-hidden" id="section-wrong-mecs">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">2. Mécaniciens avec ID technique ≠ matricule</span>
                      {results && results.wrongMecs.length > 0 ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {results.wrongMecs.length} anomalie{results.wrongMecs.length > 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          Aucune anomalie
                        </Badge>
                      )}
                    </div>
                    {results && results.wrongMecs.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopySection("Mécaniciens avec ID ≠ matricule", results.wrongMecs, formatWrongMec)}
                        className="h-8 text-xs flex items-center gap-1.5"
                        id="btn-copy-wrong-mecs"
                      >
                        <Copy className="h-3 w-3" /> Copier la liste
                      </Button>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-500 mb-3">
                      Ces mécaniciens possèdent un UID différent de leur matricule dans la base, lié aux anciens systèmes d'ID générés aléatoirement.
                    </p>
                    {results && results.wrongMecs.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 uppercase font-mono font-bold">
                            <tr>
                              <th className="py-2.5 px-3">Nom</th>
                              <th className="py-2.5 px-3">Matricule</th>
                              <th className="py-2.5 px-3">UID Firestore</th>
                              <th className="py-2.5 px-3">Site</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                            {results.wrongMecs.map((m: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 font-sans font-bold text-slate-900">
                                  {m.nomComplet || `${m.prenom || ""} ${m.nom || ""}`.trim() || "N/A"}
                                </td>
                                <td className="py-2 px-3 font-bold">{m.matricule || "N/A"}</td>
                                <td className="py-2 px-3 text-red-600 font-bold">{m.uid || m.id || "N/A"}</td>
                                <td className="py-2 px-3">{m.siteId || "N/A"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-slate-400">Aucun mécanicien concerné.</div>
                    )}
                  </div>
                </Card>

                {/* 3. Sites invalides */}
                <Card className="border border-slate-200 rounded-xl overflow-hidden" id="section-invalid-sites">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">3. Documents avec Sites Invalides</span>
                      {results && results.invalidSites.length > 0 ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {results.invalidSites.length} anomalie{results.invalidSites.length > 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          Aucune anomalie
                        </Badge>
                      )}
                    </div>
                    {results && results.invalidSites.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopySection("Documents avec Sites Invalides", results.invalidSites, formatInvalidSite)}
                        className="h-8 text-xs flex items-center gap-1.5"
                        id="btn-copy-invalid-sites"
                      >
                        <Copy className="h-3 w-3" /> Copier la liste
                      </Button>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-500 mb-3">
                      Documents (engins, mécaniciens, tâches ou pannes) dont le champ de site ne correspond à aucun des 5 sites standards autorisés : SMI, OUMEJRANE, KOUDIA, OUANSIMI, BOU-AZZER.
                    </p>
                    {results && results.invalidSites.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 uppercase font-mono font-bold">
                            <tr>
                              <th className="py-2.5 px-3">Collection</th>
                              <th className="py-2.5 px-3">ID Document</th>
                              <th className="py-2.5 px-3">Valeur Site Trouvée</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                            {results.invalidSites.map((x: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 font-sans font-bold text-slate-900 uppercase tracking-wider text-[10px]">{x.collection}</td>
                                <td className="py-2 px-3 text-slate-500">{x.id}</td>
                                <td className="py-2 px-3 text-red-600 font-bold">"{x.siteValue}"</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-slate-400">Aucun document avec site invalide.</div>
                    )}
                  </div>
                </Card>

                {/* 4. Site manquant */}
                <Card className="border border-slate-200 rounded-xl overflow-hidden" id="section-missing-sites">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">4. Documents avec Site Manquant</span>
                      {results && results.missingSites.length > 0 ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {results.missingSites.length} anomalie{results.missingSites.length > 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          Aucune anomalie
                        </Badge>
                      )}
                    </div>
                    {results && results.missingSites.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopySection("Documents avec Site Manquant", results.missingSites, formatMissingSite)}
                        className="h-8 text-xs flex items-center gap-1.5"
                        id="btn-copy-missing-sites"
                      >
                        <Copy className="h-3 w-3" /> Copier la liste
                      </Button>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-500 mb-3">
                      Documents n'ayant pas de champ siteId défini, vide ou null dans Firestore.
                    </p>
                    {results && results.missingSites.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 uppercase font-mono font-bold">
                            <tr>
                              <th className="py-2.5 px-3">Collection</th>
                              <th className="py-2.5 px-3">ID Document</th>
                              <th className="py-2.5 px-3">Description / Label</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                            {results.missingSites.map((x: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 font-sans font-bold text-slate-900 uppercase tracking-wider text-[10px]">{x.collection}</td>
                                <td className="py-2 px-3 text-slate-500">{x.id}</td>
                                <td className="py-2 px-3 text-red-500 italic font-sans">"{x.docDesc || "Aucun label disponible"}"</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-slate-400">Aucun document avec site manquant.</div>
                    )}
                  </div>
                </Card>

              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderLogsErreurs = () => {
    // Filter the logs in memory
    const filteredLogs = systemLogs.filter((log) => {
      if (logLevelFilter === "ALL") return true;
      return (log.level || "").toUpperCase() === logLevelFilter.toUpperCase();
    });

    const handleCopyLog = (log: any) => {
      const dateStr = log.createdAt ? (log.createdAt.toDate ? log.createdAt.toDate().toLocaleString() : new Date(log.createdAt).toLocaleString()) : (log.timestamp ? new Date(log.timestamp).toLocaleString() : "Date inconnue");
      const textToCopy = `[${log.level || 'ERROR'}] [${dateStr}] [Source: ${log.source || 'N/A'}]\nMessage: ${log.message || 'N/A'}\nStack: ${log.stack || 'Pas de trace'}\nSite: ${log.siteId || 'N/A'}\nUser: ${log.userId || 'N/A'}\nDevice: ${log.deviceInfo || 'N/A'}`;
      navigator.clipboard.writeText(textToCopy);
      toast.success("Détails du log copiés dans le presse-papiers !");
    };

    return (
      <div className="space-y-6">
        <Card className="bg-white border-2 border-red-500/20 shadow-md rounded-xl overflow-hidden animate-fade-in" id="card-logs-erreurs">
          <CardHeader className="bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border-b border-slate-100 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-600 animate-pulse" />
                  Logs d'Erreurs Applicatives (systemLogs)
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Consultez les 100 dernières anomalies et avertissements capturés automatiquement sur tous les postes clients.
                </p>
              </div>
              
              {/* Filtre par niveau */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" /> Filtrer :
                </span>
                <select
                  value={logLevelFilter}
                  onChange={(e) => setLogLevelFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                >
                  <option value="ALL">Tous les niveaux</option>
                  <option value="FATAL">FATAL</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="ERROR">ERROR</option>
                  <option value="WARNING">WARNING</option>
                  <option value="INFO">INFO</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {logsLoading ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                <p className="text-sm font-semibold text-slate-700">Chargement des logs depuis Firestore...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <CheckCircle className="h-12 w-12 text-emerald-500/40" />
                <p className="text-sm font-semibold text-slate-700">Aucun log d'erreur trouvé.</p>
                <p className="text-xs text-slate-400 max-w-md">
                  Aucun événement correspondant au niveau sélectionné n'a été enregistré récemment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Date & Heure</th>
                      <th className="py-3 px-4">Niveau</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4 w-1/2">Message d'Erreur</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                    {filteredLogs.map((log) => {
                      const dateStr = log.createdAt 
                        ? (log.createdAt.toDate ? log.createdAt.toDate().toLocaleString() : new Date(log.createdAt).toLocaleString()) 
                        : (log.dbTimestamp?.toDate ? log.dbTimestamp.toDate().toLocaleString() : (log.timestamp ? new Date(log.timestamp).toLocaleString() : "Date inconnue"));
                      
                      const levelUpper = (log.level || 'ERROR').toUpperCase();
                      let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                      if (levelUpper === 'FATAL' || levelUpper === 'CRITICAL') {
                        badgeColor = "bg-red-50 text-red-700 border-red-200 font-bold";
                      } else if (levelUpper === 'ERROR') {
                        badgeColor = "bg-orange-50 text-orange-700 border-orange-200";
                      } else if (levelUpper === 'WARNING') {
                        badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                      } else if (levelUpper === 'INFO') {
                        badgeColor = "bg-sky-50 text-sky-700 border-sky-200";
                      }

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap text-slate-500">
                            {dateStr}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge className={`${badgeColor} uppercase tracking-wider text-[9px] border px-2 py-0.5 rounded`}>
                              {log.level || 'ERROR'}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-600">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">{log.source || 'N/A'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-800 break-words font-mono text-[11px]">
                            <p className="font-semibold">{log.message}</p>
                            {log.stack && (
                              <p className="text-[10px] text-slate-400 mt-1 max-h-16 overflow-y-auto whitespace-pre-wrap leading-tight bg-slate-50 p-1 rounded border border-slate-100">
                                {log.stack}
                              </p>
                            )}
                            {(log.siteId || log.userId) && (
                              <p className="text-[10px] text-slate-500 mt-1 flex gap-2">
                                {log.siteId && <span>📍 Site: {log.siteId}</span>}
                                {log.userId && <span>👤 User: {log.userId}</span>}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Button
                              onClick={() => handleCopyLog(log)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold uppercase tracking-wider text-[10px] py-1 px-3.5 h-8 rounded-lg flex items-center gap-1 mx-auto transition-all"
                            >
                              <Copy className="h-3 w-3" /> Copier
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderObjectifs = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-white border-2 border-amber-500/20 shadow-md rounded-xl overflow-hidden animate-fade-in" id="card-objectifs-performance">
          <CardHeader className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-slate-100 p-5">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-500" />
                Objectifs de Performance par Site
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Définissez les cibles de performance pour chaque site minier. Les champs laissés vides signifient que l'objectif n'est pas encore défini.
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[10px] font-black uppercase font-mono tracking-wider">
                    <th className="py-3 px-4">Site Minier</th>
                    <th className="py-3 px-4">Disponibilité Cible (%)</th>
                    <th className="py-3 px-4">MTTR Cible (heures)</th>
                    <th className="py-3 px-4">Conformité PM Cible (%)</th>
                    <th className="py-3 px-4">Coût Cible (DH/h)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SITES_LIST.map((siteId) => {
                    const vals = editedTargets[siteId] || {
                      dispoTarget: "",
                      mttrTarget: "",
                      complianceTarget: "",
                      coutTarget: "",
                    };

                    const isAuthorized = user?.role === "ADMIN" || user?.role === "DIRECTION";

                    return (
                      <tr key={siteId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 font-black text-slate-900 font-mono tracking-wider">
                          {siteId}
                        </td>
                        <td className="py-4 px-4">
                          <Input
                            type="text"
                            value={vals.dispoTarget}
                            disabled={!isAuthorized}
                            onChange={(e) => {
                              setEditedTargets(prev => ({
                                ...prev,
                                [siteId]: {
                                  ...prev[siteId],
                                  dispoTarget: e.target.value
                                }
                              }));
                            }}
                            placeholder="Non défini"
                            className="h-9 w-36 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-[#D4A017]"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <Input
                            type="text"
                            value={vals.mttrTarget}
                            disabled={!isAuthorized}
                            onChange={(e) => {
                              setEditedTargets(prev => ({
                                ...prev,
                                [siteId]: {
                                  ...prev[siteId],
                                  mttrTarget: e.target.value
                                }
                              }));
                            }}
                            placeholder="Non défini"
                            className="h-9 w-36 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-[#D4A017]"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <Input
                            type="text"
                            value={vals.complianceTarget}
                            disabled={!isAuthorized}
                            onChange={(e) => {
                              setEditedTargets(prev => ({
                                ...prev,
                                [siteId]: {
                                  ...prev[siteId],
                                  complianceTarget: e.target.value
                                }
                              }));
                            }}
                            placeholder="Non défini"
                            className="h-9 w-36 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-[#D4A017]"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <Input
                            type="text"
                            value={vals.coutTarget}
                            disabled={!isAuthorized}
                            onChange={(e) => {
                              setEditedTargets(prev => ({
                                ...prev,
                                [siteId]: {
                                  ...prev[siteId],
                                  coutTarget: e.target.value
                                }
                              }));
                            }}
                            placeholder="Non défini"
                            className="h-9 w-36 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg text-center focus:ring-1 focus:ring-[#D4A017]"
                          />
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            onClick={() => handleSaveObjectif(siteId)}
                            disabled={!isAuthorized}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-wider text-[10px] py-1.5 px-4 h-9 rounded-lg transition-all"
                          >
                            Enregistrer
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-white min-h-screen text-slate-800 font-sans p-6 rounded-2xl border-2 border-amber-500 shadow-xl relative overflow-hidden">
      {/* Ligne de haut style Hydromines (Mélange bleu ciel et rouge un peu foncé) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />

      {hasLoadError && <DataLoadError />}

      {/* RECONSTRUIT : Banner avec style conservé, changement de titre exact */}
      <PageBanner
        icon={Settings}
        badgeLabel="HYDROMINES - Espace Maintenance"
        title="COMPTES & ACCÈS"
        subtitle="Gestion des utilisateurs et permissions"
      />

      {/* RECONSTRUIT : Groupes Stratégiques de Navigation (Anti-Bruit Visuel) */}
      {(() => {
        const getMasterGroup = (tab: typeof activeTab) => {
          if (tab === "comptes" || tab === "mecaniciens") return "personnel";
          if (tab === "engins" || tab === "chantiers" || tab === "intervalles") return "parc";
          if (tab === "objectifs") return "objectifs";
          return "diagnostic";
        };

        const currentGroup = getMasterGroup(activeTab);

        return (
          <div className="space-y-4">
            {/* TIER 1 : 4 Blocs Stratégiques de Contrôle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* PERSONNEL & HABILITATIONS */}
              <button
                onClick={() => setActiveTab(unapprovedUsers.length > 0 ? "comptes" : "mecaniciens")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                  currentGroup === "personnel"
                    ? "bg-slate-900 border-amber-500 text-white shadow-lg scale-[1.02]"
                    : "bg-slate-50 border-amber-500/20 text-slate-700 hover:bg-slate-100/80 hover:border-amber-500/60 shadow-sm"
                }`}
              >
                {/* Accent de haut Hydromines */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  currentGroup === "personnel"
                    ? "from-sky-400 via-rose-800 to-sky-400"
                    : "from-sky-400/20 via-rose-800/20 to-sky-400/20"
                }`} />
                <div className={`p-3 rounded-xl shrink-0 ${currentGroup === "personnel" ? "bg-amber-500 text-slate-950" : "bg-white border border-slate-200 text-amber-600"}`}>
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs uppercase tracking-wider block truncate">Personnel & Accès</span>
                    {unapprovedUsers.length > 0 && (
                      <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0" />
                    )}
                  </div>
                  <span className={`text-[10px] block truncate font-medium ${currentGroup === "personnel" ? "text-slate-300" : "text-slate-500"}`}>
                    {unapprovedUsers.length > 0 ? `${unapprovedUsers.length} en attente` : "Habilitations & équipe"}
                  </span>
                </div>
              </button>

              {/* REFERENTIEL & PARC */}
              <button
                onClick={() => setActiveTab("engins")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                  currentGroup === "parc"
                    ? "bg-slate-900 border-amber-500 text-white shadow-lg scale-[1.02]"
                    : "bg-slate-50 border-amber-500/20 text-slate-700 hover:bg-slate-100/80 hover:border-amber-500/60 shadow-sm"
                }`}
              >
                {/* Accent de haut Hydromines */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  currentGroup === "parc"
                    ? "from-sky-400 via-rose-800 to-sky-400"
                    : "from-sky-400/20 via-rose-800/20 to-sky-400/20"
                }`} />
                <div className={`p-3 rounded-xl shrink-0 ${currentGroup === "parc" ? "bg-amber-500 text-slate-950" : "bg-white border border-slate-200 text-slate-600"}`}>
                  <Settings className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-xs uppercase tracking-wider block truncate">Référentiel & Parc</span>
                  <span className={`text-[10px] block truncate font-medium ${currentGroup === "parc" ? "text-slate-300" : "text-slate-500"}`}>
                    Engins, chantiers, intervalles
                  </span>
                </div>
              </button>

              {/* OBJECTIFS DE PERFORMANCE */}
              <button
                onClick={() => setActiveTab("objectifs")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                  currentGroup === "objectifs"
                    ? "bg-slate-900 border-amber-500 text-white shadow-lg scale-[1.02]"
                    : "bg-slate-50 border-amber-500/20 text-slate-700 hover:bg-slate-100/80 hover:border-amber-500/60 shadow-sm"
                }`}
              >
                {/* Accent de haut Hydromines */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  currentGroup === "objectifs"
                    ? "from-sky-400 via-rose-800 to-sky-400"
                    : "from-sky-400/20 via-rose-800/20 to-sky-400/20"
                }`} />
                <div className={`p-3 rounded-xl shrink-0 ${currentGroup === "objectifs" ? "bg-amber-500 text-slate-950" : "bg-white border border-slate-200 text-emerald-600"}`}>
                  <Target className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-xs uppercase tracking-wider block truncate">Objectifs par Site</span>
                  <span className={`text-[10px] block truncate font-medium ${currentGroup === "objectifs" ? "text-slate-300" : "text-slate-500"}`}>
                    Disponibilité & seuils
                  </span>
                </div>
              </button>

              {/* SECURITE & DIAGNOSTIC */}
              <button
                onClick={() => setActiveTab("sante_donnees")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                  currentGroup === "diagnostic"
                    ? "bg-slate-900 border-amber-500 text-white shadow-lg scale-[1.02]"
                    : "bg-slate-50 border-amber-500/20 text-slate-700 hover:bg-slate-100/80 hover:border-amber-500/60 shadow-sm"
                }`}
              >
                {/* Accent de haut Hydromines */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  currentGroup === "diagnostic"
                    ? "from-sky-400 via-rose-800 to-sky-400"
                    : "from-sky-400/20 via-rose-800/20 to-sky-400/20"
                }`} />
                <div className={`p-3 rounded-xl shrink-0 ${currentGroup === "diagnostic" ? "bg-amber-500 text-slate-950" : "bg-white border border-slate-200 text-purple-600"}`}>
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-xs uppercase tracking-wider block truncate">Sécurité & Diagnostic</span>
                  <span className={`text-[10px] block truncate font-medium ${currentGroup === "diagnostic" ? "text-slate-300" : "text-slate-500"}`}>
                    Santé des données & logs
                  </span>
                </div>
              </button>
            </div>

            {/* TIER 2 : Sous-onglets contextuels (uniquement si le groupe a plusieurs vues, centrés et stylisés en Or) */}
            <div className="flex justify-center w-full border-b border-slate-100 pb-3">
              {currentGroup === "personnel" && (
                <div className="flex gap-1.5 bg-slate-100/80 pt-2 pb-1 px-1 rounded-xl border-2 border-amber-500 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
                  <button
                    onClick={() => setActiveTab("comptes")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                      activeTab === "comptes"
                        ? "bg-amber-500 text-slate-950 shadow-md font-extrabold border border-amber-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent"
                    }`}
                  >
                    🔑 Comptes en Attente
                    {unapprovedUsers.length > 0 && (
                      <span className="h-5 w-5 bg-red-600 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-bounce">
                        {unapprovedUsers.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("mecaniciens")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                      activeTab === "mecaniciens"
                        ? "bg-amber-500 text-slate-950 shadow-md font-extrabold border border-amber-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent"
                    }`}
                  >
                    👷 Équipe & Mécaniciens
                  </button>
                </div>
              )}

              {currentGroup === "parc" && (
                <div className="flex flex-wrap gap-1.5 bg-slate-100/80 pt-2 pb-1 px-1 rounded-xl border-2 border-amber-500 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
                  <button
                    onClick={() => setActiveTab("engins")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                      activeTab === "engins"
                        ? "bg-amber-500 text-slate-950 shadow-md font-extrabold border border-amber-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent"
                    }`}
                  >
                    🚜 Engins & Véhicules
                  </button>
                  <button
                    onClick={() => setActiveTab("chantiers")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                      activeTab === "chantiers"
                        ? "bg-amber-500 text-slate-950 shadow-md font-extrabold border border-amber-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent"
                    }`}
                  >
                    🏗️ Chantiers & Sites
                  </button>
                  <button
                    onClick={() => setActiveTab("intervalles")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                      activeTab === "intervalles"
                        ? "bg-amber-500 text-slate-950 shadow-md font-extrabold border border-amber-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent"
                    }`}
                  >
                    ⚙️ Intervalles Maintenance
                  </button>
                </div>
              )}

              {currentGroup === "diagnostic" && (
                <div className="flex gap-1.5 bg-slate-100/80 pt-2 pb-1 px-1 rounded-xl border-2 border-amber-500 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
                  <button
                    onClick={() => setActiveTab("sante_donnees")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                      activeTab === "sante_donnees"
                        ? "bg-amber-500 text-slate-950 shadow-md font-extrabold border border-amber-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent"
                    }`}
                  >
                    🔬 Diagnostic de Cohérence
                  </button>
                  <button
                    onClick={() => setActiveTab("logs_erreurs")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                      activeTab === "logs_erreurs"
                        ? "bg-amber-500 text-slate-950 shadow-md font-extrabold border border-amber-600"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent"
                    }`}
                  >
                    📋 Logs Système & Sécurité
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {activeTab === "mecaniciens" ? (
        <AdminMecaniciens />
      ) : activeTab === "comptes" ? (
        renderUserApprovals()
      ) : activeTab === "sante_donnees" ? (
        renderSanteDonnees()
      ) : activeTab === "logs_erreurs" ? (
        renderLogsErreurs()
      ) : activeTab === "objectifs" ? (
        renderObjectifs()
      ) : (
        <>
          {/* RECONSTRUIT : Affichage des statistiques selon l'onglet actif */}
          {renderStats()}

          {/* RECONSTRUIT : Zone d'actions et filtres de recherche */}
          <Card className="bg-slate-50 border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          
          {/* Barre de Recherche */}
          <div className="relative w-full lg:w-1/3">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === "engins" ? "Rechercher par N° de Parc, Modèle, Conducteur..." :
                (activeTab as string) === "mecaniciens" ? "Rechercher par Matricule, Nom, Spécialité..." :
                activeTab === "chantiers" ? "Rechercher par Code, Nom, Localisation..." :
                "Rechercher par opération, fluide..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
            />
          </div>

          {/* Filtres contextuels */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
            
            {activeTab === "engins" && (
              <>
                <select
                  value={filterOption1}
                  onChange={(e) => setFilterOption1(e.target.value)}
                  className="h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4FC3F7]"
                >
                  <option value="Tous">Tous les Chantiers</option>
                  {chantiers.map(c => <option key={c.id} value={c.id}>{c.nomComplet}</option>)}
                </select>
                <select
                  value={filterOption2}
                  onChange={(e) => setFilterOption2(e.target.value)}
                  className="h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4FC3F7]"
                >
                  <option value="Tous">Tous les États</option>
                  <option value="Opérationnel">Opérationnel</option>
                  <option value="En maintenance">En maintenance</option>
                  <option value="Hors service">Hors service</option>
                  <option value="Vendu">Vendu</option>
                </select>
              </>
            )}

            {(activeTab as string) === "mecaniciens" && (
              <>
                <select
                  value={filterOption1}
                  onChange={(e) => setFilterOption1(e.target.value)}
                  className="h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4FC3F7]"
                >
                  <option value="Tous">Tous les postes</option>
                  <option value="Poste 1">Poste 1</option>
                  <option value="Poste 2">Poste 2</option>
                  <option value="Poste 3">Poste 3</option>
                </select>
                <select
                  value={filterOption2}
                  onChange={(e) => setFilterOption2(e.target.value)}
                  className="h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4FC3F7]"
                >
                  <option value="Tous">Tous les statuts</option>
                  <option value="Actif">Actif</option>
                  <option value="En congé">En congé</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </>
            )}

            {activeTab === "chantiers" && (
              <>
                <select
                  value={filterOption1}
                  onChange={(e) => setFilterOption1(e.target.value)}
                  className="h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4FC3F7]"
                >
                  <option value="Tous">Tous les types</option>
                  <option value="Mine souterraine">Mine souterraine</option>
                  <option value="Mine à ciel ouvert">Mine à ciel ouvert</option>
                  <option value="Traitement">Traitement</option>
                  <option value="Stockage">Stockage</option>
                </select>
                <select
                  value={filterOption2}
                  onChange={(e) => setFilterOption2(e.target.value)}
                  className="h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4FC3F7]"
                >
                  <option value="Tous">Tous les statuts</option>
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                  <option value="En préparation">En préparation</option>
                </select>
              </>
            )}

            {activeTab === "intervalles" && (
              <>
                <select
                  value={filterOption1}
                  onChange={(e) => setFilterOption1(e.target.value)}
                  className="h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4FC3F7]"
                >
                  <option value="Tous">Tous les engins</option>
                  <option value="ST2D">ST2D</option>
                  <option value="ST2G">ST2G</option>
                  <option value="ST7">ST7</option>
                  <option value="ST1030">ST1030</option>
                  <option value="Générique">Générique</option>
                </select>
                <select
                  value={filterOption2}
                  onChange={(e) => setFilterOption2(e.target.value)}
                  className="h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#4FC3F7]"
                >
                  <option value="Tous">Toutes les priorités</option>
                  <option value="Critique">Critique</option>
                  <option value="Haute">Haute</option>
                  <option value="Normale">Normale</option>
                  <option value="Basse">Basse</option>
                </select>
              </>
            )}

            {/* Export CSV & Add Button */}
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="h-11 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>

            <Button
              onClick={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
              className="h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 rounded-xl flex items-center gap-2"
            >
              <Plus className="h-4.5 w-4.5" />
              {activeTab === "engins" && "Engin"}
              {(activeTab as string) === "mecaniciens" && "Mécanicien"}
              {activeTab === "chantiers" && "Chantier"}
              {activeTab === "intervalles" && "Intervalle"}
            </Button>
          </div>
        </div>
      </Card>

      {/* RECONSTRUIT : Listes / Tableaux Dynamiques pour chaque onglet */}
      <Card className="bg-white border-2 border-amber-500 shadow-lg rounded-xl overflow-hidden relative">
        {/* Ligne de haut style Hydromines (Mélange bleu ciel et rouge un peu foncé) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />
        <CardContent className="p-0 pt-1.5">
          
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
              <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Chargement des données en cours...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm font-mono uppercase">
              Aucune donnée enregistrée ne correspond aux filtres appliqués.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sky-100/80 border-b-2 border-rose-900/40 text-rose-950 text-[10px] font-mono tracking-wider uppercase font-black">
                    
                    {/* ENGINS HEADERS */}
                    {activeTab === "engins" && (
                      <>
                        <th className="py-4 px-6">N° Parc</th>
                        <th className="py-4 px-4">Modèle / Marque</th>
                        <th className="py-4 px-4">Type</th>
                        <th className="py-4 px-4">Chantier Assigné</th>
                        <th className="py-4 px-4 text-right">Heures de Marche</th>
                        <th className="py-4 px-4">Date Entrée</th>
                        <th className="py-4 px-4">Conducteur</th>
                        <th className="py-4 px-4 text-center">État</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </>
                    )}

                    {/* MECANICIENS HEADERS */}
                    {(activeTab as string) === "mecaniciens" && (
                      <>
                        <th className="py-4 px-6">Matricule</th>
                        <th className="py-4 px-4">Nom Complet</th>
                        <th className="py-4 px-4">Poste</th>
                        <th className="py-4 px-4">Spécialité</th>
                        <th className="py-4 px-4">Téléphone</th>
                        <th className="py-4 px-4">Embauche</th>
                        <th className="py-4 px-4 text-center">Statut</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </>
                    )}

                    {/* CHANTIERS HEADERS */}
                    {activeTab === "chantiers" && (
                      <>
                        <th className="py-4 px-6">Code Chantier</th>
                        <th className="py-4 px-4">Nom Complet</th>
                        <th className="py-4 px-4">Type</th>
                        <th className="py-4 px-4">Localisation</th>
                        <th className="py-4 px-4">Responsable</th>
                        <th className="py-4 px-4 text-center">Machines Assignées</th>
                        <th className="py-4 px-4 text-center">Statut</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </>
                    )}

                    {/* INTERVALLES HEADERS */}
                    {activeTab === "intervalles" && (
                      <>
                        <th className="py-4 px-6">Type d'engin</th>
                        <th className="py-4 px-4">Opération de Maintenance</th>
                        <th className="py-4 px-4 text-right">Intervalle (heures)</th>
                        <th className="py-4 px-4">Huile/Produit Recommandé</th>
                        <th className="py-4 px-4">Quantité</th>
                        <th className="py-4 px-4 text-center">Priorité</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </>
                    )}

                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {/* ENGINS ROWS */}
                  {activeTab === "engins" && (filteredData as Engin[]).map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 text-sm font-sans transition-colors duration-150">
                      <td className="py-4 px-6 font-mono font-bold text-amber-600">{e.id}</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">{e.modele}</div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase">{e.marque}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-semibold">{e.type}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-slate-50 border border-slate-200 text-sky-600 rounded-lg text-xs font-mono font-bold">
                          {e.siteId}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-700">
                        {(e.heuresMarche || 0).toLocaleString()} hrs
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 font-mono">{e.dateEntreeService}</td>
                      <td className="py-4 px-4 text-slate-600 text-xs font-medium">{e.conducteurAssigne}</td>
                      <td className="py-4 px-4 text-center">
                        {(() => {
                          const currentEtat = e.statut !== undefined 
                            ? (e.statut === "actif" ? "Opérationnel" : e.statut === "maintenance" ? "En maintenance" : "Hors service")
                            : e.etat;
                          return (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              currentEtat === "Opérationnel" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                              currentEtat === "En maintenance" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                              currentEtat === "Hors service" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                              "bg-slate-50 text-slate-500 border border-slate-200"
                            }`}>
                              {currentEtat}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingItem(e);
                              setModalOpen(true);
                            }}
                            className="h-9 w-9 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(e.id)}
                            className="h-9 w-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* MECANICIENS ROWS */}
                  {(activeTab as string) === "mecaniciens" && (filteredData as Mecanicien[]).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 text-sm font-sans transition-colors duration-150">
                      <td className="py-4 px-6 font-mono font-bold text-amber-600">{m.id}</td>
                      <td className="py-4 px-4 font-bold text-slate-800">{m.nomComplet}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs font-mono font-bold">
                          {m.poste}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-sky-600">{m.specialite}</td>
                      <td className="py-4 px-4 font-mono text-slate-600 text-xs">{m.telephone || "-"}</td>
                      <td className="py-4 px-4 text-xs text-slate-500 font-mono">{m.dateEmbauche}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          m.statut === "Actif" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          m.statut === "En congé" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {m.statut}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingItem(m);
                              setModalOpen(true);
                            }}
                            className="h-9 w-9 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(m.id)}
                            className="h-9 w-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* CHANTIERS ROWS */}
                  {activeTab === "chantiers" && (filteredData as Chantier[]).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 text-sm font-sans transition-colors duration-150">
                      <td className="py-4 px-6 font-mono font-bold text-amber-600">{c.id}</td>
                      <td className="py-4 px-4 font-bold text-slate-800">{c.nomComplet}</td>
                      <td className="py-4 px-4 font-semibold text-slate-600 text-xs">{c.type}</td>
                      <td className="py-4 px-4 text-xs font-semibold text-sky-600">{c.localisation}</td>
                      <td className="py-4 px-4 text-xs text-slate-500">
                        {mecaniciens.find(m => m.id === c.responsableId)?.nomComplet || c.responsableId || "Non assigné"}
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">
                        {getEnginsCountForChantier(c.id)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          c.statut === "Actif" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          c.statut === "En préparation" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {c.statut}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingItem(c);
                              setModalOpen(true);
                            }}
                            className="h-9 w-9 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(c.id)}
                            className="h-9 w-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* INTERVALLES ROWS */}
                  {activeTab === "intervalles" && (filteredData as IntervalleMaintenance[]).map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50 text-sm font-sans transition-colors duration-150">
                      <td className="py-4 px-6 font-mono font-bold text-amber-600">{i.typeEngin}</td>
                      <td className="py-4 px-4 font-bold text-slate-800">{i.operation}</td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-700">
                        {i.intervalleHeures} hrs
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-sky-600">{i.produitHuile}</td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-500">{i.quantite}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          i.priorite === "Critique" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                          i.priorite === "Haute" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          i.priorite === "Normale" ? "bg-sky-50 text-sky-700 border border-sky-200" :
                          "bg-slate-50 text-slate-500 border border-slate-200"
                        }`}>
                          {i.priorite}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingItem(i);
                              setModalOpen(true);
                            }}
                            className="h-9 w-9 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(i.id)}
                            className="h-9 w-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}

        </CardContent>
      </Card>

      {/* ==========================================
          RECONSTRUIT : MODAL DE SUPPRESSION
          ========================================== */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-black text-rose-600 uppercase tracking-wider mb-2">
              ⚠️ CONFIRMER LA SUPPRESSION
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Êtes-vous absolument sûr de vouloir supprimer cet élément ? Cette action est irréversible et supprimera définitivement les données de Firestore.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
                className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              >
                Annuler
              </Button>
              <Button
                onClick={() => {
                  if (activeTab === "engins") handleDeleteEngin(confirmDeleteId);
                  else if ((activeTab as string) === "mecaniciens") handleDeleteMecanicien(confirmDeleteId);
                  else if (activeTab === "chantiers") handleDeleteChantier(confirmDeleteId);
                  else handleDeleteIntervalle(confirmDeleteId);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          RECONSTRUIT : MODAL DE FORMULAIRE COMPLET
          ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-base font-black uppercase tracking-wider text-amber-600">
                {editingItem ? "✏️ MODIFIER" : "➕ AJOUTER"} {
                  activeTab === "engins" ? "UN ENGIN DE FOND" :
                  (activeTab as string) === "mecaniciens" ? "UN COLLABORATEUR" :
                  activeTab === "chantiers" ? "UN CHANTIER ACTIF" :
                  "UN INTERVALLE DE MAINTENANCE"
                }
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Formulaire dynamique selon l'onglet actif */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());
              
              if (activeTab === "engins") handleSaveEngin(data);
              else if ((activeTab as string) === "mecaniciens") handleSaveMecanicien(data);
              else if (activeTab === "chantiers") handleSaveChantier(data);
              else handleSaveIntervalle(data);
            }} className="space-y-4">
              
              {/* ==========================================
                  FORMULAIRE : ENGINS
                  ========================================== */}
              {activeTab === "engins" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
                      N° Parc <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="id"
                      required
                      placeholder="Ex: ST2G-42"
                      disabled={!!editingItem}
                      defaultValue={editingItem?.id || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
                      Modèle <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="modele"
                      defaultValue={editingItem?.modele || "ST2G"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="ST2D">ST2D (Epiroc Mini)</option>
                      <option value="ST2G">ST2G (Souterrain Standard)</option>
                      <option value="ST7">ST7 (Robuste)</option>
                      <option value="ST1030">ST1030 (Grande Capacité)</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Marque</label>
                    <input
                      type="text"
                      name="marque"
                      placeholder="Ex: Epiroc"
                      defaultValue={editingItem?.marque || "Epiroc"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Type</label>
                    <select
                      name="type"
                      defaultValue={editingItem?.type || "Scooptram"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="Scooptram">Scooptram (Chargeuse de fond)</option>
                      <option value="Camion">Camion articulé</option>
                      <option value="Perforateur">Perforateur de mine</option>
                      <option value="Chargeuse">Chargeuse conventionnelle</option>
                      <option value="Autre">Autre matériel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Site Assigné</label>
                    <select
                      name="siteId"
                      defaultValue={editingItem?.siteId || "SMI"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      {chantiers.map(c => <option key={c.id} value={c.id}>{c.nomComplet} ({c.id})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">
                      Heures de Marche (Horomètre) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="heuresMarche"
                      required
                      min="0"
                      placeholder="Ex: 1250"
                      defaultValue={editingItem?.heuresMarche || 0}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Date Entrée en Service</label>
                    <input
                      type="date"
                      name="dateEntreeService"
                      defaultValue={editingItem?.dateEntreeService || getLocalDateString()}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">Conducteur Assigné</label>
                    <select
                      name="conducteurAssigne"
                      defaultValue={editingItem?.conducteurAssigne || "Non assigné"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="Non assigné">Aucun conducteur (Disponible)</option>
                      {mecaniciens.map(m => <option key={m.id} value={m.nomComplet}>{m.nomComplet} ({m.id})</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-1.5">État de l'engin</label>
                    <select
                      name="etat"
                      defaultValue={editingItem?.etat || "Opérationnel"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="Opérationnel">Opérationnel (Actif en exploitation)</option>
                      <option value="En maintenance">En maintenance (Atelier mécanique)</option>
                      <option value="Hors service">Hors service (Défaillance majeure)</option>
                      <option value="Vendu">Vendu</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ==========================================
                  FORMULAIRE : MÉCANICIENS
                  ========================================== */}
              {(activeTab as string) === "mecaniciens" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">
                      Matricule Unique <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="id"
                      required
                      placeholder="Ex: M405"
                      disabled={!!editingItem}
                      defaultValue={editingItem?.id || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">
                      Nom Complet <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nomComplet"
                      required
                      placeholder="Prénom Nom"
                      defaultValue={editingItem?.nomComplet || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Poste / Shift</label>
                    <select
                      name="poste"
                      defaultValue={editingItem?.poste || "Poste 1"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="Poste 1">Poste 1 (Shift Matin)</option>
                      <option value="Poste 2">Poste 2 (Shift Après-midi)</option>
                      <option value="Poste 3">Poste 3 (Shift Nuit)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Spécialité Technique</label>
                    <select
                      name="specialite"
                      defaultValue={editingItem?.specialite || "Généraliste"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="Moteur">Moteur thermique / Deutz</option>
                      <option value="Hydraulique">Systèmes Hydrauliques / Pompes</option>
                      <option value="Électrique">Électrique & Systèmes embarqués</option>
                      <option value="Transmission">Transmission Dana / Funk</option>
                      <option value="Généraliste">Généraliste de fond</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Site d'affectation</label>
                    <select
                      name="siteId"
                      defaultValue={editingItem?.siteId || "SMI"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="SMI">SMI</option>
                      <option value="OUMEJRANE">OUMEJRANE</option>
                      <option value="KOUDIA">KOUDIA AICHA</option>
                      <option value="OUANSIMI">OUANSIMI</option>
                      <option value="BOU-AZZER">BOU-AZZER</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Téléphone</label>
                    <input
                      type="text"
                      name="telephone"
                      placeholder="Ex: +212 6..."
                      defaultValue={editingItem?.telephone || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Date d'embauche</label>
                    <input
                      type="date"
                      name="dateEmbauche"
                      defaultValue={editingItem?.dateEmbauche || getLocalDateString()}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Statut Actuel</label>
                    <select
                      name="statut"
                      defaultValue={editingItem?.statut || "Actif"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="Actif">Actif (En service)</option>
                      <option value="En congé">En congé / Absent</option>
                      <option value="Inactif">Inactif (Démission / Fin de contrat)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ==========================================
                  FORMULAIRE : CHANTIERS
                  ========================================== */}
              {activeTab === "chantiers" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">
                      Code Unique Chantier <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="id"
                      required
                      placeholder="Ex: SMI, OUMEJRANE..."
                      disabled={!!editingItem}
                      defaultValue={editingItem?.id || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] uppercase disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">
                      Nom Complet du Chantier <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nomComplet"
                      required
                      placeholder="Ex: Mine d'Imiter"
                      defaultValue={editingItem?.nomComplet || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Type de Site</label>
                    <select
                      name="type"
                      defaultValue={editingItem?.type || "Mine souterraine"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="Mine souterraine">Mine souterraine de fond</option>
                      <option value="Mine à ciel ouvert">Mine à ciel ouvert</option>
                      <option value="Traitement">Usine de traitement / Valorisation</option>
                      <option value="Stockage">Zone de Stockage & Logistique</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Localisation Géographique</label>
                    <input
                      type="text"
                      name="localisation"
                      placeholder="Ex: Ouarzazate"
                      defaultValue={editingItem?.localisation || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Responsable Assigné</label>
                    <select
                      name="responsableId"
                      defaultValue={editingItem?.responsableId || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="">Aucun responsable assigné</option>
                      {mecaniciens.map(m => <option key={m.id} value={m.id}>{m.nomComplet} ({m.id})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Statut Opérationnel</label>
                    <select
                      name="statut"
                      defaultValue={editingItem?.statut || "Actif"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="Actif">Actif (Exploitation en cours)</option>
                      <option value="Inactif">Inactif / Suspendu</option>
                      <option value="En préparation">En préparation / Exploration</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ==========================================
                  FORMULAIRE : INTERVALLES
                  ========================================== */}
              {activeTab === "intervalles" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Type d'engin compatible</label>
                    <select
                      name="typeEngin"
                      defaultValue={editingItem?.typeEngin || "ST2G"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="ST2D">ST2D</option>
                      <option value="ST2G">ST2G</option>
                      <option value="ST7">ST7</option>
                      <option value="ST1030">ST1030</option>
                      <option value="Générique">Générique</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">
                      Opération de Maintenance <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="operation"
                      required
                      placeholder="Ex: Vidange moteur thermique"
                      defaultValue={editingItem?.operation || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">
                      Intervalle d'heures (hrs) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="intervalleHeures"
                      required
                      min="1"
                      placeholder="Ex: 250"
                      defaultValue={editingItem?.intervalleHeures || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Produit recommandé (Huile/Fluide)</label>
                    <input
                      type="text"
                      name="produitHuile"
                      placeholder="Ex: 15W-40, SAE 90..."
                      defaultValue={editingItem?.produitHuile || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Quantité estimée</label>
                    <input
                      type="text"
                      name="quantite"
                      placeholder="Ex: 8L, 15L, N/A"
                      defaultValue={editingItem?.quantite || ""}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1.5">Niveau de Priorité</label>
                    <select
                      name="priorite"
                      defaultValue={editingItem?.priorite || "Normale"}
                      className="w-full h-11 px-3 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FC3F7]"
                    >
                      <option value="Critique">Critique (Réglementaire / Sécurité)</option>
                      <option value="Haute">Haute (Cruciale mécanique)</option>
                      <option value="Normale">Normale (Planification classique)</option>
                      <option value="Basse">Basse (Visuelle / secondaire)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Pied de formulaire avec boutons d'actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black font-mono rounded-xl px-6"
                >
                  {editingItem ? "ENREGISTRER LES MODIFICATIONS" : "VALIDER ET AJOUTER"}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}
</>
)}

    </div>
  );
}
