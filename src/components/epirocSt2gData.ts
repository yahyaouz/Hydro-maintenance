export interface EpirocSt2gPanne {
  id: string;
  system: string;
  title: string;
  severity: "VERT" | "JAUNE" | "ROUGE";
  symptoms: string;
  cause: string;
  action: string;
  repTime: number; // in hours
}

export const EPIROC_ST2G_SYSTEMS = [
  { id: "SYS1", label: "MOTEUR DEUTZ BF4M2012 WATER", icon: "Flame", bg: "bg-emerald-950/40 border-emerald-500/30", text: "text-emerald-500" },
  { id: "SYS2", label: "TRANSMISSION FUNK DF100", icon: "Shuffle", bg: "bg-purple-950/40 border-purple-500/30", text: "text-purple-500" },
  { id: "SYS3", label: "HYDRAULIQUE OPEN-CENTER", icon: "Droplets", bg: "bg-yellow-950/40 border-yellow-500/30", text: "text-yellow-500" },
  { id: "SYS4", label: "DIRECTION & ARTICULATION", icon: "Compass", bg: "bg-blue-950/40 border-blue-500/30", text: "text-blue-500" },
  { id: "SYS5", label: "FREINAGE DISQUES SECS", icon: "ShieldAlert", bg: "bg-rose-950/40 border-rose-500/30", text: "text-rose-500" },
  { id: "SYS6", label: "ÉLECTRIQUE & ÉLECTRONIQUE BASIQUE", icon: "Zap", bg: "bg-slate-900 border-slate-700", text: "text-slate-300" },
  { id: "SYS7", label: "CHÂSSIS & ROUES ST2G", icon: "Disc", bg: "bg-orange-950/40 border-orange-500/30", text: "text-orange-500" },
  { id: "SYS8", label: "GODET, BRAS & ARTICULATION", icon: "Hammer", bg: "bg-amber-950/40 border-amber-500/30", text: "text-amber-700" }
];

export const EPIROC_ST2G_GLOSSAIRE = [
  { term: "Deutz BF4M2012", def: "Moteur diesel 4 cylindres refroidi par eau de 75 kW géré mécaniquement par pompes Bosch PFR." },
  { term: "Funk DF100", def: "Transmission Powershift mécanique-hydraulique à 4 rapports avant/arrière à commande mécanique directe." },
  { term: "Bosch PFR", def: "Système d'injection à pompes individuelles mécaniques (pas de Common Rail, pas de gestion électronique)." },
  { term: "Open-Center", def: "Système hydraulique basique où la pompe distribue en permanence l'huile dans le circuit au neutre." },
  { term: "Kessler D71 / RT305", def: "Essieux rigides compacts adaptés à une charge utile maximale de 4 000 kg." },
  { term: "SAHR vs Secs", def: "Le ST2G utilise des freins à disques secs ventilés avec commande hydraulique directe (pas de freins à ressort SAHR)." },
  { term: "Vérin Hoist ST2G", def: "Vérin hydraulique principal de levage avec un alésage de 100 mm et une course de 600 mm." },
  { term: "Vérin Dump ST2G", def: "Vérin de cavage du godet de 100 mm de diamètre intérieur et 450 mm de course." },
  { term: "Tension chaînes ST2G", def: "Ajustement mécanique indispensable de la flèche des chaînes d'entraînement dans le châssis (maillons 35 mm)." },
  { term: "Écran LCD 5\"", def: "Indicateur monochrome basique affichant le régime, les heures de marche et les alarmes de base." }
];

