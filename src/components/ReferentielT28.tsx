import * as React from "react";
import {
  BookOpen, AlertTriangle, Wrench, Droplets, Clock,
  ChevronDown, ChevronRight, Info, Gauge, Settings, Zap, CheckCircle
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

interface DiagItem {
  id: string;
  title: string;
  sev: "CRITIQUE" | "ATTENTION";
  causes: string[];
}

export function ReferentielT28({ onSelectEngin }: { onSelectEngin: (engin: string) => void }) {
  const [activeSection, setActiveSection] = React.useState("identite-t28");
  const [hoveredComponent, setHoveredComponent] = React.useState<string | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = React.useState<string | null>(null);
  const [openAccordions, setOpenAccordions] = React.useState<Record<string, boolean>>({
    p1: true, // Expand first procedure by default
    d1: true  // Expand first diagnostic by default
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

  // --- MENU GAUCHE MONTABERT T28 ---
  const menuGroups: MenuGroup[] = [
    {
      title: "IDENTIFICATION",
      items: [
        { id: "identite-t28", label: "Fiche d'identité technique" }
      ]
    },
    {
      title: "FONCTIONNEMENT",
      items: [
        { id: "specs-mecaniques-t28", label: "Caractéristiques de frappe" },
        { id: "consommation-air-t28", label: "Consommation d'air & eau" }
      ]
    },
    {
      title: "CIRCUITS ET SCHÉMA",
      items: [
        { id: "schema-interactif-t28", label: "Schéma interne T28 (SVG)" }
      ]
    },
    {
      title: "LUBRIFICATION EN LIGNE",
      items: [
        { id: "graisseur-fluide-t28", label: "Système de graissage BL-80" },
        { id: "plan-entretien-t28", label: "Plan d'entretien périodique" }
      ]
    },
    {
      title: "DIAGNOSTIC DE PANNES",
      items: [
        { id: "diagnostic-t28", label: "Pannes du perforateur T28" }
      ]
    },
    {
      title: "PROCÉDURES ATELIER",
      items: [
        { id: "proc-tirants-t28", label: "Serrage des tirants d'assemblage" },
        { id: "proc-tube-eau-t28", label: "Remplacement du tube d'eau" },
        { id: "proc-mandrin-t28", label: "Remplacement du mandrin" }
      ]
    }
  ];

  // --- DATA STRUCTURES FOR T28 ---
  const generalIdentiteT28 = [
    { label: "Désignation officielle", val: "Montabert T28 (Perforateur pneumatique sur poussoir)" },
    { label: "Constructeur", val: "Montabert S.A. (Saint-Priest, France)" },
    { label: "Type d'outil", val: "Marteau perforateur pneumatique lourd à rotation automatique" },
    { label: "Poids en service", val: "28 kg (Robuste et haute performance)" },
    { label: "Longueur totale", val: "685 mm" },
    { label: "Largeur du corps", val: "265 mm" },
    { label: "Emmanchement standard", val: "Hex 22 × 108 mm (7/8\" × 4 1/4\")" },
    { label: "Alimentation air", val: "Raccord 1\" BSP (Flexible DN 25)" },
    { label: "Alimentation eau (insufflation)", val: "Raccord 1/2\" BSP (Flexible DN 13)" }
  ];

  const specsFrappeT28 = [
    { label: "Pression d'air de service", val: "5.0 – 6.5 bar (Pression nominale : 6.0 bar)" },
    { label: "Fréquence de percussion à 5.5 bar", val: "2 100 coups/minute" },
    { label: "Fréquence de percussion à 6.0 bar", val: "2 250 coups/minute" },
    { label: "Énergie d'impact par coup", val: "62 Joules (à 6.0 bar - Haute énergie)" },
    { label: "Vitesse de rotation nominale", val: "170 – 210 tours/minute" },
    { label: "Mécanisme de rotation", val: "Rifle Bar (Arbre à spirales et 4 cliquets renforcés)" },
    { label: "Sens de rotation", val: "Anti-horaire (à gauche vu de l'arrière)" },
    { label: "Diamètre de forage optimal", val: "Ø 34 mm – Ø 48 mm (Max : 57 mm)" },
    { label: "Profondeur de forage utile max", val: "3.80 mètres" }
  ];

  const fluidesT28 = [
    { label: "Consommation d'air à 5.5 bar", val: "4.1 m³/minute (68 L/s)" },
    { label: "Consommation d'air à 6.0 bar", val: "4.6 m³/minute (76 L/s)" },
    { label: "Fluide d'insufflation (flushing)", val: "Eau sous pression (évacuation des débris de forage)" },
    { label: "Pression d'eau recommandée", val: "4.5 – 5.0 bar (Impératif : P_eau = P_air - 1 bar)" },
    { label: "Débit d'eau d'insufflation minimal", val: "8.0 Litres/minute" },
    { label: "Type d'injecteur", val: "Tube d'eau central inoxydable à double étanchéité" }
  ];

  const diagnosticListT28: DiagItem[] = [
    {
      id: "d1",
      title: "Le perforateur T28 refuse de démarrer (Pas de percussion)",
      sev: "CRITIQUE",
      causes: [
        "Pression d'air d'alimentation insuffisante (< 4.5 bar) -> Vérifier l'état du réseau d'air souterrain et des vannes.",
        "Glace ou condensation gelée obstruant la valve oscillante -> Purger le séparateur d'eau de ligne; utiliser de l'antigel pneumatique.",
        "Piston percuteur grippé dans le cylindre par manque d'huile -> Ouvrir, déglacer les surfaces avec un abrasif ultra-fin et changer l'huile de ligne.",
        "Serrage des tirants asymétrique bloquant le déplacement libre du piston -> Desserrer et appliquer le couple en croix de 135 Nm."
      ]
    },
    {
      id: "d2",
      title: "Impact mou, cadence de frappe très ralentie",
      sev: "ATTENTION",
      causes: [
        "Fuite d'air majeure au niveau des joints internes ou du distributeur -> Remplacer le clapet et les bagues de frottement du distributeur.",
        "Chute de pression due à un flexible de 1\" trop long (> 20m) ou étranglé -> Réduire la longueur ou utiliser un flexible DN 25 conforme.",
        "Usure excessive des segments de piston ou du diamètre du cylindre -> Contrôler la métrologie des pièces d'usure en atelier."
      ]
    },
    {
      id: "d3",
      title: "Absence complète de rotation du fleuret (La frappe continue)",
      sev: "CRITIQUE",
      causes: [
        "Rupture des 4 cliquets de rotation renforcés de l'arbre hélicoïdal -> Déposer le fond arrière et remplacer le jeu de cliquets avec leurs ressorts.",
        "Usure totale des cannelures mâles de la rifle bar ou de la douille de mandrin -> Remplacer les pièces d'usure cannelées.",
        "Coincement mécanique dans une fracture rocheuse -> Activer l'effort de traction du poussoir tout en maintenant une percussion légère."
      ]
    },
    {
      id: "d4",
      title: "Entraînement d'eau dans le circuit d'échappement d'air",
      sev: "CRITIQUE",
      causes: [
        "Rupture nette ou perforation du tube d'eau central (Flushing tube) -> Remplacer immédiatement le tube pour éviter d'oxyder les cylindres.",
        "Détérioration des joints d'étanchéité arrière du raccord d'insufflation -> Installer un kit de joints toriques neufs sur le presse-étoupe.",
        "Pression d'insufflation d'eau excessive par rapport à l'air -> Réguler la pression d'eau à 1.0 bar en dessous de la pression d'air."
      ]
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-slate-900 font-sans select-none relative z-10 w-full">
      
      {/* --- NIVEAU 1 : SELECTION DE LA MACHINE (TOP NAV BAR) --- */}
      <div className="w-full lg:absolute lg:top-0 lg:left-0 lg:right-0 bg-white border-b border-slate-100 p-4 shrink-0 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectEngin("ST7")}
            className="h-10 px-5 rounded-lg font-black text-xs uppercase tracking-wider transition-all bg-white border border-slate-200 text-slate-500 hover:text-amber-600 cursor-pointer"
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
            className="h-10 px-5 rounded-lg font-black text-xs uppercase tracking-wider transition-all bg-amber-500 text-white shadow-xs cursor-pointer"
          >
            Montabert T28
          </button>
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
                      "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer",
                      activeSection === item.id
                        ? "bg-slate-950 text-amber-400 font-extrabold shadow-xs"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <span>{item.label}</span>
                    {activeSection === item.id && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-slate-100">
            <div className="p-3 bg-amber-50/50 border border-amber-200/40 rounded-xl space-y-2 text-[11px] leading-relaxed text-amber-900">
              <div className="flex items-center gap-1.5 font-black text-amber-950 uppercase text-[10px]">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Notice Importante T28</span>
              </div>
              <p className="font-semibold">
                Le Montabert T28 possède une énergie d'impact de 62 Joules qui impose une tension de serrage supérieure à celle du T23 pour résister aux vibrations.
              </p>
            </div>
          </div>
        </aside>

        {/* --- NIVEAU 3 : CONTENU TECHNIQUE --- */}
        <main className="flex-1 p-6 lg:p-10 space-y-12 overflow-y-auto max-w-5xl mx-auto">
          
          {/* EN TÊTE DE FICHE TECHNIQUE */}
          <div className="bg-white border-2 border-amber-500/10 rounded-[14px] shadow-sm overflow-hidden mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              
              <div className="lg:col-span-2 p-6 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-[#121c26] to-[#04080c] border border-amber-500/30 text-[#ffd700]">
                  <Zap className="w-8 h-8 stroke-[2.2]" />
                </div>
              </div>

              <div className="lg:col-span-7 p-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left gap-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/45">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#b8860b]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-800">
                    MANUEL TECHNIQUE D'EXPLOITATION MINIÈRE — MONTABERT
                  </span>
                </div>
                <h1 className="text-2xl xl:text-3xl tracking-tight leading-none uppercase font-black">
                  <span className="luminous-gold-white-text">
                    Montabert T28
                  </span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Marteau perforateur pneumatique lourd 28 kg · Forage de grands diamètres en terrains très durs
                </p>
              </div>

              <div className="lg:col-span-3 p-6 flex flex-col justify-center items-center lg:items-end gap-1.5">
                <HydrominesLogo size={120} variant="full" className="mb-2" />
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50/80 border border-amber-200/30 rounded-md">
                  <span className="w-1.5 h-1.5 bg-[#b8860b] rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold tracking-wider uppercase text-[#b8860b]">MATÉRIEL ACTIF (T28)</span>
                </div>
                <div className="px-3 py-1 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-lg text-xs font-black text-[#ffd700] shadow-md uppercase tracking-widest">
                  MONTABERT T28
                </div>
              </div>

            </div>
          </div>

          {/* --- FICHE D'IDENTITE TECHNIQUE --- */}
          <section id="identite-t28" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Settings className="w-4 h-4" /></span>
              Fiche d'identité technique générale
            </h2>
            
            <div className="p-4 bg-amber-50/60 border border-amber-200/50 rounded-xl text-xs text-amber-900 leading-relaxed font-bold">
              📢 Le Montabert T28 est un perforateur pneumatique robuste de <strong>28 kg</strong>. Plus lourd et puissant que le modèle T23, il est destiné aux forages horizontaux et montants de grands diamètres (jusqu'à 57 mm) dans les formations géologiques dures à très dures, garantissant un rendement élevé grâce à son piston renforcé.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Caractéristiques Générales</h3>
                {generalIdentiteT28.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Avantages Clés en Galerie Souterraine</h3>
                <div className="space-y-3.5 text-xs text-slate-600 font-bold">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p><span className="text-slate-900">Force d'impact élevée (62 Joules) :</span> Brise efficacement les quartzites et les granites les plus denses.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p><span className="text-slate-900">Arbre hélicoïdal renforcé (Heavy Duty) :</span> Durée de vie accrue des cliquets et de la roue à rochet lors du travail sous fort couple.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p><span className="text-slate-900">Flushing intensif (8 L/min) :</span> Évacue parfaitement les sédiments de forage lourds pour prévenir le coincement du taillant.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p><span className="text-slate-900">Tirants surdimensionnés :</span> Tirants d'assemblage en acier allié de haute résistance traités thermiquement contre la fatigue.</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* --- CARACTERISTIQUES DE FRAPPE --- */}
          <section id="specs-mecaniques-t28" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Gauge className="w-4 h-4" /></span>
              Caractéristiques mécaniques et de percussion
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Spécifications Mécaniques (T28)</h3>
                {specsFrappeT28.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider">Comportement en forage intensif</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-3 font-bold leading-relaxed">
                  <div className="flex items-center gap-1.5 text-slate-900 font-extrabold">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>RENDEMENT EN PRODUCTION</span>
                  </div>
                  <p>
                    Le perforateur T28 est conçu pour travailler sous une pression stable de 6.0 bar. Une pression trop faible compromet le mécanisme de rotation automatique, tandis qu'une surpression (&gt; 6.8 bar) provoque des microfissures sur le piston percuteur.
                  </p>
                  <p>
                    L'utilisation de barres de forage de haute qualité (alliage traité) est primordiale pour transmettre sans déperdition les 62 Joules d'énergie d'impact directement dans la roche.
                  </p>
                  <p>
                    La douille de mandrin doit faire l'objet d'une surveillance encore plus rapprochée que sur le T23 en raison de l'usure accélérée générée par la masse accrue du piston.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* --- CONSOMMATION COMPRESSÉE AIR / EAU --- */}
          <section id="consommation-air-t28" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Droplets className="w-4 h-4" /></span>
              Consommations et exigences en Fluides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Alimentation en Fluides (T28)</h3>
                {fluidesT28.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-red-700 tracking-wider">⚠️ BALANCAGE DES PRESSIONS SUR T28</h3>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    Avec une consommation de 4.6 m³/min d'air comprimé, le raccordement doit être réalisé via des raccords à passage intégral 1\" sans restriction pour éliminer les pertes de charge.
                  </p>
                  <div className="p-3.5 bg-red-50/55 border border-red-200 rounded-xl text-[11px] font-bold text-red-900 leading-relaxed">
                    Le débit d'eau d'insufflation de 8 Litres/minute exige un réseau d'eau souterrain régulé à 4.5 – 5.0 bar. Si le réseau d'eau tombe en panne ou si la pression d'eau surpasse la pression d'air, le carter d'échappement se remplit d'eau, entraînant l'oxydation de la rifle bar en moins de 12 heures.
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider text-center">
                  Règle d'or : P_eau = P_air - 1.0 bar (Idem T23)
                </div>
              </div>

            </div>
          </section>

          {/* --- SCHEMA INTERACTIF TECHNIQUE T28 --- */}
          <section id="schema-interactif-t28" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><BookOpen className="w-4 h-4" /></span>
                Schéma technique interne interactif — Montabert T28
              </h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/50">
                LOURD & RENFORCÉ (T28)
              </span>
            </div>

            <p className="text-xs font-bold text-slate-600 leading-relaxed">
              Passez votre curseur (sur ordinateur) ou touchez les zones interactives ci-dessous pour inspecter les organes internes du marteau perforateur Montabert T28.
            </p>

            <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-lg p-5 pl-8 flex flex-col items-center justify-center relative min-h-[350px]">
              {/* Left accent lines */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-950 border-r border-red-800/30" />
              <div className="absolute left-1.5 top-0 bottom-0 w-1 bg-sky-400" />
              
              {/* Le diagramme SVG interactif */}
              <svg width="100%" height="240" viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-3xl">
                {/* Ligne d'axe technique */}
                <line x1="50" y1="120" x2="750" y2="120" stroke="#1e293b" strokeDasharray="6 4" strokeWidth="2" />
                
                {/* 1. MANDRIN / BAGUE DE ROTATION (CHUCK) [FRONT] */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("chuck", "Mandrin renforcé T28 : Plus large que celui du T23, il intègre la douille de mandrin (chuck bushing) de guidage Hex 22 × 108 mm. Supporte l'impact massif de 62 Joules sans déformation.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="110" y="65" width="110" height="110" rx="4" fill={hoveredComponent === "chuck" ? "#d97706" : "#334155"} stroke="#475569" strokeWidth="2" className="transition-all" />
                  <rect x="70" y="80" width="40" height="80" rx="3" fill={hoveredComponent === "chuck" ? "#b45309" : "#1e293b"} stroke="#475569" strokeWidth="2" className="transition-all" />
                  <text x="135" y="125" fill="#f8fafc" className="text-[10px] font-mono font-black" textAnchor="middle">MANDRIN T28</text>
                  <text x="135" y="140" fill="#fbbf24" className="text-[8px] font-mono font-extrabold" textAnchor="middle">HEX 22×108 HD</text>
                  <circle cx="165" cy="120" r="18" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-pulse" />
                </g>

                {/* 2. PISTON PERCUTEUR (PISTON) */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("piston", "Piston percuteur T28 : Masse de frappe optimisée d'un alésage de 75 mm et course de 60 mm. Transmet l'onde de choc au fleuret à une fréquence de 2250 cps/min.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="230" y="70" width="165" height="100" rx="4" fill={hoveredComponent === "piston" ? "#d97706" : "#475569"} stroke="#64748b" strokeWidth="2" className="transition-all" />
                  <line x1="250" y1="85" x2="350" y2="85" stroke="#fbbf24" strokeWidth="2" />
                  <line x1="250" y1="155" x2="350" y2="155" stroke="#fbbf24" strokeWidth="2" />
                  <text x="312" y="125" fill="#f8fafc" className="text-[11px] font-mono font-black" textAnchor="middle">PISTON LOURD T28</text>
                  <circle cx="312" cy="120" r="20" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-pulse" />
                </g>

                {/* 3. DISTRIBUTEUR D'AIR (VALVE) */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("valve", "Distributeur d'air renforcé T28 : Commande le flux d'air de grand volume. Les tolérances d'usinage micrométriques exigent une propreté d'air absolue.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="405" y="50" width="85" height="45" rx="3" fill={hoveredComponent === "valve" ? "#d97706" : "#334155"} stroke="#475569" strokeWidth="2" className="transition-all" />
                  <text x="447" y="75" fill="#f8fafc" className="text-[9px] font-mono font-black" textAnchor="middle">DISTRIBUTEUR HD</text>
                  <circle cx="447" cy="72" r="12" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-pulse" />
                </g>

                {/* 4. BARRE HELICOIDALE / ARBRE DE ROTATION (RIFLE BAR) */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("rifle-bar", "Rifle Bar renforcée T28 : Arbre hélicoïdal surdimensionné doté de cliquets de grand gabarit pour résister au couple élevé imposé par les taillants lourds.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="405" y="105" width="180" height="30" rx="2" fill={hoveredComponent === "rifle-bar" ? "#d97706" : "#1e293b"} stroke="#475569" strokeWidth="1.5" className="transition-all" />
                  <path d="M 525 105 L 565 120 L 525 135 Z" fill="#64748b" />
                  <text x="495" y="124" fill="#f8fafc" className="text-[9px] font-mono font-black" textAnchor="middle">RIFLE BAR T28</text>
                  <circle cx="495" cy="120" r="14" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-pulse" />
                </g>

                {/* 5. TUBE D'EAU CENTRAL (FLUSHING TUBE) */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("flushing-tube", "Tube d'insufflation d'eau central : Traversant de part en part. Conçu en acier inoxydable spécial avec manchon d'étanchéité double à l'arrière pour supporter 5 bar d'eau.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="100" y="117" width="600" height="6" fill={hoveredComponent === "flushing-tube" ? "#38bdf8" : "#0284c7"} className="transition-all" />
                  <text x="640" y="112" fill="#38bdf8" className="text-[8px] font-mono font-black" textAnchor="middle">TUBE D'EAU T28</text>
                  <circle cx="590" cy="120" r="10" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="animate-pulse" />
                </g>

                {/* 6. TIRANTS D'ASSEMBLAGE (SIDE RODS) */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("side-rods", "Les 4 Tirants d'assemblage T28 : Surdimensionnés par rapport au T23. Serrage en croix requis à 135 Nm pour prévenir tout jeu d'empilage interne.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="100" y="35" width="580" height="10" rx="2" fill={hoveredComponent === "side-rods" ? "#d97706" : "#334155"} stroke="#475569" strokeWidth="1" className="transition-all" />
                  <rect x="100" y="195" width="580" height="10" rx="2" fill={hoveredComponent === "side-rods" ? "#d97706" : "#334155"} stroke="#475569" strokeWidth="1" className="transition-all" />
                  <text x="390" y="43" fill="#f8fafc" className="text-[8px] font-mono font-bold" textAnchor="middle">TIRANT D'ASSEMBLAGE SUPÉRIEUR T28 (135 Nm)</text>
                  <circle cx="390" cy="40" r="10" fill="none" stroke="#fbbf24" strokeWidth="1" className="animate-pulse" />
                </g>

                {/* 7. ADMISSION AIR & EAU [BACK] */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("inlets", "Tête arrière (Backhead T28) : Entrées d'air DN 25 (1\" BSP) et d'eau DN 13 (1/2\" BSP). Le presse-étoupe en bronze protège l'entrée du tube d'eau.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="590" y="55" width="110" height="130" rx="4" fill={hoveredComponent === "inlets" ? "#d97706" : "#1e293b"} stroke="#475569" strokeWidth="2" className="transition-all" />
                  <rect x="700" y="70" width="30" height="30" rx="2" fill="#334155" stroke="#475569" />
                  <rect x="700" y="135" width="30" height="22" rx="2" fill="#0284c7" stroke="#475569" />
                  <text x="645" y="85" fill="#f8fafc" className="text-[8px] font-mono font-black" textAnchor="middle">AIR INLET 1\"</text>
                  <text x="645" y="152" fill="#38bdf8" className="text-[8px] font-mono font-black" textAnchor="middle">WATER INLET 1/2\"</text>
                  <circle cx="680" cy="115" r="14" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-pulse" />
                </g>
              </svg>

              {/* Affichage des explications dynamiques au survol */}
              <div className="w-full mt-4 bg-slate-900 border border-slate-800 rounded-xl p-4 min-h-[75px] flex items-center justify-center text-center">
                {hoveredTooltip ? (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest">
                      Organe interne inspecté (Montabert T28)
                    </div>
                    <p className="text-xs font-bold text-slate-200 leading-relaxed max-w-2xl">
                      {hoveredTooltip}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Survolez un organe interne du Montabert T28 pour afficher sa fiche technique
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* --- GRAISSEUR DE LIGNE BL-80 ET LUBRIFICATION --- */}
          <section id="graisseur-fluide-t28" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Droplets className="w-4 h-4" /></span>
              Système de lubrification — Graisseur de ligne BL-80
            </h2>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed font-bold space-y-2">
              <p>
                📢 De même que le T23, le perforateur T28 s'appuie exclusivement sur le <strong>graisseur de ligne BL-80 (ou similaire d'une capacité de 1.5 Litres)</strong> monté sur le flexible à moins de 3 mètres de l'outil.
              </p>
              <p>
                La consommation accrue du T28 exige un débit d'huile légèrement supérieur pour compenser le grand volume d'air comprimé traversant les distributeurs de percussion.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider">Spécifications Lubrifiant T28</h3>
                <div className="space-y-2.5 text-xs text-slate-700 font-bold">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Grade hiver ou mines froides</span>
                    <span className="text-slate-950">ISO VG 100 EP</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Grade été ou chantiers chauds</span>
                    <span className="text-slate-950">ISO VG 150 EP</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Propriétés de l'huile</span>
                    <span className="text-amber-700">Adhésivité élevée & anti-rouille</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Consommation de lubrifiant</span>
                    <span className="text-slate-950">~0.20 - 0.25 Litre / Heure</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span>Capacité minimale recommandée</span>
                    <span className="text-slate-950">1.5 L (Remplissage impératif par poste)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider">Réglage du graisseur (T28)</h3>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  Compte tenu du gabarit et de la violence de frappe du T28, un graissage insuffisant provoque la destruction de la rifle bar en moins de 4 heures de marche continue.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xxs font-mono font-bold text-amber-900 leading-normal">
                  📌 VÉRIFICATION VISUELLE :
                  <br />- Un brouillard d'huile doit être détectable au niveau des évents d'échappement.
                  <br />- Le fleuret de forage ne doit jamais ressortir sec de l'emmanchement arrière.
                  <br />- Ne jamais utiliser d'huile recyclée ou d'huile moteur classique, qui ne possèdent pas les agents émulsifiants indispensables face à l'humidité de l'air.
                </div>
              </div>

            </div>
          </section>

          {/* --- PLAN D'ENTRETIEN PERIODIQUE T28 --- */}
          <section id="plan-entretien-t28" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Clock className="w-4 h-4" /></span>
              Plan d'entretien préventif périodique — Montabert T28
            </h2>

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Intervalle</th>
                    <th className="p-4">Opérations de maintenance obligatoires (T28)</th>
                    <th className="p-4">Intervenant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  <tr>
                    <td className="p-4 text-amber-700 font-extrabold">CHAQUE POSTE (8h)</td>
                    <td className="p-4 space-y-1">
                      <p>• Remplir le graisseur de ligne BL-80 d'huile ISO VG 100/150 EP.</p>
                      <p>• Purger l'humidité accumulée dans la tuyauterie d'air souterraine avant connexion.</p>
                      <p>• Vérifier l'étanchéité des raccords d'air 1\" et de raccordement de poussoir.</p>
                    </td>
                    <td className="p-4 text-slate-500">Foreur / Mineur</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-amber-700 font-extrabold">QUOTIDIEN (8h)</td>
                    <td className="p-4 space-y-1">
                      <p>• Contrôler la tension des 4 tirants longitudinaux d'assemblage (resserrer à 135 Nm).</p>
                      <p>• Inspecter visuellement l'avant-corps pour détecter d'éventuelles microfissures métalliques.</p>
                    </td>
                    <td className="p-4 text-slate-500">Foreur / Mineur</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-amber-700 font-extrabold">HEBDOMADAIRE (50h)</td>
                    <td className="p-4 space-y-1">
                      <p>• Mesurer le diamètre d'usure interne de la douille de mandrin (chuck bushing).</p>
                      <p>• Remplacer si l'emmanchement Hex 22 présente un jeu latéral excessif (limite d'usure : 1.5 mm).</p>
                    </td>
                    <td className="p-4 text-amber-700">Mécanicien Mine</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-amber-700 font-extrabold">MENSUEL (200h)</td>
                    <td className="p-4 space-y-1">
                      <p>• Démonter la culasse arrière pour contrôler la rifle bar et remplacer les 4 cliquets et leurs ressorts.</p>
                      <p>• Remplacer systématiquement les joints toriques du tube d'eau central.</p>
                    </td>
                    <td className="p-4 text-amber-700">Mécanicien Mine</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-amber-700 font-extrabold">TRIMESTRIEL (600h)</td>
                    <td className="p-4 space-y-1">
                      <p>• Reconditionnement complet en atelier de mine avec nettoyage intégral au gazole.</p>
                      <p>• Remplacer impérativement les 4 tirants d'assemblage ( fatigue métallique sévère sur le T28 ).</p>
                      <p>• Métrologie complète du piston percuteur et du cylindre.</p>
                    </td>
                    <td className="p-4 text-red-700">Atelier Spécialisé</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* --- DIAGNOSTIC DE PANNES T28 --- */}
          <section id="diagnostic-t28" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="w-4 h-4" /></span>
              Diagnostic de pannes — Perforateur Montabert T28
            </h2>

            <div className="space-y-3">
              {diagnosticListT28.map((diag) => (
                <div key={diag.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div
                    onClick={() => toggleAccordion(diag.id)}
                    className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
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
                    <div className="bg-slate-50/40 p-5 border-t border-slate-100 space-y-2.5 text-xs font-bold text-slate-700">
                      <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-1">Causes probables et remèdes :</div>
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

          {/* --- PROCEDURES DE MAINTENANCE PAS-A-PAS T28 --- */}
          <section id="proc-tirants-t28" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Wrench className="w-4 h-4" /></span>
              Procédures de maintenance d'atelier & terrain (Montabert T28)
            </h2>

            <div className="space-y-4">
              
              {/* PROCEDURE 1 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div onClick={() => toggleAccordion("p11-t28")} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {openAccordions["p11-t28"] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs font-black text-slate-800 uppercase">[PROCÉDURE 1] Contrôle et resserrage des 4 tirants longitudinaux</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-2 py-0.5">~15 MIN</span>
                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">CONFORME T28</span>
                  </div>
                </div>
                {openAccordions["p11-t28"] && (
                  <div className="bg-slate-50/20 p-6 border-t border-slate-100 space-y-4 text-xs font-bold text-slate-700">
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 mb-2">
                      ⚠️ <strong>AVERTISSEMENT :</strong> Sur le T28, la force de frappe importante (62J) nécessite un serrage régulier au couple de 135 Nm. Un serrage insuffisant ou asymétrique provoque l'ovalisation du cylindre et l'immobilisation définitive du marteau.
                    </div>
                    {[
                      "Mettre l'outil hors pression et débrancher le raccord d'air principal 1\".",
                      "Brosser énergiquement les filets et les portées d'écrous des tirants.",
                      "À l'aide d'une clé dynamométrique, pré-serrer les 4 écrous à la main.",
                      "Serrer en croix par étapes successives (40 Nm, 80 Nm, 110 Nm).",
                      "Appliquer le couple final réglementaire de 130 – 140 N.m (135 Nm recommandés).",
                      "Contrôler visuellement que le mandrin avant tourne librement à la main sans point dur."
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
              <div id="proc-tube-eau-t28" className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs scroll-mt-20">
                <div onClick={() => toggleAccordion("p12-t28")} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {openAccordions["p12-t28"] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs font-black text-slate-800 uppercase">[PROCÉDURE 2] Remplacement du tube d'eau d'insufflation central</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-2 py-0.5">~30 MIN</span>
                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">MÉCANICIEN</span>
                  </div>
                </div>
                {openAccordions["p12-t28"] && (
                  <div className="bg-slate-50/20 p-6 border-t border-slate-100 space-y-4 text-xs font-bold text-slate-700">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 mb-2">
                      💡 <strong>DOUBLE ÉTANCHÉITÉ :</strong> Le tube d'eau du T28 intègre un presse-étoupe à double joint torique à l'arrière. Remplacer les joints à chaque démontage.
                    </div>
                    {[
                      "Couper l'alimentation du réseau d'eau souterrain.",
                      "Démonter le flexible d'alimentation d'eau de 1/2\" raccordé au backhead.",
                      "Dévisser le raccord porte-tube d'eau central à l'arrière du perforateur.",
                      "Tirer fermement et horizontalement pour extraire le tube d'eau usé.",
                      "Lubrifier les deux nouveaux joints toriques d'étanchéité à l'huile lubrifiante.",
                      "Insérer le nouveau tube d'eau en inox d'origine dans le canal interne.",
                      "Serrer fermement le raccord en laiton à un couple modéré de 18 Nm."
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
              <div id="proc-mandrin-t28" className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs scroll-mt-20">
                <div onClick={() => toggleAccordion("p13-t28")} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {openAccordions["p13-t28"] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs font-black text-slate-800 uppercase">[PROCÉDURE 3] Remplacement de la bague et douille de mandrin (Chuck Bushing)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-2 py-0.5">~45 MIN</span>
                    <span className="text-[9px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">PRESSE ATELIER</span>
                  </div>
                </div>
                {openAccordions["p13-t28"] && (
                  <div className="bg-slate-50/20 p-6 border-t border-slate-100 space-y-4 text-xs font-bold text-slate-700">
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 mb-2">
                      ⚠️ <strong>IMPORTANT :</strong> Le T28 transmettant 62 Joules par impact, toute usure du chuck bushing de guidage conduit à une frappe décentrée qui casse irrémédiablement le nez du piston percuteur.
                    </div>
                    {[
                      "Déposer les 4 écrous longitudinaux et retirer les tirants.",
                      "Séparer l'avant-corps du carter-cylindre.",
                      "Extraire l'ensemble porte-mandrin.",
                      "Placer le mandrin sous la presse hydraulique d'atelier.",
                      "Extraire la douille usée à l'aide d'un poussoir au diamètre approprié.",
                      "Nettoyer le logement et presser la nouvelle douille Hex 22 × 108 mm d'origine Montabert.",
                      "Réassembler l'outil en appliquant la procédure de serrage en croix progressive à 135 Nm."
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
