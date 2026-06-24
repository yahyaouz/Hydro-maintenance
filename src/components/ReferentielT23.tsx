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

export function ReferentielT23({ onSelectEngin }: { onSelectEngin: (engin: string) => void }) {
  const [activeSection, setActiveSection] = React.useState("identite-t23");
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

  // --- MENU GAUCHE MONTABERT T23 ---
  const menuGroups: MenuGroup[] = [
    {
      title: "IDENTIFICATION",
      items: [
        { id: "identite-t23", label: "Fiche d'identité technique" }
      ]
    },
    {
      title: "FONCTIONNEMENT",
      items: [
        { id: "specs-mecaniques", label: "Caractéristiques de frappe" },
        { id: "consommation-air", label: "Consommation d'air & eau" }
      ]
    },
    {
      title: "CIRCUITS ET SCHÉMA",
      items: [
        { id: "schema-interactif-t23", label: "Schéma interne T23 (SVG)" }
      ]
    },
    {
      title: "LUBRIFICATION EN LIGNE",
      items: [
        { id: "graisseur-fluide", label: "Système de graissage BL-80" },
        { id: "plan-entretien-t23", label: "Plan d'entretien périodique" }
      ]
    },
    {
      title: "DIAGNOSTIC DE PANNES",
      items: [
        { id: "diagnostic-t23", label: "Pannes du perforateur T23" }
      ]
    },
    {
      title: "PROCÉDURES ATELIER",
      items: [
        { id: "proc-tirants", label: "Serrage des tirants d'assemblage" },
        { id: "proc-tube-eau", label: "Remplacement du tube d'eau" },
        { id: "proc-mandrin", label: "Remplacement du mandrin" }
      ]
    }
  ];

  // --- DATA STRUCTURES FOR T23 ---
  const generalIdentiteT23 = [
    { label: "Désignation officielle", val: "Montabert T23 (Perforateur pneumatique sur poussoir)" },
    { label: "Constructeur", val: "Montabert S.A. (Saint-Priest, France)" },
    { label: "Type d'outil", val: "Marteau perforateur pneumatique à rotation automatique" },
    { label: "Poids en service", val: "23 kg (Léger de haute performance)" },
    { label: "Longueur totale", val: "665 mm" },
    { label: "Largeur du corps", val: "245 mm" },
    { label: "Emmanchement standard", val: "Hex 22 × 108 mm (7/8\" × 4 1/4\")" },
    { label: "Alimentation air", val: "Raccord 1\" BSP (Flexible DN 25)" },
    { label: "Alimentation eau (insufflation)", val: "Raccord 1/2\" BSP (Flexible DN 13)" }
  ];

  const specsFrappeT23 = [
    { label: "Pression d'air de service", val: "5.0 – 6.0 bar (Pression nominale : 5.5 bar)" },
    { label: "Fréquence de percussion à 5 bar", val: "2 150 coups/minute" },
    { label: "Fréquence de percussion à 6 bar", val: "2 300 coups/minute" },
    { label: "Énergie d'impact par coup", val: "45 Joules (à 5.0 bar)" },
    { label: "Vitesse de rotation nominale", val: "180 – 220 tours/minute" },
    { label: "Mécanisme de rotation", val: "Rifle Bar (Roue à rochets interne et 4 cliquets)" },
    { label: "Sens de rotation", val: "Anti-horaire (à gauche vu de l'arrière)" },
    { label: "Diamètre de forage optimal", val: "Ø 32 mm – Ø 45 mm (Max : 51 mm)" },
    { label: "Profondeur de forage utile max", val: "3.20 mètres" }
  ];

  const fluidesT23 = [
    { label: "Consommation d'air à 5 bar", val: "3.6 m³/minute (60 L/s)" },
    { label: "Consommation d'air à 6 bar", val: "4.2 m³/minute (70 L/s)" },
    { label: "Fluide d'insufflation (flushing)", val: "Eau sous pression (évacuation des boues)" },
    { label: "Pression d'eau recommandée", val: "4.0 – 5.0 bar (S'assurer : P_eau = P_air - 1 bar)" },
    { label: "Débit d'eau d'insufflation minimal", val: "6.0 Litres/minute" },
    { label: "Type d'injecteur", val: "Tube d'eau central inoxydable (Flushing Tube)" }
  ];

  const diagnosticListT23: DiagItem[] = [
    {
      id: "d1",
      title: "Le perforateur refuse de démarrer (Aucun mouvement)",
      sev: "CRITIQUE",
      causes: [
        "Pression d'air au réseau trop basse (< 4 bar) -> Vérifier le compresseur et le diamètre des flexibles.",
        "Distributeur d'air (valve oscillante) bloqué par de l'eau, de la calamine ou des résidus d'huile séchée -> Ouvrir la valve, nettoyer au gasoil pur et lubrifier.",
        "Piston de percussion grippé dans le cylindre dû à une absence totale de lubrification -> Inspecter les rayures profondes sur le piston. Remplacement requis si grippé.",
        "Tirants latéraux serrés de manière inégale, créant un désalignement interne -> Desserrer et procéder au resserrage progressif en croix au couple correct (110-120 Nm)."
      ]
    },
    {
      id: "d2",
      title: "Frappe faible, cadence lente (Impact mou)",
      sev: "ATTENTION",
      causes: [
        "Échappement d'air obstrué par la formation de glace -> Phénomène de givrage dû à de l'air comprimé trop humide. Purger les séparateurs d'eau du réseau.",
        "Usure critique du piston percuteur ou du cylindre (fuite d'air interne) -> Mesurer le diamètre du piston (limite d'usure tolérée : -0.05 mm max).",
        "Pression d'air insuffisante à l'entrée du perforateur -> Perte de charge importante si le flexible d'alimentation d'air fait plus de 15 mètres sans section adaptée (1\" requis).",
        "Graisseur de ligne bouché ou mal réglé -> L'huile n'est plus pulvérisée, augmentant les frictions internes."
      ]
    },
    {
      id: "d3",
      title: "Le taillant tourne par saccades ou est bloqué",
      sev: "CRITIQUE",
      causes: [
        "Cliquets de rotation brisés ou usés au niveau de la tête de rifle bar -> Remplacer le jeu de 4 cliquets et leurs ressorts internes.",
        "Cannelures de la bague de mandrin (chuck insert) ou de l'arbre hélicoïdal complètement usées -> Remplacement des pièces usées.",
        "Taillant de forage coincé dans une fracture ou une faille rocheuse -> Reculer le perforateur prudemment en activant la rotation assistée."
      ]
    },
    {
      id: "d4",
      title: "Fuite d'eau continue ou eau présente dans l'échappement",
      sev: "CRITIQUE",
      causes: [
        "Tube d'eau central (flushing tube) fissuré ou cassé par fatigue vibratoire -> Remplacer immédiatement le tube d'eau pour éviter la corrosion interne.",
        "Joints d'étanchéité en caoutchouc du tube d'eau détruits -> Installer des joints neufs lors de chaque démontage périodique.",
        "Pression d'eau supérieure à la pression d'air -> L'eau pénètre de force dans le cylindre. La pression d'eau d'insufflation doit TOUJOURS être inférieure de 1 bar à celle de l'air."
      ]
    },
    {
      id: "d5",
      title: "Échauffement anormal de l'avant-corps (Fronthead)",
      sev: "ATTENTION",
      causes: [
        "Manque critique d'huile de lubrification -> Remplir le graisseur de ligne et vérifier l'ouverture de la vis pointeau.",
        "Longueur d'emmanchement du fleuret non conforme (inférieure à 108 mm) -> Le piston frappe directement le mandrin au lieu de la collerette du fleuret.",
        "Douille de mandrin (chuck bushing) usée créant un jeu excessif et des impacts excentrés -> Remplacer la douille."
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
            className="h-10 px-5 rounded-lg font-black text-xs uppercase tracking-wider transition-all bg-amber-500 text-white shadow-xs cursor-pointer"
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
                <span>Notice Importante</span>
              </div>
              <p className="font-semibold">
                La maintenance du Montabert T23 exige une propreté rigoureuse. L'air comprimé doit être exempt de condensation d'eau et de calamine.
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
                    Montabert T23
                  </span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Marteau perforateur pneumatique léger 23 kg · Forage sur poussoir et boulonnage
                </p>
              </div>

              <div className="lg:col-span-3 p-6 flex flex-col justify-center items-center lg:items-end gap-1.5">
                <HydrominesLogo size={120} variant="full" className="mb-2" />
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50/80 border border-amber-200/30 rounded-md">
                  <span className="w-1.5 h-1.5 bg-[#b8860b] rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold tracking-wider uppercase text-[#b8860b]">MATÉRIEL ACTIF (T23)</span>
                </div>
                <div className="px-3 py-1 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-lg text-xs font-black text-[#ffd700] shadow-md uppercase tracking-widest">
                  MONTABERT T23
                </div>
              </div>

            </div>
          </div>

          {/* --- FICHE D'IDENTITE TECHNIQUE --- */}
          <section id="identite-t23" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Settings className="w-4 h-4" /></span>
              Fiche d'identité technique générale
            </h2>
            
            <div className="p-4 bg-amber-50/60 border border-amber-200/50 rounded-xl text-xs text-amber-900 leading-relaxed font-bold">
              📢 Le Montabert T23 est un perforateur pneumatique léger de <strong>23 kg</strong>. Il est spécialement optimisé pour le forage manuel sur poussoir pneumatique (airleg) ou sur colonne dans les chantiers de mines souterraines difficiles d'accès, combinant une puissance de percussion élevée et une excellente vitesse de rotation.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Caractéristiques Générales</h3>
                {generalIdentiteT23.map((item) => (
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
                    <p><span className="text-slate-900">Rapport Poids/Puissance exceptionnel :</span> Pesant exactement 23 kg, il minimise la fatigue des mineurs lors du positionnement.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p><span className="text-slate-900">Mécanisme de rotation par cliquets (Rifle Bar) :</span> Assure un couple de rotation constant même dans les formations géologiques fracturées.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p><span className="text-slate-900">Insufflation efficace :</span> Le tube d'eau central évite l'émanation de poussières de silice (silicose) en rabattant la poussière sous forme de boues liquides.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p><span className="text-slate-900">Maintenance simplifiée :</span> Assemblé par seulement 4 tirants longitudinaux, permettant un démontage rapide en atelier de mine.</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* --- CARACTERISTIQUES DE FRAPPE --- */}
          <section id="specs-mecaniques" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Gauge className="w-4 h-4" /></span>
              Caractéristiques mécaniques et de percussion
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Spécifications Mécaniques</h3>
                {specsFrappeT23.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider">Comportement en forage de roche</h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-3 font-bold leading-relaxed">
                  <div className="flex items-center gap-1.5 text-slate-900 font-extrabold">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>RÉGLAGES ET COMPRESSIONS</span>
                  </div>
                  <p>
                    Le perforateur T23 fonctionne de manière optimale entre 5.0 et 5.5 bar réels au raccord du marteau. Une baisse de pression à 4.0 bar diminue la vitesse d'avancement de plus de 40%.
                  </p>
                  <p>
                    La rotation à gauche (anti-horaire) impose d'utiliser exclusivement des fleurets munis de filetages correspondants afin de ne pas desserrer les raccords en cours de forage.
                  </p>
                  <p>
                    S'assurer que la collerette du fleuret repose parfaitement à plat sur le mandrin : le piston percuteur transmet l'impact de manière directe, tout angle anormal accélère l'écaillage de la face du piston.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* --- CONSOMMATION COMPRESSÉE AIR / EAU --- */}
          <section id="consommation-air" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Droplets className="w-4 h-4" /></span>
              Consommations et exigences en Fluides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider mb-3">Alimentation en Fluides</h3>
                {fluidesT23.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-100 py-2.5 text-xs">
                    <span className="font-bold text-slate-500">{item.label}</span>
                    <span className="font-black text-slate-800 text-right">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-red-700 tracking-wider">⚠️ RÈGLE D'OR : ÉVITER LES RETOURS D'EAU</h3>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    Dans un perforateur pneumatique souterrain, la pression de l'eau d'insufflation (flushing) ne doit <strong>jamais</strong> dépasser la pression d'air comprimé de fonctionnement.
                  </p>
                  <div className="p-3.5 bg-red-50/55 border border-red-200 rounded-xl text-[11px] font-bold text-red-900 leading-relaxed">
                    Si la pression d'eau est supérieure, l'eau va traverser l'injecteur central et refluer à l'intérieur du cylindre du perforateur. Cela détruit le film d'huile de lubrification, entraînant un grippage immédiat du piston percuteur et des cliquets de rotation.
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider text-center">
                  Règle d'exploitation : P_eau = P_air - 1.0 bar
                </div>
              </div>

            </div>
          </section>

          {/* --- SCHEMA INTERACTIF TECHNIQUE T23 --- */}
          <section id="schema-interactif-t23" className="scroll-mt-20 space-y-6">
            <div className="border-b border-slate-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><BookOpen className="w-4 h-4" /></span>
                Schéma technique interne interactif — Montabert T23
              </h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/50">
                SCHÉMATIQUE INTERNE AVEC BULLES INFO
              </span>
            </div>

            <p className="text-xs font-bold text-slate-600 leading-relaxed">
              Passez votre curseur (sur ordinateur) ou touchez les zones interactives ci-dessous pour inspecter les organes internes essentiels du perforateur pneumatique Montabert T23.
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
                  onMouseEnter={() => handleComponentHover("chuck", "Mandrin de rotation & Chuck bushing : Contient l'emmanchement Hex 22 × 108 mm. Reçoit directement les chocs du piston percuteur et transmet le couple de rotation au fleuret de forage.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="120" y="70" width="100" height="100" rx="4" fill={hoveredComponent === "chuck" ? "#d97706" : "#334155"} stroke="#475569" strokeWidth="2" className="transition-all" />
                  <rect x="80" y="85" width="40" height="70" rx="3" fill={hoveredComponent === "chuck" ? "#b45309" : "#1e293b"} stroke="#475569" strokeWidth="2" className="transition-all" />
                  <text x="140" y="125" fill="#f8fafc" className="text-[10px] font-mono font-black" textAnchor="middle">MANDRIN</text>
                  <text x="140" y="140" fill="#fbbf24" className="text-[8px] font-mono font-extrabold" textAnchor="middle">HEX 22×108</text>
                  <circle cx="170" cy="120" r="16" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-pulse" />
                </g>

                {/* 2. PISTON PERCUTEUR (PISTON) */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("piston", "Piston percuteur (masse de frappe) : Partie mobile effectuant des allers-retours à haute vitesse pour frapper le fleuret de forage à une cadence de 2150 à 2300 coups par minute.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="230" y="75" width="160" height="90" rx="4" fill={hoveredComponent === "piston" ? "#d97706" : "#475569"} stroke="#64748b" strokeWidth="2" className="transition-all" />
                  {/* Cannelures internes */}
                  <line x1="250" y1="90" x2="350" y2="90" stroke="#fbbf24" strokeWidth="2" />
                  <line x1="250" y1="150" x2="350" y2="150" stroke="#fbbf24" strokeWidth="2" />
                  <text x="310" y="125" fill="#f8fafc" className="text-[11px] font-mono font-black" textAnchor="middle">PISTON PERCUTEUR</text>
                  <circle cx="310" cy="120" r="18" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-pulse" />
                </g>

                {/* 3. DISTRIBUTEUR D'AIR (VALVE) */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("valve", "Distributeur automatique (valve oscillante) : Valve à clapet de précision qui distribue l'air sous pression de manière alternée à l'avant et à l'arrière du piston percuteur.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="400" y="55" width="80" height="40" rx="3" fill={hoveredComponent === "valve" ? "#d97706" : "#334155"} stroke="#475569" strokeWidth="2" className="transition-all" />
                  <text x="440" y="78" fill="#f8fafc" className="text-[9px] font-mono font-black" textAnchor="middle">DISTRIBUTEUR</text>
                  <circle cx="440" cy="75" r="12" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-pulse" />
                </g>

                {/* 4. BARRE HELICOIDALE / ARBRE DE ROTATION (RIFLE BAR) */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("rifle-bar", "Barre hélicoïdale (Rifle Bar) & Roue à rochets : Assure la rotation pas-à-pas du fleuret. Le piston coulisse sur les cannelures de la rifle bar, ce qui force sa rotation à chaque course de retour.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="400" y="105" width="180" height="30" rx="2" fill={hoveredComponent === "rifle-bar" ? "#d97706" : "#1e293b"} stroke="#475569" strokeWidth="1.5" className="transition-all" />
                  <path d="M 520 105 L 560 120 L 520 135 Z" fill="#64748b" />
                  <text x="490" y="124" fill="#f8fafc" className="text-[9px] font-mono font-black" textAnchor="middle">RIFLE BAR</text>
                  <circle cx="490" cy="120" r="14" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-pulse" />
                </g>

                {/* 5. TUBE D'EAU CENTRAL (FLUSHING TUBE) */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("flushing-tube", "Tube d'insufflation central (Flushing tube) : Tube métallique inoxydable fin traversant tout le marteau de l'arrière vers l'avant. Il achemine l'eau d'insufflation directement dans le fleuret de forage.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="100" y="117" width="600" height="6" fill={hoveredComponent === "flushing-tube" ? "#38bdf8" : "#0284c7"} className="transition-all" />
                  <text x="640" y="112" fill="#38bdf8" className="text-[8px] font-mono font-black" textAnchor="middle">TUBE D'EAU</text>
                  <circle cx="590" cy="120" r="10" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="animate-pulse" />
                </g>

                {/* 6. TIRANTS D'ASSEMBLAGE (SIDE RODS) */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("side-rods", "Tirants d'assemblage longitudinaux : Les 4 tirants d'acier traversant tout le perforateur. Ils doivent être serrés uniformément en croix à un couple précis de 110-120 Nm.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="110" y="40" width="560" height="8" rx="2" fill={hoveredComponent === "side-rods" ? "#d97706" : "#334155"} stroke="#475569" strokeWidth="1" className="transition-all" />
                  <rect x="110" y="192" width="560" height="8" rx="2" fill={hoveredComponent === "side-rods" ? "#d97706" : "#334155"} stroke="#475569" strokeWidth="1" className="transition-all" />
                  <text x="390" y="47" fill="#f8fafc" className="text-[8px] font-mono font-bold" textAnchor="middle">TIRANT D'ASSEMBLAGE SUPÉRIEUR</text>
                  <circle cx="390" cy="44" r="10" fill="none" stroke="#fbbf24" strokeWidth="1" className="animate-pulse" />
                </g>

                {/* 7. ADMISSION AIR & EAU [BACK] */}
                <g 
                  className="cursor-pointer group" 
                  onMouseEnter={() => handleComponentHover("inlets", "Raccords arrière (Backhead) : Entrées d'air comprimé (1\" BSP) et d'eau sous pression (1/2\" BSP) reliés au réseau de la galerie souterraine.")} 
                  onMouseLeave={clearHover}
                >
                  <rect x="590" y="60" width="110" height="120" rx="4" fill={hoveredComponent === "inlets" ? "#d97706" : "#1e293b"} stroke="#475569" strokeWidth="2" className="transition-all" />
                  <rect x="700" y="75" width="30" height="25" rx="2" fill="#334155" stroke="#475569" />
                  <rect x="700" y="130" width="30" height="20" rx="2" fill="#0284c7" stroke="#475569" />
                  <text x="645" y="90" fill="#f8fafc" className="text-[8px] font-mono font-black" textAnchor="middle">AIR INLET 1\"</text>
                  <text x="645" y="150" fill="#38bdf8" className="text-[8px] font-mono font-black" textAnchor="middle">WATER INLET 1/2\"</text>
                  <circle cx="680" cy="110" r="14" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-pulse" />
                </g>
              </svg>

              {/* Affichage des explications dynamiques au survol */}
              <div className="w-full mt-4 bg-slate-900 border border-slate-800 rounded-xl p-4 min-h-[75px] flex items-center justify-center text-center">
                {hoveredTooltip ? (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest">
                      Composant interne inspecté
                    </div>
                    <p className="text-xs font-bold text-slate-200 leading-relaxed max-w-2xl">
                      {hoveredTooltip}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Survolez un organe interne du Montabert T23 pour afficher sa fiche technique
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* --- GRAISSEUR DE LIGNE BL-80 ET LUBRIFICATION --- */}
          <section id="graisseur-fluide" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Droplets className="w-4 h-4" /></span>
              Système de lubrification — Graisseur de ligne BL-80
            </h2>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed font-bold space-y-2">
              <p>
                📢 Un perforateur pneumatique T23 ne possède <strong>aucun réservoir d'huile interne</strong>. Sa lubrification est assurée de manière continue par un <strong>graisseur de ligne (modèle BL-80 d'une capacité de 1.5 L)</strong> placé sur l'alimentation d'air comprimé, au maximum à 3.0 mètres du perforateur.
              </p>
              <p>
                L'huile est micronisée et transportée par l'air sous pression directement dans le marteau pour protéger les pièces mobiles à haute friction (piston, bague, rifle bar).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider">Spécifications Huile Recommandée</h3>
                <div className="space-y-2.5 text-xs text-slate-700 font-bold">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Grade hiver ou galeries froides</span>
                    <span className="text-slate-950">ISO VG 100</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Grade été ou chantiers chauds</span>
                    <span className="text-slate-950">ISO VG 150</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Additifs obligatoires</span>
                    <span className="text-amber-700">Extrême Pression (EP) & Émulsion</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Consommation de lubrifiant</span>
                    <span className="text-slate-950">~0.15 Litre / Heure</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span>Capacité du graisseur BL-80</span>
                    <span className="text-slate-950">1.5 Litres (autonomie ~1 poste)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-amber-700 tracking-wider">Réglage de la Vis Pointeau</h3>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  Le débit d'huile du graisseur BL-80 se règle via une vis pointeau interne réglable.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xxs font-mono font-bold text-amber-900 leading-normal">
                  📌 CRITÈRE DE BON RÉGLAGE :
                  <br />- Un léger brouillard huileux doit être visible à l'échappement d'air du perforateur.
                  <br />- L'emmanchement du fleuret de forage (Hex 22) doit toujours être recouvert d'un mince film d'huile propre et ne doit jamais apparaître sec ou brûlé.
                </div>
              </div>

            </div>
          </section>

          {/* --- PLAN D'ENTRETIEN PERIODIQUE T23 --- */}
          <section id="plan-entretien-t23" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Clock className="w-4 h-4" /></span>
              Plan d'entretien préventif périodique — Montabert T23
            </h2>

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Intervalle</th>
                    <th className="p-4">Opérations de maintenance obligatoires</th>
                    <th className="p-4">Intervenant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                  <tr>
                    <td className="p-4 text-amber-700 font-extrabold">CHAQUE POSTE (8h)</td>
                    <td className="p-4 space-y-1">
                      <p>• Remplir de lubrifiant ISO VG 100/150 le graisseur de ligne BL-80.</p>
                      <p>• Purger l'eau condensée des réservoirs d'air comprimé du compresseur.</p>
                      <p>• Contrôler visuellement l'absence de fuite sur les flexibles d'air (1\") et d'eau (1/2\").</p>
                      <p>• Vérifier que l'insufflation d'eau (flushing) fonctionne correctement à vide.</p>
                    </td>
                    <td className="p-4 text-slate-500">Foreur / Mineur</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-amber-700 font-extrabold">QUOTIDIEN (8h)</td>
                    <td className="p-4 space-y-1">
                      <p>• Contrôler l'état et le serrage des 4 tirants d'assemblage longitudinaux (resserrer à 115 Nm au besoin).</p>
                      <p>• Nettoyer l'emmanchement du perforateur et inspecter l'absence de fissures sur l'avant-corps.</p>
                    </td>
                    <td className="p-4 text-slate-500">Foreur / Mineur</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-amber-700 font-extrabold">HEBDOMADAIRE (50h)</td>
                    <td className="p-4 space-y-1">
                      <p>• Mesurer le jeu d'usure de la douille de mandrin (chuck bushing) à l'aide d'un calibre.</p>
                      <p>• Remplacer la douille de mandrin si le jeu diagonal dépasse la limite d'usure de 1.5 mm.</p>
                    </td>
                    <td className="p-4 text-amber-700">Mécanicien Mine</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-amber-700 font-extrabold">MENSUEL (200h)</td>
                    <td className="p-4 space-y-1">
                      <p>• Démonter le fond arrière (backhead) pour inspecter l'état de la rifle bar et des 4 cliquets de rotation.</p>
                      <p>• Remplacer systématiquement les joints toriques d'étanchéité du tube d'eau central.</p>
                      <p>• Vérifier l'état du ressort de cliquet et de la roue à rochet interne.</p>
                    </td>
                    <td className="p-4 text-amber-700">Mécanicien Mine</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-amber-700 font-extrabold">TRIMESTRIEL (600h)</td>
                    <td className="p-4 space-y-1">
                      <p>• Démontage intégral du perforateur en atelier pour examen complet d'usure (Métrologie).</p>
                      <p>• Remplacer l'ensemble des 4 tirants d'assemblage et leurs écrous (remplacement préventif de fatigue métallique).</p>
                      <p>• Mesurer le jeu entre le piston percuteur et le cylindre (limite critique : 0.08 mm).</p>
                    </td>
                    <td className="p-4 text-red-700">Atelier Spécialisé</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* --- DIAGNOSTIC DE PANNES T23 --- */}
          <section id="diagnostic-t23" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><AlertTriangle className="w-4 h-4" /></span>
              Diagnostic de pannes — Perforateur Montabert T23
            </h2>

            <div className="space-y-3">
              {diagnosticListT23.map((diag) => (
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

          {/* --- PROCEDURES DE MAINTENANCE PAS-A-PAS --- */}
          <section id="proc-tirants" className="scroll-mt-20 space-y-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-950 flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Wrench className="w-4 h-4" /></span>
              Procédures de maintenance d'atelier & terrain (Montabert T23)
            </h2>

            <div className="space-y-4">
              
              {/* PROCEDURE 1 */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div onClick={() => toggleAccordion("p11")} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {openAccordions["p11"] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs font-black text-slate-800 uppercase">[PROCÉDURE 1] Contrôle et resserrage des 4 tirants d'assemblage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-2 py-0.5">~15 MIN</span>
                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">MINEUR / MECANO</span>
                  </div>
                </div>
                {openAccordions["p11"] && (
                  <div className="bg-slate-50/20 p-6 border-t border-slate-100 space-y-4 text-xs font-bold text-slate-700">
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 mb-2">
                      ⚠️ <strong>SÉCURITÉ ET RISQUE TECHNIQUE :</strong> Un serrage asymétrique des tirants latéraux engendre une déformation micrométrique du cylindre. Cela peut provoquer le blocage ou la rupture nette du piston percuteur à haut régime !
                    </div>
                    {[
                      "Arrêter le perforateur et débrancher le flexible d'alimentation d'air comprimé 1\".",
                      "Nettoyer soigneusement les filetages extérieurs des 4 tirants et les écrous à l'aide d'une brosse métallique.",
                      "À l'aide d'une clé dynamométrique appropriée, approcher d'abord chaque écrou à la main.",
                      "Procéder au serrage progressif en croix (tirant 1, puis 3, puis 2, puis 4) par paliers successifs de 40 Nm, puis 80 Nm.",
                      "Effectuer le serrage final de précision de chaque tirant au couple de 110 – 120 Nm.",
                      "S'assurer après serrage que le mandrin de rotation (avant) tourne toujours librement à la main."
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
              <div id="proc-tube-eau" className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs scroll-mt-20">
                <div onClick={() => toggleAccordion("p12")} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {openAccordions["p12"] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs font-black text-slate-800 uppercase">[PROCÉDURE 2] Remplacement préventif du tube d'eau d'insufflation (Flushing Tube)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-2 py-0.5">~30 MIN</span>
                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">MÉCANICIEN</span>
                  </div>
                </div>
                {openAccordions["p12"] && (
                  <div className="bg-slate-50/20 p-6 border-t border-slate-100 space-y-4 text-xs font-bold text-slate-700">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 mb-2">
                      💡 <strong>IMPORTANT :</strong> Le tube d'eau central (inoxydable) subit de fortes contraintes de fatigue et d'érosion chimique par l'eau souterraine. Remplacer préventivement en cas de traces d'usure ou d'infiltration d'eau dans le carter d'air.
                    </div>
                    {[
                      "Couper l'arrivée d'eau et purger le flexible d'eau (1/2\") avant intervention.",
                      "Démonter le raccord d'alimentation d'eau situé à l'arrière de la tête du perforateur (Backhead).",
                      "Dévisser le presse-étoupe en laiton maintenant l'arrière du tube d'eau.",
                      "Tirer délicatement le tube d'insufflation d'eau usagé vers l'arrière pour l'extraire complètement du canal du piston.",
                      "Inspecter visuellement l'usure de l'extrémité avant du tube (par où l'eau est injectée).",
                      "Prendre un tube d'eau neuf d'origine Montabert. Installer un jeu de joints toriques d'étanchéité neufs sur l'embase arrière.",
                      "Lubrifier légèrement les nouveaux joints toriques à l'huile pneumatique.",
                      "Introduire délicatement le tube d'eau neuf par l'arrière du perforateur, en veillant à ne pas endommager les filetages ou blesser les joints.",
                      "Pousser le tube jusqu'à sa butée arrière, revisser le presse-étoupe en laiton et serrer modérément au couple de 15 Nm.",
                      "Reconnecter le raccord d'alimentation d'eau et tester l'étanchéité en injectant de l'eau à vide."
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
              <div id="proc-mandrin" className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs scroll-mt-20">
                <div onClick={() => toggleAccordion("p13")} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {openAccordions["p13"] ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs font-black text-slate-800 uppercase">[PROCÉDURE 3] Remplacement de la douille de mandrin usée (Chuck Bushing)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-50 border border-slate-150 rounded px-2 py-0.5">~40 MIN</span>
                    <span className="text-[9px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">QUALIFIÉ</span>
                  </div>
                </div>
                {openAccordions["p13"] && (
                  <div className="bg-slate-50/20 p-6 border-t border-slate-100 space-y-4 text-xs font-bold text-slate-700">
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-800 mb-2">
                      ⚠️ <strong>RISQUE CASSE PISTON :</strong> Une douille de mandrin usée permet à l'emmanchement du fleuret de se positionner de biais. Le piston percuteur frappe alors de façon excentrée sur le fleuret, ce qui provoque la rupture par éclatement de la face de frappe du piston !
                    </div>
                    {[
                      "Déposer les 4 tirants longitudinaux d'assemblage en desserrant progressivement les écrous.",
                      "Séparer l'avant-corps (Fronthead) du corps cylindrique du perforateur à l'aide d'un maillet doux.",
                      "Extraire le mandrin de rotation hors de l'avant-corps.",
                      "À l'aide d'un jet de bronze et d'une presse d'atelier, chasser la douille de mandrin (chuck bushing) usée hors du mandrin.",
                      "Nettoyer minutieusement le logement interne du mandrin et inspecter l'absence de microfissures.",
                      "Présenter la nouvelle douille de mandrin d'origine Montabert (Hex 22 × 108 mm).",
                      "À l'aide de la presse hydraulique, emmancher la nouvelle douille en veillant à son parfait alignement axial.",
                      "Remonter le mandrin de rotation à l'intérieur de l'avant-corps, en appliquant un film d'huile pneumatique sur les cannelures externes.",
                      "Réassembler l'avant-corps sur le bloc-cylindres.",
                      "Remonter les 4 tirants et serrer les écrous en croix selon la procédure réglementaire de serrage progressif (Couple final : 115 Nm)."
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
