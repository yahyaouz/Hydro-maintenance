import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Wrench, Activity, Clock, ShieldAlert, Cpu, FileText, CheckSquare, 
  Trash, Lock, UserCheck, RefreshCw, AlertTriangle, Play, CheckCircle2, 
  Search, ShieldCheck, Coins, HelpCircle, Layers, Settings, Eye, Zap
} from "lucide-react";
import { 
  MaintenanceValidator, 
  TransitionRules, 
  AuditTrailService, 
  UnifiedAuditLog 
} from "../services/maintenanceRules";
import { SiteID } from "../types";

// 1. Core Data Structures & Types
export interface MachineDowntime {
  id: string;
  startHour: string;       // e.g. "2026-05-20 08:30"
  endHour?: string;        // empty if active
  durationMinutes?: number; // computed once resolved
  reason: string;
  category: "HYDRAULIQUE" | "MOTEUR" | "TRANSMISSION" | "FREINAGE" | "ÉLECTRIQUE" | "PNEUMATIQUE" | "STRUCTURE" | "SÉCURITÉ";
  severity: "critique" | "majeur" | "mineur";
  isAwaitingParts: boolean;
  isAwaitingMechanic: boolean;
  isAwaitingProduction: boolean;
  assignedMechanic?: string;
  remedyAction?: string;
}

export interface MiniMachine {
  code: string;
  type: "Scooptram" | "Foreuse Jumbo" | "Dumper Souterrain" | "Locomotive";
  model: string;
  status: "DISPONIBLE" | "EN PANNE" | "EN MAINTENANCE" | "EN ATTENTE PIÈCES" | "RESTREINTE";
  hours: number;
  currentWorksite: string;
  activeDowntimeId?: string;
  downtimes: MachineDowntime[];
  siteId: SiteID; // Added for multi-site isolation
}

export interface WorkOrderBT {
  id: string;
  machineCode: string;
  title: string;
  category: string;
  severity: "critique" | "majeur" | "mineur";
  status: "OUVERT" | "EN_COURS" | "PIÈCES_ATTRIBUÉES" | "RÉSOLU" | "CLOS";
  assignedTech: string;
  creationDate: string;
  checklist: Array<{ task: string; done: boolean }>;
  actionsHistory: Array<{
    timestamp: string;
    role: string;
    action: string;
    user: string;
  }>;
  replacedParts: Array<{ name: string; qty: number; costUSD: number }>;
  siteId: SiteID; // Added for multi-site isolation
}

export interface HandoverReport {
  id: string;
  date: string;
  shift: "JOUR" | "NUIT";
  safetyIncidents: number;
  criticalRisks: string;
  awaitedParts: string;
  supervisorComments: string;
  signedRoles: string[]; // SECRETAIRE, MECANICIEN, RESPONSABLE_CHANTIER, RESPONSABLE_MAINTENANCE
  siteId: SiteID; // Added for multi-site isolation
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "SECRETAIRE" | "MECANICIEN" | "RESPONSABLE_CHANTIER" | "RESPONSABLE_MAINTENANCE" | "DIRECTION" | "ADMIN";
  pin: string;
  badge: string;
  speciality: string;
  habilitations: string[];
  siteId: SiteID; // Added for multi-site isolation
}

export const REAL_PROFILES: UserProfile[] = [
  {
    id: "U-889",
    name: "Youssef Ouzrirou",
    email: "y.ouzrirou@hydromines.com",
    role: "RESPONSABLE_MAINTENANCE",
    pin: "8890",
    badge: "👑 RM-889",
    speciality: "Supervision générale & Approbations SMI",
    habilitations: ["Visa Atelier Niveau III", "Formateur HSE LOTO", "Contrôleur Risques Mine"],
    siteId: "SMI"
  },
  {
    id: "U-312",
    name: "Kamal Alami",
    email: "k.alami@hydromines.com",
    role: "RESPONSABLE_CHANTIER",
    pin: "3120",
    badge: "👷 RC-312",
    speciality: "Opérateur Foreuse Boomer & Abattage de taille",
    habilitations: ["Excavation explosive", "Habilité HSE Taille Souterraine"],
    siteId: "OUMEJRANE"
  },
  {
    id: "U-402",
    name: "Mustapha El Idrissi",
    email: "m.elidrissi@hydromines.com",
    role: "MECANICIEN",
    pin: "4020",
    badge: "🔧 MC-402",
    speciality: "Moteurs Caterpillar & Hydraulique HP",
    habilitations: ["Serrage Dynamométrique Spécialisé", "Consignataire HSE LOTO"],
    siteId: "SMI"
  },
  {
    id: "U-105",
    name: "Fatima Douiri",
    email: "f.douiri@hydromines.com",
    role: "SECRETAIRE",
    pin: "1050",
    badge: "📝 SC-105",
    speciality: "Émission BT & Rapports Post-Shift d'équipe",
    habilitations: ["Magasin de Pièces Niveau II", "Enregistrements Réglementaires"],
    siteId: "SMI"
  },
  {
    id: "U-902",
    name: "Sébastien Laroui",
    email: "s.laroui@hydromines.com",
    role: "DIRECTION",
    pin: "9020",
    badge: "📈 DI-902",
    speciality: "Directeur de l'Exploitation & Passation",
    habilitations: ["Coordinateur Secours Souterrain", "Signataire Consignes Site"],
    siteId: "SMI"
  },
  {
    id: "U-001",
    name: "Administrateur Système",
    email: "admin@hydromines.com",
    role: "ADMIN",
    pin: "0000",
    badge: "🛡️ AD-001",
    speciality: "Unrestricted Platform Administration",
    habilitations: ["Supervisie Générale", "Dépannage d'Urgence"],
    siteId: "SMI"
  }
];

