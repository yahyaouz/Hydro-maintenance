import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function seedDatabase() {
  const enginsRef = collection(db, 'engins');
  const snapshot = await getDocs(enginsRef);
  
  if (snapshot.empty) {
    console.log("Seeding database...");
    
    // Seed Engins
    const engins = [
      { matricule: "M-045", type: "ST2G", marque: "Sandvik", modele: "T-800", site: "SMI", statut: "actif", heures: 4520, dispo: 92 },
      { matricule: "S-012", type: "ST7", marque: "Epiroc", modele: "MT", site: "KOUDIA", statut: "maintenance", heures: 1200, dispo: 0 },
      { matricule: "H-001", type: "Hilux", marque: "Toyota", modele: "Vigo", site: "SMI", statut: "panne", heures: 85000, dispo: 0 },
      { matricule: "P-002", type: "ST2D", marque: "Sandvik", modele: "X-200", site: "KOUDIA", statut: "actif", heures: 2100, dispo: 85 },
    ];

    for (const engin of engins) {
      await addDoc(enginsRef, engin);
    }

    // Seed pieces
    const piecesRef = collection(db, 'pieces');
    const pieces = [
      { ref: "FILT-500-SAND", nom: "Filtre à Huile Sandvik", categorie: "Filtres", stock: 12, min: 5, prix: 45000, siteId: "SMI" },
      { ref: "V-HYD-T800", nom: "Vérin Hydraulique T800", categorie: "Hydraulique", stock: 2, min: 2, prix: 1200000, siteId: "SMI" },
      { ref: "PNEU-TOY-26", nom: "Pneu Bridgestone 26.5R25", categorie: "Pneumatiques", stock: 0, min: 1, prix: 850000, siteId: "KOUDIA" },
    ];

    for (const piece of pieces) {
      await addDoc(piecesRef, piece);
    }

    // Seed Pannes
    const pannesRef = collection(db, 'pannes');
    const pannes = [
      { numero: "PAN-2026-0001", engin: "M-045", categorie: "Hydraulique", gravite: "critique", statut: "réparation", date: "2026-05-18", description: "Fuite majeure sur vérin de levage", siteId: "SMI" },
      { numero: "PAN-2026-0002", engin: "S-012", categorie: "Mécanique", gravite: "élevée", statut: "diagnostic", date: "2026-05-18", description: "Bruit anormal moteur", siteId: "SMI" },
      { numero: "PAN-2026-0003", engin: "P-002", categorie: "Électrique", gravite: "moyenne", statut: "déclarée", date: "2026-05-17", description: "Problème démarrage", siteId: "KOUDIA" },
    ];

    for (const panne of pannes) {
      await addDoc(pannesRef, panne);
    }

    console.log("Database seeded successfully!");
  }
}
