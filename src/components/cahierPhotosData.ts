export interface PhotoData {
  type: 'CASSÉ' | 'OUTIL' | 'RÉSULTAT' | 'MAUVAIS';
  title: string;
  alt: string;
  cadrage: string;
  subject: string;
  details?: string;
  contexte?: string;
  message?: string;
  outils?: string;
  validation?: string;
  ligneRouge?: string;
  prompt: string;
  realUrl?: string;
}

export interface ProcedureData {
  id: string;
  title: string;
  photos: PhotoData[];
}

export function generateDetailedPrompt(
  procId: string,
  photoType: 'CASSÉ' | 'OUTIL' | 'RÉSULTAT' | 'MAUVAIS',
  title: string,
  subject: string,
  context: string,
  details: string
): string {
  const camera = "DSLR Canon EOS 5D Mark IV, objectif 24-70mm f/2.8, ISO 800, f/5.6, 1/125s, mise au point précise";
  const lighting = photoType === 'MAUVAIS'
    ? "Éclairage dramatique rasant à 15°, lampe frontale LED 1000 lumens seule, ombres dures, température de couleur 6000K"
    : "Éclairage de travail industriel réel, lampe frontale LED 1000 lumens latérale + flash diffuseur blanc, température 5500K";
  const env = "Mine souterraine réelle, parois de roche brute sombre, poussière fine en suspension dorée sous les faisceaux, flaques d'huile hydraulique au sol, tuyaux enchevêtrés, panneaux de sécurité délavés en arrière-plan.";
  const treatment = "Rendu photojournalisme industriel réaliste. Pas d'illustration, pas de 3D, pas d'images de synthèse. Contraste renforcé, netteté élevée, saturation légèrement réduite -10%, température de couleur équilibrée.";
  
  let sujetTech = `Sujet : ${subject}. ${details}.`;
  let narratif = `Mains de mécanicien portant des gants en cuir épais usés et traces de cambouis noir. ${context}.`;
  let annotations = "";
  let mood = "";
  
  if (photoType === 'CASSÉ') {
    mood = "Atmosphère d'urgence de maintenance corrective, composant présentant un défaut critique visible.";
    annotations = "Annotations de diagnostic professionnelles superposées : flèches rouges et cercles jaunes entourant les zones de rupture. Texte overlay rouge : ARRÊT IMMÉDIAT.";
  } else if (photoType === 'OUTIL') {
    mood = "Atmosphère de précision et de respect rigoureux des procédures de sécurité minières.";
    narratif += " Cadenas de consignation jaune LOTO (Lockout/Tagout) fixé sur l'interrupteur d'isolation d'énergie avec étiquette de danger visible.";
  } else if (photoType === 'RÉSULTAT') {
    mood = "Atmosphère de satisfaction et de contrôle qualité rigoureux d'après-travaux.";
    sujetTech += " Composant neuf installé propre, exempt de traces d'usage. Fiche papier d'inspection de fin de travaux visible avec cases cochées.";
  } else {
    mood = "Atmosphère de catastrophe mécanique majeure, rupture spectaculaire d'un élément mécanique.";
    annotations = "Bande diagonale de sécurité jaune et noire de warning sur les bords de l'image. Texte rouge vif en overlay : DANGER - APPELLE LE CHEF.";
  }

  return `Photographie industrielle réaliste, cadrage : ${title}. ${sujetTech} ${camera}. ${lighting}. ${narratif} ${env} ${treatment} ${annotations} ${mood}`;
}

