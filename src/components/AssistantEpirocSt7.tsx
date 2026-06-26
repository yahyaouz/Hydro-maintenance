import * as React from "react";
import { 
  Flame, Shuffle, Droplets, Compass, ShieldAlert, Zap, 
  ThermometerSnowflake, Wind, Disc, Hammer, ShieldCheck, 
  Search, Wrench, Printer, BookOpen, Plus, Minus, 
  AlertTriangle, CheckCircle2, Activity, FileText, Check, 
  ExternalLink, Lock, Scale, GraduationCap, AlertCircle, 
  Save, Trash2, Send, ShoppingCart, Sliders, ChevronDown, 
  ChevronRight, Eye, RefreshCw
} from "lucide-react";
import { 
  EPIROC_ST7_PANNES, EPIROC_ST7_SYSTEMS, EPIROC_ST7_GLOSSAIRE, 
  EPIROC_ST7_VOYANTS, EPIROC_ST7_CUMMINS_CODES, EPIROC_ST7_RCS_CODES, 
  EPIROC_ST7_ERRORS, EPIROC_ST7_STOCK, EPIROC_ST7_PROCEDURES, 
  EPIROC_ST7_COUPLES, EPIROC_ST7_URGENCES, EPIROC_ST7_VALEURS, 
  EPIROC_ST7_OUTILS, EPIROC_ST7_SYMPTOMS_INDEX, 
  EpirocSt7Panne 
} from "./epirocSt7Data";
import { PageBanner } from "@/components/ui/PageBanner";
import { useAuthStore } from "@/lib/store";
import { HydrominesLogo } from "./auth/HydrominesLogo";
import { cahierProcedures, getPlaceholderSvg } from "./cahierPhotosData";
import { AnimEngineQsb } from "./AnimEngineQsb";
import { AnimHydraulicLS } from "./AnimHydraulicLS";
import { AnimBrakesSahr } from "./AnimBrakesSahr";

const HydrominesIdentity = ({ isEco }: { isEco: boolean }) => {
  if (isEco) return null;
  return (
    <div className="absolute top-0 left-0 right-0 h-[4px] flex overflow-hidden rounded-t-2xl z-10">
      <div className="bg-sky-400 h-full flex-1"></div>
      <div className="bg-red-600 h-full flex-1"></div>
    </div>
  );
};

const COTES_DATA = [
  {
    title: "SECTION A — MOTEUR CUMMINS QSB 6.7 TIER 3",
    id: "cote-section-A",
    tables: [
      {
        id: "5.1",
        ref: "1.1.1.A",
        title: "COTES MOTEUR ET JEUX DE FONCTIONNEMENT",
        rows: [
          ["001", "Jeu piston/chemise (point mort haut, perpendiculaire axe)", "0,08", "0,05", "0,12", "mm", "Micromètre ext + comparateur", "C", "1.1.001"],
          ["002", "Jeu segment/bague (segment neuf, 30 mm du haut)", "0,03", "0,02", "0,05", "mm", "Jeu de cales", "C", "1.1.002"],
          ["003", "Ovalisation chemise (max 3 mesures à 120°)", "0,02", "0,00", "0,05", "mm", "Comparateur", "C", "1.1.003"],
          ["004", "Rectitude arbre à cames (sur 2 paliers)", "0,03", "0,00", "0,06", "mm", "Comparateur sur V", "C", "1.1.004"],
          ["005", "Jeu coussinet/vilebrequin (palier central)", "0,05", "0,03", "0,08", "mm", "Micromètre + jauge plastique", "C", "1.1.005"],
          ["006", "Jeu soupape admission (froid)", "0,30", "0,25", "0,35", "mm", "Jeu de cales", "C", "1.1.006"],
          ["007", "Jeu soupape échappement (froid)", "0,45", "0,40", "0,50", "mm", "Jeu de cales", "C", "1.1.007"],
          ["008", "Planéité culasse (sur 6 points)", "0,05", "0,00", "0,10", "mm", "Règle de contrôle + jeu de cales", "C", "1.1.008"],
          ["009", "Pression compression (moteur chaud, régime lenteur)", "32", "28", "36", "bar", "Manomètre compression", "C", "1.1.009"],
          ["010", "Pression huile moteur (régime nominal, 80°C)", "4,5", "3,5", "5,5", "bar", "Manomètre digital", "B", "1.1.010"]
        ],
        prep: "arrêt moteur 30 min, température ambiante 20±5°C, outils calibrés",
        pos: "déposer le couvre-culasse, piston concerné au PMT/PMB pour libérer les jeux mécaniques",
        mesure: "mesurer à l'aide des comparateurs ou des cales en 3 points distincts décalés de 120°",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-MOTEUR-A",
        dec: "si hors tolérance → panne Pan. 1.1.1.A → arbre décision AD-001",
        diagnostic: {
          panne: "Usure prématurée des cylindres / Perte de compression",
          ref: "Pan. 1.1.1.A",
          arbre: "AD-001",
          action: "Révision moteur ou réalésage des chemises"
        }
      },
      {
        id: "5.2",
        ref: "1.1.2.B",
        title: "COTES INJECTEUR ET COMMON RAIL",
        rows: [
          ["011", "Couple serrage injecteur (étape 1 : main)", "15", "12", "18", "Nm", "Clé dyna 3/8\"", "A", "1.1.011"],
          ["012", "Couple serrage injecteur (étape 2 : final)", "32", "30", "34", "Nm", "Clé dyna 3/8\"", "A", "1.1.012"],
          ["013", "Couple serrage tuyau haute pression (écrou 14mm)", "28", "26", "30", "Nm", "Clé dyna 1/2\"", "A", "1.1.013"],
          ["014", "Pression rail Common Rail (au démarrage)", "250", "200", "300", "bar", "Testeur rail", "A", "1.1.014"],
          ["015", "Débit retour injecteur (à 250 bar, 30 sec)", "45", "30", "60", "mL", "Burette graduée", "C", "1.1.015"],
          ["016", "Résistance bobine injecteur (à 20°C)", "0,45", "0,40", "0,50", "Ω", "Multimètre Fluke", "A", "1.1.016"]
        ],
        prep: "couper le contact, attendre 5 minutes pour chute complète de pression du Common Rail",
        pos: "connecter les éprouvettes graduées de retour et installer le multimètre",
        mesure: "mesurer le volume de retour pendant 30 secondes stabilisées et tester la bobine électrique",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-MOTEUR-B",
        dec: "si hors tolérance → panne Pan. 1.1.2.B → arbre décision AD-002",
        diagnostic: {
          panne: "Dysfonctionnement injection haute pression / Ratés d'allumage",
          ref: "Pan. 1.1.2.B",
          arbre: "AD-002",
          action: "Remplacement de l'injecteur ou du régulateur de pression"
        }
      },
      {
        id: "5.3",
        ref: "1.1.3.B",
        title: "COTES REFROIDISSEMENT",
        rows: [
          ["017", "Pression bouchon radiateur (ouverture)", "1,1", "1,0", "1,2", "bar", "Testeur pression bouchon", "C", "1.1.017"],
          ["018", "Température thermostat (ouverture)", "82", "80", "84", "°C", "Bain thermostaté + thermomètre", "C", "1.1.018"],
          ["019", "Température moteur nominale (en charge)", "85", "80", "95", "°C", "Sonde RCS / thermomètre IR", "B", "1.1.019"],
          ["020", "Épaisseur ailettes radiateur (neuve)", "0,15", "0,13", "0,17", "mm", "Micromètre", "C", "1.1.020"],
          ["021", "Densité liquide refroidissement (à 20°C)", "1,075", "1,065", "1,085", "kg/L", "Densimètre", "B", "1.1.021"],
          ["022", "Pression pompe eau (3000 tr/min)", "2,2", "1,8", "2,6", "bar", "Manomètre", "C", "1.1.022"]
        ],
        prep: "moteur froid à température ambiante, circuit hors pression",
        pos: "installer l'adaptateur de test sur le goulot du radiateur ou immerger le thermostat",
        mesure: "monter la pression manuelle jusqu'à décharge ou chauffer l'eau graduellement",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-MOTEUR-C",
        dec: "si hors tolérance → panne Pan. 1.1.3.B → arbre décision AD-003",
        diagnostic: {
          panne: "Surchauffe moteur par défaillance thermique",
          ref: "Pan. 1.1.3.B",
          arbre: "AD-003",
          action: "Remplacement du bouchon, du thermostat ou détartrage complet"
        }
      },
      {
        id: "5.4",
        ref: "1.1.1.A",
        title: "COTES COURROIES ET POULIES",
        rows: [
          ["023", "Tension courroie alternateur (déflexion 10 kg au milieu)", "12", "10", "14", "mm", "Règle + pèse-tension", "B", "1.1.023"],
          ["024", "Tension courroie compresseur clim (si équipé)", "10", "8", "12", "mm", "Règle + pèse-tension", "B", "1.1.024"],
          ["025", "Jeu poulie vilebrequin (radial)", "0,10", "0,00", "0,20", "mm", "Comparateur", "C", "1.1.025"],
          ["026", "Alignement poulies (parallélisme)", "0,50", "0,00", "1,00", "mm", "Règle + comparateur", "C", "1.1.026"]
        ],
        prep: "moteur consigné, clés de contact retirées",
        pos: "placer l'appareil de mesure de tension au centre du brin libre le plus long",
        mesure: "appliquer la force prescrite et lire la flèche ou mesurer le parallélisme à la règle rectifiée",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-MOTEUR-D",
        dec: "si hors tolérance → panne Pan. 1.1.1.A → arbre décision AD-004",
        diagnostic: {
          panne: "Glissement ou rupture courroie accessoire / Défaut de charge",
          ref: "Pan. 1.1.1.A",
          arbre: "AD-004",
          action: "Ajustement de la tension ou remplacement de la courroie"
        }
      },
      {
        id: "5.5",
        ref: "1.1.1.A",
        title: "COTES TURBOCOMPRESSEUR",
        rows: [
          ["027", "Jeu rotor axial (turbine)", "0,06", "0,03", "0,09", "mm", "Comparateur", "C", "1.1.027"],
          ["028", "Jeu rotor radial (turbine)", "0,10", "0,05", "0,15", "mm", "Comparateur", "C", "1.1.028"],
          ["029", "Pression suralimentation (pleine charge)", "1,8", "1,5", "2,1", "bar", "Manomètre", "B", "1.1.029"],
          ["030", "Temps réponse turbo (pression 0 → 1,5 bar)", "2,0", "1,5", "2,5", "s", "Chronomètre + manomètre", "B", "1.1.030"]
        ],
        prep: "moteur éteint et échappement froid",
        pos: "déposer le conduit d'admission d'air pour exposer l'arbre de turbine",
        mesure: "installer le comparateur contre l'extrémité de l'arbre, pousser et tirer radialement et axialement",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-MOTEUR-E",
        dec: "si hors tolérance → panne Pan. 1.1.1.A → arbre décision AD-005",
        diagnostic: {
          panne: "Usure des paliers de turbo / Fuite d'huile admission",
          ref: "Pan. 1.1.1.A",
          arbre: "AD-005",
          action: "Remplacement du turbocompresseur ou de la cartouche centrale"
        }
      }
    ]
  },
  {
    title: "SECTION B — TRANSMISSION FUNK DF150",
    id: "cote-section-B",
    tables: [
      {
        id: "5.6",
        ref: "2.1.1.A",
        title: "COTES CONVERTISSEUR",
        rows: [
          ["031", "Jeu stator/rotor (axial)", "0,80", "0,50", "1,20", "mm", "Comparateur + montage spécial", "C", "1.2.031"],
          ["032", "Jeu stator/rotor (radial)", "0,40", "0,25", "0,60", "mm", "Comparateur", "C", "1.2.032"],
          ["033", "Pression convertisseur (engagement 1ère)", "12", "10", "14", "bar", "Prise Minimess + manomètre", "B", "1.2.033"],
          ["034", "Couple serrage boulons carter convertisseur", "85", "80", "90", "Nm", "Clé dyna 1/2\"", "A", "1.2.034"],
          ["035", "Alignement arbre convertisseur (coaxialité)", "0,03", "0,00", "0,05", "mm", "Comparateur d'alignement", "A", "1.2.035"],
          ["036", "Fuite interne convertisseur (test 10 min)", "0", "0", "50", "mL", "Bac gradué", "C", "1.2.036"]
        ],
        prep: "sécuriser la machine, installer un manomètre Minimess sur le port de pression de sortie du convertisseur",
        pos: "démarrer le moteur, engager la 1ère vitesse avec les freins bloqués (test de calage)",
        mesure: "mesurer à chaud (80°C) au régime de calage complet de la transmission",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-TRANS-A",
        dec: "si hors tolérance → panne Pan. 2.1.1.A → arbre décision AD-006",
        diagnostic: {
          panne: "Perte de couple de transmission / Cavitation d'huile",
          ref: "Pan. 2.1.1.A",
          arbre: "AD-006",
          action: "Déposer le convertisseur pour réfection ou changement des joints d'arbre"
        }
      },
      {
        id: "5.7",
        ref: "2.2.1.A",
        title: "COTES EMBRAYAGE POWER SHIFT",
        rows: [
          ["037", "Épaisseur disques friction (neufs)", "2,5", "2,4", "2,6", "mm", "Micromètre", "A", "1.2.037"],
          ["038", "Épaisseur disques friction (usure max)", "2,0", "—", "2,0", "mm", "Micromètre", "B", "1.2.038"],
          ["039", "Jeu total embrayage (empilage + piston)", "1,8", "1,5", "2,1", "mm", "Jeu de cales", "A", "1.2.039"],
          ["040", "Couple serrage boulons carter embrayage", "55", "50", "60", "Nm", "Clé dyna 1/2\"", "A", "1.2.040"],
          ["041", "Pression servo embrayage (engagement)", "18", "16", "20", "bar", "Manomètre", "B", "1.2.041"],
          ["042", "Temps remplissage circuit embrayage", "1,5", "1,0", "2,0", "s", "Chronomètre", "B", "1.2.042"]
        ],
        prep: "vidanger l'huile de boîte, démonter le couvercle d'accès latéral aux embrayages",
        pos: "glisser le jeu de cales plates entre le premier disque et le plateau de pression",
        mesure: "noter l'épaisseur libre résiduelle et tester la pression de commande au manomètre",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-TRANS-B",
        dec: "si hors tolérance → panne Pan. 2.2.1.A → arbre décision AD-007",
        diagnostic: {
          panne: "Patinage d'embrayage Power Shift / Surchauffe d'huile de boîte",
          ref: "Pan. 2.2.1.A",
          arbre: "AD-007",
          action: "Remplacement du pack de disques de friction et d'acier"
        }
      },
      {
        id: "5.8",
        ref: "2.2.2.A",
        title: "COTES BOÎTE DE VITESSES",
        rows: [
          ["043", "Jeu pignon 1ère/2ème (décalage latéral)", "0,15", "0,10", "0,20", "mm", "Comparateur", "C", "1.2.043"],
          ["044", "Jeu pignon 3ème/4ème (décalage latéral)", "0,15", "0,10", "0,20", "mm", "Comparateur", "C", "1.2.044"],
          ["045", "Couple serrage boulons carter principal", "75", "70", "80", "Nm", "Clé dyna 1/2\"", "A", "1.2.045"],
          ["046", "Niveau huile transmission (jauge, moteur horizontal)", "85", "80", "90", "mm", "Jauge graduée", "B", "1.2.046"],
          ["047", "Viscosité huile transmission (40°C)", "46", "41", "51", "cSt", "Viscosimètre", "C", "1.2.047"],
          ["048", "Pression circuit transmission (neutre, 80°C)", "22", "20", "24", "bar", "Manomètre", "B", "1.2.048"]
        ],
        prep: "machine sur sol plan, transmission au point mort, huile de boîte chaude",
        pos: "fixer le comparateur à palpeur against the face d'appui latérale du pignon concerné",
        mesure: "repousser le pignon de part et d'autre pour relever le jeu d'entre-dents latéral et mesurer l'huile",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-TRANS-C",
        dec: "si hors tolérance → panne Pan. 2.2.2.A → arbre décision AD-008",
        diagnostic: {
          panne: "Saut d'engrenage / Usure anormale des dentures et cales",
          ref: "Pan. 2.2.2.A",
          arbre: "AD-008",
          action: "Démontage de la boîte et calage d'épaisseur des pignons"
        }
      },
      {
        id: "5.9",
        ref: "2.3.1.A",
        title: "COTES ESSIEUX ROCK TOUGH 406",
        rows: [
          ["049", "Jeu pignon planétaire/satellite (radial)", "0,20", "0,10", "0,30", "mm", "Jeu de cales", "C", "1.2.049"],
          ["050", "Couple serrage écrou moyeu (grade 12.9)", "650", "600", "700", "Nm", "Clé dyna 3/4\"", "A", "1.2.050"],
          ["051", "Jeu roulement moyeu (axial)", "0,05", "0,00", "0,10", "mm", "Comparateur", "C", "1.2.051"],
          ["052", "Pression graissage moyeu (pompe centralisée)", "30", "25", "35", "bar", "Manomètre", "B", "1.2.052"],
          ["053", "Jeu différentiel avant (no-spin)", "0", "0", "0,05", "mm", "Comparateur", "C", "1.2.053"],
          ["054", "Oscillation essieu arrière (angle total)", "14", "12", "16", "°", "Rapporteur digital", "C", "1.2.054"]
        ],
        prep: "lever et sécuriser l'essieu pour suspendre complètement les roues",
        pos: "installer le pied magnétique du comparateur sur le pont, palpeur contre le moyeu",
        mesure: "tirer et pousser vigoureusement la roue dans l'axe pour relever le jeu du roulement de moyeu",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-TRANS-D",
        dec: "si hors tolérance → panne Pan. 2.3.1.A → arbre décision AD-009",
        diagnostic: {
          panne: "Flottement du pont / Usure des roulements d'essieu",
          ref: "Pan. 2.3.1.A",
          arbre: "AD-009",
          action: "Ajustement de la précharge des roulements coniques ou remplacement"
        }
      },
      {
        id: "5.10",
        ref: "2.4.1.A",
        title: "COTES CHAÎNES DE TRANSMISSION",
        rows: [
          ["055", "Flèche chaîne avant (milieu portée, charge 10 kg)", "25", "20", "30", "mm", "Règle de flèche", "B", "1.2.055"],
          ["056", "Flèche chaîne arrière (milieu portée, charge 10 kg)", "25", "20", "30", "mm", "Règle de flèche", "B", "1.2.056"],
          ["057", "Allongement chaîne (sur 10 maillons)", "0", "0", "2", "%", "Pied à coulisse", "C", "1.2.057"],
          ["058", "Couple serrage boulons tendeur excentrique", "550", "500", "600", "Nm", "Clé dyna 1\"", "A", "1.2.058"],
          ["059", "Alignement pignons chaîne (dans le même plan)", "0,50", "0,00", "1,00", "mm", "Règle + comparateur", "C", "1.2.059"],
          ["060", "Graissage chaîne (pénetration au toucher)", "2", "1", "3", "mm", "Sonde graisse", "B", "1.2.060"]
        ],
        prep: "immobiliser la machine, s'assurer du relâchement des tensions résiduelles",
        pos: "repérer le centre du brin inférieur de la chaîne",
        mesure: "appliquer une charge verticale de 10 kg, relever la flèche et mesurer l'intervalle de 10 maillons",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-TRANS-E",
        dec: "si hors tolérance → panne Pan. 2.4.1.A → arbre décision AD-010",
        diagnostic: {
          panne: "Saut de chaîne / Usure excessive et rupture par fatigue",
          ref: "Pan. 2.4.1.A",
          arbre: "AD-010",
          action: "Réglage de l'excentrique tendeur ou remplacement de la chaîne"
        }
      }
    ]
  },
  {
    title: "SECTION C — HYDRAULIQUE REXROTH A10VO",
    id: "cote-section-C",
    tables: [
      {
        id: "5.11",
        ref: "3.1.1.A",
        title: "COTES POMPE A10VO",
        rows: [
          ["061", "Pression stand-by (moteur au ralenti)", "25", "22", "28", "bar", "Manomètre digital", "B", "1.3.061"],
          ["062", "Pression nominale système (pleine charge)", "250", "240", "260", "bar", "Manomètre digital", "B", "1.3.062"],
          ["063", "Débit pompe (2000 tr/min, 0 bar)", "85", "80", "90", "L/min", "Débitmètre", "C", "1.3.063"],
          ["064", "Couple serrage boulons bride PTO", "85", "80", "90", "Nm", "Clé dyna 1/2\"", "A", "1.3.064"],
          ["065", "Jeu plateau oscillant (indicateur usure)", "0", "0", "0,10", "mm", "Comparateur", "C", "1.3.065"],
          ["066", "Fuite interne pompe (bouchon drain, 5 min)", "0", "0", "5", "mL", "Burette", "C", "1.3.066"]
        ],
        prep: "nettoyer la valve de drain de la pompe hydraulique principale",
        pos: "connecter une éprouvette de récupération graduée sur le tuyau de fuite débranché",
        mesure: "lancer le moteur, maintenir le circuit en butée de pression à 250 bar pendant 5 minutes",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-HYDR-A",
        dec: "si hors tolérance → panne Pan. 3.1.1.A → arbre décision AD-011",
        diagnostic: {
          panne: "Baisse de rendement hydraulique / Chute de débit sous charge",
          ref: "Pan. 3.1.1.A",
          arbre: "AD-011",
          action: "Reconditionnement complet ou échange standard de la pompe"
        }
      },
      {
        id: "5.12",
        ref: "3.1.2.A",
        title: "COTES FILTRATION",
        rows: [
          ["067", "Pression différentielle filtre return (neuf)", "0,5", "0,3", "0,7", "bar", "Manomètre diff.", "B", "1.3.067"],
          ["068", "Pression différentielle filtre return (max)", "2,0", "—", "2,0", "bar", "Manomètre diff.", "B", "1.3.068"],
          ["069", "Indice propreté huile (ISO 4406)", "18/16/13", "17/15/12", "20/18/15", "code", "Analyseur particules", "C", "1.3.069"],
          ["070", "Teneur eau huile (Karl Fischer)", "200", "0", "500", "ppm", "Analyseur humidité", "C", "1.3.070"],
          ["071", "Couple serrage couvercle filtre return", "40", "35", "45", "Nm", "Clé dyna 1/2\"", "A", "1.3.071"]
        ],
        prep: "faire fonctionner l'hydraulique jusqu'à stabiliser l'huile à 50°C",
        pos: "prélever 100 mL de fluide au port d'échantillonnage de retour",
        mesure: "lancer le comptage de particules et analyser l'humidité de l'huile",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-HYDR-B",
        dec: "si hors tolérance → panne Pan. 3.1.2.A → arbre décision AD-012",
        diagnostic: {
          panne: "Contamination du fluide hydraulique / Colmatage du filtre",
          ref: "Pan. 3.1.2.A",
          arbre: "AD-012",
          action: "Remplacement des filtres et filtration de l'huile du réservoir"
        }
      },
      {
        id: "5.13",
        ref: "3.3.2.A",
        title: "COTES VÉRINS",
        rows: [
          ["072", "Jeu tige/alésage (vérin hoist, radial)", "0,05", "0,03", "0,08", "mm", "Comparateur", "C", "1.3.072"],
          ["073", "Rectitude tige (sur toute la course)", "0,10", "0,00", "0,20", "mm", "Comparateur sur V", "C", "1.3.073"],
          ["074", "Épaisseur chrome tige (neuve)", "30", "25", "35", "µm", "Testeur d'épaisseur", "C", "1.3.074"],
          ["075", "Couple serrage écrou axe articulation (M36)", "450", "400", "500", "Nm", "Clé dyna 3/4\"", "A", "1.3.075"],
          ["076", "Fuite externe vérin (5 cycles complets)", "0", "0", "0", "goutte", "Visuel + papier absorbant", "A", "1.3.076"],
          ["077", "Vitesse sortie tige hoist (plein débit)", "0,35", "0,30", "0,40", "m/s", "Chronomètre + règle", "B", "1.3.077"]
        ],
        prep: "calmer mécaniquement les bras de levage, décharger la pression accumulée",
        pos: "essuyer la tige du vérin pour retirer tout résidu de graisse",
        mesure: "mesurer la vitesse d'extension complète sous charge et inspecter les fuites de joint",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-HYDR-C",
        dec: "si hors tolérance → panne Pan. 3.3.2.A → arbre décision AD-013",
        diagnostic: {
          panne: "Fuite externe ou interne du vérin de levage / Chute du bras",
          ref: "Pan. 3.3.2.A",
          arbre: "AD-013",
          action: "Changement des joints de piston et guidage du vérin"
        }
      },
      {
        id: "5.14",
        ref: "3.1.1.A",
        title: "COTES CIRCUIT LOAD SENSING",
        rows: [
          ["078", "Pression LS stand-by (distributeur neutre)", "22", "20", "24", "bar", "Manomètre", "B", "1.3.078"],
          ["079", "Pression différentielle LS (charge → commande)", "20", "18", "22", "bar", "2 manomètres", "B", "1.3.079"],
          ["080", "Temps réponse distributeur (neutre → plein débit)", "0,15", "0,10", "0,20", "s", "Chronomètre haute vitesse", "B", "1.3.080"],
          ["081", "Fuite circuit LS (toutes les vanne fermées, 10 min)", "0", "0", "2", "L/min", "Débitmètre", "C", "1.3.081"],
          ["082", "Température huile hydraulique (nominal)", "55", "45", "65", "°C", "Sonde RCS / thermomètre", "B", "1.3.082"]
        ],
        prep: "installer deux manomètres sur le port de pompe (M1) et le signal pilote LS (M2)",
        pos: "démarrer et stabiliser la température d'huile hydraulique à 55°C",
        mesure: "mesurer la différence dynamique (M1 - M2) au neutre et en charge moyenne",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-HYDR-D",
        dec: "si hors tolérance → panne Pan. 3.1.1.A → arbre décision AD-014",
        diagnostic: {
          panne: "Instabilité ou lenteur des mouvements hydrauliques",
          ref: "Pan. 3.1.1.A",
          arbre: "AD-014",
          action: "Réglage de la vis de marge LS sur le compensateur de pompe"
        }
      },
      {
        id: "5.15",
        ref: "3.2.3.A",
        title: "COTES ACCUMULATEURS",
        rows: [
          ["083", "Précharge azote ride control", "80", "78", "82", "bar", "Testeur précharge", "B", "1.3.083"],
          ["084", "Précharge azote soft stop direction", "60", "58", "62", "bar", "Testeur précharge", "B", "1.3.084"],
          ["085", "Précharge azote frein", "100", "95", "105", "bar", "Testeur précharge", "B", "1.3.085"],
          ["086", "Fuite membrane accumulateur (24h)", "0", "0", "2", "bar", "Manomètre", "C", "1.3.086"]
        ],
        prep: "moteur éteint, actionner le bouton de décharge jusqu'à chute complète à 0 bar",
        pos: "démonter le capuchon de valve de gaz et raccorder le manomètre de test",
        mesure: "lire la pression d'azote à température ambiante et vérifier l'absence de fuite",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-HYDR-E",
        dec: "si hors tolérance → panne Pan. 3.2.3.A → arbre décision AD-015",
        diagnostic: {
          panne: "Suspension rigide ou perte de secours de freinage",
          ref: "Pan. 3.2.3.A",
          arbre: "AD-015",
          action: "Recharge d'azote à la pression prescrite ou changement d'accumulateur"
        }
      }
    ]
  },
  {
    title: "SECTION D — FREINAGE SAHR FORCE COOLED",
    id: "cote-section-D",
    tables: [
      {
        id: "5.16",
        ref: "5.1.1.A",
        title: "COTES DISQUES FREIN",
        rows: [
          ["087", "Épaisseur disque mobile (neuf)", "8,0", "7,8", "8,2", "mm", "Micromètre", "A", "1.4.087"],
          ["088", "Épaisseur disque mobile (usure min)", "6,0", "—", "6,0", "mm", "Micromètre", "B", "1.4.088"],
          ["089", "Épaisseur disque fixe (neuf)", "8,0", "7,8", "8,2", "mm", "Micromètre", "A", "1.4.089"],
          ["090", "Épaisseur plaquette friction (neuve)", "12,0", "11,5", "12,5", "mm", "Pied à coulisse", "A", "1.4.090"],
          ["091", "Épaisseur plaquette friction (usure min)", "3,0", "—", "3,0", "mm", "Pied à coulisse", "B", "1.4.091"],
          ["092", "Jeu total empilage disques (serré)", "0", "0", "0,1", "mm", "Comparateur", "A", "1.4.092"]
        ],
        prep: "déposer les trappes d'accès extérieures de l'étrier de frein SAHR",
        pos: "positionner le micromètre d'extérieur à 15 mm du bord externe",
        mesure: "mesurer l'épaisseur résiduelle des garnitures mobiles et plaquettes en 6 points répartis",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-FREIN-A",
        dec: "si hors tolérance → panne Pan. 5.1.1.A → arbre décision AD-016",
        diagnostic: {
          panne: "Usure critique des disques de frein / Échec frein stationnement",
          ref: "Pan. 5.1.1.A",
          arbre: "AD-016",
          action: "Remplacement complet de l'empilage de disques de frein"
        }
      },
      {
        id: "5.17",
        ref: "5.1.1.A",
        title: "COTES ÉTRIER ET PISTON",
        rows: [
          ["093", "Diamètre piston étrier", "45,0", "44,95", "45,05", "mm", "Micromètre intérieur", "C", "1.4.093"],
          ["094", "Course piston (max)", "25", "23", "27", "mm", "Comparateur", "C", "1.4.094"],
          ["095", "État surface piston (rugosité)", "0,4", "0", "0,8", "µm Ra", "Rugosimètre", "C", "1.4.095"],
          ["096", "Couple serrage boulons étrier (M14)", "180", "170", "190", "Nm", "Clé dyna 1/2\"", "A", "1.4.096"],
          ["097", "Rectitude étrier (après choc)", "0,05", "0,00", "0,10", "mm", "Comparateur", "D", "1.4.097"]
        ],
        prep: "extraire le piston en appliquant une faible pression pneumatique contrôlée",
        pos: "poser le piston propre sur des cales calibrées en V d'atelier",
        mesure: "vérifier le diamètre extérieur à l'aide d'un micromètre à 3 touches et tester la rugosité",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-FREIN-B",
        dec: "si hors tolérance → panne Pan. 5.1.1.A → arbre décision AD-017",
        diagnostic: {
          panne: "Grippage du piston / Fuite externe d'huile hydraulique de frein",
          ref: "Pan. 5.1.1.A",
          arbre: "AD-017",
          action: "Changer le piston de l'étrier ainsi que le jeu de joints racleurs"
        }
      },
      {
        id: "5.18",
        ref: "5.1.2.A",
        title: "COTES ACCUMULATEUR FREIN",
        rows: [
          ["098", "Pression service accumulateur", "180", "170", "190", "bar", "Manomètre", "B", "1.4.098"],
          ["099", "Pression min alarme (RCS)", "120", "—", "120", "bar", "Manomètre", "B", "1.4.099"],
          ["100", "Pression min arrêt machine", "100", "—", "100", "bar", "Manomètre", "B", "1.4.100"],
          ["101", "Couple serrage corps accumulateur", "140", "130", "150", "Nm", "Clé dyna 1/2\"", "A", "1.4.101"]
        ],
        prep: "lancer le moteur, charger le système hydraulique de frein jusqu'au tarage de coupure",
        pos: "se placer en cabine en face de l'indicateur de pression d'huile RCS",
        mesure: "éteindre le moteur, presser la pédale de frein de façon répétée et compter le nombre de coups utiles",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-FREIN-C",
        dec: "si hors tolérance → panne Pan. 5.1.2.A → arbre décision AD-018",
        diagnostic: {
          panne: "Réserve de secours insuffisante / Alarme de pression cabine",
          ref: "Pan. 5.1.2.A",
          arbre: "AD-018",
          action: "Remplacement de l'accumulateur de freinage de secours"
        }
      },
      {
        id: "5.19",
        ref: "5.1.2.A",
        title: "COTES FORCE COOLING",
        rows: [
          ["102", "Température activation ventilateur", "80", "75", "85", "°C", "Sonde / thermomètre IR", "B", "1.4.102"],
          ["103", "Débit air ventilateur", "500", "450", "550", "m³/h", "Anémomètre", "C", "1.4.103"],
          ["104", "Consommation électrique ventilateur", "5", "4", "6", "A", "Pince ampèremétrique", "B", "1.4.104"],
          ["105", "Température max frein (alarme)", "150", "—", "150", "°C", "Sonde / thermomètre IR", "B", "1.4.105"]
        ],
        prep: "effectuer des cycles de freinage prolongés sous charge pour élever l'huile à 70°C",
        pos: "positionner le capteur IR sur la tubulure métallique de retour",
        mesure: "mesurer la température d'activation automatique et vérifier le courant électrique absorbé",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-FREIN-D",
        dec: "si hors tolérance → panne Pan. 5.1.2.A → arbre décision AD-019",
        diagnostic: {
          panne: "Surchauffe du circuit de refroidissement des freins",
          ref: "Pan. 5.1.2.A",
          arbre: "AD-019",
          action: "Remplacement du thermo-contact ou du moteur de ventilateur"
        }
      },
      {
        id: "5.20",
        ref: "5.2.1.A",
        title: "COTES TEST BRAKE RCS",
        rows: [
          ["106", "Pression test frein (application)", "180", "175", "185", "bar", "Manomètre RCS", "A", "1.4.106"],
          ["107", "Temps maintien pression test", "5", "4", "6", "min", "Chronomètre", "A", "1.4.107"],
          ["108", "Perte pression (5 min)", "0", "0", "5", "bar", "Manomètre RCS", "A", "1.4.108"],
          ["109", "Temps cycle brake-test automatique", "30", "25", "35", "s", "RCS logging", "B", "1.4.109"]
        ],
        prep: "garer le véhicule à plat, vider complètement le godet et engager le test de frein",
        pos: "s'assurer qu'aucune personne n'est présente dans la zone de sécurité",
        mesure: "lancer l'évaluation automatique sur l'écran RCS et chronométrer la chute de pression",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-FREIN-E",
        dec: "si hors tolérance → panne Pan. 5.2.1.A → arbre décision AD-020",
        diagnostic: {
          panne: "Échec au test de frein automatique / Fuite interne de valve",
          ref: "Pan. 5.2.1.A",
          arbre: "AD-020",
          action: "Arrêt immédiat de la machine pour réfection de la valve de frein"
        }
      }
    ]
  },
  {
    title: "SECTION E — CHÂSSIS, ESSIEUX, ARTICULATION",
    id: "cote-section-E",
    tables: [
      {
        id: "5.21",
        ref: "4.2.1.A",
        title: "COTES ARTICULATION",
        rows: [
          ["110", "Jeu roulement articulation (radial)", "0,10", "0,00", "0,20", "mm", "Comparateur", "C", "1.6.110"],
          ["111", "Couple serrage écrou articulation (M48)", "1200", "1100", "1300", "Nm", "Clé dyna 1\" + multiplicateur", "A", "1.6.111"],
          ["112", "Angle oscillation arrière (total)", "14", "12", "16", "°", "Rapporteur digital", "C", "1.6.112"],
          ["113", "Graissage articulation (quantité par point)", "50", "40", "60", "g", "Balance", "B", "1.6.113"],
          ["114", "Fuite joint cardan (visuel)", "0", "0", "0", "trace", "Visuel + papier", "B", "1.6.114"]
        ],
        prep: "nettoyer la rotule d'articulation et l'axe central d'oscillation",
        pos: "installer le pied magnétique sur le châssis arrière, palpeur contre l'articulation",
        mesure: "faire pivoter lentement la direction gauche/droite pour mesurer le débattement radial",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-CHAS-A",
        dec: "si hors tolérance → panne Pan. 4.2.1.A → arbre décision AD-021",
        diagnostic: {
          panne: "Jeu important articulation centrale / Usure des bagues de pivot",
          ref: "Pan. 4.2.1.A",
          arbre: "AD-021",
          action: "Remplacement de la rotule centrale ou réalésage de la structure"
        }
      },
      {
        id: "5.22",
        ref: "9.2.1.A",
        title: "COTES PNEUS ET JANTES",
        rows: [
          ["115", "Pression pneu avant (charge nominale)", "6,5", "6,0", "7,0", "bar", "Manomètre", "B", "1.6.115"],
          ["116", "Pression pneu arrière (charge nominale)", "6,5", "6,0", "7,0", "bar", "Manomètre", "B", "1.6.116"],
          ["117", "Couple serrage boulons roue (M22)", "650", "600", "700", "Nm", "Clé dyna 3/4\"", "A", "1.6.117"],
          ["118", "Usure bande de roulement (min)", "20", "—", "20", "mm", "Jauge de profondeur", "B", "1.6.118"],
          ["119", "Déport roue (parallélisme)", "0", "0", "3", "mm", "Tracé au sol + règle", "C", "1.6.119"]
        ],
        prep: "placer le véhicule sur une aire plate, nettoyer la bande de roulement",
        pos: "raccorder le manomètre étalonné sur la valve de chaque pneu 17,5x25",
        mesure: "relever la pression d'air à froid et mesurer la sculpture résiduelle au point le plus bas",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-CHAS-B",
        dec: "si hors tolérance → panne Pan. 9.2.1.A → arbre décision AD-022",
        diagnostic: {
          panne: "Sous-gonflage ou usure critique des pneumatiques",
          ref: "Pan. 9.2.1.A",
          arbre: "AD-022",
          action: "Gonfler à la pression requise ou planifier le rechapage du pneu"
        }
      },
      {
        id: "5.23",
        ref: "9.3.1.A",
        title: "COTES CHÂSSIS",
        rows: [
          ["120", "Rectitude longeron principal (sur 2m)", "2", "0", "4", "mm", "Cordeau + règle", "D", "1.6.120"],
          ["121", "Fissure soudure (longueur max acceptée)", "0", "0", "5", "mm", "Inspection visuelle + PT", "D", "1.6.121"],
          ["122", "Couple serrage boulons châssis articulation (M36)", "900", "850", "950", "Nm", "Clé dyna 1\"", "A", "1.6.122"],
          ["123", "Peinture anticorrosion (épaisseur)", "120", "100", "140", "µm", "Testeur épaisseur", "C", "1.6.123"]
        ],
        prep: "laver à haute pression les zones de soudure structurelle sensibles",
        pos: "tendre un cordeau d'alignement ou placer une règle de précision le long du longeron",
        mesure: "mesurer l'écart de rectitude maximale et tester les soudures par ressuage coloré",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-CHAS-C",
        dec: "si hors tolérance → panne Pan. 9.3.1.A → arbre décision AD-023",
        diagnostic: {
          panne: "Fissure structurelle / Déviation géométrique du châssis",
          ref: "Pan. 9.3.1.A",
          arbre: "AD-023",
          action: "Immobiliser pour gougeage et soudage homologué de renforcement"
        }
      },
      {
        id: "5.24",
        ref: "9.4.1.A",
        title: "COTES SILENTBLOCS",
        rows: [
          ["124", "Dureté caoutchouc silentbloc moteur (Shore A)", "65", "60", "70", "pts", "Duromètre Shore A", "C", "1.6.124"],
          ["125", "Déformation silentbloc sous charge 500 kg", "15", "10", "20", "%", "Comparateur + presse", "C", "1.6.125"],
          ["126", "Fissuration caoutchouc (surface)", "0", "0", "5", "%", "Visuel + règle", "B", "1.6.126"],
          ["127", "Couple serrage boulons silentbloc (M20)", "340", "320", "360", "Nm", "Clé dyna 1/2\"", "A", "1.6.127"]
        ],
        prep: "moteur éteint et sécurisé, nettoyer le caoutchouc des dépôts de graisse",
        pos: "appliquer le duromètre Shore A perpendiculairement sur la face caoutchouc",
        mesure: "mesurer l'enfoncement, la dureté et inspecter la présence de craquelures structurelles",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-CHAS-D",
        dec: "si hors tolérance → panne Pan. 9.4.1.A → arbre décision AD-024",
        diagnostic: {
          panne: "Tassement ou craquelure des supports moteur (vibrations)",
          ref: "Pan. 9.4.1.A",
          arbre: "AD-024",
          action: "Remplacement complet du jeu de silentblocs moteur"
        }
      }
    ]
  },
  {
    title: "SECTION F — RCS / ÉLECTRONIQUE",
    id: "cote-section-F",
    tables: [
      {
        id: "5.25",
        ref: "6.1.1.A",
        title: "COTES ÉCRAN ET AFFICHAGE",
        rows: [
          ["128", "Tension alimentation écran RCS", "12", "11,5", "12,5", "V", "Multimètre", "B", "1.5.128"],
          ["129", "Consommation écran (rétroéclairage max)", "2,5", "2,0", "3,0", "A", "Pince ampèremétrique", "B", "1.5.129"],
          ["130", "Luminosité écran (min lisible)", "400", "350", "450", "cd/m²", "Luxmètre", "C", "1.5.130"],
          ["131", "Temps réponse tactile", "50", "30", "70", "ms", "Chronomètre haute vitesse", "C", "1.5.131"]
        ],
        prep: "allumer le tableau de commande électrique RCS en cabine",
        pos: "placer le multimètre sur les bornes d'entrée d'alimentation arrière de l'afficheur",
        mesure: "mesurer la tension, l'intensité maximale de courant et la latence tactile",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-ELEC-A",
        dec: "si hors tolérance → panne Pan. 6.1.1.A → arbre décision AD-025",
        diagnostic: {
          panne: "Afficheur éteint ou tactile insensible / Surtension",
          ref: "Pan. 6.1.1.A",
          arbre: "AD-025",
          action: "Remplacement de l'unité d'affichage ou contrôle du régulateur DC/DC"
        }
      },
      {
        id: "5.26",
        ref: "6.2.1.A",
        title: "COTES CAPTEURS RCS",
        rows: [
          ["132", "Tension capteur analogique (sortie)", "4-20", "4", "20", "mA", "Multimètre", "B", "1.5.132"],
          ["133", "Précision capteur pression hydraulique", "0,5", "0,3", "0,7", "% FS", "Calibreur", "C", "1.5.133"],
          ["134", "Résolution module entrée analogique", "12", "—", "12", "bits", "Testeur RCS", "C", "1.5.134"],
          ["135", "Temps de rafraîchissement CAN J1939", "50", "40", "60", "ms", "Analyseur bus CAN", "B", "1.5.135"],
          ["136", "Isolation galvanique entrées", "1000", "500", "—", "V DC", "Testeur isolation", "C", "1.5.136"]
        ],
        prep: "mettre le contact machine sans démarrer le moteur thermique",
        pos: "insérer le multimètre en série sur la ligne de signal de courant du transmetteur",
        mesure: "relever l'intensité de boucle (mA) au repos et tester le rafraîchissement CAN",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-ELEC-B",
        dec: "si hors tolérance → panne Pan. 6.2.1.A → arbre décision AD-026",
        diagnostic: {
          panne: "Erreur d'acquisition ou perte de mesure sur l'écran",
          ref: "Pan. 6.2.1.A",
          arbre: "AD-026",
          action: "Changement du capteur de pression ou contrôle du câblage"
        }
      },
      {
        id: "5.27",
        ref: "7.1.3.A",
        title: "COTES ALIMENTATION ÉLECTRIQUE",
        rows: [
          ["137", "Tension batterie principale (moteur arrêt)", "24", "23", "25", "V", "Multimètre", "B", "1.5.137"],
          ["138", "Tension batterie (moteur tournant)", "28", "27", "29", "V", "Multimètre", "B", "1.5.138"],
          ["139", "Tension convertisseur 24V→12V", "12", "11,5", "12,5", "V", "Multimètre", "B", "1.5.139"],
          ["140", "Rendement convertisseur DC/DC", "90", "85", "95", "%", "Wattmètre", "C", "1.5.140"]
        ],
        prep: "couper le moteur depuis 2 heures pour stabiliser les batteries",
        pos: "ouvrir le compartiment de stockage des batteries de démarrage",
        mesure: "relever la tension batterie à vide puis mesurer la tension en phase de charge",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-ELEC-C",
        dec: "si hors tolérance → panne Pan. 7.1.3.A → arbre décision AD-027",
        diagnostic: {
          panne: "Défaut de charge batterie / Coupure électrique générale",
          ref: "Pan. 7.1.3.A",
          arbre: "AD-027",
          action: "Remplacement de l'alternateur de charge ou du parc de batteries"
        }
      }
    ]
  },
  {
    title: "SECTION G — GÉNÉRAL / MACHINE",
    id: "cote-section-G",
    tables: [
      {
        id: "5.28",
        ref: "10.4.1.A",
        title: "COTES LOAD WEIGHING",
        rows: [
          ["141", "Précision pesage (charge nominale)", "1", "0,5", "2", "%", "Bloc étalon 7000 kg", "B", "1.5.141"],
          ["142", "Linéarité pesage (0-7000 kg)", "0,5", "0", "1", "%", "3 blocs étalons", "C", "1.5.142"],
          ["143", "Temps stabilisation affichage poids", "2", "1", "3", "s", "Chronomètre", "B", "1.5.143"],
          ["144", "Dérive zéro (24h, température constante)", "0", "0", "50", "kg", "Bloc étalon", "C", "1.5.144"]
        ],
        prep: "lubrifier les pivots mécaniques et tarer à vide le système d'indication de charge",
        pos: "placer le godet de pesée à hauteur de référence d'analyse",
        mesure: "soulever le bloc étalon étiqueté de 7000 kg et relever le poids",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-GEN-A",
        dec: "si hors tolérance → panne Pan. 10.4.1.A → arbre décision AD-028",
        diagnostic: {
          panne: "Erreur de comptage du tonnage / Écarts de production",
          ref: "Pan. 10.4.1.A",
          arbre: "AD-028",
          action: "Calibration complète des capteurs d'axe de pesée sur le RCS"
        }
      },
      {
        id: "5.29",
        ref: "8.1.1.A",
        title: "COTES TÉLÉCOMMANDE RRC",
        rows: [
          ["145", "Portée RRC (ligne directe)", "100", "80", "120", "m", "Mesure terrain", "C", "1.5.145"],
          ["146", "Latence commande RRC (joystick → action)", "100", "50", "150", "ms", "Chronomètre + caméra", "B", "1.5.146"],
          ["147", "Tension batterie télécommande", "7,2", "6,8", "7,6", "V", "Multimètre", "B", "1.5.147"],
          ["148", "Temps autonomie batterie RRC", "8", "6", "10", "h", "Test décharge", "C", "1.5.148"]
        ],
        prep: "charger complètement la batterie de l'émetteur radiocommandé",
        pos: "se placer dans l'axe de vision direct de la machine réceptrice",
        mesure: "reculer progressivement jusqu'à 80 m et mesurer la réactivité de réponse",
        reg: "noter la valeur sur la fiche contrôle QC-2024-ST7-GEN-B",
        dec: "si hors tolérance → panne Pan. 8.1.1.A → arbre décision AD-029",
        diagnostic: {
          panne: "Perte de liaison radio / Latence dangereuse en commande",
          ref: "Pan. 8.1.1.A",
          arbre: "AD-029",
          action: "Vérifier le module récepteur ou remplacer la batterie de l'émetteur"
        }
      },
      {
        id: "5.30",
        ref: "GÉNÉRAL",
        title: "COTES DE NIVEAU ET REMPLISSAGE",
        rows: [
          ["149", "Niveau huile moteur (jauge, moteur horizontal froid)", "Max", "Min", "Max", "mm", "Jauge", "B", "Général"],
          ["150", "Niveau huile hydraulique (réservoir, machine à plat)", "80", "70", "90", "%", "Jauge / voyant", "B", "Général"],
          ["151", "Niveau liquide refroidissement (vase expansion)", "50", "40", "60", "%", "Jauge", "B", "Général"],
          ["152", "Niveau huile frein (réservoir séparé)", "Max", "Min", "Max", "mm", "Jauge visuelle", "B", "Général"]
        ],
        prep: "garer la machine à plat, couper le moteur et laisser décanter l'huile 15 min",
        pos: "accéder aux différents voyants ou jauges manuelles de vérification",
        mesure: "relever les hauteurs d'huile et pourcentages de liquide de refroidissement",
        reg: "noter la valeur sur la fiche d'inspection journalière",
        dec: "si hors tolérance → panne Pan. Générale → arbre décision AD-Général",
        diagnostic: {
          panne: "Manque de fluide vital / Risque de grippage moteur ou pompe",
          ref: "Pan. Générale",
          arbre: "AD-Général",
          action: "Appoint immédiat avec le type de lubrifiant d'origine agréé"
        }
      }
    ]
  }
];

