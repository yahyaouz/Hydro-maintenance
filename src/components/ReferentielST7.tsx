import * as React from "react";
import {
  BookOpen, AlertTriangle, ShieldAlert, Wrench, Droplets, Clock,
  ChevronDown, ChevronRight, Info, Gauge, Settings, Zap, CheckCircle,
  Eye, Cpu, Layers, Compass, HelpCircle, RefreshCw, Play, ArrowRight, Shield, Search, Activity, Sliders,
  Network, Binary, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HydrominesLogo } from "./auth/HydrominesLogo";

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
  desc: string;
  freq: string;
  qty: string;
  x: number;
  y: number;
}

export function ReferentielST7({ onSelectEngin }: { onSelectEngin: (engin: string) => void }) {
  const [activeSection, setActiveSection] = React.useState("identite-st7");
  const [hoveredComponent, setHoveredComponent] = React.useState<string | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = React.useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = React.useState<GraissagePoint | null>(null);
  const [selectedRoute, setSelectedRoute] = React.useState<string>("hp");
  const [selectedLeakTest, setSelectedLeakTest] = React.useState<string>("cyl-drift");
  const [selectedRcsTab, setSelectedRcsTab] = React.useState<string>("can-bus");
  const [selectedOverhaulTab, setSelectedOverhaulTab] = React.useState<string>("etapes");
  const [simActiveSymptom, setSimActiveSymptom] = React.useState<string | null>(null);
  const [simCurrentStep, setSimCurrentStep] = React.useState<number>(0);
  const [simHistory, setSimHistory] = React.useState<string[]>([]);
  const [simAnswers, setSimAnswers] = React.useState<Record<string, string>>({});
  const [selectedFluidsDiagTab, setSelectedFluidsDiagTab] = React.useState<string>("iso4406");
  
  const [openAccordions, setOpenAccordions] = React.useState<Record<string, boolean>>({
    p1: true,
    d1: true
  });

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

  const handleComponentHover = (id: string, text: string) => {
    setHoveredComponent(id);
    setHoveredTooltip(text);
  };

  const clearHover = () => {
    setHoveredComponent(null);
    setHoveredTooltip(null);
  };

  // --- MENU GAUCHE EPIROC ST7 ---
  const menuGroups: MenuGroup[] = [
    {
      title: "IDENTIFICATION",
      items: [
        { id: "identite-st7", label: "Fiche d'identité technique ST7" }
      ]
    },
    {
      title: "MOTEUR QSB6.7",
      items: [
        { id: "specs-moteur-st7", label: "Spécifications Cummins QSB6.7" },
        { id: "circuit-huile-st7", label: "Circuit lubrification (SVG)" }
      ]
    },
    {
      title: "HYDRAULIQUE & SÉCURITÉ",
      items: [
        { id: "circuit-hyd-st7", label: "Boucle de puissance (SVG)" },
        { id: "frein-sahr-st7", label: "Système de freinage SAHR (SVG)" },
        { id: "conduites-st7", label: "Routage & Schémas Hydrauliques" }
      ]
    },
    {
      title: "MAINTENANCE TERRAIN",
      items: [
        { id: "plan-graissage-st7", label: "Plan de graissage 30 Pts (SVG)" },
        { id: "fluides-st7", label: "Tableau récapitulatif des fluides" },
        { id: "traitement-st7", label: "Traitement d'Engin & Roulage" }
      ]
    },
    {
      title: "DIAGNOSTICS & ATELIER",
      items: [
        { id: "diag-st7", label: "Guide de résolution des pannes" },
        { id: "proced-st7", label: "Procédures d'entretien critiques" },
        { id: "reglages-st7", label: "Réglages d'usine & Pressions" },
        { id: "fuites-st7", label: "Détection & Diagnostic des Fuites" },
        { id: "elec-st7", label: "Système Électronique RCS & CAN" },
        { id: "reparation-st7", label: "Guide de Réfection des Vérins" },
        { id: "simulateur-st7", label: "Simulateur de Diagnostic Interactif" },
        { id: "analyse-st7", label: "Analyses de Fluides & Articulation" }
      ]
    }
  ];

  // --- DONNÉES TECHNIQUES ST7 ---
  const generalIdentiteST7 = [
    { label: "Constructeur", val: "Epiroc AB (Suède, Conception & Fabrication)" },
    { label: "Désignation", val: "Scooptram ST7 (Chargeuse LHD souterraine articulée)" },
    { label: "Capacité de charge utile", val: "6 800 kg (6,8 Tonnes métriques)" },
    { label: "Force d'arrachement hydraulique", val: "13 800 kg (Force au godet optimisée)" },
    { label: "Volume standard du godet", val: "3,1 m³ (Lame d'usure en acier Hardox 500)" },
    { label: "Poids opérationnel (à vide)", val: "21 200 kg" },
    { label: "Poids opérationnel (en charge)", val: "28 000 kg" },
    { label: "Dimensions (L x l x H)", val: "8 750 mm x 2 240 mm x 2 160 mm (au toit cabine)" },
    { label: "Rayon de braquage (intérieur)", val: "3 100 mm (Articulation 42,5°)" }
  ];

  const specsMoteurST7 = [
    { label: "Modèle de moteur", val: "Cummins QSB6.7 Stage V / Tier 3" },
    { label: "Architecture", val: "6 cylindres en ligne, Diesel 4 temps, Turbo-compressé" },
    { label: "Cylindrée totale", val: "6,7 Litres" },
    { label: "Puissance maximale brute", val: "144 kW / 193 HP @ 2 200 tr/min" },
    { label: "Couple maximal", val: "938 Nm @ 1 500 tr/min" },
    { label: "Système d'injection", val: "High Pressure Common Rail (HPCR) à gestion électronique" },
    { label: "Refroidissement", val: "Liquide avec ventilateur hydraulique à vitesse variable (Fan Drive)" },
    { label: "Post-traitement des gaz", val: "FAP (Filtre à Particules) + DOC (Catalyseur d'oxydation)" }
  ];

  const transmissionST7 = [
    { label: "Modèle de transmission", val: "Funk RT200 Modulated Powershift" },
    { label: "Type de rapports", val: "4 rapports avant / 4 rapports arrière à passage sous charge" },
    { label: "Convertisseur de couple", val: "Funk à haut rendement avec embrayage de verrouillage" },
    { label: "Modèle d'essieux", val: "Kessler D71 de type Heavy Duty avec réducteurs planétaires" },
    { label: "Différentiel avant", val: "No-Spin à glissement limité automatique (Motricité maximale)" },
    { label: "Différentiel arrière", val: "Standard, essieu oscillant ±8 degrés pour contact permanent" }
  ];

  const fluidesST7 = [
    { label: "Carter d'huile moteur (avec filtres)", val: "16,5 Litres (SAE 15W-40 Premium API CK-4)" },
    { label: "Réservoir de carburant", val: "243 Litres (Gazole souterrain à basse teneur en soufre)" },
    { label: "Système de refroidissement moteur", val: "30,0 Litres (Mélange antigel/eau déminéralisée 50/50)" },
    { label: "Réservoir hydraulique principal", val: "144 Litres (Huile ISO VG 46 Dynatrans)" },
    { label: "Transmission Funk RT200", val: "34,0 Litres (Huile ATF Dexron III)" },
    { label: "Carter d'essieu avant (Kessler)", val: "38,0 Litres (Huile d'engrenage SAE 85W-140 API GL-5)" },
    { label: "Carter d'essieu arrière (Kessler)", val: "38,0 Litres (Huile d'engrenage SAE 85W-140 API GL-5)" }
  ];

  // --- POINTS DE GRAISSAGE ST7 (30 Points au total, représentés interactivement par 8 points clés stratégiques) ---
  const graissagePointsST7: GraissagePoint[] = [
    { id: 1, name: "Pivots de vérins de benne (Tête & Tige)", desc: "Axe principal du levier d'articulation de godet. Haute pression permanente lors de la pénétration du tas.", freq: "Toutes les 8h (Quotidien)", qty: "4 coups de pompe à graisse", x: 130, y: 150 },
    { id: 2, name: "Axes d'articulation centrale du châssis", desc: "Pivots supérieur et inférieur de liaison du châssis oscillant. Élément vital de la directivité de l'engin.", freq: "Toutes les 8h (Quotidien)", qty: "8 coups de pompe (Graisse NLGI 2)", x: 380, y: 170 },
    { id: 3, name: "Vérins de direction (Paliers intérieurs & extérieurs)", desc: "Rotules des deux vérins de direction latéraux. Fortes secousses en roulage.", freq: "Toutes les 50h (Hebdomadaire)", qty: "3 coups de pompe par rotule", x: 360, y: 220 },
    { id: 4, name: "Tourillon d'oscillation d'essieu arrière", desc: "Palier permettant l'oscillation transversale de l'essieu arrière de ±8° sur terrains déformés.", freq: "Toutes les 50h (Hebdomadaire)", qty: "6 coups de pompe", x: 620, y: 210 },
    { id: 5, name: "Arbre de transmission central (Cardan)", desc: "Coupelles de croisillons de l'arbre reliant la transmission Funk aux essieux Kessler.", freq: "Toutes les 100h", qty: "2 coups de pompe (Doucement)", x: 470, y: 200 },
    { id: 6, name: "Pivots d'articulation des bras de levage", desc: "Grands paliers d'articulation reliant le bras de levage principal au châssis avant.", freq: "Toutes les 8h (Quotidien)", qty: "5 coups de pompe par pivot", x: 250, y: 110 },
    { id: 7, name: "Pivot central du levier de renvoi (Z-Bar)", desc: "Axe central d'inversion du sens de poussée pour le basculement rapide du godet.", freq: "Toutes les 8h (Quotidien)", qty: "4 coups de pompe", x: 180, y: 120 },
    { id: 8, name: "Rotules de biellette de godet", desc: "Liaisons directes sur l'arrière du godet soumises à l'abrasion et aux projections de roches.", freq: "Toutes les 8h (Quotidien)", qty: "6 coups de pompe", x: 100, y: 160 }
  ];

  // --- DIAGNOSTICS DE PANNES CRITIQUES ST7 ---
  const diagnosticsST7 = [
    {
      id: "diag-moteur-perf",
      title: "Perte de puissance et fumées noires sur le moteur Cummins QSB6.7",
      sev: "CRITIQUE",
      causes: [
        "Filtre à air primaire ou secondaire colmaté par la poussière de galerie (Vérifier l'indicateur de restriction).",
        "Pression de rampe commune (HPCR) insuffisante - fuite interne sur un injecteur ou dysfonctionnement de la pompe HP.",
        "Turbo-compresseur endommagé ou fuite d'air majeure sur les durites d'admission après l'échangeur thermique.",
        "Surchauffe due au colmatage des ailettes du radiateur par des boues ou débris miniers.",
        "Colmatage ou défaillance du filtre à particules (FAP/DPF) ou du catalyseur d'oxydation (DOC) freinant l'échappement."
      ]
    },
    {
      id: "diag-hyd-lent",
      title: "Mouvements lents du bras et du godet avec bruit de cavitation",
      sev: "ATTENTION",
      causes: [
        "Niveau d'huile hydraulique bas dans le réservoir de 144 litres provoquant une émulsion d'air.",
        "Crépine d'aspiration magnétique obstruée par des particules métalliques ou boues d'usure.",
        "Pompe hydraulique principale à pistons axiaux usée ou régulateur Load Sensing déréglé.",
        "Fuite interne sur les joints de piston des vérins de levage ou de benne.",
        "Pression de tarage de la valve de sécurité principale (Relief Valve) inférieure à la spécification nominale de 220 bar."
      ]
    },
    {
      id: "diag-sahr-bloc",
      title: "Échauffement anormal ou blocage intempestif des freins SAHR",
      sev: "CRITIQUE",
      causes: [
        "Baisse de pression d'huile de pilotage de desserrage sous le seuil critique de 120 bar.",
        "Accumulateurs à azote déchargés (précharge initiale à 70 bar non conforme).",
        "Disques de freins humides usés ou utilisation d'une huile non adaptée provoquant un gommage.",
        "Électrovanne de commande de frein de parking coincée mécaniquement ou court-circuitée.",
        "Contre-pression excessive dans la ligne de retour hydraulique de freinage vers le réservoir."
      ]
    },
    {
      id: "diag-hyd-heat",
      title: "Surchauffe générale du système hydraulique (Température > 90°C)",
      sev: "ATTENTION",
      causes: [
        "Signal PWM de commande du ventilateur hydraulique à vitesse variable (Fan Drive) interrompu ou décalibré.",
        "Laminage continu de l'huile à travers une soupape de décharge principale ou de direction tarée trop bas.",
        "Cavitation excessive et friction interne élevée dans la pompe principale à pistons axiaux due à une prise d'air à l'aspiration.",
        "Obstruction externe complète des faisceaux du refroidisseur d'huile hydraulique par les poussières de forage durcies."
      ]
    },
    {
      id: "diag-trans-slip",
      title: "La transmission Funk RT200 patine ou refuse de passer un rapport",
      sev: "CRITIQUE",
      causes: [
        "Pression de modulation d'embrayage (Clutch Pressure) insuffisante (valeur normale attendue : 16 - 19 bar).",
        "Bobine d'électrovanne proportionnelle de la transmission défectueuse ou faisceau électrique de commande endommagé.",
        "Blocage mécanique du tiroir de modulation proportionnelle par des sédiments métalliques fins.",
        "Glissement et usure extrême des garnitures des disques d'embrayage humides internes de la boîte de vitesses."
      ]
    },
    {
      id: "diag-steer-rough",
      title: "Direction lourde, saccadée ou absence totale d'assistance",
      sev: "CRITIQUE",
      causes: [
        "Dysfonctionnement du bloc amplificateur d'orbite (Orbitrol) ou tiroir de la valve de priorité de direction bloqué.",
        "Fuite interne sévère sur les joints d'étanchéité de l'un des deux vérins de direction d'articulation.",
        "Pression d'alimentation de direction inférieure à 190 bar (mesurer au point de diagnostic dédié).",
        "Jeu excessif ou grippage mécanique au niveau des pivots d'articulation supérieure et inférieure du châssis."
      ]
    },
    {
      id: "diag-cummins-start",
      title: "Démarrage difficile ou instable à froid du moteur QSB6.7",
      sev: "ATTENTION",
      causes: [
        "Présence d'air ou d'eau stagnante dans les préfiltres séparateurs Cummins (Purger et utiliser la pompe de gavage).",
        "Tension d'alimentation ECM trop basse au lancement du démarreur (doit rester supérieure à 18V sur réseau 24V).",
        "Dysfonctionnement de la grille de préchauffage d'air d'admission (Grid Heater) ou de son relais de puissance.",
        "Capteur de pression de rampe HPCR ou capteur de position d'arbre à cames défectueux transmettant des valeurs erronées."
      ]
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-slate-900 font-sans select-none relative z-10 w-full">
      
      {/* --- NIVEAU 1 : TOP NAV BAR --- */}
      <div className="w-full lg:absolute lg:top-0 lg:left-0 lg:right-0 bg-white border-b border-slate-100 p-4 shrink-0 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onSelectEngin("ST7")}
            className="h-10 px-5 rounded-lg font-black text-xs uppercase tracking-wider transition-all bg-amber-500 text-white shadow-md cursor-pointer"
          >
            Epiroc ST7
          </button>
          <button
            onClick={() => onSelectEngin("ST2G")}
            className="h-10 px-5 rounded-lg font-black text-xs uppercase tracking-wider transition-all bg-white border border-slate-200 text-slate-500 hover:text-amber-600 cursor-pointer"
          >
            Scooptram ST2G
          </button>
          <button
            onClick={() => onSelectEngin("ST2D")}
            className="h-10 px-5 rounded-lg font-black text-xs uppercase tracking-wider transition-all bg-white border border-slate-200 text-slate-500 hover:text-amber-600 cursor-pointer"
          >
            Scooptram ST2D
          </button>
          <button
            onClick={() => onSelectEngin("T23")}
            className="h-10 px-5 rounded-lg font-black text-xs uppercase tracking-wider transition-all bg-white border border-slate-200 text-slate-500 hover:text-amber-600 cursor-pointer"
          >
            Montabert T23
          </button>
          <button
            onClick={() => onSelectEngin("T28")}
            className="h-10 px-5 rounded-lg font-black text-xs uppercase tracking-wider transition-all bg-white border border-slate-200 text-slate-500 hover:text-amber-600 cursor-pointer"
          >
            Montabert T28
          </button>
        </div>
      </div>

      {/* Spacing Offset for Top selection bar */}
      <div className="w-full lg:pt-16 flex flex-col lg:flex-row flex-1">
        
        {/* --- NIVEAU 2 : COLONNE GAUCHE (SOMMAIRE) --- */}
        <aside className="w-full lg:w-64 bg-white border-r border-slate-100 shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] overflow-y-auto p-4 space-y-6 z-20">
          <div className="pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpen className="w-4.5 h-4.5 text-amber-500" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">
                SOMMAIRE TECHNIQUE
              </h2>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-normal">
              EPIROC SCOOPTRAM ST7 — MANUEL TECHNIQUE COMPLET
            </p>
          </div>

          <div className="space-y-6">
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <h3 className="text-[10px] font-black text-slate-400 tracking-wider uppercase pl-2">
                  {group.title}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer",
                        activeSection === item.id
                          ? "bg-amber-50 text-[#b8860b] shadow-xs border-l-4 border-amber-500 pl-2"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      <ChevronRight className={cn(
                        "w-3 h-3 transition-transform shrink-0",
                        activeSection === item.id ? "rotate-90 text-amber-500" : "text-slate-300"
                      )} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* --- NIVEAU 3 : CONTENU TECHNIQUE --- */}
        <main className="flex-1 p-6 lg:p-10 space-y-12 overflow-y-auto max-w-5xl mx-auto w-full">
          
          {/* EN TÊTE DE FICHE TECHNIQUE */}
          <div className="bg-white border-2 border-amber-500/15 rounded-[14px] shadow-sm overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              
              <div className="lg:col-span-2 p-6 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-500/30 text-amber-400 shadow-md">
                  <Cpu className="w-8 h-8 stroke-[2]" />
                </div>
              </div>

              <div className="lg:col-span-7 p-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left gap-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/40">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-amber-600" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-800">
                    MANUEL CONSTRUCTEUR TECHNIQUE — EPIROC AB
                  </span>
                </div>
                <h1 className="text-2xl xl:text-3xl tracking-tight leading-none uppercase font-black text-slate-900">
                  <span className="luminous-gold-white-text">
                    Epiroc Scooptram ST7
                  </span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Chargeuse minière souterraine de 6.8 tonnes · Moteur Cummins QSB6.7 & Powershift Funk RT200
                </p>
              </div>

              <div className="lg:col-span-3 p-6 flex flex-col items-center justify-center gap-2">
                <HydrominesLogo size={120} variant="full" className="mb-1" />
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 border border-amber-200/40 rounded-md">
                  <span className="w-1.5 h-1.5 bg-[#b8860b] rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold tracking-wider uppercase text-[#b8860b]">ENGIN MAJEUR ACTIF</span>
                </div>
                <div className="px-3 py-1 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-lg text-xs font-black text-[#ffd700] shadow-md uppercase tracking-widest text-center">
                  EPIROC ST7
                </div>
              </div>

            </div>
          </div>

          {/* SECTION : FICHE D'IDENTITÉ TECHNIQUE ST7 */}
          <section id="identite-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Layers className="w-4.5 h-4.5" /> SECTION 1
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Fiche d'identité technique & composants principaux
              </h2>
            </div>

            {/* INTERACTIVE GENERAL OVERVIEW DIAGRAM */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 relative shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Écorché interactif des organes majeurs (Passez le curseur)
                </span>
                {hoveredTooltip && hoveredComponent?.startsWith("layout-") && (
                  <span className="text-[10px] font-black uppercase text-amber-600 animate-pulse bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/40">
                    Composant survolé
                  </span>
                )}
              </div>

              {hoveredTooltip && hoveredComponent?.startsWith("layout-") && (
                <div className="absolute top-16 right-6 max-w-xs bg-slate-900 text-white text-xs font-semibold p-3 rounded-lg shadow-xl border border-slate-800 z-30 animate-in fade-in zoom-in-95 duration-100 uppercase tracking-wider">
                  <span className="text-amber-500 font-black block text-[9px] tracking-widest mb-1">Renseignements techniques</span>
                  {hoveredTooltip}
                </div>
              )}

              <div className="relative overflow-hidden w-full overflow-x-auto bg-slate-950 rounded-xl p-4 pl-8 border border-slate-900 shadow-inner">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-950 border-r border-red-800/30" />
                <div className="absolute left-1.5 top-0 bottom-0 w-1 bg-amber-500" />
                
                {/* SVG Écorché de la ST7 */}
                <svg viewBox="0 0 820 300" className="w-full max-w-3xl mx-auto font-mono text-[9px] font-black select-none text-white">
                  {/* Châssis articulé arrière */}
                  <rect x="420" y="100" width="220" height="90" rx="12" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
                  {/* Châssis articulé avant */}
                  <rect x="220" y="100" width="160" height="90" rx="6" fill="#2d3748" stroke="#4a5568" strokeWidth="2.5" />
                  {/* Articulation centrale */}
                  <rect x="380" y="115" width="40" height="60" rx="2" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="2" />
                  
                  {/* Godet standard de 3,1 m3 */}
                  <path d="M 40 190 L 130 190 L 170 110 L 130 80 L 115 80 L 105 110 Z" fill="#b7791f" stroke="#d69e2e" strokeWidth="3" />
                  
                  {/* Bras de levage principal (Z-Bar linkage) */}
                  <path d="M 140 140 L 250 115 L 250 140 Z" fill="none" stroke="#718096" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 125 150 L 230 115" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  
                  {/* Roues Kessler */}
                  <circle cx="280" cy="210" r="45" fill="#1a202c" stroke="#4a5568" strokeWidth="10" />
                  <circle cx="280" cy="210" r="20" fill="#718096" />
                  <circle cx="560" cy="210" r="45" fill="#1a202c" stroke="#4a5568" strokeWidth="10" />
                  <circle cx="560" cy="210" r="20" fill="#718096" />
                  
                  {/* Cabine opérateur ROPS/FOPS */}
                  <rect x="390" y="40" width="80" height="65" rx="6" fill="#1a202c" stroke="#f6ad55" strokeWidth="2" />
                  <rect x="400" y="50" width="30" height="25" fill="#ebf8ff" rx="2" opacity="0.8" />
                  <rect x="435" y="50" width="25" height="25" fill="#ebf8ff" rx="2" opacity="0.8" />

                  {/* Bloc Cummins Moteur QSB6.7 */}
                  <rect x="470" y="115" width="130" height="60" rx="4" fill="#742a2a" stroke="#e53e3e" strokeWidth="2" />
                  <text x="535" y="150" fill="white" textAnchor="middle" fontSize="10" fontWeight="bold">CUMMINS QSB6.7</text>

                  {/* Boîte de transfert Funk RT200 */}
                  <rect x="435" y="130" width="35" height="40" rx="2" fill="#2b6cb0" stroke="#3182ce" />

                  {/* INTERACTIVE HOVER ZONES */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("layout-bucket", "Godet standard de 3,1 m³ en acier Hardox 500 renforcé. Force d'arrachement de 138 kN.")} onMouseLeave={clearHover}>
                    <circle cx="100" cy="140" r="22" fill="#f59e0b" opacity="0.15" className="group-hover:opacity-40 transition-all" />
                    <circle cx="100" cy="140" r="4" fill="#f59e0b" />
                    <text x="100" y="175" fill="#f59e0b" textAnchor="middle" fontWeight="bold">GODET 3.1 m³</text>
                  </g>

                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("layout-pivot", "Axe d'articulation centrale renforcé. Supporte les efforts de torsion extrêmes. Articulation de 42,5°.")} onMouseLeave={clearHover}>
                    <circle cx="400" cy="145" r="18" fill="#38bdf8" opacity="0.15" className="group-hover:opacity-40 transition-all" />
                    <circle cx="400" cy="145" r="4" fill="#38bdf8" />
                    <text x="400" y="180" fill="#38bdf8" textAnchor="middle" fontWeight="bold">PIVOT CENTRAL</text>
                  </g>

                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("layout-cabin", "Cabine certifiée ROPS/FOPS pressurisée et climatisée. Siège à suspension pneumatique et commandes d'ergonomie avancée.")} onMouseLeave={clearHover}>
                    <circle cx="430" cy="72" r="18" fill="#a855f7" opacity="0.15" className="group-hover:opacity-40 transition-all" />
                    <circle cx="430" cy="72" r="4" fill="#a855f7" />
                    <text x="430" y="32" fill="#a855f7" textAnchor="middle" fontWeight="bold">CABINE ROPS/FOPS</text>
                  </g>

                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("layout-transmission", "Transmission Powershift modulée Funk RT200 à 4 rapports avant et 4 arrière. Passage de rapport sans à-coup.")} onMouseLeave={clearHover}>
                    <circle cx="452" cy="150" r="16" fill="#10b981" opacity="0.15" className="group-hover:opacity-40 transition-all" />
                    <circle cx="452" cy="150" r="4" fill="#10b981" />
                    <text x="452" y="188" fill="#10b981" textAnchor="middle" fontWeight="bold">BOÎTE FUNK RT200</text>
                  </g>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-amber-500 rounded-xs" /> Caractéristiques Générales ST7
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {generalIdentiteST7.map((spec, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-12 py-2">
                      <span className="col-span-5 font-bold text-slate-500">{spec.label}</span>
                      <span className="col-span-7 font-semibold text-slate-800">{spec.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-amber-500 rounded-xs" /> Chaîne Cinématique (Drivetrain)
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {transmissionST7.map((spec, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-12 py-2">
                      <span className="col-span-5 font-bold text-slate-500">{spec.label}</span>
                      <span className="col-span-7 font-semibold text-slate-800">{spec.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION : MOTEUR CUMMINS QSB6.7 */}
          <section id="specs-moteur-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Layers className="w-4.5 h-4.5" /> SECTION 2
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Motorisation Cummins QSB6.7 — Stage V / Tier 3
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-3">
                  <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                    Bloc de traction hautes performances QSB6.7
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Le moteur Cummins QSB6.7 équipant l'Epiroc ST7 intègre une suralimentation par turbocompresseur et un refroidissement d'air de suralimentation (Air-to-Air Charge Air Cooler). Sa gestion électronique intégrée par calculateur CM2350 ou CM850 gère en temps réel le débit d'injection Common Rail à haute pression (HPCR), garantissant une combustion optimale avec d'infimes émissions de fumées, adaptées aux contraintes d'aération des galeries souterraines.
                  </p>
                </div>
                <div className="md:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200/60 divide-y divide-slate-200 text-xs">
                  {specsMoteurST7.slice(0, 5).map((spec, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-12 py-1.5">
                      <span className="col-span-5 font-bold text-slate-500">{spec.label}</span>
                      <span className="col-span-7 font-black text-slate-800">{spec.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* DIAGRAMME SCHÉMATIQUE 2 : CIRCUIT LUBRIFICATION MOTEUR (SVG) */}
          <section id="circuit-huile-st7" className="scroll-mt-20 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 relative shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Schéma interactif du circuit de lubrification du moteur Cummins QSB6.7
                </span>
                {hoveredTooltip && hoveredComponent?.startsWith("engine-oil-") && (
                  <span className="text-[10px] font-black uppercase text-amber-600 animate-pulse bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/40">
                    Point d'inspection
                  </span>
                )}
              </div>

              {hoveredTooltip && hoveredComponent?.startsWith("engine-oil-") && (
                <div className="absolute top-16 right-6 max-w-xs bg-slate-900 text-white text-xs font-semibold p-3.5 rounded-lg shadow-xl border border-slate-800 z-30 animate-in fade-in zoom-in-95 duration-100 uppercase tracking-wider leading-relaxed">
                  <span className="text-amber-500 font-black block text-[10px] tracking-widest mb-1">Prescription Lubrification</span>
                  {hoveredTooltip}
                </div>
              )}

              <div className="relative overflow-hidden w-full overflow-x-auto bg-slate-950 rounded-xl p-4 pl-8 border border-slate-900 shadow-inner">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-950 border-r border-red-800/30" />
                <div className="absolute left-1.5 top-0 bottom-0 w-1 bg-red-500" />
                
                {/* SVG Circuit Lubrification Cummins */}
                <svg viewBox="0 0 800 320" className="w-full max-w-3xl mx-auto font-mono text-[9px] font-black select-none text-white">
                  <defs>
                    <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                    </marker>
                    <marker id="arrow-red-oil" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f87171" />
                    </marker>
                  </defs>

                  {/* Flux d'huile du carter aux filtres et rampe principale */}
                  <path d="M 120 230 L 120 160" fill="none" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
                  <path d="M 120 120 L 190 120" fill="none" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-blue)" />
                  <path d="M 310 120 L 380 120" fill="none" stroke="#f87171" strokeWidth="2.5" markerEnd="url(#arrow-red-oil)" />
                  <path d="M 500 120 L 580 120" fill="none" stroke="#f87171" strokeWidth="2.5" markerEnd="url(#arrow-red-oil)" />
                  <path d="M 640 150 L 640 230 L 180 230" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-blue)" />

                  {/* CARTER D'HUILE CUMMINS */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("engine-oil-pan", "Carter d'huile de 16,5 litres. Huile Premium 15W-40. Vérifier la jauge tous les matins à froid. Ne pas dépasser le repère MAX.")} onMouseLeave={clearHover}>
                    <rect x="50" y="230" width="140" height="60" rx="6" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                    <text x="120" y="265" fill="white" textAnchor="middle" fontWeight="bold">CARTER D'HUILE (16.5L)</text>
                  </g>

                  {/* POMPE DE LUBRIFICATION */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("engine-oil-pump", "Pompe à engrenages entraînée par pignon de distribution. Débit de 65 L/min à régime nominal. Pression nominale : 3,5 à 4,5 bar.")} onMouseLeave={clearHover}>
                    <circle cx="120" cy="140" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <text x="120" y="143" fill="white" textAnchor="middle" fontWeight="bold">POMPE À ENGRENAGES</text>
                  </g>

                  {/* ÉCHANGEUR THERMIQUE / LUB-COOLER */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("engine-oil-cooler", "Échangeur huile-eau intégré au bloc moteur. Refroidit l'huile moteur par le circuit d'eau principal. Surveiller toute intercontamination d'huile dans le liquide de refroidissement.")} onMouseLeave={clearHover}>
                    <rect x="190" y="90" width="120" height="60" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    <text x="250" y="125" fill="white" textAnchor="middle" fontWeight="bold">ÉCHANGEUR HUILE-EAU</text>
                  </g>

                  {/* DOUBLE FILTRE À HUILE */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("engine-oil-filters", "Filtre à passage intégral avec média Fleetguard. Remplacement impératif toutes les 250 heures opérationnelles. Toujours lubrifier le joint caoutchouc avant vissage à la main.")} onMouseLeave={clearHover}>
                    <rect x="380" y="90" width="120" height="60" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                    <text x="440" y="125" fill="white" textAnchor="middle" fontWeight="bold">FILTRES FLEETGUARD</text>
                  </g>

                  {/* TURBO-COMPRESSEUR */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("engine-oil-turbo", "Lubrification par raccord rigide sous haute pression. L'huile lubrifie et refroidit les paliers lisses tournant à plus de 100 000 tr/min. Laisser le moteur tourner au ralenti 3 minutes avant coupure.")} onMouseLeave={clearHover}>
                    <circle cx="640" cy="120" r="25" fill="#1e293b" stroke="#e53e3e" strokeWidth="2" />
                    <text x="640" y="123" fill="white" textAnchor="middle" fontWeight="bold" fontSize="8">TURBO</text>
                  </g>

                  {/* RAMPE DE GRAISSAGE COMMUNE (VILEBREQUIN & BIELLES) */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("engine-oil-gallery", "Galerie de distribution principale d'huile usinée dans le bloc cylindres. Distribue l'huile filtrée sous pression aux 7 paliers de vilebrequin et aux gicleurs de refroidissement des têtes de pistons.")} onMouseLeave={clearHover}>
                    <rect x="530" y="210" width="220" height="40" rx="4" fill="#0f172a" stroke="#64748b" />
                    <text x="640" y="233" fill="white" textAnchor="middle" fontWeight="bold" fontSize="8">RAMPE DE DISTRIBUTION PRINCIPALE</text>
                  </g>
                </svg>
              </div>
            </div>
          </section>

          {/* SECTION 3 : CIRCUIT HYDRAULIQUE & FREINAGE SAHR */}
          <section id="circuit-hyd-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Layers className="w-4.5 h-4.5" /> SECTION 3
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Circuit hydraulique de puissance (Load Sensing)
              </h2>
            </div>

            {/* DIAGRAMME SCHÉMATIQUE 3 : CIRCUIT HYDRAULIQUE PRINCIPAL (SVG) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 relative shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Boucle hydraulique de puissance — Levage bras & godet (Load Sensing 220 bar)
                </span>
                {hoveredTooltip && hoveredComponent?.startsWith("hyd-power-") && (
                  <span className="text-[10px] font-black uppercase text-amber-600 animate-pulse bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/40">
                    Survol actif
                  </span>
                )}
              </div>

              {hoveredTooltip && hoveredComponent?.startsWith("hyd-power-") && (
                <div className="absolute top-16 right-6 max-w-xs bg-slate-900 text-white text-xs font-semibold p-3.5 rounded-lg shadow-xl border border-slate-800 z-30 animate-in fade-in zoom-in-95 duration-100 uppercase tracking-wider leading-relaxed">
                  <span className="text-amber-500 font-black block text-[10px] tracking-widest mb-1">Détails Hydrauliques</span>
                  {hoveredTooltip}
                </div>
              )}

              <div className="relative overflow-hidden w-full overflow-x-auto bg-slate-950 rounded-xl p-4 pl-8 border border-slate-900 shadow-inner">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-950 border-r border-red-800/30" />
                <div className="absolute left-1.5 top-0 bottom-0 w-1 bg-sky-400" />
                
                {/* SVG Circuit Hydraulique ST7 */}
                <svg viewBox="0 0 800 320" className="w-full max-w-3xl mx-auto font-mono text-[9px] font-black select-none text-white">
                  <defs>
                    <marker id="arrow-green-hyd" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                    </marker>
                    <marker id="arrow-blue-hyd" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                    </marker>
                  </defs>

                  {/* Conduites principales */}
                  <path d="M 120 220 L 120 140" fill="none" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-blue-hyd)" />
                  <path d="M 120 100 L 210 100" fill="none" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow-green-hyd)" />
                  <path d="M 330 100 L 410 100" fill="none" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow-green-hyd)" />
                  <path d="M 445 80 L 445 40 L 530 40" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                  <path d="M 445 120 L 445 160 L 530 160" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                  <path d="M 640 60 L 640 230 L 180 230" fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />

                  {/* RÉSERVOIR HYDRAULIQUE (144 LITRES) */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("hyd-power-tank", "Réservoir de 144 litres. Utiliser de l'huile hydraulique ISO VG 46 Dynatrans approuvée. Analyse de contamination de classe ISO 18/16/13 requise toutes les 250 heures.")} onMouseLeave={clearHover}>
                    <rect x="50" y="220" width="140" height="60" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                    <text x="120" y="255" fill="white" textAnchor="middle" fontWeight="bold">RÉSERVOIR (144 L)</text>
                  </g>

                  {/* POMPE PRINCIPALE À PISTONS AXIAUX */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("hyd-power-pump", "Pompe Bosch Rexroth à pistons axiaux et cylindrée variable (100 cm³/tr). Débit maximal de 210 L/min régulé par compensateur Load Sensing pour limiter la consommation de puissance moteur.")} onMouseLeave={clearHover}>
                    <circle cx="120" cy="120" r="20" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <text x="120" y="123" fill="white" textAnchor="middle" fontWeight="bold">POMPE LS</text>
                  </g>

                  {/* DISTRIBUTEUR PRINCIPAL (PILOTAGE ÉLECTRO-PROPORTIONNEL) */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("hyd-power-valve", "Distributeur hydraulique Parker à tiroirs proportionnels. Reçoit le signal Load Sensing (LS) pour ajuster le débit requis. Intègre des valves anti-choc réglées à 240 bar.")} onMouseLeave={clearHover}>
                    <rect x="210" y="70" width="120" height="60" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                    <text x="270" y="105" fill="white" textAnchor="middle" fontWeight="bold">DISTRIBUTEUR</text>
                  </g>

                  {/* SYSTEME DE SERVO-COMMANDE / BLOC PILOTAGE */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("hyd-power-pilot", "Accumulateur et réducteur de pression de pilotage réglé à 35 bar. Permet de commander les tiroirs du distributeur principal de manière fluide depuis les joysticks cabine.")} onMouseLeave={clearHover}>
                    <rect x="360" y="80" width="100" height="40" rx="4" fill="#1e293b" stroke="#cbd5e0" strokeWidth="1.5" />
                    <text x="410" y="103" fill="white" textAnchor="middle" fontWeight="bold" fontSize="8">PILOTAGE 35 BAR</text>
                  </g>

                  {/* VÉRINS DE LEVAGE BRAS (DOUBLE EFFET) */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("hyd-power-cylinder-lift", "Deux vérins à double effet pour le levage du bras. Pression de service nominale : 220 bar. Amortissement hydraulique de fin de course pour protéger le châssis avant.")} onMouseLeave={clearHover}>
                    <rect x="530" y="20" width="110" height="40" rx="4" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                    <text x="585" y="43" fill="white" textAnchor="middle" fontWeight="bold" fontSize="8">VÉRINS DE LEVAGE (X2)</text>
                  </g>

                  {/* VÉRIN DE BENNE GODET (TILT) */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("hyd-power-cylinder-tilt", "Vérin de basculement unique à double effet couplé à une timonerie en Z. Permet de générer une force d'arrachement de 13 800 kg au niveau du godet.")} onMouseLeave={clearHover}>
                    <rect x="530" y="140" width="110" height="40" rx="4" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                    <text x="585" y="163" fill="white" textAnchor="middle" fontWeight="bold" fontSize="8">VÉRIN DE BENNE (X1)</text>
                  </g>

                  {/* RETOUR ET FILTRATION HAUTE PERFORMANCE */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("hyd-power-filter", "Filtre de retour hydraulique monté sur le dessus du réservoir. Cartouche en fibre de verre micro-efficace de 10 microns avec by-pass taré à 2,5 bar. Remplacement toutes les 500 heures.")} onMouseLeave={clearHover}>
                    <rect x="670" y="200" width="90" height="50" rx="4" fill="#0f172a" stroke="#64748b" />
                    <text x="715" y="228" fill="white" textAnchor="middle" fontWeight="bold" fontSize="8">FILTRE DE RETOUR</text>
                  </g>
                </svg>
              </div>
            </div>
          </section>

          {/* SECTION FREINAGE SAHR (SVG) */}
          <section id="frein-sahr-st7" className="scroll-mt-20 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 relative shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Architecture de sécurité — Système de Freinage SAHR (Spring Applied Hydraulic Released)
                </span>
                {hoveredTooltip && hoveredComponent?.startsWith("brake-sahr-") && (
                  <span className="text-[10px] font-black uppercase text-amber-600 animate-pulse bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/40">
                    Système Sécurité
                  </span>
                )}
              </div>

              {hoveredTooltip && hoveredComponent?.startsWith("brake-sahr-") && (
                <div className="absolute top-16 right-6 max-w-xs bg-slate-900 text-white text-xs font-semibold p-3.5 rounded-lg shadow-xl border border-slate-800 z-30 animate-in fade-in zoom-in-95 duration-100 uppercase tracking-wider leading-relaxed">
                  <span className="text-amber-500 font-black block text-[10px] tracking-widest mb-1">Prescription Freinage</span>
                  {hoveredTooltip}
                </div>
              )}

              <div className="relative overflow-hidden w-full overflow-x-auto bg-slate-950 rounded-xl p-4 pl-8 border border-slate-900 shadow-inner">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-950 border-r border-red-800/30" />
                <div className="absolute left-1.5 top-0 bottom-0 w-1 bg-red-600" />
                
                {/* SVG Freinage SAHR */}
                <svg viewBox="0 0 800 320" className="w-full max-w-3xl mx-auto font-mono text-[9px] font-black select-none text-white">
                  <defs>
                    <marker id="arrow-green-b" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
                    </marker>
                    <marker id="arrow-red-b" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                    </marker>
                  </defs>

                  {/* Lignes hydrauliques de freinage */}
                  <path d="M 140 230 L 140 160" fill="none" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow-green-b)" />
                  <path d="M 140 100 L 210 100" fill="none" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow-green-b)" />
                  <path d="M 320 100 L 390 100" fill="none" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow-green-b)" />
                  <path d="M 490 100 L 560 100" fill="none" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrow-red-b)" />
                  <path d="M 620 130 L 620 190" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                  <path d="M 620 190 L 510 190" fill="none" stroke="#ef4444" strokeWidth="2" />
                  <path d="M 620 190 L 730 190" fill="none" stroke="#ef4444" strokeWidth="2" />

                  {/* ALIMENTATION HYDRAULIQUE DE FREIN */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("brake-sahr-source", "Huile de freinage prélevée du circuit principal via une valve de priorité. Pression de charge régulée entre 135 et 155 bar pour assurer la réserve de freinage.")} onMouseLeave={clearHover}>
                    <rect x="50" y="230" width="160" height="50" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                    <text x="130" y="258" fill="white" textAnchor="middle" fontWeight="bold">PILOTAGE FREIN 145 BAR</text>
                  </g>

                  {/* VALVE DE PURGE / CHARGE FREIN */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("brake-sahr-valve", "Valve accumulatrice de freinage Mico. Dirige le débit prioritaire pour charger les accumulateurs de pression à 145 bars. Coupe la charge une fois la pression nominale atteinte.")} onMouseLeave={clearHover}>
                    <rect x="210" y="70" width="110" height="60" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                    <text x="265" y="105" fill="white" textAnchor="middle" fontWeight="bold">VALVE CHARGE</text>
                  </g>

                  {/* BLOC ACCUMULATEURS À AZOTE (PARKING + SERVICE) */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("brake-sahr-acc", "Trois accumulateurs à vessie d'azote de 1,0L chacun. Assurent une réserve de pression résiduelle permettant au moins 7 freinages de secours complets après arrêt du moteur. Précharge d'azote stricte à 70 bar.")} onMouseLeave={clearHover}>
                    <rect x="370" y="70" width="120" height="60" rx="4" fill="#1e293b" stroke="#e53e3e" strokeWidth="2" />
                    <text x="430" y="105" fill="white" textAnchor="middle" fontWeight="bold">ACCUMULATEURS (3)</text>
                  </g>

                  {/* MANOCONTACT / COMMANDE FREIN DE SECU (SAHR SOLENOID) */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("brake-sahr-solenoid", "Électrovanne proportionnelle de frein de stationnement. Lorsque la bobine est excitée par le système électronique (24V), elle envoie la pression hydraulique pour desserrer les freins. Une coupure électrique provoque instantanément le serrage par ressorts.")} onMouseLeave={clearHover}>
                    <rect x="540" y="70" width="140" height="60" rx="4" fill="#1e293b" stroke="#e53e3e" strokeWidth="2" />
                    <text x="610" y="105" fill="white" textAnchor="middle" fontWeight="bold">ÉLECTROVANNE PARKING</text>
                  </g>

                  {/* ÉTRIER SAHR ESSIEU AVANT */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("brake-sahr-front", "Freins multi-disques humides entièrement logés dans le carter de l'essieu Kessler avant. Le serrage de secours/parking est obtenu par un empilement de rondelles Belleville (Ressorts) exerçant une force mécanique permanente sur les disques.")} onMouseLeave={clearHover}>
                    <rect x="420" y="170" width="90" height="40" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="465" y="193" fill="white" textAnchor="middle" fontWeight="bold" fontSize="8">FREIN AV (KESSLER)</text>
                  </g>

                  {/* ÉTRIER SAHR ESSIEU ARRIÈRE */}
                  <g className="cursor-pointer group" onMouseEnter={() => handleComponentHover("brake-sahr-rear", "Système identique à l'essieu avant monté sur l'essieu oscillant Kessler arrière. L'étanchéité absolue du carter humide empêche l'intrusion d'eau acide ou de débris abrasifs de mine.")} onMouseLeave={clearHover}>
                    <rect x="710" y="170" width="90" height="40" rx="4" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
                    <text x="755" y="193" fill="white" textAnchor="middle" fontWeight="bold" fontSize="8">FREIN AR (KESSLER)</text>
                  </g>
                </svg>
              </div>
            </div>
          </section>

          {/* SECTION : LUBRIFICATION TERRAIN & PLAN DE GRAISSAGE 30 POINTS */}
          <section id="plan-graissage-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Layers className="w-4.5 h-4.5" /> SECTION 4
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Plan de graissage périodique ST7 (30 Points)
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 relative shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                Cliquez sur un point de lubrification rouge pour inspecter sa périodicité et ses spécifications de maintenance.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* SVG Châssis interactif avec les 8 points clés */}
                <div className="lg:col-span-7 bg-slate-950 rounded-xl p-4 border border-slate-900 relative shadow-inner">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
                  
                  <svg viewBox="0 0 700 280" className="w-full max-w-2xl mx-auto select-none font-mono">
                    {/* Dessin très simplifié du dessus de la machine */}
                    <path d="M 80 140 L 260 80 L 440 80 L 620 140 L 440 200 L 260 200 Z" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                    <line x1="380" y1="80" x2="380" y2="200" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
                    
                    {/* Points de graissage cliquables */}
                    {graissagePointsST7.map((pt) => (
                      <g 
                        key={pt.id}
                        onClick={() => setSelectedPoint(pt)}
                        className="cursor-pointer group"
                      >
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r={selectedPoint?.id === pt.id ? "16" : "11"} 
                          fill={selectedPoint?.id === pt.id ? "#ef4444" : "#f59e0b"} 
                          opacity={selectedPoint?.id === pt.id ? "0.4" : "0.2"} 
                          className="group-hover:scale-125 transition-all" 
                        />
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r="5" 
                          fill={selectedPoint?.id === pt.id ? "#ef4444" : "#f59e0b"} 
                          className="group-hover:scale-110 transition-all border border-white" 
                        />
                        <text 
                          x={pt.x} 
                          y={pt.y - 14} 
                          fill="white" 
                          fontSize="9" 
                          textAnchor="middle" 
                          fontWeight="bold"
                          className="drop-shadow-md bg-slate-900/80 px-1 py-0.5 rounded-xs"
                        >
                          P{pt.id}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Panneau d'informations du point sélectionné */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-5 min-h-[250px] flex flex-col justify-between">
                  {selectedPoint ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-xs">
                          {selectedPoint.id}
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                            {selectedPoint.name}
                          </h4>
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">
                            PÉRICODICITÉ : {selectedPoint.freq}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        {selectedPoint.desc}
                      </p>

                      <div className="bg-white border border-slate-100 rounded-lg p-3.5 space-y-1.5 shadow-2xs">
                        <div className="flex justify-between text-[10px] uppercase font-bold">
                          <span className="text-slate-400">Dose prescrite</span>
                          <span className="text-[#b8860b]">{selectedPoint.qty}</span>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold">
                          <span className="text-slate-400">Type de graisse</span>
                          <span className="text-slate-700">NLGI 2 (Extrême Pression)</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8 space-y-3 my-auto">
                      <Wrench className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs font-bold uppercase tracking-wider">
                        Sélectionnez un point sur la carte pour inspecter ses prescriptions de graissage
                      </p>
                    </div>
                  )}

                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center border-t border-slate-200 pt-3 mt-4">
                    PLAN DE GRAISSAGE GLOBAL DE 30 POINTS — EPIROC AB
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* TABLEAU RÉCAPITULATIF DES FLUIDES ST7 */}
          <section id="fluides-st7" className="scroll-mt-20 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-amber-500 rounded-xs" /> Tableau récapitulatif des fluides et contenances (ST7)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 font-black text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 rounded-l-lg">Organe technique</th>
                      <th className="p-3.5">Volume (Litres)</th>
                      <th className="p-3.5">Type de fluide prescrit</th>
                      <th className="p-3.5 rounded-r-lg">Périodicité vidange</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-semibold text-slate-800">
                    <tr>
                      <td className="p-3.5 font-black text-slate-700">Moteur Cummins QSB6.7</td>
                      <td className="p-3.5">16,5 L</td>
                      <td className="p-3.5">SAE 15W-40 Premium API CK-4 / CES 20086</td>
                      <td className="p-3.5 text-amber-600 font-bold">Toutes les 250 h</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-black text-slate-700">Réservoir Hydraulique Principal</td>
                      <td className="p-3.5">144,0 L</td>
                      <td className="p-3.5">ISO VG 46 Dynatrans (Haute viscosité)</td>
                      <td className="p-3.5 text-amber-600 font-bold">Toutes les 2 000 h</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-black text-slate-700">Transmission Funk RT200</td>
                      <td className="p-3.5">34,0 L</td>
                      <td className="p-3.5">ATF Dexron III (Lubrification convertisseur)</td>
                      <td className="p-3.5 text-amber-600 font-bold">Toutes les 1 000 h</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-black text-slate-700">Essieu Kessler Avant (K71)</td>
                      <td className="p-3.5">38,0 L</td>
                      <td className="p-3.5">SAE 85W-140 API GL-5 avec modificateur friction</td>
                      <td className="p-3.5 text-amber-600 font-bold">Toutes les 1 000 h</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-black text-slate-700">Essieu Kessler Arrière (K71)</td>
                      <td className="p-3.5">38,0 L</td>
                      <td className="p-3.5">SAE 85W-140 API GL-5 (Sans modificateur friction)</td>
                      <td className="p-3.5 text-amber-600 font-bold">Toutes les 1 000 h</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-black text-slate-700">Système de Refroidissement</td>
                      <td className="p-3.5">30,0 L</td>
                      <td className="p-3.5">Antigel organique Fleetguard OAT 50/50</td>
                      <td className="p-3.5 text-amber-600 font-bold">Toutes les 2 000 h / 2 Ans</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION : GUIDE DE RÉSOLUTION DES PANNES (DIAGNOSTIC) */}
          <section id="diag-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Layers className="w-4.5 h-4.5" /> SECTION 5
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Guide de diagnostic de pannes critiques ST7
              </h2>
            </div>

            <div className="space-y-4">
              {diagnosticsST7.map((diag, dIdx) => {
                const accordionId = `d-${diag.id}`;
                const isOpen = openAccordions[accordionId];
                return (
                  <div key={dIdx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <button
                      onClick={() => toggleAccordion(accordionId)}
                      className="w-full text-left p-5 flex items-center justify-between font-black uppercase text-xs tracking-wider bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {diag.sev === "CRITIQUE" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[9px] font-black">
                            <ShieldAlert className="w-3.5 h-3.5" /> ALERTE BLOQUANTE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 text-[9px] font-black">
                            <AlertTriangle className="w-3.5 h-3.5" /> ATTENTION RETOUR ATELIER
                          </span>
                        )}
                        <span className="text-slate-800 leading-tight">{diag.title}</span>
                      </div>
                      <ChevronDown className={cn("w-4.5 h-4.5 text-slate-400 transition-transform", isOpen ? "rotate-180" : "")} />
                    </button>

                    {isOpen && (
                      <div className="p-5 border-t border-slate-100 space-y-3.5 animate-in slide-in-from-top-1 duration-150">
                        <div className="flex items-center gap-1 text-[10px] font-black text-[#b8860b] uppercase tracking-wider">
                          <Eye className="w-3.5 h-3.5" /> PROTOCOLE DE RECHERCHE DE CAUSES (ORDRE DE RECOMMANDATION)
                        </div>
                        <ul className="space-y-2.5">
                          {diag.causes.map((cause, cIdx) => (
                            <li key={cIdx} className="text-xs text-slate-600 font-semibold flex items-start gap-2 leading-relaxed">
                              <span className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-slate-100 text-slate-700 font-black text-[10px] shrink-0 border border-slate-200">
                                {cIdx + 1}
                              </span>
                              <span>{cause}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION : PROCÉDURES TECHNIQUES CRITIQUES (ATELIER) */}
          <section id="proced-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Layers className="w-4.5 h-4.5" /> SECTION 6
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Procédures périodiques d'entretien critiques
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-200/50 text-[9px] font-black uppercase tracking-wider mb-3">
                    <ShieldAlert className="w-3 h-3" /> Consigne Sécurité Majeure
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">
                    Test d'usure des freins SAHR et recharge d'azote
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">
                    La sécurité de l'engin dans les fortes rampes souterraines dépend de l'état des disques SAHR et de la pression d'azote. Un contrôle hebdomadaire de l'indicateur d'usure de l'essieu est impératif. La recharge de l'accumulateur doit se faire exclusivement avec de l'azote pur (N₂) au moyen d'un bloc de gonflage agréé Epiroc.
                  </p>
                </div>
                <div className="space-y-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span>Précharge azote nominale :</span>
                    <span className="text-red-600 font-black">70 BAR (à +20°C)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seuil usure disques max :</span>
                    <span className="text-slate-800">4.5 mm (Mesurer tige de jauge)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/50 text-[9px] font-black uppercase tracking-wider mb-3">
                    <CheckCircle className="w-3 h-3" /> Procédure standardisée
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">
                    Purge de l'air du circuit de carburant Cummins HPCR
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed mb-4">
                    Après remplacement des deux filtres Fleetguard, de l'air peut entrer dans la rampe haute pression. Ne jamais desserrer de raccord métallique sur le système HPCR sous peine de risque mortel de jet sous pression extrême (jusqu'à 1 800 bars). Utiliser exclusivement la pompe d'amorçage électrique intégrée.
                  </p>
                </div>
                <ul className="text-[10px] font-semibold text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <li className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700">
                    <Wrench className="w-3.5 h-3.5 text-amber-500" /> ÉTAPE :
                  </li>
                  <li>1. Remplacer les deux filtres sans pré-remplissage manuel d'hydrocarbures.</li>
                  <li>2. Mettre le contact clé sans lancer le démarreur.</li>
                  <li>3. Laisser la pompe d'amorçage électrique tourner 30 à 45 secondes complètes.</li>
                  <li>4. Couper puis renouveler l'opération 3 fois avant de démarrer.</li>
                </ul>
              </div>

            </div>
          </section>

          {/* SECTION : RÉGLAGES D'USINE & PRESSIONS LIMITES (PARAMÈTRES EXPERT) */}
          <section id="reglages-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Layers className="w-4.5 h-4.5" /> SECTION 7
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Réglages d'usine & Pressions critiques d'exploitation
              </h2>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-xl p-6 shadow-md border border-slate-800 space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-2">
                  <Gauge className="w-4.5 h-4.5" /> PARAMÈTRES HYDRAULIQUES & LUBRIFICATION (TOLÉRANCES CONSTRUCTEUR)
                </h3>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                  Ces valeurs constituent les seuils critiques pour assurer l'efficacité de la chargeuse souterraine <span className="font-bold text-white">Epiroc Scooptram ST7</span>. Toute déviation par rapport à ces plages nécessite un recalibrage immédiat en atelier spécialisé.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                
                <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pression du circuit principal (LS)</div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-white">220 BAR</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-900/50">± 5 BAR</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-semibold">Plage maximale requise lors de l'effort au godet (Arrachement).</p>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Marge Stand-by Load Sensing</div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-white">24 BAR</span>
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-900/50">20 - 26 BAR</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-semibold">Différence de pression dynamique régulée à la pompe.</p>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pilotage Direction Articulation</div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-white">190 BAR</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-900/50">Max nominal</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-semibold">Soupape de décharge de direction Kessler calibrée à l'Orbitrol.</p>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pression de Frein de Parking SAHR</div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-white">145 BAR</span>
                    <span className="text-[9px] font-bold text-red-400 bg-red-950 px-1.5 py-0.5 rounded border border-red-900/50">Seuil min: 120B</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-semibold">En dessous de 120 bars, les freins s'appliquent automatiquement par sécurité.</p>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Embrayage Boîte Funk RT200</div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-white">18 BAR</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-900/50">16 - 19 BAR</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-semibold">Pression de serrage des disques humides de boîte Powershift.</p>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pression Rampe Commune Cummins</div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black text-white">1800 BAR</span>
                    <span className="text-[9px] font-bold text-red-400 bg-red-950 px-1.5 py-0.5 rounded border border-red-900/50">HPCR Max</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-semibold">Pression d'injection maximale gérée de manière dynamique par l'ECM.</p>
                </div>

              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-2.5">
                <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> RECOMMANDATIONS MAJEURES DE L'EXPERT D'ATELIER
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-300 font-semibold leading-relaxed">
                  <div className="space-y-1.5">
                    <p className="text-white font-bold uppercase tracking-wide">1. Protection de la turbine du turbocompresseur</p>
                    <p>Ne jamais couper le moteur Cummins immédiatement après un effort soutenu sous charge ou une rampe ascendante. Laisser impérativement tourner au ralenti pendant 3 à 5 minutes pour stabiliser la température des paliers lubrifiés du turbocompresseur.</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-white font-bold uppercase tracking-wide">2. Respect strict de la viscosité des huiles</p>
                    <p>N'employer que des fluides d'origine homologués. Le circuit hydraulique principal utilise de l'ISO VG 46 de haute stabilité thermique pour prévenir le laminage et la surchauffe dans des ambiances souterraines confinées à températures ambiantes élevées.</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION : ROUTAGE & SCHÉMAS HYDRAULIQUES */}
          <section id="conduites-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Layers className="w-4.5 h-4.5" /> SECTION 8
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Routage des Conduites & Schémas Hydrauliques
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" /> ÉTUDE DES CIRCUITS & SYSTÈME DE DISTRIBUTION
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Le Scooptram ST7 utilise un système hydraulique intelligent <span className="font-bold text-slate-700">Load Sensing (LS)</span> à centre fermé. L'huile aspirée du réservoir de 144 L est distribuée vers la direction, le freinage et les équipements de levage via des conduites haute pression renforcées (tressage acier 4 ou 6 spires) conçues pour résister à des pics de pression de plus de 400 bars en pointe d'effort.
                </p>
              </div>

              {/* INTERACTIVE ROUTING VISUALIZER */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedRoute("hp")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all",
                      selectedRoute === "hp"
                        ? "bg-red-500 text-white border-red-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    Ligne Haute Pression LS (220 Bar)
                  </button>
                  <button
                    onClick={() => setSelectedRoute("dir")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all",
                      selectedRoute === "dir"
                        ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    Ligne Direction Articulation (190 Bar)
                  </button>
                  <button
                    onClick={() => setSelectedRoute("sahr")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all",
                      selectedRoute === "sahr"
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    Ligne Pilotage Frein SAHR (145 Bar)
                  </button>
                  <button
                    onClick={() => setSelectedRoute("ret")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all",
                      selectedRoute === "ret"
                        ? "bg-blue-500 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    Ligne de Retour & Refroidissement
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Schematic SVG Area */}
                  <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-center min-h-[220px]">
                    <svg viewBox="0 0 400 200" className="w-full h-auto text-white select-none">
                      {/* Reservor Hydraulic */}
                      <rect x="20" y="140" width="80" height="50" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                      <text x="60" y="170" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">RÉSERVOIR 144L</text>
                      
                      {/* Pump Assembly */}
                      <circle cx="150" cy="110" r="22" fill="#334155" stroke="#64748b" strokeWidth="2" />
                      <text x="150" y="113" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">POMPE LS</text>

                      {/* Direction / Orbitrol block */}
                      <rect x="260" y="30" width="90" height="35" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                      <text x="305" y="52" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">ORBITROL & DIRECT.</text>

                      {/* Equipment block / Valve main */}
                      <rect x="260" y="90" width="90" height="35" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                      <text x="305" y="112" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">DISTRIBUTEUR GODET</text>

                      {/* SAHR brake controller block */}
                      <rect x="260" y="150" width="90" height="35" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                      <text x="305" y="172" fill="#cbd5e1" fontSize="7" fontWeight="bold" textAnchor="middle">VALVE DE FREIN SAHR</text>

                      {/* SUCTION LINE */}
                      <path d="M 60 140 L 60 110 L 128 110" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="4" />

                      {/* DYNAMIC PIPING BASED ON SELECTION */}
                      {selectedRoute === "hp" && (
                        <>
                          <path d="M 172 110 L 260 110" fill="none" stroke="#ef4444" strokeWidth="4" className="animate-pulse" />
                          <path d="M 220 110 L 220 50 L 260 50" fill="none" stroke="#ef4444" strokeWidth="3" />
                          <circle cx="210" cy="110" r="3" fill="#ef4444" />
                          <text x="210" y="125" fill="#f87171" fontSize="8" fontWeight="black" textAnchor="middle">220 BAR MAX</text>
                        </>
                      )}

                      {selectedRoute === "dir" && (
                        <>
                          <path d="M 172 110 L 210 110 L 210 45 L 260 45" fill="none" stroke="#f59e0b" strokeWidth="4" className="animate-pulse" />
                          <circle cx="230" cy="45" r="3" fill="#f59e0b" />
                          <text x="230" y="38" fill="#fbbf24" fontSize="8" fontWeight="black" textAnchor="middle">190 BAR</text>
                        </>
                      )}

                      {selectedRoute === "sahr" && (
                        <>
                          <path d="M 172 110 L 200 110 L 200 165 L 260 165" fill="none" stroke="#10b981" strokeWidth="4" className="animate-pulse" />
                          <circle cx="185" cy="165" r="3" fill="#10b981" />
                          <text x="185" y="157" fill="#34d399" fontSize="8" fontWeight="black" textAnchor="middle">145 BAR</text>
                        </>
                      )}

                      {selectedRoute === "ret" && (
                        <>
                          <path d="M 350 48 L 375 48 L 375 180 L 100 180" fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeDasharray="3" />
                          <path d="M 350 108 L 365 108 L 365 180" fill="none" stroke="#3b82f6" strokeWidth="3" />
                          <path d="M 350 168 L 358 168 L 358 180" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                          <text x="350" y="193" fill="#60a5fa" fontSize="8" fontWeight="black" textAnchor="middle">RETOUR RÉSERVOIR (BASSE PRESSION)</text>
                        </>
                      )}
                    </svg>
                  </div>

                  {/* Technical Information panel */}
                  <div className="lg:col-span-6 space-y-3.5">
                    {selectedRoute === "hp" && (
                      <div className="space-y-2 bg-white p-4 rounded-lg border border-slate-200">
                        <div className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                          <Shield className="w-4 h-4" /> SPÉCIFICATIONS CONDUITES HAUTE PRESSION (LS)
                        </div>
                        <h4 className="text-xs font-black text-slate-800 uppercase">Conduites de distribution d'arrachement & d'équipement</h4>
                        <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                          Ces conduites relient la sortie de la pompe principale de 220 bar au bloc de distribution centralisé sous la cabine. 
                        </p>
                        <ul className="text-[10px] space-y-1 text-slate-600 font-bold uppercase">
                          <li>• <span className="text-slate-800">Spécification flexible :</span> SAE 100R15 (Tuyau hydraulique haute pression extrême, 4 ou 6 spirales en acier haute résistance).</li>
                          <li>• <span className="text-slate-800">Diamètre nominal (DN) :</span> 19 mm (3/4") à 25 mm (1").</li>
                          <li>• <span className="text-slate-800">Rayon de courbure min :</span> 240 mm (À respecter strictement pour éviter le cisaillement d'acier).</li>
                          <li>• <span className="text-slate-800">Type de raccord :</span> Bride SAE J518 Code 62 (Haute pression) fixée avec vis classe 10.9 d'origine.</li>
                        </ul>
                      </div>
                    )}

                    {selectedRoute === "dir" && (
                      <div className="space-y-2 bg-white p-4 rounded-lg border border-slate-200">
                        <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                          <Compass className="w-4 h-4" /> SPÉCIFICATIONS CIRCUIT DE DIRECTION Kessler
                        </div>
                        <h4 className="text-xs font-black text-slate-800 uppercase">Canalisations d'articulation de châssis</h4>
                        <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                          Le circuit de direction est géré par une valve de priorité de 190 bar alimentant l'Orbitrol de cabine et les vérins de direction d'articulation.
                        </p>
                        <ul className="text-[10px] space-y-1 text-slate-600 font-bold uppercase">
                          <li>• <span className="text-slate-800">Spécification flexible :</span> SAE 100R12 (Hydraulique moyenne/haute pression, 4 spirales acier).</li>
                          <li>• <span className="text-slate-800">Diamètre nominal (DN) :</span> 12 mm (1/2") à 16 mm (5/8").</li>
                          <li>• <span className="text-slate-800">Rayon de courbure min :</span> 180 mm.</li>
                          <li>• <span className="text-slate-800">Type de raccord :</span> Filetage JIC 37° femelle pivotant pour résister aux mouvements oscillants.</li>
                        </ul>
                      </div>
                    )}

                    {selectedRoute === "sahr" && (
                      <div className="space-y-2 bg-white p-4 rounded-lg border border-slate-200">
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4" /> SPÉCIFICATIONS ALIMENTATION DESSERRAGE FREIN SAHR
                        </div>
                        <h4 className="text-xs font-black text-slate-800 uppercase">Conduites de sécurité de frein de parking & roulage</h4>
                        <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                          Le desserrage hydraulique nécessite 145 bar d'huile propre pour contrer les ressorts internes. Une rupture de conduite applique instantanément les freins.
                        </p>
                        <ul className="text-[10px] space-y-1 text-slate-600 font-bold uppercase">
                          <li>• <span className="text-slate-800">Spécification flexible :</span> SAE 100R2AT (2 tresses fils d'acier haute résistance).</li>
                          <li>• <span className="text-slate-800">Diamètre nominal (DN) :</span> 10 mm (3/8").</li>
                          <li>• <span className="text-slate-800">Rayon de courbure min :</span> 130 mm.</li>
                          <li>• <span className="text-slate-800">Protection physique obligatoire :</span> Gaine de protection en fibre de verre siliconée (Fire Sleeve) contre l'abrasion des roches et les projections thermiques de l'échappement.</li>
                        </ul>
                      </div>
                    )}

                    {selectedRoute === "ret" && (
                      <div className="space-y-2 bg-white p-4 rounded-lg border border-slate-200">
                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                          <Droplets className="w-4 h-4" /> SPÉCIFICATIONS LIGNE DE RETOUR & FILTRATION
                        </div>
                        <h4 className="text-xs font-black text-slate-800 uppercase">Lignes de retour basse pression & Refroidisseur</h4>
                        <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                          Collecte les huiles déchargées de tous les blocs distributeurs et les envoie à travers les cartouches filtrantes de 10 microns puis le refroidisseur d'huile.
                        </p>
                        <ul className="text-[10px] space-y-1 text-slate-600 font-bold uppercase">
                          <li>• <span className="text-slate-800">Spécification flexible :</span> SAE 100R4 (Tuyau aspiration et retour, armature métallique en hélice pour résister au vide d'aspiration).</li>
                          <li>• <span className="text-slate-800">Diamètre nominal (DN) :</span> 38 mm (1" 1/2) à 50 mm (2").</li>
                          <li>• <span className="text-slate-800">Seuil de contre-pression max :</span> Inférieur à 5 bar en sortie (Une valeur supérieure endommagerait les tiroirs de distributeurs).</li>
                          <li>• <span className="text-slate-800">Précision d'atelier :</span> Ne jamais étrangler, plier ou réduire le diamètre interne des conduites de retour.</li>
                        </ul>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* ROUTING INSPECTION PROTOCOL FOR NEW MECHANICS */}
              <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4" /> RÈGLES DE ROUTAGE SÛR ET SÉCURISATION (MANUEL DE L'EXPERT)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-300 leading-relaxed font-semibold">
                  <div className="space-y-2">
                    <p className="text-white font-black uppercase tracking-wide text-xs">1. Prévention contre le frottement rocheux</p>
                    <p>En galerie minière souterraine, les conduites sont soumises à d'intenses vibrations et à des projections de roches pointues. Fixer solidement les flexibles à l'aide de colliers métalliques doublés de caoutchouc (Colliers type Stauff). Ne jamais laisser deux flexibles sous pression se toucher et frotter directement l'un contre l'autre.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-black uppercase tracking-wide text-xs">2. Flexibilité d'articulation centrale</p>
                    <p>Les conduites qui traversent l'articulation centrale de l'engin subissent une flexion de 42,5° et des oscillations de ±8°. Laisser une longueur libre (boucle de courbure) adéquate. Si le flexible est trop court, il se déformera et subira un arrachement sous pression lors des manœuvres de direction maximale.</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION : TRAITEMENT D'ENGIN & BONNES PRATIQUES */}
          <section id="traitement-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Layers className="w-4.5 h-4.5" /> SECTION 9
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Traitement d'Engin & Bonnes Pratiques de Roulage
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-500" /> GUIDE COMPORTEMENTAL DE L'ENGIN EN CONDITIONS EXTRÊMES
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Le traitement correct de la machine par l'opérateur et les techniciens d'atelier est le premier facteur de réduction de 90% des pannes répétitives. Traiter l'engin comme un outil de précision garantit une durée de vie prolongée de tous ses composants hydrauliques et mécaniques Kessler / Cummins / Funk.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ETAPE A : START & WARM UP */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">1</span>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Démarrage & Chauffage Hydraulique Progressif</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      Le démarrage à froid dans des zones de stockage ventilées requiert un protocole précis pour éviter la cavitation de la pompe principale de 220 bar due à la viscosité élevée de l'huile froide.
                    </p>
                    <ul className="text-[10px] font-bold text-slate-600 uppercase mt-3 space-y-1">
                      <li className="text-slate-800">• ÉTAPE I : Démarrer le moteur et stabiliser au ralenti (800 tr/min) pendant 3 minutes.</li>
                      <li>• ÉTAPE II : Augmenter à 1200 tr/min. Actionner lentement et sans charge le vérin de godet de butée à butée.</li>
                      <li>• ÉTAPE III : Cycle d'activation de direction sans forcer sur les butées de châssis (Active la circulation dans Kessler).</li>
                      <li className="text-emerald-700">• TEMPÉRATURE MINIMUM REQUISE POUR ROULER : 40°C pour l'huile hydraulique.</li>
                    </ul>
                  </div>
                </div>

                {/* ETAPE B : DIGGING IN MINING FACE */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-black">2</span>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Technique de Pénétration dans le tas de Minerai</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      Le glissement excessif des roues de l'essieu Kessler sur la roche abrasive de galerie détruit les pneus et provoque des chocs thermiques internes sévères dans la boîte de vitesses Funk RT200.
                    </p>
                    <ul className="text-[10px] font-bold text-slate-600 uppercase mt-3 space-y-1">
                      <li className="text-slate-800">• RÈGLE I : Pénétrer le tas de minerai exclusivement en 1ère vitesse lente.</li>
                      <li>• RÈGLE II : Ne jamais accélérer à fond si les roues commencent à patiner ou à tourner sur place.</li>
                      <li>• RÈGLE III : Coordonner le levage du bras de godet avec l'avancement lent pour forcer l'adhérence par transfert de charge naturelle sur l'essieu avant Kessler No-Spin.</li>
                    </ul>
                  </div>
                </div>

                {/* ETAPE C : DOWNHILL RAMPS */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-black">3</span>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Roulage & Descente de Rampes Inclinées (12-15%)</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      L'inertie de la machine chargée de 28 tonnes dans une forte rampe descendante exige le respect absolu de la sécurité du freinage SAHR.
                    </p>
                    <ul className="text-[10px] font-bold text-slate-600 uppercase mt-3 space-y-1">
                      <li className="text-slate-800">• CONTRÔLE I : Engager le même rapport de vitesse qu'en montée. Ne jamais descendre au point mort (N).</li>
                      <li>• CONTRÔLE II : Utiliser le frein de service de manière modulée. Éviter les freinages brusques répétitifs qui provoqueraient la surchauffe de l'huile des freins humides multi-disques.</li>
                      <li>• CONTRÔLE III : Si l'alarme de pression pilote de frein de parking retentit, immobiliser immédiatement l'engin en orientant le godet contre la paroi rocheuse de la galerie.</li>
                    </ul>
                  </div>
                </div>

                {/* ETAPE D : SHUTDOWN PROCEDURE */}
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black">4</span>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Procédure d'Arrêt Thermique du Moteur Cummins</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      Arrêter brutalement un moteur diesel haute performance Cummins QSB6.7 après un roulage intensif engendre une cokéfaction immédiate de l'huile lubrifiante dans les paliers du turbocompresseur.
                    </p>
                    <ul className="text-[10px] font-bold text-slate-600 uppercase mt-3 space-y-1">
                      <li className="text-red-600">• RÈGLE MAJEURE : Laisser tourner au ralenti (Idle) pendant 3 à 5 minutes minimum.</li>
                      <li>• EXPLICATION TECHNIQUE : Permet à la température interne du turbocompresseur de chuter sous les 200°C via le débit continu du liquide de refroidissement et de lubrification.</li>
                      <li>• ACTIONS : Durant ce temps de refroidissement, inspecter visuellement le tableau de bord pour détecter toute alerte de code défaut (DTC) active.</li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* SECTION : DÉTECTION ET DIAGNOSTIC DES FUITES D'HUILE */}
          <section id="fuites-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Layers className="w-4.5 h-4.5" /> SECTION 10
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Détection & Diagnostic Mécanique des Fuites d'huile
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" /> MANUEL TECHNIQUE DE DÉPANNAGE POUR NOUVEAU MÉCANICIEN
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Cette section s'adresse directement aux mécaniciens d'atelier et de terrain. Elle expose les méthodes officielles pour isoler et diagnostiquer de manière rapide et sécurisée les fuites hydrauliques internes et externes sans outils de diagnostic électroniques complexes.
                </p>
              </div>

              {/* TABS FOR LEAK DIAGNOSTICS */}
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* LEAK DIAGNOSTIC NAVIGATION SELECTOR */}
                <div className="w-full md:w-1/3 flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedLeakTest("cyl-drift")}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border transition-all text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-between",
                      selectedLeakTest === "cyl-drift"
                        ? "bg-amber-50 border-amber-500 text-[#b8860b]"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span>1. Dérive Interne de Vérin (Bypass)</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                  <button
                    onClick={() => setSelectedLeakTest("sahr-leak")}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border transition-all text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-between",
                      selectedLeakTest === "sahr-leak"
                        ? "bg-amber-50 border-amber-500 text-[#b8860b]"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span>2. Étancheité Pilotage SAHR</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                  <button
                    onClick={() => setSelectedLeakTest("aeration")}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border transition-all text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-between",
                      selectedLeakTest === "aeration"
                        ? "bg-amber-50 border-amber-500 text-[#b8860b]"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span>3. Prise d'air Aspiration (Cavitation)</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                  <button
                    onClick={() => setSelectedLeakTest("external")}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl border transition-all text-xs font-black uppercase tracking-wider cursor-pointer flex items-center justify-between",
                      selectedLeakTest === "external"
                        ? "bg-amber-50 border-amber-500 text-[#b8860b]"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span>4. Inspection Raccords JIC & Brides</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>

                {/* LEAK DIAGNOSTIC CONTENT WORKFLOW */}
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  
                  {selectedLeakTest === "cyl-drift" && (
                    <div className="space-y-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-black uppercase">
                        <ShieldAlert className="w-3.5 h-3.5" /> MÉTHODE DE DIAGNOSTIC D'USURE DE JOINTS DE VÉRIN
                      </div>
                      <h4 className="text-sm font-black text-slate-800 uppercase">Test de dérive sous charge (Isoler une fuite de piston)</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Si le godet ou le bras de levage descend lentement tout seul sous charge, le problème peut provenir d'une fuite interne au piston du vérin (l'huile haute pression passe d'un côté du piston à l'autre en "bypassant" les joints d'étanchéité usés) ou d'un tiroir de distributeur fuyant.
                      </p>
                      
                      <div className="bg-white border border-slate-200 p-4 rounded-lg space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">PROTOCOLE DE TEST PHYSIQUE D'ATELIER :</span>
                        <ol className="text-[11px] text-slate-600 font-semibold leading-relaxed space-y-2 list-decimal pl-4">
                          <li><span className="text-slate-900 font-bold">Positionner :</span> Charger le godet au maximum (6,8 tonnes nominal) et lever le bras à mi-hauteur.</li>
                          <li><span className="text-slate-900 font-bold">Sécuriser :</span> Arrêter le moteur Cummins et bloquer physiquement le bras de levage avec la béquille de sécurité d'atelier homologuée.</li>
                          <li><span className="text-slate-900 font-bold">Déconnecter :</span> Desserrer très prudemment le flexible du côté de la tige du vérin (côté sans pression lorsque la béquille est en place). Placer un récipient propre sous le flexible déconnecté.</li>
                          <li><span className="text-slate-900 font-bold">Vérifier :</span> Retirer la béquille de sécurité et appliquer une pression hydraulique lente pour forcer le levage. Si de l'huile hydraulique s'écoule de manière continue du raccord déconnecté côté tige, <span className="text-red-600 font-bold uppercase">les joints de piston du vérin sont endommagés</span> et doivent être remplacés.</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {selectedLeakTest === "sahr-leak" && (
                    <div className="space-y-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-black uppercase">
                        <AlertTriangle className="w-3.5 h-3.5" /> DIAGNOSTIC SYSTÈME DE DESSERRAGE SAHR
                      </div>
                      <h4 className="text-sm font-black text-slate-800 uppercase">Mesure de retour de fuite de la valve SAHR</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Le système de frein de parking à commande négative hydraulique (SAHR) requiert le maintien d'une pression pilote supérieure à 120 bar. Si les freins s'appliquent en roulage ou si la pression chute, cela signale une défaillance d'étanchéité pilote.
                      </p>
                      
                      <div className="bg-white border border-slate-200 p-4 rounded-lg space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">ÉTAPES DE MESURE DE MICRO-DÉBIT :</span>
                        <ol className="text-[11px] text-slate-600 font-semibold leading-relaxed space-y-2 list-decimal pl-4">
                          <li>Connecter un manomètre sur la prise de pression de diagnostic M1 située sur l'alimentation de frein de parking de l'essieu Kessler.</li>
                          <li>Moteur en marche, desserrer le frein de stationnement de cabine (Pression nominale attendue : 145 bar).</li>
                          <li>Isoler la ligne de retour hydraulique venant directement des pistons SAHR et mesurer le volume d'huile renvoyé au réservoir de 144L. Un débit de retour supérieur à <span className="text-red-600 font-bold">1,5 Litre / minute</span> à température opérationnelle indique des joints de piston toriques internes de freins coupés ou usés.</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {selectedLeakTest === "aeration" && (
                    <div className="space-y-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-black uppercase">
                        <RefreshCw className="w-3.5 h-3.5" /> PHÉNOMÈNE DE CAVITATION & AERATION DE L'HUILE
                      </div>
                      <h4 className="text-sm font-black text-slate-800 uppercase">Localisation des micro-prises d'air d'aspiration</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Une prise d'air invisible au niveau de la crépine d'aspiration du réservoir hydraulique ou sur les durites d'alimentation de la pompe provoque un sifflement strident de la pompe hydraulique principale, un moussage de l'huile et une perte de 50% de la force d'arrachement du godet.
                      </p>
                      
                      <div className="bg-white border border-slate-200 p-4 rounded-lg space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">PROTOCOLE D'INSPECTION DE L'EXPERT :</span>
                        <ol className="text-[11px] text-slate-600 font-semibold leading-relaxed space-y-2 list-decimal pl-4">
                          <li><span className="text-slate-900 font-bold">Observer le voyant :</span> Inspecter le tube en pyrex de niveau de réservoir. Si l'huile a un aspect laiteux ou si de la mousse s'échappe par le reniflard d'aération, de l'air pénètre le circuit.</li>
                          <li><span className="text-slate-900 font-bold">Test du pinceau gras :</span> Badigeonner de la graisse mécanique NLGI 2 ou de l'huile épaisse sur tous les raccords, raccords d'aspiration et colliers de la ligne d'alimentation pompe. Si le sifflement de la pompe diminue temporairement, le raccord ainsi étanchéifié par la graisse est <span className="text-red-600 font-bold uppercase">le point précis d'entrée d'air</span>. Resserrer ou remplacer immédiatement les joints.</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {selectedLeakTest === "external" && (
                    <div className="space-y-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                        <CheckCircle className="w-3.5 h-3.5" /> ÉTANCHÉITÉ DES LIAISONS CHASSIS
                      </div>
                      <h4 className="text-sm font-black text-slate-800 uppercase">Contrôle des raccords JIC 37° et brides SAE Code 62</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Le circuit hydraulique du ST7 est soumis à d'intenses chocs de pression. Un mauvais serrage d'un raccord femelle tournant détruit définitivement la portée conique de raccordement.
                      </p>
                      
                      <div className="bg-white border border-slate-200 p-4 rounded-lg space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">GUIDE DE MAINTENANCE PREVENTIVE DES COUPLAGES :</span>
                        <ul className="text-[11px] text-slate-600 font-semibold leading-relaxed space-y-2 list-disc pl-4">
                          <li><span className="text-slate-900 font-bold">Serrage JIC :</span> Ne jamais forcer excessivement avec une rallonge de clé. Utiliser la méthode du serrage au couple d'origine ou "un tour de clé plat de 1/4" après contact franc.</li>
                          <li><span className="text-slate-900 font-bold">Brides SAE à 4 vis :</span> Nettoyer scrupuleusement la surface de contact de la bride Code 62. Installer systématiquement un joint torique de rechange neuf lubrifié à l'huile hydraulique propre avant serrage croisé équitable des vis à 120 Nm.</li>
                        </ul>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          </section>

          {/* SECTION : SYSTÈME ÉLECTRONIQUE RCS (RIG CONTROL SYSTEM) & RÉSEAU CAN */}
          <section id="elec-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Cpu className="w-4.5 h-4.5" /> SECTION 11
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Système Électronique RCS & Réseau CAN-Bus
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <Network className="w-4 h-4 text-amber-500" /> ARCHITECTURE D'AUTOMATISATION EPIROC RCS
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Le Scooptram ST7 utilise le <span className="font-bold text-slate-700">Rig Control System (RCS)</span> de génération avancée d'Epiroc. L'intégralité des commandes de pilotage, de sécurité d'avancement, et de contrôle d'état moteur transite par un bus de terrain CAN double canal à haute immunité électromagnétique.
                </p>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setSelectedRcsTab("can-bus")}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all",
                    selectedRcsTab === "can-bus"
                      ? "border-amber-500 text-amber-600 font-black"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  Architecture CAN (Interactif)
                </button>
                <button
                  onClick={() => setSelectedRcsTab("pinouts")}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all",
                    selectedRcsTab === "pinouts"
                      ? "border-amber-500 text-amber-600 font-black"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  Pinouts Connecteurs ECU
                </button>
                <button
                  onClick={() => setSelectedRcsTab("dtc-codes")}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all",
                    selectedRcsTab === "dtc-codes"
                      ? "border-amber-500 text-amber-600 font-black"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  Codes Défauts (DTC) & Résolutions
                </button>
              </div>

              {/* CAN-BUS INTERACTIVE SCHEMATIC */}
              {selectedRcsTab === "can-bus" && (
                <div className="space-y-4">
                  <div className="bg-slate-950 rounded-xl p-5 border border-slate-900 text-white space-y-4">
                    <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase block font-bold">
                      SCHEMA LOGIQUE DU RESEAU DE TERRAIN CAN (CLIQUEZ SUR UN MODULE POUR EN SAVOIR PLUS)
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center relative py-6">
                      {/* Module A: RCS Display */}
                      <div 
                        onClick={() => setSelectedPoint(null)} // Reset general state or trigger local tooltip
                        className="bg-slate-900 hover:bg-slate-850 cursor-pointer border border-slate-700 hover:border-amber-500 p-4 rounded-lg text-center transition-all shadow-md group"
                      >
                        <Cpu className="w-6 h-6 mx-auto mb-2 text-amber-400 group-hover:scale-110 transition-transform" />
                        <h4 className="text-[11px] font-black uppercase text-white">Écran Cabine RCS</h4>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">Console d'affichage & Diagnostics intégrés</p>
                        <div className="mt-2 text-[8px] font-mono text-emerald-500 font-bold bg-slate-950 py-0.5 rounded">CAN-ID: 0x10</div>
                      </div>

                      {/* Connector Line */}
                      <div className="hidden md:block h-1 bg-amber-500/50 relative">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-amber-400">250 kbps</span>
                      </div>

                      {/* Module B: Master Controller */}
                      <div className="bg-slate-900 hover:bg-slate-850 cursor-pointer border border-slate-700 hover:border-amber-500 p-4 rounded-lg text-center transition-all shadow-md group">
                        <Cpu className="w-6 h-6 mx-auto mb-2 text-sky-400 group-hover:scale-110 transition-transform" />
                        <h4 className="text-[11px] font-black uppercase text-white">RCS Master D201</h4>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">Cerveau logique central de la machine</p>
                        <div className="mt-2 text-[8px] font-mono text-emerald-500 font-bold bg-slate-950 py-0.5 rounded">Terminaison 120 Ω</div>
                      </div>

                      {/* Connector Line */}
                      <div className="hidden md:block h-1 bg-sky-500/50 relative">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-sky-400">J1939 Bus</span>
                      </div>

                      {/* Module C: Engine ECU */}
                      <div className="bg-slate-900 hover:bg-slate-850 cursor-pointer border border-slate-700 hover:border-amber-500 p-4 rounded-lg text-center transition-all shadow-md group">
                        <Settings className="w-6 h-6 mx-auto mb-2 text-red-500 group-hover:scale-110 transition-transform" />
                        <h4 className="text-[11px] font-black uppercase text-white">ECU Cummins</h4>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">Gestion moteur Cummins QSB6.7</p>
                        <div className="mt-2 text-[8px] font-mono text-emerald-500 font-bold bg-slate-950 py-0.5 rounded">CAN-ID: 0x00</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-900 text-[11px] text-slate-300 font-semibold leading-relaxed">
                      <div className="p-3 bg-slate-900/60 rounded-lg space-y-1.5">
                        <span className="text-xs font-black text-white uppercase block">1. Impédance du Réseau CAN (Test d'Or)</span>
                        <p>
                          Pour vérifier la santé du bus physique, couper le coupe-batterie général, brancher un multimètre en mode Ohmmètre entre les broches CAN-H et CAN-L. La valeur normale mesurée doit être de <span className="text-amber-400 font-bold font-mono">60 Ohms ±3</span>. Une valeur de 120 Ohms indique qu'une résistance d'extrémité de ligne est coupée ou manquante. Une valeur de 0 Ohm indique un court-circuit franc entre les lignes de communication.
                        </p>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-lg space-y-1.5">
                        <span className="text-xs font-black text-white uppercase block">2. Tensions de Référence CAN Actif</span>
                        <p>
                          Contact mis, moteur à l'arrêt, mesurer la tension par rapport à la masse châssis :
                        </p>
                        <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px] text-slate-400">
                          <li>CAN-High à la masse : <span className="text-white font-bold">~2.6V à 2.8V</span></li>
                          <li>CAN-Low à la masse : <span className="text-white font-bold">~2.2V à 2.4V</span></li>
                          <li>Tension différentielle (H - L) : <span className="text-white font-bold">~0.4V (Inactif) à ~1.5V à 2.0V (Transmission active)</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PINOUTS DATA TABLE */}
              {selectedRcsTab === "pinouts" && (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-black uppercase text-[10px] text-slate-600 tracking-wider">
                        <th className="p-3">Broche (Pin)</th>
                        <th className="p-3">Identification Fil</th>
                        <th className="p-3">Type de Signal</th>
                        <th className="p-3">Valeur Nominale</th>
                        <th className="p-3">Fonction & Capteur Connecté</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="p-3 font-bold text-slate-900 font-mono">A1</td>
                        <td className="p-3 text-slate-500 font-mono">RCS-30-RD-2.5</td>
                        <td className="p-3">Alimentation continue +Vbat</td>
                        <td className="p-3 text-slate-900 font-mono">24.0 V - 28.2 V</td>
                        <td className="p-3 uppercase">Alimentation principale directe batterie via Fusible F12 (10A)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 font-mono">A2</td>
                        <td className="p-3 text-slate-500 font-mono">RCS-15-OR-1.0</td>
                        <td className="p-3">Entrée Signal Contact (Ignition)</td>
                        <td className="p-3 text-slate-900 font-mono">24.0 V (Contact mis)</td>
                        <td className="p-3 uppercase">Réception d'autorisation de démarrage du boîtier clé principal (Relais K4)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 font-mono">B1</td>
                        <td className="p-3 text-slate-500 font-mono">CAN1-H-YL-0.75</td>
                        <td className="p-3">Ligne CAN High</td>
                        <td className="p-3 text-slate-900 font-mono">2.65 V (Oscillant)</td>
                        <td className="p-3 uppercase">Liaison de communication rapide avec l'ordinateur de contrôle moteur Cummins</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 font-mono">B2</td>
                        <td className="p-3 text-slate-500 font-mono">CAN1-L-GN-0.75</td>
                        <td className="p-3">Ligne CAN Low</td>
                        <td className="p-3 text-slate-900 font-mono">2.30 V (Oscillant)</td>
                        <td className="p-3 uppercase">Paire torsadée blindée anti-parasites de communication moteur</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 font-mono">C4</td>
                        <td className="p-3 text-slate-500 font-mono">RCS-ANA-PRESS-1</td>
                        <td className="p-3">Entrée Analogique (Boucle de courant)</td>
                        <td className="p-3 text-slate-900 font-mono">4.0 mA à 20.0 mA</td>
                        <td className="p-3 uppercase">Capteur de pression de direction Load Sensing (0-250 bar)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 font-mono">C5</td>
                        <td className="p-3 text-slate-500 font-mono">RCS-ANA-TEMP-1</td>
                        <td className="p-3">Entrée Analogique Résistive</td>
                        <td className="p-3 text-slate-900 font-mono">0.5 V à 4.5 V</td>
                        <td className="p-3 uppercase">Capteur thermique d'huile hydraulique principale (Sonde PT100)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 font-mono">D1</td>
                        <td className="p-3 text-slate-500 font-mono">RCS-PWM-SOL-LEV</td>
                        <td className="p-3">Sortie Proportionnelle PWM</td>
                        <td className="p-3 text-slate-900 font-mono">0.0 A à 1.65 A (Courant régulé)</td>
                        <td className="p-3 uppercase">Électrovanne proportionnelle Y202 de levage de bras (Commande débit progressif)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900 font-mono">D2</td>
                        <td className="p-3 text-slate-500 font-mono">RCS-DO-SOL-SAHR</td>
                        <td className="p-3">Sortie Digitale Tout-Ou-Rien (24V)</td>
                        <td className="p-3 text-slate-900 font-mono">0 V (Fermé) ou 24 V (Desserré)</td>
                        <td className="p-3 uppercase">Solénoïde Y203 de pilotage de desserrage hydraulique du frein SAHR</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* DTC CODES MATRIX */}
              {selectedRcsTab === "dtc-codes" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-black uppercase text-[10px] text-slate-600 tracking-wider">
                          <th className="p-3">Code RCS</th>
                          <th className="p-3">J1939 SPN / FMI</th>
                          <th className="p-3">Symptômes Observés</th>
                          <th className="p-3">Cause d'Atelier Probable</th>
                          <th className="p-3">Protocole d'Action Mécanicien</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-red-600 font-mono">E0124</td>
                          <td className="p-3 text-slate-500 font-mono">91 / 3</td>
                          <td className="p-3">Pédale d'accélérateur inactive. Le moteur Cummins reste figé au ralenti absolu.</td>
                          <td className="p-3">Tension d'alimentation du capteur de pédale trop élevée (court-circuit interne ou faisceau broché écrasé).</td>
                          <td className="p-3">Vérifier la tension de référence de 5V sur le connecteur de la pédale. Inspecter l'isolement du fil de signal par rapport au +24V. Remplacer la pédale double piste si nécessaire.</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-red-600 font-mono">E0248</td>
                          <td className="p-3 text-slate-500 font-mono">639 / 9</td>
                          <td className="p-3 text-red-600 uppercase font-black">Alerte générale réseau. Immobilisation immédiate de l'engin par coupure de boîte.</td>
                          <td className="p-3">Perte de trame (Timeout) sur le réseau principal CAN entre le calculateur cabine et le châssis articulé.</td>
                          <td className="p-3">Mesurer la résistance de bus (doit être de 60Ω). Inspecter l'état physique du faisceau souple de l'articulation centrale qui subit les torsions de direction. Resserrer la prise multibroches d'interface.</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-amber-600 font-mono">E0312</td>
                          <td className="p-3 text-slate-500 font-mono">110 / 16</td>
                          <td className="p-3">Lumière d'alarme active. Réduction automatique forcée de 30% du couple moteur (Derate).</td>
                          <td className="p-3">Température du liquide de refroidissement moteur supérieure au seuil limite de 102°C en charge continue.</td>
                          <td className="p-3">S'assurer que les grilles du radiateur ne sont pas obturées par des poussières de forage durcies. Vérifier le fonctionnement du circuit Fan Drive (ventilateur hydraulique à pas variable).</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-red-600 font-mono">E0451</td>
                          <td className="p-3 text-slate-500 font-mono">520204 / 4</td>
                          <td className="p-3 text-red-600 font-black">Le frein SAHR s'applique brutalement en roulage, empêchant tout avancement.</td>
                          <td className="p-3">Court-circuit à la masse sur la bobine de commande de l'électrovanne Y203 de desserrage de frein de parking.</td>
                          <td className="p-3">Mesurer la résistance ohmique de la bobine de l'électrovanne Y203. Si inférieure à 28 Ohms, remplacer la bobine. Nettoyer les contacts du relais intermédiaire K8.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* SECTION : GUIDE DE RÉFECTION & REMPLACEMENT DE JOINTS DE VÉRIN HYDRAULIQUE */}
          <section id="reparation-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Wrench className="w-4.5 h-4.5" /> SECTION 12
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Guide de Réfection & Remplacement de Joints de Vérin
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-500" /> RECONDITIONNEMENT D'ORIGINE EPIROC (VÉRIN DE LEVAGE & BENNE)
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Cette procédure d'expert détaille les exigences d'atelier pour démonter de manière propre et sécurisée les grands vérins double effet du Scooptram ST7, remplacer la cartouche d'étanchéité et évaluer les critères d'usure de la tige.
                </p>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setSelectedOverhaulTab("etapes")}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all",
                    selectedOverhaulTab === "etapes"
                      ? "border-amber-500 text-amber-600 font-black"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  Procédure Pas-à-Pas
                </button>
                <button
                  onClick={() => setSelectedOverhaulTab("anatomie-svg")}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all",
                    selectedOverhaulTab === "anatomie-svg"
                      ? "border-amber-500 text-amber-600 font-black"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  Anatomie de la Tête (SVG)
                </button>
                <button
                  onClick={() => setSelectedOverhaulTab("specs-reconstruction")}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all",
                    selectedOverhaulTab === "specs-reconstruction"
                      ? "border-amber-500 text-amber-600 font-black"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  Spécifications de Tolérance
                </button>
              </div>

              {/* OVERHAUL TAB: ETAPES */}
              {selectedOverhaulTab === "etapes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-black font-mono">01</span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Dépose & Préparation Hydraulique</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        Déployer l'engin sur une zone plane et sécurisée en atelier. Installer les béquilles de sécurité mécaniques sur les bras de levage. Vidanger l'huile résiduelle des deux chambres du vérin sous pression contrôlée. Déconnecter les flexibles hydrauliques et installer immédiatement des bouchons filetés métalliques pour empêcher toute pénétration de particules de poussière minérale abrasive.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-black font-mono">02</span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Désassemblage & Chauffage de la Tête</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        Installer le vérin sur un berceau de montage robuste d'atelier. Utiliser une clé à ergot lourde pour dévisser le nez (Gland) fileté. Si le nez résiste à l'effort de desserrage, appliquer une chauffe homogène contrôlée par thermo-contacteur à une température maximale de <span className="text-red-600 font-bold">150°C</span> pour attendrir le frein-filet Loctite fort d'origine sans altérer la trempe d'acier de la tête ni carboniser les joints d'étanchéité internes.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-black font-mono">03</span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Extraction de la Tige & Contrôles Géométriques</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        Extraire l'équipage mobile (Piston et Tige) de manière parfaitement rectiligne pour éliminer tout risque de collision interne avec le filetage d'alésage de chemise. Positionner la tige sur des blocs en V doublés de caoutchouc. Mesurer l'ovalisation de la chemise (micromètre interne) et la rectitude de la tige à l'aide d'un comparateur à cadran (limite de déformation de la flèche de tige : <span className="text-red-600 font-bold">0.2 mm par mètre</span>).
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-black font-mono">04</span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Nettoyage Clinique des Gorges de Joints</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        Déposer l'ensemble des joints usés (Râcleur, U-Cup, Joints toriques statiques et bagues d'usure en PTFE). <span className="text-red-600 font-bold">Interdiction formelle d'utiliser des outils de grattage pointus en acier</span> (comme les tournevis) qui rayent définitivement les fonds de gorge en aluminium ou bronze. Employer exclusivement des crochets et outils en laiton ou plastique d'atelier. Nettoyer scrupuleusement au nettoyant diélectrique exempt de résidu.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-black font-mono">05</span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Installation du Kit de Joints Neufs d'Origine</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        Lubrifier généreusement les nouveaux éléments d'étanchéité à l'huile hydraulique neuve (ISO VG 46). Installer les bagues de guidage en PTFE chargé bronze, puis le joint de tige principal de type U-Cup en polyuréthane élastomère (lèvres orientées vers la pression interne). Installer la bague anti-extrusion d'appui et le joint râcleur double lèvre de protection extérieure.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-black font-mono">06</span>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Serrage Dynamique & Épreuve Hydraulique</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        Insérer la tige révisée dans la chemise. Appliquer du produit de blocage anaérobie Loctite 243 sur les filets de la tête. Serrer la tête filetée au couple nominal de <span className="text-slate-900 font-bold">480 Nm</span> à l'aide d'une clé dynamométrique étalonnée. Raccorder le vérin assemblé sur le banc de test d'atelier. Effectuer une mise en épreuve statique à <span className="text-emerald-700 font-bold">250 bar</span> dans chaque chambre pendant 10 minutes pour certifier l'absence absolue de micro-fuite interne de piston.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* OVERHAUL TAB: ANATOMIE SVG */}
              {selectedOverhaulTab === "anatomie-svg" && (
                <div className="space-y-4">
                  <div className="bg-slate-950 rounded-xl p-5 border border-slate-900 text-white grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    
                    {/* SVG Diagram Area */}
                    <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-center min-h-[220px]">
                      <svg viewBox="0 0 400 220" className="w-full h-auto text-white select-none">
                        {/* Cylinder Barrel Body */}
                        <rect x="20" y="30" width="100" height="160" rx="4" fill="#334155" stroke="#475569" strokeWidth="2" />
                        <text x="70" y="115" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">CHEMISE D'ALÉSAGE</text>
                        
                        {/* Rod Shaft */}
                        <rect x="120" y="80" width="260" height="60" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
                        <text x="250" y="115" fill="#1e293b" fontSize="8" fontWeight="bold" textAnchor="middle">TIGE EN ACIER CHROME (Ø70 mm)</text>

                        {/* Gland Head Guide */}
                        <rect x="120" y="45" width="80" height="35" rx="2" fill="#475569" stroke="#64748b" />
                        <rect x="120" y="140" width="80" height="35" rx="2" fill="#475569" stroke="#64748b" />
                        <text x="160" y="65" fill="#e2e8f0" fontSize="7" fontWeight="bold" textAnchor="middle">NÉZ FILETÉ (GLAND)</text>

                        {/* Wiper seal - Outer protective edge */}
                        <rect x="190" y="80" width="6" height="6" fill="#ef4444" />
                        <rect x="190" y="134" width="6" height="6" fill="#ef4444" />
                        <text x="193" y="72" fill="#ef4444" fontSize="6" fontWeight="black" textAnchor="middle">RÂCLEUR</text>

                        {/* Rod U-Cup Seal */}
                        <rect x="170" y="80" width="8" height="6" fill="#f59e0b" />
                        <rect x="170" y="134" width="8" height="6" fill="#f59e0b" />
                        <text x="174" y="72" fill="#fbbf24" fontSize="6" fontWeight="black" textAnchor="middle">U-CUP</text>

                        {/* Wear Rings / Guide */}
                        <rect x="140" y="80" width="12" height="6" fill="#10b981" />
                        <rect x="140" y="134" width="12" height="6" fill="#10b981" />
                        <text x="146" y="72" fill="#34d399" fontSize="6" fontWeight="black" textAnchor="middle">BAGUES GUIDAGE</text>

                        {/* O-Ring & Backup ring outer */}
                        <circle cx="160" cy="45" r="4" fill="#3b82f6" />
                        <circle cx="160" cy="175" r="4" fill="#3b82f6" />
                        <text x="160" y="38" fill="#60a5fa" fontSize="6" fontWeight="black" textAnchor="middle">JOINT STATIQUE</text>
                      </svg>
                    </div>

                    <div className="lg:col-span-6 space-y-3.5">
                      <div className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Info className="w-4 h-4" /> COMPOSANTS ESSENTIELS D'ÉTANCHÉITÉ
                      </div>
                      <div className="space-y-3 text-[11px] text-slate-300 font-semibold leading-relaxed">
                        <div className="p-2.5 bg-slate-900 border-l-2 border-red-500 rounded-lg">
                          <span className="text-white font-black block text-[10px] uppercase">1. Joint Râcleur d'impuretés extérieur (Scraper)</span>
                          <p className="text-slate-400 mt-0.5">Empêche les poussières abrasives, boues et silice de galerie d'adhérer à la tige et de rayer les composants lors du rappel hydraulique.</p>
                        </div>
                        <div className="p-2.5 bg-slate-900 border-l-2 border-amber-500 rounded-lg">
                          <span className="text-white font-black block text-[10px] uppercase">2. Joint de Tige principal (U-Cup Seal)</span>
                          <p className="text-slate-400 mt-0.5">Garantit l'étanchéité dynamique de rétention d'huile haute pression. Sa lèvre interne s'écarte sous l'effet de l'huile pour épouser la tige.</p>
                        </div>
                        <div className="p-2.5 bg-slate-900 border-l-2 border-emerald-500 rounded-lg">
                          <span className="text-white font-black block text-[10px] uppercase">3. Bagues de Guidage composite (PTFE Bronze)</span>
                          <p className="text-slate-400 mt-0.5">Supportent la charge physique transversale appliquée sur la tige, empêchant tout contact métal-contre-métal désastreux.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* OVERHAUL TAB: SPECS */}
              {selectedOverhaulTab === "specs-reconstruction" && (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-black uppercase text-[10px] text-slate-600 tracking-wider">
                        <th className="p-3">Paramètre d'Origine</th>
                        <th className="p-3">Cote Nominale Constructeur</th>
                        <th className="p-3">Limite Maximale d'Usure Tolérée</th>
                        <th className="p-3">Conséquences en cas de dépassement de limite</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="p-3 font-bold text-slate-900">Alésage de chemise de vérin de levage</td>
                        <td className="p-3 font-mono">125.00 mm</td>
                        <td className="p-3 font-mono text-red-600 font-bold">+ 0.15 mm (Ovalisation)</td>
                        <td className="p-3 uppercase">Bypass d'huile interne constant entre les deux chambres, perte de maintien du bras chargé.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900">Diamètre extérieur de la tige</td>
                        <td className="p-3 font-mono">70.00 mm</td>
                        <td className="p-3 font-mono text-red-600 font-bold">- 0.08 mm</td>
                        <td className="p-3 uppercase">Suintements extérieurs permanents au niveau du joint de nez.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900">Couple de serrage de la bague de nez (Gland)</td>
                        <td className="p-3 font-mono">480 Nm</td>
                        <td className="p-3 text-slate-500">Pas de dérive permise</td>
                        <td className="p-3 uppercase font-bold text-red-500">Dévissage accidentel en cours de travail, arrachement de l'équipage mobile.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900">Couple de serrage de l'écrou de piston interne</td>
                        <td className="p-3 font-mono">1 250 Nm</td>
                        <td className="p-3 text-slate-500">Pas de dérive permise</td>
                        <td className="p-3 uppercase">Desserrement du piston créant un jeu axial, destruction immédiate de l'alésage de chemise.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-slate-900">Flèche longitudinale maximale de tige</td>
                        <td className="p-3 font-mono text-emerald-700 font-bold">&lt; 0.05 mm / m</td>
                        <td className="p-3 font-mono text-red-600 font-bold">0.20 mm / m</td>
                        <td className="p-3 uppercase">Frottements excentrés extrêmes sur un côté, extrusion rapide des joints et grippage.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </section>

          {/* SECTION : SIMULATEUR DE DIAGNOSTIC INTERACTIF D'ATELIER */}
          <section id="simulateur-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <HelpCircle className="w-4.5 h-4.5" /> SECTION 13
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Simulateur Interactif de Diagnostic & Dépannage
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-500" /> ACADÉMIE DE FORMATION PHYSIQUE DES NOUVEAUX MÉCANICIENS
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Ce simulateur immersif vous met en situation réelle face à des pannes récurrentes du Scooptram ST7. Suivez un protocole logique de mécanicien expert : observez, mesurez, isolez le composant coupable et appliquez la réparation technique homologuée.
                </p>
              </div>

              {/* SIMULATOR SCREEN CONTAINER */}
              <div className="bg-slate-950 rounded-2xl border-4 border-slate-900 text-white overflow-hidden shadow-xl">
                
                {/* Simulator Header / Cockpit Indicator */}
                <div className="bg-slate-900 border-b border-slate-800 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-black text-slate-400 tracking-widest uppercase">
                      HYDROMINES — COCKPIT DE FORMATION DIAGNOSTIC
                    </span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-slate-950 font-mono text-[9px] text-amber-400 font-bold">
                    GRADE : {simActiveSymptom ? "DÉPANNAGE EN COURS..." : "MÉCANICIEN APPRENTI"}
                  </div>
                </div>

                {/* SIMULATOR CORE SCREEN */}
                {!simActiveSymptom ? (
                  // Symptom Selector Stage
                  <div className="p-8 text-center space-y-6">
                    <div className="space-y-2 max-w-md mx-auto">
                      <HelpCircle className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
                      <h4 className="text-sm font-black uppercase text-white">SÉLECTIONNEZ UNE PANNE COMPLEXE À RÉSOUDRE :</h4>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        Chaque scénario est issu de vrais rapports de panne rédigés par nos ingénieurs en maintenance minière de fond d'Hydromines.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
                      <button
                        onClick={() => {
                          setSimActiveSymptom("symptom-avancement");
                          setSimCurrentStep(1);
                          setSimHistory(["Symptôme : Perte totale d'avancement signalée par l'opérateur en galerie de mine."]);
                          setSimAnswers({});
                        }}
                        className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500 p-5 rounded-xl transition-all cursor-pointer text-left space-y-2.5 group"
                      >
                        <Zap className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                        <h5 className="text-[11px] font-black uppercase text-white leading-snug">
                          1. Panne d'Avancement (Boîte Funk)
                        </h5>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          La machine refuse d'avancer en marche avant comme arrière, aucune alerte de pression au tableau de bord.
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          setSimActiveSymptom("symptom-levage");
                          setSimCurrentStep(1);
                          setSimHistory(["Symptôme : Mouvements d'équipements très lents avec bruit strident de cavitation de pompe."]);
                          setSimAnswers({});
                        }}
                        className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500 p-5 rounded-xl transition-all cursor-pointer text-left space-y-2.5 group"
                      >
                        <Wrench className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                        <h5 className="text-[11px] font-black uppercase text-white leading-snug">
                          2. Lenteur Hydraulique de Levage
                        </h5>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          Le godet et le bras lèvent très lentement. Un sifflement métallique strident se produit à l'accélération.
                        </p>
                      </button>

                      <button
                        onClick={() => {
                          setSimActiveSymptom("symptom-frein");
                          setSimCurrentStep(1);
                          setSimHistory(["Symptôme : Surchauffe extrême et odeur de brulé sur l'essieu Kessler avant."]);
                          setSimAnswers({});
                        }}
                        className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500 p-5 rounded-xl transition-all cursor-pointer text-left space-y-2.5 group"
                      >
                        <ShieldAlert className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <h5 className="text-[11px] font-black uppercase text-white leading-snug">
                          3. Blocage de Frein SAHR Essieu
                        </h5>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                          Le Scooptram vibre en roulant et l'essieu avant Kessler monte à plus de 115°C au pistolet thermique.
                        </p>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Active Interactive Diagnostics Stage
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* Left Column: Interactive Choices & Action steps */}
                    <div className="lg:col-span-7 p-6 border-r border-slate-900 space-y-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono text-[9px] font-bold">
                            ÉTAPE {simCurrentStep} / 4
                          </span>
                          <h4 className="text-xs font-black uppercase text-slate-300">Procédure Interactive Actuelle</h4>
                        </div>

                        {/* SCENARIO 1: PANNE D'AVANCEMENT */}
                        {simActiveSymptom === "symptom-avancement" && (
                          <div className="space-y-4">
                            {simCurrentStep === 1 && (
                              <div className="space-y-3">
                                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                                  Le moteur Cummins tourne parfaitement à 1500 tr/min. Lorsque vous passez la 1ère vitesse, aucun mouvement n'est généré. Quelle est votre première mesure physique ?
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 1 : Branchement du manomètre de 50 bar sur la prise de diagnostic de pression de boîte (M2). Lecture : 5 bar (au lieu de 16-19 bar attendus)."]);
                                      setSimAnswers(p => ({ ...p, step1: "pression-basse" }));
                                      setSimCurrentStep(2);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-amber-500 transition-all text-amber-400 uppercase"
                                  >
                                    A. Brancher un manomètre sur la prise de diagnostic M2 (Pression d'embrayage boîte)
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 1 : Démontage complet de la transmission Powershift Funk RT200 sur champ."]);
                                      setSimAnswers(p => ({ ...p, step1: "demontage-inutile" }));
                                      setSimCurrentStep(2);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-red-500 transition-all text-red-400 uppercase"
                                  >
                                    B. Commander la dépose immédiate de la transmission Powershift pour réfection complète
                                  </button>
                                </div>
                              </div>
                            )}

                            {simCurrentStep === 2 && (
                              <div className="space-y-3">
                                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                                  {simAnswers.step1 === "pression-basse" 
                                    ? "La pression d'embrayage s'effondre à 5 bar. Cela indique que les disques de vitesses ne reçoivent pas la pression pilote requise pour s'enclencher. Que vérifiez-vous ?"
                                    : "La dépose complète prendrait 12 heures et immobiliserait l'engin sans diagnostic préalable ! Revenons à la logique : vous mesurez la pression d'embrayage et constatez 5 bar seulement (seuil critique : 16 bar). Quelle action rationnelle menez-vous ?"}
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 2 : Test ohmique de la bobine de l'électrovanne proportionnelle de modulation Y202. Lecture : 32 Ohms (conforme constructeur)."]);
                                      setSimAnswers(p => ({ ...p, step2: "solenoid-ok" }));
                                      setSimCurrentStep(3);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-amber-500 transition-all text-amber-400 uppercase"
                                  >
                                    A. Mesurer la résistance de la bobine de commande de modulation (Y202) avec votre multimètre
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 2 : Dépose et démontage du tiroir mécanique de modulation de pression de boîte. Constat : Découverte d'un éclat métallique dur bloquant le tiroir en position de fuite continue."]);
                                      setSimAnswers(p => ({ ...p, step2: "tiroir-bloque" }));
                                      setSimCurrentStep(3);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-emerald-500 transition-all text-emerald-400 uppercase"
                                  >
                                    B. Extraire le tiroir de modulation de la valve de commande de la boîte Funk
                                  </button>
                                </div>
                              </div>
                            )}

                            {simCurrentStep === 3 && (
                              <div className="space-y-3">
                                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                                  {simAnswers.step2 === "solenoid-ok"
                                    ? "La bobine électrique est en parfait état (32 Ω). La panne est donc d'origine purement mécanique. Vous démontez alors le tiroir de modulation de pression de la boîte Funk et découvrez un micro-éclat d'acier bloquant le coulissement du piston !"
                                    : "Excellent choix chirurgical ! Le démontage du tiroir de la valve confirme la présence d'un copeau de limaille bloquant le canal. D'où vient cette pollution métallique ?"}
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 3 : Inspection de la crépine d'aspiration magnétique de transmission. Découverte de limaille d'acier confirmant le début de dégradation des disques ou engrenages."]);
                                      setSimAnswers(p => ({ ...p, step3: "pollution-boite" }));
                                      setSimCurrentStep(4);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-amber-500 transition-all text-amber-400 uppercase"
                                  >
                                    A. Déposer et inspecter la crépine d'aspiration magnétique de boîte
                                  </button>
                                </div>
                              </div>
                            )}

                            {simCurrentStep === 4 && (
                              <div className="space-y-3 bg-emerald-950/40 p-4 border border-emerald-500/20 rounded-lg">
                                <h5 className="text-[11px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
                                  <CheckCircle className="w-4 h-4" /> VERDICT & ACTION DE RÉPARATION FINALE :
                                </h5>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                                  La panne venait d'une <span className="text-white font-bold">pollution métallique accidentelle</span> bloquant le tiroir de régulation de pression de la boîte de vitesses à mi-course, provoquant une chute de pression de modulation de l'embrayage Powershift à 5 bar au lieu de 16 bar.
                                </p>
                                <p className="text-[11px] text-slate-400 font-bold uppercase">
                                  L'ENGIN EST DÉPANNE AVEC SUCCÈS PAR : Nettoyage complet du bloc de commande, remplacement de l'huile hydraulique Funk ATF, et réinstallation d'une cartouche de filtre de boîte neuve d'origine Epiroc.
                                </p>
                                <button
                                  onClick={() => setSimActiveSymptom(null)}
                                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] py-2 rounded-lg cursor-pointer transition-all"
                                >
                                  Terminer l'épreuve & Obtenir le Badge
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* SCENARIO 2: LENTEUR HYDRAULIQUE */}
                        {simActiveSymptom === "symptom-levage" && (
                          <div className="space-y-4">
                            {simCurrentStep === 1 && (
                              <div className="space-y-3">
                                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                                  Les mouvements du bras et du godet sont extrêmement lents à chaud comme à froid. Un bruit métallique de cavitation s'amplifie quand vous accélérez. Quelle première mesure effectuez-vous ?
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 1 : Contrôle visuel du réservoir principal de 144 Litres. Constat : Niveau correct mais présence de micro-bulles d'air moussantes."]);
                                      setSimAnswers(p => ({ ...p, step1: "moussage-detecte" }));
                                      setSimCurrentStep(2);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-amber-500 transition-all text-amber-400 uppercase"
                                  >
                                    A. Inspecter visuellement le tube pyrex de niveau de réservoir hydraulique et l'aspect de l'huile
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 1 : Remplacement direct de la pompe à pistons axiaux de 220 bar par une neuve."]);
                                      setSimAnswers(p => ({ ...p, step1: "pompe-neuve-inutile" }));
                                      setSimCurrentStep(2);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-red-500 transition-all text-red-400 uppercase"
                                  >
                                    B. Commander le remplacement immédiat de la pompe hydraulique principale à pistons
                                  </button>
                                </div>
                              </div>
                            )}

                            {simCurrentStep === 2 && (
                              <div className="space-y-3">
                                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                                  {simAnswers.step1 === "moussage-detecte"
                                    ? "L'huile hydraulique est laiteuse et moussante, ce qui confirme l'aspiration massive d'air en amont de la pompe. Quelle méthode employez-vous pour isoler la prise d'air ?"
                                    : "Remplacer la pompe principale coûte cher et ne résoudra pas le problème si la cause est une prise d'air à l'aspiration ! Vous observez le réservoir et notez une émulsion de bulles laiteuses d'air. Comment localiser l'entrée d'air ?"}
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 2 : Application du test d'expert du 'pinceau gras'. Badigeonnage de graisse épaisse sur les colliers de serrage du raccord d'aspiration pompe. Constat : Le sifflement diminue d'un coup !"]);
                                      setSimAnswers(p => ({ ...p, step2: "prise-air-localisee" }));
                                      setSimCurrentStep(3);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-emerald-500 transition-all text-emerald-400 uppercase"
                                  >
                                    A. Réaliser le 'test du pinceau gras' sur les colliers de la durite d'aspiration
                                  </button>
                                </div>
                              </div>
                            )}

                            {simCurrentStep === 3 && (
                              <div className="space-y-3">
                                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                                  Le sifflement de la pompe s'est atténué lorsque vous avez appliqué la graisse sur le collier de serrage de la ligne d'aspiration. Cela prouve que le joint de ce collier d'aspiration était défectueux et laissait entrer de l'air ambiant par dépression. Que faites-vous maintenant pour valider la réparation ?
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 3 : Remplacement du collier à crémaillère d'origine par un collier de serrage robuste en acier double vis avec joint torique neuf. Serrage rigoureux."]);
                                      setSimAnswers(p => ({ ...p, step3: "collier-serré" }));
                                      setSimCurrentStep(4);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-amber-500 transition-all text-amber-400 uppercase"
                                  >
                                    A. Remplacer le collier et son joint torique d'aspiration par des pièces neuves d'origine Epiroc
                                  </button>
                                </div>
                              </div>
                            )}

                            {simCurrentStep === 4 && (
                              <div className="space-y-3 bg-emerald-950/40 p-4 border border-emerald-500/20 rounded-lg">
                                <h5 className="text-[11px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
                                  <CheckCircle className="w-4 h-4" /> VERDICT & ACTION DE RÉPARATION FINALE :
                                </h5>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                                  La panne était due à une <span className="text-white font-bold">prise d'air microscopique d'aspiration</span> sur le raccord basse pression de la pompe principale, engendrant une cavitation sévère et destructive de la pompe ainsi qu'un moussage d'air de l'huile hydraulique.
                                </p>
                                <p className="text-[11px] text-slate-400 font-bold uppercase">
                                  L'ENGIN EST DÉPANNE AVEC SUCCÈS PAR : Remplacement du collier d'aspiration, vidange et purge complète de l'air du circuit par des cycles de levage et direction lents sans charge, et appoint d'huile hydraulique propre ISO VG 46.
                                </p>
                                <button
                                  onClick={() => setSimActiveSymptom(null)}
                                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] py-2 rounded-lg cursor-pointer transition-all"
                                >
                                  Terminer l'épreuve & Obtenir le Badge
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* SCENARIO 3: BLOCAGE DE FREIN */}
                        {simActiveSymptom === "symptom-frein" && (
                          <div className="space-y-4">
                            {simCurrentStep === 1 && (
                              <div className="space-y-3">
                                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                                  L'essieu avant Kessler surchauffe fortement (115°C), de légères fumées bleues d'huile brûlée se dégagent des moyeux de roues. Les freins multi-disques SAHR semblent frotter de manière continue. Quelle mesure effectuez-vous ?
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 1 : Branchement d'un manomètre de 250 bar sur la prise de diagnostic M1 de l'essieu avant. Lecture de la pression pilote de desserrage de frein : 95 bar (normale attendue : 145 bar)."]);
                                      setSimAnswers(p => ({ ...p, step1: "pression-pilote-basse" }));
                                      setSimCurrentStep(2);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-amber-500 transition-all text-amber-400 uppercase"
                                  >
                                    A. Mesurer la pression de desserrage sur la prise M1 de l'essieu Kessler
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 1 : Remplacement direct des disques de freins humides de l'essieu."]);
                                      setSimAnswers(p => ({ ...p, step1: "disques-remplaces-inutile" }));
                                      setSimCurrentStep(2);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-red-500 transition-all text-red-400 uppercase"
                                  >
                                    B. Déposer les moyeux de roues pour extraire et remplacer les disques d'essieux
                                  </button>
                                </div>
                              </div>
                            )}

                            {simCurrentStep === 2 && (
                              <div className="space-y-3">
                                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                                  La pression d'alimentation de desserrage est anormalement basse (95 bar au lieu de 145 bar). Les ressorts internes SAHR ne sont pas totalement comprimés et provoquent un frottement permanent des disques en roulant. Que faites-vous pour localiser la fuite pilote ?
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 2 : Isolement et déconnexion de la ligne de retour hydraulique venant des pistons de freins de l'essieu. Constat : Écoulement continu massif de 2.2 Litres/minute au retour vers le réservoir."]);
                                      setSimAnswers(p => ({ ...p, step2: "fuite-piston-sahr" }));
                                      setSimCurrentStep(3);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-emerald-500 transition-all text-emerald-400 uppercase"
                                  >
                                    A. Isoler la ligne de retour de vidange des pistons de frein de l'essieu
                                  </button>
                                </div>
                              </div>
                            )}

                            {simCurrentStep === 3 && (
                              <div className="space-y-3">
                                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                                  Le débit de retour anormal de 2.2 L/min (limite max constructeur : 1.5 L/min) valide de manière irréfutable que de l'huile de pilotage haute pression traverse les joints internes de pistons de frein SAHR et s'échappe directement au retour réservoir. Que faites-vous ?
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                  <button
                                    onClick={() => {
                                      setSimHistory(p => [...p, "Étape 3 : Démontage partiel de la chambre de freinage de l'essieu Kessler. Remplacement des joints toriques internes de piston de frein coupés et remontage scrupuleux."]);
                                      setSimAnswers(p => ({ ...p, step3: "joints-freins-remplaces" }));
                                      setSimCurrentStep(4);
                                    }}
                                    className="bg-slate-900 hover:bg-slate-850 p-3 rounded-lg text-left text-[11px] font-black cursor-pointer border border-slate-800 hover:border-amber-500 transition-all text-amber-400 uppercase"
                                  >
                                    A. Déposer les chambres de freinage Kessler et remplacer les joints toriques de pistons SAHR
                                  </button>
                                </div>
                              </div>
                            )}

                            {simCurrentStep === 4 && (
                              <div className="space-y-3 bg-emerald-950/40 p-4 border border-emerald-500/20 rounded-lg">
                                <h5 className="text-[11px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
                                  <CheckCircle className="w-4 h-4" /> VERDICT & ACTION DE RÉPARATION FINALE :
                                </h5>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                                  La surchauffe de l'essieu était provoquée par un <span className="text-white font-bold">défaut d'étanchéité interne du piston de frein SAHR</span> (joints toriques coupés), créant une chute de pression pilote de desserrage à 95 bar et un frottement mécanique permanent et abrasif des disques multi-plaquettes en roulant.
                                </p>
                                <p className="text-[11px] text-slate-400 font-bold uppercase">
                                  L'ENGIN EST DÉPANNE AVEC SUCCÈS PAR : Remplacement des joints toriques de piston de frein de l'essieu avant Kessler, purge d'air des freins à l'aide de la vis de purge dédiée, et contrôle de la pression de desserrage de 145 bar rétablie de manière stable.
                                </p>
                                <button
                                  onClick={() => setSimActiveSymptom(null)}
                                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[10px] py-2 rounded-lg cursor-pointer transition-all"
                                >
                                  Terminer l'épreuve & Obtenir le Badge
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Reset/Back Button inside Cockpit */}
                      <button
                        onClick={() => {
                          setSimActiveSymptom(null);
                        }}
                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all text-left flex items-center gap-1.5 mt-4 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Revenir à l'accueil du simulateur
                      </button>
                    </div>

                    {/* Right Column: Diagnostic Logs Console */}
                    <div className="lg:col-span-5 bg-slate-900 p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Binary className="w-4 h-4 text-amber-500" />
                          <span className="text-[10px] font-mono font-black tracking-wider uppercase">
                            DIAGNOSTICS & JOURNAL TECHNIQUE
                          </span>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-[10px] space-y-2.5 h-[190px] overflow-y-auto">
                          {simHistory.map((log, lIdx) => (
                            <div key={lIdx} className="text-emerald-400 leading-normal">
                              <span className="text-slate-500 mr-1">&gt;</span> {log}
                            </div>
                          ))}
                          <div className="animate-pulse text-slate-500">&gt; en attente d'action...</div>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 p-3 rounded border border-slate-850 mt-4 space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block font-mono">CONSEIL DE L'EXPERT :</span>
                        <span className="text-[10px] text-slate-300 leading-normal font-semibold font-mono block">
                          "Un bon mécanicien ne commence jamais à démonter un organe sans avoir mesuré la pression d'huile ou la résistance électrique en premier !"
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </section>

          {/* SECTION : ANALYSES DE FLUIDES, CONTAMINATION ISO & ARTICULATION CENTRALE */}
          <section id="analyse-st7" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                <Activity className="w-4.5 h-4.5" /> SECTION 14
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                Analyses Cliniques des Fluides, Contamination & Articulation
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-amber-500" /> PROTOCOLE DE DIAGNOSTIC AVANCÉ ET DE PRÉVENTION D'ATELIER
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Pour maintenir le <span className="font-bold text-slate-700">Scooptram ST7</span> à son taux de disponibilité maximal en mine profonde, l'analyse préventive des lubrifiants et la surveillance géométrique du pivot central sont incontournables. Ce module interactif détaille les seuils d'alerte cliniques et les tolérances d'articulation.
                </p>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex flex-wrap border-b border-slate-200 gap-1">
                <button
                  onClick={() => setSelectedFluidsDiagTab("iso4406")}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all",
                    selectedFluidsDiagTab === "iso4406"
                      ? "border-amber-500 text-amber-600 font-black"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  Contamination ISO 4406
                </button>
                <button
                  onClick={() => setSelectedFluidsDiagTab("oil-spectro")}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all",
                    selectedFluidsDiagTab === "oil-spectro"
                      ? "border-amber-500 text-amber-600 font-black"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  Spectrométrie d'Usure
                </button>
                <button
                  onClick={() => setSelectedFluidsDiagTab("articulation")}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all",
                    selectedFluidsDiagTab === "articulation"
                      ? "border-amber-500 text-amber-600 font-black"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  Articulation & Pivot
                </button>
                <button
                  onClick={() => setSelectedFluidsDiagTab("ansul-fire")}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all",
                    selectedFluidsDiagTab === "ansul-fire"
                      ? "border-amber-500 text-amber-600 font-black"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  Système Incendie ANSUL
                </button>
              </div>

              {/* TAB CONTENT: ISO 4406 */}
              {selectedFluidsDiagTab === "iso4406" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Interactive table */}
                    <div className="lg:col-span-7 space-y-4">
                      <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase block font-bold">
                        CODES DE PROPRETÉ REQUIS PAR LES COMPOSANTS EPIROC
                      </span>
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 font-black uppercase text-[10px] text-slate-600 tracking-wider">
                              <th className="p-3">Organe & Fluide</th>
                              <th className="p-3">Seuil Nominal (ISO)</th>
                              <th className="p-3">Seuil d'Alerte</th>
                              <th className="p-3">Action Corrective Requise</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 font-medium">
                            <tr className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-900">Hydraulique Principale (ISO VG 46)</td>
                              <td className="p-3 font-mono text-emerald-600 font-bold">18 / 16 / 13</td>
                              <td className="p-3 font-mono text-red-600 font-bold">&gt; 20 / 18 / 15</td>
                              <td className="p-3">Brancher l'unité de filtration mobile (groupe de transfert) pendant 24h. Remplacer les filtres de retour (10µm).</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-900">Boîte Powershift Funk (ATF)</td>
                              <td className="p-3 font-mono text-emerald-600 font-bold">19 / 17 / 14</td>
                              <td className="p-3 font-mono text-red-600 font-bold">&gt; 21 / 19 / 15</td>
                              <td className="p-3">Vidange complète de la boîte, rinçage du convertisseur de couple, contrôle d'usure des disques d'embrayage.</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-900">Essieux Kessler (SAE 85W140)</td>
                              <td className="p-3 font-mono text-emerald-600 font-bold">21 / 19 / 16</td>
                              <td className="p-3 font-mono text-red-600 font-bold">&gt; 22 / 20 / 17</td>
                              <td className="p-3">Vidanger l'huile de différentiel et de moyeux de roues. Inspecter les aimants de bouchons de vidange.</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-900">Gazole d'injection HPCR Cummins</td>
                              <td className="p-3 font-mono text-emerald-600 font-bold">15 / 13 / 10</td>
                              <td className="p-3 font-mono text-red-600 font-bold">&gt; 17 / 15 / 12</td>
                              <td className="p-3 text-red-600 font-black">Remplacement d'urgence des préfiltres décanteurs d'eau et filtres haute pression Cummins (3µm). Purge du réservoir.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Microscope Visualizer simulation */}
                    <div className="lg:col-span-5 bg-slate-950 rounded-xl p-5 border border-slate-900 text-white space-y-4">
                      <span className="text-[10px] font-mono text-amber-500 tracking-widest uppercase block font-bold">
                        SIMULATEUR DE COMPTAGE DE PARTICULES MICROSCUPIQUE (ISO 4406)
                      </span>
                      <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                        La norme ISO 4406 compte le nombre de particules par mL de fluide pour trois tailles distinctes : <span className="text-white">&gt;4 µm</span> (premier chiffre), <span className="text-white">&gt;6 µm</span> (deuxième), et <span className="text-white">&gt;14 µm</span> (troisième).
                      </p>

                      <div className="flex gap-4 items-center bg-slate-900 p-4 rounded-lg border border-slate-800">
                        {/* Circular lens preview of particles */}
                        <div className="w-24 h-24 rounded-full border-4 border-slate-700 bg-amber-950/20 relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {/* Random particles drawn as SVG dots to represent ISO cleanliness levels */}
                          <svg viewBox="0 0 100 100" className="w-full h-full absolute top-0 left-0">
                            {/* Particules > 4µm (Small dots) */}
                            <circle cx="20" cy="30" r="1.2" fill="#e2e8f0" />
                            <circle cx="45" cy="15" r="1" fill="#e2e8f0" />
                            <circle cx="75" cy="40" r="1.5" fill="#e2e8f0" />
                            <circle cx="30" cy="80" r="1" fill="#e2e8f0" />
                            <circle cx="85" cy="75" r="1.3" fill="#e2e8f0" />
                            <circle cx="55" cy="65" r="1.1" fill="#e2e8f0" />
                            <circle cx="15" cy="60" r="1.4" fill="#e2e8f0" />
                            <circle cx="60" cy="25" r="1.2" fill="#e2e8f0" />

                            {/* Particules > 6µm (Medium amber dots) */}
                            <circle cx="35" cy="45" r="2.2" fill="#fbbf24" />
                            <circle cx="65" cy="60" r="2" fill="#fbbf24" />
                            <circle cx="50" cy="85" r="2.5" fill="#fbbf24" />
                            <circle cx="80" cy="20" r="2.1" fill="#fbbf24" />

                            {/* Particules > 14µm (Large red particles) */}
                            <circle cx="40" cy="60" r="4.5" fill="#ef4444" opacity="0.9" />
                            <circle cx="70" cy="35" r="4" fill="#ef4444" opacity="0.9" />
                          </svg>
                          <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950/60 pointer-events-none" />
                          <div className="absolute bottom-1 text-[7px] font-mono font-bold text-center w-full text-slate-400 bg-slate-950/80">Zoom Microscope</div>
                        </div>

                        <div className="space-y-1.5 font-mono text-[10px]">
                          <div className="text-white font-bold uppercase text-[9px] tracking-wider">Classification de l'échantillon :</div>
                          <div className="text-red-400 font-bold">Code Actuel : 20 / 18 / 15</div>
                          <div className="text-slate-400 leading-snug">
                            - &gt;4 µm: ~7 800 part/mL <br />
                            - &gt;6 µm: ~2 100 part/mL <br />
                            - &gt;14 µm: ~240 part/mL
                          </div>
                          <div className="text-red-500 font-black uppercase text-[8px] tracking-widest mt-1">⚠️ ETAT CRITIQUE : POLLUTION DU CIRCUIT</div>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850/50 space-y-1">
                        <span className="text-[9px] font-bold text-amber-400 block font-mono">CONSEIL DU MAÎTRE D'ATELIER :</span>
                        <p className="text-[10px] text-slate-300 leading-normal font-semibold font-mono">
                          "La présence de particules abrasives de roche (silice) agit comme une pâte à roder. Elle détruit en quelques dizaines d'heures le revêtement chromé des tiroirs de distributeurs hydrauliques Rexroth et de la pompe de direction. Filtrez toujours l'huile neuve avant de faire l'appoint !"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: OIL SPECTROMETRY */}
              {selectedFluidsDiagTab === "oil-spectro" && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      MATRICE D'INTERPRÉTATION DU DIAGNOSTIC DE SPECTROMÉTRIE (S.O.S ANALYSIS)
                    </span>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                      L'analyse spectrométrique identifie les éléments métalliques en suspension en parties par million (ppm). Elle permet de localiser avec précision quel composant interne subit une dégradation anormale avant la rupture mécanique catastrophique.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      
                      {/* Cuivre */}
                      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-black text-amber-700 uppercase">Cuivre (Cu)</span>
                          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-bold">Seuil max : 25 ppm</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          <span className="font-bold text-slate-700">Origine probable :</span> Usure des patins en bronze des pistons de la pompe à débit variable, ou des disques de friction en bronze fritté de la transmission Powershift Funk.
                        </p>
                      </div>

                      {/* Fer */}
                      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-black text-slate-700 uppercase">Fer (Fe)</span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">Seuil max : 80 ppm</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          <span className="font-bold text-slate-700">Origine probable :</span> Usure des dentures d'engrenages du réducteur de roue d'essieu Kessler, des flasques de pignon d'attaque ou écaillage de roulements à rouleaux.
                        </p>
                      </div>

                      {/* Silicium */}
                      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-black text-emerald-700 uppercase">Silicium (Si)</span>
                          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold">Seuil max : 15 ppm</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          <span className="font-bold text-slate-700">Origine probable :</span> Pénétration de poussières de forage et quartz de galerie par le reniflard du réservoir défectueux, ou par un collier desserré sur la durite d'aspiration d'air du moteur Cummins.
                        </p>
                      </div>

                      {/* Plomb & Étain */}
                      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-black text-slate-800 uppercase">Plomb / Étain (Pb/Sn)</span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">Seuil max : 12 ppm</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          <span className="font-bold text-slate-700">Origine probable :</span> Friction extrême et laminage des demi-coussinets de bielles ou de paliers de vilebrequin du moteur Cummins QSB6.7 par manque temporaire de pression de lubrification.
                        </p>
                      </div>

                      {/* Sodium & Bore */}
                      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-black text-blue-700 uppercase">Sodium / Bore (Na/B)</span>
                          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded font-bold">Seuil max : 20 ppm</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          <span className="font-bold text-slate-700">Origine probable :</span> Contamination chimique par infiltration de liquide de refroidissement glycolé (eau moteur) due à un refroidisseur d'huile hydraulique fissuré ou un joint de culasse endommagé.
                        </p>
                      </div>

                      {/* Chrome */}
                      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-xs font-black text-indigo-700 uppercase">Chrome (Cr)</span>
                          <span className="text-[10px] font-mono bg-indigo-50/20 text-indigo-600 px-1.5 py-0.5 rounded font-bold">Seuil max : 8 ppm</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          <span className="font-bold text-slate-700">Origine probable :</span> Dégradation de la couche de chromage dur sur les segments de pistons du moteur Cummins, ou début d'écaillement de la tige d'un vérin hydraulique de benne/levage.
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: ARTICULATION */}
              {selectedFluidsDiagTab === "articulation" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-amber-500" /> MESURE DU JEU VERTICAL DU PIVOT CENTRAL (DIAL INDICATOR)
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      L'articulation centrale subit des contraintes d'impact extrêmes lors du chargement mécanique au godet en tas de minerai. Un jeu vertical supérieur aux tolérances constructeur entraîne des contraintes de torsion asymétriques sur les arbres de transmission de pompe et les rotules de vérins de direction.
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 font-semibold text-[10px] space-y-1.5">
                      <span className="text-slate-800 font-black uppercase">PROTOCOLE DE MESURE DU JEU :</span>
                      <ol className="list-decimal pl-4 text-slate-500 space-y-1">
                        <li>Placer la machine parfaitement à plat sur sol bétonné d'atelier et verrouiller l'articulation à l'aide de la barre de sécurité mécanique rouge.</li>
                        <li>Fixer le support magnétique du comparateur à cadran sur le châssis arrière (oscillating framework) et positionner le palpeur de touche sur la surface rectifiée supérieure de la chape de pivot avant.</li>
                        <li>Mettre le comparateur à zéro.</li>
                        <li>À l'aide des vérins de levage principaux ou d'un cric hydraulique lourd d'atelier, soulever délicatement les roues avant du sol de <span className="text-slate-800 font-black">50 mm</span>.</li>
                        <li>Lire la déviation maximale sur le comparateur. Le jeu vertical axial toléré ne doit pas excéder <span className="text-red-600 font-bold">0.15 mm</span>. Si supérieur, démonter et remplacer les cales d'épaisseur pour rétablir la précharge initiale d'usine.</li>
                      </ol>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-amber-500" /> SPÉCIFICATIONS DE SERRAGE ET TOLÉRANCES PHYSIQUES
                    </h4>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 font-black uppercase text-[9px] text-slate-600 tracking-wider">
                            <th className="p-2.5">Paramètre Technique</th>
                            <th className="p-2.5">Cote / Couple Nominal</th>
                            <th className="p-2.5">Limite de Maintenance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          <tr>
                            <td className="p-2.5">Couple de serrage vis de pivots centraux</td>
                            <td className="p-2.5 font-mono">320 Nm (Classe 10.9)</td>
                            <td className="p-2.5 text-red-600">Aucun desserrage toléré</td>
                          </tr>
                          <tr>
                            <td className="p-2.5">Jeu axial du palier d'oscillation arrière</td>
                            <td className="p-2.5 font-mono">0.05 mm à 0.12 mm</td>
                            <td className="p-2.5 font-mono text-red-600 font-bold">Max : 0.25 mm</td>
                          </tr>
                          <tr>
                            <td className="p-2.5">Graissage automatique du pivot central</td>
                            <td className="p-2.5 font-mono">Type NLGI Grade 2 (EP2)</td>
                            <td className="p-2.5 text-slate-500">Injecté toutes les 2 h de marche</td>
                          </tr>
                          <tr>
                            <td className="p-2.5">Couple de serrage des brides de transmission J1939</td>
                            <td className="p-2.5 font-mono">115 Nm</td>
                            <td className="p-2.5 text-slate-500">Vérification toutes les 250 h</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-[10px] rounded-lg text-amber-700 font-bold leading-relaxed font-medium">
                      ⚠️ <span className="uppercase font-bold">Avertissement de sécurité :</span> Ne jamais travailler sous l'articulation centrale sans avoir installé la barre mécanique rigide de verrouillage rouge de sécurité. Un pliage accidentel de l'articulation suite à une fuite hydraulique peut écraser mortellement le technicien.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: ANSUL FIRE SUPPRESSION */}
              {selectedFluidsDiagTab === "ansul-fire" && (
                <div className="space-y-4">
                  <div className="bg-slate-950 rounded-xl p-5 border border-slate-900 text-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                      <span className="text-[10px] font-mono text-red-500 tracking-widest uppercase block font-bold">
                        SYSTEME FIXE ANTI-INCENDIE ANSUL LVS-30 (DOUBLE COQUE LIQUIDE & POUDRE)
                      </span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono text-[9px] font-bold border border-red-500/20">
                        OBLIGATOIRE EN MINE SOUTERRAINE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3 text-[11px] text-slate-300 font-semibold leading-relaxed">
                        <p>
                          Le Scooptram ST7 embarque un système d'extinction d'incendie homologué <span className="font-bold text-white">Ansul LVS-30</span> à déclenchement automatique ou par percussion manuelle cabine/châssis. Il projette un agent mouillant d'extinction liquide hautement refroidissant combiné à une poudre chimique pour étouffer le feu instantanément au niveau du turbo moteur et des pompes hydrauliques.
                        </p>
                        <div className="p-3 bg-slate-900 rounded-lg space-y-1.5 border border-slate-800">
                          <span className="text-white font-bold block text-[10px] uppercase">POINTS DE CONTRÔLE MENSUEL DE SÉCURITÉ :</span>
                          <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[10px]">
                            <li><span className="text-white font-bold">Pression de la bouteille d'azote pilote :</span> L'aiguille du manomètre doit se situer strictement au milieu de la zone verte d'usine.</li>
                            <li><span className="text-white font-bold">Buses d'extinction d'injection :</span> S'assurer que les capuchons en silicone rouge de protection contre les poussières de forage sont présents sur les 6 buses de diffuseurs.</li>
                            <li><span className="text-white font-bold">Pesée des bouteilles :</span> Vérifier que la masse réelle des réservoirs de gaz sous pression correspond exactement au poids poinçonné sur la bouteille (variation max tolérée : <span className="text-red-400 font-bold font-mono">±50 g</span>).</li>
                            <li><span className="text-white font-bold">Boucle de détection thermique linéaire :</span> Le câble capteur thermique LHD qui fait le tour du compartiment moteur ne doit pas présenter d'abrasion ou de contact métallique direct avec le bloc moteur sous peine de fausses alertes RCS.</li>
                          </ul>
                        </div>
                      </div>

                      {/* Schematic Visual layout using simple SVG */}
                      <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 flex flex-col justify-between">
                        <span className="text-[9px] font-mono text-slate-400 tracking-wider uppercase block font-bold mb-3">
                          SCHÉMA GÉOMÉTRIQUE DE COUVERTURE DU COMPARTIMENT MOTEUR CUMMINS
                        </span>
                        
                        <div className="bg-slate-950 p-2 rounded border border-slate-850 flex items-center justify-center min-h-[140px]">
                          <svg viewBox="0 0 320 140" className="w-full h-auto text-white select-none">
                            {/* Motor block outline */}
                            <rect x="80" y="30" width="160" height="70" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                            <text x="160" y="65" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">BLOC MOTEUR CUMMINS</text>

                            {/* Turbocharger */}
                            <circle cx="210" cy="45" r="12" fill="#ef4444" opacity="0.3" />
                            <circle cx="210" cy="45" r="8" fill="#ef4444" stroke="#f87171" strokeWidth="1" />
                            <text x="210" y="47" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">TURBO</text>

                            {/* Fire suppression chemical tank */}
                            <rect x="15" y="15" width="40" height="80" rx="3" fill="#b91c1c" stroke="#dc2626" />
                            <text x="35" y="55" fill="#ffffff" fontSize="6" fontWeight="black" textAnchor="middle" transform="rotate(-90 35 55)">ANSUL LVS</text>

                            {/* Nitrogen cart */}
                            <rect x="25" y="100" width="12" height="25" rx="1" fill="#475569" stroke="#64748b" />
                            <text x="31" y="112" fill="#ffffff" fontSize="4" fontWeight="bold" textAnchor="middle">N2</text>

                            {/* Distribution piping (Red line) */}
                            <path d="M 55 55 L 100 20 L 170 20 L 210 20 L 210 33" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="3,3" />
                            <path d="M 55 55 L 100 110 L 210 110 L 210 100" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="3,3" />

                            {/* Spray Nozzles */}
                            <polygon points="100,20 97,25 103,25" fill="#ef4444" />
                            <polygon points="170,20 167,25 173,25" fill="#ef4444" />
                            <polygon points="210,33 205,30 215,30" fill="#ef4444" />
                            <polygon points="100,110 97,105 103,105" fill="#ef4444" />
                            <polygon points="210,100 205,103 215,103" fill="#ef4444" />

                            {/* Nozzles text tag */}
                            <text x="140" y="14" fill="#f87171" fontSize="5" fontWeight="bold" textAnchor="middle">6 BUSES DE COMPRESSION SPRAY ET BLINDAGE DIRECT</text>
                          </svg>
                        </div>

                        <span className="text-[9px] text-slate-400 font-mono mt-2 block">
                          &gt; Statut de boucle de détection : <span className="text-emerald-500 font-bold">SÉCURISÉE (Pas de court-circuit)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </section>

        </main>
      </div>

    </div>
  );
}