export const EPIROC_ST2G_VOYANTS = [
  { name: "Pression d'huile Moteur Deutz", symbol: "▲ ROUGE (Voyant + Buzzer)", normal: "Éteint", abnormal: "Allumé en rouge sous 1.5 bar", action: "Arrêt immédiat moteur. Vérifier jauge huile et crépine d'aspiration.", link: "1.1.5.A" },
  { name: "Température d'eau Deutz", symbol: "▲ ROUGE (Voyant + Buzzer)", normal: "Éteint", abnormal: "Fixe au-dessus de 100°C", action: "Réduire la charge. Inspecter le niveau de liquide de refroidissement et la courroie.", link: "1.1.4.A" },
  { name: "Surchauffe Boîte Funk", symbol: "⬢ VIOLET (Voyant)", normal: "Éteint", abnormal: "Allumé si >120°C", action: "Mettre au neutre. Laisser tourner au ralenti pour refroidir via l'échangeur air-huile.", link: "2.2.3.C" },
  { name: "Niveau bas huile hydraulique", symbol: "◆ JAUNE (Voyant)", normal: "Éteint", abnormal: "Jaune fixe", action: "Faire l'appoint du réservoir de 80 L avec de l'huile ISO VG 46.", link: "3.1.3.A" },
  { name: "Colmatage Filtre de retour", symbol: "◆ JAUNE (Voyant)", normal: "Éteint", abnormal: "Jaune fixe", action: "Remplacer l'élément filtrant papier de 25 microns.", link: "3.1.3.C" },
  { name: "Pression de commande freinage", symbol: "▲ ROUGE (Voyant)", normal: "Éteint (> 100 bar)", abnormal: "Rouge fixe (< 80 bar)", action: "Arrêter l'engin. Vérifier le maître-cylindre et l'étanchéité des étriers.", link: "4.2.1.A" }
];

export const EPIROC_ST2G_ERRORS = [
  { code: "M-E01", description: "Basse tension de batterie détectée (<24V au démarreur)", severity: "ROUGE", system: "SYS6" },
  { code: "M-E02", description: "Surchauffe moteur Deutz (>100°C sur sonde de culasse)", severity: "ROUGE", system: "SYS1" },
  { code: "T-E01", description: "Pression de charge convertisseur insuffisante (<15 bar à chaud)", severity: "ROUGE", system: "SYS2" },
  { code: "H-E01", description: "Colmatage du filtre de retour hydraulique 25µ", severity: "JAUNE", system: "SYS3" },
  { code: "F-E01", description: "Pression hydraulique de commande de frein faible (<80 bar)", severity: "ROUGE", system: "SYS5" }
];

export const EPIROC_ST2G_STOCK = {
  "filtre-huile-deutz": { label: "Filtre à huile Deutz (cartouche)", ref: "0118-3564", qty: 12, unit: "pc", loc: "Rayon A-3" },
  "filtre-gasoil-deutz": { label: "Filtre gasoil Deutz 10µ", ref: "0117-4696", qty: 15, unit: "pc", loc: "Rayon A-4" },
  "filtre-air-sec": { label: "Filtre à air sec principal ST2G", ref: "0118-0872", qty: 6, unit: "pc", loc: "Rayon B-1" },
  "filtre-return-25": { label: "Cartouche retour hydraulique 25µ", ref: "2658-2041", qty: 8, unit: "pc", loc: "Rayon D-2" },
  "plaquette-organique": { label: "Plaquette de frein organique ST2G", ref: "2657-3012", qty: 16, unit: "pc", loc: "Rayon F-1" },
  "joint-etrier-38": { label: "Kit joints étrier de frein Ø 38mm", ref: "2657-3025", qty: 10, unit: "kit", loc: "Rayon F-3" },
  "injecteur-mecanique": { label: "Injecteur mécanique Bosch PFR", ref: "0414-7500", qty: 4, unit: "pc", loc: "Armoire C-1" },
  "pompe-eau-deutz": { label: "Pompe à eau Deutz BF4M2012", ref: "0293-7441", qty: 2, unit: "pc", loc: "Rayon H-1" },
  "chaine-35": { label: "Maillon de chaîne transmission 35mm", ref: "2651-4011", qty: 24, unit: "pc", loc: "Rayon L-4" },
  "boulon-m18": { label: "Boulon de roue M18x1.5 grade 10.9", ref: "9101-1845", qty: 50, unit: "pc", loc: "Rayon M-2" }
};