export function getPlaceholderSvg(
  type: string,
  title: string,
  camera: string,
  subject: string,
  prompt: string
): string {
  const escapedTitle = title.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapedCamera = camera.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapedSubject = subject.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapedPrompt = prompt.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  const accentColor = type === 'CASSÉ' ? '#ef4444' : type === 'MAUVAIS' ? '#f59e0b' : type === 'RÉSULTAT' ? '#22c55e' : '#3b82f6';
  const accentText = type === 'CASSÉ' ? 'CASSÉ / DÉFAUT CRITIQUE' : type === 'MAUVAIS' ? 'CATASTROPHE MECANIQUE' : type === 'RÉSULTAT' ? 'RÉSULTAT CONFORME NEUF' : 'OUTIL ET MONTAGE REQUIS';

  const lowerTitle = title.toLowerCase();
  const lowerSubject = subject.toLowerCase();
  const isCasse = type === 'CASSÉ' || type === 'MAUVAIS';
  const isNeuf = type === 'RÉSULTAT';

  let customArt = '';
  let subTitleText = 'VUE TECHNIQUE — ÉCHELLE 1:2 — SCHÉMA MÉCANIQUE';
  let specText = '';

  if (lowerTitle.includes('frein') || lowerTitle.includes('sahr') || lowerTitle.includes('disque') || lowerSubject.includes('frein') || lowerSubject.includes('sahr') || lowerSubject.includes('disque')) {
    subTitleText = 'ÉTRIER FREIN SAHR — ÉCHELLE 1:2 — SYSTÈME DE FREINAGE DISQUES WET';
    specText = isCasse ? '⚠ ÉPAISSEUR DE COMPOSANT HORS SERVICE — REMPLACEMENT REQUIS (MIN 6.0 mm)' : '✓ ÉTAT DU COMPOSANT VALIDE (JEU ET RESSORTS VÉRIFIÉS)';
    customArt = `
      <!-- Silhouette étrier SAHR -->
      <path d="M 120 140 L 120 80 L 680 80 L 680 140 L 640 140 L 640 100 L 160 100 L 160 140 Z" fill="none" stroke="#f59e0b" stroke-width="2.5" />
      <!-- Disque mobile -->
      <circle cx="400" cy="240" r="100" fill="none" stroke="${isNeuf ? '#22c55e' : '#3b82f6'}" stroke-width="2.5" />
      <circle cx="400" cy="240" r="40" fill="none" stroke="#3b82f6" stroke-width="1.5" />
      <!-- Plaquettes -->
      <rect x="310" y="190" width="60" height="100" fill="none" stroke="${isCasse ? '#ef4444' : '#22c55e'}" stroke-width="2.5" stroke-dasharray="${isCasse ? '5,3' : '0'}" />
      <rect x="430" y="190" width="60" height="100" fill="none" stroke="${isCasse ? '#ef4444' : '#22c55e'}" stroke-width="2.5" stroke-dasharray="${isCasse ? '5,3' : '0'}" />
      <!-- Pistons -->
      <circle cx="340" cy="240" r="22" fill="none" stroke="#3b82f6" stroke-width="2" />
      <circle cx="460" cy="240" r="22" fill="none" stroke="#3b82f6" stroke-width="2" />
      <!-- Ressorts -->
      <path d="M 340 210 Q 345 215 340 220 Q 335 225 340 230 Q 345 235 340 240" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      <path d="M 460 210 Q 465 215 460 220 Q 455 225 460 230 Q 465 235 460 240" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      <!-- Cotes -->
      <line x1="120" y1="360" x2="680" y2="360" stroke="#f59e0b" stroke-width="1" />
      <path d="M 120 360 L 130 357 L 130 363 Z" fill="#f59e0b" />
      <path d="M 680 360 L 670 357 L 670 363 Z" fill="#f59e0b" />
      <text x="400" y="380" text-anchor="middle" fill="#111827" font-family="monospace" font-size="11" font-weight="bold">Ø ESPACE INTERNE : 560 mm</text>
    `;
  } else if (lowerTitle.includes('pompe') || lowerTitle.includes('hydraulique') || lowerTitle.includes('vérin') || lowerTitle.includes('direction') || lowerTitle.includes('filtre') || lowerSubject.includes('hydr') || lowerSubject.includes('filtre')) {
    subTitleText = 'CIRCUIT HYDRAULIQUE EXCLUSIF — REPARTITION ET CONTROLE PRESSION';
    specText = isCasse ? '⚠ SOUPLAGE ET JOINT TORIQUE ENDOMMAGE — RISQUE DE FUITE D\'HUILE' : '✓ NIVEAU ET PRESCRIPTION FILTRE VALIDES (25 microns)';
    customArt = `
      <!-- Vérin hydraulique corps -->
      <rect x="200" y="180" width="300" height="70" rx="4" fill="none" stroke="#f59e0b" stroke-width="2.5" />
      <!-- Piston et Tige -->
      <rect x="250" y="182" width="20" height="66" fill="none" stroke="#3b82f6" stroke-width="2" />
      <rect x="270" y="210" width="330" height="14" fill="none" stroke="${isNeuf ? '#22c55e' : '#3b82f6'}" stroke-width="2" />
      <!-- Joints d'étanchéité -->
      <rect x="210" y="180" width="8" height="70" fill="none" stroke="${isCasse ? '#ef4444' : '#3b82f6'}" stroke-width="1.5" stroke-dasharray="${isCasse ? '2,2' : '0'}" />
      <rect x="480" y="180" width="8" height="70" fill="none" stroke="${isCasse ? '#ef4444' : '#3b82f6'}" stroke-width="1.5" stroke-dasharray="${isCasse ? '2,2' : '0'}" />
      <!-- Conduites hydrauliques -->
      <path d="M 230 180 L 230 130 L 120 130" fill="none" stroke="#3b82f6" stroke-width="3" />
      <path d="M 470 180 L 470 130 L 580 130" fill="none" stroke="#3b82f6" stroke-width="3" />
      <!-- Manomètre -->
      <circle cx="120" cy="130" r="18" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      <line x1="120" y1="130" x2="132" y2="118" stroke="#ef4444" stroke-width="2" />
      <!-- Cotes -->
      <line x1="200" y1="280" x2="500" y2="280" stroke="#f59e0b" stroke-width="1" />
      <text x="350" y="298" text-anchor="middle" fill="#111827" font-family="monospace" font-size="11" font-weight="bold">COURSE ET DEBIT MAX REQUIS</text>
    `;
  } else if (lowerTitle.includes('moteur') || lowerTitle.includes('turbo') || lowerTitle.includes('injecteur') || lowerTitle.includes('soupape') || lowerSubject.includes('moteur') || lowerSubject.includes('injecteur')) {
    subTitleText = 'MOTEUR THERMIQUE — CHAMBRE D\'INJECTION ET JEU DES POUSSOIRS';
    specText = isCasse ? '⚠ CALAMINE RELEVÉE / INJECTEUR COLLÉ ET PERTE DE COMPRESSION' : '✓ ATOMISATION CONFORME — PUISSANCE MOTEUR IDÉALE';
    customArt = `
      <!-- Cylindre de moteur -->
      <line x1="280" y1="100" x2="280" y2="340" stroke="#f59e0b" stroke-width="2.5" />
      <line x1="520" y1="100" x2="520" y2="340" stroke="#f59e0b" stroke-width="2.5" />
      <!-- Piston mobile -->
      <path d="M 290 180 L 510 180 L 510 260 L 290 260 Z" fill="none" stroke="#3b82f6" stroke-width="2" />
      <!-- Segments de piston -->
      <rect x="282" y="195" width="8" height="6" fill="none" stroke="${isCasse ? '#ef4444' : '#3b82f6'}" stroke-width="1.5" />
      <rect x="510" y="195" width="8" height="6" fill="none" stroke="${isCasse ? '#ef4444' : '#3b82f6'}" stroke-width="1.5" />
      <rect x="282" y="210" width="8" height="6" fill="none" stroke="${isCasse ? '#ef4444' : '#3b82f6'}" stroke-width="1.5" />
      <rect x="510" y="210" width="8" height="6" fill="none" stroke="${isCasse ? '#ef4444' : '#3b82f6'}" stroke-width="1.5" />
      <!-- Bielle moteur -->
      <line x1="400" y1="240" x2="400" y2="360" stroke="${isNeuf ? '#22c55e' : '#3b82f6'}" stroke-width="4" />
      <circle cx="400" cy="240" r="10" fill="none" stroke="#f59e0b" stroke-width="2" />
      <!-- Injecteur -->
      <path d="M 400 60 L 400 130" stroke="#3b82f6" stroke-width="3" />
      <path d="M 390 60 L 410 60 L 405 130 L 395 130 Z" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      <!-- Cotes de jeu -->
      <line x1="280" y1="180" x2="290" y2="180" stroke="#ef4444" stroke-width="1.5" />
      <text x="230" y="175" fill="#ef4444" font-family="monospace" font-size="10" font-weight="bold">Jeu: 0.08 mm</text>
    `;
  } else if (lowerTitle.includes('convertisseur') || lowerTitle.includes('boîte') || lowerTitle.includes('transmission') || lowerTitle.includes('embrayage') || lowerTitle.includes('électrovanne') || lowerSubject.includes('trans') || lowerSubject.includes('boite')) {
    subTitleText = 'CONVERTISSEUR DE COUPLE ET BOÎTE POWERSHIFT FUNK';
    specText = isCasse ? '⚠ PRESSION CONVERTISSEUR BASSE / GLISSEMENT DETECTE' : '✓ EMBRAYAGE CONFORME (PRESSION ET COUPLAGE ACTIFS)';
    customArt = `
      <!-- Couronne externe -->
      <circle cx="400" cy="230" r="110" fill="none" stroke="#f59e0b" stroke-width="3" />
      <!-- Solaire central -->
      <circle cx="400" cy="230" r="30" fill="none" stroke="#3b82f6" stroke-width="2" />
      <!-- Satellites -->
      <circle cx="400" cy="155" r="24" fill="none" stroke="${isNeuf ? '#22c55e' : '#3b82f6'}" stroke-width="1.5" />
      <circle cx="335" cy="268" r="24" fill="none" stroke="${isNeuf ? '#22c55e' : '#3b82f6'}" stroke-width="1.5" />
      <circle cx="465" cy="268" r="24" fill="none" stroke="${isNeuf ? '#22c55e' : '#3b82f6'}" stroke-width="1.5" />
      <!-- Porte-satellites -->
      <polygon points="400,155 335,268 465,268" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="3,3" />
      <!-- Diagnostic zone -->
      <rect x="240" y="315" width="320" height="35" fill="none" stroke="${isCasse ? '#ef4444' : '#22c55e'}" stroke-width="1.5" stroke-dasharray="${isCasse ? '4,2' : '0'}" />
      <text x="400" y="337" text-anchor="middle" fill="${isCasse ? '#ef4444' : '#111827'}" font-family="monospace" font-size="11" font-weight="bold">
        ${isCasse ? '⚠ POLLUTION DETECTÉE PAR LIMAILLE METALLIQUE' : '✓ PRESSION HYDRAULIQUE D\'ENGAGEMENT OK'}
      </text>
    `;
  } else if (lowerTitle.includes('rcs') || lowerTitle.includes('capteur') || lowerTitle.includes('faisceau') || lowerTitle.includes('module') || lowerTitle.includes('manostat') || lowerSubject.includes('faisceau') || lowerSubject.includes('élect')) {
    subTitleText = 'EPIROC SYSTEM CONTROL RCS — DIAGRAMME TECHNIQUE BUS CAN';
    specText = isCasse ? '⚠ COURT-CIRCUIT DÉTECTÉ SUR LE FAISCEAU D\'ALIMENTATION' : '✓ TRANSMISSION DU SIGNAL ET MODULE ALIMENTÉ';
    customArt = `
      <!-- Module RCS de base -->
      <rect x="250" y="110" width="300" height="180" rx="6" fill="none" stroke="#f59e0b" stroke-width="2.5" />
      <rect x="270" y="130" width="100" height="50" fill="none" stroke="#3b82f6" stroke-width="1.5" />
      <!-- Écran symbolique -->
      <text x="320" y="160" text-anchor="middle" fill="#3b82f6" font-family="monospace" font-size="11" font-weight="bold">RCS OK</text>
      <!-- Connexions et microprocesseur -->
      <circle cx="480" cy="160" r="16" fill="none" stroke="#3b82f6" stroke-width="1.5" />
      <line x1="450" y1="160" x2="510" y2="160" stroke="#3b82f6" stroke-width="1" />
      <line x1="480" y1="130" x2="480" y2="190" stroke="#3b82f6" stroke-width="1" />
      <!-- Borne de broches -->
      <rect x="270" y="240" width="260" height="30" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      <circle cx="290" cy="255" r="4" fill="${isCasse ? '#ef4444' : '#22c55e'}" />
      <circle cx="310" cy="255" r="4" fill="${isCasse ? '#ef4444' : '#22c55e'}" />
      <circle cx="330" cy="255" r="4" fill="#22c55e" />
      <circle cx="350" cy="255" r="4" fill="#22c55e" />
      <!-- Lignes de bus CAN (torsadées) -->
      <path d="M 180 255 Q 210 245 240 255 T 300 255" fill="none" stroke="#3b82f6" stroke-width="2" />
      <path d="M 180 255 Q 210 265 240 255 T 300 255" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,1" />
    `;
  } else {
    // Générique (châssis, roues, transmission latérale etc)
    subTitleText = 'ROUE, MOYEU & CHÂSSIS OSCILLANT — TOLERANCE GÉOMETRIQUE';
    specText = isCasse ? '⚠ ALIGNEMENT NON CONFORME / JEU DE TRAIN EXCÉSIF' : '✓ JEUX MECANIQUES ET ROTULES SANS ANOMALIE';
    customArt = `
      <!-- Silhouette du châssis -->
      <rect x="180" y="160" width="200" height="120" rx="4" fill="none" stroke="#3b82f6" stroke-width="2.5" />
      <rect x="420" y="160" width="200" height="120" rx="4" fill="none" stroke="#3b82f6" stroke-width="2.5" />
      <!-- Joint d'articulation -->
      <circle cx="400" cy="220" r="16" fill="none" stroke="#f59e0b" stroke-width="2" />
      <circle cx="400" cy="220" r="6" fill="${isNeuf ? '#22c55e' : '#f59e0b'}" />
      <!-- Axe d'articulation -->
      <line x1="400" y1="120" x2="400" y2="320" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,4" />
      <!-- Cotes -->
      <line x1="180" y1="310" x2="620" y2="310" stroke="#f59e0b" stroke-width="1" />
      <text x="400" y="330" text-anchor="middle" fill="#111827" font-family="monospace" font-size="11" font-weight="bold">ALIGNEMENT STRUCTUREL REQUIS</text>
    `;
  }

  // Handle precise truncation to max 80 characters with word-boundary cut
  let descText = escapedSubject;
  if (descText.length > 80) {
    const cutIdx = descText.lastIndexOf(' ', 80);
    descText = cutIdx > 0 ? descText.substring(0, cutIdx) : descText.substring(0, 80);
    descText += '...';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
    <!-- Fond blanc blueprint -->
    <rect width="800" height="500" fill="#ffffff" rx="8" stroke="#cbd5e1" stroke-width="1"/>
    
    <!-- Grille technique -->
    <defs>
      <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
        <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#f1f5f9" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="500" fill="url(#grid)" rx="8" />
    
    <!-- Encadré intérieur technique -->
    <rect x="15" y="15" width="770" height="470" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4" rx="6" />

    <!-- Red Banner at top -->
    <rect x="15" y="15" width="770" height="25" fill="#ef4444" rx="2" />
    <text x="400" y="32" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="11" font-weight="black">⚠️ PHOTO MANQUANTE — PLACEHOLDER TECHNIQUE</text>

    <!-- Viewfinder Corners -->
    <path d="M 35,90 L 35,55 L 70,55" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <path d="M 765,90 L 765,55 L 730,55" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <path d="M 35,410 L 35,445 L 70,445" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <path d="M 765,410 L 765,445 L 730,445" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>

    <!-- Crosshairs -->
    <circle cx="400" cy="245" r="50" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="8,6" />
    <line x1="400" y1="175" x2="400" y2="315" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,4" />
    <line x1="330" y1="245" x2="470" y2="245" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,4" />

    <!-- Custom Tech Diagram -->
    ${customArt}

    <!-- Status HUD shifted down for red banner -->
    <rect x="35" y="50" width="240" height="28" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
    <circle cx="50" cy="64" r="6" fill="${accentColor}"/>
    <text x="65" y="69" fill="#0f172a" font-family="monospace" font-size="11" font-weight="black">${accentText}</text>
    
    <text x="765" y="69" text-anchor="end" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">${escapedCamera}</text>
    
    <!-- Title plate shifted down -->
    <rect x="35" y="85" width="730" height="40" fill="#f8fafc" rx="4" stroke="#cbd5e1" stroke-width="1" />
    <text x="50" y="112" fill="#0f172a" font-family="monospace" font-size="24" font-weight="black">${escapedTitle}</text>
    
    <!-- Subject Details with increased size (16px) and black color (#000000) -->
    <text x="35" y="415" fill="#000000" font-family="monospace" font-size="16" font-weight="black">DESCRIPTION :</text>
    <text x="165" y="415" fill="#000000" font-family="monospace" font-size="16" font-weight="bold">${descText}</text>
    
    <!-- Technical Specification Status Text -->
    <text x="35" y="440" fill="${isCasse ? '#ef4444' : '#22c55e'}" font-family="monospace" font-size="11" font-weight="black">${specText}</text>
    
    <!-- Margins / Technical metadata -->
    <text x="765" y="445" text-anchor="end" fill="#f59e0b" font-family="monospace" font-size="10" font-weight="black">EPIROC MINING BLUEPRINT</text>
    <text x="765" y="460" text-anchor="end" fill="#64748b" font-family="monospace" font-size="9" font-weight="bold">${subTitleText}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const cahierProcedures: ProcedureData[] = [
  {
    id: "photo-proc-01",
    title: "Procédure 5.1.1.A — Remplacement disques frein SAHR",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Disque frein SAHR usé ST7 — 5.2mm, surchauffe, arrêt immédiat',
        cadrage: "Gros plan 45° sur l'étrier de frein avant gauche, éclairage de travail par lampe frontale 1000 lumens latérale.",
        subject: "Disque de frein mobile d'épaisseur 5,2 mm (limite d'usure à 6,0 mm). Traces de surchauffe bleues arc-en-ciel sur la face friction. Plaquettes réduites à 2 mm (limite 3 mm).",
        details: "Poudre métallique noire accumulée dans le fond d'étrier, huile de frein légèrement noircie. Joint racleur double lèvre déformé.",
        contexte: "Gant de mécanicien huileux au premier plan (flou), écrou de roue M22 desserré à côté.",
        message: "ARRÊT IMMÉDIAT — Perte de force de levage et pollution environnementale majeure au front de taille",
        prompt: generateDetailedPrompt("5.1.1.A", "CASSÉ", "Gros plan 45° étrier frein SAHR", "Disque frein SAHR usé à 5.2mm, surchauffé", "gant huileux et écrou desserré", "Poudre métallique noire"),
        realUrl: "/src/assets/images/epiroc_worn_disc_1782488017333.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Extracteur 8234-001 en position — LOTO appliqué, cale bois, seau huile',
        cadrage: "Plongée légère 30°, mise au point nette sur l'outil et les mains du mécanicien.",
        subject: "Extracteur de disque hydraulique Epiroc référence 8234-001 monté sur le moyeu de roue de chargeuse ST7.",
        details: "Mâchoires d'extraction engagées dans les cannelures du disque. Clé dynamométrique Snap-on 3/4\" réglée à 450 Nm posée à côté.",
        contexte: "Cale de bois calée entre le bras et le châssis, panneau de consignation accroché au volant, cadenas LOTO posé sur l'isolateur.",
        outils: "Extracteur 8234-001, clé dyna 3/4\" 450Nm, cale bois, cadenas LOTO.",
        prompt: generateDetailedPrompt("5.1.1.A", "OUTIL", "Mains mécanicien installant extracteur Epiroc 8234-001", "Extracteur hydraulique en acier rouge engagé sur cannelures", "clé dynamométrique Snap-on et béquille d'articulation", "LOTO cadenas jaune et étiquette"),
        realUrl: "/src/assets/images/epiroc_loto_lockout_1782488035612.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Disque neuf 8.0mm, plaquettes 12mm, joints neufs — Test OK',
        cadrage: "Face frontale, même angle que Photo 1 pour comparaison d'état directe.",
        subject: "Disque de frein neuf d'épaisseur 8,0 mm, surface de friction gris métal mat rectifiée sans aucune rayure.",
        details: "Plaquettes neuves de 12 mm avec chanfreins d'attaque. Joints toriques de piston neufs NBR 45x3 graissés.",
        contexte: "Compartiment nettoyé, outils propres alignés. Fiche de contrôle qualité visible.",
        validation: "Épaisseur disque 8.0 mm. Pression d'essai 180 bar maintenue. Brake test RCS : PASSED.",
        prompt: generateDetailedPrompt("5.1.1.A", "RÉSULTAT", "Disque frein SAHR neuf monté", "Disque de frein neuf épaisseur 8.0mm surface gris mat", "fiche de contrôle cochée à côté", "Plaquettes 12mm et ressorts SAHR intacts"),
        realUrl: "/src/assets/images/epiroc_new_disc_1782488050086.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Disque fissuré, piston rayé, ressorts corrodés — Catastrophe',
        cadrage: "Macro 1:1 sur la surface du disque, éclairage rasant à 15° pour souligner la profondeur des criques.",
        subject: "Disque de frein fissuré radialement sur 30 mm, éclat de métal manquant de 15x8 mm sur le bord périphérique.",
        details: "Piston d'étrier rayé de profondes stries de 2 mm. Huile de frein noire épaisse et chargée de paillettes dorées.",
        contexte: "Post-it d'alerte jaune collé sur l'étrier, ressorts SAHR corrodés orange avec spires déformées.",
        ligneRouge: "EXPLOSION DU DISQUE — Fuite de pression et surchauffe majeure à 165°C. Appeler le chef immédiatement.",
        prompt: generateDetailedPrompt("5.1.1.A", "MAUVAIS", "Défaut majeur disque de frein SAHR", "Disque fissuré radialement avec éclat périphérique manquant", "gant montrant la fissure et post-it d'erreur", "Piston rayé et ressorts corrodés orange"),
        realUrl: "/src/assets/images/epiroc_cracked_disc_1782488064101.jpg"
      }
    ]
  },
  {
    id: "photo-proc-02",
    title: "Procédure 5.1.2.A — Remplacement accumulateur frein",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Accumulateur frein 2L déchargé — Pression faible, corrosion',
        cadrage: "Plan moyen, compartiment accumulateurs de frein de stationnement de la chargeuse ST7.",
        subject: "Accumulateur à membrane 2L, corps en acier écaillé et rouille de surface au raccord inférieur.",
        details: "Manomètre de test d'azote branché sur la valve de précharge indiquant 45 bar (minimum requis : 80 bar).",
        contexte: "Lampe frontale du mécanicien éclairant l'accumulateur. Fuite d'huile au raccord flexible.",
        message: "Manque d'azote. Freins bloqués au démarrage. Voyant rouge allumé en cabine.",
        prompt: generateDetailedPrompt("5.1.2.A", "CASSÉ", "Accumulateur de frein 2L usé", "Corps de l'accumulateur écaillé, manomètre à 45 bar", "gouttes d'huile hydraulique au raccord", "Défaut d'étanchéité d'azote"),
        realUrl: "/src/assets/images/epiroc_accum_broken_1782488838664.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Testeur de précharge Epiroc 8234-089 en position de charge azote',
        cadrage: "Gros plan sur les mains et le bloc de charge azote.",
        subject: "Dispositif de gonflage d'azote Epiroc référence 8234-089 branché sur la valve Schrader supérieure.",
        details: "Bouteille d'azote 50L en arrière-plan avec détendeur réglé à 150 bar. Raccord étanche bien vissé.",
        contexte: "Mécano portant des lunettes de protection et des gants en nitrile, manipulant la vanne de charge.",
        outils: "Testeur de charge 8234-089, bouteille azote, détendeur 0-250 bar, clé de 19 mm.",
        prompt: generateDetailedPrompt("5.1.2.A", "OUTIL", "Installation de l'appareil de charge azote", "Dispositif de gonflage Epiroc 8234-089 connecté sur l'accumulateur", "mains manipulant la bouteille d'azote 50L", "Manomètres et tuyau flexible haute pression"),
        realUrl: "/src/assets/images/epiroc_accum_tool_1782488852198.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Accumulateur neuf gonflé à 80 bar — Raccords étanches',
        cadrage: "Même angle que Photo 1, accumulateur neuf installé et verrouillé sur son support métallique.",
        subject: "Accumulateur neuf avec sa peinture d'origine Epiroc jaune/rouge intacte, marquage de couple appliqué sur les brides.",
        details: "Capuchon métallique de protection de la valve de charge azote revissé. Pas d'émulsion d'huile.",
        contexte: "Zone essuyée et propre, outils de maintenance rangés sur le tapis.",
        validation: "Pression de précharge azote mesurée à 80 bar à une température ambiante de 20°C. Étanchéité OK.",
        prompt: generateDetailedPrompt("5.1.2.A", "RÉSULTAT", "Accumulateur de frein neuf monté", "Corps d'accumulateur rouge vif Epiroc neuf et brillant", "témoin de vernis jaune sur les fixations", "Pression stable à 80 bar sur le manomètre"),
        realUrl: "/src/assets/images/epiroc_accum_ok_1782488866738.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Membrane d\'accumulateur éclatée — Infiltration d\'huile',
        cadrage: "Gros plan sur l'orifice de valve de gonflage d'azote supérieure.",
        subject: "Membrane interne en élastomère complètement déchirée et coincée dans la valve d'azote.",
        details: "Huile de frein hydraulique s'écoulant par la valve d'azote supérieure, manomètre brisé suite à surpression.",
        contexte: "Éclats d'huile projetés sur le capot, indicateur cabine montrant une perte complète d'accumulateur.",
        ligneRouge: "EXPLOSION MEMBRANE — Risque d'interruption totale du freinage. Remplacer l'accumulateur immédiatement.",
        prompt: generateDetailedPrompt("5.1.2.A", "MAUVAIS", "Valve supérieure avec fuite d'huile", "Huile hydraulique noire s'écoulant de l'orifice d'azote", "morceaux de membrane noire déchirée visibles", "Manomètre de test cassé"),
        realUrl: "/src/assets/images/epiroc_accum_bad_1782488877911.jpg"
      }
    ]
  },
  {
    id: "photo-proc-03",
    title: "Procédure 2.1.1.A — Démontage convertisseur Funk DF150",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Convertisseur Funk DF150 — Fuite joint spi, limaille bronze',
        cadrage: "Vue à 30° sous la cloche d'accouplement de transmission.",
        subject: "Fuite d'huile rouge ATF de transmission abondante au niveau du joint spi d'arbre d'entrée.",
        details: "Présence de particules métalliques dorées (limaille de bronze) collées au fond du carter inférieur.",
        contexte: "Chiffon gras d'atelier suspendu à la patte de fixation du filtre de transmission.",
        message: "FUITE ACCUPL — Risque d'usure des cannelures d'arbre et de perte totale de motricité.",
        prompt: generateDetailedPrompt("2.1.1.A", "CASSÉ", "Vue sous cloche de convertisseur Funk", "Fuite importante d'huile rouge ATF au joint d'entrée d'arbre", "copeaux métalliques de bronze au fond du carter", "Traces de frottement asymétrique sur l'arbre"),
        realUrl: "/src/assets/images/epiroc_conv_broken_1782488892524.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Vire-vire moteur et élingues — Démontage convertisseur',
        cadrage: "Vue plongeante sur la liaison volant moteur et carter.",
        subject: "Outil de vire-vire moteur (Engine Barring Tool) inséré pour faire tourner le volant et aligner les boulons.",
        details: "Élingues textiles de 2 tonnes certifiées accrochées solidement sur les anneaux de levage du convertisseur.",
        contexte: "Châssis ST7 sécurisé avec la béquille d'articulation de sécurité verrouillée en jaune.",
        outils: "Outil de vire-vire, élingues 2t, clé à choc de 15 mm, douilles à choc.",
        prompt: generateDetailedPrompt("2.1.1.A", "OUTIL", "Vire-vire moteur engagé sur couronne", "Outil mécanique engagé sur la denture de couronne de démarreur", "élingues de levage en nylon retenant le convertisseur", "Béquille d'articulation de sécurité en place"),
        realUrl: "/src/assets/images/epiroc_conv_tool_1782488907494.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Convertisseur Funk neuf — Coaxialité validée',
        cadrage: "Alignement axial du convertisseur Funk DF150 neuf reposant contre le volant moteur.",
        subject: "Convertisseur neuf correctement indexé, écart de coaxialité d'arbre inférieur à 0,05 mm.",
        details: "Joint spi neuf de couleur noire lubrifié, vis neuves de grade 10.9 serrées à 110 Nm et peintes en jaune.",
        contexte: "Plan de joint de culasse et carter d'embrayage dégraissé et brillant.",
        validation: "Jeu fonctionnel mesuré conforme. Serrage en étoile à 110 Nm. Absence totale de vibrations.",
        prompt: generateDetailedPrompt("2.1.1.A", "RÉSULTAT", "Convertisseur Funk DF150 neuf aligné", "Convertisseur neuf monté, alignement parfait", "vis avec vernis de marquage jaune de serrage", "Carter de volant propre sans aucune coulure"),
        realUrl: "/src/assets/images/epiroc_conv_ok_1782488923436.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Ailettes de stator cassées, bleuissement thermique',
        cadrage: "Vue macro à travers l'ouverture de carter de convertisseur.",
        subject: "Ailettes du stator du convertisseur cassées et pliées à cause d'une cavitation interne sévère.",
        details: "Traces de surchauffe thermique (bleuissement de l'acier) sur l'ensemble du moyeu cannelé central.",
        contexte: "Cannelures internes d'arbre d'accouplement complètement lissées et déformées par torsion.",
        ligneRouge: "DESTRUCTION INTERNE — Débris métalliques propagés. Rinçage complet de la boîte requis.",
        prompt: generateDetailedPrompt("2.1.1.A", "MAUVAIS", "Rupture interne des ailettes de stator", "Ailettes de convertisseur cassées et tordues", "bleuissement bleu-noir métallique du moyeu central", "Cannelures d'arbre rongées et lisses"),
        realUrl: "/src/assets/images/epiroc_conv_bad_1782488935654.jpg"
      }
    ]
  },
  {
    id: "photo-proc-04",
    title: "Procédure 2.2.1.A — Démontage embrayage power shift",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Disques d\'embrayage brûlés — Voilage prononcé, odeur',
        cadrage: "Gros plan sur le pack de disques de friction étalés sur l'établi.",
        subject: "Disques de friction d'embrayage carbonisés, de couleur anthracite à noire avec matière arrachée.",
        details: "Disques lisses en acier présentant des déformations thermiques et des taches de surchauffe violettes.",
        contexte: "Huile de transmission de couleur noire opaque avec forte odeur de brûlé dans le bac d'inspection.",
        message: "PATINAGE EMBRAYAGE — Épaisseur totale du pack usée à 22 mm (valeur nominale neuve : 24,8 mm).",
        prompt: generateDetailedPrompt("2.2.1.A", "CASSÉ", "Disques d'embrayage carbonisés", "Disques de friction noircis avec garniture décollée", "disques d'acier déformés par la chaleur", "Échantillon d'huile de boîte noire et charbonneuse"),
        realUrl: "/src/assets/images/epiroc_clutch_broken_1782489449767.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Presse de compression Epiroc 8234-012 sur moyeu d\'embrayage',
        cadrage: "Plan serré sur la presse de compression de ressort d'embrayage.",
        subject: "Compresseur de ressorts de rappel Epiroc référence 8234-012 monté sur l'axe de moyeu d'embrayage.",
        details: "Ressorts de rappel comprimés permettant d'accéder au circlip de retenue d'arbre principal.",
        contexte: "Pince à circlip externe de 12\" tenue par le mécanicien au-dessus du moyeu.",
        outils: "Compresseur 8234-012, pince circlip 12\", jeu de jauges d'épaisseur.",
        prompt: generateDetailedPrompt("2.2.1.A", "OUTIL", "Compresseur 8234-012 en position", "Outil de compression en acier noir vissé sur le moyeu", "ressorts de rappel comprimés de manière uniforme", "Pince circlip de précision tenue par le mécanicien"),
        realUrl: "/src/assets/images/epiroc_clutch_tool_1782489464546.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Embrayage réassemblé — Jeu fonctionnel et étanchéité',
        cadrage: "Vue frontale nette de l'embrayage Power Shift réassemblé.",
        subject: "Disques de friction et d'acier neufs alternés correctement, lubrifiés avec de l'huile ATF neuve.",
        details: "Jeu fonctionnel libre réglé à 1,85 mm (limites standard : 1,70 - 2,00 mm). Joints de piston neufs.",
        contexte: "Embrayage aligné sur un chiffon microfibre bleu propre, comparateur de précision en position.",
        validation: "Jeu mesuré à 1,85 mm au comparateur. Pression d'application stable à 16,5 bar.",
        prompt: generateDetailedPrompt("2.2.1.A", "RÉSULTAT", "Embrayage Power Shift réassemblé", "Pack d'embrayage propre avec disques neufs alternés", "comparateur de jeu fonctionnel à cadran numérique", "Chiffon microfibre bleu propre d'atelier"),
        realUrl: "/src/assets/images/epiroc_clutch_ok_1782489479985.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Cannelures de cloche d\'embrayage crantées — Blocage disques',
        cadrage: "Vue rasante de l'intérieur des cannelures de la cloche d'embrayage.",
        subject: "Cannelures internes fortement marquées par martèlement (usure en escalier ou crantage).",
        details: "Crantage de 0,8 mm empêchant le coulissement libre des disques de friction. Segment de piston brisé.",
        contexte: "Débris métalliques de joints d'étanchéité posés sur le carter de cloche endommagé.",
        ligneRouge: "CLOCHE DORT — Remplacement de la cloche obligatoire. Le remontage sur cannelures crantées grillerait le pack neuf.",
        prompt: generateDetailedPrompt("2.2.1.A", "MAUVAIS", "Cannelures de cloche d'embrayage usées", "Cannelures internes crantées en marches d'escalier", "traces d'impacts de martèlement sur l'acier", "Segment de piston d'embrayage cassé en morceaux"),
        realUrl: "/src/assets/images/epiroc_clutch_bad_1782489495189.jpg"
      }
    ]
  },
  {
    id: "photo-proc-05",
    title: "Procédure 1.1.2.B — Remplacement injecteur QSB 6.7",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Injecteur Cummins calaminé — Buses obstruées, érosion',
        cadrage: "Macro 1:1 sur le nez d'injecteur Cummins déposé sur l'établi.",
        subject: "Nez d'injecteur recouvert d'une épaisse croûte de calamine noire d'aspect gras (carbone).",
        details: "Micro-buses d'injection obstruées à plus de 80%. Rondelle pare-flamme en cuivre amincie et corrodée.",
        contexte: "Traces de fuites de gaz de combustion le long du corps cylindrique en acier de l'injecteur.",
        message: "INJECTEUR GRIPPE — Perte de puissance moteur, fumée noire à l'échappement et ratés de combustion.",
        prompt: generateDetailedPrompt("1.1.2.B", "CASSÉ", "Nez d'injecteur Cummins calaminé", "Dépôt épais de carbone noir sur le nez de l'injecteur", "micro-trous d'injection obstrués de suie", "Joint cuivre pare-flamme déformé et aminci"),
        realUrl: "/src/assets/images/epiroc_injector_broken_1782489514098.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Extracteur Epiroc 8234-056 en position de dépose injecteur',
        cadrage: "Vue plongeante serrée sur le puits d'injecteur de la culasse du moteur Cummins QSB 6.7.",
        subject: "Pont extracteur d'injecteur mécanique de précision référence 8234-056 vissé on the filetage d'alimentation.",
        details: "Masse à inertie alignée sur l'axe vertical du puits. Raccord haute pression obturé par un bouchon jaune.",
        contexte: "Cache-culbuteur démonté, surfaces propres de l'arbre à cames protégées par un film plastique.",
        outils: "Extracteur 8234-056, clé dynamométrique 1/4\", brosse de puits, bouchons de propreté.",
        prompt: generateDetailedPrompt("1.1.2.B", "OUTIL", "Extracteur 8234-056 monté sur culasse", "Pont extracteur métallique boulonné sur la tête de l'injecteur", "bouchon plastique de protection jaune sur la rampe commune", "Arbre à cames et soupapes visibles sous plastique"),
        realUrl: "/src/assets/images/epiroc_injector_tool_1782489527983.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Injecteur neuf monté — Portée propre, code IMA codé',
        cadrage: "Vue latérale de l'injecteur neuf prêt pour l'installation dans son puits de culasse.",
        subject: "Injecteur Cummins QSB 6.7 neuf avec rondelle pare-flamme neuve de 1,5 mm graissée.",
        details: "Code de calibration IMA de 30 caractères gravé laser bien lisible sur la tête d'injecteur.",
        contexte: "Portée de joint au fond du puits nettoyée avec l'outil de rodage, sans trace de calamine.",
        validation: "Bride d'injecteur serrée à 30 Nm + 90°. Code IMA enregistré dans l'ECU. Étanchéité de combustion validée.",
        prompt: generateDetailedPrompt("1.1.2.B", "RÉSULTAT", "Injecteur Cummins neuf prêt au montage", "Injecteur neuf d'origine avec code IMA laser lisible", "rondelle cuivre neuve graissée à la graisse blanche", "Puits de culasse alésé et brillant de propreté"),
        realUrl: "/src/assets/images/epiroc_injector_ok_1782489540814.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Portée de joint rayée, double joint cuivre empilé',
        cadrage: "Vue macro d'inspection endoscopique du fond du puits d'injecteur.",
        subject: "Portée d'étanchéité en cuivre au fond du puits profondément rayée par l'usage d'un tournevis.",
        details: "Présence de deux joints en cuivre pare-flamme superposés (l'ancien joint n'ayant pas été extrait).",
        contexte: "Sillon d'usure de 0,3 mm de profondeur qui provoquera des fuites de compression immédiates.",
        ligneRouge: "FUITE DE CULASSE — Ne jamais empiler deux joints cuivre. Ne jamais remonter sur une portée rayée.",
        prompt: generateDetailedPrompt("1.1.2.B", "MAUVAIS", "Inspection endoscopique fond de puits", "Rayures profondes en spirale au fond du puits d'injecteur", "deux joints en cuivre écrasés empilés au fond", "Écran de diagnostic d'endoscope montrant le défaut"),
        realUrl: "/src/assets/images/epiroc_injector_bad_1782489553708.jpg"
      }
    ]
  },
  {
    id: "photo-proc-06",
    title: "Procédure 3.1.1.A — Remplacement pompe Rexroth A10VO",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Pompe Rexroth A10VO fissurée — Fuite de carter, jeu d\'arbre',
        cadrage: "Vue 3/4 face de la pompe hydraulique principale montée sur la prise de force (PTO).",
        subject: "Carter de la pompe Rexroth A10VO fissuré longitudinalement au niveau du pied de fixation.",
        details: "Huile de vidange hydraulique pulvérisée sous forme de brouillard sur l'ensemble du compartiment d'entraînement.",
        contexte: "Arbre de pompe présentant un jeu radial excessif de 2,5 mm, limaille de laiton visible au drain.",
        message: "POMPE DÉTRUITE — Piston de pompe grippé, arrêt immédiat pour éviter de contaminer tout le réseau.",
        prompt: generateDetailedPrompt("3.1.1.A", "CASSÉ", "Fissure de carter de pompe Rexroth", "Fissure longitudinale nette sur le carter en fonte noire", "brouillard d'huile pulvérisé sur les parois d'armoire", "Limaille de laiton brillante de friction sur l'arbre"),
        realUrl: "/src/assets/images/epiroc_pump_broken_1782489573771.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Élingues de manutention et bouchons JIC sur tuyaux',
        cadrage: "Plan large montrant le soutien de la pompe par élingues de manutention lors de la dépose.",
        subject: "Sangles de manutention d'une capacité de 500 kg soutenant le poids de 45 kg de la pompe Rexroth.",
        details: "Tuyauteries d'aspiration et de refoulement déconnectées et obturées avec des bouchons filetés JIC en acier.",
        contexte: "Vis d'accouplement de la pompe sur le carter d'entraînement desserrées de moitié.",
        outils: "Sangles de manutention, jeu d'obturateurs JIC en acier, clé à choc de 24 mm.",
        prompt: generateDetailedPrompt("3.1.1.A", "OUTIL", "Dépose assistée de la pompe Rexroth", "Sangles de manutention jaunes de 500kg supportant la pompe", "tuyaux hydrauliques déconnectés avec bouchons JIC en acier", "Vis de fixation de bride de transmission desserrées"),
        realUrl: "/src/assets/images/epiroc_pump_tool_1782489589081.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Pompe Rexroth neuve installée — Alignement et couple',
        cadrage: "Même cadrage que Photo 1, pompe neuve d'origine Rexroth A10VO installée.",
        subject: "Pompe neuve peinte en noir mat, fixée parfaitement à fleur de la prise de force d'entraînement.",
        details: "Vis d'accouplement neuves de classe 10.9 serrées à 195 Nm avec repères de peinture blanche appliqués.",
        contexte: "Tuyauteries d'aspiration et flexibles de drainage de retour branchés sans contrainte mécanique.",
        validation: "Remplissage d'huile effectué par le drain supérieur. Pression de veille 25 bar. Pression maximale 280 bar.",
        prompt: generateDetailedPrompt("3.1.1.A", "RÉSULTAT", "Pompe Rexroth A10VO neuve installée", "Pompe hydraulique Rexroth neuve noire mate brillante", "vis serrées avec marquage de peinture blanche", "Durite de drainage de retour orientée vers le haut"),
        realUrl: "/src/assets/images/epiroc_pump_ok_1782489607922.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Particules dorées au drain — Cavitation, destruction interne',
        cadrage: "Macro à l'intérieur de l'orifice de drainage de carter de pompe.",
        subject: "Présence massive de paillettes métalliques dorées d'usure de patins de pistons en laiton.",
        details: "Copeaux d'acier et fragments de billes de roulements logés au fond de l'orifice de raccord.",
        contexte: "Indique une destruction totale interne par manque d'alimentation d'huile hydraulique (cavitation).",
        ligneRouge: "CATASTROPHE POMPE — Circuit pollué de limaille. Rinçage complet obligatoire du réservoir et des vérins.",
        prompt: generateDetailedPrompt("3.1.1.A", "MAUVAIS", "Drain de pompe rempli de limaille", "Paillettes de laiton dorées brillantes accumulées au drain", "morceaux de billes d'acier de roulement brisé", "Indice de cavitation sévère et de grippage"),
        realUrl: "/src/assets/images/epiroc_pump_bad_1782489621538.jpg"
      }
    ]
  },
  {
    id: "photo-proc-07",
    title: "Procédure 3.3.2.A — Remplacement vérin hoist 125mm",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Vérin de levage usé — Fuite presse-étoupe, tige rayée',
        cadrage: "Gros plan sur le presse-étoupe (gland) du vérin de levage gauche de la flèche.",
        subject: "Fuite d'huile hydraulique abondante s'écoulant le long de la tige de vérin à chaque mouvement.",
        details: "Tige présentant de profondes rayures longitudinales de 0,5 mm sur toute sa course active.",
        contexte: "Joint racleur double lèvre en polyuréthane déformé et craquelé avec débris rocheux incrustés.",
        message: "FUITE PRESSION — Perte de force de levage et pollution environnementale majeure au front de taille",
        prompt: generateDetailedPrompt("3.3.2.A", "CASSÉ", "Presse-étoupe de vérin de levage fuyard", "Fluide hydraulique s'écoulant le long de la tige chromée", "rayures longitudinales profondes sur le chrome de la tige", "Joint racleur en caoutchouc déchiré avec grains de roche"),
        realUrl: "/src/assets/images/epiroc_cylinder_broken_1782489637463.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Clé à ergot 140 mm et extracteur d\'axe sur vérin',
        cadrage: "Plan large de l'avant de la machine, focus sur le démontage des axes d'articulation.",
        subject: "Clé à ergot lourde de 140 mm engagée sur le nez fileté du vérin de levage, fixée à un multiplicateur.",
        details: "Extracteur d'axe hydraulique portable monté sur l'axe d'articulation supérieur de la chape.",
        contexte: "Bras du chargeur soutenu par des cales métalliques de sécurité peintes en jaune vif.",
        outils: "Clé à ergot 140 mm, multiplicateur de couple, extracteur d'axe hydraulique, palan 3t.",
        prompt: generateDetailedPrompt("3.3.2.A", "OUTIL", "Démontage de l'axe de vérin au vérin portatif", "Extracteur d'axe hydraulique en place sur la chape de pivot", "clé à ergot de 140mm couplée au multiplicateur", "Bras de flèche posé sur des cales de sécurité jaunes"),
        realUrl: "/src/assets/images/epiroc_cylinder_tool_1782489651029.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Vérin de levage neuf monté — Graissage, axes sécurisés',
        cadrage: "Vue latérale du vérin de levage de 125 mm réinstallé sur le bras articulé de la chargeuse.",
        subject: "Vérin neuf d'origine Epiroc avec sa peinture jaune brillant, tige chromée impeccable sans rayures.",
        details: "Axe d'articulation verrouillé par sa plaque d'arrêt et des vis neuves serrées au couple de 280 Nm.",
        contexte: "Graisseurs neufs graissés avec de la graisse noire au bisulfure de molybdène propre.",
        validation: "Plaque de verrouillage posée. Purge d'air effectuée sur 3 cycles. Pas de fuite à 240 bar.",
        prompt: generateDetailedPrompt("3.3.2.A", "RÉSULTAT", "Vérin de levage neuf installé sur flèche", "Vérin jaune Epiroc neuf avec tige chromée brillante", "plaque de verrouillage d'axe neuve fixée à 280 Nm", "Joints JIC d'alimentation raccordés et secs"),
        realUrl: "/src/assets/images/epiroc_cylinder_ok_1782489666433.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Ovalisation alésage axe, fissure de fatigue soudure',
        cadrage: "Gros plan d'inspection sur l'œil d'articulation de pied de vérin soudé au châssis.",
        subject: "Alésage d'axe d'articulation déformé en ellipse (ovalisation de 4 mm par rapport au nominal).",
        details: "Fissure de fatigue thermique de 15 mm de long dans le cordon de soudure de la chape de fixation.",
        contexte: "Traces de frottement métal-métal à sec (manque chronique de lubrification par axe grippé).",
        ligneRouge: "CRIC CHÂSSIS — Soudure fissurée et alésage ovalisé. Arrêt immédiat de la machine. Métallurgie requise.",
        prompt: generateDetailedPrompt("3.3.2.A", "MAUVAIS", "Chape de pivot de vérin fissurée", "Fissure de fatigue sur le cordon de soudure de la chape", "alésage d'axe ovalisé en forme d'ellipse", "Traces de frottements et d'abrasion métallique à sec"),
        realUrl: "/src/assets/images/epiroc_cylinder_bad_1782489679725.jpg"
      }
    ]
  },
  {
    id: "photo-proc-08",
    title: "Procédure 3.1.2.A — Remplacement filtre return line 12μ",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Filtre retour colmaté — Indicateur rouge, fuite couvercle',
        cadrage: "Vue de dessus du couvercle d'accès au boîtier de filtre de retour hydraulique.",
        subject: "Indicateur visuel de colmatage à aiguille mécanique bloqué en zone rouge \"COLMATÉ\" à chaud.",
        details: "Fuite d'huile hydraulique au plan de joint du couvercle suite à une surpression ou un joint déformé.",
        contexte: "Dépôts noirs d'huile oxydée accumulés sur les rebords extérieurs du boîtier en aluminium.",
        message: "FILTRE EN BYPASS — Huile polluée retournant directement au réservoir. Risque pour les distributeurs.",
        prompt: generateDetailedPrompt("3.1.2.A", "CASSÉ", "Indicateur de colmatage filtre hydraulique", "Indicateur de pression à aiguille calé dans la zone rouge", "suintement d'huile sur le plan de joint du couvercle", "Poussière noire de mine collée sur l'aluminium"),
        realUrl: "/src/assets/images/epiroc_filter_broken_1782489697728.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Clé à sangle et bac de vidange — Desserre cartouche',
        cadrage: "Vue plongeante sur l'orifice de vidange et de démontage de la cartouche filtrante.",
        subject: "Clé à sangle en tissu synthétique appliquée sur le corps de la cartouche à visser (spin-on).",
        details: "Bac de récupération d'huile propre positionné sous le corps de filtre pour recueillir les fuites.",
        contexte: "Mécanicien équipé de gants nitrile propres, disposant d'un chiffon doux non pelucheux.",
        outils: "Clé à sangle de filtre, bac de vidange, clé mâle de 8 mm, chiffon microfibre.",
        prompt: generateDetailedPrompt("3.1.2.A", "OUTIL", "Démontage de la cartouche de filtre de retour", "Clé à sangle synthétique noire desserrant la cartouche", "bac de vidange sous le filtre contenant de l'huile noire", "Mains avec gants nitrile manipulant la clé de purge"),
        realUrl: "/src/assets/images/epiroc_filter_tool_1782489713726.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Filtre neuf 12 microns — Couple et traçabilité',
        cadrage: "Même vue que Photo 1, couvercle et cartouche de filtre de retour refermés et propres.",
        subject: "Cartouche de filtration neuve d'origine Epiroc (seuil 12 microns absolu) vissée en place.",
        details: "Couvercle serré au couple requis de 45 Nm. Indicateur visuel de colmatage revenu dans la zone verte.",
        contexte: "Date de remplacement et heures moteur de la machine écrites de manière lisible au marqueur blanc.",
        validation: "Cartouche serrée à 45 Nm. Joint lubrifié. Indicateur de colmatage au vert sous test de charge.",
        prompt: generateDetailedPrompt("3.1.2.A", "RÉSULTAT", "Filtre de retour hydraulique neuf monté", "Cartouche filtrante neuve blanche d'origine Epiroc", "date et heures moteur écrites proprement au marqueur", "Indicateur de colmatage calé en zone verte"),
        realUrl: "/src/assets/images/epiroc_filter_ok_1782489725811.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Média plissé saturé de copeaux d\'acier — Alerte aimant',
        cadrage: "Macro d'inspection sur un pli découpé du média filtrant en micro-fibres de verre.",
        subject: "Plis du filtre saturés de limaille de fer brillante et de débris d'acier argentés d'épaisseur > 1 mm.",
        details: "Média filtrant tordu et écrasé sous l'effet d'une différence de pression de retour anormale.",
        contexte: "Coupelles d'examen magnétique d'atelier retenant des particules d'usure de pistons de pompes.",
        ligneRouge: "CONTAMINATION MAJEURE — Présence massive d'éclats de fer. Arrêt machine obligatoire. Diagnostic pompe.",
        prompt: generateDetailedPrompt("3.1.2.A", "MAUVAIS", "Analyse du média filtrant découpé", "Média filtrant plissé saturé d'éclats métalliques brillants", "plis de micro-fibres de verre déformés et déchirés", "Aimant d'analyse d'atelier chargé de limaille de fer"),
        realUrl: "/src/assets/images/epiroc_pump_bad_1782489621538.jpg"
      }
    ]
  },
  {
    id: "photo-proc-09",
    title: "Procédure 1.1.3.B — Nettoyage V-tube core radiator",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Radiateur Cummins obstrué — Sédiments rocheux, surchauffe',
        cadrage: "Vue rapprochée face au faisceau de refroidissement du radiateur moteur.",
        subject: "Faisceau de tubes de radiateur en V entièrement obstrué par de la boue rocheuse et des poussières.",
        details: "Agglomération de sédiments solidifiés par des vapeurs de suie et d'huile. Surface d'échange réduite de 90%.",
        contexte: "Machine stationnée en atelier d'entretien avec les grilles de calandre de protection ouvertes.",
        message: "RISQUE SURCHAUFFE — Blocage d'échange thermique. Température moteur critique à 102°C au RCS.",
        prompt: generateDetailedPrompt("1.1.3.B", "CASSÉ", "Faisceau de radiateur obstrué de sédiments", "Ailettes de radiateur colmatées par une croûte de poussière", "traces d'huile agglomérant la boue rocheuse sur les tubes", "Grilles de calandre de protection d'atelier ouvertes"),
        realUrl: "/src/assets/images/epiroc_filter_broken_1782489697728.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Lance pneumatique coudée — Distance de nettoyage 30cm',
        cadrage: "Vue de profil à mi-hauteur du faisceau de radiateur lors du soufflage.",
        subject: "Lance de nettoyage pneumatique à jet d'air comprimé Epiroc avec rallonge coudée de 1m.",
        details: "Lance maintenue à une distance stricte de 300 mm et orientée perpendiculairement (90°) aux ailettes.",
        contexte: "Technicien équipé d'un masque respiratoire étanche FFP3, de lunettes et d'une protection antibruit.",
        outils: "Lance pneumatique coudée Epiroc, régulateur d'air réglé à 5 bar, peigne à ailettes.",
        prompt: generateDetailedPrompt("1.1.3.B", "OUTIL", "Lavage à la lance pneumatique coudée", "Lance pneumatique en acier inox tenue à 30cm des ailettes", "jet d'air comprimé évacuant la poussière de roche", "Mécanicien avec équipement complet masque FFP3 et lunettes"),
        realUrl: "/src/assets/images/epiroc_filter_tool_1782489713726.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Radiateur propre — Transparence de flux d\'air 100%',
        cadrage: "Même vue que Photo 1, face au faisceau de refroidissement après intervention.",
        subject: "Tubes et ailettes en aluminium parfaitement nets, redressés à l'aide du peigne d'ailettes.",
        details: "La lumière d'un projecteur LED de 50W placé derrière traverse entièrement le faisceau d'un côté à l'autre.",
        contexte: "Surfaces d'aluminium propres, exemptes de sédiments blancs calcaire ou de gras.",
        validation: "Ailettes de refroidissement de tubes en V redressées. Transparence à 100%. Température nominale 85°C.",
        prompt: generateDetailedPrompt("1.1.3.B", "RÉSULTAT", "Radiateur en V parfaitement propre", "Ailettes d'aluminium droites et brillantes de propreté", "lumière d'un projecteur LED traversant entièrement le faisceau", "Température moteur stabilisée à 85°C"),
        realUrl: "/src/assets/images/epiroc_filter_ok_1782489725811.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Ailettes écrasées par haute pression d\'eau, fuite verte',
        cadrage: "Macro d'inspection sur une section du faisceau d'ailettes.",
        subject: "Ailettes d'aluminium pliées et écrasées les unes sur les autres suite à un lavage trop proche à haute pression.",
        details: "Fuite de liquide de refroidissement de couleur vert fluorescent s'écoulant au pied d'un tube plié.",
        contexte: "Usage d'un nettoyeur haute pression à eau chaude à moins de 50 mm des ailettes (proscrit).",
        ligneRouge: "RADIATEUR HS — Ailettes détruites et tube d'eau fissuré. Interdiction d'utiliser le nettoyeur HP de près.",
        prompt: generateDetailedPrompt("1.1.3.B", "MAUVAIS", "Dégâts de lavage haute pression sur ailettes", "Ailettes d'aluminium écrasées et déformées en vagues", "suintement vert fluorescent de liquide de refroidissement", "Fissure de fatigue sur le tube de liaison en cuivre"),
        realUrl: "/src/assets/images/epiroc_cylinder_bad_1782489679725.jpg"
      }
    ]
  },
  {
    id: "photo-proc-10",
    title: "Procédure 2.2.2.A — Calibration RCS transmission",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Écran RCS — Erreur de calibration, secousses',
        cadrage: "Plan d'ensemble de l'écran principal du système de contrôle RCS en cabine.",
        subject: "Écran affichant une alarme active \"TRANS CALIBRATION REQUIRED\" ou \"SLIPPAGE FAULT\".",
        details: "Passage des rapports de transmission brutal entraînant des secousses et des chocs de couple.",
        contexte: "Témoin rouge de diagnostic de boîte allumé sur la console de bord.",
        message: "ANOMALIE DE CONDUITE — Risque de détérioration de la transmission Rock Tough par chocs.",
        prompt: generateDetailedPrompt("2.2.2.A", "CASSÉ", "Écran RCS affichant alarme boîte", "Texte d'alarme TRANS CALIBRATION REQUIRED à l'écran", "témoin d'anomalie de boîte rouge allumé en cabine", "Joystick de translation en position neutre"),
        realUrl: "/src/assets/images/epiroc_accum_broken_1782488838664.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Câble d\'ordinateur M12 et bloque-pédale de frein',
        cadrage: "Vue du poste de conduite de la chargeuse ST7, focus sur la console d'affichage.",
        subject: "Câble de diagnostic étanche M12 connecté sous le tableau de bord, relié au PC portable Epiroc Certiq.",
        details: "Pédale de frein de service maintenue enfoncée by un bloque-pédale mécanique pour l'essai sous couple.",
        contexte: "La température d'huile de transmission est affichée stable à 82°C (requis > 75°C).",
        outils: "Câble de diagnostic M12, PC de service Epiroc Certiq, bloque-pédale mécanique.",
        prompt: generateDetailedPrompt("2.2.2.A", "OUTIL", "Outil de diagnostic Epiroc Certiq connecté", "Câble blindé M12 connecté au port étanche de cabine", "ordinateur de service affichant le logiciel Certiq", "Bloque-pédale de frein installé sur la pédale de service"),
        realUrl: "/src/assets/images/epiroc_accum_tool_1782488852198.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Calibration réussie — Temps de remplissage OK, stable',
        cadrage: "Gros plan sur l'écran du terminal RCS de cabine.",
        subject: "Message de succès vert affiché : \"CALIBRATION COMPLETE - ALL CLUTCHES OK\".",
        details: "Temps de remplissage d'embrayages étalonnés à des valeurs nominales conformes de 240 ms à 290 ms.",
        contexte: "Icône de statut d'embrayage active au vert, historique de défauts de transmission vide.",
        validation: "Temps d'embrayage ajustés. Changement de rapports doux. Absence d'erreur sur le bus CAN.",
        prompt: generateDetailedPrompt("2.2.2.A", "RÉSULTAT", "Écran de confirmation de calibration réussie", "Message vert CALIBRATION COMPLETE à l'écran de cabine", "courbes de temps de remplissage d'embrayage à 250ms", "Cabine propre et carnet d'entretien validé"),
        realUrl: "/src/assets/images/epiroc_accum_ok_1782488866738.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Échec calibration — Surchauffe boîte, code 0x72',
        cadrage: "Gros plan de l'écran RCS affichant une défaillance d'essai.",
        subject: "Message de panne : \"CALIBRATION FAILED: CLUTCH 3 FILL TIME OUT OF RANGE (ERROR 0x72)\".",
        details: "Température de boîte de vitesses montant rapidement à 110°C à cause d'un patinage excessif.",
        contexte: "Indique un défaut d'étanchéité interne ou un ressort de piston d'embrayage fendu.",
        ligneRouge: "SOUCI BOÎTE — Calibration échouée. Piston ou électrovanne fuyard. Ouvrir la boîte d'urgence.",
        prompt: generateDetailedPrompt("2.2.2.A", "MAUVAIS", "Échec de calibration sur l'écran RCS", "Message d'erreur rouge CALIBRATION FAILED à l'écran", "indicateur de température de boîte à 110°C", "Câble de diagnostic débranché par inadvertance"),
        realUrl: "/src/assets/images/epiroc_accum_bad_1782488877911.jpg"
      }
    ]
  },
  {
    id: "photo-proc-11",
    title: "Procédure 10.4.1.A — Calibration load weighing",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Pesage godet erroné — Valeur négative, dérive signal',
        cadrage: "Vue de la chargeuse ST7 godet levé, écran de pesage incrusté en médaillon.",
        subject: "Écran RCS affichant un poids erroné de -3,2 tonnes alors que le godet est rempli de minerai.",
        details: "Oscillations anarchiques de la mesure sans jamais stabiliser la pesée dynamique.",
        contexte: "Signal de capteur de pression du vérin de levage gauche débranché ou instable.",
        message: "PESÉE IMPRÉCISE — Erreur de calcul de charge utile. Risque de surcharge de l'essieu.",
        prompt: generateDetailedPrompt("10.4.1.A", "CASSÉ", "Erreur de pesage sur l'écran cabine", "Affichage de valeur négative de charge sur l'écran RCS", "godet du ST7 rempli de roche en arrière-plan", "Code erreur capteur de pression de levage"),
        realUrl: "/src/assets/images/epiroc_cylinder_broken_1782489637463.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Poids étalon 5000kg et inclinomètre sur godet',
        cadrage: "Vue de face du godet du ST7 soutenu par des chaînes de levage.",
        subject: "Poids étalon certifié de 5000 kg suspendu par des chaînes homologuées au centre du godet.",
        details: "Inclinomètre numérique fixé sur le bras de levage principal pour vérifier l'angle de pesage.",
        contexte: "Mano-détendeur étalon de précision raccordé en dérivation sur la ligne de levage.",
        outils: "Masse étalon 5000 kg, chaînes certifiées, inclinomètre numérique, manomètre étalon.",
        prompt: generateDetailedPrompt("10.4.1.A", "OUTIL", "Masse étalon suspendue au godet", "Bloc de fonte étalon de 5000kg suspendu par des chaînes", "mécanicien plaçant un inclinomètre numérique sur le bras", "Atelier dégagé de mine sans circulation"),
        realUrl: "/src/assets/images/epiroc_cylinder_tool_1782489651029.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Pesage étalonné à 5000kg — Précision ±1.2%',
        cadrage: "Plan rapproché sur le menu de pesage de l'écran de commande.",
        subject: "Affichage d'une mesure de pesée stabilisée à exactement 5000 kg (erreur nulle).",
        details: "Confirmation de sauvegarde : \"Calibration Saved - Payload Precision calibrated at ±1.2%\".",
        contexte: "Inclinomètre étalonné à 45° en position haute de mesure dynamique.",
        validation: "Précision dynamique conforme à ±1.2% de la charge nominale. Mesure validée.",
        prompt: generateDetailedPrompt("10.4.1.A", "RÉSULTAT", "Pesage étalonné avec succès à l'écran", "Affichage numérique stable de 5000kg en vert", "message de validation de calibration mémorisée", "Carnet d'étalonnage papier signé posé à côté"),
        realUrl: "/src/assets/images/epiroc_cylinder_ok_1782489666433.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Capteur de pression fissuré — Câble coupé exposant le cuivre',
        cadrage: "Gros plan macro sur le capteur de pression piézo-résistif de levage.",
        subject: "Corps du capteur déformé et connecteur électrique fissuré par un impact de bloc de roche.",
        details: "Câblage blindé coupé avec brins de cuivre dénudés exposés à l'eau de ruissellement acide.",
        contexte: "Signal de sortie figé à 4 mA (0 bar) empêchant tout étalonnage de charge utile.",
        ligneRouge: "CAPTEUR DÉTRUIT — Remplacement du transmetteur requis avant toute tentative d'étalonnage.",
        prompt: generateDetailedPrompt("10.4.1.A", "MAUVAIS", "Capteur de pression de levage brisé", "Connecteur de capteur en plastique noir fissuré", "fils de cuivre de faisceau blindé arrachés et dénudés", "Suintement d'eau acide de mine sur le boîtier"),
        realUrl: "/src/assets/images/epiroc_injector_bad_1782489553708.jpg"
      }
    ]
  },
  {
    id: "photo-proc-12",
    title: "Procédure 7.4.1.A — Remplacement capteur door interlock",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Interlock de porte fissuré — Poussière métallique',
        cadrage: "Vue de l'encadrement supérieur de la porte de la cabine de conduite.",
        subject: "Capteur d'interverrouillage magnétique de porte à effet Hall fissuré sur sa face d'usure.",
        details: "Fines particules de poussière de fer magnétisées collées sur le capteur, provoquant un court-circuit de signal.",
        contexte: "L'écran RCS affiche \"CAB DOOR OPENED\" alors que la porte est fermée, bloquant le moteur.",
        message: "SÉCURITÉ ACTIVE — Translation bloquée par verrouillage logique de sécurité de porte.",
        prompt: generateDetailedPrompt("7.4.1.A", "CASSÉ", "Capteur interlock de porte fissuré", "Boîtier plastique de capteur à effet Hall fendu en deux", "limaille de fer magnétique noire collée sur la face", "Affichage de blocage d'allumage sur l'écran cabine"),
        realUrl: "/src/assets/images/epiroc_cracked_disc_1782488064101.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Démontage clé Allen et test continuité multimètre',
        cadrage: "Plan rapproché sur les vis de montage réglables du capteur.",
        subject: "Mécanicien utilisant une clé mâle de 4 mm pour libérer le capteur de sa plaque de réglage.",
        details: "Multimètre de poche connecté en test de continuité sur les broches du raccord Deutsch étanche.",
        contexte: "Lampe de poche de mécanicien aimantée sur le cadre de cabine éclairant le montage.",
        outils: "Clé Allen 4 mm, multimètre numérique, aérosol de nettoyant contacts.",
        prompt: generateDetailedPrompt("7.4.1.A", "OUTIL", "Démontage de l'interlock à la clé Allen", "Clé Allen de 4mm desserrant les vis de support", "multimètre numérique effectuant un test de continuité (bip)", "Baladeuse étanche de chantier éclairant le cadre"),
        realUrl: "/src/assets/images/epiroc_loto_lockout_1782488035612.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Capteur neuf monté — Entrefer 3mm, diode allumée',
        cadrage: "Même vue que Photo 1, capteur d'interverrouillage neuf d'origine Epiroc installé.",
        subject: "Capteur neuf réglé avec un entrefer de 3,0 mm à l'aide de jauges d'épaisseur plastiques.",
        details: "Connecteur Deutsch branché et scellé. Diode LED verte du capteur allumée porte fermée.",
        contexte: "Zone nettoyée de toute poussière ferreuse, alignement parfait avec l'aimant de porte.",
        validation: "Entrefer réglé à 3,0 mm. Détection porte fermée active au RCS. Autorisation translation OK.",
        prompt: generateDetailedPrompt("7.4.1.A", "RÉSULTAT", "Interlock de porte neuf et aligné", "Capteur de porte d'origine neuf avec LED verte allumée", "jauge d'épaisseur en plastique de 3mm insérée dans le jeu", "Connecteur Deutsch étanche parfaitement clipsé"),
        realUrl: "/src/assets/images/epiroc_new_disc_1782488050086.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Aimant de porte brisé en éclats — Support tordu',
        cadrage: "Macro de l'aimant permanent de détection fixé sur l'ouvrant de porte.",
        subject: "Aimant néodyme brisé en éclats coupants suite à un choc violent de fermeture de porte.",
        details: "Support métallique tordu de 15° empêchant l'alignement face au capteur de montant.",
        contexte: "Pas de détection possible même avec un capteur neuf. Filetage de vis de support écrasé.",
        ligneRouge: "AIMANT HORS SERVICE — Ne jamais faire fonctionner la machine sans aimant conforme aligné.",
        prompt: generateDetailedPrompt("7.4.1.A", "MAUVAIS", "Aimant de détection de porte brisé", "Aimant néodyme éclaté en fragments de métal brillant", "support métallique de montage tordu et enfoncé", "Vis de fixation à tête foirée impossible à extraire"),
        realUrl: "/src/assets/images/epiroc_clutch_bad_1782489495189.jpg"
      }
    ]
  },
  {
    id: "photo-proc-13",
    title: "Procédure 7.3.1.A — Remplacement caméra avant/arrière",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Lentille caméra arrière brisée — Image grise floue',
        cadrage: "Vue de face de la lentille d'objectif de la caméra arrière renforcée.",
        subject: "Verre trempé de protection de l'objectif fissuré en étoile par un éclat de roche.",
        details: "Gouttelettes d'humidité condensées à l'intérieur du boîtier suite à une perte d'étanchéité du joint.",
        contexte: "La grille en acier de blindage de la caméra est pliée et frotte contre la lentille.",
        message: "ANGLE MORT — Écran de recul affichant une image grise brouillée en cabine.",
        prompt: generateDetailedPrompt("7.3.1.A", "CASSÉ", "Objectif de caméra arrière brisé", "Lentille de caméra fissurée en étoile par un éclat de roche", "condensation d'eau visible derrière la lentille d'objectif", "Grille de blindage métallique tordue et enfoncée"),
        realUrl: "/src/assets/images/epiroc_cracked_disc_1782488064101.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Démontage caméra — Clé Allen 5mm, graisse diélectrique',
        cadrage: "Plan moyen montrant la dépose du boîtier étanche de son support arrière.",
        subject: "Clé hexagonale mâle de 5 mm desserrant les vis de maintien en acier inoxydable.",
        details: "Connecteur blindé M12 débranché, graisse diélectrique prête pour l'étanchéité des broches.",
        contexte: "Lampe de travail d'atelier orientée sur le carter de protection de caméra.",
        outils: "Clé Allen 5 mm, tournevis plat, graisse diélectrique, chiffon.",
        prompt: generateDetailedPrompt("7.3.1.A", "OUTIL", "Dépose du carter de caméra arrière", "Clé Allen en acier inoxydable dévissant les vis de carter", "raccord de câble blindé M12 dévissé", "Tube de graisse silicone diélectrique à portée de main"),
        realUrl: "/src/assets/images/epiroc_injector_tool_1782489527983.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Caméra neuve montée — IP69K, affichage 720p',
        cadrage: "Même cadrage que Photo 1, caméra arrière neuve installée et blindage redressé.",
        subject: "Caméra IP69K neuve montée dans son logement, bague de câble M12 serrée et étanchée.",
        details: "Objectif propre, exempt de traces. Grille de blindage redressée à l'enclume et peinte.",
        contexte: "Écran de recul en cabine affichant une image 720p stable à 30 ips avec lignes de guidage.",
        validation: "Raccord M12 scellé. Image nette sans humidité. Lignes de guidage calibrées au gabarit.",
        prompt: generateDetailedPrompt("7.3.1.A", "RÉSULTAT", "Caméra arrière neuve et blindage propre", "Caméra étanche neuve installée avec objectif brillant", "grille de protection en acier repeinte en noir d'origine", "Affichage de l'écran de cabine montrant le retour d'image net"),
        realUrl: "/src/assets/images/epiroc_injector_ok_1782489540814.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Broches M12 oxydées et tordues — Entrée d\'eau',
        cadrage: "Gros plan macro sur les broches dorées du connecteur d'alimentation M12 de la caméra.",
        subject: "Broches électriques de liaison d'alimentation tordues à 45° et couvertes de sulfate vert.",
        details: "Présence d'eau de mine acide dans le fond du connecteur due à un serrage insuffisant.",
        contexte: "Gaine de câble blindé arrachée, fils de cuivre tressés de masse exposes et noircis.",
        ligneRouge: "CONNECTEUR MORT — Ne jamais brancher la caméra neuve sur un faisceau corrodé ou tordu.",
        prompt: generateDetailedPrompt("7.3.1.A", "MAUVAIS", "Broches de raccordement M12 endommagées", "Broches dorées de connecteur pliées et oxydées en vert", "gaine de câble tressée arrachée et fils de cuivre coupés", "Humidité acide visible dans le boîtier de connexion"),
        realUrl: "/src/assets/images/epiroc_injector_broken_1782489514098.jpg"
      }
    ]
  },
  {
    id: "photo-proc-14",
    title: "Procédure 7.1.3.A — Remplacement 12V converter",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Convertisseur 12V brûlé — Résine fondue, fusible noir',
        cadrage: "Vue plongeante sur le panneau électrique principal sous le siège de cabine.",
        subject: "Convertisseur de tension CC-CC 24V-12V noirci présentant un fort échauffement thermique.",
        details: "Résine de scellement interne du convertisseur fondue ayant coulé le long du corps de l'appareil.",
        contexte: "Fusible de protection d'entrée 15A fondu et noirci dans le porte-fusible adjacent.",
        message: "PANNE ALIMENTATION — Tension de sortie à 0,0V. Calculateurs de cabine éteints.",
        prompt: generateDetailedPrompt("7.1.3.A", "CASSÉ", "Convertisseur 24V-12V brûlé", "Boîtier en aluminium noirci et déformé par la surchauffe", "résine noire d'étanchéité fondue ayant coulé au sol", "Fusible d'entrée de 15A noirci et brisé"),
        realUrl: "/src/assets/images/epiroc_accum_broken_1782488838664.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Desserre bornes tournevis isolé — Tension entrée 24V',
        cadrage: "Plan serré sur les vis de raccordement des fils d'alimentation du convertisseur.",
        subject: "Tournevis plat d'électricien isolé 1000V desserrant les vis de la plaque de bornes.",
        details: "Fils de câbles repérés par des bagues numérotées, maintenus propres. Testeur de tension à côté.",
        contexte: "Multimètre connecté mesurant une tension d'entrée stable à 24,5V sur les câbles principaux.",
        outils: "Tournevis isolé plat 1000V, multimètre de poche, bagues de marquage.",
        prompt: generateDetailedPrompt("7.1.3.A", "OUTIL", "Déconnexion des fils au tournevis isolé", "Tournevis d'électricien rouge isolé 1000V sur les bornes", "fils d'alimentation munis de cosses numérotées", "Multimètre mesurant la tension d'entrée à 24.5V"),
        realUrl: "/src/assets/images/epiroc_loto_lockout_1782488035612.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Convertisseur neuf sur rail DIN — Sortie stable 12.2V',
        cadrage: "Même cadrage que Photo 1, convertisseur 12V neuf installé sur son rail de montage.",
        subject: "Convertisseur neuf fixé sur the rail DIN, vis serrées sans aucun brin de cuivre qui dépasse.",
        details: "Fusibles de protection neufs installés. Tension de sortie mesurée à exactement 12,2V CC.",
        contexte: "Armoire électrique dépoussiérée, câblage regroupé proprement avec des colliers de serrage bleus.",
        validation: "Serrage de vis à 1,2 Nm. Tension de sortie régulée à 12,2V CC sous charge active.",
        prompt: generateDetailedPrompt("7.1.3.A", "RÉSULTAT", "Convertisseur 12V neuf installé", "Convertisseur neuf fixé sur rail DIN de l'armoire électrique", "mesure de multimètre indiquant 12.2V en sortie", "Câbles électriques regroupés sous gaine bleue propre"),
        realUrl: "/src/assets/images/epiroc_accum_ok_1782488866738.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Inversion de polarité — Condensateur explosé, gaine fondue',
        cadrage: "Macro sur les bornes de raccordement d'entrée d'alimentation.",
        subject: "Inversion de polarité lors du raccordement (fil positif d'alimentation sur la borne de masse).",
        details: "Gaine thermorétractable d'isolation de fil fondue et condensateur interne explosé visible par la grille.",
        contexte: "Traces de fumée noire sur la plaque à bornes et forte odeur de court-circuit signalée.",
        ligneRouge: "COURT-CIRCUIT — Inversion de câblage. Convertisseur détruit instantanément. Risque pour le bus CAN.",
        prompt: generateDetailedPrompt("7.1.3.A", "MAUVAIS", "Inversion de câblage sur convertisseur", "Fils de polarité inversés sur les bornes à vis", "gaine d'isolation plastique fondue et brûlée", "Condensateur électronique éclaté visible à travers la grille"),
        realUrl: "/src/assets/images/epiroc_accum_bad_1782488877911.jpg"
      }
    ]
  },
  {
    id: "photo-proc-15",
    title: "Procédure 2.4.1.A — Réglage tension chaînes Rock Tough 406",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Chaîne détendue — Frottement carter, flèche 65mm',
        cadrage: "Vue de profil à l'intérieur du carter de chaîne de transmission latérale d'essieu.",
        subject: "Chaîne de transmission détendue présentant un flèche d'affaissement de 65 mm (standard : 20-30 mm).",
        details: "Maillons de chaîne de 38,4 mm frottant intensément contre le carter en acier inférieur de protection.",
        contexte: "Présence de limaille de fer sèche et traces d'huile lubrifiante noire très usée coulant au fond.",
        message: "CHAÎNE DÉTENDUE — Risque important de saut de chaîne et de blocage d'essieu en translation.",
        prompt: generateDetailedPrompt("2.4.1.A", "CASSÉ", "Chaîne de transmission d'essieu détendue", "Chaîne affaissée de 65mm touchant la protection inférieure", "limaille de fer brillante de frottement dans le carter", "Huile de lubrification noire très usée sur les maillons"),
        realUrl: "/src/assets/images/epiroc_clutch_broken_1782489449767.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Vérin de tension hydraulique, clé à choc d\'essieu 1"',
        cadrage: "Plan moyen montrant le montage d'ajustement de tension de l'essieu.",
        subject: "Vérin de tension hydraulique connecté sur l'axe excentrique de tension de moyeu.",
        details: "Clé à choc de 1\" desserrant les boulons de bride de moyeu. Mètre à ruban mesurant la flèche.",
        contexte: "La machine est levée sur des chandelles de sécurité robustes, roues déposées.",
        outils: "Vérin hydraulique excentrique, mètre à ruban, clé à choc de 1\", cales d'alignement.",
        prompt: generateDetailedPrompt("2.4.1.A", "OUTIL", "Tendeur hydraulique d'essieu en place", "Vérin de tension installé sur le moyeu excentrique", "mètre à ruban métallique mesurant la flèche sous tension", "Boulons de roue et de bride d'essieu déposés"),
        realUrl: "/src/assets/images/epiroc_clutch_tool_1782489464546.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Chaîne tendue à 25mm — Couple 550Nm, vernis vert',
        cadrage: "Même perspective que Photo 1, carter de chaîne ouvert après réglage et tension.",
        subject: "Chaîne tendue affichant une flèche d'affaissement ajustée à exactement 25 mm.",
        details: "Boulons de bride de moyeu resserrés au couple de 550 Nm avec repères de vernis vert de blocage.",
        contexte: "Carter de chaîne rempli d'huile de lubrification neuve propre à niveau, sans coulure.",
        validation: "Flèche de chaîne à 25 mm. Serrage de bride à 550 Nm. Niveau d'huile lubrifiante conforme.",
        prompt: generateDetailedPrompt("2.4.1.A", "RÉSULTAT", "Chaîne de transmission d'essieu tendue", "Chaîne ajustée à 25mm de flèche, tendue et propre", "boulons de bride marqués de repères de vernis vert", "Huile de lubrification claire au fond du carter"),
        realUrl: "/src/assets/images/epiroc_clutch_ok_1782489479985.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Dents de pignon en ailerons de requin — Crique maillon',
        cadrage: "Vue macro sur les dentures du pignon d'entraînement de chaîne d'essieu.",
        subject: "Dents du pignon d'entraînement usées de manière asymétrique en profil pointu d'aileron de requin.",
        details: "Maillon rapide de chaîne tordu présentant une micro-fissure d'usure sur son axe de pivot.",
        contexte: "Frottement sec prolongé de la chaîne suite à un manque chronique d'huile ou défaut d'alignement.",
        ligneRouge: "PIGNON USÉ — Ne jamais monter une chaîne neuve sur un pignon en aileron de requin. Remplacement pignon requis.",
        prompt: generateDetailedPrompt("2.4.1.A", "MAUVAIS", "Dents de pignon d'essieu pointues", "Denture de pignon usée en forme d'ailerons de requin", "maillon de chaîne tordu présentant une fissure sur l'axe", "Limaille sèche de métal sur les flancs de dentures"),
        realUrl: "/src/assets/images/epiroc_clutch_bad_1782489495189.jpg"
      }
    ]
  },
  {
    id: "photo-proc-16",
    title: "Procédure 9.2.1.A — Remplacement pneu 17,5×25",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Pneu entaillé traversant flanc — Plis nylon coupés',
        cadrage: "Vue de profil du pneu de roue avant gauche de taille 17,5×25 L5S.",
        subject: "Pneu présentant une profonde entaille coupante de 120 mm traversant le flanc latéral.",
        details: "Plis internes de carcasse en nylon coupés et effilochés, pneu complètement dégonflé.",
        contexte: "Bloc de silex tranchant de mine encore incrusté profondément au centre de l'entaille.",
        message: "PNEU HORS D'USAGE — Toile de carcasse rompue. Risque d'éclatement brutal immédiat.",
        prompt: generateDetailedPrompt("9.2.1.A", "CASSÉ", "Flanc de pneu de chargeuse coupé", "Profonde entaille de 120mm on the flanc du pneu 17,5x25", "plis de carcasse en nylon blanc déchirés et visibles", "Pneu écrasé à plat sous la charge de la machine"),
        realUrl: "/src/assets/images/epiroc_worn_disc_1782488017333.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Cric bouteille 20 tonnes et clé à choc M22 1"',
        cadrage: "Plan de vue plongeant montrant le levage du châssis au point d'appui de roue.",
        subject: "Cric hydraulique lourd de type bouteille de 20 tonnes positionné sous le point de levage du châssis.",
        details: "Clé à choc pneumatique de 1\" avec douille de 33 mm engagée sur un écrou de roue M22.",
        contexte: "Cales de roue lourdes en bois dur en place sous les trois autres roues de la machine.",
        outils: "Cric bouteille hydraulique 20t, clé à choc de 1\", douille 33 mm, cales de sécurité.",
        prompt: generateDetailedPrompt("9.2.1.A", "OUTIL", "Levage de roue au cric bouteille 20t", "Cric hydraulique bouteille de 20t soulevant le châssis", "clé à choc pneumatique lourde de 1 pouce en place", "Cales de calage lourdes en bois dur sous les pneus opposés"),
        realUrl: "/src/assets/images/epiroc_loto_lockout_1782488035612.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Pneu neuf smooth tread — Bague verrouillée, couple 650Nm',
        cadrage: "Même perspective que Photo 1, pneu neuf monté sur sa jante d'origine.",
        subject: "Pneu neuf de type lisse (smooth tread L5S) monté sur jante démontable à 3 pièces.",
        details: "Goujons et écrous de roue M22 serrés en étoile à 650 Nm. Bague de verrouillage en place.",
        contexte: "Pression de gonflage ajustée à 6.5 bar de service, cric bouteille dégagé.",
        validation: "Pression de pneu conforme à 6.5 bar. Écrous serrés à 650 Nm en étoile. Bague de jante scellée.",
        prompt: generateDetailedPrompt("9.2.1.A", "RÉSULTAT", "Roue neuve 17,5x25 lisse montée", "Pneu neuf à bande de roulement lisse gonflé à 6.5 bar", "écrous de roue serrés marqués de vernis jaune en étoile", "Bague de verrouillage lock-ring logée dans la jante"),
        realUrl: "/src/assets/images/epiroc_new_disc_1782488050086.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Bague de jante lock-ring mal engagée — Risque déjantage explosif',
        cadrage: "Gros plan d'inspection sur la lèvre de montage de bague de jante 3 pièces.",
        subject: "Bague de verrouillage de jante (lock-ring) de travers, mal engagée de 3 mm dans sa gorge.",
        details: "Risque de déjantage explosif mortel lors de la mise en pression ou de la translation sous charge.",
        contexte: "Filet de goujon de roue écrasé empêchant le montage correct d'un écrou de blocage.",
        ligneRouge: "BAGUAGE DEFECTUEUX — Ne jamais gonfler le pneu si la bague n'est pas parfaitement logée.",
        prompt: generateDetailedPrompt("9.2.1.A", "MAUVAIS", "Bague de verrouillage de jante mal mise", "Bague lock-ring métallique tordue et saillante de 3mm", "filetage de goujon de roue M22 écrasé et rouillé", "Affiche d'alerte de sécurité de gonflage à proximité"),
        realUrl: "/src/assets/images/epiroc_cracked_disc_1782488064101.jpg"
      }
    ]
  },
  {
    id: "photo-proc-17",
    title: "Procédure 4.2.1.A — Remplacement silentbloc articulation",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Silentbloc affaissé — Caoutchouc craquelé, limaille rouge',
        cadrage: "Vue latérale rapprochée sur l'axe de pivotement central de l'articulation de châssis.",
        subject: "Silentbloc de pivot d'articulation affaissé de 15 mm vers le bas.",
        details: "Bague en caoutchouc élastomère fortement craquelée et décollée de sa frette d'acier externe.",
        contexte: "Marques d'usure par contact métal-métal direct entre la chape et l'alésage du pivot.",
        message: "JEU ARTICULATION — Jeu de pivot excessif. Risque de rupture des roulements coniques.",
        prompt: generateDetailedPrompt("4.2.1.A", "CASSÉ", "Silentbloc d'articulation de pivot affaissé", "Caoutchouc de silentbloc craquelé avec jeu radial de 15mm", "poussière de rouille rouge de friction métallique", "Béquille de sécurité d'articulation verrouillée à côté"),
        realUrl: "/src/assets/images/epiroc_cylinder_broken_1782489637463.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Extracteur hydraulique 30 tonnes et pompe manuelle 700bar',
        cadrage: "Plan moyen montrant l'outil de dépose hydraulique de bague d'articulation.",
        subject: "Cylindre extracteur hydraulique de 30 tonnes positionné sur l'alésage de bague de silentbloc.",
        details: "Flexible haute pression connecté à la pompe manuelle hydraulique de 700 bar d'atelier.",
        contexte: "Élingue de sécurité fixée sur le corps de l'extracteur pour retenir l'outil sous charge.",
        outils: "Extracteur hydraulique 30t, pompe manuelle haute pression, pied à coulisse de 300 mm.",
        prompt: generateDetailedPrompt("4.2.1.A", "OUTIL", "Extracteur de silentbloc hydraulique monté", "Extracteur hydraulique de 30 tonnes en appui sur la chape", "pompe manuelle haute pression rouge 700 bar connectée", "Fils d'élingues de maintien de sécurité de l'outil"),
        realUrl: "/src/assets/images/epiroc_cylinder_tool_1782489651029.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Silentbloc neuf inséré — Axe goupillé, graisse blanche',
        cadrage: "Même perspective que Photo 1, silentbloc d'articulation neuf monté et serré.",
        subject: "Silentbloc neuf emmanché de niveau, à fleur de la face de chape (jeu d'alésage < 0.2 mm).",
        details: "Axe de pivot d'articulation serré et sécurisé par son écrou à créneaux muni d'une goupille neuve.",
        contexte: "Graisseur d'articulation neuf vissé et graissé à la graisse blanche haute performance.",
        validation: "Bague emmanchée de niveau. Écrou de pivot serré au couple. Jeu résiduel inférieur à 0.5 mm.",
        prompt: generateDetailedPrompt("4.2.1.A", "RÉSULTAT", "Silentbloc d'articulation neuf emmanché", "Bague de silentbloc neuve insérée proprement dans la chape", "écrou de pivot d'articulation goupillé avec goupille neuve", "Graisse blanche haute pression visible au raccord"),
        realUrl: "/src/assets/images/epiroc_cylinder_ok_1782489666433.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'SST MAUVAIS"',
        alt: 'Caoutchouc arraché par insertion forcée de travers, marteau',
        cadrage: "Gros plan macro sur la bague extérieure métallique de silentbloc.",
        subject: "Frettage en caoutchouc élastomère arraché et découpé sur 40 mm lors d'un montage forcé de travers.",
        details: "Boîtier métallique du silentbloc déformé par des coups de marteau directs.",
        contexte: "Un marteau lourd de 5 kg posé sur le carter de pivot à côté de copeaux de caoutchouc.",
        ligneRouge: "CRAQUEMENT MONTAGE — Silentbloc détruit lors de l'insertion. Ne jamais forcer l'ajustement à sec.",
        prompt: generateDetailedPrompt("4.2.1.A", "MAUVAIS", "Silentbloc endommagé lors de la dépose", "Bord de silentbloc métallique déformé et tordu d'un côté", "morceaux de caoutchouc noir coupés et arrachés", "Marteau de 5kg posé sur la béquille métallique d'établi"),
        realUrl: "/src/assets/images/epiroc_cylinder_bad_1782489679725.jpg"
      }
    ]
  },
  {
    id: "photo-proc-18",
    title: "Procédure 3.1.4.A — Purge hydraulique complète",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Huile hydraulique émulsionnée — Aspect laiteux, mayonnaise',
        cadrage: "Gros plan sur une éprouvette d'échantillon d'huile hydraulique tenue en main.",
        subject: "Huile hydraulique prélevée présentant un aspect laiteux et émulsionné (\"effet mayonnaise\").",
        details: "Présence importante de microbulles d'air en suspension réduisant le pouvoir lubrifiant de l'huile.",
        contexte: "Mousse épaisse de 20 mm formée à la surface de l'éprouvette de verre de test.",
        message: "HUILE PARASITE — Risque de cavitation immédiate des pompes de direction et de levage.",
        prompt: generateDetailedPrompt("3.1.4.A", "CASSÉ", "Échantillon d'huile hydraulique laiteuse", "Huile de test émulsionnée trouble et blanc-jaunâtre", "éprouvette en verre transparent tenue par un gant noir", "Épaisse couche de mousse d'air à la surface"),
        realUrl: "/src/assets/images/epiroc_filter_broken_1782489697728.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Groupe de filtration externe raccordé — Prises Minimess',
        cadrage: "Plan d'ensemble montrant le raccordement de la station de purge externe à la machine.",
        subject: "Groupe de filtration et de transfert hydraulique mobile externe raccordé sur les prises Minimess.",
        details: "Flexibles haute pression transparents de retour montés pour surveiller le passage d'air.",
        contexte: "Vanne de purge d'air de l'accumulateur ouverte à moitié, fluide s'écoulant par saccades.",
        outils: "Groupe de filtration mobile, flexibles transparents, raccords Minimess, bocal de collecte.",
        prompt: generateDetailedPrompt("3.1.4.A", "OUTIL", "Purge du circuit à la station mobile", "Station de filtration mobile connectée aux prises rapides", "flexible transparent de purge montrant des bulles d'air", "Tapis de rétention absorbant noir étalé au sol"),
        realUrl: "/src/assets/images/epiroc_filter_tool_1782489713726.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Huile translucide ambre — Purge complète sans saccades',
        cadrage: "Même perspective d'échantillon d'huile hydraulique de test après purification.",
        subject: "Huile hydraulique parfaitement translucide et limpide, de couleur ambre-rougeâtre uniforme.",
        details: "Écoulement laminaire régulier sans bulles dans le bocal récepteur, niveau d'huile au max.",
        contexte: "Prises de purge d'air resserrées et bouchons JIC propres vissés sur les raccords Minimess.",
        validation: "Fluide de classe ISO 18/16/13. Niveau stable. Absence totale de mousse ou de saccades.",
        prompt: generateDetailedPrompt("3.1.4.A", "RÉSULTAT", "Échantillon d'huile hydraulique purifiée", "Huile translucide ambre et rougeoyante sans bulles", "bocal récepteur en verre propre sur fond blanc d'atelier", "Prises Minimess obturées avec capuchons métalliques"),
        realUrl: "/src/assets/images/epiroc_filter_ok_1782489725811.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Eau décantée au fond de l\'huile — Sédiments de roche',
        cadrage: "Macro du fond du bocal d'échantillonnage d'huile de vidange.",
        subject: "Présence d'eau libre décantée formant une phase aqueuse trouble bien distincte au fond du bocal.",
        details: "Dépôts abrasifs de sédiments rocheux fins tapissant le fond de l'éprouvette.",
        contexte: "Aimant de test d'atelier plongé au fond du bocal retenant de fins copeaux d'acier d'usure.",
        ligneRouge: "PRÉSENCE D'EAU — Risque d'oxydation et de destruction de pompe. Vidange complète du circuit obligatoire.",
        prompt: generateDetailedPrompt("3.1.4.A", "MAUVAIS", "Décantation d'eau dans l'huile hydraulique", "Phase d'eau libre trouble décantée au fond du flacon", "sédiments abrasifs rocheux grisâtres en dépôt", "Particules métalliques d'usure collées sur un aimant"),
        realUrl: "/src/assets/images/epiroc_pump_bad_1782489621538.jpg"
      }
    ]
  },
  {
    id: "photo-proc-19",
    title: "Procédure 5.2.1.A — Test brake test manuel",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Échec essai de freinage — Glissement détecté au RCS',
        cadrage: "Plan moyen de l'affichage de l'ordinateur de bord RCS en cabine.",
        subject: "Message d'erreur d'essai de freinage critique : \"BRAKE TEST FAILED - SLIPPAGE DETECTED\".",
        details: "La machine a glissé et s'est déplacée lors de la mise sous couple de traction d'essai.",
        contexte: "Alarme de sécurité de frein de stationnement active, courbe de régime moteur en chute.",
        message: "FREINAGE INSUFFISANT — Essai de maintien statique échoué. Interdiction de descendre en galerie.",
        prompt: generateDetailedPrompt("5.2.1.A", "CASSÉ", "Échec d'essai de freinage au RCS", "Texte d'alarme rouge BRAKE TEST FAILED à l'écran", "courbes d'essai de translation de roue en baisse", "Poste de commande avec joystick de translation neutre"),
        realUrl: "/src/assets/images/epiroc_pump_broken_1782489573771.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Manomètres de test branchés sur prises d\'étriers',
        cadrage: "Vue de l'étrier de frein avant droit avec manomètres d'essai raccordés.",
        subject: "Kit d'essai de pression de frein branché sur les orifices Minimess de l'étrier.",
        details: "Manomètre de précision à glycérine affichant la pression de desserrage de frein stable à 180 bar.",
        contexte: "Fiche papier de protocole d'essai de freinage fixée sur la console, prête à être complétée.",
        outils: "Kit de manomètres 0-250 bar, tuyaux Minimess, protocole papier d'essai.",
        prompt: generateDetailedPrompt("5.2.1.A", "OUTIL", "Manomètre étalon raccordé sur l'étrier", "Manomètre analogique à bain de glycérine mesurant 180 bar", "flexibles de test noirs branchés sur la prise Minimess", "Fiche de protocole d'essai papier fixée sur support"),
        realUrl: "/src/assets/images/epiroc_pump_tool_1782489589081.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Essai de freinage réussi — Hold stable à 100% couple',
        cadrage: "Gros plan sur l'écran tactile d'affichage principal de cabine.",
        subject: "Message de validation vert : \"BRAKE TEST PASSED - STATIC HOLD STABLE AT 100% ENGINE TORQUE\".",
        details: "Maintien de la machine sous couple maximal de traction sans aucun défilement de roue.",
        contexte: "Voyants d'anomalie éteints, compteur d'essais enregistré dans le système Certiq.",
        validation: "Décélération de service à 3.2 m/s² conforme. Essai statique validé avec succès.",
        prompt: generateDetailedPrompt("5.2.1.A", "RÉSULTAT", "Écran de réussite d'essai de frein", "Message vert BRAKE TEST PASSED affiché sur l'écran RCS", "indicateur de couple moteur stable à 1450 Nm", "Icône Certiq de transmission de données active"),
        realUrl: "/src/assets/images/epiroc_pump_ok_1782489607922.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Disques de frein calcinés, joint spi de pont fondu',
        cadrage: "Vue macro sur la lèvre de joint d'essieu et la tranche de disque de frein.",
        subject: "Traces de vernis de surchauffe noire et profondes rayures de friction sur le disque d'acier.",
        details: "Joint spi de pont d'essieu fondu et déformé par la chaleur, laissant fuir de la graisse brûlée.",
        contexte: "Surchauffe sévère (\"frein qui traîne\"), température du disque mesurée à 185°C au thermomètre infrarouge.",
        ligneRouge: "FREIN QUI TRAÎNE — Surchauffe extrême d'étrier. Risque d'incendie de roue. Ouvrir l'étrier.",
        prompt: generateDetailedPrompt("5.2.1.A", "MAUVAIS", "Surchauffe thermique d'étrier d'essieu", "Disque de frein en acier avec vernis noir carbonisé", "joint spi de pont en élastomère noir fondu et déformé", "Visée de thermomètre infrarouge indiquant 185°C"),
        realUrl: "/src/assets/images/epiroc_pump_bad_1782489621538.jpg"
      }
    ]
  },
  {
    id: "photo-proc-20",
    title: "Procédure 6.6.1.A — Mise à jour firmware RCS",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Écran de cabine figé — Erreur bus CAN, bootloop',
        cadrage: "Gros plan sur l'écran tactile du système de contrôle de cabine.",
        subject: "Écran affichant un défaut d'initialisation : \"CAN BUS OFFLINE - CALCULATOR D601 UNREACHABLE\".",
        details: "Terminal d'affichage figé indéfiniment sur la page de bootloop d'origine (logo Epiroc).",
        contexte: "Télation de batterie d'alimentation faible mesurée instable à 18V sous le tableau.",
        message: "MATÉRIEL BLOQUÉ — Perte totale d'accès aux paramètres et fonctions de pilotage.",
        prompt: generateDetailedPrompt("6.6.1.A", "CASSÉ", "Écran cabine bloqué en bootloop", "Message d'erreur d'initialisation CAN BUS OFFLINE à l'écran", "logo Epiroc figé sur l'afficheur à aiguilles", "Diode rouge de défaut de calculateur maître clignotante"),
        realUrl: "/src/assets/images/epiroc_conv_broken_1782488892524.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Clé USB Epiroc, adaptateur Kvaser et chargeur de batterie',
        cadrage: "Plan moyen montrant le technicien connectant les interfaces d'écriture de flash.",
        subject: "Clé USB d'entretien d'origine Epiroc branchée sur le port USB de diagnostic étanche.",
        details: "PC portable connecté au bus CAN à l'aide d'un boîtier d'adaptation Kvaser USB-CAN.",
        contexte: "Chargeur de batterie de soutien d'atelier raccordé pour maintenir une tension de bord de 24,0V.",
        outils: "Clé USB de service Epiroc, boîtier Kvaser USB-CAN, PC de service, chargeur de soutien.",
        prompt: generateDetailedPrompt("6.6.1.A", "OUTIL", "Installation de mise à jour firmware", "Clé USB de service insérée dans le port blindé M12", "boîtier Kvaser USB-CAN connecté à l'ordinateur portable", "Pinces de chargeur de soutien 24V fixées sur les batteries"),
        realUrl: "/src/assets/images/epiroc_conv_tool_1782488907494.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Écran démarré — Firmware v6.12, bus CAN OK',
        cadrage: "Même cadrage que Photo 1, console de cabine allumée après la mise à jour.",
        subject: "Écran d'affichage de cabine démarré affichant le menu d'accueil d'exploitation standard.",
        details: "Indication de version active conforme : \"Firmware Version v6.12.04 - Status: ALL OK\".",
        contexte: "Liaison de communication bus CAN J1939 stable, code de diagnostic de panne résolu.",
        validation: "Firmware v6.12.04 installé. Bus CAN J1939 opérationnel à 250 kbps. Zéro code d'erreur.",
        prompt: generateDetailedPrompt("6.6.1.A", "RÉSULTAT", "Écran d'exploitation opérationnel", "Affichage de la page d'accueil d'exploitation standard", "texte de version de firmware v6.12.04 en vert", "Voyant d'état d'alimentation de cabine vert fixe"),
        realUrl: "/src/assets/images/epiroc_conv_ok_1782488923436.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Flash interrompu — Calculateur briqué, code 0x80F4',
        cadrage: "Gros plan sur l'écran de cabine affichant un arrêt de chargement.",
        subject: "Message d'erreur fatal d'écriture flash : \"FIRMWARE FLASH CORRUPTED - ERROR CODE 0x80F4\".",
        details: "Système de contrôle figé en mode d'erreur de chargeur d'amorçage (Bootloader Halted).",
        contexte: "Infiltration d'erreur due à une chute d'alimentation de batterie (tension mesurée à 11.2V).",
        ligneRouge: "CALCULATEUR BRIQUÉ — Perte de liaison d'écriture. Remplacement de l'EEPROM requis.",
        prompt: generateDetailedPrompt("6.6.1.A", "MAUVAIS", "Interruption critique d'écriture flash", "Message d'erreur rouge FIRMWARE FLASH CORRUPTED à l'écran", "indicateur de tension d'alimentation de bord à 11.2V", "Câble de chargeur d'atelier débranché au sol"),
        realUrl: "/src/assets/images/epiroc_conv_bad_1782488935654.jpg"
      }
    ]
  }
];
