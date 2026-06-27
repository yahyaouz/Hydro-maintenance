export interface SchemaItem {
  id: string;
  desc: string;
  ref: string;
  panne: string;
}

export interface SchemaGroup {
  id: string;
  title: string;
  items: SchemaItem[];
}

export interface StoryboardItem {
  id: string;
  title: string;
  duration: string;
  framing: string;
  audio: string;
  overlay: string;
  specs: string;
}

export interface ToleranceRow {
  id: string;
  param: string;
  nominal: string;
  minVal: string;
  maxVal: string;
  unit: string;
  tool: string;
  gmao: string;
}

export interface ToleranceTable {
  id: string;
  ref: string;
  title: string;
  prep: string;
  pos: string;
  mesure: string;
  reg: string;
  dec: string;
  rows: ToleranceRow[];
}

export interface ToolFiche {
  id: string;
  name: string;
  code: string;
  rack: string;
  desc: string;
  specs: string;
  procedure: string;
  maintenance: string[];
}

// ==========================================
// CHAPITRE 1 : SCHÉMAS ÉCLATÉS (4 schémas, ~62 pièces)
// ==========================================
export const ST2D_SCHEMAS_DATA: SchemaGroup[] = [
  {
    id: "sch-1.1",
    title: "1.1 — MOTEUR DEUTZ F4L912 AIR REFROIDI",
    items: [
      { id: "001", desc: "Bloc-cylindres Deutz F4L912 (fonte, 4 alésages, ailettes refroidissement air)", ref: "DE-F4L912-001", panne: "Pan. 1.1.1.A" },
      { id: "002", desc: "Chemise (4 pièces, fonte grise, Ø 100 mm, ailettes intégrées)", ref: "DE-F4L912-002", panne: "Pan. 1.1.1.A" },
      { id: "003", desc: "Piston (4 pièces, aluminium, 3 segments, Ø 100 mm)", ref: "DE-F4L912-003", panne: "Pan. 1.1.1.A" },
      { id: "004", desc: "Segment compression (4×2 = 8 pièces, chrome, Ø 100 mm)", ref: "DE-F4L912-004", panne: "Pan. 1.1.1.A" },
      { id: "005", desc: "Segment racleur huile (4×2 = 8 pièces, acier, Ø 100 mm)", ref: "DE-F4L912-005", panne: "Pan. 1.1.1.A" },
      { id: "006", desc: "Axe piston (4 pièces, acier, Ø 30 mm)", ref: "DE-F4L912-006", panne: "Pan. 1.1.1.A" },
      { id: "007", desc: "Bielle (4 pièces, acier forgé, longueur 160 mm)", ref: "DE-F4L912-007", panne: "Pan. 1.1.1.A" },
      { id: "008", desc: "Coussinet bielle (8 pièces, bronze, Ø 30 mm)", ref: "DE-F4L912-008", panne: "Pan. 1.1.1.A" },
      { id: "009", desc: "Vilebrequin (1 pièce, acier forgé, 4 manetons, 3 paliers)", ref: "DE-F4L912-009", panne: "Pan. 1.1.1.A" },
      { id: "010", desc: "Coussinet palier (6 pièces, bronze, Ø 55 mm)", ref: "DE-F4L912-010", panne: "Pan. 1.1.1.A" },
      { id: "011", desc: "Joint spi vilebrequin avant (1 pièce, feutre, Ø 55×70×8)", ref: "DE-F4L912-011", panne: "Pan. 1.1.2.A" },
      { id: "012", desc: "Joint spi vilebrequin arrière (1 pièce, feutre, Ø 55×70×8)", ref: "DE-F4L912-012", panne: "Pan. 1.1.2.A" },
      { id: "013", desc: "Pompe à huile (engrenages, 8 L/min, entraînement vilebrequin)", ref: "DE-F4L912-013", panne: "Pan. 1.1.3.A" },
      { id: "014", desc: "Carter inférieur (fonte, 8 L capacité, joint liège)", ref: "DE-F4L912-014", panne: "Pan. 1.1.3.A" },
      { id: "015", desc: "Pompe injection Bosch (rotative, 4 cylindres, 700 bar max)", ref: "DE-F4L912-015", panne: "Pan. 1.1.4.A" },
      { id: "016", desc: "Injecteur mécanique (4 pièces, Bosch, trou 0,22 mm, pression 180 bar)", ref: "DE-F4L912-016", panne: "Pan. 1.1.4.B" },
      { id: "017", desc: "Tuyau haute pression injection (4 pièces, acier Ø 6 mm, 700 bar)", ref: "DE-F4L912-017", panne: "Pan. 1.1.4.B" },
      { id: "018", desc: "Filtre gasoil (bain d'huile + maille, 25 µ)", ref: "DE-F4L912-018", panne: "Pan. 1.1.4.C" },
      { id: "019", desc: "Filtre air (bain d'huile + maille métallique, Ø 180×250 mm)", ref: "DE-F4L912-019", panne: "Pan. 1.1.5.A" },
      { id: "020", desc: "Ventilateur refroidissement (4 pales, entraînement courroie, Ø 350 mm)", ref: "DE-F4L912-020", panne: "Pan. 1.1.6.A" }
    ]
  },
  {
    id: "sch-1.2",
    title: "1.2 — TRANSMISSION FUNK DF80",
    items: [
      { id: "101", desc: "Carter transmission Funk DF80 (fonte, 12 L huile)", ref: "FU-DF80-101", panne: "Pan. 2.1.1.A" },
      { id: "102", desc: "Arbre principal (acier, 3 paliers)", ref: "FU-DF80-102", panne: "Pan. 2.1.1.A" },
      { id: "103", desc: "Embrayage principal (disques secs, 8 disques, Ø 160 mm)", ref: "FU-DF80-103", panne: "Pan. 2.1.2.A" },
      { id: "104", desc: "Pignon 1ère (20 dents, module 2,5)", ref: "FU-DF80-104", panne: "Pan. 2.1.3.A" },
      { id: "105", desc: "Pignon 2ème (26 dents, module 2,5)", ref: "FU-DF80-105", panne: "Pan. 2.1.3.A" },
      { id: "106", desc: "Pignon 3ème (32 dents, module 2,5)", ref: "FU-DF80-106", panne: "Pan. 2.1.3.A" },
      { id: "107", desc: "Pignon 4ème (38 dents, module 2,5)", ref: "FU-DF80-107", panne: "Pan. 2.1.3.A" },
      { id: "108", desc: "Fourchette sélecteur (fonte, synchro à crabots)", ref: "FU-DF80-108", panne: "Pan. 2.1.3.A" },
      { id: "109", desc: "Levier commande (acier, longueur 400 mm)", ref: "FU-DF80-109", panne: "Pan. 2.1.4.A" },
      { id: "110", desc: "Cardan avant (tube Ø 50 mm, 2 croisillons)", ref: "FU-DF80-110", panne: "Pan. 2.2.1.A" },
      { id: "111", desc: "Cardan arrière (tube Ø 50 mm, 2 croisillons)", ref: "FU-DF80-111", panne: "Pan. 2.2.1.A" },
      { id: "112", desc: "Essieu avant rigide (fonte, 6 tonnes)", ref: "FU-DF80-112", panne: "Pan. 2.2.2.A" },
      { id: "113", desc: "Essieu arrière rigide (fonte, 6 tonnes)", ref: "FU-DF80-113", panne: "Pan. 2.2.2.A" },
      { id: "114", desc: "Chaîne transmission (maillons 32 mm, acier)", ref: "FU-DF80-114", panne: "Pan. 2.3.1.A" },
      { id: "115", desc: "Pignon chaîne (14 dents, acier cémenté)", ref: "FU-DF80-115", panne: "Pan. 2.3.1.A" }
    ]
  },
  {
    id: "sch-1.3",
    title: "1.3 — HYDRAULIQUE OPEN-CENTER BASIQUE",
    items: [
      { id: "201", desc: "Pompe engrenages fixe (40 L/min, 160 bar)", ref: "HY-ST2D-201", panne: "Pan. 3.1.1.A" },
      { id: "202", desc: "Moteur orbital direction (125 cc/r, 160 bar)", ref: "HY-ST2D-202", panne: "Pan. 3.1.1.A" },
      { id: "203", desc: "Distributeur levier 4 voies (160 bar, mécanique)", ref: "HY-ST2D-203", panne: "Pan. 3.1.2.A" },
      { id: "204", desc: "Vérin direction (Ø 50 mm, tige 28 mm, course 250 mm)", ref: "HY-ST2D-204", panne: "Pan. 3.2.1.A" },
      { id: "205", desc: "Vérin hoist (Ø 80 mm, tige 45 mm, course 450 mm)", ref: "HY-ST2D-205", panne: "Pan. 3.3.1.A" },
      { id: "206", desc: "Vérin dump (Ø 80 mm, tige 45 mm, course 350 mm)", ref: "HY-ST2D-206", panne: "Pan. 3.3.2.A" },
      { id: "207", desc: "Réservoir hydraulique (acier, 50 L)", ref: "HY-ST2D-207", panne: "Pan. 3.1.3.A" },
      { id: "208", desc: "Filtre aspiration (maille 100 µ, inox)", ref: "HY-ST2D-208", panne: "Pan. 3.1.3.B" },
      { id: "209", desc: "Filtre return (maille 40 µ, indicateur visuel)", ref: "HY-ST2D-209", panne: "Pan. 3.1.3.C" },
      { id: "210", desc: "Flexible basse pression (1 tresse, 160 bar, Ø 10 mm)", ref: "HY-ST2D-210", panne: "Pan. 3.1.4.A" },
      { id: "211", desc: "Raccord hydraulique simple (fileté, 160 bar)", ref: "HY-ST2D-211", panne: "Pan. 3.1.4.B" },
      { id: "212", desc: "Manomètre pression (0-250 bar, cadran)", ref: "HY-ST2D-212", panne: "Pan. 3.1.5.A" },
      { id: "213", desc: "Niveau huile (jauge transparente)", ref: "HY-ST2D-213", panne: "Pan. 3.1.5.B" },
      { id: "214", desc: "Joint torique caoutchouc (jeu assorti)", ref: "HY-ST2D-214", panne: "Pan. 3.1.6.A" },
      { id: "215", desc: "Graisse hydraulique (cartouche 400 g, lithium)", ref: "HY-ST2D-215", panne: "Pan. 3.1.6.B" }
    ]
  },
  {
    id: "sch-1.4",
    title: "1.4 — FREINAGE TAMBOUR MÉCANIQUE",
    items: [
      { id: "301", desc: "Tambour frein avant (fonte, Ø 300 mm, largeur 60 mm)", ref: "FR-TAM-301", panne: "Pan. 4.1.1.A" },
      { id: "302", desc: "Tambour frein arrière (fonte, Ø 300 mm, largeur 60 mm)", ref: "FR-TAM-302", panne: "Pan. 4.1.1.A" },
      { id: "303", desc: "Mâchoire frein avant (2 pièces, garniture organique, épaisseur 8 mm)", ref: "FR-TAM-303", panne: "Pan. 4.1.1.A" },
      { id: "304", desc: "Mâchoire frein arrière (2 pièces, garniture organique, épaisseur 8 mm)", ref: "FR-TAM-304", panne: "Pan. 4.1.1.A" },
      { id: "305", desc: "Ressort rappel mâchoires (4 ressorts, 50 N)", ref: "FR-TAM-305", panne: "Pan. 4.1.2.A" },
      { id: "306", desc: "Cylindre répartiteur (Ø 20 mm, course 25 mm)", ref: "FR-TAM-306", panne: "Pan. 4.1.2.A" },
      { id: "307", desc: "Câble frein (acier Ø 4 mm, gaine plastique, longueur 3000 mm)", ref: "FR-TAM-307", panne: "Pan. 4.2.1.A" },
      { id: "308", desc: "Pédale frein (acier, levier 150 mm, course 40 mm)", ref: "FR-TAM-308", panne: "Pan. 4.2.1.A" },
      { id: "309", desc: "Levier frein de parking (cabine, acier, course 100 mm)", ref: "FR-TAM-309", panne: "Pan. 4.3.1.A" },
      { id: "310", desc: "Tendeur câble (écrou M10, réglage jeu 2-3 mm)", ref: "FR-TAM-310", panne: "Pan. 4.3.1.A" },
      { id: "311", desc: "Indicateur usure (témoin métallique sur mâchoire)", ref: "FR-TAM-311", panne: "Pan. 4.1.3.A" },
      { id: "312", desc: "Graisse frein (haute température, cartouche 200 g)", ref: "FR-TAM-312", panne: "Pan. 4.1.4.A" }
    ]
  }
];

