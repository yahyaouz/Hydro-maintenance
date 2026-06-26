export interface GlossaryItem {
  term: string;
  french: string;
  desc: string;
}

export interface SchematicPiece {
  id: number;
  nameFr: string;
  nameEn: string;
  refMontabert: string;
  refAftermarket: string;
  interval: string;
  price: number;
}

export interface Panne {
  id: string; // e.g., "1.1"
  title: string;
  system: "AIR" | "PISTON" | "MANCHON" | "CORPS" | "GRAISSAGE" | "FIXATION" | "OUTILLAGE";
  severity: "ROUGE" | "ORANGE" | "VERT";
  diagTime: number; // minutes
  repTime: number; // hours
  partsCost: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  symptoms: string;
  visualCheck: string;
  soundCheck: string;
  causes: Array<{ cause: string; prob: number; remedy: string }>;
  diagnosticSteps: string[];
  partsInvolved: string;
  prevention: string;
  pitfall: string;
  costOfError: string;
  crossReferences?: string;
}

export interface QuickFix {
  symptom: string;
  action: string;
  time: string;
  fallback: string;
}

export const GLOSSARY_ITEMS: GlossaryItem[] = [
  { term: "Back Head", french: "Tête arrière", desc: "Carter arrière abritant le mécanisme de distribution d'air principal et la soupape." },
  { term: "Chuck Housing", french: "Manchon de guidage avant", desc: "Boîtier avant qui supporte l'outil de forage et encaisse les contraintes de rotation." },
  { term: "Bushing", french: "Bague de forage", desc: "Douille d'usure interne qui guide précisément l'adaptateur de queue de forage." },
  { term: "Retainer", french: "Porte-outil / Goupille de retenue", desc: "Axe amovible en acier haute résistance empêchant l'éjection accidentelle de l'outil." },
  { term: "Shank Adapter", french: "Queue de forage / Adaptateur d'outil", desc: "Pièce intermédiaire qui reçoit l'impact direct du piston et transmet le couple." },
  { term: "Power Cell", french: "Cellule de percussion", desc: "Cœur interne du perforateur comprenant le piston, le cylindre et la soupape." },
  { term: "Blank Firing", desc: "Coups à blanc", french: "Frappe à vide sans résistance rocheuse, destructrice pour les pièces internes." },
  { term: "Side Loading", french: "Charge latérale", desc: "Effort asymétrique appliqué sur l'outil qui provoque une usure excentrée en biseau." },
  { term: "Accumulateur", french: "Accumulateur d'air", desc: "Réservoir de régulation de pression tampon d'air sous haute pression (si équipé)." }
];

export const SCHEMATICS_PIECES = {
  A: [
    { id: 1, nameFr: "Corps de distribution", nameEn: "Distribution valve housing", refMontabert: "MT-345091", refAftermarket: "AM-90112", interval: "400h", price: 3700 },
    { id: 2, nameFr: "Soupape oscillante", nameEn: "Oscillating valve", refMontabert: "MT-345102", refAftermarket: "AM-90118", interval: "200h", price: 2000 },
    { id: 3, nameFr: "Raccord d'air principal", nameEn: "Main air connector", refMontabert: "MT-128912", refAftermarket: "AM-10492", interval: "1000h", price: 800 },
    { id: 4, nameFr: "Filtre tamis interne", nameEn: "Internal mesh strainer", refMontabert: "MT-098231", refAftermarket: "AM-22104", interval: "100h", price: 160 }
  ] as SchematicPiece[],
  B: [
    { id: 10, nameFr: "Piston de percussion", nameEn: "Striking piston", refMontabert: "MT-456011", refAftermarket: "AM-80411", interval: "400h", price: 9350 },
    { id: 11, nameFr: "Cylindre principal", nameEn: "Main cylinder jacket", refMontabert: "MT-456022", refAftermarket: "AM-80415", interval: "1000h", price: 15950 },
    { id: 12, nameFr: "Bague de guidage piston", nameEn: "Piston guide bushing", refMontabert: "MT-456035", refAftermarket: "AM-80422", interval: "200h", price: 2150 },
    { id: 13, nameFr: "Jeu de tirants de section", nameEn: "Side rods assembly", refMontabert: "MT-456040", refAftermarket: "AM-80430", interval: "400h", price: 1300 }
  ] as SchematicPiece[],
  C: [
    { id: 20, nameFr: "Bague d'usure chuck", nameEn: "Bushing spacer", refMontabert: "MT-567011", refAftermarket: "AM-70301", interval: "100h", price: 990 },
    { id: 21, nameFr: "Verrous de retenue d'outil", nameEn: "Retainer pins (pair)", refMontabert: "MT-567025", refAftermarket: "AM-70311", interval: "50h", price: 715 },
    { id: 22, nameFr: "Manchon cannelé (Chuck)", nameEn: "Chuck sleeve housing", refMontabert: "MT-567038", refAftermarket: "AM-70324", interval: "400h", price: 4600 },
    { id: 23, nameFr: "Joint à lèvre anti-poussière", nameEn: "Front dust scraper wiper", refMontabert: "MT-567049", refAftermarket: "AM-70335", interval: "50h", price: 130 }
  ] as SchematicPiece[]
};

export const QUICK_FIXES: QuickFix[] = [
  { symptom: "Fuite d'air massive au raccord rapide", action: "Resserrer le coupleur à l'aide de la clé plate de 41 et remplacer le joint plat déformé.", time: "2 min", fallback: "Changer le raccord rapide entier." },
  { symptom: "Le perforateur ne démarre pas du tout", action: "Frapper modérément sur la tête arrière avec un maillet en cuivre pour décoincer la soupape oscillante collée par de la vieille graisse.", time: "1 min", fallback: "Démonter la tête arrière et nettoyer la soupape au gasoil propre." },
  { symptom: "Baisse brutale de la cadence de frappe", action: "Vider le filtre-tamis à l'entrée d'air (souvent colmaté par de la rouille venant du flexible de chantier).", time: "3 min", fallback: "Vérifier la pression amont de la conduite." },
  { symptom: "Fumée blanche sortant de l'échappement", action: "Réduire le débit d'huile du graisseur atomiseur en fermant la vis de réglage de 1/2 tour.", time: "1 min", fallback: "Changer l'huile s'il y a présence de mousse (eau infiltrée)." },
  { symptom: "Surchauffe du nez du perforateur", action: "Ouvrir au maximum la vanne de soufflage/balayage d'eau pour refroidir l'outil.", time: "30 sec", fallback: "Vérifier le bon centrage et l'usure de la bague de forage (bushing)." },
  { symptom: "L'outil se bloque sans arrêt dans la roche", action: "Réduire la pression de poussée du berceau et forcer une purge rapide d'air en actionnant le levier de soufflage.", time: "1 min", fallback: "Changer d'outil pour un taillant mieux affûté." },
  { symptom: "Vibrations anormalement intenses au poignet", action: "Resserrer de manière croisée les écrous des deux tirants latéraux (couple de 120 Nm).", time: "4 min", fallback: "Inspecter si les amortisseurs en caoutchouc de la suspension sont déchirés." },
  { symptom: "Givre important obstruant l'échappement", action: "Arrêter l'engin, purger le purgeur de ligne amont du compresseur pour chasser l'eau condensée.", time: "3 min", fallback: "Installer un réchauffeur de ligne pneumatique." },
  { symptom: "Fuite d'huile noire par l'avant de la machine", action: "Vérifier si de la poussière n'a pas obstrué le trou de drainage du chuck. Nettoyer à la tige métallique.", time: "2 min", fallback: "Remplacer le joint à lèvre de nez." },
  { symptom: "Éjection inopinée du fleuret", action: "Vérifier si le verrou (retainer) est cassé ou simplement mal pivoté. Tourner le verrou à 90°.", time: "1 min", fallback: "Changer le jeu de retainers usés." },
  { symptom: "Pression d'air insuffisante (moins de 5 bar)", action: "Vérifier l'absence de pliure sur le flexible d'alimentation ou de fuite sur le réseau général.", time: "2 min", fallback: "Vérifier les réglages de pression du compresseur." },
  { symptom: "Arrivée d'eau faible ou nulle au taillant", action: "Nettoyer l'aiguille d'injection d'eau avec un fil d'acier pour déboucher l'orifice.", time: "3 min", fallback: "Remplacer l'aiguille d'eau tordue." },
  { symptom: "Bruit d'échappement sourd sans aucune percussion", action: "Injecter 5 cl d'huile fluide directement dans le flexible pour dégommer le piston coincé.", time: "2 min", fallback: "Démonter la chemise cylindre." },
  { symptom: "Jeu excessif du fleuret dans le nez du marteau", action: "Faire pivoter les verrous pour vérifier si la queue du fleuret est usée.", time: "1 min", fallback: "Mesurer et changer la douille de guidage." },
  { symptom: "Desserrage récurrent des raccords", action: "Appliquer de la bande d'étanchéité PTFE de haute résistance sur les filetages coniques.", time: "2 min", fallback: "Changer les raccords usés à filetages foirés." }
];

export const TORQUES_DATA = [
  { item: "Écrous de tirants latéraux", size: "M16 x 1.5", torque: "120 - 130 Nm", lock: "Contre-écrou + Rondelle d'appui rectifiée", check: "Toutes les 50h de frappe" },
  { item: "Bouchon de tête arrière (Back Head)", size: "G 1\" - 11", torque: "150 Nm", lock: "Joint torique d'étanchéité", check: "À chaque démontage" },
  { item: "Vis de fixation du berceau (cradle)", size: "M14 cl. 10.9", torque: "140 Nm", lock: "Frein filet de type fort (Loctite 270)", check: "Toutes les 100h" },
  { item: "Vis de la soupape de distribution", size: "M10 cl. 8.8", torque: "45 Nm", lock: "Rondelle élastique conique", check: "À chaque remplacement" },
  { item: "Raccord d'admission d'air", size: "G 3/4\"", torque: "90 Nm", lock: "Pâte d'étanchéité anaérobie", check: "Toutes les 200h" },
  { item: "Fixation des verrous de retainers", size: "M12", torque: "70 Nm", lock: "Goupille élastique de verrouillage", check: "Chaque début de poste" }
];

