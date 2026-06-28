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
  const env = "Mine souterraine réelle, parois de roche brute sombre, poussière fine en suspension dorée sous les faisceaux, flaques d'huile au sol, tuyaux enchevêtrés, panneaux de sécurité délavés en arrière-plan.";
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
  
  const accentColor = type === 'CASSÉ' ? '#ef4444' : type === 'MAUVAIS' ? '#f59e0b' : type === 'RÉSULTAT' ? '#22c55e' : '#3b82f6';
  const accentText = type === 'CASSÉ' ? 'CASSÉ / DÉFAUT CRITIQUE' : type === 'MAUVAIS' ? 'CATASTROPHE MECANIQUE' : type === 'RÉSULTAT' ? 'RÉSULTAT CONFORME NEUF' : 'OUTIL ET MONTAGE REQUIS';

  const lowerTitle = title.toLowerCase();
  const isCasse = type === 'CASSÉ' || type === 'MAUVAIS';
  const isNeuf = type === 'RÉSULTAT';

  let customArt = '';
  let subTitleText = 'ROUE, MOYEU & CHÂSSIS OSCILLANT — TOLERANCE GÉOMETRIQUE';
  let specText = isCasse ? '⚠ ALIGNEMENT NON CONFORME / JEU DE TRAIN EXCÉSIF' : '✓ JEUX MECANIQUES ET ROTULES SANS ANOMALIE';

  if (lowerTitle.includes('frein') || lowerTitle.includes('tambour') || lowerTitle.includes('mâchoire')) {
    subTitleText = 'FREIN À TAMBOUR ST2D — FREINAGE MÉCANIQUE À CÂBLE';
    specText = isCasse ? '⚠ GARNITURES USÉES (< 3 mm) — REMPLACEMENT REQUIS IMMÉDIAT' : '✓ GARNITURES NEUVES (8 mm) ET RESSORTS CONFORMES';
    customArt = `
      <circle cx="400" cy="240" r="110" fill="none" stroke="${isNeuf ? '#22c55e' : '#3b82f6'}" stroke-width="3" />
      <circle cx="400" cy="240" r="40" fill="none" stroke="#3b82f6" stroke-width="1.5" />
      <path d="M 310 190 A 90 90 0 0 1 490 190" fill="none" stroke="${isCasse ? '#ef4444' : '#22c55e'}" stroke-width="6" stroke-dasharray="${isCasse ? '5,3' : '0'}" />
      <path d="M 310 290 A 90 90 0 0 0 490 290" fill="none" stroke="${isCasse ? '#ef4444' : '#22c55e'}" stroke-width="6" stroke-dasharray="${isCasse ? '5,3' : '0'}" />
      <line x1="310" y1="190" x2="310" y2="290" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3,3" />
      <line x1="490" y1="190" x2="490" y2="290" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3,3" />
    `;
  } else if (lowerTitle.includes('moteur') || lowerTitle.includes('deutz') || lowerTitle.includes('injecteur') || lowerTitle.includes('segment')) {
    subTitleText = 'MOTEUR DEUTZ F4L912 AIR — CYLINDRE ET INJECTION MECHANIC';
    specText = isCasse ? '⚠ COMPRESSION CRITIQUE / INJECTEUR ENCRASSÉ' : '✓ ATOMISATION BOSCH VE CONFORME — PUISSANCE ACTIVE';
    customArt = `
      <rect x="330" y="140" width="140" height="200" fill="none" stroke="#f59e0b" stroke-width="2.5" />
      <line x1="330" y1="180" x2="470" y2="180" stroke="#3b82f6" stroke-width="2" />
      <circle cx="400" cy="180" r="22" fill="none" stroke="${isCasse ? '#ef4444' : '#22c55e'}" stroke-width="2.5" />
      <path d="M 400 80 L 400 140" stroke="#3b82f6" stroke-width="3" />
    `;
  } else if (lowerTitle.includes('boîte') || lowerTitle.includes('funk') || lowerTitle.includes('embrayage') || lowerTitle.includes('transmission')) {
    subTitleText = 'TRANSMISSION FUNK DF80 — EMBRAYAGE SEC ET PIGNONS';
    specText = isCasse ? '⚠ DISQUE EMBRAYAGE USÉ (< 1.5 mm) / PATINAGE CRITIQUE' : '✓ ENGAGEMENT MÉCANIQUE PAR CÂBLE DE SÉLECTEUR OK';
    customArt = `
      <circle cx="400" cy="240" r="90" fill="none" stroke="#f59e0b" stroke-width="3" />
      <rect x="370" y="180" width="60" height="120" fill="none" stroke="${isCasse ? '#ef4444' : '#22c55e'}" stroke-width="2" />
      <line x1="320" y1="240" x2="480" y2="240" stroke="#3b82f6" stroke-width="2.5" />
    `;
  } else {
    customArt = `
      <rect x="250" y="160" width="300" height="160" fill="none" stroke="#3b82f6" stroke-width="2.5" />
      <circle cx="400" cy="240" r="30" fill="none" stroke="#f59e0b" stroke-width="2" />
    `;
  }

  let descText = escapedSubject;
  if (descText.length > 80) {
    descText = descText.substring(0, 77) + '...';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
    <rect width="800" height="500" fill="#ffffff" rx="8" stroke="#cbd5e1" stroke-width="1"/>
    <defs>
      <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
        <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#f1f5f9" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="500" fill="url(#grid)" rx="8" />
    <rect x="15" y="15" width="770" height="470" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4" rx="6" />
    <rect x="15" y="15" width="770" height="25" fill="#ef4444" rx="2" />
    <text x="400" y="32" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="11" font-weight="black">⚠️ PHOTO MANQUANTE — PLACEHOLDER TECHNIQUE</text>
    <path d="M 35,90 L 35,55 L 70,55" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <path d="M 765,90 L 765,55 L 730,55" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <path d="M 35,410 L 35,445 L 70,445" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <path d="M 765,410 L 765,445 L 730,445" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <circle cx="400" cy="245" r="50" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="8,6" />
    ${customArt}
    <rect x="35" y="50" width="240" height="28" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
    <circle cx="50" cy="64" r="6" fill="${accentColor}"/>
    <text x="65" y="69" fill="#0f172a" font-family="monospace" font-size="11" font-weight="black">${accentText}</text>
    <text x="765" y="69" text-anchor="end" fill="#64748b" font-family="monospace" font-size="10" font-weight="bold">${escapedCamera}</text>
    <rect x="35" y="85" width="730" height="40" fill="#f8fafc" rx="4" stroke="#cbd5e1" stroke-width="1" />
    <text x="50" y="112" fill="#0f172a" font-family="monospace" font-size="24" font-weight="black">${escapedTitle}</text>
    <text x="35" y="415" fill="#000000" font-family="monospace" font-size="16" font-weight="black">DESCRIPTION :</text>
    <text x="165" y="415" fill="#000000" font-family="monospace" font-size="16" font-weight="bold">${descText}</text>
    <text x="35" y="440" fill="${isCasse ? '#ef4444' : '#22c55e'}" font-family="monospace" font-size="11" font-weight="black">${specText}</text>
    <text x="765" y="445" text-anchor="end" fill="#f59e0b" font-family="monospace" font-size="10" font-weight="black">EPIROC MINING BLUEPRINT</text>
    <text x="765" y="460" text-anchor="end" fill="#64748b" font-family="monospace" font-size="9" font-weight="bold">${subTitleText}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 20 ST2D procedures configured compactly but exhaustively to prevent token limits
export const cahierProcedures: ProcedureData[] = [
  {
    id: "photo-proc-01",
    title: "Procédure 4.1.1.A — Remplacement mâchoires frein tambour",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1 : "ÇA RESSEMBLE À ÇA QUAND C\'EST CASSÉ"',
        alt: 'Garnitures de frein tambour ST2D usées sous 3mm',
        cadrage: "Gros plan tambour de roue ouvert",
        subject: "Mâchoires de frein à tambour usées à 1.5 mm",
        details: "Poussière noire de silice accumulée, ressort de rappel cassé",
        contexte: "Gant huileux au premier plan",
        message: "ARRÊT IMMÉDIAT — Freinage inefficace",
        prompt: generateDetailedPrompt("4.1.1.A", "CASSÉ", "Gros plan tambour ouvert", "Garniture à 1.5mm", "gant de mécanicien", "Ressort cassé"),
        realUrl: "/src/assets/images/st2d_tambour_worn_1782488017333.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2 : "L\'OUTIL EN POSITION"',
        alt: 'Pince à ressort de rappel de mâchoires en place',
        cadrage: "Plongée sur le tambour de frein",
        subject: "Pince à ressort de rappel mécanique Epiroc ST2D",
        details: "Cadenas de consignation jaune LOTO appliqué en cabine",
        contexte: "Boîte à outils d'atelier ouverte",
        outils: "Pince à ressort de rappel, clés plates de 17 mm, béquille d'articulation",
        prompt: generateDetailedPrompt("4.1.1.A", "OUTIL", "Pince sur ressort de rappel", "Pince de rappel engagée", "boîte d'atelier", "cadenas jaune LOTO"),
        realUrl: "/src/assets/images/st2d_tambour_tool_1782488035612.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3 : "LE RÉSULTAT ATTENDU"',
        alt: 'Mâchoires neuves et ressorts montés et propres',
        cadrage: "Même angle que Photo 1, tambour propre",
        subject: "Mâchoires neuves d'épaisseur nominale de 8.0 mm",
        details: "Ressorts de rappel neufs 50 N installés, tambour dégraissé",
        contexte: "Fiche d'intervention validée posée à côté",
        validation: "Épaisseur nominale 8.0 mm. Jeu fonctionnel validé.",
        prompt: generateDetailedPrompt("4.1.1.A", "RÉSULTAT", "Mâchoires neuves installées", "Garniture neuve 8.0mm et ressorts tendus", "fiche cochée", "Tambour nettoyé"),
        realUrl: "/src/assets/images/st2d_tambour_ok_1782488050086.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4 : "SI TU VOIS ÇA, C\'EST MAUVAIS"',
        alt: 'Tambour fissuré ou gras d\'huile de pont',
        cadrage: "Macro de la face interne du tambour",
        subject: "Fissure de fatigue thermique ou fuite de joint d'essieu",
        details: "Coulures de graisse de pont brûlée, garnitures vitrifiées",
        contexte: "Chiffon gras d'atelier",
        ligneRouge: "TAMBOUR FISSURÉ — Risque de blocage brutal de roue. Appeler le chef.",
        prompt: generateDetailedPrompt("4.1.1.A", "MAUVAIS", "Tambour fissuré radialement", "Fissures et graisse sur la garniture", "chiffon gras", "Garniture glacée"),
        realUrl: "/src/assets/images/st2d_tambour_bad_1782488064101.jpg"
      }
    ]
  },
  {
    id: "photo-proc-02",
    title: "Procédure 4.1.2.A — Réglage câble frein",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Câble détendu ou manette molle',
        cadrage: "Plan moyen sous le levier de cabine",
        subject: "Câble de frein mécanique flasque sans tension",
        details: "Gaine fendue, jeu de câble supérieur à 15 mm",
        prompt: generateDetailedPrompt("4.1.2.A", "CASSÉ", "Câble mécanique flasque", "Câble de frein détendu", "levier de cabine", "Jeu de 15mm"),
        realUrl: "/src/assets/images/st2d_cable_worn_1782488838664.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Clé de 13 mm et tendeur fileté',
        cadrage: "Gros plan sur le tendeur à vis d'essieu",
        subject: "Clé plate de 13 mm sur écrou de réglage fileté M10",
        details: "LOTO appliqué, béquille jaune de pivot installée",
        outils: "Clé de 13 mm, jauge d'épaisseur",
        prompt: generateDetailedPrompt("4.1.2.A", "OUTIL", "Clé plate de 13mm sur tendeur", "Vis filetée M10 engagée", "béquille jaune", "LOTO en cabine"),
        realUrl: "/src/assets/images/st2d_cable_tool_1782488852198.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Câble tendu et écrou bloqué',
        cadrage: "Même angle que Photo 1, câble tendu",
        subject: "Câble tendu avec jeu à la pédale de 2-3 mm",
        details: "Écrou de blocage M10 serré et marqué au vernis jaune",
        validation: "Jeu de pédale mesuré à 2.5 mm. Serrage ok.",
        prompt: generateDetailedPrompt("4.1.2.A", "RÉSULTAT", "Câble de frein tendu", "Jeu fonctionnel réglé à 2.5mm", "vernis jaune de contrôle", "Écrou M10 serré"),
        realUrl: "/src/assets/images/st2d_cable_ok_1782488866738.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Filetage de tendeur foiré ou rouillé',
        cadrage: "Macro du filetage de tendeur",
        subject: "Filetage écrasé ou grippé par la rouille",
        details: "Impossible de tourner l'écrou, rupture imminente",
        ligneRouge: "TENDEUR FOIRÉ — Réglage impossible. Remplacer la tige filetée.",
        prompt: generateDetailedPrompt("4.1.2.A", "MAUVAIS", "Filetage de tendeur foiré", "Tige filetée M10 avec filets écrasés", "rouille orange", "Écrou bloqué"),
        realUrl: "/src/assets/images/st2d_cable_bad_1782488877911.jpg"
      }
    ]
  },
  {
    id: "photo-proc-03",
    title: "Procédure 4.3.1.A — Remplacement câble frein de parking",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Câble de parking effiloché',
        cadrage: "Gros plan sur la liaison de manette",
        subject: "Câble de parking Ø 4 mm partiellement rompu",
        details: "Fils d'acier effilochés en sortie de gaine",
        prompt: generateDetailedPrompt("4.3.1.A", "CASSÉ", "Câble Ø 4mm effiloché", "Fils d'acier rompus", "sortie de gaine", "Gaine fendue"),
        realUrl: "/src/assets/images/st2d_parking_worn_1782488892524.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Coupe-câble et serre-câble',
        cadrage: "Plan de travail sur établi d'atelier",
        subject: "Pince coupe-câble robuste et câble Ø 4 mm neuf",
        details: "Serre-câbles neufs, gaine lubrifiée",
        outils: "Coupe-câble, pince universelle, lubrifiant",
        prompt: generateDetailedPrompt("4.3.1.A", "OUTIL", "Coupe-câble sur établi", "Câble Ø 4mm neuf et serre-câbles", "gaine lubrifiée", "Outils d'atelier"),
        realUrl: "/src/assets/images/st2d_parking_tool_1782488907494.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Nouveau câble de parking raccordé',
        cadrage: "Même angle que Photo 1, raccord neuf",
        subject: "Câble neuf installé dans sa gaine et bridé",
        details: "Manette de cabine fonctionnelle, serrage ferme à 3 crans",
        validation: "Serrage de parking validé à 3 crans de levier.",
        prompt: generateDetailedPrompt("4.3.1.A", "RÉSULTAT", "Câble de parking neuf bridé", "Manette fonctionnelle et câble tendu", "serre-câble neuf serré", "Gaine lubrifiée"),
        realUrl: "/src/assets/images/st2d_parking_ok_1782488923436.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Serre-câble mal positionné ou écrasé',
        cadrage: "Macro du serre-câble d'extrémité",
        subject: "Câble glissant dans le serre-câble desserré",
        details: "Brides montées à l'envers ou écrasement excessif",
        ligneRouge: "MONTAGE À L'ENVERS — Risque de glissement de parking sous charge.",
        prompt: generateDetailedPrompt("4.3.1.A", "MAUVAIS", "Serre-câble monté à l'envers", "Câble glissant sous la bride", "écrous mal serrés", "Extrémité écrasée"),
        realUrl: "/src/assets/images/st2d_parking_bad_1782488935654.jpg"
      }
    ]
  },
  {
    id: "photo-proc-04",
    title: "Procédure 1.1.1.A — Remplacement segments moteur Deutz air",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Piston Deutz avec segments cassés',
        cadrage: "Gros plan sur les gorges du piston",
        subject: "Segment de feu cassé en trois morceaux",
        details: "Calandres encrassées, jeu à la coupe hors limite (> 1.2 mm)",
        prompt: generateDetailedPrompt("1.1.1.A", "CASSÉ", "Gorges du piston", "Segment de feu cassé en morceaux", "piston calaminé", "Jeu hors limite"),
        realUrl: "/src/assets/images/st2d_segments_worn_1782489449767.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Pince à segments et collier de montage',
        cadrage: "Plan serré sur le piston et la pince",
        subject: "Pince à segments mécanique et collier à vis",
        details: "LOTO moteur appliqué, cales en liège de rechange",
        outils: "Pince à segments, collier de serrage, jeu de jauges d'épaisseur",
        prompt: generateDetailedPrompt("1.1.1.A", "OUTIL", "Pince à segments sur piston", "Collier de serrage à vis", "LOTO moteur", "Jauges d'épaisseur"),
        realUrl: "/src/assets/images/st2d_segments_tool_1782489464546.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Piston rééquipé de segments neufs',
        cadrage: "Même angle que Photo 1, piston nettoyé",
        subject: "Segments neufs (feu, étanchéité, racleur) montés",
        details: "Jeu à la coupe réglé à 0.35 mm, tierçage des ouvertures à 120°",
        validation: "Jeu à la coupe de 0.35 mm validé. Tierçage à 120°.",
        prompt: generateDetailedPrompt("1.1.1.A", "RÉSULTAT", "Segments neufs montés", "Tierçage des ouvertures à 120 degrés", "jeu de cales posé", "Piston propre"),
        realUrl: "/src/assets/images/st2d_segments_ok_1782489479985.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Segments montés à l\'envers (sens TOP inversé)',
        cadrage: "Macro de la tranche de segment dans la gorge",
        subject: "Repère 'TOP' orienté vers le bas du piston",
        details: "Segment bloqué ou forcé, risque de rayure sévère de chemise",
        ligneRouge: "SENS INVERSÉ — Consommation d'huile massive et usure cylindre immédiate.",
        prompt: generateDetailedPrompt("1.1.1.A", "MAUVAIS", "Repère TOP vers le bas", "Segment forcé dans sa gorge", "chemise rayée", "Sens de montage inversé"),
        realUrl: "/src/assets/images/st2d_segments_bad_1782489495189.jpg"
      }
    ]
  },
  {
    id: "photo-proc-05",
    title: "Procédure 1.1.4.B — Remplacement injecteur mécanique Bosch",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Nez d\'injecteur calaminé et bouché',
        cadrage: "Macro du nez de l'injecteur Bosch VE",
        subject: "Buses d'atomisation complètement obstruées par la calamine",
        details: "Gazole noirci, aiguille grippée en position ouverte",
        prompt: generateDetailedPrompt("1.1.4.B", "CASSÉ", "Nez injecteur calaminé", "Buses bouchées par la calamine", "aiguille grippée", "Gazole encrassé"),
        realUrl: "/src/assets/images/st2d_injecteur_worn_1782489508922.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Pompe de tarage manuelle d\'atelier',
        cadrage: "Plan moyen de l'établi technique",
        subject: "Pompe de tarage d'atelier avec manomètre gradué",
        details: "Ligne haute pression connectée pour test d'atomisation",
        outils: "Pompe de tarage d'injecteurs, clé de 19 mm, lunettes de protection",
        prompt: generateDetailedPrompt("1.1.4.B", "OUTIL", "Pompe de tarage d'injecteur", "Manomètre gradué connecté", "lunettes de protection", "Gazole d'essai"),
        realUrl: "/src/assets/images/st2d_injecteur_tool_1782489524036.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Injecteur neuf taré à 180 bar',
        cadrage: "Même angle que Photo 1, injecteur neuf",
        subject: "Injecteur neuf avec rondelle pare-flamme neuve en cuivre",
        details: "Pression d'ouverture tarée à 180 bar, pulvérisation conique parfaite",
        validation: "Pression d'ouverture stable à 180 bar. Zéro goutte à 160 bar.",
        prompt: generateDetailedPrompt("1.1.4.B", "RÉSULTAT", "Injecteur neuf taré", "Pulvérisation conique à 180 bar", "rondelle cuivre neuve", "Zéro goutte au nez"),
        realUrl: "/src/assets/images/st2d_injecteur_ok_1782489538356.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Injecteur pisseur ou jet asymétrique',
        cadrage: "Macro du jet de pulvérisation",
        subject: "Gouttes massives tombant du nez sous pression",
        details: "Jet non conique (asymétrique), risque de perforation de piston",
        ligneRouge: "INJECTEUR PISSEUR — Risque de destruction de piston par point chaud.",
        prompt: generateDetailedPrompt("1.1.4.B", "MAUVAIS", "Injecteur pisseur", "Grosses gouttes de gazole non pulvérisées", "jet asymétrique", "Nez fuyant"),
        realUrl: "/src/assets/images/st2d_injecteur_bad_1782489551401.jpg"
      }
    ]
  },
  {
    id: "photo-proc-06",
    title: "Procédure 1.1.5.A — Remplacement cartouche filtre à air",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Filtre à air principal colmaté',
        cadrage: "Plongée dans le boîtier de filtre",
        subject: "Cartouche papier principale saturée de silice rouge",
        details: "Indicateur de restriction rouge bloqué, déformation du papier",
        prompt: generateDetailedPrompt("1.1.5.A", "CASSÉ", "Cartouche colmatée", "Papier saturé de poussière rouge", "indicateur rouge bloqué", "Papier déformé"),
        realUrl: "/src/assets/images/st2d_filtre_worn_1782489566236.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Chiffon sec et soufflette d\'air comprimé',
        cadrage: "Plan de travail sur le capot moteur",
        subject: "Chiffon propre pour nettoyer l'intérieur du boîtier",
        details: "Nettoyage du cyclone de pré-filtrage à air",
        outils: "Chiffon propre, soufflette d'air, tournevis à collier",
        prompt: generateDetailedPrompt("1.1.5.A", "OUTIL", "Nettoyage interne du boîtier", "Chiffon propre et cyclone démonté", "soufflette d'air", "Boîtier en plastique"),
        realUrl: "/src/assets/images/st2d_filtre_tool_1782489582103.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Cartouche neuve installée et calée',
        cadrage: "Même angle que Photo 1, cartouche neuve",
        subject: "Cartouche de filtre papier neuve Epiroc ST2D scellée",
        details: "Couvercle bien étanche, indicateur réarmé en position verte",
        validation: "Filtre scellé. Indicateur réarmé à zéro (vert).",
        prompt: generateDetailedPrompt("1.1.5.A", "RÉSULTAT", "Cartouche neuve scellée", "Papier blanc propre sans pliure", "couvercle verrouillé", "Indicateur de restriction vert"),
        realUrl: "/src/assets/images/st2d_filtre_ok_1782489600109.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Entrée d\'air non filtrée ou joint écrasé',
        cadrage: "Macro du plan de joint de la cartouche",
        subject: "Joint d'étanchéité de filtre écrasé de travers ou fendu",
        details: "Poussière fine contournant le filtre, risque de serrage moteur",
        ligneRouge: "BYPASS DU FILTRE — Infiltration de silice dans les cylindres.",
        prompt: generateDetailedPrompt("1.1.5.A", "MAUVAIS", "Joint de filtre écrasé", "Poussière blanche contournant le joint", "boîtier mal verrouillé", "Rupture de joint"),
        realUrl: "/src/assets/images/st2d_filtre_bad_1782489621538.jpg"
      }
    ]
  },
  {
    id: "photo-proc-07",
    title: "Procédure 2.1.2.A — Remplacement disques embrayage transmission",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Disques d\'embrayage Funk brûlés',
        cadrage: "Vue plane sur l'établi d'atelier",
        subject: "Disques d'embrayage Funk DF80 carbonisés noirs",
        details: "Garnitures organiques pelées, odeur persistante d'huile brûlée",
        prompt: generateDetailedPrompt("2.1.2.A", "CASSÉ", "Disques carbonisés", "Garnitures organiques décollées noires", "huile brûlée", "Traces de frottement"),
        realUrl: "/src/assets/images/st2d_embrayage_worn_1782489635102.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Presse de compression de cloche d\'embrayage',
        cadrage: "Plan serré sur la presse et la cloche",
        subject: "Presse de rappel d'embrayage Epiroc ST2D",
        details: "LOTO de transmission appliqué, ressorts de rappel comprimés",
        outils: "Presse de cloche, pince à circlips extérieurs, jauges de cales",
        prompt: generateDetailedPrompt("2.1.2.A", "OUTIL", "Presse de cloche d'embrayage", "Ressorts comprimés sous la presse", "pince circlips", "LOTO de transmission"),
        realUrl: "/src/assets/images/st2d_embrayage_tool_1782489650109.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Cloche d\'embrayage réassemblée propre',
        cadrage: "Même angle que Photo 1, cloche nettoyée",
        subject: "Disques d'embrayage neufs alternés et lubrifiés",
        details: "Jeu fonctionnel libre réglé à 1.80 mm au comparateur",
        validation: "Jeu de cloche réglé à 1.80 mm. Serrage de sécurité ok.",
        prompt: generateDetailedPrompt("2.1.2.A", "RÉSULTAT", "Cloche d'embrayage réassemblée", "Disques neufs lubrifiés alternés", "comparateur de jeu", "Surface propre"),
        realUrl: "/src/assets/images/st2d_embrayage_ok_1782489665111.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Cannelures de cloche d\'embrayage usées',
        cadrage: "Macro des cannelures de cloche",
        subject: "Cannelures internes fortement crantées en marches d'escalier",
        details: "Disques bloqués empêchant le débrayage, risque de casse de boîte",
        ligneRouge: "CANNELURES USÉES — Remplacement obligatoire de la cloche d'embrayage.",
        prompt: generateDetailedPrompt("2.1.2.A", "MAUVAIS", "Cannelures internes crantées", "Traces de martèlement d'acier", "boîte de vitesses bloquée", "Rupture cannelure"),
        realUrl: "/src/assets/images/st2d_embrayage_bad_1782489680102.jpg"
      }
    ]
  },
  {
    id: "photo-proc-08",
    title: "Procédure 2.1.4.A — Réglage levier commande transmission",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Sélecteur de vitesse de travers',
        cadrage: "Plan moyen du levier en cabine",
        subject: "Levier de vitesses Funk DF80 présentant un jeu excessif",
        details: "Butées usées, rotule de tringlerie desserrée",
        prompt: generateDetailedPrompt("2.1.4.A", "CASSÉ", "Levier de vitesses lâche", "Jeu excessif au levier de cabine", "rotule desserrée", "Butées usées"),
        realUrl: "/src/assets/images/st2d_levier_worn_1782489695123.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Clé dynamométrique et jeu de douilles',
        cadrage: "Gros plan sur la tringlerie de boîte",
        subject: "Clé dynamométrique réglée à 45 Nm sur écrou de rotule",
        details: "LOTO appliqué, béquille d'articulation en place",
        outils: "Clé dynamométrique, jeu de clés plates, graisse NLGI 2",
        prompt: generateDetailedPrompt("2.1.4.A", "OUTIL", "Clé dynamométrique sur rotule", "Serrage de tringlerie à 45 Nm", "béquille jaune", "LOTO cabine"),
        realUrl: "/src/assets/images/st2d_levier_tool_1782489710111.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Levier de vitesse aligné et verrouillé',
        cadrage: "Même angle que Photo 1, levier centré",
        subject: "Verrouillage précis de chaque rapport sans aucun point dur",
        details: "Rotule graissée, écrou nylstop neuf bloqué et marqué",
        validation: "Course du levier valide. Indexation des 4 vitesses OK.",
        prompt: generateDetailedPrompt("2.1.4.A", "RÉSULTAT", "Levier de vitesse aligné", "Rotule graissée et écrou nylstop marqué", "jeu fonctionnel résolu", "Changement ferme"),
        realUrl: "/src/assets/images/st2d_levier_ok_1782489725112.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Tringlerie tordue ou rotule cassée',
        cadrage: "Macro sur la rotule de tringlerie",
        subject: "Tige de commande tordue suite à un forçage du sélecteur",
        details: "Rupture de la rotule filetée, jeu supérieur à 20 mm",
        ligneRouge: "TRINGLERIE TORDUE — Vitesses impossibles à passer. Remplacer la tige.",
        prompt: generateDetailedPrompt("2.1.4.A", "MAUVAIS", "Tige de commande tordue", "Rotule filetée brisée en deux", "jeu de 20mm", "Sélecteur bloqué"),
        realUrl: "/src/assets/images/st2d_levier_bad_1782489740111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-09",
    title: "Procédure 3.1.1.A — Remplacement pompe hydraulique engrenages",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Pompe hydraulique à engrenages usée',
        cadrage: "Plan large du compartiment hydraulique",
        subject: "Pompe hydraulique de levage Epiroc ST2D fuyarde",
        details: "Corps en aluminium rayé, suintement abondant au joint d'arbre",
        prompt: generateDetailedPrompt("3.1.1.A", "CASSÉ", "Pompe hydraulique fuyarde", "Corps en aluminium rayé", "suintement joint d'arbre", "Huile hydraulique noire"),
        realUrl: "/src/assets/images/st2d_pompe_worn_1782489755123.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Manomètre de pression hydraulique branché',
        cadrage: "Gros plan sur les prises de pression d'atelier",
        subject: "Manomètre de test 250 bar branché sur la prise de test",
        details: "Cadenas de consignation LOTO appliqué au démarreur",
        outils: "Manomètre de test 0-250 bar, clé de 19 mm, flexibles d'atelier",
        prompt: generateDetailedPrompt("3.1.1.A", "OUTIL", "Manomètre branché sur prise", "Manomètre 0-250 bar de contrôle", "LOTO démarreur", "Flexibles haute pression"),
        realUrl: "/src/assets/images/st2d_pompe_tool_1782489770112.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Pompe hydraulique neuve scellée',
        cadrage: "Même angle que Photo 1, pompe neuve",
        subject: "Nouveau corps de pompe à engrenages scellé et propre",
        details: "Brides de raccordement serrées à 85 Nm, joints toriques neufs",
        validation: "Pression mesurée à chaud à 114 bar. Débit conforme.",
        prompt: generateDetailedPrompt("3.1.1.A", "RÉSULTAT", "Corps de pompe neuf monté", "Brides serrées à 85 Nm et marquées", "absence de fuite", "Pression 114 bar stable"),
        realUrl: "/src/assets/images/st2d_pompe_ok_1782489785123.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Arbre de pompe hydraulique cisaillé',
        cadrage: "Macro de l'arbre d'entraînement",
        subject: "Arbre cannelé d'entraînement brisé net au ras de la bride",
        details: "Signe d'une surpression ou d'un grippage mécanique interne",
        ligneRouge: "ARBRE CISAILLÉ — Destruction interne totale. Rincer le circuit complet.",
        prompt: generateDetailedPrompt("3.1.1.A", "MAUVAIS", "Arbre cannelé cisaillé", "Arbre de pompe cassé net", "limaille métallique dans l'huile", "Surpression"),
        realUrl: "/src/assets/images/st2d_pompe_bad_1782489800111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-10",
    title: "Procédure 3.3.1.A — Remplacement vérin hoist 80mm",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Vérin hoist fuyard ou tige rayée',
        cadrage: "Plan moyen du bras de levage",
        subject: "Vérin de levage Ø 80 mm fuyard au nez",
        details: "Joint de tige fendu par les gravillons de mine, tige rayée",
        prompt: generateDetailedPrompt("3.3.1.A", "CASSÉ", "Vérin hoist fuyard", "Joint de tige fendu au nez", "tige rayée par la silice", "Gouttes d'huile au sol"),
        realUrl: "/src/assets/images/st2d_verin_worn_1782489815123.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Élingues textiles et clé à ergot de nez',
        cadrage: "Plongée sur la tête de vérin hoist",
        subject: "Clé à ergot d'atelier sur le chapeau fileté du vérin",
        details: "LOTO appliqué, bras de levage béquillé et calé de sécurité",
        outils: "Clé à ergot lourde, élingues textiles 2 tonnes, grue d'atelier",
        prompt: generateDetailedPrompt("3.3.1.A", "OUTIL", "Clé à ergot sur chapeau", "Chapeau fileté de vérin hoist", "LOTO appliqué", "Bras béquillé et élingué"),
        realUrl: "/src/assets/images/st2d_verin_tool_1782489830111.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Vérin hoist reconditionné monté',
        cadrage: "Même angle que Photo 1, vérin propre",
        subject: "Tige polie sans rayures et joints NBR neufs graissés",
        details: "Chapeau serré au couple recommandé, axes de pied graissés",
        validation: "Course fluide sans saccades. Étanchéité de tige validée.",
        prompt: generateDetailedPrompt("3.3.1.A", "RÉSULTAT", "Vérin reconditionné étanche", "Tige polie et joints neufs graissés", "axes graissés de pied", "Zéro coulure"),
        realUrl: "/src/assets/images/st2d_verin_ok_1782489845112.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Tige de vérin hoist tordue ou flambée',
        cadrage: "Macro du flanc de la tige de vérin",
        subject: "Tige de vérin flambée présentant une courbure de 12 mm",
        details: "Casse du guidage interne due à une surcharge anormale",
        ligneRouge: "TIGE FLAMBÉE — Risque de blocage et rupture de charge. Remplacer la tige.",
        prompt: generateDetailedPrompt("3.3.1.A", "MAUVAIS", "Tige flambée courbée", "Tige de vérin de 80mm tordue", "surcharge anormale", "Guidage cassé"),
        realUrl: "/src/assets/images/st2d_verin_bad_1782489860111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-11",
    title: "Procédure 1.1.3.A — Nettoyage ailettes refroidissement moteur Deutz",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Ailettes moteur colmatées de cambouis',
        cadrage: "Gros plan sur les cylindres Deutz F4L912",
        subject: "Ailettes de refroidissement complètement obstruées de poussière de roche grasse",
        details: "Écran isolant thermique provoquant une surchauffe moteur rapide (> 165°C)",
        prompt: generateDetailedPrompt("1.1.3.A", "CASSÉ", "Ailettes de cylindre colmatées", "Poussière grasse entre les ailettes", "surchauffe thermique", "Cylindres Deutz à air"),
        realUrl: "/src/assets/images/st2d_ailettes_worn_1782489875111.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Racloir métallique et nettoyeur vapeur',
        cadrage: "Plan large devant le capot moteur ouvert",
        subject: "Grattoir métallique plat et nettoyeur vapeur haute pression",
        details: "LOTO appliqué, alternateur d'éclairage et câbles protégés",
        outils: "Racloir métallique, nettoyeur vapeur, soufflette, masque de protection",
        prompt: generateDetailedPrompt("1.1.3.A", "OUTIL", "Grattoir et lance vapeur", "Nettoyage des ailettes à air", "alternateur protégé", "LOTO moteur"),
        realUrl: "/src/assets/images/st2d_ailettes_tool_1782489890112.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Ailettes Deutz parfaitement propres',
        cadrage: "Même angle que Photo 1, bloc brillant",
        subject: "Ailettes de refroidissement propres en fonte brute, sans débris",
        details: "Flux d'air du ventilateur circulant de manière homogène sur les 4 cylindres",
        validation: "Ailettes propres à 100%. Température stabilisée à 135°C en charge.",
        prompt: generateDetailedPrompt("1.1.3.A", "RÉSULTAT", "Ailettes de cylindres propres", "Fonte brute visible sans résidu", "flux d'air libre", "Température stable"),
        realUrl: "/src/assets/images/st2d_ailettes_ok_1782489905123.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Ailettes cassées suite à un choc de grattoir',
        cadrage: "Macro de la tranche d'ailette cassée",
        subject: "Ailette en fonte cassée avec fissure se propageant vers le bloc",
        details: "Choc excessif au marteau ayant fragilisé le cylindre Deutz",
        ligneRouge: "AILETTE FISSURÉE — Risque de fissure du bloc-cylindres. Remplacer la chemise.",
        prompt: generateDetailedPrompt("1.1.3.A", "MAUVAIS", "Ailette en fonte cassée", "Fissure de choc sur le cylindre", "chemise fragilisée", "Marteau à côté"),
        realUrl: "/src/assets/images/st2d_ailettes_bad_1782489920111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-12",
    title: "Procédure 1.1.5.B — Vidange huile moteur Deutz F4L912",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Huile moteur noire et usée',
        cadrage: "Plongée sous le carter inférieur",
        subject: "Huile de vidange noire extrêmement fluide et chargée de suie",
        details: "Filtre à huile d'origine Epiroc ST2D encrassé de dépôts",
        prompt: generateDetailedPrompt("1.1.5.B", "CASSÉ", "Huile moteur noire usée", "Gouttes d'huile noire fluide", "filtre encrassé", "Carter de vidange"),
        realUrl: "/src/assets/images/st2d_vidange_worn_1782489935111.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Clé de carter et clé à filtre à sangle',
        cadrage: "Plan serré sur le bouchon de vidange",
        subject: "Clé plate de 22 mm et clé à sangle pour filtre à huile",
        details: "Bac de récupération d'huile usée propre posé au sol",
        outils: "Clé plate de 22 mm, clé à sangle pour filtre, bac de vidange, entonnoir",
        prompt: generateDetailedPrompt("1.1.5.B", "OUTIL", "Clé de 22mm sur bouchon carter", "Clé à sangle sur filtre à huile", "bac de vidange", "Entonnoir propre"),
        realUrl: "/src/assets/images/st2d_vidange_tool_1782489950112.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Huile neuve 15W40 au niveau jauge',
        cadrage: "Même angle que Photo 1, carter essuyé",
        subject: "Huile minérale neuve 15W-40 (8 L) claire à mi-niveau de jauge",
        details: "Filtre à huile neuf scellé serré à la main, bouchon serré à 60 Nm",
        validation: "Huile de vidange remplacée. Niveau jauge validé. Bouchon étanche.",
        prompt: generateDetailedPrompt("1.1.5.B", "RÉSULTAT", "Niveau de jauge d'huile correct", "Filtre à huile neuf et bouchon serré", "huile 15W-40 claire", "Carter essuyé"),
        realUrl: "/src/assets/images/st2d_vidange_ok_1782489965111.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Bouchon de carter vissé de travers ou fuyard',
        cadrage: "Macro du filetage de bouchon de carter",
        subject: "Filetage de carter en aluminium arraché par un serrage excessif",
        details: "Gros suintement d'huile moteur neuve, joint de cuivre écrasé",
        ligneRouge: "FILETAGE ARRACHÉ — Fuite majeure d'huile. Remplacement ou taraudage requis.",
        prompt: generateDetailedPrompt("1.1.5.B", "MAUVAIS", "Bouchon vissé de travers", "Filetage de carter d'huile arraché", "fuite d'huile neuve", "Joint cuivre brisé"),
        realUrl: "/src/assets/images/st2d_vidange_bad_1782489980111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-13",
    title: "Procédure 2.1.1.A — Remplacement embrayage mécanique Funk DF80",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Mécanisme d\'embrayage Funk fendu',
        cadrage: "Vue sous la cloche de boîte démontée",
        subject: "Disque de friction sec Funk DF80 fendu radialement",
        details: "Ressorts amortisseurs de couple brisés ou absents",
        prompt: generateDetailedPrompt("2.1.1.A", "CASSÉ", "Disque d'embrayage fendu", "Ressorts de couple brisés", "cloche de boîte", "Matière arrachée"),
        realUrl: "/src/assets/images/st2d_funk_worn_1782489995111.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Centreur d\'embrayage et élingues de cloche',
        cadrage: "Plongée sur le volant moteur Deutz",
        subject: "Mandrin de centrage d'embrayage engagé dans le roulement pilote",
        details: "Cloche de boîte suspendue à des élingues, béquille jaune posée",
        outils: "Mandrin de centrage d'embrayage, clés de cloche, élingues textiles",
        prompt: generateDetailedPrompt("2.1.1.A", "OUTIL", "Mandrin de centrage engagé", "Cloche suspendue par élingues", "volant moteur Deutz", "Béquille jaune"),
        realUrl: "/src/assets/images/st2d_funk_tool_1782490010112.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Embrayage sec Funk DF80 neuf monté',
        cadrage: "Même angle que Photo 1, alignement parfait",
        subject: "Disque sec neuf indexé avec cannelures de boîte lubrifiées",
        details: "Vis de butée d'embrayage serrées à 85 Nm, garde de câble ajustée",
        validation: "Embrayage Funk réassemblé. Centrage parfait. Garde de câble ok.",
        prompt: generateDetailedPrompt("2.1.1.A", "RÉSULTAT", "Disque sec neuf aligné", "Butées serrées à 85 Nm et marquées", "garde de câble réglée", "Cannelures graissées"),
        realUrl: "/src/assets/images/st2d_funk_ok_1782490025111.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Cannelures d\'arbre primaire rongées',
        cadrage: "Macro des cannelures d'arbre de boîte",
        subject: "Arbre d'embrayage primaire avec cannelures déformées par torsion",
        details: "Rupture de clavette ou jeu excessif empêchant l'alignement",
        ligneRouge: "ARBRE DE BOÎTE TORDU — Remplacement obligatoire de l'arbre d'entrée Funk.",
        prompt: generateDetailedPrompt("2.1.1.A", "MAUVAIS", "Cannelures d'arbre déformées", "Arbre primaire tordu par surcharge", "rupture de clavette", "Rupture cannelure"),
        realUrl: "/src/assets/images/st2d_funk_bad_1782490040111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-14",
    title: "Procédure 2.2.5.A — Révision boîte Funk DF80 (roulements)",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Roulements de boîte Funk écaillés',
        cadrage: "Vue sur la table de montage propre",
        subject: "Cages de roulement d'arbre secondaire écaillées et bleuies",
        details: "Présence importante de paillettes de bronze dans l'huile SAE 80W-90",
        prompt: generateDetailedPrompt("2.2.5.A", "CASSÉ", "Cages de roulement écaillées", "Paillettes de bronze dans l'huile", "roulement bleui", "Arbre de boîte"),
        realUrl: "/src/assets/images/st2d_revision_worn_1782490055111.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Extracteur à griffes et presse hydraulique',
        cadrage: "Plan serré sur le roulement monté sur l'arbre",
        subject: "Extracteur de roulement à griffes robuste vissé sur l'épaulement",
        details: "Châssis calé, LOTO de transmission appliqué",
        outils: "Extracteur à griffes mécanique, presse d'atelier, gants en cuir",
        prompt: generateDetailedPrompt("2.2.5.A", "OUTIL", "Extracteur à griffes en position", "Épaulement d'arbre de boîte", "presse d'atelier", "LOTO boîte"),
        realUrl: "/src/assets/images/st2d_revision_tool_1782490070112.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Nouveaux roulements emmanchés',
        cadrage: "Même angle que Photo 1, pignons réassemblés",
        subject: "Roulements neufs montés serrés sans aucun jeu axial",
        details: "Jeux d'engrènement vérifiés (0.12 mm), huile neuve remplacée",
        validation: "Roulements emmanchés à chaud. Engrènement à 0.12 mm. OK.",
        prompt: generateDetailedPrompt("2.2.5.A", "RÉSULTAT", "Roulements neufs emmanchés", "Axe de boîte réassemblé propre", "jeu à 0.12mm vérifié", "Huile neuve"),
        realUrl: "/src/assets/images/st2d_revision_ok_1782490085111.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Roulement monté de travers ou fêlé',
        cadrage: "Macro de la bague interne de roulement",
        subject: "Fêlure de la bague interne due à un emmanchement excessif à froid",
        details: "Bague de travers de 0.5 mm provoquant un sifflement mécanique intense",
        ligneRouge: "ROULEMENT FÊLÉ — Destruction immédiate en service. Déposer à nouveau.",
        prompt: generateDetailedPrompt("2.2.5.A", "MAUVAIS", "Bague de roulement fêlée", "Montage forcé de travers à froid", "sifflement d'engrènement", "Fêlure interne"),
        realUrl: "/src/assets/images/st2d_revision_bad_1782490100111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-15",
    title: "Procédure 3.1.3.A — Remplacement filtre hydraulique aspiration",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Crépine d\'aspiration colmatée de boue',
        cadrage: "Vue dans l'orifice du réservoir",
        subject: "Crépine d'aspiration métallique saturée de paraffine grasse",
        details: "Mousse d'huile dans le réservoir, cavitation prononcée des pompes",
        prompt: generateDetailedPrompt("3.1.3.A", "CASSÉ", "Crépine métallique colmatée", "Paraffine grasse obstruant la maille", "mousse d'huile", "Réservoir hydraulique"),
        realUrl: "/src/assets/images/st2d_filtre_hyd_worn_1782490115111.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Clé de vidange de réservoir et bac de rinçage',
        cadrage: "Plan large sous le réservoir hydraulique",
        subject: "Bac de récupération d'huile propre posé sous l'orifice",
        details: "LOTO hydraulique appliqué, flexibles nettoyés",
        outils: "Clé plate pour bouchon réservoir, bac de récupération, gants en nitrile",
        prompt: generateDetailedPrompt("3.1.3.A", "OUTIL", "Vidange du réservoir hydraulique", "Bac propre de récupération d'huile", "LOTO hydraulique", "Gants nitrile"),
        realUrl: "/src/assets/images/st2d_filtre_hyd_tool_1782490130112.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Crépine neuve 100 microns montée',
        cadrage: "Même angle que Photo 1, crépine neuve",
        subject: "Crépine d'aspiration neuve en inox vissée et étanche",
        details: "Huile hydraulique ISO VG 46 neuve claire remplie au niveau",
        validation: "Filtre d'aspiration remplacé. Réservoir rincé et étanche. OK.",
        prompt: generateDetailedPrompt("3.1.3.A", "RÉSULTAT", "Crépine inox neuve vissée", "Huile ISO VG 46 claire au niveau", "réservoir rincé", "Zéro fuite"),
        realUrl: "/src/assets/images/st2d_filtre_hyd_ok_1782490145111.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Crépine déchirée ou mal engagée',
        cadrage: "Macro de la maille inox de crépine",
        subject: "Maille inox déchirée sur 10 mm laissant passer la limaille",
        details: "Entraînement de débris vers la pompe de levage, risque de grippage",
        ligneRouge: "CRÉPINE DÉCHIRÉE — Risque de destruction immédiate des pompes à engrenages.",
        prompt: generateDetailedPrompt("3.1.3.A", "MAUVAIS", "Maille de crépine déchirée", "Débris passant à travers la maille", "destruction de pompe", "Rupture de maille"),
        realUrl: "/src/assets/images/st2d_filtre_hyd_bad_1782490160111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-16",
    title: "Procédure 3.2.2.A — Dépannage distributeur hydraulique grippé",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Tiroir de distributeur grippé',
        cadrage: "Vue plane du corps de distributeur démonté",
        subject: "Tiroir de commande de levage rayé profondément par de la limaille",
        details: "Distributeur mécanique d'origine Epiroc ST2D coincé à mi-course",
        prompt: generateDetailedPrompt("3.2.2.A", "CASSÉ", "Tiroir profondément rayé", "Limaille bloquant le distributeur", "tiroir coincé", "Distributeur démonté"),
        realUrl: "/src/assets/images/st2d_distri_worn_1782490175111.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Papier abrasif grain 1500 et bac à ultrasons',
        cadrage: "Plan de travail sur l'établi de précision",
        subject: "Technicien frottant délicatement le tiroir au papier de verre fin",
        details: "LOTO appliqué, béquille de bras en place pour la sécurité",
        outils: "Papier abrasif grain 1500, solvant dégraissant, micromètre",
        prompt: generateDetailedPrompt("3.2.2.A", "OUTIL", "Abrasif grain 1500 sur tiroir", "Dégraissage du corps au solvant", "béquille de bras", "LOTO hydraulique"),
        realUrl: "/src/assets/images/st2d_distri_tool_1782490190112.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Tiroir rodé coulissant librement',
        cadrage: "Même angle que Photo 1, tiroir remonté",
        subject: "Tiroir rodé coulissant librement à la main dans le corps",
        details: "Distributeur réassemblé avec joints toriques neufs NBR",
        validation: "Coulissement libre du tiroir. Étanchéité de distributeur validée.",
        prompt: generateDetailedPrompt("3.2.2.A", "RÉSULTAT", "Tiroir coulissant librement", "Distributeur propre réassemblé", "joints toriques neufs", "Zéro point dur"),
        realUrl: "/src/assets/images/st2d_distri_ok_1782490205111.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Corps de distributeur fêlé ou rayures excessives',
        cadrage: "Macro de l'alésage interne de distributeur",
        subject: "Alésage interne rayé ou micro-fissure thermique du bloc",
        details: "Fuite interne massive, dérive de charge irrécupérable",
        ligneRouge: "DISTRIBUTEUR MORT — Corps hors d'usage. Remplacement complet requis.",
        prompt: generateDetailedPrompt("3.2.2.A", "MAUVAIS", "Alésage interne rayé", "Fissure thermique du bloc distributeur", "dérive de charge", "Fuite d'huile"),
        realUrl: "/src/assets/images/st2d_distri_bad_1782490220111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-17",
    title: "Procédure 4.2.1.A — Remplacement câble frein de service",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Câble de service détendu ou effiloché',
        cadrage: "Plongée sous la pédale de frein",
        subject: "Câble de service Ø 4 mm effiloché au niveau du palonnier",
        details: "Pédale molle en cabine, gaine fendue laissant entrer l'eau",
        prompt: generateDetailedPrompt("4.2.1.A", "CASSÉ", "Câble effiloché au palonnier", "Pédale molle en cabine", "gaine de câble fendue", "Câble Ø 4mm"),
        realUrl: "/src/assets/images/st2d_service_worn_1782490235111.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Pince coupante et graisse de câble mécanique',
        cadrage: "Plan serré sur le palonnier d'articulation",
        subject: "Aiguille de tirage et nouveau câble mécanique lubrifié",
        details: "LOTO consigné en cabine, béquille de blocage installée",
        outils: "Pince coupante, clé à douilles de 10 mm, graisse mécanique marine",
        prompt: generateDetailedPrompt("4.2.1.A", "OUTIL", "Aiguille de tirage mécanique", "Câble lubrifié et palonnier", "béquille de blocage", "LOTO cabine"),
        realUrl: "/src/assets/images/st2d_service_tool_1782490250112.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Nouveau câble de service tendu et calé',
        cadrage: "Même angle que Photo 1, câble neuf",
        subject: "Câble neuf raccordé avec jeu de pédale de 3 mm",
        details: "Palonnier mécanique équilibré, écrous de serrage scellés jaune",
        validation: "Câble de service remplacé. Jeu pédale 3 mm. Freinage efficace.",
        prompt: generateDetailedPrompt("4.2.1.A", "RÉSULTAT", "Câble neuf raccordé au palonnier", "Palonnier équilibré et jeu de 3mm", "écrous marqués vernis jaune", "Gaine étanche"),
        realUrl: "/src/assets/images/st2d_service_ok_1782490265111.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Câble tordu ou coinçage de la gaine',
        cadrage: "Macro du coude de gaine sous le plancher",
        subject: "Gaine de câble de service pliée à 90° contre le châssis",
        details: "Frein de service restant bloqué, usure immédiate des mâchoires",
        ligneRouge: "GAINE PLIÉE — Risque de blocage permanent de freinage. Corriger le passage.",
        prompt: generateDetailedPrompt("4.2.1.A", "MAUVAIS", "Gaine pliée à 90 degrés", "Frein bloqué sous le plancher", "usure des garnitures", "Frottement de gaine"),
        realUrl: "/src/assets/images/st2d_service_bad_1782490280111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-18",
    title: "Procédure 4.3.2.A — Réglage tendeur câble frein parking",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Tendeur de parking grippé par la rouille',
        cadrage: "Gros plan sous le châssis cabine",
        subject: "Tendeur fileté de parking rouillé et écrou bloqué de travers",
        details: "Impossibilité d'ajuster la tension de stationnement, câble lâche",
        prompt: generateDetailedPrompt("4.3.2.A", "CASSÉ", "Tendeur de parking rouillé", "Écrou bloqué de travers", "câble de stationnement lâche", "Châssis cabine"),
        realUrl: "/src/assets/images/st2d_tendeur_worn_1782490295111.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Dégrippant aérosol et brosse métallique',
        cadrage: "Plan serré sur le filetage de la tige tendeur",
        subject: "Technicien brossant le filetage et appliquant du dégrippant",
        details: "LOTO de parking appliqué, béquille de pivot jaune en place",
        outils: "Aérosol dégrippant, brosse métallique en acier, deux clés de 17 mm",
        prompt: generateDetailedPrompt("4.3.2.A", "OUTIL", "Application dégrippant sur filetage", "Brossage de la tige métallique", "béquille jaune", "LOTO appliqué"),
        realUrl: "/src/assets/images/st2d_tendeur_tool_1782490310112.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Tendeur de parking ajusté et graissé',
        cadrage: "Même angle que Photo 1, tendeur propre",
        subject: "Tige filetée propre graissée et écrou de réglage serré",
        details: "Course du levier réglée à 4 crans pour un maintien total en rampe",
        validation: "Tendeur de parking ajusté. Course du levier réglée à 4 crans.",
        prompt: generateDetailedPrompt("4.3.2.A", "RÉSULTAT", "Tendeur propre et graissé", "Course de levier à 4 crans réglée", "écrou de réglage bloqué", "Tige filetée"),
        realUrl: "/src/assets/images/st2d_tendeur_ok_1782490325111.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Tige de tendeur de parking tordue',
        cadrage: "Macro sur le flanc de la tige filetée",
        subject: "Tige filetée du tendeur de parking pliée sous l'effort de tension",
        details: "Rupture de la tige imminente, risque d'emballement de l'engin",
        ligneRouge: "TIGE PLIÉE — Perte immédiate du frein de secours en rampe. Remplacer la tige.",
        prompt: generateDetailedPrompt("4.3.2.A", "MAUVAIS", "Tige filetée pliée sous effort", "Rupture imminente de stationnement", "risque d'emballement", "Tendeur cassé"),
        realUrl: "/src/assets/images/st2d_tendeur_bad_1782490340111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-19",
    title: "Procédure 9.2.1.A — Remplacement pneu 17.5x25 (ST2D)",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Pneu 17.5x25 entaillé ou crevé',
        cadrage: "Plan large de la roue de chargeuse ST2D",
        subject: "Pneu renforcé pour mine souterraine avec flanc entaillé sur 50 mm",
        details: "Carcasse métallique apparente, perte lente de pression d'air",
        prompt: generateDetailedPrompt("9.2.1.A", "CASSÉ", "Pneu entaillé au flanc", "Carcasse métallique apparente", "flanc entaillé sur 50mm", "Roue de chargeuse"),
        realUrl: "/src/assets/images/st2d_pneu_worn_1782490355111.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Cric hydraulique 10t et clé à choc pneumatique',
        cadrage: "Plongée sous l'essieu rigide",
        subject: "Cric bouteille 10 tonnes en position de levage",
        details: "LOTO de roue appliqué, clé à choc pneumatique 1\" connectée",
        outils: "Cric bouteille 10 tonnes, clé à choc pneumatique 1\", douille de 33 mm",
        prompt: generateDetailedPrompt("9.2.1.A", "OUTIL", "Cric bouteille 10t sous essieu", "Clé à choc 1 pouce pneumatique", "LOTO roue", "Douille de 33mm"),
        realUrl: "/src/assets/images/st2d_pneu_tool_1782490370112.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Pneu neuf 17.5x25 monté gonflé',
        cadrage: "Même angle que Photo 1, pneu neuf monté",
        subject: "Pneu minier renforcé neuf d'origine Epiroc ST2D monté",
        details: "Écrous de roues serrés en étoile à 650 Nm marqués vernis jaune",
        validation: "Pneu remplacé. Serrage écrous en étoile à 650 Nm. Pression 4.5 bar.",
        prompt: generateDetailedPrompt("9.2.1.A", "RÉSULTAT", "Pneu minier neuf monté", "Écrous de roues marqués vernis jaune", "serrage à 650 Nm", "Pression 4.5 bar"),
        realUrl: "/src/assets/images/st2d_pneu_ok_1782490385111.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Écrous de roue desserrés ou filet cassé',
        cadrage: "Macro d'un goujon de roue d'essieu",
        subject: "Goujon de roue cisaillé ou écrou lâche avec jeu important",
        details: "Risque de perte de la roue en charge, filetage écrasé",
        ligneRouge: "GOUJON CISAILLÉ — Danger de perte de roue. Remplacer le goujon d'essieu.",
        prompt: generateDetailedPrompt("9.2.1.A", "MAUVAIS", "Goujon de roue cisaillé net", "Écrou lâche avec jeu de roue", "filetage de goujon écrasé", "Danger de perte de roue"),
        realUrl: "/src/assets/images/st2d_pneu_bad_1782490400111.jpg"
      }
    ]
  },
  {
    id: "photo-proc-20",
    title: "Procédure 10.3.1.A — Graissage manuel centralisé points de pivot",
    photos: [
      {
        type: 'CASSÉ',
        title: 'PHOTO 1',
        alt: 'Pivot d\'articulation sec ou bloqué',
        cadrage: "Gros plan sur le pivot central",
        subject: "Articulation centrale sèche de graisse, traces de rouille rouge",
        details: "Grincement métallique aigu à chaque braquage, flexible cassé",
        prompt: generateDetailedPrompt("10.3.1.A", "CASSÉ", "Articulation sèche de graisse", "Rouille rouge au pivot central", "grincement métallique", "Flexible cassé"),
        realUrl: "/src/assets/images/st2d_graissage_worn_1782490415111.jpg"
      },
      {
        type: 'OUTIL',
        title: 'PHOTO 2',
        alt: 'Pompe à graisse manuelle et flexible',
        cadrage: "Plan moyen de l'articulation centrale",
        subject: "Pompe à graisse manuelle raccordée sur le graisseur de pivot",
        details: "LOTO appliqué, béquille d'articulation jaune verrouillée",
        outils: "Pompe à graisse manuelle, cartouche graisse lithium EP2, chiffon",
        prompt: generateDetailedPrompt("10.3.1.A", "OUTIL", "Pompe à graisse sur graisseur", "Graisse lithium EP2 en cartouche", "béquille jaune", "LOTO appliqué"),
        realUrl: "/src/assets/images/st2d_graissage_tool_1782490430112.jpg"
      },
      {
        type: 'RÉSULTAT',
        title: 'PHOTO 3',
        alt: 'Graisse propre débordant des pivots',
        cadrage: "Même angle que Photo 1, pivot graissé",
        subject: "Débordement de graisse lithium propre au niveau des joints de pivot",
        details: "Flexible de liaison neuf raccordé et étanche, graisseur marqué",
        validation: "Graissage manuel des 14 pivots validé. Mouvements fluides.",
        prompt: generateDetailedPrompt("10.3.1.A", "RÉSULTAT", "Graisse propre débordant du pivot", "Flexible neuf raccordé et étanche", "pivots fluides", "Graisseur marqué"),
        realUrl: "/src/assets/images/st2d_graissage_ok_1782490445111.jpg"
      },
      {
        type: 'MAUVAIS',
        title: 'PHOTO 4',
        alt: 'Graisseur cassé ou flexible bouché',
        cadrage: "Macro d'un raccord de graisseur de pivot",
        subject: "Graisseur de pivot cassé au ras du filetage par un choc",
        details: "Graisse accumulée durcie obstruant complètement le passage d'huile",
        ligneRouge: "GRAISSEUR CASSÉ — Graissage impossible du pivot. Extraire le graisseur.",
        prompt: generateDetailedPrompt("10.3.1.A", "MAUVAIS", "Graisseur cassé au ras du filetage", "Graisse durcie bouchant l'orifice", " pivot bloqué", "Raccord brisé"),
        realUrl: "/src/assets/images/st2d_graissage_bad_1782490460111.jpg"
      }
    ]
  }
];