export const EPIROC_ST2G_PROCEDURES = [
  { id: "LOTO-1", title: "Consignation LOTO standard ST2G", time: 15, steps: ["Mettre la machine sur sol plat", "Actionner le frein à main mécanique à tambour", "Tourner le coupe-circuit de batterie sur OFF", "Installer le cadenas de consignation et étiquette de blocage"] },
  { id: "DEUTZ-V", title: "Contrôle visuel quotidien moteur Deutz", time: 10, steps: ["Vérifier le niveau d'huile moteur (15W-40, entre min et max)", "Contrôler visuellement le radiateur à eau pour fuite", "Inspecter la tension de la courroie de ventilateur", "Vérifier le témoin de restriction de filtre à air"] },
  { id: "HYD-CH", title: "Nettoyage et vidange réservoir 80 L", time: 45, steps: ["Vidanger l'huile hydraulique usée ISO VG 46", "Remplacer la cartouche de retour 25 microns", "Nettoyer la crépine d'aspiration métallique", "Remplir avec de l'huile neuve jusqu'au témoin visuel"] }
];

export const EPIROC_ST2G_COUPLES = [
  { item: "Boulons de culasse Deutz BF4M2012", value: "30 Nm + 60 Nm + 180°", tool: "Clé dynamométrique + goniomètre" },
  { item: "Boulons de roue ST2G M18x1.5", value: "450 Nm", tool: "Clé dynamométrique 3/4\"" },
  { item: "Vis d'étriers de frein secs", value: "120 Nm", tool: "Clé dynamométrique 1/2\"" },
  { item: "Fixations d'essieux Rock Tough 305", value: "380 Nm", tool: "Clé dynamométrique 3/4\"" },
  { item: "Brides de tuyaux hydrauliques", value: "85 Nm", tool: "Clé dynamométrique 1/2\"" }
];

export const EPIROC_ST2G_VALEURS = [
  { system: "Moteur Deutz", parameter: "Pression d'huile au ralenti à chaud (80°C)", normal: "1.5 bar", limit: "min 1.0 bar" },
  { system: "Moteur Deutz", parameter: "Température d'eau de refroidissement nominale", normal: "82°C - 95°C", limit: "max 102°C" },
  { system: "Transmission", parameter: "Pression de charge boîte Funk DF100", normal: "18 - 22 bar", limit: "min 15 bar" },
  { system: "Hydraulique", parameter: "Pression de décharge principale Rexroth", normal: "200 bar", limit: "max 210 bar" },
  { system: "Freinage", parameter: "Pression hydraulique de service", normal: "120 bar", limit: "110 - 130 bar" }
];

export const EPIROC_ST2G_OUTILS = [
  { id: "OUT-01", label: "Extracteur de disque de frein sec", desc: "Permet de dégager le disque Ø 350 mm du moyeu Rock Tough 305.", loc: "Caisse spéciale Freinage" },
  { id: "OUT-02", label: "Clé dynamométrique 3/4\" (100-600 Nm)", desc: "Pour serrage des boulons de roues M18 au couple de 450 Nm.", loc: "Établi central" },
  { id: "OUT-03", label: "Marteau à inertie pour injecteur Bosch PFR", desc: "Outil de dépose des injecteurs mécaniques grippés dans la culasse.", loc: "Armoire moteur" },
  { id: "OUT-04", label: "Pompe de purge manuelle de frein", desc: "Pour purger l'air du circuit hydraulique de freinage sec.", loc: "Caisse freinage" },
  { id: "OUT-05", label: "Appareil de mesure tension courroie", desc: "Permet de vérifier la flèche de la courroie de ventilateur.", loc: "Armoire moteur" }
];

export const EPIROC_ST2G_SYMPTOMS_INDEX = {
  "MOTEUR": ["Moteur refuse de démarrer", "Surchauffe liquide refroidissement", "Fumée noire à l'échappement", "Perte de puissance sous charge"],
  "TRANSMISSION": ["Patinage d'embrayage", "Surchauffe d'huile boîte", "Vitesse refuse de s'engager", "Limaille bouchon aimanté"],
  "HYDRAULIQUE": ["Mouvements lents au démarrage", "Vérin de levage dérive", "Direction dure", "Sifflement soupape"],
  "FREINAGE": ["Freinage inefficace", "Plaquette usée", "Fuite étrier", "Frein parking inactif"]
};

