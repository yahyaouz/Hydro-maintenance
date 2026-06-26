import * as React from "react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle, Info } from "lucide-react";

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
  width?: number;
  height?: number;
}

const PARTS_DATA: Record<string, PartDetail> = {
  injecteurs: {
    id: "injecteurs",
    name: "Injecteurs Common Rail (x6)",
    ref: "Epiroc 0445120236",
    material: "Acier trempé de haute précision",
    spec: "Pression max : 1600 bar | Couple serrage : 32 Nm",
    failure: "Colmatage des nez d'injecteurs par carburant contaminé ou usure des joints toriques.",
    x: 400,
    y: 120,
    r: 15
  },
  pistons: {
    id: "pistons",
    name: "Pistons & Bielles (x6)",
    ref: "Epiroc 4987930",
    material: "Alliage d'aluminium à haute teneur en silicium / Acier forgé",
    spec: "Diamètre : 107 mm | Jeu à la coupe des segments : 0.30 - 0.45 mm",
    failure: "Gommage des segments, rayures sur chemises dues à un défaut de lubrification.",
    x: 400,
    y: 220,
    r: 30
  },
  vilebrequin: {
    id: "vilebrequin",
    name: "Vilebrequin & Contrepoids",
    ref: "Epiroc 3968320",
    material: "Acier allié forgé sous presse",
    spec: "6 manetons, 7 tourillons | Ovalisation max : 0.005 mm",
    failure: "Usure prématurée des coussinets de bielle par contamination de l'huile moteur.",
    x: 400,
    y: 350,
    r: 35
  },
  turbo: {
    id: "turbo",
    name: "Turbocompresseur Holset",
    ref: "Epiroc 4043215",
    material: "Carters en fonte / Roue de turbine en alliage de nickel (Inconel)",
    spec: "Vitesse max : 120,000 tr/min | Pression de suralimentation : 1.4 bar",
    failure: "Jeu excessif de l'arbre, passage d'huile dans l'admission par défaut des paliers fluides.",
    x: 200,
    y: 200,
    r: 40
  },
  radiateur: {
    id: "radiateur",
    name: "Radiateur V-Tube Sec",
    ref: "Epiroc 55067210",
    material: "Ailettes cuivre soudées sur tubes laiton renforcés",
    spec: "Pas d'ailettes large (3.2 mm anti-colmatage) | Surface : 45 m²",
    failure: "Obstrué par de la poussière de mine grasse (nécessite lavage HP V-Tube).",
    x: 650,
    y: 240,
    r: 45
  },
  carter: {
    id: "carter",
    name: "Carter d'Huile Inférieur",
    ref: "Epiroc 3974211",
    material: "Tôle d'acier emboutie double couche",
    spec: "Capacité : 19.5 Litres | Joint élastomère moulé",
    failure: "Choc de roche de galerie de mine, micro-fissure ou fuite de joint torique bouchon.",
    x: 400,
    y: 450,
    r: 40
  },
  volant: {
    id: "volant",
    name: "Volant Moteur & Couronne",
    ref: "Epiroc 3968214",
    material: "Fonte nodulaire haute résistance",
    spec: "142 dents sur la couronne | Inertie : 1.2 kg.m²",
    failure: "Dents de couronne brisées ou usées suite à un pignon de démarreur défectueux.",
    x: 140,
    y: 350,
    r: 30
  },
  bloc: {
    id: "bloc",
    name: "Bloc Moteur Central",
    ref: "Epiroc 4991200",
    material: "Fonte grise alliée à graphite lamellaire",
    spec: "6 alésages en ligne | Hauteur bloc : 412 mm",
    failure: "Fissuration thermique entre soupapes ou usure des fûts de cylindre.",
    x: 400,
    y: 270,
    r: 60
  }
};

const STEPS = [
  { id: 1, title: "01. VUE COMPACTE & CONTOURS", range: [0, 5], desc: "Visualisation générale du moteur assemblé avec ses contours orange Epiroc." },
  { id: 2, title: "02. ÉCLATEMENT DES PIÈCES", range: [5, 20], desc: "Translation orthogonale des organes (vilebrequin, pistons, turbo, carter) pour révéler l'architecture interne." },
  { id: 3, title: "03. CYCLE DE FONCTIONNEMENT", range: [20, 35], desc: "Cinématique mécanique active : rotation du vilebrequin, mouvement alternatif des pistons et flux d'air turbo." },
  { id: 4, title: "04. FOCUS INJECTEUR COMMON RAIL", range: [35, 42], desc: "Zoom 2x sur un injecteur critique. Visualisation du joint torique et des paramètres de serrage de la bride." },
  { id: 5, title: "05. RECOMPOSITION & VALIDATION", range: [42, 45], desc: "Assemblage inverse complet et validation finale par un voyant vert d'état nominal." }
];