export const COMMON_ERRORS = [
  { title: "Inverser le sens des joints d'étanchéité", impact: "Coupure immédiate des lèvres lors de la mise en pression. Fuites internes massives empêchant la montée en cadence.", solution: "Toujours orienter la lèvre d'étanchéité principale face à la haute pression d'air." },
  { title: "Remontage du piston entièrement à sec", impact: "Démarrage ultra-abrasif au premier coup de frappe, rayures profondes sur le piston et bague de guidage.", solution: "Baigner le piston dans l'huile de forage propre avant de l'insérer dans le cylindre." },
  { title: "Oublier les rondelles d'appui sous la tête des tirants", impact: "Les écrous s'enfoncent directement dans le métal mou de la tête arrière, provoquant un désalignement et la casse des tirants.", solution: "Vérifier la présence de la rondelle rectifiée en acier traité sous chaque écrou." },
  { title: "Monter un seul verrou d'outil (retainer) au lieu de deux", impact: "Contraintes asymétriques intenses (side loading) sur la queue de forage, provoquant la casse nette du fleuret ou du chuck.", solution: "Toujours équiper les deux retainers de manière symétrique et les remplacer par paires." },
  { title: "Réutilisation systématique des joints toriques aplatis", impact: "Perte d'étanchéité après seulement 2h de fonctionnement sous haute pression (gaspillage de temps).", solution: "Remplacer systématiquement tous les joints toriques du kit 100h dès l'ouverture du perforateur." },
  { title: "Graisser le perforateur avec de la graisse universelle au lithium", impact: "Cokéfication immédiate de la graisse sous la température de l'air comprimé, bloquant la soupape oscillante.", solution: "Utiliser exclusivement de l'huile ou graisse spécifique pour outils pneumatiques résistant à l'eau." },
  { title: "Serrer les tirants un par un au couple maximum", impact: "Désalignement angulaire de la power cell. Le piston se coince à mi-course ou griffe le cylindre.", solution: "Serrer progressivement par paliers (30, 60, 90 puis 120 Nm) en croisé." },
  { title: "Démonter le perforateur sous pression ou raccordé", impact: "Projection à haute vélocité du bouchon arrière ou du piston. Risque mortel de traumatisme corporel.", solution: "Fermer la vanne d'arrivée au compresseur et dépressuriser complètement la ligne avant toute clé." },
  { title: "Insérer une queue de forage rayée ou usée en biais", impact: "La face d'impact abîmée détruit instantanément la face plate rectifiée du piston neuf.", solution: "Meuler les bavures de la queue de forage ou la jeter si l'usure dépasse 1,5 mm." },
  { title: "Oublier de purger l'eau de condensat avant le forage", impact: "L'eau pénètre dans le perforateur et lave le film lubrifiant, provoquant corrosion interne rapide et grippage.", solution: "Ouvrir brièvement la vanne d'air de ligne à vide pour éjecter l'eau accumulée dans le flexible." }
];

