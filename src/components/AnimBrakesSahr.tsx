import * as React from "react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Info, AlertTriangle } from "lucide-react";

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
  etrier: {
    id: "etrier",
    name: "Étrier de Frein Rigide en U",
    ref: "Epiroc 3128213010",
    material: "Fonte nodulaire austénitique de haute ténacité",
    spec: "Pression d'épreuve : 250 bar | Filetage orifices : M18x1.5",
    failure: "Déformation géométrique ou micro-fissuration thermique sous fatigue mécanique cyclique.",
    x: 400,
    y: 130,
    r: 45
  },
  disques: {
    id: "disques",
    name: "Disques de Friction Mouillés (6 Mobiles / 5 Fixes)",
    ref: "Epiroc 3128120015",
    material: "Mobiles : Acier fritté bronze | Fixes : Acier trempé",
    spec: "Épaisseur nominale : 6.2 mm | Seuil usure max : 5.8 mm",
    failure: "Glaçage des disques frittés par surchauffe prolongée, entraînant une réduction brutale du couple de freinage.",
    x: 350,
    y: 300,
    r: 40
  },
  piston: {
    id: "piston",
    name: "Piston de Pression Principal SAHR",
    ref: "Epiroc 3128151230",
    material: "Acier carbone forgé avec traitement de dureté superficielle",
    spec: "Course nominale : 12 mm | Diamètre piston : 180 mm",
    failure: "Extrusion du joint à lèvre haute pression suite à une augmentation anormale de la température d'huile.",
    x: 460,
    y: 300,
    r: 35
  },
  ressorts: {
    id: "ressorts",
    name: "Ressorts de Rappel Belleville SAHR",
    ref: "Epiroc 3128215124",
    material: "Acier à ressort spécial allié au Chrome-Vanadium (51CrV4)",
    spec: "Serrage mécanique automatique par force élastique de 45,000 N",
    failure: "Rupture de fatigue d'un ressort Belleville provoquant un serrage asymétrique et une usure rapide des disques.",
    x: 580,
    y: 300,
    r: 30
  },
  ventilateur: {
    id: "ventilateur",
    name: "Turbine de Force Cooling (Refroidissement Forcé)",
    ref: "Epiroc 3128124010",
    material: "Hélice axiale en alliage d'aluminium léger moulé",
    spec: "Débit refroidissement : 45 L/min d'huile de transmission circulante",
    failure: "Grippage des paliers de turbine ou encrassement de la grille de distribution de flux d'huile.",
    x: 180,
    y: 300,
    r: 35
  },
  accumulateur: {
    id: "accumulateur",
    name: "Accumulateur d'Azote de Purge Rapide",
    ref: "Epiroc 3128122340",
    material: "Acier allié forgé, membrane NBR spécifique",
    spec: "Volume : 2.5 Litres | Précharge d'azote N₂ : 110 bar",
    failure: "Fuite lente d'azote par la valve de charge entraînant un freinage d'urgence trop lent.",
    x: 460,
    y: 110,
    r: 25
  },
  capteur_temp: {
    id: "capteur_temp",
    name: "Sonde de Température d'Huile de Frein",
    ref: "Epiroc 3128100110",
    material: "Élément sensible PT100 de haute précision, gaine inox",
    spec: "Plage d'utilisation : -40°C à +200°C | Signal : PT100 standard",
    failure: "Câblage écrasé dans l'articulation centrale, provoquant une alerte permanente de surchauffe à 150°C.",
    x: 230,
    y: 170,
    r: 15
  },
  manometre: {
    id: "manometre",
    name: "Transducteur de Pression de Release (Déverrouillage)",
    ref: "Epiroc 3128100120",
    material: "Boîtier hermétique en résine phénolique, cellule céramique",
    spec: "Pression minimale d'ouverture du frein : 120 bar",
    failure: "Perte de calibration de la cellule de mesure, envoyant un signal erroné de pression basse au RCS.",
    x: 400,
    y: 70,
    r: 20
  }
};