export default function IndustrialDeployment() {
  // Navigation Tabs with focus on speed
  const [activeTab, setActiveTab] = useState<string>("engins");
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<"SECRETAIRE" | "MECANICIEN" | "RESPONSABLE_CHANTIER" | "RESPONSABLE_MAINTENANCE" | "DIRECTION" | "ADMIN">("RESPONSABLE_MAINTENANCE");
  const [searchQuery, setSearchQuery] = useState("");
  const [tactileMode, setTactileMode] = useState<boolean>(() => {
    return localStorage.getItem("sg_tactile_mode") === "true";
  });

  // --- Real User State (Objective 4 + 8) ---
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("sg_current_user");
    if (saved) {
      try {
        const found = JSON.parse(saved);
        if (found && found.id) return found;
      } catch (e) {}
    }
    return REAL_PROFILES[0]; // Default to Chef d'Atelier
  });

  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>(REAL_PROFILES[0].id);

  useEffect(() => {
    localStorage.setItem("sg_current_user", JSON.stringify(currentUser));
    setActiveRole(currentUser.role);
  }, [currentUser]);

  // Inactivity timeout simulation - auto-lock after 15 minutes of real inactivity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Auto-lock after 15 minutes of inactivity
      timeoutId = setTimeout(() => {
        setIsSessionLocked(prev => {
          if (!prev) {
            toast.warning("🔒 Session suspendue par mesure de sécurité pour inactivité. Veuillez saisir votre code PIN.");
            addAuditLog("Verrouillage de sécurité automatique pour inactivité", "SECURITY");
            return true;
          }
          return prev;
        });
      }, 15 * 60 * 1000); // 15 minutes
    };

    // Track active interactions
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []);

  // --- Pilot & Feedback State (Objective 7) ---
  const [sandboxMode, setSandboxMode] = useState<boolean>(() => {
    return localStorage.getItem("sg_sandbox_mode") === "true";
  });

  const [feedbacks, setFeedbacks] = useState<Array<{
    id: string;
    timestamp: string;
    user: string;
    role: string;
    category: string;
    content: string;
    signalType: string;
    network: string;
  }>>(() => {
    const saved = localStorage.getItem("sg_user_feedbacks");
    return saved ? JSON.parse(saved) : [
      { 
        id: "FDB-01", 
        timestamp: "2026-05-20 12:44:11", 
        user: "Mustapha El Idrissi", 
        role: "MÉCANICIEN",
        category: "Ergonomie", 
        content: "Les gros boutons du mode tactile facilitent l'utilisation complète avec les gants de cuir de protection. Très pratique sous l'humidité !", 
        signalType: "POSITIF", 
        network: "WIFI" 
      },
      { 
        id: "FDB-02", 
        timestamp: "2026-05-20 15:10:00", 
        user: "Kamal Alami", 
        role: "OPÉRATEUR",
        category: "Réseau", 
        content: "L'écriture asyncrone hors-ligne a bien sauvegardé mon arrêt de locomotive quand le répéteur WIFI du pôle Nord s'est déconnecté.", 
        signalType: "SUGGESTION", 
        network: "OFFLINE" 
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("sg_user_feedbacks", JSON.stringify(feedbacks));
  }, [feedbacks]);

  // --- Training Scenario Progress Store (Objective 2) ---
  const [scenarioStep, setScenarioStep] = useState<number>(0); // 0 = inactive, 1-6 steps

  // --- Site Filter State ---
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<SiteID>(() => {
    const saved = localStorage.getItem("sg_selected_site_filter");
    if (saved) return saved as SiteID;
    return "TOUS";
  });

  useEffect(() => {
    localStorage.setItem("sg_selected_site_filter", selectedSiteFilter);
  }, [selectedSiteFilter]);

  // Lock standard users to their authorized profile siteId
  useEffect(() => {
    const isManager = currentUser.role === "RESPONSABLE_MAINTENANCE" || currentUser.role === "ADMIN" || currentUser.role === "DIRECTION";
    if (!isManager) {
      setSelectedSiteFilter(currentUser.siteId || "SMI");
    }
  }, [currentUser]);

  // --- Feedback form inputs ---
  const [newFeedbackCategory, setNewFeedbackCategory] = useState("Ergonomie Tactile 🧤");
  const [newFeedbackContent, setNewFeedbackContent] = useState("");
  const [newFeedbackType, setNewFeedbackType] = useState("POSITIF");

  // --- Audit & History State ---
  const [auditLogs, setAuditLogs] = useState<UnifiedAuditLog[]>(() => {
    const saved = localStorage.getItem("sg_audit_logs");
    if (saved) return JSON.parse(saved);
    return [
      { id: "LOG-5512", timestamp: "2026-05-20 10:30:15", role: "CHEF ATELIER", user: "Youssef Ouzrirou", action: "Consignation démarrage de poste GMAO souterraine", type: "SYSTEM", source: "ONLINE", siteId: "SMI" },
      { id: "LOG-9921", timestamp: "2026-05-20 12:15:44", role: "OPÉRATEUR", user: "Kamal Alami", action: "Déclaration initiale arrêt foreuse JUMB-03", type: "PANNE", source: "ONLINE", siteId: "SMI" },
      { id: "LOG-1209", timestamp: "2026-05-20 14:10:02", role: "MÉCANICIEN", user: "Mustapha El Idrissi", action: "Prise en charge BT-2026-001 (Cardan)", type: "MAINTENANCE", source: "ONLINE", siteId: "SMI" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("sg_audit_logs", JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = (
    action: string, 
    type: string = "ACTION",
    modifiedEntity?: string,
    oldValue?: string,
    newValue?: string,
    isOffline: boolean = false
  ) => {
    const log = AuditTrailService.createLog(
      currentUser.name,
      activeRole,
      action,
      type,
      currentUser.siteId || "SMI",
      modifiedEntity,
      oldValue,
      newValue,
      isOffline
    );
    setAuditLogs(prev => [log, ...prev]);
  };

  // --- Offline Mode State ---
  const [offlineMode, setOfflineMode] = useState<boolean>(() => {
    return localStorage.getItem("sg_offline_mode") === "true";
  });
  const [offlineQueue, setOfflineQueue] = useState<Array<{
    id: string;
    timestamp: string;
    actionType: string;
    payload: any;
    label: string;
    retryCount?: number;
    errorStatus?: string;
    siteId?: string;
    status?: string;
  }>>(() => {
    const saved = localStorage.getItem("sg_offline_queue");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("sg_offline_mode", offlineMode ? "true" : "false");
  }, [offlineMode]);

  useEffect(() => {
    localStorage.setItem("sg_offline_queue", JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  const queueOfflineAction = (actionType: string, payload: any, label: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newAction = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      timestamp: timeStr,
      actionType,
      payload,
      label
    };
    setOfflineQueue(prev => [...prev, newAction]);
    toast.warning(`🔌 Enregistré localement : ${label}`);
    addAuditLog(`Action stockée hors-ligne : ${label}`, "OFFLINE");
  };

  // --- Role & Permissions Definition Map ---
  const ROLE_PERMISSIONS: { [key: string]: { name: string; badge: string; desc: string; allowed: string[] } } = {
    "SECRETAIRE": { 
      name: "Secrétaire de Chantier", 
      badge: "📝", 
      desc: "Création de rapports, ouverture de fiches BT et tenue du defect book.", 
      allowed: ["quick_bt", "create_report", "view_backlog", "view_kpis", "view_biblio"] 
    },
    "MECANICIEN": { 
      name: "Mécanicien d'Atelier", 
      badge: "🔧", 
      desc: "Prise en charge (démarrage) de BT, résolution technique de pannes et visa d'interventions.", 
      allowed: ["start_bt", "update_bt", "resolve_bt", "work_checklist", "view_kpis", "remedy_stop"] 
    },
    "RESPONSABLE_CHANTIER": { 
      name: "Responsable de Chantier", 
      badge: "👷", 
      desc: "Déclaration d'arrêt et de panne, supervision des temps d'indisponibilité, et réouverture d'anomalies.", 
      allowed: ["declare_stop", "remedy_stop", "reopen_bt", "view_kpis", "sign_preshift", "declare_anomaly"] 
    },
    "RESPONSABLE_MAINTENANCE": { 
      name: "Responsable Maintenance Multi-Sites", 
      badge: "👑", 
      desc: "Gestion complète de la maintenance, clôture et archivage des BTs, assignations et suppressions.", 
      allowed: ["*"] 
    },
    "DIRECTION": { 
      name: "Direction (Strategic)", 
      badge: "📈", 
      desc: "Visualisation complète des indicateurs stratégiques de la flotte hors écriture.", 
      allowed: ["view_kpis", "view_backlog", "view_biblio", "export_data"] 
    },
    "ADMIN": { 
      name: "Administrateur Système (SMI)", 
      badge: "🛡️", 
      desc: "Droit d'administration total sans aucune restriction.", 
      allowed: ["*"] 
    }
  };

  const hasPermission = (action: string): boolean => {
    if (activeRole === "ADMIN" || activeRole === "RESPONSABLE_MAINTENANCE") return true;
    const rules = ROLE_PERMISSIONS[activeRole];
    if (!rules) return false;
    return rules.allowed.includes("*") || rules.allowed.includes(action);
  };

  const verifyAndExecute = (action: string, executeFn: () => void, actionLabel: string) => {
    if (hasPermission(action)) {
      executeFn();
    } else {
      const roleName = ROLE_PERMISSIONS[activeRole]?.name || activeRole;
      const roleBadge = ROLE_PERMISSIONS[activeRole]?.badge || "🔒";
      toast.error(
        <span>
          <b>Accès Restreint ({roleBadge})</b> <br /> 
          Le rôle <i>{roleName}</i> n'a pas les privilèges pour : <b>{actionLabel}</b>.
        </span>,
        { duration: 4000 }
      );
      addAuditLog(`Infraction de sécurité : Tentative de ${actionLabel}`, "SECURITY_ALERT");
    }
  };

  // --- New States for underground maintenance coordination ---
  
  // 1. Réunion Début de Poste Validation State
  const [preshiftSigned, setPreshiftSigned] = useState(() => {
    return localStorage.getItem("sg_preshift_signed") === "true";
  });
  const [preshiftSigner, setPreshiftSigner] = useState(() => {
    return localStorage.getItem("sg_preshift_signer") || "";
  });
  const [preshiftValidationNote, setPreshiftValidationNote] = useState(() => {
    return localStorage.getItem("sg_preshift_note") || "Ordre du jour validé par la hiérarchie. Consignes de sécurité appliquées sur la ligne haute-tension.";
  });

  // Action to sign the pre-shift meeting
  const handleSignPreshift = () => {
    setPreshiftSigned(true);
    setPreshiftSigner(activeRole);
    localStorage.setItem("sg_preshift_signed", "true");
    localStorage.setItem("sg_preshift_signer", activeRole);
    toast.success(`📝 Réunion de début de poste signée électroniquement par ${activeRole} !`);
  };

  const handleResetPreshift = () => {
    setPreshiftSigned(false);
    setPreshiftSigner("");
    localStorage.setItem("sg_preshift_signed", "false");
    localStorage.setItem("sg_preshift_signer", "");
    toast.info("Signature de coordination réinitialisée.");
  };

  // 2. Travaux Reportés (Deferred Works) state
  const [deferredTasks, setDeferredTasks] = useState(() => {
    const saved = localStorage.getItem("sg_deferred_tasks");
    if (saved) return JSON.parse(saved);
    return [
      { id: "def-1", task: "Changement joints d'étanchéité vérin d'inclinaison DUMP-04", originDate: "2026-05-18", status: "Reporté", comment: "Attente de chargement d'huile" },
      { id: "def-2", task: "Remplacement flexible lubrication bras avant JUMB-03", originDate: "2026-05-19", status: "Reporté", comment: "Saturé de pièces" },
      { id: "def-3", task: "Soudure de renfort bas de caisse benne ST7-02", originDate: "2026-05-15", status: "En attente", comment: "Priorité donnée au pont arrière" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("sg_deferred_tasks", JSON.stringify(deferredTasks));
  }, [deferredTasks]);

  // 3. Calendrier Maintenance Réel state
  const [pmSchedules, setPmSchedules] = useState(() => {
    const saved = localStorage.getItem("sg_pm_schedules");
    if (saved) return JSON.parse(saved);
    return [
      { id: "pm-1", machineCode: "ST7-01", type: "PM 250h", dueHours: 4900, currentHours: 4850, interval: 250, status: "PLANIFIÉ", dateLimit: "2026-05-22", typeLabel: "Vidange moteur + Filtres" },
      { id: "pm-2", machineCode: "ST7-02", type: "PM 500h", dueHours: 9000, currentHours: 8940, interval: 500, status: "ALERTE", dateLimit: "2026-05-21", typeLabel: "Vidange hydraulique + Analyse" },
      { id: "pm-3", machineCode: "JUMB-03", type: "PM 250h", dueHours: 3250, currentHours: 3120, interval: 250, status: "PLANIFIÉ", dateLimit: "2026-05-25", typeLabel: "Remplacement joints rotatifs hydrauliques" },
      { id: "pm-4", machineCode: "DUMP-04", type: "PM 1000h", dueHours: 12200, currentHours: 12150, interval: 1000, status: "ALERTE", dateLimit: "2026-05-20", typeLabel: "Inspection structurelle ultrasons & LOTO" },
      { id: "pm-5", machineCode: "LOC-05", type: "PM 500h", dueHours: 6500, currentHours: 6540, interval: 500, status: "DÉPASSÉ", dateLimit: "2026-05-19", typeLabel: "Réfection complète pack batteries" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("sg_pm_schedules", JSON.stringify(pmSchedules));
  }, [pmSchedules]);

  // 4. Workshop Capacity allocation state
  const [workshopBays, setWorkshopBays] = useState(() => {
    const saved = localStorage.getItem("sg_workshop_bays");
    if (saved) return JSON.parse(saved);
    return [
      { id: "bay-1", name: "Baie Lourde A (Niveau -250m)", occupiedCode: "ST7-02", status: "OCCUPÉ", currentOp: "Remplacement cardan arrière", startHour: "2026-05-19 14:30" },
      { id: "bay-2", name: "Baie Forage B (Niveau -250m)", occupiedCode: "JUMB-03", status: "OCCUPÉ", currentOp: "Calibrage percussion hydraulique", startHour: "2026-05-20 11:20" },
      { id: "bay-3", name: "Baie Électrique & Voies", occupiedCode: "LOC-05", status: "OCCUPÉ", currentOp: "Alerte de surintensité freins", startHour: "2026-05-20 04:00" },
      { id: "bay-4", name: "Baie Légère & Pneumatique", occupiedCode: null, status: "LIBRE", currentOp: "Rien en cours", startHour: "" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("sg_workshop_bays", JSON.stringify(workshopBays));
  }, [workshopBays]);

  // 5. Labor suivi state
  const [mechanicsList, setMechanicsList] = useState(() => {
    const saved = localStorage.getItem("sg_mechanics_list");
    if (saved) return JSON.parse(saved);
    return [
      { id: "mech-1", name: "Y. Benjelloun", specialty: "HYDRAULIQUE", hoursLogged: 8, rating: 95, status: "ACTIF", currentAssignment: "Inspections routinières" },
      { id: "mech-2", name: "M. El Idrissi", specialty: "TRANSMISSION", hoursLogged: 7.5, rating: 92, status: "ACTIF", currentAssignment: "ST7-02 (Cardan)" },
      { id: "mech-3", name: "Shafik Belkacem", specialty: "ÉLECTRIQUE / MOTEUR", hoursLogged: 6, rating: 88, status: "ACTIF", currentAssignment: "JUMB-03 (Calibrage)" },
      { id: "mech-4", name: "Karim Amri", specialty: "SOUDURE / CHÂSSIS", hoursLogged: 9, rating: 91, status: "ACTIF", currentAssignment: "Blindage godet ST" },
      { id: "mech-5", name: "Othman Fassi", specialty: "ÉLECTROMÉCANIQUE", hoursLogged: 4, rating: 85, status: "ASTREINTE", currentAssignment: "Veille en Niveau -320m" }
    ];
  });

  useEffect(() => {
    localStorage.setItem("sg_mechanics_list", JSON.stringify(mechanicsList));
  }, [mechanicsList]);

  // DB States
  const [machines, setMachines] = useState<MiniMachine[]>(() => {
    const saved = localStorage.getItem("sg_mini_machines");
    if (saved) return JSON.parse(saved);
    return [
      {
        code: "ST7-01",
        type: "Scooptram",
        model: "Sandvik LH410 Souterrain",
        status: "DISPONIBLE",
        hours: 4850,
        currentWorksite: "Galerie Nord - Niveau -320m",
        siteId: "SMI",
        downtimes: [
          {
            id: "d1",
            startHour: "2026-05-18 06:15",
            endHour: "2026-05-18 09:30",
            durationMinutes: 195,
            reason: "Durite raccord HP desserrée",
            category: "HYDRAULIQUE",
            severity: "majeur",
            isAwaitingParts: false,
            isAwaitingMechanic: true,
            isAwaitingProduction: false,
            assignedMechanic: "Y. Benjelloun",
            remedyAction: "Resserrement avec couple de contrôle 130Nm"
          }
        ]
      },
      {
        code: "ST7-02",
        type: "Scooptram",
        model: "Caterpillar R1300G",
        status: "EN ATTENTE PIÈCES",
        hours: 8940,
        currentWorksite: "Atelier Central - Base",
        activeDowntimeId: "d2",
        siteId: "SMI",
        downtimes: [
          {
            id: "d2",
            startHour: "2026-05-19 14:30",
            reason: "Rupture de cardan de transmission arrière",
            category: "TRANSMISSION",
            severity: "critique",
            isAwaitingParts: true,
            isAwaitingMechanic: false,
            isAwaitingProduction: false,
            assignedMechanic: "M. El Idrissi"
          }
        ]
      },
      {
        code: "JUMB-03",
        type: "Foreuse Jumbo",
        model: "Epiroc Boomer T1D",
        status: "EN MAINTENANCE",
        hours: 3120,
        currentWorksite: "Front d'Abattage Bloc 4",
        activeDowntimeId: "d3",
        siteId: "OUMEJRANE",
        downtimes: [
          {
            id: "d3",
            startHour: "2026-05-20 11:20",
            reason: "Étalonnage capteurs percussion couronne",
            category: "MOTEUR",
            severity: "majeur",
            isAwaitingParts: false,
            isAwaitingMechanic: true,
            isAwaitingProduction: false,
            assignedMechanic: "Shafik Belkacem"
          }
        ]
      },
      {
        code: "DUMP-04",
        type: "Dumper Souterrain",
        model: "Sandvik TH320 Chargeur",
        status: "RESTREINTE",
        hours: 12150,
        currentWorksite: "Rampe descendante - Niveau -250m",
        siteId: "KOUDIA",
        downtimes: [
          {
            id: "d4",
            startHour: "2026-05-19 08:30",
            endHour: "2026-05-19 12:00",
            durationMinutes: 210,
            reason: "Surchauffe d'échappement intermittente",
            category: "MOTEUR",
            severity: "mineur",
            isAwaitingParts: false,
            isAwaitingMechanic: false,
            isAwaitingProduction: false,
            assignedMechanic: "Yassine Benjelloun",
            remedyAction: "Filtre DPM nettoyé, marche bridée de sécurité"
          }
        ]
      },
      {
        code: "LOC-05",
        type: "Locomotive",
        model: "Locomotive d'évacuation 12T",
        status: "EN PANNE",
        hours: 6540,
        currentWorksite: "Galerie Est Voie 2",
        activeDowntimeId: "d5",
        siteId: "BOU-AZZER",
        downtimes: [
          {
            id: "d5",
            startHour: "2026-05-20 04:00",
            reason: "Alerte de surintensité freins électriques d'essieu",
            category: "FREINAGE",
            severity: "critique",
            isAwaitingParts: false,
            isAwaitingMechanic: true,
            isAwaitingProduction: true,
            assignedMechanic: "M. El Idrissi"
          }
        ]
      }
    ];
  });

  const [workOrders, setWorkOrders] = useState<WorkOrderBT[]>(() => {
    const saved = localStorage.getItem("sg_work_orders");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "BT-2026-001",
        machineCode: "ST7-02",
        title: "Remplacement du coupleur et axe cannelé cardan arrière",
        category: "TRANSMISSION",
        severity: "critique",
        status: "EN_COURS",
        assignedTech: "M. El Idrissi",
        creationDate: "2026-05-19",
        siteId: "SMI",
        checklist: [
          { task: "Vérifier consignation LOTO transmission principale", done: true },
          { task: "Attente de la pièce du magasin central de surface", done: false },
          { task: "Repose du cardan d'arbre arrière & essais dynamiques", done: false }
        ],
        actionsHistory: [
          { timestamp: "2026-05-19 14:35", role: "OPÉRATEUR", action: "Déclaration initiale du défaut", user: "Z. Alami" },
          { timestamp: "2026-05-19 15:00", role: "CHEF ATELIER", action: "Assignation du technicien", user: "Y. Ouzrirou" }
        ],
        replacedParts: [
          { name: "Axe cannelé LH410 CAT", qty: 1, costUSD: 1850 }
        ]
      },
      {
        id: "BT-2026-002",
        machineCode: "LOC-05",
        title: "Changement bobine de déclenchement du rhéostat",
        category: "FREINAGE",
        severity: "critique",
        status: "OUVERT",
        assignedTech: "M. El Idrissi",
        creationDate: "2026-05-20",
        siteId: "BOU-AZZER",
        checklist: [
          { task: "Mesure de résistance résiduelle bobine", done: false },
          { task: "Remplacement sous tension coupée de sécurité", done: false }
        ],
        actionsHistory: [
          { timestamp: "2026-05-20 04:10", role: "MÉCANICIEN", action: "Création ordonnée de maintenance", user: "M. El Idrissi" }
        ],
        replacedParts: []
      }
    ];
  });

  const [handoverReports, setHandoverReports] = useState<HandoverReport[]>(() => {
    const saved = localStorage.getItem("sg_handover_reports");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "SHIFT-2026-001",
        date: "2026-05-20",
        shift: "JOUR",
        safetyIncidents: 0,
        criticalRisks: "Risque de surchauffe sur la ligne haute-tension niveau -250m. Ventilation forcée active.",
        awaitedParts: "Axe cannelé LH410 attendu de Ouarzazate à 18:00.",
        supervisorComments: "Atelier bien rangé. Assurer la re-passation des consignes électriques de la foreuse JUMB-03.",
        signedRoles: ["CHEF ATELIER", "OPÉRATEUR"],
        siteId: "SMI"
      }
    ];
  });

  // Save states automatically inside local storage
  useEffect(() => {
    localStorage.setItem("sg_mini_machines", JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem("sg_work_orders", JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem("sg_handover_reports", JSON.stringify(handoverReports));
  }, [handoverReports]);

  // Handle active machine selection for detail pane
  const [selectedMachineCode, setSelectedMachineCode] = useState<string>("ST7-01");
  const selectedMachine = machines.find(m => m.code === selectedMachineCode) || machines[0];

  // --- Connecteurs & Synchronisation Hydromines App Connect ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("15:30:20");
  const [hubSubTab, setHubSubTab] = useState<"maintenance" | "carburant" | "magasin" | "securite" | "timeline">("maintenance");

  const handleManualSync = () => {
    setIsSyncing(true);
    toast.promise(
      new Promise<void>((resolve) => setTimeout(resolve, 800)),
      {
        loading: "Synchronisation des bases Hydromines en cours (Carburant, Magasin, Sécurité)...",
        success: () => {
          setIsSyncing(false);
          const now = new Date();
          const timeStr = now.toTimeString().split(' ')[0];
          setLastSyncTime(timeStr);
          return "Base de données GMAO synchronisée avec succès ! ✅";
        },
        error: "Erreur lors de la synchronisation de l'API."
      }
    );
  };

  const hydrominesAppsData: Record<string, {
    carburant: {
      consommationTotale: string;
      tendance: "HAUSSE" | "STABLE" | "BAISSE";
      tendanceLabel: string;
      surconsommation: boolean;
      surconsommationReason?: string;
      consommationHuileAnormale: boolean;
      consommationHuileDetails?: string;
      derniersRavitaillements: Array<{ date: string; qty: string; location: string }>;
    };
    magasin: {
      piecesDisponibles: Array<{ name: string; qty: number; isAvailable: boolean; shelf: string }>;
      stockCritique: boolean;
      stockCritiqueDetails?: string;
      delaiApprovisionnement: string;
      historiqueSortiesBT: Array<{ date: string; qty: string; bt: string }>;
    };
    securite: {
      incidents: Array<{ date: string; desc: string }>;
      restrictions: string;
      statutLOTO: "ACTIF" | "INACTIF";
      lotoDetails?: string;
      anomaliesHseOuvertes: Array<{ id: string; desc: string }>;
    };
  }> = {
    "ST7-01": {
      carburant: {
        consommationTotale: "12,450 Litres",
        tendance: "STABLE",
        tendanceLabel: "Tendance de consommation ultra stable (-0.4% ce mois)",
        surconsommation: false,
        consommationHuileAnormale: false,
        derniersRavitaillements: [
          { date: "2026-05-20 04:15", qty: "320 L", location: "Citerne Mobile Puits-5" },
          { date: "2026-05-19 12:45", qty: "290 L", location: "Citerne Mobile Puits-5" },
          { date: "2026-05-18 18:30", qty: "310 L", location: "Station Carburant -250m" }
        ]
      },
      magasin: {
        piecesDisponibles: [
          { name: "Filtre Transmission Sandvik", qty: 4, isAvailable: true, shelf: "Rayon B, Casier 12" },
          { name: "Flexible hydraulique HP 3/4", qty: 2, isAvailable: true, shelf: "Rayon C, Casier 05" }
        ],
        stockCritique: false,
        delaiApprovisionnement: "Disponible immédiat au comptoir central",
        historiqueSortiesBT: [
          { date: "2026-05-18", qty: "1 Durite HP, 1 Joint torique", bt: "BT-9041" }
        ]
      },
      securite: {
        incidents: [],
        restrictions: "Aucune restriction de conduite ou de zone active",
        statutLOTO: "INACTIF",
        anomaliesHseOuvertes: []
      }
    },
    "ST7-02": {
      carburant: {
        consommationTotale: "18,920 Litres",
        tendance: "HAUSSE",
        tendanceLabel: "Hausse critique de consommation (+12% vs semaine dernière)",
        surconsommation: true,
        surconsommationReason: "Surchauffe convertisseur & filtre d'échappement calaminé ou encrassé",
        consommationHuileAnormale: true,
        consommationHuileDetails: "ALERTE : Fuite carter suspectée, baisse drastique de lubrifiant (approx. -2.5L / 24h)",
        derniersRavitaillements: [
          { date: "2026-05-20 02:00", qty: "450 L", location: "Atelier Central Base" },
          { date: "2026-05-18 10:30", qty: "410 L", location: "Citerne Mobile Puits-5" }
        ]
      },
      magasin: {
        piecesDisponibles: [
          { name: "Cardan Transmission Caterpillar R1300G-Rear", qty: 0, isAvailable: false, shelf: "Rupture totale (Transit Douane Oujda)" },
          { name: "Kit de Joints de Pont", qty: 1, isAvailable: true, shelf: "Rayon B, Casier 42" }
        ],
        stockCritique: true,
        stockCritiqueDetails: "Cardan de transmission arrière R1300G requis immédiatement. Zéro disponible au dépôt principal.",
        delaiApprovisionnement: "24h à 48h (Commande prioritaire transit douanier Nord)",
        historiqueSortiesBT: [
          { date: "2026-05-12", qty: "1 Bidon Huile 15W40 20L", bt: "BT-8419" }
        ]
      },
      securite: {
        incidents: [
          { date: "2026-05-05", desc: "Émissions de fumée importante en galerie montante (Niveau -320m)" }
        ],
        restrictions: "Usage interdit dans le puits Nord d'extraction sans ventilation auxiliaire active",
        statutLOTO: "ACTIF",
        lotoDetails: "🔒 CADENASSÉ par Chef de Poste - Cadenas d'Atelier Rouge #LOTO-8812 (Cardan cassé)",
        anomaliesHseOuvertes: [
          { id: "HSE-9081", desc: "Fuite d'huile sous le carter, pollution mineure du radier de galerie" }
        ]
      }
    },
    "JUMB-03": {
      carburant: {
        consommationTotale: "9,150 Litres",
        tendance: "STABLE",
        tendanceLabel: "Tendance stable (+0.8%)",
        surconsommation: false,
        consommationHuileAnormale: false,
        derniersRavitaillements: [
          { date: "2026-05-19 08:30", qty: "110 L", location: "Baie Forage B (Niveau -250m)" }
        ]
      },
      magasin: {
        piecesDisponibles: [
          { name: "Couronne de forage 45mm T1D", qty: 12, isAvailable: true, shelf: "Rayon H, Casier 01" },
          { name: "Joint d'accouplement rotatif Epiroc", qty: 3, isAvailable: true, shelf: "Rayon D, Casier 08" }
        ],
        stockCritique: false,
        delaiApprovisionnement: "Disponible au comptoir",
        historiqueSortiesBT: [
          { date: "2026-05-15", qty: "6 Couronnes de rotation", bt: "BT-8991" }
        ]
      },
      securite: {
        incidents: [],
        restrictions: "Protecteurs auditifs doubles (bouchon + casque d'arceau) obligatoires en forage",
        statutLOTO: "INACTIF",
        anomaliesHseOuvertes: []
      }
    },
    "DUMP-04": {
      carburant: {
        consommationTotale: "24,800 Litres",
        tendance: "STABLE",
        tendanceLabel: "Légère hausse (+1.2% dû aux charges de rampe)",
        surconsommation: false,
        consommationHuileAnormale: false,
        derniersRavitaillements: [
          { date: "2026-05-20 03:00", qty: "600 L", location: "Station Carburant -250m" }
        ]
      },
      magasin: {
        piecesDisponibles: [
          { name: "Disque de frein de service MT436B", qty: 2, isAvailable: true, shelf: "Rayon G, Casier 11" }
        ],
        stockCritique: false,
        delaiApprovisionnement: "Disponible immédiat",
        historiqueSortiesBT: [
          { date: "2026-05-14", qty: "1 Valve de frein hydraulique", bt: "BT-8874" }
        ]
      },
      securite: {
        incidents: [
          { date: "2026-04-20", desc: "Dérapage mineur du train arrière lors d'une décélération sur rampe -250" }
        ],
        restrictions: "Vitesse maximale fixée à 15 km/h en rampe descendante chargée",
        statutLOTO: "INACTIF",
        anomaliesHseOuvertes: [
          { id: "HSE-8912", desc: "Surchappe antidérapante usée sur l'échelle d'accès cabine" }
        ]
      }
    },
    "LOC-05": {
      carburant: {
        consommationTotale: "0 Litres (Propulsion Électrique)",
        tendance: "BAISSE",
        tendanceLabel: "Consommation fossile nulle (Régénération au freinage actif)",
        surconsommation: false,
        consommationHuileAnormale: false,
        derniersRavitaillements: []
      },
      magasin: {
        piecesDisponibles: [
          { name: "Fusible de puissance 150A", qty: 4, isAvailable: true, shelf: "Rayon E, Casier 10" }
        ],
        stockCritique: false,
        delaiApprovisionnement: "Disponible immédiat au comptoir électricité",
        historiqueSortiesBT: []
      },
      securite: {
        incidents: [],
        restrictions: "Interdiction de dépasser 10 km/h aux bifurcations d'aiguillages",
        statutLOTO: "ACTIF",
        lotoDetails: "🔐 CADENASSÉ par Consigne Électrique d'Arrivée #LOTO-9010 (Chargeurs batteries)",
        anomaliesHseOuvertes: []
      }
    }
  };

  const defaultMachineAppData = {
    carburant: {
      consommationTotale: "2,500 L",
      tendance: "STABLE" as const,
      tendanceLabel: "Tendance de consommation normale",
      surconsommation: false,
      surconsommationReason: "",
      consommationHuileAnormale: false,
      consommationHuileDetails: "",
      derniersRavitaillements: [] as any[]
    },
    magasin: {
      piecesDisponibles: [] as any[],
      stockCritique: false,
      stockCritiqueDetails: "",
      delaiApprovisionnement: "Retrait sous 2 heures",
      historiqueSortiesBT: [] as any[]
    },
    securite: {
      incidents: [] as any[],
      restrictions: "Règles standard de circulation d'usine et de galeries souterraines",
      statutLOTO: "INACTIF" as const,
      anomaliesHseOuvertes: [] as any[]
    }
  };

  const currentMachineAppData = hydrominesAppsData[selectedMachine.code] || defaultMachineAppData;

  // Dynamic Stop Form State
  const [stopReason, setStopReason] = useState("");
  const [stopCategory, setStopCategory] = useState<MachineDowntime["category"]>("HYDRAULIQUE");
  const [stopSeverity, setStopSeverity] = useState<MachineDowntime["severity"]>("majeur");
  const [stopParts, setStopParts] = useState(false);
  const [stopMech, setStopMech] = useState(true);
  const [stopProd, setStopProd] = useState(false);
  const [stopStatusStr, setStopStatusStr] = useState<MiniMachine["status"]>("EN PANNE");
  const [stopAssignedMech, setStopAssignedMech] = useState("M. El Idrissi");

  // Dynamic Return Form State
  const [remedyActionStr, setRemedyActionStr] = useState("");
  const [remedyPartName, setRemedyPartName] = useState("");
  const [remedyPartQty, setRemedyPartQty] = useState(1);
  const [remedyPartCost, setRemedyPartCost] = useState(0);

  // New BT Form State
  const [newBtMachine, setNewBtMachine] = useState("ST7-01");
  const [newBtTitle, setNewBtTitle] = useState("");
  const [newBtCategory, setNewBtCategory] = useState("HYDRAULIQUE");
  const [newBtSeverity, setNewBtSeverity] = useState<"critique" | "majeur" | "mineur">("majeur");
  const [newBtTech, setNewBtTech] = useState("Y. Benjelloun");

  // --- BLOC 5 DAILY OPERATIONS OPTIMIZATION STATES & DICTIONARIES ---
  
  // Custom Parts Consumption State on BT Cards
  const [selectedBtIdForPart, setSelectedBtIdForPart] = useState<string>("");
  const [customPartName, setCustomPartName] = useState<string>("");
  const [customPartQty, setCustomPartQty] = useState<number>(1);
  const [customPartCost, setCustomPartCost] = useState<number>(150);

  // Timeline Filters inside Machine View
  const [timelineFilter, setTimelineFilter] = useState<string>("TOUS");
  const [timelineSortAsc, setTimelineSortAsc] = useState<boolean>(false);

  // Manual priorities reordering list state
  const [machinePriorityCodes, setMachinePriorityCodes] = useState<string[]>(() => {
    return ["ST7-01", "ST7-02", "JUMB-03", "LH04", "LOC-02"];
  });

  // Outgoing / Incoming Shift Handover Observations and Flags
  const [handoverObsArray, setHandoverObsArray] = useState<Array<{ id: string; text: string; user: string; isUrgent: boolean }>>([
    { id: "obs-1", text: "Ventilation forcée requise au fond niveau -320m de façon continue.", user: "Y. Ouzrirou", isUrgent: true },
    { id: "obs-2", text: "Tuyau de refoulement d'eau à inspecter d'ici la fin du shift de nuit.", user: "S. Belkacem", isUrgent: false }
  ]);
  const [newHandoverObsText, setNewHandoverObsText] = useState("");
  const [newHandoverObsUrgent, setNewHandoverObsUrgent] = useState(false);

  // Common suggestion parameters dictionary for SMART BT assistance (Deterministic lookup)
  const BT_SUGGESTIONS_DICT: Record<string, { titles: string[]; parts: string[]; estHours: number }> = {
    HYDRAULIQUE: {
      titles: [
        "Remplacement flexible HP de direction - Sandvik ST7",
        "Refaire joint torique d'étanchéité réservoir central",
        "Changement clapet antiretour pompe Rexroth",
        "Remplacement distributeur hydraulique auxiliaire"
      ],
      parts: ["Flexible SAE100 R15", "Joint Viton 45mm", "Filtre hydraulique Donaldson", "Clapet taré 210 Bar"],
      estHours: 2.5
    },
    MOTEUR: {
      titles: [
        "Purges et remplacement filtres à carburant d'urgence",
        "Changement durite silicone haute température radiateur",
        "Réfection et calage injecteur cylindre 3",
        "Remplacement courroie alternateur Caterpillar"
      ],
      parts: ["Filtres GO CAT primary", "Durite renforcée silicone", "Injecteur reconditionné CAT", "Courroie trapezoidale Gates"],
      estHours: 3.5
    },
    TRANSMISSION: {
      titles: [
        "Installation arbre cannelé de cardan pont arrière",
        "Vidange complète et purge huile boîte de vitesse",
        "Ajustement couple de serrage pignon d'attaque",
        "Réalignement arbres transmission boîtier transfert"
      ],
      parts: ["Cardan complet Spicer ST7", "Huile ATF-33 Mobil 20L", "Axe de transmission cannelé", "Palier intermédiaire d'arbre"],
      estHours: 5.0
    },
    ÉLECTRIQUE: {
      titles: [
        "Réparation faisceau de câblage phare LED avant gauche",
        "Changement capteur de proximité inductif d'articulation",
        "Remplacement alternateur de rechange Delco Remy 24V",
        "Inspection du commutateur isolateur coupe-circuit LOTO"
      ],
      parts: ["Phare LED antichoc 50W", "Capteur inductif Telemecanique", "Alternateur Delco 24V", "Cosse batterie laiton"],
      estHours: 1.5
    },
    FREINAGE: {
      titles: [
        "Remplacement kit disques de friction humides Posi-Stop",
        "Remplacement cartouche dessiccateur d'air comprimé",
        "Purge et étanchéité raccord étrier de frein parc",
        "Remplacement cloche d'accumulateur azote de frein"
      ],
      parts: ["Kit disques friction Positop", "Cartouche dessiccatrice WABCO", "Joint étrier de frein", "Accumulateur pression Parker"],
      estHours: 4.0
    }
  };

  // New Handover Form State
  const [handoverShift, setHandoverShift] = useState<"JOUR" | "NUIT">("JOUR");
  const [handoverIncidents, setHandoverIncidents] = useState(0);
  const [handoverRisks, setHandoverRisks] = useState("");
  const [handoverParts, setHandoverParts] = useState("");
  const [handoverComments, setHandoverComments] = useState("");

  // --------------------------------------------------------------------------------
  // CORE FUNCTIONS
  // --------------------------------------------------------------------------------

  // Declare Maschine Stop (Action 1)
  const handleDeclareStop = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAndExecute("declare_stop", () => {
      if (!stopReason.trim()) {
        toast.error("Veuillez préciser la cause de l'arrêt.");
        return;
      }

      const downtimeId = "d-" + Date.now();
      const newDowntime: MachineDowntime = {
        id: downtimeId,
        startHour: new Date().toISOString().replace("T", " ").substring(0, 16),
        reason: stopReason,
        category: stopCategory,
        severity: stopSeverity,
        isAwaitingParts: stopParts,
        isAwaitingMechanic: stopMech,
        isAwaitingProduction: stopProd,
        assignedMechanic: stopAssignedMech
      };

      if (offlineMode) {
        queueOfflineAction("DECLARE_STOP", { machineCode: selectedMachineCode, stop: newDowntime }, `Déclaration arrêt ${selectedMachineCode} (${stopReason})`);
        setStopReason("");
        return;
      }

      setMachines(prev => prev.map(m => {
        if (m.code === selectedMachineCode) {
          return {
            ...m,
            status: stopStatusStr,
            activeDowntimeId: downtimeId,
            downtimes: [newDowntime, ...m.downtimes]
          };
        }
        return m;
      }));

      toast.success(`🛑 Arrêt consigné pour l'engin ${selectedMachineCode} (${stopStatusStr})`);
      addAuditLog(`Saisie arrêt machine ${selectedMachineCode} : ${stopReason}`, "PANNE");
      setStopReason("");
    }, "Déclarer un Arrêt");
  };

  // Remettre en service (Action 1 closure)
  const handleRemettreEnService = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAndExecute("remedy_stop", () => {
      if (!remedyActionStr.trim()) {
        toast.error("Veuillez renseigner l'action corrective effectuée.");
        return;
      }

      // Hardened Spare parts validation (Requirement 1)
      if (remedyPartName.trim()) {
        const valResult = MaintenanceValidator.validateStockQuantity(remedyPartQty);
        if (!valResult.isValid) {
          toast.error(`Erreur d'imputation pièces : ${valResult.message}`);
          return;
        }
      }

      const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

      if (offlineMode) {
        const remedyPayload = {
          endHour: nowStr,
          durationMinutes: 45,
          remedyAction: remedyActionStr
        };
        queueOfflineAction("REMETTRE_EN_SERVICE", { machineCode: selectedMachineCode, remedy: remedyPayload }, `Remise en service ${selectedMachineCode}`);
        setRemedyActionStr("");
        setRemedyPartName("");
        return;
      }

      let oldStatus = "EN PANNE";
      setMachines(prev => prev.map(m => {
        if (m.code === selectedMachineCode && m.activeDowntimeId) {
          oldStatus = m.status;
          return {
            ...m,
            status: "DISPONIBLE",
            activeDowntimeId: undefined,
            downtimes: m.downtimes.map(d => {
              if (d.id === m.activeDowntimeId) {
                const startDt = new Date(d.startHour.replace(" ", "T")).getTime();
                const endDt = Date.now();
                const minutes = isNaN(startDt) ? 60 : Math.round((endDt - startDt) / 60000);
                return {
                  ...d,
                  endHour: nowStr,
                  durationMinutes: minutes > 0 ? minutes : 45,
                  remedyAction: remedyActionStr
                };
              }
              return d;
            })
          };
        }
        return m;
      }));

      // If replacement parts used, append them optionally to the first active work order of this machine
      if (remedyPartName.trim()) {
        setWorkOrders(prev => prev.map(wo => {
          if (wo.machineCode === selectedMachineCode && wo.status !== "CLOS") {
            return {
              ...wo,
              replacedParts: [
                ...wo.replacedParts, 
                { name: remedyPartName, qty: remedyPartQty, costUSD: remedyPartCost }
              ]
            };
          }
          return wo;
        }));
      }

      toast.success(`✅ L'engin ${selectedMachineCode} est maintenant re-disponible en galerie !`);
      addAuditLog(`Remise en service engin ${selectedMachineCode} : ${remedyActionStr}`, "MAINTENANCE", selectedMachineCode, oldStatus, "DISPONIBLE");
      setRemedyActionStr("");
      setRemedyPartName("");
    }, "Remettre un engin en service");
  };

  // Create Work Order
  const handleCreateBT = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAndExecute("quick_bt", () => {
      // Hardened Data validation (Requirement 1)
      const valResult = MaintenanceValidator.validateWorkOrder(newBtTitle, newBtMachine, newBtCategory);
      if (!valResult.isValid) {
        toast.error(`Erreur de validation BT : ${valResult.message}`);
        return;
      }

      const machineExists = machines.some(m => m.code === newBtMachine);
      if (!machineExists) {
        toast.error(`Erreur de cohérence : L'engin "${newBtMachine}" n'existe pas dans le registre.`);
        return;
      }

      const newBTId = "BT-2026-0" + (workOrders.length + 101);
      const newBT: WorkOrderBT = {
        id: newBTId,
        machineCode: newBtMachine,
        title: newBtTitle,
        category: newBtCategory,
        severity: newBtSeverity,
        status: "OUVERT",
        assignedTech: newBtTech,
        creationDate: new Date().toISOString().substring(0, 10),
        siteId: currentUser.siteId || "SMI",
        checklist: [
          { task: "HSE pré-consignation & Dépressurisation LOTO", done: false },
          { task: "Exécution réparation mécanique", done: false },
          { task: "Nettoyage zone & Essais sous charge", done: false }
        ],
        actionsHistory: [
          {
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
            role: activeRole,
            action: "Émission initiale du BT",
            user: currentUser.name
          }
        ],
        replacedParts: []
      };

      if (offlineMode) {
        queueOfflineAction("CREATE_BT", newBT, `Création BT ${newBTId} (${newBtMachine})`);
        setNewBtTitle("");
        return;
      }

      setWorkOrders(prev => [newBT, ...prev]);
      setMachines(prev => prev.map(m => {
        if (m.code === newBtMachine) {
          return { ...m, status: "EN MAINTENANCE" as const };
        }
        return m;
      }));
      toast.success(`💼 Bon de travail ${newBT.id} créé pour ${newBtMachine}`);
      addAuditLog(`Création Bon de Travail ${newBT.id} pour ${newBtMachine}`, "WORK_ORDER", newBTId, undefined, "OUVERT");
      setNewBtTitle("");
    }, "Créer un Bon de travail");
  };

  // Apply Hierarchical validation Signature (Action 6)
  const handleSignBT = (btId: string) => {
    verifyAndExecute("update_bt", () => {
      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === btId) {
          const alreadySigned = wo.actionsHistory.some(h => h.role === activeRole);
          if (alreadySigned) {
            toast.warning(`Le visa de rôle "${activeRole}" a déjà été apposé sur ce bon !`);
            return wo;
          }

          const nextHistory = [
            ...wo.actionsHistory,
            {
              timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
              role: activeRole,
              action: `Visa Réglementaire Apposé`,
              user: currentUser.name
            }
          ];

          let nextStatus = wo.status;

          // Only RESPONSABLE_MAINTENANCE and ADMIN can CLOSE a work order.
          // Secrétaire and Mécanologue cannot close a BT.
          if (activeRole === "RESPONSABLE_MAINTENANCE" || activeRole === "ADMIN") {
            nextStatus = "CLOS";
            toast.success(`🎉 Le BT ${wo.id} a été CLOS et archivé par le Responsable Maintenance !`);

            // Closing a BT automatically closes the related active downtime.
            setMachines(prevMachines => prevMachines.map(m => {
              if (m.code === wo.machineCode) {
                return {
                  ...m,
                  status: "DISPONIBLE" as const,
                  activeDowntimeId: undefined,
                  downtimes: m.downtimes.map(d => {
                    if (d.id === m.activeDowntimeId || !d.endHour) {
                      return {
                        ...d,
                        endHour: new Date().toISOString().replace("T", " ").substring(0, 16),
                        durationMinutes: d.startHour ? Math.max(30, Math.round((Date.now() - new Date(d.startHour).getTime()) / (1000 * 60))) : 60,
                        isAwaitingParts: false,
                        isAwaitingMechanic: false,
                        isAwaitingProduction: false,
                        remedyAction: "Clôture finale validée par Responsable Maintenance"
                      };
                    }
                    return d;
                  })
                };
              }
              return m;
            }));
          } else {
            toast.success(`🖋️ Visa de rôle "${activeRole}" consigné dans le registre pour le BT ${wo.id}`);
          }

          addAuditLog(`Apposition Visa (${activeRole}) sur BT ${wo.id}. Statut = ${nextStatus}`, "VISA");

          return {
            ...wo,
            status: nextStatus,
            actionsHistory: nextHistory
          };
        }
        return wo;
      }));
    }, "Apposer un Visa sur BT");
  };

  const handleSyncOfflineQueue = () => {
    if (offlineQueue.length === 0) {
      toast.info("Aucune action hors-ligne en cours d'attente.");
      return;
    }

    setIsSyncing(true);
    toast.promise(
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Synchro serveur Hydromines - Relecture sécurisée de ${offlineQueue.length} fiches...`,
        success: () => {
          setIsSyncing(false);
          let updatedMachines = [...machines];
          let updatedWorkOrders = [...workOrders];
          let failedActions: typeof offlineQueue = [];
          
          // Deduplicate the queue beforehand to avoid double replay of duplicates (Idempotency)
          // AND sort chronologically by timestamp (replay ordering) to maintain causality
          const seenIds = new Set<string>();
          const sortedAndDeduplicated = offlineQueue
            .filter(item => {
              if (seenIds.has(item.id)) return false;
              seenIds.add(item.id);
              return true;
            })
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

          sortedAndDeduplicated.forEach(item => {
            try {
              if (item.actionType === "DECLARE_STOP") {
                const { machineCode, stop } = item.payload;
                const m = updatedMachines.find(x => x.code === machineCode);
                
                // Integrity checks
                if (!m) {
                  throw new Error(`MACHINE_NOT_FOUND: Machine ${machineCode} non trouvée.`);
                }
                if (m.status === "EN PANNE" && m.activeDowntimeId) {
                  // Contradictory state: Machine is already declared offline
                  throw new Error(`CONTRADICTORY_STATE: Machine ${machineCode} est déjà en panne.`);
                }

                updatedMachines = updatedMachines.map(x => {
                  if (x.code === machineCode) {
                    return {
                      ...x,
                      status: "EN PANNE",
                      activeDowntimeId: stop.id,
                      downtimes: [stop, ...x.downtimes]
                    };
                  }
                  return x;
                });
              } else if (item.actionType === "REMETTRE_EN_SERVICE") {
                const { machineCode, remedy } = item.payload;
                const m = updatedMachines.find(x => x.code === machineCode);
                
                if (!m) {
                  throw new Error(`MACHINE_NOT_FOUND: Machine ${machineCode} non trouvée.`);
                }
                if (!m.activeDowntimeId) {
                  // Contradictory state: Trying to make active an inactive machine
                  throw new Error(`CONTRADICTORY_STATE: Machine ${machineCode} n'a aucun arrêt actif.`);
                }

                updatedMachines = updatedMachines.map(x => {
                  if (x.code === machineCode) {
                    return {
                      ...x,
                      status: "DISPONIBLE",
                      activeDowntimeId: undefined,
                      downtimes: x.downtimes.map(d => {
                        if (d.id === x.activeDowntimeId) {
                          return {
                            ...d,
                            endHour: remedy.endHour,
                            durationMinutes: remedy.durationMinutes,
                            remedyAction: remedy.remedyAction,
                            isAwaitingParts: false,
                            isAwaitingMechanic: false,
                            isAwaitingProduction: false
                          };
                        }
                        return d;
                      })
                    };
                  }
                  return x;
                });
              } else if (item.actionType === "CREATE_BT") {
                const newBT = item.payload;
                const exists = updatedWorkOrders.some(w => w.id === newBT.id);
                if (exists) {
                  // Idempotency: BT already replayed
                  return;
                }
                
                updatedWorkOrders = [newBT, ...updatedWorkOrders];
                
                // Automatically sync status
                updatedMachines = updatedMachines.map(m => {
                  if (m.code === newBT.machineCode) {
                    return { ...m, status: "EN MAINTENANCE" };
                  }
                  return m;
                });
              }
            } catch (err: any) {
              const errMsg = err.message || "SYNCHRONIZATION_ERROR";
              console.error(`Replay failed for offline action ${item.id}:`, errMsg);
              failedActions.push({
                ...item,
                retryCount: (item.retryCount || 0) + 1,
                errorStatus: errMsg
              });
            }
          });

          setMachines(updatedMachines);
          setWorkOrders(updatedWorkOrders);
          setOfflineQueue(failedActions);

          if (failedActions.length > 0) {
            toast.error(`⚠️ ${failedActions.length} anomalies détectées pendant la synchro (restées en file d'attente d'arbitrage).`);
            addAuditLog(`Synchro complétée avec ${failedActions.length} rejets`, "OFFLINE_SYNC_ERROR");
            return `Synchro partielle: ${sortedAndDeduplicated.length - failedActions.length} fiches synchronisées, ${failedActions.length} conflits retenus pour arbitrage.`;
          } else {
            addAuditLog(`Relecture et fusion de ${sortedAndDeduplicated.length} transactions hors-ligne`, "OFFLINE_SYNC");
            return `Synchro complète réussie ! ${sortedAndDeduplicated.length} fiches fusionnées sur le serveur central. ✅`;
          }
        },
        error: "Échec critique de fusion réseau."
      }
    );
  };

  const handleRetryOfflineAction = (actionId: string) => {
    const item = offlineQueue.find(x => x.id === actionId);
    if (!item) return;

    const retryPromise = new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          let updatedMachines = [...machines];
          let updatedWorkOrders = [...workOrders];

          if (item.actionType === "DECLARE_STOP") {
            const { machineCode, stop } = item.payload;
            const m = updatedMachines.find(x => x.code === machineCode);
            if (!m) throw new Error(`MACHINE_NOT_FOUND: Machine ${machineCode} non trouvée.`);
            if (m.status === "EN PANNE" && m.activeDowntimeId) {
              throw new Error(`CONTRADICTORY_STATE: Machine ${machineCode} est déjà déclarée en panne.`);
            }
            updatedMachines = updatedMachines.map(x => {
              if (x.code === machineCode) {
                return {
                  ...x,
                  status: "EN PANNE",
                  activeDowntimeId: stop.id,
                  downtimes: [stop, ...x.downtimes]
                };
              }
              return x;
            });
          } else if (item.actionType === "REMETTRE_EN_SERVICE") {
            const { machineCode, remedy } = item.payload;
            const m = updatedMachines.find(x => x.code === machineCode);
            if (!m) throw new Error(`MACHINE_NOT_FOUND: Machine ${machineCode} non trouvée.`);
            if (!m.activeDowntimeId) {
              throw new Error(`CONTRADICTORY_STATE: Machine ${machineCode} n'a aucun arrêt actif.`);
            }
            updatedMachines = updatedMachines.map(x => {
              if (x.code === machineCode) {
                return {
                  ...x,
                  status: "DISPONIBLE",
                  activeDowntimeId: undefined,
                  downtimes: x.downtimes.map(d => {
                    if (d.id === x.activeDowntimeId) {
                      return {
                        ...d,
                        endHour: remedy.endHour,
                        durationMinutes: remedy.durationMinutes,
                        remedyAction: remedy.remedyAction,
                        isAwaitingParts: false,
                        isAwaitingMechanic: false,
                        isAwaitingProduction: false
                      };
                    }
                    return d;
                  })
                };
              }
              return x;
            });
          } else if (item.actionType === "CREATE_BT") {
            const newBT = item.payload;
            if (updatedWorkOrders.some(w => w.id === newBT.id)) {
              resolve();
              return;
            }
            updatedWorkOrders = [newBT, ...updatedWorkOrders];
            updatedMachines = updatedMachines.map(m => {
              if (m.code === newBT.machineCode) {
                return { ...m, status: "EN MAINTENANCE" };
              }
              return m;
            });
          }

          setMachines(updatedMachines);
          setWorkOrders(updatedWorkOrders);
          setOfflineQueue(prev => prev.filter(x => x.id !== actionId));
          addAuditLog(`Arbitrage / REJEU manuel réussi pour ${actionId}: ${item.label}`, "OFFLINE_SYNC");
          resolve();
        } catch (e: any) {
          reject(e);
        }
      }, 800);
    });

    toast.promise(
      retryPromise,
      {
        loading: `Forçage de la fiche hors-ligne ${actionId}...`,
        success: `Action ${actionId} synchronisée avec succès !`,
        error: (err) => `Arbitrage refusé : ${err.message}`
      }
    );

    retryPromise.catch(err => {
      setOfflineQueue(prev => prev.map(x => {
        if (x.id === actionId) {
          return {
            ...x,
            retryCount: (x.retryCount || 0) + 1,
            errorStatus: err.message
          };
        }
        return x;
      }));
    });
  };

  const handleDiscardOfflineAction = (actionId: string) => {
    const item = offlineQueue.find(x => x.id === actionId);
    if (!item) return;

    setOfflineQueue(prev => prev.filter(x => x.id !== actionId));
    toast.info(`Fiche hors-ligne ${actionId} révoquée de la file d'attente.`);
    addAuditLog(`Saisie hors-ligne révoquée manuellement par l'opérateur (${item.id}) : ${item.label}`, "OFFLINE_SYNC_DISCARDED");
  };

  // Toggle checklist tasks
  const handleToggleTask = (btId: string, taskIndex: number) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === btId) {
        const nextChecklist = [...wo.checklist];
        nextChecklist[taskIndex] = {
          ...nextChecklist[taskIndex],
          done: !nextChecklist[taskIndex].done
        };
        const anyDone = nextChecklist.some(c => c.done);
        return {
          ...wo,
          checklist: nextChecklist,
          status: anyDone && wo.status === "OUVERT" ? "EN_COURS" : wo.status
        };
      }
      return wo;
    }));
  };

  // State for printing/exporting BT (Objective 8)
  const [printingBT, setPrintingBT] = useState<WorkOrderBT | null>(null);

  // Export to Excel-compatible CSV format (Objective 8)
  const handleExportCSV = () => {
    verifyAndExecute("export_data", () => {
      let csvContent = "\ufeffID;Code Engin;Titre;Categorie;Gravite;Statut;Technicien;Date Creation\n";
      
      workOrders.forEach(wo => {
        csvContent += `${wo.id};${wo.machineCode};"${wo.title.replace(/"/g, '""')}";${wo.category};${wo.severity};${wo.status};${wo.assignedTech};${wo.creationDate}\n`;
      });
      
      // Creating Blob to circumvent length limits of URLs
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `sou_gmao_bt_export_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("📊 Fichier excel de reporting des Bons de Travail généré avec succès !");
      addAuditLog("Exportation du registre complet des BT au format Excel CSV", "EXPORT");
    }, "Exporter des données Excel/CSV");
  };

  // Submit handover shift handover (Action 3)
  const handleCreateHandover = (e: React.FormEvent) => {
    e.preventDefault();

    const report: HandoverReport = {
      id: "SHIFT-2026-0" + (handoverReports.length + 1),
      date: new Date().toISOString().substring(0, 10),
      shift: handoverShift,
      safetyIncidents: Number(handoverIncidents),
      criticalRisks: handoverRisks || "Aucun risque structurel majeur rapporté.",
      awaitedParts: handoverParts || "Aucune pièce manquante en livraison forcée.",
      supervisorComments: handoverComments || "Opérations de taille standard.",
      signedRoles: [activeRole],
      siteId: currentUser.siteId || "SMI"
    };

    setHandoverReports(prev => [report, ...prev]);
    toast.success(`📝 Passation de poste consigne et signée par un visa "${activeRole}".`);
    setHandoverRisks("");
    setHandoverParts("");
    setHandoverComments("");
  };

  // Sign Handover Report
  const handleSignHandover = (reportId: string) => {
    setHandoverReports(prev => prev.map(h => {
      if (h.id === reportId) {
        if (h.signedRoles.includes(activeRole)) {
          toast.warning("Vous avez déjà visé cette passation de consigne !");
          return h;
        }
        toast.success(`🖋️ Passation visée pour le rôle "${activeRole}"`);
        return {
          ...h,
          signedRoles: [...h.signedRoles, activeRole]
        };
      }
      return h;
    }));
  };

  const handleDownloadHandoverJSON = (report: HandoverReport) => {
    verifyAndExecute("export_data", () => {
      const dataStr = JSON.stringify(report, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `sou_gmao_handover_${report.id}_${report.date}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success(`📥 Fiche de passation ${report.id} exportée en JSON avec succès !`);
      addAuditLog(`Exportation de la passation de shift ${report.id} sous format Brut JSON`, "EXPORT");
    }, "Exporter des passations JSON");
  };

  // Delete BT helper
  const handleDeleteBT = (btId: string) => {
    const isConfirmed = window.confirm(`⚠️ ATTENTION : Vous êtes sur le point de SUPPRIMER définitivement le Bon de Travail ${btId}. Vos données d'intervention seront perdues. Confirmer la suppression ?`);
    if (!isConfirmed) {
      toast.info("Suppression annulée.");
      return;
    }
    setWorkOrders(prev => prev.filter(wo => wo.id !== btId));
    toast.error(`Bon de Travail ${btId} supprimé avec succès. ✅`);
    addAuditLog(`BT Supprimé officiellement : ${btId}`, "OPERATION_DELETE");
  };

  // --- Training Scenario Controller (Objective 2 Scenarios) ---
  const handleNextScenarioStep = () => {
    if (scenarioStep === 0) {
      // Step 1: Declare Breakdown
      setMachines(prev => prev.map(m => {
        if (m.code === "ST7-01") {
          const newDowntime: MachineDowntime = {
            id: "d-scen-1",
            startHour: "2026-05-20 15:30",
            reason: "Fuite d'huile hydraulique majeure sur raccord servo-pompe",
            category: "HYDRAULIQUE",
            severity: "critique",
            isAwaitingParts: false,
            isAwaitingMechanic: true,
            isAwaitingProduction: false,
            assignedMechanic: "Mustapha El Idrissi"
          };
          return {
            ...m,
            status: "EN PANNE",
            activeDowntimeId: "d-scen-1",
            downtimes: [newDowntime, ...m.downtimes]
          };
        }
        return m;
      }));
      setScenarioStep(1);
      toast.success("💡 Étape 1 : Machine ST7-01 déclarée EN PANNE.", { duration: 4000 });
      addAuditLog("Scénario Pilote - Étape 1 : Arrêt machine ST7-01 (Hydraulique)", "SCENARIO");
    } else if (scenarioStep === 1) {
      // Step 2: Open Work Order (BT)
      const newWO: WorkOrderBT = {
        id: "BT-2026-SCEN",
        machineCode: "ST7-01",
        title: "Remplacement raccord hydraulique servo-pompe Sandvik ST7-01",
        category: "HYDRAULIQUE",
        severity: "critique",
        status: "OUVERT",
        assignedTech: "Mustapha El Idrissi",
        creationDate: "2026-05-20",
        siteId: "SMI",
        checklist: [
          { task: "Consigner l'énergie résiduelle & apposer cadenas LOTO", done: false },
          { task: "Démonter la durite endommagée", done: false },
          { task: "Vérifier la propreté du raccord neuf", done: false },
          { task: "Monter la pièce neuve au couple spécifié", done: false },
          { task: "Effectuer un essai dynamique sous pression", done: false }
        ],
        actionsHistory: [
          { timestamp: "2026-05-20 15:40", role: "CHEF ATELIER", action: "Création du Bon de Travail réglementaire", user: currentUser.name }
        ],
        replacedParts: [
          { name: "Raccord hydraulique haute-pression", qty: 1, costUSD: 145 }
        ]
      };
      setWorkOrders(prev => [newWO, ...prev]);
      setScenarioStep(2);
      toast.success("💡 Étape 2 : Bon de Travail BT-2026-SCEN émis avec succès.", { duration: 4000 });
      addAuditLog("Scénario Pilote - Étape 2 : Ouverture du Bon de Travail BT-2026-SCEN", "SCENARIO");
    } else if (scenarioStep === 2) {
      // Step 3: Assign mechanic and set to EN_COURS
      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === "BT-2026-SCEN") {
          return {
            ...wo,
            status: "EN_COURS",
            actionsHistory: [
              ...wo.actionsHistory,
              { timestamp: "2026-05-20 15:45", role: "MÉCANICIEN", action: "Prise en charge active de la réparation", user: "Mustapha El Idrissi" }
            ]
          };
        }
        return wo;
      }));
      setScenarioStep(3);
      toast.success("💡 Étape 3 : Mustapha El Idrissi prend en charge le BT.", { duration: 4000 });
      addAuditLog("Scénario Pilote - Étape 3 : Prise en charge par Mustapha El Idrissi", "SCENARIO");
    } else if (scenarioStep === 3) {
      // Step 4: Intervention, mark checklists done
      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === "BT-2026-SCEN") {
          return {
            ...wo,
            checklist: wo.checklist.map(c => ({ ...c, done: true })),
            status: "PIÈCES_ATTRIBUÉES",
            actionsHistory: [
              ...wo.actionsHistory,
              { timestamp: "2026-05-20 15:50", role: "MÉCANICIEN", action: "Serrage raccord fini, LOTO retiré", user: "Mustapha El Idrissi" }
            ]
          };
        }
        return wo;
      }));
      setScenarioStep(4);
      toast.success("💡 Étape 4 : Réparation finie et checklist LOTO signée.", { duration: 4000 });
      addAuditLog("Scénario Pilote - Étape 4 : Montage raccord et retrait cadenas LOTO", "SCENARIO");
    } else if (scenarioStep === 5 || scenarioStep === 4) {
      // Step 5: Double Signatures and validation
      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === "BT-2026-SCEN") {
          return {
            ...wo,
            status: "RÉSOLU",
            actionsHistory: [
              ...wo.actionsHistory,
              { timestamp: "2026-05-20 15:52", role: "OPÉRATEUR", action: "Visa opérateur : machine conforme après essai en galerie", user: "Kamal Alami" },
              { timestamp: "2026-05-20 15:55", role: "CHEF ATELIER", action: "Visa final d'approbation d'atelier", user: "Youssef Ouzrirou" }
            ]
          };
        }
        return wo;
      }));
      setScenarioStep(5);
      toast.success("💡 Étape 5 : Visas réglementaires de sécurité signés.", { duration: 4000 });
      addAuditLog("Scénario Pilote - Étape 5 : Double authentification de l'essai de pression", "SCENARIO");
    } else if (scenarioStep === 5 || scenarioStep === 6) {
      // Step 6: Close work order, restablish DISPONIBLE
      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === "BT-2026-SCEN") {
          return { ...wo, status: "CLOS" };
        }
        return wo;
      }));
      setMachines(prev => prev.map(m => {
        if (m.code === "ST7-01") {
          return {
            ...m,
            status: "DISPONIBLE",
            activeDowntimeId: undefined,
            downtimes: m.downtimes.map(d => {
              if (d.id === "d-scen-1") {
                return {
                  ...d,
                  endHour: "2026-05-20 15:56",
                  durationMinutes: 26,
                  remedyAction: "Remplacement raccord servo-pompe Sandvik ST7-01 et test hydraulique"
                };
              }
              return d;
            })
          };
        }
        return m;
      }));
      setScenarioStep(6);
      toast.success("💡 Étape 6 : BT CLOS. Machine ST7-01 repassée DISPONIBLE !", { duration: 5000 });
      addAuditLog("Scénario Pilote - Étape 6 : Archivage du BT et remise officielle en service", "SCENARIO");
    }
  };

  const handleResetScenario = () => {
    setScenarioStep(0);
    setWorkOrders(prev => prev.filter(wo => wo.id !== "BT-2026-SCEN"));
    setMachines(prev => prev.map(m => {
      if (m.code === "ST7-01") {
        return {
          ...m,
          status: "DISPONIBLE",
          activeDowntimeId: undefined,
          downtimes: m.downtimes.filter(d => d.id !== "d-scen-1")
        };
      }
      return m;
    }));
    toast.info("Scénario de formation réinitialisé à zéro.");
    addAuditLog("Réinitialisation du simulateur de scénario pilote", "SYSTEM");
  };

  // --------------------------------------------------------------------------------
  // MULTI-SITE DATA ISOLATION & FILTER STREAMS
  // --------------------------------------------------------------------------------
  const siteMachines = useMemo(() => {
    return machines.filter(m => selectedSiteFilter === "TOUS" || m.siteId === selectedSiteFilter);
  }, [machines, selectedSiteFilter]);

  const siteWorkOrders = useMemo(() => {
    return workOrders.filter(wo => selectedSiteFilter === "TOUS" || wo.siteId === selectedSiteFilter);
  }, [workOrders, selectedSiteFilter]);

  const siteHandoverReports = useMemo(() => {
    return handoverReports.filter(h => selectedSiteFilter === "TOUS" || h.siteId === selectedSiteFilter);
  }, [handoverReports, selectedSiteFilter]);

  // --------------------------------------------------------------------------------
  // REPETITIVE FAILURES & COMPOSANT FAIBLE ANALYZER (Action 5 "IA Récidivante Souterraine")
  // --------------------------------------------------------------------------------
  interface RecurrenceAnalysis {
    machineCode: string;
    category: string;
    totalDowntimes: number;
    lastDate: string;
    score: number;
    recommendedAction: string;
  }

  const computeRecurrentFailures = (): RecurrenceAnalysis[] => {
    const analysisMap: { [key: string]: { count: number; dates: string[]; examples: string[] } } = {};

    siteMachines.forEach(m => {
      m.downtimes.forEach(dt => {
        const key = `${m.code}::${dt.category}`;
        if (!analysisMap[key]) {
          analysisMap[key] = { count: 0, dates: [], examples: [] };
        }
        analysisMap[key].count += 1;
        analysisMap[key].dates.push(dt.startHour);
        analysisMap[key].examples.push(dt.reason);
      });
    });

    // Translate to actionable recommendations
    const results: RecurrenceAnalysis[] = [];
    Object.keys(analysisMap).forEach(key => {
      const [mCode, category] = key.split("::");
      const data = analysisMap[key];
      
      // We flag as high concern if failure > 1 or default template
      if (data.count >= 1) {
        let recommendation = "";
        let score = data.count * 30; // Severity multiplier

        if (category === "HYDRAULIQUE") {
          recommendation = "Réaliser immédiatement une inspection par spectrométrie laser de l'huile hydraulique pour dépister une usure abrasive de pignons.";
        } else if (category === "TRANSMISSION") {
          recommendation = "Remplacement préventif de l'épingle d'accouplement arrière par un alliage haute résistance. Contrôler le parallélisme châssis lors du retrait.";
        } else if (category === "MOTEUR") {
          recommendation = "Vérifier l'étanchéité du collecteur sec d'admission d'air et remplacer l'ensemble des filtres DPM primaires s'ils sont colmatés de boue.";
        } else if (category === "FREINAGE") {
          recommendation = "Purge intégrale du circuit de pilotage servo-transmission, vérification de la précharge en azote de l'accu Posi-Stop.";
        } else {
          recommendation = "Inspection préventive approfondie requise au prochain arrêt programmatique.";
        }

        results.push({
          machineCode: mCode,
          category,
          totalDowntimes: data.count,
          lastDate: data.dates[data.dates.length - 1] || "N/A",
          score: Math.min(100, score),
          recommendedAction: recommendation
        });
      }
    });

    return results.sort((a, b) => b.totalDowntimes - a.totalDowntimes);
  };

  const recurrentResults = useMemo(() => {
    return computeRecurrentFailures();
  }, [siteMachines]);

  // --------------------------------------------------------------------------------
  // KPI CALCULATOR (Action 7) - Memoized Performance Optimization
  // --------------------------------------------------------------------------------
  const totalFleet = useMemo(() => {
    return siteMachines.length;
  }, [siteMachines]);

  const operationalFleet = useMemo(() => {
    return siteMachines.filter(m => m.status === "DISPONIBLE").length;
  }, [siteMachines]);

  const currentAvailability = useMemo(() => {
    return totalFleet > 0 ? Math.round((operationalFleet / totalFleet) * 100) : 100;
  }, [totalFleet, operationalFleet]);

  // Compute average MTTR (Mean Time To Repair in hours of resolved downtimes)
  const averageMTTRHours = useMemo(() => {
    const resolvedDowntimes = siteMachines.flatMap(m => m.downtimes.filter(d => !!d.endHour));
    return resolvedDowntimes.length > 0 
      ? Math.round((resolvedDowntimes.reduce((acc, curr) => acc + (curr.durationMinutes || 60), 0) / resolvedDowntimes.length / 60) * 10) / 10
      : 4.2;
  }, [siteMachines]);

  // Compute MTBF (Mean Time Between Failures in running hours)
  const calculatedMTBFHours = useMemo(() => {
    const totalFailures = siteMachines.flatMap(m => m.downtimes).length;
    const totalRunningHours = siteMachines.reduce((acc, curr) => acc + curr.hours, 0);
    return totalFailures > 0 
      ? Math.round(totalRunningHours / totalFailures)
      : 128;
  }, [siteMachines]);

  // Backlog BT Count
  const openBTCount = useMemo(() => {
    return siteWorkOrders.filter(wo => wo.status !== "CLOS").length;
  }, [siteWorkOrders]);

  // Top Breakdown Category
  const topBreakdownCategory = useMemo(() => {
    const categoryCounts: { [key: string]: number } = {};
    siteMachines.flatMap(m => m.downtimes).forEach(d => {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
    });
    const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
    return topCategoryEntry ? topCategoryEntry[0] : "HYDRAULIQUE";
  }, [siteMachines]);

  // Cumulative maintenance cost
  const totalSpendUSD = useMemo(() => {
    return siteWorkOrders.reduce((acc, curr) => {
      const partsCost = curr.replacedParts.reduce((pAcc, pCurr) => pAcc + (pCurr.costUSD * pCurr.qty), 0);
      return acc + partsCost;
    }, selectedSiteFilter === "TOUS" ? 32500 : 8500); // 32,500 base historical spend or site baseline
  }, [siteWorkOrders, selectedSiteFilter]);

  // --------------------------------------------------------------------------------
  // UNIFIED MASTER SEARCH FILTER (Action 8) - Memoized to prevent input stuttering
  // --------------------------------------------------------------------------------
  const filteredMachines = useMemo(() => {
    return siteMachines.filter(m => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        m.code.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.model.toLowerCase().includes(q) ||
        m.currentWorksite.toLowerCase().includes(q) ||
        m.downtimes.some(d => d.reason.toLowerCase().includes(q) || d.category.toLowerCase().includes(q))
      );
    });
  }, [siteMachines, searchQuery]);

  const filteredBT = useMemo(() => {
    return siteWorkOrders.filter(wo => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        wo.id.toLowerCase().includes(q) ||
        wo.machineCode.toLowerCase().includes(q) ||
        wo.title.toLowerCase().includes(q) ||
        wo.category.toLowerCase().includes(q) ||
        wo.assignedTech.toLowerCase().includes(q)
      );
    });
  }, [siteWorkOrders, searchQuery]);

  return (
    <div className={cn(
      "w-full rounded-xl border p-4 font-sans select-none overflow-hidden relative",
      highContrast 
        ? "bg-black text-[#fafafa] border-amber-500 border-4 shadow-2xl" 
        : "bg-slate-950 text-slate-100 border-slate-800 shadow-xl"
    )}>

      {/* ==================================================================== */}
      {/* SECURE TERMINAL LOCK OVERLAY (Objective 4 - VRAI SYSTÈME UTILISATEURS) */}
      {/* ==================================================================== */}
      {isSessionLocked && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4 text-center font-mono animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-xl p-6 max-w-md w-full shadow-2xl relative my-auto max-h-[95%] overflow-y-auto flex flex-col">
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            
            <Lock className="h-10 w-10 text-amber-500 mx-auto mb-3 animate-bounce" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              CONSIGNE DE CONVERROUILLAGE SÉCURISÉ
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 mb-4">
              COMMUTATION DE SESSION OPÉRATEUR SÉCURISÉE • ENTRER LE CODE PIN REQUIS
            </p>

            {/* Profile Selection list */}
            <div className="space-y-1 mb-4 max-h-[140px] overflow-y-auto pr-1">
              {REAL_PROFILES.map(p => (
                <div 
                   key={p.id}
                   onClick={() => {
                     setSelectedProfileId(p.id);
                     setPinInput("");
                   }}
                   className={cn(
                     "p-2 rounded border text-left cursor-pointer transition-all flex items-center justify-between text-xs",
                     selectedProfileId === p.id 
                       ? "bg-amber-500/10 border-amber-500 text-amber-400 font-bold"
                       : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
                   )}
                >
                   <div className="flex items-center gap-1.5">
                     <span className="text-sm">{p.badge.split(" ")[0]}</span>
                     <div>
                       <div className="font-extrabold text-[11px] text-white">{p.name}</div>
                       <div className="text-[9px] text-slate-400 font-mono italic">{p.role}</div>
                     </div>
                   </div>
                   <span className="text-[9px] bg-slate-900 px-1 border border-slate-800 text-slate-500 font-mono">PIN: {p.pin}</span>
                </div>
              ))}
            </div>

            {/* Simulated Keypad for glove input with large 44px buttons */}
            <div className="space-y-2">
              <div className="bg-slate-950 p-2 border border-slate-800 rounded font-mono text-center tracking-[0.5em] text-lg font-black text-amber-500 h-10 flex items-center justify-center">
                {"•".repeat(pinInput.length) || <span className="text-slate-600 tracking-normal text-xs uppercase animate-pulse">Entrer PIN</span>}
              </div>

              {/* Pad buttons */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      if (pinInput.length < 4) {
                        setPinInput(p => p + d);
                      }
                    }}
                    className="h-11 text-xs font-bold bg-slate-950 border border-slate-850 hover:bg-slate-800 rounded flex items-center justify-center active:bg-amber-500/20 active:text-amber-400 transition-colors"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinInput("")}
                  className="h-11 text-[10px] uppercase font-bold bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-950 rounded flex items-center justify-center transition-colors"
                >
                  Effacer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pinInput.length < 4) {
                      setPinInput(p => p + "0");
                    }
                  }}
                  className="h-11 text-xs font-bold bg-slate-950 border border-slate-850 hover:bg-slate-800 rounded flex items-center justify-center transition-colors"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prof = REAL_PROFILES.find(p => p.id === selectedProfileId);
                    if (prof) {
                      if (pinInput === prof.pin) {
                        setCurrentUser(prof);
                        setIsSessionLocked(false);
                        setPinInput("");
                        toast.success(`🔐 Session déverrouillée : Bienvenue ${prof.name} (${prof.badge})`);
                        addAuditLog(`Connexion sécurisée réussie via PIN pour ${prof.name}`, "SECURITY");
                      } else {
                        toast.error("📌 CODE PIN INCORRECT !");
                        setPinInput("");
                        addAuditLog(`Échec PIN pour ${prof.name}`, "SECURITY_ALERT");
                      }
                    }
                  }}
                  className="h-11 text-[10px] uppercase font-black bg-emerald-500 text-slate-950 hover:bg-emerald-600 rounded flex items-center justify-center transition-colors"
                >
                  Saisir
                </button>
              </div>

              {/* Emergency bypass button */}
              <button
                type="button"
                onClick={() => {
                  setIsSessionLocked(false);
                  setPinInput("");
                  toast.info("Accès d'urgence temporaire autorisé.");
                  addAuditLog("Bypass de la vérification PIN utilisateur", "SECURITY_BYPASS");
                }}
                className="text-[9px] text-slate-500 hover:text-slate-300 underline font-mono tracking-tighter mt-1 block w-full text-center"
              >
                [ ACCÈS VISU CONSOLE UNIQUE D'URGENCES ]
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* OFFLINE MODE AND SYNC QUEUE BANNER */}
      {offlineMode && (
        <div className="mb-4 bg-orange-500/10 border-2 border-orange-500/40 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-500 animate-ping inline-block shrink-0" />
            <span className="text-orange-400 font-extrabold text-xs uppercase tracking-wider">
              ⚠️ [HORS LIGNE] Mode galerie hors réseau actif (Réseau Souterrain Coupé)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] text-slate-300 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              ⏳ En attente synchronisation : {offlineQueue.length} {offlineQueue.length <= 1 ? "action" : "actions"}
            </span>
            {offlineQueue.length > 0 ? (
              <Button
                size="sm"
                onClick={() => {
                  handleSyncOfflineQueue();
                  toast.success("Synchronisation réussie des modules de terrain ! ✅");
                }}
                className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs h-9 px-4 shadow-lg shadow-orange-500/20 rounded-lg flex items-center justify-center"
              >
                🔄 SYNCHRONISER MAINTENANT
              </Button>
            ) : (
              <span className="text-[10px] text-emerald-400 font-mono">✅ Aucune tâche en attente</span>
            )}
          </div>
        </div>
      )}

      {/* ATELIER TOP INTEGRATED CONSOLE */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full inline-block bg-emerald-500 animate-pulse" />
            <h1 className="text-sm lg:text-base font-black tracking-wider uppercase flex items-center gap-2 text-white">
              <Wrench className="h-4 w-4 text-emerald-400" />
              SOU-GMAO : GESTION TECHNIQUE SÉCURISÉE
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            CONTRÔLE OPÉRATIONNEL SOUTERRAIN • VERSION DURCIE V4.9
          </p>
        </div>

        {/* WORK ENVIRONMENT PREFERENCES */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Real user session selector (Objective 4) */}
          <button
            onClick={() => {
              setIsSessionLocked(true);
              setPinInput("");
              toast.info("Veuillez saisir votre PIN d'authentification.");
            }}
            className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1 text-xs hover:bg-slate-850/80 transition-all cursor-pointer"
          >
            <UserCheck className="h-3 w-3 text-amber-400 animate-pulse" />
            <span className="text-[9px] font-mono text-slate-400 uppercase">SÉSESSION :</span>
            <span className="text-[11px] font-extrabold text-white flex items-center gap-1">
              {currentUser.badge.split(" ")[0]} {currentUser.name} 
              <span className="text-[10px] text-amber-400 font-black italic">({currentUser.role})</span>
            </span>
            <span className="text-[9px] text-slate-400 font-mono ml-1 underline bg-slate-950 px-1 py-0.5 rounded">[SWITCH]</span>
          </button>

          {/* Mode Tactile / Gants */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const current = !tactileMode;
              setTactileMode(current);
              localStorage.setItem("sg_tactile_mode", current ? "true" : "false");
              toast.success(current ? "🧤 Mode Tactile & Gros Boutons activé pour utilisation avec gants." : "Mode d'affichage standard de bureau activé.");
              addAuditLog(`Changement mode écran : Tactile Gants = ${current}`, "INTERFACE");
            }}
            className={cn(
              "text-[10px] font-mono h-8 border px-2",
              tactileMode ? "bg-emerald-500 text-slate-950 hover:bg-emerald-600 font-black" : "border-slate-800 text-slate-400"
            )}
          >
            🧤 {tactileMode ? "TACTILE ACTIF (GROS BOUTONS)" : "MODE CLAVIER STANDARD"}
          </Button>

          {/* Simulated offline toggle */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const nextOff = !offlineMode;
                setOfflineMode(nextOff);
                if (nextOff) {
                  toast.error("🔌 Mode galerie hors réseau actif : Saisies temporaires sauvegardées localement.", { duration: 4000 });
                } else {
                  toast.success("🔌 Réseau de surface rétabli - Synchronisation réussie des données !", { duration: 4500 });
                }
                addAuditLog(`Simulateur réseau : mode Hors-Ligne = ${nextOff}`, "SYSTEM");
              }}
              className={cn(
                "text-[10px] font-mono h-8 border px-2.5",
                offlineMode 
                  ? "bg-amber-600 text-slate-950 border-amber-500 font-black animate-pulse" 
                  : "bg-slate-900 border-slate-800 text-emerald-400"
              )}
            >
              🔌 {offlineMode ? "HORS-LIGNE" : "RÉSEAU OK"}
            </Button>

            {offlineQueue.length > 0 && (
              <Button
                size="sm"
                onClick={handleSyncOfflineQueue}
                className="bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black text-[10px] h-8 animate-pulse"
              >
                🔄 SYNC ({offlineQueue.length})
              </Button>
            )}
          </div>

          {/* Bulk csv exporter */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="border-slate-800 text-amber-500 hover:bg-amber-500/10 h-8 text-[10px] font-mono"
          >
            📊 CSV EXCEL
          </Button>

          {/* High contrast visual fallback toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setHighContrast(!highContrast);
              toast.info(highContrast ? "Contraste standard" : "Contraste maximum vision de nuit activé.");
            }}
            className={cn(
              "text-[10px] font-mono h-8 border px-2",
              highContrast ? "bg-amber-400 text-slate-950 hover:bg-amber-500 font-black" : "border-slate-800 text-amber-500"
            )}
          >
            💡 {highContrast ? "ÉCRAN NORMAL" : "VISION HAUT CONTRASTE"}
          </Button>
        </div>
      </div>

      {/* QUICK STATS METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 mb-4">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase font-mono">Dispo. Flotte</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-white">{currentAvailability}%</span>
            <span className="text-[9px] text-slate-500">cible: 85%</span>
          </div>
          <Progress value={currentAvailability} className="h-1 bg-slate-950 mt-1" />
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase font-mono">MTTR Moyen</span>
          <span className="text-xl font-bold text-sky-400 mt-1">{averageMTTRHours} h</span>
          <span className="text-[8px] text-slate-500">Temps de réparation</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase font-mono">MTBF estimé</span>
          <span className="text-xl font-bold text-emerald-400 mt-1">{calculatedMTBFHours} h</span>
          <span className="text-[8px] text-slate-500">Temps entre pannes</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase font-mono">Backlog BT</span>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xl font-bold text-red-400">{openBTCount}</span>
            <Badge className="bg-red-950 text-red-400 text-[8px] px-1 py-0">{openBTCount} Ouverts</Badge>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase font-mono">Coûts Entretien</span>
          <span className="text-sm font-bold text-amber-500 mt-1">${totalSpendUSD.toLocaleString()} USD</span>
          <span className="text-[8px] text-slate-500">Pièces imputées</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[9px] text-slate-400 uppercase font-mono">Top Organe</span>
          <span className="text-xs font-bold text-purple-400 mt-1 line-clamp-1 truncate">{topBreakdownCategory}</span>
          <span className="text-[8px] text-slate-err bg-transparent text-slate-500">Fréquence maximale</span>
        </div>
      </div>

      {/* MASTER LIVE UNIFIED SEARCH FILTER BAR */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-slate-500" />
        </div>
        <Input
          type="text"
          placeholder="Recherche instantanée : code engin, catégorie de panne (ex: hydraulique, moteur), mot-clé de raison, mécanicien..."
          className="bg-slate-900 border-slate-800 text-slate-100 text-xs pl-9 focus:border-emerald-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <span className="absolute right-3 top-2.5 text-[9px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
            Filtre actif ({filteredMachines.length} engins, {filteredBT.length} BT trouvés)
          </span>
        )}
      </div>

      {/* TABS SELECTOR - CATEGORIZED NAVIGATION CONTROL INTERFACE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4 p-1.5 bg-slate-900/40 border border-slate-800/80 rounded-xl">
        {/* Category 1: Daily and Fleet Ops */}
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900 space-y-1">
          <div className="text-[9px] font-black text-slate-550 uppercase px-1 flex items-center justify-between">
            <span>👷 QUOTIDIEN & FLOTTE</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveTab("engins")}
              className={cn(
                "py-1.5 rounded text-[10px] font-extrabold uppercase transition-all text-center",
                activeTab === "engins" 
                  ? "bg-slate-100 text-slate-950 shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              Engins
            </button>
            <button
              onClick={() => setActiveTab("coordination")}
              className={cn(
                "py-1.5 rounded text-[10px] font-extrabold uppercase transition-all text-center",
                activeTab === "coordination" 
                  ? "bg-emerald-500 text-slate-950 shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              Poste
            </button>
            <button
              onClick={() => setActiveTab("handover")}
              className={cn(
                "py-1.5 rounded text-[10px] font-extrabold uppercase transition-all text-center",
                activeTab === "handover" 
                  ? "bg-slate-100 text-slate-950 shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              Passages
            </button>
          </div>
        </div>

        {/* Category 2: Workshop & Safety */}
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900 space-y-1">
          <div className="text-[9px] font-black text-slate-550 uppercase px-1 flex items-center justify-between">
            <span>⚙️ SÉCURITÉ & ATELIER</span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveTab("atelier")}
              className={cn(
                "py-1.5 rounded text-[10px] font-extrabold uppercase transition-all text-center",
                activeTab === "atelier" 
                  ? "bg-amber-500 text-slate-950 shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              Atelier
            </button>
            <button
              onClick={() => setActiveTab("calendrier")}
              className={cn(
                "py-1.5 rounded text-[10px] font-extrabold uppercase transition-all text-center",
                activeTab === "calendrier" 
                  ? "bg-amber-500 text-slate-950 shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              Préventif
            </button>
            <button
              onClick={() => setActiveTab("biblio")}
              className={cn(
                "py-1.5 rounded text-[10px] font-extrabold uppercase transition-all text-center",
                activeTab === "biblio" 
                  ? "bg-amber-500 text-slate-950 shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              LOTO 🔒
            </button>
          </div>
        </div>

        {/* Category 3: Backlog & Tickets */}
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900 space-y-1">
          <div className="text-[9px] font-black text-slate-550 uppercase px-1 flex items-center justify-between">
            <span>📋 ORDONNANCEMENT BT</span>
            <span className="h-1.5 w-1.5 rounded-full bg-sky-550" />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveTab("backlog")}
              className={cn(
                "py-1.5 rounded text-[10px] font-extrabold uppercase transition-all text-center relative",
                activeTab === "backlog" 
                  ? "bg-sky-500 text-slate-950 shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              Backlog
              {openBTCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-650 text-white font-mono text-[8px] h-3.5 px-1.5 min-w-3.5 rounded-full flex items-center justify-center font-bold">
                  {openBTCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("bt")}
              className={cn(
                "py-1.5 rounded text-[10px] font-extrabold uppercase transition-all text-center",
                activeTab === "bt" 
                  ? "bg-sky-500 text-slate-950 shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              BT
            </button>
            <button
              onClick={() => setActiveTab("epidemiology")}
              className={cn(
                "py-1.5 rounded text-[10px] font-extrabold uppercase transition-all text-center",
                activeTab === "epidemiology" 
                  ? "bg-emerald-500/80 text-white shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              IA Récidive
            </button>
          </div>
        </div>

        {/* Category 4: Analytics & Finance */}
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900 space-y-1">
          <div className="text-[9px] font-black text-slate-550 uppercase px-1 flex items-center justify-between">
            <span>📊 STRATÉGIE & PILOTAGE</span>
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          </div>
          <div className="grid grid-cols-5 gap-1">
            <button
              onClick={() => setActiveTab("couts")}
              className={cn(
                "py-1.5 rounded text-[9px] font-extrabold uppercase transition-all text-center truncate",
                activeTab === "couts" 
                  ? "bg-purple-650 text-white shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              Coûts
            </button>
            <button
              onClick={() => setActiveTab("rapports")}
              className={cn(
                "py-1.5 rounded text-[9px] font-extrabold uppercase transition-all text-center truncate",
                activeTab === "rapports" 
                  ? "bg-purple-650 text-white shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              Rapports
            </button>
            <button
              onClick={() => setActiveTab("kpis")}
              className={cn(
                "py-1.5 rounded text-[9px] font-extrabold uppercase transition-all text-center truncate",
                activeTab === "kpis" 
                  ? "bg-slate-100 text-slate-950 shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-100"
              )}
            >
              KPIs
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={cn(
                "py-1.5 rounded text-[9px] font-extrabold uppercase transition-all text-center truncate",
                activeTab === "audit" 
                  ? "bg-rose-650 text-white shadow-md font-black" 
                  : "bg-slate-900 border border-slate-850 text-rose-300 hover:text-[#fff]"
              )}
            >
              Audit
            </button>
            <button
              onClick={() => setActiveTab("pilote")}
              className={cn(
                "py-1.5 rounded text-[9px] font-black uppercase transition-all text-center truncate",
                activeTab === "pilote" 
                  ? "bg-amber-500 text-slate-950 shadow-md" 
                  : "bg-indigo-950/80 border border-indigo-900 text-indigo-350 hover:text-white"
              )}
            >
              🚀 Pilote
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TABS CONTENT 1 : FICHE MACHINE & DECLARATION ARRÊT */}
      {/* ==================================================================== */}
      {activeTab === "engins" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Machine selector cards */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-1">
              SÉLECTION DE L'ENGIN
            </span>
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
              {filteredMachines.map(m => (
                <div
                  key={m.code}
                  onClick={() => setSelectedMachineCode(m.code)}
                  className={cn(
                    "p-2.5 rounded border cursor-pointer transition-all flex flex-col gap-1",
                    selectedMachineCode === m.code
                      ? "border-emerald-500 bg-emerald-950/15"
                      : "border-slate-800 bg-slate-900/40 hover:bg-slate-900/70"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white text-xs">{m.code}</span>
                    <Badge className={cn(
                      "text-[8px] font-mono",
                      m.status === "DISPONIBLE" && "bg-emerald-950 text-emerald-400 outline outline-emerald-800",
                      m.status === "EN PANNE" && "bg-red-950 text-red-405 outline outline-red-700 animate-pulse",
                      m.status === "EN ATTENTE PIÈCES" && "bg-amber-950 text-amber-500 outline outline-amber-800",
                      m.status === "EN MAINTENANCE" && "bg-sky-950 text-sky-400 outline outline-sky-800",
                      m.status === "RESTREINTE" && "bg-purple-950 text-purple-400 outline outline-purple-800"
                    )}>
                      {m.status}
                    </Badge>
                  </div>
                  
                  {/* Recurrence Warning (Goal 3) */}
                  {(() => {
                    const recurMatch = recurrentResults.find(r => r.machineCode === m.code && r.totalDowntimes >= 2);
                    if (recurMatch) {
                      return (
                        <div className="flex items-center gap-1 text-[9px] text-amber-500 font-mono font-bold uppercase animate-pulse">
                          ⚠️ PANNE RÉCIDIVANTE : {recurMatch.category} ({recurMatch.totalDowntimes}x)
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{m.type} • {m.model}</span>
                    <span className="font-mono text-white text-[10px]">{m.hours.toLocaleString()} h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Profile Sheet */}
          <div className="lg:col-span-2 space-y-4">
            
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850">
                <CardTitle className="text-sm font-black text-white flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-emerald-400" />
                    INFO ENGINES : {selectedMachine.code}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Gisement : {selectedMachine.currentWorksite}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-3 space-y-3">
                
                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 bg-slate-950 rounded border border-slate-850">
                    <span className="text-slate-400 text-[9px] block">TYPE ENGIN</span>
                    <span className="text-white font-bold block">{selectedMachine.type}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-850">
                    <span className="text-slate-400 text-[9px] block">COMPTEUR</span>
                    <span className="text-white font-black block">{selectedMachine.hours} h</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-850">
                    <span className="text-slate-400 text-[9px] block">STATUT ATELIER</span>
                    <span className="text-amber-400 font-bold block">{selectedMachine.status}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-850">
                    <span className="text-slate-400 text-[9px] block">DÉFAILLANCES TOTALES</span>
                    <span className="text-red-400 font-bold block">{selectedMachine.downtimes.length} incidents</span>
                  </div>
                </div>

                {/* ==================================================================== */}
                {/* 1. CONNECTEURS PLUG-IN ET CONTRÔLE DES SYSTÈMES CONNECTÉS (Action 1) */}
                {/* ==================================================================== */}
                <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-3.5">
                    <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block font-bold">Flux Externes :</span>
                    
                    <div className="flex items-center gap-1.5 font-mono">
                      <Zap className="h-3 w-3 text-amber-500 animate-pulse" />
                      <span className="text-slate-300">Carburant:</span>
                      <Badge className="bg-emerald-950/80 text-emerald-400 text-[8px] h-4 py-0 border border-emerald-900/40 uppercase font-black">LÉGER CONNECTÉ ●</Badge>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <Layers className="h-3 w-3 text-sky-400" />
                      <span className="text-slate-300">Magasin:</span>
                      <Badge className="bg-emerald-950/80 text-emerald-400 text-[8px] h-4 py-0 border border-emerald-900/40 uppercase font-black">ACTIF ●</Badge>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span className="text-slate-300">Sécurité:</span>
                      <Badge className="bg-emerald-950/80 text-emerald-400 text-[8px] h-4 py-0 border border-emerald-900/40 uppercase font-black">CONFORME ●</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px] self-end md:self-auto">
                    <span className="text-slate-400">Dernière Sync: <b className="text-white">{lastSyncTime}</b></span>
                    <Button 
                      onClick={handleManualSync} 
                      disabled={isSyncing} 
                      size="xs" 
                      variant="outline" 
                      className="h-5 text-[8.5px] border-slate-850 bg-slate-900 hover:bg-slate-800 gap-1 text-slate-100 font-bold px-1.5 py-0"
                    >
                      <RefreshCw className={cn("h-2 w-2 text-slate-400", isSyncing && "animate-spin")} />
                      {isSyncing ? "Sync..." : "Forcer"}
                    </Button>
                  </div>
                </div>

                {/* ==================================================================== */}
                {/* SUB-TABS SELECTOR FOR HUB CENTRAL (Module 5 & 6) */}
                {/* ==================================================================== */}
                <div className="flex bg-slate-950/30 p-1 border border-slate-850 rounded-lg gap-1 overflow-x-auto">
                  <button
                    onClick={() => setHubSubTab("maintenance")}
                    className={cn(
                      "flex-1 text-[10px] sm:text-[11px] font-black uppercase py-1.5 px-2.5 rounded-md transition-all whitespace-nowrap flex items-center justify-center gap-1.5",
                      hubSubTab === "maintenance" 
                        ? "bg-slate-800 text-white shadow-sm font-black" 
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <Wrench className="h-3.5 w-3.5 text-emerald-400" />
                    Entretien & BT
                  </button>

                  <button
                    onClick={() => setHubSubTab("carburant")}
                    className={cn(
                      "flex-1 text-[10px] sm:text-[11px] font-black uppercase py-1.5 px-2.5 rounded-md transition-all whitespace-nowrap flex items-center justify-center gap-1.5",
                      hubSubTab === "carburant" 
                        ? "bg-amber-950/50 text-amber-400 shadow-sm border border-amber-900/30" 
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    Carburant/Huiles
                  </button>

                  <button
                    onClick={() => setHubSubTab("magasin")}
                    className={cn(
                      "flex-1 text-[10px] sm:text-[11px] font-black uppercase py-1.5 px-2.5 rounded-md transition-all whitespace-nowrap flex items-center justify-center gap-1.5",
                      hubSubTab === "magasin" 
                        ? "bg-sky-955/50 text-sky-400 shadow-sm border border-sky-900/30" 
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <Layers className="h-3.5 w-3.5 text-sky-450" />
                    Magasin (WMS)
                  </button>

                  <button
                    onClick={() => setHubSubTab("securite")}
                    className={cn(
                      "flex-1 text-[10px] sm:text-[11px] font-black uppercase py-1.5 px-2.5 rounded-md transition-all whitespace-nowrap flex items-center justify-center gap-1.5",
                      hubSubTab === "securite" 
                        ? "bg-emerald-955/50 text-emerald-400 shadow-sm border border-emerald-900/30" 
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Sécurité (HSE)
                  </button>

                  <button
                    onClick={() => setHubSubTab("timeline")}
                    className={cn(
                      "flex-1 text-[10px] sm:text-[11px] font-black uppercase py-1.5 px-2.5 rounded-md transition-all whitespace-nowrap flex items-center justify-center gap-1.5",
                      hubSubTab === "timeline" 
                        ? "bg-purple-950/50 text-purple-400 shadow-sm border border-purple-900/40" 
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <Clock className="h-3.5 w-3.5 text-purple-400" />
                    Timeline (GMAO)
                  </button>
                </div>

                {/* ==================================================================== */}
                {/* SUB-TABS CONTENT RENDERING (Module 5 Unified Machine Profile HUB) */}
                {/* ==================================================================== */}
                
                {/* SUB-TAB 1 : MAINTENANCE, ARRÊTS & HISTORIQUE */}
                {hubSubTab === "maintenance" && (
                  <div className="space-y-3">
                    {selectedMachine.activeDowntimeId ? (
                      (() => {
                        const activeDowntime = selectedMachine.downtimes.find(d => d.id === selectedMachine.activeDowntimeId);
                        return activeDowntime ? (
                          <div className="p-3 rounded border border-red-900 bg-red-950/20 space-y-3 animate-pulse">
                            <div className="flex items-center gap-2 justify-between flex-wrap">
                              <span className="text-red-400 font-bold text-xs flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                ARRÊT ACTIF EN GALERIE DEPUIS LE {activeDowntime.startHour}
                              </span>
                              <span className="text-[10px] font-mono bg-red-950 text-red-300 px-1.5 py-0.5 rounded uppercase">
                                Catégorie: {activeDowntime.category} ({activeDowntime.severity})
                              </span>
                            </div>
                            <p className="text-slate-300 text-xs font-serif italic">“ {activeDowntime.reason} ”</p>
                            
                            <div className="flex gap-4 text-[10px] text-slate-400 font-mono flex-wrap">
                              <span>🔧 Mécanicien affecté : <b>{activeDowntime.assignedMechanic || "Aucun"}</b></span>
                              <span>📦 Attente de pièces: <b>{activeDowntime.isAwaitingParts ? "OUI" : "NON"}</b></span>
                              <span>🔒 Attente de mécanicien: <b>{activeDowntime.isAwaitingMechanic ? "OUI" : "NON"}</b></span>
                            </div>

                            {/* REMETTRE EN SERVICE FORM */}
                            <form onSubmit={handleRemettreEnService} className="pt-2 border-t border-slate-800 space-y-2">
                              <span className="text-[10px] font-bold text-emerald-400 block uppercase">Clôturer l'arrêt et valider la ré-exploitation :</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Input
                                  type="text"
                                  required
                                  placeholder="Action corrective effectuée au fond de taille"
                                  className="bg-slate-955 border-slate-850 text-xs h-8 text-slate-100"
                                  value={remedyActionStr}
                                  onChange={(e) => setRemedyActionStr(e.target.value)}
                                />
                                <div className="flex gap-1">
                                  <Input
                                    type="text"
                                    placeholder="Pièce remplacée (Optionnelle)"
                                    className="bg-slate-955 border-slate-850 text-xs h-8 text-slate-100"
                                    value={remedyPartName}
                                    onChange={(e) => setRemedyPartName(e.target.value)}
                                  />
                                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-slate-955 h-8 font-black text-xs px-2.5">
                                    REMETTRE EN SERVICE
                                  </Button>
                                </div>
                              </div>
                            </form>
                          </div>
                        ) : null;
                      })()
                    ) : (
                      /* STOP DECLARATION FORM */
                      <form onSubmit={handleDeclareStop} className="p-3 rounded border border-slate-850 bg-slate-955/40 space-y-3">
                        <span className="text-[10px] uppercase font-bold text-red-400 block tracking-wider">
                          CONSIGNER UN NOUVEL ARRÊT DE CET ENGIN
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 block">Cause de l'arrêt moteur ou structure</span>
                            <Input
                              type="text"
                              required
                              placeholder="Ex: Flexible brayé, Alternateur HS..."
                              className="bg-slate-900 border-slate-850 text-xs h-8 text-slate-100"
                              value={stopReason}
                              onChange={(e) => setStopReason(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 block">Catégorie de panne standard</span>
                            <select
                              className="w-full bg-slate-900 border border-slate-850 text-xs h-8 text-slate-100 rounded px-2 focus:outline-none"
                              value={stopCategory}
                              onChange={(e: any) => setStopCategory(e.target.value)}
                            >
                              <option value="HYDRAULIQUE">HYDRAULIQUE</option>
                              <option value="MOTEUR">MOTEUR</option>
                              <option value="TRANSMISSION">TRANSMISSION</option>
                              <option value="FREINAGE">FREINAGE</option>
                              <option value="ÉLECTRIQUE">ÉLECTRIQUE</option>
                              <option value="PNEUMATIQUE">PNEUMATIQUE</option>
                              <option value="STRUCTURE">STRUCTURE</option>
                              <option value="SÉCURITÉ">SÉCURITÉ</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 block">Niveau de gravité attendu</span>
                            <select
                              className="w-full bg-slate-900 border border-slate-850 text-xs h-8 text-slate-100 rounded px-2 focus:outline-none"
                              value={stopSeverity}
                              onChange={(e: any) => setStopSeverity(e.target.value)}
                            >
                              <option value="mineur">Mineur (Engin bridé ou restreint)</option>
                              <option value="majeur">Majeur (Arrêt immédiat de la tâche)</option>
                              <option value="critique">Critique (Atelier technique requis)</option>
                            </select>
                          </div>
                        </div>

                        {/* Waiting toggles & assigned fields */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                          
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-[9px] text-slate-400">Statut ciblé</span>
                            <select
                              className="w-full bg-slate-900 border border-slate-850 text-xs h-8 text-slate-100 rounded px-2 focus:outline-none"
                              value={stopStatusStr}
                              onChange={(e: any) => setStopStatusStr(e.target.value)}
                            >
                              <option value="EN PANNE">EN PANNE</option>
                              <option value="EN MAINTENANCE">EN MAINTENANCE</option>
                              <option value="EN ATTENTE PIÈCES">EN ATTENTE PIÈCES</option>
                              <option value="RESTREINTE">RESTREINTE</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5 h-8">
                            <input
                              type="checkbox"
                              id="parts"
                              checked={stopParts}
                              onChange={(e) => setStopParts(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-900"
                            />
                            <label htmlFor="parts" className="text-[10px] text-slate-300">Attente Pièces ?</label>
                          </div>

                          <div className="flex items-center gap-1.5 h-8">
                            <input
                              type="checkbox"
                              id="mech"
                              checked={stopMech}
                              onChange={(e) => setStopMech(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-900"
                            />
                            <label htmlFor="mech" className="text-[10px] text-slate-300">Attente Mécanicien ?</label>
                          </div>

                          <Button type="submit" className="bg-red-650 hover:bg-red-750 text-white font-extrabold text-xs h-8">
                            Saisie de l'arrêt 🛑
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* DYNAMIC LIST OF BT ASSOCIATED WITH CHOSEN SCOOP/JUMBO/LOC (Objective 5) */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
                        BONS DE TRAVAIL (GMAO) LIÉS À CET ENGIN
                      </span>
                      <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950/30">
                        <Table className="text-xs">
                          <TableHeader className="bg-slate-950 font-mono">
                            <TableRow className="border-b border-slate-850">
                              <TableHead className="py-2 text-slate-400">Réf BT</TableHead>
                              <TableHead className="py-2 text-slate-400">Intitulé de Panne / Révision</TableHead>
                              <TableHead className="py-2 text-slate-400">Gravité</TableHead>
                              <TableHead className="py-2 text-slate-400">Technicien</TableHead>
                              <TableHead className="py-2 text-slate-400">Statut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {workOrders.filter(w => w.machineCode === selectedMachine.code).map((wo) => {
                              return (
                                <TableRow key={wo.id} className="border-b border-slate-900/40 hover:bg-slate-900/10">
                                  <TableCell className="py-1.5 font-mono font-bold text-slate-300">{wo.id}</TableCell>
                                  <TableCell className="py-1.5 font-medium text-white">{wo.title}</TableCell>
                                  <TableCell className="py-1.5 text-[10px]">
                                    <Badge className={cn(
                                      "bg-slate-850 text-slate-350 text-[8px] uppercase",
                                      wo.severity === "critique" ? "bg-red-950 text-red-500 border border-red-900/40" : ""
                                    )}>
                                      {wo.severity}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-1.5 text-slate-400">{wo.assignedTech}</TableCell>
                                  <TableCell className="py-1.5">
                                    <Badge className={cn(
                                      "text-[8px] uppercase font-mono h-5 py-0",
                                      wo.status === "OUVERT" && "bg-red-950 text-red-400 border border-red-900/30",
                                      wo.status === "EN_COURS" && "bg-amber-950 text-amber-500 border border-amber-900/30",
                                      wo.status === "RÉSOLU" && "bg-emerald-950 text-emerald-400 border border-emerald-900/30",
                                      wo.status === "CLOS" && "bg-slate-950 text-slate-500"
                                    )}>
                                      {wo.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            {workOrders.filter(w => w.machineCode === selectedMachine.code).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-slate-500 italic">
                                  Aucun bon de travail actif ou archivé pour cet engin dans le backlog.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* HISTORICAL RESOLVED DOWNTIMES */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
                        HISTORIQUE RÉCENT DES RE-MISES EN SERVICE (GMAO)
                      </span>
                      <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950/30 font-mono text-[11px]">
                        <Table className="text-xs">
                          <TableHeader className="bg-slate-950">
                            <TableRow className="border-b border-slate-850">
                              <TableHead className="py-2 text-slate-400">Date Début</TableHead>
                              <TableHead className="py-2 text-slate-400">Organe</TableHead>
                              <TableHead className="py-2 text-slate-400">Durée</TableHead>
                              <TableHead className="py-2 text-slate-400">Niveau</TableHead>
                              <TableHead className="py-2 text-slate-400">Action corrective effectuée</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedMachine.downtimes.map((dt, i) => (
                              <TableRow key={i} className="border-b border-slate-900/40 hover:bg-slate-900/15">
                                <TableCell className="py-1.5 font-mono text-[10.5px] text-slate-300">{dt.startHour}</TableCell>
                                  <TableCell className="py-1.5">
                                    <Badge className="bg-slate-850 text-slate-350 text-[8px]">{dt.category}</Badge>
                                  </TableCell>
                                  <TableCell className="py-1.5 font-mono text-[10.5px]">
                                    {dt.endHour ? `${dt.durationMinutes} min` : <span className="text-red-400 animate-pulse">En cours</span>}
                                  </TableCell>
                                  <TableCell className="py-1.5">
                                    <Badge variant="outline" className={cn(
                                      "text-[8px] font-mono py-0 h-4.5",
                                      dt.severity === "critique" ? "border-red-650 text-red-400 bg-red-950/20" : "border-amber-655 text-amber-500 bg-amber-950/15"
                                    )}>
                                      {dt.severity}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-1.5 text-[11px] text-slate-300 font-serif max-w-[180px] truncate">
                                    {dt.remedyAction || <span className="text-slate-500 italic">Intervention active au fond...</span>}
                                  </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================================================== */}
                {/* SUB-TAB 2 : CONNECTIVE WEB-FEED CARBURANT & FLUIDES (Objective 2) */}
                {/* ==================================================================== */}
                {hubSubTab === "carburant" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2.5 bg-amber-955/10 border border-amber-900/20 rounded text-xs gap-2">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-400 font-black uppercase tracking-wider">
                          Consommations & Fluides (Liaison API Carburant)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono italic">Flux hydromines-fuel v2.4</span>
                    </div>

                    {/* Alert banner for overconsumption / abnormal oil */}
                    {(currentMachineAppData.carburant.surconsommation || currentMachineAppData.carburant.consommationHuileAnormale) && (
                      <div className="p-3 bg-red-950/25 border-l-4 border-l-red-500 border border-slate-850 rounded-r text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-red-400 font-bold">
                          <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce" />
                          <span>DÉPASSEMENT DES SEUILS CRITIQUES D'EXPLOITATION DETECTÉS :</span>
                        </div>
                        {currentMachineAppData.carburant.surconsommation && (
                          <p className="text-slate-305 font-medium leading-tight text-[11px]">
                            • <b>Surconsommation active !</b> {currentMachineAppData.carburant.surconsommationReason}
                          </p>
                        )}
                        {currentMachineAppData.carburant.consommationHuileAnormale && (
                          <p className="text-slate-305 font-medium leading-tight text-[11px]">
                            • <b>Niveau d'huile critique !</b> {currentMachineAppData.carburant.consommationHuileDetails}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Quick stats columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                      <div className="p-2.5 bg-slate-950 border border-slate-855 rounded space-y-1">
                        <span className="text-slate-500 text-[9px] uppercase">Cumul Carburant</span>
                        <div className="text-white text-sm font-black flex items-baseline gap-1">
                          {currentMachineAppData.carburant.consommationTotale}
                        </div>
                        <span className="text-[9px] text-slate-500 block">Depuis la mise en service</span>
                      </div>

                      <div className="p-2.5 bg-slate-950 border border-slate-855 rounded space-y-1">
                        <span className="text-slate-500 text-[9px] uppercase">Tendance Générale</span>
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-xs font-bold font-sans",
                            currentMachineAppData.carburant.tendance === "HAUSSE" ? "text-red-400" :
                            currentMachineAppData.carburant.tendance === "BAISSE" ? "text-emerald-400" : "text-amber-500"
                          )}>
                            {currentMachineAppData.carburant.tendance === "HAUSSE" ? "📈 HAUSSE" :
                             currentMachineAppData.carburant.tendance === "BAISSE" ? "📉 BAISSE" : "➡️ STABLE"}
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-400 block font-serif italic">“ {currentMachineAppData.carburant.tendanceLabel} ”</span>
                      </div>

                      <div className="p-2.5 bg-slate-950 border border-slate-855 rounded space-y-1">
                        <span className="text-slate-500 text-[9px] uppercase">Lubrifiants / Moteur & Ponts</span>
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-xs font-bold",
                            currentMachineAppData.carburant.consommationHuileAnormale ? "text-red-400" : "text-emerald-400"
                          )}>
                            {currentMachineAppData.carburant.consommationHuileAnormale ? "⚠️ ANOMALE/FUITE" : "✅ PRESSION CONFORME"}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-550 block">Analyses de sang du bloc</span>
                      </div>
                    </div>

                    {/* Table of last refuels */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
                        DERNIÈRES OPÉRATIONS DE RAVITAILLEMENT COGNÉES EN SERVICE
                      </span>
                      <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950/30">
                        <Table className="text-xs">
                          <TableHeader className="bg-slate-950 font-mono">
                            <TableRow className="border-b border-slate-850">
                              <TableHead className="py-2.5">Date et Heure UTC</TableHead>
                              <TableHead className="py-2.5">Volume Transféré</TableHead>
                              <TableHead className="py-2.5">Point de Ravitaillement souterrain</TableHead>
                              <TableHead className="py-2.5">Technique / Opérateur</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentMachineAppData.carburant.derniersRavitaillements.map((rav, i) => (
                              <TableRow key={i} className="border-b border-slate-900/50 hover:bg-slate-900/20">
                                <TableCell className="py-2 font-mono text-[10.5px] text-slate-300">{rav.date}</TableCell>
                                <TableCell className="py-2 font-black text-amber-500">{rav.qty}</TableCell>
                                <TableCell className="py-2 text-white font-serif">{rav.location}</TableCell>
                                <TableCell className="py-2 text-slate-400 text-[11px]">Enregistré via RFID</TableCell>
                              </TableRow>
                            ))}
                            {currentMachineAppData.carburant.derniersRavitaillements.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4 text-slate-550 italic">
                                  Aucun ravitaillement enregistré ce jour (Motorisation rechargeable ou batterie électrique).
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <p className="text-[9.5px] text-slate-500 leading-tight italic">
                      ℹ️ Ces informations proviennent directement du flux <b>Hydromines Carburant & Fluides</b>. Le verrouillage de pompe s'effectue automatiquement en cas de LOTO actif.
                    </p>
                  </div>
                )}

                {/* ==================================================================== */}
                {/* SUB-TAB 3 : LIAISON APIGATEWAY MAGASIN & STOCK BONS DE TRAVAIL (Obj 3) */}
                {/* ==================================================================== */}
                {hubSubTab === "magasin" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2.5 bg-sky-955/15 border border-sky-900/20 rounded text-xs gap-2">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-sky-455" />
                        <span className="text-sky-400 font-black uppercase tracking-wider">
                          Suivi Matière & Pièces Détachées (Liaison API Magasin)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono italic">Flux hydromines-wms v3.1</span>
                    </div>

                    {/* Stock critique warning alert */}
                    {currentMachineAppData.magasin.stockCritique && (
                      <div className="p-3 bg-amber-955/15 border border-amber-900/40 rounded-lg text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                          <AlertTriangle className="h-4 w-4" />
                          <span>ALERTE STOCK CRITIQUE ATELIER :</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          {currentMachineAppData.magasin.stockCritiqueDetails}
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 bg-slate-950 border border-slate-855 rounded space-y-1">
                        <span className="text-slate-500 text-[9px] uppercase">Délai Logistique Estimé</span>
                        <div className="text-white text-sm font-black flex items-center gap-1.5 font-sans">
                          {currentMachineAppData.magasin.delaiApprovisionnement}
                        </div>
                        <span className="text-[9px] text-slate-400 block font-serif">Avis d'admission quai d'arrivée</span>
                      </div>

                      <div className="p-2.5 bg-slate-950 border border-slate-855 rounded space-y-1">
                        <span className="text-slate-500 text-[9px] uppercase">Statut Approv</span>
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className={cn(
                            "font-black font-sans text-xs",
                            currentMachineAppData.magasin.stockCritique ? "text-red-400" : "text-emerald-400"
                          )}>
                            {currentMachineAppData.magasin.stockCritique ? "⚠️ RE-COMMANDE EXPRESS SOUHAITÉE" : "✅ FLUX DE PIÈCES NOMINAL"}
                          </span>
                        </div>
                        <span className="text-[9.5px] text-slate-500 block">Capacité d'approvisionnement fond</span>
                      </div>
                    </div>

                    {/* Checklist of parts needed/available for maintenance */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">
                        DISPONIBILITÉ DES ORGANES ET KITS DE PIÈCES SPÉCIFIQUES EN CABINE DE PIÈCES
                      </span>
                      <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950/30">
                        <Table className="text-xs">
                          <TableHeader className="bg-slate-950 font-mono">
                            <TableRow className="border-b border-slate-850">
                              <TableHead className="py-2.5">Organe Requis / Nomenclature</TableHead>
                              <TableHead className="py-2.5">Stock Magasin</TableHead>
                              <TableHead className="py-2.5">Emplacement Localisé</TableHead>
                              <TableHead className="py-2.5">Statut de Disponibilité</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentMachineAppData.magasin.piecesDisponibles.map((p, i) => (
                              <TableRow key={i} className="border-b border-slate-900/50 hover:bg-slate-900/20">
                                <TableCell className="py-2 font-bold text-white font-sans">{p.name}</TableCell>
                                <TableCell className="py-2 font-mono text-slate-300">{p.qty} unités</TableCell>
                                <TableCell className="py-2 text-slate-400 font-mono text-[11px]">{p.shelf}</TableCell>
                                <TableCell className="py-2">
                                  <Badge className={cn(
                                    "text-[8px] uppercase font-mono py-0.5",
                                    p.isAvailable ? "bg-emerald-950 text-emerald-400" : "bg-red-955 text-white animate-pulse"
                                  )}>
                                    {p.isAvailable ? "Dispo immédiat ✓" : "Rupture Atelier ✗"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                            {currentMachineAppData.magasin.piecesDisponibles.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4 text-slate-500 italic">
                                  Aucun kit de pièce critique spécifique rattaché à cet engin ce jour.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Part checkout history related to BT */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider font-mono">
                        HISTORIQUE DU SORTIE DE PIÈCES MAGASIN EN LIEN AVEC LES BT
                      </span>
                      <div className="border border-slate-855 rounded-lg overflow-hidden bg-slate-950/20 text-[11px]">
                        <Table className="text-xs">
                          <TableHeader className="bg-slate-950">
                            <TableRow className="border-b border-slate-850">
                              <TableHead className="py-2 text-slate-400 text-[10px]">Date Sortie</TableHead>
                              <TableHead className="py-2 text-slate-400 text-[10px]">Nom de la Pièce & Quantité</TableHead>
                              <TableHead className="py-2 text-slate-400 text-[10px]">Bon de Travail lié</TableHead>
                              <TableHead className="py-2 text-slate-400 text-[10px]">Opérateur de Magasin</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentMachineAppData.magasin.historiqueSortiesBT.map((hist, index) => (
                              <TableRow key={index} className="border-b border-slate-900/50">
                                <TableCell className="py-1.5 font-mono text-slate-400">{hist.date}</TableCell>
                                <TableCell className="py-1.5 text-white font-medium">{hist.qty}</TableCell>
                                <TableCell className="py-1.5 font-mono font-bold text-amber-500">{hist.bt}</TableCell>
                                <TableCell className="py-1.5 text-slate-450 italic">Magasinier Central</TableCell>
                              </TableRow>
                            ))}
                            {currentMachineAppData.magasin.historiqueSortiesBT.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4 text-slate-500 italic">
                                  Aucun historique de retrait de pièce scellé pour cet engin dans le relai récent.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <p className="text-[9.5px] text-slate-500 leading-tight italic">
                      ℹ️ Synchronisé en continu avec le logiciel <b>Hydromines WMS Magasin</b>. Les réservations faites sur les BT bloquent automatiquement le stock en magasin pour éviter les vols de priorité.
                    </p>
                  </div>
                )}

                {/* ==================================================================== */}
                {/* SUB-TAB 4 : EXPOSITION RISQUES ET PROTOCOLES LOTO SÉCURITÉ (Objective 4) */}
                {/* ==================================================================== */}
                {hubSubTab === "securite" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2.5 bg-emerald-955/15 border border-emerald-900/20 rounded text-xs gap-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-455" />
                        <span className="text-emerald-400 font-black uppercase tracking-wider">
                          Sécurité d'Exploitation & Protocoles LOTO (Liaison API Sécurité)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono italic">Flux hydromines-safety v1.8</span>
                    </div>

                    {/* Lockout Tagout (LOTO) active state container */}
                    <div className={cn(
                      "p-3 rounded-lg border text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3",
                      currentMachineAppData.securite.statutLOTO === "ACTIF" 
                        ? "bg-red-950/20 border-red-800" 
                        : "bg-emerald-950/15 border-emerald-900/40"
                    )}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "h-2 w-2 rounded-full",
                            currentMachineAppData.securite.statutLOTO === "ACTIF" ? "bg-red-550 animate-ping" : "bg-emerald-500"
                          )} />
                          <span className="text-[10px] uppercase font-mono font-bold text-slate-450 block">CONSIGNE DE CADENASSAGE MACHINE (LOTO) :</span>
                        </div>
                        <p className="font-serif text-[11px] text-white">
                          {currentMachineAppData.securite.statutLOTO === "ACTIF" 
                            ? currentMachineAppData.securite.lotoDetails 
                            : "🔓 Aucun cadenassage réglementaire (LOTO) n'est actif sur cet engin. L'alimentation générale est libre."}
                        </p>
                      </div>

                      <Badge className={cn(
                        "text-[9px] uppercase font-black px-2 py-1 tracking-wider whitespace-nowrap self-end md:self-auto",
                        currentMachineAppData.securite.statutLOTO === "ACTIF" ? "bg-red-950 text-red-400" : "bg-emerald-900 text-emerald-400"
                      )}>
                        {currentMachineAppData.securite.statutLOTO === "ACTIF" ? "🔒 CADENASSÉ (ALERT)" : "🔓 NON ASSUJETTI CARTER"}
                      </Badge>
                    </div>

                    {/* Operational restrictions and guidelines */}
                    <Card className="bg-slate-950 border-slate-855 text-xs text-slate-205">
                      <CardHeader className="p-2.5 border-b border-slate-855/50 bg-slate-900/20">
                        <CardTitle className="text-[10.5px] font-bold uppercase text-white tracking-widest flex items-center gap-1.5">
                          ⚠️ RESTRICTIONS D'EXPLOITATION EN FORCE SOUS-CHAMBRE
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 bg-slate-950/40">
                        <p className="text-[11px] font-sans text-slate-300 leading-relaxed italic">
                          “ {currentMachineAppData.securite.restrictions} ”
                        </p>
                      </CardContent>
                    </Card>

                    {/* HSE anomalies */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider font-mono">
                        ANOMALIES HYGIÈNE ET SÉCURITÉ (HSE) ENCOUTS ET SIGNALÉES
                      </span>
                      <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950/30">
                        <Table className="text-xs">
                          <TableHeader className="bg-slate-950 font-mono">
                            <TableRow className="border-b border-slate-850">
                              <TableHead className="py-2">Code HSE</TableHead>
                              <TableHead className="py-2">Description de l'anomalie constatée</TableHead>
                              <TableHead className="py-2">Niveau de risque</TableHead>
                              <TableHead className="py-2 text-right">Statut</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentMachineAppData.securite.anomaliesHseOuvertes.map((anom) => (
                              <TableRow key={anom.id} className="border-b border-slate-900/50 hover:bg-slate-900/20">
                                <TableCell className="py-1.5 font-bold font-mono text-red-400">{anom.id}</TableCell>
                                <TableCell className="py-1.5 text-white font-serif">{anom.desc}</TableCell>
                                <TableCell className="py-1.5 text-slate-400">Mineur (HSE Standard)</TableCell>
                                <TableCell className="py-1.5 text-right">
                                  <Badge className="bg-slate-850 text-red-400 text-[8px] uppercase">OUVERT</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                            {currentMachineAppData.securite.anomaliesHseOuvertes.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-4 text-slate-500 italic">
                                  Aucune anomalie HSE suspendue ou signalée sur cet engin.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Safety incident reports history */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider font-mono">
                        HISTORIQUE DES INCIDENTS SÉCURITÉ DEPUIS L'ORGANIGRAMME DU PORTAIL HSE
                      </span>
                      <div className="border border-slate-850 rounded-lg overflow-hidden bg-slate-950/30">
                        <Table className="text-xs">
                          <TableHeader className="bg-slate-950">
                            <TableRow className="border-b border-slate-850">
                              <TableHead className="py-2 text-slate-450">Date Incident</TableHead>
                              <TableHead className="py-2 text-slate-450">Descriptif du Rapport Opérationnel</TableHead>
                              <TableHead className="py-2 text-slate-450 text-right">Amorçage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentMachineAppData.securite.incidents.map((inc, i) => (
                              <TableRow key={i} className="border-b border-slate-900/50">
                                <TableCell className="py-1.5 font-mono text-slate-350">{inc.date}</TableCell>
                                <TableCell className="py-1.5 text-white font-medium">{inc.desc}</TableCell>
                                <TableCell className="py-1.5 text-right font-mono text-amber-500 text-[10px]">Rapport Scellé 🔒</TableCell>
                              </TableRow>
                            ))}
                            {currentMachineAppData.securite.incidents.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-4 text-slate-500 italic animate-pulse">
                                  Aucun accident corporel ou matériel scellé pour cet engin dans la galerie.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <p className="text-[9.5px] text-slate-500 leading-tight italic">
                      ℹ️ Ces informations d'incidentologie proviennent du registre central <b>Hydromines Sécurité Souterraine</b>.
                    </p>
                  </div>
                )}

                {/* ==================================================================== */}
                {/* SUB-TAB 5 : CHRONOLOGICAL MACHINE HISTORY TIMELINE (Goal 2) */}
                {/* ==================================================================== */}
                {hubSubTab === "timeline" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2.5 bg-purple-955/10 border border-purple-900/20 rounded text-xs gap-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <span className="text-purple-400 font-black uppercase tracking-wider">
                          Registre Chronologique & Historique Machine ({selectedMachine.code})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono italic">Audit de Traçabilité Fond</span>
                    </div>

                    {/* Safety Diagnostics Card: Reopening count and recurrent risk check (Goal 2 & 3) */}
                    {(() => {
                      // Calculate reopening frequency in the last 30 days (simulation epoch is May 2026)
                      const referenceDate = new Date("2026-05-21");
                      const thirtyDaysAgo = new Date("2026-04-21").getTime();

                      const recentDowntimes = selectedMachine.downtimes.filter(d => {
                        const dtTime = d.startHour ? new Date(d.startHour.replace(" ", "T")).getTime() : 0;
                        return dtTime >= thirtyDaysAgo;
                      });

                      const recentBTs = workOrders.filter(wo => {
                        if (wo.machineCode !== selectedMachine.code) return false;
                        // Guess date from actionsHistory or default to 2026-05
                        const actionDateStr = wo.actionsHistory[0]?.timestamp || "2026-05-20";
                        const actionTime = new Date(actionDateStr.replace(" ", "T")).getTime();
                        return actionTime >= thirtyDaysAgo;
                      });

                      const totalReopenCount = recentDowntimes.length + recentBTs.length;
                      const hasRecRisk = totalReopenCount >= 3;

                      return (
                        <div className={cn(
                          "p-3 rounded-lg border text-xs grid grid-cols-1 md:grid-cols-3 gap-3 font-sans leading-normal",
                          hasRecRisk 
                            ? "bg-red-950/20 border-red-800 text-red-100" 
                            : "bg-slate-950/40 border-slate-800 text-slate-300"
                        )}>
                          <div className="md:col-span-2 space-y-1">
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Diagnostic de Récidive d'Organes (30 jours glissants) :</span>
                            <p className="font-medium text-white">
                              {hasRecRisk 
                                ? `⚠️ RISQUE RECURRENT DETECTE ! L'engin a fait l'objet de ${totalReopenCount} déclarations d'arrêt ou d'émissions de BT en moins de 30 jours.`
                                : `✅ Cycle d'usure nominal. Seulement ${totalReopenCount} événement(s) de maintenance enregistrés au cours des 30 derniers jours.`}
                            </p>
                            <p className="text-[10px] text-slate-400 leading-normal">
                              L'analyse séquentielle compare les durées d'immobilisations successives pour déceler une insuffisance de diagnostic ou une pièce de rechange contrefaite / défectueuse.
                            </p>
                          </div>
                          
                          <div className="flex flex-col justify-center items-center p-2 rounded bg-slate-950 font-mono border border-slate-900/55 self-stretch">
                            <span className="text-[8px] text-slate-400 block uppercase">Frequence d'Ouverture</span>
                            <span className="text-2xl font-black text-purple-400 block">{totalReopenCount} x</span>
                            <Badge className={cn("text-[8px] mt-1 uppercase font-bold", hasRecRisk ? "bg-red-950 text-red-400" : "bg-emerald-950 text-emerald-450")}>
                              {hasRecRisk ? "⚠️ Alerte Recidive" : "Stabilité nominale"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Timeline Controls: Filters and Sorting */}
                    <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center bg-slate-950/40 p-2 border border-slate-855 rounded-lg text-xs">
                      {/* Filter group */}
                      <div className="flex flex-wrap gap-1">
                        {["TOUS", "PANNES", "BONS DE TRAVAIL", "PIECES"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setTimelineFilter(f)}
                            className={cn(
                              "px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase rounded transition-all",
                              timelineFilter === f 
                                ? "bg-purple-800 text-white" 
                                : "bg-slate-900 text-slate-400 hover:text-slate-200"
                            )}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      {/* Sorting toggle and Export Button (Goal 7 & 8) */}
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setTimelineSortAsc(prev => !prev)}
                          className="h-7 text-[10px] font-mono text-slate-350 hover:bg-slate-900"
                        >
                          🕒 Tri : {timelineSortAsc ? "Ascendant (Anciens)" : "Descendant (Récents)"}
                        </Button>

                        {/* Export Timeline (Goal 7) */}
                        <Button
                          size="xs"
                          onClick={() => {
                            // Extract raw text representing history
                            const header = `=== HYDROMINES GMAO EXPORT_HISTORIQUE MACHINE: ${selectedMachine.code} ===\n`;
                            const generatedText = machines
                              .find(m => m.code === selectedMachine.code)
                              ?.downtimes.map(d => `[PANNE] Date: ${d.startHour} | Organe: ${d.category} | Durée: ${d.durationMinutes || 60}m | Motif: ${d.reason}`)
                              .join("\n") || "";
                            
                            const blob = new Blob([header + generatedText], { type: "text/plain;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute("download", `GMAO_Export_Historique_${selectedMachine.code}.txt`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast.success("📝 Historique de l'engin exporté avec succès en format TXT !");
                          }}
                          className="h-7 text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-100 font-mono"
                        >
                          📟 EXPORTER TXT
                        </Button>
                      </div>
                    </div>

                    {/* Timeline Chronicle Feed Content (Goal 2 & 6 Context) */}
                    {(() => {
                      interface TimelineItem {
                        id: string;
                        type: "PANNE" | "BT" | "PIECE";
                        date: string;
                        title: string;
                        category?: string;
                        severity?: string;
                        status?: string;
                        tech?: string;
                        qty?: number;
                        cost?: number;
                        user?: string;
                        rawObj: any;
                      }

                      const list: TimelineItem[] = [];

                      // Add downtimes
                      selectedMachine.downtimes.forEach(d => {
                        list.push({
                          id: d.id,
                          type: "PANNE",
                          date: d.startHour,
                          title: d.reason || "Arrêt déclaré",
                          category: d.category,
                          severity: d.severity,
                          status: d.endHour ? "RÉSOLU" : "ACTIF EN COURS",
                          tech: d.remedyAction ? "Technique Fond" : undefined,
                          rawObj: d
                        });
                      });

                      // Add Work Orders (BTs)
                      workOrders
                        .filter(wo => wo.machineCode === selectedMachine.code)
                        .forEach(wo => {
                          const actionTimestamp = wo.actionsHistory[0]?.timestamp || "2026-05-20 08:30";
                          list.push({
                            id: wo.id,
                            type: "BT",
                            date: actionTimestamp,
                            title: wo.title,
                            category: wo.category,
                            severity: wo.severity,
                            status: wo.status,
                            tech: wo.assignedTech,
                            rawObj: wo
                          });

                          // Add pieces inside those BTs
                          wo.replacedParts.forEach((p, idx) => {
                            list.push({
                              id: `${wo.id}-part-${idx}`,
                              type: "PIECE",
                              date: actionTimestamp, // Inherit BT timestamp for ordering
                              title: `Pièce posée : ${p.name}`,
                              qty: p.qty,
                              cost: p.costUSD,
                              user: wo.assignedTech,
                              rawObj: p
                            });
                          });
                        });

                      // Filter
                      const filteredList = list.filter(item => {
                        if (timelineFilter === "TOUS") return true;
                        if (timelineFilter === "PANNES") return item.type === "PANNE";
                        if (timelineFilter === "BONS DE TRAVAIL") return item.type === "BT";
                        if (timelineFilter === "PIECES") return item.type === "PIECE";
                        return true;
                      });

                      // Sort
                      filteredList.sort((a, b) => {
                        const timeA = new Date(a.date.replace(" ", "T")).getTime();
                        const timeB = new Date(b.date.replace(" ", "T")).getTime();
                        return timelineSortAsc ? timeA - timeB : timeB - timeA;
                      });

                      return (
                        <div className="relative border-l border-slate-800 ml-4 pl-4 space-y-4 pt-1 pb-2">
                          {filteredList.map((item, index) => (
                            <div key={item.id} className="relative space-y-1.5 font-sans">
                              {/* Colored dot representation */}
                              <span className={cn(
                                "absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-slate-900",
                                item.type === "PANNE" && "bg-red-500",
                                item.type === "BT" && "bg-sky-500",
                                item.type === "PIECE" && "bg-amber-500"
                              )} />

                              {/* Header element with date and event label */}
                              <div className="flex flex-wrap items-center gap-2 justify-between">
                                <span className="text-[10px] font-mono text-slate-450">{item.date}</span>
                                <Badge className={cn(
                                  "text-[8px] px-1 py-0 rounded uppercase font-bold",
                                  item.type === "PANNE" && "bg-red-950 text-red-400 border border-red-900/40",
                                  item.type === "BT" && "bg-sky-950 text-sky-400 border border-sky-900/40",
                                  item.type === "PIECE" && "bg-amber-950 text-amber-500 border border-amber-900/40"
                                )}>
                                  {item.type} : {item.id}
                                </Badge>
                              </div>

                              {/* Title description and body container */}
                              <div className="p-2.5 rounded bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition-all font-mono text-[11px] text-slate-200">
                                <div className="font-sans font-bold text-white text-[12px] leading-tight mb-1">
                                  {item.title}
                                </div>

                                {item.type === "PANNE" && (
                                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                                    <span>Organe : <b>{item.category}</b></span>
                                    <span>Gravité : <b className="text-red-400">{item.severity}</b></span>
                                    <span>Résolution : <b className="text-emerald-450">{item.status}</b></span>
                                  </div>
                                )}

                                {item.type === "BT" && (
                                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
                                    <span>Spécialité : <b>{item.category}</b></span>
                                    <span>Technicien : <b className="text-sky-450">{item.tech}</b></span>
                                    <span>Statut BT : <b className="text-white bg-slate-850 px-1 py-0.2 rounded">{item.status}</b></span>
                                  </div>
                                )}

                                {item.type === "PIECE" && (
                                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-450 font-mono">
                                    <span>Quantité : <b className="text-white">{item.qty} u</b></span>
                                    <span>Coût unitaire : <b className="text-amber-500">${item.cost} USD</b></span>
                                    <span>Commanditaire : <b className="text-slate-350">{item.user || "Inconnu"}</b></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {filteredList.length === 0 && (
                            <div className="text-center py-6 text-slate-500 italic">
                              Aucun événement ne correspond aux filtres de traçabilité actifs.
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. TAB COORDINATION: RÉUNION MAINTENANCE DÉBUT DE POSTE (Module 1) */}
      {/* ==================================================================== */}
      {activeTab === "coordination" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-900 border border-slate-800 rounded-lg gap-2">
            <div>
              <h2 className="text-sm font-black text-white uppercase flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                RÉUNION COORDONNÉE DE DÉBUT DE POSTE (PRE-START BRIEFING)
              </h2>
              <p className="text-[11px] text-slate-400">
                Pilotage des priorités de maintenance au fond pour le relais en cours • Heure d'exploitation UTC: {new Date().toISOString().substring(11,16)}
              </p>
            </div>
            
            {preshiftSigned ? (
              <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-550 p-1.5 rounded text-xs">
                <span className="text-emerald-400 font-bold font-mono">✅ VALIDATION CONCORDANCE EFFECTUÉE ({preshiftSigner})</span>
                <Button size="xs" variant="destructive" onClick={handleResetPreshift} className="h-5 text-[9px] px-1.5 py-0 font-bold bg-red-950 hover:bg-red-900">
                  Réinitialiser
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-900/60 p-1.5 rounded text-xs">
                <span className="text-amber-500 font-bold">⚠️ ATTENTE DU VISA CHEF MAINTENANCE</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Column 1: Critiques & Urgences */}
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader className="p-3 border-b border-slate-850">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center justify-between">
                    <span>LISTE DES ENGINS CRITIQUES (IMMOBILISÉS)</span>
                    <Badge className="bg-red-950 text-red-400 text-[9px] font-mono">
                      {machines.filter(m => m.status !== "DISPONIBLE").length} En panne
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {machines.filter(m => m.status !== "DISPONIBLE").map((m, idx) => {
                    const activeDt = m.downtimes.find(d => d.id === m.activeDowntimeId);
                    return (
                      <div key={m.code} className="p-2.5 bg-slate-950 border border-slate-850 rounded hover:border-slate-700 transition">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-extrabold text-white text-xs">{m.code} • <span className="text-slate-400 text-[10px] italic">{m.type}</span></span>
                          <Badge className="bg-red-950 text-red-500 text-[8px] uppercase">{m.status}</Badge>
                        </div>
                        <p className="text-[10px] text-slate-300 italic mb-1">“ {activeDt?.reason || "Avis de panne brutale"} ”</p>
                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                          <span>Catégorie: {activeDt?.category || "HYDRAULIQUE"}</span>
                          <span className="text-amber-500">Gravité: {activeDt?.severity || "Majeur"}</span>
                        </div>
                      </div>
                    );
                  })}
                  {machines.filter(m => m.status !== "DISPONIBLE").length === 0 && (
                    <div className="text-center py-6 text-slate-400 italic text-[11px]">
                      Aucun engin immobilisé. Flotte entièrement disponible. ✅
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader className="p-3 border-b border-slate-850">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center justify-between">
                    <span>INTERVENTIONS URGENTES (BONS DE TRAVAIL)</span>
                    <span className="font-mono text-[9px] text-slate-400">Urgences actives</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {workOrders.filter(wo => wo.severity === "critique" && wo.status !== "CLOS").map((wo) => (
                    <div key={wo.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded hover:border-slate-800 transition">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[10px] text-slate-300 font-mono">{wo.id} • {wo.machineCode}</span>
                        <Badge className="bg-amber-950 text-amber-500 text-[8px] uppercase font-mono">{wo.status}</Badge>
                      </div>
                      <p className="text-[11px] text-white font-serif line-clamp-1">{wo.title}</p>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-1">
                        <span>Technicien: {wo.assignedTech}</span>
                        <span className="text-emerald-400">Progression: {Math.round((wo.checklist.filter(c => c.done).length / wo.checklist.length) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                  {workOrders.filter(wo => wo.severity === "critique" && wo.status !== "CLOS").length === 0 && (
                    <div className="text-center py-6 text-slate-400 italic text-[11px]">
                      Aucun bon de travail urgent critique en cours d'intervention.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Travaux Reportés & Planification */}
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader className="p-3 border-b border-slate-850">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-200">
                    TRAVAUX REPORTÉS (GESTION ROUTINE CHANTIER)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {deferredTasks.map((t, index) => (
                      <div key={t.id} className="p-2 bg-slate-950 border border-slate-905 rounded text-[11px] space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-500 font-mono">ID: {t.id}</span>
                          <span className="text-[9px] text-slate-500">Inscrit: {t.originDate}</span>
                        </div>
                        <p className="text-white leading-tight font-serif">{t.task}</p>
                        <div className="flex justify-between items-center pt-1 text-[10px]">
                          <span className="text-blue-400">Motif: {t.comment}</span>
                          <Badge className="bg-slate-900 text-white text-[8px]">{t.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Deferred Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const taskInp = form.elements.namedItem("taskText") as HTMLInputElement;
                    const commInp = form.elements.namedItem("taskReason") as HTMLInputElement;
                    if (!taskInp.value.trim()) {
                      toast.error("Veuillez renseigner le libellé de l'intervention reportée !");
                      return;
                    }
                    const newTask = {
                      id: "def-" + (deferredTasks.length + 1),
                      task: taskInp.value,
                      originDate: new Date().toISOString().substring(0, 10),
                      status: "Reporté",
                      comment: commInp.value || "Décision de coordination"
                    };
                    setDeferredTasks(prev => [...prev, newTask]);
                    toast.success("Succès: Travail reporté inscrit au backlog de pre-shift !");
                    form.reset();
                  }} className="pt-2 border-t border-slate-850 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Inscrire un nouveau report de tâche :</span>
                    <Input name="taskText" placeholder="Ex: Souder plaque d'usure godet LH410" className="h-8 text-[11px] bg-slate-950 border-slate-800" />
                    <Input name="taskReason" placeholder="Motif (ex: Attente pièces, Atelier plein)" className="h-8 text-[11px] bg-slate-950 border-slate-800" />
                    <Button type="submit" size="xs" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold h-7">
                      Enregistrer le Report Opérationnel
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Atelier Capacite Aperçu */}
              <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader className="p-3 border-b border-slate-850">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-200">
                    DISPONIBILITÉ ATELIER AU FOND
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-center font-mono text-[10px]">
                    <div className="p-2 bg-slate-950 border border-slate-850 rounded">
                      <span className="text-slate-400 block">BAIES LIBRES</span>
                      <span className="text-lg font-bold text-emerald-400">{workshopBays.filter(b => b.status === "LIBRE").length} / 4</span>
                    </div>
                    <div className="p-2 bg-slate-950 border border-slate-850 rounded">
                      <span className="text-slate-400 block">MÉCANICIENS</span>
                      <span className="text-lg font-bold text-amber-500">
                        {mechanicsList.filter(m => m.status === "ACTIF").length} Actifs / {mechanicsList.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-slate-950 border border-slate-850 rounded text-[9.5px]">
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Saturation de la Base Technique</span>
                      <span>{Math.round((workshopBays.filter(b => b.status === "OCCUPÉ").length / 4) * 100)}%</span>
                    </div>
                    <Progress value={Math.round((workshopBays.filter(b => b.status === "OCCUPÉ").length / 4) * 100)} className="h-1.5 bg-slate-800 [&>div]:bg-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column 3: Validation Chef Maintenance */}
            <div className="space-y-4">
              <Card className="bg-slate-950 border-2 border-slate-800 text-slate-100">
                <CardHeader className="p-4 border-b border-slate-850 bg-slate-900/60">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                    SIGNATURE DU PROGRAMME PAR LE CHEF DE DEPT
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {preshiftSigned ? (
                    <div className="text-center py-4 space-y-3">
                      <div className="mx-auto h-12 w-12 rounded-full bg-emerald-950/80 border border-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">APPROUVÉ & VERROUILLÉ</span>
                        <p className="text-[11px] text-slate-300 italic">“ {preshiftValidationNote} ”</p>
                      </div>
                      <div className="border border-emerald-900/40 p-2 rounded bg-emerald-950/20 text-[10px] font-mono list-none space-y-0.5 text-left">
                        <li>• Signé par: <span className="text-white font-bold">{preshiftSigner}</span></li>
                        <li>• Heure de signature: 2026-05-20 (Poste {handoverShift})</li>
                        <li>• Certificat de conformité GMAO: #CONC-90412</li>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-tight">
                        La signature verrouille l'attribution des BT prioritaires et de la capacité d'atelier pour garantir le plan de production minière.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div className="p-2.5 bg-amber-950/20 border border-amber-900/40 rounded text-[11px] text-amber-400 leading-relaxed font-serif">
                        “ Pour valider électroniquement cette journée et déployer l'allocation de l'équipe de maintenance, le Chef de Maintenance ou le Chef d'Atelier doit examiner la liste des priorités ci-contre de pre-shift et apposer son Visa. ”
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Instructions / Orientations de commandement :</label>
                        <textarea
                          value={preshiftValidationNote}
                          onChange={(e) => {
                            setPreshiftValidationNote(e.target.value);
                            localStorage.setItem("sg_preshift_note", e.target.value);
                          }}
                          className="w-full text-[11px] bg-slate-900 border border-slate-800 rounded p-2 text-white h-20 focus:outline-none focus:border-slate-600 font-sans"
                          placeholder="Saisir les consignes spécifiques pour le poste (ex: Focus sur ST7-02, vigilance ventilation volets)..."
                        />
                      </div>

                      <div className="space-y-2 pb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Qualité d'autorité signataire :</label>
                        <Input disabled value={activeRole} className="h-8 text-[11px] bg-slate-900 border-slate-800 text-slate-300" />
                        <p className="text-[9px] text-slate-550 italic font-mono">Modifiez votre rôle dans le sélecteur d'identité général en haut à droite si nécessaire.</p>
                      </div>

                      <Button
                        onClick={handleSignPreshift}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black tracking-wider uppercase text-[11px] py-4 rounded-xl"
                      >
                        ✍️ APPOSER LA SIGNATURE ÉLECTRONIQUE
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. TAB BACKLOG: GESTION DU BACKLOG MAINTENANCE (Module 2) */}
      {/* ==================================================================== */}
      {activeTab === "backlog" && (
        <div className="space-y-4">
          
          {/* Metrics summary list */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase">BACKLOG DE BONS DE TRAVAIL</span>
              <span className="text-2xl font-black text-cyan-400 block">{workOrders.filter(w => w.status !== "CLOS").length} BTs</span>
              <p className="text-[9px] text-slate-500">Toutes sévérités cumulées au fond</p>
            </div>
            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase">RETARD DÉPASSEMENT (&gt;24H)</span>
              <span className="text-2xl font-black text-red-500 block">
                {workOrders.filter(w => {
                  const days = Math.round((Date.now() - new Date(w.creationDate).getTime()) / (1000 * 60 * 60 * 24));
                  return w.status !== "CLOS" && days > 1;
                }).length} Interventions
              </span>
              <p className="text-[9px] text-slate-500">Tickets ouverts depuis plus de 24h</p>
            </div>
            <div className="p-2.5 bg-slate-900 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[9px] block uppercase">TICKETS TRÈS ANCIENS CRITIQUES</span>
              <span className="text-xl font-bold text-amber-500 block">
                {workOrders.filter(w => w.severity === "critique" && w.status === "OUVERT").length} Alertes Rouges
              </span>
              <p className="text-[9px] text-amber-400/80">Action d'urgence immédiate requise</p>
            </div>
            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase">RATIO RESOLUTION</span>
              <span className="text-2xl font-black text-emerald-400 block">
                {Math.round((workOrders.filter(w => w.status === "CLOS" || w.status === "RÉSOLU").length / workOrders.length) * 100)}%
              </span>
              <p className="text-[9px] text-slate-500">Taux de fermeture historique</p>
            </div>
          </div>

          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="p-3 border-b border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-xs font-black uppercase text-white tracking-widest">
                  REGISTRE COMPLET DU BACKLOG DE BONS DE TRAVAIL (ORDRES DE REPARATION)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Suivi des délais, sévérité, et relance des anomalies signalées par les opérateurs de galerie.
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Button size="xs" onClick={() => {
                  // Simulate an old work order simulation for testing or realism
                  const fakeOldBT: WorkOrderBT = {
                    id: "BT-2026-0" + (workOrders.length + 101),
                    machineCode: "DUMP-04",
                    title: "[ALERTE ANCIENNÈTÉ] Remplacement filtre transmission hydraulique saturé",
                    category: "HYDRAULIQUE",
                    severity: "majeur",
                    status: "OUVERT",
                    assignedTech: "Y. Benjelloun",
                    creationDate: "2026-05-14", // 6 days old!
                    siteId: "SMI",
                    checklist: [
                      { task: "Consignation LOTO vanne principale hydraulique", done: false },
                      { task: "Nettoyer boîtier de transmission", done: false }
                    ],
                    actionsHistory: [{ timestamp: "2026-05-14 10:00", role: "OPÉRATEUR", action: "Avis initial", user: "Karim" }],
                    replacedParts: []
                  };
                  setWorkOrders(prev => [fakeOldBT, ...prev]);
                  toast.warning("Simulateur: Bon de travail ancien injecté au backlog pour démonstration d'alerte !");
                }} className="bg-slate-800 hover:bg-slate-705 text-slate-200 text-[10px] h-7 font-mono font-bold">
                  ⚠️ Injecter BT Ancien (&gt;2j)
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <Table className="text-xs">
                <TableHeader className="bg-slate-950 font-mono">
                  <TableRow className="border-b border-slate-850">
                    <TableHead>N° Billet</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Titre de l'Anomalie</TableHead>
                    <TableHead>Sévérité</TableHead>
                    <TableHead>Crée le</TableHead>
                    <TableHead>Âge du ticket</TableHead>
                    <TableHead>Statut Actuel</TableHead>
                    <TableHead>Alerte Ancienneté</TableHead>
                    <TableHead className="text-right">Ajustements</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBT.map((wo) => {
                    const elapsedDays = Math.round((Date.now() - new Date(wo.creationDate).getTime()) / (1000 * 60 * 60 * 24));
                    const isOld = elapsedDays >= 2 && wo.status !== "CLOS" && wo.status !== "RÉSOLU";
                    return (
                      <TableRow key={wo.id} className={cn(
                        "border-b border-slate-900/60 hover:bg-slate-900/20",
                        isOld ? "bg-red-950/20 border-l-2 border-l-red-500" : ""
                      )}>
                        <TableCell className="font-mono font-bold text-slate-300 py-3.5 px-3.5">{wo.id}</TableCell>
                        <TableCell className="font-extrabold text-white py-3.5 px-3.5">{wo.machineCode}</TableCell>
                        <TableCell className="font-serif text-slate-100 font-medium py-3.5 px-3.5">
                          {wo.title}
                        </TableCell>
                        <TableCell className="py-3.5 px-3.5">
                          <Badge className={cn(
                            "text-[8px] uppercase",
                            wo.severity === "critique" ? "bg-red-950 text-red-400" : "bg-slate-800 text-slate-300"
                          )}>
                            {wo.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-slate-400 text-[10px] py-3.5 px-3.5">{wo.creationDate}</TableCell>
                        <TableCell className="font-mono text-[11px] py-3.5 px-3.5">
                          {elapsedDays === 0 ? "Aujourd'hui" : `${elapsedDays} jours`}
                        </TableCell>
                        <TableCell className="py-3.5 px-3.5">
                          <span className={cn(
                            "text-[10px] font-bold font-mono px-1 py-0.5 rounded",
                            wo.status === "OUVERT" ? "text-red-400 bg-red-950/40" : 
                            wo.status === "EN_COURS" ? "text-amber-400 bg-amber-950/40" : 
                            "text-emerald-400 bg-emerald-950/40"
                          )}>
                            {wo.status}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 px-3.5">
                          {isOld ? (
                            <Badge className="bg-red-655 text-white animate-pulse text-[8px] font-black tracking-widest">
                              CRITIQUE RETARD EXTRÊME 🚨
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-slate-500">Dans les temps</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-3.5 px-3.5">
                          {wo.status !== "CLOS" && wo.status !== "RÉSOLU" && (
                            <div className="flex items-center justify-end gap-2.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  verifyAndExecute("start_bt", () => {
                                    setWorkOrders(prev => prev.map(w => {
                                      if (w.id === wo.id) {
                                        return { ...w, status: "EN_COURS" };
                                      }
                                      return w;
                                    }));
                                    setMachines(prev => prev.map(m => {
                                      if (m.code === wo.machineCode) {
                                        return { ...m, status: "EN MAINTENANCE" as const };
                                      }
                                      return m;
                                    }));
                                    toast.info(`Ticket ${wo.id} basculé EN COURS.`);
                                    addAuditLog(`Démarrage intervention sur BT ${wo.id} (${wo.machineCode})`, "MAINTENANCE");
                                  }, "Démarrer un Bon de Travail");
                                }}
                                className="h-11 text-[11px] px-3 font-bold border-slate-700 text-slate-300 hover:bg-slate-800"
                              >
                                Démarrer
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  verifyAndExecute("resolve_bt", () => {
                                    setWorkOrders(prev => prev.map(w => {
                                      if (w.id === wo.id) {
                                        return { ...w, status: "RÉSOLU" };
                                      }
                                      return w;
                                    }));
                                    setMachines(prev => prev.map(m => {
                                      if (m.code === wo.machineCode) {
                                        return {
                                          ...m,
                                          status: "DISPONIBLE" as const,
                                          activeDowntimeId: undefined,
                                          downtimes: m.downtimes.map(d => {
                                            if (d.id === m.activeDowntimeId || !d.endHour) {
                                              return {
                                                ...d,
                                                endHour: new Date().toISOString().replace("T", " ").substring(0, 16),
                                                durationMinutes: d.startHour ? Math.max(30, Math.round((Date.now() - new Date(d.startHour).getTime()) / (1000 * 60))) : 45,
                                                remedyAction: "Résolution validée par Mécanicien",
                                                isAwaitingParts: false,
                                                isAwaitingMechanic: false,
                                                isAwaitingProduction: false
                                              };
                                            }
                                            return d;
                                          })
                                        };
                                      }
                                      return m;
                                    }));
                                    toast.success(`Succès: Anomalie ${wo.id} résolue avec succès !`);
                                    addAuditLog(`Résolution validée pour BT ${wo.id} (${wo.machineCode})`, "MAINTENANCE");
                                  }, "Résoudre un Bon de Travail");
                                }}
                                className="h-11 text-[11px] px-3 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black"
                              >
                                Résoudre ✅
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Table of immobilized machines */}
          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="p-3 border-b border-slate-850">
              <CardTitle className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-500" />
                REGISTRE DE SÉCURITÉ DES ENGINS ACCIDENTÉS OU IMMOBILISÉS AU FOND de TAILLE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <Table className="text-xs">
                <TableHeader className="bg-slate-950 font-mono">
                  <TableRow className="border-b border-slate-850">
                    <TableHead>Code d'Engin</TableHead>
                    <TableHead>Type & Modèle</TableHead>
                    <TableHead>Heure d'Arrêt</TableHead>
                    <TableHead>Cause Spécifique</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Gravité</TableHead>
                    <TableHead>Attentes d'Atelier</TableHead>
                    <TableHead>Technicien Assigné</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machines.filter(m => m.status !== "DISPONIBLE").map((m, i) => {
                    const activeDt = m.downtimes.find(d => d.id === m.activeDowntimeId);
                    return (
                      <TableRow key={i} className="border-b border-slate-900/60 hover:bg-slate-900/20">
                        <TableCell className="font-extrabold text-white">{m.code}</TableCell>
                        <TableCell className="text-slate-300">{m.type} ({m.model})</TableCell>
                        <TableCell className="font-mono text-[11px] text-amber-500">{activeDt?.startHour || "Date inconnue"}</TableCell>
                        <TableCell className="text-[11px] text-slate-200 italic font-serif">“ {activeDt?.reason || "Arrêt non catégorisé"} ”</TableCell>
                        <TableCell>
                          <Badge className="bg-slate-850 text-slate-300 text-[9px]">{activeDt?.category || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[8px] uppercase",
                            activeDt?.severity === "critique" ? "bg-red-950 text-red-400" : "bg-amber-950 text-amber-500"
                          )}>
                            {activeDt?.severity || "majeur"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-[10px] text-slate-400">
                          {activeDt?.isAwaitingParts && "📦 Pièces "}
                          {activeDt?.isAwaitingMechanic && "🔧 Mécanicien "}
                          {activeDt?.isAwaitingProduction && "⚙️ Prod "}
                          {!activeDt?.isAwaitingParts && !activeDt?.isAwaitingMechanic && !activeDt?.isAwaitingProduction && "Traitement en cours"}
                        </TableCell>
                        <TableCell className="font-bold text-slate-100">{activeDt?.assignedMechanic || "À attribuer"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. TAB CALENDRIER: PLAN PREVENTIF RÉEL DE LA FLOTTE (Module 3) */}
      {/* ==================================================================== */}
      {activeTab === "calendrier" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-900 border border-slate-800 rounded-lg gap-2">
            <div>
              <h2 className="text-sm font-black text-white uppercase flex items-center gap-1">
                📅 CALENDRIER INTERACTIF DE PLANIFICATION PRÉVENTIVE (PM)
              </h2>
              <p className="text-[11px] text-slate-400">
                Suivi du potentiel d'heures moteur avant franchissement des jalons de révision : 250h, 500h, et 1000h.
              </p>
            </div>
            <div className="text-xs font-mono text-amber-500 bg-amber-950/20 px-2 py-1 rounded border border-amber-900/60 font-bold">
              Tolérance de dépassement réglementaire: ±20 heures
            </div>
          </div>

          {/* PM Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {pmSchedules.map((pm) => {
              const remainingHours = pm.dueHours - pm.currentHours;
              const percent = Math.max(0, Math.min(100, (pm.currentHours / pm.dueHours) * 100));
              const isOverdue = remainingHours <= 0;
              const isAlert = remainingHours > 0 && remainingHours <= 70;

              return (
                <div key={pm.id} className={cn(
                  "p-3 rounded-lg border text-xs flex flex-col justify-between space-y-3",
                  isOverdue ? "bg-red-950/30 border-red-500/80" : 
                  isAlert ? "bg-amber-950/20 border-amber-600/70" : 
                  "bg-slate-900 border-slate-850"
                )}>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-white text-[13px] tracking-wider">{pm.machineCode}</span>
                      <span className={cn(
                        "text-[9px] font-black font-mono px-1.5 py-0.5 rounded",
                        isOverdue ? "bg-red-950 text-red-400" : 
                        isAlert ? "bg-amber-900 text-amber-400" : 
                        "bg-slate-950 text-slate-400"
                      )}>
                        {pm.type}
                      </span>
                    </div>
                    
                    <p className="text-[11px] font-serif text-slate-300 italic mb-1">“ {pm.typeLabel} ”</p>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Heures act.: {pm.currentHours}h</span>
                        <span>Limite: {pm.dueHours}h</span>
                      </div>
                      <Progress value={percent} className={cn(
                        "h-1.5 bg-slate-800",
                        isOverdue ? "[&>div]:bg-red-500" : 
                        isAlert ? "[&>div]:bg-amber-500" : 
                        "[&>div]:bg-emerald-500"
                      )} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850/50 space-y-2">
                    <div className="flex justify-between items-center font-mono text-[9px]">
                      <span className="text-slate-500">Marge tech.:</span>
                      <span className={cn(
                        "font-black text-[10px]",
                        isOverdue ? "text-red-500" : isAlert ? "text-amber-500" : "text-emerald-400"
                      )}>
                        {isOverdue ? `DÉPASSÉ DE ${Math.abs(remainingHours)}h` : `${remainingHours}h restantes`}
                      </span>
                    </div>

                    <Button
                      size="xs"
                      onClick={() => {
                        // Action to schedule a PM
                        const newBT: WorkOrderBT = {
                          id: "BT-PM-" + Date.now().toString().substring(9),
                          machineCode: pm.machineCode,
                          title: `[ENTRETIEN PRÉVENTIF REGLEMENTAIRE] Exécution ${pm.type} - ${pm.typeLabel}`,
                          category: "MOTEUR",
                          severity: isOverdue ? "critique" : "majeur",
                          status: "OUVERT",
                          assignedTech: "Y. Benjelloun",
                          creationDate: new Date().toISOString().substring(0, 10),
                          siteId: currentUser.siteId || "SMI",
                          checklist: [
                            { task: "Consignation LOTO de l'engin près de la baie", done: true },
                            { task: "Inspections initiales ultrason de structure", done: false },
                            { task: "Vidange complète & Prélèvement échantillon huile", done: false },
                            { task: "Remise à zéro du compteur d'entretient", done: false }
                          ],
                          actionsHistory: [{ timestamp: new Date().toISOString().substring(11,16), role: "CHEF ATELIER", action: "Déclenchement PM automatique", user: "GMAO" }],
                          replacedParts: [
                            { name: "Kit Filtres Moteur " + pm.type, qty: 1, costUSD: 450 }
                          ]
                        };
                        setWorkOrders(prev => [newBT, ...prev]);
                        
                        // Update pm hours to simulate next cycle resetting
                        setPmSchedules(prev => prev.map(p => {
                          if (p.id === pm.id) {
                            return {
                              ...p,
                              currentHours: p.dueHours,
                              dueHours: p.dueHours + p.interval,
                              status: "PLANIFIÉ"
                            };
                          }
                          return p;
                        }));

                        toast.success(`🛠️ Ordre de maintenance ${newBT.id} déclenché pour l'entretien systématique ${pm.type} !`);
                      }}
                      className={cn(
                        "w-full text-[9px] font-bold h-6",
                        isOverdue ? "bg-red-650 hover:bg-red-700 text-white font-black" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      )}
                    >
                      {isOverdue ? "⚙️ Urgent: Exécuter Révision" : "Planifier Entretien PM"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Scheduled Oil Changes */}
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-200">
                  PROGRAMME DE VIDANGES ET D'ANALYSES DE SANG D'ENGIN (HUILES)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2 text-xs">
                <div className="border border-slate-850 rounded overflow-hidden">
                  <Table className="text-xs">
                    <TableHeader className="bg-slate-950 font-mono">
                      <TableRow className="border-b border-slate-850">
                        <TableHead>Machine</TableHead>
                        <TableHead>Type d'Huile</TableHead>
                        <TableHead>Fréquence</TableHead>
                        <TableHead>Dernier Labo</TableHead>
                        <TableHead>Statut Alerte</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-b border-slate-900">
                        <TableCell className="font-extrabold text-white">ST7-01</TableCell>
                        <TableCell className="text-slate-350">Huile Moteur 15W40</TableCell>
                        <TableCell className="font-mono">250h</TableCell>
                        <TableCell className="text-slate-400">Normal (Taux Silice bas)</TableCell>
                        <TableCell><Badge className="bg-emerald-950 text-emerald-450 text-[9px] uppercase font-mono">VALIDE</Badge></TableCell>
                      </TableRow>
                      <TableRow className="border-b border-slate-900">
                        <TableCell className="font-extrabold text-white">ST7-02</TableCell>
                        <TableCell className="text-slate-355">Huile Hydraulique ISO 46</TableCell>
                        <TableCell className="font-mono">500h</TableCell>
                        <TableCell className="text-red-400 font-bold">Alerte Métaux d'Usure (Fer!)</TableCell>
                        <TableCell><Badge className="bg-red-955 text-white text-[9px] uppercase font-mono animate-pulse">ALERTE LABO</Badge></TableCell>
                      </TableRow>
                      <TableRow className="border-b border-slate-900">
                        <TableCell className="font-extrabold text-white">JUMB-03</TableCell>
                        <TableCell className="text-slate-350">Huile de Percussion SAE 30</TableCell>
                        <TableCell className="font-mono">250h</TableCell>
                        <TableCell className="text-slate-400">Normal</TableCell>
                        <TableCell><Badge className="bg-emerald-950 text-emerald-450 text-[9px] uppercase font-mono">VALIDE</Badge></TableCell>
                      </TableRow>
                      <TableRow className="border-b border-slate-900">
                        <TableCell className="font-extrabold text-white">DUMP-04</TableCell>
                        <TableCell className="text-slate-350">Huile Ponts & Pignons</TableCell>
                        <TableCell className="font-mono">1000h</TableCell>
                        <TableCell className="text-slate-400">Normal</TableCell>
                        <TableCell><Badge className="bg-emerald-950 text-emerald-450 text-[9px] uppercase font-mono">VALIDE</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Major Outages (Grands Arrêts Planifiés) */}
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-200">
                  PROGRAMMATION DES GRANDS ARRÊTS ET INSPECTIONS PÉRIODIQUES
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2 text-xs">
                <div className="space-y-2 font-serif text-[11px] text-slate-300">
                  <div className="p-2.5 bg-slate-950 border border-slate-850 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-white text-xs uppercase text-amber-500">🧱 Arrêt Technique Général Trimestriel (AT Trim-2)</span>
                      <Badge className="bg-slate-850 text-white font-mono text-[8px]">Planifié Juin 2026</Badge>
                    </div>
                    <p className="leading-tight text-slate-400">
                      Coupure générale de la ligne haute tension Ouest pour changement de l'arbre principal d'extraction d'air et réfection des glissières de voies du puits vertical.
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-850 rounded">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-white text-xs uppercase text-emerald-400">🔍 Contrôle Annuel Non Destructif (CND Ultrasons)</span>
                      <Badge className="bg-slate-850 text-white font-mono text-[8px]">Planifié Juillet 2026</Badge>
                    </div>
                    <p className="leading-tight text-slate-400">
                      Ausculation des micro-fissures de fatigue d'acier sur les axes de flèche de toute la flotte de Scooptrams Sandvik LH410.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. TAB ATELIER: GESTION CAPACITÉ & STAFF MAINTENANCE (Module 4 & 5) */}
      {/* ==================================================================== */}
      {activeTab === "atelier" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            
            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase">TAUX D'OCCUPATION</span>
              <span className="text-3xl font-bold text-amber-400 block">
                {Math.round((workshopBays.filter(b => b.status === "OCCUPÉ").length / workshopBays.length) * 100)}%
              </span>
              <p className="text-[9px] text-slate-500 font-sans">
                {workshopBays.filter(b => b.status === "OCCUPÉ").length} / {workshopBays.length} baies techniques utilisées
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase">SATURATION ATELIER</span>
              {workshopBays.filter(b => b.status === "OCCUPÉ").length === 4 ? (
                <span className="text-sm font-bold text-red-500 block blink uppercase">🛑 SATURÉ - DANGER CHARGE</span>
              ) : workshopBays.filter(b => b.status === "OCCUPÉ").length >= 2 ? (
                <span className="text-sm font-bold text-amber-500 block uppercase">⚠️ CHARGE ÉLEVÉE</span>
              ) : (
                <span className="text-sm font-bold text-emerald-400 block uppercase">✅ NOMINAL STABLE</span>
              )}
              <p className="text-[9px] text-slate-550 font-sans">Alerte d'arbitrage de priorité au fond</p>
            </div>

            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase">EFFECTIF OPÉRA. PRÉSENT</span>
              <span className="text-[19px] font-black text-white block">
                {mechanicsList.filter(m => m.status === "ACTIF").length} Mécaniciens en poste
              </span>
              <p className="text-[9px] text-emerald-400 font-sans">Masse de travail disponible : 38h/relai</p>
            </div>

            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] block uppercase">PRODUCTIVITÉ GLOBALE</span>
              <span className="text-2xl font-black text-emerald-400 block">
                {Math.round(mechanicsList.reduce((acc, current) => acc + current.rating, 0) / mechanicsList.length)}%
              </span>
              <p className="text-[9px] text-slate-500 font-sans">Efficience moyenne d'atelier</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Baies Atelier Allocation */}
            <div className="col-span-2 space-y-4">
              <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader className="p-3 border-b border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-xs font-black uppercase text-white tracking-widest">
                      AFFECTATION ET CONFIGURATION DES BAIES DE L'ATELIER SOUTERRAIN (-250M)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-450">
                      Allouer ou libérer instantanément la surface d'accueil pour la dépose des engins en diagnostic active.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {workshopBays.map((b) => (
                      <div key={b.id} className={cn(
                        "p-3 rounded border font-sans space-y-2 text-xs",
                        b.status === "OCCUPÉ" 
                          ? "bg-slate-950 border-slate-800 text-slate-200" 
                          : "bg-slate-900/40 border-slate-850 text-slate-400 border-dashed"
                      )}>
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[12px] text-slate-300">{b.name}</span>
                          <Badge className={cn(
                            "text-[8px] uppercase",
                            b.status === "OCCUPÉ" ? "bg-amber-955 text-amber-500" : "bg-emerald-950 text-emerald-400"
                          )}>
                            {b.status}
                          </Badge>
                        </div>

                        {b.status === "OCCUPÉ" ? (
                          <div className="space-y-1.5 p-2 rounded bg-slate-900/60 font-mono text-[10px]">
                            <div className="flex justify-between text-white">
                              <span>Engin: <b>{b.occupiedCode}</b></span>
                              <span>Début: {b.startHour.substring(11)}</span>
                            </div>
                            <p className="text-[9.5px] italic text-slate-300">Operation: {b.currentOp}</p>
                            
                            <div className="pt-2">
                              <Button
                                size="xs"
                                variant="destructive"
                                onClick={() => {
                                  setWorkshopBays(prev => prev.map(bay => {
                                    if (bay.id === b.id) {
                                      return { ...bay, status: "LIBRE", occupiedCode: null, currentOp: "", startHour: "" };
                                    }
                                    return bay;
                                  }));
                                  toast.success(`Baie libérée avec succès !`);
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] h-6 py-0 uppercase font-black"
                              >
                                ✅ Libérer la Baie
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 py-2 text-center">
                            <span className="text-slate-500 italic block text-[11px]">Aucun engin alloué</span>
                            
                            <div className="flex gap-1.5 justify-center">
                              {/* Quick assign first downed engine */}
                              {machines.filter(m => m.status !== "DISPONIBLE").map((downedM) => (
                                <Button
                                  key={downedM.code}
                                  size="xs"
                                  onClick={() => {
                                    setWorkshopBays(prev => prev.map(bay => {
                                      if (bay.id === b.id) {
                                        return {
                                          ...bay,
                                          status: "OCCUPÉ",
                                          occupiedCode: downedM.code,
                                          currentOp: "Ajustement & dépannage suite à panne",
                                          startHour: new Date().toISOString().substring(0, 16).replace("T", " ")
                                        };
                                      }
                                      return bay;
                                    }));
                                    toast.success(`Engin ${downedM.code} attribué à la baie !`);
                                  }}
                                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[9px] h-5 py-0 px-1.5"
                                >
                                  + {downedM.code}
                                </Button>
                              ))}
                              {machines.filter(m => m.status !== "DISPONIBLE").length === 0 && (
                                <span className="text-[9px] text-slate-600">Aucun engin en panne à affecter</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Suivi Main-d'oeuvre Column */}
            <div className="space-y-4">
              <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader className="p-3 border-b border-slate-850">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-200">
                    SUIVI DE LA MAIN-D'ŒUVRE TECHNIQUE / STAFF IMPOSTE
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {mechanicsList.map((m) => (
                      <div key={m.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-white text-[11px]">{m.name}</span>
                          <Badge className="bg-slate-900 text-slate-350 text-[8px]">{m.specialty}</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                          <span>Heures: <b>{m.hoursLogged}h</b> / relai</span>
                          <span className="text-emerald-400 font-bold">Diag: {m.rating}%</span>
                        </div>

                        <div className="text-[10px] text-slate-300 font-sans italic truncate">
                          Tâche: {m.currentAssignment}
                        </div>

                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-900 font-mono text-[9px]">
                          <span>Incrémenter heures:</span>
                          <div className="flex gap-1">
                            <Button 
                              size="xs" 
                              onClick={() => {
                                setMechanicsList(prev => prev.map(mech => {
                                  if (mech.id === m.id) {
                                    return { ...mech, hoursLogged: Math.max(0, mech.hoursLogged - 1) };
                                  }
                                  return mech;
                                }));
                              }}
                              className="h-4 w-5 p-0 bg-slate-900 hover:bg-slate-800 text-slate-400"
                            >
                              -
                            </Button>
                            <Button 
                              size="xs"
                              onClick={() => {
                                setMechanicsList(prev => prev.map(mech => {
                                  if (mech.id === m.id) {
                                    return { ...mech, hoursLogged: mech.hoursLogged + 1 };
                                  }
                                  return mech;
                                }));
                              }}
                              className="h-4 w-5 p-0 bg-slate-900 hover:bg-slate-800 text-slate-400"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. TAB COUTS: ANALYSE DES COÛTS DE LA MAINTENANCE (Module 6) */}
      {/* ==================================================================== */}
      {activeTab === "couts" && (
        <div className="space-y-4">
          
          {/* Real-time cost breakdown calculation block */}
          {(() => {
            // Summary calculations
            const sumPartsCost = workOrders.reduce((acc, wo) => {
              const bCosts = wo.replacedParts.reduce((pAcc, p) => pAcc + (p.costUSD * p.qty), 0);
              return acc + bCosts;
            }, 0);

            const totalLoggedHours = mechanicsList.reduce((acc, m) => acc + m.hoursLogged, 0);
            const sumLaborCost = totalLoggedHours * 45; // $45/hour cost rate base factor

            // Downtime hourly costs factor:
            // Scooptram: $350, Jumbo: $450, Dumper: $305, Locomotive: $150
            const sumDowntimeCost = machines.reduce((acc, m) => {
              const dMinutesSum = m.downtimes.reduce((dAcc, d) => dAcc + (d.durationMinutes || 60), 0);
              const hours = dMinutesSum / 60;
              let rate = 350;
              if (m.type === "Foreuse Jumbo") rate = 450;
              if (m.type === "Dumper Souterrain") rate = 300;
              if (m.type === "Locomotive") rate = 150;
              return acc + Math.round(hours * rate);
            }, 0);

            const totalCapitalLossCost = sumPartsCost + sumLaborCost + sumDowntimeCost;

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
                  
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase">Coût des Pièces de Rechange</span>
                    <span className="text-2xl font-black text-amber-500 block">${sumPartsCost.toLocaleString()} USD</span>
                    <p className="text-[9px] text-slate-500">Valorisation pièces de rechange cumulées</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase">Coût de la Main d'œuvre</span>
                    <span className="text-2xl font-black text-pink-500 block">${sumLaborCost.toLocaleString()} USD</span>
                    <p className="text-[9px] text-slate-500">Heures de travail technique valorisées à $45/h</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[10px] block uppercase">Induction Coût d'Immobilisation</span>
                    <span className="text-2xl font-black text-red-500 block">${sumDowntimeCost.toLocaleString()} USD</span>
                    <p className="text-[9px] text-slate-505 font-sans leading-relaxed">Valorisation stricte des pertes d'exploitation/h</p>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">COÛT TOTAL GLOBAL GMAO</span>
                    <span className="text-3xl font-black text-purple-400 block">${totalCapitalLossCost.toLocaleString()} USD</span>
                    <p className="text-[9px] text-slate-500">Valorisation financière intégrée</p>
                  </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Coûts par Engins */}
                  <Card className="bg-slate-900 border-slate-800 text-slate-100">
                    <CardHeader className="p-3 border-b border-slate-850">
                      <CardTitle className="text-xs font-black uppercase text-white tracking-widest">
                        REPARTITION DE LA DEPENSE DIRECTE PAR HIERARCHIE DE L'ENGIN
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <Table className="text-xs">
                        <TableHeader className="bg-slate-950 font-mono">
                          <TableRow className="border-b border-slate-850">
                            <TableHead>Machine Code</TableHead>
                            <TableHead>Famille d'engin</TableHead>
                            <TableHead>Durée Arrêt</TableHead>
                            <TableHead>Coût Matériel</TableHead>
                            <TableHead>Impact d'Immobilisation (Induit)</TableHead>
                            <TableHead className="text-right">Total Affecté</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {siteMachines.map((m) => {
                            const dMinList = m.downtimes.reduce((dAcc, d) => dAcc + (d.durationMinutes || 60), 0);
                            const hours = dMinList / 60;
                            let rate = 350;
                            if (m.type === "Foreuse Jumbo") rate = 450;
                            if (m.type === "Dumper Souterrain") rate = 300;
                            if (m.type === "Locomotive") rate = 150;
                            const dCost = Math.round(hours * rate);

                            const mPartsCost = siteWorkOrders
                              .filter(wo => wo.machineCode === m.code)
                              .reduce((pSum, wo) => pSum + wo.replacedParts.reduce((pAcc, p) => pAcc + (p.costUSD * p.qty), 0), 0);

                            const mTotal = mPartsCost + dCost;

                            return (
                              <TableRow key={m.code} className="border-b border-slate-900 hover:bg-slate-900/20">
                                <TableCell className="font-extrabold text-white font-mono">{m.code}</TableCell>
                                <TableCell className="text-slate-350">{m.type}</TableCell>
                                <TableCell className="font-mono text-[11px] text-amber-500">{hours.toFixed(1)} heures</TableCell>
                                <TableCell className="font-mono text-slate-400">${mPartsCost}</TableCell>
                                <TableCell className="font-mono text-red-400">${dCost.toLocaleString()}</TableCell>
                                <TableCell className="font-bold text-white font-mono text-right">${mTotal.toLocaleString()}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Analyse par familles de Panne Coûts */}
                  <Card className="bg-slate-900 border-slate-800 text-slate-100">
                    <CardHeader className="p-3 border-b border-slate-850">
                      <CardTitle className="text-xs font-black uppercase text-white tracking-widest">
                        INDEX DES PERTES PAR FAMILLE DE DEFECTUEUX (SÉCURITÉ & CATÉGORIES)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 text-xs space-y-3">
                      <p className="text-[11px] text-slate-400 leading-tight">
                        La classification par organe permet aux ingénieurs méthodes d'identifier les gouffres financiers d'atelier afin d'adapter la périodicité de maintenance systématique de surface.
                      </p>

                      <div className="space-y-2.5 font-mono">
                        {/* Transmission bar simulation */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300 uppercase">1. TRANSMISSION (Ponts, cardans, crabots)</span>
                            <span className="text-amber-550 font-bold">$12,450 USD</span>
                          </div>
                          <Progress value={85} className="h-2 bg-slate-950 [&>div]:bg-amber-600" />
                        </div>
                        
                        {/* Hydraulique */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300 uppercase">2. HYDRAULIQUE (Vérins, distributeurs, HP)</span>
                            <span className="text-amber-550 font-bold">$8,120 USD</span>
                          </div>
                          <Progress value={60} className="h-2 bg-slate-950 [&>div]:bg-amber-600" />
                        </div>

                        {/* Motorisation */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300 uppercase">3. MOTORISATION DIESEL & ESCAPE CYLINDERS</span>
                            <span className="text-amber-550 font-bold">$5,400 USD</span>
                          </div>
                          <Progress value={45} className="h-2 bg-slate-950 [&>div]:bg-amber-500" />
                        </div>

                        {/* Électrique */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300 uppercase">4. SYSTEMES ELECTRIQUES & BATTERIES</span>
                            <span className="text-amber-550 font-bold">$2,850 USD</span>
                          </div>
                          <Progress value={20} className="h-2 bg-slate-950 [&>div]:bg-amber-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. TAB RAPPORTS: GENERATION DE RAPPORTS JOURNALIERS AUTOMATIQUES (Module 7) */}
      {/* ==================================================================== */}
      {activeTab === "rapports" && (
        <div className="space-y-4 font-sans text-xs">
          
          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="p-3 border-b border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-xs font-black uppercase text-white tracking-widest">
                  CONSOLIDEUR DE SYNTHÈSE JOURNALIÈRE - MINISTÈRE DES MINES ET DIRECTION CHANTIER
                </CardTitle>
                <CardDescription className="text-xs text-slate-450">
                  Génération automatique des données réelles de la flotte d'engins souterraine. Format standardisé de reporting de chantier.
                </CardDescription>
              </div>

              <div className="flex gap-2">
                <Button size="xs" onClick={() => {
                  const dataCompiled = `======== RAPPORT DE PERFORMANCES DE MAINTENANCE JOURNALIER ========
Date: 2026-05-20 (PosteActif: JOUR)
Disponibilité Instantanée: %
Nombre d'Engins Immobilisés: ${machines.filter(m => m.status !== "DISPONIBLE").length}
Nombre de BT Actifs Backlog: ${workOrders.filter(w => w.status !== "CLOS").length}
====================================================================`;
                  navigator.clipboard.writeText(dataCompiled);
                  toast.success("Rapport synthétique de maintenance copié avec succès dans le presse-papiers !");
                }} className="bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-bold">
                  📋 Copier le rapport
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Real-time precompiled report block */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded font-mono text-[11px] text-emerald-400 space-y-3">
                  <span className="font-black text-white block border-b border-slate-800 pb-1 text-[10px]">Aperçu de la structure du rapport brut :</span>
                  
                  <div className="space-y-1.5 leading-relaxed text-slate-300">
                    <p className="text-emerald-400 font-bold">GMAO RECONSTRUCTIVE RAPPORT - SMI - #REP-20260520</p>
                    <p>• DATE DU RAPPORT: 2026-05-20 (Shift {handoverShift})</p>
                    <p>• FLOTTE SOUTERRAINE: {machines.length} Engins recensés au fond</p>
                    <p>• DISPONIBILITÉ GLOBALE ACTIONNABLE: {Math.round((machines.filter(m => m.status === "DISPONIBLE" || m.status === "RESTREINTE").length / machines.length) * 100)}%</p>
                    <p>• RETARD DE BACKLOG CRITIQUE: {workOrders.filter(w => w.status === "OUVERT").length} BTs ouverts en attente</p>
                    <p>• BAIES TECHNIQUES OCCUPÉES: {workshopBays.filter(b => b.status === "OCCUPÉ").length} / 4 baies utilisées</p>
                    <p>• SÉCURITÉ AU FOND: 0 Incidents relevés pendant le relais</p>
                    <p>• CONSIGNATION SÉCURISÉE LOTO: Strictement respectée sur les chantiers d'abattage</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">OPTIONS DE GENERATION AUTOMATIQUE :</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
                      <span className="font-bold text-white block uppercase text-[10.5px]">Rapport Journalier de Disponibilité</span>
                      <p className="text-[10px] text-slate-450 leading-tight">Compile l'état détaillé de chaque machine, ses heures limites de révision et ses restrictions.</p>
                      <Button size="xs" onClick={() => toast.info("Rapport de disponibilité exporté en cache de surface !")} className="h-6 mt-1 w-full bg-slate-800 hover:bg-slate-700 text-slate-100 py-0">Générer Fiche PDF</Button>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
                      <span className="font-bold text-white block uppercase text-[10.5px]">Rapport d'activité à la Direction de Chantier</span>
                      <p className="text-[10px] text-slate-450 leading-tight">Synthèse d'imputation financière simplifiée, coût pièces, et charge de l'atelier de fond.</p>
                      <Button size="xs" onClick={() => toast.success("Synthèse d'exploitation transmise aux directeurs via réseau câblé souterrain.")} className="h-6 mt-1 w-full bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-bold py-0">Transmettre Direction</Button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-350 leading-relaxed font-serif">
                    <b>Note d'exploitation:</b> Ces rapports sont stockés localement dans l'ordinateur de l'atelier central (-250m) et synchronisés de manière asynchrone avec la surface par le serveur Phoenix de mine.
                  </div>
                </div>

              </div>

            </CardContent>
          </Card>

        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. TAB BIBLIO: BIBLIOTHÈQUE PROCÉDURES ET SÉCURITÉ LOTO (Module 8) */}
      {/* ==================================================================== */}
      {activeTab === "biblio" && (
        <div className="space-y-4">
          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-xs leading-relaxed text-red-400 space-y-1">
            <h3 className="font-bold uppercase tracking-wider text-white">🚧 DIRECTIVES HSE IMPÉRATIVES - TRAVAILING AU FOND SOUTERRAIN</h3>
            <p>
              Toute intervention mécanique au fond de taille SMI requiert l'application stricte du protocole de <b>Consignation de sécurité LOTO (Lockout / Tagout)</b>. Le non-respect de l'isolation d'énergie (électrique, hydraulique résiduelle) entraîne l'exclusion définitive immédiate de l'atelier de la mine.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* List of guides */}
            <div className="space-y-3 col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CATALOGUE DES GUIDES RAPIDES & LOTO</span>
              
              <div className="space-y-2">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded hover:border-slate-600 transition text-xs space-y-1 cursor-pointer">
                  <span className="font-bold text-white block uppercase text-[11px]">1. PROTOCOLE SÉCURISÉ DE DÉPRESSURISATION HYDRAULIQUE HP</span>
                  <p className="text-[10px] text-slate-405 leading-relaxed font-serif">Comment drainer l'accumulateur d'azote avant de changer un flexible hydraulique de perforeuse.</p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded hover:border-slate-600 transition text-xs space-y-1 cursor-pointer">
                  <span className="font-bold text-white block uppercase text-[11px]">2. CONSIGNATION CADENAS LOTO DES MOTEURS Sandvik LH410</span>
                  <p className="text-[10px] text-slate-405 leading-relaxed font-serif">Localisation de la clé d'arrêt d'isolement batterie de pont et blocage mécanique du bras de levage.</p>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded hover:border-slate-600 transition text-xs space-y-1 cursor-pointer">
                  <span className="font-bold text-white block uppercase text-[11px]">3. CHECKLIST PRÉVENTIVE INTERVENTIONS SYSTEME FREINAGE COULISSANT</span>
                  <p className="text-[10px] text-slate-405 leading-relaxed font-serif">Inspections de pression d'azote d'assistance au freinage sur roues de convoyeur locomotive.</p>
                </div>
              </div>
            </div>

            {/* Interactive LOTO Check Sheet Simulator panel */}
            <div className="col-span-2 space-y-4">
              <Card className="bg-slate-900 border-slate-800 text-slate-100">
                <CardHeader className="p-3 border-b border-slate-850">
                  <CardTitle className="text-xs font-black uppercase text-white tracking-widest flex items-center justify-between">
                    <span>ASSISTANT INTERACTIF DE CERTIFICATION LOTO (SIMULATEUR DE CONSIGNE)</span>
                    <Badge className="bg-amber-950 text-amber-500 text-[8px] uppercase">LOTO Actif</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3.5 space-y-4 text-xs font-sans">
                  
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded space-y-3">
                    <span className="font-bold text-white block uppercase text-[11px]">APPLIQUER LA SÉCURITÉ DE TERRAIN SUR UN ENGIN IMMOBILISÉ:</span>
                    
                    <div className="space-y-2.5 font-sans leading-relaxed text-slate-300">
                      <div className="flex gap-2.5 items-start">
                        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-800 bg-slate-900 focus:ring-emerald-550" id="loto-1" />
                        <label htmlFor="loto-1" className="cursor-pointer">
                          <b>Étape 1:</b> Coupure physique de l'électricité générale de la machine au disjoncteur général de la sous-station du niveau.
                        </label>
                      </div>

                      <div className="flex gap-2.5 items-start">
                        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-800 bg-slate-900 focus:ring-emerald-550" id="loto-2" />
                        <label htmlFor="loto-2" className="cursor-pointer">
                          <b>Étape 2:</b> Pose physique du cadenas de consignation rouge sur le boîtier coupe-circuit d'isolement batterie.
                        </label>
                      </div>

                      <div className="flex gap-2.5 items-start">
                        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-800 bg-slate-900 focus:ring-emerald-550" id="loto-3" />
                        <label htmlFor="loto-3" className="cursor-pointer">
                          <b>Étape 3:</b> Décompression hydraulique complète des accumulateurs d'huile par ouverture de la vanne de retour bâche.
                        </label>
                      </div>

                      <div className="flex gap-2.5 items-start">
                        <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-800 bg-slate-900 focus:ring-emerald-550" id="loto-4" />
                        <label htmlFor="loto-4" className="cursor-pointer">
                          <b>Étape 4:</b> Vérification de l'absence totale de tension résiduelle de travail à l'appareil VAT certifié de l'atelier de fond.
                        </label>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex justify-end">
                      <Button
                        size="xs"
                        onClick={() => {
                          toast.success("🔒 Sécurisation de terrain validée ! LOTO certifié approuvé pour intervention mécanique !");
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black text-[10px]"
                      >
                        VALIDER LE PROCESSUS LOTO 🔒
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/60 border border-slate-850 rounded text-[11px] text-slate-400 leading-normal">
                    <b>Note légale importante:</b> Cette checklist n'exonère nullement la rédaction de la fiche d'analyse d'impact de type <b>PTW (Permit To Work)</b> physique de surface par l'ingénieur méthode HSE.
                  </div>

                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      )}

       {/* ==================================================================== */}
      {/* TABS CONTENT 3 : WORK ORDERS & HIERARCHICAL VALIDATIONS (Action 6) */}
      {/* ==================================================================== */}
      {activeTab === "bt" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Create BT Column with SMART ASSISTANT */}
          <div className="space-y-4">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>Émettre un Nouveau Bon (BT)</span>
                  <Badge className="bg-emerald-950 text-emerald-450 text-[8px] uppercase">GMAO Assistée</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <form onSubmit={handleCreateBT} className="space-y-3.5 text-xs">
                  
                  {/* SÉLECTION ENGINE */}
                  <div className="space-y-1">
                    <label className="text-slate-400 block text-[9px]">SÉLECTION MATÉRIEL</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2"
                      value={newBtMachine}
                      onChange={(e) => {
                        setNewBtMachine(e.target.value);
                      }}
                    >
                      {siteMachines.map(m => (
                        <option key={m.code} value={m.code}>{m.code} - {m.type}</option>
                      ))}
                    </select>
                    
                    {/* Remember Last Tech (Goal 1 Assistance) */}
                    {(() => {
                      const lastTech = workOrders.find(wo => wo.machineCode === newBtMachine)?.assignedTech;
                      if (lastTech) {
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              setNewBtTech(lastTech);
                              toast.info(`Technicien ${lastTech} automatiquement sélectionné (historique).`);
                            }}
                            className="text-[9px] text-sky-400 hover:underline font-mono block text-left pt-0.5"
                          >
                            👤 Dernier intervenant de l'engin : <span className="underline font-bold text-white">{lastTech}</span> (cliquer pour ré-assigner)
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* CATEGORY & GRAVITY */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400 block text-[9px]">FAMILLE PANNE</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2"
                        value={newBtCategory}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setNewBtCategory(cat);
                          // Auto fill standard first suggestion title of this category for speed
                          const key = cat === "ÉLECTRIQUE" ? "ÉLECTRIQUE" : cat;
                          const s = BT_SUGGESTIONS_DICT[key];
                          if (s && s.titles && s.titles.length > 0) {
                            setNewBtTitle(s.titles[0]);
                          }
                        }}
                      >
                        <option value="HYDRAULIQUE">HYDRAULIQUE</option>
                        <option value="MOTEUR">MOTEUR</option>
                        <option value="TRANSMISSION">TRANSMISSION</option>
                        <option value="ELECTRIQUE">ÉLECTRIQUE</option>
                        <option value="FREINAGE">FREINAGE</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 block text-[9px]">GRAVITÉ SOUHAITÉE</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2"
                        value={newBtSeverity}
                        onChange={(e: any) => setNewBtSeverity(e.target.value)}
                      >
                        <option value="critique">Critique</option>
                        <option value="majeur">Majeur</option>
                        <option value="mineur">Mineur</option>
                      </select>
                    </div>
                  </div>

                  {/* LIBELLÉ / SUGGESTIONS AUTOCOMPLETE (Goal 1 Assistance) */}
                  <div className="space-y-1">
                    <label className="text-slate-400 block text-[9px] flex justify-between">
                      <span>LIBELLÉ INTERVENTION (REMPLISSEMENT CLIC)</span>
                      <span className="text-[8px] text-amber-500 font-mono">1-CLIC TACTILE</span>
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="Saisir ou cliquer sur une suggestion ci-dessous..."
                      className="bg-slate-950 border-slate-800 text-xs h-9 text-slate-100"
                      value={newBtTitle}
                      onChange={(e) => setNewBtTitle(e.target.value)}
                    />

                    {/* Autocomplete suggestions buttons for fast typing */}
                    {(() => {
                      const suggsKey = newBtCategory === "ELECTRIQUE" ? "ÉLECTRIQUE" : newBtCategory;
                      const suggs = BT_SUGGESTIONS_DICT[suggsKey];
                      if (suggs) {
                        return (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Fiches de pannes fréquentes :</span>
                            <div className="flex flex-col gap-1">
                              {suggs.titles.map((t, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setNewBtTitle(t);
                                    toast.success(`Libellé appliqué : ${t}`);
                                  }}
                                  className={cn(
                                    "p-1 rounded text-[10px] text-left border text-slate-300 transition-all font-mono truncate",
                                    newBtTitle === t 
                                      ? "bg-slate-950 border-emerald-600 text-emerald-400 font-bold" 
                                      : "bg-slate-950/40 border-slate-850 hover:bg-slate-950"
                                  )}
                                >
                                  📝 {t}
                                </button>
                              ))}
                            </div>

                            {/* Estimated parameters label */}
                            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px] p-2 rounded bg-slate-950/60 border border-slate-850">
                              <div>
                                <span className="text-slate-550 block uppercase text-[8px]">DUREE CONSTITUTIVE</span>
                                <span className="text-white font-extrabold">{suggs.estHours} h estimées</span>
                              </div>
                              <div>
                                <span className="text-slate-550 block uppercase text-[8px]">PIÈCES RECOMMANDÉES</span>
                                <span className="text-amber-450 block truncate">{suggs.parts[0]}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* TECHNICIEN ASSIGNÉ */}
                  <div className="space-y-1">
                    <label className="text-slate-400 block text-[9px]">TECHNICIEN ASSIGNÉ</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-9 rounded px-2"
                      value={newBtTech}
                      onChange={(e) => setNewBtTech(e.target.value)}
                    >
                      <option value="Y. Benjelloun">Y. Benjelloun</option>
                      <option value="M. El Idrissi">M. El Idrissi</option>
                      <option value="Shafik Belkacem">Shafik Belkacem</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-extrabold text-slate-950 text-xs h-9 uppercase">
                    💾 ÉMETTRE LE BT SÉCURISÉ
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Active Work Orders Track & Validations */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider px-1">
              SUIVI ET CLÔTURE HIÉRARCHIQUE DES BT
            </span>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredBT.map(wo => {
                const operatorSigned = wo.actionsHistory.some(a => a.role === "OPÉRATEUR");
                const mechSigned = wo.actionsHistory.some(a => a.role === "MÉCANICIEN");
                const chefSigned = wo.actionsHistory.some(a => a.role === "CHEF ATELIER");
                const secretarySigned = wo.actionsHistory.some(a => a.role === "SECRÉTAIRE DE CHANTIER");
                
                return (
                  <Card key={wo.id} className="bg-slate-900 border-slate-800 text-slate-100">
                    <CardHeader className="p-3 border-b border-slate-850 flex flex-row items-center justify-between pb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">{wo.id} ({wo.machineCode})</span>
                          <Badge variant="outline" className="border-red-900 text-red-400 text-[8px]">{wo.severity}</Badge>
                        </div>
                        <span className="text-[10px] text-slate-400">Créé le {wo.creationDate} • Intervenant: {wo.assignedTech}</span>
                      </div>
                      <Badge className={cn(
                        "text-[9px] font-mono",
                        wo.status === "CLOS" ? "bg-emerald-950 text-emerald-400" : "bg-sky-950 text-sky-400"
                      )}>
                        {wo.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3">
                      
                      <p className="text-xs font-bold text-slate-100 italic">“ {wo.title} ”</p>

                      {/* Checklist */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block">Points de contrôle :</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {wo.checklist.map((c, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleToggleTask(wo.id, idx)}
                              className={cn(
                                "flex items-center gap-1.5 p-1.5 rounded cursor-pointer transition-colors border text-[10px]",
                                c.done 
                                  ? "bg-slate-950/40 border-emerald-900/60 text-emerald-400" 
                                  : "bg-slate-950/20 border-slate-800 text-slate-400 hover:bg-slate-900"
                              )}
                            >
                              <span className="text-xs">{c.done ? "✅" : "⬜"}</span>
                              <span className="truncate">{c.task}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* VALIDADATION BAR */}
                      <div className="p-2.5 rounded bg-slate-950/80 border border-slate-850 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                            EXIGENCE DE VALIDATION SÉCURISÉE (VISA DES ROLES) :
                          </span>
                          <Badge variant="outline" className="border-emerald-900 text-emerald-400 text-[8px]">
                            {wo.actionsHistory.filter(h => h.action.includes("Visa")).length} / 4 Signatures
                          </Badge>
                        </div>

                        {/* Badges for roles signed */}
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                          <span className={cn("px-1.5 py-0.5 rounded", operatorSigned ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-red-950 text-red-400")}>
                            👷 Operator: {operatorSigned ? "SIGNÉ" : "REQUIS"}
                          </span>
                          <span className={cn("px-1.5 py-0.5 rounded", mechSigned ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-red-950 text-red-400")}>
                            🔧 Mécanologue: {mechSigned ? "SIGNÉ" : "REQUIS"}
                          </span>
                          <span className={cn("px-1.5 py-0.5 rounded", chefSigned ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-red-950 text-red-400")}>
                            👑 Chef Atelier: {chefSigned ? "SIGNÉ" : "REQUIS"}
                          </span>
                          <span className={cn("px-1.5 py-0.5 rounded", secretarySigned ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-red-950 text-red-400")}>
                            📝 Secrétaire: {secretarySigned ? "SIGNÉ" : "REQUIS"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <p className="text-[9px] text-slate-400 font-serif max-w-[70%]">
                            Visa sous votre responsabilité en tant que <b>{activeRole}</b>. Double-cliquez pour apposer votre signature réglementaire.
                          </p>
                          <Button 
                            size="sm"
                            onClick={() => handleSignBT(wo.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black text-[10px] h-7 px-3"
                          >
                            🔒 SIGNER POUR COMPLIANCE
                          </Button>
                        </div>
                      </div>

                      {/* Log of actions */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[9px] text-slate-500 uppercase block">Ledger actions :</span>
                        <div className="max-h-[85px] overflow-y-auto space-y-1 text-[9px] font-mono text-slate-400 pr-1">
                          {wo.actionsHistory.map((act, i) => (
                            <div key={i} className="flex justify-between items-center py-0.5 border-b border-slate-900">
                              <span>📅 {act.timestamp} - {act.action}</span>
                              <span className="text-emerald-400 font-bold">👤 {act.role} | {act.user}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1 border-t border-slate-900">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPrintingBT(wo);
                            addAuditLog(`Ouverture aperçu d'impression réglementaire pour le BT ${wo.id}`, "INTERFACE");
                          }}
                          className="border-slate-800 text-amber-500 hover:bg-slate-900 text-[10px] h-7 px-2.5 font-mono"
                        >
                          📠 IMPRIMER FICHE
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteBT(wo.id)}
                          className="text-red-500 hover:text-red-600 text-[10px] h-7 px-2"
                        >
                          <Trash className="h-3.5 w-3.5 mr-1" /> SUPPRIMER
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TABS CONTENT 4 : SHIFT HANDOVER MODULE (Action 3) */}
      {/* ==================================================================== */}
      {activeTab === "handover" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Create Handover form */}
          <div className="space-y-4">
            <Card className="bg-slate-900 border-slate-800 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Consigner la Passation de Poste du Shift
                </CardTitle>
                <CardDescription className="text-[10px]">
                  Archiver l'état critique du fond pour l'équipe descendante.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                <form onSubmit={handleCreateHandover} className="space-y-3 text-xs">
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400">SHIFT ENTRANT</label>
                      <select
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 h-8 rounded px-2"
                        value={handoverShift}
                        onChange={(e: any) => setHandoverShift(e.target.value)}
                      >
                        <option value="JOUR">JOUR (06:00 - 18:00)</option>
                        <option value="NUIT">NUIT (18:00 - 06:00)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400">INCIDENTS HSE</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-250 h-8 rounded px-2"
                        value={handoverIncidents}
                        onChange={(e) => setHandoverIncidents(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400">RISQUES HISTORIQUES IMPORTANTS</label>
                    <textarea
                      placeholder="Ex: Taux de CO élevé galerie sud, tir de mine prévu à 19:30"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-250 p-2 text-xs rounded h-16"
                      value={handoverRisks}
                      onChange={(e) => setHandoverRisks(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400">COMMANDE DE PIÈCES ATTENDUES</label>
                    <input
                      type="text"
                      placeholder="Ex: Cardan CAT, Joint torique bras Sandvik..."
                      className="w-full bg-slate-950 border border-slate-800 text-slate-250 h-8 rounded px-2"
                      value={handoverParts}
                      onChange={(e) => setHandoverParts(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400">COMMENTAIRES CHEF DE POSTE</label>
                    <textarea
                      placeholder="Notes pour débriefing d'équipe..."
                      className="w-full bg-slate-950 border border-slate-800 text-slate-250 p-2 text-xs rounded h-20"
                      value={handoverComments}
                      onChange={(e) => setHandoverComments(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black text-xs h-8">
                    SOUMETTRE ET APPOSER MON VISA 🔒
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Past handovers */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              HISTORIQUE DES COSIGNATIONS DE PASSATION DE COMPTE
            </span>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {handoverReports.map((report, i) => (
                <Card key={i} className="bg-slate-900 border-slate-800 text-slate-100">
                  <CardHeader className="p-3 border-b border-slate-850 flex flex-row items-center justify-between pb-2 bg-slate-950/20">
                    <div>
                      <span className="text-xs font-black text-white">SHIFT {report.shift} - {report.date}</span>
                      <p className="text-[9px] text-slate-400">Identifiant : {report.id}</p>
                    </div>
                    <Badge className="bg-emerald-950 text-emerald-400 font-mono text-[9px]">
                      PANNES SIGNALEES : {report.safetyIncidents}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2.5 text-xs">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[9px] text-red-400 block uppercase font-mono">⚠️ Risques Opératifs :</span>
                        <p className="text-slate-300 font-serif leading-relaxed italic">“ {report.criticalRisks} ”</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-amber-500 block uppercase font-mono">📦 Pièces attendues urgentes :</span>
                        <p className="text-slate-300 font-sans leading-relaxed">{report.awaitedParts}</p>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-950/60 border border-slate-850">
                      <span className="text-[9px] text-slate-404 uppercase font-mono block">Commentaires du Chef de Poste :</span>
                      <p className="text-slate-100 leading-relaxed font-serif mt-0.5">“ {report.supervisorComments || "Aucun"} ”</p>
                    </div>

                    {/* Handover role visas */}
                    <div className="pt-2 border-t border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                        <span className="text-slate-400 font-bold">Visas :</span>
                        {["OPÉRATEUR", "MÉCANICIEN", "CHEF ATELIER", "SECRÉTAIRE DE CHANTIER"].map(role => {
                          const hasSigned = report.signedRoles.includes(role);
                          return (
                            <span key={role} className={cn(
                              "px-1.5 py-0.5 rounded text-[8px]",
                              hasSigned ? "bg-emerald-950 text-emerald-450 border border-emerald-905" : "bg-slate-950 text-slate-500"
                            )}>
                              {role}: {hasSigned ? "SIGNÉ" : "REQUIS"}
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex gap-1">
                        <Button 
                          size="xs"
                          onClick={() => handleSignHandover(report.id)}
                          className="bg-transparent border border-emerald-600 hover:bg-emerald-950/45 text-emerald-400 font-black text-[9px] h-6 py-0 px-2"
                        >
                          🖋️ Apposer mon Visa ({activeRole})
                        </Button>
                        <Button 
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            toast.success("Impression en cours de préparation... (Veuillez autoriser l'imprimante)");
                            window.print();
                          }}
                          className="border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:text-white px-2 h-6 text-[9px] font-bold"
                        >
                          🖨️ Imprimer
                        </Button>
                        <Button 
                          size="xs"
                          variant="outline"
                          onClick={() => handleDownloadHandoverJSON(report)}
                          className="border-slate-800 text-amber-500 hover:bg-amber-500/10 px-2 h-6 text-[9px] font-bold"
                        >
                          📥 Exporter JSON
                        </Button>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "epidemiology" && (
        <div className="space-y-4">
          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="p-3 border-b border-slate-850">
              <CardTitle className="text-sm font-black uppercase text-white flex items-center gap-1.5 font-mono">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                ANALYSE CHRONIQUE DE RÉCIDIVE ET SÉCURITÉ DE TERRAIN (DÉPISTAGE LOGIQUE)
              </CardTitle>
              <CardDescription className="text-xs text-slate-450">
                L'algorithme déterministe de GMAO analyse l'historique d'exploitation et l'intervalle entre pannes successives pour identifier des insuffisances de diagnostic ou des pièces d'usure prématurée.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recurrentResults.map((rec, i) => {
                  // Calculate dynamic cumulative downtime duration (Goal 3)
                  const mObj = machines.find(m => m.code === rec.machineCode);
                  const totalDowntimeMin = mObj 
                    ? mObj.downtimes
                        .filter(d => d.category === rec.category)
                        .reduce((acc, curr) => acc + (curr.durationMinutes || 60), 0)
                    : rec.totalDowntimes * 60;

                  return (
                    <div key={i} className="p-3 rounded bg-slate-950/60 border border-slate-850 space-y-2.5 font-sans">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-xs font-mono">{rec.machineCode}</span>
                          <Badge className="bg-purple-950 text-purple-400 text-[8px]">{rec.category}</Badge>
                        </div>
                        <Badge className="bg-red-950 text-red-400 text-[9px] font-mono font-black blink">
                          🚨 RÉCIDIVANTE : {rec.totalDowntimes} Arrêts détectés
                        </Badge>
                      </div>

                      <div className="space-y-1.5 font-mono">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Sévérité cumulative d'usure</span>
                          <span className="text-amber-555 font-black">{rec.score}% risque de défaillances</span>
                        </div>
                        <Progress value={rec.score} className="h-1 bg-slate-900" />
                        
                        <div className="grid grid-cols-2 gap-2 text-[9.5px] p-1.5 rounded bg-slate-900/40 border border-slate-900 text-slate-400">
                          <div>
                            <span>FREQ. REOUVERTURES (30j) :</span>
                            <span className="text-white block font-bold">{rec.totalDowntimes} interventions</span>
                          </div>
                          <div>
                            <span>IMMOBILISATION CUMULEE :</span>
                            <span className="text-amber-500 block font-bold font-mono">
                              {Math.round(totalDowntimeMin / 60)}h ({totalDowntimeMin} mins)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 rounded bg-slate-905/30 space-y-1 border-l-2 border-amber-500">
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block font-mono">RECOMMANDATION PRÉVENTIVE CONFORME (SMI METHODES):</span>
                        <p className="text-[11px] text-slate-300 leading-relaxed italic font-serif">
                          {rec.recommendedAction}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-1 font-mono text-[9.5px]">
                        <span className="text-slate-500 font-bold">Dernier enregistrement : {rec.lastDate}</span>
                        <Button
                          size="xs"
                          onClick={() => {
                            setNewBtMachine(rec.machineCode);
                            setNewBtTitle(`Inspection Récidive : organigramme de maintenance préventive ${rec.category}`);
                            setNewBtCategory(rec.category);
                            setNewBtSeverity("majeur");
                            setActiveTab("bt");
                            toast.info(`Formulaire BT pré-rempli pour l'engin récidivant ${rec.machineCode}`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-750 text-slate-950 font-black text-[9px] h-6 px-2.5 py-0 uppercase"
                        >
                          Planifier Entretien PM 🛠️
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {recurrentResults.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-slate-405 italic">
                    Aucun pattern récurrent de défaillance détecté. La fiabilité d'atelier est actuellement optimale.
                  </div>
                )}
              </div>

              {/* Generative general protocols */}
              <div className="p-3 rounded border border-slate-800 bg-slate-950/20 text-xs text-slate-305 space-y-2">
                <span className="font-bold text-white block uppercase text-[10px] font-mono">PROTOCOLE D'EXPLOITATION SÉCURITÉ GÉANTE :</span>
                <p className="leading-relaxed">
                  L'encrassement par les poussières de silice au fond de taille SMI accélère l'usure de contact des pistolets de percussion de plus de 400%. Il est exigé d'appliquer le protocole de lavage complet sous-carter à la fin de chaque relais (Shift Handover).
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TABS CONTENT 6 : KPIS & ADVANCED CHARTS (Action 7) */}
      {/* ==================================================================== */}
      {activeTab === "kpis" && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[10px] block uppercase">Taux de Disponibilité</span>
              <span className="text-3xl font-bold text-emerald-400 block">{currentAvailability}%</span>
              <p className="text-[9px] text-slate-450">Objectif réglementaire : &gt;85%</p>
            </div>

            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[10px] block uppercase">Backlog Maintenance</span>
              <span className="text-3xl font-bold text-red-500 block">{openBTCount} BTs</span>
              <p className="text-[9px] text-slate-450">Bons de travail ouverts au fond</p>
            </div>

            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[10px] block uppercase">Taille du Relais (Shift)</span>
              <span className="text-2xl font-black text-white block">{machines.length} Engins</span>
              <p className="text-[9px] text-slate-550">1 Scooptram Caterpillar actif</p>
            </div>

            <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-2">
              <span className="text-slate-400 text-[10px] block uppercase">Gravité Alarmante</span>
              <span className="text-2xl font-bold text-amber-500 block">
                {machines.filter(m => m.status === "EN PANNE" || m.status === "EN ATTENTE PIÈCES").length} Engins
              </span>
              <p className="text-[9px] text-red-400">Priorité d'attribution active</p>
            </div>
          </div>

          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="p-3 border-b border-slate-850">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-white">
                Rapport de Valorisation Financière des Pièces Remplacées
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="border border-slate-850 rounded overflow-hidden">
                <Table className="text-xs">
                  <TableHeader className="bg-slate-950 font-mono">
                    <TableRow className="border-b border-slate-850">
                      <TableHead>N° Billet</TableHead>
                      <TableHead>Machine</TableHead>
                      <TableHead>Composant Remplacé</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Pris Unitaire USD</TableHead>
                      <TableHead>Total de la Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.flatMap(wo => 
                      wo.replacedParts.map((p, pIdx) => (
                        <TableRow key={`${wo.id}-${pIdx}`} className="border-b border-slate-900 hover:bg-slate-900/20">
                          <TableCell className="font-mono">{wo.id}</TableCell>
                          <TableCell className="font-extrabold">{wo.machineCode}</TableCell>
                          <TableCell className="text-slate-300 font-serif">{p.name}</TableCell>
                          <TableCell className="font-mono">{p.qty}</TableCell>
                          <TableCell className="font-mono text-slate-400">${p.costUSD}</TableCell>
                          <TableCell className="font-bold text-amber-500 font-mono">${(p.costUSD * p.qty).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                    {workOrders.flatMap(w => w.replacedParts).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-slate-400 italic">
                          Aucune pièce imputée sur les billets en cours.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* ==================================================================== */}
      {/* TABS CONTENT 13 : RÉGISTRE D'AUDIT SÉCURISÉ ET TRAÇABILITÉ PRO */}
      {/* ==================================================================== */}
      {activeTab === "audit" && (
        <div className="space-y-4 font-sans text-left">
          
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
            <h3 className="text-sm font-black text-rose-450 uppercase flex items-center gap-1.5 font-mono">
              🛡️ SYSTÈME DE DROITS & MATRICE DE CONTRÔLE DES ACCÈS
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              La réglementation de sécurité minière souterraine Hydromines impose un traçage absolu de chaque visa d'intervention technique.
              Chaque action sur la plateforme Sou-GMAO est liée à des habilitations spécifiques décryptées ci-dessous :
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2 mt-3 text-xs">
              {Object.entries(ROLE_PERMISSIONS).map(([roleKey, value]) => (
                <div key={roleKey} className={cn(
                  "p-2.5 rounded border flex flex-col justify-between space-y-1.5 transition-all text-left",
                  activeRole === roleKey 
                    ? "bg-rose-950/20 border-rose-600 shadow-lg scale-[1.01]" 
                    : "bg-slate-955 border-slate-900"
                )}>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-white text-[11px] font-mono">
                      <span>{value.badge}</span>
                      <span className="truncate">{roleKey}</span>
                    </div>
                    <p className="text-[10px] text-slate-450 leading-relaxed mt-1">
                      {value.desc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[9px] font-mono">
                    <span className="text-slate-500">Statut Habilité :</span>
                    <span className={cn(
                      "font-black px-1.5 py-0.5 rounded",
                      activeRole === roleKey ? "bg-rose-900 text-rose-300" : "bg-slate-900 text-slate-450"
                    )}>
                      {activeRole === roleKey ? "ACTIF" : "INACTIF"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-slate-900 border border-slate-850 text-slate-100">
            <CardHeader className="p-3 border-b border-slate-850 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                <span>Registre Réglementaire d'Audit et Traçabilité d'Atelier (Norme SMI)</span>
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAuditLogs([
                    { id: "LOG-INIT", timestamp: new Date().toISOString().replace('T',' ').substring(0,19), role: "CHEF ATELIER", user: "Y. Ouzrirou", action: "Réinitialisation réglementaire forcée du registre d'audit", type: "SYSTEM", source: "ONLINE", siteId: "TOUS" }
                  ]);
                  toast.success("Registre d'audit réinitialisé !");
                }}
                className="text-[9px] font-mono border-rose-950 text-rose-500 hover:bg-rose-950/20 px-2 py-1 h-7"
              >
                EFFACER LES TRACES
              </Button>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="border border-slate-850 rounded overflow-hidden">
                <Table className="text-xs">
                  <TableHeader className="bg-slate-950 text-[10px] uppercase font-mono">
                    <TableRow className="border-b border-slate-850">
                      <TableHead>Numéro Log</TableHead>
                      <TableHead>Horodatage</TableHead>
                      <TableHead>Utilisateur Signataire</TableHead>
                      <TableHead>Rôle de Validation</TableHead>
                      <TableHead>Action Consignée</TableHead>
                      <TableHead>Catégorie Event</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="font-mono text-[11px]">
                    {auditLogs
                      .filter(log => selectedSiteFilter === "TOUS" || log.siteId === selectedSiteFilter)
                      .map((log) => (
                        <TableRow key={log.id} className="border-b border-slate-900 hover:bg-slate-950/50">
                          <TableCell className="text-slate-500">{log.id}</TableCell>
                          <TableCell className="text-slate-300">{log.timestamp}</TableCell>
                          <TableCell className="font-extrabold text-white">{log.user}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[9px] font-black uppercase",
                              log.role === "CHEF ATELIER" ? "bg-amber-950 text-amber-500" :
                              log.role === "SUPERVISEUR" ? "bg-purple-950 text-purple-400" :
                              log.role === "HSE" ? "bg-rose-955 text-white" :
                              log.role === "MÉCANICIEN" ? "bg-sky-950 text-sky-450" : "bg-slate-900 text-slate-450"
                            )}>
                              {log.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-200 text-left font-sans">
                            <div>{log.action}</div>
                            {log.modifiedEntity && (
                              <div className="text-[9px] text-slate-400 font-mono mt-1 border-t border-slate-900/40 pt-1 flex flex-wrap gap-1.5 items-center">
                                <span className="text-amber-500 font-extrabold">⚙️ {log.modifiedEntity}</span>
                                {log.oldValue !== undefined && (
                                  <>
                                    <span className="text-slate-500 text-[8.5px] line-through">({log.oldValue})</span>
                                    <span className="text-emerald-400 text-[8.5px] font-bold">➡️ ({log.newValue})</span>
                                  </>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 items-start">
                              <Badge variant="outline" className={cn(
                                "text-[8px] font-bold px-1 py-0",
                                log.type === "SECURITY" || log.type === "DECLARATION" ? "border-red-650 text-red-400" :
                                log.type === "OFFLINE" ? "border-amber-600 text-amber-500" : "border-slate-800 text-slate-500"
                              )}>
                                {log.type}
                              </Badge>
                              <div className="flex gap-1 pt-0.5">
                                <span className={cn(
                                  "text-[7.5px] px-1 py-0.2 rounded uppercase font-bold",
                                  log.source === "OFFLINE" ? "bg-amber-950 text-amber-400" : "bg-slate-950 text-slate-400"
                                )}>
                                  {log.source}
                                </span>
                                <span className="text-[7.5px] px-1 py-0.2 bg-slate-950 text-slate-350 rounded uppercase font-bold font-mono">
                                  {log.siteId}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-3 bg-slate-950 font-serif text-[11px] leading-relaxed text-slate-400 rounded border border-slate-900 font-mono">
                ⚠️ Conforme à la législation internationale sur le traçage technique d'abattage (GMAO-21 CFR Part 11). Toute fraude d'enregistrement d'état machine commise en fosse est passible de poursuites d'assurance et de retrait de badge minier d'accès.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TABS CONTENT : PILOTE & FORMATION TERRAIN CONSOLE (Objective 6 & 7) */}
      {/* ==================================================================== */}
      {activeTab === "pilote" && (
        <div className="space-y-4 font-sans text-left text-slate-100 animate-in fade-in duration-200">
          
          {/* Main banner & Sandbox Toggle */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2 p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
                  <h3 className="text-sm font-black text-indigo-400 uppercase font-mono">
                    🚀 ZONE DE DÉPLOIEMENT SITE PILOTE • HYDROMINES SOU-3
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-2">
                  Bienvenue sur la console d'évaluation terrain de la Sou-GMAO. Cette page permet d'évaluer l'ergonomie, simuler des scénarios d'onboarding accéléré pour les mécaniciens de fond, et configurer les paramètres de résilience locale sous-colline.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">STATUS :</span>
                  <span className="bg-indigo-950 text-indigo-400 font-extrabold px-2 py-0.5 rounded text-[10px] font-mono border border-indigo-900">
                    V1 TERRAIN PRÊTE
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem("sg_mini_machines");
                      localStorage.removeItem("sg_work_orders");
                      localStorage.removeItem("sg_audit_logs");
                      localStorage.removeItem("sg_user_feedbacks");
                      localStorage.removeItem("sg_offline_queue");
                      toast.success("♻️ Cache vidé ! Rechargement des paramètres d'usine standardisés...", { duration: 3000 });
                      setTimeout(() => window.location.reload(), 1000);
                    }}
                    className="bg-transparent border border-rose-900 hover:bg-rose-950/40 text-rose-400 font-bold text-[10px] h-7"
                  >
                    ♻️ Réinitialiser Base d'Atelier
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const nextS = !sandboxMode;
                      setSandboxMode(nextS);
                      localStorage.setItem("sg_sandbox_mode", nextS ? "true" : "false");
                      toast.info(nextS ? "Mode Bac à Sable activé : simulation libre autorisée." : "Mode Site Pilote Strict actif.");
                    }}
                    className={cn(
                      "text-[10px] font-black h-7 px-3",
                      sandboxMode ? "bg-amber-500 text-slate-950 hover:bg-amber-600" : "bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono border border-slate-700"
                    )}
                  >
                    {sandboxMode ? "🎮 BAC À SABLE ACTIF" : "MODE SÉCURISÉ PILOTE"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Metrics of the Pilot deployment */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between font-mono">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">MÉTRIQUES SIMULATION</span>
              <div className="space-y-1 my-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Profils :</span>
                  <span className="text-white font-extrabold">{REAL_PROFILES.length} Réels</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scénario Actif :</span>
                  <span className="text-amber-400 font-extrabold">
                    {scenarioStep === 0 ? "Non démarré" : `Étape ${scenarioStep} / 6`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Offline Queue :</span>
                  <span className={cn(
                    "font-bold",
                    offlineQueue.length > 0 ? "text-amber-400 animate-pulse" : "text-emerald-400"
                  )}>{offlineQueue.length} Fiches</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Feedbacks Reçus :</span>
                  <span className="text-indigo-400 font-black">{feedbacks.length}</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-450 italic leading-tight">
                Idéal pour former un mécano ou opérateur en 2 minutes d'instructions tactiles.
              </p>
            </div>
          </div>

          {/* OFFLINE QUEUE MONITOR & CONFLICT RESOLVER (Objective 4 - Arbitrage Souterrain) */}
          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="p-3.5 border-b border-slate-850 bg-slate-950/45 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-mono">
                  <Wrench className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                  🔌 TRANSMISSIONS HORS-LIGNE & CONTRE-VÉRIFICATION DE SÉCURITÉ
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-400 mt-1">
                  Revue réglementaire des écritures différées enregistrées sous terre. Diagnostiquez et arbitrez manuellement les anomalies d'états concurrents.
                </CardDescription>
              </div>
              {offlineQueue.length > 0 && (
                <Button
                  size="sm"
                  onClick={handleSyncOfflineQueue}
                  className="bg-amber-500 hover:bg-amber-600 font-extrabold text-slate-950 text-[10px] h-8 shrink-0 flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Re-Rejouer Toute la File
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {offlineQueue.length === 0 ? (
                <div className="text-center py-6 px-4 border border-dashed border-slate-800 rounded-lg m-4 bg-slate-950/25">
                  <div className="text-emerald-400 font-extrabold text-[11px] uppercase tracking-wide mb-1 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Aucune Écriture Souterraine en Suspens
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-lg mx-auto">
                    Toutes les transactions passées ont été rémanisées et injectées avec succès sur la base réglementaire provinciale centralisée. Le defect-book d'Hydromines est exempt de tout conflit d'état.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-950/40">
                      <TableRow className="border-slate-850">
                        <TableHead className="text-[9px] text-slate-450 uppercase font-bold font-mono py-2">Transmis</TableHead>
                        <TableHead className="text-[9px] text-slate-450 uppercase font-bold font-mono py-2">Fiche & Description</TableHead>
                        <TableHead className="text-[9px] text-slate-450 uppercase font-bold font-mono py-2">Diagnostic / Cause Racine</TableHead>
                        <TableHead className="text-[9px] text-slate-450 uppercase font-bold font-mono py-2 text-right">Arbitrage Terrain</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offlineQueue.map((item) => (
                        <TableRow key={item.id} className="border-slate-850 hover:bg-slate-850/40">
                          <TableCell className="font-mono text-[10.5px] text-slate-400 py-2.5">
                            {item.timestamp}
                          </TableCell>
                          <TableCell className="py-2.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="bg-slate-950 px-1 py-0.2 rounded border border-slate-800 text-[8.5px] font-mono text-amber-500 font-black tracking-wide">
                                {item.actionType}
                              </span>
                              <span className="text-[11px] font-bold text-slate-100">{item.label}</span>
                            </div>
                            <div className="text-[9px] text-slate-450 font-mono mt-1 select-all">
                              ID: {item.id} | Payload: {JSON.stringify(item.payload).substring(0, 48)}...
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5">
                            {item.errorStatus ? (
                              <div className="space-y-1">
                                <Badge className="bg-red-950/50 hover:bg-red-950/50 text-red-400 border border-red-900 rounded-sm font-black text-[8px] font-mono tracking-wider">
                                  ⚠️ REPLAY_FAILED ({item.retryCount || 1}e essai)
                                </Badge>
                                <div className="text-[9px] text-red-400 bg-red-950/20 border border-red-900/30 p-1.5 rounded font-mono leading-tight max-w-[280px]">
                                  <div className="font-black text-[8.5px] uppercase text-red-300">CODE : {item.errorStatus}</div>
                                  <div className="text-slate-400 mt-1 leading-normal">
                                    {item.errorStatus.includes("CONTRADICTORY_STATE") 
                                      ? "La machine a déjà changé d'état dans une autre fiche de fin de poste. Révoquez ce doublon."
                                      : "Vérifier si le code engin existe ou s'il s'agit d'une double création."
                                    }
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <Badge className="bg-slate-950 hover:bg-slate-950/50 text-slate-400 border border-slate-850 font-bold text-[8px] font-mono">
                                💤 EN ATTENTE SYNCHRONISATION
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="sm"
                                onClick={() => handleRetryOfflineAction(item.id)}
                                className="h-7 text-[10px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-black flex items-center gap-0.5 rounded-md"
                              >
                                <RefreshCw className="h-2.5 w-2.5" /> Rejouer
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDiscardOfflineAction(item.id)}
                                className="h-7 text-[10px] px-2.5 bg-red-950/50 border border-red-900/50 text-red-400 hover:bg-red-950 rounded-md font-bold"
                              >
                                Révoquer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interactive Scenario Player Step roadmap */}
          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader className="p-3.5 border-b border-slate-850 bg-slate-950/45">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-white">
                    🎯 SIMULATEUR DE CONDITIONS REELLES SOU-3 : SCÉNARIO DE PANNE COMPLET EN 6 CLICS
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-450">
                    Cliquez sur les étapes successives pour simuler un cycle complet d'intervention minière et tester la rapidité d'exécution de la GMAO.
                  </CardDescription>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={handleResetScenario}
                    className="bg-slate-950 text-slate-400 border border-slate-850 hover:bg-slate-900 text-[10px] h-7 px-2 font-mono"
                  >
                    Réinitialiser
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleNextScenarioStep}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white font-black text-[10px] h-7 px-3 flex items-center gap-1 font-mono"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    {scenarioStep === 0 ? "Démarrer" : scenarioStep === 6 ? "Terminé (Relancer)" : "Suivant"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Stepper Steps grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2">
                {[
                  { step: 1, title: "1. Déclaration d'arrêt", actor: "KAMAL (Opérateur) 👷", desc: "La machine ST7-01 signale une fuite hydraulique.", badge: "EN PANNE" },
                  { step: 2, title: "2. Émission du BT", actor: "FATIMA (Secrétaire) 📝", desc: "Création du Bon de Travail réglementaire avec checklist.", badge: "OUVERT" },
                  { step: 3, title: "3. Affectation d'Atelier", actor: "YOUSSEF (Chef Atelier) 👑", desc: "Prise en charge officielle par le mécanicien.", badge: "EN_COURS" },
                  { step: 4, title: "4. Consignation LOTO", actor: "MUSTAPHA (Mécano) 🔧", desc: "Verrouillage cadenas et exécution checklist.", badge: "PIÈCES_ATTRIBUÉES" },
                  { step: 5, title: "5. Double validation", actor: "MUSTAPHA & YOUSSEF 🖋️", desc: "Validation de pression et signatures conjointes.", badge: "RÉSOLU" },
                  { step: 6, title: "6. Remise en service", actor: "PRODUCTION SOU-3 🚀", desc: "Retrait LOTO, BT clos et machine reportée DISPO.", badge: "CLOS" },
                ].map(s => {
                  const isActive = scenarioStep === s.step;
                  const isDone = scenarioStep > s.step;
                  return (
                    <div 
                      key={s.step} 
                      onClick={() => {
                        if (scenarioStep >= s.step - 1) {
                          setScenarioStep(s.step - 1);
                          setTimeout(() => {
                            if (s.step === 1) setScenarioStep(0);
                            else if (s.step === 2) setScenarioStep(1);
                            else if (s.step === 3) setScenarioStep(2);
                            else if (s.step === 4) setScenarioStep(3);
                            else if (s.step === 5) setScenarioStep(4);
                            else if (s.step === 6) setScenarioStep(5);
                            handleNextScenarioStep();
                          }, 50);
                        } else {
                          toast.error(`Veuillez d'abord compléter l'étape ${s.step - 1} !`);
                        }
                      }}
                      className={cn(
                        "p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 relative h-36 select-none",
                        isActive 
                          ? "bg-amber-500/10 border-amber-500 shadow-lg scale-[1.02]" 
                          : isDone 
                            ? "bg-emerald-950/20 border-emerald-800/80 text-emerald-400"
                            : "bg-slate-950/40 border-slate-900 text-slate-500 hover:border-slate-800"
                      )}
                    >
                      {/* Top indicator bar */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black font-mono text-slate-400">ÉTAP{s.step}</span>
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 font-extrabold" />
                        ) : isActive ? (
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-slate-800" />
                        )}
                      </div>

                      {/* Content text */}
                      <div>
                        <div className={cn(
                          "text-[10px] font-extrabold font-mono uppercase tracking-tight truncate",
                          isActive ? "text-amber-400" : isDone ? "text-emerald-400" : "text-slate-350"
                        )}>
                          {s.title}
                        </div>
                        <p className="text-[9px] text-slate-400 leading-tight mt-1">
                          {s.desc}
                        </p>
                      </div>

                      {/* Bottom Role indicator metadata */}
                      <div className="pt-2 border-t border-slate-900/40 flex justify-between items-center text-[9px] font-mono">
                        <span className="text-[8px] text-slate-500 truncate max-w-[80px]">{s.actor}</span>
                        <span className={cn(
                          "px-1 rounded text-[8px] font-black uppercase",
                          s.badge === "EN PANNE" ? "bg-red-955 text-red-400" :
                          s.badge === "OUVERT" ? "bg-amber-955/50 text-amber-500" :
                          s.badge === "CLOS" ? "bg-emerald-955 text-emerald-400" : "bg-sky-955 text-sky-450"
                        )}>
                          {s.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step Context explanation instruction box */}
              {scenarioStep > 0 && (
                <div className="p-3 bg-slate-950 text-xs border border-indigo-900 rounded-lg space-y-1.5 font-sans">
                  <span className="font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1 text-[10px] font-mono">
                    📘 CONTEXTE ET RÈGLEMENTATION TERRAIN APPLICABLE : ÉTAPE {scenarioStep}
                  </span>
                  {scenarioStep === 1 && (
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      <strong>Abattage et Déclaration d'Arrêt :</strong> Lorsqu'un opérateur détecte une baisse de pression hydraulique sur un raccord haute tension ou une fuite d'huile, la réglementation impose un arrêt immédiat pour éviter l'inflammation de l'huile. L'opérateur passe par son interface en un seul bouton pour déclarer l'arrêt et consigner l'engin.
                    </p>
                  )}
                  {scenarioStep === 2 && (
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      <strong>Établissement du Bon de Travail (BT) :</strong> La Secrétaire d'Atelier Fatima coordonne instantanément le flux d'informations. Elle associe l'arrêt de production à un billet technique structuré. Les tâches de maintenance requièrent des pièces détachées correspondantes (imputées avec leurs coûts de magasin réels). Elle peut pré-imprimer le papier pour le donner au mécanicien d'atelier.
                    </p>
                  )}
                  {scenarioStep === 3 && (
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      <strong>Attribution d'Atelier :</strong> Le Chef d'Atelier Youssef évalue la priorité en fonction du plan de tir et du goulot de bouteille. Il attribue officiellement le BT au spécialiste hydraulique Mustapha, qui valide la prise en charge à l'aide de son badge unique.
                    </p>
                  )}
                  {scenarioStep === 4 && (
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      <strong>Normes LOTO (Lockout/Tagout) d'Atelier :</strong> Risque d'activation accidentelle de pompe hydraulique durant le serrage ! C'est la priorité numéro une d'Hydromines. Le mécanicien Mustapha verrouille le sectionneur électrique principal, place son cadenas marqué et signe l'étape 1 de la checklist technique avant d'approcher ses clés.
                    </p>
                  )}
                  {scenarioStep === 5 && (
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      <strong>Double Signatures de Sécurité :</strong> Aucun essai sous haute pression ne peut se faire seul. L'essai mécanique requiert le visa conjoint de l'Opérateur pour s'assurer que le confort en cabine est respecté, et du Chef d'Atelier pour valider le couple de serrage. Les visas électroniques sont enregistrés et infalsifiables.
                    </p>
                  )}
                  {scenarioStep === 6 && (
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      <strong>Clôture et Archivage :</strong> Une fois le raccord hydraulique validé conforme, le cadenas LOTO est retiré et consigné. Le Bon de Travail passe au statut CLOS et l'indicateur de disponibilité globale se recalcule automatiquement à 100%. L'action est transmise au registre d'audit d'Hydromines.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Training pocket guides for role personas (Objective 6 & 8) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Guide Opérateur */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-xs text-white uppercase font-mono flex items-center gap-1.5">
                    👷 GUIDE OPÉRATEUR MINE
                  </span>
                  <Badge className="bg-slate-950 text-amber-500 text-[8px] font-bold font-mono">PRE-SHIFT</Badge>
                </div>
                <div className="space-y-1.5 mt-2.5 text-[11px] text-slate-350">
                  <div className="flex gap-1.5 items-start">
                    <span className="font-bold text-amber-500">1.</span>
                    <span>Consultez l'état de l'engin dans votre galerie avant chaque début de poste.</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="font-bold text-amber-500">2.</span>
                    <span>En cas d'anomalie détectée (Lumière de fuite, bruit de transmission), cliquez sur <strong>Déclarer un Arrêt</strong>.</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="font-bold text-amber-500">3.</span>
                    <span>Signez l'autorisation d'entrée réglementaire après inspection conjointe avec le mécanicien.</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setActiveTab("engins");
                  toast.success("Redirection vers l'inventaire : cliquez sur un engin 'Disponible' pour déclarer un arrêt en 2 clics !");
                }}
                className="w-full text-[10px] bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-900 font-mono"
              >
                Simuler Prise en main Opérateur
              </Button>
            </div>

            {/* Guide Mécanicien */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-xs text-white uppercase font-mono flex items-center gap-1.5">
                    🔧 GUIDE MÉCANICIEN FORCE
                  </span>
                  <Badge className="bg-slate-950 text-sky-400 text-[8px] font-bold font-mono">ATELIER SOU-3</Badge>
                </div>
                <div className="space-y-1.5 mt-2.5 text-[11px] text-slate-350">
                  <div className="flex gap-1.5 items-start">
                    <span className="font-bold text-sky-400">1.</span>
                    <span>Sélectionnez l'onglet <strong>Atelier</strong> ou <strong>BT</strong> pour voir vos affectations.</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="font-bold text-sky-400">2.</span>
                    <span>Validez chaque raccord par les fiches checklists. Activez le <strong>mode tactile</strong> si vous portez des gants !</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="font-bold text-sky-400">3.</span>
                    <span>À la fin, apposez votre signature d'autorisation de pression avant le redémarrage.</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setActiveTab("atelier");
                  toast.success("Redirection vers l'Atelier d'Urgence : utilisez les fiches d'intervention tactiles d'atelier !");
                }}
                className="w-full text-[10px] bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-900 font-mono"
              >
                Simuler Prise en main Mécano
              </Button>
            </div>

            {/* Guide Secrétaire / Chef d'Atelier */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-xs text-white uppercase font-mono flex items-center gap-1.5">
                    📝 GUIDE SECRÉTARIAT & SUIVI
                  </span>
                  <Badge className="bg-slate-950 text-indigo-400 text-[8px] font-bold font-mono">DIRECTION SATELLITE</Badge>
                </div>
                <div className="space-y-1.5 mt-2.5 text-[11px] text-slate-350">
                  <div className="flex gap-1.5 items-start">
                    <span className="font-bold text-indigo-400">1.</span>
                    <span>Ouvrez et planifiez de nouveaux Bons de Travail pour maintenir le retard (Backlog) sous contrôle.</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="font-bold text-indigo-400">2.</span>
                    <span>Générez des rapports en un clic et exportez la table consolidée vers Microsoft Excel (Bouton CSV).</span>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="font-bold text-indigo-400">3.</span>
                    <span>Pour imprimer, cliquez sur 📠 dans la fiche BT pour générer le bon papier d'intervention officiel.</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setActiveTab("bt");
                  toast.success("Redirection vers le registre des BT : testez la recherche en direct et l'impression !");
                }}
                className="w-full text-[10px] bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-900 font-mono"
              >
                Simuler Prise en main Secrétaire
              </Button>
            </div>

          </div>

          {/* Feedback section - Deploiement pilote feedback collection (Objective 7) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Feedback submit form */}
            <Card className="bg-slate-900 border border-slate-850 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850 bg-slate-950/20">
                <CardTitle className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>COLLECTE DES RETOURS D'EXPÉRIENCE TERRAIN (FEEDBACKS PILOTE)</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-450">
                  Les ingénieurs d'Hydromines analysent ce registre pour optimiser l'ergonomie lors des tests sous colline.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Catégorie d'évaluation :</label>
                    <select
                      className="w-full bg-slate-950 text-white border border-slate-800 p-2 rounded text-xs focus:border-amber-500 focus:ring-0 outline-none"
                      value={newFeedbackCategory}
                      onChange={(e) => setNewFeedbackCategory(e.target.value)}
                    >
                      <option value="Ergonomie Tactile 🧤">Ergonomie Tactile & Gants 🧤</option>
                      <option value="Qualité Réseau 🔌">Qualité Réseau & Offline 🔌</option>
                      <option value="Simplicité de Saisie ⚙️">Simplicité de Saisie ⚙️</option>
                      <option value="Temps d'Action ⏱️">Vitesse d'action d'Atelier ⏱️</option>
                      <option value="Autre suggestion">Autre suggestion terrain</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Sentiment / Indicateur :</label>
                    <select
                      className="w-full bg-slate-950 text-white border border-slate-800 p-2 rounded text-xs focus:border-amber-500 focus:ring-0 outline-none"
                      value={newFeedbackType}
                      onChange={(e) => setNewFeedbackType(e.target.value)}
                    >
                      <option value="POSITIF">POSITIF 👍 (Le workflow est génial)</option>
                      <option value="SUGGESTION">SUGGESTION 💡 (Une proposition d'amélioration)</option>
                      <option value="CRITIQUE">SIGNAL CRITIQUE 🚨 (Bloquant en fosse)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-mono">Observation terrain détaillée :</label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-950 text-white border border-slate-800 p-2 rounded text-xs font-mono focus:border-amber-500 focus:ring-0 outline-none"
                    placeholder="Saisissez ici l'observation recueillie auprès du mineur..."
                    value={newFeedbackContent}
                    onChange={(e) => setNewFeedbackContent(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                  <span>Auteur actif : <strong className="text-slate-400 font-extrabold">{currentUser.name}</strong></span>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!newFeedbackContent.trim()) {
                        toast.error("Veuillez saisir votre observation avant d'envoyer !");
                        return;
                      }

                      const now = new Date();
                      const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);
                      
                      const newF = {
                        id: `FDB-${Math.floor(10 + Math.random() * 90)}`,
                        timestamp: timeStr,
                        user: currentUser.name,
                        role: currentUser.role,
                        category: newFeedbackCategory,
                        content: newFeedbackContent,
                        signalType: newFeedbackType,
                        network: offlineMode ? "OFFLINE" : "WIFI"
                      };

                      if (offlineMode) {
                        queueOfflineAction("PILOT_FEEDBACK", newF, `Formulaire retour terrain : ${newFeedbackCategory}`);
                      } else {
                        setFeedbacks(prev => [newF, ...prev]);
                        toast.success("✅ Retour d'expérience enregistré avec succès dans la base centrale !");
                      }

                      setNewFeedbackContent("");
                      addAuditLog(`Dépôt de retour terrain pilote sur ${newFeedbackCategory}`, "FEEDBACK");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs h-8 px-4"
                  >
                    🚀 Transmettre retour d'Atelier
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feedbacks activity listing */}
            <Card className="bg-slate-900 border border-slate-850 text-slate-100">
              <CardHeader className="p-3 border-b border-slate-850 bg-slate-950/20">
                <CardTitle className="text-xs font-black uppercase text-white tracking-widest flex items-center justify-between">
                  <span>📜 REGISTRE EN DIRECT : RETOURS DES SITES PILOTES</span>
                  <Badge className="bg-indigo-950 text-indigo-400 font-mono text-[9px] hover:bg-indigo-950">
                    {feedbacks.length} Consignés
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                  {feedbacks.map((f, idx) => (
                    <div key={idx} className="p-2.5 rounded border border-slate-850 bg-slate-950/40 text-xs text-left space-y-1.5 font-mono">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-black uppercase",
                            f.signalType === "POSITIF" ? "bg-emerald-950 text-emerald-400" :
                            f.signalType === "SUGGESTION" ? "bg-amber-950 text-amber-500" : "bg-red-955 text-white"
                          )}>
                            {f.signalType}
                          </span>
                          <span className="text-[10px] font-bold text-white">{f.category}</span>
                        </div>
                        <span className="text-[9px] text-slate-500">{f.timestamp}</span>
                      </div>

                      <p className="text-[11px] text-slate-300 font-sans italic my-1 leading-snug">
                        "{f.content}"
                      </p>

                      <div className="flex justify-between text-[9px] text-slate-500 border-t border-slate-900/40 pt-1">
                        <span>Technicien : <strong className="text-slate-400">{f.user}</strong> ({f.role})</span>
                        <span className={cn(
                          "px-1 py-0.5 rounded text-[8px] font-black flex items-center gap-1",
                          f.network === "WIFI" ? "bg-emerald-950/20 text-emerald-400" : "bg-amber-955/20 text-amber-500"
                        )}>
                          🛜 {f.network}
                        </span>
                      </div>
                    </div>
                  ))}
                  {feedbacks.length === 0 && (
                    <div className="text-center py-10 text-slate-500 italic">
                      Aucun retour d'expérience consigné sur le site pilote pour l'instant.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      )}

      {/* ==================================================================== */}
      {/* PRINT MODAL OVERLAY (Objective 8) */}
      {/* ==================================================================== */}
      {printingBT && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-lg max-w-2xl w-full p-6 shadow-2xl border border-slate-300 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-mono font-black text-rose-600 tracking-widest uppercase">
                ⚙️ GMAO HYDROMINES • BON DE TRAVAIL PRÉ-IMPRESSION
              </span>
              <button 
                onClick={() => setPrintingBT(null)}
                className="text-slate-500 hover:text-slate-800 text-xs font-bold font-mono px-2 py-1 rounded hover:bg-slate-100"
              >
                [ FERMER / ESC ]
              </button>
            </div>

            {/* Printable Frame Area */}
            <div id="bt-print-area" className="border-4 border-double border-slate-800 p-6 bg-slate-50 font-mono text-[11px] space-y-4 text-left">
              <div className="flex justify-between items-start border-b border-slate-450 pb-3">
                <div>
                  <h2 className="text-base font-black tracking-tighter">HYDROMINES S.A.</h2>
                  <p className="text-[10px] text-slate-500">GMAO FOSSE SOUTERRAINE • ATELIER SOU-3</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold border border-slate-800 px-2 py-0.5 bg-slate-200">{printingBT.id}</span>
                  <p className="text-[9px] text-slate-500 mt-1">Émis le : {printingBT.creationDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Code Engin :</span>
                  <span className="text-sm font-extrabold">{printingBT.machineCode}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Catégorie Interv. :</span>
                  <span className="text-xs font-black uppercase text-amber-700">{printingBT.category}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Libellé / Titre de la Panne :</span>
                <p className="text-xs font-bold bg-white p-2 border border-slate-350 rounded font-serif italic text-slate-850">
                  {printingBT.title}
                </p>
              </div>

              <div className="space-y-1.5 bg-white p-2 border border-slate-300 rounded">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Checklist de Sécurité & Validation Atelier :</span>
                {printingBT.checklist.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-bold">{c.done ? "[X]" : "[ ]"}</span>
                    <span className={c.done ? "line-through text-slate-400" : "text-slate-800"}>{c.task}</span>
                  </div>
                ))}
              </div>

              {/* Visa validation signatures */}
              <div className="space-y-1 bg-white p-2 border border-slate-300 rounded">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Registre des Visas & Approbations Officielles :</span>
                {printingBT.actionsHistory.map((h, idx) => (
                  <div key={idx} className="text-[10px] border-b border-slate-100 last:border-b-0 py-1 flex justify-between">
                    <span>{h.timestamp} - <strong className="font-bold">{h.role}</strong> : {h.action}</span>
                    <span className="text-[9px] bg-slate-100 px-1 italic">Signataire: {h.user}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-[8px] text-slate-400 border-t border-slate-300 pt-3 italic">
                <span>IMPRIMÉ CORRESPONDANT AUX SPÉCIFICATIONS DE SÉCURITÉ MINIEST 2026</span>
                <span>SIGNATURE MANUELLE OBLIGATOIRE SUR SITE</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setPrintingBT(null)}
                className="text-xs font-mono"
              >
                Annuler
              </Button>
              <Button 
                onClick={() => {
                  window.print();
                  toast.success("Impression physique envoyée vers l'imprimante d'atelier !");
                  addAuditLog(`Impression papier réglementaire du bon de travail ${printingBT.id}`, "PRINT");
                  setPrintingBT(null);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs flex items-center gap-1.5"
              >
                📠 Imprimer (Papier d mecano)
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