export const PANNES_DATA: Panne[] = [
  // 1. CIRCUIT PNEUMATIQUE (1.1 to 1.8)
  {
    id: "1.1",
    title: "Piston totalement immobile - Pas de percussion",
    system: "AIR",
    severity: "ROUGE",
    diagTime: 10,
    repTime: 1.5,
    partsCost: "160 - 2 000 DH",
    difficulty: 3,
    description: "Le perforateur est alimenté en air mais le piston ne bouge pas. L'air s'échappe en continu ou est bloqué.",
    symptoms: "Aucune oscillation, passage d'air continu et sifflement fort à l'échappement.",
    visualCheck: "Pas de mouvement visible de l'adaptateur. Présence éventuelle de saleté dans le tamis d'entrée.",
    soundCheck: "Sifflement strident continu sans bruit mécanique d'impact.",
    causes: [
      { cause: "Soupape de distribution oscillante gommée ou bloquée par de l'huile figée", prob: 60, remedy: "Nettoyer la soupape au gasoil et lubrifier légèrement." },
      { cause: "Piston grippé dans sa chemise par manque d'huile", prob: 30, remedy: "Démonter la cellule de percussion et inspecter l'état de surface du piston." },
      { cause: "Filtre à air d'admission totalement obstrué par des débris", prob: 10, remedy: "Démonter le raccord et souffler le filtre à air." }
    ],
    diagnosticSteps: [
      "Vérifier si de l'air sort à l'échappement lors de l'admission.",
      "Débrancher l'air et tenter de déplacer le piston manuellement avec une tige en bois par l'avant.",
      "Ouvrir la tête arrière pour inspecter la liberté de mouvement de la soupape oscillante."
    ],
    partsInvolved: "Soupape oscillante (Ref: MT-345102), Piston (Ref: MT-456011)",
    prevention: "Purger les flexibles d'air avant raccordement et assurer un graissage continu.",
    pitfall: "Taper excessivement sur le corps au marteau lourd pour débloquer, ce qui ovalise le cylindre.",
    costOfError: "Casser le carter cylindre (16 000 DH) en tapant dessus, pour éviter de nettoyer une soupape (0 DH).",
    crossReferences: "Voir aussi Panne 2.1 (Piston grippé)"
  },
  {
    id: "1.2",
    title: "Percussion faible - Soupape usée ou fuite interne",
    system: "AIR",
    severity: "ORANGE",
    diagTime: 15,
    repTime: 2.0,
    partsCost: "2 000 - 3 850 DH",
    difficulty: 4,
    description: "La cadence et la force des impacts sont nettement réduites. L'outil pénètre très lentement.",
    symptoms: "Bruit de frappe sourd et irrégulier, avancement de forage ridicule.",
    visualCheck: "Échappement d'air anormalement faible et saccadé.",
    soundCheck: "Martèlement mou et étouffé, vitesse de rotation instable.",
    causes: [
      { cause: "Usure excessive des portées de la soupape oscillante (perte d'étanchéité)", prob: 50, remedy: "Remplacer la soupape oscillante usée." },
      { cause: "Pression d'alimentation d'air trop basse (< 5 bar)", prob: 30, remedy: "Ajuster la pression au régulateur du compresseur." },
      { cause: "Segments ou bague de guidage du piston usés", prob: 20, remedy: "Remplacer la bague de guidage interne." }
    ],
    diagnosticSteps: [
      "Brancher un manomètre à l'entrée d'air pour mesurer la pression dynamique pendant la frappe.",
      "Démonter le boîtier de distribution et mesurer le jeu de la soupape au jeu de cales.",
      "Inspecter la chemise de cylindre à la recherche d'une rayure longitudinale importante."
    ],
    partsInvolved: "Soupape oscillante (Ref: MT-345102), Bague de guidage piston (Ref: MT-456035)",
    prevention: "Changer la soupape toutes les 200h systématiquement.",
    pitfall: "Augmenter la pression du compresseur au-delà de 7 bar pour compenser, risquant la rupture des tirants.",
    costOfError: "Rupture des tirants et destruction de la tête arrière (5 500 DH de dommages cumulés).",
    crossReferences: "Voir aussi Panne 1.8 (Pression d'air instable)"
  },
  {
    id: "1.3",
    title: "Percussion irrégulière - Présence d'eau ou de saletés",
    system: "AIR",
    severity: "VERT",
    diagTime: 5,
    repTime: 0.5,
    partsCost: "0 DH",
    difficulty: 1,
    description: "Le marteau alterne entre des cycles de frappe normaux et des phases d'hésitation ou de ralentissement.",
    symptoms: "Régime oscillant saccadé, crachats d'eau par l'échappement.",
    visualCheck: "Gouttelettes d'eau et condensat gras visibles sur le silencieux d'échappement.",
    soundCheck: "Rythme de frappe haché ressemblant à un raté d'allumage.",
    causes: [
      { cause: "Accumulation d'eau de condensation dans la ligne d'air comprimé", prob: 70, remedy: "Purger complètement les réservoirs de condensat du compresseur et de la ligne." },
      { cause: "Viscosité inadaptée de l'huile qui fige la distribution par intermittence", prob: 20, remedy: "Changer l'huile pour un indice ISO VG 46 ou spécifique climat froid." },
      { cause: "Particules de rouille détachées du flexible colmatant partiellement le tamis", prob: 10, remedy: "Nettoyer le tamis d'admission." }
    ],
    diagnosticSteps: [
      "Débrancher le raccord rapide et souffler l'air à vide pendant 30 secondes pour évacuer l'eau.",
      "Vérifier le bon fonctionnement du purgeur automatique du compresseur."
    ],
    partsInvolved: "Aucune pièce mécanique détériorée à ce stade.",
    prevention: "Purger quotidiennement le compresseur avant de commencer le poste.",
    pitfall: "Ignorer le problème, ce qui engendre une corrosion ultra-rapide des tiroirs de distribution.",
    costOfError: "Grippage complet de la distribution exigeant le remplacement des pièces d'une valeur de 3 700 DH.",
    crossReferences: "Voir aussi Panne 5.4 (Eau dans le circuit air)"
  },
  {
    id: "1.4",
    title: "Fuite d'air continue par l'échappement au repos",
    system: "AIR",
    severity: "VERT",
    diagTime: 5,
    repTime: 0.5,
    partsCost: "130 - 380 DH",
    difficulty: 2,
    description: "Un sifflement permanent d'air s'échappe de l'appareil alors que la vanne de commande est fermée.",
    symptoms: "Perte d'air audible constante au niveau du silencieux ou des évents du corps.",
    visualCheck: "Présence d'air sous pression sensible à la main près des orifices de sortie.",
    soundCheck: "Sifflement d'air continu au repos.",
    causes: [
      { cause: "Usure ou défaut d'étanchéité du joint torique de la tête arrière (Back Head)", prob: 65, remedy: "Changer le joint torique de section arrière." },
      { cause: "Défaut d'étanchéité de la vanne de commande en amont sur le panneau de la machine", prob: 35, remedy: "Réparer la vanne pilote ou le tiroir de commande du berceau." }
    ],
    diagnosticSteps: [
      "Isoler le marteau en fermant l'arrivée d'air locale pour identifier si la fuite provient de la vanne ou interne au marteau.",
      "Ouvrir la tête arrière et vérifier si le joint torique principal est aplati ou coupé."
    ],
    partsInvolved: "Joint torique de tête arrière (Ref: MT-567049)",
    prevention: "Graisser légèrement les joints toriques au remontage avec du suif.",
    pitfall: "Serrer les boulons de tirants à mort pour tenter d'arrêter la fuite sans changer le joint défectueux.",
    costOfError: "Foirage des filetages des tirants latéraux (1 300 DH le jeu de tirants de rechange).",
    crossReferences: "Voir aussi Panne 4.1 (Fuite entre corps et tête)"
  },
  {
    id: "1.5",
    title: "Accumulateur d'air percé ou dégonflé (si équipé)",
    system: "AIR",
    severity: "ORANGE",
    diagTime: 10,
    repTime: 1.0,
    partsCost: "1 500 - 3 200 DH",
    difficulty: 4,
    description: "La pression interne chute par intermittence et provoque des chocs violents dans le flexible d'alimentation.",
    symptoms: "Le flexible d'air fouette vigoureusement et de façon saccadée pendant le fonctionnement.",
    visualCheck: "Saccades physiques intenses de la ligne d'alimentation d'air.",
    soundCheck: "Bruit de frappe métallique résonnant à travers la tuyauterie.",
    causes: [
      { cause: "Membrane interne de l'accumulateur d'air perforée", prob: 80, remedy: "Remplacer le kit membrane et recharger en azote/air selon spécifications." },
      { cause: "Bouchon de valve de charge fuyard", prob: 20, remedy: "Resserrer ou changer la valve de gonflage." }
    ],
    diagnosticSteps: [
      "Appliquer de l'eau savonneuse sur la valve de l'accumulateur pour détecter des bulles.",
      "Mesurer la pression de gonflage à l'aide d'un testeur dédié (doit être d'environ 3,5 bar)."
    ],
    partsInvolved: "Kit membrane accumulateur (Ref: MT-345100)",
    prevention: "Contrôler la pression de l'accumulateur toutes les 100 heures.",
    pitfall: "Forer avec un accumulateur HS, ce qui détruit rapidement les raccords hydrauliques ou pneumatiques voisins.",
    costOfError: "Arrachement d'un flexible d'air sous pression sous l'effet du fouettement (accident corporel potentiel).",
    crossReferences: "Voir aussi Panne 1.7 (Fuite par raccords)"
  },
  {
    id: "1.6",
    title: "Conduits internes obstrués par la poussière ou le givre",
    system: "AIR",
    severity: "ORANGE",
    diagTime: 15,
    repTime: 1.0,
    partsCost: "0 DH",
    difficulty: 2,
    description: "L'air ne circule pas librement à travers les canaux longitudinaux intégrés dans la paroi du cylindre.",
    symptoms: "La frappe s'arrête brusquement après quelques minutes de forage continu en milieu froid.",
    visualCheck: "Couche épaisse de givre cristallisé ou dépôts de boue séchée à l'intérieur du corps.",
    soundCheck: "Bruit d'étouffement graduel jusqu'à l'arrêt complet.",
    causes: [
      { cause: "Humidité extrême de l'air comprimé se transformant en givre au niveau des canaux de distribution", prob: 60, remedy: "Installer un séparateur d'eau efficace et injecter de l'antigel pour outils pneumatiques." },
      { cause: "Infiltration de poussière de roche par l'avant lors d'un forage ascendant sans soufflage suffisant", prob: 40, remedy: "Nettoyer les canaux internes à la tige d'acier et rincer au gasoil." }
    ],
    diagnosticSteps: [
      "Laisser fondre le givre naturellement au soleil et observer si le fonctionnement reprend normalement.",
      "Démonter l'avant et souffler de l'air comprimé à l'envers dans les canaux de drainage."
    ],
    partsInvolved: "Aucune pièce mécanique à remplacer, uniquement nettoyage rigoureux.",
    prevention: "Maintenir toujours un débit d'air de balayage minimal pour empêcher l'entrée des poussières de roche.",
    pitfall: "Utiliser un chalumeau à flamme nue pour dégivrer le corps en acier, risquant de détremper le traitement thermique.",
    costOfError: "Fissure de fatigue thermique ultérieure sur le cylindre (perte de 16 000 DH).",
    crossReferences: "Voir aussi Panne 1.3 (Percussion irrégulière)"
  },
  {
    id: "1.7",
    title: "Fuite d'air majeure par les raccords rapides",
    system: "AIR",
    severity: "VERT",
    diagTime: 3,
    repTime: 0.2,
    partsCost: "275 - 660 DH",
    difficulty: 1,
    description: "L'air s'échappe abondamment aux liaisons entre les flexibles d'alimentation et le perforateur.",
    symptoms: "Bruit strident à l'entrée de l'engin, baisse de pression de service disponible.",
    visualCheck: "Flexible qui vibre au niveau du connecteur rapide, mousse d'huile sur la connexion.",
    soundCheck: "Sifflement d'air localisé extrêmement fort (supérieur à 95 dB).",
    causes: [
      { cause: "Joint d'étanchéité interne à lèvre du raccord rapide usé ou manquant", prob: 70, remedy: "Changer le joint interne en caoutchouc du raccord." },
      { cause: "Raccord rapide mal verrouillé (cames d'accouplement usées ou encrassées)", prob: 20, remedy: "Nettoyer les cames d'accouplement et graisser le verrouillage." },
      { cause: "Filetage du raccord conique desserré", prob: 10, remedy: "Démonter, appliquer du téflon et resserrer vigoureusement." }
    ],
    diagnosticSteps: [
      "Inspecter visuellement l'état des griffes de verrouillage du raccord rapide.",
      "Chasser la poussière de l'accouplement et reconnecter fermement jusqu'au clic mécanique."
    ],
    partsInvolved: "Joint de raccord à griffes (Ref: MT-128912)",
    prevention: "Garder des joints de rechange dans la caisse à outils du mécanicien.",
    pitfall: "Attacher les flexibles fuyards avec du fil de fer de chantier au lieu de changer le raccord.",
    costOfError: "Arrachement sous pression avec coup de fouet (extrêmement dangereux pour le personnel).",
    crossReferences: "Voir aussi Panne 1.4 (Fuite d'air continue)"
  },
  {
    id: "1.8",
    title: "Pression d'air instable en bout de ligne",
    system: "AIR",
    severity: "VERT",
    diagTime: 10,
    repTime: 0.5,
    partsCost: "0 DH",
    difficulty: 2,
    description: "La force de percussion fluctue constamment en fonction de la sollicitation des autres engins de la mine.",
    symptoms: "Le perforateur perd sa puissance dès qu'un deuxième engin commence à forer sur la même ligne.",
    visualCheck: "Aiguille du manomètre de ligne qui chute sous 4.5 bar en charge.",
    soundCheck: "Variations de régime cycliques indexées sur la consommation d'air globale du chantier.",
    causes: [
      { cause: "Diamètre intérieur du flexible d'air trop faible (perte de charge excessive)", prob: 50, remedy: "Remplacer le flexible de 3/4\" par un modèle de 1\" minimum." },
      { cause: "Filtre principal du réseau de chantier colmaté par de la boue ou de la rouille", prob: 35, remedy: "Remplacer la cartouche filtrante de la station de traitement d'air de galerie." },
      { cause: "Capacité de débit du compresseur insuffisante pour le nombre d'outils branchés", prob: 15, remedy: "Déléguer les outils sur deux compresseurs distincts ou augmenter la taille de la cuve tampon." }
    ],
    diagnosticSteps: [
      "Mesurer la pression statique (à l'arrêt) puis la pression dynamique (pendant la frappe) en fin de flexible.",
      "Vérifier la longueur totale de la ligne d'air (les tuyaux de plus de 100m causent des pertes de charge)."
    ],
    partsInvolved: "Aucun composant du perforateur n'est directement en cause.",
    prevention: "Respecter scrupuleusement l'abaque des diamètres de tuyauterie pour l'air comprimé.",
    pitfall: "Tenter de compenser en surgraissant l'appareil, ce qui ne résout pas la perte de charge mais l'encrasse.",
    costOfError: "Gaspillage d'huile et perte de rendement général de foration.",
    crossReferences: "Voir aussi Panne 1.2 (Percussion faible)"
  },

  // 2. PISTON ET CHAMBRE (2.1 to 2.6)
  {
    id: "2.1",
    title: "Piston grippé dans le cylindre - Manque de lubrification",
    system: "PISTON",
    severity: "ROUGE",
    diagTime: 15,
    repTime: 3.0,
    partsCost: "9 350 - 25 300 DH",
    difficulty: 5,
    description: "Le piston de percussion s'est bloqué mécaniquement dans le cylindre en raison d'une élévation extrême de température due à la friction sèche.",
    symptoms: "Blocage total de l'appareil. Impossible de déplacer le piston manuellement même après déconnexion d'air.",
    visualCheck: "Coloration bleue/violette de l'acier sur la queue de forage ou le piston (surchauffe extrême).",
    soundCheck: "Aucun mouvement. Eventuel bruit de coincement sec lors de la tentative de mise en marche.",
    causes: [
      { cause: "Panne totale du graisseur de ligne ou réservoir d'huile de forage vide", prob: 60, remedy: "Remplacer le piston et polir le cylindre si récupérable. Remplir et régler le graisseur." },
      { cause: "Utilisation d'une huile de lubrification de mauvaise qualité ou inadaptée aux fortes pressions", prob: 30, remedy: "Purger et nettoyer le circuit d'huile, utiliser l'huile constructeur agréée." },
      { cause: "Infiltration massive d'abrasifs (poussière de roche) dans la chambre de percussion", prob: 10, remedy: "Remplacer les joints racleurs du manchon avant." }
    ],
    diagnosticSteps: [
      "Retirer les tirants latéraux et démonter la carcasse arrière.",
      "Inspecter à l'aide d'une lampe de poche l'état de la paroi cylindre. Rechercher des traces de transfert de matière.",
      "Tenter d'extraire délicatement le piston à l'aide d'une presse hydraulique douce ou d'un jet en laiton."
    ],
    partsInvolved: "Piston de percussion (Ref: MT-456011), Cylindre principal (Ref: MT-456022)",
    prevention: "Contrôler le niveau d'huile du graisseur toutes les 4 heures de fonctionnement continu.",
    pitfall: "Essayer de débloquer le piston en forçant le passage d'air à haute pression répétitivement.",
    costOfError: "Éclatement complet du corps de cylindre (16 000 DH) sous la pression cumulée et le choc thermique.",
    crossReferences: "Voir aussi Panne 2.2 (Piston rayé) et Panne 5.1 (Graisseur déréglé)"
  },
  {
    id: "2.2",
    title: "Piston rayé longitudinalement - Contamination par abrasifs",
    system: "PISTON",
    severity: "ORANGE",
    diagTime: 20,
    repTime: 2.5,
    partsCost: "9 350 DH",
    difficulty: 4,
    description: "Des rayures axiales profondes se sont formées sur le diamètre externe rectifié du piston, entraînant des pertes d'air.",
    symptoms: "Chute progressive de l'énergie d'impact, augmentation de la consommation d'air globale du perforateur.",
    visualCheck: "Rayures visibles à l'œil nu lors du démontage rapide de l'avant.",
    soundCheck: "Bruit d'impact moins net, sifflement d'air interne.",
    causes: [
      { cause: "Entrée de poussières de roche abrasives par le nez suite à la casse du joint racleur", prob: 60, remedy: "Remplacer le piston dégradé et monter un joint à lèvre de nez neuf." },
      { cause: "Tuyau d'air traîné dans la poussière de galerie avant son raccordement", prob: 30, remedy: "Nettoyer systématiquement le flexible par soufflage à vide avant connexion." },
      { cause: "Débris métalliques provenant de l'usure précoce de la soupape oscillante", prob: 10, remedy: "Rincer l'intérieur de la cellule et changer la soupape." }
    ],
    diagnosticSteps: [
      "Démonter l'avant du marteau pour extraire l'adaptateur de queue.",
      "Passer le doigt sur la surface du piston : si les rayures accrochent l'ongle, le piston doit être changé."
    ],
    partsInvolved: "Piston de percussion (Ref: MT-456011), Joint à lèvre de nez (Ref: MT-567049)",
    prevention: "Rincer et nettoyer méticuleusement le filetage des fleurets avant montage.",
    pitfall: "Tenter de remonter un piston rayé en pensant que la lubrification va combler le jeu.",
    costOfError: "Perte de rendement de forage de 40%, usure accélérée de la bague de guidage neuve en 10h.",
    crossReferences: "Voir aussi Panne 2.4 (Bague de guidage usée)"
  },
  {
    id: "2.3",
    title: "Piston fissuré ou brisé - Fatigue ou coups à blanc répétés",
    system: "PISTON",
    severity: "ROUGE",
    diagTime: 10,
    repTime: 3.5,
    partsCost: "9 350 - 26 400 DH",
    difficulty: 5,
    description: "Le piston présente des criques transversales ou s'est fracturé en plusieurs morceaux sous l'effet d'ondes de choc répétées sans résistance.",
    symptoms: "Arrêt complet de la machine ou martèlement extrêmement violent avec bruits de débris internes.",
    visualCheck: "Morceaux de métal brillant ou limaille tombant par le manchon avant ou l'échappement.",
    soundCheck: "Bruits de broyage métallique aigus catastrophiques.",
    causes: [
      { cause: "Forage répété à vide ou coups à blanc (Blank Firing) prolongés", prob: 55, remedy: "Remplacer le piston et éduquer l'opérateur à relâcher la commande de percussion hors roche." },
      { cause: "Mauvais alignement axial entre le marteau et le fleuret de forage (Side Loading)", prob: 30, remedy: "Réaligner le marteau sur le berceau de forage." },
      { cause: "Défaut métallurgique ou fatigue thermique après un grand nombre d'heures (> 800h)", prob: 15, remedy: "Remplacer le piston préventivement selon les recommandations de maintenance." }
    ],
    diagnosticSteps: [
      "Ouvrir l'avant du perforateur et inspecter visuellement la face d'impact du piston.",
      "Extraire le piston pour rechercher des fissures circonférentielles microscopiques à l'aide d'un ressuage (test liquide pénétrant)."
    ],
    partsInvolved: "Piston de percussion (Ref: MT-456011), Douille de guidage (Ref: MT-456035)",
    prevention: "Éviter impérativement de maintenir la percussion enclenchée lors du retrait du fleuret.",
    pitfall: "Tenter de ressouder ou meuler un piston fissuré.",
    costOfError: "Le piston explose en miettes pendant le forage, ruinant définitivement la chemise cylindre de 16 000 DH.",
    crossReferences: "Voir aussi Panne 3.3 (Queue de forage mal centrée)"
  },
  {
    id: "2.4",
    title: "Bague de guidage de piston usée - Perte de compression",
    system: "PISTON",
    severity: "ORANGE",
    diagTime: 15,
    repTime: 2.0,
    partsCost: "2 150 DH",
    difficulty: 3,
    description: "Le diamètre interne de la bague de guidage a augmenté au-delà de la tolérance maximale admissible, laissant passer de l'air de commande.",
    symptoms: "Cadence de frappe ralentie, consommation d'air comprimé excessive sans fuite extérieure visible.",
    visualCheck: "Traces de frottement asymétriques sur la circonférence de guidage du piston.",
    soundCheck: "Son d'impact moins aigu, plus sourd.",
    causes: [
      { cause: "Usure abrasive normale accélérée par une lubrification par intermittence", prob: 70, remedy: "Remplacer la bague de guidage piston." },
      { cause: "Désalignement récurrent du berceau transmettant des charges excentrées", prob: 30, remedy: "Vérifier et resserrer les glissières de guidage du berceau." }
    ],
    diagnosticSteps: [
      "Mesurer le diamètre interne de la bague de guidage à l'aide d'un micromètre d'alésage (tolérance max : +0,15 mm).",
      "Vérifier le jeu radial du piston dans sa bague à l'aide d'un jeu de cales d'épaisseur."
    ],
    partsInvolved: "Bague de guidage piston (Ref: MT-456035)",
    prevention: "Assurer une lubrification continue avec l'huile adéquate.",
    pitfall: "Remplacer le piston en gardant la bague de guidage usée, ce qui décentre le piston.",
    costOfError: "Rayage immédiat du piston neuf en moins de 5 heures d'utilisation (perte sèche de 9 350 DH).",
    crossReferences: "Voir aussi Panne 2.2 (Piston rayé)"
  },
  {
    id: "2.5",
    title: "Joints d'étanchéité du piston dégradés",
    system: "PISTON",
    severity: "VERT",
    diagTime: 15,
    repTime: 1.5,
    partsCost: "275 - 500 DH",
    difficulty: 2,
    description: "Les joints toriques ou d'étanchéité de section interne de la cellule de percussion ont durci ou se sont détériorés.",
    symptoms: "Légère baisse d'énergie de frappe, présence d'huile abondante à l'échappement.",
    visualCheck: "Joints craquelés ou coupés lors de l'inspection de démontage.",
    soundCheck: "Rythme de frappe manquant légèrement de nervosité.",
    causes: [
      { cause: "Température de service excessive ayant cuit les joints en polymère", prob: 60, remedy: "Changer le jeu de joints complet et améliorer le refroidissement." },
      { cause: "Utilisation d'huile corrosive de basse qualité ayant attaqué chimiquement la matière", prob: 40, remedy: "Utiliser uniquement de l'huile agréée." }
    ],
    diagnosticSteps: [
      "Démonter la cellule de percussion et examiner chaque joint à la loupe.",
      "Vérifier si les joints ont conservé leur élasticité."
    ],
    partsInvolved: "Kit complet de joints d'étanchéité de section.",
    prevention: "Remplacer le kit joints systématiquement lors de chaque révision des 100h.",
    pitfall: "Remonter un joint légèrement usé ou aplati en se disant qu'il fera l'affaire.",
    costOfError: "Obligation de rouvrir le marteau après seulement 2h pour cause de fuite persistante.",
    crossReferences: "Voir aussi Panne 1.4 (Fuite d'air continue)"
  },
  {
    id: "2.6",
    title: "Coups à blanc répétés (Blank Firing) - Erreur opérateur",
    system: "PISTON",
    severity: "VERT",
    diagTime: 5,
    repTime: 0.1,
    partsCost: "0 DH",
    difficulty: 1,
    description: "Le perforateur fonctionne sans que l'outil ne soit appliqué fermement contre la roche de la galerie.",
    symptoms: "Chocs d'impact extrêmement secs résonnant très fort à travers la roche.",
    visualCheck: "L'outil saute d'avant en arrière de façon incontrôlée dans le manchon sans avancer.",
    soundCheck: "Bruit de claquement métallique sec extrêmement fort et agressif.",
    causes: [
      { cause: "Pression d'avance du berceau insuffisante ou force d'appui de l'opérateur trop faible", prob: 70, remedy: "Augmenter la pression de poussée pour forcer le fleuret contre la roche." },
      { cause: "Mauvaise coordination de l'opérateur (maintien de la frappe en phase de repositionnement)", prob: 30, remedy: "Former et sensibiliser l'opérateur aux risques mécaniques liés aux coups à blanc." }
    ],
    diagnosticSteps: [
      "Observer l'opérateur lors d'une passe complète de forage.",
      "Vérifier la pression du circuit d'avance du berceau au manomètre de commande."
    ],
    partsInvolved: "Aucun dommage immédiat si corrigé à temps, mais casse à moyen terme.",
    prevention: "Utiliser un système de sécurité anti-percussion à vide si disponible sur l'engin porteur.",
    pitfall: "Continuer le forage sans modifier la poussée en espérant que la roche va changer.",
    costOfError: "Destruction prématurée des verrous de retainers et fissuration du piston à court terme.",
    crossReferences: "Voir aussi Panne 2.3 (Piston brisé) et Panne 3.2 (Retainers cassés)"
  },

  // 3. MANCHON DE GUIDAGE (3.1 to 3.6)
  {
    id: "3.1",
    title: "Bushing (bague de forage) usé - Jeu radial excessif",
    system: "MANCHON",
    severity: "ORANGE",
    diagTime: 5,
    repTime: 1.0,
    partsCost: "990 DH",
    difficulty: 2,
    description: "La bague de guidage d'outil à l'avant du chuck présente une usure de diamètre interne supérieure à la limite critique.",
    symptoms: "Mauvais guidage du fleuret, déviation fréquente du trou de forage, usure anormale des cannelures.",
    visualCheck: "Fleuret qui oscille de biais dans le nez du marteau au démarrage.",
    soundCheck: "Bruit de battement latéral métallique lors de la rotation de l'outil.",
    causes: [
      { cause: "Frottement abrasif continu sous charge latérale par l'outil de forage", prob: 70, remedy: "Remplacer le bushing d'usure avant." },
      { cause: "Lubrification insuffisante ou graisse de nez absente", prob: 30, remedy: "S'assurer du fonctionnement de l'atomiseur de graisse avant." }
    ],
    diagnosticSteps: [
      "Insérer un fleuret neuf et mesurer le jeu radial à l'aide d'un comparateur ou jeu de cales (limite : jeu supérieur à 1,5 mm nécessite remplacement).",
      "Examiner l'alésage intérieur de la bague pour détecter la présence de rayures ou d'ovalisation."
    ],
    partsInvolved: "Bague d'usure chuck (Bushing) (Ref: MT-567011)",
    prevention: "Vérifier le jeu toutes les 50 heures. Appliquer manuellement de la graisse sur le fleuret avant introduction.",
    pitfall: "Garder un bushing usé, ce qui entraîne le décentrage de l'impact du piston.",
    costOfError: "Casse de la queue de forage (3 300 DH) et usure asymétrique irrémédiable du piston (9 350 DH).",
    crossReferences: "Voir aussi Panne 3.3 (Queue de forage mal centrée)"
  },
  {
    id: "3.2",
    title: "Retainers (verrous de retenue) cassés ou tordus",
    system: "MANCHON",
    severity: "ROUGE",
    diagTime: 2,
    repTime: 0.5,
    partsCost: "715 DH",
    difficulty: 1,
    description: "Les axes transversaux maintenant l'outil logé dans le manchon avant se sont rompus ou déformés sous l'impact.",
    symptoms: "Impossibilité de retenir le fleuret, éjection de la queue de forage lors de la remontée.",
    visualCheck: "Absence de l'un ou des deux axes de retainers, ou axes tordus coincés dans leur logement.",
    soundCheck: "Claquement irrégulier lourd au niveau de l'avant de la machine.",
    causes: [
      { cause: "Impacts violents répétés à vide (Blank Firing) contre les verrous de retenue", prob: 75, remedy: "Remplacer les axes de retainers tordus/cassés." },
      { cause: "Utilisation de goupilles non conformes ou de fabrication aftermarket bas de gamme", prob: 25, remedy: "Utiliser exclusivement les verrous d'origine Montabert en acier traité." }
    ],
    diagnosticSteps: [
      "Tenter de retirer les retainers manuellement ou à l'aide d'un chasse-goupille.",
      "Vérifier si le logement dans le chuck housing n'est pas ovalisé."
    ],
    partsInvolved: "Axes de verrous (pair) (Ref: MT-567025)",
    prevention: "Éviter impérativement la percussion lors du dégagement de l'outil.",
    pitfall: "Souder un axe cassé ou mettre un simple morceau de fer à béton de chantier à la place.",
    costOfError: "Éjection du fleuret sous pression à grande vitesse, risquant de blesser grièvement le personnel.",
    crossReferences: "Voir aussi Panne 2.6 (Coups à blanc répétés)"
  },
  {
    id: "3.3",
    title: "Queue de forage mal centrée - Side Loading destructeur",
    system: "MANCHON",
    severity: "ORANGE",
    diagTime: 10,
    repTime: 1.5,
    partsCost: "990 - 4 600 DH",
    difficulty: 3,
    description: "L'outil de forage ne travaille pas parfaitement dans l'axe de percussion, créant des forces radiales extrêmes lors de l'impact.",
    symptoms: "Casse précoce et répétitive des queues de forage (shank adapters), usure asymétrique de l'avant.",
    visualCheck: "Usure asymétrique flagrante sur un côté seulement de la face plate de la queue de forage.",
    soundCheck: "Martèlement bruyant asymétrique désagréable.",
    causes: [
      { cause: "Bague de guidage (bushing) usée guidant l'outil en biais", prob: 60, remedy: "Changer le bushing et vérifier le jeu interne." },
      { cause: "Alignement défaillant de la glissière du berceau par rapport au trou de forage", prob: 40, remedy: "Réajuster les cales de glissement du berceau d'avance." }
    ],
    diagnosticSteps: [
      "Placer une règle rectifiée le long du berceau et du fleuret pour vérifier la coaxialité.",
      "Mesurer le parallélisme de la platine de fixation du perforateur."
    ],
    partsInvolved: "Bushing (Ref: MT-567011), Manchon cannelé (Ref: MT-567038)",
    prevention: "Vérifier régulièrement l'usure des patins de glissement du berceau de forage.",
    pitfall: "Continuer à forer avec des glissières desserrées.",
    costOfError: "Destruction complète du manchon avant cannelé (valeur de 4 600 DH) et fissure du carter frontal.",
    crossReferences: "Voir aussi Panne 3.1 (Bushing usé)"
  },
  {
    id: "3.4",
    title: "Fuite d'air importante par le manchon avant",
    system: "MANCHON",
    severity: "VERT",
    diagTime: 5,
    repTime: 0.8,
    partsCost: "130 - 275 DH",
    difficulty: 2,
    description: "L'air comprimé s'échappe excessivement par l'avant de la machine au niveau de la bague de nez.",
    symptoms: "Perte de pression d'air de percussion, jet d'air continu projetant de la poussière vers l'opérateur.",
    visualCheck: "Souffle d'air important détectable à la main à la sortie du nez de la machine.",
    soundCheck: "Sifflement d'air persistant dirigé vers l'avant.",
    causes: [
      { cause: "Usure ou rupture des joints toriques d'étanchéité frontaux", prob: 70, remedy: "Remplacer le jeu de joints toriques avant." },
      { cause: "Usure prononcée de la portée d'étanchéité du piston renvoyant de l'air de retour", prob: 30, remedy: "Changer la bague de guidage et les joints du piston." }
    ],
    diagnosticSteps: [
      "Démonter le nez du perforateur.",
      "Retirer et inspecter les joints frontaux à la recherche de coupures causées par des débris tranchants."
    ],
    partsInvolved: "Joint à lèvre de nez (Ref: MT-567049)",
    prevention: "Maintenir un joint racleur anti-poussière en parfait état à l'avant.",
    pitfall: "Tenter d'enrouler du chiffon autour du nez pour arrêter le sillage d'air.",
    costOfError: "Surchauffe rapide du manchon et usure abrasive des cannelures de rotation.",
    crossReferences: "Voir aussi Panne 3.5 (Fuite d'huile par le manchon)"
  },
  {
    id: "3.5",
    title: "Fuite d'huile par le manchon - Joint défectueux ou surgraissage",
    system: "MANCHON",
    severity: "VERT",
    diagTime: 5,
    repTime: 0.5,
    partsCost: "130 DH",
    difficulty: 1,
    description: "Une quantité excessive d'huile de graissage s'écoule par le nez du marteau, salissant l'outil et le sol de la galerie.",
    symptoms: "Gouttes d'huile constantes s'écoulant le long du fleuret, flaques d'huile sous l'avant de l'appareil à l'arrêt.",
    visualCheck: "Fleuret maculé de graisse noire, projections d'huile importantes lors de la percussion.",
    soundCheck: "Aucun bruit anormal.",
    causes: [
      { cause: "Débit du graisseur de ligne réglé de manière excessive (trop ouvert)", prob: 60, remedy: "Fermer la vis de dosage du graisseur de 1 à 2 tours." },
      { cause: "Rupture du joint racleur ou d'étanchéité à lèvre avant", prob: 40, remedy: "Remplacer le joint à lèvre de nez." }
    ],
    diagnosticSteps: [
      "Compter la cadence de gouttes du graisseur de ligne (ne doit pas dépasser le débit spécifié).",
      "Vérifier si l'huile s'écoule à l'arrêt (signe de siphonage anormal ou vanne de graisseur non étanche)."
    ],
    partsInvolved: "Joint à lèvre de nez (Ref: MT-567049)",
    prevention: "Ajuster précisément la vis micrométrique du graisseur selon le climat.",
    pitfall: "Laisser le graisseur ouvert au maximum en pensant que 'qui abonde ne nuit pas'.",
    costOfError: "Consommation triplée d'huile de forage (gaspillage de 550 DH/semaine) et pollution du chantier.",
    crossReferences: "Voir aussi Panne 5.1 (Graisseur vide / déréglé)"
  },
  {
    id: "3.6",
    title: "Usure asymétrique (en biseau) de l'outil",
    system: "MANCHON",
    severity: "VERT",
    diagTime: 5,
    repTime: 0.5,
    partsCost: "990 - 3 300 DH",
    difficulty: 2,
    description: "La face arrière de la queue de forage s'use de biais, créant un contact asymétrique avec le piston.",
    symptoms: "Chute d'énergie de frappe, risque accru de casse de l'outil ou du piston.",
    visualCheck: "Face d'impact de la queue de forage inclinée et non perpendiculaire à l'axe.",
    soundCheck: "Impacts d'intensité fluctuante, son métallique sec.",
    causes: [
      { cause: "Jeu excessif du bushing d'usure guidant l'outil en travers", prob: 70, remedy: "Changer le bushing d'usure avant." },
      { cause: "Qualité d'acier ou traitement thermique défaillant du fleuret de forage", prob: 30, remedy: "Remplacer le fleuret par un modèle d'origine certifiée." }
    ],
    diagnosticSteps: [
      "Vérifier le jeu du fleuret dans le nez au jeu de cales.",
      "Mesurer la perpendicularité de la face d'impact à l'aide d'une équerre rectifiée."
    ],
    partsInvolved: "Bushing (Ref: MT-567011), Fleuret de forage.",
    prevention: "Remplacer systématiquement le bushing dès que le jeu radial dépasse 1.5 mm.",
    pitfall: "Meuler la face d'impact usée en biais pour la remettre droite (cela modifie la longueur et décale la frappe).",
    costOfError: "Destruction définitive du piston de percussion (9 350 DH) par concentration locale des contraintes de choc.",
    crossReferences: "Voir aussi Panne 3.1 (Bushing usé)"
  },

  // 4. CORPS ET SECTIONS (4.1 to 4.5)
  {
    id: "4.1",
    title: "Fuite d'air majeure entre sections - Joint de corps dégradé",
    system: "CORPS",
    severity: "ORANGE",
    diagTime: 10,
    repTime: 2.0,
    partsCost: "440 - 1 300 DH",
    difficulty: 3,
    description: "L'air comprimé fuit bruyamment à la jonction entre le cylindre central et la tête arrière de l'appareil.",
    symptoms: "Sifflement puissant localisé au milieu du perforateur, chute de performance de percussion.",
    visualCheck: "Trace d'huile s'échappant en ligne droite sous pression entre les plans de joint.",
    soundCheck: "Sifflement strident continu s'amplifiant lors de la mise en pression.",
    causes: [
      { cause: "Desserrage progressif des tirants latéraux sous l'effet des vibrations", prob: 55, remedy: "Resserrer les tirants au couple spécifié de 120 Nm et changer le joint plat abîmé." },
      { cause: "Joint d'étanchéité de section écrasé, brûlé ou coupé par la chaleur", prob: 35, remedy: "Remplacer le joint de section entre corps et tête arrière." },
      { cause: "Fissure microscopique au niveau du plan de joint", prob: 10, remedy: "Rectifier le plan de joint ou remplacer le carter endommagé." }
    ],
    diagnosticSteps: [
      "Nettoyer le marteau, appliquer de l'eau savonneuse sur le plan de joint pour localiser précisément la fuite.",
      "Vérifier la tension des écrous de tirants latéraux à l'aide d'une clé dynamométrique."
    ],
    partsInvolved: "Joints de section (Ref: MT-456040), Tirants latéraux",
    prevention: "Contrôler le couple de serrage des tirants toutes les 50 heures de fonctionnement.",
    pitfall: "Continuer le forage avec un joint fuyard en espérant que la dilatation à chaud calfeutre la fuite.",
    costOfError: "La fuite d'air érode le plan de joint en acier par abrasion (ruine définitive du corps de cylindre : 16 000 DH).",
    crossReferences: "Voir aussi Panne 4.3 (Desserrage des tirants)"
  },
  {
    id: "4.2",
    title: "Fissuration du corps de cylindre - Surchauffe ou choc",
    system: "CORPS",
    severity: "ROUGE",
    diagTime: 15,
    repTime: 4.0,
    partsCost: "15 950 DH",
    difficulty: 5,
    description: "Une fêlure est apparue sur le carter ou la chemise externe en acier sous l'action de contraintes de fatigue extrêmes ou de chocs directs.",
    symptoms: "Fuite d'air massive incontrôlable au milieu du corps, perte totale d'efficacité de l'outil.",
    visualCheck: "Fissure linéaire visible le long du cylindre d'acier, souvent près des filetages des tirants.",
    soundCheck: "Bruit de fuite sourd et irrégulier.",
    causes: [
      { cause: "Serrage asymétrique ou excessif des tirants latéraux créant des contraintes de flexion internes", prob: 50, remedy: "Remplacer impérativement le carter cylindre et serrer uniformément en croisé." },
      { cause: "Surchauffe extrême due à un grippage du piston non diagnostiqué", prob: 35, remedy: "Remplacer le cylindre et le piston grippé." },
      { cause: "Choc mécanique direct par contact accidentel contre la roche ou le bras de la foreuse", prob: 15, remedy: "Protéger la machine à l'aide d'un carénage métallique adapté." }
    ],
    diagnosticSteps: [
      "Nettoyer à fond le corps de cylindre.",
      "Utiliser un kit de ressuage (liquide pénétrant rouge + révélateur blanc) pour mettre en évidence la propagation de la fissure."
    ],
    partsInvolved: "Cylindre principal (Ref: MT-456022)",
    prevention: "Respecter impérativement la séquence et le couple de serrage des tirants au remontage.",
    pitfall: "Tenter de souder le cylindre en acier spécial traité thermiquement.",
    costOfError: "La soudure lâche instantanément lors de la première percussion, risquant d'éjecter des éclats d'acier tranchants.",
    crossReferences: "Voir aussi Panne 2.1 (Piston grippé)"
  },
  {
    id: "4.3",
    title: "Desserrage ou rupture des tirants de section latéraux",
    system: "CORPS",
    severity: "ROUGE",
    diagTime: 5,
    repTime: 1.5,
    partsCost: "1 300 DH",
    difficulty: 3,
    description: "Les longs boulons d'assemblage traversants se sont desserrés ou ont cassé net sous l'action des vibrations de frappe.",
    symptoms: "Désalignement flagrant des carters, fuite d'air massive entre les plans de joint de l'appareil.",
    visualCheck: "Tige de tirant manquante ou cassée au niveau du filetage de l'écrou arrière.",
    soundCheck: "Claquement métallique irrégulier très fort s'accompagnant de fortes fuites d'air.",
    causes: [
      { cause: "Défaut de contrôle périodique du couple de serrage recommandé de 120 Nm", prob: 60, remedy: "Remplacer le jeu de tirants complet et resserrer à la clé dynamométrique." },
      { cause: "Omission des rondelles d'appui rectifiées en acier traité lors du remontage précédent", prob: 30, remedy: "Ajouter les rondelles de rechange d'origine requises." },
      { cause: "Vibrations anormalement intenses causées par un forage prolongé sur roche ultra-dure", prob: 10, remedy: "Adapter la cadence de percussion en ajustant les paramètres de l'engin porteur." }
    ],
    diagnosticSteps: [
      "Inspecter la surface des filetages des tirants démontés à la recherche de signes d'étirement (allongement anormal).",
      "Vérifier si les filetages de la tête arrière sont endommagés."
    ],
    partsInvolved: "Tirants de section latéraux (jeu complet) (Ref: MT-456040)",
    prevention: "Appliquer une goutte d'huile de haute qualité sur les filetages avant serrage pour assurer un couple précis.",
    pitfall: "Remplacer un tirant cassé par une simple tige filetée classique achetée dans le commerce.",
    costOfError: "Rupture immédiate de la tige filetée au premier coup d'impact (risque d'éjection mortel de débris d'acier).",
    crossReferences: "Voir aussi Panne 4.1 (Fuite entre corps et tête)"
  },
  {
    id: "4.4",
    title: "Orifices de refroidissement bouchés - Surchauffe locale",
    system: "CORPS",
    severity: "VERT",
    diagTime: 5,
    repTime: 0.5,
    partsCost: "0 DH",
    difficulty: 1,
    description: "Les évents ou les canalisations de soufflage d'air ou d'injection d'eau sont obstrués par des boues calcaires.",
    symptoms: "Température extérieure du corps anormalement élevée (> 90°C) après quelques trous.",
    visualCheck: "Dépôts solides grisâtres ou boue séchée bloquant les canaux de refroidissement périphériques.",
    soundCheck: "Aucun bruit anormal apparent.",
    causes: [
      { cause: "Utilisation d'une eau de refroidissement de mine très calcaire ou boueuse non filtrée", prob: 80, remedy: "Nettoyer mécaniquement les orifices et installer un filtre amont sur la ligne d'eau." },
      { cause: "Infiltration inverse de poussières de roche lors du forage de trous ascendants secs", prob: 20, remedy: "Maintenir l'injection d'air ou d'eau active pendant toute la phase de forage." }
    ],
    diagnosticSteps: [
      "Mesurer la température du corps de cylindre à l'aide d'un thermomètre infrarouge.",
      "Démonter l'aiguille d'injection et tringler les conduits internes avec un fil métallique."
    ],
    partsInvolved: "Aucun remplacement mécanique requis.",
    prevention: "Utiliser exclusivement de l'eau clarifiée pour l'injection et le refroidissement.",
    pitfall: "Ignorer la surchauffe et continuer de forer en pensant que la lubrification suffit.",
    costOfError: "Destruction des joints internes par cuisson thermique et risque élevé de grippage du piston (25 300 DH de dommages).",
    crossReferences: "Voir aussi Panne 5.3 (Refroidissement insuffisant)"
  },
  {
    id: "4.5",
    title: "Corrosion interne sévère - Présence d'eau prolongée",
    system: "CORPS",
    severity: "ORANGE",
    diagTime: 15,
    repTime: 3.0,
    partsCost: "0 - 15 950 DH",
    difficulty: 3,
    description: "Les parois intérieures de la cellule de percussion et du cylindre présentent des piqûres de rouille prononcées.",
    symptoms: "Chute d'énergie de frappe, présence constante de particules de rouille à l'échappement.",
    visualCheck: "Aspect rugueux orangé sur la paroi interne du cylindre lors du démontage.",
    soundCheck: "Bruit de percussion rugueux manquant de netteté.",
    causes: [
      { cause: "Stockage prolongé du marteau à l'air libre humide de la mine sans rinçage préalable à l'huile", prob: 65, remedy: "Polir délicatement la chemise cylindre au papier de verre grain ultra-fin si possible." },
      { cause: "Séparateur d'eau inefficace sur le compresseur laissant passer l'humidité dans l'air de service", prob: 35, remedy: "Réparer le séparateur d'eau et purger régulièrement la ligne d'admission d'air." }
    ],
    diagnosticSteps: [
      "Ouvrir la carcasse centrale.",
      "Vérifier la profondeur des piqûres de rouille : si la paroi présente des cavités de plus de 0,1 mm de profondeur, le cylindre doit être remplacé."
    ],
    partsInvolved: "Cylindre principal (Ref: MT-456022) si corrosion hors tolérance.",
    prevention: "Injecter 10 cl d'huile de stockage dans l'entrée d'air avant tout arrêt prolongé de la machine.",
    pitfall: "Remonter le marteau rouillé tel quel en comptant sur la frappe pour auto-nettoyer la paroi.",
    costOfError: "La rouille agit comme un abrasif destructeur qui détruit les joints et raye le piston en moins d'une heure.",
    crossReferences: "Voir aussi Panne 1.3 (Percussion irrégulière)"
  },

  // 5. GRAISSAGE ET REFROIDISSEMENT (5.1 to 5.5)
  {
    id: "5.1",
    title: "Graisseur de ligne vide ou déréglé - Friction sèche imminente",
    system: "GRAISSAGE",
    severity: "ROUGE",
    diagTime: 5,
    repTime: 0.2,
    partsCost: "0 DH",
    difficulty: 1,
    description: "L'atomiseur de graissage n'injecte plus de brouillard d'huile dans le flux d'air comprimé d'alimentation.",
    symptoms: "Surchauffe rapide de tout l'appareil, traces visibles d'usure à sec au niveau du nez de la machine.",
    visualCheck: "Réservoir de graisseur de ligne vide, absence de film d'huile sur la tige du fleuret.",
    soundCheck: "Bruit de frottement métallique sec, cliquetis aigu anormal.",
    causes: [
      { cause: "Omission du mécanicien ou de l'opérateur de remplir le réservoir d'huile de forage", prob: 70, remedy: "Remplir immédiatement le réservoir avec de l'huile spécifique pour outillage pneumatique." },
      { cause: "Vis de réglage micrométrique obstruée par de la poussière ou de la paraffine figée", prob: 20, remedy: "Nettoyer l'orifice de réglage à l'air comprimé et ajuster le débit." },
      { cause: "Canalisation d'huile amont rompue ou flexible écrasé", prob: 10, remedy: "Remplacer le flexible de graissage défectueux." }
    ],
    diagnosticSteps: [
      "Vérifier le niveau d'huile dans le graisseur de ligne.",
      "Placer un carton blanc devant l'échappement pendant 10 secondes de frappe : une fine tache d'huile doit apparaître."
    ],
    partsInvolved: "Aucun remplacement de pièce requis.",
    prevention: "Remplir systématiquement le réservoir d'huile à chaque début de poste ou ravitaillement.",
    pitfall: "Faire fonctionner la machine sans huile pendant seulement 10 minutes 'pour finir le trou'.",
    costOfError: "Grippage définitif du piston (9 350 DH) et de la bague de guidage (2 150 DH) par surchauffe de friction sèche.",
    crossReferences: "Voir aussi Panne 2.1 (Piston grippé)"
  },
  {
    id: "5.2",
    title: "Mauvais type d'huile ou de graisse - Risque de gommage",
    system: "GRAISSAGE",
    severity: "ORANGE",
    diagTime: 10,
    repTime: 1.0,
    partsCost: "220 - 440 DH",
    difficulty: 2,
    description: "Utilisation d'un lubrifiant inapproprié qui s'épaissit ou se fige sous l'effet de l'air comprimé chaud.",
    symptoms: "Soupape oscillante de distribution collée, fonctionnement saccadé du perforateur, démarrage difficile.",
    visualCheck: "Dépôts gommeux ou résidus collants brunâtres à l'intérieur des orifices de commande.",
    soundCheck: "Rythme de frappe paresseux ou hésitant.",
    causes: [
      { cause: "Remplissage du graisseur avec de l'huile moteur usagée ou de la graisse multi-usage épaisse", prob: 80, remedy: "Purger complètement le réservoir et rincer la cellule de percussion au gasoil propre." },
      { cause: "Utilisation d'un lubrifiant de mauvaise viscosité inadapté à la température ambiante de la galerie", prob: 20, remedy: "Purger et recharger avec de l'huile de forage pneumatique de viscosité ISO VG 46 ou 100." }
    ],
    diagnosticSteps: [
      "Préléver un échantillon d'huile du réservoir et vérifier sa viscosité et sa propreté.",
      "Démonter le tiroir de distribution pour évaluer si le film lubrifiant colle au toucher."
    ],
    partsInvolved: "Aucun remplacement si rincé à temps.",
    prevention: "Stocker l'huile de forage dans un baril étiqueté propre réservé à cet usage.",
    pitfall: "Utiliser de la graisse au cuivre qui détruit les joints en polymère.",
    costOfError: "Obligation de démonter intégralement l'appareil pour un nettoyage complet de 4h en atelier.",
    crossReferences: "Voir aussi Panne 1.1 (Piston immobile)"
  },
  {
    id: "5.3",
    title: "Refroidissement insuffisant - Température excessive",
    system: "GRAISSAGE",
    severity: "ORANGE",
    diagTime: 10,
    repTime: 1.0,
    partsCost: "0 DH",
    difficulty: 2,
    description: "Le perforateur surchauffe rapidement au-delà de 80°C en raison d'un manque de fluide d'injection ou d'air d'évent.",
    symptoms: "La carrosserie extérieure est brûlante au toucher, de la fumée d'huile s'échappe de l'appareil.",
    visualCheck: "Fumées blanches d'huile évaporée à la sortie du nez ou de l'échappement.",
    soundCheck: "Changement de tonalité de frappe devenant plus métallique et sèche.",
    causes: [
      { cause: "Robinet d'arrivée d'eau d'injection ou de soufflage partiellement fermé", prob: 65, remedy: "Ouvrir à 100% le robinet d'eau ou régler le débitmètre d'eau amont." },
      { cause: "Canal interne de balayage d'eau bouché par du calcaire", prob: 25, remedy: "Nettoyer l'orifice d'injection de la queue de forage avec une tige métallique." },
      { cause: "Forage à sec prolongé sans injection d'eau autorisée", prob: 10, remedy: "Activer le balayage d'air permanent si le forage à l'eau est interdit." }
    ],
    diagnosticSteps: [
      "Mesurer la température de service du carter central.",
      "Vérifier si le débit d'eau en sortie de taillant est suffisant et régulier."
    ],
    partsInvolved: "Aucun remplacement.",
    prevention: "Utiliser un système d'eau clarifiée de mine et filtrer l'alimentation d'eau.",
    pitfall: "Tenter de refroidir le perforateur chaud en versant brutalement un seau d'eau froide dessus.",
    costOfError: "Le choc thermique sévère provoque la fissure instantanée du carter cylindre en acier spécial (16 000 DH).",
    crossReferences: "Voir aussi Panne 4.4 (Orifices de refroidissement bouchés)"
  },
  {
    id: "5.4",
    title: "Eau présente dans le circuit d'air - Givre ou rouille",
    system: "GRAISSAGE",
    severity: "VERT",
    diagTime: 10,
    repTime: 0.5,
    partsCost: "0 DH",
    difficulty: 1,
    description: "Infiltration excessive d'eau de condensation provenant du réseau de galerie dans l'alimentation d'air.",
    symptoms: "Le perforateur givre à l'échappement, perd sa cadence ou s'arrête par intermittence.",
    visualCheck: "Présence de gouttelettes d'eau mêlées à l'huile lubrifiante sur le nez de l'outil.",
    soundCheck: "Bruit de percussion irrégulier, étouffé par saccades.",
    causes: [
      { cause: "Omission de purger le réservoir du compresseur ou les purgeurs automatiques de galerie", prob: 70, remedy: "Ouvrir les vannes de purge du compresseur et laisser couler jusqu'à obtenir de l'air sec." },
      { cause: "Défaut d'un sécheur d'air sur la station de compression", prob: 30, remedy: "Vérifier et réparer le sécheur d'air à adsorption ou à réfrigération." }
    ],
    diagnosticSteps: [
      "Débrancher l'arrivée d'air du perforateur, pointer le flexible vers le sol et ouvrir brièvement la vanne d'air pour observer si de l'eau jaillit."
    ],
    partsInvolved: "Aucun remplacement.",
    prevention: "Purger systématiquement la ligne avant chaque début de poste de travail.",
    pitfall: "Forer avec de l'air chargé d'eau, ce qui détruit le film lubrifiant sur le piston.",
    costOfError: "Usure accélérée des composants internes, corrosion des tiroirs de distribution (3 700 DH de pièces).",
    crossReferences: "Voir aussi Panne 1.3 (Percussion irrégulière)"
  },
  {
    id: "5.5",
    title: "Surchauffe générale de l'appareil (Manque graisse + eau)",
    system: "GRAISSAGE",
    severity: "ORANGE",
    diagTime: 10,
    repTime: 1.5,
    partsCost: "130 - 2 150 DH",
    difficulty: 3,
    description: "Élévation globale et critique de la température de fonctionnement due à la conjonction d'un graissage défaillant et d'un refroidissement nul.",
    symptoms: "Odeur caractéristique de graisse brûlée, fumées bleutées, dilatation bloquant le piston.",
    visualCheck: "Teinte brunâtre prise par le métal externe, joints frontaux fondus visibles de l'extérieur.",
    soundCheck: "Percussion faiblissante s'étouffant rapidement.",
    causes: [
      { cause: "Graisseur de ligne vide couplé à une coupure accidentelle du circuit d'eau de balayage", prob: 80, remedy: "Purger et réparer les deux circuits. Remplacer les joints frontaux endommagés." },
      { cause: "Paramètres de poussée du berceau trop élevés sollicitant excessivement l'outil", prob: 20, remedy: "Réduire la force d'avance du berceau au pupitre." }
    ],
    diagnosticSteps: [
      "Vérifier le bon fonctionnement des deux circuits (huile et eau) simultanément.",
      "Inspecter la bague de nez (bushing) à la recherche de déformations thermiques."
    ],
    partsInvolved: "Joint à lèvre de nez (Ref: MT-567049), Bague de guidage (Ref: MT-456035) si déformée.",
    prevention: "Installer un coupe-circuit automatique de sécurité indexé sur le débit d'eau.",
    pitfall: "Repartir immédiatement après remplissage d'huile sans laisser refroidir naturellement la machine.",
    costOfError: "Serrage mécanique définitif du piston au redémarrage (grippage total exigeant le changement du piston de 9 350 DH).",
    crossReferences: "Voir aussi Panne 5.3 (Refroidissement insuffisant)"
  },

  // 6. FIXATION ET PORTEUR (6.1 to 6.4)
  {
    id: "6.1",
    title: "Boulons de fixation du berceau cassés ou desserrés",
    system: "FIXATION",
    severity: "ROUGE",
    diagTime: 5,
    repTime: 1.0,
    partsCost: "160 - 500 DH",
    difficulty: 2,
    description: "Les vis maintenant le perforateur solidement fixé sur la platine du berceau d'avance ont cassé ou se sont desserrées sous l'impact.",
    symptoms: "Le perforateur bouge anormalement de gauche à droite sur son support lors du forage.",
    visualCheck: "Têtes de boulons manquantes ou filetages foirés visibles sur la platine de fixation.",
    soundCheck: "Claquement irrégulier lourd localisé sous la machine.",
    causes: [
      { cause: "Omission d'appliquer du frein filet fort (Loctite 270) lors du montage précédent", prob: 60, remedy: "Remplacer les boulons de classe 10.9 par des neufs, appliquer du frein filet et serrer au couple spécifié." },
      { cause: "Absence de rondelles élastiques de sécurité sous les têtes de vis", prob: 30, remedy: "Installer des rondelles élastiques conformes." },
      { cause: "Vibrations anormales dues à un jeu excessif des patins du berceau", prob: 10, remedy: "Régler le jeu des cales de glissement du berceau." }
    ],
    diagnosticSteps: [
      "Tenter de faire bouger le perforateur manuellement à l'aide d'un levier métallique.",
      "Vérifier la tension de chaque vis à l'aide d'une clé dynamométrique."
    ],
    partsInvolved: "Boulons de fixation classe 10.9 (M14) de rechange.",
    prevention: "Vérifier visuellement l'intégrité de la boulonnerie à chaque début de poste.",
    pitfall: "Resserrer un boulon desserré sans nettoyer le filetage ni réappliquer de frein filet.",
    costOfError: "Le perforateur se détache du berceau en plein forage, provoquant la casse des tirants latéraux (1 300 DH de dégâts).",
    crossReferences: "Voir aussi Panne 6.3 (Berceau fissuré)"
  },
  {
    id: "6.2",
    title: "Suspension ou silentbloc caoutchouc usé ou déchiré",
    system: "FIXATION",
    severity: "ORANGE",
    diagTime: 5,
    repTime: 1.5,
    partsCost: "880 - 1 650 DH",
    difficulty: 2,
    description: "Les éléments d'amortissement flexibles reliant le perforateur au support berceau ont perdu leur élasticité ou se sont déchirés.",
    symptoms: "Vibrations extrêmement intenses transmises au bras de la foreuse, fatigue rapide des flexibles hydrauliques connexes.",
    visualCheck: "Blocs de caoutchouc craquelés, fissurés ou totalement coupés.",
    soundCheck: "Grincement ou bruit métallique sourd lors des mouvements de translation.",
    causes: [
      { cause: "Vieillissement naturel du caoutchouc accéléré par le contact permanent avec l'huile de forage", prob: 75, remedy: "Remplacer le jeu d'amortisseurs/silentblocs en caoutchouc." },
      { cause: "Surchauffe générale transmettant de la chaleur aux éléments de suspension", prob: 25, remedy: "Corriger les problèmes de surchauffe et remplacer les silentblocs cuits." }
    ],
    diagnosticSteps: [
      "Inspecter visuellement les amortisseurs sous tension lors des phases d'avance et de recul.",
      "Vérifier si le perforateur touche directement les butées métalliques fixes du berceau."
    ],
    partsInvolved: "Silentblocs amortisseurs en caoutchouc de berceau.",
    prevention: "Nettoyer les silentblocs pour enlever l'huile accumulée après chaque poste.",
    pitfall: "Forer avec des suspensions détruites en ignorant les vibrations transmises au bras.",
    costOfError: "Fissure de fatigue sur la structure métallique du bras de la foreuse exigeant des travaux de soudure lourds (11 000 DH d'immobilisation).",
    crossReferences: "Voir aussi Panne 6.1 (Boulons desserrés)"
  },
  {
    id: "6.3",
    title: "Berceau de guidage (Cradle) déformé ou fissuré",
    system: "FIXATION",
    severity: "ROUGE",
    diagTime: 10,
    repTime: 3.0,
    partsCost: "3 850 - 10 450 DH",
    difficulty: 4,
    description: "La structure métallique de guidage supportant le perforateur présente des déformations géométriques ou des micro-fissures de fatigue.",
    symptoms: "Le perforateur coince ou frotte de manière excessive sur un point précis de la glissière, déviation du trou.",
    visualCheck: "Fissures visibles sur les soudures de la platine support, vrillage du berceau.",
    soundCheck: "Grincement aigu lors du passage sur la zone déformée.",
    causes: [
      { cause: "Efforts de poussée asymétriques continus ou choc accidentel contre la paroi rocheuse", prob: 65, remedy: "Démonter la platine support et ressouder les fissures après chanfreinage." },
      { cause: "Usure extrême des cales de glissement latérales provoquant des chocs physiques importants", prob: 35, remedy: "Remplacer les patins d'usure en bronze ou en plastique technique." }
    ],
    diagnosticSteps: [
      "Faire glisser le marteau sur toute la longueur du berceau sans forer pour détecter les points durs.",
      "Vérifier la rectitude du profilé de guidage à l'aide d'une règle métallique de mécanicien."
    ],
    partsInvolved: "Patins d'usure de berceau, soudures de structure.",
    prevention: "Graisser quotidiennement les glissières du berceau de guidage.",
    pitfall: "Serrer excessivement les patins de glissement pour rattraper le jeu sans changer les patins usés.",
    costOfError: "Blocage mécanique brusque de la machine détruisant le moteur de translation du berceau (4 400 DH).",
    crossReferences: "Voir aussi Panne 6.4 (Vibrations excessives)"
  },
  {
    id: "6.4",
    title: "Vibrations excessives transmises au bras de l'engin",
    system: "FIXATION",
    severity: "VERT",
    diagTime: 10,
    repTime: 1.0,
    partsCost: "0 - 1 650 DH",
    difficulty: 2,
    description: "Les chocs de percussion ne sont plus correctement absorbés par le système de suspension, fatiguant les structures amont.",
    symptoms: "Le tableau de bord de la foreuse vibre intensément, desserrage fréquent des raccords hydrauliques.",
    visualCheck: "Mouvement d'oscillation anormal du bras de l'engin pendant le forage.",
    soundCheck: "Résonance sourde forte se propageant dans toute la structure métallique.",
    causes: [
      { cause: "Absence de pré-tension correcte sur les amortisseurs de suspension de berceau", prob: 60, remedy: "Ajuster la pré-tension des vis de suspension selon les spécifications du constructeur." },
      { cause: "Forage dans une zone de roche fracturée ou tendre sans adapter la puissance de frappe", prob: 40, remedy: "Réduire la pression de percussion du marteau sur le pupitre de commande." }
    ],
    diagnosticSteps: [
      "Mesurer le jeu dynamique des amortisseurs métalliques ou élastomères.",
      "Inspecter l'état des articulations du bras de la foreuse (rechercher des jeux excessifs)."
    ],
    partsInvolved: "Silentblocs d'amortissement, bagues d'articulation de bras.",
    prevention: "Adapter toujours l'énergie d'impact au type de terrain foré.",
    pitfall: "Ignorer les vibrations en pensant qu'un engin minier doit forcément vibrer.",
    costOfError: "Rupture par fatigue des conduites hydrauliques rigides sur le bras (perte de fluide et arrêt de 3h).",
    crossReferences: "Voir aussi Panne 6.2 (Suspension usée)"
  },

  // 7. OUTILLAGE ET CONSOMMABLES (7.1 to 7.3)
  {
    id: "7.1",
    title: "Outil inadapté au type de roche - Usure prématurée",
    system: "OUTILLAGE",
    severity: "VERT",
    diagTime: 5,
    repTime: 0.5,
    partsCost: "990 - 3 300 DH",
    difficulty: 1,
    description: "Utilisation d'un taillant ou d'une queue de forage inadaptée à la dureté ou à l'abrasivité du terrain.",
    symptoms: "Vitesse de pénétration très faible, usure extrêmement rapide des inserts en carbure de tungstène.",
    visualCheck: "Plats importants visibles sur les boutons en carbure du taillant après seulement quelques mètres.",
    soundCheck: "Son d'impact très clair résonnant indiquant que l'outil rebondit sans briser la roche.",
    causes: [
      { cause: "Sélection d'un taillant conçu pour roche tendre (gros boutons espacés) dans du quartzite très dur", prob: 80, remedy: "Remplacer le taillant par un modèle adapté aux roches dures (boutons denses à profil balistique)." },
      { cause: "Pression de poussée du berceau inadaptée ne maintenant pas le taillant en contact franc", prob: 20, remedy: "Réajuster la poussée au pupitre de commande." }
    ],
    diagnosticSteps: [
      "Préléver le taillant usé et examiner le faciès d'usure des pastilles de carbure.",
      "Consulter la fiche géologique de la galerie pour identifier la dureté de la roche (échelle de Mohs)."
    ],
    partsInvolved: "Taillant de forage (consommable).",
    prevention: "Former les foreurs à la sélection des taillants selon les types de terrains rencontrés.",
    pitfall: "Forer 'à tout prix' avec le seul taillant disponible dans la caisse.",
    costOfError: "Destruction d'un taillant de 3 300 DH en moins de 10 mètres de forage et perte de temps.",
    crossReferences: "Voir aussi Panne 7.2 (Outil mal affûté)"
  },
  {
    id: "7.2",
    title: "Taillant émoussé ou mal affûté - Rebond destructeur",
    system: "OUTILLAGE",
    severity: "ORANGE",
    diagTime: 5,
    repTime: 0.5,
    partsCost: "0 DH",
    difficulty: 1,
    description: "Les boutons en carbure du taillant ont perdu leur profil tranchant dôme ou balistique, agissant comme un marteau plat.",
    symptoms: "Chute de vitesse de pénétration, surchauffe de l'outil et vibrations intenses renvoyées au marteau.",
    visualCheck: "Pastilles de carbure plates et polies comme un miroir, micro-fissures sur le corps en acier du taillant.",
    soundCheck: "Bruit de frappe sourd manquant d'agressivité.",
    causes: [
      { cause: "Dépassement du métrage de forage recommandé sans affûtage intermédiaire", prob: 90, remedy: "Démonter le taillant et procéder à l'affûtage des boutons à l'aide d'une meuleuse boart dédiée." },
      { cause: "Absence d'eau de balayage accélérant l'échauffement thermique des carbures", prob: 10, remedy: "Vérifier l'arrivée d'eau au taillant." }
    ],
    diagnosticSteps: [
      "Inspecter la pastille centrale du taillant à la recherche d'une usure plane de plus de 1/3 de son diamètre d'origine."
    ],
    partsInvolved: "Aucun remplacement si ré-affûtable, sinon taillant neuf.",
    prevention: "Établir un protocole d'affûtage systématique tous les 30 à 50 mètres de forage selon la roche.",
    pitfall: "Continuer de forer avec un taillant plat en espérant que la roche va s'attendrir.",
    costOfError: "Fissure de fatigue sur le piston (9 350 DH) due aux ondes de choc réfléchies renvoyées directement dans le perforateur.",
    crossReferences: "Voir aussi Panne 2.3 (Piston fissuré)"
  },
  {
    id: "7.3",
    title: "Fleuret tordu ou dévié - Coincement dans le trou",
    system: "OUTILLAGE",
    severity: "ROUGE",
    diagTime: 5,
    repTime: 1.0,
    partsCost: "1 650 - 3 300 DH",
    difficulty: 2,
    description: "La tige du fleuret présente une déformation géométrique axiale (courbure) empêchant une rotation libre dans le trou.",
    symptoms: "Le fleuret se coince fréquemment lors de la rotation, vibrations asymétriques fortes, déviation importante du forage.",
    visualCheck: "Frottements circulaires marqués sur un seul côté de la tige du fleuret, faux-rond visible lors de la rotation lente à vide.",
    soundCheck: "Grincement ou bruit de frottement latéral intense provenant de l'intérieur du trou de forage.",
    causes: [
      { cause: "Poussée excessive du berceau sur une roche fracturée déviant la pointe du taillant", prob: 60, remedy: "Remplacer le fleuret tordu et réduire la pression de poussée dans les zones de failles." },
      { cause: "Choc accidentel sur le fleuret lors du repositionnement du bras de l'engin", prob: 30, remedy: "Remplacer le fleuret et sensibiliser l'opérateur aux manœuvres de précision." },
      { cause: "Mauvais guidage de la lunette de nez du berceau d'avance", prob: 10, remedy: "Ajuster ou remplacer la bague de guidage de la lunette de nez." }
    ],
    diagnosticSteps: [
      "Extraire le fleuret du trou et le faire rouler sur une surface plane pour apprécier sa courbure.",
      "Mesurer le voile axial du fleuret à l'aide d'une règle rectifiée."
    ],
    partsInvolved: "Fleuret de forage (Ref: interchangeable).",
    prevention: "Réduire la puissance d'avance et de rotation dès l'entrée dans des terrains fracturés ou argileux.",
    pitfall: "Tenter de redresser le fleuret tordu à chaud au chalumeau et à la masse.",
    costOfError: "Le fleuret se rompt net en plein forage à 2m de profondeur (perte du trou et du taillant : 4 950 DH de pertes cumulées).",
    crossReferences: "Voir aussi Panne 3.3 (Queue de forage mal centrée)"
  }
];