export function AnimEngineQsb() {
  const [time, setTime] = React.useState<number>(0); // 0 to 45 seconds
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [hoveredPart, setHoveredPart] = React.useState<string | null>(null);
  const [clickedPart, setClickedPart] = React.useState<string>("injecteurs");

  // Manage automatic clock ticking
  React.useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setTime((prev) => {
          if (prev >= 45) {
            return 0; // Loop or stop
          }
          return Math.round((prev + 0.5) * 10) / 10;
        });
      }, 500); // tick every half-second
    } else {
      if (timer) clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Determine current active step based on time
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

  // Helper formatting time
  const formatTime = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate coordinates dynamic offset based on timeline explosion phase (5 to 20s)
  // Let's create an explosion percentage (0 to 1) from t=5 to t=20
  let explodePct = 0;
  if (time >= 5 && time < 20) {
    explodePct = (time - 5) / 15;
  } else if (time >= 20 && time < 42) {
    explodePct = 1.0;
  } else if (time >= 42) {
    // recompose from 42 to 45s
    explodePct = Math.max(0, 1 - (time - 42) / 3);
  }

  // Animation phase for the engine (rotating shafts, reciprocating pistons) during t=20 to t=35
  const animFreq = time * 2.5; // used for sinusoids
  const pistonOffsets = [0, 120, 240, 60, 180, 300].map(phase => {
    if (time >= 20 && time <= 35) {
      return Math.sin(animFreq + (phase * Math.PI) / 180) * 15;
    }
    return 0;
  });

  // Zoom factor for phase 4 (35-42s) focus on Injector
  const isZoomed = time >= 35 && time < 42;
  const zoomScale = isZoomed ? 1.8 : 1.0;
  const zoomCenterX = 400;
  const zoomCenterY = 120;
  const transformStyle = isZoomed 
    ? { transform: `scale(${zoomScale}) translate(${zoomCenterX - zoomCenterX * zoomScale}px, ${zoomCenterY - zoomCenterY * zoomScale}px)`, transformOrigin: "400px 120px", transition: "transform 1s ease-in-out" }
    : { transform: "scale(1)", transformOrigin: "400px 120px", transition: "transform 1s ease-in-out" };

  return (
    <div className="bg-[#0f172a] text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-6">
      
      {/* CSS STYLES FOR ANIMATION EFFECTS */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
        @keyframes rotating {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes strokeFlow {
          to { stroke-dashoffset: -20; }
        }
        .flow-line {
          stroke-dasharray: 6, 4;
          animation: strokeFlow 1s linear infinite;
        }
        .rotating-element {
          animation: rotating 4s linear infinite;
        }
      `}</style>

      {/* Main blueprint panel */}
      <div className="flex-1 flex flex-col bg-[#050b14] rounded-xl border border-slate-900 relative min-h-[480px]">
        
        {/* Title overlay */}
        <div className="absolute top-4 left-4 z-10 bg-[#050b14]/90 p-3 rounded border border-amber-500/20 max-w-sm">
          <span className="text-[10px] tracking-wider text-amber-500 font-bold uppercase font-mono">ANIMATION INTERACTIVE 4.1</span>
          <h4 className="text-sm font-bold text-slate-100 font-mono mt-0.5">ÉCLATÉ MOTEUR CUMMINS QSB 6.7</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{currentStepObj.desc}</p>
        </div>

        {/* Phase Indicator */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="text-xs font-mono font-bold text-amber-400">{currentStepObj.title}</span>
        </div>

        {/* SVG Drawing Canvas */}
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden" style={{ minHeight: "400px" }}>
          <svg 
            viewBox="0 0 800 550" 
            className="w-full h-full max-h-[450px]"
            style={transformStyle}
          >
            {/* Background grids */}
            <g opacity="0.15">
              <pattern id="grid-qsb" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f59e0b" strokeWidth="0.5" />
              </pattern>
              <rect width="800" height="550" fill="url(#grid-qsb)" />
            </g>

            {/* Iso / blueprint construction lines */}
            <g stroke="#f59e0b" strokeWidth="0.5" opacity="0.25" strokeDasharray="3 3">
              {/* Central axis line */}
              <line x1="400" y1="50" x2="400" y2="500" />
              {/* Explosion lines */}
              {explodePct > 0 && (
                <>
                  <line x1="400" y1="270" x2={400 - explodePct * 180} y2="200" stroke="#3b82f6" /> {/* turbo link */}
                  <line x1="400" y1="270" x2={400 + explodePct * 200} y2="240" stroke="#10b981" /> {/* radiator link */}
                  <line x1="400" y1="270" x2="400" y2={450 + explodePct * 40} stroke="#f59e0b" /> {/* carter link */}
                  <line x1="400" y1="120" x2="400" y2={120 - explodePct * 50} stroke="#f59e0b" /> {/* injector link */}
                  <line x1="400" y1="350" x2="400" y2={350 + explodePct * 50} stroke="#f59e0b" /> {/* crankshaft link */}
                </>
              )}
            </g>

            {/* 1. RADIATEUR V-TUBE (Slide Right) */}
            <g 
              transform={`translate(${explodePct * 180}, 0)`}
              onClick={() => setClickedPart("radiateur")}
              onMouseEnter={() => setHoveredPart("radiateur")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "radiateur" || clickedPart === "radiateur" ? 1.0 : isZoomed ? 0.05 : 0.75}
            >
              {/* Outer frame */}
              <rect x="610" y="160" width="80" height="180" rx="4" fill="#0c1626" stroke={clickedPart === "radiateur" ? "#fbbf24" : "#3b82f6"} strokeWidth="2" />
              {/* Grille lines */}
              {Array.from({ length: 15 }).map((_, i) => (
                <line 
                  key={i} 
                  x1="620" 
                  y1={175 + i * 10} 
                  x2="680" 
                  y2={175 + i * 10} 
                  stroke="#3b82f6" 
                  strokeWidth="1.5" 
                  opacity="0.6" 
                />
              ))}
              {/* Hot/Cold V-tubes arrows if functioning */}
              {time >= 20 && time <= 35 && (
                <>
                  <path d="M 610 180 Q 640 180 640 210" fill="none" stroke="#ef4444" strokeWidth="2.5" className="flow-line" />
                  <path d="M 680 320 Q 650 320 650 290" fill="none" stroke="#3b82f6" strokeWidth="2.5" className="flow-line" />
                </>
              )}
              {/* Tag text */}
              <text x="650" y="150" fill="#3b82f6" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">V-TUBE RADIATEUR</text>
            </g>

            {/* 2. TURBOCOMPRESSEUR (Slide Left) */}
            <g 
              transform={`translate(${-explodePct * 160}, 0)`}
              onClick={() => setClickedPart("turbo")}
              onMouseEnter={() => setHoveredPart("turbo")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "turbo" || clickedPart === "turbo" ? 1.0 : isZoomed ? 0.05 : 0.75}
            >
              {/* Exhaust scroll (spiral) */}
              <path d="M 180 200 C 180 160, 240 160, 240 200 C 240 230, 200 230, 200 200 C 200 185, 225 185, 225 200" fill="none" stroke={clickedPart === "turbo" ? "#fbbf24" : "#94a3b8"} strokeWidth="3" />
              {/* Cold compressor housing */}
              <circle cx="160" cy="200" r="30" fill="#0f2038" stroke="#3b82f6" strokeWidth="2" />
              <path d="M 160 170 L 160 140" stroke="#3b82f6" strokeWidth="2" />
              {/* Impeller fan */}
              <g transform="translate(160, 200)">
                <g className={time >= 20 && time <= 35 ? "rotating-element" : ""}>
                  <circle cx="0" cy="0" r="4" fill="#fbbf24" />
                  {Array.from({ length: 6 }).map((_, i) => (
                    <line key={i} x1="0" y1="0" x2="22" y2="0" stroke="#fbbf24" strokeWidth="1.5" transform={`rotate(${i * 60})`} />
                  ))}
                </g>
              </g>
              {/* Air intake arrow (Blue) */}
              {time >= 20 && time <= 35 && (
                <path d="M 100 200 L 130 200" stroke="#3b82f6" strokeWidth="3.5" className="flow-line" />
              )}
              <text x="160" y="130" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">TURBOCHARGER</text>
            </g>

            {/* 3. VOLANT MOTEUR (Slide Left-Down) */}
            <g 
              transform={`translate(${-explodePct * 180}, ${explodePct * 60})`}
              onClick={() => setClickedPart("volant")}
              onMouseEnter={() => setHoveredPart("volant")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "volant" || clickedPart === "volant" ? 1.0 : isZoomed ? 0.05 : 0.7}
            >
              <circle cx="140" cy="350" r="45" fill="#1e293b" stroke={clickedPart === "volant" ? "#fbbf24" : "#64748b"} strokeWidth="3" />
              <circle cx="140" cy="350" r="35" fill="#020617" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
              {/* Teeth simulation */}
              {Array.from({ length: 24 }).map((_, i) => (
                <rect 
                  key={i} 
                  x="137" 
                  y="302" 
                  width="6" 
                  height="6" 
                  fill="#475569" 
                  transform={`rotate(${i * 15} 140 350)`} 
                />
              ))}
              <text x="140" y="415" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">VOLANT MOTEUR</text>
            </g>

            {/* 4. BLOC MOTEUR CENTRAL */}
            <g 
              onClick={() => setClickedPart("bloc")}
              onMouseEnter={() => setHoveredPart("bloc")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "bloc" || clickedPart === "bloc" ? 1.0 : isZoomed ? 0.15 : 0.9}
            >
              {/* Outer frame */}
              <rect x="280" y="160" width="240" height="220" rx="8" fill="#111827" stroke={clickedPart === "bloc" ? "#fbbf24" : "#f59e0b"} strokeWidth="2.5" />
              {/* Internal cooling chambers hatches */}
              <path d="M 290 170 L 310 190 M 290 190 L 310 210 M 490 170 L 510 190 M 490 190 L 510 210" stroke="#f59e0b" strokeWidth="0.75" opacity="0.3" />
              
              {/* 6 Cylinder sleeves / bores */}
              {Array.from({ length: 6 }).map((_, i) => {
                const cx = 310 + i * 36;
                return (
                  <g key={i}>
                    {/* Bore wall */}
                    <rect x={cx - 14} y="170" width="28" height="100" fill="#1f2937" stroke="#4b5563" strokeWidth="1" />
                    {/* Hatch inside empty bore */}
                    <line x1={cx - 10} y1="175" x2={cx + 10} y2="195" stroke="#f59e0b" strokeWidth="0.5" opacity="0.1" />
                  </g>
                );
              })}
              
              <text x="400" y="370" fill="#f59e0b" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold" letterSpacing="1">BLOC MOTEUR QSB 6.7</text>
            </g>

            {/* 5. COUSSINETS & PISTONS (Interactive reciprocating + slide-up) */}
            <g 
              transform={`translate(0, ${-explodePct * 80})`}
              onClick={() => setClickedPart("pistons")}
              onMouseEnter={() => setHoveredPart("pistons")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "pistons" || clickedPart === "pistons" ? 1.0 : isZoomed ? 0.2 : 0.95}
            >
              {/* Draw pistons inside or floating above */}
              {Array.from({ length: 6 }).map((_, i) => {
                const cx = 310 + i * 36;
                const dynamicY = 180 + pistonOffsets[i];
                return (
                  <g key={i}>
                    {/* Connecting Rod (Bielle) */}
                    <line 
                      x1={cx} 
                      y1={dynamicY + 20} 
                      x2={cx + (time >= 20 && time <= 35 ? Math.sin(animFreq + i) * 6 : 0)} 
                      y2={dynamicY + 65} 
                      stroke="#94a3b8" 
                      strokeWidth="2.5" 
                    />
                    {/* Piston head with ring grooves */}
                    <rect x={cx - 12} y={dynamicY} width="24" height="20" rx="2" fill="#475569" stroke={clickedPart === "pistons" ? "#fbbf24" : "#64748b"} strokeWidth="1" />
                    {/* Segments (Rings) */}
                    <line x1={cx - 12} y1={dynamicY + 4} x2={cx + 12} y2={dynamicY + 4} stroke="#0f172a" strokeWidth="1" />
                    <line x1={cx - 12} y1={dynamicY + 8} x2={cx + 12} y2={dynamicY + 8} stroke="#0f172a" strokeWidth="1" />
                    {/* Wrist pin (Axe) */}
                    <circle cx={cx} cy={dynamicY + 12} r="3.5" fill="#94a3b8" />
                  </g>
                );
              })}
              {explodePct > 0 && (
                <text x="400" y="80" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ENSEMBLE BIELLES-PISTONS EXPLOSÉ</text>
              )}
            </g>

            {/* 6. VILEBREQUIN (Interactive slide-down) */}
            <g 
              transform={`translate(0, ${explodePct * 80})`}
              onClick={() => setClickedPart("vilebrequin")}
              onMouseEnter={() => setHoveredPart("vilebrequin")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "vilebrequin" || clickedPart === "vilebrequin" ? 1.0 : isZoomed ? 0.05 : 0.9}
            >
              {/* Shaft axis */}
              <line x1="290" y1="350" x2="510" y2="350" stroke="#cbd5e1" strokeWidth="4" />
              {/* Web counterweights */}
              {Array.from({ length: 6 }).map((_, i) => {
                const cx = 310 + i * 36;
                const activeRot = time >= 20 && time <= 35 ? (time * 120 + i * 60) : 0;
                return (
                  <g key={i} transform={`translate(${cx}, 350) rotate(${activeRot})`}>
                    {/* Crank cheek / lob */}
                    <path d="M -10 -5 L 10 -5 L 14 25 L -14 25 Z" fill="#64748b" stroke={clickedPart === "vilebrequin" ? "#fbbf24" : "#475569"} strokeWidth="1" />
                    {/* Pin journal */}
                    <circle cx="0" cy="18" r="6" fill="#cbd5e1" />
                  </g>
                );
              })}
              <text x="400" y="410" fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">VILEBREQUIN FORGÉ</text>
            </g>

            {/* 7. CARTER HUILE INFERIEUR (Slide Down) */}
            <g 
              transform={`translate(0, ${explodePct * 110})`}
              onClick={() => setClickedPart("carter")}
              onMouseEnter={() => setHoveredPart("carter")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "carter" || clickedPart === "carter" ? 1.0 : isZoomed ? 0.05 : 0.85}
            >
              {/* Pan shape */}
              <path d="M 285 385 L 515 385 L 500 440 L 330 440 L 310 420 L 285 420 Z" fill="#1e293b" stroke={clickedPart === "carter" ? "#fbbf24" : "#475569"} strokeWidth="2" />
              {/* Hot Oil volume inside */}
              <path d="M 325 410 L 495 410 L 485 435 L 330 435 Z" fill="#f59e0b" opacity="0.25" />
              {/* Drain plug */}
              <rect x="335" y="440" width="8" height="6" fill="#94a3b8" />
              <text x="400" y="465" fill="#475569" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">CARTER D'HUILE MOULÉ</text>
            </g>

            {/* 8. COMMON RAIL & INJECTEURS CRITIQUES (Interactive slide-up & zoom detail) */}
            <g 
              transform={`translate(0, ${-explodePct * 100})`}
              onClick={() => setClickedPart("injecteurs")}
              onMouseEnter={() => setHoveredPart("injecteurs")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "injecteurs" || clickedPart === "injecteurs" ? 1.0 : isZoomed ? 1.0 : 0.95}
            >
              {/* Fuel rail bar */}
              <line x1="300" y1="120" x2="500" y2="120" stroke="#e2e8f0" strokeWidth="4" />
              
              {/* Injectors (x6) */}
              {Array.from({ length: 6 }).map((_, i) => {
                const cx = 310 + i * 36;
                // Highlight injector 3 if zoomed
                const isTargetInj = i === 2;
                const strokeColor = isTargetInj && isZoomed ? "#ef4444" : clickedPart === "injecteurs" ? "#fbbf24" : "#cbd5e1";
                const strokeW = isTargetInj && isZoomed ? 2.5 : 1.5;
                
                return (
                  <g key={i}>
                    {/* Rail feed line */}
                    <path d={`M ${cx - 5} 120 L ${cx - 5} 145`} stroke="#e2e8f0" strokeWidth="1.5" />
                    {/* Injector body */}
                    <rect x={cx - 4} y="130" width="8" height="35" rx="1" fill="#334155" stroke={strokeColor} strokeWidth={strokeW} />
                    {/* Solenoid head */}
                    <rect x={cx - 6} y="125" width="12" height="6" fill="#1e293b" stroke={strokeColor} strokeWidth="1" />
                    {/* Micro joint torique gasket (Focus of Zoom phase) */}
                    {isTargetInj && isZoomed && (
                      <g>
                        <ellipse cx={cx} cy="150" rx="7" ry="2.5" fill="none" stroke="#f59e0b" strokeWidth="2" className="animate-pulse" />
                        <text x={cx + 12} y="153" fill="#f59e0b" fontSize="5" fontFamily="monospace" fontWeight="bold">JOINT TORIQUE RÉVÉLÉ</text>
                      </g>
                    )}
                    {/* Spray flow line (Yellow) if active functioning */}
                    {time >= 20 && time <= 35 && (
                      <path d={`M ${cx} 165 L ${cx - 2} 175 M ${cx} 165 L ${cx + 2} 175`} stroke="#fbbf24" strokeWidth="1" opacity="0.8" />
                    )}
                  </g>
                );
              })}
              <text x="400" y="105" fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">RAMPE DE DISTRIBUTION COMMUNE (COMMON RAIL)</text>
            </g>

            {/* Validation Checkmark at final state (42 to 45s) */}
            {time >= 42 && (
              <g transform="translate(400, 260)" className="animate-bounce">
                <circle cx="0" cy="0" r="45" fill="#064e3b" stroke="#10b981" strokeWidth="3" opacity="0.9" />
                <path d="M -18 2 L -5 15 L 18 -10" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <text x="0" y="32" fill="#10b981" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">QSB 6.7 OK</text>
              </g>
            )}

            {/* HOVER TOOLTIP IN-SVG */}
            {hoveredPart && PARTS_DATA[hoveredPart] && (
              <g transform={`translate(${PARTS_DATA[hoveredPart].x}, ${PARTS_DATA[hoveredPart].y - 30})`}>
                <rect x="-100" y="-20" width="200" height="26" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" opacity="0.95" />
                <text x="0" y="-4" fill="#f8fafc" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {PARTS_DATA[hoveredPart].name}
                </text>
                <text x="0" y="4" fill="#94a3b8" fontSize="7.5" fontFamily="monospace" textAnchor="middle">
                  Cliquez pour plus d'infos techniques
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Timeline controls in the overlay box */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Main action buttons */}
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
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded flex items-center gap-1.5 transition-colors text-xs"
              >
                <Pause size={14} /> PAUSE
              </button>
            ) : (
              <button 
                onClick={handlePlay} 
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded flex items-center gap-1.5 transition-colors text-xs"
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

          {/* Time display & Slider */}
          <div className="flex-1 flex items-center gap-3 w-full">
            <span className="text-xs font-mono text-slate-400">{formatTime(time)}</span>
            <input 
              type="range" 
              min="0" 
              max="45" 
              step="0.5" 
              value={time} 
              onChange={handleProgressChange}
              className="flex-1 accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">00:45</span>
          </div>
        </div>
      </div>

      {/* Right Info Details panel */}
      <div className="w-full lg:w-80 flex flex-col bg-[#0b0f19] border border-slate-800/80 rounded-xl p-5 shrink-0 justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
            <Info size={16} className="text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">Spécifications de l'Organe</h4>
          </div>

          {clickedPart && PARTS_DATA[clickedPart] ? (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] text-amber-500 font-bold font-mono">DÉTAIL TECHNIQUE</span>
                <h5 className="text-md font-bold text-slate-100 font-mono">{PARTS_DATA[clickedPart].name}</h5>
              </div>

              <div className="bg-[#050810] p-3 rounded border border-slate-850 space-y-2">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">RÉFÉRENCE CONSTRUCTEUR</div>
                  <div className="text-xs text-slate-200 font-mono font-bold">{PARTS_DATA[clickedPart].ref}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">MATÉRIAU SPÉCIFIQUE</div>
                  <div className="text-xs text-slate-300">{PARTS_DATA[clickedPart].material}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">DONNÉES TECHNIQUES</div>
                  <div className="text-xs text-emerald-400 font-mono">{PARTS_DATA[clickedPart].spec}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-red-500 font-bold font-mono uppercase">🚨 Risques Associés & Panne</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed bg-red-950/20 p-2.5 rounded border border-red-900/30">
                  {PARTS_DATA[clickedPart].failure}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              <p>Sélectionnez un organe sur le blueprint à gauche pour afficher ses spécifications détaillées.</p>
            </div>
          )}
        </div>

        {/* Quick legend footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span>
            <span>Composants principaux</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
            <span>Flux d'admission d'air / Fluide</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
            <span>Validation d'opération (OK)</span>
          </div>
        </div>

      </div>

    </div>
  );
}