export const EPIROC_ST2G_PANNES: EpirocSt2gPanne[] = [
  // SYS1 - MOTEUR
  {
    id: "1.1.1.A",
    system: "SYS1",
    title: "Le moteur Deutz BF4M2012 refuse de démarrer",
    severity: "ROUGE",
    symptoms: "Le démarreur tourne mais aucune combustion ne se produit.",
    cause: "Solénoïde d'arrêt de carburant défectueux ou coupe-batterie ouvert.",
    action: "Vérifier le solénoïde d'arrêt sur la pompe Bosch PFR, s'assurer que la tirette manuelle de stop est bien repoussée.",
    repTime: 1.0
  },
  {
    id: "1.1.4.A",
    system: "SYS1",
    title: "Surchauffe du liquide de refroidissement (>100°C)",
    severity: "ROUGE",
    symptoms: "Alarme de température d'eau sur l'écran LCD, baisse de régime.",
    cause: "Radiateur à ailettes obstrué ou courroie de pompe à eau détendue/rompue.",
    action: "Nettoyer les ailettes du radiateur à l'air comprimé, vérifier la courroie et le niveau de liquide de refroidissement.",
    repTime: 1.5
  },
  {
    id: "1.1.5.B",
    system: "SYS1",
    title: "Remplacement injecteur mécanique Bosch PFR",
    severity: "JAUNE",
    symptoms: "Le moteur claque, tourne sur 3 cylindres avec fumée noire importante.",
    cause: "Aiguille d'injecteur mécanique grippée par la présence d'eau ou d'impuretés.",
    action: "Isoler l'injecteur défectueux en desserrant les raccords haute pression, puis remplacer l'injecteur mécanique.",
    repTime: 1.2
  },
  // SYS2 - TRANSMISSION
  {
    id: "2.1.1.A",
    system: "SYS2",
    title: "Patinage de la transmission Funk DF100",
    severity: "JAUNE",
    symptoms: "L'engin peine à pénétrer le tas de roche en 1ère vitesse, le régime monte mais pas la vitesse.",
    cause: "Pression d'embrayage trop basse ou disques de friction usés.",
    action: "Mesurer la pression de charge du convertisseur (doit être entre 18 et 22 bar), ajuster le clapet de décharge.",
    repTime: 2.5
  },
  {
    id: "2.4.1.A",
    system: "SYS2",
    title: "Détension des chaînes Rock Tough 305",
    severity: "JAUNE",
    symptoms: "Claquements brutaux entendus dans le châssis lors des inversions de marche.",
    cause: "Allongement naturel des maillons de 35 mm sous fortes charges.",
    action: "Resserrer le tendeur de chaîne mécanique selon la procédure nominale pour obtenir une flèche de 15 mm maximum.",
    repTime: 1.8
  },
  // SYS3 - HYDRAULIQUE
  {
    id: "3.1.1.A",
    system: "SYS3",
    title: "Bruit de grondement de la pompe hydraulique principale A10VO",
    severity: "ROUGE",
    symptoms: "Grondement fort proportionnel au régime moteur, mouvements saccadés.",
    cause: "Cavitation due à un filtre d'aspiration colmaté ou niveau d'huile bas (<80 L).",
    action: "Vérifier immédiatement le niveau d'huile sur la jauge, remplacer le filtre d'aspiration.",
    repTime: 2.0
  },
  {
    id: "3.1.3.C",
    system: "SYS3",
    title: "Colmatage du filtre de retour hydraulique 25µ",
    severity: "JAUNE",
    symptoms: "Voyant de colmatage allumé en cabine à chaud.",
    cause: "Accumulation de particules d'usure dans la cartouche papier.",
    action: "Remplacer la cartouche de retour hydraulique de 25 microns par une pièce d'origine Epiroc 2658-2041.",
    repTime: 0.5
  }
];
