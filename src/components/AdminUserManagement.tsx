// [ignoring loop detection]
import * as React from "react";
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, UserRole, SiteID } from "@/types";
import { toast } from "sonner";
import { 
  Users, 
  Shield, 
  ShieldAlert, 
  Search, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Key, 
  Filter, 
  Grid, 
  Clock,
  Eye
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
import { AuditViewers } from "./AuditViewers";

const ALL_ROLES: { value: UserRole; label: string }[] = [
  { value: "ADMIN", label: "Administrateur" },
  { value: "DIRECTION", label: "Direction Générale" },
  { value: "RESPONSABLE_MAINTENANCE", label: "Responsable Maintenance" },
  { value: "RESPONSABLE_CHANTIER", label: "Responsable de Chantier" },
  { value: "MECANICIEN", label: "Mécanicien d'Atelier" },
  { value: "SECRETAIRE", label: "Secrétaire de Chantier" }
];

const ALL_SITES: { value: SiteID; label: string }[] = [
  { value: "SMI", label: "SMI" },
  { value: "OUMEJRANE", label: "OUMEJRANE" },
  { value: "KOUDIA", label: "KOUDIAT AICHA" },
  { value: "OUANSIMI", label: "OUANSIMI" },
  { value: "BOU-AZZER", label: "BOU-AZZER" },
  { value: "TOUS", label: "TOUS (Super administration)" }
];

export function AdminUserManagement() {
  const { user } = useAuthStore();
  const [activeSubTab, setActiveSubTab] = React.useState<"users" | "viewers">("users");
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Filtering and Searching State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [siteFilter, setSiteFilter] = React.useState<string>("ALL");
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    const q = collection(db, "users");
    
    // Subscribe in real-time for immediate reactivity
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const uList: any[] = [];
      snapshot.forEach((doc) => {
        uList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(uList);
      setLoading(false);
    }, (err) => {
      console.error("Firestore users listener error: ", err);
      toast.error("Impossible de charger les profils utilisateurs en temps réel.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Toggle user activation status (Approve/Deactivate)
  const handleToggleActive = async (userId: string, currentStatus: boolean, emailStr: string) => {
    // Prevent locking the super administrator out
    if (emailStr.toLowerCase() === "yahyaouzrirou@gmail.com") {
      toast.error("Le compte Super Administrateur principal ne peut pas être désactivé.");
      return;
    }

    setIsUpdating(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        active: !currentStatus
      });
      toast.success(`Habilitations de ${emailStr} mises à jour avec succès.`);
    } catch (err: any) {
      console.error("Failed to toggle status:", err);
      toast.error(`Erreur d'écriture: ${err.message || err}`);
    } finally {
      setIsUpdating(null);
    }
  };

  // Modify user role securely (Phase 2 Secure Assignment)
  const handleRoleChange = async (userId: string, newRole: UserRole, emailStr: string) => {
    if (emailStr.toLowerCase() === "yahyaouzrirou@gmail.com") {
      toast.error("Le rôle Super Administrateur de Yahya Ouzrirou est immuable.");
      return;
    }

    setIsUpdating(userId);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole
      });
      toast.success(`Nouveau rôle assigné avec succès : ${newRole}`);
    } catch (err: any) {
      console.error("Failed to update role:", err);
      toast.error(`Erreur d'écriture: ${err.message || err}`);
    } finally {
      setIsUpdating(null);
    }
  };

  // Securely force-reset a user session (de-authorizes current active tokens)
  const handleForceResetSession = async (userId: string, emailStr: string) => {
    setIsUpdating(userId);
    try {
      const userRef = doc(db, "users", userId);
      // We set active to false to force them through approval / re-auth screen
      await updateDoc(userRef, {
        active: false,
        sessionResetKey: Date.now()
      });
      toast.warning(`Session de ${emailStr} révoquée. L'agent devra demander de nouvelles habilitations.`);
    } catch (err: any) {
      console.error("Failed to revoke session:", err);
      toast.error(`Erreur d'annulation: ${err.message || err}`);
    } finally {
      setIsUpdating(null);
    }
  };

  // Process filters
  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    const nameStr = (u.displayName || u.name || "").toLowerCase();
    const mailStr = (u.email || "").toLowerCase();
    const matchesSearch = nameStr.includes(term) || mailStr.includes(term);

    const matchesSite = siteFilter === "ALL" || u.siteId === siteFilter;
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesSite && matchesRole;
  });

  return (
    <div className="p-6 space-y-6 bg-[#0c1220] min-h-screen text-slate-100 font-sans">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#4FC3F7]" />
            <h2 className="text-xl font-black uppercase tracking-wider text-white">
              Gestionnaire d'Habilitations SOU-GMAO
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Console d'administration de la sécurité pour les sites d'extraction et les ateliers d'Hydromines.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#090e18] border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-mono">
          <span className="h-2 w-2 rounded-full bg-[#4FC3F7] animate-pulse" />
          <span className="text-[#4FC3F7] font-bold uppercase">Supervision Live : {users.length} Comptes</span>
        </div>
      </div>

      {/* Navigation sub-tabs inside Administration - Visible Only to Admin */}
      {user?.role === "ADMIN" && (
        <div className="flex border-b border-slate-800/60 pb-px">
          <button
            onClick={() => setActiveSubTab("users")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all leading-none ${
              activeSubTab === "users"
                ? "border-[#4FC3F7] text-[#4FC3F7]"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            👥 Gestion des Agents
          </button>
          <button
            onClick={() => setActiveSubTab("viewers")}
            className={`px-5 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all leading-none ${
              activeSubTab === "viewers"
                ? "border-[#4FC3F7] text-[#4FC3F7]"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            👁️ Analyse des Viewers
          </button>
        </div>
      )}

      {activeSubTab === "viewers" && user?.role === "ADMIN" ? (
        <AuditViewers />
      ) : (
        <>
          {/* Stats Counter Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-[#121b2d] border-slate-800 shadow-xl rounded-xl p-4.5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-slate-450 uppercase leading-none">Total Agents</p>
                <p className="text-2.5xl font-black text-white m-0 leading-none">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-slate-700" />
            </Card>

            <Card className="bg-[#121b2d] border-slate-800 shadow-xl rounded-xl p-4.5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-400 uppercase leading-none">Habilités / Actifs</p>
                <p className="text-2.5xl font-black text-emerald-400 m-0 leading-none">{users.filter(u => u.active !== false).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-900/40" />
            </Card>

            <Card className="bg-[#121b2d] border-[#ea4335]/30 shadow-xl rounded-xl p-4.5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-[#ea4335] uppercase leading-none">En Attente / Suspendus</p>
                <p className="text-2.5xl font-black text-[#ea4335] m-0 leading-none">{users.filter(u => u.active === false).length}</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-rose-950/40" />
            </Card>

            <Card className="bg-[#121b2d] border-slate-800 shadow-xl rounded-xl p-4.5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-mono tracking-wider font-extrabold text-slate-400 uppercase leading-none">Sites Opérationnels</p>
                <p className="text-2.5xl font-black text-white m-0 leading-none">5 Sites</p>
              </div>
              <Grid className="h-8 w-8 text-slate-700" />
            </Card>
          </div>

          {/* Filtering Actions Menu */}
          <Card className="bg-[#101726] border-slate-800 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Quick Search */}
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-10 bg-[#090e18] border-slate-800 text-slate-200 placeholder:text-slate-600 rounded-xl focus:ring-[#4FC3F7]"
                />
              </div>

              {/* Filter Site Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={siteFilter}
                  onChange={(e) => setSiteFilter(e.target.value)}
                  className="w-full h-11 px-3 bg-[#090e18] border border-slate-800 text-slate-300 rounded-xl focus:outline-none focus:ring-[#4FC3F7]"
                >
                  <option value="ALL">Tous les sites</option>
                  {ALL_SITES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Filter Role Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full h-11 px-3 bg-[#090e18] border border-slate-850 text-slate-305 rounded-xl focus:outline-none focus:ring-[#4FC3F7]"
                >
                  <option value="ALL">Tous les rôles</option>
                  {ALL_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Reset Filters button */}
              <div className="md:col-span-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSearchQuery("");
                    setSiteFilter("ALL");
                    setRoleFilter("ALL");
                  }}
                  className="h-11 w-full border-slate-800 bg-[#090e18] hover:bg-slate-900 rounded-xl"
                >
                  <RefreshCw className="h-4.5 w-4.5 text-slate-400" />
                </Button>
              </div>

            </div>
          </Card>

          {/* Main interactive dynamic list */}
          <Card className="bg-[#101726] border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <CardHeader className="py-4.5 px-6 border-b border-slate-900/60 bg-[#121929]">
              <CardTitle className="text-xs font-black text-slate-400 tracking-widest uppercase m-0 flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-[#4FC3F7]" />
                RÉPERTOIRE DES ACCÈS ET CONTRÔLE DES RÔLES
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <RefreshCw className="h-8 w-8 text-[#4FC3F7] animate-spin" />
                  <p className="text-xs text-slate-500 font-mono uppercase font-bold animate-pulse">Syncing user database schema...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-20 text-center text-slate-600">
                  Aucun agent enregistré ne correspond aux filtres appliqués.
                </div>
              ) : (
                /* Glove-friendly virtualized list style table */
                <div className="divide-y divide-slate-800/80">
                  {filteredUsers.map((u) => {
                    const isSuperAdmin = u.email?.toLowerCase() === "yahyaouzrirou@gmail.com";
                    const isUserActive = u.active !== false;

                    return (
                      <div 
                        key={u.id} 
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-[#121a2c]/40 transition-colors duration-200"
                      >
                        
                        {/* Column 1: Profile identity */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`h-11.5 w-11.5 rounded-xl flex items-center justify-center font-bold text-sm bg-gradient-to-br ${
                            isUserActive 
                              ? "from-[#4FC3F7]/20 to-[#4FC3F7]/5 text-[#4FC3F7] border border-[#4FC3F7]/30" 
                              : "from-[#ea4335]/20 to-[#ea4335]/5 text-[#ea4335] border border-[#ea4335]/30"
                          }`}>
                            {u.displayName?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "HM"}
                          </div>

                          <div className="space-y-1 overflow-hidden">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-black text-white">{u.displayName}</span>
                              {isSuperAdmin && (
                                <span className="px-2 py-0.5 bg-rose-600 text-[8px] font-black uppercase rounded text-white tracking-widest">
                                  SUPER ADMIN
                                </span>
                              )}
                              {!isUserActive && (
                                <span className="px-2 py-0.5 bg-rose-950/60 border border-rose-500/20 text-[#ea4335] text-[8px] font-black uppercase rounded tracking-widest leading-none">
                                  EN ATTENTE / ACCÈS SUSPENDU
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-mono text-slate-450 truncate m-0">{u.email}</p>
                            <div className="flex items-center gap-3.5 text-[10px] text-slate-500 font-mono">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-600" />
                                Ins. : {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "Inconnu"}
                              </span>
                              <span>•</span>
                              <span className="text-[#4FC3F7] font-semibold">
                                Dernier accès : {u.lastLogin ? new Date(u.lastLogin).toLocaleTimeString("fr-FR") : "Aucun"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Site assignment & Secure Role Modification */}
                        <div className="flex flex-wrap items-center gap-4">
                          
                          {/* ASSIGNED SITE TAG */}
                          <div className="flex flex-col">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Affectation Site</span>
                            <div className="px-3.5 py-1.5 bg-[#090e18] border border-slate-850 rounded-lg text-slate-300 font-black text-xs">
                              {u.siteId || "SMI"}
                            </div>
                          </div>

                          {/* SECURE ROLE ASSIGNMENT DROPDOWN (Glove friendly) */}
                          <div className="flex flex-col">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Validation du Rôle</span>
                            <select
                              disabled={isSuperAdmin || isUpdating === u.id}
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole, u.email)}
                              className="h-9 px-2 bg-[#090e18] border border-slate-800 text-slate-300 text-xs rounded-lg font-semibold focus:outline-none focus:ring-1 focus:ring-[#4FC3F7] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {ALL_ROLES.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                          </div>

                        </div>

                        {/* Column 3: Structural security controls (Tactile Glove buttons 48px target-friendly) */}
                        <div className="flex items-center gap-2">
                          
                          {/* Approved status controller */}
                          <Button
                            disabled={isSuperAdmin || isUpdating === u.id}
                            onClick={() => handleToggleActive(u.id, isUserActive, u.email)}
                            className={`h-11 px-4 text-[10px] font-black uppercase tracking-wider rounded-xl border-none transition-all ${
                              isUserActive 
                                ? "bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/30" 
                                : "bg-rose-950/60 text-[#ea4335] hover:bg-rose-900/30"
                            }`}
                          >
                            {isUserActive ? (
                              <>
                                <Unlock className="h-4 w-4 mr-1.5" /> Actif (Suspendre)
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-1.5" /> Suspendu (Approuver)
                              </>
                            )}
                          </Button>

                          {/* Force Reset Session button */}
                          <Button
                            disabled={isSuperAdmin || isUpdating === u.id}
                            onClick={() => handleForceResetSession(u.id, u.email)}
                            className="h-11 w-11 bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 rounded-xl"
                            title="Révoquer la session active de l'appareil"
                          >
                            <Key className="h-4 w-4 text-amber-500" />
                          </Button>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
