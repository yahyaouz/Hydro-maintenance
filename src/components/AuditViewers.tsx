import * as React from "react";
import { 
  viewerAuditService, 
  ViewerAuditLog 
} from "@/services/viewerAuditService";
import { 
  Shield, 
  Eye, 
  Clock, 
  Activity, 
  AlertTriangle, 
  RefreshCw, 
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Flame,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "motion/react";

export function AuditViewers() {
  const [logs, setLogs] = React.useState<ViewerAuditLog[]>([]);
  const [filterRisk, setFilterRisk] = React.useState<string>("TOUS");
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const historical = await viewerAuditService.fetchHistoricalLogs();
      setLogs(historical);
    } catch (e) {
      toast.error("Erreur lors de la synchronisation de l'audit.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLogs();

    const handleLiveTelemetry = (e: Event) => {
      const customEvent = e as CustomEvent<ViewerAuditLog>;
      if (customEvent.detail) {
        setLogs(prev => {
          const exists = prev.findIndex(l => l.sessionId === customEvent.detail.sessionId);
          if (exists > -1) {
            // Update the existing session log inside UI seamlessly (Realtime convergence)
            const updated = [...prev];
            updated[exists] = customEvent.detail;
            return updated;
          }
          return [customEvent.detail, ...prev];
        });
      }
    };

    window.addEventListener("sg_new_viewer_log", handleLiveTelemetry);
    return () => {
      window.removeEventListener("sg_new_viewer_log", handleLiveTelemetry);
    };
  }, []);

  const clearDatabaseLogs = () => {
    const ok = window.confirm("⚠️ Souhaitez-vous réinitialiser l'historique d'analyse locale sur cette tablette/poste ?");
    if (ok) {
      viewerAuditService.clearLogs();
      setLogs([]);
      toast.success("Registre d'analyse réinitialisé.");
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterRisk === "TOUS") return true;
    return log.riskScore === filterRisk;
  });

  // Calculate viewers active today
  const todayStr = new Date().toDateString();
  const activeViewersToday = new Set(
    logs
      .filter(log => {
        try {
          return new Date(log.timestamp).toDateString() === todayStr;
        } catch (e) {
          return true; // fallback
        }
      })
      .map(log => log.sessionId)
  ).size;

  // KPI aggregates calculations
  const totalSessionsCount = new Set(logs.map(l => l.sessionId)).size || logs.length;
  const totalClicksAcross = logs.reduce((acc, current) => acc + (current.clickCount || 0), 0);
  const totalTactileAcross = logs.reduce((acc, current) => acc + (current.tactileCount || 0), 0);
  const totalForbiddenAttempts = logs.reduce((acc, current) => acc + (current.forbiddenAttempts || 0), 0);

  const averageDuration = logs.length > 0 
    ? Math.round(logs.reduce((acc, current) => acc + current.sessionDuration, 0) / logs.length) 
    : 0;

  // Hourly list distribution (0 - 23)
  const hourlyHits = Array(24).fill(0);
  logs.forEach(log => {
    try {
      const h = new Date(log.timestamp).getHours();
      if (h >= 0 && h < 24) {
        hourlyHits[h] += 1;
      }
    } catch (_) {}
  });

  // Most active hour peak detection
  let maxHourVal = 0;
  let peakHour = "Aucun";
  hourlyHits.forEach((val, idx) => {
    if (val > maxHourVal) {
      maxHourVal = val;
      peakHour = `${idx}h - ${idx + 1}h`;
    }
  });

  // Most viewed modules aggregates
  const pageHits: Record<string, number> = {};
  logs.forEach(log => {
    if (log.navigationHistory && log.navigationHistory.length > 0) {
      log.navigationHistory.forEach(tab => {
        // Humanize labels
        const cleanName = tab === "dashboard" ? "Tableau de Bord" :
                          tab === "pannes" ? "Pannes & Signalements" :
                          tab === "engins" ? "Suivi des Engins" :
                          tab === "stock" ? "Pièces & Stock" :
                          tab === "workorders" ? "Bons de Travail" : tab;
        pageHits[cleanName] = (pageHits[cleanName] || 0) + 1;
      });
    } else {
      const cleanName = log.activeTab === "dashboard" ? "Tableau de Bord" :
                        log.activeTab === "pannes" ? "Pannes & Signalements" :
                        log.activeTab === "engins" ? "Suivi des Engins" :
                        log.activeTab === "stock" ? "Pièces & Stock" :
                        log.activeTab === "workorders" ? "Bons de Travail" : log.activeTab;
      pageHits[cleanName] = (pageHits[cleanName] || 0) + 1;
    }
  });

  // Convert to sorted array for display
  const sortedModules = Object.entries(pageHits)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalModuleClicks = sortedModules.reduce((sum, item) => sum + item.count, 0) || 1;

  // Site based analysis
  const siteHits: Record<string, number> = {};
  logs.forEach(log => {
    const site = log.location?.city || "SMI Extraction";
    const cleaned = site.replace(" (Extraction)", "");
    siteHits[cleaned] = (siteHits[cleaned] || 0) + 1;
  });

  const criticalCount = logs.filter(l => l.riskScore === "CRITIQUE").length;
  const suspectCount = logs.filter(l => l.riskScore === "SUSPECT").length;
  const surveillanceCount = logs.filter(l => l.riskScore === "SURVEILLANCE").length;
  const normalCount = logs.filter(l => l.riskScore === "NORMAL").length;

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-emerald-555 animate-pulse" />
            Supervision du Trafic Connecté & Conformité
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
            📈 CENTRE D’ANALYSE ET CONTRÔLE DES ACCÈS VIEWERS
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Indicateurs d'activité, statistiques opérationnelles et blocage de privilèges en temps réel. Conforme RGPD.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={isLoading}
            className="h-9 text-[10px] uppercase font-black tracking-wider border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 bg-transparent ${isLoading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearDatabaseLogs}
            className="h-9 text-[10px] uppercase font-black tracking-wider border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Effacer
          </Button>
        </div>
      </div>

      {/* Grid of aggregated indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Viewers Actifs */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Consulteurs Actifs (Aujourd'hui)
            </span>
            <p className="text-2xl font-black text-slate-950 dark:text-white leading-none">
              {activeViewersToday}
            </p>
            <span className="text-[8.5px] font-mono text-emerald-550 dark:text-emerald-450 font-bold block">
              ● sessions sur ce jour
            </span>
          </div>
          <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg flex items-center justify-center text-indigo-500">
            <Eye className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2: Session length */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Durée Moyenne de Session
            </span>
            <p className="text-2xl font-black text-slate-950 dark:text-white leading-none">
              {averageDuration} Sec
            </p>
            <span className="text-[8.5px] font-mono text-slate-400 dark:text-slate-500 font-bold block">
              Activités consultatives passives
            </span>
          </div>
          <div className="h-10 w-10 bg-sky-50 dark:bg-sky-950/20 rounded-lg flex items-center justify-center text-sky-500">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3: Blocked items */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Blocages de privilèges
            </span>
            <p className={`text-2xl font-black leading-none ${totalForbiddenAttempts > 0 ? "text-red-650" : "text-emerald-650"}`}>
              {totalForbiddenAttempts}
            </p>
            <span className="text-[8.5px] font-mono text-slate-400 dark:text-slate-500 font-bold block">
              {totalForbiddenAttempts > 0 ? "⚠️ Rejets d'écriture interceptés" : "Zéro accès illégal"}
            </span>
          </div>
          <div className="h-10 w-10 bg-red-50 dark:bg-red-950/20 rounded-lg flex items-center justify-center text-red-500">
            <Shield className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 4: Total interaction */}
        <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Intensité d'Interaction
            </span>
            <p className="text-2xl font-black text-slate-950 dark:text-white leading-none">
              {totalClicksAcross + totalTactileAcross}
            </p>
            <span className="text-[8.5px] font-mono text-slate-400 dark:text-slate-500 font-bold block">
              {totalClicksAcross} clics / {totalTactileAcross} touches
            </span>
          </div>
          <div className="h-10 w-10 bg-violet-50 dark:bg-violet-950/20 rounded-lg flex items-center justify-center text-violet-500">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Industrial Analysis Widgets (reconstructed as bento charts) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Widget 1: Modules les plus consultés */}
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[#4a90d9]" /> 📁 PAGES ET MODULES LES PLUS VISI-TÉS
            </h4>

            {sortedModules.length === 0 ? (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic py-2">
                Aucune transition enregistrée. En attente de données...
              </p>
            ) : (
              <div className="space-y-3">
                {sortedModules.map((item, idx) => {
                  const pct = Math.round((item.count / totalModuleClicks) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        <span>{item.name}</span>
                        <span className="font-mono font-bold">{item.count} visites ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-sky-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Widget 2: Heatmap horaire & Pic d'activité */}
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-550" /> 🕒 HEATMAP HÉRE ET PICS DE CONSULTATION
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                <span>Pic identifié :</span>
                <span className="font-bold text-amber-550">{peakHour}</span>
              </div>

              {/* 24 hours color scale representation */}
              <div className="grid grid-cols-6 gap-1 pt-1">
                {hourlyHits.map((hits, hour) => {
                  let opacity = "bg-slate-100 dark:bg-slate-900";
                  if (hits > 0 && hits <= 2) opacity = "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-500";
                  else if (hits > 2 && hits <= 5) opacity = "bg-emerald-300 dark:bg-emerald-800 text-emerald-700";
                  else if (hits > 5 && hits <= 10) opacity = "bg-amber-400 text-slate-950";
                  else if (hits > 10) opacity = "bg-red-500 text-white";

                  return (
                    <div 
                      key={hour} 
                      className={`p-1 text-center rounded text-[8px] font-bold font-mono transition-all ${opacity}`}
                      title={`${hits} actions enregistrées à ${hour}h`}
                    >
                      {hour}h
                      <span className="block text-[6.5px] font-normal leading-tight opacity-80">{hits}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[7.5px] font-semibold text-slate-400 uppercase pt-2">
                <span>🟢 Actif léger</span>
                <span>🟡 Modéré</span>
                <span>🔴 Pic critique</span>
              </div>
            </div>
          </div>

          {/* Widget 3: Activité par site d'extraction */}
          <div className="bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-555" /> 📍 FRÉQUENTATION PAR ZONE & SITE
            </h4>

            <div className="space-y-2">
              {Object.entries(siteHits).length === 0 ? (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic italic py-1">Aucune information géographique locale disponible.</p>
              ) : (
                Object.entries(siteHits).map(([site, count], idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/30 p-2 border border-slate-150 dark:border-slate-850 rounded-lg">
                    <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-350">{site}</span>
                    <span className="bg-[#4a90d9]/10 text-[#4a90d9] text-[9px] font-bold font-mono px-2 py-0.5 rounded-full">
                      {count} Telemetries
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Compliance Card */}
          <div className="p-4 bg-[#121929] border border-slate-800 rounded-2xl space-y-2 text-left">
            <span className="text-[8.5px] font-mono font-black uppercase text-slate-500 block leading-none tracking-widest">
              ⚖️ SÉCURITÉ JURIDIQUE ET TRAÇABILITÉ
            </span>
            <p className="text-[10px] text-slate-400 leading-relaxed m-0 font-medium">
              Ce système anonymisé n'effectue aucun fingerprinting intrusif, aucune géolocalisation GPS précise et aucune écoute de mouvements souris. L'activité est synthétisée pour la performance des terminaux industriels durcis.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Filterable Live Viewer Sessions logs */}
        <div className="lg:col-span-8 bg-white dark:bg-[#121929] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col h-[580px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-3 mb-4 shrink-0">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              📋 REGISTRE SYSTÈME DES SESSIONS ACTIVES
            </h4>

            {/* Filters */}
            <div className="flex gap-1.5">
              {["TOUS", "NORMAL", "SURVEILLANCE", "SUSPECT", "CRITIQUE"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterRisk(cat)}
                  className={`text-[8.5px] px-2 py-1 rounded font-black tracking-wider uppercase border transition-all ${
                    filterRisk === cat
                      ? "bg-slate-905 dark:bg-white text-white dark:text-slate-900 border-transparent shadow"
                      : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List Feed Scrollable layout */}
          <div className="flex-1 scroll-industrial overflow-y-auto space-y-3 pr-1">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2 py-12 border-2 border-dashed border-slate-150 dark:border-slate-900 rounded-xl">
                <CheckCircle2 className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold font-mono">Aucune session d'activité disponible pour ce filtre.</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isCrit = log.riskScore === "CRITIQUE";
                const isSusp = log.riskScore === "SUSPECT";
                const isSurv = log.riskScore === "SURVEILLANCE";

                let borderOutline = "border-slate-200 dark:border-slate-800";
                if (isCrit) borderOutline = "border-red-500/50 bg-red-50/5 dark:bg-red-950/5";
                else if (isSusp) borderOutline = "border-orange-400/50 bg-orange-50/5";
                else if (isSurv) borderOutline = "border-yellow-400/50 bg-yellow-50/5";

                return (
                  <motion.div
                    key={log.sessionId}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3.5 border rounded-xl space-y-2.5 text-left transition-all hover:bg-slate-50/50 dark:hover:bg-slate-900/10 ${borderOutline}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded ${
                          isCrit ? "bg-red-650 text-white" : 
                          isSusp ? "bg-orange-550 text-white" : 
                          isSurv ? "bg-yellow-500 text-slate-900" :
                          "bg-emerald-550 text-white"
                        }`}>
                          {log.riskScore}
                        </span>
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 font-mono">
                          Session: {log.sessionId.substr(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 dark:text-slate-500 font-mono font-bold leading-none">
                        <Calendar className="h-3 w-3" />
                        Màj: {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    {/* Behavior details summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[9.5px]">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 dark:text-slate-500 uppercase font-black tracking-tight block">Dernier Module</span>
                        <p className="font-extrabold text-[#4a90d9] font-mono">{log.activeTab.toUpperCase()}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 dark:text-slate-500 uppercase font-black tracking-tight block">Clicks / Touches</span>
                        <p className="font-extrabold text-slate-800 dark:text-slate-300 font-mono">🖱️ {log.clickCount} | 🎛️ {log.tactileCount}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 dark:text-slate-500 uppercase font-black tracking-tight block">Terminal & Navigateur</span>
                        <p className="font-extrabold text-slate-800 dark:text-slate-300 font-mono truncate">{log.device} ({log.browser})</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-slate-400 dark:text-slate-500 uppercase font-black tracking-tight block">Réseau & IP LAN</span>
                        <p className="font-extrabold text-slate-800 dark:text-slate-300 font-mono truncate">{log.ipAddress} ({log.location.city})</p>
                      </div>
                    </div>

                    {/* Navigation history list */}
                    {log.navigationHistory && log.navigationHistory.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-950 p-2 border border-slate-150 dark:border-slate-850 rounded-lg text-[9px] font-mono leading-relaxed">
                        <span className="font-black text-slate-400 dark:text-slate-500 uppercase block tracking-wider mb-0.5">HISTORIQUE DES OPERATIONS (SESSION) :</span>
                        <p className="text-slate-700 dark:text-slate-300 m-0 truncate leading-snug">
                          {log.navigationHistory.map(tab => {
                            return tab === "dashboard" ? "Tableau de Bord" :
                                   tab === "pannes" ? "Pannes" :
                                   tab === "engins" ? "Engins" :
                                   tab === "stock" ? "Pièces" :
                                   tab === "workorders" ? "Bons de Travail" : tab;
                          }).join(" ➔ ")}
                        </p>
                      </div>
                    )}

                    {/* Detected behavioral anomalies warnings */}
                    {log.behavioralAnomalies && log.behavioralAnomalies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {log.behavioralAnomalies.map((anom, idx) => (
                          <span
                            key={idx}
                            className="bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-400 text-[8px] font-mono font-black uppercase px-2 py-0.5 border border-red-200 dark:border-red-900/30 rounded flex items-center gap-1 leading-none"
                          >
                            <AlertTriangle className="h-2.5 w-2.5 text-red-600 shrink-0" />
                            {anom}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