// ==========================================
// CHAPITRE 2 : PHOTOS & LÉGENDES (10 procédures)
// ==========================================
export const ST2D_PHOTOS_PROCEDURES = [
  {
    ref: "4.1.1.A",
    title: "Remplacement mâchoires frein tambour",
    steps: [
      { type: "CASSÉ", title: "Tambour déposé", desc: "Inspection des garnitures organiques usées à moins de 2 mm de la mâchoire." },
      { type: "OUTIL", title: "Pince à ressort", desc: "Décrochage sécurisé du ressort de rappel de mâchoire (50 N)." },
      { type: "RÉSULTAT", title: "Mâchoires neuves posées", desc: "Nouvelle garniture organique de 8 mm parfaitement alignée." },
      { type: "MAUVAIS", title: "Inversion ressorts", desc: "ATTENTION : Un mauvais montage du ressort frotte contre le câble." }
    ]
  },
  {
    ref: "4.1.2.A",
    title: "Réglage câble frein",
    steps: [
      { type: "CASSÉ", title: "Câble détendu", desc: "Jeu excessif mesuré sur la tringlerie de commande centrale (> 5 mm)." },
      { type: "OUTIL", title: "Cales & Clé double", desc: "Utilisation du jeu d'épaisseur pour régler le tirant fileté d'écrou M10." },
      { type: "RÉSULTAT", title: "Jeu nominal rétabli", desc: "Jeu d'appui de 2.5 mm à la came d'expansion d'étriers." },
      { type: "MAUVAIS", title: "Serrage asymétrique", desc: "La came reste engagée à chaud, provoquant un glaçage immédiat." }
    ]
  },
  {
    ref: "4.3.1.A",
    title: "Remplacement câble frein de parking",
    steps: [
      { type: "CASSÉ", title: "Brins rompus", desc: "Câble de parking effiloché au passage du châssis articulé léger." },
      { type: "OUTIL", title: "Extracteur de gaine", desc: "Dégagement du câble Ø 4 mm de sa gaine de protection en acier spirale." },
      { type: "RÉSULTAT", title: "Câble neuf installé", desc: "Frein de parking rebranché avec graissage interne à base de lithium." },
      { type: "MAUVAIS", title: "Gaine pincée", desc: "La gaine fait un coude aigu sous le vérin, grippant le frein." }
    ]
  },
  {
    ref: "1.1.1.A",
    title: "Remplacement segments moteur Deutz air",
    steps: [
      { type: "CASSÉ", title: "Glaçage & Rayure", desc: "Piston d'aluminium présentant une calamine extrême et des segments soudés." },
      { type: "OUTIL", title: "Pince à segments", desc: "Pose méticuleuse du segment de feu et du racleur sur le piston Ø 100 mm." },
      { type: "RÉSULTAT", title: "Tierçage des segments", desc: "Orientation des coupes de segments à 120° avant emmanchement chemise." },
      { type: "MAUVAIS", title: "Coupes alignées", desc: "Alignement des coupes provoquant une chute totale de compression moteur." }
    ]
  },
  {
    ref: "1.1.4.B",
    title: "Remplacement injecteur mécanique Bosch",
    steps: [
      { type: "CASSÉ", title: "Nez d'injecteur calaminé", desc: "Aiguille bloquée en position fermée provoquant des ratés d'injection." },
      { type: "OUTIL", title: "Marteau à inertie", desc: "Extraction axiale de l'injecteur sans marquer l'alésage de culasse." },
      { type: "RÉSULTAT", title: "Pulvérisation testée", desc: "Jet symétrique homogène obtenu à la pompe à tarer (180 bar)." },
      { type: "MAUVAIS", title: "Joint cuivre manquant", desc: "Absence de joint de base cuivre créant une fuite de compression." }
    ]
  },
  {
    ref: "1.1.5.A",
    title: "Nettoyage filtre air bain d'huile",
    steps: [
      { type: "CASSÉ", title: "Boues saturées", desc: "La coupelle inférieure contient plus de 3 cm de boue siliceuse solide." },
      { type: "OUTIL", title: "Bassin de rinçage", desc: "Nettoyage de la maille métallique tricotée au gazole propre sous pression." },
      { type: "RÉSULTAT", title: "Niveau d'huile ajusté", desc: "Remplissage de la coupelle d'huile neuve (15W-40) jusqu'au trait rouge." },
      { type: "MAUVAIS", title: "Surremplissage d'huile", desc: "Huile aspirée par le moteur provoquant un emballement destructif." }
    ]
  },
  {
    ref: "2.1.2.A",
    title: "Remplacement disques embrayage transmission",
    steps: [
      { type: "CASSÉ", title: "Disques brûlés", desc: "Garnitures d'embrayage Funk DF80 carbonisées, patinage sous couple." },
      { type: "OUTIL", title: "Compresseur de plateau", desc: "Compression du ressort diaphragme de pression d'embrayage mécanique." },
      { type: "RÉSULTAT", title: "Pile de disques neufs", desc: "Alternance parfaite disques de friction et disques d'acier plats." },
      { type: "MAUVAIS", title: "Omission cales", desc: "Garde à la pédale nulle, entraînant une usure accélérée de la butée." }
    ]
  },
  {
    ref: "2.1.4.A",
    title: "Réglage levier commande transmission",
    steps: [
      { type: "CASSÉ", title: "Flou au levier", desc: "Rotules de commande usées empêchant le verrouillage de la 3ème vitesse." },
      { type: "OUTIL", title: "Pige d'alignement", desc: "Ajustement des biellettes filetées de tringlerie au neutre d'arbre." },
      { type: "RÉSULTAT", title: "Passage verrouillé", desc: "Enclenchement franc de chaque rapport avec garde de sécurité de 2 mm." },
      { type: "MAUVAIS", title: "Rotule desserrée", desc: "La biellette se désolidarise en marche, bloquant le loader en vitesse." }
    ]
  },
  {
    ref: "3.1.1.A",
    title: "Remplacement pompe hydraulique engrenages",
    steps: [
      { type: "CASSÉ", title: "Corps de pompe rayé", desc: "Passage de particules métalliques ayant détruit les paliers d'engrenage." },
      { type: "OUTIL", title: "Débitmètre analogique", desc: "Mesure de restriction de débit (nominal 40 L/min à chaud)." },
      { type: "RÉSULTAT", title: "Pompe neuve accouplée", desc: "Pompe à engrenages fixe montée avec joints toriques neufs graissés." },
      { type: "MAUVAIS", title: "Accouplement à sec", desc: "Arbre cannelé forcé au marteau ayant fissuré le carter de pompe." }
    ]
  },
  {
    ref: "3.3.1.A",
    title: "Remplacement vérin hoist 80mm",
    steps: [
      { type: "CASSÉ", title: "Tige tordue", desc: "Flambement de la tige Ø 45 mm suite à un choc de déversement roche." },
      { type: "OUTIL", title: "Clé à ergots géante", desc: "Dévissage du nez de vérin fileté pour extraction du piston étanche." },
      { type: "RÉSULTAT", title: "Vérin remonté étanche", desc: "Changement de la pochette de joints polyuréthane et purge d'air complète." },
      { type: "MAUVAIS", title: "Joint à lèvre inversé", desc: "Fuite d'huile externe massive sous charge lors de la première levée." }
    ]
  }
];