const STEPS = [
  { id: 1, title: "01. FREIN RELÂCHÉ (MARCHE)", range: [0, 5], desc: "Frein desserré hydrauliquement. La pression (180 bar) repousse le piston et compresse les ressorts SAHR. Disques libres." },
  { id: 2, title: "02. FREINAGE NORMAL DE SERVICE", range: [5, 15], desc: "Chute progressive de la pression. Les ressorts s'étendent et poussent le piston. Squeeze des disques. Hausse T° (80°C)." },
  { id: 3, title: "03. REFROIDISSEMENT FORCÉ ACTIF", range: [15, 25], desc: "Démarrage de la turbine de Force Cooling. Circulation active de l'huile froide pour stabiliser la température à 75°C." },
  { id: 4, title: "04. FREINAGE D'URGENCE COMPLET", range: [25, 35], desc: "Décharge instantanée de la pression à 0 bar. Serrage mécanique maximal par ressorts. T° critique 150°C. Alarme active." },
  { id: 5, title: "05. REMISE EN PRESSION & CHECK", range: [35, 45], desc: "Injection de fluide hydraulique. Le piston recule. Fin de l'alarme thermique. Validation complète." }
];

export function AnimBrakesSahr() {
  const [time, setTime] = React.useState<number>(0); // 0 to 45 seconds
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [hoveredPart, setHoveredPart] = React.useState<string | null>(null);
  const [clickedPart, setClickedPart] = React.useState<string>("disques");

  // Manage clock
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

  // State Calculations:
  // 1. Hydraulic Release Pressure (bar)
  let activePressure = 180; // default Desserré
  if (time >= 5 && time < 15) {
    activePressure = 180 - ((time - 5) / 10) * 100; // dropping to 80 bar
  } else if (time >= 15 && time < 25) {
    activePressure = 80;
  } else if (time >= 25 && time < 35) {
    activePressure = 0; // Emergency dump to 0 bar
  } else if (time >= 35) {
    activePressure = Math.min(180, 0 + ((time - 35) / 7) * 180); // restoring
  }
  activePressure = Math.round(activePressure);

  // 2. Temperature (°C)
  let activeTemp = 40;
  if (time >= 5 && time < 15) {
    activeTemp = 40 + ((time - 5) / 10) * 40; // 40 to 80°C
  } else if (time >= 15 && time < 25) {
    activeTemp = 80 - ((time - 15) / 10) * 5; // force cooling cooling down slightly
  } else if (time >= 25 && time < 35) {
    activeTemp = 75 + ((time - 25) / 10) * 75; // spike to 150°C
  } else if (time >= 35) {
    activeTemp = Math.max(40, 150 - ((time - 35) / 10) * 110); // cooling down
  }
  activeTemp = Math.round(activeTemp);

  // Temperature color
  let tempColor = "#10b981"; // green
  if (activeTemp >= 65 && activeTemp < 100) {
    tempColor = "#f59e0b"; // orange
  } else if (activeTemp >= 100) {
    tempColor = "#ef4444"; // red
  }

  // 3. Piston Position Offset (translate X)
  // Let's say piston is at x=0 (released, pushed right, springs compressed)
  // x=-18 (fully applied, pushed left, springs extended)
  let pistonX = 0;
  if (time >= 5 && time < 15) {
    pistonX = -((time - 5) / 10) * 12;
  } else if (time >= 15 && time < 25) {
    pistonX = -12;
  } else if (time >= 25 && time < 35) {
    pistonX = -18; // Emergency clamping at max left
  } else if (time >= 35) {
    pistonX = Math.min(0, -18 + ((time - 35) / 5) * 18); // piston returns right
  }

  // 4. Spring scale factor (Belleville springs compress when piston is at x=0, and extend when piston moves left x=-18)
  const springScaleX = 0.7 + (-pistonX / 18) * 0.3; // 0.7 (fully compressed) to 1.0 (fully extended)

  // 5. Fan is rotating during phase 3 and slightly during phase 4 & 5
  const fanIsRotating = time >= 15 && time < 42;

  return (
    <div className="bg-[#0f172a] text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-6">
      
      {/* CSS STYLE BLOCKS */}
      <style>{`
        @keyframes rotateFan {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes strobeBrake {
          0%, 100% { fill: rgba(239, 68, 68, 0.1); stroke: #ef4444; }
          50% { fill: rgba(239, 68, 68, 0.4); stroke: #ef4444; }
        }
        .brakes-rotating-fan {
          animation: rotateFan 1.5s linear infinite;
        }
        .brakes-rotating-fan-fast {
          animation: rotateFan 0.6s linear infinite;
        }
        .emergency-hazard {
          animation: strobeBrake 1s infinite;
        }
        @keyframes flowSilicone {
          to { stroke-dashoffset: -30; }
        }
        .cooling-flow {
          stroke-dasharray: 5, 4;
          animation: flowSilicone 1.2s linear infinite;
        }
      `}</style>

      {/* Drawing Viewport left */}
      <div className="flex-1 flex flex-col bg-[#050b14] rounded-xl border border-slate-900 relative min-h-[480px]">
        
        {/* Title overlay */}
        <div className="absolute top-4 left-4 z-10 bg-[#050b14]/90 p-3 rounded border border-red-500/20 max-w-sm">
          <span className="text-[10px] tracking-wider text-red-500 font-bold uppercase font-mono">ANIMATION DYNAMIQUE 4.3</span>
          <h4 className="text-sm font-bold text-slate-100 font-mono mt-0.5">COUPE ÉTRIER SAHR & REFROIDISSEMENT</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{currentStepObj.desc}</p>
        </div>

        {/* Phase Badge */}
        <div className="absolute top-4 right-4 z-10 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-xs font-mono font-bold text-red-400">{currentStepObj.title}</span>
        </div>

        {/* SVG Drawing Area */}
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden" style={{ minHeight: "400px" }}>
          
          {/* Real-time Alarm Banner inside Canvas when temperature spikes */}
          {activeTemp >= 110 && (
            <div className="absolute top-28 left-4 right-4 bg-red-950/90 border-2 border-red-500 p-2 rounded flex items-center gap-2 z-10 animate-pulse">
              <AlertTriangle className="text-red-500 shrink-0" size={16} />
              <div className="text-[11px] font-mono">
                <span className="font-bold text-red-500">ALERTE SURCHAUFFE FREIN SAHR :</span> {activeTemp}°C (Limite de sécurité &lt; 120°C dépassée).
              </div>
            </div>
          )}

          <svg viewBox="0 0 800 550" className="w-full h-full max-h-[450px]">
            {/* Grid overlay */}
            <g opacity="0.1">
              <pattern id="grid-brakes" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ef4444" strokeWidth="0.5" />
              </pattern>
              <rect width="800" height="550" fill="url(#grid-brakes)" />
            </g>

            {/* STROBE BORDER IF EMERGENCY DUMP ALARM IN PHASE 4 */}
            {time >= 25 && time < 35 && (
              <rect x="5" y="5" width="790" height="540" rx="10" fill="none" stroke="#ef4444" strokeWidth="3" className="emergency-hazard" />
            )}

            {/* FORCE COOLING OIL CONDUITS & ACTIVE CIRCULATION (Blue cooling lines) */}
            <path 
              d="M 180 300 Q 250 250 300 280 L 320 280" 
              fill="none" 
              stroke={fanIsRotating ? "#0284c7" : "#1e293b"} 
              strokeWidth="4" 
              className={fanIsRotating ? "cooling-flow" : ""} 
            />
            <path 
              d="M 320 320 Q 250 350 180 300" 
              fill="none" 
              stroke={fanIsRotating ? "#0284c7" : "#1e293b"} 
              strokeWidth="4" 
            />

            {/* RELEASE FLUID LINE (Top hydraulic release pressure pipe) */}
            <path 
              d="M 460 110 L 460 210 L 485 210" 
              fill="none" 
              stroke={activePressure > 30 ? "#3b82f6" : "#1e293b"} 
              strokeWidth="3.5" 
              className={activePressure > 30 ? "cooling-flow" : ""}
            />


            {/* DRAWING COMPONENTS */}

            {/* 1. ETRIER DE FREIN EXTÉRIEUR (U-Shape Frame block) */}
            <g 
              onClick={() => setClickedPart("etrier")}
              onMouseEnter={() => setHoveredPart("etrier")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "etrier" || clickedPart === "etrier" ? 1.0 : 0.85}
            >
              {/* Outer massive frame representation with cross hatches */}
              <path d="M 280 180 L 650 180 L 650 420 L 580 420 L 580 370 L 440 370 L 440 420 L 280 420 Z" fill="#1e293b" stroke={clickedPart === "etrier" ? "#fbbf24" : "#475569"} strokeWidth="2.5" />
              <path d="M 300 190 L 320 210 M 300 210 L 320 230 M 600 190 L 620 210" stroke="#475569" strokeWidth="0.75" opacity="0.3" />
              <text x="460" y="165" fill="#94a3b8" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ÉTRIER DE FREIN FIXE FONTE</text>
            </g>

            {/* 2. FORCE COOLING FAN (Left) */}
            <g 
              onClick={() => setClickedPart("ventilateur")}
              onMouseEnter={() => setHoveredPart("ventilateur")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "ventilateur" || clickedPart === "ventilateur" ? 1.0 : 0.85}
            >
              {/* Fan housing block */}
              <rect x="120" y="240" width="80" height="120" rx="4" fill="#0f172a" stroke={clickedPart === "ventilateur" ? "#fbbf24" : "#475569"} strokeWidth="2" />
              
              {/* Rotating propeller */}
              <g transform="translate(160, 300)">
                <g className={fanIsRotating ? "brakes-rotating-fan-fast" : ""}>
                  <circle cx="0" cy="0" r="8" fill="#cbd5e1" stroke="#334155" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <path 
                      key={i} 
                      d="M -3 -6 Q -15 -25 0 -35 Q 15 -25 3 -6 Z" 
                      fill="#94a3b8" 
                      stroke="#475569" 
                      strokeWidth="1" 
                      transform={`rotate(${i * 72})`} 
                    />
                  ))}
                </g>
              </g>
              <text x="160" y="380" fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">FAN REFROIDISSEMENT</text>
            </g>

            {/* 3. MULTI-DISC WET BRAKE STACK (Mobiles & Fixes alternate) */}
            <g 
              onClick={() => setClickedPart("disques")}
              onMouseEnter={() => setHoveredPart("disques")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "disques" || clickedPart === "disques" ? 1.0 : 0.9}
            >
              <text x="350" y="445" fill="#f59e0b" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">PACK 11 DISQUES HUMIDES</text>
              
              {/* Render 11 discs. The mobiles will have some offset or squeeze visual */}
              {Array.from({ length: 11 }).map((_, i) => {
                const isMobile = i % 2 === 0;
                // Clamping/squeeze animation effect:
                // When brake is applied (pistonX is negative), spacing between discs decreases
                const baseSpacing = 6;
                const dynamicOffset = pistonX * (i / 11);
                const discX = 300 + i * baseSpacing + dynamicOffset;
                
                const discColor = isMobile ? "#fbbf24" : "#64748b";
                const borderC = clickedPart === "disques" ? "#fbbf24" : isMobile ? "#d97706" : "#475569";
                
                return (
                  <g key={i}>
                    <rect 
                      x={discX} 
                      y="230" 
                      width="3.5" 
                      height="140" 
                      rx="1" 
                      fill={discColor} 
                      stroke={borderC} 
                      strokeWidth="0.75" 
                    />
                    {/* Small tabs showing fixed splines */}
                    {!isMobile && (
                      <>
                        <rect x={discX - 1.5} y="225" width="6" height="6" fill="#475569" />
                        <rect x={discX - 1.5} y="369" width="6" height="6" fill="#475569" />
                      </>
                    )}
                  </g>
                );
              })}
            </g>

            {/* 4. PISTON DE SERRAGE SAHR (Sliding horizontally with pistonX) */}
            <g 
              transform={`translate(${pistonX}, 0)`}
              onClick={() => setClickedPart("piston")}
              onMouseEnter={() => setHoveredPart("piston")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300 transition-transform duration-500"
              opacity={hoveredPart === "piston" || clickedPart === "piston" ? 1.0 : 0.95}
            >
              {/* Massive pressure piston acting on disc stack */}
              <path d="M 450 210 L 480 210 L 480 390 L 450 390 L 450 350 L 438 350 L 438 250 L 450 250 Z" fill="#334155" stroke={clickedPart === "piston" ? "#fbbf24" : "#94a3b8"} strokeWidth="2" />
              {/* Piston sealing ring */}
              <rect x="465" y="210" width="8" height="6" fill="#ef4444" />
              <rect x="465" y="384" width="8" height="6" fill="#ef4444" />
              <text x="495" y="250" fill="#cbd5e1" fontSize="9" fontFamily="monospace" fontWeight="bold">PISTON SAHR</text>
            </g>

            {/* 5. RESSORTS BELLEVILLE DE PUISSANCE (Behind piston, scaleX compressed) */}
            <g 
              transform={`translate(500, 260) scale(${springScaleX}, 1)`}
              onClick={() => setClickedPart("ressorts")}
              onMouseEnter={() => setHoveredPart("ressorts")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300 transition-transform duration-500"
              opacity={hoveredPart === "ressorts" || clickedPart === "ressorts" ? 1.0 : 0.9}
            >
              {/* Draw 6 stacked Belleville cup springs */}
              {Array.from({ length: 6 }).map((_, i) => {
                const sx = i * 20;
                return (
                  <path 
                    key={i} 
                    d={`M ${sx} 0 L ${sx + 10} 40 L ${sx} 80 L ${sx + 15} 40 Z`} 
                    fill="#475569" 
                    stroke={clickedPart === "ressorts" ? "#fbbf24" : "#f59e0b"} 
                    strokeWidth="2" 
                  />
                );
              })}
              <text x="60" y="-12" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">RESSORTS BELLEVILLE</text>
            </g>

            {/* 6. ACCUMULATEUR D'AZOTE DE PURGE RAPIDE (Top right) */}
            <g 
              onClick={() => setClickedPart("accumulateur")}
              onMouseEnter={() => setHoveredPart("accumulateur")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "accumulateur" || clickedPart === "accumulateur" ? 1.0 : 0.8}
            >
              <path d="M 450 110 A 12 12 0 0 1 474 110 L 474 70 A 12 12 0 0 1 450 70 Z" fill="#0f172a" stroke={clickedPart === "accumulateur" ? "#fbbf24" : "#ef4444"} strokeWidth="2" />
              <text x="462" y="132" fill="#ef4444" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">ACCU PURGE</text>
            </g>

            {/* 7. DIGITAL TEMPERATURE AND PRESSURE READOUTS HUD */}
            <g 
              onClick={() => setClickedPart("capteur_temp")}
              onMouseEnter={() => setHoveredPart("capteur_temp")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "capteur_temp" || clickedPart === "capteur_temp" ? 1.0 : 0.9}
            >
              <circle cx="230" cy="170" r="12" fill="#1e293b" stroke={tempColor} strokeWidth="2" />
              <text x="230" y="174" fill={tempColor} fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">T°</text>
              <g transform="translate(230, 130)">
                <rect x="-35" y="-12" width="70" height="24" rx="4" fill="#020617" stroke={tempColor} strokeWidth="1.5" />
                <text x="0" y="4" fill={tempColor} fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {activeTemp} °C
                </text>
              </g>
              <text x="230" y="105" fill={tempColor} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SONDE DE T° D'HUILE</text>
            </g>

            {/* PRESSURE GAUGE RELEASE MANOMETRE */}
            <g 
              onClick={() => setClickedPart("manometre")}
              onMouseEnter={() => setHoveredPart("manometre")}
              onMouseLeave={() => setHoveredPart(null)}
              className="cursor-pointer transition-all duration-300"
              opacity={hoveredPart === "manometre" || clickedPart === "manometre" ? 1.0 : 0.9}
            >
              <circle cx="400" cy="70" r="14" fill="#1e293b" stroke={activePressure > 40 ? "#3b82f6" : "#ef4444"} strokeWidth="2.5" />
              <text x="400" y="74" fill={activePressure > 40 ? "#3b82f6" : "#ef4444"} fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">P</text>
              
              <g transform="translate(400, 32)">
                <rect x="-35" y="-12" width="70" height="24" rx="4" fill="#020617" stroke={activePressure > 40 ? "#3b82f6" : "#ef4444"} strokeWidth="1.5" />
                <text x="0" y="3" fill={activePressure > 40 ? "#3b82f6" : "#ef4444"} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {activePressure} bar
                </text>
              </g>
              <text x="400" y="12" fill="#cbd5e1" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">PRESSURE SENSOR</text>
            </g>

            {/* Final state green check mark overlay */}
            {time >= 42 && (
              <g transform="translate(460, 300)" className="animate-bounce">
                <circle cx="0" cy="0" r="32" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" opacity="0.9" />
                <path d="M -13 2 L -3 11 L 13 -8" fill="none" stroke="#10b981" strokeWidth="4.5" strokeLinecap="round" />
              </g>
            )}

            {/* Tooltip render inside SVG canvas */}
            {hoveredPart && PARTS_DATA[hoveredPart] && (
              <g transform={`translate(${PARTS_DATA[hoveredPart].x}, ${PARTS_DATA[hoveredPart].y - 35})`}>
                <rect x="-100" y="-18" width="200" height="24" rx="4" fill="#1e293b" stroke="#ef4444" strokeWidth="1" opacity="0.95" />
                <text x="0" y="-4" fill="#f8fafc" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                  {PARTS_DATA[hoveredPart].name}
                </text>
              </g>
            )}

          </svg>
        </div>

        {/* Timeline controls */}
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
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center gap-1.5 transition-colors text-xs"
              >
                <Pause size={14} /> PAUSE
              </button>
            ) : (
              <button 
                onClick={handlePlay} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center gap-1.5 transition-colors text-xs"
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
              className="flex-1 accent-red-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">00:45</span>
          </div>
        </div>
      </div>

      {/* Right details box */}
      <div className="w-full lg:w-80 flex flex-col bg-[#0b0f19] border border-slate-800/80 rounded-xl p-5 shrink-0 justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
            <Info size={16} className="text-red-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">Infos de Freinage SAHR</h4>
          </div>

          {clickedPart && PARTS_DATA[clickedPart] ? (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <span className="text-[10px] text-red-400 font-bold font-mono">DÉTAILS COMPOSANT</span>
                <h5 className="text-md font-bold text-slate-100 font-mono">{PARTS_DATA[clickedPart].name}</h5>
              </div>

              <div className="bg-[#050810] p-3 rounded border border-slate-850 space-y-2">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">RÉFÉRENCE CONSTRUCTEUR</div>
                  <div className="text-xs text-slate-200 font-mono font-bold">{PARTS_DATA[clickedPart].ref}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">MATÉRIAU ET PROCESS</div>
                  <div className="text-xs text-slate-300">{PARTS_DATA[clickedPart].material}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">SPÉCIFICATIONS MÉCANIQUES</div>
                  <div className="text-xs text-red-400 font-mono">{PARTS_DATA[clickedPart].spec}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-red-500 font-bold font-mono uppercase">🚨 DIAGNOSTIC PANNE COUPLÉ</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed bg-red-950/20 p-2.5 rounded border border-red-900/30">
                  {PARTS_DATA[clickedPart].failure}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              <p>Sélectionnez un organe de l'étrier sur le schéma de gauche pour voir ses caractéristiques d'usure et consignes d'entretien.</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1.5 bg-[#cbd5e1] rounded-sm"></span>
            <span>Ressorts, Pistons et Organes fixes acier</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1.5 bg-[#fbbf24] rounded-sm"></span>
            <span>Disques de Friction Mobiles (Bronze)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1.5 bg-[#0284c7] rounded-sm"></span>
            <span>Circuit d'Huile de Force Cooling (Refroidissement)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