export function AssistantEpirocSt7() {
  const { activeSite } = useAuthStore();

  // ⚙️ Operating Modes: DEP (Dépannage), APP (Apprentissage), CHF (Chef d'équipe), ECO (Monospace ÉCO)
  const [mode, setMode] = React.useState<"DEP" | "APP" | "CHF" | "ECO">("DEP");

  // 🚨 Emergency Mode: Show only high severity (ROUGE) pannes
  const [isEmergencyActive, setIsEmergencyActive] = React.useState(false);

  // 📖 Guide démarrage overlay (3 steps)
  const [guideStep, setGuideStep] = React.useState<number | null>(() => {
    const closed = localStorage.getItem("epiroc_st7_guide_closed");
    return closed ? null : 1;
  });

  // 📂 Navigation Tab group state
  const [activeTab, setActiveTab] = React.useState<string>("dashboard");

  // State for the interactive tab explanation guide
  const [activeTabGuide, setActiveTabGuide] = React.useState<{ tabId: string; step: number } | null>(null);

  // Reset tab guide step to 1 when tab changes, only showing it if it hasn't been shown in the last 7 days
  React.useEffect(() => {
    const key = `guide_shown_st7_${activeTab}`;
    const lastShown = localStorage.getItem(key);
    const now = Date.now();
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    
    if (!lastShown || now - parseInt(lastShown, 10) > oneWeekInMs) {
      setActiveTabGuide({ tabId: activeTab, step: 1 });
      localStorage.setItem(key, now.toString());
    } else {
      setActiveTabGuide(null);
    }
  }, [activeTab]);

  // 🔍 Search and filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSystem, setSelectedSystem] = React.useState("TOUS");
  const [selectedSeverity, setSelectedSeverity] = React.useState("TOUS");

  // 📦 LocalStorage Persistent stocks
  const [stocks, setStocks] = React.useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem("epiroc_st7_stock_qty");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    const defaults: { [key: string]: number } = {};
    Object.keys(EPIROC_ST7_STOCK).forEach(key => {
      defaults[key] = (EPIROC_ST7_STOCK as any)[key].qty;
    });
    return defaults;
  });

  React.useEffect(() => {
    localStorage.setItem("epiroc_st7_stock_qty", JSON.stringify(stocks));
  }, [stocks]);

  React.useEffect(() => {
    const ouvrir = () => {
      const section = document.getElementById('section-cahier');
      const standard = document.getElementById('contenu-st7-standard');
      if (section) section.style.display = 'block';
      if (standard) standard.style.display = 'none';
      window.scrollTo(0, 0);
    };
    const fermer = () => {
      const section = document.getElementById('section-cahier');
      const standard = document.getElementById('contenu-st7-standard');
      if (section) section.style.display = 'none';
      if (standard) standard.style.display = 'block';
    };
    const scrollTo = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    (window as any).ouvrirCahier = ouvrir;
    (window as any).fermerCahier = fermer;
    (window as any).scrollToChapitre = scrollTo;

    const handleBeforeUnload = () => {
      localStorage.setItem('cahier-scroll', window.scrollY.toString());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const updateStockQty = (key: string, delta: number) => {
    setStocks(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  // 📋 Disassembly and Maintenance task trackers
  const [procProgress, setProcProgress] = React.useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("epiroc_st7_proc_progress");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {};
  });

  const toggleProcStep = (procId: string, index: number) => {
    const key = `${procId}_${index}`;
    setProcProgress(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("epiroc_st7_proc_progress", JSON.stringify(updated));
      return updated;
    });
  };

  // 🔒 Lock Out Tag Out (LOTO) step-by-step
  const [lotoProgress, setLotoProgress] = React.useState<{ [key: number]: boolean }>(() => {
    const saved = localStorage.getItem("epiroc_st7_loto_progress");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {};
  });

  const toggleLotoStep = (idx: number) => {
    setLotoProgress(prev => {
      const updated = { ...prev, [idx]: !prev[idx] };
      localStorage.setItem("epiroc_st7_loto_progress", JSON.stringify(updated));
      return updated;
    });
  };

  // 📋 Preventative maintenance checklist
  const [maintProgress, setMaintProgress] = React.useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("epiroc_st7_maint_progress");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {};
  });

  const toggleMaintStep = (key: string) => {
    setMaintProgress(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("epiroc_st7_maint_progress", JSON.stringify(updated));
      return updated;
    });
  };

  // ✍️ Interventions Form State
  const [formState, setFormState] = React.useState({
    date: new Date().toISOString().split("T")[0],
    machineHours: "",
    mecoName: "",
    level: "1",
    parkNo: "ST7-001",
    symptom: "",
    context: "Démarrage",
    spnCode: "",
    rcsCode: "",
    panneNo: "",
    repaired: "oui",
    partsUsed: "",
    diagTime: "",
    repairTime: "",
    downTime: "",
    partsWaitTime: "",
    rcsCalibrated: "Non",
    testsValidated: "Non",
    comments: "",
    validationSigned: false,
    supervisorSigned: false
  });

  // 📋 Interventions History
  const [interventionHistory, setInterventionHistory] = React.useState<any[]>(() => {
    const saved = localStorage.getItem("epiroc_st7_interventions_history");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const submitInterventionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.mecoName || !formState.machineHours || !formState.parkNo) {
      alert("⚠️ Erreur : Veuillez remplir le nom du mécanicien, les heures machine et le numéro de parc.");
      return;
    }
    const newRecord = {
      id: Date.now(),
      ...formState
    };
    const updatedHistory = [newRecord, ...interventionHistory].slice(0, 10);
    setInterventionHistory(updatedHistory);
    localStorage.setItem("epiroc_st7_interventions_history", JSON.stringify(updatedHistory));
    
    // Reset inputs
    setFormState(prev => ({
      ...prev,
      machineHours: "",
      symptom: "",
      spnCode: "",
      rcsCode: "",
      panneNo: "",
      partsUsed: "",
      diagTime: "",
      repairTime: "",
      downTime: "",
      partsWaitTime: "",
      comments: "",
      validationSigned: false,
      supervisorSigned: false
    }));
    alert("✅ Fiche d'intervention enregistrée localement dans le tableau d'historique !");
  };

  const deleteInterventionRecord = (id: number) => {
    if (window.confirm("Supprimer définitivement cette fiche d'intervention ?")) {
      const updated = interventionHistory.filter(r => r.id !== id);
      setInterventionHistory(updated);
      localStorage.setItem("epiroc_st7_interventions_history", JSON.stringify(updated));
    }
  };

  // 🔄 Symptom search triggered from index click
  const triggerSymptomSearch = (tag: string) => {
    setSearchQuery(tag);
    setActiveTab("pannes_detaillees");
    // Scroll smoothly to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🌳 Interactive Diagnostic Tree State
  const [currentTree, setCurrentTree] = React.useState<number | null>(null);
  const [treeHistory, setTreeHistory] = React.useState<string[]>([]);
  const [treeAnswerText, setTreeAnswerText] = React.useState<string>("");

  const handleTreeChoice = (questionId: string, answerLabel: string, nextAction: string) => {
    setTreeHistory(prev => [...prev, `${questionId}: ${answerLabel}`]);
    setTreeAnswerText(nextAction);
  };

  const resetTree = () => {
    setTreeHistory([]);
    setTreeAnswerText("");
  };

  // Filtered pannes list based on filters
  const filteredPannes = React.useMemo(() => {
    return EPIROC_ST7_PANNES.filter(p => {
      if (isEmergencyActive && p.severity !== "ROUGE") return false;
      if (selectedSystem !== "TOUS" && p.system !== selectedSystem) return false;
      if (selectedSeverity !== "TOUS" && p.severity !== selectedSeverity) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesSymptoms = p.symptoms.toLowerCase().includes(query);
        const matchesCause = p.cause.toLowerCase().includes(query);
        const matchesAction = p.action.toLowerCase().includes(query);
        const matchesId = p.id.toLowerCase().includes(query);
        return matchesId || matchesTitle || matchesSymptoms || matchesCause || matchesAction;
      }
      return true;
    });
  }, [isEmergencyActive, selectedSystem, selectedSeverity, searchQuery]);

  // Close guide
  const closeGuide = () => {
    localStorage.setItem("epiroc_st7_guide_closed", "true");
    setGuideStep(null);
  };

  // Color mappings per system
  const getSystemColorAndShape = (sysId: string) => {
    const sys = EPIROC_ST7_SYSTEMS.find(s => s.id === sysId);
    return sys ? { color: sys.color, shape: sys.shape, label: sys.label } : { color: "#FFF", shape: "⚙️", label: "Général" };
  };

  // Helper data for the tab guides
  const getGuideTabName = (tabId: string) => {
    switch (tabId) {
      case "dashboard": return "Dashboard";
      case "fiche_identité": return "Identité & Hotspots";
      case "pannes_detaillees": return "Pannes & Codes";
      case "arbres_decision": return "Arbres de Décision";
      case "procedures_demontage": return "Procédures LOTO";
      case "pieces_stock": return "Stock & Consommables";
      case "suivi_intervention": return "Fiches Suivi";
      case "securite_urgences": return "Urgences & Sécurité";
      default: return "Guide";
    }
  };

  const getGuideTotalSteps = (tabId: string) => {
    return 2; // All tabs have 2 elegant steps
  };

  const getGuideStepTitle = (tabId: string, step: number) => {
    if (tabId === "dashboard") {
      return step === 1 ? "🎛️ Dashboard - Métriques Globales" : "📊 Alertes Prédictives RCS & Recherche";
    }
    if (tabId === "fiche_identité") {
      return step === 1 ? "📋 Spécifications Techniques ST7" : "🗺️ Hotspots & Organes Interactifs";
    }
    if (tabId === "pannes_detaillees") {
      return step === 1 ? "🔧 Base de Pannes (90+ fiches)" : "🛠️ Procédures de Résolution pas-à-pas";
    }
    if (tabId === "arbres_decision") {
      return step === 1 ? "🌳 Logique d'Arbre de Décision" : "📝 Diagnostic Guidé Interactif";
    }
    if (tabId === "procedures_demontage") {
      return step === 1 ? "⚙️ Sécurité Absolue (Consignation LOTO)" : "🔧 Procédures de Dépose d'Organes";
    }
    if (tabId === "pieces_stock") {
      return step === 1 ? "📦 Magasin Mine & Consommables" : "🔄 Équivalences & Références Croisées";
    }
    if (tabId === "suivi_intervention") {
      return step === 1 ? "✍️ Enregistrement d'Activité" : "📂 Historique & Traçabilité Locale";
    }
    if (tabId === "securite_urgences") {
      return step === 1 ? "🆘 Protocoles d'Urgences Souterraines" : "📞 Contacts & Escalade d'Incidents";
    }
    return "";
  };

  const getGuideStepText = (tabId: string, step: number) => {
    if (tabId === "dashboard") {
      return step === 1 
        ? "Consultez un résumé en temps réel de l'état du Scooptram ST7, incluant les indicateurs clés et les anomalies système détectées pour planifier vos interventions."
        : "Suivez les alertes prédictives du système RCS (comme l'usure de freins ou le colmatage d'air) et utilisez les raccourcis pour trouver instantanément la solution.";
    }
    if (tabId === "fiche_identité") {
      return step === 1 
        ? "Accédez aux dimensions, poids, et données des organes vitaux du ST7 (moteur Cummins QSB 6.7 de 193 ch, boîte Funk DF150, hydraulique de travail)."
        : "Cliquez sur les points chauds (cercles colorés) du plan machine interactif pour identifier la localisation exacte des composants sur le châssis.";
    }
    if (tabId === "pannes_detaillees") {
      return step === 1 
        ? "Parcourez notre base exhaustive de fiches de pannes détaillées. Utilisez les filtres par gravité (Rouge, Orange, Jaune) ou par système pour isoler le problème."
        : "Pour chaque panne, l'assistant vous fournit les symptômes physiques, les causes racines probables, et l'action corrective rigoureuse à appliquer sur le terrain.";
    }
    if (tabId === "arbres_decision") {
      return step === 1 
        ? "Résolvez les pannes complexes d'origine électrique ou hydraulique grâce à un diagnostic guidé par arbre logique conçu par nos experts."
        : "Répondez simplement aux questions physiques (Oui/Non, mesures de pression ou tension) pour que l'assistant cerne précisément le composant défaillant.";
    }
    if (tabId === "procedures_demontage") {
      return step === 1 
        ? "La sécurité est absolue sous terre. Suivez rigoureusement la check-list interactive de consignation d'énergie (LOTO) avant d'entamer vos réparations."
        : "Consultez les étapes détaillées pour la dépose et la pose sécurisée d'organes lourds (groupe motopropulseur, vérins d'articulation ou accumulateurs).";
    }
    if (tabId === "pieces_stock") {
      return step === 1 
        ? "Vérifiez en temps réel les niveaux du stock magasin pour le ST7 (filtres d'origine, joints de nez, flexibles de rechange) et ajustez les quantités après utilisation."
        : "Trouvez instantanément les références d'origine Epiroc et les équivalences d'autres fabricants (Donaldson, Baldwin) pour éviter tout blocage d'approvisionnement.";
    }
    if (tabId === "suivi_intervention") {
      return step === 1 
        ? "Saisissez votre rapport numérique d'intervention directement depuis votre mobile ou tablette après chaque dépannage ou maintenance préventive."
        : "Consultez l'historique local des 10 dernières interventions pour assurer la traçabilité des opérations et faciliter les transmissions de consignes.";
    }
    if (tabId === "securite_urgences") {
      return step === 1 
        ? "Révisez les consignes de sécurité vitales en cas d'incendie, d'émanation thermique de batterie ou de rupture de flexibles hydrauliques à haute pression."
        : "Accédez immédiatement aux coordonnées d'urgence des sauveteurs secouristes miniers (SSM) et de l'assistance technique Epiroc.";
    }
    return "";
  };

  const isEco = mode === "ECO";

  return (
    <div className={`w-full min-h-screen bg-slate-50 text-slate-900 font-sans ${isEco ? 'contrast-125' : ''} select-none`}>
      
      {/* 🚀 BANNER HERO */}
      <div className="p-4 md:p-6 pb-0 print:hidden">
        <PageBanner
          icon={Wrench}
          badgeLabel="COMPAGNON DE TERRAIN HORS-LIGNE"
          title="Epiroc Scooptram ST7"
          subtitle="Chargeuse Souterrain LHD • Cummins QSB 6.7 • Funk DF150"
          siteLabel={activeSite === 'TOUS' ? 'TOUS LES SITES' : activeSite}
          logo={<HydrominesLogo size={110} variant="full" className="mb-1" />}
        >
          {/* SÉLECTEUR DE MODE ULTRA CRITIQUE */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 items-center gap-1">
            <button 
              onClick={() => { setMode("DEP"); }} 
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${mode === "DEP" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Dépannage direct terrain"
            >
              🛠️ DEP
            </button>
            <button 
              onClick={() => { setMode("APP"); }} 
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${mode === "APP" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Apprentissage explicatif"
            >
              🎓 APP
            </button>
            <button 
              onClick={() => { setMode("CHF"); }} 
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${mode === "CHF" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Suivi administratif Chef"
            >
              👨‍✈️ CHEF
            </button>
            <button 
              onClick={() => { setMode("ECO"); }} 
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${mode === "ECO" ? "bg-slate-900 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
              title="Mode ÉCO contraste maximal sans images"
            >
              🔋 ÉCO
            </button>
          </div>

          {/* TOGGLE URGENCE CRITIQUE */}
          <button
            onClick={() => setIsEmergencyActive(!isEmergencyActive)}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              isEmergencyActive 
                ? "bg-red-600 text-white animate-pulse border border-white shadow-sm" 
                : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>{isEmergencyActive ? "🚨 CRITIQUE ACTIF" : "⚠️ URGENCE"}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 flex items-center justify-center cursor-pointer transition-all shadow-sm"
            title="Imprimer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </PageBanner>
      </div>

      {/* ⚠️ BANDEAU URGENCE ACTIVE */}
      {isEmergencyActive && (
        <div className="bg-red-700 text-white font-black text-xs uppercase text-center py-2 px-4 flex items-center justify-center gap-2 animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>Filtre d'arrêt immédiat actif : seuls les organes critiques (Rouge ▲) s'affichent !</span>
          <button onClick={() => setIsEmergencyActive(false)} className="underline ml-4 bg-red-900 px-2 py-0.5 rounded text-[10px]">Désactiver</button>
        </div>
      )}

      {/* 📖 GUIDE DÉMARRAGE OVERLAY */}
      {guideStep !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Étape {guideStep} sur 3</span>
              <button onClick={closeGuide} className="text-xs text-slate-400 hover:text-white uppercase font-bold">Passer ✕</button>
            </div>
            
            {guideStep === 1 && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-white">🔍 Recherche de Symptômes</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tu as une panne sur le ST7 ? Tape le symptôme direct (ex: "fumée noire", "RCS-T01", "frein") ou utilise l'Index de symptômes physiques inversé.
                </p>
              </div>
            )}
            {guideStep === 2 && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-white">🚨 Mode Urgence Direct</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pas de temps à perdre ? Active le bouton rouge d'urgence en haut à droite. Il élimine le superflu et ne montre que le critique.
                </p>
              </div>
            )}
            {guideStep === 3 && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-white">🎓 Explications du vieux</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pour apprendre et comprendre le fonctionnement des organes (V-tube core, Funk DF150, SAHR force-cooled), active le mode Apprentissage.
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              {guideStep > 1 ? (
                <button 
                  onClick={() => setGuideStep(prev => prev! - 1)} 
                  className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-lg"
                >
                  Précédent
                </button>
              ) : <div />}
              
              {guideStep < 3 ? (
                <button 
                  onClick={() => setGuideStep(prev => prev! + 1)} 
                  className="px-5 py-2.5 bg-amber-500 text-black text-xs font-black rounded-lg"
                >
                  Suivant
                </button>
              ) : (
                <button 
                  onClick={closeGuide} 
                  className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-black rounded-lg"
                >
                  Compris ! Ouvrir l'Assistant
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div id="contenu-st7-standard" className="block">
        {/* 🧭 NAVIGATION DES ONGLETS PRINCIPAUX */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mx-4 mb-4 print:hidden">
          <div className="bg-slate-100 border-b border-slate-200 p-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1.5 md:gap-2 rounded-xl shadow-sm w-full lg:w-auto flex-1">
            {[
              { id: "dashboard", label: "🎛️ Dashboard", desc: "Widgets & Vue globale" },
              { id: "fiche_identité", label: "📋 Identité & Hotspots", desc: "Fiche technique machine" },
              { id: "pannes_detaillees", label: "🔧 Pannes & Codes (90+)", desc: "Dépannage pas-à-pas" },
              { id: "arbres_decision", label: "🌳 Arbres de Décision", desc: "Arbres logiques interactifs" },
              { id: "procedures_demontage", label: "⚙️ Procédures LOTO", desc: "Consignation & Démontage" },
              { id: "pieces_stock", label: "📦 Stock & Consommables", desc: "Magasin Mine & Equivalences" },
              { id: "suivi_intervention", label: "✍️ Fiches Suivi", desc: "Saisie d'activité terrain" },
              { id: "securite_urgences", label: "🆘 Urgences & Sécu", desc: "Protocoles vitaux" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setActiveTabGuide({ tabId: tab.id, step: 1 }); }}
                className={`px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                  activeTab === tab.id 
                    ? (isEco ? "bg-black text-white border-black" : "bg-amber-500 text-slate-900 border-amber-600 shadow-sm") 
                    : (isEco ? "bg-white text-slate-900 border-slate-400" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900")
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <button id="btn-cahier-visuel" className="btn-cahier-visuel shrink-0 w-full lg:w-auto" onClick={() => (window as any).ouvrirCahier()}>
            <span className="icon-cahier">📐</span>
            <span className="text-cahier text-xs lg:text-sm font-black whitespace-nowrap">CAHIER DES CHARGES VISUEL</span>
            <span className="badge-cahier">⭐</span>
          </button>
        </div>

      {/* 🧭 TAB GUIDE OVERLAY */}
      {activeTabGuide && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase">
                Guide : {getGuideTabName(activeTabGuide.tabId)} (Étape {activeTabGuide.step} sur {getGuideTotalSteps(activeTabGuide.tabId)})
              </span>
              <button 
                onClick={() => setActiveTabGuide(null)} 
                className="text-xs text-slate-400 hover:text-slate-600 uppercase font-bold cursor-pointer"
              >
                Passer ✕
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm md:text-base font-black text-slate-900">
                {getGuideStepTitle(activeTabGuide.tabId, activeTabGuide.step)}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {getGuideStepText(activeTabGuide.tabId, activeTabGuide.step)}
              </p>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-6">
              {activeTabGuide.step > 1 ? (
                <button 
                  onClick={() => setActiveTabGuide(prev => prev ? { ...prev, step: prev.step - 1 } : null)} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Précédent
                </button>
              ) : <div />}
              
              {activeTabGuide.step < getGuideTotalSteps(activeTabGuide.tabId) ? (
                <button 
                  onClick={() => setActiveTabGuide(prev => prev ? { ...prev, step: prev.step + 1 } : null)} 
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black rounded-lg cursor-pointer shadow-sm"
                >
                  Continuer
                </button>
              ) : (
                <button 
                  onClick={() => setActiveTabGuide(null)} 
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg cursor-pointer shadow-sm"
                >
                  Ouvrir l'onglet
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ---------------------------------------------------- */}
        {/* TAB 0: DASHBOARD */}
        {/* ---------------------------------------------------- */}
        {activeTab === "dashboard" && (
          <div className="col-span-12 space-y-6">
            
            {/* SEARCH AND QUICK FILTERS WIDGET */}
            <div className={`p-6 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} shadow-xl relative overflow-hidden`}>
              <HydrominesIdentity isEco={isEco} />
              <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-500" />
                Moteur de Recherche Technique ST7
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tape un symptôme, un bruit, un code Cummins (SPN/FMI), un code RCS, une pièce..."
                  className={`w-full py-4 pl-12 pr-4 text-sm font-bold rounded-xl outline-none focus:ring-2 focus:ring-amber-500/40 ${
                    isEco ? "border-2 border-slate-300 bg-slate-50 text-black" : "border border-slate-800 bg-[#000000] text-white"
                  }`}
                />
                <Search className="absolute left-4 top-4.5 w-5 h-5 text-slate-500" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")} 
                    className="absolute right-4 top-3.5 bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-md"
                  >
                    Effacer
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Raccourcis :</span>
                {[
                  { label: "🔥 Cummins QSB", query: "Cummins" },
                  { label: "🟪 Funk DF150", query: "Funk" },
                  { label: "🟨 Rexroth A10VO", query: "Rexroth" },
                  { label: "🛑 Code RCS-B01", query: "RCS-B01" },
                  { label: "🚪 Door Interlock", query: "interlock" },
                  { label: "▲ Chute Pression Huile", query: "huile" }
                ].map((tag) => (
                  <button
                    key={tag.label}
                    onClick={() => { setSearchQuery(tag.query); setActiveTab("pannes_detaillees"); }}
                    className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                      isEco ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800" : "border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MAIN DASHBOARD WIDGETS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* ALERTES MAINTENANCE PRÉDICTIVES */}
              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} relative overflow-hidden`}>
                <HydrominesIdentity isEco={isEco} />
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Alertes Prédictives RCS ST7
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl flex items-start gap-2">
                    <span className="text-red-500 font-bold shrink-0">▲</span>
                    <div>
                      <p className="font-bold text-white">ST7-001 : Brake test failed hier</p>
                      <p className="text-[10px] text-slate-400">Usure disques suspectée. Inspection requise.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-950/30 border border-yellow-900/40 rounded-xl flex items-start gap-2">
                    <span className="text-yellow-500 font-bold shrink-0">◆</span>
                    <div>
                      <p className="font-bold text-white">Capteur colmatage filtre air à 80%</p>
                      <p className="text-[10px] text-slate-400">Planifier le changement dans les 20h.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">◼</span>
                    <div>
                      <p className="font-bold text-white">Cycle graissage Auto-Lube OK</p>
                      <p className="text-[10px] text-slate-400">Aucun point sec détecté par les capteurs.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TOP 5 PANNES FRÉQUENTES ST7 */}
              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} relative overflow-hidden`}>
                <HydrominesIdentity isEco={isEco} />
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Top Pannes Fréquentes ST7
                </h4>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                    <span className="text-slate-300">1. Capteur filtre air colmaté</span>
                    <span className="bg-red-900/40 text-red-400 px-2 py-0.5 rounded text-[10px] font-black">25%</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                    <span className="text-slate-300">2. Traction control défectueux</span>
                    <span className="bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded text-[10px] font-black">18%</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                    <span className="text-slate-300">3. Ride control inerte</span>
                    <span className="bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded text-[10px] font-black">15%</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                    <span className="text-slate-300">4. Capteur Door Interlock déréglé</span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-black">12%</span>
                  </div>
                </div>
              </div>

              {/* TRAVAUX EN COURS */}
              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} relative overflow-hidden`}>
                <HydrominesIdentity isEco={isEco} />
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Chantier & Activité
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="font-bold text-amber-500">ST7-002 : Attente Pièce</span>
                    <p className="text-[11px] text-slate-400 mt-1">Pompe Rexroth A10VO en commande chez SOU-MAG Stock.</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="font-bold text-emerald-500">ST7-001 : Maintenance 250h</span>
                    <p className="text-[11px] text-slate-400 mt-1">Checklist d'entretien démarrée par Yahya (Mécano).</p>
                  </div>
                </div>
              </div>

            </div>

            {/* INDEX SYMPTÔMES INVERSÉ */}
            <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} relative overflow-hidden`}>
              <HydrominesIdentity isEco={isEco} />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                24. Index Recherche Rapide par Symptôme Physique
              </h3>
              <p className="text-xs text-slate-400 mb-4 font-semibold">
                Touchez un symptôme observé sur le terrain pour identifier immédiatement la fiche technique correspondante :
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(EPIROC_ST7_SYMPTOMS_INDEX).map(([category, items]) => (
                  <div key={category} className="space-y-2 border-r last:border-0 border-slate-900 pr-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block border-b border-slate-900 pb-1">
                      {category}
                    </span>
                    <div className="space-y-1">
                      {items.map((item) => {
                        const code = item.split(" ")[0];
                        const text = item.substring(item.indexOf(" ") + 1);
                        return (
                          <button
                            key={item}
                            onClick={() => triggerSymptomSearch(code)}
                            className="w-full text-left p-1.5 rounded hover:bg-slate-900 text-[11px] font-semibold text-slate-300 hover:text-white transition-all flex justify-between items-center"
                          >
                            <span className="truncate mr-1">{text}</span>
                            <span className="font-mono text-[9px] bg-slate-800 px-1 py-0.5 rounded text-amber-500 font-bold">{code}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: FICHE IDENTITÉ & HOTSPOTS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "fiche_identité" && (
          <div className="col-span-12 space-y-6">
            
            <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"}`}>
              <h3 className="text-sm font-black uppercase tracking-wider mb-2">1. Fiche d'Identité & Zones Cliquables ST7</h3>
              <p className="text-xs text-slate-400 mb-6 font-semibold">
                La machine de 21 tonnes à 800 000€ requiert une connaissance parfaite des organes majeurs :
              </p>

              {/* INTERACTIVE HOTSPOTS MAP */}
              <div className="relative overflow-hidden w-full bg-[#000000] rounded-xl p-4 border border-slate-800 flex justify-center">
                <svg viewBox="0 0 820 300" className="w-full max-w-3xl font-mono text-[9px] font-black select-none text-white">
                  {/* Châssis */}
                  <rect x="420" y="100" width="220" height="90" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
                  <rect x="220" y="100" width="160" height="90" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
                  <rect x="380" y="115" width="40" height="60" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
                  
                  {/* Godet & Boom */}
                  <path d="M 40 190 L 130 190 L 170 110 L 130 80 L 115 80 L 105 110 Z" fill="#EF6C00" opacity="0.8" stroke="#EF6C00" strokeWidth="3" />
                  <path d="M 140 140 L 250 115 L 250 140 Z" fill="none" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
                  
                  {/* Roues */}
                  <circle cx="280" cy="210" r="45" fill="#020617" stroke="#334155" strokeWidth="10" />
                  <circle cx="560" cy="210" r="45" fill="#020617" stroke="#334155" strokeWidth="10" />
                  
                  {/* Cabine */}
                  <rect x="390" y="40" width="80" height="65" rx="6" fill="#0f172a" stroke="#EF6C00" strokeWidth="2" />

                  {/* Hotspots clickable */}
                  <g className="cursor-pointer" onClick={() => triggerSymptomSearch("Cummins")}>
                    <circle cx="540" cy="140" r="18" fill="#2E7D32" opacity="0.6" className="animate-pulse" />
                    <text x="540" y="143" fill="white" textAnchor="middle" fontWeight="black" fontSize="11">A</text>
                    <text x="540" y="170" fill="#2E7D32" textAnchor="middle" fontWeight="black">◼ CUMMINS</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => triggerSymptomSearch("Funk")}>
                    <circle cx="450" cy="140" r="18" fill="#6A1B9A" opacity="0.6" className="animate-pulse" />
                    <text x="450" y="143" fill="white" textAnchor="middle" fontWeight="black" fontSize="11">B</text>
                    <text x="450" y="170" fill="#6A1B9A" textAnchor="middle" fontWeight="black">⬢ FUNK</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => triggerSymptomSearch("Rexroth")}>
                    <circle cx="340" cy="140" r="18" fill="#F9A825" opacity="0.6" className="animate-pulse" />
                    <text x="340" y="143" fill="white" textAnchor="middle" fontWeight="black" fontSize="11">C</text>
                    <text x="340" y="170" fill="#F9A825" textAnchor="middle" fontWeight="black">◆ HYD</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => triggerSymptomSearch("RCS")}>
                    <circle cx="430" cy="70" r="18" fill="#212121" opacity="0.6" className="animate-pulse" stroke="#fff" />
                    <text x="430" y="73" fill="white" textAnchor="middle" fontWeight="black" fontSize="11">D</text>
                    <text x="430" y="32" fill="#fff" textAnchor="middle" fontWeight="black">✚ CABINE/RCS</text>
                  </g>

                  <g className="cursor-pointer" onClick={() => triggerSymptomSearch("SAHR")}>
                    <circle cx="560" cy="210" r="18" fill="#C62828" opacity="0.6" className="animate-pulse" />
                    <text x="560" y="213" fill="white" textAnchor="middle" fontWeight="black" fontSize="11">E</text>
                    <text x="560" y="240" fill="#C62828" textAnchor="middle" fontWeight="black">▲ FREIN SAHR</text>
                  </g>
                </svg>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-xs">
                <div className="p-4 bg-slate-900 rounded-xl space-y-2">
                  <h4 className="font-black text-amber-500 uppercase tracking-wider">📦 Identification Machine</h4>
                  <ul className="space-y-1 font-semibold">
                    <li>• Modèle : <strong className="text-white">Epiroc Scooptram ST7</strong></li>
                    <li>• Type : <strong className="text-white">Chargeuse souterraine LHD haute performance</strong></li>
                    <li>• Capacité charge utile : <strong className="text-white">6 800 kg</strong></li>
                    <li>• Poids : <strong className="text-white">19 300 kg à 21 500 kg</strong></li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-900 rounded-xl space-y-2">
                  <h4 className="font-black text-amber-500 uppercase tracking-wider">📱 QR Codes Machine (SOU-QR)</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    6 QR codes sont rivetés directement sur les capots de l'engin pour charger instantanément les fiches d'urgences d'organes spécifiques sur mobile.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2: GLOSSAIRE */}
            <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} relative overflow-hidden`}>
              <HydrominesIdentity isEco={isEco} />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                2. Glossaire des Termes Techniques ST7 (60+ Termes)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {EPIROC_ST7_GLOSSAIRE.map((item) => (
                  <div key={item.term} className="p-3 bg-slate-900/50 rounded-xl border border-slate-900">
                    <span className="font-black text-white block text-xs tracking-wider">{item.term}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block leading-relaxed font-semibold">{item.def}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: PANNES & CODES */}
        {/* ---------------------------------------------------- */}
        {activeTab === "pannes_detaillees" && (
          <div className="col-span-12 space-y-6">
            
            {/* SEARCH AND FILTERS */}
            <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} grid grid-cols-1 md:grid-cols-3 gap-4 items-center`}>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Filtrer par Système :</label>
                <select
                  value={selectedSystem}
                  onChange={(e) => setSelectedSystem(e.target.value)}
                  className={`w-full py-2 px-3 text-xs font-bold rounded-lg border ${
                    isEco ? "bg-white text-black border-slate-300" : "bg-slate-900 text-white border-slate-800"
                  }`}
                >
                  <option value="TOUS">🌍 TOUS LES ORGANES</option>
                  {EPIROC_ST7_SYSTEMS.map((sys) => (
                    <option key={sys.id} value={sys.id}>
                      {sys.shape} {sys.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Filtrer par Gravité :</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className={`w-full py-2 px-3 text-xs font-bold rounded-lg border ${
                    isEco ? "bg-white text-black border-slate-300" : "bg-slate-900 text-white border-slate-800"
                  }`}
                >
                  <option value="TOUS">🟡 TOUTES GRAVITÉS</option>
                  <option value="ROUGE">🔴 ROUGE (Arrêt Immédiat)</option>
                  <option value="JAUNE">🟡 JAUNE (Alerte / Intervention)</option>
                  <option value="VERT">🟢 VERT (Information)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Recherche de mots-clés :</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SPN, FMI, fumée, raccord..."
                  className={`w-full py-1.5 px-3 text-xs font-bold rounded-lg border ${
                    isEco ? "bg-white text-black border-slate-300" : "bg-slate-900 text-white border-slate-800"
                  }`}
                />
              </div>
            </div>

            {/* CODES DÉFAUT REFERENCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} relative overflow-hidden`}>
                <HydrominesIdentity isEco={isEco} />
                <h4 className="text-xs font-black uppercase text-amber-500 mb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  4. Codes Défauts Cummins SPN/FMI
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {EPIROC_ST7_CUMMINS_CODES.map((item) => (
                    <div key={item.code} className="p-2 bg-slate-900 rounded-lg border border-slate-900 text-xs flex justify-between items-start gap-4">
                      <span className="font-mono text-red-400 font-bold shrink-0">{item.code}</span>
                      <span className="text-slate-300 font-semibold">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} relative overflow-hidden`}>
                <HydrominesIdentity isEco={isEco} />
                <h4 className="text-xs font-black uppercase text-amber-500 mb-3 flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  4. Codes RCS & Transmission Funk
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {EPIROC_ST7_RCS_CODES.map((item) => (
                    <div key={item.code} className="p-2 bg-slate-900 rounded-lg border border-slate-900 text-xs flex justify-between items-start gap-4">
                      <span className="font-mono text-amber-400 font-bold shrink-0">{item.code}</span>
                      <span className="text-slate-300 font-semibold">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* TABLEAU DE BORD & VOYANTS */}
            <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} relative overflow-hidden`}>
              <HydrominesIdentity isEco={isEco} />
              <h3 className="text-xs font-black uppercase text-amber-500 mb-3">
                3. Tableau de Bord & Dictionnaire des Voyants (Accessibilité Daltonisme)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EPIROC_ST7_VOYANTS.map((voyant) => (
                  <div key={voyant.name} className="p-3.5 bg-slate-900 rounded-xl border border-slate-900 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-white">{voyant.name}</span>
                      <span className="text-[10px] font-bold text-slate-400">{voyant.symbol}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                      <div><span className="text-slate-500">Normal :</span> <strong className="text-emerald-400">{voyant.normal}</strong></div>
                      <div><span className="text-slate-500">Anormal :</span> <strong className="text-red-400">{voyant.abnormal}</strong></div>
                    </div>
                    <p className="text-[11px] text-amber-300 font-bold leading-relaxed">{voyant.action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAULT DETAILS (90+ PANNES REPRESENTED AND SCROLLABLE) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  Fiches Pannes & Diagnostics correspondants ({filteredPannes.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">SOU-ST7 Dépannage rapide</span>
              </div>

              {filteredPannes.map((panne) => {
                const sysInfo = getSystemColorAndShape(panne.system);
                return (
                  <div 
                    key={panne.id} 
                    className={`p-5 rounded-2xl border ${
                      isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"
                    } relative overflow-hidden break-inside-avoid border-l-4`}
                    style={{ borderLeftColor: sysInfo.color }}
                  >
                    <HydrominesIdentity isEco={isEco} />
                    <div className="flex justify-between items-start gap-4 mb-3 border-b border-slate-900 pb-2.5">
                      <div>
                        <span className="font-mono text-xs font-black bg-slate-900 text-amber-500 px-2 py-0.5 rounded border border-slate-800 mr-2">
                          {panne.id}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          {sysInfo.shape} {sysInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-400 font-bold">⌛ {panne.repTime}h</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                          panne.severity === "ROUGE" 
                            ? "bg-red-950 text-red-400 border border-red-800" 
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}>
                          {panne.severity === "ROUGE" ? "🛑 CRITIQUE" : "⚠️ ALERTE"}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-white mb-4">{panne.title}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-900">
                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">🔍 Symptômes constatés</span>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">{panne.symptoms}</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-900">
                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">⚙️ Causes probables</span>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">{panne.cause}</p>
                      </div>
                      <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-900/40">
                        <span className="text-[9px] font-black text-amber-400 uppercase block mb-1">🛠️ Remède & Action corrective</span>
                        <p className="text-xs text-slate-200 font-black leading-relaxed">{panne.action}</p>
                      </div>
                    </div>

                    {/* MODE APPRENTISSAGE ADVANCED */}
                    {mode === "APP" && panne.tip && (
                      <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-xs space-y-1">
                        <span className="font-black text-[9px] text-indigo-400 uppercase tracking-wider block">🎓 Astuce du Vieux Chef Mécano :</span>
                        <p className="text-slate-300 font-semibold">{panne.tip}</p>
                      </div>
                    )}

                    {/* MODE CHEF D'ÉQUIPE REAL CASE STUDY */}
                    {mode === "CHF" && panne.casReel && (
                      <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-xs space-y-1">
                        <span className="font-black text-[9px] text-emerald-400 uppercase tracking-wider block">👨‍✈️ Retour d'Expérience Mine (REX) :</span>
                        <p className="text-slate-300 font-semibold">{panne.casReel}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: ARBRES DE DÉCISION */}
        {/* ---------------------------------------------------- */}
        {activeTab === "arbres_decision" && (
          <div className="col-span-12 space-y-6">
            
            <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"}`}>
              <h3 className="text-sm font-black uppercase tracking-wider mb-2">7. Arbres de Décision Transversaux Interactifs</h3>
              <p className="text-xs text-slate-400 mb-6 font-semibold">
                Sélectionnez une situation critique pour dérouler logiquement l'arbre de décision mécanique :
              </p>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-2 print:hidden">
                {[
                  { id: 1, title: "Moteur Cummins ne démarre pas" },
                  { id: 2, title: "La transmission Funk patine" },
                  { id: 3, title: "Mouvements du bras lents" },
                  { id: 4, title: "Freins SAHR bloqués" },
                  { id: 5, title: "Surchauffe générale" },
                  { id: 6, title: "Bruits anormaux articulés" }
                ].map((tree) => (
                  <button
                    key={tree.id}
                    onClick={() => { setCurrentTree(tree.id); resetTree(); }}
                    className={`p-3 rounded-xl text-[11px] font-black uppercase text-center border cursor-pointer transition-all ${
                      currentTree === tree.id ? "bg-amber-500 text-black border-amber-600" : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    Arbre #{tree.id}
                    <span className="block text-[9px] font-medium text-slate-500 lowercase mt-0.5">{tree.title}</span>
                  </button>
                ))}
              </div>

              {/* TREE DISPLAY */}
              {currentTree !== null && (
                <div className="mt-6 p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h4 className="text-xs font-black uppercase text-amber-500">Logique active : Arbre #{currentTree}</h4>
                    <button onClick={resetTree} className="text-xs text-slate-400 hover:text-white uppercase font-bold">Réinitialiser l'Arbre 🔄</button>
                  </div>

                  {treeHistory.length > 0 && (
                    <div className="p-3 bg-slate-950 rounded-lg space-y-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase block">Historique de diagnostic :</span>
                      {treeHistory.map((h, i) => (
                        <p key={i} className="text-xs text-slate-300 font-semibold">✔️ {h}</p>
                      ))}
                    </div>
                  )}

                  {/* INTERACTIVE QUESTION NODE */}
                  {treeHistory.length === 0 && currentTree === 1 && (
                    <div className="space-y-3">
                      <p className="text-sm font-black text-white">Q1 : Le démarreur tourne-t-il lorsque tu tournes la clé ?</p>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleTreeChoice("Q1", "Oui (Le démarreur tourne)", "Le démarreur tourne mais le bloc Cummins ne démarre pas. Vérifie les préfiltres séparateurs d'eau Cummins (gazole contaminé) et pompe la poire de gavage manuelle. Es-tu sûr du préchauffage Grid Heater ?")} 
                          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-black uppercase text-emerald-400 rounded-xl cursor-pointer"
                        >
                          🟢 OUI
                        </button>
                        <button 
                          onClick={() => handleTreeChoice("Q1", "Non (Démarreur inactif)", "Le démarreur est inerte. Vérifie la tension des batteries 24V. Si elle est supérieure à 24V, vérifie le capteur magnétique de porte cabine (Interlock), la porte doit être parfaitement verrouillée.")} 
                          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-black uppercase text-red-400 rounded-xl cursor-pointer"
                        >
                          🔴 NON
                        </button>
                      </div>
                    </div>
                  )}

                  {treeHistory.length === 0 && currentTree === 2 && (
                    <div className="space-y-3">
                      <p className="text-sm font-black text-white">Q1 : La pression d'embrayage 'Clutch Pressure' est-elle supérieure à 16 bar ?</p>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleTreeChoice("Q1", "Oui (>16 bar)", "La pression de commande hydraulique est correcte. Le patinage est probablement mécanique interne. Les disques d'embrayages Funk DF150 humides sont usés ou calaminés, nécessitant une réfection complète d'atelier.")} 
                          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-black uppercase text-emerald-400 rounded-xl cursor-pointer"
                        >
                          🟢 OUI
                        </button>
                        <button 
                          onClick={() => handleTreeChoice("Q1", "Non (<16 bar)", "La pression de pilotage est trop basse. Vérifie l'état de la pompe de transmission et l'électrovanne proportionnelle de boîte. L'huile ATF Dexron III est-elle au niveau requis ?")} 
                          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-black uppercase text-red-400 rounded-xl cursor-pointer"
                        >
                          🔴 NON
                        </button>
                      </div>
                    </div>
                  )}

                  {treeHistory.length === 0 && currentTree === 3 && (
                    <div className="space-y-3">
                      <p className="text-sm font-black text-white">Q1 : La pression générale d'utilisation en charge atteint-elle 24.0 MPa ?</p>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleTreeChoice("Q1", "Oui (24.0 MPa nominal)", "La pression de puissance est correcte. Les tiroirs du distributeur principal Parker ou les joysticks d'ergonomie sont défaillants. Vérifie également le bon fonctionnement du capteur de pesage Load Weighing.")} 
                          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-black uppercase text-emerald-400 rounded-xl cursor-pointer"
                        >
                          🟢 OUI
                        </button>
                        <button 
                          onClick={() => handleTreeChoice("Q1", "Non (<20 MPa)", "Perte de puissance d'usine. La pompe à pistons Rexroth A10VO présente une fuite interne importante, ou la crépine magnétique d'aspiration de 111 L est saturée de boues métalliques.")} 
                          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-black uppercase text-red-400 rounded-xl cursor-pointer"
                        >
                          🔴 NON
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FALLBACK INFO NODE */}
                  {treeAnswerText && (
                    <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/20 space-y-2">
                      <span className="text-[10px] font-black text-amber-500 uppercase block">💡 Recommandation d'arrêt & Diagnostic :</span>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">{treeAnswerText}</p>
                      <button 
                        onClick={resetTree} 
                        className="mt-2 text-xs text-amber-500 hover:underline block font-bold"
                      >
                        Recommencer le diagnostic 🔄
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* QUICK FIXES SECTION */}
            <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"}`}>
              <h3 className="text-xs font-black uppercase text-amber-500 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                8. Quick Fix — Résolution Sans Démontage (30 secondes à 10 minutes)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-900">
                  <span className="font-black text-white block">🚪 Door Interlock bloque tout</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Vérifie l'accumulation de boue ferreuse collée sur l'aimant du capteur de porte. Nettoie au chiffon sec. (1 min)</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-900">
                  <span className="font-black text-white block">🛑 Erreur Brake test failed RCS-B01</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Active la procédure de purge automatique de freinage depuis l'écran RCS, puis relance le test à l'arrêt complet. (3 min)</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-900">
                  <span className="font-black text-white block">◆ Voyant Colmatage Air Jaune</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Extrais le filtre d'air primaire Cummins et tapote-le doucement contre une cale de bois pour éliminer la poussière sèche de galerie. (2 min)</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-900">
                  <span className="font-black text-white block">☼ De-clutch inerte au levage</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Nettoie et resserre la connectique du commutateur fixé sur la base du levier de cabine. (2 min)</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: PROCEDURES DEMONTAGE */}
        {/* ---------------------------------------------------- */}
        {activeTab === "procedures_demontage" && (
          <div className="col-span-12 space-y-6">
            
            {/* LOTO - LOCK OUT TAG OUT */}
            <div className="bg-red-950/60 text-white rounded-2xl p-6 border border-red-800/80 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-600 rounded-xl shrink-0">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-red-200">17. LOTO — Lock Out Tag Out (10 étapes de survie)</h3>
                  <p className="text-xs text-red-300 leading-relaxed mt-1 font-semibold">
                    Avant TOUTE intervention sur les circuits hydrauliques sous pression de 24 MPa, le moteur Cummins ou le système de freinage SAHR, appliquez rigoureusement les 10 étapes de consignation mécanique :
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Placer le ST7 sur sol plat, abaisser le godet à plat",
                  "Couper le moteur Cummins, retirer la clé de contact",
                  "Actionner le commutateur de coupure de batterie (Lockout)",
                  "Décompresser le réservoir d'huile hydraulique principal de 111 L",
                  "Purger manuellement les accumulateurs de secours de freins SAHR",
                  "Placer des cales de roues physiques sur l'essieu avant Kessler",
                  "Bloquer le bras de levage avec la béquille de sécurité mécanique",
                  "Consigner le cadenas de verrouillage électrique personnel",
                  "Poser la pancarte réglementaire d'avertissement 'NE PAS ACTIONNER'",
                  "Vérifier l'absence d'énergie résiduelle en tentant un démarrage"
                ].map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleLotoStep(idx)}
                    className={`p-3 rounded-xl text-left text-xs font-bold flex items-center gap-3 border transition-all cursor-pointer ${
                      lotoProgress[idx] 
                        ? "bg-red-800/40 border-red-500 text-slate-300 line-through" 
                        : "bg-red-900/30 border-red-800 text-red-200 hover:bg-red-900/60"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      lotoProgress[idx] ? "bg-red-500 text-white" : "bg-red-950 text-red-400"
                    }`}>
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP-BY-STEP DISASSEMBLY PROCEDURES */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
                12. Procédures d'Entretien & Démontage Pas-à-Pas
              </h3>

              {EPIROC_ST7_PROCEDURES.map((proc) => (
                <div key={proc.id} className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} space-y-3`}>
                  <div className="flex items-center gap-3 border-b border-slate-900 pb-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500 text-black flex items-center justify-center text-xs font-black">
                      {proc.id}
                    </span>
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">{proc.title}</h4>
                  </div>

                  <div className="space-y-2">
                    {proc.steps.map((step, sIdx) => {
                      const isDone = procProgress[`${proc.id}_${sIdx}`];
                      return (
                        <div
                          key={sIdx}
                          onClick={() => toggleProcStep(proc.id, sIdx)}
                          className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-all cursor-pointer ${
                            isDone 
                              ? "bg-slate-900/20 border-emerald-900/60 text-slate-500 line-through" 
                              : "bg-slate-900 border-slate-900 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            isDone ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                          }`}>
                            {sIdx + 1}
                          </span>
                          <span className="leading-relaxed font-semibold">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: STOCK & CONSOMMABLES */}
        {/* ---------------------------------------------------- */}
        {activeTab === "pieces_stock" && (
          <div className="col-span-12 space-y-6">
            
            {/* WIDGET STOCKS SOU-MAG */}
            <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">11. Pièces Stock Mine & Consommables Exacts</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Gérer localement les prélèvements d'urgence du stock d'atelier :</p>
                </div>
                <ShoppingCart className="w-5 h-5 text-amber-500" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-900/40 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-3">Désignation Organe</th>
                      <th className="py-3 px-3">Référence Mine</th>
                      <th className="py-3 px-3 text-center">Quantité Disponible</th>
                      <th className="py-3 px-3 text-right">Ajuster Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-300 font-semibold">
                    {Object.entries(EPIROC_ST7_STOCK).map(([key, item]) => (
                      <tr key={key} className="hover:bg-slate-900/30">
                        <td className="py-3.5 px-3 font-black text-white">{item.desc}</td>
                        <td className="py-3.5 px-3 font-mono text-slate-500">{item.ref}</td>
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            stocks[key] === 0 
                              ? "bg-red-950 text-red-400 border border-red-900" 
                              : "bg-slate-900 text-slate-300 border border-slate-800"
                          }`}>
                            {stocks[key]} unité{stocks[key] > 1 ? "s" : ""} {stocks[key] === 0 ? "(RUPTURE !)" : ""}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="inline-flex bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1">
                            <button
                              onClick={() => updateStockQty(key, -1)}
                              className="w-7 h-7 bg-slate-950 hover:bg-red-950 text-red-400 rounded flex items-center justify-center font-bold border border-slate-800 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateStockQty(key, 1)}
                              className="w-7 h-7 bg-slate-950 hover:bg-emerald-950 text-emerald-400 rounded flex items-center justify-center font-bold border border-slate-800 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INTERCHANGEABILITY & ALTERNATIVES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} space-y-3`}>
                <h4 className="font-black text-amber-500 uppercase tracking-wider">🔗 Interchangeabilité d'Urgence</h4>
                <div className="space-y-3 font-semibold text-slate-300 leading-relaxed">
                  <p>
                    • <strong className="text-white">Moteur Cummins QSB6.7 :</strong> Totalement compatible avec les moteurs de pelles hydrauliques Komatsu de chantiers de surface ou camions d'exploitation souterrains.
                  </p>
                  <p>
                    • <strong className="text-white">Pompe Rexroth A10VO :</strong> Interchangeable avec la pompe de direction de la chargeuse ST10, sous réserve d'ajustement du compensateur de pression d'usine.
                  </p>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} space-y-3`}>
                <h4 className="font-black text-amber-500 uppercase tracking-wider">🛢️ Consommables Exacts d'Origine</h4>
                <div className="space-y-2 font-semibold text-slate-300">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span>Huile moteur Cummins</span>
                    <strong className="text-white">API CK-4 (15W-40)</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span>Huile transmission Funk</span>
                    <strong className="text-white">ATF Dexron III</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span>Huile hydraulique Rexroth</span>
                    <strong className="text-white">ISO VG 46 Premium</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquide de refroidissement</span>
                    <strong className="text-white">Mélange Glycol 50/50 ELC</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: SUIVI INTERVENTION */}
        {/* ---------------------------------------------------- */}
        {activeTab === "suivi_intervention" && (
          <div className="col-span-12 space-y-6">
            
            <div className={`p-6 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} shadow-xl`}>
              <h3 className="text-sm font-black uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                21. Fiche Suivi Intervention SOU-ST7 (Persistant Local)
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-semibold">
                Remplissez et archivez localement les opérations d'entretien pour le rapport de fin de poste :
              </p>

              <form onSubmit={submitInterventionForm} className="space-y-6 text-xs text-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Date d'intervention :</label>
                    <input
                      type="date"
                      value={formState.date}
                      onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Heures Machine :</label>
                    <input
                      type="number"
                      placeholder="Ex: 4850"
                      value={formState.machineHours}
                      onChange={(e) => setFormState({ ...formState, machineHours: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Nom Mécanicien :</label>
                    <input
                      type="text"
                      placeholder="Ex: Yahya"
                      value={formState.mecoName}
                      onChange={(e) => setFormState({ ...formState, mecoName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">N° de Parc ST7 :</label>
                    <select
                      value={formState.parkNo}
                      onChange={(e) => setFormState({ ...formState, parkNo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                    >
                      <option value="ST7-001">ST7-001 (Mine Nord)</option>
                      <option value="ST7-002">ST7-002 (Galerie 3B)</option>
                      <option value="ST7-003">ST7-003 (Rampe Ouest)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Symptôme constaté :</label>
                    <input
                      type="text"
                      placeholder="Ex: Bruit de raclement"
                      value={formState.symptom}
                      onChange={(e) => setFormState({ ...formState, symptom: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Fiche Panne N° :</label>
                    <input
                      type="text"
                      placeholder="Ex: 5.1.1.A"
                      value={formState.panneNo}
                      onChange={(e) => setFormState({ ...formState, panneNo: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Pièces remplacées :</label>
                    <input
                      type="text"
                      placeholder="Ex: Disques SAHR"
                      value={formState.partsUsed}
                      onChange={(e) => setFormState({ ...formState, partsUsed: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Temps Diag (min) :</label>
                    <input
                      type="number"
                      placeholder="30"
                      value={formState.diagTime}
                      onChange={(e) => setFormState({ ...formState, diagTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Temps Réparation (h) :</label>
                    <input
                      type="number"
                      placeholder="2"
                      value={formState.repairTime}
                      onChange={(e) => setFormState({ ...formState, repairTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Machine Arrêtée (h) :</label>
                    <input
                      type="number"
                      placeholder="4"
                      value={formState.downTime}
                      onChange={(e) => setFormState({ ...formState, downTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Calibration RCS ?</label>
                    <select
                      value={formState.rcsCalibrated}
                      onChange={(e) => setFormState({ ...formState, rcsCalibrated: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                    >
                      <option value="Oui">Oui (Niveau 3)</option>
                      <option value="Non">Non</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-400 block mb-1">Observations / Commentaires :</label>
                  <textarea
                    rows={3}
                    placeholder="Préciser l'état physique de l'organe déposé, niveau de limaille, etc."
                    value={formState.comments}
                    onChange={(e) => setFormState({ ...formState, comments: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                  />
                </div>

                {/* SIGNATURES CHOP ZONE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="meco_sign"
                      checked={formState.validationSigned}
                      onChange={(e) => setFormState({ ...formState, validationSigned: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                    />
                    <label htmlFor="meco_sign" className="font-black text-white cursor-pointer">
                      ✍️ Signature Électronique Mécanicien validation
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="sup_sign"
                      checked={formState.supervisorSigned}
                      onChange={(e) => setFormState({ ...formState, supervisorSigned: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                    />
                    <label htmlFor="sup_sign" className="font-black text-white cursor-pointer">
                      👨‍✈️ Contresignature Chef d'Équipe GMAO
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black font-black text-sm rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" /> Enregistrer la Fiche d'Intervention
                </button>
              </form>
            </div>

            {/* HISTORIQUE TABLE */}
            {interventionHistory.length > 0 && (
              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} space-y-3`}>
                <h3 className="text-xs font-black uppercase text-amber-500">Historique des 10 dernières fiches</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-900/40 text-[10px] font-black text-slate-500 uppercase">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Machine & Heures</th>
                        <th className="py-2 px-3">Mécano</th>
                        <th className="py-2 px-3">Panne / Symptôme</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300 font-semibold">
                      {interventionHistory.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-900/20">
                          <td className="py-3 px-3 font-mono text-white">{record.date}</td>
                          <td className="py-3 px-3">{record.parkNo} ({record.machineHours}h)</td>
                          <td className="py-3 px-3">{record.mecoName}</td>
                          <td className="py-3 px-3">
                            <span className="font-black text-white mr-2">#{record.panneNo || "N/A"}</span>
                            {record.symptom}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => deleteInterventionRecord(record.id)}
                              className="p-1 text-red-400 hover:text-red-500 cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: SECURITE & URGENCES */}
        {/* ---------------------------------------------------- */}
        {activeTab === "securite_urgences" && (
          <div className="col-span-12 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-red-950/60 text-white border border-red-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-black uppercase text-red-200 tracking-wider flex items-center gap-2 border-b border-red-900 pb-2">
                  <ShieldAlert className="w-5 h-5 text-red-500 animate-bounce" />
                  13. Protocoles d'Urgence Vie SOU-ST7
                </h3>
                
                <div className="space-y-4 text-xs leading-relaxed font-semibold">
                  {EPIROC_ST7_URGENCES.map((urg) => (
                    <div key={urg.title} className="p-3 bg-red-900/20 rounded-xl border border-red-900/40">
                      <span className="text-red-400 font-black uppercase block mb-1">{urg.title}</span>
                      <p className="text-slate-200">{urg.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} space-y-4`}>
                <h3 className="text-sm font-black uppercase text-amber-500 tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                  <Scale className="w-5 h-5" />
                  14. Valeurs de Référence & Diagnostic Outils Pauvres
                </h3>

                <div className="space-y-3 text-xs">
                  {Object.entries(EPIROC_ST7_VALEURS).map(([key, item]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-slate-900 last:border-0">
                      <span className="text-slate-400 font-bold">{item.label} :</span>
                      <div className="text-right">
                        <span className="text-white font-black block">{item.val}</span>
                        <span className="text-[10px] text-red-400 block">Alarme: {item.alerte}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              
              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} space-y-3`}>
                <h4 className="font-black text-amber-500 uppercase tracking-wider">🔧 18. Outillage Spécifique ST7</h4>
                <ul className="space-y-1.5 font-semibold text-slate-300">
                  {EPIROC_ST7_OUTILS.map((tool, idx) => (
                    <li key={idx}>• {tool}</li>
                  ))}
                </ul>
              </div>

              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} space-y-3`}>
                <h4 className="font-black text-amber-500 uppercase tracking-wider">👨‍✈️ 22. Certifications & Responsabilités</h4>
                <div className="space-y-2 font-semibold text-slate-300">
                  <p>
                    • <strong className="text-emerald-400">Niveau 1 (Apprenti) :</strong> Entretien de routine, graissage, LOTO, filtres à air.
                  </p>
                  <p>
                    • <strong className="text-blue-400">Niveau 2 (Confirmé) :</strong> Dépose de vérins, remplacement de démarreur/alternateur, freins.
                  </p>
                  <p>
                    • <strong className="text-purple-400">Niveau 3 (Expert) :</strong> Calibration de boîte Funk, firmware updates, calibration pesage.
                  </p>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${isEco ? "border-slate-300 bg-white" : "border-slate-800 bg-slate-950"} space-y-3`}>
                <h4 className="font-black text-amber-500 uppercase tracking-wider">🎛️ 23. Calibrations Spécifiques</h4>
                <div className="space-y-2 font-semibold text-slate-300 leading-relaxed">
                  <p>
                    • <strong className="text-white">Calibration Transmission :</strong> Requise après tout remplacement de boîte, convertisseur ou capteur. (Niveau 3 uniquement).
                  </p>
                  <p>
                    • <strong className="text-white">Calibration Load Weighing :</strong> À faire périodiquement à l'aide d'un poids d'étalonnage connu de 6 000 kg.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div> {/* Closing MAIN CONTAINER */}
      </div> {/* Closing of id="contenu-st7-standard" */}

      <section id="section-cahier" className="cahier-container" style={{ display: 'none' }}>
        <style>{`
          .btn-cahier-visuel {
            background: linear-gradient(90deg, #FFD700, #B8860B, #FFD700, #B8860B);
            background-size: 300% 100%;
            animation: shimmer-gold 3s infinite linear;
            color: #FFFFFF;
            font-weight: 900;
            text-transform: uppercase;
            text-shadow: 2px 2px 4px #000000;
            border: 3px solid #FFFFFF;
            border-radius: 12px;
            padding: 12px 24px;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            position: relative;
          }

          .btn-cahier-visuel:active {
            transform: scale(0.95);
          }

          .icon-cahier {
            font-size: 20px;
            animation: rotate-slow 4s infinite linear;
          }

          .badge-cahier {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #FF0000;
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 50%;
            border: 1.5px solid white;
          }

          @keyframes shimmer-gold {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }

          @keyframes rotate-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .cahier-container {
            background: #FAFAFA;
            color: #1A1A1A;
            font-family: 'Segoe UI', Arial, sans-serif;
            min-height: 100vh;
            padding: 20px;
            border-radius: 16px;
            margin-top: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          }

          .cahier-header {
            text-align: center;
            padding: 30px 20px;
            border-bottom: 4px solid #B8860B;
            margin-bottom: 20px;
          }

          .cahier-titre-principal {
            color: #B8860B;
            font-size: 2.2em;
            font-weight: 900;
            text-transform: uppercase;
            margin: 0;
          }

          .cahier-sous-titre {
            color: #666;
            font-size: 1.1em;
            margin: 10px 0 20px;
          }

          .btn-retour-st7 {
            background: linear-gradient(90deg, #FFD700, #B8860B);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .btn-retour-st7:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }

          .cahier-nav {
            position: sticky;
            top: 80px;
            background: #FFFFFF;
            padding: 15px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 100;
            border-radius: 12px;
            margin-bottom: 20px;
          }

          /* PDF Download Bar & Buttons */
          .pdf-download-bar {
            display: flex;
            gap: 16px;
            padding: 16px;
            background: #0a0a0a;
            border-bottom: 2px solid #f59e0b;
            position: sticky;
            top: 0;
            z-index: 100;
            justify-content: center;
            margin-bottom: 20px;
            border-radius: 12px;
          }
          
          .pdf-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            border-radius: 8px;
            border: 2px solid;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 280px;
          }
          
          .pdf-btn-cahier {
            background: #f59e0b;
            color: #000;
            border-color: #f59e0b;
          }
          
          .pdf-btn-manuel {
            background: #1a1a1a;
            color: #fff;
            border-color: #f59e0b;
          }
          
          .pdf-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(245,158,11,0.3);
          }
          
          .pdf-icon {
            font-size: 24px;
          }
          
          .pdf-text {
            display: flex;
            flex-direction: column;
            text-align: left;
          }
          
          .pdf-text strong {
            font-size: 14px;
            font-weight: 700;
          }
          
          .pdf-text small {
            font-size: 11px;
            opacity: 0.8;
          }
          
          .pdf-arrow {
            font-size: 20px;
            margin-left: auto;
          }

          .cahier-nav button {
            background: #B8860B;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .cahier-nav button:hover {
            background: #FFD700;
            color: #1A1A1A;
          }

          .cahier-chapitre {
            background: #FFFFFF;
            border-left: 6px solid #B8860B;
            padding: 30px;
            margin: 30px 0;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            border-radius: 8px;
          }

          .cahier-titre-chapitre {
            color: #B8860B;
            font-size: 1.8em;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 20px;
            border-bottom: 2px solid #B8860B;
            padding-bottom: 10px;
          }

          .schema-placeholder, .photo-placeholder, .video-placeholder, .animation-placeholder {
            background: #E8E8E8;
            border: 2px dashed #B8860B;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 300px;
            margin: 20px 0;
            position: relative;
            padding: 20px;
          }

          .schema-svg {
            width: 100%;
            height: auto;
            max-width: 800px;
          }

          .photo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            width: 100%;
          }

          .photo-cadre {
            background: #DDD;
            padding: 40px 20px;
            text-align: center;
            font-weight: 700;
            color: #666;
            border-radius: 4px;
            width: 100%;
          }

          .photo-legende-photo {
            font-size: 0.75rem;
            color: #334155;
            margin-top: 10px;
            text-align: left;
            width: 100%;
            line-height: 1.4;
          }

          .photo-legende-photo strong {
            color: #0f172a;
          }

          .video-placeholder video {
            width: 100%;
            max-width: 400px;
            border-radius: 6px;
          }

          .animation-placeholder canvas {
            width: 100%;
            height: auto;
            max-width: 800px;
          }

          .animation-overlay {
            position: absolute;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 4px;
            pointer-events: none;
          }

          .cahier-tableau {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 0.9em;
          }

          .cahier-tableau th {
            background: #B8860B;
            color: white;
            padding: 12px;
            text-align: left;
          }

          .cahier-tableau td {
            border: 1px solid #DDD;
            padding: 10px;
          }

          .cahier-tableau tr:nth-child(even) {
            background: #F5F5F5;
          }

          .cotes-tip {
            background: #FFF8DC;
            border-left: 4px solid #FFD700;
            padding: 15px;
            margin: 15px 0;
            font-style: italic;
          }

          .btn-retour-assistant {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(90deg, #FFD700, #B8860B);
            color: white;
            font-weight: 900;
            padding: 15px 30px;
            border-radius: 50px;
            border: none;
            box-shadow: 0 4px 15px rgba(184, 134, 11, 0.4);
            cursor: pointer;
            z-index: 1000;
            transition: all 0.2s;
          }
          
          .btn-retour-assistant:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(184, 134, 11, 0.6);
          }

          /* PRINT */
          @media print {
            .cahier-nav, .btn-retour-assistant, .btn-retour-st7, .pdf-download-bar {
              display: none;
            }
            .cahier-chapitre {
              page-break-before: always;
            }
          }
        `}</style>

        {/* HEADER */}
        <header className="cahier-header">
          <h1 className="cahier-titre-principal">📐 CAHIER DES CHARGES VISUEL COMPLET</h1>
          <p className="cahier-sous-titre">EPIROC SCOOPTRAM ST7 — Référence technique multimédia</p>
          <button className="btn-retour-st7" onClick={() => (window as any).fermerCahier()}>← RETOUR À L'ASSISTANT ST7</button>
        </header>

        <div className="pdf-download-bar">
          <button className="pdf-btn pdf-btn-cahier" onClick={() => window.open('/print-st7.html', '_blank')}>
            <span className="pdf-icon">📋</span>
            <span className="pdf-text">
              <strong>CAHIER DES CHARGES VISUELS</strong>
              <small>101 pages · A4 · Prêt à imprimer</small>
            </span>
            <span className="pdf-arrow">⬇</span>
          </button>
          
          <button className="pdf-btn pdf-btn-manuel" onClick={() => window.open('/print-st7-manuel.html', '_blank')}>
            <span className="pdf-icon">📘</span>
            <span className="pdf-text">
              <strong>MANUEL COMPLET ST7</strong>
              <small>150 pages · A4 · Pannes + Arbres + Checklist</small>
            </span>
            <span className="pdf-arrow">⬇</span>
          </button>
        </div>

        {/* NAVIGATION CHAPITRES */}
        <nav className="cahier-nav">
          <button onClick={() => (window as any).scrollToChapitre('ch1')}>1. SCHÉMAS</button>
          <button onClick={() => (window as any).scrollToChapitre('ch2')}>2. PHOTOS</button>
          <button onClick={() => (window as any).scrollToChapitre('ch3')}>3. STORYBOARDS</button>
          <button onClick={() => (window as any).scrollToChapitre('ch4')}>4. ANIMATIONS 3D</button>
          <button onClick={() => (window as any).scrollToChapitre('ch5')}>5. COTES</button>
          <button onClick={() => (window as any).scrollToChapitre('ch6')}>6. OUTILS</button>
        </nav>

        {/* CHAPITRE 1 : SCHÉMAS */}
        <article id="ch1" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 1 — SCHÉMAS ÉCLATÉS INTERACTIFS</h2>
          
          <div className="schema-bloc" id="schema-moteur">
            <h3 className="font-bold text-lg text-slate-800">1.1 MOTEUR CUMMINS QSB 6.7</h3>
            <div className="schema-placeholder">
              <svg viewBox="0 0 800 600" className="schema-svg">
                <rect width={800} height={600} fill="#E8E8E8" stroke="#B8860B" strokeWidth={2}/>
                <text x={400} y={300} textAnchor="middle" fill="#666" fontSize={18}>
                  PLACEHOLDER SVG — SCHÉMA MOTEUR QSB 6.7
                </text>
                <text x={400} y={330} textAnchor="middle" fill="#666" fontSize={14}>
                  40 pièces numérotées (001-040) + hotspots cliquables
                </text>
              </svg>
            </div>
            <div className="schema-legende mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-bold text-slate-700">Légende pour illustrateur :</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                <li>Vue éclatée : distribution (gauche) + volant (droite) + dessus + coupe cylindre 3</li>
                <li>40 numéros avec lignes de renvoi</li>
                <li>Hotspots cliquables : chaque numéro = lien vers panne associée</li>
                <li>Info-bulle au survol : nom + référence Epiroc</li>
              </ul>
            </div>
            <table className="cahier-tableau">
              <thead>
                <tr><th className="font-black">N°</th><th className="font-black">Nom pièce</th><th className="font-black">Référence Epiroc</th><th className="font-black">Lien panne</th></tr>
              </thead>
              <tbody id="tbody-moteur">
                <tr><td>001</td><td>Bloc-cylindres (6 cylindres en ligne, alésage 107 mm, course 124 mm, cylindrée 6,7 L, fonte grise)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>002</td><td>Culasse (2 soupapes par cylindre, injecteur central, fonte alliée, 6 chambres de combustion)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.6.A</td></tr>
                <tr><td>003</td><td>Vilebrequin (7 paliers, contre-poids intégrés, acier forgé trempé, 6 manetons)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.6.A</td></tr>
                <tr><td>004</td><td>Bielles (6, acier forgé, axe piston 36 mm, coussinets trimétal)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.6.A</td></tr>
                <tr><td>005</td><td>Pistons (coupelle, alliage aluminium-silicium, 3 segments, axe flottant)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.6.A</td></tr>
                <tr><td>006</td><td>Segment compression supérieur (chrome, rectangulaire, 1,5 mm épaisseur)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.6.A</td></tr>
                <tr><td>007</td><td>Segment compression inférieur (spirale, intermédiaire, 1,5 mm)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.6.A</td></tr>
                <tr><td>008</td><td>Segment racleur (3 pièces, inférieur, 3 mm, acier)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.6.A</td></tr>
                <tr><td>009</td><td>Chemises cylindre (humides, remplaçables, fonte grise, alésage 107 mm)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.6.A</td></tr>
                <tr><td>010</td><td>Pompe à huile moteur (engrenages, entraînée par vilebrequin, débit 45 L/min à 2200 rpm)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.4.A</td></tr>
                <tr><td>011</td><td>Crépine d'aspiration huile (maille inox 100 micron, tube plongeur carter)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.4.A</td></tr>
                <tr><td>012</td><td>Carter inférieur (aluminium, capacité 18 L, joint spi vilebrequin arrière)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.5.B</td></tr>
                <tr><td>013</td><td>Pompe à eau (centrifuge, entraînée courroie poly-V, débit 120 L/min)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.3.A</td></tr>
                <tr><td>014</td><td>Thermostat (cire, ouverture 82°C, pleine ouverture 95°C, 3 voies)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.3.A</td></tr>
                <tr><td>015</td><td>Radiateur V-tube core L&M (aluminium, 3 rangées, refroidissement eau/air + charge air)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.3.B</td></tr>
                <tr><td>016</td><td>Charge air cooler (aluminium, 2 rangées, air comprimé/air ambiant)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.5.A</td></tr>
                <tr><td>017</td><td>Ventilateur refroidissement (diamètre 660 mm, 8 pales plastique, entraînement visco-coupleur)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.3.B</td></tr>
                <tr><td>018</td><td>Turbocharger Holset HX35W (géométrie fixe, A/R 0,58, suralimentation 1,8 bar max)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.5.A</td></tr>
                <tr><td>019</td><td>Collecteur admission (aluminium, 6 tubulures, bride turbo, capteur MAP intégré)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.5.B</td></tr>
                <tr><td>020</td><td>Collecteur échappement (fonte nodulaire, 6 branches, bride turbo, sonde température)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.5.A</td></tr>
                <tr><td>021</td><td>Pompe injection haute pression Bosch CP3 (3 plongeurs radial, rail 1600 bar max)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.2.A</td></tr>
                <tr><td>022</td><td>Rampe Common Rail (acier trempé, 1600 bar, 6 sorties injecteurs, capteur pression intégré)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.2.A</td></tr>
                <tr><td>023</td><td>Injecteurs piezo-électriques (6, débit 280 cc/30sec, 5 trous 0,12 mm, pression ouverture 320 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.2.B</td></tr>
                <tr><td>024</td><td>Filtre carburant primaire (séparateur eau, 2 micron, chauffage 12V intégré, purge manuelle)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.2.B</td></tr>
                <tr><td>025</td><td>Filtre carburant secondaire (3 micron, papier plissé, cartouche remplaçable)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.2.B</td></tr>
                <tr><td>026</td><td>Pompe amorçage carburant (électrique 12V, 3 bar, débit 120 L/h, auto-amorçante)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.2.B</td></tr>
                <tr><td>027</td><td>Réservoir carburant (190 L, acier, anti-siphon, jauge magnétique, bouchon ventilé)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>028</td><td>Jauge carburant (flotteur magnétique, résistance 0-180 Ω, signal vers RCS)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>029</td><td>Filtre à air sec Donaldson (99,9% à 2 micron, papier plissé, pré-filtre cyclone option)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.3.B</td></tr>
                <tr><td>030</td><td>Capteur débitmètre air MAF (hot-film, 0-5V, plage 0-800 kg/h, intégré tube admission)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.5.B</td></tr>
                <tr><td>031</td><td>Capteur pression admission MAP (piézo-résistif, 0-3 bar absolu, 0-5V, tube admission)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.5.B</td></tr>
                <tr><td>032</td><td>Capteur température admission (NTC 2,7kΩ, -40 à 150°C, tube admission)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.5.B</td></tr>
                <tr><td>033</td><td>Capteur température eau moteur (NTC, -40 à 150°C, culasse près thermostat)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.3.A</td></tr>
                <tr><td>034</td><td>Capteur pression huile moteur (piézo-résistif, 0-10 bar, 0-5V, bloc près filtre)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.4.A</td></tr>
                <tr><td>035</td><td>Capteur régime vilebrequin (inductif, 60 dents + 1 référence, volant moteur)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.1.B</td></tr>
                <tr><td>036</td><td>Capteur position arbre à cames (Hall, 1 dent cible, pignon distribution)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.1.B</td></tr>
                <tr><td>037</td><td>ECM Cummins (calculateur Bosch EDC7UC31, 89 broches, flashable, CAN J1939)</td><td>[REF À VÉRIFIER]</td><td>Pan. 1.1.1.A</td></tr>
                <tr><td>038</td><td>Démarreur (24V, 5,5 kW, 11 dents, réducteur planétaire, solénoïde 24V)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.1.2.A</td></tr>
                <tr><td>039</td><td>Alternateur (24V, 140A, régulation intégrée, poulie à roue libre, 2 courroies)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.1.3.A</td></tr>
                <tr><td>040</td><td>Batterie (2×12V 180Ah AGM, série 24V, borne + isolée, 800A démarrage)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.1.1.A</td></tr>
              </tbody>
            </table>
          </div>

          <div className="schema-bloc mt-8" id="schema-transmission">
            <h3 className="font-bold text-lg text-slate-800">1.2 TRANSMISSION FUNK DF150</h3>
            <div className="schema-placeholder">
              <svg viewBox="0 0 800 600" className="schema-svg">
                <rect width={800} height={600} fill="#E8E8E8" stroke="#B8860B" strokeWidth={2}/>
                <text x={400} y={300} textAnchor="middle" fill="#666" fontSize={18}>
                  PLACEHOLDER SVG — SCHÉMA TRANSMISSION FUNK DF150
                </text>
                <text x={400} y={330} textAnchor="middle" fill="#666" fontSize={14}>
                  29 pièces numérotées (101-129) + hotspots
                </text>
              </svg>
            </div>
            <table className="cahier-tableau">
              <thead><tr><th className="font-black">N°</th><th className="font-black">Nom pièce</th><th className="font-black">Référence</th><th className="font-black">Lien panne</th></tr></thead>
              <tbody id="tbody-transmission">
                <tr><td>101</td><td>Carter transmission Funk DF150 (fonte, capacité huile 45 L, joint de carter, bouchons aimantés)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.4.A</td></tr>
                <tr><td>102</td><td>Convertisseur de couple (3 éléments : pompe, turbine, stator, diamètre 350 mm, remplissage 18 L)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.1.1.A</td></tr>
                <tr><td>103</td><td>Pompe à huile convertisseur (engrenages internes, entraînée par turbine, débit 25 L/min)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.1.1.A</td></tr>
                <tr><td>104</td><td>Arbre turbine (entrée moteur, cannelé 35 dents, acier forgé, palier butée)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.1.1.A</td></tr>
                <tr><td>105</td><td>Arbre de sortie convertisseur (entrée boîte, cannelé 30 dents, palier lisse)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.1.1.A</td></tr>
                <tr><td>106</td><td>Embrayage 1ère vitesse (4 disques friction, diamètre 280 mm, épaisseur 3 mm, pression 12 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.1.A</td></tr>
                <tr><td>107</td><td>Embrayage 2ème vitesse (4 disques friction, diamètre 260 mm, épaisseur 3 mm, pression 12 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.1.B</td></tr>
                <tr><td>108</td><td>Embrayage 3ème vitesse (4 disques friction, diamètre 240 mm, épaisseur 3 mm, pression 12 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.1.C</td></tr>
                <tr><td>109</td><td>Embrayage 4ème vitesse (4 disques friction, diamètre 220 mm, épaisseur 3 mm, pression 12 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.1.D</td></tr>
                <tr><td>110</td><td>Embrayage marche arrière (3 disques friction, diamètre 200 mm, épaisseur 3 mm, pression 14 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>111</td><td>Train épicycloïdal 1ère (soleil 18 dents, 3 planètes 36 dents, couronne 90 dents, rapport 4,2:1)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>112</td><td>Train épicycloïdal 2ème (soleil 24 dents, 3 planètes 30 dents, couronne 84 dents, rapport 2,8:1)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>113</td><td>Train épicycloïdal 3ème (soleil 30 dents, 3 planètes 24 dents, couronne 78 dents, rapport 1,9:1)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>114</td><td>Train épicycloïdal 4ème (soleil 36 dents, 3 planètes 18 dents, couronne 72 dents, rapport 1,4:1)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>115</td><td>Arbre de sortie transmission (canon 35 cannelures, acier trempé, 2 paliers à rouleaux)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>116</td><td>Capteur vitesse sortie boîte (inductif, 60 dents, 0-5V, fréquence 0-10 kHz)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.3.A</td></tr>
                <tr><td>117</td><td>Électrovanne 1ère vitesse (proportional PWM, 24V, 1,5A, pression pilot 15 bar, connecteur Deutsch)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>118</td><td>Électrovanne 2ème vitesse (proportional PWM, 24V, 1,5A, pression pilot 15 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>119</td><td>Électrovanne 3ème vitesse (proportional PWM, 24V, 1,5A, pression pilot 15 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>120</td><td>Électrovanne 4ème vitesse (proportional PWM, 24V, 1,5A, pression pilot 15 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>121</td><td>Électrovanne marche arrière (proportional PWM, 24V, 1,5A, pression pilot 18 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>122</td><td>Électrovanne de-clutch (ON/OFF, 24V, 2A, pression pilot 12 bar, temporisation 0,5 sec)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.1.2.A</td></tr>
                <tr><td>123</td><td>Distributeur hydraulique commande transmission (8 voies, 15 bar pilot, limiteur 20 bar, acier)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>124</td><td>Module électronique Funk (32 broches, CAN J1939, flashable, boîtier aluminium IP67)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.2.A</td></tr>
                <tr><td>125</td><td>Capteur température huile transmission (NTC, -40 à 150°C, carter côté convertisseur)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.5.A</td></tr>
                <tr><td>126</td><td>Capteur pression huile transmission (piézo-résistif, 0-25 bar, 4-20 mA, carter principal)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.5.A</td></tr>
                <tr><td>127</td><td>Filtre huile transmission (25 micron, spin-on, débit 60 L/min, indicateur colmatage)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.4.A</td></tr>
                <tr><td>128</td><td>Refroidisseur huile transmission (air/huile, aluminium, 15 kW, thermostat 80°C)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.5.A</td></tr>
                <tr><td>129</td><td>Jauge niveau huile transmission (magnétique, flotteur, résistance 0-180 Ω, carter latéral)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.2.4.A</td></tr>
              </tbody>
            </table>
          </div>

          <div className="schema-bloc mt-8" id="schema-hydraulique">
            <h3 className="font-bold text-lg text-slate-800">1.3 HYDRAULIQUE LOAD SENSING REXROTH A10VO</h3>
            <div className="schema-placeholder">
              <svg viewBox="0 0 800 600" className="schema-svg">
                <rect width={800} height={600} fill="#E8E8E8" stroke="#B8860B" strokeWidth={2}/>
                <text x={400} y={300} textAnchor="middle" fill="#666" fontSize={18}>
                  PLACEHOLDER SVG — SCHÉMA HYDRAULIQUE 24 MPa
                </text>
                <text x={400} y={330} textAnchor="middle" fill="#666" fontSize={14}>
                  33 pièces numérotées (201-233) + hotspots
                </text>
              </svg>
            </div>
            <table className="cahier-tableau">
              <thead><tr><th className="font-black">N°</th><th className="font-black">Nom pièce</th><th className="font-black">Référence</th><th className="font-black">Lien panne</th></tr></thead>
              <tbody id="tbody-hydraulique">
                <tr><td>201</td><td>Pompe hydraulique principale à pistons axiaux Rexroth A10VO (cylindrée variable, load sensing, 24 MPa)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.1.1.A</td></tr>
                <tr><td>202</td><td>Pompe hydraulique de direction et pilotage à engrenages</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>203</td><td>Soupape de décharge principale (limiteur de pression de travail, réglée à 240 bar)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>204</td><td>Bloc distributeur principal Rexroth (4 tiroirs, commande électro-hydraulique proportionnelle)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>205</td><td>Soupape de réduction de pression de pilotage (régulée à 35 bar)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>206</td><td>Tiroir de commande de levage (hoist, double effet)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>207</td><td>Tiroir de commande de bennage (tilt/dump, double effet)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>208</td><td>Tiroir de commande de direction (gauche/droite)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>209</td><td>Distributeur de pilotage de direction (orbitrol à commande hydrostatique)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>210</td><td>Vérin de levage gauche (alésage 125 mm, tige 70 mm, course 850 mm)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.3.2.A</td></tr>
                <tr><td>211</td><td>Vérin de levage droit (alésage 125 mm, tige 70 mm, course 850 mm)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.3.2.A</td></tr>
                <tr><td>212</td><td>Vérin de bennage (alésage 125 mm, tige 70 mm, course 780 mm, double effet)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.3.2.A</td></tr>
                <tr><td>213</td><td>Vérin de direction gauche (alésage 80 mm, double effet, amortisseur de fin de course)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>214</td><td>Vérin de direction droit (alésage 80 mm, double effet, amortisseur de fin de course)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>215</td><td>Clapet anti-retour piloté de maintien de charge (sur ligne de levage)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>216</td><td>Clapet de surpression de choc de direction (réglé à 210 bar)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>217</td><td>Réservoir d'huile hydraulique (capacité 150 L, pressurisé à 0.5 bar, acier soudé)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>218</td><td>Crépine d'aspiration hydraulique (maille métallique 150 microns, bride aspiration)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>219</td><td>Filtre sur ligne de retour hydraulique (cartouche fibre de verre 12 microns absolue)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.1.2.A</td></tr>
                <tr><td>220</td><td>Cartouche de reniflard de réservoir (filtre à air de réservoir avec membrane déshydratante, 3 microns)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>221</td><td>Capteur de pression de commande Load Sensing (piézo-résistif, 0-300 bar, signal CAN)</td><td>[REF À VÉRIFIER]</td><td>—</td></tr>
                <tr><td>222</td><td>Accumulateur ride control (0,5 L, précharge azote 80 bar, membrane butyle, raccord 3/4" BSP)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.2.3.A</td></tr>
                <tr><td>223</td><td>Accumulateur soft stop direction (0,3 L, précharge azote 60 bar, membrane, raccord 1/2" BSP)</td><td>[REF À VÉRIFIER]</td><td>Pan. 4.1.2.A</td></tr>
                <tr><td>224</td><td>Vérin direction gauche (alésage 80 mm, tige 45 mm, course 350 mm, chrome dur, 250 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 4.1.1.A</td></tr>
                <tr><td>225</td><td>Vérin direction droite (alésage 80 mm, tige 45 mm, course 350 mm, chrome dur, 250 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 4.1.1.A</td></tr>
                <tr><td>226</td><td>Vérin hoist gauche (alésage 125 mm, tige 70 mm, course 800 mm, chrome dur, 240 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.3.2.A</td></tr>
                <tr><td>227</td><td>Vérin hoist droite (alésage 125 mm, tige 70 mm, course 800 mm, chrome dur, 240 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.3.2.A</td></tr>
                <tr><td>228</td><td>Vérin dump (alésage 125 mm, tige 70 mm, course 600 mm, chrome dur, 200 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.3.3.A</td></tr>
                <tr><td>229</td><td>Vérin stabilizer (alésage 150 mm, tige 85 mm, course 400 mm, chrome dur, 220 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.3.4.A</td></tr>
                <tr><td>230</td><td>Capteur leak detection (ultrason, 4 zones couverture, sensibilité 0,1 mL/min, CAN J1939)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.1.4.A</td></tr>
                <tr><td>231</td><td>Capteur pression système (piézo-résistif, 0-400 bar, 4-20 mA, précision 0,5%, sortie RCS)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.1.1.A</td></tr>
                <tr><td>232</td><td>Capteur débit système (turbine, 0-200 L/min, 4-20 mA, précision 1%, sortie RCS)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.1.1.C</td></tr>
                <tr><td>233</td><td>Refroidisseur huile hydraulique (air/huile, aluminium brasé, 15 kW, thermostat 50°C, bypass)</td><td>[REF À VÉRIFIER]</td><td>Pan. 3.1.1.B</td></tr>
              </tbody>
            </table>
          </div>

          <div className="schema-bloc mt-8" id="schema-freinage">
            <h3 className="font-bold text-lg text-slate-800">1.4 FREINAGE SAHR FORCE COOLED</h3>
            <div className="schema-placeholder">
              <svg viewBox="0 0 800 600" className="schema-svg">
                <rect width={800} height={600} fill="#E8E8E8" stroke="#B8860B" strokeWidth={2}/>
                <text x={400} y={300} textAnchor="middle" fill="#666" fontSize={18}>
                  PLACEHOLDER SVG — SCHÉMA FREINAGE SAHR
                </text>
                <text x={400} y={330} textAnchor="middle" fill="#666" fontSize={14}>
                  19 pièces numérotées (301-319) + hotspots
                </text>
              </svg>
            </div>
            <table className="cahier-tableau">
              <thead><tr><th className="font-black">N°</th><th className="font-black">Nom pièce</th><th className="font-black">Référence</th><th className="font-black">Lien panne</th></tr></thead>
              <tbody id="tbody-freinage">
                <tr><td>301</td><td>Étrier frein avant gauche (SAHR, 6 disques wet, corps fonte, piston 45 mm, 180 bar max)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.1.A</td></tr>
                <tr><td>302</td><td>Étrier frein avant droit (identique 301, miroir, 6 disques wet, corps fonte, 180 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.1.A</td></tr>
                <tr><td>303</td><td>Étrier frein arrière gauche (identique 301, 6 disques wet, corps fonte, 180 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.1.A</td></tr>
                <tr><td>304</td><td>Étrier frein arrière droit (identique 301, miroir, 6 disques wet, corps fonte, 180 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.1.A</td></tr>
                <tr><td>305</td><td>Disque frein mobile (acier trempé 58 HRC, 6 cannelures internes, épaisseur neuve 8 mm, min 6 mm)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.1.A</td></tr>
                <tr><td>306</td><td>Disque frein fixe (acier trempé, 6 ergots externes, épaisseur neuve 8 mm, min 6 mm)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.1.A</td></tr>
                <tr><td>307</td><td>Plaquette friction (organique métallique, épaisseur neuve 12 mm, min 3 mm, coefficient 0,38)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.1.B</td></tr>
                <tr><td>308</td><td>Piston étrier (acier chromé 45 mm diamètre, course 25 mm, joint torique NBR 45×3, racleur)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.2.A</td></tr>
                <tr><td>309</td><td>Ressort de rappel SAHR (6 ressorts hélicoïdaux, 150 N/mm chacun, précontrainte 900 N)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.2.A</td></tr>
                <tr><td>310</td><td>Accumulateur frein (2 L, précharge azote 100 bar, pression service 180 bar, membrane EPDM)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.3.1.A</td></tr>
                <tr><td>311</td><td>Pompe charge frein (engrenages 8 cc/r, 25 bar, entraînement moteur, débit 12 L/min)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.3.2.A</td></tr>
                <tr><td>312</td><td>Force cooling fan (ventilateur centrifuge, 24V, 5A, débit 500 m³/h, activation 80°C freins)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.2.A</td></tr>
                <tr><td>313</td><td>Conduit refroidissement frein (aluminium extrudé, isolant céramique, diamètre 80 mm)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.2.A</td></tr>
                <tr><td>314</td><td>Électrovanne release frein (proportional 4/3, 24V, 3A, 0-180 bar, spool acier inox, connecteur Deutsch)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.3.4.A</td></tr>
                <tr><td>315</td><td>Capteur pression accumulateur (piézo-résistif, 0-250 bar, 4-20 mA, alarme &lt; 120 bar, arrêt &lt; 100 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.3.1.A</td></tr>
                <tr><td>316</td><td>Capteur température frein (NTC, 0-300°C, 4-20 mA, alarme 150°C, activation force cooling 80°C)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.1.2.A</td></tr>
                <tr><td>317</td><td>Module brake-test (électronique, CAN J1939, test automatique toutes les 4h, logging RCS-B01)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.2.1.A</td></tr>
                <tr><td>318</td><td>Neutral brake valve (ON/OFF, 24V, 1,5A, activation 3 sec après neutre, pression 12 bar)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.4.1.A</td></tr>
                <tr><td>319</td><td>Réservoir huile frein (5 L, acier, séparé circuit hydraulique, niveau visuel, bouchon respirant)</td><td>[REF À VÉRIFIER]</td><td>Pan. 5.3.2.A</td></tr>
              </tbody>
            </table>
          </div>

          <div className="schema-bloc mt-8" id="schema-rcs">
            <h3 className="font-bold text-lg text-slate-800">1.5 RCS RIG CONTROL SYSTEM</h3>
            <div className="schema-placeholder">
              <svg viewBox="0 0 800 600" className="schema-svg">
                <rect width={800} height={600} fill="#E8E8E8" stroke="#B8860B" strokeWidth={2}/>
                <text x={400} y={300} textAnchor="middle" fill="#666" fontSize={18}>
                  PLACEHOLDER SVG — SCHÉMA RCS
                </text>
                <text x={400} y={330} textAnchor="middle" fill="#666" fontSize={14}>
                  18 pièces numérotées (401-418) + hotspots
                </text>
              </svg>
            </div>
            <table className="cahier-tableau">
              <thead><tr><th className="font-black">N°</th><th className="font-black">Nom pièce</th><th className="font-black">Référence</th><th className="font-black">Lien panne</th></tr></thead>
              <tbody id="tbody-rcs">
                <tr><td>401</td><td>Écran multifonction RCS (7 pouces, tactile résistif, 800×480, 11 langues, rétro-éclairage LED, IP65)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.1.1.A</td></tr>
                <tr><td>402</td><td>Calculateur principal RCS (ARM Cortex-A9, 512 MB RAM, 4 GB flash eMMC, OS temps réel Linux)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.1.2.A</td></tr>
                <tr><td>403</td><td>Module entrées analogiques (16 canaux, 0-10V / 4-20 mA, résolution 12 bits, isolation galvanique)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.2.1.A</td></tr>
                <tr><td>404</td><td>Module entrées digitales (32 canaux, 24V, opto-isolées, filtrage antirebond 10 ms)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.2.1.A</td></tr>
                <tr><td>405</td><td>Module sorties PWM (16 canaux, 24V, 2 kHz, courant max 3A, protection court-circuit)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.2.1.A</td></tr>
                <tr><td>406</td><td>Interface CAN J1939 (2 canaux, 250 kbps / 500 kbps, terminateur 120Ω, connecteur M12)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.5.1.A</td></tr>
                <tr><td>407</td><td>Interface CAN Open (1 canal, 125 kbps, terminateur, connecteur M12, bus hydraulique)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.5.1.A</td></tr>
                <tr><td>408</td><td>Caméra avant (CMOS 1/3", 720p 30fps, 120° FOV, IP67, éclairage IR 4 LED, connecteur M12)</td><td>[REF À VÉRIFIER]</td><td>Pan. 7.3.1.A</td></tr>
                <tr><td>409</td><td>Caméra arrière (CMOS 1/3", 720p 30fps, 140° FOV, IP67, guide lignes dynamiques, M12)</td><td>[REF À VÉRIFIER]</td><td>Pan. 7.3.2.A</td></tr>
                <tr><td>410</td><td>Capteur door interlock (Hall effect, 24V, NPN, distance détection 5 mm, aimant NdFeB)</td><td>[REF À VÉRIFIER]</td><td>Pan. 7.4.1.A</td></tr>
                <tr><td>411</td><td>Beacon status lights (LED RGB haute puissance, 360°, 24V, protocole RCS : vert/jaune/rouge/bleu)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.4.1.A</td></tr>
                <tr><td>412</td><td>Antenne RRC (2,4 GHz, 100 mW EIRP, dipôle 2 dBi, connecteur SMA, câble LMR200)</td><td>[REF À VÉRIFIER]</td><td>Pan. 8.1.1.A</td></tr>
                <tr><td>413</td><td>Antenne téléremote (900 MHz, 1W EIRP, directionnelle 8 dBi, connecteur N, câble LMR400)</td><td>[REF À VÉRIFIER]</td><td>Pan. 8.2.1.A</td></tr>
                <tr><td>414</td><td>Module GPS interne (u-blox NEO-M8N, précision 2 m, 10 Hz, logging trajectoire production)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.2.1.A</td></tr>
                <tr><td>415</td><td>Module WiFi (2,4 GHz, 802.11n, 150 Mbps, AP + client, diagnostic à distance, sécurité WPA2)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.2.1.A</td></tr>
                <tr><td>416</td><td>Batterie tampon RCS (Li-Ion 18650, 3,7V 2000 mAh, PCB protection, autonomie 30 min, connecteur JST)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.1.2.A</td></tr>
                <tr><td>417</td><td>Convertisseur 24V→12V (DC/DC buck, 5A, 90% rendement, alimentation écran + caméras + capteurs)</td><td>[REF À VÉRIFIER]</td><td>Pan. 7.1.3.A</td></tr>
                <tr><td>418</td><td>Fusibles RCS (10× blade fuse ATO, 5-30A, LED témoin de fusion, porte-fusible extractible)</td><td>[REF À VÉRIFIER]</td><td>Pan. 6.1.1.A</td></tr>
              </tbody>
            </table>
          </div>

          <div className="schema-bloc mt-8" id="schema-chassis">
            <h3 className="font-bold text-lg text-slate-800">1.6 CHÂSSIS, ESSIEUX, ARTICULATION</h3>
            <div className="schema-placeholder">
              <svg viewBox="0 0 800 600" className="schema-svg">
                <rect width={800} height={600} fill="#E8E8E8" stroke="#B8860B" strokeWidth={2}/>
                <text x={400} y={300} textAnchor="middle" fill="#666" fontSize={18}>
                  PLACEHOLDER SVG — SCHÉMA CHÂSSIS ROCK TOUGH 406
                </text>
              </svg>
            </div>
            <table className="cahier-tableau">
              <thead><tr><th className="font-black">N°</th><th className="font-black">Nom pièce</th><th className="font-black">Référence</th><th className="font-black">Lien panne</th></tr></thead>
              <tbody id="tbody-chassis">
                <tr><td>501</td><td>Cadre principal ST7 (acier haute résistance S690QL, soudé robotisé, 21 500 kg charge totale)</td><td>[REF À VÉRIFIER]</td><td>Pan. 9.3.1.A</td></tr>
                <tr><td>502</td><td>Essieu avant Rock Tough 406 (planetary wheel end-drive, no spin autobloquant, 12 tonnes)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.3.1.A</td></tr>
                <tr><td>503</td><td>Essieu arrière Rock Tough 406 (open differential, planetary wheel end, oscillation 14°)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.3.2.A</td></tr>
                <tr><td>504</td><td>Oscillation arrière (14° total, 7° chaque côté, axe oscillant, 2 silentblocs caoutchouc)</td><td>[REF À VÉRIFIER]</td><td>Pan. 4.2.1.A</td></tr>
                <tr><td>505</td><td>Chaîne transmission avant (maillons 38,4 mm, acier allié trempé, allongement max 2%)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.4.1.A</td></tr>
                <tr><td>506</td><td>Chaîne transmission arrière (maillons 38,4 mm, acier allié trempé, allongement max 2%)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.4.2.A</td></tr>
                <tr><td>507</td><td>Pignon chaîne avant (18 dents, acier cémenté 58 HRC, largeur 50 mm, alésage 60 mm)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.4.1.A</td></tr>
                <tr><td>508</td><td>Pignon chaîne arrière (18 dents, acier cémenté 58 HRC, largeur 50 mm, alésage 60 mm)</td><td>[REF À VÉRIFIER]</td><td>Pan. 2.4.2.A</td></tr>
                <tr><td>509</td><td>Roulement articulation (à rouleaux coniques, diamètre ext 320 mm, charge radiale 50 tonnes)</td><td>[REF À VÉRIFIER]</td><td>Pan. 4.2.1.A</td></tr>
                <tr><td>510</td><td>Joint de cardan articulation (croisillon 35 mm, 4 paliers aiguilles, graissage centralisé)</td><td>[REF À VÉRIFIER]</td><td>Pan. 4.2.2.A</td></tr>
                <tr><td>511</td><td>Pneu avant 17,5×25 L5S (20 plis, nylon, smooth tread, 10500 kg charge, tubeless)</td><td>[REF À VÉRIFIER]</td><td>Pan. 9.2.1.A</td></tr>
                <tr><td>512</td><td>Pneu arrière 17,5×25 L5S (20 plis, nylon, smooth tread, 10500 kg charge, tubeless)</td><td>[REF À VÉRIFIER]</td><td>Pan. 9.2.1.A</td></tr>
                <tr><td>513</td><td>Jante 17,5×25 (acier 9 mm, démontable 3 pièces, siège 15°, trou central 221 mm)</td><td>[REF À VÉRIFIER]</td><td>Pan. 9.2.1.A</td></tr>
                <tr><td>514</td><td>Boulon roue (M22×1,5, grade 12.9, couple serrage 650 Nm, freinage frein filet nylon)</td><td>[REF À VÉRIFIER]</td><td>Pan. 9.2.3.A</td></tr>
                <tr><td>515</td><td>Silentbloc moteur (caoutchouc NR + métal, charge 500 kg, déformation max 15%, 4 pièces)</td><td>[REF À VÉRIFIER]</td><td>Pan. 9.4.1.A</td></tr>
              </tbody>
            </table>
          </div>
        </article>

        {/* CHAPITRE 2 : PHOTOS */}
        <article id="ch2" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 2 — PHOTOS RÉELLES AVANT/PENDANT/APRÈS</h2>
          <p className="cahier-intro text-slate-600 mb-6">20 procédures minimum. Pour chaque : 4 photos avec légendes détaillées.</p>
          
          {cahierProcedures.map((proc, procIdx) => (
            <div className="photo-procedure border-b border-slate-200 pb-8 mb-8" id={proc.id} key={proc.id}>
              <h3 className="font-bold text-lg text-slate-800 mb-4">{proc.title}</h3>
              <div className="photo-grid">
                {proc.photos.map((photo, photoIdx) => (
                  <div className="photo-placeholder" key={photoIdx}>
                    <img 
                      src={photo.realUrl || getPlaceholderSvg(photo.type, photo.title, "DSLR Canon EOS 5D Mark IV, 24-70mm f/2.8, ISO 800, f/5.6, 1/125s", photo.subject, photo.prompt)} 
                      alt={photo.alt} 
                      className="photo-realiste w-full h-auto rounded-md shadow-md border border-slate-300 object-cover aspect-[4/3]"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <p className="photo-legende-photo mt-3 text-sm text-slate-600">
                      <strong>Cadrage :</strong> {photo.cadrage}
                      <br /><strong>Sujet :</strong> {photo.subject}
                      {photo.details && <><br /><strong>Détails visibles :</strong> {photo.details}</>}
                      {photo.contexte && <><br /><strong>Contexte :</strong> {photo.contexte}</>}
                      {photo.message && <><br /><strong>⚠️ Message :</strong> {photo.message}</>}
                      {photo.outils && <><br /><strong>🔧 Outils :</strong> {photo.outils}</>}
                      {photo.validation && <><br /><strong>✅ Validation :</strong> {photo.validation}</>}
                      {photo.ligneRouge && <><br /><strong>🚨 Ligne rouge :</strong> {photo.ligneRouge}</>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </article>

        {/* CHAPITRE 3 : STORYBOARDS */}
        <article id="ch3" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 3 — STORYBOARDS DE TOURNAGE</h2>
          <p className="cahier-intro text-slate-600 mb-6">15 procédures filmées — plans, cadrages et consignes pour vidéaste terrain</p>
          
          <div className="flex flex-col gap-8 mt-6">
            {/* STORYBOARD 3.1 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.1</span>
                    STORYBOARD 3.1 — 5.1.1.A : REMPLACEMENT DISQUES FREIN SAHR
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Séquençage complet pour l'intervention critique sur les freins de secours et de parc SAHR</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 45s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:05) — LOTO et Préparation</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Large</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 24mm | f/5.6 | ISO 800 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> Vue générale du ST7 côté roue avant gauche. Le mécanicien s'approche avec sa caisse à outils Epiroc rouge. Cadenassage (LOTO) enclenché et panneau d'avertissement bien visible en cabine.</p>
                  <p className="mb-1"><strong>Audio :</strong> Ambiance atelier de mine. Voix-Off : "Procédure 5.1.1.A. Remplacement des disques de frein SAHR. Arrêt moteur et LOTO appliqués."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:05] 5.1.1.A | 00:00 | ARRÊT MOTEUR — SÉCURITÉ LOTO ENCLENCHÉE</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:05 - 00:25) — Extraction des disques usés</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 100mm Macro | f/4 | ISO 800 | Rail de guidage</p>
                  <p className="mb-1"><strong>Visuel :</strong> Retrait de l'écrou principal M22 à l'aide d'une clé à choc pneumatique. Positionnement précis de l'extracteur Epiroc 8234-001. Glissement sécurisé des disques usés hors du moyeu.</p>
                  <p className="mb-1"><strong>Audio :</strong> Bruit réaliste de clé pneumatique. Voix-Off : "Désassemblage sécurisé. Attention constante à la pression des ressorts internes."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:05-00:25] 5.1.1.A | 00:15 | DEPOSE DES DISQUES USÉS AVEC EXTRACTEUR</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:25 - 00:45) — Remontage et Serrage au Couple</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 (Caméra embarquée sur harnais) | 4K | ISO 400</p>
                  <p className="mb-1"><strong>Visuel :</strong> Insertion des disques de friction neufs et lubrifiés. Utilisation de la clé dynamométrique Epiroc calibrée pour appliquer le couple exact de 650 Nm sur les vis de cloche.</p>
                  <p className="mb-1"><strong>Audio :</strong> Clic d'embrayage métallique net. Voix-Off : "Serrage final au couple prescrit de 650 Nm. Remontage de la protection latérale."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:25-00:45] 5.1.1.A | 00:35 | SERRAGE DÉFINITIF EN CROIX À 650 NM</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, RF 24-70mm, RF 100mm, GoPro Hero 12, Trépied, Projecteur LED Aputure.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> LOTO, EPI complets (cadenas, cales de roue, gants, lunettes), témoin requis.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Cut sec, correction colorimétrique LUT Epiroc, Logo animé (3s), audio H.264.</div>
              </div>
            </div>

            {/* STORYBOARD 3.2 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.2</span>
                    STORYBOARD 3.2 — 5.1.2.A : REMPLACEMENT ACCUMULATEUR FREIN
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Remplacement sécurisé de la cartouche de l'accumulateur d'azote</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 30s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:05) — Vérification de la précharge</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 100mm Macro | f/4 | ISO 800</p>
                  <p className="mb-1"><strong>Visuel :</strong> Raccordement du manomètre Epiroc sur la valve de l'accumulateur défectueux. Lecture d'une pression nulle ou insuffisante sous l'oeil d'un collègue.</p>
                  <p className="mb-1"><strong>Audio :</strong> Souffle d'air comprimé. Voix-Off : "Vérification de la charge résiduelle d'azote. Dépressurisation complète."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:05] 5.1.2.A | 00:00 | PURGE DE LA PRESSION RÉSIDUELLE D'AZOTE</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:05 - 00:20) — Dépose de l'accumulateur</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 sur harnais | 4K | ISO 400</p>
                  <p className="mb-1"><strong>Visuel :</strong> Utilisation d'une clé à sangle métallique robuste pour desserrer l'accumulateur. Retrait à deux mains et pose dans un bac protecteur.</p>
                  <p className="mb-1"><strong>Audio :</strong> Crissements de desserrage. Voix-Off : "Dépose sécurisée de la cartouche d'accumulateur. Préservation des filetages de base."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:05-00:20] 5.1.2.A | 00:10 | DÉPOSE DE LA CARTOUCHE D'ACCUMULATEUR</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:20 - 00:30) — Installation et test</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Large</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 35mm | f/5.6 | ISO 800 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> Pose de la cartouche neuve préchargée d'origine Epiroc (80 bar). Serrage final au couple de 120 Nm. Re-complètement de pression hydraulique.</p>
                  <p className="mb-1"><strong>Audio :</strong> Bruit de pompe hydraulique en arrière-plan. Voix-Off : "Mise en service de l'accumulateur neuf. Test de charge concluant."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:20-00:30] 5.1.2.A | 00:25 | ACCUMULATEUR NEUF POSÉ — TEST OK</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, RF 24-70mm, GoPro Hero 12, Manomètre Epiroc, Clé à sangle.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> LOTO hydraulique, lunettes, écran facial de protection contre projection d'huile.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Fondu enchaîné doux, LUT Epiroc, Logo final, Encodage MP4 standard.</div>
              </div>
            </div>

            {/* STORYBOARD 3.3 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.3</span>
                    STORYBOARD 3.3 — 2.1.1.A : DÉMONTAGE CONVERTISSEUR FUNK DF150
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Démontage lourd du convertisseur hydraulique couplé au bloc boîte de vitesses</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 60s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:10) — Accès et calage de sécurité</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Large</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 24mm | f/5.6 | ISO 600 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> ST7 sécurisé avec béquille d'articulation centrale déployée et verrouillée. Traces visibles d'huile rouge ATF sous la cloche de transmission.</p>
                  <p className="mb-1"><strong>Audio :</strong> Bourdonnement d'aspirateur d'air. Voix-Off : "Démontage du convertisseur Funk DF150. Machine verrouillée et sécurisée."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:10] 2.1.1.A | 00:00 | SÉCURISATION MACHINE — BÉQUILLE ARTICULATION EN PLACE</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:10 - 00:35) — Déconnexion du volant moteur</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 sur harnais avec projecteur de poitrine LED | 4K</p>
                  <p className="mb-1"><strong>Visuel :</strong> Installation de l'outil de vire-vire sur la couronne. Rotation manuelle pas-à-pas pour accéder aux vis du volant moteur. Dévissage systématique en étoile.</p>
                  <p className="mb-1"><strong>Audio :</strong> Clics de cliquet robustes. Voix-Off : "Accès aux boulons d'accouplement via la trappe de visite. Dévissage progressif en étoile."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:10-00:35] 2.1.1.A | 00:20 | DEVISSAAGE EN ETOILE DES BOULONS DE VOLANT</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:35 - 00:60) — Extraction avec grue d'atelier</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 50mm | f/4 | ISO 800 | Stabilisateur DJI RS 3</p>
                  <p className="mb-1"><strong>Visuel :</strong> Élingues de levage de 2 tonnes fixées sur les anneaux du convertisseur. Dépose en douceur à l'aide d'une grue d'atelier. Exposition du plan de joint de carter net.</p>
                  <p className="mb-1"><strong>Audio :</strong> Bruit de chaîne métallique sous tension. Voix-Off : "Soutien et extraction douce. Veiller à l'absence de contact brutal avec le nez du vilebrequin."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:35-00:60] 2.1.1.A | 00:50 | EXTRACTION DOUCE AVEC GRUE ET ELINGUES</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, RF 24-70mm, GoPro Hero 12, Grue d'atelier, Sangles 2 tonnes.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Cales de sécurité, béquille d'articulation d'origine verrouillée, gants lourds.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Cut sec, ralentis sur le levage (0.5x), musique d'ambiance d'usine neutre.</div>
              </div>
            </div>

            {/* STORYBOARD 3.4 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.4</span>
                    STORYBOARD 3.4 — 2.2.1.A : DÉMONTAGE EMBRAYAGE POWER SHIFT
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Désassemblage interne de la boîte de vitesses assistée Power Shift Funk DF150</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 50s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:10) — Ouverture du carter arrière</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 50mm | f/4 | ISO 800</p>
                  <p className="mb-1"><strong>Visuel :</strong> Transmission déposée sur le banc d'atelier. L'huile a été vidangée au préalable. Déboulonnage en croix de la plaque de fermeture arrière.</p>
                  <p className="mb-1"><strong>Audio :</strong> Bruit d'huile résiduelle qui s'écoule. Voix-Off : "Démontage de l'embrayage Power Shift. Retrait du carter de cloche externe."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:10] 2.2.1.A | 00:00 | OUVERTURE ET VIDANGE COMPLÈTE DE LA TRANSMISSION</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:10 - 00:30) — Extraction de l'arbre d'embrayage</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 100mm Macro | f/5.6 | ISO 1000 | Rail mobile</p>
                  <p className="mb-1"><strong>Visuel :</strong> Installation de l'extracteur mécanique à griffes Epiroc sur l'axe cannelé. Extraction progressive du tambour contenant l'empilement de disques.</p>
                  <p className="mb-1"><strong>Audio :</strong> Cliquetis de la vis de force de l'extracteur. Voix-Off : "Mise en tension de l'extracteur à griffes. Retrait axial du tambour sans déformation."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:10-00:30] 2.2.1.A | 00:15 | DEPOSE DU TAMBOUR AVEC EXTRACTEUR À GRIFFES</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:30 - 00:50) — Inspection des disques</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Très Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 100mm Macro | f/2.8 | ISO 1200 | Focalisation manuelle</p>
                  <p className="mb-1"><strong>Visuel :</strong> Gros plan macro sur l'état d'usure des garnitures métalliques et organiques. Mise en évidence de traces de frottement ou de bleuissement.</p>
                  <p className="mb-1"><strong>Audio :</strong> VO : "Contrôle d'usure. Remplacement requis si les disques montrent des signes de surchauffe."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:30-00:50] 2.2.1.A | 00:40 | CONTRÔLE VISUEL ET MESURE DES DISQUES EN ATELIER</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, RF 100mm, Rail de caméra, Extracteur à griffes Epiroc.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Pièces lubrifiées glissantes, gants de mécanique requis, lunettes.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Flous de transition artistiques, LUT Epiroc chaude, Logo de fin.</div>
              </div>
            </div>

            {/* STORYBOARD 3.5 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.5</span>
                    STORYBOARD 3.5 — 1.1.2.B : REMPLACEMENT INJECTEUR QSB 6.7
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Remplacement d'un injecteur sur moteur Diesel Cummins QSB 6.7 à rampe commune</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 40s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:10) — Dépose du cache et LOTO</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 50mm | f/4 | ISO 800</p>
                  <p className="mb-1"><strong>Visuel :</strong> Cache culasse déposé. Le moteur est propre, exempt de graisse extérieure. Marquage et étiquetage LOTO électrique sur le disjoncteur général de batterie.</p>
                  <p className="mb-1"><strong>Audio :</strong> Bruit d'outils à main posés sur plateau inox. Voix-Off : "Remplacement de l'injecteur Cummins. Circuit carburant dépressurisé."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:10] 1.1.2.B | 00:00 | DEPOSE DU CACHE-CULASSE — CIRCUIT BASSE PRESSION</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:10 - 00:25) — Extraction à inertie</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 sur harnais de poitrine | 4K | ISO 400</p>
                  <p className="mb-1"><strong>Visuel :</strong> Raccordement de l'extracteur d'injecteur dédié Epiroc 8234-056 sur la tête de l'injecteur grippé. Trois coups secs appliqués pour décoller l'injecteur de son logement.</p>
                  <p className="mb-1"><strong>Audio :</strong> Impact métallique lourd et net. Voix-Off : "Extraction à l'aide de l'outil d'inertie 8234-056. Veiller à ne pas heurter la rampe de distribution."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:10-00:25] 1.1.2.B | 00:15 | EXTRACTION DE L'INJECTEUR AVEC L'OUTIL DÉDIÉ</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:25 - 00:40) — Pose du neuf</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 100mm Macro | f/4 | ISO 600 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> Nettoyage du puits au chiffon non pelucheux. Pose d'un joint en cuivre neuf, introduction de l'injecteur neuf et serrage au couple de 30 Nm avec clé dynamométrique.</p>
                  <p className="mb-1"><strong>Audio :</strong> Clic de couple. Voix-Off : "Nettoyage minutieux et changement de joint. Serrage de bride à 30 Nm."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:25-00:40] 1.1.2.B | 00:30 | JOINT NEUF POSÉ — SERRAGE BRIDE À 30 NM</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, RF 100mm, GoPro Hero 12, Extracteur Epiroc 8234-056.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Circuit de carburant haute pression (décharge préalable), LOTO électrique.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Insertion de graphiques d'aide à l'écran, LUT Epiroc, Logo animé.</div>
              </div>
            </div>

            {/* STORYBOARD 3.6 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.6</span>
                    STORYBOARD 3.6 — 3.1.1.A : REMPLACEMENT POMPE REXROTH A10VO
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Remplacement de la pompe hydraulique principale à pistons axiaux et cylindrée variable</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 55s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:10) — Consignation hydraulique</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 35mm | f/4 | ISO 800</p>
                  <p className="mb-1"><strong>Visuel :</strong> Accès à la pompe située sous le berceau central. Soupapes de décharge ouvertes, consignation physique appliquée et bac de vidange d'huile placé sous les conduites.</p>
                  <p className="mb-1"><strong>Audio :</strong> Grincements de soupapes hydrauliques. Voix-Off : "Consignation hydraulique validée. Vidange préalable de l'huile résiduelle."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:10] 3.1.1.A | 00:00 | DEPRESSURISATION ET CONSIGNATION DU CIRCUIT</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:10 - 00:35) — Déconnexion des liaisons HP</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 sur trépied magnétique fixé au châssis | 4K</p>
                  <p className="mb-1"><strong>Visuel :</strong> Déconnexion de la bride d'aspiration et de la conduite haute pression en acier. Utilisation de bouchons de protection étanches sur chaque orifice ouvert.</p>
                  <p className="mb-1"><strong>Audio :</strong> Clic d'ajustement de clé plate. Voix-Off : "Retrait des flexibles et de la ligne de drain. Pose immédiate de bouchons étanches de taille appropriée."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:10-00:35] 3.1.1.A | 00:15 | DÉCONNEXION DE LA BRIDE HP ET POSE DE BOUCHONS</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:35 - 00:55) — Extraction et repose</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Large</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 50mm | f/5.6 | ISO 800</p>
                  <p className="mb-1"><strong>Visuel :</strong> Levage mécanique léger de la pompe Rexroth A10VO usée. Introduction de la pompe neuve, pré-remplie d'huile hydraulique neuve Epiroc. Serrage en croix à 140 Nm.</p>
                  <p className="mb-1"><strong>Audio :</strong> Clic de serrage d'une clé dynamométrique d'atelier. Voix-Off : "Extraction et mise en place de l'unité neuve pré-remplie d'huile propre. Serrage de bride à 140 Nm."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:35-00:55] 3.1.1.A | 00:45 | POSE DE LA NOUVELLE POMPE — SERRAGE À 140 NM</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, GoPro Hero 12, Support magnétique, Élingue de levage.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Pression hydraulique résiduelle nulle, lunettes, bac et absorbants à portée.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Cut sec, insertion de flèches explicatives à l'écran, logo d'outro.</div>
              </div>
            </div>

            {/* STORYBOARD 3.7 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-7">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.7</span>
                    STORYBOARD 3.7 — 3.3.2.A : REMPLACEMENT VÉRIN HOIST 125mm
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Dépose et pose sécurisées d'un vérin hydraulique de levage de flèche de 125 mm</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 45s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:10) — Calage mécanique et LOTO</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Large</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 24mm | f/4 | ISO 800 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> Bras de levage fermement calé par les béquilles d'origine Epiroc pour interdire toute chute accidentelle. Câble électrique et batterie isolés.</p>
                  <p className="mb-1"><strong>Audio :</strong> Grincements métalliques de calage. Voix-Off : "Remplacement du vérin Hoist. Bras sécurisé mécaniquement par béquille."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:10] 3.3.2.A | 00:00 | CALAGE MÉCANIQUE DU BRAS DE LEVAGE AVEC BÉQUILLE</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:10 - 00:30) — Dépose des axes</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 sur harnais de poitrine | 4K</p>
                  <p className="mb-1"><strong>Visuel :</strong> Vérin soutenu par une sangle en polyester de 5 tonnes. Chasse-axe pneumatique employé pour extraire l'axe supérieur de chape graisseux.</p>
                  <p className="mb-1"><strong>Audio :</strong> Sons de frappe répétitifs. Voix-Off : "Extraction des axes de fixation. Sécurisation du vérin à l'aide d'élingues de levage robustes."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:10-00:30] 3.3.2.A | 00:15 | DÉPOSE DE L'AXE SUPÉRIEUR DE CHAPE AU CHASSE-AXE</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:30 - 00:45) — Pose et branchement</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 50mm | f/5.6 | ISO 800 | Stabilisateur</p>
                  <p className="mb-1"><strong>Visuel :</strong> Guidage du vérin de levage neuf de 125 mm dans ses supports. Remplacement des circlips et graissage final de l'axe à la pompe.</p>
                  <p className="mb-1"><strong>Audio :</strong> Cliquetis de pompe à graisse. Voix-Off : "Mise en place de l'unité neuve. Graissage final et raccordement."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:30-00:45] 3.3.2.A | 00:35 | RACCORDEMENT ET GRAISSAGE FINAL DES AXES</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, GoPro Hero 12, Sangle polyester 5 tonnes, Pompe à graisse.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Béquille mécanique obligatoire, interdiction de passer sous le bras.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Ralentis lors de l'extraction de l'axe, logo Epiroc, Encodage H.264.</div>
              </div>
            </div>

            {/* STORYBOARD 3.8 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.8</span>
                    STORYBOARD 3.8 — 3.1.2.A : REMPLACEMENT FILTRE RETURN LINE 12µ
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Remplacement périodique de l'élément filtrant de retour hydraulique de haute précision</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 30s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:05) — Accès et arrêt</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 35mm | f/4 | ISO 800</p>
                  <p className="mb-1"><strong>Visuel :</strong> Localisation du couvercle de filtre sur le réservoir hydraulique. Moteur à l'arrêt, LOTO appliqué sur le commutateur de batterie général.</p>
                  <p className="mb-1"><strong>Audio :</strong> Calme complet d'atelier. Voix-Off : "Remplacement du filtre de retour 12µ. Réservoir dépressurisé."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:05] 3.1.2.A | 00:00 | ARRET ET DEPRESSURISATION DE LA CUVE HYDRAULIQUE</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:05 - 00:20) — Dépose de l'élément filtrant</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 sur sangle frontale | 4K | Lampe LED frontale</p>
                  <p className="mb-1"><strong>Visuel :</strong> Ouverture du couvercle avec une clé à sangle d'origine Epiroc. Retrait délicat de la cartouche 12 microns usée et saturée. Dépôt dans un sac étanche.</p>
                  <p className="mb-1"><strong>Audio :</strong> Léger glouglou d'huile. Voix-Off : "Retrait de l'élément filtrant usé. Analyse visuelle rapide de présence de limaille."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:05-00:20] 3.1.2.A | 00:10 | DEPOSE DE L'ELEMENT USÉ ET EVACUATION SECURISEE</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:20 - 00:30) — Pose du filtre neuf</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 100mm Macro | f/4 | ISO 800 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> Lubrification du joint torique neuf à l'huile hydraulique propre. Insertion de la cartouche neuve d'origine Epiroc, fermeture manuelle ferme puis serrage à 40 Nm.</p>
                  <p className="mb-1"><strong>Audio :</strong> Bruit métallique de serrage. Voix-Off : "Joint lubrifié et cartouche neuve en place. Serrage manuel final à 40 Nm."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:20-00:30] 3.1.2.A | 00:25 | FILTRE 12µ NEUF EN PLACE — JOINT REPOSÉ ET SERRÉ</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, GoPro Hero 12, Clé à sangle Epiroc, Bac de récupération.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Environnement propre (zéro contaminant), gants nitrile fins, LOTO.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Cut sec, fiches explicatives incrustées en infographie, logo d'outro.</div>
              </div>
            </div>

            {/* STORYBOARD 3.9 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-9">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.9</span>
                    STORYBOARD 3.9 — 1.1.3.B : NETTOYAGE V-TUBE CORE RADIATOR
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Nettoyage haute pression à l'eau des ailettes du radiateur V-tube obstruées par la poussière de mine grasse</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 35s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:05) — Constat et préparation</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 (Boîtier étanche sur trépied) | 4K | ISO 400</p>
                  <p className="mb-1"><strong>Visuel :</strong> Calandre arrière pivotante du ST7 ouverte. Le radiateur est visible, largement obstrué par un mélange de sédiments et d'huile. Câble d'alimentation isolé.</p>
                  <p className="mb-1"><strong>Audio :</strong> Léger bruit de ventilation d'atelier. Voix-Off : "Nettoyage du radiateur V-Tube. Éloignement des composants électriques."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:05] 1.1.3.B | 00:00 | OUVERTURE DE LA CALANDRE ARRIÈRE — ACCÈS CONSTATS</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:05 - 00:20) — Pulvérisation dégraissante</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 50mm | f/4 | ISO 800 | Stabilisateur</p>
                  <p className="mb-1"><strong>Visuel :</strong> Pulvérisation uniforme d'un produit dégraissant biodégradable Epiroc d'origine sur l'ensemble de la surface à l'aide d'un pulvérisateur manuel.</p>
                  <p className="mb-1"><strong>Audio :</strong> Chuchotement de pulvérisation. Voix-Off : "Application homogène du dégraissant Epiroc. Laisser agir 5 minutes sous surveillance d'un témoin."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:05-00:20] 1.1.3.B | 00:10 | APPLICATION DU DÉGRAISSANT ET TEMPS DE POSE</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:20 - 00:35) — Rinçage haute pression</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 (Objectif grand angle étanche) | 4K | ISO 400</p>
                  <p className="mb-1"><strong>Visuel :</strong> Rinçage complet à la lance haute pression à 120 bar. Buse maintenue à une distance minimale de 30 cm et strictement perpendiculaire aux tubes de cuivre.</p>
                  <p className="mb-1"><strong>Audio :</strong> Vrombissement du jet d'eau à haute pression. Voix-Off : "Rinçage perpendiculaire strict à 120 bar. Protection des ailettes contre le pliage."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:20-00:35] 1.1.3.B | 00:25 | RINÇAGE COMPLET À LA LANCE PERPENDICULAIRE 120 BAR</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> GoPro Hero 12 (Étanche), Canon R5, Nettoyeur HP, Pulvérisateur.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Lunettes étanches de protection, écran facial contre projections, gants imperméables.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Transitions dynamiques, vitesse accélérée au rinçage (1.5x), logo de fin.</div>
              </div>
            </div>

            {/* STORYBOARD 3.10 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.10</span>
                    STORYBOARD 3.10 — 2.2.2.A : CALIBRATION RCS TRANSMISSION
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Calibration logicielle via le système de contrôle électronique Rig Control System (RCS)</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 40s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:10) — Raccordement du PC</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 35mm | f/4 | ISO 800</p>
                  <p className="mb-1"><strong>Visuel :</strong> Mécanicien assis en cabine ST7. Raccordement de l'adaptateur Kvaser USB-to-CAN sur le port de diagnostic de cabine d'un côté et sur le PC portable de l'autre.</p>
                  <p className="mb-1"><strong>Audio :</strong> Petit clic de connexion USB. Voix-Off : "Raccordement du matériel de diagnostic. Bus CAN opérationnel et identifié."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:10] 2.2.2.A | 00:00 | HARNAIS DE DIAGNOSTIC BRANCHÉ SUR PORT CABINE ST7</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:10 - 00:30) — Navigation écran RCS</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 sur support ventouse fixé à la vitre | 4K | ISO 400</p>
                  <p className="mb-1"><strong>Visuel :</strong> Gros plan sur l'écran d'affichage RCS intégré au tableau de bord. Navigation rapide dans le menu "Service - Calibration - Transmission Funk DF150". Lancement du cycle.</p>
                  <p className="mb-1"><strong>Audio :</strong> Clics de boutons physiques. Voix-Off : "Sélection de l'onglet de recalibration. Lancement de la procédure automatisée au ralenti moteur."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:10-00:30] 2.2.2.A | 00:15 | SELECTION ET DEBUT DE PROCEDURE AUTOMATISÉE</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:30 - 00:40) — Confirmation et validation</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 100mm Macro | f/4 | ISO 600 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> Affichage d'un message vert "Transmission Calibration Successful" sur l'écran RCS. Validation manuelle des données et sauvegarde des paramètres.</p>
                  <p className="mb-1"><strong>Audio :</strong> Léger signal sonore de réussite. Voix-Off : "Calibration terminée avec succès. Données sauvegardées."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:30-00:40] 2.2.2.A | 00:35 | CALIBRATION TERMINÉE ET SAUVEGARDÉE SUR LE RCS</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, GoPro Hero 12, Adaptateur Kvaser USB-to-CAN, PC d'atelier.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Frein de stationnement enclenché, moteur au ralenti stabilisé, cales de roue posées.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Incrustation écran PC claire, LUT Epiroc, Logo d'outro.</div>
              </div>
            </div>

            {/* STORYBOARD 3.11 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-11">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.11</span>
                    STORYBOARD 3.11 — 10.4.1.A : CALIBRATION LOAD WEIGHING
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Étalonnage et calibration de précision du système de pesage de charge utile embarqué</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 35s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:05) — Alignement de la machine</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Large</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 24mm | f/5.6 | ISO 800 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> ST7 garé à plat sur le sol bétonné rectiligne d'atelier. Le godet est posé à plat au sol, entièrement vide. Aucun obstacle à proximité immédiate.</p>
                  <p className="mb-1"><strong>Audio :</strong> Grondement sourd de moteur au ralenti. Voix-Off : "Calibration du système de pesée. Machine positionnée sur sol plan."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:05] 10.4.1.A | 00:00 | ALIGNEMENT ET MISE À ZÉRO DU GODET VIDE</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:05 - 00:20) — Levage de la charge étalon</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Large</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 50mm | f/4 | ISO 800 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> Levage complet du godet chargé d'un bloc de béton d'étalonnage métallique de 5000 kg pesé à l'aide d'un peson externe.</p>
                  <p className="mb-1"><strong>Audio :</strong> Sifflement de l'hydraulique de levage. Voix-Off : "Levage continu de la masse d'étalonnage de 5,0 tonnes. Surveillance de la stabilité."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:05-00:20] 10.4.1.A | 00:10 | LEVAGE EN UN SEUL MOUVEMENT DE LA CHARGE ÉTALON DE 5,0 T</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:20 - 00:35) — Ajustement des paramètres</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 fixé par ventouse en cabine | 4K | ISO 400</p>
                  <p className="mb-1"><strong>Visuel :</strong> Saisie de la valeur exacte "5000 kg" sur le pavé numérique de l'écran RCS cabine. Enregistrement et affichage de la valeur calibrée.</p>
                  <p className="mb-1"><strong>Audio :</strong> BIP de touches. Voix-Off : "Saisie de la masse étalon de référence. Tarage et enregistrement des paramètres."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:20-00:35] 10.4.1.A | 00:25 | SAISIE DE LA VALEUR ÉTALON ET SAUVEGARDE EN CABINE</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, GoPro Hero 12, Bloc de calibration 5000 kg, Trépied.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Zone de levage balisée d'un périmètre rouge de sécurité, témoin au loin.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Cut sec, incrustation de l'infographie de tarage, logo final.</div>
              </div>
            </div>

            {/* STORYBOARD 3.12 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.12</span>
                    STORYBOARD 3.12 — 7.4.1.A : REMPLACEMENT CAPTEUR DOOR INTERLOCK
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Remplacement et calage du capteur de sécurité d'ouverture de porte cabine</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 25s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:05) — Dépose du capteur défectueux</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 50mm | f/4 | ISO 800</p>
                  <p className="mb-1"><strong>Visuel :</strong> Porte cabine ouverte. Localisation du capteur inductif sur le montant. Cadenassage électrique (LOTO) en place sur le tableau divisionnaire.</p>
                  <p className="mb-1"><strong>Audio :</strong> Clic d'ouverture de porte. Voix-Off : "Remplacement du capteur de sécurité. Système électrique hors tension."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:05] 7.4.1.A | 00:00 | SÉCURITÉ CONSIGNÉE — DÉCONNEXION DU FAISCEAU CAPTEUR</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:05 - 00:15) — Pose et branchement Deutsch</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 100mm Macro | f/4 | ISO 800 | Rail de mise au point</p>
                  <p className="mb-1"><strong>Visuel :</strong> Installation du nouveau capteur inductif de sécurité. Raccordement direct sur le connecteur étanche type Deutsch DT d'origine Epiroc.</p>
                  <p className="mb-1"><strong>Audio :</strong> Clic net de verrouillage de connecteur étanche. Voix-Off : "Raccordement de la fiche Deutsch étanche d'origine. Aucun jeu n'est admis."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:05-00:15] 7.4.1.A | 00:10 | POSE DU CAPTEUR NEUF ET RACCORDEMENT DEUTSCH IP67</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:15 - 00:25) — Réglage de l'entrefer</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Très Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 (Sangle frontale) | 4K | ISO 400</p>
                  <p className="mb-1"><strong>Visuel :</strong> Utilisation d'un jeu d'épaisseurs (jauges de calage) pour ajuster l'écartement (entrefer) entre la cible et le nez du capteur à 3,0 mm précisément.</p>
                  <p className="mb-1"><strong>Audio :</strong> Frottements légers de jauges métalliques. Voix-Off : "Réglage d'entrefer à la cale à 3,0 mm. Blocage final des écrous de calage."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:15-00:25] 7.4.1.A | 00:20 | REGLAGE PRECIS DE L'ENTREFER À 3,0 MM À LA CALE DE JAUGE</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, RF 100mm, GoPro Hero 12, Jeu de cales d'épaisseur.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> LOTO électrique, interdiction de tester le circuit en mouvement.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Transition douce, gros plans ralentis, logo de fin.</div>
              </div>
            </div>

            {/* STORYBOARD 3.13 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-13">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.13</span>
                    STORYBOARD 3.13 — 7.3.1.A : REMPLACEMENT CAMÉRA AVANT/ARRIÈRE
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Remplacement et câblage d'un module de caméra étanche IP69K endommagé</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 30s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:05) — Démontage du blindage</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 50mm | f/4 | ISO 800 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> Caméra usée brisée à l'avant gauche. Desserrage des quatre boulons de la chape métallique de blindage en acier de 6 mm.</p>
                  <p className="mb-1"><strong>Audio :</strong> Grincements d'outils d'atelier. Voix-Off : "Remplacement du module caméra. Dépouillement du capot blindé protecteur."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:05] 7.3.1.A | 00:00 | RETRAIT DU CAPOT BLINDÉ EN ACIER DE PROTECTION 6 MM</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:05 - 00:20) — Raccordement du connecteur M12</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 100mm Macro | f/4 | ISO 800</p>
                  <p className="mb-1"><strong>Visuel :</strong> Remplacement par un module étanche d'origine Epiroc. Branchement soigné du connecteur coaxial à vis de type M12 blindé et serrage final de la bague d'étanchéité.</p>
                  <p className="mb-1"><strong>Audio :</strong> Clic d'introduction à vis. Voix-Off : "Raccordement coaxial blindé étanche M12. Assurer l'orientation et l'absence d'humidité."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:05-00:20] 7.3.1.A | 00:10 | POSE MODULE IP69K ET SERRAGE BAGUE ETANCHE M12</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:20 - 00:30) — Test de retour vidéo</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 fixée en cabine | 4K | ISO 400</p>
                  <p className="mb-1"><strong>Visuel :</strong> Vue sur l'écran d'affichage cabine. Image vidéo claire s'affiche instantanément sans aucune latence à l'écran lors du démarrage système.</p>
                  <p className="mb-1"><strong>Audio :</strong> BIP système. Voix-Off : "Retour vidéo validé à l'écran. Repose finale du capot de blindage."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:20-00:30] 7.3.1.A | 00:25 | TEST REUSSI SUR ÉCRAN CABINE — IMAGE SANS LATENCE</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, GoPro Hero 12, Tournevis dynamométrique M12, Clés plates.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Circuit basse tension, coupe-batterie activé au préalable (LOTO).</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Cut sec, insertion de la vue cabine en incrustation, logo Epiroc.</div>
              </div>
            </div>

            {/* STORYBOARD 3.14 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-14">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.14</span>
                    STORYBOARD 3.14 — 2.4.1.A : RÉGLAGE TENSION CHAÎNES ROCK TOUGH 406
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Réglage de la tension des chaînes d'entraînement blindées Rock Tough 406</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 50s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:10) — Mise sur chandelles</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Large</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 24mm | f/5.6 | ISO 800 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> Machine levée et reposant sur des chandelles de sécurité robustes d'atelier de 15 tonnes. Le carter de protection latérale de chaîne est retiré.</p>
                  <p className="mb-1"><strong>Audio :</strong> Souffle de soufflette à air comprimé. Voix-Off : "Ajustement de la chaîne Rock Tough. Machine stabilisée sur chandelles."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:10] 2.4.1.A | 00:00 | SÉCURISATION MACHINE SUR CHANDELLES ATELIER 15T</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:10 - 00:35) — Vissage et tension</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Moyen</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 sur harnais | 4K | ISO 400</p>
                  <p className="mb-1"><strong>Visuel :</strong> Mesure de la flèche de chaîne (limite de 25 mm). Desserrage du contre-écrou et vissage de l'axe de tension à l'aide de la clé plate spéciale Epiroc.</p>
                  <p className="mb-1"><strong>Audio :</strong> Bruit d'acier et de clé à fourche lourde. Voix-Off : "Ajustement de tension. Mesure constante de la flèche résiduelle au réglet."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:10-00:35] 2.4.1.A | 00:20 | SERRAGE DU TENDEUR POUR OBTENIR UNE FLÈCHE DE 15 MM</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:35 - 00:50) — Serrage final</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 50mm | f/4 | ISO 800</p>
                  <p className="mb-1"><strong>Visuel :</strong> Resserrage définitif du contre-écrou de blocage au couple de 350 Nm à l'aide d'une clé dynamométrique d'atelier lourde.</p>
                  <p className="mb-1"><strong>Audio :</strong> Fort claquement métallique de déclenchement. Voix-Off : "Contre-écrou serré au couple final de 350 Nm. Vérification manuelle de rotation."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:35-00:50] 2.4.1.A | 00:40 | VERROUILLAGE CONTRE-ÉCROU AU COUPLE DE 350 NM</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, GoPro Hero 12, Clé à fourche spéciale Epiroc, Clé dynamométrique.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Machine calée sur chandelles agréées, gants de mécanique cuir épais.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Correction colorimétrique, ralentis sur le déclenchement, logo d'outro.</div>
              </div>
            </div>

            {/* STORYBOARD 3.15 */}
            <div className="storyboard-procedure bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id="storyboard-3-15">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">3.15</span>
                    STORYBOARD 3.15 — 3.1.4.A : PURGE HYDRAULIQUE COMPLÈTE
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Procédure de purge d'air intégrale du circuit hydraulique principal après maintenance lourde</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">⏱️ Durée indicative tournage : 60s</span>
                  <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded">🎥 4K 60fps — H.264 — 150 Mbps</span>
                </div>
              </div>

              <div className="storyboard-plans space-y-3 my-3">
                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 1 (00:00 - 00:10) — Re-complètement d'huile</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Large</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 35mm | f/5.6 | ISO 800 | Trépied</p>
                  <p className="mb-1"><strong>Visuel :</strong> Remplissage final du réservoir hydraulique principal à l'aide d'un pistolet de distribution propre avec l'huile hydraulique Epiroc d'origine.</p>
                  <p className="mb-1"><strong>Audio :</strong> Sifflement de distribution d'huile. Voix-Off : "Purge du système. Cuve hydraulique remplie d'huile d'origine à niveau max."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:00-00:10] 3.1.4.A | 00:00 | COMPLÉMENTATION INITIALE EN HUILE HYDRAULIQUE ET COUPE-BATTERIE ACTIF</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 2 (00:10 - 00:40) — Purge des points hauts</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Serré</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : GoPro Hero 12 sur harnais avec éclairage de poitrine LED | 4K</p>
                  <p className="mb-1"><strong>Visuel :</strong> Raccordement d'un tuyau flexible en silicone transparent sur la vis de purge du bloc de direction principal. Recueil de l'huile émulsionnée d'air dans un bocal propre.</p>
                  <p className="mb-1"><strong>Audio :</strong> Gargouillements réguliers de liquide sous pression. Voix-Off : "Purge successive des blocs. Le fluide doit s'écouler exempt de bulles."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:10-00:40] 3.1.4.A | 00:20 | PURGE JUSQU'À OBTENTION D'UN FLUIDE CLAIR ET SANS BULLE D'AIR</span>
                  </div>
                </div>

                <div className="plan bg-slate-50 p-3 rounded text-xs text-slate-600 border-l-2 border-slate-400">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Plan 3 (00:40 - 00:60) — Test dynamique final</span>
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Plan Large</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 mb-1">Appareil : Canon R5 + RF 24-70mm @ 50mm | f/4 | ISO 800 | Stabilisé</p>
                  <p className="mb-1"><strong>Visuel :</strong> Activation continue des commandes de direction gauche et droite puis de levage du bras. L'absence de bruit de cavitation sur la pompe est vérifiée.</p>
                  <p className="mb-1"><strong>Audio :</strong> Sifflement hydraulique de fonctionnement sain. Voix-Off : "Cycles complets de rodage. Zéro bruit suspect ou fuite résiduelle."</p>
                  <div className="plan-overlay mt-1 bg-black text-amber-400 font-mono p-1 rounded text-[10px]">
                    <span className="overlay-text font-bold">[00:40-00:60] 3.1.4.A | 00:50 | CYCLES COMPLETS DE FONCTIONNEMENT — SYSTÈME OPÉRATIONNEL</span>
                  </div>
                </div>
              </div>

              <div className="storyboard-specs grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded text-[11px] text-slate-600 border border-slate-100 mt-2">
                <div><span className="font-bold text-slate-800">🛠️ Équipement :</span> Canon R5, GoPro Hero 12, Flexible silicone transparent, Bocal propre de purge.</div>
                <div><span className="font-bold text-red-700">⚠️ Sécurité :</span> Port des EPI lourds contre jets haute pression de fluide hydraulique chaud.</div>
                <div><span className="font-bold text-slate-800">🎬 Post-Prod :</span> Accéléré sur la purge d'air (1.5x), musique d'usine, logo Epiroc.</div>
              </div>
            </div>
          </div>
        </article>

        {/* CHAPITRE 4 : ANIMATIONS 3D TECHNIQUES */}
        <article id="ch4" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 4 — ANIMATIONS TECHNIQUES INTERACTIVES</h2>
          <p className="cahier-intro text-slate-600 mb-6">
            Cette section présente trois cinématiques interactives vectorielles (SVG) conçues pour détailler le comportement dynamique, les pannes de fatigue, et les tolérances critiques du chargeur souterrain Epiroc ST7.
          </p>
          
          <div className="animation-bloc mb-10" id="anim-transmission">
            <h3 className="font-bold text-xl text-slate-800 mb-3">4.1 Cycle de fonctionnement du Moteur Cummins QSB 6.7 Tier 3 (45s)</h3>
            <AnimEngineQsb />
          </div>

          <div className="animation-bloc mb-10" id="anim-hydraulique">
            <h3 className="font-bold text-xl text-slate-800 mb-3">4.2 Circuit Hydraulique Load Sensing (Rexroth A10VO) (45s)</h3>
            <AnimHydraulicLS />
          </div>

          <div className="animation-bloc mb-10" id="anim-freinage">
            <h3 className="font-bold text-xl text-slate-800 mb-3">4.3 Freinage SAHR Force Cooled (Serrage Ressort, Relâchement Hydraulique) (45s)</h3>
            <AnimBrakesSahr />
          </div>
        </article>

        {/* CHAPITRE 5 : COTES */}
        <article id="ch5" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 5 — COTES, TOLÉRANCES ET PROCÉDURES DE CONTRÔLE</h2>
          <p className="cahier-intro text-slate-600 mb-8">
            30 tableaux de tolérances — instruments de mesure, procédures d'inspection et diagnostics de fatigue associés pour le chargeur souterrain Epiroc Scooptram ST7.
          </p>

          {COTES_DATA.map((section) => (
            <div key={section.id} className="cote-section mb-12" id={section.id}>
              <h3 className="text-xl font-bold text-amber-500 border-b border-slate-700 pb-2 mb-6 uppercase tracking-wider">
                {section.title}
              </h3>
              
              {section.tables.map((tbl) => (
                <div key={tbl.id} className="cotes-bloc p-5 bg-[#141414] border border-slate-800 rounded-lg mb-8" id={`storyboard-${tbl.id}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                    <h4 className="font-extrabold text-md text-slate-200">
                      TABLEAU {tbl.id} — {tbl.title}
                    </h4>
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded font-mono text-xs font-bold">
                      Procédure Réf: {tbl.ref}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded border border-slate-800">
                    <table className="cote-table cahier-tableau w-full text-left text-xs border-collapse bg-[#0c0c0c]">
                      <thead className="cote-thead bg-slate-900 border-b border-slate-800">
                        <tr>
                          <th className="px-3 py-2 font-bold text-slate-400 text-[10px] uppercase tracking-wider text-center w-12 border-r border-slate-800">N°</th>
                          <th className="px-3 py-2 font-bold text-slate-400 text-[10px] uppercase tracking-wider border-r border-slate-800">Point de contrôle</th>
                          <th className="px-3 py-2 font-bold text-slate-400 text-[10px] uppercase tracking-wider text-center border-r border-slate-800">Nominal</th>
                          <th className="px-3 py-2 font-bold text-slate-400 text-[10px] uppercase tracking-wider text-center border-r border-slate-800">Tolérance min</th>
                          <th className="px-3 py-2 font-bold text-slate-400 text-[10px] uppercase tracking-wider text-center border-r border-slate-800">Tolérance max</th>
                          <th className="px-3 py-2 font-bold text-slate-400 text-[10px] uppercase tracking-wider text-center w-16 border-r border-slate-800">Unité</th>
                          <th className="px-3 py-2 font-bold text-slate-400 text-[10px] uppercase tracking-wider border-r border-slate-800">Instrument de mesure</th>
                          <th className="px-3 py-2 font-bold text-slate-400 text-[10px] uppercase tracking-wider text-center w-14 border-r border-slate-800">Fréq.</th>
                          <th className="px-3 py-2 font-bold text-slate-400 text-[10px] uppercase tracking-wider text-center">Schéma lié</th>
                        </tr>
                      </thead>
                      <tbody className="cote-tbody divide-y divide-slate-800">
                        {tbl.rows.map((row) => (
                          <tr key={row[0]} className="hover:bg-slate-900/50 transition-colors">
                            <td className="px-3 py-2 text-center text-xs font-mono font-bold text-slate-500 bg-[#0e0e0e] border-r border-slate-800">{row[0]}</td>
                            <td className="px-3 py-2 text-slate-300 font-medium border-r border-slate-800">{row[1]}</td>
                            <td className="px-3 py-2 text-center font-bold text-amber-400 bg-amber-500/5 border-r border-slate-800">{row[2]}</td>
                            <td className="px-3 py-2 text-center text-slate-400 font-mono border-r border-slate-800">{row[3]}</td>
                            <td className="px-3 py-2 text-center text-slate-400 font-mono border-r border-slate-800">{row[4]}</td>
                            <td className="px-3 py-2 text-center text-slate-400 font-mono border-r border-slate-800">{row[5]}</td>
                            <td className="px-3 py-2 text-slate-300 border-r border-slate-800">{row[6]}</td>
                            <td className="px-3 py-2 text-center border-r border-slate-800"><span className="inline-block px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[10px] rounded font-mono">{row[7]}</span></td>
                            <td className="px-3 py-2 text-center text-[10px] font-mono text-slate-500 font-bold">{row[8]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="cote-procedure mt-4 p-4 bg-slate-900/30 border border-slate-800 rounded">
                    <h5 className="font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] text-black font-bold">i</span>
                      PROCÉDURE DE CONTRÔLE — Réf: {tbl.ref}
                    </h5>
                    <ol className="list-decimal pl-5 space-y-1.5 text-slate-300 text-xs">
                      <li><strong>Préparation :</strong> {tbl.prep}</li>
                      <li><strong>Positionnement :</strong> {tbl.pos}</li>
                      <li><strong>Mesure :</strong> {tbl.mesure}</li>
                      <li><strong>Enregistrement :</strong> {tbl.reg}</li>
                      <li><strong>Décision :</strong> {tbl.dec}</li>
                    </ol>
                  </div>

                  <div className="cote-diagnostic mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded">
                    <span className="diag-panne font-bold text-red-400 block text-xs">
                      ⚠️ PANNE SI HORS TOLÉRANCE : {tbl.diagnostic.panne}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-400">
                      <div><strong className="text-slate-500 uppercase font-sans">Réf. panne :</strong> {tbl.diagnostic.ref}</div>
                      <div><strong className="text-slate-500 uppercase font-sans">Arbre décision :</strong> {tbl.diagnostic.arbre}</div>
                      <div><strong className="text-slate-500 uppercase font-sans">Action immédiate :</strong> <span className="text-red-400">{tbl.diagnostic.action}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </article>

        {/* CHAPITRE 6 : OUTILS */}
        <article id="ch6" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 6 — FICHES TECHNIQUES DES OUTILS DE MAINTENANCE</h2>
          <p className="cahier-intro text-slate-400 mb-8 font-medium">
            Catalogue de 25 outils spécifiques requis pour la maintenance préventive et corrective du chargeur Epiroc Scooptram ST7 — spécifications, procédures opérationnelles, maintenance et localisation d'atelier.
          </p>

          {(() => {
            const OUTILS_LIST = [
              {
                id: "6.1",
                ref: "8234-001",
                name: "Extracteur de disque frein SAHR",
                cat: "Mécanique — Freinage",
                mfr: "Kukko 20-30+",
                specs: [
                  ["Type", "Extracteur hydraulique 3 griffes"],
                  ["Dimensions", "350 × 200 × 180 mm"],
                  ["Poids", "8,5 kg"],
                  ["Matériau", "Acier chrome-molybdène 42CrMo4"],
                  ["Capacité", "Ø 80-300 mm | Force : 12 T max"],
                  ["Norme", "ISO 1101 (Raccord 3/4\" BSP)"]
                ],
                proc: [
                  "Centrer l'extracteur sur le moyeu (contrôler l'alignement).",
                  "Engager les 3 griffes dans les cannelures du disque.",
                  "Relier la pompe manuelle (vérifier le joint torique).",
                  "Pomper régulièrement (1 coup/sec) jusqu'au décollage.",
                  "Maintenir la charge 10s puis décharger doucement.",
                  "Retirer l'ensemble disque/outil et poser sur support propre."
                ],
                maint: "Nettoyer à l'essence F. Graisser la vis centrale toutes les 10 utilisations. Étalonner la pompe de test tous les 12 mois.",
                loc: "Armoire atelier — Compartiment B-3. Caisse mobile frein — Tiroir 2.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><line x1="100" y1="20" x2="100" y2="130" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2,2" /><rect x="95" y="30" width="10" height="80" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="60" y="55" width="80" height="15" rx="3" fill="none" stroke="#f59e0b" stroke-width="1.5" /><path d="M 70 70 L 70 110 L 80 120 L 75 125 L 60 115 L 60 70 Z" fill="none" stroke="#f59e0b" stroke-width="1.5" /><path d="M 130 70 L 130 110 L 120 120 L 125 125 L 140 115 L 140 70 Z" fill="none" stroke="#f59e0b" stroke-width="1.5" />`
              },
              {
                id: "6.2",
                ref: "8234-015",
                name: "Clé dynamométrique 3/4\" 100-650 Nm",
                cat: "Mécanique — Serrage",
                mfr: "Snap-on QD3R250",
                specs: [
                  ["Type", "Clé à déclenchement d'échelle"],
                  ["Dimensions", "680 × 80 × 80 mm"],
                  ["Poids", "2,1 kg"],
                  ["Matériau", "Acier Cr-V S2, poignée aluminium"],
                  ["Plage", "100-650 Nm (Précision ±3%)"],
                  ["Norme", "ISO 6789 Classe 2"]
                ],
                proc: [
                  "Sélectionner la valeur cible sur le curseur gradué.",
                  "Vérifier le zéro de l'échelle avant utilisation.",
                  "Engager la douille d'impact avec goupille de sécurité.",
                  "Tirer de façon rectiligne jusqu'au déclenchement.",
                  "Relâcher l'effort dès le clic (pas de sur-serrage).",
                  "Consigner le couple sur la fiche technique de suivi."
                ],
                maint: "Étalonner tous les 6 mois (ISO 17025). Nettoyer le corps après usage. Stocker déchargée à 50 Nm.",
                loc: "Armoire atelier — Compartiment A-1. Caisse mobile transmission — Tiroir 1.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="30" y="70" width="130" height="8" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="110" y="66" width="50" height="16" rx="2" fill="none" stroke="#f59e0b" stroke-width="1" /><circle cx="25" cy="74" r="12" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="21" y="70" width="8" height="8" fill="none" stroke="#f59e0b" stroke-width="1.5" />`
              },
              {
                id: "6.3",
                ref: "8234-022",
                name: "Clé à choc 1\" pneumatique",
                cat: "Mécanique — Desserrage / Serrage rapide",
                mfr: "Ingersoll Rand 285B-6",
                specs: [
                  ["Type", "Clé pneumatique à impact lourd"],
                  ["Dimensions", "450 × 120 × 200 mm"],
                  ["Poids", "5,8 kg"],
                  ["Matériau", "Corps aluminium, enclume forgée"],
                  ["Capacité", "2700 Nm desserrage / 1800 Nm serrage"],
                  ["Norme", "CE / EN ISO 11148 (Ligne : 6.2 bar)"]
                ],
                proc: [
                  "Vérifier la pression de ligne (6.2 bar min / 8.5 bar max).",
                  "Injecter 3 gouttes d'huile pneumatique dans l'admission.",
                  "Monter la douille à choc d'impact sécurisée.",
                  "Positionner la clé parfaitement dans l'axe de l'écrou.",
                  "Déclencher par impulsions courtes (2-3s maximum).",
                  "Finaliser le serrage final à la clé dynamométrique."
                ],
                maint: "Purger les condensats d'eau de l'air comprimé tous les jours. Graisser toutes les 50h. Remplacer les marteaux après 500h.",
                loc: "Armoire atelier — Compartiment A-2. Raccord d'air station 3.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="60" y="35" width="80" height="50" rx="5" fill="none" stroke="#f59e0b" stroke-width="1.5" /><path d="M 60 50 L 45 50 L 45 70 L 60 70 Z" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="35" y="55" width="10" height="10" fill="none" stroke="#f59e0b" stroke-width="1.5" /><path d="M 100 85 L 100 130 C 100 135, 115 135, 115 130 L 115 85 Z" fill="none" stroke="#f59e0b" stroke-width="1.5" />`
              },
              {
                id: "6.4",
                ref: "8234-031",
                name: "Marteau à inertie extracteur injecteur",
                cat: "Mécanique — Système d'injection",
                mfr: "OTC 7448",
                specs: [
                  ["Type", "Extracteur injecteur à masse coulissante"],
                  ["Dimensions", "280 × 80 × 80 mm"],
                  ["Poids", "1,2 kg"],
                  ["Matériau", "Acier trempé haute résistance 55 HRC"],
                  ["Capacité", "Common Rail Ø 14-17 mm (M14×1,5)"],
                  ["Norme", "DIN 3122 (Masse d'inertie : 800g)"]
                ],
                proc: [
                  "Déposer la tuyauterie haute pression et les brides.",
                  "Visser l'adaptateur M14×1.5 sur la tête d'injecteur (15 Nm).",
                  "Visser la tige de l'outil fermement dans l'adaptateur.",
                  "Positionner la butée et la masse de coulissement.",
                  "Frapper d'un geste sec et rectiligne le long de la tige.",
                  "Extraire l'injecteur et nettoyer la portée de culasse."
                ],
                maint: "Contrôler le filetage de l'adaptateur après usage. Graisser l'arbre de coulissement mensuellement. Rebut si fissures.",
                loc: "Armoire atelier — Compartiment C-1. Caisse mobile moteur — Tiroir 3.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><line x1="20" y1="75" x2="180" y2="75" stroke="#f59e0b" stroke-width="2" /><rect x="80" y="55" width="40" height="40" rx="3" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="140" y="65" width="10" height="20" fill="none" stroke="#f59e0b" stroke-width="1.5" />`
              },
              {
                id: "6.5",
                ref: "8234-040",
                name: "Jeu de cales de précision",
                cat: "Mécanique — Mesures & Jeux",
                mfr: "Mitutoyo 184-304S",
                specs: [
                  ["Type", "Cales d'épaisseur en coffret rigide"],
                  ["Dimensions", "150 × 100 × 40 mm"],
                  ["Poids", "0,8 kg"],
                  ["Matériau", "Acier allié trempé et rectifié 62 HRC"],
                  ["Plage", "0,05 à 1,00 mm (par pas de 0,05 mm)"],
                  ["Norme", "DIN 2275 Classe 1 (Précision ±0,002 mm)"]
                ],
                proc: [
                  "Sélectionner la lame de calage estimée.",
                  "Nettoyer la lame à l'aide d'un chiffon propre.",
                  "Glisser la lame à plat (mesure perpendiculaire).",
                  "Évaluer la friction : le glissement doit être gras.",
                  "Si l'insertion est lâche, tester la taille supérieure.",
                  "Essuyer et replier immédiatement la cale dans l'étui."
                ],
                maint: "Interdiction de plier ou forcer les cales. Dépoussiérer et huiler légèrement après usage. Étalonner tous les 24 mois.",
                loc: "Armoire atelier — Compartiment D-1. Coffret de précision sous clé.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><circle cx="50" cy="100" r="6" fill="none" stroke="#f59e0b" stroke-width="1.5" /><path d="M 50 100 L 130 30 L 140 38 L 50 100" fill="none" stroke="#f59e0b" stroke-width="1.2" /><path d="M 50 100 L 150 55 L 157 65 L 50 100" fill="none" stroke="#f59e0b" stroke-width="1.2" />`
              },
              {
                id: "6.6",
                ref: "8234-050",
                name: "Pompe de test hydraulique manuelle",
                cat: "Hydraulique — Test pression",
                mfr: "Enerpac P-392",
                specs: [
                  ["Type", "Pompe hydraulique manuelle 2 vitesses"],
                  ["Dimensions", "400 × 150 × 180 mm"],
                  ["Poids", "4,2 kg"],
                  ["Matériau", "Corps aluminium, piston chromé"],
                  ["Capacité", "0-700 bar | Réservoir interne : 1,5 L"],
                  ["Norme", "CE / ASME B30.1"]
                ],
                proc: [
                  "Vérifier le niveau d'huile hydraulique ISO VG 46.",
                  "Relier le flexible haute pression à la prise Minimess.",
                  "Purger le circuit en pompant à vide (robinet ouvert).",
                  "Fermer fermement le robinet de purge de la pompe.",
                  "Pomper régulièrement jusqu'à la pression requise.",
                  "Ouvrir lentement la valve de vidange avant dépose."
                ],
                maint: "Vidanger et rincer le réservoir tous les 6 mois. Remplacer les joints toriques si fuite. Étalonner le manomètre tous les 12 mois.",
                loc: "Armoire atelier — Compartiment E-1. Station test hydraulique.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="40" y="80" width="120" height="40" rx="3" fill="none" stroke="#f59e0b" stroke-width="1.5" /><path d="M 148 60 L 50 30" stroke="#f59e0b" stroke-width="2.5" fill="none" /><circle cx="65" cy="55" r="15" fill="none" stroke="#f59e0b" stroke-width="1.5" />`
              },
              {
                id: "6.7",
                ref: "8234-089",
                name: "Testeur de précharge azote",
                cat: "Hydraulique — Accumulateurs",
                mfr: "Hydac FPU-1-350/250",
                specs: [
                  ["Type", "Vérificateur / bloc de charge d'accumulateurs"],
                  ["Dimensions", "600 × 200 × 150 mm"],
                  ["Poids", "3,5 kg"],
                  ["Matériau", "Corps inox 316L, flexible haute pression"],
                  ["Capacité", "0-300 bar d'azote maximum"],
                  ["Norme", "EN 14359 (Manomètre : Classe 1.0)"]
                ],
                proc: [
                  "Dépressuriser entièrement le circuit hydraulique.",
                  "Démonter le capuchon de la valve de l'accumulateur.",
                  "Visser le raccord rapide du testeur sur la valve d'accu.",
                  "Ouvrir lentement la molette et relever la pression.",
                  "Connecter la bouteille d'azote si recharge nécessaire.",
                  "Fermer les valves de sécurité et remonter le bouchon."
                ],
                maint: "Azote pur uniquement. Interdiction absolue d'utiliser de l'air ou de l'oxygène. Étalonner le manomètre tous les 12 mois.",
                loc: "Armoire atelier — Compartiment E-2. Bouteille d'azote d'atelier.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="80" y="60" width="40" height="30" rx="2" fill="none" stroke="#f59e0b" stroke-width="1.5" /><circle cx="100" cy="35" r="15" fill="none" stroke="#f59e0b" stroke-width="1.5" /><line x1="120" y1="75" x2="150" y2="120" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2,2" />`
              },
              {
                id: "6.8",
                ref: "8234-055",
                name: "Clé à sangle filtre hydraulique",
                cat: "Hydraulique — Filtration",
                mfr: "Gedore 40 Z 90",
                specs: [
                  ["Type", "Clé à sangle de desserrage de cartouches"],
                  ["Dimensions", "350 × 50 × 30 mm (Sangle : 400 mm)"],
                  ["Poids", "0,4 kg"],
                  ["Matériau", "Sangle Kevlar nylon, poignée acier"],
                  ["Capacité", "Ø 60-140 mm (cloches et cartouches)"],
                  ["Norme", "DIN 3122 (Serrage : 80 Nm max)"]
                ],
                proc: [
                  "Essuyer le corps métallique du filtre filtre.",
                  "Enrouler la sangle nylon (sens anti-horaire).",
                  "Passer l'extrémité dans le verrou du manche.",
                  "Exercer une pré-tension manuelle ferme.",
                  "Faire levier avec le manche pour décoller la cartouche.",
                  "Finir le dévissage à la main de la cartouche."
                ],
                maint: "Laver la sangle à l'essence F. Remplacer immédiatement la sangle si déchirures transversales supérieures à 10%.",
                loc: "Armoire atelier — Compartiment E-3. Caisse mobile hyd — Tiroir 1.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="30" y="70" width="100" height="10" rx="2" fill="none" stroke="#f59e0b" stroke-width="1.5" /><circle cx="145" cy="75" r="25" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2,2" />`
              },
              {
                id: "6.9",
                ref: "8234-060",
                name: "Purgeur de circuit hydraulique",
                cat: "Hydraulique — Maintenance fluide",
                mfr: "Stauff Test-20",
                specs: [
                  ["Type", "Station mobile de dégazage et filtration"],
                  ["Dimensions", "800 × 500 × 900 mm"],
                  ["Poids", "45 kg (sans huile)"],
                  ["Matériau", "Châssis acier, réservoir inox"],
                  ["Capacité", "Filtration 3µ absolue | Débit : 100 L/min"],
                  ["Norme", "ISO 4406 (Moteur 380V triphasé)"]
                ],
                proc: [
                  "Amener le chariot mobile et raccorder au réseau 380V.",
                  "Relier l'aspiration à la prise de vidange basse.",
                  "Relier le refoulement au bouchon supérieur de cuve.",
                  "Mettre en route la pompe et le réchauffeur (40°C).",
                  "Laisser circuler l'huile (cible propreté 18/16/13).",
                  "Ouvrir les purgeurs des points hauts du circuit."
                ],
                maint: "Changer la cartouche filtrante 3µ si l'indicateur de colmatage s'allume. Inspecter les flexibles tous les 3 mois.",
                loc: "Zone atelier — Emplacement marqué au sol 'PURGE HYD'.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="60" y="40" width="80" height="70" rx="5" fill="none" stroke="#f59e0b" stroke-width="1.5" /><circle cx="75" cy="120" r="12" fill="none" stroke="#f59e0b" stroke-width="1.5" /><circle cx="125" cy="120" r="12" fill="none" stroke="#f59e0b" stroke-width="1.5" />`
              },
              {
                id: "6.10",
                ref: "8234-070",
                name: "Multimètre numérique industriel",
                cat: "Électronique — Appareils de mesure",
                mfr: "Fluke 87V",
                specs: [
                  ["Type", "Multimètre True-RMS de précision IP67"],
                  ["Dimensions", "190 × 90 × 50 mm"],
                  ["Poids", "0,5 kg"],
                  ["Matériau", "Coque antichoc renforcée"],
                  ["Capacité", "V AC/DC : 1000V | I DC : 10A"],
                  ["Norme", "CAT III 1000V / CAT IV 600V"]
                ],
                proc: [
                  "Inspecter l'état des gaines d'isolant des cordons.",
                  "Sélectionner le mode approprié (V, R, I) au rotateur.",
                  "Connecter le cordon noir sur la borne commune COM.",
                  "Appliquer fermement les pointes de mesure.",
                  "Attendre la stabilisation de la mesure (2-3 sec).",
                  "Relever la valeur et déconnecter les bornes."
                ],
                maint: "Utiliser exclusivement des fusibles d'origine haute tension. Nettoyer l'outil. Étalonner tous les 12 mois.",
                loc: "Armoire atelier — Compartiment F-1. Housse de protection.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="65" y="25" width="70" height="100" rx="6" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="75" y="35" width="50" height="25" fill="none" stroke="#f59e0b" stroke-width="1.2" /><circle cx="100" cy="80" r="12" fill="none" stroke="#f59e0b" stroke-width="1.2" />`
              },
              {
                id: "6.11",
                ref: "8234-080",
                name: "Analyseur de bus CAN J1939",
                cat: "Électronique — Outils de diagnostic",
                mfr: "Dearborn Group DPA5",
                specs: [
                  ["Type", "Interface diagnostic réseau CAN dual-channel"],
                  ["Dimensions", "150 × 80 × 35 mm"],
                  ["Poids", "0,3 kg"],
                  ["Matériau", "Boîtier aluminium, fiches industrielles"],
                  ["Capacité", "SAE J1939 / CANopen (125-1000 kbps)"],
                  ["Norme", "CE / Alimentation 9-36V DC par port"]
                ],
                proc: [
                  "Couper le commutateur principal de la machine.",
                  "Raccorder la fiche Deutsch sur le port de diagnostic.",
                  "Connecter la prise USB de l'outil au PC d'atelier.",
                  "Mettre le contact d'alimentation de la cabine.",
                  "Ouvrir l'application de diagnostic de l'ordinateur.",
                  "Lire et enregistrer les codes d'erreurs (DTC)."
                ],
                maint: "Mettre à jour l'application logicielle et le firmware tous les 6 mois. Dépoussiérer les broches.",
                loc: "Armoire atelier — Compartiment F-2. Mallette PC diagnostic.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="50" y="40" width="100" height="70" rx="8" fill="none" stroke="#f59e0b" stroke-width="1.5" /><circle cx="65" cy="55" r="3" fill="none" stroke="#f59e0b" stroke-width="1" /><rect x="40" y="65" width="10" height="20" fill="none" stroke="#f59e0b" stroke-width="1.5" />`
              },
              {
                id: "6.12",
                ref: "8234-085",
                name: "Testeur de câble Ethernet / M12",
                cat: "Électronique — Continuité réseau",
                mfr: "Fluke Networks MicroScanner2",
                specs: [
                  ["Type", "Vérificateur de câblage et jarretières"],
                  ["Dimensions", "130 × 70 × 30 mm"],
                  ["Poids", "0,2 kg"],
                  ["Matériau", "ABS injecté avec enveloppe caoutchouc"],
                  ["Capacité", "Longueur Segment : 0-460 m (courts-circuits)"],
                  ["Norme", "ISO 11801 / TIA/EIA-568"]
                ],
                proc: [
                  "Vérifier que le réseau ciblé est hors tension.",
                  "Brancher l'émetteur du testeur à l'extrémité du câble.",
                  "Brancher l'unité réceptrice à l'autre extrémité.",
                  "Mettre le boîtier en marche et lancer le test.",
                  "Contrôler le câblage (Wiremap) et l'absence de coupure.",
                  "Noter la distance en mètres si court-circuit détecté."
                ],
                maint: "Nettoyer les fiches à l'air sec comprimé. Remplacer les piles 2xAA. Étalonner la mesure de longueur annuellement.",
                loc: "Armoire atelier — Compartiment F-3. Caisse mobile RCS — Tiroir 1.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="70" y="30" width="60" height="90" rx="5" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="78" y="40" width="44" height="30" fill="none" stroke="#f59e0b" stroke-width="1.2" />`
              },
              {
                id: "6.13",
                ref: "8234-090",
                name: "Alimentation de banc 24V / 12V",
                cat: "Électronique — Banc de test",
                mfr: "Manson SPS-9605",
                specs: [
                  ["Type", "Alimentation DC régulée programmable"],
                  ["Dimensions", "220 × 110 × 280 mm"],
                  ["Poids", "3,8 kg"],
                  ["Matériau", "Boîtier en acier, ventilateur arrière"],
                  ["Capacité", "0-60V DC | 0-5A (Régulation ±10mV)"],
                  ["Norme", "IEC 61010-1 (Puissance : 300W maximum)"]
                ],
                proc: [
                  "Raccorder le cordon d'alimentation à la prise 220V.",
                  "Allumer le boîtier, configurer la tension requise.",
                  "Fixer le courant maximum de protection (anti-court-circuit).",
                  "Vérifier que l'indicateur de sortie est sur OFF.",
                  "Brancher les cordons de raccordement aux fiches.",
                  "Activer l'alimentation (ON) et surveiller la puissance."
                ],
                maint: "Dépoussiérer le bloc de ventilation mensuellement. Contrôler les tensions de sortie tous les 12 mois.",
                loc: "Banc de test atelier — Compartiment F-4.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="40" y="30" width="120" height="90" rx="3" fill="none" stroke="#f59e0b" stroke-width="1.5" /><circle cx="62" cy="80" r="8" fill="none" stroke="#f59e0b" stroke-width="1" /><circle cx="100" cy="105" r="4" fill="none" stroke="#f59e0b" stroke-width="1.2" />`
              },
              {
                id: "6.14",
                ref: "8234-095",
                name: "Oscilloscope portable 2 canaux",
                cat: "Électronique — Métrologie signaux",
                mfr: "PicoScope 2204A",
                specs: [
                  ["Type", "Oscilloscope d'acquisition USB 2 voies"],
                  ["Dimensions", "130 × 100 × 20 mm"],
                  ["Poids", "0,2 kg"],
                  ["Matériau", "ABS, fiches BNC coaxiales blindées"],
                  ["Capacité", "Bande passante : 10 MHz | Échantillonnage : 100 MS/s"],
                  ["Norme", "CE / EN 61326-1 (Résolution : 8 bits)"]
                ],
                proc: [
                  "Brancher l'appareil au port USB de l'ordinateur.",
                  "Démarrer l'application d'acquisition PicoScope.",
                  "Relier la sonde d'analyse coaxiale sur la voie A.",
                  "Fixer la pince crocodile de masse sur le châssis.",
                  "Appliquer la pointe de contact sur le fil à mesurer.",
                  "Capturer la courbe et enregistrer la fréquence PWM."
                ],
                maint: "Lancer l'auto-calibrage avant toute mesure critique. Manipuler les pointes de mesure délicatement.",
                loc: "Armoire atelier — Compartiment F-5. Mallette de transport.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="60" y="45" width="80" height="60" rx="4" fill="none" stroke="#f59e0b" stroke-width="1.5" /><circle cx="75" cy="75" r="6" fill="none" stroke="#f59e0b" stroke-width="1.2" />`
              },
              {
                id: "6.15",
                ref: "8234-100",
                name: "Programmateur firmware RCS",
                cat: "Électronique — Écriture microprocesseurs",
                mfr: "Segger J-Link EDU",
                specs: [
                  ["Type", "Sonde d'analyse / programmation JTAG / SWD"],
                  ["Dimensions", "100 × 40 × 20 mm"],
                  ["Poids", "0,1 kg"],
                  ["Matériau", "Coffret rigide ABS moulé sous pression"],
                  ["Capacité", "Série RCS ARM Cortex (M0 à M4)"],
                  ["Norme", "CE / RoHS (Fréquence : 15 MHz max)"]
                ],
                proc: [
                  "Mettre le calculateur RCS de la machine hors tension.",
                  "Relier la nappe SWD de programmation sur la carte.",
                  "Brancher le câble d'acquisition USB sur le PC.",
                  "Lancer l'application de flashage officielle.",
                  "Relever le matricule CPU de la carte (test d'accès).",
                  "Charger le fichier .hex et lancer l'injection."
                ],
                maint: "Prendre garde à ne pas déformer la nappe de programmation SWD. Mettre à jour l'application J-Link.",
                loc: "Armoire atelier — Compartiment F-6. Sous clé chez le chef d'atelier.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="40" y="60" width="80" height="30" rx="3" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="120" y="65" width="10" height="20" fill="none" stroke="#f59e0b" stroke-width="1.2" />`
              },
              {
                id: "6.16",
                ref: "8234-110",
                name: "Comparateur digital sur pied magnétique",
                cat: "Mesure — Métrologie & Tolérances",
                mfr: "Mitutoyo 543-390B",
                specs: [
                  ["Type", "Comparateur numérique de précision à quartz"],
                  ["Dimensions", "150 × 60 × 30 mm (pied inclus)"],
                  ["Poids", "1,2 kg"],
                  ["Matériau", "Axe en acier traité, base magnétique"],
                  ["Capacité", "Course : 0 - 12,7 mm | Précision : ±0,003 mm"],
                  ["Norme", "ISO 463 / DIN 878 (Résolution : 0,001 mm)"]
                ],
                proc: [
                  "Nettoyer le support métallique d'ancrage de la machine.",
                  "Fixer la base magnétique en tournant le levier.",
                  "Positionner le bras articulé et visser la molette.",
                  "Mettre le palpeur en contact (précharge de 1,5 mm).",
                  "Appuyer sur ZERO pour calibrer la référence.",
                  "Faire pivoter la pièce et relever les variations."
                ],
                maint: "Essuyer la tige mobile du palpeur après usage. Ne jamais appliquer de graisse. Étalonner tous les 6 mois.",
                loc: "Armoire atelier — Compartiment D-1. Coffret d'origine Mitutoyo.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="45" y="110" width="35" height="25" rx="2" fill="none" stroke="#f59e0b" stroke-width="1.5" /><line x1="62" y1="110" x2="62" y2="40" stroke="#f59e0b" stroke-width="2.5" /><circle cx="130" cy="61" r="16" fill="none" stroke="#f59e0b" stroke-width="1.5" />`
              },
              {
                id: "6.17",
                ref: "8234-115",
                name: "Thermomètre infrarouge laser",
                cat: "Mesure — Température",
                mfr: "Fluke 62 MAX+",
                specs: [
                  ["Type", "Thermomètre IR antichoc IP54"],
                  ["Dimensions", "175 × 85 × 75 mm"],
                  ["Poids", "0,3 kg"],
                  ["Matériau", "Boîtier plastique renforcé caoutchouc"],
                  ["Capacité", "Plage : -30°C à +650°C | Précision : ±1,0°C"],
                  ["Norme", "CE / ratio distance/cible 12:1"]
                ],
                proc: [
                  "Ajuster l'émissivité selon la pièce (peinture=0.95).",
                  "Appuyer sur la gâchette pour activer l'écran.",
                  "Viser l'organe de freinage à l'aide du double laser.",
                  "Vérifier que les points laser s'inscrivent dans la zone.",
                  "Relever la température de crête stabilisée.",
                  "Relâcher la gâchette pour geler la valeur (HOLD)."
                ],
                maint: "Essuyer délicatement l'optique à l'aide d'un chiffon doux. Étalonner tous les 12 mois.",
                loc: "Armoire atelier — Compartiment D-2. Housse de protection.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><path d="M 120 110 L 105 110 L 90 60 L 150 40 L 160 65 L 115 80 Z" fill="none" stroke="#f59e0b" stroke-width="1.5" /><line x1="150" y1="40" x2="160" y2="65" stroke="#f59e0b" stroke-width="2" />`
              },
              {
                id: "6.18",
                ref: "8234-120",
                name: "Analyseur d'huile portable",
                cat: "Mesure — Qualité lubrifiants",
                mfr: "Parker Kittiwake DIGI",
                specs: [
                  ["Type", "Détecteur de pollution et humidité en cellule"],
                  ["Dimensions", "200 × 100 × 50 mm"],
                  ["Poids", "0,5 kg"],
                  ["Matériau", "Coffret en ABS étanche aux huiles"],
                  ["Capacité", "Humidité 0-500 ppm | Viscosité relative"],
                  ["Norme", "ISO 4406 / CE (Dérive viscosité : ±3% max)"]
                ],
                proc: [
                  "Prélever 5 mL d'huile à l'aide d'une seringue neuve.",
                  "Injecter délicatement le fluide dans la cellule.",
                  "Sélectionner la classe d'huile de référence (ISO 46).",
                  "Lancer l'analyse automatique (60 secondes).",
                  "Noter la teneur en eau (ppm) et la propreté.",
                  "Rincer soigneusement la cellule avec le solvant."
                ],
                maint: "Ne pas conserver de fluides dans l'analyseur. Remplacer les capteurs tous les 12 mois. Étalonner tous les 6 mois.",
                loc: "Armoire atelier — Compartiment D-3. Mallette de test.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="60" y="30" width="80" height="90" rx="8" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="85" y="40" width="30" height="35" rx="2" fill="none" stroke="#f59e0b" stroke-width="1.2" />`
              },
              {
                id: "6.19",
                ref: "8234-125",
                name: "Règle de flèche chaîne",
                cat: "Mesure — Transmission",
                mfr: "KRW 100-0",
                specs: [
                  ["Type", "Règle graduée d'alignement avec peson"],
                  ["Dimensions", "1000 × 50 × 10 mm"],
                  ["Poids", "0,6 kg"],
                  ["Matériau", "Règle aluminium, peson à ressort inox"],
                  ["Capacité", "Déviation : 0-100 mm | Effort calibré : 10 kg"],
                  ["Norme", "DIN 8187 (Précision ressort : ±0,1 kg)"]
                ],
                proc: [
                  "Placer la règle le long du brin de chaîne libre.",
                  "Fixer le crochet du peson sur le maillon central.",
                  "Tirer sur la poignée jusqu'au repère de charge (10 kg).",
                  "Mesurer la flèche (déviation) indiquée par la règle.",
                  "Comparer la mesure obtenue à l'intervalle d'usine.",
                  "Relâcher doucement la charge et ranger l'outil."
                ],
                maint: "Vérifier le tarage du peson de force (10 kg) tous les 3 mois. Lubrifier le ressort interne.",
                loc: "Armoire atelier — Compartiment D-4. Support mural d'atelier.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="15" y="70" width="170" height="10" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="92" y="80" width="16" height="40" fill="none" stroke="#f59e0b" stroke-width="1.2" />`
              },
              {
                id: "6.20",
                ref: "8234-130",
                name: "Micromètre extérieur 0-25 mm",
                cat: "Mesure — Tolérances & Cotes",
                mfr: "Mitutoyo 103-137",
                specs: [
                  ["Type", "Micromètre de précision extérieur"],
                  ["Dimensions", "150 × 50 × 30 mm"],
                  ["Poids", "0,3 kg"],
                  ["Matériau", "Cadre fonte traité, touches carbure"],
                  ["Capacité", "Plage : 0-25 mm | Résolution : 0,01 mm"],
                  ["Norme", "DIN 863 (Précision : ±0,002 mm)"]
                ],
                proc: [
                  "Essuyer les touches de mesure en carbure.",
                  "Ajuster le point zéro à l'aide de la bague.",
                  "Placer la pièce à mesurer entre l'enclume et la touche.",
                  "Rapprocher le tambour micrométrique de serrage.",
                  "Serrer de façon calibrée à l'aide du cliquet (3 clics).",
                  "Bloquer la vis, extraire la pièce et lire la valeur."
                ],
                maint: "Ne pas forcer sur le tambour sans cliquet. Nettoyer et ranger l'outil dans son boîtier après usage. Étalonner tous les 6 mois.",
                loc: "Armoire atelier — Compartiment D-1. Boîte de rangement rouge.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><path d="M 50 65 A 35 35 0 0 0 110 65 L 110 80 L 50 80 Z" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="110" y="58" width="40" height="12" fill="none" stroke="#f59e0b" stroke-width="1.5" />`
              },
              {
                id: "6.21",
                ref: "8234-140",
                name: "Pont roulant d'atelier 2 tonnes",
                cat: "Levage — Gantry d'atelier",
                mfr: "Demag PK 2",
                specs: [
                  ["Type", "Pont roulant électrique à chaîne"],
                  ["Dimensions", "Portée 3m | Hauteur de levage 6m"],
                  ["Poids", "350 kg (poutre et chariot de translation)"],
                  ["Matériau", "Acier de construction soudé S355"],
                  ["Capacité", "Charge maximale admissible 2000 kg"],
                  ["Norme", "EN 15011 / CE (Chaîne grade 80)"]
                ],
                proc: [
                  "Vérifier la validité du certificat de sécurité annuel.",
                  "Inspecter l'état de la chaîne (déformation, maillons).",
                  "Positionner le palan à la verticale de la charge.",
                  "Élinguer la charge à soulever avec des manilles.",
                  "Effectuer une pré-tension de 10 cm pour équilibrer.",
                  "Déplacer lentement vers la zone de dépose."
                ],
                maint: "Graisser la chaîne d'engrènement tous les 3 mois. Réaliser le contrôle périodique annuel réglementaire obligatoire.",
                loc: "Atelier de maintenance — Poutre supérieure mobile. Commande filaire suspendue.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="15" y="25" width="170" height="12" fill="none" stroke="#f59e0b" stroke-width="1.5" /><line x1="100" y1="57" x2="100" y2="105" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,1" />`
              },
              {
                id: "6.22",
                ref: "8234-145",
                name: "Élingues textiles 2 tonnes",
                cat: "Levage — Sangles",
                mfr: "Yale TTX 2000",
                specs: [
                  ["Type", "Élingue textile plate sans fin double couche"],
                  ["Dimensions", "Longueur utile 2m | Largeur 90mm"],
                  ["Poids", "1,8 kg"],
                  ["Matériau", "Polyester haute ténacité 100%"],
                  ["Capacité", "CMU : 2000 kg direct / 4000 kg en U"],
                  ["Norme", "EN 1492-1 (Coefficient de sécurité 7:1)"]
                ],
                proc: [
                  "Contrôler la lisibilité des indications de l'étiquette.",
                  "Inspecter l'ensemble de la sangle (pas de coupure).",
                  "Positionner de façon stable sous l'organe à lever.",
                  "Utiliser des fourreaux sur les angles vifs.",
                  "Accrocher les deux boucles au crochet du palan.",
                  "Lever sans à-coups en maintenant la charge plane."
                ],
                maint: "Rincer à l'eau savonneuse froide si souillée. Rebut obligatoire si coutures de retenue endommagées ou effilochage.",
                loc: "Panneau d'élingage atelier — Compartiment G-1. Support métallique mural.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><path d="M 60 75 Q 100 20, 140 75 T 60 75" fill="none" stroke="#f59e0b" stroke-width="3" />`
              },
              {
                id: "6.23",
                ref: "8234-150",
                name: "Chandelles de calage 10 tonnes",
                cat: "Levage — Équipements de sécurité",
                mfr: "Bahco BH3A10",
                specs: [
                  ["Type", "Chandelles mécaniques réglables à vis"],
                  ["Dimensions", "Hauteur 350-550 mm | Base 200×200"],
                  ["Poids", "12 kg (la paire)"],
                  ["Matériau", "Acier moulé haute résistance S355"],
                  ["Capacité", "Charge nominale paire : 10000 kg"],
                  ["Norme", "EN 1494 / CE (Vis à filetage trapézoïdal)"]
                ],
                proc: [
                  "Vérifier la planéité et la propreté de la dalle béton.",
                  "Régler la hauteur initiale de la chandelle à vis.",
                  "Lever le Scooptram avec le cric de l'atelier.",
                  "Placer les deux chandelles sous les points d'ancrage.",
                  "Ajuster l'écrou de butée de sécurité à fond.",
                  "Redescendre la machine pour la faire porter sur l'outil."
                ],
                maint: "Graisser la vis de réglage tous les 3 mois. Inspecter l'état des filetages et de la base (rebut si jeu).",
                loc: "Atelier de maintenance — Repères marqués au sol 'CHANDELLES'. Support mural nord.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><polygon points="50,130 150,130 120,65 80,65" fill="none" stroke="#f59e0b" stroke-width="1.5" /><rect x="80" y="22" width="40" height="8" rx="1" fill="none" stroke="#f59e0b" stroke-width="2" />`
              },
              {
                id: "6.24",
                ref: "8234-155",
                name: "Chariot de visite mécanique",
                cat: "Manutention — Accès sous-machine",
                mfr: "Siegmund Creeper",
                specs: [
                  ["Type", "Chariot de visite à plateau réglable"],
                  ["Dimensions", "1200 × 600 × 120 mm (profil bas)"],
                  ["Poids", "35 kg"],
                  ["Matériau", "Cadre tubulaire acier, plateau ergonomique"],
                  ["Capacité", "Charge maximale autorisée : 150 kg"],
                  ["Norme", "CE (Roulettes pivotantes à freins)"]
                ],
                proc: [
                  "Positionner le chariot sous le compartiment ciblé.",
                  "Bloquer les freins des roulettes pivotantes.",
                  "Régler la hauteur et l'inclinaison de l'appui-tête.",
                  "S'allonger, bras à l'intérieur de la structure.",
                  "Agencer les outils d'intervention sur les plateaux.",
                  "Désengager les freins avant d'extraire le chariot."
                ],
                maint: "Dépoussiérer et lubrifier l'axe des roues tous les 6 mois. Remplacer les bandages s'ils sont coupés.",
                loc: "Zone de maintenance d'atelier — Repères marqués au sol 'CHARIOT VISITE'.",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="30" y="65" width="140" height="20" rx="3" fill="none" stroke="#f59e0b" stroke-width="1.5" /><circle cx="50" cy="95" r="10" fill="none" stroke="#f59e0b" stroke-width="1.2" /><circle cx="150" cy="95" r="10" fill="none" stroke="#f59e0b" stroke-width="1.2" />`
              },
              {
                id: "6.25",
                ref: "8234-160",
                name: "Caisse mobile de maintenance",
                cat: "Manutention — Organisation d'atelier",
                mfr: "Lista 36×27E",
                specs: [
                  ["Type", "Servante d'atelier mobile à 7 tiroirs"],
                  ["Dimensions", "700 × 450 × 1000 mm"],
                  ["Poids", "45 kg (vide)"],
                  ["Matériau", "Tôle d'acier peinte époxy, rails télescopiques"],
                  ["Capacité", "Charge totale : 100 kg (15 kg par tiroir)"],
                  ["Norme", "DIN EN 14073 / CE (Serrure de sécurité)"]
                ],
                proc: [
                  "Vérifier l'inventaire des tiroirs avant tout déplacement.",
                  "Verrouiller la serrure centrale de blocage des tiroirs.",
                  "Pousser la servante à l'aide de la barre latérale.",
                  "Positionner l'outil et actionner les freins de roue.",
                  "Ouvrir un seul tiroir à la fois (système anti-bascule).",
                  "Nettoyer et ranger les outils après chaque usage."
                ],
                maint: "Dépoussiérer et graisser les glissières télescopiques tous les 6 mois. Contrôler l'inventaire d'atelier tous les mois.",
                loc: "Atelier de maintenance — Alignement d'outils le long du mur est (Caisses CM-01 à CM-04).",
                svg: `<rect width="100%" height="100%" fill="#0a0a0a" /><rect x="55" y="30" width="90" height="90" rx="4" fill="none" stroke="#f59e0b" stroke-width="1.5" /><line x1="60" y1="45" x2="140" y2="45" stroke="#f59e0b" stroke-width="1" /><circle cx="70" cy="128" r="8" fill="none" stroke="#f59e0b" stroke-width="1.5" />`
              }
            ];

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="outil-list-container">
                {OUTILS_LIST.map((otl) => (
                  <div key={otl.id} className="outil-fiche bg-[#111111] border border-slate-800 rounded-lg p-5 flex flex-col justify-between hover:border-amber-500/30 transition-colors" id={`outil-${otl.id}`}>
                    
                    {/* En-tête */}
                    <div className="outil-header mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded font-mono text-[10px] font-bold">
                          REF: {otl.ref}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px] font-bold">FICHE {otl.id}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-200 uppercase tracking-tight">{otl.name}</h4>
                      <div className="flex justify-between text-slate-500 text-[10px] font-semibold mt-1">
                        <span>{otl.cat}</span>
                        <span className="text-amber-500/70 font-mono">{otl.mfr}</span>
                      </div>
                    </div>

                    {/* SVG Blueprint Technique */}
                    <div className="mb-4 rounded bg-[#0a0a0a] p-2 flex justify-center items-center border border-slate-900/60 overflow-hidden">
                      <svg viewBox="0 0 200 150" className="w-full h-32" dangerouslySetInnerHTML={{ __html: otl.svg }} />
                    </div>

                    {/* Tableau des Spécifications */}
                    <table className="outil-specs w-full text-left text-[11px] border-collapse border border-slate-900 bg-[#0c0c0c] mb-4">
                      <tbody>
                        {otl.specs.map((spc, idx) => (
                          <tr key={idx} className="border-b border-slate-900/60 last:border-b-0">
                            <td className="p-1.5 font-bold text-slate-500 bg-[#121212] w-1/3 border-r border-slate-900/60">{spc[0]}</td>
                            <td className="p-1.5 text-slate-300 font-mono text-[10px]">{spc[1]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Procédure d'utilisation */}
                    <div className="outil-procedure mb-4 p-3 bg-slate-900/40 border border-slate-900/60 rounded">
                      <h5 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 text-[8px] text-black font-bold">▶</span>
                        Procédure d'utilisation
                      </h5>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-300 text-[11px]">
                        {otl.proc.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Maintenance */}
                    <div className="outil-maintenance mb-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded text-[11px] text-slate-400">
                      <strong className="text-amber-500/80">Entretien & Étalonnage :</strong> {otl.maint}
                    </div>

                    {/* Localisation */}
                    <div className="outil-localisation p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded text-[11px] text-slate-400 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span><strong>Stockage :</strong> {otl.loc}</span>
                    </div>

                  </div>
                ))}
              </div>
            );
          })()}
        </article>


        {/* BOUTON RETOUR FIXE */}
        <button className="btn-retour-assistant" onClick={() => (window as any).fermerCahier()}>← RETOUR À L'ASSISTANT ST7</button>

      </section>

    </div>
  );
}