// ==========================================
// CHAPITRE 3 : STORYBOARDS DE TOURNAGE
// ==========================================
export const ST2D_STORYBOARDS: StoryboardItem[] = [
  {
    id: "3.1",
    title: "Vidéo 4.1.1.A : Remplacement mâchoires frein tambour (30s)",
    duration: "30s",
    framing: "Plan moyen poitrine, caméra fixée sur trépied à 45° du moyeu du ST2D.",
    audio: "VO : 'Démontez le tambour de frein de 300 mm. Décrochez délicatement le ressort de rappel de mâchoire avec la pince dédiée. Posez les mâchoires de 8 mm neuves.'",
    overlay: "Overlay texte : 'ATTENTION : Nettoyez toute trace de gras sur les garnitures organiques neuves !'",
    specs: "Résolution 1080p, 60fps, éclairage d'atelier mine blanc d'au moins 800 lux requis."
  },
  {
    id: "3.2",
    title: "Vidéo 4.1.2.A : Réglage câble frein (25s)",
    duration: "25s",
    framing: "Plan serré de dessous de châssis, éclairage par baladeuse LED puissante.",
    audio: "VO : 'Ajustez le tirant de câble central pour obtenir un jeu de garde de 2 à 3 mm sous la pédale mécanique. Bloquez le contre-écrou M10.'",
    overlay: "Overlay graphique de couple : 'Serrage contre-écrou d'arrêt à 25 Nm.'",
    specs: "Éclairage focalisé de 1000 lux sur la tringlerie de freinage."
  },
  {
    id: "3.3",
    title: "Vidéo 1.1.1.A : Remplacement segments moteur Deutz air (35s)",
    duration: "35s",
    framing: "Caméra plongeante verticale au-dessus de la table d'ajustage moteur.",
    audio: "VO : 'Utilisez la sangle de segments pour guider le piston Ø 100 mm dans la chemise à ailettes. Vérifiez le tierçage des ouvertures à 120 degrés.'",
    overlay: "Schéma d'orientation : 'Cercle de tierçage à 120° clignotant en orange.'",
    specs: "Prises de vues macro sur le jeu à la coupe des segments au comparateur d'alésage."
  },
  {
    id: "3.4",
    title: "Vidéo 1.1.4.B : Remplacement injecteur mécanique Bosch (30s)",
    duration: "30s",
    framing: "Plan serré de face sur la culasse de cylindre du moteur Deutz F4L912.",
    audio: "VO : 'Insérez le marteau à inertie sur le corps de l'injecteur PFR. Tirez d'un coup sec pour l'extraire. Placez une rondelle pare-feu neuve.'",
    overlay: "Indication visuelle : 'Rondelle pare-feu en cuivre clignotant en vert.'",
    specs: "Prise de vue rapprochée montrant la portée de joint parfaitement nettoyée."
  },
  {
    id: "3.5",
    title: "Vidéo 2.1.2.A : Remplacement disques embrayage transmission (30s)",
    duration: "30s",
    framing: "Plan large de l'établi lourd, puis plan moyen sur l'empilage disques.",
    audio: "VO : 'Alignez la cannelure du moyeu d'embrayage sec Funk DF80. Posez alternativement les disques d'acier et les frictions neuves.'",
    overlay: "Overlay texte : 'Épaisseur nominale disque : 2.2 mm. Ne pas graisser !'",
    specs: "Mesure au micromètre digital montrée en gros plan à l'écran."
  },
  {
    id: "3.6",
    title: "Vidéo 3.1.1.A : Remplacement pompe hydraulique (25s)",
    duration: "25s",
    framing: "Plan moyen à hauteur d'homme à l'intérieur du compartiment hydraulique du ST2D.",
    audio: "VO : 'Vissez les brides de la pompe à engrenages fixe. Changez les joints toriques d'aspiration et de refoulement en caoutchouc nitrile.'",
    overlay: "Fiche technique : 'Pression de service max 160 bar.'",
    specs: "Contrôle des filetages de brides en plan rapproché macro."
  },
  {
    id: "3.7",
    title: "Vidéo 3.3.1.A : Remplacement vérin hoist 80mm (25s)",
    duration: "25s",
    framing: "Plan large montrant la potence de levage soutenant le bras hoist du loader.",
    audio: "VO : 'Sécurisez le bras hoist avec les cales en acier réglementaires. Retirez l'axe d'articulation de 50 mm, puis déposez le vérin.'",
    overlay: "Logo sécurité : 'CONSIGNATION LOTO OBLIGATOIRE.'",
    specs: "Indicateur de niveau d'huile du réservoir visible à l'arrière-plan."
  },
  {
    id: "3.8",
    title: "Vidéo 1.1.5.A : Nettoyage filtre air bain d'huile (20s)",
    duration: "20s",
    framing: "Plan moyen poitrine au-dessus du bac de décantation à l'atelier mine.",
    audio: "VO : 'Videz le bol inférieur du filtre à air de ses boues d'aspiration. Rincez le treillis métallique et remettez de l'huile de moteur 15W-40 propre.'",
    overlay: "Repère visuel : 'Ligne de niveau maximal en orange clignotant.'",
    specs: "Contrôle de viscosité de l'huile moteur de remplacement montrée au thermomètre."
  }
];

