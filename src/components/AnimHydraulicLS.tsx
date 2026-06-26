import * as React from "react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface PartDetail {
  id: string;
  name: string;
  ref: string;
  material: string;
  spec: string;
  failure: string;
  x: number;
  y: number;
  r: number;
}

const PARTS_DATA: Record<string, PartDetail> = {
  pompe: {
    id: "pompe",
    name: "Pompe Rexroth A10VO71DFR",
    ref: "Epiroc 3222312015",
    material: "Corps fonte à graphite sphéroïdal / Pistons acier nitruré",
    spec: "Cylindrée : 71 cm³/tr | Pression max : 280 bar | Débit nominal : 145 L/min",
    failure: "Usure de la plaque de distribution ou des patins de pistons, provoquant une perte de rendement volumétrique.",
    x: 180,
    y: 350,
    r: 35
  },
  distributeur: {
    id: "distributeur",
    name: "Distributeur Principal Load Sensing",
    ref: "Epiroc 3128315100",
    material: "Corps en fonte alliée à haute résistance / Tiroirs rectifiés",
    spec: "Pression d'attente (Stand-by) : 22 bar | Pilotage proportionnel",
    failure: "Grippage thermique d'un tiroir ou rupture des ressorts de rappel de tiroir.",
    x: 380,
    y: 250,
    r: 40
  },
  verin_direction: {
    id: "verin_direction",
    name: "Vérins de Direction G/D",
    ref: "Epiroc 3128312001",
    material: "Tige en acier C45 chromé dur épaisseur 50 µm / Tube étiré",
    spec: "Alésage : 80 mm | Tige : 45 mm | Course : 320 mm",
    failure: "Fuite externe importante au niveau des joints de tige (presse-étoupe) due à de la poussière abrasive.",
    x: 520,
    y: 110,
    r: 30
  },
  verin_hoist: {
    id: "verin_hoist",
    name: "Vérins de Levage Flèche (Hoist)",
    ref: "Epiroc 3128313010",
    material: "Acier soudé haute performance, joints basse friction PTFE",
    spec: "Alésage : 125 mm | Tige : 70 mm | Capacité levage : 12 Tonnes",
    failure: "Rayures profondes du fût de vérin par pollution hydraulique entraînant un by-pass interne.",
    x: 620,
    y: 240,
    r: 35
  },
  verin_dump: {
    id: "verin_dump",
    name: "Vérin de Benne (Dump)",
    ref: "Epiroc 3128314050",
    material: "Acier à haute limite élastique",
    spec: "Alésage : 140 mm | Force poussée : 220 kN",
    failure: "Flambement de la tige ou endommagement de la tête de vérin par un choc de roche.",
    x: 620,
    y: 370,
    r: 30
  },
  accumulateur: {
    id: "accumulateur",
    name: "Accumulateur de Piston SAHR/Freins",
    ref: "Epiroc 3128212354",
    material: "Coquille acier forgé monobloc sans soudure",
    spec: "Volume : 4.0 Litres | Précharge Azote N₂ : 85 bar à 20°C",
    failure: "Dégonflage ou rupture de la membrane élastomère séparant l'azote de l'huile hydraulique.",
    x: 350,
    y: 420,
    r: 25
  },
  reservoir: {
    id: "reservoir",
    name: "Réservoir Hydraulique Principal 115L",
    ref: "Epiroc 3128456200",
    material: "Alimenté en aluminium anticorrosion soudé TIG",
    spec: "Capacité : 115 Litres | Filtre à air respirateur 3 µm intégré",
    failure: "Contamination de l'huile par condensation interne d'eau ou dépôts de boues au fond du réservoir.",
    x: 180,
    y: 470,
    r: 40
  },
  capteurs: {
    id: "capteurs",
    name: "Capteurs de Pression & Débit (RCS)",
    ref: "Epiroc 3128300050",
    material: "Puce silicone piézo-résistive, boîtier inox hermétique IP69K",
    spec: "Signal de sortie : 4-20 mA | Plage : 0 - 400 bar | Erreur : < 0.25%",
    failure: "Perte d'étanchéité du connecteur électrique provoquant de fausses alarmes 'Err 04' sur l'écran RCS.",
    x: 230,
    y: 200,
    r: 20
  }
};

