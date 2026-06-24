import * as React from "react";
import {
  BookOpen, AlertTriangle, ShieldAlert, Wrench, Droplets, Clock,
  ChevronDown, ChevronRight, Info, Gauge, Settings, Zap, CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { HydrominesLogo } from "./auth/HydrominesLogo";

// --- Types ---
interface MenuItem {
  id: string;
  label: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface GraissagePoint {
  id: number;
  name: string;
  freq: string;
  coups: number;
  graisse: string;
  acces: string;
  x: number;
  y: number;
  color: string;
}

export function ReferentielTechnique() {
  const { user } = useAuthStore();
  const [activeEngin, setActiveEngin] = React.useState("ST2G");
  const [activeSection, setActiveSection] = React.useState("identite");

  // Interactive UI states
  const [hoveredComponent, setHoveredComponent] = React.useState<string | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = React.useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = React.useState<GraissagePoint | null>(null);
  const [openAccordions, setOpenAccordions] = React.useState<Record<string, boolean>>({});

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // --- MENU GAUCHE CONFIGURATION ---
  const menuGroups: MenuGroup[] = [
    {
      title: "IDENTIFICATION",
      items: [
        { id: "identite", label: "Fiche d'identité technique" }
      ]
    },
    {
      title: "MOTEUR",
      items: [
        { id: "moteur-specs", label: activeEngin === "ST2D" ? "Caractéristiques Deutz F6L912W" : "Caractéristiques Cummins QSB 4.5" },
        { id: "moteur-fluides", label: "Capacités & fluides moteur" },
        { id: "moteur-pm", label: "Plan de maintenance moteur" },
        { id: "circuit-huile", label: activeEngin === "ST2D" ? "Schéma circuit huile Deutz (SVG)" : "Schéma circuit huile Cummins (SVG)" },
        { id: "circuit-refroidissement", label: activeEngin === "ST2D" ? "Schéma ventilation Deutz (SVG)" : "Schéma refroidissement Cummins (SVG)" }
      ]
    },
    {
      title: "CHÂSSIS & TRANSMISSION",
      items: [
        { id: "hydraulique", label: "Système hydraulique" },
        { id: "transmission", label: "Transmission & Essieux Dana" },
        { id: "freinage", label: "Frein SAHR" }
      ]
    },
    {
      title: "MAINTENANCE TERRAIN",
      items: [
        { id: "graissage", label: "Plan de graissage (SVG)" },
        { id: "pneus", label: "Pneumatiques" },
        { id: "fluides-recap", label: "Tableau récap. fluides" }
      ]
    },
    {
      title: "DIAGNOSTIC",
      items: [
        { id: "diag-moteur", label: "Diagnostic pannes moteur" },
        { id: "diag-hydraulique", label: "Diagnostic pannes hydrauliques" }
      ]
    },
    {
      title: "PROCÉDURES",
      items: [
        { id: "proc-vidange", label: "Procédure vidange moteur" },
        { id: "proc-purge", label: "Procédure purge carburant" },
        { id: "proc-soupapes", label: "Réglage jeu aux soupapes" },
        { id: "proc-flexible", label: "Remplacement flexible HP" }
      ]
    }
  ];

  // --- DATA STRUCTURES (Concise, modular) ---
  const generalIdentite = activeEngin === "ST2D" ? [
    { label: "Désignation", val: "Chargeuse souterraine sur pneus (LHD)" },
    { label: "Constructeur", val: "Epiroc (ex Atlas Copco)" },
    { label: "Moteur", val: "Deutz F6L912W, Stage II (MSHA)" },
    { label: "Puissance", val: "63 kW / 84 hp à 2 300 rpm" },
    { label: "Capacité de chargement", val: "3 600 kg" },
    { label: "Volume godet standard", val: "1,5 m³ (options : 1,3 / 1,7 m³)" },
    { label: "Poids à vide", val: "12 500 kg" },
    { label: "Réservoir carburant", val: "110 litres" },
    { label: "Réservoir hydraulique", val: "95 litres" },
    { label: "Pneus standard", val: "12.00 R24" }
  ] : [
    { label: "Désignation", val: "Chargeuse souterraine sur pneus (LHD)" },
    { label: "Constructeur", val: "Epiroc (ex Atlas Copco)" },
    { label: "Moteur", val: "Cummins QSB 4.5, Tier 3" },
    { label: "Puissance", val: "81 kW / 109 hp à 2 000 rpm" },
    { label: "Capacité de chargement", val: "4 000 kg" },
    { label: "Volume godet standard", val: "1,9 m³ (options : 1,5 / 1,7 / 2,5 m³)" },
    { label: "Poids à vide", val: "13 650 kg" },
    { label: "Réservoir carburant", val: "132 litres" },
    { label: "Réservoir hydraulique", val: "144 litres" },
    { label: "Pneus standard", val: "12.00 R24" }
  ];

  const performancesChassis = activeEngin === "ST2D" ? [
    { label: "Transmission", val: "Clark-Dana 18000 — 3 vitesses AV/AR" },
    { label: "Essieux", val: "Dana 12D" },
    { label: "Différentiel avant", val: "No-Spin (anti-patinage)" },
    { label: "Frein de service", val: "Disque immergé (wet disc)" },
    { label: "Frein de parking", val: "SAHR (ressort/hydraulique)" },
    { label: "Pression circuit levage", val: "125 bar (12,5 MPa)" },
    { label: "Vérin levage", val: "2 × diamètre 140 mm" },
    { label: "Vérin basculement", val: "1 × diamètre 140 mm" },
    { label: "Vérin direction", val: "1 × diamètre 100 mm" },
    { label: "Temps de levée boom", val: "3,8 secondes" },
    { label: "Angle articulation", val: "± 40°" }
  ] : [
    { label: "Transmission", val: "Dana R20000 — 4 vitesses AV/AR" },
    { label: "Essieux", val: "Dana 14D" },
    { label: "Différentiel avant", val: "No-Spin (anti-patinage)" },
    { label: "Frein de service", val: "Disque immergé (wet disc)" },
    { label: "Frein de parking", val: "SAHR (ressort/hydraulique)" },
    { label: "Pression circuit levage", val: "124 bar (12,4 MPa)" },
    { label: "Vérin levage", val: "2 × diamètre 180 mm" },
    { label: "Vérin basculement", val: "1 × diamètre 180 mm" },
    { label: "Vérin direction", val: "1 × diamètre 125 mm" },
    { label: "Temps de levée boom", val: "3,3 secondes" },
    { label: "Angle articulation", val: "± 42°" }
  ];

  const motorSpecs = activeEngin === "ST2D" ? [
    { label: "Modèle", val: "Deutz F6L912W" },
    { label: "Norme d'émission", val: "Stage II / MSHA certifié" },
    { label: "Configuration", val: "6 cylindres en ligne, atmosphérique, refroidissement DIRECT PAR AIR (soufflante)" },
    { label: "Cylindrée", val: "5,66 litres (345 pouces cubes)" },
    { label: "Alésage × Course", val: "100 mm × 120 mm" },
    { label: "Taux de compression", val: "17,0 : 1" },
    { label: "Puissance nominale", val: "63 kW (84 hp) à 2 300 rpm" },
    { label: "Couple maxi", val: "315 N·m à 1 600 rpm" },
    { label: "Régime ralenti", val: "650 ± 25 rpm" },
    { label: "Régime nominal max", val: "2 300 rpm" },
    { label: "Système injection", val: "Directe Bosch mécanique par pompe d'injection en ligne" },
    { label: "Turbocompresseur", val: "Aucun (Atmosphérique - haute fiabilité minière)" },
    { label: "Ordre d'allumage", val: "1 - 5 - 3 - 6 - 2 - 4" },
    { label: "Poids moteur (à sec)", val: "430 kg" }
  ] : [
    { label: "Modèle", val: "Cummins QSB 4.5" },
    { label: "Norme d'émission", val: "Tier 3 / Stage IIIA" },
    { label: "Configuration", val: "4 cylindres en ligne, turbocompressé, refroidissement liquide" },
    { label: "Cylindrée", val: "4,5 litres (275 pouces cubes)" },
    { label: "Alésage × Course", val: "102 mm × 120 mm (vérifier plaque signalétique)" },
    { label: "Taux de compression", val: "17,2 : 1" },
    { label: "Puissance nominale", val: "81 kW (109 hp) à 2 000 rpm" },
    { label: "Couple maxi", val: "420 N·m (310 ft-lb) à 1 500 rpm" },
    { label: "Régime ralenti", val: "700 ± 25 rpm" },
    { label: "Régime nominal max", val: "2 200 rpm" },
    { label: "Système injection", val: "HPCR (High Pressure Common Rail) — 1 600 bar" },
    { label: "Turbocompresseur", val: "Wastegated — conception Cummins Turbo Tech." },
    { label: "Ordre d'allumage", val: "1 - 3 - 4 - 2" },
    { label: "Poids moteur (avec fluides)", val: "371 kg" }
  ];

  const motorFluides = activeEngin === "ST2D" ? [
    { label: "Circuit huile moteur (sans filtre)", val: "14,5 litres" },
    { label: "Circuit huile moteur (avec filtre)", val: "15,5 litres" },
    { label: "Qualité huile moteur", val: "SAE 15W-40, API CF-4 ou CG-4 pour moteurs refroidis par air" },
    { label: "Intervalle vidange moteur", val: "250h (Conditions minières strictes)" },
    { label: "Pression huile mini (chaud, ralenti)", val: "80 kPa (0,8 bar / 11.6 psi)" },
    { label: "Pression huile normale (charge)", val: "250–450 kPa (2,5–4,5 bar / 36–65 psi)" },
    { label: "Liquide de refroidissement", val: "AUCUN — Refroidissement par turbine d'air axiale soufflante" },
    { label: "Système de secours thermique", val: "Détection température de culasse par sonde thermocouple (Culasse max : 170°C)" },
    { label: "Alarme température culasse", val: "Déclenchement à 150°C" },
    { label: "Carburant", val: "Diesel EN 590 (teneur soufre < 500 ppm)" },
    { label: "Réservoir carburant ST2D", val: "110 litres" }
  ] : [
    { label: "Circuit huile moteur (sans filtre)", val: "10,5 litres" },
    { label: "Circuit huile moteur (avec filtre)", val: "11 litres (11.6 quarts)" },
    { label: "Qualité huile moteur", val: "SAE 15W-40, API CJ-4 minimum (CES20078)" },
    { label: "Intervalle vidange moteur", val: "500h (Conditions standard) / 250h (Mines souterraines)" },
    { label: "Pression huile mini (chaud, ralenti)", val: "69 kPa (10 psi / 0,7 bar)" },
    { label: "Pression huile normale (charge)", val: "275–380 kPa (40–55 psi / 2,75–3,8 bar)" },
    { label: "Liquide refroidissement total", val: "~12 litres (circuit complet engin)" },
    { label: "Type liquide refroidissement", val: "OAT (Organic Acid Technology) anti-gel 50/50 — Cummins ES Compleat" },
    { label: "Température thermostat ouverture", val: "82°C" },
    { label: "Température thermostat plein ouvert", val: "95°C" },
    { label: "Température coolant maxi admissible", val: "107°C (au-delà : arrêt moteur direct)" },
    { label: "Carburant", val: "Diesel EN 590 (teneur soufre < 500 ppm)" },
    { label: "Réservoir carburant ST2G", val: "132 litres" }
  ];

  const motorPM = activeEngin === "ST2D" ? [
    { op: "Vérifier niveau huile moteur (jauge)", t10: true, t250: false, t500: false, t1000: false, exe: "Conducteur" },
    { op: "Vérifier propreté des ailettes de refroidissement (cylindres/culasses)", t10: true, t250: false, t500: false, t1000: false, exe: "Conducteur" },
    { op: "Purger séparateur eau filtre carburant", t10: true, t250: false, t500: false, t1000: false, exe: "Conducteur" },
    { op: "Inspection visuelle fuites moteur", t10: true, t250: false, t500: false, t1000: false, exe: "Conducteur" },
    { op: "Vérifier tension courroie de turbine d'air", t10: true, t250: false, t500: false, t1000: false, exe: "Conducteur" },
    { op: "Vidange huile moteur (mines)", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Remplacement filtre huile", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Remplacement préfiltre & filtre carburant", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Nettoyage / soufflage ailettes cylindres et culasses (critique)", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Contrôle tension / usure courroie de turbine", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Remplacement filtre air cartouche principale", t10: false, t250: false, t500: true, t1000: false, exe: "Mécanicien" },
    { op: "Réglage jeu aux soupapes (moteur froid)", t10: false, t250: false, t500: true, t1000: false, exe: "Mécanicien qualifié" },
    { op: "Contrôle injecteurs (fumée, pulvérisation)", t10: false, t250: false, t500: true, t1000: false, exe: "Mécanicien qualifié" },
    { op: "Remplacement courroie de turbine", t10: false, t250: false, t500: false, t1000: true, exe: "Mécanicien" },
    { op: "Remplacement filtre air sécurité (safety)", t10: false, t250: false, t500: false, t1000: true, exe: "Mécanicien" },
    { op: "Vérification / calibration pompe d'injection Bosch", t10: false, t250: false, t500: false, t1000: true, exe: "Atelier agréé Deutz" },
    { op: "Inspection de la turbine de refroidissement et du conduit d'air", t10: false, t250: false, t500: false, t1000: true, exe: "Mécanicien qualifié" }
  ] : [
    { op: "Vérifier niveau huile moteur (jauge)", t10: true, t250: false, t500: false, t1000: false, exe: "Conducteur" },
    { op: "Vérifier niveau liquide refroidissement", t10: true, t250: false, t500: false, t1000: false, exe: "Conducteur" },
    { op: "Purger séparateur eau filtre carburant", t10: true, t250: false, t500: false, t1000: false, exe: "Conducteur" },
    { op: "Inspection visuelle fuites moteur", t10: true, t250: false, t500: false, t1000: false, exe: "Conducteur" },
    { op: "Vérifier état courroies (visuel)", t10: true, t250: false, t500: false, t1000: false, exe: "Conducteur" },
    { op: "Vidange huile moteur (mines)", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Remplacement filtre huile", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Remplacement filtre carburant primaire", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Remplacement filtre carburant secondaire", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Nettoyage filtre air à sec", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Contrôle tension / état courroies", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Nettoyage échangeur thermique externe", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Vérification connexions électriques", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Contrôle / serrage durites refroidissement", t10: false, t250: true, t500: false, t1000: false, exe: "Mécanicien" },
    { op: "Remplacement filtre air cartouche principale", t10: false, t250: false, t500: true, t1000: false, exe: "Mécanicien" },
    { op: "Remplacement courroies (si usure)", t10: false, t250: false, t500: true, t1000: false, exe: "Mécanicien" },
    { op: "Réglage jeu aux soupapes", t10: false, t250: false, t500: true, t1000: false, exe: "Mécanicien qualifié" },
    { op: "Contrôle injecteurs (bruit, fumée)", t10: false, t250: false, t500: true, t1000: false, exe: "Mécanicien qualifié" },
    { op: "Remplacement liquide refroidissement", t10: false, t250: false, t500: false, t1000: true, exe: "Mécanicien" },
    { op: "Remplacement filtre air sécurité (safety)", t10: false, t250: false, t500: false, t1000: true, exe: "Mécanicien" },
    { op: "Vérification / calibration injecteurs", t10: false, t250: false, t500: false, t1000: true, exe: "Atelier agréé Cummins" },
    { op: "Inspection turbocompresseur (jeu axe)", t10: false, t250: false, t500: false, t1000: true, exe: "Mécanicien qualifié" },
    { op: "Remplacement flexibles carburant souples", t10: false, t250: false, t500: false, t1000: true, exe: "Mécanicien" }
  ];

  // --- GRAISSAGE POINTS DATA ---
  const graissagePoints: GraissagePoint[] = [
    { id: 1, name: "Articulation centrale Supérieure", freq: "50h", coups: 2, graisse: "EP2", acces: "Dessous centre", x: 375, y: 185, color: "#ef4444" },
    { id: 2, name: "Articulation centrale Inférieure", freq: "50h", coups: 2, graisse: "EP2", acces: "Dessous centre", x: 375, y: 265, color: "#ef4444" },
    { id: 3, name: "Rotule vérin levage AV gauche", freq: "50h", coups: 2, graisse: "EP2", acces: "Côté boom", x: 480, y: 130, color: "#ef4444" },
    { id: 4, name: "Rotule vérin levage AV droit", freq: "50h", coups: 2, graisse: "EP2", acces: "Côté boom", x: 480, y: 300, color: "#ef4444" },
    { id: 5, name: "Rotule vérin levage AR gauche", freq: "50h", coups: 2, graisse: "EP2", acces: "Côté boom", x: 440, y: 140, color: "#ef4444" },
    { id: 6, name: "Rotule vérin levage AR droit", freq: "50h", coups: 2, graisse: "EP2", acces: "Côté boom", x: 440, y: 290, color: "#ef4444" },
    { id: 7, name: "Rotule vérin basculement Tête", freq: "50h", coups: 2, graisse: "EP2", acces: "Tête boom", x: 550, y: 200, color: "#ef4444" },
    { id: 8, name: "Rotule vérin basculement Pied", freq: "50h", coups: 2, graisse: "EP2", acces: "Tête boom", x: 500, y: 215, color: "#ef4444" },
    { id: 9, name: "Axe godet gauche", freq: "50h", coups: 2, graisse: "EP2", acces: "Axe fixation", x: 640, y: 150, color: "#ef4444" },
    { id: 10, name: "Axe godet droit", freq: "50h", coups: 2, graisse: "EP2", acces: "Axe fixation", x: 640, y: 280, color: "#ef4444" },
    { id: 11, name: "Axe fixation godet centre", freq: "50h", coups: 2, graisse: "EP2", acces: "Axe fixation", x: 650, y: 215, color: "#ef4444" },
    { id: 12, name: "Pivot articulation AV haut", freq: "100h", coups: 3, graisse: "EP2", acces: "Châssis avant", x: 390, y: 170, color: "#f97316" },
    { id: 13, name: "Pivot articulation AV bas", freq: "100h", coups: 3, graisse: "EP2", acces: "Châssis avant", x: 390, y: 260, color: "#f97316" },
    { id: 14, name: "Pivot articulation AR haut", freq: "100h", coups: 3, graisse: "EP2", acces: "Châssis arrière", x: 360, y: 170, color: "#f97316" },
    { id: 15, name: "Pivot articulation AR bas", freq: "100h", coups: 3, graisse: "EP2", acces: "Châssis arrière", x: 360, y: 260, color: "#f97316" },
    { id: 16, name: "Axe principal de flèche Gauche", freq: "100h", coups: 2, graisse: "EP2", acces: "Base boom", x: 430, y: 120, color: "#f97316" },
    { id: 17, name: "Axe principal de flèche Droit", freq: "100h", coups: 2, graisse: "EP2", acces: "Base boom", x: 430, y: 310, color: "#f97316" },
    { id: 18, name: "Tourillon vérin direction Gauche", freq: "100h", coups: 2, graisse: "EP2", acces: "Vérins dir.", x: 320, y: 140, color: "#f97316" },
    { id: 19, name: "Tourillon vérin direction Droit", freq: "100h", coups: 2, graisse: "EP2", acces: "Vérins dir.", x: 320, y: 290, color: "#f97316" },
    { id: 20, name: "Cardan transmission AR", freq: "250h", coups: 4, graisse: "EP2 HT", acces: "Sous châssis", x: 180, y: 215, color: "#eab308" },
    { id: 21, name: "Cardan transmission AV", freq: "250h", coups: 4, graisse: "EP2 HT", acces: "Sous châssis", x: 280, y: 215, color: "#eab308" },
    { id: 22, name: "Paliers de roues (4 roues)", freq: "500h", coups: 1, graisse: "EP2 HT", acces: "Cache-poussière", x: 100, y: 165, color: "#3b82f6" }
  ];

  const handleComponentHover = (id: string, text: string) => {
    setHoveredComponent(id);
    setHoveredTooltip(text);
  };

  const clearHover = () => {
    setHoveredComponent(null);
    setHoveredTooltip(null);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-slate-900 font-sans select-none relative z-10 w-full">
      
      {/* --- NIVEAU 1 : SELECTION DE LA MACHINE (TOP NAV BAR) --- */}
      <div className="w-full lg:absolute lg:top-0 lg:left-0 lg:right-0 bg-white border-b border-slate-100 p-4 shrink-0 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveEngin("ST2G")}
            className={cn(
              "h-10 px-5 rounded-lg font-black text-xs uppercase tracking-wider transition-all",
              activeEngin === "ST2G" ? "bg-amber-500 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-500 hover:text-amber-600"
            )}
          >
            Scooptram ST2G
          </button>
          
          <button
            onClick={() => setActiveEngin("ST2D")}
            className={cn(
              "h-10 px-5 rounded-lg font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
              activeEngin === "ST2D" ? "bg-amber-500 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-500 hover:text-amber-600"
            )}
          >
            Scooptram ST2D
          </button>
          <button disabled className="h-10 px-5 rounded-lg font-black text-xs uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-350 cursor-not-allowed">
            Montabert T23 (Bientôt)
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Régulateur centralisé de documentation
        </div>
      </div>

      {/* Spacing Offset for Top selection bar */}
      <div className="w-full lg:pt-16 flex flex-col lg:flex-row flex-1">
        
        {/* --- NIVEAU 2 : SIDEBAR STICKY NAVIGATION SECTIONS --- */}
        <aside className="w-full lg:w-64 bg-white border-r border-slate-100 shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] overflow-y-auto p-4 space-y-6 z-20">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest pl-2 border-l-2 border-amber-500">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-between cursor-pointer",
                      activeSection === item.id
                        ? "bg-amber-50/50 text-amber-800 border border-amber-500/10 font-black shadow-2xs"
                        : "text-slate-500 hover:text-amber-600 hover:bg-slate-50/30"
                    )}
                  >
                    <span>{item.label}</span>
                    {activeSection === item.id && <ChevronRight className="w-3.5 h-3.5 text-amber-600 shrink-0 stroke-[2.5]" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* --- NIVEAU 3 : CONTENU DE LA ZONE DROITE (FLEX-1) --- */}
        <main className="flex-1 p-6 lg:p-8 space-y-12 overflow-y-auto bg-white max-w-5xl mx-auto w-full">
          
          {/* --- PARTIE 2 : APP BANNER --- */}
          <div className="bg-white border-2 border-amber-500/10 rounded-[14px] shadow-sm overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              
              <div className="lg:col-span-2 p-6 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#121c26] to-[#04080c] border border-amber-500/30 text-[#ffd700]">
                  <BookOpen className="w-8 h-8 stroke-[2.2]" />
                </div>
              </div>

              <div className="lg:col-span-7 p-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left gap-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/45">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#b8860b]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-800">
                    DOCUMENTATION OFFICIELLE EPIROC — SMI
                  </span>
                </div>
                <h1 className="text-2xl xl:text-3xl tracking-tight leading-none uppercase font-black">
                  <span className="luminous-gold-white-text">
                    Référentiel Technique
                  </span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Manuel de maintenance · Epiroc Scooptram {activeEngin} · {activeEngin === "ST2D" ? "Deutz F6L912W" : "Cummins QSB 4.5 Tier 3"}
                </p>
              </div>

              <div className="lg:col-span-3 p-6 flex flex-col justify-center items-center lg:items-end gap-1.5">
                <HydrominesLogo size={120} variant="full" className="mb-2" />
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50/80 border border-amber-200/30 rounded-md">
                  <span className="w-1.5 h-1.5 bg-[#b8860b] rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold tracking-wider uppercase text-[#b8860b]">ENGIN ACTIF</span>
                </div>
                <div className="px-3 py-1 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-lg text-xs font-black text-[#ffd700] shadow-md uppercase tracking-widest">
                  SCOOPTRAM {activeEngin}
                </div>
              </div>

            </div>
          </div>

          {/* --- PARTIE 4 : SECTION IDENTITE --- */}
          <section id="identite" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Settings className="w-4 h-4" /></span>
              Fiche d'identité technique générale
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Identification générale</h3>
                {generalIdentite.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Performances & châssis</h3>
                {performancesChassis.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right">{item.val}</span>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* --- PARTIE 5 : SECTION MOTEUR SPECS --- */}
          <section id="moteur-specs" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Wrench className="w-4 h-4" /></span>
              {activeEngin === "ST2D" ? "Caractéristiques Deutz F6L912W" : "Caractéristiques Cummins QSB 4.5"}
            </h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-bold">
                {activeEngin === "ST2D" ? (
                  <>
                    Données officielles Deutz AG — Moteur F6L912W à refroidissement direct par air (MSHA / Stage II).
                    Vérifier la plaque signalétique moteur fixée sur le bloc de soufflante d'air ou de carter moteur avant toute intervention.
                  </>
                ) : (
                  <>
                    Données officielles Cummins Inc. — Moteur QSB 4.5 Tier 3.
                    Vérifier la plaque signalétique moteur avant toute intervention (située côté distribution). Numéro de série gravé sur le bloc.
                  </>
                )}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-3xl">
              <div className="space-y-1">
                {motorSpecs.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right max-w-sm">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* --- PARTIE 6 : SECTION MOTEUR FLUIDES --- */}
          <section id="moteur-fluides" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Droplets className="w-4 h-4" /></span>
              Capacités & Fluides moteur
            </h2>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-xs text-red-800 font-black flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-700" /> RÈGLE ABSOLUE
              </p>
              <p className="text-[11px] text-red-700 mt-1 font-bold">
                Utiliser UNIQUEMENT les fluides référencés ci-dessous. Un fluide non conforme peut annuler la garantie et endommager irrémédiablement les composants. Sur le terrain : ne jamais mélanger des huiles de marques ou spécifications différentes.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-3xl">
              <div className="space-y-1">
                {motorFluides.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right max-w-md">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* --- PARTIE 7 : SECTION PLAN DE MAINTENANCE MOTEUR --- */}
          <section id="moteur-pm" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Clock className="w-4 h-4" /></span>
                Planning d'entretien officiel — {activeEngin === "ST2D" ? "Deutz F6L912W" : "Cummins QSB 4.5 Tier 3"}
              </h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/50">
                EXPLOITATION MINIÈRE SOUTERRAINE
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed font-bold">
              📢 {activeEngin === "ST2D" ? "Deutz" : "Cummins"} prévoit 500h entre vidanges en conditions standard. En mine souterraine (poussières, chaleur, charges continues, arrêts fréquents), Hydromines applique l'intervalle 250h. Cette décision est validée par les pratiques Epiroc terrain.
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-amber-50/55 border-b border-amber-200 text-[9px] font-black uppercase tracking-wider text-amber-700">
                      <th className="p-3 w-[45%]">Opération de Maintenance</th>
                      <th className="p-3 text-center">10h / Quotidien</th>
                      <th className="p-3 text-center">250h (Vidange)</th>
                      <th className="p-3 text-center">500h</th>
                      <th className="p-3 text-center">1000h</th>
                      <th className="p-3">Exécutant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                    {motorPM.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30">
                        <td className="p-3 text-slate-800">{item.op}</td>
                        <td className="p-3 text-center">
                          {item.t10 && <span className="text-amber-500 font-black text-lg">●</span>}
                        </td>
                        <td className="p-3 text-center">
                          {item.t250 && <span className="text-amber-500 font-black text-lg">●</span>}
                        </td>
                        <td className="p-3 text-center">
                          {item.t500 && <span className="text-amber-500 font-black text-lg">●</span>}
                        </td>
                        <td className="p-3 text-center">
                          {item.t1000 && <span className="text-amber-500 font-black text-lg">●</span>}
                        </td>
                        <td className="p-3 font-bold text-slate-500 text-xxs uppercase tracking-wider">{item.exe}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* --- PARTIE 8 : SCHÉMA CIRCUIT HUILE --- */}
          <section id="circuit-huile" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Droplets className="w-4 h-4" /></span>
              {activeEngin === "ST2D" ? "Circuit de lubrification moteur — Deutz F6L912W" : "Circuit de lubrification moteur — Cummins QSB 4.5"}
            </h2>

            <div className="bg-white border border-slate-200 rounded-xl p-6 relative">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Passez votre souris sur un composant pour voir les prescriptions de maintenance terrain.
              </p>

              {/* Dynamic Absolute Tooltip Display */}
              {hoveredTooltip && (
                <div className="absolute top-4 right-4 max-w-xs bg-slate-900 text-white text-xs font-semibold p-3.5 rounded-lg shadow-xl border border-slate-800 z-30 animate-in fade-in zoom-in-95 duration-100 uppercase tracking-wider leading-relaxed">
                  <span className="text-amber-500 font-black block text-[10px] tracking-widest mb-1">Prescription Technique</span>
                  {hoveredTooltip}
                </div>
              )}

              {/* Interactive SVG Oil Circuit */}
              <div className="relative overflow-hidden w-full overflow-x-auto bg-black rounded-xl p-4 pl-8 border border-slate-800 shadow-2xl">
                {/* Left accent lines */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-950 border-r border-red-800/30" />
                <div className="absolute left-1.5 top-0 bottom-0 w-1 bg-sky-400" />
                <svg viewBox="0 0 800 520" className="w-full max-w-3xl mx-auto font-mono text-[10px] font-black select-none">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0ea5e9" />
                    </marker>
                    <marker id="arrow-gray" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
                    </marker>
                  </defs>

                  {/* Connective pipes with markers */}
                  <path d="M 330 455 L 180 455 L 180 355" fill="none" stroke="#0ea5e9" strokeWidth="2.5" markerEnd="url(#arrow)" />
                  <path d="M 180 310 L 180 245" fill="none" stroke="#0ea5e9" strokeWidth="2.5" markerEnd="url(#arrow)" />
                  <path d="M 180 200 L 180 155" fill="none" stroke="#0ea5e9" strokeWidth="2.5" markerEnd="url(#arrow)" />
                  <path d="M 185 110 L 290 110" fill="none" stroke="#0ea5e9" strokeWidth="2.5" markerEnd="url(#arrow)" />
                  
                  {/* Delivery paths to components */}
                  <path d="M 400 155 L 400 280" fill="none" stroke="#0ea5e9" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 510 110 L 550 95" fill="none" stroke="#0ea5e9" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 510 120 L 550 145" fill="none" stroke="#0ea5e9" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 510 130 L 550 195" fill="none" stroke="#0ea5e9" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 510 140 L 550 245" fill="none" stroke="#0ea5e9" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 510 150 L 550 305" fill="none" stroke="#0ea5e9" strokeWidth="2" markerEnd="url(#arrow)" />

                  {/* Return paths */}
                  <path d="M 550 315 L 450 430" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arrow-gray)" />
                  <path d="M 360 325 L 360 430" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arrow-gray)" />

                  {/* 1. CARTER HUILE */}
                  <g 
                    className="cursor-pointer group"
                    onMouseEnter={() => handleComponentHover("carter", activeEngin === "ST2D" ? "Carter d'huile Deutz de 15,5 litres. Vérifier la jauge tous les matins à froid." : "Carter d'huile de 11 litres. Vérifier la jauge tous les matins à froid. Bouchon de vidange magnétique.")}
                    onMouseLeave={clearHover}
                  >
                    <rect x="320" y="430" width="160" height="50" rx="8" fill="#1e293b" stroke={hoveredComponent === "carter" ? "#f59e0b" : "#e2e8f0"} strokeWidth="2" />
                    <text x="400" y="460" fill="white" textAnchor="middle">CARTER HUILE · {activeEngin === "ST2D" ? "15.5L" : "11L"}</text>
                  </g>

                  {/* 2. POMPE À HUILE */}
                  <g 
                    className="cursor-pointer"
                    onMouseEnter={() => handleComponentHover("pompe", activeEngin === "ST2D" ? "Pompe à huile entraînée par engrenage vilebrequin. Pression de service Deutz : 2,5 à 4,5 bar." : "Pompe à engrenages entraînée par le vilebrequin. Pression de service : 2.75 à 3.8 bar. Si témoin s'allume, couper directement le moteur.")}
                    onMouseLeave={clearHover}
                  >
                    <rect x="120" y="310" width="130" height="45" rx="8" fill="#1e293b" stroke={hoveredComponent === "pompe" ? "#f59e0b" : "#0ea5e9"} strokeWidth="2" />
                    <text x="185" y="337" fill="white" textAnchor="middle">POMPE À HUILE</text>
                  </g>

                  {/* 3. REFROIDISSEUR HUILE */}
                  <g 
                    className="cursor-pointer"
                    onMouseEnter={() => handleComponentHover("cooler", activeEngin === "ST2D" ? "Radiateur d'huile moteur refroidi directement par l'air de la turbine." : "Echangeur thermique liquide/huile intégré au bloc. Nettoyer les dépôts de calcaire lors des audits techniques majeurs.")}
                    onMouseLeave={clearHover}
                  >
                    <rect x="120" y="200" width="130" height="45" rx="8" fill="#1e293b" stroke={hoveredComponent === "cooler" ? "#f59e0b" : "#0ea5e9"} strokeWidth="2" />
                    <text x="185" y="227" fill="white" textAnchor="middle">REFROIDISSEUR HUILE</text>
                  </g>

                  {/* 4. FILTRE À HUILE */}
                  <g 
                    className="cursor-pointer"
                    onMouseEnter={() => handleComponentHover("filtre", activeEngin === "ST2D" ? "Filtre à huile Deutz de haute qualité. Remplacement obligatoire toutes les 250 heures en mine." : "Filtre à visser standard Cummins. Remplacer impérativement toutes les 250 heures. Remplir d'huile propre avant le montage.")}
                    onMouseLeave={clearHover}
                  >
                    <rect x="120" y="110" width="130" height="45" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x="185" y="137" fill="white" textAnchor="middle">FILTRE HUILE ({activeEngin === "ST2D" ? "Deutz" : "250h"})</text>
                  </g>

                  {/* 5. GALERIE PRINCIPALE */}
                  <g 
                    className="cursor-pointer"
                    onMouseEnter={() => handleComponentHover("galerie", "Canalisation centrale usinée dans le bloc moteur distribuant l'huile pressurisée aux points de friction.")}
                    onMouseLeave={clearHover}
                  >
                    <rect x="290" y="110" width="220" height="45" rx="8" fill="#2d3748" stroke={hoveredComponent === "galerie" ? "#f59e0b" : "#64748b"} strokeWidth="2" />
                    <text x="400" y="137" fill="white" textAnchor="middle">GALERIE PRINCIPALE</text>
                  </g>

                  {/* 6-10. MODULES DE LUBRIFICATION */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("paliers-v", "Paliers lisses en alliage du vilebrequin. Sensibles à la présence de particules d'usure ou d'eau.")} onMouseLeave={clearHover}>
                    <rect x="550" y="80" width="130" height="35" rx="4" fill="#0f172a" stroke="#64748b" />
                    <text x="615" y="101" fill="white" textAnchor="middle">PALIERS VILEBREQUIN</text>
                  </g>

                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("paliers-b", "Coussinets de têtes de bielles. Une défaillance de graissage conduit au coulage de bielle.")} onMouseLeave={clearHover}>
                    <rect x="550" y="130" width="130" height="35" rx="4" fill="#0f172a" stroke="#64748b" />
                    <text x="615" y="151" fill="white" textAnchor="middle">PALIERS BIELLE</text>
                  </g>

                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("arbre", "Arbre à cames et poussoirs. Inspection des cames requise à l'occasion du réglage des soupapes.")} onMouseLeave={clearHover}>
                    <rect x="550" y="180" width="130" height="35" rx="4" fill="#0f172a" stroke="#64748b" />
                    <text x="615" y="201" fill="white" textAnchor="middle">ARBRE À CAMES</text>
                  </g>

                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("gicleurs", "Buses projetant de l'huile directement sous les calottes de pistons pour refroidissement.")} onMouseLeave={clearHover}>
                    <rect x="550" y="230" width="130" height="35" rx="4" fill="#0f172a" stroke="#64748b" />
                    <text x="615" y="251" fill="white" textAnchor="middle">GICLEURS PISTONS</text>
                  </g>

                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("culasse", "Rampe de culbuteurs et guides de soupapes de la culasse. Graissage par raccord ascendant.")} onMouseLeave={clearHover}>
                    <rect x="550" y="290" width="130" height="35" rx="4" fill="#0f172a" stroke="#64748b" />
                    <text x="615" y="311" fill="white" textAnchor="middle">CULBUTEURS / CULASSE</text>
                  </g>

                  {/* 11. TURBOCOMPRESSEUR / POMPE D'INJECTION */}
                  <g 
                    className="cursor-pointer"
                    onMouseEnter={() => handleComponentHover(activeEngin === "ST2D" ? "pompe-inj" : "turbo", activeEngin === "ST2D" ? "Pompe d'injection Bosch mécanique en ligne. Lubrifiée par le circuit moteur. Calage précis requis toutes les 1000 heures." : "Refroidi et lubrifié par l'huile sous pression. Laisser tourner au ralenti 2 minutes avant de couper le contact pour éviter la cokéfaction de l'huile.")}
                    onMouseLeave={clearHover}
                  >
                    <rect x="300" y="280" width="130" height="45" rx="8" fill="#1e293b" stroke={hoveredComponent === (activeEngin === "ST2D" ? "pompe-inj" : "turbo") ? "#f59e0b" : "#8b5cf6"} strokeWidth="2" />
                    <text x="365" y="307" fill="white" textAnchor="middle">{activeEngin === "ST2D" ? "POMPE D'INJECTION" : "TURBOCOMPRESSEUR"}</text>
                  </g>

                  {/* 12. CAPTEUR PRESSION */}
                  <g 
                    className="cursor-pointer"
                    onMouseEnter={() => handleComponentHover("capteur", activeEngin === "ST2D" ? "Contacteur / manostat de pression d'huile. Alarme si pression d'huile inférieure à 0,8 bar." : "Sonde de pression d'huile reliée au calculateur (ECM). Pression minimale absolue admissible : 0.7 bar au ralenti.")}
                    onMouseLeave={clearHover}
                  >
                    <circle cx="420" cy="132" r="18" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                    <text x="420" y="136" fill="#78350f" textAnchor="middle" fontWeight="bold">P</text>
                  </g>

                </svg>
              </div>

              {/* Legend styling */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider justify-center">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-sky-500 rounded-sm inline-block" /> Ligne pleine bleue = Huile sous pression</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-400 rounded-sm inline-block" /> Ligne grise tirets = Circuit retour (drain)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 border border-amber-500 bg-transparent rounded-sm inline-block" /> Bordure amber = Composant critique maintenance</span>
              </div>
            </div>
          </section>

          {/* --- PARTIE 9 : SCHÉMA REPROIDISSEMENT --- */}
          <section id="circuit-refroidissement" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Wrench className="w-4 h-4" /></span>
              {activeEngin === "ST2D" ? "Système de ventilation & soufflante d'air — Deutz F6L912W" : "Circuit de refroidissement — Cummins QSB 4.5"}
            </h2>

            <div className="bg-white border border-slate-200 rounded-xl p-6 relative">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Passez votre souris sur un composant pour voir les prescriptions d'exploitation.
              </p>

              {hoveredTooltip && hoveredComponent?.startsWith("cool-") && (
                <div className="absolute top-4 right-4 max-w-xs bg-slate-900 text-white text-xs font-semibold p-3.5 rounded-lg shadow-xl border border-slate-800 z-30 animate-in fade-in zoom-in-95 duration-100 uppercase tracking-wider">
                  <span className="text-amber-500 font-black block text-[10px] tracking-widest mb-1 font-mono">Prescription Thermique</span>
                  {hoveredTooltip}
                </div>
              )}

              <div className="relative overflow-hidden w-full overflow-x-auto bg-black rounded-xl p-4 pl-8 border border-slate-800 shadow-2xl">
                {/* Left accent lines */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-950 border-r border-red-800/30" />
                <div className="absolute left-1.5 top-0 bottom-0 w-1 bg-sky-400" />
                <svg viewBox="0 0 800 480" className="w-full max-w-3xl mx-auto font-mono text-[10px] font-black select-none">
                  <defs>
                    <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                    </marker>
                    <marker id="arrow-blue-c" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0ea5e9" />
                    </marker>
                  </defs>

                  {/* Pipeline routings */}
                  <path d="M 430 220 L 570 220" fill="none" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
                  <path d="M 570 240 L 430 240" fill="none" stroke="#0ea5e9" strokeWidth="2.5" markerEnd="url(#arrow-blue-c)" />
                  <path d="M 165 220 L 290 220" fill="none" stroke="#0ea5e9" strokeWidth="2.5" markerEnd="url(#arrow-blue-c)" />
                  <path d="M 360 180 L 360 125" fill="none" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
                  <path d="M 420 65 L 420 20" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* VASE EXPANSION / COURROIE DE SOUFFLANTE */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("cool-vase", activeEngin === "ST2D" ? "Courroie trapézoïdale de soufflante. À inspecter tous les jours (tension correcte, pas de craquelure)." : "Vase d'expansion. Ne jamais ouvrir le bouchon sous pression ou moteur chaud. Risque sévère de projection de liquide bouillant.")} onMouseLeave={clearHover}>
                    <rect x="350" y="20" width="140" height="45" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                    <text x="420" y="47" fill="white" textAnchor="middle">{activeEngin === "ST2D" ? "COURROIE DE TURBINE" : "VASE D'EXPANSION"}</text>
                  </g>

                  {/* POMPE A EAU / TURBINE DE VENTILATION */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("cool-pompe", activeEngin === "ST2D" ? "Turbine d'air axiale de refroidissement entraînée directement par courroie. Souffle un débit d'air constant." : "Pompe à eau centrifuge entraînée par courroie. Remplacer la courroie si fissure ou jeu excessif.")} onMouseLeave={clearHover}>
                    <rect x="100" y="220" width="130" height="45" rx="8" fill="#1e293b" stroke="#0ea5e9" strokeWidth="2" />
                    <text x="165" y="247" fill="white" textAnchor="middle">{activeEngin === "ST2D" ? "SOUFFLANTE D'AIR" : "POMPE EAU (COURROIE)"}</text>
                  </g>

                  {/* BLOC CYLINDRES / AILETTES DE REFROIDISSEMENT */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("cool-bloc", activeEngin === "ST2D" ? "Cylindres et culasses dotés de fines ailettes pour optimiser l'échange thermique avec l'air pulsé. Nettoyage régulier impératif." : "Chemises d'eau entourant les pistons et culasses. Détartrer avec des agents approuvés Cummins lors des reconditionnements.")} onMouseLeave={clearHover}>
                    <rect x="290" y="180" width="160" height="80" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    <text x="370" y="225" fill="white" textAnchor="middle">{activeEngin === "ST2D" ? "AILETTES CYLINDRES" : "BLOC CYLINDRES + CULASSE"}</text>
                  </g>

                  {/* THERMOSTAT / SONDE THERMOCOUPLE */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("cool-thermo", activeEngin === "ST2D" ? "Sonde thermocouple de culasse. Déclenche une alarme thermique à 150°C pour éviter la fusion." : "Thermostat d'eau. Température d'ouverture : 82°C. Pleine ouverture : 95°C. Si défaillant ou coincé fermé, surchauffe immédiate.")} onMouseLeave={clearHover}>
                    <rect x="290" y="80" width="140" height="45" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x="360" y="107" fill="white" textAnchor="middle">{activeEngin === "ST2D" ? "SONDE THERMIQUE" : "THERMOSTAT · 82°C"}</text>
                  </g>

                  {/* ECHANGEUR EXTERNE / RADIATEUR D'HUILE DEUTZ */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("cool-rad", activeEngin === "ST2D" ? "Radiateur d'huile moteur refroidi directement par l'air de la turbine. Garder propre de graisse." : "Echangeur thermique principal. Évacue la chaleur par l'eau recyclée de la mine. Maintenir les ailettes propres d'obstructions de boue.")} onMouseLeave={clearHover}>
                    <rect x="570" y="180" width="150" height="80" rx="8" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                    <text x="645" y="225" fill="white" textAnchor="middle">{activeEngin === "ST2D" ? "RADIATEUR HUILE" : "ÉCHANGEUR (EAU MINE)"}</text>
                  </g>

                </svg>
              </div>

              {/* Safety banner below SVG */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-red-800 text-xs uppercase tracking-wider">
                    {activeEngin === "ST2D" ? "RÈGLE DE SÉCURITÉ ABSOLUE — REFROIDISSEMENT PAR AIR" : "RÈGLE SÉCURITÉ ABSOLUE — BRÛLURES GRAVES"}
                  </p>
                  <p className="text-[11px] text-red-700 mt-1 font-semibold leading-relaxed">
                    {activeEngin === "ST2D" ? (
                      "Sur un moteur Deutz F6L912W, les ailettes des cylindres et culasses doivent être exemptes de poussière de mine, de charbon et d'huile. Toute accumulation crée une barrière isolante conduisant à la surchauffe et au serrage du moteur. Souffler et laver à haute pression les ailettes toutes les 250 heures (ou plus souvent en atmosphère poussiéreuse)."
                    ) : (
                      "Ne jamais ouvrir le bouchon du circuit de refroidissement sur un moteur chaud ou tiède. La pression de vapeur peut projeter du liquide bouillant. Attendre au minimum 30 minutes après l'arrêt. Vérifier que le circuit est froid au toucher avant toute intervention sur les durites ou les bouchons."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* --- PARTIE 10 : SYSTEME HYDRAULIQUE --- */}
          <section id="hydraulique" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Wrench className="w-4 h-4" /></span>
              Système hydraulique {activeEngin === "ST2D" ? "ST2D" : "ST2G"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Spécifications techniques</h3>
                {[
                  { label: "Réservoir hydraulique", val: activeEngin === "ST2D" ? "95 litres" : "144 litres" },
                  { label: "Pression circuit de travail", val: activeEngin === "ST2D" ? "120 bar" : "124 bar (12,4 MPa)" },
                  { label: "Pression circuit direction", val: activeEngin === "ST2D" ? "170 bar" : "180 bar (18 MPa)" },
                  { label: "Type huile hydraulique", val: "ISO VG 46 (Epiroc approuvé)" },
                  { label: "Filtre retour hydraulique", val: "Changer à 500h ou sur indicateur" },
                  { label: "Vidange huile hydraulique", val: "2 000h" },
                  { label: "Pompe principale", val: activeEngin === "ST2D" ? "Pompe à engrenages haute performance" : "Pistons axiaux, débit variable" },
                  { label: "Vérins levage", val: activeEngin === "ST2D" ? "2 × Ø 140 mm" : "2 × Ø 180 mm" },
                  { label: "Vérin basculement", val: activeEngin === "ST2D" ? "1 × Ø 140 mm" : "1 × Ø 180 mm" },
                  { label: "Vérin direction", val: activeEngin === "ST2D" ? "1 × Ø 100 mm" : "1 × Ø 125 mm" }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Plan de maintenance préventive</h3>
                {[
                  { label: "Contrôle niveau huile hydraulique", val: "Quotidien · Conducteur" },
                  { label: "Inspection fuites flexibles / raccords", val: "Quotidien · Conducteur" },
                  { label: "Remplacement filtre retour hydraulique", val: "500h · Mécanicien" },
                  { label: "Remplacement filtre haute pression", val: "1 000h · Mécanicien" },
                  { label: "Contrôle pression circuit de travail", val: "500h · Mécanicien" },
                  { label: "Vérification pression azote accumulateur", val: activeEngin === "ST2D" ? "1 000h · Mécanicien (50–60 bar)" : "1 000h · Mécanicien (55–65 bar)" },
                  { label: "Nettoyage crépine aspiration réservoir", val: "1 000h · Mécanicien" },
                  { label: "Vidange et remplacement huile hydraulique", val: "2 000h · Mécanicien" },
                  { label: "Vérification état flexibles (fissures)", val: "500h · Mécanicien" }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Hydraulic Diagram */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 relative">
              <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-4">Schéma interactif du circuit hydraulique</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Passez votre curseur sur un composant pour voir les points de contrôle.
              </p>

              {hoveredTooltip && hoveredComponent?.startsWith("hyd-") && (
                <div className="absolute top-4 right-4 max-w-xs bg-slate-900 text-white text-xs font-semibold p-3.5 rounded-lg shadow-xl border border-slate-800 z-30 animate-in fade-in zoom-in-95 duration-100 uppercase tracking-wider">
                  <span className="text-amber-500 font-black block text-[10px] tracking-widest mb-1 font-mono">Prescription Hydraulique</span>
                  {hoveredTooltip}
                </div>
              )}

              <div className="relative overflow-hidden w-full overflow-x-auto bg-black rounded-xl p-4 pl-8 border border-slate-800 shadow-2xl">
                {/* Left accent lines */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-950 border-r border-red-800/30" />
                <div className="absolute left-1.5 top-0 bottom-0 w-1 bg-sky-400" />
                <svg viewBox="0 0 860 560" className="w-full max-w-3xl mx-auto font-mono text-[10px] font-black select-none">
                  {/* Connective lines */}
                  <path d="M 120 380 L 120 350" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
                  <path d="M 120 300 L 120 270" fill="none" stroke="#0ea5e9" strokeWidth="2" />
                  <path d="M 200 240 L 270 240" fill="none" stroke="#ef4444" strokeWidth="3" />
                  <path d="M 450 180 L 560 130" fill="none" stroke="#ef4444" strokeWidth="3" />
                  <path d="M 450 200 L 560 220" fill="none" stroke="#ef4444" strokeWidth="3" />
                  <path d="M 450 220 L 560 310" fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
                  <path d="M 410 350 L 410 425 L 335 425" fill="none" stroke="#0ea5e9" strokeWidth="2" />
                  <path d="M 270 425 L 165 425 L 165 480" fill="none" stroke="#0ea5e9" strokeWidth="2" />

                  {/* RESERVOIR */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("hyd-tank", activeEngin === "ST2D" ? "Réservoir hydraulique de 95 litres. Utiliser de l'huile ISO VG 46 approuvée." : "Réservoir hydraulique de 144 litres. Utiliser l'huile ISO VG 46 approuvée par Epiroc. Ne jamais introduire d'huile non filtrée.")} onMouseLeave={clearHover}>
                    <rect x="40" y="380" width="160" height="80" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                    <text x="120" y="425" fill="white" textAnchor="middle">RÉSERVOIR HYDRAULIQUE</text>
                  </g>

                  {/* CREPINE */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("hyd-strainer", "Crépine d'aspiration magnétique en fond de réservoir. À nettoyer impérativement toutes les 1 000 heures.")} onMouseLeave={clearHover}>
                    <rect x="40" y="300" width="160" height="50" rx="4" fill="#0f172a" stroke="#64748b" />
                    <text x="120" y="330" fill="white" textAnchor="middle">CRÉPINE ASPIRATION</text>
                  </g>

                  {/* POMPE */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("hyd-pump", activeEngin === "ST2D" ? "Pompe hydraulique principale à engrenages haut rendement." : "Pompe hydraulique principale à pistons axiaux et cylindrée variable. Surveiller tout bruit mécanique anormal.")} onMouseLeave={clearHover}>
                    <rect x="40" y="210" width="160" height="60" rx="8" fill="#1e293b" stroke="#0ea5e9" strokeWidth="2" />
                    <text x="120" y="245" fill="white" textAnchor="middle">{activeEngin === "ST2D" ? "POMPE À ENGRENAGES" : "POMPE PISTONS AXIAUX"}</text>
                  </g>

                  {/* DISTRIBUTEUR */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("hyd-valve", "Distributeur principal composé de tiroirs de commande pour le levage, le basculement et la direction de l'engin.")} onMouseLeave={clearHover}>
                    <rect x="270" y="150" width="180" height="200" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                    <text x="360" y="175" fill="white" textAnchor="middle">DISTRIBUTEUR PRINCIPAL</text>
                    <rect x="285" y="195" width="150" height="25" rx="4" fill="#0f172a" stroke="#64748b" />
                    <text x="360" y="212" fill="white" textAnchor="middle" fontSize="9px">LEVAGE / BASCULEMENT</text>
                    <rect x="285" y="235" width="150" height="25" rx="4" fill="#0f172a" stroke="#64748b" />
                    <text x="360" y="252" fill="white" textAnchor="middle" fontSize="9px">DIRECTION SAHR</text>
                  </g>

                  {/* VERINS LEVAGE */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("hyd-cyl-lift", activeEngin === "ST2D" ? "Double vérins de levage (diamètre 140 mm). Inspecter l'état des joints racleurs." : "Double vérins de levage (diamètre 180 mm). Inspecter l'état des joints racleurs et l'absence de rayure sur les tiges.")} onMouseLeave={clearHover}>
                    <rect x="560" y="100" width="120" height="60" rx="4" fill="#1e293b" stroke="#64748b" />
                    <text x="620" y="135" fill="white" textAnchor="middle">{activeEngin === "ST2D" ? "VÉRINS LEVAGE (140)" : "VÉRINS LEVAGE × 2"}</text>
                  </g>

                  {/* VERIN BASCULEMENT */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("hyd-cyl-tilt", activeEngin === "ST2D" ? "Vérin de basculement du godet (diamètre 140 mm). Soumis à de fortes contraintes." : "Vérin de basculement du godet (diamètre 180 mm). Soumis à de fortes contraintes de cavage.")} onMouseLeave={clearHover}>
                    <rect x="560" y="200" width="120" height="50" rx="4" fill="#1e293b" stroke="#64748b" />
                    <text x="620" y="230" fill="white" textAnchor="middle">{activeEngin === "ST2D" ? "BASCULEMENT (140)" : "VÉRIN BASCULEMENT"}</text>
                  </g>

                  {/* VERIN DIRECTION */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("hyd-cyl-steer", activeEngin === "ST2D" ? "Vérin de direction d'articulation centrale (diamètre 100 mm)." : "Vérin de direction d'articulation centrale (diamètre 125 mm).")} onMouseLeave={clearHover}>
                    <rect x="560" y="290" width="120" height="50" rx="4" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
                    <text x="620" y="320" fill="white" textAnchor="middle">{activeEngin === "ST2D" ? "DIRECTION (100)" : "VÉRIN DIRECTION"}</text>
                  </g>

                  {/* ACCUMULATEUR */}
                  <g className="cursor-pointer" onMouseEnter={() => handleComponentHover("hyd-accum", activeEngin === "ST2D" ? "Accumulateur à membrane pour circuit de secours de direction. Pression de gonflage azote : 50 à 60 bar." : "Accumulateur à membrane pour circuit de secours de direction. Pression de gonflage azote standard : 55 à 65 bar.")} onMouseLeave={clearHover}>
                    <circle cx="700" cy="400" r="35" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
                    <text x="700" y="403" fill="white" textAnchor="middle" fontSize="8px">ACCUM. SAHR</text>
                  </g>

                </svg>
              </div>
            </div>
          </section>

          {/* --- PARTIE 11 : TRANSMISSION DANA / CLARK --- */}
          <section id="transmission" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Settings className="w-4 h-4" /></span>
              Transmission & Essieux {activeEngin === "ST2D" ? "Clark-Dana" : "Dana"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">
                  {activeEngin === "ST2D" ? "Transmission Clark-Dana 18000" : "Transmission Dana R20000"}
                </h3>
                {[
                  { label: "Type", val: activeEngin === "ST2D" ? "Convertisseur de couple + Boîte Powershift" : "Hydrostatique — convertisseur + 4 vitesses auto" },
                  { label: "Commande", val: activeEngin === "ST2D" ? "Manuelle servo-commandée" : "Électrohydraulique" },
                  { label: "Huile boîte", val: "Dexron III ATF (ou Dana approuvé)" },
                  { label: "Capacité", val: activeEngin === "ST2D" ? "12 litres" : "14 litres" },
                  { label: "Vidange", val: "1 000h" },
                  { label: "Filtre boîte", val: "500h" }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right max-w-xs">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">
                  {activeEngin === "ST2D" ? "Essieux Dana 12D" : "Essieux Dana 14D"}
                </h3>
                {[
                  { label: "Différentiel AV", val: activeEngin === "ST2D" ? "No-Spin (bloquant mécanique de mine)" : "No-Spin Torsen (ne jamais démonter sans outil spécifique)" },
                  { label: "Différentiel AR", val: "Standard" },
                  { label: "Huile essieux", val: "SAE 80W-90 GL-5" },
                  { label: "Capacité essieu", val: activeEngin === "ST2D" ? "~6 litres chaque" : "~8 litres chaque" },
                  { label: "Vidange", val: "1 000h" },
                  { label: "Frein service", val: "Disques humides à commande hydraulique" }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right max-w-xs">{item.val}</span>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* --- PARTIE 12 : FREINAGE SAHR --- */}
          <section id="freinage" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><ShieldAlert className="w-4 h-4" /></span>
              Système de freinage SAHR (Spring Applied Hydraulic Released)
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
              <h3 className="text-xs font-black uppercase text-amber-800">Comprendre le fonctionnement du frein SAHR</h3>
              <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                Le SAHR est un frein à ressort à sécurité positive (fail-safe). Les ressorts internes APPLIQUENT mécaniquement le frein sur les disques. La pression hydraulique du circuit DESSERRE les freins. En cas de perte de pression totale, de rupture de flexible ou d'arrêt du moteur, le frein de parking s'applique automatiquement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider mb-3">Matrice logique opérationnelle</h3>
                {[
                  { cond: "Moteur en marche / pression normale", state: "🟢 Frein DESSERRÉ — engin mobile" },
                  { cond: "Moteur coupé / pression nulle", state: "🔴 Frein APPLIQUÉ automatiquement" },
                  { cond: "Levier parking activé au tableau", state: "🔴 Pression coupée → Frein APPLIQUÉ" },
                  { cond: "Perte hydraulique totale (urgence)", state: "🔴 Frein APPLIQUÉ → arrêt immédiat" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.cond}</span>
                    <span className="font-black text-slate-800 text-right">{item.state}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-[11px] text-red-700 leading-relaxed font-bold">
                  ⚠️ Ne jamais démonter le récepteur ou la cartouche de frein SAHR sans avoir comprimé mécaniquement les ressorts de rappel avec l'outil de sécurité spécifique Epiroc. Énergie de rappel élevée pouvant provoquer de graves blessures.
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[11px] text-amber-800 leading-relaxed font-bold">
                  ⚠️ Si l'engin glisse ou dérive à l'arrêt malgré le parking appliqué : vérifier en PREMIER la pression hydraulique résiduelle du circuit. Pression requise de décharge de parking : 90 à 110 bar.
                </div>
              </div>
            </div>
          </section>

          {/* --- PARTIE 13 : PLAN DE GRAISSAGE --- */}
          <section id="graissage" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Wrench className="w-4 h-4" /></span>
                Plan de graissage périodique {activeEngin === "ST2D" ? "ST2D (18 Points)" : "ST2G (22 Points)"}
              </h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200/50">
                Type de graisse: EP2 / Lithium Multi-usages
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Interactive Plan map */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 relative flex flex-col justify-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Cliquez sur un point rouge ou orange pour afficher la fiche de graissage et la localisation.
                </p>

                <div className="relative overflow-hidden w-full overflow-x-auto bg-black rounded-xl p-2 pl-6 border border-slate-800 shadow-2xl">
                  {/* Left accent lines */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-950 border-r border-red-800/30" />
                  <div className="absolute left-1.5 top-0 bottom-0 w-1 bg-sky-400" />
                  <svg viewBox="0 0 700 430" className="w-full max-w-2xl mx-auto select-none font-mono">
                    {/* Back chassis representation */}
                    <rect x="80" y="150" width="200" height="130" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    <text x="180" y="215" fill="#cbd5e1" textAnchor="middle" fontSize="10px">CHÂSSIS AR (MOTEUR)</text>

                    {/* Front chassis */}
                    <rect x="420" y="150" width="200" height="130" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    <text x="520" y="215" fill="#cbd5e1" textAnchor="middle" fontSize="10px">CHÂSSIS AV (GODET)</text>

                    {/* Articulation center bar */}
                    <line x1="330" y1="215" x2="420" y2="215" stroke="#f59e0b" strokeWidth="4" />

                    {/* Wheel assemblies */}
                    <circle cx="100" cy="115" r="22" fill="#0f172a" stroke="#64748b" />
                    <circle cx="100" cy="315" r="22" fill="#0f172a" stroke="#64748b" />
                    <circle cx="600" cy="115" r="22" fill="#0f172a" stroke="#64748b" />
                    <circle cx="600" cy="315" r="22" fill="#0f172a" stroke="#64748b" />

                    {/* Draw points as circles with click trigger */}
                    {graissagePoints.map((p) => (
                      <g 
                        key={p.id} 
                        className="cursor-pointer group"
                        onClick={() => setSelectedPoint(p)}
                      >
                        <circle cx={p.x} cy={p.y} r="9" fill={p.color} stroke="white" strokeWidth="2" className="transition-transform group-hover:scale-125" />
                        <text x={p.x} y={p.y + 3} fill="white" textAnchor="middle" fontSize="8px" fontWeight="black">{p.id}</text>
                      </g>
                    ))}

                  </svg>
                </div>

                <div className="mt-4 flex gap-4 text-[9px] font-bold uppercase tracking-widest justify-center">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#ef4444] rounded-full inline-block" /> 50h (Critique)</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#f97316] rounded-full inline-block" /> 100h</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#eab308] rounded-full inline-block" /> 250h</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full inline-block" /> 500h</span>
                </div>
              </div>

              {/* Right Column: Information card display */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-amber-700 tracking-wider mb-4 border-b pb-2">Fiche Point Graissage</h3>
                  {selectedPoint ? (
                    <div className="space-y-4 animate-in fade-in duration-100">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center font-mono">{selectedPoint.id}</span>
                        <h4 className="text-xs font-black text-slate-900 uppercase">{selectedPoint.name}</h4>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Périodicité</span>
                          <span className="font-extrabold text-amber-700 uppercase">{selectedPoint.freq}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Nombre de coups</span>
                          <span className="font-extrabold text-slate-800">{selectedPoint.coups} coups</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Graisse spécifiée</span>
                          <span className="font-black text-slate-800 uppercase">{selectedPoint.graisse}</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-slate-400 font-bold uppercase text-[9px]">Accès physique</span>
                          <span className="font-bold text-slate-700 text-right">{selectedPoint.acces}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 font-semibold italic text-xs">
                      Aucun point sélectionné. Cliquez sur l'un des cercles numérotés sur le plan pour voir les instructions.
                    </div>
                  )}
                </div>

                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/30 text-[10px] text-amber-800 leading-relaxed font-bold mt-4">
                  💡 Note générale : Un excès de graisse détruit les joints à lèvres. Respecter rigoureusement le nombre de coups prescrit. Nettoyer les graisseurs avant d'appliquer l'embout de la pompe.
                </div>
              </div>

            </div>
          </section>

          {/* --- PARTIE 14 : PNEUMATIQUES --- */}
          <section id="pneus" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Wrench className="w-4 h-4" /></span>
              Pneumatiques de roulage
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Spécifications dimensionnelles et pressions</h3>
                {[
                  { label: "Dimension standard", val: "12.00 R24" },
                  { label: "Types de profil", val: "Slick (sec) / Crantés (humide / boueux)" },
                  { label: "Pression de gonflage avant", val: "6,5 bar" },
                  { label: "Pression de gonflage arrière", val: "7,0 bar" },
                  { label: "Durée de vie estimée (mines)", val: "1 500h à 2 000h (selon état de la piste)" },
                  { label: "Couple de serrage goujons roue", val: "550 Nm (à contrôler à la clé de choc calibrée)" }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Plan de contrôle périodique</h3>
                {[
                  { label: "Contrôle visuel quotidien pression", val: "Quotidien · Conducteur" },
                  { label: "Mesure de la pression au manomètre", val: "250h · Mécanicien" },
                  { label: "Inspection approfondie usure + coupures", val: "250h · Mécanicien" },
                  { label: "Contrôle serrage boulons roue", val: "50h puis 500h · Mécanicien" },
                  { label: "Rotation pneus si usure asymétrique", val: "500h · Mécanicien" }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200/30 rounded-xl text-xs text-amber-900 font-bold leading-relaxed max-w-3xl">
              📢 <strong>Note de terrain mines :</strong> En mine souterraine, l'inspection visuelle des pneumatiques à chaque début de poste est obligatoire. Toute coupure profonde atteignant les plis ou la carcasse impose un remplacement de roue immédiat. Une explosion de pneumatique sous pression en galerie étroite est un incident de sécurité majeur à proscrire.
            </div>
          </section>

          {/* --- PARTIE 15 : TABLEAU RECAPITULATIF FLUIDES --- */}
          <section id="fluides-recap" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Droplets className="w-4 h-4" /></span>
              Tableau récapitulatif des fluides {activeEngin === "ST2D" ? "ST2D" : "ST2G"}
            </h2>

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden max-w-3xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-600">
                    <th className="p-3.5">Organe de Travail</th>
                    <th className="p-3.5">Capacité brute</th>
                    <th className="p-3.5">Qualité de fluide spécifiée</th>
                    <th className="p-3.5">Période de remplacement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {[
                    { org: "Huile moteur (avec filtre)", cap: activeEngin === "ST2D" ? "15.5 L" : "11 L", fl: activeEngin === "ST2D" ? "SAE 15W-40 Deutz / API CG-4" : "SAE 15W-40 API CJ-4", fr: "250h (Conditions minières)" },
                    ...(activeEngin === "ST2D" ? [] : [{ org: "Refroidissement total", cap: "~12 L", fl: "OAT anti-gel 50/50", fr: "1 000h" }]),
                    { org: "Carburant gasoil", cap: activeEngin === "ST2D" ? "120 L" : "132 L", fl: "Diesel EN 590 (<500ppm Soufre)", fr: "—" },
                    { org: "Huile hydraulique", cap: activeEngin === "ST2D" ? "95 L" : "144 L", fl: "ISO VG 46 Epiroc approuvé", fr: "2 000h" },
                    { org: "Huile boîte de vitesses", cap: activeEngin === "ST2D" ? "12 L" : "14 L", fl: "Dexron III ATF", fr: "1 000h" },
                    { org: "Huile essieu avant", cap: activeEngin === "ST2D" ? "~6 L" : "~8 L", fl: "SAE 80W-90 GL-5", fr: "1 000h" },
                    { org: "Huile essieu arrière", cap: activeEngin === "ST2D" ? "~6 L" : "~8 L", fl: "SAE 80W-90 GL-5", fr: "1 000h" },
                    { org: "Graisse points mobiles", cap: "Selon graisseur", fl: "EP2 Lithium Haute Température", fr: "50h / 100h / 250h / 500h" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/20">
                      <td className="p-3.5 text-slate-900 font-bold">{row.org}</td>
                      <td className="p-3.5 font-mono">{row.cap}</td>
                      <td className="p-3.5">{row.fl}</td>
                      <td className="p-3.5 font-bold text-amber-700">{row.fr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* --- PARTIE 16 : DIAGNOSTIC MOTEUR --- */}
          <section id="diag-moteur" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="w-4 h-4" /></span>
              Diagnostic pannes moteur ({activeEngin === "ST2D" ? "Deutz F6L912W" : "Cummins QSB 4.5"})
            </h2>

            <div className="space-y-3">
              {[
                {
                  id: "dm-1",
                  title: "Témoin de pression d'huile allumé en marche",
                  sev: "CRITIQUE",
                  causes: activeEngin === "ST2D" ? [
                    "Niveau d'huile insuffisant dans le carter → ARRÊT IMMÉDIAT. Vérifier le niveau à la jauge (Deutz requiert 15.5L).",
                    "Filtre à huile Deutz colmaté → Remplacer la cartouche filtrante d'huile.",
                    "Pompe à huile d'engrenage défectueuse → Vérifier la pression de service. Si pression < 0.8 bar, immobiliser.",
                    "Manostat de pression HS ou câble de masse coupé."
                  ] : [
                    "Niveau d'huile insuffisant dans le carter → ARRÊT IMMÉDIAT. Vérifier le niveau à la jauge, faire l'appoint.",
                    "Filtre à huile colmaté → Remplacer le filtre à huile (intervalle 250h dépassé).",
                    "Pompe à huile défectueuse → Installer un manomètre sur le point de test. Si pression < 0.7 bar, immobiliser.",
                    "Sonde de pression d'huile HS → Mesurer la résistance de la sonde au multimètre."
                  ]
                },
                {
                  id: "dm-2",
                  title: "Surchauffe moteur — Alarme thermique active",
                  sev: "CRITIQUE",
                  causes: activeEngin === "ST2D" ? [
                    "Courroie de soufflante d'air cassée ou détendue → Arrêt immédiat requis pour éviter le serrage thermique.",
                    "Ailettes de refroidissement cylindres/culasses obstruées par la poussière ou de la graisse de mine → Nettoyer à haute pression.",
                    "Sonde thermocouple de culasse HS ou mal calibrée.",
                    "Radiateur d'huile moteur colmaté extérieurement par des poussières."
                  ] : [
                    "Manque de liquide de refroidissement → Couper le moteur. Attendre 30 min. Compléter le niveau, chercher des fuites.",
                    "Courroie de pompe à eau détendue ou cassée → Remplacer la courroie.",
                    "Thermostat défaillant bloqué fermé → Déposer le thermostat et le tester dans l'eau chaude. Remplacer.",
                    "Ailettes d'échangeur thermique colmatées par la poussière ou boue → Nettoyage externe haute pression."
                  ]
                },
                {
                  id: "dm-3",
                  title: "Fumée noire excessive à l'échappement",
                  sev: "MAJEUR",
                  causes: activeEngin === "ST2D" ? [
                    "Filtre à air à bain d'huile ou cartouche sèche encrassée → Nettoyer ou remplacer.",
                    "Décalage ou usure de la pompe d'injection Bosch mécanique en ligne → Faire régler par un diéséliste.",
                    "Excès de charge mécanique constante de l'engin.",
                    "Injecteurs Deutz défaillants (mauvaise pulvérisation) → Déposer et tarer les injecteurs."
                  ] : [
                    "Filtre à air encrassé → Vérifier l'indicateur de restriction d'air, remplacer la cartouche principale.",
                    "Dysfonctionnement du turbocompresseur → Inspecter le jeu radial et axial du rotor du turbo.",
                    "Excès de charge mécanique → Surcharge au niveau du godet en rampe ascendante.",
                    "Injecteurs usés ou déréglés → Déposer pour contrôle sur banc de test atelier agréé."
                  ]
                },
                {
                  id: "dm-4",
                  title: "Fumée bleue ou consommation excessive d'huile",
                  sev: "MAJEUR",
                  causes: activeEngin === "ST2D" ? [
                    "Usure excessive des segments de pistons de cylindres individuels (blow-by élevé) → Révision haut moteur.",
                    "Niveau d'huile trop élevé dans le carter Deutz (supérieur au repère MAX).",
                    "Usure des guides de soupapes de culasses."
                  ] : [
                    "Passage d'huile par les paliers de turbocompresseur → Remplacer les paliers ou l'ensemble turbo.",
                    "Niveau d'huile trop élevé dans le carter → Vidanger l'excédent pour revenir sous le niveau max.",
                    "Usure excessive des segments de pistons → Soufflerie importante au reniflard. Révision moteur requise."
                  ]
                },
                {
                  id: "dm-5",
                  title: "Démarrage difficile ou impossible",
                  sev: "MINEUR",
                  causes: [
                    "Batteries déchargées ou cosses oxydées → Nettoyer les cosses et recharger les batteries.",
                    "Air dans le circuit de carburant à basse pression → Effectuer la purge manuelle ou électrique.",
                    "Filtre à carburant obstrué → Remplacer les préfiltre et filtre principal."
                  ]
                }
              ].map((diag) => (
                <div key={diag.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div 
                    onClick={() => toggleAccordion(diag.id)}
                    className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer select-none transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {openAccordions[diag.id] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                      <span className="text-xs font-black text-slate-800 uppercase">{diag.title}</span>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                      diag.sev === "CRITIQUE" ? "bg-red-100 text-red-700" : diag.sev === "MAJEUR" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {diag.sev}
                    </span>
                  </div>
                  {openAccordions[diag.id] && (
                    <div className="bg-slate-50/40 p-5 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-700">
                      {diag.causes.map((cause, cidx) => (
                        <p key={cidx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{cause}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* --- PARTIE 17 : DIAGNOSTIC HYDRAULIQUE --- */}
          <section id="diag-hydraulique" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="w-4 h-4" /></span>
              Diagnostic pannes hydrauliques {activeEngin === "ST2D" ? "ST2D" : "ST2G"}
            </h2>

            <div className="space-y-3">
              {[
                {
                  id: "dh-1",
                  title: "Perte de force totale du godet et de la direction",
                  sev: "CRITIQUE",
                  causes: [
                    "Manque critique d'huile hydraulique → Inspecter le réservoir (" + (activeEngin === "ST2D" ? "95 L" : "144 L") + ") et rechercher des fuites massives de flexibles.",
                    "Défaillance interne de la pompe principale → Point de test de pression bloqué sous 50 bar. Remplacement pompe.",
                    "Rupture d'une liaison flexible haute pression → Couper directement le moteur. Changer le flexible."
                  ]
                },
                {
                  id: "dh-2",
                  title: "Direction très dure ou bloquée",
                  sev: "CRITIQUE",
                  causes: [
                    "Pression d'azote de l'accumulateur de secours trop faible → Remplacer l'accumulateur ou regonfler à l'azote.",
                    "Panne de la pompe de direction dédiée → Mesurer la pression de sortie sur le bloc de direction."
                  ]
                },
                {
                  id: "dh-3",
                  title: "Dérive descendante du bras (drift) au repos",
                  sev: "MAJEUR",
                  causes: [
                    "Fuite interne au niveau des pistons des vérins de levage → Remplacer les kits de joints de vérins.",
                    "Tiroir du distributeur de levage usé ou endommagé → Contrôler l'étanchéité du bloc de tiroirs."
                  ]
                },
                {
                  id: "dh-4",
                  title: "Huile hydraulique anormalement chaude (> 80°C)",
                  sev: "MAJEUR",
                  causes: [
                    "Ailettes de refroidissement colmatées par des boues épaisses → Lavage rigoureux de l'échangeur de chaleur.",
                    "Clapet de décharge bloqué ouvert → Déposer le clapet de sécurité principal, nettoyer et calibrer à 124 bar."
                  ]
                }
              ].map((diag) => (
                <div key={diag.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div 
                    onClick={() => toggleAccordion(diag.id)}
                    className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer select-none transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {openAccordions[diag.id] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                      <span className="text-xs font-black text-slate-800 uppercase">{diag.title}</span>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                      diag.sev === "CRITIQUE" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {diag.sev}
                    </span>
                  </div>
                  {openAccordions[diag.id] && (
                    <div className="bg-slate-50/40 p-5 border-t border-slate-100 space-y-2 text-xs font-semibold text-slate-700">
                      {diag.causes.map((cause, cidx) => (
                        <p key={cidx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{cause}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* --- PARTIE 18 : PROCEDURES PAS-A-PAS --- */}
          <section id="proc-vidange" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Wrench className="w-4 h-4" /></span>
              Procédures d'Atelier & de Terrain
            </h2>

            <div className="space-y-4">
              
              {/* PROCEDURE 1 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div onClick={() => toggleAccordion("p1")} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {openAccordions["p1"] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs font-black text-slate-800 uppercase">[PROCÉDURE 1] Vidange huile moteur</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-2 py-0.5">~45 MIN</span>
                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">MÉCANICIEN</span>
                  </div>
                </div>
                {openAccordions["p1"] && (
                  <div className="bg-slate-50/20 p-6 border-t border-slate-100 space-y-4 text-xs font-bold text-slate-700">
                    {[
                      "Positionner l'engin sur un terrain parfaitement plat et horizontal. Serrer le frein de parking et couper le moteur.",
                      "Faire tourner le moteur au ralenti pendant 3 minutes pour réchauffer légèrement l'huile, puis couper le contact.",
                      "Attendre 10 minutes pour permettre à l'huile de redescendre complètement dans le carter d'huile.",
                      "⚠️ Placer un bac de récupération d'au moins " + (activeEngin === "ST2D" ? "20" : "15") + " litres sous le bouchon de vidange du carter d'huile.",
                      "Dévisser le bouchon de vidange et laisser s'écouler complètement l'huile usagée.",
                      "Nettoyer le bouchon magnétique de vidange (rechercher des limailles d'usure) et remplacer le joint torique.",
                      "Revisser le bouchon de vidange. Serrer au couple de 45–50 Nm.",
                      "À l'aide d'une clé à sangle, dévisser le filtre à huile moteur usagé. Récupérer l'huile résiduelle.",
                      "Enduire le joint d'étanchéité en caoutchouc du nouveau filtre avec un film d'huile propre.",
                      "Visser le nouveau filtre à la main jusqu'au contact du joint, puis serrer fermement de 3/4 de tour. NE JAMAIS utiliser de clé pour le serrage.",
                      "Remplir le moteur par l'orifice supérieur de remplissage avec " + (activeEngin === "ST2D" ? "15,5 litres d'huile neuve SAE 15W-40 Deutz / API CG-4" : "11 litres d'huile neuve SAE 15W-40 API CJ-4") + ".",
                      "Démarrer le moteur et le laisser tourner 2 minutes au ralenti pour pressuriser le circuit. Inspecter les fuites.",
                      "Couper le moteur, attendre 5 minutes, puis contrôler le niveau de l'huile à l'aide de la jauge. Compléter au besoin."
                    ].map((step, sidx) => (
                      <div key={sidx} className="flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-amber-500 text-white font-black text-[11px] flex items-center justify-center shrink-0">{sidx + 1}</span>
                        <p className="leading-relaxed mt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PROCEDURE 2 */}
              <div id="proc-purge" className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs scroll-mt-20">
                <div onClick={() => toggleAccordion("p2")} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {openAccordions["p2"] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs font-black text-slate-800 uppercase">[PROCÉDURE 2] Purge circuit carburant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-2 py-0.5">~20 MIN</span>
                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">MÉCANICIEN</span>
                  </div>
                </div>
                {openAccordions["p2"] && (
                  <div className="bg-slate-50/20 p-6 border-t border-slate-100 space-y-4 text-xs font-bold text-slate-700">
                    {[
                      "S'assurer que le robinet d'arrêt de carburant en sortie de réservoir est sur la position ouverte (ON).",
                      "Desserrer d'un tour la vis de purge d'air située au sommet de la tête du filtre à carburant secondaire.",
                      "Actionner la pompe d'amorçage manuelle à membrane jusqu'à ce que le gasoil s'écoule sans aucune bulle d'air.",
                      "Serrer fermement la vis de purge du filtre secondaire. Couple de serrage : 15 Nm.",
                      "Répéter l'opération de purge sur la vis du filtre primaire / séparateur d'eau si le réservoir a été complètement vidé.",
                      "Démarrer le moteur et le laisser tourner pour stabiliser la pression. Rechercher des fuites de carburant."
                    ].map((step, sidx) => (
                      <div key={sidx} className="flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-amber-500 text-white font-black text-[11px] flex items-center justify-center shrink-0">{sidx + 1}</span>
                        <p className="leading-relaxed mt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PROCEDURE 3 */}
              <div id="proc-soupapes" className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs scroll-mt-20">
                <div onClick={() => toggleAccordion("p3")} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {openAccordions["p3"] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs font-black text-slate-800 uppercase">
                      {activeEngin === "ST2D" ? "[PROCÉDURE 3] Réglage jeu aux soupapes (Moteur Deutz F6L912W)" : "[PROCÉDURE 3] Réglage jeu aux soupapes (Moteur Cummins)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-2 py-0.5">~1H30</span>
                    <span className="text-[9px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">QUALIFIÉ</span>
                  </div>
                </div>
                {openAccordions["p3"] && (
                  <div className="bg-slate-50/20 p-6 border-t border-slate-100 space-y-4 text-xs font-bold text-slate-700">
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 mb-2">
                      ⚠️ <strong>OBLIGATOIREMENT moteur FROID :</strong> La température de l'huile moteur doit être inférieure à 60°C. Attendre au minimum 30 minutes après l'arrêt du moteur.
                      <div className="mt-2 grid grid-cols-2 gap-4 font-mono text-xxs font-black">
                        <div>ADMISSION: {activeEngin === "ST2D" ? "0,15 mm" : "0,254 mm (0,010 pouce)"}</div>
                        <div>ÉCHAPPEMENT: {activeEngin === "ST2D" ? "0,15 mm" : "0,508 mm (0,020 pouce)"}</div>
                        <div>COUPLE BLOCAGE: {activeEngin === "ST2D" ? "20 Nm" : "24 Nm"}</div>
                      </div>
                    </div>
                    {(activeEngin === "ST2D" ? [
                      "Déposer les caches de culbuteurs individuels des 6 cylindres Deutz. Nettoyer les plans de joints.",
                      "Faire tourner le vilebrequin jusqu'à amener le cylindre n°1 au PMH compression (les soupapes d'admission et d'échappement sont complètement fermées).",
                      "Vérifier le jeu avec la jauge d'épaisseur de 0,15 mm pour les soupapes d'admission et d'échappement du cylindre 1.",
                      "Ajuster le jeu de soupapes en desserrant le contre-écrou et en tournant la vis de réglage jusqu'au glissement gras de la jauge.",
                      "Serrer le contre-écrou à 20 Nm tout en maintenant fermement la vis, puis revérifier.",
                      "Répéter l'opération pour chaque cylindre individuel en suivant l'ordre d'allumage Deutz : 1 - 5 - 3 - 6 - 2 - 4.",
                      "Reposer les caches-culbuteurs individuels en remplaçant systématiquement les joints en liège."
                    ] : [
                      "Déposer le cache-culbuteurs (vis 15 mm). Nettoyer et préserver la portée du joint de culasse.",
                      "Amener le cylindre n°1 au Point Mort Haut (PMH) de sa phase de compression.",
                      "Vérifier la liberté des culbuteurs du cylindre 1. S'ils sont libres, la position est correcte.",
                      "Mesurer et régler les jeux de soupapes pour la position 1 (Cylindre 1 au PMH compression) : Admission (Cyl 1, 2) et Échappement (Cyl 1, 3).",
                      "Insérer la jauge d'épaisseur appropriée. Ajuster la vis de réglage jusqu'à obtenir un léger glissement gras de la jauge.",
                      "Serrer le contre-écrou au couple de 24 Nm tout en maintenant fermement la vis de réglage en position. Revérifier.",
                      "Faire faire un tour complet de 360° au vilebrequin.",
                      "Régler les soupapes restantes pour la position 2 (Cylindre 4 au PMH compression - rotation 360°) : Admission (Cyl 3, 4) et Échappement (Cyl 2, 4).",
                      "Reposer le cache-culbuteurs en utilisant un joint d'étanchéité neuf."
                    ]).map((step, sidx) => (
                      <div key={sidx} className="flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-amber-500 text-white font-black text-[11px] flex items-center justify-center shrink-0">{sidx + 1}</span>
                        <p className="leading-relaxed mt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PROCEDURE 4 */}
              <div id="proc-flexible" className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs scroll-mt-20">
                <div onClick={() => toggleAccordion("p4")} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {openAccordions["p4"] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs font-black text-slate-800 uppercase">[PROCÉDURE 4] Remplacement flexible hydraulique HP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-2 py-0.5">30-60 MIN</span>
                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">MÉCANICIEN</span>
                  </div>
                </div>
                {openAccordions["p4"] && (
                  <div className="bg-slate-50/20 p-6 border-t border-slate-100 space-y-4 text-xs font-bold text-slate-700">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 mb-2">
                      ⚠️ <strong>SÉCURITÉ DÉPRESSURISATION :</strong> Ne jamais intervenir sur un flexible sous pression. Couper le moteur et actionner plusieurs fois les joysticks pour évacuer la pression résiduelle.
                    </div>
                    {[
                      "Couper le moteur, appliquer le frein de parking et poser fermement le godet à plat sur le sol à vide.",
                      "Actionner les leviers de commande dans toutes les directions pour relâcher les pressions piégées dans les accumulateurs.",
                      "Déposer le flexible défectueux en plaçant un bac de récupération d'huile en dessous.",
                      "Identifier la référence et la dimension du flexible (JIC, BSP, ORFS) pour assembler un flexible identique.",
                      "Monter le nouveau flexible en veillant à ne pas vriller ou torsader la carcasse métallique lors du serrage.",
                      "Serrer au couple spécifié. Démarrer le moteur, manœuvrer à vide et faire l'appoint d'huile hydraulique propre ISO VG 46."
                    ].map((step, sidx) => (
                      <div key={sidx} className="flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-amber-500 text-white font-black text-[11px] flex items-center justify-center shrink-0">{sidx + 1}</span>
                        <p className="leading-relaxed mt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </section>

        </main>
      </div>

    </div>
  );
}