// ==========================================
// CHAPITRE 5 : COTES ET TOLÉRANCES (15 tableaux)
// ==========================================
export const ST2D_COTES_TOLERANCES: ToleranceTable[] = [
  // SECTION A - MOTEUR DEUTZ F4L912 (3 tableaux)
  {
    id: "tab-5.1",
    ref: "1.1.1.A",
    title: "M-A1 — JEUX THERMOMÉCANIQUES DEUTZ F4L912W",
    prep: "Arrêt moteur depuis 2 heures, température de culasse à froid (< 40°C), outillage calibré.",
    pos: "Déposer le cache-culbuteurs en tôle, amener le piston du cylindre ciblé au Point Mort Haut (PMH) de compression.",
    mesure: "Glisser la lame du jeu de cales entre la queue de soupape et le patin du culbuteur.",
    reg: "Consigner les cotes relevées sur la fiche atelier ST2D-MOTEUR-A.",
    dec: "Si le jeu mesuré est inférieur au jeu minimum ou supérieur au jeu maximum admis : recalibrer ou remplacer le poussoir.",
    rows: [
      { id: "001", param: "Jeu aux soupapes d'admission (à froid)", nominal: "0.15", minVal: "0.12", maxVal: "0.18", unit: "mm", tool: "Jeu de cales d'épaisseur plates", gmao: "Pan. 1.1.1.A" },
      { id: "002", param: "Jeu aux soupapes d'échappement (à froid)", nominal: "0.30", minVal: "0.27", maxVal: "0.33", unit: "mm", tool: "Jeu de cales d'épaisseur plates", gmao: "Pan. 1.1.1.A" },
      { id: "003", param: "Jeu de battement axial vilebrequin", nominal: "0.18", minVal: "0.10", maxVal: "0.30", unit: "mm", tool: "Comparateur magnétique", gmao: "Pan. 1.1.5.A" }
    ]
  },
  {
    id: "tab-5.2",
    ref: "1.1.1.B",
    title: "M-A2 — ALÉSAGE ET JEU DE SEGMENTS DE CYLINDRES",
    prep: "Moteur entièrement déposé de l'engin, fûts dégraissés à la vapeur dégraissante.",
    pos: "Placer le segment de feu à plat dans le cylindre à 40 mm du plan de joint supérieur.",
    mesure: "Insérer le jeu de cales d'épaisseur entre les deux extrémités du segment.",
    reg: "Inscrire les jeux à la coupe sur le schéma de métrologie ST2D-MOTEUR-B.",
    dec: "Si le jeu à la coupe dépasse 0.50 mm : remplacer impérativement le jeu de segments.",
    rows: [
      { id: "004", param: "Jeu à la coupe du segment de feu (neuf)", nominal: "0.30", minVal: "0.25", maxVal: "0.40", unit: "mm", tool: "Jeu de cales de précision", gmao: "Pan. 1.1.1.A" },
      { id: "005", param: "Jeu à la coupe du segment d'étanchéité", nominal: "0.30", minVal: "0.25", maxVal: "0.45", unit: "mm", tool: "Jeu de cales de précision", gmao: "Pan. 1.1.1.A" },
      { id: "006", param: "Ovalisation maximale autorisée du cylindre", nominal: "0.01", minVal: "0.00", maxVal: "0.03", unit: "mm", tool: "Comparateur d'alésage micrométrique", gmao: "Pan. 1.1.1.B" }
    ]
  },
  {
    id: "tab-5.3",
    ref: "1.1.4.A",
    title: "M-A3 — SYSTÈME D'INJECTION MÉCANIQUE BOSCH PFR",
    prep: "Déposer l'injecteur mécanique et débrancher la canalisation métallique haute pression.",
    pos: "Raccorder l'injecteur sur l'appareil de tarage manuel d'atelier.",
    mesure: "Pomper lentement jusqu'à déclenchement de l'aiguille de pulvérisation.",
    reg: "Inscrire la pression de tarage mesurée sur le certificat d'injecteur.",
    dec: "Si le tarage est inférieur à 170 bar : rajouter une cale de réglage sous le ressort interne de l'injecteur Bosch.",
    rows: [
      { id: "007", param: "Pression d'ouverture d'injecteur Bosch PFR", nominal: "180", minVal: "170", maxVal: "190", unit: "bar", tool: "Pompe de tarage d'atelier", gmao: "Pan. 1.1.4.B" },
      { id: "008", param: "Course de levée de l'aiguille d'injecteur", nominal: "0.20", minVal: "0.18", maxVal: "0.22", unit: "mm", tool: "Comparateur de précision vertical", gmao: "Pan. 1.1.4.B" },
      { id: "009", param: "Défaut d'étanchéité nez d'injecteur (à 160 bar)", nominal: "0", minVal: "0", maxVal: "0", unit: "goutte/min", tool: "Observation visuelle", gmao: "Pan. 1.1.4.B" }
    ]
  },

  // SECTION B - TRANSMISSION FUNK DF80 (3 tableaux)
  {
    id: "tab-5.4",
    ref: "2.1.1.A",
    title: "T-B1 — AJUSTAGE DE L'EMBRAYAGE SEC FUNK DF80",
    prep: "Machine sur béquilles de sécurité, boîte de vitesses vidangée de son huile de lubrification.",
    pos: "Démonter la cloche d'embrayage mécanique en cabine.",
    mesure: "Mesurer l'épaisseur du disque de friction garni à l'aide d'un pied à coulisse digital.",
    reg: "Noter la valeur sur le rapport technique d'embrayage.",
    dec: "Si l'épaisseur du disque de friction est inférieure à 1.5 mm : remplacer le disque d'embrayage sec immédiatement.",
    rows: [
      { id: "101", param: "Épaisseur nominale du disque de friction neuf", nominal: "2.20", minVal: "2.00", maxVal: "2.30", unit: "mm", tool: "Pied à coulisse digital", gmao: "Pan. 2.1.2.A" },
      { id: "102", param: "Épaisseur minimale limite d'usure de friction", nominal: "1.50", minVal: "1.50", maxVal: "1.50", unit: "mm", tool: "Pied à coulisse digital", gmao: "Pan. 2.1.2.A" },
      { id: "103", param: "Course de la pédale mécanique d'embrayage", nominal: "40", minVal: "35", maxVal: "45", unit: "mm", tool: "Réglet métallique rectifié", gmao: "Pan. 2.1.4.A" }
    ]
  },
  {
    id: "tab-5.5",
    ref: "2.1.3.A",
    title: "T-B2 — ENGRENAGES ET SYNCHRONISEURS À CRABOTS",
    prep: "Ouvrir le capot supérieur de la boîte de transmission mécanique.",
    pos: "Engager le sélecteur à crabots sur le pignon de 2ème vitesse.",
    mesure: "Insérer un jeu de cales entre la fourchette de sélection en bronze et la gorge du baladeur.",
    reg: "Consigner le jeu de battement sur la fiche de boîte de vitesses.",
    dec: "Si le jeu latéral de la fourchette dépasse 0.50 mm : remplacer la fourchette en bronze usée.",
    rows: [
      { id: "104", param: "Jeu latéral fourchette / baladeur de vitesse", nominal: "0.15", minVal: "0.10", maxVal: "0.35", unit: "mm", tool: "Jeu de cales d'épaisseur", gmao: "Pan. 2.1.3.A" },
      { id: "105", param: "Jeu d'entre-dents des pignons de boîte", nominal: "0.12", minVal: "0.08", maxVal: "0.20", unit: "mm", tool: "Comparateur à palpeur", gmao: "Pan. 2.1.3.A" },
      { id: "106", param: "Défaut de parallélisme des arbres de boîte", nominal: "0.02", minVal: "0.00", maxVal: "0.05", unit: "mm", tool: "Comparateur de planéité", gmao: "Pan. 2.1.1.A" }
    ]
  },
  {
    id: "tab-5.6",
    ref: "2.3.1.A",
    title: "T-B3 — FLÈCHE ET USURE DES CHAÎNES D'ESSIEUX",
    prep: "Mettre l'engin en LOTO complet. Démonter la plaque d'accès latérale de carter de chaîne.",
    pos: "Prendre appui au centre de la portée de la chaîne de transmission latérale.",
    mesure: "Mesurer la flèche verticale en appliquant une force de poussée de 10 kg.",
    reg: "Inscrire la flèche de la chaîne droite et gauche sur la fiche de maintenance.",
    dec: "Si la flèche est supérieure à 18 mm : agir sur l'excentrique de tension mécanique de l'essieu.",
    rows: [
      { id: "107", param: "Flèche de chaîne d'essieu centrale (32 mm)", nominal: "15", minVal: "10", maxVal: "18", unit: "mm", tool: "Réglet gradué de tension", gmao: "Pan. 2.3.1.A" },
      { id: "108", param: "Allongement maximal de chaîne sur 10 maillons", nominal: "1.20", minVal: "0.00", maxVal: "2.00", unit: "%", tool: "Comparateur de longueur à réglet", gmao: "Pan. 2.3.1.A" },
      { id: "109", param: "Désalignement parallèle des pignons d'essieux", nominal: "0.50", minVal: "0.00", maxVal: "1.00", unit: "mm", tool: "Règle de parallélisme", gmao: "Pan. 2.3.1.A" }
    ]
  },

  // SECTION C - HYDRAULIQUE BASIQUE (3 tableaux)
  {
    id: "tab-5.7",
    ref: "3.1.1.A",
    title: "H-C1 — DÉBIT ET PRESSION POMPE À ENGRENAGES ST2D",
    prep: "Chauffer l'huile hydraulique (ISO VG 32) à sa température d'utilisation (45°C à 50°C).",
    pos: "Brancher le débitmètre hydraulique d'atelier en dérivation sur la sortie de la pompe.",
    mesure: "Relever la pression d'ouverture de la soupape de décharge principale à plein régime.",
    reg: "Consigner la pression et le débit sur la fiche de circuits ST2D-HYD-C1.",
    dec: "Si la pression mesurée est inférieure à 150 bar : étalonner ou changer la cartouche de décharge.",
    rows: [
      { id: "201", param: "Pression d'ouverture de soupape de décharge", nominal: "160", minVal: "150", maxVal: "170", unit: "bar", tool: "Manomètre à glycérine 250 bar", gmao: "Pan. 3.1.1.A" },
      { id: "202", param: "Débit nominal de la pompe à engrenages (2200 RPM)", nominal: "40", minVal: "36", maxVal: "44", unit: "L/min", tool: "Débitmètre à turbine analogique", gmao: "Pan. 3.1.1.A" },
      { id: "203", param: "Jeu fonctionnel radial interne d'engrenage", nominal: "0.04", minVal: "0.02", maxVal: "0.06", unit: "mm", tool: "Micromètre de précision d'arbre", gmao: "Pan. 3.1.1.A" }
    ]
  },
  {
    id: "tab-5.8",
    ref: "3.2.1.A",
    title: "H-C2 — DIMENSIONS ET USURE DES VÉRINS BRAS & GODET",
    prep: "Bras (hoist) et godet (dump) posés à plat, vérins entièrement rétractés et isolés.",
    pos: "Mesurer le diamètre de la tige métallique chromée à mi-course du vérin hoist.",
    mesure: "Contrôler le parallélisme et la rectitude de la tige à l'aide d'une règle rectifiée.",
    reg: "Consigner le relevé géométrique sur la fiche ST2D-VÉRINS.",
    dec: "Si la déformation de la tige du vérin dépasse 0.50 mm : remplacer la tige tordue.",
    rows: [
      { id: "204", param: "Diamètre tige vérin de levage (hoist)", nominal: "45.00", minVal: "44.95", maxVal: "45.00", unit: "mm", tool: "Micromètre à friction externe", gmao: "Pan. 3.3.1.A" },
      { id: "205", param: "Course utile totale du vérin hoist", nominal: "450", minVal: "448", maxVal: "452", unit: "mm", tool: "Réglet de précision", gmao: "Pan. 3.3.1.A" },
      { id: "206", param: "Défaut d'alignement ou flèche de tige de vérin", nominal: "0.00", minVal: "0.00", maxVal: "0.50", unit: "mm", tool: "Règle rectifiée + cales", gmao: "Pan. 3.3.1.A" }
    ]
  },
  {
    id: "tab-5.9",
    ref: "3.1.3.A",
    title: "H-C3 — ÉTANCHÉITÉ ET DÉRIVE DES CIRCUITS SOULEVÉS",
    prep: "Charger le godet de 2000 kg de roches, lever le bras à mi-hauteur d'articulation.",
    pos: "Verrouiller le levier de commande du distributeur hydraulique au neutre.",
    mesure: "Relever la dérive verticale du bras après 10 minutes d'arrêt moteur.",
    reg: "Enregistrer la distance de descente du vérin sur le rapport de sécurité mensuel.",
    dec: "Si la dérive verticale du bras dépasse 10 mm en 10 minutes : changer les joints internes du vérin.",
    rows: [
      { id: "207", param: "Dérive du vérin de levage chargé (10 min)", nominal: "5.0", minVal: "0.0", maxVal: "10.0", unit: "mm", tool: "Pied à coulisse vertical", gmao: "Pan. 3.3.1.A" },
      { id: "208", param: "Pression résiduelle au neutre du distributeur", nominal: "0.0", minVal: "0.0", maxVal: "2.0", unit: "bar", tool: "Manomètre de test Minimess", gmao: "Pan. 3.1.2.A" },
      { id: "209", param: "Température maximale de l'huile en service continu", nominal: "55", minVal: "35", maxVal: "65", unit: "°C", tool: "Thermomètre infrarouge", gmao: "Pan. 3.1.3.A" }
    ]
  },

  // SECTION D - FREINAGE TAMBOUR MÉCANIQUE (3 tableaux)
  {
    id: "tab-5.10",
    ref: "4.1.1.A",
    title: "F-D1 — USURE ET DIMENSIONS DU TAMBOUR DE FREIN",
    prep: "Mettre la machine sur chandelles stables, déposer les roues avant et les tambours.",
    pos: "Prendre 3 mesures perpendiculaires de l'alésage intérieur de friction du tambour.",
    mesure: "Mesurer le diamètre intérieur du tambour Ø 300 mm à l'aide d'un micromètre d'intérieur.",
    reg: "Inscrire les cotes de diamètre intérieur sur le rapport de freinage ST2D-FREIN-D1.",
    dec: "Si le diamètre intérieur du tambour dépasse 302 mm : remplacer le tambour immédiatement.",
    rows: [
      { id: "301", param: "Diamètre intérieur nominal du tambour de frein", nominal: "300.0", minVal: "300.0", maxVal: "302.0", unit: "mm", tool: "Micromètre d'intérieur", gmao: "Pan. 4.1.1.A" },
      { id: "302", param: "Ovalisation maximale autorisée du tambour", nominal: "0.10", minVal: "0.00", maxVal: "0.30", unit: "mm", tool: "Comparateur d'alésage à aiguille", gmao: "Pan. 4.1.1.A" },
      { id: "303", param: "Défaut d'état de surface de friction (stries)", nominal: "0.00", minVal: "0.00", maxVal: "0.50", unit: "mm", tool: "Jauge de profondeur micrométrique", gmao: "Pan. 4.1.1.A" }
    ]
  },
  {
    id: "tab-5.11",
    ref: "4.1.1.A",
    title: "F-D2 — ÉPAISSEUR DES GARNITURES DE MÂCHOIRES",
    prep: "Déposer le tambour et dépoussiérer les garnitures au nettoyeur de frein à sec.",
    pos: "Prendre l'épaisseur de la garniture organique en 4 points de mesure.",
    mesure: "Vérifier la distance restante entre la tête de rivet métallique et la surface de friction.",
    reg: "Noter l'épaisseur minimale de la garniture sur la fiche de contrôle.",
    dec: "Si l'épaisseur de garniture organique est inférieure à 2.0 mm : changer le jeu de mâchoires.",
    rows: [
      { id: "304", param: "Épaisseur de la garniture de mâchoire neuve", nominal: "8.0", minVal: "7.5", maxVal: "8.5", unit: "mm", tool: "Pied à coulisse digital d'atelier", gmao: "Pan. 4.1.1.A" },
      { id: "305", param: "Épaisseur minimale d'usure limite de garniture", nominal: "2.0", minVal: "2.0", maxVal: "2.0", unit: "mm", tool: "Pied à coulisse digital d'atelier", gmao: "Pan. 4.1.1.A" },
      { id: "306", param: "Profondeur minimale de rivet de fixation", nominal: "1.5", minVal: "1.0", maxVal: "2.5", unit: "mm", tool: "Jauge de profondeur de pied à coulisse", gmao: "Pan. 4.1.1.A" }
    ]
  },
  {
    id: "tab-5.12",
    ref: "4.1.2.A",
    title: "F-D3 — REGLAGE DU CÂBLE ET DE LA SERRAGE DE COMMANDE",
    prep: "Placer l'engin sur une aire plane stabilisée avec cales de blocage de roues.",
    pos: "Mesurer la course de traction nécessaire pour engager le frein de stationnement.",
    mesure: "Déterminer l'écartement de garde de la butée métallique sous la pédale.",
    reg: "Enregistrer la course mécanique du câble sur la fiche ST2D-COMMANDE-FREIN.",
    dec: "Si la course de la pédale de frein dépasse 45 mm : resserrer le tendeur de câble fileté.",
    rows: [
      { id: "307", param: "Jeu d'entre-fer mâchoire / tambour (à l'arrêt)", nominal: "0.30", minVal: "0.20", maxVal: "0.40", unit: "mm", tool: "Jeu de cales d'épaisseur", gmao: "Pan. 4.1.2.A" },
      { id: "308", param: "Course utile d'étirement du câble de frein", nominal: "30", minVal: "25", maxVal: "35", unit: "mm", tool: "Réglet métallique gradué", gmao: "Pan. 4.2.1.A" },
      { id: "309", param: "Course totale du levier de frein de parking", nominal: "100", minVal: "80", maxVal: "120", unit: "mm", tool: "Réglet métallique gradué", gmao: "Pan. 4.3.1.A" }
    ]
  },

  // SECTION E - CHÂSSIS ST2D (2 tableaux)
  {
    id: "tab-5.13",
    ref: "2.2.2.A",
    title: "C-E1 — GÉOMÉTRIE DU CHÂSSIS ET ESSIEUX ST2D",
    prep: "Machine vide suspendue par béquilles d'atelier sur une dalle de béton plane.",
    pos: "Vérifier la hauteur des essieux avant et arrière par rapport à la base d'appui.",
    mesure: "Prendre l'entraxe horizontal entre le centre des moyeux de roues d'essieux.",
    reg: "Inscrire l'entraxe mesuré sur la fiche géométrique ST2D-CHASSIS-E1.",
    dec: "Si la dérive géométrique d'entraxe dépasse 5.0 mm : vérifier les vis de fixation d'essieux.",
    rows: [
      { id: "401", param: "Entraxe des essieux (empattement de roues)", nominal: "2400", minVal: "2395", maxVal: "2405", unit: "mm", tool: "Mètre ruban laser de précision", gmao: "Pan. 2.2.2.A" },
      { id: "402", param: "Garde au sol minimale sous le carter inférieur", nominal: "250", minVal: "245", maxVal: "260", unit: "mm", tool: "Réglet vertical rigide", gmao: "Pan. 2.2.2.A" },
      { id: "403", param: "Défaut d'alignement de l'axe de châssis central", nominal: "0.0", minVal: "0.0", maxVal: "2.0", unit: "mm", tool: "Cordeau de planéité laser", gmao: "Pan. 2.2.2.A" }
    ]
  },
  {
    id: "tab-5.14",
    ref: "2.2.2.A",
    title: "C-E2 — JEUX D'ARTICULATION DU CHÂSSIS OSCILLANT",
    prep: "Retirer la charge du godet, lever l'engin au-dessus du sol à l'atelier.",
    pos: "Placer l'indicateur à aiguille du comparateur magnétique sur la liaison pivot.",
    mesure: "Relever le jeu axial du pivot central à l'aide d'un levier métallique.",
    reg: "Enregistrer le jeu mécanique de liaison sur le document d'articulation.",
    dec: "Si le jeu vertical de pivot central dépasse 1.5 mm : changer la bague de friction en bronze.",
    rows: [
      { id: "404", param: "Jeu de battement vertical de l'articulation centrale", nominal: "0.20", minVal: "0.10", maxVal: "0.50", unit: "mm", tool: "Comparateur magnétique + levier", gmao: "Pan. 2.2.2.A" },
      { id: "405", param: "Jeu axial de pivotement de l'axe d'articulation", nominal: "0.30", minVal: "0.15", maxVal: "0.60", unit: "mm", tool: "Comparateur magnétique + levier", gmao: "Pan. 2.2.2.A" },
      { id: "406", param: "Épaisseur des cales de pivot d'ajustage latéral", nominal: "1.00", minVal: "0.50", maxVal: "2.50", unit: "mm", tool: "Pied à coulisse digital d'atelier", gmao: "Pan. 2.2.2.A" }
    ]
  },

  // SECTION F - GÉNÉRAL (1 tableau)
  {
    id: "tab-5.15",
    ref: "5.1.1.A",
    title: "G-F1 — CAPACITÉS ET VISCOSITÉS DE FLUIDES ST2D",
    prep: "Machine immobilisée de niveau, huiles stabilisées à température d'ambiance d'atelier (20°C).",
    pos: "Dévisser le bouchon de niveau pour effectuer le contrôle visuel.",
    mesure: "Relever la capacité totale de remplissage de fluide lors de la vidange d'entretien.",
    reg: "Noter les volumes changés sur la fiche d'entretien périodique.",
    dec: "Remplir d'huile propre uniquement avec le type exact prescrit par le constructeur.",
    rows: [
      { id: "501", param: "Capacité d'huile moteur (Deutz F4L912)", nominal: "8.0", minVal: "7.0", maxVal: "8.5", unit: "L", tool: "Viscosité SAE 30 (Hiver) / SAE 40 (Été)", gmao: "Pan. 1.1.5.C" },
      { id: "502", param: "Capacité d'huile de boîte Funk DF80", nominal: "12.0", minVal: "11.0", maxVal: "13.0", unit: "L", tool: "Viscosité SAE 80W-90", gmao: "Pan. 2.1.1.A" },
      { id: "503", param: "Capacité d'huile du réservoir hydraulique", nominal: "50.0", minVal: "45.0", maxVal: "52.0", unit: "L", tool: "Viscosité ISO VG 32 (Standard)", gmao: "Pan. 3.1.3.A" }
    ]
  }
];

