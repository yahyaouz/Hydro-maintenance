// V4-IMPORT: File refactored for Phase 3 Client-side CSV Imports
import * as React from "react";
import { 
  Database, Clock, Check, AlertTriangle, FileText, 
  RefreshCw, Upload, Play, Download, Trash2, ShieldCheck, HelpCircle
} from "lucide-react";
import { 
  collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, deleteDoc, doc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";
import { useImports, ImportResult } from "@/hooks/useImports";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageBanner } from "@/components/ui/PageBanner";

interface HistoryLog {
  id: string;
  timestamp: any;
  platform: "magasinier" | "carburants" | "planification" | "realisation";
  status: "success" | "warning" | "error";
  elementsImported: string;
  message: string;
  operator: string;
}

export function ImportConfig() {
  const { user, activeSite } = useAuthStore();
  const { 
    loading: importLoading, 
    importEspaceMagasinier, 
    importCarburants, 
    importPlanification, 
    importRealisation 
  } = useImports();

  const [activeTab, setActiveTab] = React.useState<"imports" | "history">("imports");
  const [historyLogs, setHistoryLogs] = React.useState<HistoryLog[]>([]);
  const [historyLoading, setHistoryLoading] = React.useState(true);
  
  // File upload states for each card
  const [files, setFiles] = React.useState<{ [key: string]: File | null }>({
    magasinier: null,
    carburants: null,
    planification: null,
    realisation: null,
  });

  const [dragOver, setDragOver] = React.useState<{ [key: string]: boolean }>({
    magasinier: false,
    carburants: false,
    planification: false,
    realisation: false,
  });

  // Active detailed import report
  const [lastReport, setLastReport] = React.useState<{
    platform: string;
    fileName: string;
    result: ImportResult;
  } | null>(null);

  const isAuthorized = ["ADMIN", "RESPONSABLE_MAINTENANCE"].includes(user?.role || "");

  // Load history logs manually to have robust reactivity and control
  const loadHistory = React.useCallback(async () => {
    setHistoryLoading(true);
    try {
      const q = query(
        collection(db, "config/imports/history"), 
        orderBy("timestamp", "desc"), 
        limit(25)
      );
      const snap = await getDocs(q);
      const logs: HistoryLog[] = [];
      snap.forEach(d => {
        const data = d.data();
        logs.push({
          id: d.id,
          timestamp: data.timestamp,
          platform: data.platform,
          status: data.status,
          elementsImported: data.elementsImported || "",
          message: data.message || "",
          operator: data.operator || "Système"
        });
      });
      setHistoryLogs(logs);
    } catch (err) {
      console.error("Error loading import history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFileChange = (key: string, file: File | null) => {
    if (file && !file.name.endsWith(".csv")) {
      toast.error("Format de fichier invalide. Veuillez sélectionner un fichier CSV (.csv)");
      return;
    }
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const handleDragOver = (e: React.DragEvent, key: string, isOver: boolean) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [key]: isOver }));
  };

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [key]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(key, e.dataTransfer.files[0]);
    }
  };

  const handleTriggerImport = async (key: string) => {
    const file = files[key];
    if (!file) {
      toast.error("Veuillez d'abord sélectionner un fichier.");
      return;
    }

    if (!isAuthorized) {
      toast.error("Privilèges insuffisants pour exécuter des importations de données.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast.error("Fichier vide ou illisible.");
        return;
      }

      try {
        let result: ImportResult;
        let label = "";

        if (key === "magasinier") {
          result = await importEspaceMagasinier(text, activeSite);
          label = "Espace Magasinier";
        } else if (key === "carburants") {
          result = await importCarburants(text, activeSite);
          label = "Carburants & Lubrifiants";
        } else if (key === "planification") {
          result = await importPlanification(text, activeSite);
          label = "Plateforme Production (Planification)";
        } else if (key === "realisation") {
          result = await importRealisation(text, activeSite);
          label = "Plateforme Production (Réalisation)";
        } else {
          throw new Error("Clé d'importation invalide.");
        }

        setLastReport({
          platform: label,
          fileName: file.name,
          result
        });

        // Reset file selection
        setFiles(prev => ({ ...prev, [key]: null }));

        if (result.errorCount === 0) {
          toast.success(`Importation '${label}' réussie avec ${result.successCount} éléments !`);
        } else if (result.successCount > 0) {
          toast.warning(`Importation '${label}' finalisée avec des alertes. Consultez le rapport.`);
        } else {
          toast.error(`Échec de l'importation '${label}'. Toutes les lignes comportent des erreurs.`);
        }

        // Reload history log list
        loadHistory();
      } catch (err: any) {
        toast.error(`Erreur critique pendant le traitement : ${err.message || err}`);
      }
    };
    reader.readAsText(file);
  };

  const clearHistoryLog = async () => {
    if (!confirm("Voulez-vous supprimer l'historique d'importation ?")) return;
    try {
      const q = query(collection(db, "config/imports/history"), limit(100));
      const snap = await getDocs(q);
      const batch = [];
      snap.forEach(d => {
        batch.push(deleteDoc(doc(db, "config/imports/history", d.id)));
      });
      await Promise.all(batch);
      toast.success("Historique vidé avec succès.");
      loadHistory();
    } catch (err) {
      toast.error("Erreur lors du nettoyage de l'historique.");
    }
  };

  const downloadErrorReport = () => {
    if (!lastReport) return;
    const errors = lastReport.result.errors;
    let text = `RAPPORT D'ERREUR D'IMPORTATION - ${lastReport.platform.toUpperCase()}\n`;
    text += `Fichier source : ${lastReport.fileName}\n`;
    text += `Date : ${new Date().toLocaleString()}\n`;
    text += `Statistiques : ${lastReport.result.successCount} succès, ${lastReport.result.ignoredCount} ignorés, ${lastReport.result.errorCount} erreurs\n`;
    text += `========================================================================\n\n`;

    errors.forEach(err => {
      text += `[Ligne ${err.line}] : ${err.message}\n`;
      if (err.raw) {
        text += `  > Brut : ${err.raw}\n`;
      }
      text += `------------------------------------------------------------------------\n`;
    });

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport_erreurs_${((lastReport && lastReport.platform) || "import").toLowerCase().replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: "success" | "warning" | "error") => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
            <Check className="w-3 h-3" /> SUCCÈS
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3" /> ALERTES
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3" /> ÉCHEC
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 bg-white text-slate-900 pb-12 border-2 border-amber-500 shadow-xl relative overflow-hidden p-6 rounded-2xl">
      {/* Ligne de haut style Hydromines (Mélange bleu ciel et rouge un peu foncé) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />

      <PageBanner
        icon={Database}
        badgeLabel="ADMINISTRATION & PARAMÈTRES"
        title="Import & Paramètres"
        subtitle="Intégration des fichiers CSV terrain et synchronisation des données d'exploitation"
        siteLabel={activeSite === "TOUS" ? "TOUS SITES" : activeSite}
      />

      {/* Main navigation tabs (centered & matched to Admin.tsx style) */}
      <div className="flex justify-center w-full">
        <div className="flex gap-1.5 bg-slate-100/80 pt-2.5 pb-1.5 px-1.5 rounded-xl border-2 border-amber-500 shadow-md relative overflow-hidden w-full max-w-lg">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400" />
          <button
            onClick={() => setActiveTab("imports")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === "imports"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold border border-amber-600"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent"
            }`}
          >
            <Upload className="w-4 h-4" /> Plateformes d'Import
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === "history"
                ? "bg-amber-500 text-slate-950 shadow-md font-extrabold border border-amber-600"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent"
            }`}
          >
            <Clock className="w-4 h-4" /> Historique d'Intégration
          </button>
        </div>
      </div>

      {activeTab === "imports" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List of 4 upload cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CARD 1: Espace Magasinier */}
            <Card className="relative overflow-hidden border-2 border-amber-500 rounded-2xl shadow-lg bg-white pt-1.5">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />
              <CardHeader className="bg-slate-50 p-4 border-b border-slate-200 mt-1">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-mono text-[9px] mb-1.5 uppercase font-bold">
                      FLUX LOGISTIQUE (IMPORT 1)
                    </Badge>
                    <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      1. Espace Magasinier — Consommations Pièces
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1">
                      Met à jour le stock dans la base HYDROMINES - Espace Maintenance et enregistre les consommations de pièces détachées.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="text-[11px] bg-slate-50 text-slate-600 rounded-lg p-2.5 font-mono space-y-1">
                  <span className="font-bold text-slate-700 uppercase block mb-1">Structure attendue (pieces.csv) :</span>
                  <code>code_piece, designation, quantite, unite, engin_matricule, engin_type, site, date_conso, mecanicien_matricule, cout_unite_dh, cout_total_dh</code>
                </div>

                {/* Drag and Drop Box */}
                <div
                  onDragOver={(e) => handleDragOver(e, "magasinier", true)}
                  onDragLeave={(e) => handleDragOver(e, "magasinier", false)}
                  onDrop={(e) => handleDrop(e, "magasinier")}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    dragOver.magasinier
                      ? "border-amber-500 bg-amber-500/5"
                      : files.magasinier
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    id="file-magasinier"
                    className="hidden"
                    onChange={(e) => handleFileChange("magasinier", e.target.files?.[0] || null)}
                  />
                  <label htmlFor="file-magasinier" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className={`w-8 h-8 ${files.magasinier ? "text-emerald-500" : "text-slate-400"}`} />
                    {files.magasinier ? (
                      <div>
                        <p className="text-xs font-bold text-slate-800">{files.magasinier.name}</p>
                        <p className="text-[10px] text-slate-500">{(files.magasinier.size / 1024).toFixed(1)} KB - Prêt</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700">Sélectionnez ou déposez votre fichier pieces.csv</p>
                        <p className="text-[10px] text-slate-400">Format CSV uniquement</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex justify-between items-center pt-2">
                  {files.magasinier && (
                    <Button
                      variant="ghost"
                      onClick={() => handleFileChange("magasinier", null)}
                      className="text-xs text-rose-600 hover:text-rose-700 p-0"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Annuler
                    </Button>
                  )}
                  <Button
                    onClick={() => handleTriggerImport("magasinier")}
                    disabled={!files.magasinier || importLoading}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-wider gap-2 ml-auto rounded-lg"
                  >
                    {importLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Lancer l'Importation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CARD 2: Carburants & Lubrifiants */}
            <Card className="relative overflow-hidden border-2 border-amber-500 rounded-2xl shadow-lg bg-white pt-1.5">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />
              <CardHeader className="bg-slate-50 p-4 border-b border-slate-200 mt-1">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 font-mono text-[9px] mb-1.5 uppercase font-bold">
                      TÉLÉMÉTRIE FLOTTE (IMPORT 2)
                    </Badge>
                    <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      2. Carburants & Lubrifiants — Heures de Marche
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1">
                      Met à jour les compteurs d'heures des engins de la flotte et archive les consommations énergétiques.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="text-[11px] bg-slate-50 text-slate-600 rounded-lg p-2.5 font-mono space-y-1">
                  <span className="font-bold text-slate-700 uppercase block mb-1">Structure attendue (carburants.csv) :</span>
                  <code>matricule_engin, type_engin, site, date_releve, heures_moteur, conso_gasoil_litres, conso_huile_moteur_litres, conso_huile_hydraulique_litres, conso_autres_lubrifiants_litres</code>
                </div>

                <div
                  onDragOver={(e) => handleDragOver(e, "carburants", true)}
                  onDragLeave={(e) => handleDragOver(e, "carburants", false)}
                  onDrop={(e) => handleDrop(e, "carburants")}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    dragOver.carburants
                      ? "border-amber-500 bg-amber-500/5"
                      : files.carburants
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    id="file-carburants"
                    className="hidden"
                    onChange={(e) => handleFileChange("carburants", e.target.files?.[0] || null)}
                  />
                  <label htmlFor="file-carburants" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className={`w-8 h-8 ${files.carburants ? "text-emerald-500" : "text-slate-400"}`} />
                    {files.carburants ? (
                      <div>
                        <p className="text-xs font-bold text-slate-800">{files.carburants.name}</p>
                        <p className="text-[10px] text-slate-500">{(files.carburants.size / 1024).toFixed(1)} KB - Prêt</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700">Sélectionnez ou déposez votre fichier carburants.csv</p>
                        <p className="text-[10px] text-slate-400">Format CSV uniquement</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex justify-between items-center pt-2">
                  {files.carburants && (
                    <Button
                      variant="ghost"
                      onClick={() => handleFileChange("carburants", null)}
                      className="text-xs text-rose-600 hover:text-rose-700 p-0"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Annuler
                    </Button>
                  )}
                  <Button
                    onClick={() => handleTriggerImport("carburants")}
                    disabled={!files.carburants || importLoading}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-wider gap-2 ml-auto rounded-lg"
                  >
                    {importLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Lancer l'Importation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CARD 3: Plateforme Production - Planification */}
            <Card className="relative overflow-hidden border-2 border-amber-500 rounded-2xl shadow-lg bg-white pt-1.5">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />
              <CardHeader className="bg-slate-50 p-4 border-b border-slate-200 mt-1">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100 font-mono text-[9px] mb-1.5 uppercase font-bold">
                      EXPLOITATION SOU (IMPORT 3)
                    </Badge>
                    <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      3. Planification Production — Plannings
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1">
                      Met en correspondance les plannings d'interventions affectés aux mécaniciens (synchronisation dans la collection 'users').
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="text-[11px] bg-slate-50 text-slate-600 rounded-lg p-2.5 font-mono space-y-1">
                  <span className="font-bold text-slate-700 uppercase block mb-1">Structure attendue (planification.csv) :</span>
                  <code>mecanicien_matricule, mecanicien_nom, telephone, email, date, poste, site, engin_matricule, type_intervention, heure_debut_prevue, heure_fin_prevue</code>
                </div>

                <div
                  onDragOver={(e) => handleDragOver(e, "planification", true)}
                  onDragLeave={(e) => handleDragOver(e, "planification", false)}
                  onDrop={(e) => handleDrop(e, "planification")}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    dragOver.planification
                      ? "border-amber-500 bg-amber-500/5"
                      : files.planification
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    id="file-planification"
                    className="hidden"
                    onChange={(e) => handleFileChange("planification", e.target.files?.[0] || null)}
                  />
                  <label htmlFor="file-planification" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className={`w-8 h-8 ${files.planification ? "text-emerald-500" : "text-slate-400"}`} />
                    {files.planification ? (
                      <div>
                        <p className="text-xs font-bold text-slate-800">{files.planification.name}</p>
                        <p className="text-[10px] text-slate-500">{(files.planification.size / 1024).toFixed(1)} KB - Prêt</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700">Sélectionnez ou déposez votre fichier planification.csv</p>
                        <p className="text-[10px] text-slate-400">Format CSV uniquement</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex justify-between items-center pt-2">
                  {files.planification && (
                    <Button
                      variant="ghost"
                      onClick={() => handleFileChange("planification", null)}
                      className="text-xs text-rose-600 hover:text-rose-700 p-0"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Annuler
                    </Button>
                  )}
                  <Button
                    onClick={() => handleTriggerImport("planification")}
                    disabled={!files.planification || importLoading}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-wider gap-2 ml-auto rounded-lg"
                  >
                    {importLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Lancer l'Importation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CARD 4: Plateforme Production - Réalisation */}
            <Card className="relative overflow-hidden border-2 border-amber-500 rounded-2xl shadow-lg bg-white pt-1.5">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />
              <CardHeader className="bg-slate-50 p-4 border-b border-slate-200 mt-1">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100 font-mono text-[9px] mb-1.5 uppercase font-bold">
                      EXPLOITATION SOU (IMPORT 4)
                    </Badge>
                    <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      4. Réalisation Production — Interventions Réelles
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1">
                      Importe les interventions de maintenance réellement exécutées par l'équipe, et calcule les performances (MTTR, interventions).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="text-[11px] bg-slate-50 text-slate-600 rounded-lg p-2.5 font-mono space-y-1">
                  <span className="font-bold text-slate-700 uppercase block mb-1">Structure attendue (realisation.csv) :</span>
                  <code>mecanicien_matricule, date, engin_matricule, type_intervention, heure_debut_reelle, heure_fin_reelle, duree_heures, description_travaux, statut, pieces_utilisees, categorie</code>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    * La colonne <strong>categorie</strong> doit contenir l'une des valeurs suivantes : <code>Mécanique</code>, <code>Hydraulique</code>, <code>Électrique</code>, <code>Pneumatique</code>, <code>Transmission</code>, <code>Freinage</code>, <code>Autre</code>.
                    Si la colonne est absente, vide ou contient une valeur invalide, la valeur <code>"Non catégorisé"</code> sera automatiquement attribuée (sans deviner).
                  </p>
                </div>

                <div
                  onDragOver={(e) => handleDragOver(e, "realisation", true)}
                  onDragLeave={(e) => handleDragOver(e, "realisation", false)}
                  onDrop={(e) => handleDrop(e, "realisation")}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    dragOver.realisation
                      ? "border-amber-500 bg-amber-500/5"
                      : files.realisation
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    id="file-realisation"
                    className="hidden"
                    onChange={(e) => handleFileChange("realisation", e.target.files?.[0] || null)}
                  />
                  <label htmlFor="file-realisation" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className={`w-8 h-8 ${files.realisation ? "text-emerald-500" : "text-slate-400"}`} />
                    {files.realisation ? (
                      <div>
                        <p className="text-xs font-bold text-slate-800">{files.realisation.name}</p>
                        <p className="text-[10px] text-slate-500">{(files.realisation.size / 1024).toFixed(1)} KB - Prêt</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-700">Sélectionnez ou déposez votre fichier realisation.csv</p>
                        <p className="text-[10px] text-slate-400">Format CSV uniquement</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex justify-between items-center pt-2">
                  {files.realisation && (
                    <Button
                      variant="ghost"
                      onClick={() => handleFileChange("realisation", null)}
                      className="text-xs text-rose-600 hover:text-rose-700 p-0"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Annuler
                    </Button>
                  )}
                  <Button
                    onClick={() => handleTriggerImport("realisation")}
                    disabled={!files.realisation || importLoading}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-wider gap-2 ml-auto rounded-lg"
                  >
                    {importLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Lancer l'Importation
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Sidebar - Active Report Feedback */}
          <div className="space-y-6">
            
            <Card className="relative overflow-hidden border-2 border-amber-500 rounded-2xl shadow-lg bg-white pt-1.5">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />
              <CardHeader className="p-4 bg-slate-50 border-b border-slate-200 mt-1">
                <CardTitle className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Rapport d'Importation en Direct
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Résultat analytique détaillé de la dernière importation effectuée.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {lastReport ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-100 rounded-lg space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Plateforme :</span>
                      <span className="text-xs font-black text-slate-800">{lastReport.platform}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Fichier : {lastReport.fileName}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                        <span className="text-[9px] uppercase font-bold text-emerald-600 font-mono block">SUCCÈS</span>
                        <span className="text-lg font-black text-emerald-700">{lastReport.result.successCount}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg">
                        <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">IGNORÉS</span>
                        <span className="text-lg font-black text-slate-700">{lastReport.result.ignoredCount}</span>
                      </div>
                      <div className="bg-rose-50 border border-rose-100 p-2 rounded-lg">
                        <span className="text-[9px] uppercase font-bold text-rose-600 font-mono block">ERREURS</span>
                        <span className="text-lg font-black text-rose-700">{lastReport.result.errorCount}</span>
                      </div>
                    </div>

                    {lastReport.result.errorCount > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-wide text-rose-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Détail des anomalies
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadErrorReport}
                            className="h-7 text-[10px] font-bold uppercase rounded-lg px-2 border-rose-200 text-rose-700 hover:bg-rose-50"
                          >
                            <Download className="w-3 h-3 mr-1" /> Exporter .TXT
                          </Button>
                        </div>
                        <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-lg text-[10px] divide-y divide-slate-100 font-mono">
                          {lastReport.result.errors.map((err, i) => (
                            <div key={i} className="p-2.5 bg-rose-50/40 hover:bg-rose-50/80 transition-all text-slate-700">
                              <span className="font-bold text-rose-600">Ligne {err.line} :</span> {err.message}
                              {err.raw && (
                                <div className="text-[9px] text-slate-400 truncate mt-0.5">
                                  Brut : {err.raw}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center space-y-1 text-emerald-800">
                        <Check className="w-5 h-5 mx-auto text-emerald-500" />
                        <p className="text-[11px] font-bold">Aucune anomalie détectée !</p>
                        <p className="text-[10px] text-emerald-600 leading-snug">
                          Toutes les lignes ont été réconciliées et injectées avec succès dans la base de données.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 border border-slate-100 rounded-xl bg-slate-50 text-slate-400 space-y-2">
                    <HelpCircle className="w-6 h-6 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">Aucun rapport actif</p>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Veuillez charger un fichier CSV et lancer l'importation pour voir les analyses et le rapport d'erreurs sémantique.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>
      )}

      {activeTab === "history" && (
        <Card className="relative overflow-hidden border-2 border-amber-500 rounded-2xl shadow-lg bg-white pt-1.5">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-800 to-sky-400 z-10" />
          <CardHeader className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1">
            <div>
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-amber-500" /> Registre des Actions d'Intégration
              </CardTitle>
              <CardDescription className="text-xs">
                Registre historique complet des importations exécutées par l'équipe d'administration de la mine.
              </CardDescription>
            </div>
            {isAuthorized && historyLogs.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={clearHistoryLog}
                className="text-[10px] font-bold uppercase rounded-lg h-8 px-3 gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Vider l'historique
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Chargement du journal...</span>
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="text-center py-12 border border-slate-100 rounded-xl bg-slate-50 text-slate-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">Aucun historique d'importation</p>
                <p className="text-[10px] text-slate-400">
                  Les rapports de synchronisation des fichiers d'importations HYDROMINES - Espace Maintenance s'afficheront ici.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold font-mono text-[10px] uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Plateforme</th>
                      <th className="py-2.5 px-3">Éléments</th>
                      <th className="py-2.5 px-3">Statut</th>
                      <th className="py-2.5 px-3">Opérateur</th>
                      <th className="py-2.5 px-3">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {historyLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-all">
                        <td className="py-3 px-3 font-mono text-[10px] whitespace-nowrap">
                          {log.timestamp ? new Date((log.timestamp as any).toDate ? (log.timestamp as any).toDate() : ((log.timestamp as any).seconds ? (log.timestamp as any).seconds * 1000 : log.timestamp)).toLocaleString() : "À l'instant"}
                        </td>
                        <td className="py-3 px-3 font-bold uppercase text-[10px]">
                          {log.platform === "magasinier" && "LOGISTIQUE"}
                          {log.platform === "carburants" && "TÉLÉMÉTRIE"}
                          {log.platform === "planification" && "PLANIFICATION"}
                          {log.platform === "realisation" && "RÉALISATION"}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900">{log.elementsImported}</td>
                        <td className="py-3 px-3">{getStatusBadge(log.status)}</td>
                        <td className="py-3 px-3 text-slate-500 font-medium">{log.operator}</td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] leading-relaxed max-w-xs truncate" title={log.message}>
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
