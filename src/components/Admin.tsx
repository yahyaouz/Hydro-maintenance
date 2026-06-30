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
  Tag
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageBanner } from "@/components/ui/PageBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  collection, doc, setDoc, addDoc, updateDoc, 
  onSnapshot, query, where, orderBy,
  writeBatch, Timestamp, getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';

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
  const [activeTab, setActiveTab] = React.useState<"engins" | "mecaniciens" | "chantiers" | "intervalles">("engins");

  // RECONSTRUIT : Données stockées localement
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

  // RECONSTRUIT : Seeding check on load
  React.useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const enginsRef = collection(db, 'engins');
        const mecaRef = collection(db, 'mecaniciens');
        const chantiersRef = collection(db, 'chantiers');
        const pmIntervallesRef = collection(db, 'pmIntervalles');

        const [enginsSnap, mecaSnap, chantiersSnap, pmIntervallesSnap] = await Promise.all([
          getDocs(query(enginsRef, where('deleted', '!=', true))),
          getDocs(query(mecaRef, where('deleted', '!=', true))),
          getDocs(query(chantiersRef, where('deleted', '!=', true))),
          getDocs(query(pmIntervallesRef, where('deleted', '!=', true)))
        ]);

        const batch = writeBatch(db);
        let hasChanges = false;

        if (enginsSnap.empty) {
          const SEED_ENGINS = [
            { id: "ST2G-01", modele: "ST2G", marque: "Epiroc", type: "Scooptram", siteId: "SMI", heuresMarche: 1450, dateEntreeService: "2021-03-10", etat: "Opérationnel", conducteurAssigne: "Non assigné", deleted: false, updatedAt: Timestamp.now() },
            { id: "ST2D-01", modele: "ST2D", marque: "Epiroc", type: "Scooptram", siteId: "SMI", heuresMarche: 2890, dateEntreeService: "2020-09-18", etat: "Opérationnel", conducteurAssigne: "Non assigné", deleted: false, updatedAt: Timestamp.now() },
            { id: "ST7-01",  modele: "ST7",  marque: "Epiroc", type: "Scooptram", siteId: "KOUDIA", heuresMarche: 820, dateEntreeService: "2022-12-05", etat: "Opérationnel", conducteurAssigne: "Non assigné", deleted: false, updatedAt: Timestamp.now() },
            { id: "ST2G-02", modele: "ST2G", marque: "Epiroc", type: "Scooptram", siteId: "OUMEJRANE", heuresMarche: 1980, dateEntreeService: "2021-11-14", etat: "Opérationnel", conducteurAssigne: "Non assigné", deleted: false, updatedAt: Timestamp.now() },
            { id: "ST2D-02", modele: "ST2D", marque: "Epiroc", type: "Scooptram", siteId: "BOU-AZZER", heuresMarche: 5200, dateEntreeService: "2017-06-25", etat: "En maintenance", conducteurAssigne: "Non assigné", deleted: false, updatedAt: Timestamp.now() },
          ];
          SEED_ENGINS.forEach(item => {
            batch.set(doc(db, 'engins', item.id), item);
          });
          hasChanges = true;
        }

        if (mecaSnap.empty) {
          const SEED_MECANICIENS = [
            { id: "M001", nomComplet: "Abdellah Daoudi", poste: "Poste 1", specialite: "Moteur", telephone: "+212 611 223344", dateEmbauche: "2020-05-15", statut: "Actif", siteId: "SMI", deleted: false, updatedAt: Timestamp.now() },
            { id: "M002", nomComplet: "Lahcen Ait", poste: "Poste 2", specialite: "Hydraulique", telephone: "+212 622 334455", dateEmbauche: "2019-11-10", statut: "Actif", siteId: "SMI", deleted: false, updatedAt: Timestamp.now() },
            { id: "M003", nomComplet: "Mohamed El Amri", poste: "Poste 3", specialite: "Électrique", telephone: "+212 633 445566", dateEmbauche: "2021-02-01", statut: "Actif", siteId: "KOUDIA", deleted: false, updatedAt: Timestamp.now() },
            { id: "M004", nomComplet: "Youssef Naciri", poste: "Poste 1", specialite: "Transmission", telephone: "+212 644 556677", dateEmbauche: "2018-04-12", statut: "Actif", siteId: "OUMEJRANE", deleted: false, updatedAt: Timestamp.now() },
            { id: "M005", nomComplet: "Rachid Idrissi", poste: "Poste 2", specialite: "Généraliste", telephone: "+212 655 667788", dateEmbauche: "2022-08-20", statut: "Actif", siteId: "BOU-AZZER", deleted: false, updatedAt: Timestamp.now() },
          ];
          SEED_MECANICIENS.forEach(item => {
            batch.set(doc(db, 'mecaniciens', item.id), item);
          });
          hasChanges = true;
        }

        if (chantiersSnap.empty) {
          const SEED_CHANTIERS = [
            { id: "SMI",       nomComplet: "Société Métallurgique d'Imiter", type: "Mine souterraine", localisation: "Imiter, Tinghir",   responsableId: "M001", statut: "Actif", deleted: false, updatedAt: Timestamp.now() },
            { id: "OUMEJRANE", nomComplet: "Mine d'Oumejrane",               type: "Mine souterraine", localisation: "Oumejrane, Alnif", responsableId: "M004", statut: "Actif", deleted: false, updatedAt: Timestamp.now() },
            { id: "KOUDIA",    nomComplet: "Koudiat Aïcha",                   type: "Mine souterraine", localisation: "Marrakech",        responsableId: "M003", statut: "Actif", deleted: false, updatedAt: Timestamp.now() },
            { id: "OUANSIMI",  nomComplet: "Mine d'Ouansimi",                 type: "Mine souterraine", localisation: "Tiznit",           responsableId: "", statut: "Actif", deleted: false, updatedAt: Timestamp.now() },
            { id: "BOU-AZZER", nomComplet: "Mine de Bou-Azzer",              type: "Mine souterraine", localisation: "Ouarzazate",       responsableId: "M005", statut: "Actif", deleted: false, updatedAt: Timestamp.now() },
          ];
          SEED_CHANTIERS.forEach(item => {
            batch.set(doc(db, 'chantiers', item.id), item);
          });
          hasChanges = true;
        }

        if (pmIntervallesSnap.empty) {
          const SEED_INTERVALLES = [
            { typeEngin: "ST2G", operation: "Vidange moteur + filtre huile 15W-40",         intervalleHeures: 250,  produitHuile: "15W-40",       quantite: "8L",  priorite: "Haute", deleted: false, updatedAt: Timestamp.now() },
            { typeEngin: "ST2G", operation: "Filtre air primaire + secondaire",              intervalleHeures: 500,  produitHuile: "Filtres OEM",  quantite: "N/A", priorite: "Normale", deleted: false, updatedAt: Timestamp.now() },
            { typeEngin: "ST2G", operation: "Vidange hydraulique + filtres retour",          intervalleHeures: 1000, produitHuile: "ISO VG 46",    quantite: "12L", priorite: "Critique", deleted: false, updatedAt: Timestamp.now() },
            { typeEngin: "ST2G", operation: "Vidange transmission + ponts SAE 140",          intervalleHeures: 2000, produitHuile: "SAE 140",      quantite: "15L", priorite: "Critique", deleted: false, updatedAt: Timestamp.now() },
            { typeEngin: "ST2D", operation: "Vidange moteur Deutz + filtre huile",           intervalleHeures: 250,  produitHuile: "15W-40",       quantite: "6L",  priorite: "Haute", deleted: false, updatedAt: Timestamp.now() },
            { typeEngin: "ST2D", operation: "Vidange hydraulique + filtre aspiration",       intervalleHeures: 1000, produitHuile: "ISO VG 46",    quantite: "10L", priorite: "Critique", deleted: false, updatedAt: Timestamp.now() },
            { typeEngin: "ST7",  operation: "Vidange moteur Cummins QSB 4.5 + filtres",     intervalleHeures: 250,  produitHuile: "15W-40",       quantite: "14L", priorite: "Haute", deleted: false, updatedAt: Timestamp.now() },
            { typeEngin: "ST7",  operation: "Vidange circuit hydraulique complet",           intervalleHeures: 1000, produitHuile: "ISO VG 46",    quantite: "50L", priorite: "Critique", deleted: false, updatedAt: Timestamp.now() },
            { typeEngin: "ST7",  operation: "Vidange transmission + ponts Dana R32000",      intervalleHeures: 2000, produitHuile: "SAE 140",      quantite: "30L", priorite: "Critique", deleted: false, updatedAt: Timestamp.now() },
            { typeEngin: "Générique", operation: "Graissage général pivots et articulations", intervalleHeures: 50, produitHuile: "Graisse EP2",  quantite: "N/A", priorite: "Haute", deleted: false, updatedAt: Timestamp.now() },
            { typeEngin: "Générique", operation: "Vérification niveaux tous circuits",       intervalleHeures: 10,  produitHuile: "N/A",          quantite: "N/A", priorite: "Normale", deleted: false, updatedAt: Timestamp.now() },
          ];
          SEED_INTERVALLES.forEach(item => {
            const ref = doc(collection(db, 'pmIntervalles'));
            batch.set(ref, item);
          });
          hasChanges = true;
        }

        if (hasChanges) {
          await batch.commit();
          toast.success("Données d'initialisation (seeds) chargées dans Firestore !");
        }
      } catch (err: any) {
        console.error("Erreur d'initialisation des données (seed):", err);
        toast.error("Erreur d'initialisation des données Firestore : " + err.message);
      }
    };

    checkAndSeed();
  }, []);

  // RECONSTRUIT : Lecture Firestore en temps réel via onSnapshot
  React.useEffect(() => {
    setLoading(true);

    // 1. ENGINS
    let qEngins = query(collection(db, 'engins'), where('deleted', '!=', true));
    if (user?.role !== 'ADMIN' && user?.role !== 'DIRECTION') {
      qEngins = query(collection(db, 'engins'), where('deleted', '!=', true), where('siteId', '==', user?.siteId || 'SMI'));
    }
    const unsubEngins = onSnapshot(qEngins, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Engin[];
      data.sort((a: any, b: any) => {
        const tA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt || 0);
        const tB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt || 0);
        return tB - tA;
      });
      setEngins(data);
    }, (err) => {
      console.error(err);
      toast.error("Erreur de chargement des engins.");
    });

    // 2. MECANICIENS
    let qMecaniciens = query(collection(db, 'mecaniciens'), where('deleted', '!=', true));
    if (user?.role !== 'ADMIN' && user?.role !== 'DIRECTION') {
      qMecaniciens = query(collection(db, 'mecaniciens'), where('deleted', '!=', true), where('siteId', '==', user?.siteId || 'SMI'));
    }
    const unsubMecaniciens = onSnapshot(qMecaniciens, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Mecanicien[];
      data.sort((a: any, b: any) => {
        const tA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt || 0);
        const tB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt || 0);
        return tB - tA;
      });
      setMecaniciens(data);
    }, (err) => {
      console.error(err);
      toast.error("Erreur de chargement des mécaniciens.");
    });

    // 3. CHANTIERS
    const unsubChantiers = onSnapshot(query(collection(db, 'chantiers'), where('deleted', '!=', true)), (snap) => {
      let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Chantier[];
      if (user?.role !== 'ADMIN' && user?.role !== 'DIRECTION') {
        data = data.filter(c => c.id === (user?.siteId || 'SMI'));
      }
      data.sort((a: any, b: any) => {
        const tA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt || 0);
        const tB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt || 0);
        return tB - tA;
      });
      setChantiers(data);
    }, (err) => {
      console.error(err);
      toast.error("Erreur de chargement des chantiers.");
    });

    // 4. INTERVALLES
    const unsubIntervalles = onSnapshot(query(collection(db, 'pmIntervalles'), where('deleted', '!=', true)), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as IntervalleMaintenance[];
      data.sort((a: any, b: any) => {
        const tA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt || 0);
        const tB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt || 0);
        return tB - tA;
      });
      setIntervalles(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Erreur de chargement des intervalles.");
      setLoading(false);
    });

    return () => {
      unsubEngins();
      unsubMecaniciens();
      unsubChantiers();
      unsubIntervalles();
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
      if (editingItem) {
        const docRef = doc(db, 'engins', editingItem.id);
        const payload = {
          modele: data.modele || "ST2G",
          marque: data.marque || "Epiroc",
          type: data.type || "Scooptram",
          siteId: data.siteId || "SMI",
          heuresMarche: Number(data.heuresMarche) || 0,
          dateEntreeService: data.dateEntreeService || new Date().toISOString().split('T')[0],
          etat: data.etat || "Opérationnel",
          conducteurAssigne: data.conducteurAssigne || "Non assigné",
          updatedAt: Timestamp.now()
        };
        await updateDoc(docRef, payload);
        toast.success(`Engin ${editingItem.id} mis à jour avec succès !`);
      } else {
        if (engins.some(e => e.id.toLowerCase() === data.id?.toLowerCase())) {
          toast.error(`Le N° de Parc ${data.id} existe déjà.`);
          return;
        }
        const docRef = doc(db, 'engins', data.id);
        const payload = {
          id: data.id,
          modele: data.modele || "ST2G",
          marque: data.marque || "Epiroc",
          type: data.type || "Scooptram",
          siteId: data.siteId || "SMI",
          heuresMarche: Number(data.heuresMarche) || 0,
          dateEntreeService: data.dateEntreeService || new Date().toISOString().split('T')[0],
          etat: data.etat || "Opérationnel",
          conducteurAssigne: data.conducteurAssigne || "Non assigné",
          deleted: false,
          updatedAt: Timestamp.now()
        };
        await setDoc(docRef, payload);
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
      const docRef = doc(db, 'engins', id);
      await updateDoc(docRef, {
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
        const docRef = doc(db, 'mecaniciens', editingItem.id);
        const payload = {
          nomComplet: data.nomComplet,
          poste: data.poste || "Poste 1",
          specialite: data.specialite || "Généraliste",
          telephone: data.telephone || "",
          dateEmbauche: data.dateEmbauche || new Date().toISOString().split('T')[0],
          statut: data.statut || "Actif",
          siteId: data.siteId || "SMI",
          updatedAt: Timestamp.now()
        };
        await updateDoc(docRef, payload);
        toast.success(`Mécanicien ${data.nomComplet} mis à jour !`);
      } else {
        if (mecaniciens.some(m => m.id.toLowerCase() === data.id?.toLowerCase())) {
          toast.error(`Le matricule ${data.id} existe déjà.`);
          return;
        }
        const docRef = doc(db, 'mecaniciens', data.id);
        const payload = {
          id: data.id,
          nomComplet: data.nomComplet,
          poste: data.poste || "Poste 1",
          specialite: data.specialite || "Généraliste",
          telephone: data.telephone || "",
          dateEmbauche: data.dateEmbauche || new Date().toISOString().split('T')[0],
          statut: data.statut || "Actif",
          siteId: data.siteId || "SMI",
          deleted: false,
          updatedAt: Timestamp.now()
        };
        await setDoc(docRef, payload);
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
      const docRef = doc(db, 'mecaniciens', id);
      await updateDoc(docRef, {
        deleted: true,
        updatedAt: Timestamp.now()
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
        const docRef = doc(db, 'chantiers', editingItem.id);
        const payload = {
          nomComplet: data.nomComplet,
          type: data.type || "Mine souterraine",
          localisation: data.localisation || "",
          responsableId: data.responsableId || "",
          statut: data.statut || "Actif",
          updatedAt: Timestamp.now()
        };
        await updateDoc(docRef, payload);
        toast.success(`Chantier ${data.nomComplet} mis à jour.`);
      } else {
        if (chantiers.some(c => c.id.toUpperCase() === docId)) {
          toast.error(`Le code chantier ${data.id} existe déjà.`);
          return;
        }
        const docRef = doc(db, 'chantiers', docId);
        const payload = {
          id: docId,
          nomComplet: data.nomComplet,
          type: data.type || "Mine souterraine",
          localisation: data.localisation || "",
          responsableId: data.responsableId || "",
          statut: data.statut || "Actif",
          deleted: false,
          updatedAt: Timestamp.now()
        };
        await setDoc(docRef, payload);
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
      const docRef = doc(db, 'chantiers', id);
      await updateDoc(docRef, {
        deleted: true,
        updatedAt: Timestamp.now()
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
        const docRef = doc(db, 'pmIntervalles', editingItem.id);
        const payload = {
          typeEngin: data.typeEngin || "Générique",
          operation: data.operation,
          intervalleHeures: Number(data.intervalleHeures),
          produitHuile: data.produitHuile || "N/A",
          quantite: data.quantite || "N/A",
          priorite: data.priorite || "Normale",
          updatedAt: Timestamp.now()
        };
        await updateDoc(docRef, payload);
        toast.success("Intervalle de maintenance mis à jour.");
      } else {
        const payload = {
          typeEngin: data.typeEngin || "Générique",
          operation: data.operation,
          intervalleHeures: Number(data.intervalleHeures),
          produitHuile: data.produitHuile || "N/A",
          quantite: data.quantite || "N/A",
          priorite: data.priorite || "Normale",
          deleted: false,
          updatedAt: Timestamp.now()
        };
        await addDoc(collection(db, 'pmIntervalles'), payload);
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
      const docRef = doc(db, 'pmIntervalles', id);
      await updateDoc(docRef, {
        deleted: true,
        updatedAt: Timestamp.now()
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
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeTab === "engins") {
      csvContent += "No Parc,Modele,Marque,Type,Site,Heures de Marche,Entree en Service,Etat,Conducteur\n";
      engins.forEach(e => {
        csvContent += `"${e.id}","${e.modele}","${e.marque}","${e.type}","${e.siteId}",${e.heuresMarche},"${e.dateEntreeService}","${e.etat}","${e.conducteurAssigne}"\n`;
      });
    } else if (activeTab === "mecaniciens") {
      csvContent += "Matricule,Nom Complet,Poste,Specialite,Telephone,Embauche,Statut,Site\n";
      mecaniciens.forEach(m => {
        csvContent += `"${m.id}","${m.nomComplet}","${m.poste}","${m.specialite}","${m.telephone}","${m.dateEmbauche}","${m.statut}","${m.siteId || ''}"\n`;
      });
    } else if (activeTab === "chantiers") {
      csvContent += "Code,Nom Complet,Type,Localisation,Responsable,Statut\n";
      chantiers.forEach(c => {
        csvContent += `"${c.id}","${c.nomComplet}","${c.type}","${c.localisation}","${c.responsableId}","${c.statut}"\n`;
      });
    } else {
      csvContent += "Type Engin,Operation,Intervalle (heures),Huile/Produit,Quantite,Priorite\n";
      intervalles.forEach(i => {
        csvContent += `"${i.typeEngin}","${i.operation}",${i.intervalleHeures},"${i.produitHuile}","${i.quantite}","${i.priorite}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_${activeTab}_sou_gmao.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fichier CSV généré avec succès !");
  };

  // ==========================================
  // FILTRAGE EN TEMPS RÉEL DES DONNÉES
  // ==========================================
  const getFilteredData = () => {
    const q = searchQuery.toLowerCase();

    if (activeTab === "engins") {
      return engins.filter(e => {
        const matchesQuery = e.id.toLowerCase().includes(q) || e.modele.toLowerCase().includes(q) || e.conducteurAssigne.toLowerCase().includes(q);
        const matchesChantier = filterOption1 === "Tous" || e.siteId === filterOption1;
        const matchesEtat = filterOption2 === "Tous" || e.etat === filterOption2;
        return matchesQuery && matchesChantier && matchesEtat;
      });
    }

    if (activeTab === "mecaniciens") {
      return mecaniciens.filter(m => {
        const matchesQuery = m.nomComplet.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.specialite.toLowerCase().includes(q);
        const matchesPoste = filterOption1 === "Tous" || m.poste === filterOption1;
        const matchesStatut = filterOption2 === "Tous" || m.statut === filterOption2;
        return matchesQuery && matchesPoste && matchesStatut;
      });
    }

    if (activeTab === "chantiers") {
      return chantiers.filter(c => {
        const matchesQuery = c.nomComplet.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.localisation.toLowerCase().includes(q);
        const matchesType = filterOption1 === "Tous" || c.type === filterOption1;
        const matchesStatut = filterOption2 === "Tous" || c.statut === filterOption2;
        return matchesQuery && matchesType && matchesStatut;
      });
    }

    // Intervalles
    return intervalles.filter(i => {
      const matchesQuery = i.operation.toLowerCase().includes(q) || i.produitHuile.toLowerCase().includes(q);
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
      const operationnels = engins.filter(e => e.etat === "Opérationnel").length;
      const maintenance = engins.filter(e => e.etat === "En maintenance").length;
      const hs = engins.filter(e => e.etat === "Hors service").length;

      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-slate-500 uppercase">Total Engins</p>
              <p className="text-2xl font-black text-slate-900 m-0">{total}</p>
            </div>
            <Cpu className="h-8 w-8 text-slate-400" />
          </Card>
          <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-600 uppercase">Opérationnels</p>
              <p className="text-2xl font-black text-emerald-600 m-0">{operationnels}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500/20" />
          </Card>
          <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-amber-600 uppercase">En Maintenance</p>
              <p className="text-2xl font-black text-amber-600 m-0">{maintenance}</p>
            </div>
            <Wrench className="h-8 w-8 text-amber-500/20" />
          </Card>
          <Card className="bg-slate-50 border-rose-200/50 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-rose-600 uppercase">Hors Service</p>
              <p className="text-2xl font-black text-rose-600 m-0">{hs}</p>
            </div>
            <X className="h-8 w-8 text-rose-500/20" />
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
          <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-slate-500 uppercase">Total Équipe</p>
              <p className="text-2xl font-black text-slate-900 m-0">{total}</p>
            </div>
            <Users className="h-8 w-8 text-slate-400" />
          </Card>
          <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-[#4FC3F7] uppercase">Poste 1</p>
              <p className="text-2xl font-black text-slate-900 m-0">{p1}</p>
            </div>
            <User className="h-8 w-8 text-sky-500/20" />
          </Card>
          <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-teal-600 uppercase">Poste 2</p>
              <p className="text-2xl font-black text-teal-600 m-0">{p2}</p>
            </div>
            <User className="h-8 w-8 text-teal-500/20" />
          </Card>
          <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-violet-600 uppercase">Poste 3</p>
              <p className="text-2xl font-black text-violet-600 m-0">{p3}</p>
            </div>
            <User className="h-8 w-8 text-violet-500/20" />
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
          <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-slate-500 uppercase">Total Chantiers</p>
              <p className="text-2xl font-black text-slate-900 m-0">{total}</p>
            </div>
            <MapPin className="h-8 w-8 text-slate-400" />
          </Card>
          <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-600 uppercase">Actifs</p>
              <p className="text-2xl font-black text-emerald-600 m-0">{actifs}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500/20" />
          </Card>
          <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-amber-600 uppercase">En Préparation</p>
              <p className="text-2xl font-black text-amber-600 m-0">{prep}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500/20" />
          </Card>
          <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-mono tracking-wider font-extrabold text-rose-600 uppercase">Inactifs</p>
              <p className="text-2xl font-black text-rose-600 m-0">{inactifs}</p>
            </div>
            <X className="h-8 w-8 text-rose-500/20" />
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
        <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-mono tracking-wider font-extrabold text-slate-500 uppercase">Total Intervalles</p>
            <p className="text-2xl font-black text-slate-900 m-0">{total}</p>
          </div>
          <Gauge className="h-8 w-8 text-slate-400" />
        </Card>
        <Card className="bg-slate-50 border-rose-200/50 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-mono tracking-wider font-extrabold text-rose-600 uppercase">Critiques (Réglementaires)</p>
            <p className="text-2xl font-black text-rose-600 m-0">{critiques}</p>
          </div>
          <Shield className="h-8 w-8 text-rose-500/20" />
        </Card>
        <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-mono tracking-wider font-extrabold text-amber-600 uppercase">Priorité Haute</p>
            <p className="text-2xl font-black text-amber-600 m-0">{hautes}</p>
          </div>
          <Clock className="h-8 w-8 text-amber-500/20" />
        </Card>
        <Card className="bg-slate-50 border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-mono tracking-wider font-extrabold text-blue-600 uppercase">Priorité Normale</p>
            <p className="text-2xl font-black text-blue-600 m-0">{normales}</p>
          </div>
          <Settings className="h-8 w-8 text-blue-500/20" />
        </Card>
      </div>
    );
  };

  // RECONSTRUIT : Calcul auto du nombre d'engins assignés à un chantier
  const getEnginsCountForChantier = (chantierId: string) => {
    return engins.filter(e => e.siteId === chantierId).length;
  };

  return (
    <div className="space-y-6 bg-white min-h-screen text-slate-800 font-sans p-6 rounded-2xl border border-slate-200 shadow-xl">
      {/* RECONSTRUIT : Banner avec style conservé, changement de titre exact */}
      <PageBanner
        icon={Settings}
        badgeLabel="Hydromines SOU-GMAO Platform"
        title="CONFIGURATION SYSTÈME"
        subtitle="Gestion centralisée de votre parc, équipe et chantiers"
      />

      {/* RECONSTRUIT : Onglets Tactiles (Glove-Friendly) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("engins")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
            activeTab === "engins"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          🚜 ENGINS & VÉHICULES
        </button>
        <button
          onClick={() => setActiveTab("mecaniciens")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
            activeTab === "mecaniciens"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          👷 MÉCANICIENS & ÉQUIPE
        </button>
        <button
          onClick={() => setActiveTab("chantiers")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
            activeTab === "chantiers"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          🏗️ CHANTIERS & SITES
        </button>
        <button
          onClick={() => setActiveTab("intervalles")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
            activeTab === "intervalles"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          ⚙️ INTERVALLES MAINTENANCE
        </button>
      </div>

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
                activeTab === "mecaniciens" ? "Rechercher par Matricule, Nom, Spécialité..." :
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

            {activeTab === "mecaniciens" && (
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
              {activeTab === "mecaniciens" && "Mécanicien"}
              {activeTab === "chantiers" && "Chantier"}
              {activeTab === "intervalles" && "Intervalle"}
            </Button>
          </div>
        </div>
      </Card>

      {/* RECONSTRUIT : Listes / Tableaux Dynamiques pour chaque onglet */}
      <Card className="bg-white border-slate-200 shadow-md rounded-xl overflow-hidden">
        <CardContent className="p-0">
          
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
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-mono tracking-wider uppercase">
                    
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
                    {activeTab === "mecaniciens" && (
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
                        {e.heuresMarche.toLocaleString()} hrs
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 font-mono">{e.dateEntreeService}</td>
                      <td className="py-4 px-4 text-slate-600 text-xs font-medium">{e.conducteurAssigne}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          e.etat === "Opérationnel" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          e.etat === "En maintenance" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          e.etat === "Hors service" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                          "bg-slate-50 text-slate-500 border border-slate-200"
                        }`}>
                          {e.etat}
                        </span>
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
                  {activeTab === "mecaniciens" && (filteredData as Mecanicien[]).map((m) => (
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
              Êtes-vous absolument sûr de vouloir supprimer cet élément ? Cette action est irréversible et supprimera définitivement les données du stockage local.
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
                  else if (activeTab === "mecaniciens") handleDeleteMecanicien(confirmDeleteId);
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
                  activeTab === "mecaniciens" ? "UN COLLABORATEUR" :
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
              else if (activeTab === "mecaniciens") handleSaveMecanicien(data);
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
                      defaultValue={editingItem?.dateEntreeService || new Date().toISOString().split('T')[0]}
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
              {activeTab === "mecaniciens" && (
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
                      defaultValue={editingItem?.dateEmbauche || new Date().toISOString().split('T')[0]}
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

    </div>
  );
}