// ==========================================
// CHAPITRE 6 : FICHES OUTILS (15 fiches)
// ==========================================
export const ST2D_OUTILS_FICHE: ToolFiche[] = [
  {
    id: "OUT-01",
    name: "Pige de calage vilebrequin Deutz F4L912",
    code: "EP-ST2D-PIG-01",
    rack: "Armoire Spécifique Deutz — Étagère A",
    desc: "Axe cylindrique de précision en acier rectifié Ø 10 mm destiné au pigeage du volant moteur au Point Mort Haut (PMH) de calage.",
    specs: "Matériau : Acier trempé et rectifié XC48, Longueur utile : 120 mm, Poignée de maintien moletonnée.",
    procedure: "Introduire la pige par l'orifice du carter de distribution jusqu'au blocage du vilebrequin pour l'ajustement de la pompe.",
    maintenance: [
      "Vérifier la rectitude sur un marbre de contrôle avant chaque calage.",
      "Nettoyer à l'aide d'un chiffon gras pour éviter toute corrosion de surface."
    ]
  },
  {
    id: "OUT-02",
    name: "Clé pour raccord injecteur Bosch",
    code: "EP-ST2D-CLE-02",
    rack: "Panneau Outils d'Injection — Emplacement 4",
    desc: "Clé à douille fendue spécifique de 17 mm permettant d'accéder directement au raccord haute pression M12 de l'injecteur sans contact culasse.",
    specs: "Profil : 12 pans fendu, Carré conducteur : 1/2\", Matériau : Chrome-Vanadium forgé haute résistance.",
    procedure: "Passer la douille sur la tuyauterie métallique de gazole et serrer le raccord M12 au couple de 30 Nm.",
    maintenance: [
      "Inspecter la fente d'ouverture pour déceler toute fissure sous contrainte.",
      "Nettoyer régulièrement au diluant de frein pour éliminer les résidus d'huile."
    ]
  },
  {
    id: "OUT-03",
    name: "Marteau à inertie extracteur d'injecteur",
    code: "EP-ST2D-EXT-03",
    rack: "Armoire Spécifique Deutz — Étagère B",
    desc: "Outil d'extraction à percussion axiale destiné à décoller les injecteurs mécaniques Bosch grippés dans leur puits de culasse.",
    specs: "Masse coulissante : 1.5 kg, Tige filetée : M14, Adaptateur d'injecteur : Filetage interne M12.",
    procedure: "Visser l'embout adaptateur sur le raccord d'arrivée de gazole de l'injecteur. Coulisser la masse pour frapper en butée supérieure.",
    maintenance: [
      "Lubrifier l'arbre coulissant avec de l'huile de vaseline fine toutes les 10 utilisations.",
      "Vérifier le filetage M12 d'adaptateur pour déceler toute usure de filets."
    ]
  },
  {
    id: "OUT-04",
    name: "Compresseur de segments à sangle (Ø 100 mm)",
    code: "EP-ST2D-SAN-04",
    rack: "Armoire Métrologie Moteur — Tiroir 2",
    desc: "Sangle métallique flexible à cliquet permettant de compresser uniformément les segments montés sur le piston Ø 100 mm avant insertion.",
    specs: "Capacité de serrage : Ø 90 à 110 mm, Hauteur de sangle : 80 mm, Mécanisme : Cliquet autobloquant.",
    procedure: "Serrer la sangle autour du piston pour encastrer les segments. Frapper doucement au manche de marteau en bois pour insérer le piston.",
    maintenance: [
      "Nettoyer le ruban d'acier flexible pour éliminer toute trace de calamine.",
      "Lubrifier périodiquement l'axe de cliquet avec de l'huile moteur propre."
    ]
  },
  {
    id: "OUT-05",
    name: "Jauge de tarage injecteur Bosch (pompe manuelle)",
    code: "EP-ST2D-POM-05",
    rack: "Banc de Test Injection — Station Centrale",
    desc: "Pompe hydraulique manuelle équipée d'un réservoir de gazole filtré et d'un manomètre gradué pour vérifier la pression d'injecteur.",
    specs: "Pression maximale : 400 bar, Précision manomètre : Classe 1.0, Capacité réservoir : 1.2 L.",
    procedure: "Raccorder l'injecteur sur la conduite de sortie. Actionner le levier manuellement pour relever la pression d'ouverture (180 bar).",
    maintenance: [
      "Vidanger et remplacer le fluide de test d'injection toutes les 100 heures d'utilisation.",
      "Étalonner le manomètre de précision auprès d'un laboratoire agréé une fois par an."
    ]
  },
  {
    id: "OUT-06",
    name: "Débitmètre hydraulique analogique (0-100 L/min)",
    code: "EP-ST2D-DEB-06",
    rack: "Boîtier Testeurs Hydrauliques d'Atelier",
    desc: "Débitmètre à turbine volumétrique équipé d'une vanne de charge réglable pour tester l'efficacité de la pompe hydraulique.",
    specs: "Gamme de débit : 10 à 100 L/min, Pression maximale : 250 bar, Raccords : M3/4\" JIC.",
    procedure: "Brancher l'appareil en ligne sur la ligne de refoulement de la pompe. Fermer progressivement la restriction pour simuler 150 bar.",
    maintenance: [
      "Rincer le capteur de turbine à l'huile fine après chaque test de circuit.",
      "Vérifier le joint torique interne de raccord pour éviter les micro-fuites."
    ]
  },
  {
    id: "OUT-07",
    name: "Clé dynamométrique 1/2\" (40-200 Nm)",
    code: "EP-ST2D-DYNA-07",
    rack: "Panneau Outils de Serrage — Station Haute",
    desc: "Clé de serrage dynamométrique à déclenchement sensitif et sonore pour le serrage des vis d'assemblage moyennes (vis d'étrier, carter).",
    specs: "Plage d'étalonnage : 40 à 200 Nm, Précision : +/- 3%, Longueur de poignée : 510 mm.",
    procedure: "Régler le vernier micrométrique à la valeur cible. Serrer de façon continue jusqu'au déclenchement physique de l'outil.",
    maintenance: [
      "Desserrer impérativement le vernier à sa position minimale après chaque journée de travail.",
      "Étalonner sur le banc d'essai dynamométrique tous les 500 déclenchements."
    ]
  },
  {
    id: "OUT-08",
    name: "Clé dynamométrique 3/4\" (150-800 Nm)",
    code: "EP-ST2D-DYNA-08",
    rack: "Panneau Outils de Serrage — Sol d'Atelier",
    desc: "Clé dynamométrique à cliquet réversible haute capacité destinée aux serrages lourds (écrous d'essieux, boulons de jantes M16).",
    specs: "Plage d'étalonnage : 150 à 800 Nm, Précision : +/- 4%, Poignée extensible en acier chromé.",
    procedure: "Régler le couple prescrit (exemple : 280 Nm pour les jantes de jantes). Appliquer l'effort à deux mains sans à-coup.",
    maintenance: [
      "Lubrifier l'engrenage à cliquet 3/4\" de la tête avec de la graisse graphitée de marque.",
      "Vérifier la dérive d'étalonnage tous les 6 mois d'utilisation intense mine."
    ]
  },
  {
    id: "OUT-09",
    name: "Cales micrométriques de réglage mâchoires",
    code: "EP-ST2D-CAL-09",
    rack: "Caisse Freinage Tambour — Tiroir Central",
    desc: "Jeu de piges d'épaisseur micrométriques d'acier trempé pour calibrer le jeu de mâchoires sous le tambour Ø 300 mm.",
    specs: "Épaisseurs incluses : 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50 mm. Précision : Classe T2.",
    procedure: "Insérer la cale de 0.30 mm par la lumière d'inspection du tambour pour mesurer l'entre-fer de la mâchoire de frein.",
    maintenance: [
      "Nettoyer les surfaces à l'alcool dénaturé pour enlever les particules de poussière.",
      "Remplacer toute cale tordue ou pliée faussant la mesure de calage."
    ]
  },
  {
    id: "OUT-10",
    name: "Pince pour ressort de rappel de mâchoires",
    code: "EP-ST2D-PIN-10",
    rack: "Caisse Freinage Tambour — Emplacement Pivot",
    desc: "Pince à mâchoires incurvées spécifiques pour la dépose et la pose sécurisée des ressorts de rappel de freins à tambour.",
    specs: "Longueur : 310 mm, Matériau : Acier trempé bruni, Poignées munies de gaine isolante antidérapante.",
    procedure: "Accrocher la pointe de la pince dans la boucle du ressort (50 N). Prendre levier sur l'axe pour étirer et dégager le ressort.",
    maintenance: [
      "Graisser légèrement l'axe de pivotement de la pince avec de la graisse de lithium.",
      "Inspecter les pointes de préhension pour déceler tout arrondi d'usure."
    ]
  },
  {
    id: "OUT-11",
    name: "Appareil de tension de câble de frein",
    code: "EP-ST2D-TEN-11",
    rack: "Établi Central Ajustage — Boîte Rouge",
    desc: "Tendeur mécanique portatif à vis micrométrique servant à étirer et maintenir le câble de commande lors de la fixation d'arrêt.",
    specs: "Force de traction maximale : 500 N, Corps : Aluminium moulé sous pression, Vis de tension : Filet trapézoïdal.",
    procedure: "Brider le câble de frein dans l'appareil. Tourner la poignée pour appliquer la tension nominale de 150 N avant de visser l'écrou M10.",
    maintenance: [
      "Vérifier l'absence de limaille dans le filetage de la vis trapézoïdale de traction.",
      "Nettoyer les mors de bridage pour garantir une friction de serrage maximale."
    ]
  },
  {
    id: "OUT-12",
    name: "Compresseur de ressort d'embrayage transmission",
    code: "EP-ST2D-PRE-12",
    rack: "Armoire Transmission Funk — Tiroir Unique",
    desc: "Presse d'atelier spécifique filetée permettant de compresser les ressorts diaphragmes de plateau d'embrayage Funk DF80.",
    specs: "Capacité maximale de compression : 2000 N, Diamètre de bride de maintien : 150 mm.",
    procedure: "Centrer le compresseur sur le mécanisme d'embrayage. Visser la tige centrale pour libérer le jonc d'arrêt d'embrayage.",
    maintenance: [
      "Enduire la tige filetée de graisse graphitée haute température à chaque remontage.",
      "Vérifier le disque d'appui pour s'assurer de l'absence de déformation de planéité."
    ]
  },
  {
    id: "OUT-13",
    name: "Jauge d'épaisseur d'usure garnitures",
    code: "EP-ST2D-JAU-13",
    rack: "Panneau Outils de Diagnostic — Tiroir A",
    desc: "Calibre étalonneur d'épaisseur de poche permettant de mesurer l'usure de la garniture organique des mâchoires sans dépose tambour.",
    specs: "Gabarits étalons d'épaisseur : 2.0, 3.0, 4.0, 6.0, 8.0 mm. Couleur de marquage constructeur.",
    procedure: "Introduire la jauge par la fenêtre de contrôle arrière du flasque de roue pour tester l'épaisseur de friction restée.",
    maintenance: [
      "Vérifier la lisibilité des gravures d'épaisseur laser sur chaque lame.",
      "Conserver dans son étui de protection d'origine pour éviter tout frottement abrasif."
    ]
  },
  {
    id: "OUT-14",
    name: "Jauge micrométrique d'usure de tambour (Ø 300 mm)",
    code: "EP-ST2D-JAU-14",
    rack: "Armoire Métrologie Moteur — Tiroir 3",
    desc: "Comparateur spécifique d'alésage muni de palpeurs prolongés pour relever le diamètre de la surface d'usure intérieure du tambour.",
    specs: "Plage de mesure : 290 à 310 mm, Résolution : 0.01 mm, Touches de palpeur en carbure de tungstène.",
    procedure: "Étalonner la jauge à 300.00 mm à la bague de réglage. Mesurer en 3 sections différentes pour détecter l'ovalisation.",
    maintenance: [
      "Nettoyer l'axe de palpage au solvant de précision sans résidu après usage.",
      "Vérifier la stabilité de tarage du cadran micrométrique tous les trimestres."
    ]
  },
  {
    id: "OUT-15",
    name: "Pompe de vidange manuelle pour bain d'huile",
    code: "EP-ST2D-POM-15",
    rack: "Zone Distribution Huiles — Bac de Rétention 2",
    desc: "Seringue mécanique d'aspiration métallique de 500 mL munie d'un flexible semi-rigide pour vider le réservoir du filtre à bain d'huile.",
    specs: "Capacité : 500 mL, Corps : Acier galvanisé, Joint de piston : Caoutchouc fluoré résistant aux solvants.",
    procedure: "Insérer le tube d'aspiration au fond de la coupelle d'huile sale. Tirer le piston pour aspirer les dépôts de boue.",
    maintenance: [
      "Rincer le corps cylindrique et le piston à l'aide de gazole propre après chaque usage.",
      "Inspecter le joint de piston en caoutchouc pour déceler tout durcissement mécanique."
    ]
  }
];
