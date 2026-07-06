// V4-MECANICIENS: Full-featured Configuration Système Mécaniciens (Phase 3)
import * as React from "react";
import { 
  Users, UserPlus, Search, Filter, Pencil, Trash2, 
  CheckCircle, AlertTriangle, XCircle, Shield, Briefcase, 
  MapPin, Phone, Mail, FileText, Upload, Calendar, ArrowRight,
  Sparkles, Star, Award, ShieldAlert, BookOpen, Clock, Heart, 
  Percent, File, Eye, Download, Info, Check, HelpCircle
} from "lucide-react";
import { useMecaniciens, DEFAULT_DOCUMENTS, DEFAULT_STATS } from "@/hooks/useMecaniciens";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { SiteID, Mecanicien, Documents } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";

const COMPETENCIES_LIST = [
  "MOTEUR_DIESEL",
  "HYDRAULIQUE",
  "ELECTRIQUE",
  "PNEUMATIQUE",
  "CATERPILLAR",
  "DEUTZ",
  "KOMATSU",
  "SANDVIK",
  "ATLAS_COPCO",
  "MONTABERT",
  "SOUDURE",
  "CHASSIS",
  "TRANSMISSION",
  "AUTOMATISME",
  "CLIMATISATION"
];

const SITE_LABELS: Record<string, string> = {
  SMI: "SMI",
  OUMEJRANE: "OUMEJRANE",
  KOUDIA: "KOUDIAT AICHA",
  OUANSIMI: "OUANSIMI",
  "BOU-AZZER": "BOU-AZZER"
};

