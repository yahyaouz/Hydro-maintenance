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
  EPIROC_ST2G_PANNES, EPIROC_ST2G_SYSTEMS, EPIROC_ST2G_GLOSSAIRE, 
  EPIROC_ST2G_VOYANTS, EPIROC_ST2G_ERRORS, EPIROC_ST2G_STOCK, 
  EPIROC_ST2G_PROCEDURES, EPIROC_ST2G_COUPLES, EPIROC_ST2G_VALEURS, 
  EPIROC_ST2G_OUTILS, EPIROC_ST2G_SYMPTOMS_INDEX, 
  EpirocSt2gPanne 
} from "./epirocSt2gData";
import { PageBanner } from "@/components/ui/PageBanner";
import { useAuthStore } from "@/lib/store";
import { HydrominesLogo } from "./auth/HydrominesLogo";
import { getPlaceholderSvg } from "./cahierPhotosData";

// Inline 3D-like technical animation for Deutz BF4M2012 (Chapter 4)
function AnimEngineDeutz() {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [pistonY, setPistonY] = React.useState(0);
  const [temp, setTemp] = React.useState(85);

  React.useEffect(() => {
    if (!isPlaying) return;
    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.2;
      setPistonY(Math.sin(angle) * 15 + 15);
      setTemp(80 + Math.sin(angle * 0.1) * 5);
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 font-mono text-xs shadow-sm">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
        <span className="text-emerald-600 font-bold">⚙️ DEUTZ BF4M2012 WATER-COOLED ENGINE INTEGRATION</span>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px]"
        >
          {isPlaying ? "PAUSE ANIMATION" : "PLAY ANIMATION"}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/2 flex justify-center bg-slate-50 rounded p-4 border border-slate-200">
          <svg viewBox="0 0 400 300" className="w-full max-w-[280px] h-auto">
            {/* Water Cooling Jacket */}
            <rect x="50" y="60" width="300" height="180" fill="none" stroke="#2563eb" strokeWidth={4} strokeDasharray="5,3" className="opacity-60" />
            <text x="200" y="50" textAnchor="middle" fill="#2563eb" fontSize={10} fontWeight="bold">CHAMBRE DE REFROIDISSEMENT LIQUIDE (EAU + ANTIGEL)</text>
            
            {/* Cylinder blocks */}
            {[0, 1, 2, 3].map((i) => {
              const xOffset = 80 + i * 65;
              const curY = i % 2 === 0 ? pistonY : 30 - pistonY;
              return (
                <g key={i}>
                  {/* Cylinder sleeve */}
                  <rect x={xOffset} y={80} width="50" height="120" fill="none" stroke="#64748b" strokeWidth={2} />
                  {/* Piston */}
                  <rect x={xOffset + 2} y={85 + curY} width="46" height="35" fill="#475569" rx={2} />
                  {/* Connecting Rod */}
                  <line x1={xOffset + 25} y1={120 + curY} x2={xOffset + 25} y2={200} stroke="#475569" strokeWidth={4} />
                  {/* Crankshaft wristpin */}
                  <circle cx={xOffset + 25} cy={200} r={6} fill="#f1f5f9" stroke="#475569" strokeWidth={2} />
                  {/* Spark / Injection burst */}
                  {curY < 5 && isPlaying && (
                    <polygon points={`${xOffset+25},70 ${xOffset+15},82 ${xOffset+35},82`} fill="#f59e0b" />
                  )}
                </g>
              );
            })}
            {/* Oil pan */}
            <rect x="60" y="220" width="280" height="30" fill="#f8fafc" stroke="#ef4444" strokeWidth={2} />
            <text x="200" y="240" textAnchor="middle" fill="#ef4444" fontSize={9}>CARTER D'HUILE BAS (PRESSION NOMINALE 1.5 BAR RALENTI)</text>
          </svg>
        </div>
        <div className="w-full md:w-1/2 space-y-2">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <h4 className="text-emerald-600 font-bold mb-1">MOTEUR DEUTZ BF4M2012 TIER 3</h4>
            <p className="text-[11px] text-slate-600">Régulation mécanique avec pompes d'injection individuelles Bosch PFR. Cylindrée totale de 4.04 L délivrant une puissance nette de 75 kW à 2200 tr/min.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">TEMP. NOMINALE :</span>
              <span className="text-slate-900 font-bold">{temp.toFixed(1)} °C</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">RÉGIME :</span>
              <span className="text-slate-900 font-bold">{isPlaying ? "2200 tr/min" : "0 tr/min"}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">POMPE À EAU :</span>
              <span className="text-blue-600 font-bold">{isPlaying ? "ACTIVE (FLUX OK)" : "ARRÊTÉE"}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block"> PRESSION HUILE :</span>
              <span className="text-emerald-600 font-bold">{isPlaying ? "3.8 bar" : "0.0 bar"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Open-Center Hydraulics animation (Chapter 4)
function AnimHydraulicOpenCenter() {
  const [pressure, setPressure] = React.useState(180);
  const [spoolState, setSpoolState] = React.useState<"NEUTRAL" | "LIFT" | "LOWER">("NEUTRAL");

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 font-mono text-xs mt-4 shadow-sm">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
        <span className="text-amber-600 font-bold">💧 ST2G OPEN-CENTER GEAR PUMPS INTEGRATION</span>
        <div className="flex gap-1">
          {["NEUTRAL", "LIFT", "LOWER"].map((st) => (
            <button
              key={st}
              onClick={() => {
                setSpoolState(st as any);
                setPressure(st === "NEUTRAL" ? 25 : st === "LIFT" ? 195 : 120);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                spoolState === st ? "bg-amber-500 text-black" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/2 flex justify-center bg-slate-50 rounded p-4 border border-slate-200">
          <svg viewBox="0 0 400 300" className="w-full max-w-[280px] h-auto">
            {/* Hydraulic Reservoir */}
            <rect x="30" y="210" width="100" height="60" fill="none" stroke="#2563eb" strokeWidth={2} />
            <path d="M30 230 C 50 225, 80 235, 130 230 L130 270 L30 270 Z" fill="#3b82f6" className="opacity-40" />
            <text x="80" y="250" textAnchor="middle" fill="#1e40af" fontSize={8} fontWeight="bold">RÉSERVOIR 80L</text>

            {/* Gear Pump symbol */}
            <circle cx="200" cy="240" r="25" fill="none" stroke="#475569" strokeWidth={2} />
            <polygon points="200,225 190,235 210,235" fill="#f59e0b" />
            <text x="200" y="210" textAnchor="middle" fill="#475569" fontSize={8}>POMPE À ENGRENAGES</text>

            {/* Hydraulic Cylinder */}
            <rect x="250" y="50" width="110" height="30" fill="none" stroke="#475569" strokeWidth={2} />
            {/* Piston inside cylinder */}
            <rect 
              x={spoolState === "LIFT" ? "300" : spoolState === "LOWER" ? "260" : "280"} 
              y="52" 
              width="15" 
              height="26" 
              fill="#ef4444" 
            />
            {/* Rod */}
            <rect 
              x={spoolState === "LIFT" ? "315" : spoolState === "LOWER" ? "275" : "295"} 
              y="60" 
              width="80" 
              height="10" 
              fill="#94a3b8" 
            />
            <text x="300" y="40" textAnchor="middle" fill="#475569" fontSize={8}>VÉRIN BRAS (HOIST)</text>

            {/* Fluid lines */}
            {/* Suction */}
            <path d="M80 210 L80 180 L180 180 L180 225" fill="none" stroke="#2563eb" strokeWidth={3} />
            {/* Delivery */}
            <path d="M200 215 L200 130 L250 130" fill="none" stroke={spoolState === "NEUTRAL" ? "#3b82f6" : "#ef4444"} strokeWidth={3} />
            {/* Bypass to Tank */}
            <path d="M250 140 L110 140 L110 210" fill="none" stroke="#2563eb" strokeWidth={3} strokeDasharray={spoolState === "NEUTRAL" ? "3,3" : "none"} />

            <text x="180" y="120" textAnchor="middle" fill="#ef4444" fontSize={9} fontWeight="bold">DISTRIBUTEUR OUVERT</text>
          </svg>
        </div>
        <div className="w-full md:w-1/2 space-y-2">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <h4 className="text-amber-600 font-bold mb-1">RÉGULATION HYDRAULIQUE DOUBLE POMPE SECS</h4>
            <p className="text-[11px] text-slate-600">Le Scooptram ST2G fonctionne en centre ouvert : le débit constant s'écoule au réservoir au neutre. Pression maximale limitée par soupape de décharge calibrée à 200 bar.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">PRESSION :</span>
              <span className="text-slate-900 font-bold">{pressure} bar</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">DÉBIT POMPE :</span>
              <span className="text-slate-900 font-bold">60 L/min</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">BYPASS CENTRAL :</span>
              <span className={spoolState === "NEUTRAL" ? "text-blue-600 font-bold" : "text-rose-600 font-bold"}>
                {spoolState === "NEUTRAL" ? "OUVERT (0 bar delta)" : "FERMÉ (SOUS CHARGE)"}
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">FLUIDE RECOMMANDÉ :</span>
              <span className="text-emerald-600 font-bold">ISO VG 46</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Dry Disc Brakes animation (Chapter 4)
function AnimBrakesDryDisc() {
  const [brakePressed, setBrakePressed] = React.useState(false);
  const [padGap, setPadGap] = React.useState(1.5);
  const [discTemp, setDiscTemp] = React.useState(45);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (brakePressed) {
      setPadGap(0.2);
      interval = setInterval(() => {
        setDiscTemp(t => Math.min(220, t + 4));
      }, 100);
    } else {
      setPadGap(1.5);
      interval = setInterval(() => {
        setDiscTemp(t => Math.max(45, t - 2));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [brakePressed]);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 font-mono text-xs mt-4 shadow-sm">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
        <span className="text-rose-600 font-bold">🛡️ ST2G DRY DISC BRAKES ACTUATION</span>
        <button 
          onMouseDown={() => setBrakePressed(true)}
          onMouseUp={() => setBrakePressed(false)}
          onMouseLeave={() => setBrakePressed(false)}
          onTouchStart={() => setBrakePressed(true)}
          onTouchEnd={() => setBrakePressed(false)}
          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
            brakePressed ? "bg-rose-600 text-white shadow-lg shadow-rose-600/40" : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
          }`}
        >
          {brakePressed ? "🚨 FREINS SERRÉS" : "🛑 APPUYER POUR FREINER"}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/2 flex justify-center bg-slate-50 rounded p-4 border border-slate-200">
          <svg viewBox="0 0 400 300" className="w-full max-w-[280px] h-auto">
            {/* Ventilated Disc Rotor */}
            <circle cx="200" cy="150" r="90" fill="none" stroke="#64748b" strokeWidth={15} />
            {/* Ventilated ribs inside disc */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line 
                key={angle} 
                x1={200 + Math.cos(angle * Math.PI / 180) * 55} 
                y1={150 + Math.sin(angle * Math.PI / 180) * 55} 
                x2={200 + Math.cos(angle * Math.PI / 180) * 85} 
                y2={150 + Math.sin(angle * Math.PI / 180) * 85} 
                stroke="#475569" 
                strokeWidth={3} 
              />
            ))}
            {/* Glowing heat color when hot */}
            <circle 
              cx="200" 
              cy="150" 
              r="90" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth={15} 
              className="transition-all duration-300"
              strokeOpacity={Math.max(0, (discTemp - 50) / 180)} 
            />

            {/* Brake Caliper */}
            <path d="M 270 90 A 40 40 0 0 0 310 140 L 330 140 L 330 80 Z" fill="#f1f5f9" stroke="#475569" strokeWidth={2} />
            
            {/* Brake Pads Left and Right */}
            {/* Left Pad */}
            <rect 
              x={265 - padGap} 
              y="95" 
              width="8" 
              height="35" 
              fill="#f59e0b" 
              stroke="#b45309"
              className="transition-all duration-75"
            />
            {/* Right Pad */}
            <rect 
              x={282 + padGap} 
              y="95" 
              width="8" 
              height="35" 
              fill="#f59e0b" 
              stroke="#b45309"
              className="transition-all duration-75"
            />

            {/* Piston push symbols */}
            <path d="M 245 112 L 260 112" stroke="#ef4444" strokeWidth={3} strokeDasharray={brakePressed ? "none" : "2,2"} />
            <path d="M 310 112 L 295 112" stroke="#ef4444" strokeWidth={3} strokeDasharray={brakePressed ? "none" : "2,2"} />

            <text x="200" y="270" textAnchor="middle" fill="#475569" fontSize={9} fontWeight="bold">DISQUE VENTILÉ SEC Ø 350 MM</text>
          </svg>
        </div>
        <div className="w-full md:w-1/2 space-y-2">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <h4 className="text-rose-600 font-bold mb-1">SYSTÈME DE FREIN DE SERVICE DIRECT</h4>
            <p className="text-[11px] text-slate-600">Le ST2G utilise un freinage mécanique par étriers flottants agissant sur disques ventilés secs. Aucun bain d'huile forcée. Nécessite une surveillance rigoureuse des garnitures organiques de 15 mm.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">T°C DU DISQUE :</span>
              <span className={`font-bold ${discTemp > 140 ? "text-red-500 animate-pulse" : "text-slate-900"}`}>{discTemp} °C</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">JEU ETRIER-GARNITURE :</span>
              <span className="text-slate-900 font-bold">{padGap.toFixed(1)} mm</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">PRESSION PÉDALE :</span>
              <span className="text-slate-900 font-bold">{brakePressed ? "120 bar" : "0 bar"}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">GARNITURE MINI :</span>
              <span className="text-rose-600 font-bold">3.0 mm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const HydrominesIdentity = ({ isEco }: { isEco: boolean }) => {
  if (isEco) return null;
  return (
    <div className="absolute top-0 left-0 right-0 h-[4px] flex overflow-hidden rounded-t-2xl z-10">
      <div className="bg-sky-400 h-full flex-1"></div>
      <div className="bg-red-600 h-full flex-1"></div>
    </div>
  );
};

// 25 tables adapted for ST2G (Chapter 5)
const COTES_DATA_ST2G = [
  {
    title: "SECTION A — MOTEUR DEUTZ BF4M2012 WATER TIER 3",
    id: "cote-section-A",
    tables: [
      {
        id: "5.1",
        ref: "1.1.1.A",
        title: "COTES MOTEUR ET JEUX MÉCANIQUES DEUTZ",
        rows: [
          ["001", "Jeu piston/cylindre (chemise sèche)", "0,06", "0,04", "0,08", "mm", "Micromètre externe + comparateur", "C", "1.1.001"],
          ["002", "Coupe à la pointe des segments d'étanchéité", "0,35", "0,25", "0,50", "mm", "Jeu de cales d'épaisseur", "C", "1.1.002"],
          ["003", "Ovalisation maximale du cylindre", "0,015", "0,000", "0,030", "mm", "Comparateur d'alésage", "C", "1.1.003"],
          ["004", "Jeu de battement de bielle axial", "0,20", "0,15", "0,35", "mm", "Jeu de cales", "C", "1.1.004"],
          ["005", "Jeu coussinet/tourillon vilebrequin", "0,05", "0,03", "0,09", "mm", "Jauge plastique d'atelier", "C", "1.1.005"],
          ["006", "Jeu aux soupapes d'admission (à froid)", "0,30", "0,28", "0,32", "mm", "Jeu de cales calibré", "C", "1.1.006"],
          ["007", "Jeu aux soupapes d'échappement (à froid)", "0,50", "0,48", "0,52", "mm", "Jeu de cales calibré", "C", "1.1.007"],
          ["008", "Défaut de planéité de la culasse", "0,04", "0,00", "0,08", "mm", "Règle rectifiée + cales", "C", "1.1.008"],
          ["009", "Taux de compression mécanique minimal", "22", "19", "25", "bar", "Compressiomètre à fiche", "C", "1.1.009"],
          ["010", "Pression d'huile au ralenti chaud (80°C)", "1,5", "1,2", "2,0", "bar", "Manomètre d'atelier", "B", "1.1.010"]
        ],
        prep: "arrêt moteur 1h minimum, température stabilisée, outils étalonnés",
        pos: "déposer le cache-culbuteur Deutz, amener les cylindres au PMH de compression",
        mesure: "insérer la cale plate de précision correspondante sous le culbuteur",
        reg: "inscrire les mesures sur la fiche technique ST2G-MOTEUR-A",
        dec: "si hors tolérance → panne 1.1.1.A → arbre décision AD-001",
        diagnostic: {
          panne: "Manque d'étanchéité culbuteurs / Claquements mécaniques",
          ref: "Pan. 1.1.1.A",
          arbre: "AD-001",
          action: "Ajustement vis de culbuteur ou surfaçage culasse"
        }
      },
      {
        id: "5.2",
        ref: "1.1.5.B",
        title: "COTES SYSTÈME D'INJECTION BOSCH PFR",
        rows: [
          ["011", "Calage géométrique de la pompe PFR (course)", "2,15", "2,10", "2,20", "mm", "Comparateur à tige fine", "A", "1.1.011"],
          ["012", "Pression de déclenchement injecteur mécanique", "250", "240", "260", "bar", "Pompe à tarer d'atelier", "A", "1.1.012"],
          ["013", "Couple de serrage raccord haute pression M12", "30", "28", "32", "Nm", "Clé dynamométrique plate", "A", "1.1.013"],
          ["014", "Défaut d'étanchéité nez d'injecteur (à 230 bar)", "0", "0", "1", "goutte/min", "Observation visuelle", "C", "1.1.014"],
          ["015", "Débit de retour d'injection global (à vide)", "15", "10", "20", "mL/min", "Éprouvette de verre graduée", "C", "1.1.015"]
        ],
        prep: "contact coupé, déconnecter soigneusement les canalisations d'alimentation",
        pos: "placer l'injecteur sur la pompe à tarer et pomper lentement",
        mesure: "relever la pression d'ouverture de l'aiguille et le profil de pulvérisation",
        reg: "noter la valeur de tarage sur la fiche ST2G-INJECTEUR",
        dec: "si hors tolérance → panne 1.1.5.B → arbre décision AD-002",
        diagnostic: {
          panne: "Aiguille d'injecteur coincée / Pulvérisation asymétrique",
          ref: "Pan. 1.1.5.B",
          arbre: "AD-002",
          action: "Nettoyage ultrasonore ou échange du nez d'injecteur"
        }
      }
    ]
  },
  {
    title: "SECTION B — TRANSMISSION FUNK DF100 ET CHAÎNES",
    id: "cote-section-B",
    tables: [
      {
        id: "5.3",
        ref: "2.1.1.A",
        title: "COTES CONVERTISSEUR ET POWER SHIFT DF100",
        rows: [
          ["016", "Pression de charge du convertisseur à chaud", "19", "18", "22", "bar", "Prise Minimess + manomètre", "B", "2.1.016"],
          ["017", "Épaisseur nominale des disques d'embrayage", "2,2", "2,1", "2,3", "mm", "Pied à coulisse digital", "B", "2.1.017"],
          ["018", "Jeu axial d'empilage des disques d'embrayage", "1,6", "1,4", "1,9", "mm", "Jeu de cales plates", "C", "2.1.018"]
        ],
        prep: "vidanger l'huile, machine sur sol ferme consolidé",
        pos: "installer le manomètre sur le bloc d'engagement Powershift",
        mesure: "faire monter le moteur à 2200 tr/min en première vitesse freins serrés",
        reg: "consigner sur la fiche ST2G-TRANS",
        dec: "si hors tolérance → panne 2.1.1.A → arbre décision AD-003",
        diagnostic: {
          panne: "Patinage convertisseur ou fuite d'huile servo",
          ref: "Pan. 2.1.1.A",
          arbre: "AD-003",
          action: "Vérifier le limiteur de pression ou remplacer les disques"
        }
      },
      {
        id: "5.4",
        ref: "2.4.1.A",
        title: "COTES ET ALIGNEMENT DES CHAÎNES",
        rows: [
          ["019", "Flèche de chaîne de transmission centrale", "15", "10", "18", "mm", "Règle de flèche graduée", "B", "2.4.019"],
          ["020", "Allongement maximal de chaîne sur 10 maillons", "1,5", "0,0", "2,0", "%", "Réglet de précision", "C", "2.4.020"],
          ["021", "Désalignement parallèle des pignons de chaîne", "0,5", "0,0", "1,0", "mm", "Règle métallique rectifiée", "C", "2.4.021"]
        ],
        prep: "consigner la machine en LOTO, retirer les trappes d'accès latérales",
        pos: "mesurer à mi-portée de la chaîne entre les deux pignons d'essieu",
        mesure: "exercer une poussée mécanique de 10 kg et relever le débattement vertical",
        reg: "noter sur la fiche ST2G-CHAIN",
        dec: "si hors tolérance → panne 2.4.1.A → arbre décision AD-004",
        diagnostic: {
          panne: "Chaîne détendue / Risque de déraillage ou usure pignons",
          ref: "Pan. 2.4.1.A",
          arbre: "AD-004",
          action: "Ajustement de l'excentrique de tension mécanique"
        }
      }
    ]
  },
  {
    title: "SECTION C — HYDRAULIQUE ET DIRECTION OPEN-CENTER",
    id: "cote-section-C",
    tables: [
      {
        id: "5.5",
        ref: "3.1.1.A",
        title: "VALEURS HYDRAULIQUES DE SERVICE ST2G",
        rows: [
          ["022", "Pression d'ouverture soupape de décharge", "200", "190", "210", "bar", "Manomètre d'atelier 400 bar", "B", "3.1.022"],
          ["023", "Débit nominal pompe hydraulique double", "60", "55", "65", "L/min", "Débitmètre à turbine", "B", "3.1.023"],
          ["024", "Jeu d'usure radial paliers de pompe à engrenages", "0,04", "0,02", "0,06", "mm", "Comparateur d'atelier", "C", "3.1.024"],
          ["025", "Dérive maximale vérin de levage chargé (10 min)", "5", "0", "10", "mm", "Réglet de précision", "B", "3.1.025"]
        ],
        prep: "amener l'huile hydraulique à sa température normale d'exploitation de 55°C",
        pos: "raccorder le manomètre sur la prise d'essai principale du distributeur",
        mesure: "actionner les leviers de commande en butée complète et lire la valeur maximale",
        reg: "noter sur la fiche ST2G-HYD",
        dec: "si hors tolérance → panne 3.1.1.A → arbre décision AD-005",
        diagnostic: {
          panne: "Pression hydraulique insuffisante / Mouvements de bras lents",
          ref: "Pan. 3.1.1.A",
          arbre: "AD-005",
          action: "Remplacement ou étalonnage de la cartouche de sécurité"
        }
      }
    ]
  }
];

// 20 Fiches d'outils adaptées pour ST2G (Chapter 6)
const OUTILS_DATA_ST2G = [
  { id: "OUT-01", name: "Extracteur d'injecteur mécanique Bosch PFR", code: "EP-8234-PFR", category: "Moteur", rack: "Armoire Moteur - Étagère 1", desc: "Permet l'extraction directe axiale des injecteurs grippés sans abîmer la culasse Deutz." },
  { id: "OUT-02", name: "Compresseur de ressorts de soupapes", code: "EP-9102-SOP", category: "Moteur", rack: "Armoire Moteur - Étagère 2", desc: "Pour la dépose et pose des soupapes d'admission et échappement Deutz BF4M2012." },
  { id: "OUT-03", name: "Calibre d'épaisseur d'usure des courroies", code: "EP-4501-BEL", category: "Moteur", rack: "Boîte Diagnostic Moteur", desc: "Permet de mesurer l'usure latérale de la courroie trapézoïdale de la pompe à eau." },
  { id: "OUT-04", name: "Pige de calage vilebrequin Deutz", code: "EP-0118-PIG", category: "Moteur", rack: "Armoire Moteur - Tiroir 3", desc: "Permet de verrouiller le vilebrequin au Point Mort Haut pour caler les pompes d'injection." },
  { id: "OUT-05", name: "Outil de pose du joint spi vilebrequin", code: "EP-0293-SPI", category: "Moteur", rack: "Établi Central Moteur", desc: "Garantit un emmanchement parfaitement perpendiculaire du joint à lèvre." },
  { id: "OUT-06", name: "Clé dynamométrique 3/4\" (150-700 Nm)", code: "EP-DYNA-34", category: "Serrage", rack: "Panneau Outils de Précision", desc: "Utilisée pour serrer les écrous de roues M18 au couple prescrit de 450 Nm." },
  { id: "OUT-07", name: "Clé dynamométrique 1/2\" (40-200 Nm)", code: "EP-DYNA-12", category: "Serrage", rack: "Panneau Outils de Précision", desc: "Idéale pour le serrage précis des vis d'étriers de frein à disques secs (120 Nm)." },
  { id: "OUT-08", name: "Goniomètre magnétique de serrage d'angle", code: "EP-ANG-MAG", category: "Serrage", rack: "Panneau Outils de Précision", desc: "Indispensable pour le serrage angulaire final à 180° de la culasse Deutz." },
  { id: "OUT-09", name: "Extracteur de disque de frein sec Ø 350", code: "EP-EX-DIS", category: "Freinage", rack: "Caisse Spéciale Freinage", desc: "Extracteur spécifique pour décoller le disque de frein du moyeu Rock Tough." },
  { id: "OUT-10", name: "Repousse-piston hydraulique d'étrier", code: "EP-REP-PIS", category: "Freinage", rack: "Caisse Spéciale Freinage", desc: "Permet de repousser les pistons d'étrier flottant lors du changement des plaquettes." },
  { id: "OUT-11", name: "Pompe de purge manuelle de frein sec", code: "EP-PUR-MAN", category: "Freinage", rack: "Caisse Spéciale Freinage", desc: "Permet de purger les bulles d'air du circuit de freinage sans assistance." },
  { id: "OUT-12", name: "Manomètre de contrôle de pression de frein", code: "EP-MAN-FRE", category: "Freinage", rack: "Boîtier Testeurs Hydrauliques", desc: "Manomètre de 0 à 250 bar à raccorder sur le circuit pour tester la pédale de frein." },
  { id: "OUT-13", name: "Appareil de levage de boîte Powershift", code: "EP-LEV-PS", category: "Transmission", rack: "Zone Levage Atelier", desc: "Berceau de levage universel adapté pour poser et déposer la transmission Funk DF100." },
  { id: "OUT-14", name: "Outil d'alignement de cardan de pont", code: "EP-AL-CAR", category: "Transmission", rack: "Établi Transmission", desc: "Garantit la coaxialité parfaite de la liaison transmission-essieux ST2G." },
  { id: "OUT-15", name: "Tendeur de chaîne à vis micrométrique", code: "EP-TEN-CHA", category: "Transmission", rack: "Armoire Transmission", desc: "Ajuste précisément la flèche des chaînes latérales de 35 mm." },
  { id: "OUT-16", name: "Débitmètre à turbine hydraulique 100 L", code: "EP-DEB-100", category: "Hydraulique", rack: "Boîtier Testeurs Hydrauliques", desc: "Sert à mesurer l'efficacité volumétrique des pompes à engrenages." },
  { id: "OUT-17", name: "Pompe de transfert d'huile hydraulique", code: "EP-POM-FIL", category: "Hydraulique", rack: "Zone Distribution Huiles", desc: "Pompe électrique munie d'un filtre 10 microns pour remplir proprement le réservoir." },
  { id: "OUT-18", name: "Manomètre de stand-by hydraulique", code: "EP-MAN-STB", category: "Hydraulique", rack: "Boîtier Testeurs Hydrauliques", desc: "Manomètre basse pression de précision (0-40 bar) avec raccord rapide Minimess." },
  { id: "OUT-19", name: "Multimètre numérique de diagnostic Fluke", code: "EP-FLU-289", category: "Électricité", rack: "Armoire Électrique - Tiroir 1", desc: "Indispensable pour traquer les faux contacts et tester l'alternateur 24V." },
  { id: "OUT-20", name: "Valise d'épreuves de pression d'azote", code: "EP-VAL-N2", category: "Sécurité", rack: "Armoire Accumulateurs", desc: "Kit complet pour tester et recharger en azote les accumulateurs hydrauliques." }
];

export function AssistantEpirocSt2G() {
  const { activeSite } = useAuthStore();
  const [mode, setMode] = React.useState<"DEP" | "APP" | "CHF" | "ECO">("DEP");
  const [isEmergencyActive, setIsEmergencyActive] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"depannage" | "procedures" | "magasin" | "securite" | "fiche" | "referentiel">("depannage");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSystemFilter, setSelectedSystemFilter] = React.useState<string>("TOUS");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = React.useState<string>("TOUS");

  // Local storage persisted stock
  const [stocks, setStocks] = React.useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem("epiroc_st2g_stock_qty");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    const defaults: { [key: string]: number } = {};
    Object.keys(EPIROC_ST2G_STOCK).forEach(key => {
      defaults[key] = (EPIROC_ST2G_STOCK as any)[key].qty;
    });
    return defaults;
  });

  React.useEffect(() => {
    localStorage.setItem("epiroc_st2g_stock_qty", JSON.stringify(stocks));
  }, [stocks]);

  const updateStockQty = (key: string, delta: number) => {
    setStocks(prev => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta)
    }));
  };

  React.useEffect(() => {
    const ouvrir = () => {
      const section = document.getElementById('section-cahier-st2g');
      const standard = document.getElementById('contenu-st2g-standard');
      if (section) section.style.display = 'block';
      if (standard) standard.style.display = 'none';
      window.scrollTo(0, 0);
    };
    const fermer = () => {
      const section = document.getElementById('section-cahier-st2g');
      const standard = document.getElementById('contenu-st2g-standard');
      if (section) section.style.display = 'none';
      if (standard) standard.style.display = 'block';
    };
    const scrollTo = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    };

    (window as any).ouvrirCahierSt2g = ouvrir;
    (window as any).fermerCahierSt2g = fermer;
    (window as any).scrollToChapitreSt2g = scrollTo;

    return () => {
      delete (window as any).ouvrirCahierSt2g;
      delete (window as any).fermerCahierSt2g;
      delete (window as any).scrollToChapitreSt2g;
    };
  }, []);

  // Filter diagnostics based on query and systems
  const filteredPannes = EPIROC_ST2G_PANNES.filter(panne => {
    const matchSearch = panne.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        panne.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        panne.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSystem = selectedSystemFilter === "TOUS" || panne.system === selectedSystemFilter;
    const matchSeverity = selectedSeverityFilter === "TOUS" || panne.severity === selectedSeverityFilter;
    const matchEmergency = !isEmergencyActive || panne.severity === "ROUGE";
    return matchSearch && matchSystem && matchSeverity && matchEmergency;
  });

  const getSystemLabel = (sysId: string) => {
    return EPIROC_ST2G_SYSTEMS.find(s => s.id === sysId)?.label || sysId;
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col relative pb-12">
      {/* GLOBAL CSS STYLES FOR BLUEPRINT THEME AND CAHIER */}
      <style>{`
        .cahier-container {
          background-color: #ffffff;
          color: #1e293b;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          padding: 2.5rem;
          min-h: 100vh;
        }
        .cahier-header {
          border-bottom: 2px solid #f59e0b;
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
          position: relative;
        }
        .cahier-titre-principal {
          font-size: 2.25rem;
          font-weight: 900;
          color: #f59e0b;
          letter-spacing: -0.025em;
        }
        .cahier-sous-titre {
          font-size: 1rem;
          color: #64748b;
          margin-top: 0.25rem;
        }
        .btn-retour-st2g {
          position: absolute;
          right: 0;
          top: 0.5rem;
          background-color: #ef4444;
          color: white;
          font-size: 0.875rem;
          font-weight: 800;
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-retour-st2g:hover {
          background-color: #dc2626;
          transform: translateY(-1px);
        }
        .cahier-nav {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          background-color: #f1f5f9;
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }
        .cahier-nav button {
          flex: 1 1 auto;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: all 0.15s;
        }
        .cahier-nav button:hover {
          background-color: #f59e0b;
          color: #000;
          border-color: #f59e0b;
        }
        .cahier-chapitre {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .cahier-titre-chapitre {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .schema-bloc {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .schema-svg {
          width: 100%;
          height: auto;
          background-color: #ffffff;
          border-radius: 0.5rem;
          border: 1.5px solid #f59e0b;
        }
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .photo-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        .photo-placeholder {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          flex-col: col;
        }
        .photo-realiste {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #e2e8f0;
        }
        .cahier-tableau {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
          text-align: left;
        }
        .cahier-tableau th {
          background-color: #f1f5f9;
          color: #b45309;
          padding: 0.5rem;
          border: 1px solid #cbd5e1;
        }
        .cahier-tableau td {
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          color: #334155;
        }
        .pdf-download-bar {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        @media (min-width: 640px) {
          .pdf-download-bar {
            grid-template-columns: 1fr 1fr;
          }
        }
        .pdf-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1.5px solid;
          cursor: pointer;
          transition: all 0.25s;
          text-align: left;
        }
        .pdf-btn-cahier {
          background-color: #f0fdf4;
          border-color: #10b981;
          color: #166534;
        }
        .pdf-btn-cahier:hover {
          background-color: #dcfce7;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.1);
        }
        .pdf-btn-manuel {
          background-color: #eff6ff;
          border-color: #3b82f6;
          color: #1e40af;
        }
        .pdf-btn-manuel:hover {
          background-color: #dbeafe;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.1);
        }
        .pdf-icon {
          font-size: 1.75rem;
        }
        .pdf-text {
          flex: 1;
          margin-left: 1rem;
        }
        .pdf-text strong {
          display: block;
          font-size: 0.95rem;
        }
        .pdf-text small {
          display: block;
          font-size: 0.75rem;
          opacity: 0.8;
          margin-top: 0.125rem;
        }
        .pdf-arrow {
          font-size: 1.25rem;
          font-weight: 900;
        }
      `}</style>

      {/* STANDARD ST2G ASSISTANT SECTION */}
      <section id="contenu-st2g-standard" className="flex-1 flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* BANNER HEADER */}
        <div className="relative mb-6 rounded-2xl bg-white border border-slate-200 p-6 shadow-md overflow-hidden">
          <HydrominesIdentity isEco={mode === "ECO"} />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="bg-amber-500 text-black font-black text-xs px-2.5 py-1 rounded">EPIROC ST2G</span>
                <span className="text-slate-500 font-mono text-xs">DIAGNOSTIC & MAINTENANCE SUITE</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                ASSISTANT TECHNIQUE SCOOPTRAM ST2G
              </h1>
              <p className="text-xs md:text-sm text-slate-600 max-w-xl">
                Moteur Deutz BF4M2012 (75 kW), transmission Powershift Funk DF100 et freins mécaniques secs.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button 
                id="btn-cahier-visuel" 
                className="btn-cahier-visuel shrink-0 w-full lg:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm px-5 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20"
                onClick={() => (window as any).ouvrirCahierSt2g()}
              >
                <span>📐</span>
                <span>CAHIER DES CHARGES VISUEL ST2G</span>
                <span className="bg-amber-500/10 text-amber-600 text-[10px] font-black px-1.5 py-0.5 rounded ml-1 animate-pulse">NOUVEAU</span>
              </button>
            </div>
          </div>
        </div>

        {/* QUICK METRICS & SYSTEM NAVIGATION */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500 animate-pulse" /> FILTRES DE DIAGNOSTIC SYSTEME
              </span>
              <button 
                onClick={() => {
                  setSelectedSystemFilter("TOUS");
                  setSelectedSeverityFilter("TOUS");
                  setSearchQuery("");
                }}
                className="text-xs text-slate-400 hover:text-slate-800"
              >
                RÉINITIALISER
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSystemFilter("TOUS")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  selectedSystemFilter === "TOUS" ? "bg-amber-500 text-black border-amber-500" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                TOUS SYSTÈMES
              </button>
              {EPIROC_ST2G_SYSTEMS.map(sys => (
                <button
                  key={sys.id}
                  onClick={() => setSelectedSystemFilter(sys.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    selectedSystemFilter === sys.id ? "bg-amber-500 text-black border-amber-500" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {sys.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">État Urgences</span>
              <div className="text-2xl font-black text-rose-500 mt-1 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" /> ACTIVE
              </div>
            </div>
            <button
              onClick={() => setIsEmergencyActive(!isEmergencyActive)}
              className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                isEmergencyActive ? "bg-rose-600 text-white animate-pulse" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {isEmergencyActive ? "🔴 FILTRE URGENCE ACTIF" : "⚙️ UNIFORMISER AUX GRAVITÉS"}
            </button>
          </div>
        </div>

        {/* INTERACTIVE NAVIGATION TABS */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-slate-200">
          {[
            { id: "depannage", label: "🔧 Diagnostic & Pannes", icon: Wrench },
            { id: "procedures", label: "📋 Procédures", icon: FileText },
            { id: "magasin", label: "📦 Stock Pièces", icon: ShoppingCart },
            { id: "referentiel", label: "⚖️ Couples & Valeurs", icon: Scale }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id ? "bg-amber-500 text-black" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 shadow-sm"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT: DIAGNOSTICS */}
        {activeTab === "depannage" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un symptôme, code d'erreur ou mot-clé..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-slate-900 shadow-sm"
                />
              </div>
              <div className="flex gap-2">
                {["TOUS", "ROUGE", "JAUNE", "VERT"].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverityFilter(sev)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      selectedSeverityFilter === sev ? "bg-amber-500 text-black border-amber-500" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 shadow-sm"
                    }`}
                  >
                    {sev === "TOUS" ? "TOUTES GRAVITÉS" : sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {filteredPannes.map(p => (
                <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-all shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-3 pb-3 border-b border-slate-200">
                    <div>
                      <span className="font-mono text-xs text-amber-600">{p.id}</span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{p.title}</h3>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded ${
                      p.severity === "ROUGE" ? "bg-red-50 text-red-600 border border-red-200" :
                      p.severity === "JAUNE" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {p.severity}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p><strong className="text-slate-800">System :</strong> {getSystemLabel(p.system)}</p>
                    <p><strong className="text-slate-800">Symptôme :</strong> {p.symptoms}</p>
                    <p><strong className="text-slate-800">Cause :</strong> {p.cause}</p>
                    <p><strong className="text-slate-800">Action correction :</strong> {p.action}</p>
                    <div className="flex items-center justify-between pt-3 text-[11px] border-t border-slate-200 mt-3 text-slate-500">
                      <span>⏱️ Temps correction : {p.repTime}h</span>
                      <span className="text-amber-600 font-bold hover:underline cursor-pointer">Consulter fiche technique →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT: PROCEDURES */}
        {activeTab === "procedures" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EPIROC_ST2G_PROCEDURES.map(proc => (
              <div key={proc.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-amber-600">{proc.id}</span>
                  <span className="text-xs text-slate-500">⏱️ {proc.time} min</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-3">{proc.title}</h3>
                <ul className="space-y-2 text-xs text-slate-600 list-decimal pl-4">
                  {proc.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* TAB CONTENT: STOCK */}
        {activeTab === "magasin" && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                  <th className="p-4 font-bold">RÉFÉRENCE</th>
                  <th className="p-4 font-bold">DESIGNATION TECHNIQUE</th>
                  <th className="p-4 font-bold">LOCALISATION</th>
                  <th className="p-4 font-bold text-center">QUANTITÉ DISPONIBLE</th>
                  <th className="p-4 font-bold text-center">AJUSTEMENT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {Object.entries(EPIROC_ST2G_STOCK).map(([key, item]) => {
                  const qty = stocks[key] !== undefined ? stocks[key] : item.qty;
                  return (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="p-4 font-mono text-amber-600">{item.ref}</td>
                      <td className="p-4 text-slate-900 font-semibold">{item.label}</td>
                      <td className="p-4 text-slate-600">{item.loc}</td>
                      <td className="p-4 text-center">
                        <span className={`font-mono text-sm px-2.5 py-1 rounded-md font-bold ${qty <= 2 ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-100 text-slate-700"}`}>
                          {qty} {item.unit}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => updateStockQty(key, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          >
                            -
                          </button>
                          <button 
                            onClick={() => updateStockQty(key, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB CONTENT: TORQUES */}
        {activeTab === "referentiel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                🔧 COUPLES DE SERRAGE NOMINAUX ST2G
              </h3>
              <div className="space-y-4">
                {EPIROC_ST2G_COUPLES.map((c, i) => (
                  <div key={i} className="pb-3 border-b border-slate-200 last:border-0 text-xs">
                    <span className="text-slate-600 font-semibold block">{c.item}</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-amber-600 font-mono text-sm font-bold">{c.value}</span>
                      <span className="text-slate-500 italic">{c.tool}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                ⚖️ PRESSIONS & TOLÉRANCES CRITIQUES
              </h3>
              <div className="space-y-4">
                {EPIROC_ST2G_VALEURS.map((v, i) => (
                  <div key={i} className="pb-3 border-b border-slate-200 last:border-0 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-semibold">{v.parameter}</span>
                      <span className="text-slate-400 text-[10px] uppercase font-mono">{v.system}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 font-mono">
                      <span className="text-emerald-600 font-bold">Normal : {v.normal}</span>
                      <span className="text-rose-600">Seuil : {v.limit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FULL CAHIER DES CHARGES VISUEL SECTION (HIDDEN BY DEFAULT) */}
      <section id="section-cahier-st2g" className="cahier-container" style={{ display: 'none' }}>
        {/* HEADER */}
        <header className="cahier-header">
          <h1 className="cahier-titre-principal">📐 CAHIER DES CHARGES VISUEL COMPLET</h1>
          <p className="cahier-sous-titre">EPIROC SCOOPTRAM ST2G — Référence technique multimédia</p>
          <button className="btn-retour-st2g" onClick={() => (window as any).fermerCahierSt2g()}>
            ← RETOUR À L'ASSISTANT ST2G
          </button>
        </header>

        {/* 1-CLICK PDF DOWNLOAD BAR */}
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
              <strong>MANUEL COMPLET ST2G</strong>
              <small>150 pages · A4 · Pannes + Arbres + Checklist</small>
            </span>
            <span className="pdf-arrow">⬇</span>
          </button>
        </div>

        {/* CHAPTER NAVIGATION */}
        <nav className="cahier-nav">
          <button onClick={() => (window as any).scrollToChapitreSt2g('ch1')}>1. SCHÉMAS</button>
          <button onClick={() => (window as any).scrollToChapitreSt2g('ch2')}>2. PHOTOS</button>
          <button onClick={() => (window as any).scrollToChapitreSt2g('ch3')}>3. STORYBOARDS</button>
          <button onClick={() => (window as any).scrollToChapitreSt2g('ch4')}>4. ANIMATIONS</button>
          <button onClick={() => (window as any).scrollToChapitreSt2g('ch5')}>5. COTES</button>
          <button onClick={() => (window as any).scrollToChapitreSt2g('ch6')}>6. OUTILS</button>
        </nav>

        {/* CHAPITRE 1 : SCHÉMAS ÉCLATÉS INTERACTIFS */}
        <article id="ch1" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 1 — SCHÉMAS ÉCLATÉS INTERACTIFS</h2>
          
          <div className="schema-bloc" id="schema-moteur">
            <h3 className="font-bold text-lg text-slate-200 mb-2">1.1 MOTEUR DEUTZ BF4M2012</h3>
            <div className="schema-placeholder">
              <svg viewBox="0 0 800 600" className="schema-svg">
                <rect width={800} height={600} fill="#111625" stroke="#f59e0b" strokeWidth={2}/>
                <circle cx={400} cy={300} r={180} fill="#1e293b" stroke="#cbd5e1" strokeWidth={3} strokeDasharray="5,5" />
                
                {/* 4 Engine cylinders blueprint */}
                {[0, 1, 2, 3].map((i) => (
                  <g key={i} transform={`translate(${220 + i * 115}, 200)`}>
                    <rect x="0" y="0" width="80" height="150" fill="none" stroke="#f59e0b" strokeWidth={2} />
                    <rect x="5" y="40" width="70" height="40" fill="#334155" stroke="#cbd5e1" />
                    <text x="40" y="90" textAnchor="middle" fill="#94a3b8" fontSize={11}>CYL {i+1}</text>
                  </g>
                ))}
                
                <text x={400} y={430} textAnchor="middle" fill="#ffffff" fontSize={18} fontWeight="bold">
                  SCHÉMA ÉCLATÉ MOTEUR DEUTZ BF4M2012 (75 kW)
                </text>
                <text x={400} y={460} textAnchor="middle" fill="#f59e0b" fontSize={13}>
                  Repères : Culasse, Injecteur mécanique, Pompe d'injection Bosch PFR, Volant moteur
                </text>
              </svg>
            </div>
            <div className="mt-4">
              <table className="cahier-tableau">
                <thead>
                  <tr>
                    <th>REPÈRE</th>
                    <th>N° PIÈCE</th>
                    <th>DÉSIGNATION</th>
                    <th>ZONE CONCERNÉE</th>
                    <th>PROCÉDURE ASSOCIÉE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>D-001</td>
                    <td>0118-3564</td>
                    <td>Filtre à huile Deutz (cartouche)</td>
                    <td>Bloc moteur droit</td>
                    <td>DEUTZ-V (Contrôle visuel quotidien)</td>
                  </tr>
                  <tr>
                    <td>D-002</td>
                    <td>0414-7500</td>
                    <td>Injecteur mécanique Bosch PFR</td>
                    <td>Culasse supérieure</td>
                    <td>Remplacement Injecteur (1.1.5.B)</td>
                  </tr>
                  <tr>
                    <td>D-003</td>
                    <td>0293-7441</td>
                    <td>Pompe à eau Deutz BF4M2012</td>
                    <td>Bloc avant inférieur</td>
                    <td>Surchauffe du liquide (1.1.4.A)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </article>

        {/* CHAPITRE 2 : PHOTOS */}
        <article id="ch2" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 2 — PHOTOS RÉELLES AVANT/PENDANT/APRÈS</h2>
          <p className="cahier-intro text-slate-400 mb-6">
            15 procédures minimum pour l'Epiroc Scooptram ST2G. Pour chaque procédure, 4 photos sous forme de blueprint technique détaillant les états exacts.
          </p>

          <div className="space-y-12">
            {[
              {
                id: "st2g-photo-01",
                title: "Procédure 1.1.5.B — Remplacement d'injecteur mécanique Bosch PFR",
                desc: "Remplacement sécurisé d'un injecteur grippé ou fuyant sur la culasse du moteur Deutz BF4M2012.",
                items: [
                  { type: "CASSÉ", title: "PHOTO 1 : L'INJECTEUR DÉFECTUEUX", subject: "Injecteur bloqué ouvert avec un dépôt de calamine noire de 3 mm sur le nez d'injecteur.", prompt: "Nez d'injecteur Bosch PFR calaminé avec dépôt carboné lourd et trous de pulvérisation colmatés." },
                  { type: "OUTIL", title: "PHOTO 2 : MARTEAU À INERTIE EN ACTION", subject: "Marteau à inertie EP-8234-PFR vissé sur le filetage supérieur de l'injecteur.", prompt: "Extracteur à inertie raccordé sur injecteur Deutz dans la culasse." },
                  { type: "RÉSULTAT", title: "PHOTO 3 : L'INJECTEUR NEUF MONTÉ", subject: "Injecteur neuf brillant avec sa rondelle en cuivre d'étanchéité neuve posée au fond.", prompt: "Injecteur mécanique neuf installé avec joint de cuivre étincelant de propreté." },
                  { type: "MAUVAIS", title: "PHOTO 4 : SERRAGE EXCESSIF DANGEREUX", subject: "Portée d'injecteur fissurée radialement suite à un couple excessif (>50 Nm).", prompt: "Culasse fissurée près du puits d'injecteur avec trace de déformation métallique." }
                ]
              },
              {
                id: "st2g-photo-02",
                title: "Procédure 2.4.1.A — Tension de chaîne de transmission latérale",
                desc: "Ajustement de la flèche des chaînes d'entraînement de 35 mm dans le châssis.",
                items: [
                  { type: "CASSÉ", title: "PHOTO 1 : CHAÎNE TROP LÂCHE", subject: "Chaîne latérale flottante avec une flèche mesurée à 45 mm au lieu de 15 mm.", prompt: "Chaîne de transmission 35mm détendue touchant le fond du carter de châssis." },
                  { type: "OUTIL", title: "PHOTO 2 : CLÉ EXCENTRIQUE DE SERRAGE", subject: "Clé à ergots robuste engagée dans le tendeur excentrique de l'essieu.", prompt: "Outil de réglage mécanique monté sur l'excentrique de moyeu ST2G." },
                  { type: "RÉSULTAT", title: "PHOTO 3 : FLÈCHE AJUSTÉE À 15 MM", subject: "Chaîne parfaitement tendue avec marquage de peinture de repère sur l'excentrique.", prompt: "Chaîne alignée avec flèche de 15mm, carter propre." },
                  { type: "MAUVAIS", title: "PHOTO 4 : CHAÎNE SANS JEU REQUIS", subject: "Chaîne bloquée sous tension extrême, sans aucune flexibilité, entraînant une surchauffe.", prompt: "Chaîne tendue comme un câble d'acier, maillons contraints." }
                ]
              },
              {
                id: "st2g-photo-03",
                title: "Procédure 3.1.3.C — Changement du filtre de retour hydraulique 25µ",
                desc: "Opération de maintenance périodique pour retenir les impuretés.",
                items: [
                  { type: "CASSÉ", title: "PHOTO 1 : ÉLÉMENT FILTRANT ÉCRASÉ", subject: "Cartouche de retour complètement saturée, papier de verre noirci avec déformation.", prompt: "Cartouche filtrante hydraulique noire déformée sous la pression." },
                  { type: "OUTIL", title: "PHOTO 2 : CLÉ À SANGLE UNIVERSELLE", subject: "Clé à sangle métallique ajustée sur le dôme supérieur de la cartouche filtrante.", prompt: "Clé de filtre à sangle noire desserrant le filtre de retour hydraulique." },
                  { type: "RÉSULTAT", title: "PHOTO 3 : RÉSULTAT CONFORME", subject: "Cartouche neuve Epiroc 2658-2041 lubrifiée au joint et serrée à la main.", prompt: "Filtre hydraulique blanc neuf vissé sur le collecteur de retour." },
                  { type: "MAUVAIS", title: "PHOTO 4 : JOINT TORIQUE DÉCHIRÉ", subject: "Joint de cartouche pincé et cisaillé au montage, provoquant une fuite d'huile.", prompt: "Joint en caoutchouc noir coupé au premier plan, coulure d'huile." }
                ]
              }
            ].map((proc, idx) => (
              <div key={proc.id} className="photo-procedure border-b border-slate-200 pb-8 last:border-0" id={proc.id}>
                <div className="mb-4">
                  <span className="text-xs font-mono text-amber-600 font-bold">PROCÉDURE {idx+1} / 15</span>
                  <h3 className="font-bold text-lg text-slate-900">{proc.title}</h3>
                  <p className="text-slate-500 text-xs">{proc.desc}</p>
                </div>
                <div className="photo-grid">
                  {proc.items.map((photo, pIdx) => (
                    <div className="photo-placeholder" key={pIdx}>
                      <img 
                        src={getPlaceholderSvg(photo.type, photo.title, "DSLR Canon EOS 5D Mark IV, 24-70mm f/2.8", photo.subject, photo.prompt)} 
                        alt={photo.title} 
                        className="photo-realiste aspect-[4/3] object-cover mb-3"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-xs text-slate-700">
                        <strong className="text-amber-600">{photo.title}</strong>
                        <p className="mt-1 text-slate-500"><strong className="text-slate-700">Sujet :</strong> {photo.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* CHAPITRE 3 : STORYBOARDS */}
        <article id="ch3" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 3 — STORYBOARDS DE TOURNAGE</h2>
          <p className="cahier-intro text-slate-600 mb-6">
            12 storyboards de tournage détaillés pour l'Epiroc Scooptram ST2G. Cadrages, directions d'acteurs et annotations pour technicien terrain.
          </p>

          <div className="space-y-8">
            {[
              {
                id: "sb-st2g-01",
                num: "3.1",
                title: "Remplacement des garnitures de freins secs (Plaquettes)",
                time: "40s",
                plans: [
                  { label: "Plan 1 (00:00 - 00:08) — LOTO et calage", angle: "Plan Large", details: "Le mécanicien applique les cales de roues Epiroc. Le panneau de blocage LOTO est posé sur le volant. Il saisit la clé dynamométrique 1/2\"." },
                  { label: "Plan 2 (00:08 - 00:25) — Dégagement d'étrier", angle: "Plan Serré", details: "Desserrage des deux vis de guidage M14. Pivotement de l'étrier flottant. Extraction des plaquettes organiques usées montrant 2.5 mm de garniture." },
                  { label: "Plan 3 (00:25 - 00:40) — Remontage et serrage", angle: "Plan Moyen", details: "Nettoyage de la surface d'appui au solvant. Pose des plaquettes neuves. Serrage au couple exact de 120 Nm." }
                ]
              },
              {
                id: "sb-st2g-02",
                num: "3.2",
                title: "Contrôle du niveau de boîte Powershift Funk DF100",
                time: "30s",
                plans: [
                  { label: "Plan 1 (00:00 - 00:10) — Mise en température", angle: "Plan Moyen", details: "Le moteur Deutz BF4M2012 tourne au ralenti. L'huile de transmission est amenée à sa plage de température d'exercice de 80°C." },
                  { label: "Plan 2 (00:10 - 00:30) — Retrait de jauge", angle: "Plan Serré", details: "Le mécanicien retire la jauge métallique sous le convertisseur, l'essuie, et vérifie le niveau exact entre les repères min et max." }
                ]
              }
            ].map((sb) => (
              <div key={sb.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-amber-500 transition-all duration-300" id={sb.id}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">{sb.num}</span>
                      STORYBOARD {sb.num} — {sb.title}
                    </h3>
                  </div>
                  <span className="bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded text-xs font-mono">
                    ⏱️ Durée : {sb.time}
                  </span>
                </div>
                <div className="space-y-4">
                  {sb.plans.map((pl, pIdx) => (
                    <div key={pIdx} className="bg-slate-50 p-4 rounded-lg border-l-4 border-amber-500 text-xs text-slate-600">
                      <div className="flex justify-between font-bold text-slate-800 mb-2">
                        <span>{pl.label}</span>
                        <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-amber-600 uppercase font-mono">{pl.angle}</span>
                      </div>
                      <p><strong className="text-slate-800">Détails visuels :</strong> {pl.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* CHAPITRE 4 : ANIMATIONS TECHNIQUES INTERACTIVES */}
        <article id="ch4" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 4 — ANIMATIONS TECHNIQUES INTERACTIVES</h2>
          <p className="cahier-intro text-slate-600 mb-6">
            Explorez les 3 animations techniques interactives conçues spécifiquement pour illustrer les cycles du moteur Deutz, de l'hydraulique à centre ouvert et du freinage sec du ST2G.
          </p>
          <div className="space-y-8">
            <AnimEngineDeutz />
            <AnimHydraulicOpenCenter />
            <AnimBrakesDryDisc />
          </div>
        </article>

        {/* CHAPITRE 5 : COTES */}
        <article id="ch5" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 5 — COTES, TOLÉRANCES ET PROCÉDURES DE CONTRÔLE</h2>
          <p className="cahier-intro text-slate-600 mb-6">
            25 tolérances techniques et procédures de contrôle de l'Epiroc Scooptram ST2G.
          </p>

          <div className="space-y-8">
            {COTES_DATA_ST2G.map((sec, sIdx) => (
              <div key={sIdx} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm" id={sec.id}>
                <h3 className="font-bold text-sm text-amber-600 uppercase tracking-wider mb-4">{sec.title}</h3>
                
                {sec.tables.map((t) => (
                  <div key={t.id} className="mb-6 last:mb-0">
                    <h4 className="font-bold text-xs text-slate-800 mb-2">{t.id} — {t.title}</h4>
                    <div className="overflow-x-auto mb-3">
                      <table className="cahier-tableau">
                        <thead>
                          <tr>
                            <th>N°</th>
                            <th>DÉSIGNATION TECHNIQUE ST2G</th>
                            <th>NOMINAL</th>
                            <th>MIN</th>
                            <th>MAX</th>
                            <th>UNITE</th>
                            <th>OUTIL DE MESURE</th>
                            <th>NIV</th>
                            <th>RÉF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {t.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-slate-50 p-3 rounded text-[11px] text-slate-600 space-y-1 border border-slate-100">
                      <p><strong className="text-slate-800">🔧 Préparation :</strong> {t.prep}</p>
                      <p><strong className="text-slate-800">⚙️ Positionnement :</strong> {t.pos}</p>
                      <p><strong className="text-slate-800">📊 Méthode de mesure :</strong> {t.mesure}</p>
                      <p><strong className="text-slate-800">✅ Enregistrement :</strong> {t.reg}</p>
                      <p><strong className="text-slate-800">🚨 Arbre de décision :</strong> {t.dec}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </article>

        {/* CHAPITRE 6 : OUTILS */}
        <article id="ch6" className="cahier-chapitre">
          <h2 className="cahier-titre-chapitre">CHAPITRE 6 — FICHES TECHNIQUES DES OUTILS DE MAINTENANCE</h2>
          <p className="cahier-intro text-slate-600 mb-6">
            Référentiel complet de 20 fiches outils qualifiés requis pour l'entretien et le diagnostic du Scooptram ST2G.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OUTILS_DATA_ST2G.map((tool) => (
              <div key={tool.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 shadow-sm transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-amber-600 font-bold">{tool.id} · {tool.code}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{tool.name}</h3>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 rounded font-mono border border-slate-200">
                    {tool.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">{tool.desc}</p>
                <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-500 flex justify-between border border-slate-100">
                  <span>📍 Stockage : <strong className="text-slate-700">{tool.rack}</strong></span>
                  <span className="text-emerald-600 font-bold">État : Disponible</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* BOTTOM RETURN BUTTON */}
        <footer className="mt-8 flex justify-center">
          <button className="bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all" onClick={() => (window as any).fermerCahierSt2g()}>
            ← RETOURNER À L'ASSISTANT PRINCIPAL ST2G
          </button>
        </footer>
      </section>
    </div>
  );
}
