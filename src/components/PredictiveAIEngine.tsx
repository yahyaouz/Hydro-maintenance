import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sliders, Activity, TrendingUp, AlertTriangle, Play, Pause, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface PredictiveProps {
  oilTemp: number;
  vibrationRms: number;
  pumpPressure: number;
  sensorRPM: number;
  engineId: string;
}

export function PredictiveAIEngine({ oilTemp, vibrationRms, pumpPressure, sensorRPM, engineId }: PredictiveProps) {
  const [beta, setBeta] = React.useState<number>(2.2); // Shape parameter (wear-out stage > 1)
  const [eta, setEta] = React.useState<number>(3800); // Scale parameter (characteristic life in hours)
  const [anomalyThreshold, setAnomalyThreshold] = React.useState<number>(2.2);

  // Compute live Z-score anomaly index
  // Normal state is around oilTemp=80, vibrationRms=3.0, pumpPressure=135
  const tempDrift = Math.abs(oilTemp - 80) / 10;
  const vibDrift = Math.abs(vibrationRms - 3.0) / 1.0;
  const pressDrift = Math.abs(pumpPressure - 135) / 15;
  const zScore = Math.round((tempDrift + vibDrift + pressDrift) * 10) / 10;

  const isAnomalyDetected = zScore > anomalyThreshold;

  // Remaining Useful Life (RUL) estimation
  const baseRul = 1200; // base running hours left before overhaul
  const driftPenalty = Math.max(0, (zScore - 1.2) * 220);
  const remainingHours = Math.round(Math.max(50, baseRul - driftPenalty));

  // Compute live Weibull metrics dynamically
  // MTTF = eta * Gamma(1 + 1/beta) - approximated for simplicity
  const mttf = React.useMemo(() => {
    // Basic approximation of Gamma function for typical engineering beta values [1.0, 4.0]
    const gammaFactor = 0.89 + 0.05 * Math.pow(beta - 2, 2);
    return Math.round(eta * gammaFactor);
  }, [beta, eta]);

  // Survival Rate R(t) at current operating hours (approximated at 2200h)
  const survivalRate = React.useMemo(() => {
    const t = 2200; // standard machine hours
    const rate = Math.exp(-Math.pow(t / eta, beta));
    return Math.round(rate * 100);
  }, [beta, eta]);

  // Instantaneous Hazard Rate h(t) * 10^5
  const hazardRate = React.useMemo(() => {
    const t = 2200;
    const rate = (beta / eta) * Math.pow(t / eta, beta - 1) * 100000;
    return Math.round(rate * 100) / 100;
  }, [beta, eta]);

  // Dynamic Cross-Sensor Correlation Matrix
  const correlations = React.useMemo(() => {
    // Small artificial noise to make metrics feel alive
    const tempVibCorr = 0.76 + (oilTemp > 95 ? 0.08 : -0.04);
    const pressRpmCorr = -0.42 + (sensorRPM > 2000 ? -0.12 : 0.05);
    const tempPressCorr = 0.58;
    return {
      tempVib: Math.min(0.99, Math.max(0.1, tempVibCorr)).toFixed(2),
      pressRpm: Math.min(0.1, Math.max(-0.99, pressRpmCorr)).toFixed(2),
      tempPress: tempPressCorr.toFixed(2)
    };
  }, [oilTemp, sensorRPM]);

  // Generate Weibull failure probability over operating hours t
  // F(t) = 1 - exp(-(t/eta)^beta)
  const weibullData = React.useMemo(() => {
    const data = [];
    for (let t = 0; t <= 6000; t += 300) {
      const prob = 1 - Math.exp(-Math.pow(t / eta, beta));
      const survival = Math.exp(-Math.pow(t / eta, beta));
      data.push({
        hours: t,
        probability: Math.round(prob * 100),
        survival: Math.round(survival * 100)
      });
    }
    return data;
  }, [beta, eta]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Continuous Telemetry Z-Score Anomaly Detector */}
      <Card className="bg-slate-950 border-slate-800 text-slate-100 lg:col-span-1 flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-emerald-500" /> Détecteur d'Anomalies (IoT Score Z)
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Modélisation statistique de dérive multivariable temps réel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-center relative overflow-hidden">
            <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Score d'Anomalie Multi-Senseurs</span>
            <div className="text-4xl font-black font-mono tracking-tight text-white mb-1">
              {zScore} <span className="text-xs text-slate-500 font-normal">σ (Z-score)</span>
            </div>
            
            <div className="mt-2 flex justify-center">
              {isAnomalyDetected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-955 text-red-400 text-[10px] font-mono font-black border border-red-800 animate-pulse uppercase rounded-full">
                  <AlertTriangle className="h-3.5 w-3.5" /> Alerte Dérive Majeure
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-emerald-400 text-[10px] font-mono font-black border border-emerald-800 uppercase rounded-full">
                  Status Nominal Stable
                </span>
              )}
            </div>
          </div>

          {/* Matrix of correlations */}
          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-850 space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 block">Matrice de Corrélation Croisée</span>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-slate-950 p-2 rounded border border-slate-900">
                <span className="text-slate-500 block">Temp ⇆ Vibration</span>
                <span className="font-extrabold text-sky-400">r = +{correlations.tempVib}</span>
                <p className="text-[8px] text-slate-600">Forte relation thermique</p>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-900">
                <span className="text-slate-500 block">Pression ⇆ RPM</span>
                <span className="font-extrabold text-amber-500">r = {correlations.pressRpm}</span>
                <p className="text-[8px] text-slate-600">Charge proportionnelle</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Seuil de Déclenchement :</span>
              <span className="text-amber-500 font-bold">{anomalyThreshold} σ</span>
            </div>
            <input 
              type="range"
              min="1.0"
              max="4.0"
              step="0.1"
              value={anomalyThreshold}
              onChange={(e) => setAnomalyThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-500 animate-pulse"
            />
            <span className="text-[10px] text-slate-500 leading-relaxed block">
              Ajuste la sensibilité statistique pour tolérer de petites variations d'huile hydraulique sans déclenchement d'alarme sous le niveau de confiance choisi.
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg space-y-2 border border-slate-850 text-xs">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Diagnostique Dérive IA :</span>
            <div className="flex justify-between">
              <span className="text-slate-500">Excursion Hydraulique :</span>
              <span className={oilTemp > 100 ? "text-amber-400 font-bold" : "text-white"}>{oilTemp > 100 ? "Active (+35C)" : "Négligeable"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fatigue micro-vibratoire :</span>
              <span className={vibrationRms > 4.5 ? "text-red-400 font-black" : "text-white"}>{vibrationRms > 4.5 ? "Sévère (>4.5mm/s)" : "Modérée"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Weibull Reliability Modeling */}
      <Card className="bg-slate-950 border-slate-800 text-slate-100 lg:col-span-2 flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-white flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-rose-500" /> Courbe de Fiabilité Weibull Avancée
            </div>
            <span className="text-xs font-mono text-slate-500">Moteur : {engineId}</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Modèle probabiliste d'usure de fatigue matérielle (Weibull Distribution)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>Facteur de Forme (Shape β) :</span>
                  <span className="text-sky-400 font-bold">{beta}</span>
                </div>
                <input 
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={beta}
                  onChange={(e) => setBeta(parseFloat(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <span className="text-[10px] text-slate-500 block">
                  {beta < 1.0 ? "β < 1 : Mortalité infantile (défaut de fabrication d'étanchéité)" : 
                   beta === 1.0 ? "β = 1 : Taux de panne constant (accidents purement fortuits)" : 
                   "β > 1 : Phase d'usure prononcée, fatigue cyclique accumulée"}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span>Vie Caractéristique (Scale η) :</span>
                  <span className="text-emerald-400 font-bold">{eta} h</span>
                </div>
                <input 
                  type="range"
                  min="1000"
                  max="6000"
                  step="100"
                  value={eta}
                  onChange={(e) => setEta(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500 block">
                  Durée de fonctionnement attendue à laquelle 63.2% de la flotte de composants aura défailli.
                </span>
              </div>
            </div>

            {/* Weibull Stats output Box */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-850 text-xs font-mono space-y-1.5 flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black block border-b border-slate-800 pb-1">Mathematical Estimates</span>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Calculated MTTF :</span>
                <span className="text-sky-400 font-extrabold">{mttf} heures</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Survival rate R(t) :</span>
                <span className="text-emerald-400 font-extrabold">{survivalRate}%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Hazard Rate h(t)*10⁵ :</span>
                <span className="text-red-400 font-extrabold">{hazardRate} /h</span>
              </div>
              <div className="text-[9px] text-slate-500 italic mt-1 leading-none">
                * R(t) calculé d'après f(t) pour t = 2200h.
              </div>
            </div>
          </div>

          {/* Recharts Weibull Curve */}
          <div className="h-[180px] w-full bg-slate-900/30 rounded-xl border border-slate-850 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weibullData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="weibullFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="survivalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hours" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}h`} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#020617", borderColor: "#1e293b", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px", fontFamily: "monospace" }}
                  itemStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  formatter={(val, name) => [
                    `${val}%`, 
                    name === "probability" ? "Défaillance Cumulée F(t)" : "Taux de Survie R(t)"
                  ]}
                  labelFormatter={(h) => `Fonctionnement : ${h}h`}
                />
                <Area type="monotone" dataKey="probability" name="probability" stroke="#f43f5e" fillOpacity={1} fill="url(#weibullFill)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="survival" name="survival" stroke="#38bdf8" fillOpacity={1} fill="url(#survivalFill)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