export function AdminMecaniciens() {
  const { mecaniciens, loading, saveMecanicien, deleteMecanicien, uploadMecanicienFile } = useMecaniciens();
  const { activeSite, user } = useAuthStore();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [siteFilter, setSiteFilter] = React.useState<string>("TOUS");
  const [selectedMeca, setSelectedMeca] = React.useState<Mecanicien | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [activeFormTab, setActiveFormTab] = React.useState<"infos" | "skills" | "docs">("infos");

  // Form states
  const [formUid, setFormUid] = React.useState("");
  const [formMatricule, setFormMatricule] = React.useState("");
  const [formNom, setFormNom] = React.useState("");
  const [formPrenom, setFormPrenom] = React.useState("");
  const [formPhoto, setFormPhoto] = React.useState("");
  const [formSiteId, setFormSiteId] = React.useState<SiteID>("SMI");
  const [formPoste, setFormPoste] = React.useState("Poste 1");
  const [formEquipe, setFormEquipe] = React.useState("A");
  const [formTelephone, setFormTelephone] = React.useState("");
  const [formTelephoneUrgence, setFormTelephoneUrgence] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formAdresse, setFormAdresse] = React.useState("");
  const [formDateNaissance, setFormDateNaissance] = React.useState("");
  const [formDateEmbauche, setFormDateEmbauche] = React.useState("");
  const [formCompetences, setFormCompetences] = React.useState<string[]>([]);
  const [formDocuments, setFormDocuments] = React.useState<Documents>(JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS)));
  const [formStats, setFormStats] = React.useState(DEFAULT_STATS);
  const [formActive, setFormActive] = React.useState(true);
  const [formUserUid, setFormUserUid] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  // File uploading flags
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [uploadingDoc, setUploadingDoc] = React.useState<Record<string, boolean>>({});

  const isAuthorized = ["ADMIN", "RESPONSABLE_MAINTENANCE"].includes(user?.role || "");

  // Helpers
  const getSeniority = (startDate: string) => {
    if (!startDate) return "Non spécifiée";
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return "Non spécifiée";
    const today = new Date();
    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < start.getDate())) {
      years--;
      months += 12;
    }
    if (years === 0) return `${months} mois`;
    return `${years} ans`;
  };

  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return null;
    const today = new Date();
    const expDate = new Date(dateString);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };



  // Filter mechanics
  const filteredMecaniciens = React.useMemo(() => {
    return mecaniciens.filter(m => {
      const matchSiteGlobal = activeSite === "TOUS" || m.siteId === activeSite;
      const matchSiteFilter = siteFilter === "TOUS" || m.siteId === siteFilter;
      const matchSearch = 
        m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.matricule.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSiteGlobal && matchSiteFilter && matchSearch;
    });
  }, [mecaniciens, activeSite, siteFilter, searchTerm]);

  // Open form for creation
  const handleAddClick = () => {
    if (!isAuthorized) {
      toast.error("Privilèges d'administration requis.");
      return;
    }
    setIsEditing(false);
    setFormUid("meca-" + Date.now());
    setFormMatricule("");
    setFormNom("");
    setFormPrenom("");
    setFormPhoto("");
    setFormSiteId(activeSite === "TOUS" ? "SMI" : activeSite);
    setFormPoste("Poste 1");
    setFormEquipe("A");
    setFormTelephone("");
    setFormTelephoneUrgence("");
    setFormEmail("");
    setFormAdresse("");
    setFormDateNaissance("");
    setFormDateEmbauche(new Date().toISOString().split('T')[0]);
    setFormCompetences([]);
    setFormDocuments(JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS)));
    setFormStats(DEFAULT_STATS);
    setFormActive(true);
    setFormUserUid(null);

    setActiveFormTab("infos");
    setIsFormOpen(true);
  };

  // Open form for editing
  const handleEditClick = (meca: Mecanicien) => {
    if (!isAuthorized) {
      toast.error("Privilèges d'administration requis.");
      return;
    }
    setIsEditing(true);
    setFormUid(meca.uid);
    setFormMatricule(meca.matricule);
    setFormNom(meca.nom);
    setFormPrenom(meca.prenom);
    setFormPhoto(meca.photo || "");
    setFormSiteId(meca.siteId);
    setFormPoste(meca.poste);
    setFormEquipe(meca.equipe || "A");
    setFormTelephone(meca.telephone || "");
    setFormTelephoneUrgence(meca.telephoneUrgence || "");
    setFormEmail(meca.email || "");
    setFormAdresse(meca.adresse || "");
    setFormDateNaissance(meca.dateNaissance || "");
    setFormDateEmbauche(meca.dateEmbauche || "");
    setFormCompetences(meca.competences || []);
    setFormDocuments(meca.documents ? JSON.parse(JSON.stringify(meca.documents)) : JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS)));
    setFormStats(meca.stats || DEFAULT_STATS);
    setFormActive(meca.active !== false);
    setFormUserUid(meca.userUid || null);

    setActiveFormTab("infos");
    setIsFormOpen(true);
  };

  // Submit mecanicien
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom.trim() || !formPrenom.trim() || !formMatricule.trim()) {
      toast.error("Le nom, le prénom et le matricule sont requis !");
      return;
    }

    // Check duplicate matricule on creation
    if (!isEditing) {
      const exists = mecaniciens.some(m => m.matricule.toLowerCase() === formMatricule.trim().toLowerCase());
      if (exists) {
        toast.error(`Le matricule ${formMatricule} est déjà attribué à un autre mécanicien.`);
        return;
      }
    }

    const mecaData: Mecanicien = {
      uid: formUid,
      userUid: formUserUid,
      matricule: formMatricule.trim().toUpperCase(),
      nom: formNom.trim(),
      prenom: formPrenom.trim(),
      photo: formPhoto,
      siteId: formSiteId,
      poste: formPoste,
      equipe: formEquipe,
      competences: formCompetences,
      telephone: formTelephone.trim(),
      telephoneUrgence: formTelephoneUrgence.trim(),
      email: formEmail.trim(),
      adresse: formAdresse.trim(),
      dateNaissance: formDateNaissance,
      dateEmbauche: formDateEmbauche,
      documents: formDocuments,
      stats: formStats,
      active: formActive,
      source: "ADMIN_CREATION"
    };

    const success = await saveMecanicien(mecaData);
    if (success) {
      setIsFormOpen(false);
    }
  };

  // Delete mecanicien
  const handleDeleteClick = async (meca: Mecanicien) => {
    if (!isAuthorized) {
      toast.error("Action réservée aux administrateurs.");
      return;
    }
    if (confirm(`Voulez-vous vraiment supprimer définitivement le mécanicien ${meca.prenom} ${meca.nom} (Matricule: ${meca.matricule}) de la base ?`)) {
      await deleteMecanicien(meca.uid);
    }
  };

  // Upload File
  const handleFileUpload = async (
    target: "photo" | keyof Documents,
    file: File
  ) => {
    if (!formMatricule) {
      toast.error("Veuillez renseigner le matricule du mécanicien avant de charger des fichiers.");
      return;
    }

    if (target === "photo") {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("La taille de la photo doit être inférieure à 2Mo.");
        return;
      }
      setUploadingPhoto(true);
      try {
        const url = await uploadMecanicienFile(formMatricule, "avatar", file);
        setFormPhoto(url);
        toast.success("Photo de profil chargée !");
      } catch (err) {
        toast.error("Erreur de chargement de la photo.");
      } finally {
        setUploadingPhoto(false);
      }
    } else {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La taille du document doit être inférieure à 5Mo (PDF/JPG attendus).");
        return;
      }
      setUploadingDoc(prev => ({ ...prev, [target]: true }));
      try {
        const url = await uploadMecanicienFile(formMatricule, "document", file, target);
        setFormDocuments(prev => ({ ...prev, [target]: url }));
        toast.success(`Document '${target}' importé avec succès !`);
      } catch (err) {
        toast.error("Erreur de transfert du fichier.");
      } finally {
        setUploadingDoc(prev => ({ ...prev, [target]: false }));
      }
    }
  };

  // Competency toggles
  const toggleCompetency = (comp: string) => {
    setFormCompetences(prev => 
      prev.includes(comp) 
        ? prev.filter(c => c !== comp) 
        : [...prev, comp]
    );
  };



  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 p-2 rounded-lg text-amber-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Configuration Système — Référentiel Mécaniciens
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Source de vérité centrale des profils, contact, habilitations sécuritaires et contrats d'embauche.
              </p>
            </div>
          </div>
        </div>

        {isAuthorized && (
          <Button
            onClick={handleAddClick}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-wider gap-2 rounded-xl"
          >
            <UserPlus className="w-4 h-4" />
            Créer un profil mécanicien
          </Button>
        )}
      </div>

      {/* Stats Quickbar */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="border-slate-200 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Effectif Référentiel</p>
              <h3 className="text-xl font-black text-slate-900">{mecaniciens.length} techniciens</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table Layout */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-xs font-black uppercase text-slate-800 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-500" /> Registre opérationnel des équipes
            </CardTitle>
            <CardDescription className="text-xs">
              Liste triable et éditable de l'ensemble de la force de maintenance.
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher nom, matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs rounded-lg border-slate-200"
              />
            </div>

            {/* Site selector */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg h-9 px-2 bg-white font-medium text-slate-700"
              >
                <option value="TOUS">Tous les sites</option>
                <option value="SMI">SMI</option>
                <option value="OUMEJRANE">OUMEJRANE</option>
                <option value="KOUDIA">KOUDIAT AICHA</option>
                <option value="OUANSIMI">OUANSIMI</option>
                <option value="BOU-AZZER">BOU-AZZER</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-amber-500 animate-spin" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Acquisition de la base...</span>
            </div>
          ) : filteredMecaniciens.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-200" />
              <p className="text-xs font-bold text-slate-600">Aucun technicien trouvé</p>
              <p className="text-[10px] text-slate-400">Ajustez vos filtres ou lancez une création de profil.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold font-mono text-[9px] uppercase">
                    <th className="py-3 px-4">Mécanicien</th>
                    <th className="py-3 px-4">Matricule</th>
                    <th className="py-3 px-4">Site / Affectation</th>
                    <th className="py-3 px-4">Compétences clés</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredMecaniciens.map((meca) => {
                    return (
                      <tr key={meca.uid} className="hover:bg-slate-50/60 transition-all">
                        {/* Identity Column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {meca.photo ? (
                                <img 
                                  src={meca.photo} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="text-xs font-bold font-mono text-slate-500">
                                  {meca.prenom.charAt(0)}{meca.nom.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{meca.prenom} {meca.nom}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 text-slate-400 text-[10px]">
                                <Phone className="w-3 h-3" />
                                <span>{meca.telephone || "Aucun contact"}</span>
                                {meca.userUid && (
                                  <Badge variant="outline" className="text-[8px] h-3.5 leading-none px-1 py-0 border-blue-200 text-blue-600 bg-blue-50 font-bold font-mono">
                                    COMPTE GMAO
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Matricule Column */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-[10px]">
                          {meca.matricule}
                        </td>

                        {/* Site affectation */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-800">
                              {SITE_LABELS[meca.siteId] || meca.siteId}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {meca.poste} • Shift {meca.equipe || "A"}
                            </div>
                          </div>
                        </td>

                        {/* Competencies Column */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {meca.competences && meca.competences.length > 0 ? (
                              meca.competences.slice(0, 3).map((comp) => (
                                <Badge 
                                  key={comp} 
                                  variant="outline" 
                                  className="text-[9px] font-mono leading-none py-0.5 px-1.5 bg-slate-50 text-slate-600 border-slate-200 uppercase font-semibold"
                                >
                                  {comp.replace("_", " ")}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[10px] italic">Aucune enregistrée</span>
                            )}
                            {meca.competences && meca.competences.length > 3 && (
                              <Badge variant="outline" className="text-[9px] leading-none py-0.5 px-1 bg-amber-50 text-amber-700 border-amber-200 font-bold">
                                +{meca.competences.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>



                        {/* Actions buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(meca)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 border-slate-200 rounded-lg bg-white"
                              title="Éditer le profil"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            {isAuthorized && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(meca)}
                                className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 border-rose-100 hover:border-rose-200 rounded-lg bg-rose-50/20"
                                title="Supprimer le profil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL FORM COMPOSANT (ÉDITION / CRÉATION) */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl bg-white border border-slate-200 flex flex-col max-h-[90vh]">
          <DialogHeader className="bg-slate-50 p-5 border-b border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-amber-100 text-amber-800 font-mono text-[9px] mb-1 uppercase font-bold">
                  {isEditing ? "ÉDITION DE FICHE MÉCANIECIEN" : "NOUVEL ENREGISTREMENT"}
                </Badge>
                <DialogTitle className="text-base font-black text-slate-900 uppercase tracking-wide">
                  {isEditing ? `✏️ Profil de : ${formPrenom} ${formNom}` : "➕ Créer un profil de technicien de maintenance"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-1">
                  Tous les documents professionnels sont archivés dans le dossier cloud du mécanicien.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form navigation tabs */}
          <div className="flex border-b border-slate-150 bg-slate-50/50 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActiveFormTab("infos")}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 ${
                activeFormTab === "infos" 
                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-xs" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-500" />
              1. Informations Générales
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab("skills")}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 ${
                activeFormTab === "skills" 
                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-xs" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              2. Compétences & Poste
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab("docs")}
              className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1.5 ${
                activeFormTab === "docs" 
                  ? "bg-white text-slate-900 border border-slate-200/80 shadow-xs" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-500" />
              3. Documents Cloud
            </button>
          </div>

          {/* Form scrollable body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* TAB 1: GENERAL INFOS */}
            {activeFormTab === "infos" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Photo Upload Panel */}
                <div className="md:col-span-1 space-y-4 flex flex-col items-center">
                  <Label className="text-xs font-bold text-slate-600 block self-start">Photo de Profil (Fichier JPG/PNG)</Label>
                  <div className="relative group w-32 h-32 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                    {formPhoto ? (
                      <img 
                        src={formPhoto} 
                        alt="Photo de profil" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-slate-300" />
                    )}

                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload("photo", file);
                      }}
                    />
                    <label 
                      htmlFor="avatar-input" 
                      className="flex items-center justify-center gap-1.5 w-full h-8 px-3 text-xs font-bold bg-slate-100 border border-slate-200 hover:bg-slate-200/80 cursor-pointer rounded-lg text-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {formPhoto ? "Changer la photo" : "Importer une photo"}
                    </label>
                  </div>

                  {/* Operational stats box in view only */}
                  <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2 text-[11px]">
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                      <span>Total Interventions :</span>
                      <span className="font-bold text-slate-800">{formStats.totalInterventions}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                      <span>Ce Mois :</span>
                      <span className="font-bold text-slate-800">{formStats.interventionsCeMois}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                      <span>MTTR Moyen :</span>
                      <span className="font-bold text-slate-800">{formStats.mttrMoyen}h</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                      <span>Score Qualité :</span>
                      <span className="font-bold text-slate-800">{formStats.scoreMensuel}%</span>
                    </div>
                  </div>
                </div>

                {/* Main profile inputs */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="matricule" className="text-xs font-bold text-slate-700">Matricule d'embauche *</Label>
                      <Input
                        id="matricule"
                        value={formMatricule}
                        onChange={(e) => setFormMatricule(e.target.value)}
                        placeholder="M-2024-XXX"
                        disabled={isEditing}
                        className="h-9 text-xs rounded-lg uppercase"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="userUid" className="text-xs font-bold text-slate-700">UID de Connexion SOU-GMAO</Label>
                      <Input
                        id="userUid"
                        value={formUserUid || ""}
                        onChange={(e) => setFormUserUid(e.target.value || null)}
                        placeholder="Optionnel (ex: auth-uid-firebase)"
                        className="h-9 text-xs rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="nom" className="text-xs font-bold text-slate-700">Nom *</Label>
                      <Input
                        id="nom"
                        value={formNom}
                        onChange={(e) => setFormNom(e.target.value)}
                        placeholder="ex: Naciri"
                        className="h-9 text-xs rounded-lg"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="prenom" className="text-xs font-bold text-slate-700">Prénom *</Label>
                      <Input
                        id="prenom"
                        value={formPrenom}
                        onChange={(e) => setFormPrenom(e.target.value)}
                        placeholder="ex: Kaddour"
                        className="h-9 text-xs rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="naissance" className="text-xs font-bold text-slate-700">Date de Naissance</Label>
                      <Input
                        id="naissance"
                        type="date"
                        value={formDateNaissance}
                        onChange={(e) => setFormDateNaissance(e.target.value)}
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="embauche" className="text-xs font-bold text-slate-700">Date d'embauche</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="embauche"
                          type="date"
                          value={formDateEmbauche}
                          onChange={(e) => setFormDateEmbauche(e.target.value)}
                          className="h-9 text-xs rounded-lg flex-1"
                        />
                        {formDateEmbauche && (
                          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 font-bold border-slate-200">
                            {getSeniority(formDateEmbauche)} d'ancienneté
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="tel" className="text-xs font-bold text-slate-700">Téléphone personnel *</Label>
                      <Input
                        id="tel"
                        value={formTelephone}
                        onChange={(e) => setFormTelephone(e.target.value)}
                        placeholder="+212 6XX XXXXXX"
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="tel-urg" className="text-xs font-bold text-slate-700">Contact d'Urgence (Sécurité) *</Label>
                      <Input
                        id="tel-urg"
                        value={formTelephoneUrgence}
                        onChange={(e) => setFormTelephoneUrgence(e.target.value)}
                        placeholder="ex: +212 6XX XXXXXX (Famille)"
                        className="h-9 text-xs rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-700">Adresse Email Professionnelle</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="k.naciri@hydromines.ma"
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="adresse" className="text-xs font-bold text-slate-700">Adresse Résidentielle Complète</Label>
                    <Input
                      id="adresse"
                      value={formAdresse}
                      onChange={(e) => setFormAdresse(e.target.value)}
                      placeholder="Quartier El Houda, Ouarzazate"
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: SKILLS & ASSIGNMENT */}
            {activeFormTab === "skills" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Site d'affectation *</Label>
                    <select
                      value={formSiteId}
                      onChange={(e) => setFormSiteId(e.target.value as SiteID)}
                      className="w-full text-xs border border-slate-200 rounded-lg h-9 px-2 bg-white text-slate-800"
                    >
                      <option value="SMI">SMI</option>
                      <option value="OUMEJRANE">OUMEJRANE</option>
                      <option value="KOUDIA">KOUDIAT AICHA</option>
                      <option value="OUANSIMI">OUANSIMI</option>
                      <option value="BOU-AZZER">BOU-AZZER</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Poste d'affectation *</Label>
                    <select
                      value={formPoste}
                      onChange={(e) => setFormPoste(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg h-9 px-2 bg-white text-slate-800"
                    >
                      <option value="Poste 1">Poste 1 (Matin)</option>
                      <option value="Poste 2">Poste 2 (Après-midi)</option>
                      <option value="Poste 3">Poste 3 (Nuit)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Équipe (Shift) *</Label>
                    <select
                      value={formEquipe}
                      onChange={(e) => setFormEquipe(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg h-9 px-2 bg-white text-slate-800"
                    >
                      <option value="A">Shift A</option>
                      <option value="B">Shift B</option>
                      <option value="C">Shift C</option>
                      <option value="D">Shift D</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <Award className="w-4 h-4 text-indigo-500" />
                      COMPÉTENCES CERTIFIÉES (Cocher pour habiliter)
                    </Label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cocher les badges de compétences attestés par le responsable d'atelier.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    {COMPETENCIES_LIST.map((comp) => {
                      const isChecked = formCompetences.includes(comp);
                      return (
                        <label 
                          key={comp}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                            isChecked 
                              ? "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-3xs" 
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCompetency(comp)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                          />
                          <span className="font-mono text-[10px] uppercase font-bold truncate">
                            {comp.replace("_", " ")}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}



            {/* TAB 4: DOCUMENTS ARCHIVE */}
            {activeFormTab === "docs" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-xs font-black text-slate-800 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-sky-500" />
                    COFFRE-FORT NUMÉRIQUE CLOUD (Documents PDF / JPG)
                  </Label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sélectionnez ou déposez des copies numérisées pour archivage cloud sécurisé. Limite : 5 Mo par fichier.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {([
                    { key: "contrat", label: "Contrat de Travail Actif" },
                    { key: "diplome", label: "Diplôme principal ou Certificats" },
                    { key: "attestationFormation", label: "Attestation de Formation Initiale" },
                    { key: "caces", label: "Permis / CACES minier" }
                  ] as Array<{ key: keyof Documents; label: string }>).map(({ key, label }) => {
                    const docUrl = formDocuments[key];
                    const isUploading = !!uploadingDoc[key];

                    return (
                      <Card key={key} className="border-slate-200/80 shadow-none overflow-hidden flex flex-col justify-between">
                        <CardHeader className="bg-slate-50/70 p-3 border-b border-slate-100">
                          <CardTitle className="text-[10px] font-black uppercase text-slate-700">{label}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          {docUrl ? (
                            <div className="flex items-center justify-between p-2.5 bg-sky-50/50 border border-sky-100 rounded-lg">
                              <div className="flex items-center gap-2 text-slate-700 min-w-0">
                                <File className="w-4 h-4 text-sky-500 flex-shrink-0" />
                                <span className="text-[10px] font-mono truncate max-w-xs">{docUrl.substring(docUrl.lastIndexOf('/') + 1, docUrl.indexOf('?') > -1 ? docUrl.indexOf('?') : undefined) || "Pièce jointe"}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => window.open(docUrl, "_blank")}
                                  className="h-7 w-7 p-0 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => setFormDocuments(prev => ({ ...prev, [key]: "" }))}
                                  className="h-7 w-7 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="border border-dashed border-slate-200 rounded-lg p-3 text-center bg-slate-50/50">
                              <input
                                type="file"
                                id={`file-doc-${key}`}
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(key, file);
                                }}
                              />
                              <label htmlFor={`file-doc-${key}`} className="cursor-pointer flex flex-col items-center justify-center gap-1">
                                <Upload className="w-5 h-5 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-600">Sélectionner un fichier</span>
                                <span className="text-[9px] text-slate-400">PDF ou Image (Max 5Mo)</span>
                              </label>
                            </div>
                          )}

                          {isUploading && (
                            <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 font-mono">
                              <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
                              <span>Importation cloud...</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

          </form>

          {/* Form Actions Footer */}
          <DialogFooter className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="text-xs font-bold rounded-lg border-slate-200"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase text-xs tracking-wider gap-2 rounded-lg"
            >
              <Check className="w-4 h-4" /> Enregistrer le profil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