const STEPS = [
  { id: 1, title: "01. CIRCUIT AU REPOS", range: [0, 5], desc: "Circuit sous pression d'attente stand-by faible (22 bar). Pompe au repos." },
  { id: 2, title: "02. DÉMARRAGE POMPE REXROTH", range: [5, 15], desc: "Mise en rotation de la pompe A10VO. Circulation lente de l'huile dans le canal central." },
  { id: 3, title: "03. ACTIVATION DIRECTION", range: [15, 25], desc: "Glissement du tiroir de direction. Alimentation en pression de la chambre du vérin de direction gauche." },
  { id: 4, title: "04. ACTIVATION HOIST & BENNE", range: [25, 35], desc: "Débit max dirigé vers les vérins lourds de levage. Compression de l'accumulateur." },
  { id: 5, title: "05. RETOUR NEUTRE ET CHECK", range: [35, 45], desc: "Décharge automatique du signal LS. Validation finale des capteurs de pression." }
];

export function AnimHydraulicLS() {
  const [time, setTime] = React.useState<number>(0); // 0 to 45 seconds
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [hoveredPart, setHoveredPart] = React.useState<string | null>(null);
  const [clickedPart, setClickedPart] = React.useState<string>("pompe");

  // Tick the clock
  React.useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setTime((prev) => {
          if (prev >= 45) {
            return 0;
          }
          return Math.round((prev + 0.5) * 10) / 10;
        });
      }, 500);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentStepObj = STEPS.find(s => time >= s.range[0] && time <= s.range[1]) || STEPS[0];
  const currentStep = currentStepObj.id;

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setTime(0);
    setIsPlaying(false);
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    const nextS = STEPS.find(s => s.id === currentStep + 1);
    if (nextS) {
      setTime(nextS.range[0]);
    } else {
      setTime(0);
    }
  };

  const handleStepPrev = () => {
    setIsPlaying(false);
    const prevS = STEPS.find(s => s.id === currentStep - 1);
    if (prevS) {
      setTime(prevS.range[0]);
    } else {
      setTime(STEPS[STEPS.length - 1].range[0]);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setTime(parseFloat(e.target.value));
  };

  const formatTime = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // State calculations for hydraulic animation:
  // 1. Pump rotation speed
  const pumpIsRotating = time >= 5;
  const pumpRotationSpeed = time >= 25 ? "1.5s" : "3s";

  // 2. Flow speeds (for stroke-dashoffset)
  let flowSpeed = "0s";
  let highPColor = "#1e3a8a"; // Default static dark blue
  if (time >= 5 && time < 15) {
    flowSpeed = "8s";
    highPColor = "#3b82f6"; // standard blue
  } else if (time >= 15 && time < 35) {
    flowSpeed = "4s";
    highPColor = "#ef4444"; // red (high pressure)
  } else if (time >= 35) {
    flowSpeed = "10s";
    highPColor = "#10b981"; // green (operational/nominal)
  }

  // 3. Spool position offset (distributeur)
  let spoolOffset = 0; // -15 (left), 0 (center), 15 (right)
  if (time >= 15 && time < 25) {
    spoolOffset = 18; // Steering position
  } else if (time >= 25 && time < 35) {
    spoolOffset = -18; // Hoist/Dump position
  }

  // 4. Cylinder extensions
  let steeringExtension = 5; // 0 to 40 px
  if (time >= 15 && time < 25) {
    steeringExtension = 5 + ((time - 15) / 10) * 35; // extending left
  } else if (time >= 25) {
    steeringExtension = 40;
  }

  let hoistExtension = 10; // 0 to 50 px
  if (time >= 25 && time < 35) {
    hoistExtension = 10 + ((time - 25) / 10) * 40; // hoist raising
  } else if (time >= 35) {
    hoistExtension = 50;
  }

  let dumpExtension = 5;
  if (time >= 28 && time < 35) {
    dumpExtension = 5 + ((time - 28) / 7) * 45; // dump tilting
  } else if (time >= 35) {
    dumpExtension = 50;
  }

  // 5. Accumulator level
  let accumVolumeY = 415; // 405 (empty) to 430 (full pressure)
  if (time >= 25 && time < 35) {
    accumVolumeY = 405 + ((time - 25) / 10) * 20;
  } else if (time >= 35) {
    accumVolumeY = 425;
  }

  // 6. Pressure Sensor value (RCS)
  let activePressure = 22; // default stand-by
  if (time >= 5 && time < 15) {
    activePressure = 45;
  } else if (time >= 15 && time < 25) {
    activePressure = 180;
  } else if (time >= 25 && time < 35) {
    activePressure = 245;
  } else if (time >= 35) {
    activePressure = 22; // stand-by again
  }

  return (
    <div className="bg-[#0f172a] text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-6">
      
      {/* CSS STYLES FOR ANIMATION EFFECTS */}
      <style>{`
        @keyframes strokeHydraulic {
          to { stroke-dashoffset: -40; }
        }
        @keyframes rotatePump {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .flow-pipe {
          stroke-dasharray: 8, 6;
          animation: strokeHydraulic 2s linear infinite;
        }
        .flow-pipe-fast {
          stroke-dasharray: 8, 6;
          animation: strokeHydraulic 1s linear infinite;
        }
        .pump-gear {
          animation: rotatePump 3s linear infinite;
        }
        .pump-gear-fast {
          animation: rotatePump 1.5s linear infinite;
        }
      `}</style>

      {/* Left interactive drawing */}
      <div className="flex-1 flex flex-col bg-[#050b14] rounded-xl border border-slate-900 relative min-h-[480px]">
        
        {/* Title Overlay */}
        <div className="absolute top-4 left-4 z-10 bg-[#050b14]/90 p-3 rounded border border-blue-500/20 max-w-sm">
          <span className="text-[10px] tracking-wider text-blue-400 font-bold uppercase font-mono">ANIMATION SCHÉMATIQUE 4.2</span>
          <h4 className="text-sm font-bold text-slate-100 font-mono mt-0.5 font-sans">REGULATION LOAD SENSING ST7</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{currentStepObj.desc}</p>
        </div>

        {/* State Tag */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-mono font-bold text-blue-400">{currentStepObj.title}</span>
        </div>

        {/* SVG Render viewport */}
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden" style={{ minHeight: "400px" }}>
          <svg viewBox="0 0 800 550" className="w-full h-full max-h-[450px]">
            {/* Background grid */}
            <g opacity="0.1">
              <pattern id="grid-hydro" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
              </pattern>
              <rect width="800" height="550" fill="url(#grid-hydro)" />
            </g>

            {/* PIPES (TUYAUTERIES HYDRAULIQUES) BACKGROUND AND ACTIVE FLOW */}
            {/* Main high pressure line from pump to spool */}
            <path 
              d="M 180 350 L 180 250 L 320 250" 
              fill="none" 
              stroke={time >= 5 ? highPColor : "#1e3a8a"} 
              strokeWidth="4" 
              className={time >= 5 ? "flow-pipe" : ""}
            />

            {/* Load Sensing pilot line (thinner, dashed) */}
            <path 
              d="M 380 230 L 380 200 L 230 200 L 210 325" 
              fill="none" 
              stroke={time >= 15 ? "#fbbf24" : "#1e293b"} 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
              className={time >= 15 ? "flow-pipe" : ""}
            />

            {/* Steering distribution line G/D */}
            <path 
              d="M 420 240 L 460 240 L 460 110 L 490 110" 
              fill="none" 
              stroke={time >= 15 && time < 25 ? "#ef4444" : "#1e3a8a"} 
              strokeWidth="3.5" 
              className={time >= 15 && time < 25 ? "flow-pipe" : ""}
            />
            <path 
              d="M 420 260 L 450 260 L 450 120 L 530 120" 
              fill="none" 
              stroke={time >= 15 && time < 25 ? "#3b82f6" : "#1e3a8a"} 
              strokeWidth="3.5" 
            />

            {/* Hoist cylinders supply line */}
            <path 
              d="M 420 250 L 580 250 L 580 220 L 600 220" 
              fill="none" 
              stroke={time >= 25 && time < 35 ? "#ef4444" : "#1e3a8a"} 
              strokeWidth="3.5" 
              className={time >= 25 && time < 35 ? "flow-pipe" : ""}
            />

            {/* Dump cylinder supply line */}
            <path 
              d="M 400 270 L 400 370 L 600 370" 
              fill="none" 
              stroke={time >= 28 && time < 35 ? "#ef4444" : "#1e3a8a"} 
              strokeWidth="3.5" 
              className={time >= 28 && time < 35 ? "flow-pipe" : ""}
            />

            {/* Accumulator connection line */}
            <path 
              d="M 350 420 L 350 250" 
              fill="none" 
              stroke={time >= 25 ? "#f59e0b" : "#1e3a8a"} 
              strokeWidth="3" 
            />

            {/* Return-to-tank line to Reservoir */}
            <path 
              d="M 380 270 L 380 470 L 220 470" 
              fill="none" 
              stroke={time >= 5 ? "#3b82f6" : "#1e3a8a"} 
              strokeWidth="4" 
              className={time >= 5 ? "flow-pipe" : ""}
            />


            {/* DRAWING PHYSICAL OBJECTS */}

            {/* 1. RESERVOIR HYDRAULIQUE (Bottom) */}
            <g 
              onClick={() => setClickedPart("reservoir")}
              onMouseEnter={() => setHoveredPart("reservoir")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "reservoir" || clickedPart === "reservoir" ? 1.0 : 0.8}
            >
              <rect x="130" y="440" width="100" height="60" rx="6" fill="#0c162d" stroke={clickedPart === "reservoir" ? "#fbbf24" : "#3b82f6"} strokeWidth="2" />
              {/* Blue fluid level */}
              <rect x="132" y="455" width="96" height="43" rx="2" fill="#3b82f6" opacity="0.4" />
              {/* Internal suction tube */}
              <line x1="160" y1="440" x2="160" y2="485" stroke="#94a3b8" strokeWidth="3" />
              {/* Level indicator bubble */}
              <circle cx="215" cy="470" r="6" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
              <line x1="211" y1="470" x2="219" y2="470" stroke="#10b981" strokeWidth="1" />
              <text x="180" y="525" fill="#3b82f6" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">RESERVOIR 115L</text>
            </g>

            {/* Suction Line pipe */}
            <path d="M 160 440 L 160 380" fill="none" stroke="#3b82f6" strokeWidth="4" />

            {/* 2. POMPE REXROTH A10VO (Swashplate & Gears schematic) */}
            <g 
              onClick={() => setClickedPart("pompe")}
              onMouseEnter={() => setHoveredPart("pompe")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "pompe" || clickedPart === "pompe" ? 1.0 : 0.9}
            >
              <circle cx="180" cy="350" r="32" fill="#111827" stroke={clickedPart === "pompe" ? "#fbbf24" : "#4b5563"} strokeWidth="2.5" />
              {/* Rotating swashplate line */}
              <g transform="translate(180, 350)">
                <g className={pumpIsRotating ? (time >= 25 ? "pump-gear-fast" : "pump-gear") : ""}>
                  <line x1="-25" y1="-8" x2="25" y2="8" stroke="#f59e0b" strokeWidth="3.5" />
                  <circle cx="0" cy="0" r="6" fill="#94a3b8" />
                  {/* Outer rotation arrow */}
                  <path d="M -15 -15 A 20 20 0 0 1 15 -15" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                </g>
              </g>
              {/* Regulator cylinder feedback piston */}
              <rect x="205" y="315" width="22" height="10" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              {/* Feedback piston rod acting on swashplate */}
              <line x1="210" y1="320" x2="190" y2="335" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="110" y="354" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">A10VO POMPE</text>
            </g>

            {/* 3. DISTRIBUTEUR LS (SPOOL BOX - Sliding horizontally) */}
            <g 
              onClick={() => setClickedPart("distributeur")}
              onMouseEnter={() => setHoveredPart("distributeur")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "distributeur" || clickedPart === "distributeur" ? 1.0 : 0.85}
            >
              {/* Spool housing block */}
              <rect x="320" y="220" width="120" height="60" rx="3" fill="#1e293b" stroke={clickedPart === "distributeur" ? "#fbbf24" : "#64748b"} strokeWidth="2.5" />
              
              {/* Sliding Spool Shaft Inside (animated translate X) */}
              <g transform={`translate(${spoolOffset}, 0)`} className="transition-transform duration-500 ease-out">
                {/* Spool central lands */}
                <rect x="330" y="235" width="18" height="30" fill="#f59e0b" opacity="0.9" />
                <rect x="371" y="235" width="18" height="30" fill="#f59e0b" opacity="0.9" />
                <rect x="412" y="235" width="18" height="30" fill="#f59e0b" opacity="0.9" />
                {/* Connecting thin rods */}
                <line x1="320" y1="250" x2="440" y2="250" stroke="#94a3b8" strokeWidth="3" />
              </g>
              {/* Centering spring left */}
              <path d="M 305 250 Q 310 240 315 250 T 320 250" fill="none" stroke="#cbd5e1" strokeWidth="2" />
              {/* Centering spring right */}
              <path d="M 440 250 Q 445 240 450 250 T 455 250" fill="none" stroke="#cbd5e1" strokeWidth="2" />
              
              <text x="380" y="210" fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SPOOL VALVE LS</text>
            </g>

            {/* 4. VERIN DE DIRECTION G/D (Top Right) */}
            <g 
              onClick={() => setClickedPart("verin_direction")}
              onMouseEnter={() => setHoveredPart("verin_direction")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "verin_direction" || clickedPart === "verin_direction" ? 1.0 : 0.85}
            >
              {/* Cylinder tube */}
              <rect x="490" y="95" width="80" height="30" rx="2" fill="#020617" stroke={clickedPart === "verin_direction" ? "#fbbf24" : "#4b5563"} strokeWidth="2" />
              {/* Internal Piston */}
              <rect x={490 + steeringExtension} y="97" width="10" height="26" fill="#fbbf24" />
              {/* Piston Rod (extending to the right) */}
              <rect x={500 + steeringExtension} y="106" width="60" height="8" fill="#94a3b8" />
              {/* Rod end eye */}
              <circle cx={560 + steeringExtension} cy="110" r="6" fill="#cbd5e1" stroke="#475569" />
              <text x="530" y="85" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">DIRECTION G/D</text>
            </g>

            {/* 5. VERIN DE LEVAGE (HOIST - Heavy thick cylinder) */}
            <g 
              onClick={() => setClickedPart("verin_hoist")}
              onMouseEnter={() => setHoveredPart("verin_hoist")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "verin_hoist" || clickedPart === "verin_hoist" ? 1.0 : 0.9}
            >
              {/* Cylinder tube oblique-oriented or simple straight horizontal */}
              <rect x="600" y="200" width="100" height="40" rx="3" fill="#020617" stroke={clickedPart === "verin_hoist" ? "#fbbf24" : "#4b5563"} strokeWidth="2.5" />
              {/* Heavy piston */}
              <rect x={600 + hoistExtension} y="203" width="14" height="34" fill="#fbbf24" />
              {/* Heavy rod */}
              <rect x={614 + hoistExtension} y="213" width="70" height="14" fill="#cbd5e1" />
              {/* Eyelet pin */}
              <circle cx={684 + hoistExtension} cy="220" r="8" fill="#cbd5e1" stroke="#334155" />
              <text x="650" y="190" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">LEVAGE FLÈCHE</text>
            </g>

            {/* 6. VERIN DE BENNE (DUMP - Bottom right) */}
            <g 
              onClick={() => setClickedPart("verin_dump")}
              onMouseEnter={() => setHoveredPart("verin_dump")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "verin_dump" || clickedPart === "verin_dump" ? 1.0 : 0.85}
            >
              <rect x="600" y="345" width="100" height="35" rx="2" fill="#020617" stroke={clickedPart === "verin_dump" ? "#fbbf24" : "#4b5563"} strokeWidth="2" />
              <rect x={600 + dumpExtension} y="348" width="12" height="29" fill="#fbbf24" />
              <rect x={612 + dumpExtension} y="356" width="70" height="12" fill="#94a3b8" />
              <circle cx="682 + dumpExtension" cy="362" r="7" fill="#cbd5e1" />
              <text x="650" y="335" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">BENNE (DUMP)</text>
            </g>

            {/* 7. ACCUMULATEUR DE PRESSION (Gas Bottle) */}
            <g 
              onClick={() => setClickedPart("accumulateur")}
              onMouseEnter={() => setHoveredPart("accumulateur")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "accumulateur" || clickedPart === "accumulateur" ? 1.0 : 0.8}
            >
              {/* Shell contour */}
              <path d="M 335 440 A 15 15 0 0 1 365 440 L 365 390 A 15 15 0 0 1 335 390 Z" fill="#0f172a" stroke={clickedPart === "accumulateur" ? "#fbbf24" : "#f59e0b"} strokeWidth="2" />
              {/* Bladder / Membrane separator line */}
              <line x1="335" y1={accumVolumeY} x2="365" y2={accumVolumeY} stroke="#f59e0b" strokeWidth="2.5" />
              {/* Nitrogen gas chamber hatch N2 */}
              <text x="350" y="380" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">N₂ GAS</text>
              <text x="350" y="430" fill="#3b82f6" fontSize="7" fontFamily="monospace" textAnchor="middle">HUILE</text>
              <text x="350" y="470" fill="#f59e0b" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ACCU AZOTE</text>
            </g>

            {/* 8. PRESSURE SENSORS (RCS MONITOR) */}
            <g 
              onClick={() => setClickedPart("capteurs")}
              onMouseEnter={() => setHoveredPart("capteurs")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "capteurs" || clickedPart === "capteurs" ? 1.0 : 0.9}
            >
              {/* Circle node on pilot line */}
              <circle cx="230" cy="200" r="14" fill="#1e293b" stroke={clickedPart === "capteurs" ? "#fbbf24" : "#3b82f6"} strokeWidth="2" />
              <text x="230" y="204" fill="#3b82f6" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">P</text>
              
              {/* Pressure gauge HUD panel */}
              <g transform="translate(230, 150)">
                <rect x="-35" y="-12" width="70" height="24" rx="4" fill="#020617" stroke="#10b981" strokeWidth="1" />
                <text x="0" y="3" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {activePressure} bar
                </text>
              </g>
              <text x="230" y="130" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">CAPTEUR RCS</text>
            </g>

            {/* Check validation badge on step 5 (35 to 45s) */}
            {time >= 35 && (
              <g transform="translate(400, 360)">
                <circle cx="0" cy="0" r="30" fill="#064e3b" stroke="#10b981" strokeWidth="2" opacity="0.9" />
                <path d="M -12 2 L -3 10 L 12 -7" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
              </g>
            )}

            {/* In-SVG hover tooltip */}
            {hoveredPart && PARTS_DATA[hoveredPart] && (
              <g transform={`translate(${PARTS_DATA[hoveredPart].x}, ${PARTS_DATA[hoveredPart].y - 35})`}>
                <rect x="-100" y="-18" width="200" height="24" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" opacity="0.95" />
                <text x="0" y="-4" fill="#f8fafc" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {PARTS_DATA[hoveredPart].name}
                </text>
              </g>
            )}

          </svg>
        </div>

        {/* Timeline controller panel */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleStepPrev} 
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              title="Étape Précédente"
            >
              <ChevronLeft size={16} />
            </button>
            {isPlaying ? (
              <button 
                onClick={handlePause} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-1.5 transition-colors text-xs"
              >
                <Pause size={14} /> PAUSE
              </button>
            ) : (
              <button 
                onClick={handlePlay} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-1.5 transition-colors text-xs"
              >
                <Play size={14} fill="currentColor" /> PLAY
              </button>
            )}
            <button 
              onClick={handleReset} 
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              title="Réinitialiser"
            >
              <RotateCcw size={16} />
            </button>
            <button 
              onClick={handleStepNext} 
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
              title="Étape Suivante"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex-1 flex items-center gap-3 w-full">
            <span className="text-xs font-mono text-slate-400">{formatTime(time)}</span>
            <input 
              type="range" 
              min="0" 
              max="45" 
              step="0.5" 
              value={time} 
              onChange={handleProgressChange}
              className="flex-1 accent-blue-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">00:45</span>
          </div>
        </div>
      </div>

      {/* Right details box */}
      <div className="w-full lg:w-80 flex flex-col bg-[#0b0f19] border border-slate-800/80 rounded-xl p-5 shrink-0 justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
            <Info size={16} className="text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">Infos Hydrauliques</h4>
          </div>

          {clickedPart && PARTS_DATA[clickedPart] ? (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] text-blue-400 font-bold font-mono">GROS PLAN COMPOSANT</span>
                <h5 className="text-md font-bold text-slate-100 font-mono">{PARTS_DATA[clickedPart].name}</h5>
              </div>

              <div className="bg-[#050810] p-3 rounded border border-slate-850 space-y-2">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">RÉFÉRENCE EPIROC</div>
                  <div className="text-xs text-slate-200 font-mono font-bold">{PARTS_DATA[clickedPart].ref}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">MATÉRIAU DE FABRICATION</div>
                  <div className="text-xs text-slate-300">{PARTS_DATA[clickedPart].material}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">CONSIGNES ET LIMITES</div>
                  <div className="text-xs text-blue-400 font-mono">{PARTS_DATA[clickedPart].spec}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-red-500 font-bold font-mono uppercase">🚨 SYMPTÔME DE DÉFAILLANCE</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed bg-red-950/20 p-2.5 rounded border border-red-900/30">
                  {PARTS_DATA[clickedPart].failure}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              <p>Sélectionnez un organe hydraulique sur le schéma de gauche pour voir ses limites techniques et pannes associées.</p>
            </div>
          )}
        </div>

        {/* Legend color scheme */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1.5 bg-[#ef4444] rounded-sm"></span>
            <span>Canaux Haute Pression (HP) - Actifs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1.5 bg-[#3b82f6] rounded-sm"></span>
            <span>Canaux Basse Pression / Retour Réservoir</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1.5 bg-[#fbbf24] rounded-sm" style={{ border: "1px dashed #fbbf24" }}></span>
            <span>Ligne Load Sensing (LS) - Signal pilote</span>
          </div>
        </div>
      </div>

    </div>
  );
}
