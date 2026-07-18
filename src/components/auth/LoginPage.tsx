import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, ShieldAlert, Cpu, Check, Activity, Wifi, WifiOff, Loader2, RefreshCw, Sun, Moon } from "lucide-react";
import { UserRole, SiteID, User } from "@/types";
import { toast } from "sonner";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { dbService } from "@/services/firestoreService";
import { HydrominesLogo } from "./HydrominesLogo";

// @ts-ignore
import mining_login_bg from "@/assets/images/hydromines_enhanced_daylight_workshop_bg_1779983164497.png";
// Site mappings 
const SITES_LIST = [
  { id: "SMI", label: "SMI (Imiter)" },
  { id: "OUMEJRANE", label: "OUMEJRANE" },
  { id: "KOUDIA", label: "KOUDIAT AICHA" },
  { id: "OUANSIMI", label: "OUANSIMI" },
  { id: "BOU-AZZER", label: "BOU-AZZER" },
  { id: "ADMINISTRATION", label: "ADMINISTRATION CENTRALE" }
];

export function LoginPage() {
  console.log("LOGIN DEBUG ACTIVE");

  const setUser = useAuthStore((state) => state.setUser);
  const { theme, setTheme } = useAuthStore();
  
  // App authentication workflow state
  const [authMode, setAuthMode] = React.useState<"CONNEXION" | "S_INSCRIRE" | "ONBOARDING">("CONNEXION");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  // Stored Google Auth payload for Onboarding
  const [googleUser, setGoogleUser] = React.useState<{ uid: string; email: string; displayName: string } | null>(null);
  
  // Onboarding Form State
  const [formNom, setFormNom] = React.useState("");
  const [formSite, setFormSite] = React.useState<string>("SMI");
  const [formRole, setFormRole] = React.useState<string>("");

  const [cachedUsersList, setCachedUsersList] = React.useState<User[]>([]);

  // Monitor cache and load previously authenticated profiles on mount
  React.useEffect(() => {
    try {
      const rawCache = localStorage.getItem("sg_offline_cache_users");
      if (rawCache) {
        setCachedUsersList(JSON.parse(rawCache));
      }
    } catch (e) {
      console.error("Reading cached sessions failed:", e);
    }
  }, []);

  // Monitor network status
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.info("🔌 Connexion réseau rétablie avec l'atelier de surface.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("🔌 Réseau instable / Passage en mode souterrain autonome.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Set default role when site switches during onboarding
  React.useEffect(() => {
    if (formSite === "ADMINISTRATION") {
      setFormRole("RESPONSABLE_MAINTENANCE");
    } else {
      setFormRole("RESPONSABLE_CHANTIER");
    }
  }, [formSite]);

  // Google Authentication popup dispatcher 
  const triggerGoogleAuthAndRetrieveUser = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account"
    });
    
    const userCredential = await signInWithPopup(auth, provider);
    const u = userCredential.user;
    if (!u) throw new Error("Google Authentication a renvoyé un profil vide.");
    
    return {
      uid: u.uid,
      email: u.email || "",
      displayName: u.displayName || ""
    };
  };

  // Connection Handler
  const handleConnexionFlow = async () => {
    setIsLoading(true);
    try {
      if (!isOnline) {
        toast.error("Connexion cloud impossible : l'appareil est actuellement hors-ligne.");
        setIsLoading(false);
        return;
      }

      const verifiedUser = await triggerGoogleAuthAndRetrieveUser();
      const userRef = doc(db, "users", verifiedUser.uid);
      const userSnap = await getDoc(userRef);

      // SPECIAL ADMIN EMAIL RULE ( yahyaouzrirou@gmail.com )
      if ((verifiedUser.email || "").toLowerCase() === "yahyaouzrirou@gmail.com") {
        const adminProfile: User = {
          uid: verifiedUser.uid,
          displayName: "Yahya Ouzrirou",
          email: verifiedUser.email,
          role: "ADMIN",
          siteId: "TOUS"
        };
        
        await dbService.users.set(verifiedUser.uid, {
          ...adminProfile,
          active: true,
          authProvider: "google",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });

        setUser(adminProfile);
        toast.success("🔐 Accès Super Administration : Yahya Ouzrirou");
        return;
      }

      if (userSnap.exists()) {
        const dbData = userSnap.data();
        const activeUser: User = {
          uid: verifiedUser.uid,
          displayName: dbData.displayName || verifiedUser.displayName,
          email: verifiedUser.email,
          role: dbData.role || "MECANICIEN",
          siteId: dbData.siteId || "SMI",
          active: dbData.active !== false
        };

        try {
          await dbService.users.update(verifiedUser.uid, { lastLogin: new Date().toISOString() });
        } catch (err) {
          console.warn("Échec d'enregistrement du login timestamp", err);
        }

        setUser(activeUser);
        if (activeUser.active !== false) {
          try {
            const rawCache = localStorage.getItem("sg_offline_cache_users");
            const listObj: User[] = rawCache ? JSON.parse(rawCache) : [];
            const filteredList = listObj.filter(u => u.uid !== activeUser.uid);
            filteredList.push(activeUser);
            localStorage.setItem("sg_offline_cache_users", JSON.stringify(filteredList));
          } catch (e) {
            console.error("Failed to commit cached session", e);
          }
          toast.success(`Accès autorisé : Bienvenue, ${activeUser.displayName}`);
        } else {
          toast.warning("Votre compte est actuellement en attente d'approbation d'un Administrateur.");
        }
      } else {
        // Automatically direct new Google profiles to onboarding fiche!
        setGoogleUser(verifiedUser);
        setFormNom(verifiedUser.displayName || "");
        setAuthMode("ONBOARDING");
        toast.info("📋 Nouveau profil détecté. Veuillez renseigner votre fiche d'habilitation.");
      }
    } catch (err: any) {
      console.error("Erreur connexion google:", err);
      toast.error(`Accès refusé : Authentification Google échouée (${err.message || err})`);
    } finally {
      setIsLoading(false);
    }
  };

  // Registration trigger
  const handleRegistrationFlow = async () => {
    setIsLoading(true);
    try {
      if (!isOnline) {
        toast.error("Inscription impossible hors-ligne. Veuillez rétablir la liaison réseau.");
        setIsLoading(false);
        return;
      }

      const verifiedUser = await triggerGoogleAuthAndRetrieveUser();
      const userRef = doc(db, "users", verifiedUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const dbData = userSnap.data();
        const activeUser: User = {
          uid: verifiedUser.uid,
          displayName: dbData.displayName,
          email: verifiedUser.email,
          role: dbData.role,
          siteId: dbData.siteId
        };
        setUser(activeUser);
        toast.success(`Compte existant détecté : Bienvenue, ${activeUser.displayName}`);
        return;
      }

      if ((verifiedUser.email || "").toLowerCase() === "yahyaouzrirou@gmail.com") {
        const adminProfile: User = {
          uid: verifiedUser.uid,
          displayName: "Yahya Ouzrirou",
          email: verifiedUser.email,
          role: "ADMIN",
          siteId: "TOUS"
        };
        await dbService.users.set(verifiedUser.uid, {
          ...adminProfile,
          active: true,
          authProvider: "google",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        setUser(adminProfile);
        toast.success("🔐 Accès Super Administration : Yahya Ouzrirou");
        return;
      }

      setGoogleUser(verifiedUser);
      setFormNom(verifiedUser.displayName || "");
      setAuthMode("ONBOARDING");
      toast.info("📋 Liaison Google rattachée. Veuillez compléter vos habilitations.");
    } catch (err: any) {
      console.error("Erreur inscription google:", err);
      toast.error(`Sélection Google abandonnée : ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit complete onboarding form
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser) return;
    setIsLoading(true);

    try {
      if (!formNom.trim()) {
        toast.error("Le nom et prénom de l'agent de mine est requis.");
        setIsLoading(false);
        return;
      }

      const mappedSiteId = formSite === "ADMINISTRATION" ? "TOUS" : (formSite as SiteID);
      
      let finalRole: UserRole = "MECANICIEN";
      if (formSite === "ADMINISTRATION") {
        if (formRole === "RESPONSABLE MAINTENANCE") finalRole = "RESPONSABLE_MAINTENANCE";
        if (formRole === "DIRECTEUR TECHNIQUE") finalRole = "ADMIN";
        if (formRole === "DIRECTEUR GENERALE") finalRole = "DIRECTION";
      } else {
        if (formRole === "RESPONSABLE DE CHANTIER" || formRole === "CHEF DE CHANTIER") finalRole = "RESPONSABLE_CHANTIER";
        if (formRole === "SECRETAIRE DE CHANTIER") finalRole = "SECRETAIRE";
        if (formRole === "MECANICIEN") finalRole = "MECANICIEN";
      }

      const newUser: User = {
        uid: googleUser.uid,
        displayName: formNom,
        email: googleUser.email,
        role: finalRole,
        siteId: mappedSiteId,
        active: false,
        requestedRole: finalRole
      };

      await dbService.users.set(googleUser.uid, {
        ...newUser,
        active: false,
        authProvider: "google",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      setUser(newUser);
      toast.info(`Fiche d'habilitation créée. Accès en attente d'approbation par la Direction Technique.`);
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      toast.error(`Une erreur est survenue lors de la création de la fiche : ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineRescueLogin = (profile: User) => {
    const backupUser: User = {
      uid: profile.uid,
      displayName: profile.displayName,
      email: profile.email,
      role: profile.role,
      siteId: profile.siteId,
      active: profile.active
    };
    setUser(backupUser);
    toast.success(`⚡ Mode Souterrain Dégradé (Mémoire Cache) : Restauration de session pour ${profile.displayName}`);
  };

  return (
    <div className="wrap">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --hydro:     #4FC3F7;
          --hydro-dim: #1a9fd4;
          --red:       #C0392B;
          --red-dim:   #922b21;
          --ink:       #0d1b2a;
          --ink-mid:   --ink;
          --muted:     #7f8c8d;
          --border:    rgba(255,255,255,0.12);
        }

        .wrap {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          position: relative;
          background-color: #ffffff;
        }

        /* ── IMAGE PANEL (100% BACKGROUND LAYER) ─────────────────── */
        .panel-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          background-color: #ffffff;
        }
        .panel-img__photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          opacity: 1;
        }
        /* No white fading on the right, background image is fully clear and bright */
        .panel-img__overlay {
          display: none;
        }
        .panel-img__overlay-ambient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(13,27,42,0.05) 0%, transparent 50%, rgba(13,27,42,0.15) 100%);
          pointer-events: none;
        }
        
        /* ── FORM PANEL (COMPACT WHITE CARD ON THE RIGHT) ────────── */
        .panel-form {
          position: absolute;
          right: 5%;
          top: 50%;
          transform: translateY(-50%);
          width: 390px;
          min-width: 390px;
          max-width: 420px;
          height: auto;
          max-height: 90vh;
          z-index: 2;
          background: #ffffff !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 36px 28px;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.08);
          overflow-y: auto;
        }
        
        /* Top contour border with custom Hydromines blend: sky blue, gold, deep red */
        .panel-form::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 5px;
          background: linear-gradient(90deg, #1a9fd4 0%, #C9A227 45%, #9c1a1a 100%);
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }

        .form-inner {
          width: 100%;
          z-index: 1;
        }

        /* Logo */
        .logo-block {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          width: 100%;
        }
        .logo-block img {
          max-height: 100%;
          max-width: 100%;
          filter: none;
        }
        .logo-text { line-height: 1.1; }
        .logo-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .logo-name .h { color: #1a9fd4; }
        .logo-name .m { color: #C0392B; }
        .logo-tagline {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.52rem;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #7f8c8d;
          margin-top: 3px;
        }

        /* Heading */
        .form-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #1a9fd4;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .form-eyebrow::before,
        .form-eyebrow::after {
          content: '';
          display: inline-block;
          width: 20px; height: 1.5px;
          background: #1a9fd4;
        }
        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.7rem, 2.5vw, 2rem);
          font-weight: 800;
          color: #0d1b2a;
          letter-spacing: -0.5px;
          line-height: 1.15;
          margin-bottom: 10px;
          text-align: center;
        }
        .form-title span { color: #C0392B; }
        .form-desc {
          font-size: 0.84rem;
          color: #7f8c8d;
          line-height: 1.65;
          margin-bottom: 36px;
          font-weight: 300;
          text-align: center;
        }

        /* Google button */
        .btn-google {
          width: 100%;
          padding: 14px 20px;
          background: #0d1b2a;
          color: #fff;
          border: none;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
          box-shadow: 0 4px 14px rgba(13,27,42,0.18);
          letter-spacing: 0.2px;
          margin-bottom: 28px;
        }
        .btn-google:hover {
          background: #2c3e50;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(13,27,42,0.22);
        }
        .btn-google svg { flex-shrink: 0; }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .divider span {
          font-size: 0.72rem;
          color: #cbd5e1;
          font-weight: 400;
          white-space: nowrap;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        /* Security badge */
        .security-block {
          padding: 14px 16px;
          border: 1px solid rgba(13, 27, 42, 0.03);
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 4px 20px rgba(13, 27, 42, 0.02);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .sec-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .sec-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #059669;
          box-shadow: 0 0 0 3px rgba(5,150,105,0.15);
          animation: blink 2.4s infinite;
          flex-shrink: 0;
        }
        .sec-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.52rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #059669;
          font-weight: 600;
        }
        .sec-text {
          font-size: 0.72rem;
          color: #7f8c8d;
          line-height: 1.55;
          margin-bottom: 10px;
        }
        .sec-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding-top: 10px;
          border-top: 1px solid rgba(13, 27, 42, 0.05);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.48rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #059669;
          font-weight: 600;
        }
        .sec-sep {
          width: 2px; height: 2px;
          border-radius: 50%;
          background: #059669;
          opacity: 0.4;
        }

        /* Version + copyright */
        .form-footer {
          margin-top: 24px;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.48rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #7f8c8d;
          width: 100%;
        }

        /* ── RESPONSIVE ────────────────────────────────────────── */
        @media (max-width: 1280px) {
          .panel-form {
            right: 3%;
            width: 380px;
            min-width: 380px;
          }
          .panel-img__overlay {
            display: none;
          }
        }
        @media (max-width: 960px) {
          .wrap { 
            flex-direction: column; 
            overflow-y: auto; 
            align-items: stretch;
            height: auto;
            min-height: 100vh;
          }
          .panel-img {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
          }
          .panel-img__overlay {
            display: none;
          }
          .panel-form {
            position: relative;
            inset: auto;
            margin: 40px auto;
            transform: none;
            width: 90%;
            min-width: 0;
            max-width: 385px;
            z-index: 2;
            background: #ffffff !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.25);
          }
          .panel-form::before {
            background: linear-gradient(90deg, #1a9fd4 0%, #C9A227 50%, #9c1a1a 100%);
          }
        }
        @media (max-width: 480px) {
          .panel-form {
            padding: 32px 20px; 
          }
          .form-title { font-size: 1.5rem; }
        }

        /* Fade-in animation */
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(24px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .form-inner > * {
          animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        .logo-block        { animation-delay: 0.05s; }
        .form-eyebrow      { animation-delay: 0.12s; }
        .form-title        { animation-delay: 0.18s; }
        .form-desc         { animation-delay: 0.24s; }
        .btn-google        { animation-delay: 0.30s; }
        .divider           { animation-delay: 0.34s; }
        .security-block    { animation-delay: 0.38s; }

        /* Shimmer sur le titre Espace Maintenance */
        .form-title {
          position: relative;
          overflow: hidden;
          display: inline-block;
          width: 100%;
        }
        .form-title::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 55%;
          height: 100%;
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(255,255,255,0.75) 50%,
            transparent 75%
          );
          animation: titleShimmer 2.5s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes titleShimmer {
          0%   { left: -100%; opacity: 0; }
          8%   { opacity: 1; }
          45%  { left: 130%; opacity: 1; }
          55%  { left: 130%; opacity: 0; }
          100% { left: 130%; opacity: 0; }
        }
      ` }} />

      {/* LEFT — IMAGE PANEL (80%) */}
      <div className="panel-img">
        <img
          src={mining_login_bg}
          alt="Heavy Underground Mining Equipment Maintenance Workshop"
          referrerPolicy="no-referrer"
          className="panel-img__photo"
        />
        {/* Cinematic blend elements */}
        <div className="panel-img__overlay" />
        <div className="panel-img__overlay-ambient" />

        {/* Floating status badges with beautiful backdrop frames */}
        <div className="absolute top-8 left-8 z-10 hidden md:flex gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-950/45 backdrop-blur-md border border-white/10 text-[9px] font-mono tracking-widest text-emerald-400 font-bold uppercase shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SITES SUPÉRIEURS ET SOUTERRAINS CONNECTÉS
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-950/45 backdrop-blur-md border border-white/10 text-[9px] font-mono tracking-widest text-sky-400 font-bold uppercase shadow-lg">
            <Activity className="h-3 w-3 animate-pulse text-sky-405" />
            SUPERVISION MAÎTRE : 5 SITES ACTIFS
          </div>
        </div>

        {/* Floating information block at the bottom of the image for full cinematic effect */}
        <div className="absolute bottom-16 left-16 z-10 max-w-xl hidden lg:block text-left p-6 rounded-2xl bg-slate-950/40 backdrop-blur-md border border-white/10 shadow-2xl">
          <div className="font-mono text-[10px] tracking-[4px] uppercase text-sky-400 font-bold mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            PLATEFORME DE SUPERVISION NUMÉRIQUE
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight mb-1 uppercase">
            Maintenance <span className="text-sky-400">préventive</span> <br />
            <span className="text-sky-400 font-black">&amp; corrective</span> des engins
          </h2>
          <div className="h-[1px] w-20 bg-gradient-to-r from-sky-400 to-transparent my-3" />
          <p className="text-xs text-slate-200 leading-relaxed font-light mt-2 max-w-sm">
            Plateforme de supervision maintenance dédiée aux opérations minières souterraines Hydromines.
          </p>
        </div>
      </div>

      {/* RIGHT — FORM PANEL (20%) */}
      <div className="panel-form">
        <div className="form-inner">

          {/* Logo block with animate system */}
          <div className="logo-block flex flex-col items-center justify-center text-center gap-1 w-full" style={{ marginBottom: "20px" }}>
            <HydrominesLogo size={175} variant="full" className="transform transition-transform hover:scale-105" />
          </div>

          {authMode !== "ONBOARDING" ? (
            <>
              <div className="form-eyebrow">Accès sécurisé</div>
              <h1 className="form-title">Espace<br /><span>Maintenance</span></h1>
              <p className="form-desc" style={{ marginBottom: "20px" }}>
                Espace dédié aux mécaniciens, responsables de maintenance et secrétaires des chantiers. Connexion sécurisée via votre compte Google professionnel.
              </p>

              <div className="space-y-4 pt-2">
                <button 
                  type="button"
                  disabled={isLoading}
                  onClick={handleConnexionFlow} 
                  className="btn-google"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span>{isLoading ? "Authentification..." : "Se connecter avec Google"}</span>
                </button>
              </div>

              {/* Security block */}
              <div className="security-block">
                <div className="sec-header">
                  <span className="sec-dot"></span>
                  <span className="sec-label">Sécurité Cloud Certifiée</span>
                </div>
                <p className="sec-text">
                  🔐 Authentification via Google OAuth 2.0. Aucun mot de passe stocké.
                  Aucun accès à vos documents ou emails privés.
                </p>
                <div className="sec-footer">
                  ISO 27001 <span className="sec-sep"></span> Chiffrement de bout en bout
                </div>
              </div>

              {/* Emergency Offline Bypass Panel (Souterrain / Underground backup) */}
              {!isOnline && (
                <div className="pt-4 border-t border-slate-200 mt-4 text-left">
                  <p className="text-[9px] font-mono font-black text-amber-600 tracking-wider uppercase mb-2 flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> fail-safe de secours autonome (Cache local)
                  </p>
                  {cachedUsersList.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {cachedUsersList.map((p) => (
                        <button
                          key={p.uid}
                          onClick={() => handleOfflineRescueLogin(p)}
                          type="button"
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-center truncate text-[10px] text-slate-700 font-bold transition-all w-full flex items-center justify-center"
                        >
                          {p.displayName.split(" ")[0]} ({p.siteId})
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic leading-relaxed m-0">
                      Aucun profil mémorisé en cache local de cet appareil. Veuillez d'abord vous connecter initialement en étant en ligne.
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* ONBOARDING FLOW FORM */
            <form onSubmit={handleOnboardingSubmit} className="space-y-4 text-left">
              <div className="space-y-2 text-center" style={{ marginBottom: "24px" }}>
                <div className="inline-flex h-10 w-10 items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Check className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black uppercase text-slate-950 dark:text-white italic m-0">
                  Fiche d'habilitation
                </h3>
                <p className="text-[10px] text-[#4a90d9] font-mono font-bold leading-normal m-0 italic">
                  {googleUser?.email}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500" style={{ color: "var(--ink-mid)" }}>
                    1. Nom et Prénom de l'agent
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="Ex : Ouzrirou Yahya"
                    value={formNom}
                    onChange={(e) => setFormNom(e.target.value)}
                    style={{ height: "44px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                    className="w-full bg-[#f8fafc] text-[#0d1b2a] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500" style={{ color: "var(--ink-mid)" }}>
                    2. Adresse Email (Vérifiée Google)
                  </Label>
                  <Input
                    type="email"
                    disabled
                    value={googleUser?.email || ""}
                    style={{ height: "44px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
                    className="w-full bg-[#e2e8f0] text-slate-500 cursor-not-allowed opacity-80"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500" style={{ color: "var(--ink-mid)" }}>
                      3. Site d'affectation
                    </Label>
                    <select
                      value={formSite}
                      onChange={(e) => setFormSite(e.target.value)}
                      style={{ height: "44px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                      className="w-full px-3 bg-[#f8fafc] text-[#0d1b2a] text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-400"
                    >
                      {SITES_LIST.map((sit) => (
                        <option key={sit.id} value={sit.id}>
                          {sit.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500" style={{ color: "var(--ink-mid)" }}>
                      4. Rôle opérationnel
                    </Label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      style={{ height: "44px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                      className="w-full px-3 bg-[#f8fafc] text-[#0d1b2a] text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-400"
                    >
                      {formSite === "ADMINISTRATION" ? (
                        <>
                          <option value="RESPONSABLE MAINTENANCE">RESP_MAINTENANCE</option>
                          <option value="DIRECTEUR TECHNIQUE">DIRECTEUR_TECH</option>
                          <option value="DIRECTEUR GENERALE">DIRECTION</option>
                        </>
                      ) : (
                        <>
                          <option value="RESPONSABLE DE CHANTIER">RESP_CHANTIER</option>
                          <option value="CHEF DE CHANTIER">CHEF_CHANTIER</option>
                          <option value="SECRETAIRE DE CHANTIER">SÉCRÉTAIRE</option>
                          <option value="MECANICIEN">MÉCANICIEN</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4" style={{ marginTop: "24px" }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-google"
                  style={{ background: "#059669", color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(5,150,105,0.18)" }}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  ) : null}
                  <span>{isLoading ? "Enregistrement..." : "SOUMETTRE MON DOSSIER"}</span>
                </button>
              </div>
            </form>
          )}

        </div>

        <div className="form-footer">
          <span style={{ color: "#3a9fd4", fontWeight: 700 }}>HYDRO</span><span style={{ color: "#9c1a1a", fontWeight: 700 }}>MINES</span> 2026 — TOUS DROITS RÉSERVÉS &nbsp;·&nbsp; v1.0 Suivi Maintenance
        </div>
      </div>

    </div>
  );
}

