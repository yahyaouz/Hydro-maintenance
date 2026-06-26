export interface EpirocSt7Panne {
  id: string;
  system: string;
  title: string;
  severity: "ROUGE" | "JAUNE" | "VERT";
  repTime: number; // in hours
  symptoms: string;
  cause: string;
  action: string;
  tip?: string;
  casReel?: string;
}

export const EPIROC_ST7_SYSTEMS = [
  { id: "SYS1", label: "Moteur Cummins QSB 6.7", color: "#2E7D32", shape: "◼", shapeName: "Carré", text: "text-emerald-500", bg: "bg-emerald-950/40 border-emerald-500/30" },
  { id: "SYS2", label: "Transmission Funk DF150", color: "#6A1B9A", shape: "⬢", shapeName: "Hexagone", text: "text-purple-500", bg: "bg-purple-950/40 border-purple-500/30" },
  { id: "SYS3", label: "Hydraulique Rexroth A10VO", color: "#F9A825", shape: "◆", shapeName: "Losange", text: "text-yellow-500", bg: "bg-yellow-950/40 border-yellow-500/30" },
  { id: "SYS4", label: "Direction & Articulation", color: "#1565C0", shape: "●", shapeName: "Cercle", text: "text-blue-500", bg: "bg-blue-950/40 border-blue-500/30" },
  { id: "SYS5", label: "Freinage SAHR Force Cooled", color: "#C62828", shape: "▲", shapeName: "Triangle", text: "text-rose-500", bg: "bg-rose-950/40 border-rose-500/30" },
  { id: "SYS6", label: "RCS (Rig Control System)", color: "#212121", shape: "✚", shapeName: "Croix", text: "text-slate-300", bg: "bg-slate-900 border-slate-700" },
  { id: "SYS7", label: "Électrique & Électronique", color: "#EF6C00", shape: "☼", shapeName: "Soleil", text: "text-orange-500", bg: "bg-orange-950/40 border-orange-500/30" },
  { id: "SYS8", label: "RRC & Automation", color: "#00838F", shape: "★", shapeName: "Étoile", text: "text-cyan-500", bg: "bg-cyan-950/40 border-cyan-500/30" },
  { id: "SYS9", label: "Cabine & Confort", color: "#4E342E", shape: "■", shapeName: "Bloc", text: "text-amber-700", bg: "bg-amber-950/40 border-amber-500/30" },
  { id: "SYS10", label: "Godet, Boom & Auto-Lube", color: "#EF6C00", shape: "☼", shapeName: "Soleil", text: "text-orange-600", bg: "bg-orange-900/30 border-orange-700" },
  { id: "SYS11", label: "Sécurité & Ansul Checkfire", color: "#C62828", shape: "▲", shapeName: "Triangle", text: "text-red-600", bg: "bg-red-950/40 border-red-500/30" }
];

export const EPIROC_ST7_GLOSSAIRE = [
  { term: "RCS", def: "Rig Control System. Le cerveau électronique de l'Epiroc ST7. Écran tactile et bus CAN." },
  { term: "Funk DF150", def: "Transmission powershift à commande électronique intégrée. 4 rapports avant/arrière." },
  { term: "De-clutch", def: "Bouton d'annulation d'effort de traction au freinage pour optimiser le chargement hydraulique." },
  { term: "Load Sensing", def: "Système de régulation de pompe hydraulique s'ajustant uniquement au débit demandé par les vérins." },
  { term: "Rexroth A10VO", def: "Pompe hydraulique principale à pistons axiaux à cylindrée variable." },
  { term: "SAHR", def: "Spring Applied Hydraulic Released. Freins serrés par ressorts puissants et desserrés par pression hydraulique." },
  { term: "Force Cooled", def: "Refroidissement forcé des disques de frein par un flux d'huile continu refroidi par radiateur." },
  { term: "Brake-test", def: "Procédure automatisée par le RCS pour valider la puissance d'arrêt des freins de service et de parc." },
  { term: "Traction control", def: "Dispositif électronique RCS limitant le patinage des roues Kessler de l'engin." },
  { term: "Ride control", def: "Suspension oléopneumatique du bras (boom) limitant les oscillations lors du roulage chargé." },
  { term: "Soft stop", def: "Ralentissement automatique de fin de course des vérins de levage et de direction." },
  { term: "Door interlock", def: "Sécurité coupant les mouvements et serrant les freins si la porte de la cabine s'ouvre." },
  { term: "Leak detection", def: "Calculateur RCS surveillant le débit d'huile retour pour détecter les micro-fuites." },
  { term: "Load weighing", def: "Système de pesage automatique embarqué mesurant le tonnage chargé par godet." },
  { term: "RRC", def: "Radio Remote Control. Commande à distance visuelle ou par caméras embarquées." },
  { term: "Téléremote", def: "Pilotage à distance de l'engin depuis la surface via fibre optique et caméras." },
  { term: "Automation", def: "Modes de roulage ou de chargement autonomes gérés par l'ordinateur de bord." },
  { term: "DCL", def: "Diesel Catalyst Light. Système de traitement d'échappement pour les gaz toxiques souterrains." },
  { term: "EOD", def: "Eject Ore Discharge. Godet éjecteur spécial pour galeries basses sans hauteur de levage." },
  { term: "ROPS/FOPS", def: "Norme de résistance de cabine contre le retournement (ROPS) et les chutes de pierres (FOPS)." },
  { term: "V-tube core", def: "Radiateur à tubes individuels L&M remplaçables unitairement en cas d'impact de pierre." },
  { term: "Charge air cooler", def: "Échangeur air-air refroidissant l'air sortant du turbocompresseur Cummins." },
  { term: "No spin", def: "Différentiel autobloquant monté sur l'essieu avant Kessler pour la pénétration maximale." },
  { term: "Planetary wheel end", def: "Réducteurs planétaires finaux logés dans chaque moyeu de roue Kessler." },
  { term: "Common Rail", def: "Rampe commune d'injection de gazole Cummins pressurisée à plus de 1600 bar." },
  { term: "Accumulateur azote", def: "Bouteille métallique stockant l'énergie de freinage sous pression d'azote." },
  { term: "Orbitrol", def: "Valve hydrostatique de direction guidée par le volant ou le joystick cabine." },
  { term: "Filtre 2μm", def: "Filtre séparateur primaire Cummins bloquant les micro-particules abrasives d'eau et d'argile." },
  { term: "Filtre 12μm", def: "Filtre de retour hydraulique retenant les impuretés du circuit Rexroth." },
  { term: "Bouton Ansul", def: "Déclencheur manuel externe ou interne du système extincteur d'incendie moteur." },
  { term: "Vérin Hoist", def: "Vérin hydraulique principal assurant le levage du bras porte-godet." },
  { term: "Vérin Dump", def: "Vérin hydraulique de benne assurant le cavage et déversement du godet." },
  { term: "Kessler D71", def: "Série d'essieux lourds rigides à haute tolérance d'impacts." },
  { term: "Joint tournant", def: "Collecteur rotatif hydraulique reliant le châssis avant et le châssis arrière articulés." },
  { term: "Bus CAN", def: "Réseau de communication multiplexé reliant tous les calculateurs de l'engin." },
  { term: "ECM", def: "Engine Control Module. Le calculateur d'injection de carburant Cummins." },
  { term: "Transducteur", def: "Capteur électrique convertissant une pression hydraulique en signal de tension 0-5V." },
  { term: "Clapet anti-retour", def: "Soupape interdisant le reflux d'huile hydraulique ou de carburant." },
  { term: "Electrovanne PWM", def: "Vanne proportionnelle contrôlée par impulsions électriques variables pour réguler le débit." },
  { term: "Soupape de décharge", def: "Limiteur de sécurité s'ouvrant en cas de surpression critique pour protéger le circuit." },
  { term: "Viscosité 15W40", def: "Indice d'huile moteur Cummins assurant la lubrification à chaud en ambiance minière." },
  { term: "EP NLGI 2", def: "Spécification de graisse Extrême Pression au lithium pour axes d'articulation lourds." },
  { term: "Vibration cabine", def: "Fréquences vibratoires amorties par les plots élastomères sous la cabine ST7." },
  { term: "Lincoln Auto-Lube", def: "Centrale automatique distribuant de la graisse sur 30 points à intervalles réguliers." },
  { term: "Ansul Checkfire", def: "Système de détection automatique d'incendie par fil thermosensible dans le compartiment Deutz/Cummins." },
  { term: "Tension cardan", def: "Alignement requis de l'arbre central Funk-Kessler pour éviter de sectionner les croisillons." },
  { term: "Limaille métallique", def: "Résidus d'acier révélateurs de la destruction imminente d'une boîte ou d'un réducteur." },
  { term: "Grid Heater", def: "Résistance électrique intégrée à l'admission d'air pour préchauffer l'air Cummins." },
  { term: "Fan Drive", def: "Actionnement hydraulique variable du ventilateur de refroidissement." },
  { term: "Accumulateur HASR", def: "Accumulateur de sécurité de secours assurant 7 freinages complets après arrêt moteur." },
  { term: "Capteur vilebrequin", def: "Indicateur magnétique de régime et calage d'injection moteur Cummins." },
  { term: "Joint spi", def: "Joint à lèvre d'arbre tournant évitant la fuite d'huile de boîte." },
  { term: "Cylindre récepteur", def: "Piston de serrage mécanique sur disques SAHR." },
  { term: "Filtre reniflard", def: "Média de mise à l'air libre du carter pour éviter les surpressions d'air internes." },
  { term: "Vanne d'isolement", def: "Robinet manuel condamnant l'arrivée d'huile ou de gazole en sécurité." },
  { term: "Manostat", def: "Capteur de pression à contact sec envoyant un signal binaire ON/OFF au RCS." },
  { term: "ATEX", def: "Atmosphère Explosible. Équipement certifié anti-étincelle pour mines grisouteuses." },
  { term: "Amiante de frein", def: "Absente sur le ST7 moderne. Remplacée par des wet discs non toxiques." },
  { term: "Pression compensateur", def: "Réglage de marge hydraulique déterminant la vitesse de réaction des mouvements." },
  { term: "Check engine", def: "Alerte générique d'anomalie Cummins requérant une lecture de code d'erreur." }
];

export const EPIROC_ST7_VOYANTS = [
  { name: "Pression d'huile Cummins", symbol: "▲ ROUGE (Triangle)", normal: "Éteint", abnormal: "Allumé en rouge", action: "Arrêt immédiat moteur. Niveau bas ou pompe morte.", link: "1.1.4.A" },
  { name: "Température d'eau Cummins", symbol: "▲ ROUGE (Triangle)", normal: "Éteint", abnormal: "Fixe au-dessus de 102°C", action: "Réduire la charge. Si >108°C, arrêt complet requis.", link: "1.1.3.A" },
  { name: "Surchauffe Transmission", symbol: "⬢ VIOLET (Hexagone)", normal: "Éteint", abnormal: "Allumé au-dessus de 120°C", action: "Passer au point mort. Laisser tourner au ralenti pour refroidir.", link: "2.2.5.A" },
  { name: "Pression Accumulateur Frein", symbol: "▲ ROUGE (Triangle)", normal: "Éteint (Pression > 140 bar)", abnormal: "Allumé (Pression < 120 bar)", action: "Arrêter l'engin au pied de rampe. Serrer le frein de parc.", link: "5.3.1.A" },
  { name: "Brake Test RCS", symbol: "✚ NOIR/BLANC (Croix)", normal: "Éteint ou Vert", abnormal: "Rouge clignotant", action: "Exécuter la séquence de test automatique de freinage.", link: "5.2.1.A" },
  { name: "Colmatage Filtre Air", symbol: "◆ JAUNE (Losange)", normal: "Éteint", abnormal: "Jaune fixe", action: "Changer le filtre primaire Cummins en fin de poste.", link: "1.1.5.B" },
  { name: "Colmatage Filtre Hydraulique", symbol: "◆ JAUNE (Losange)", normal: "Éteint", abnormal: "Jaune clignotant", action: "Remplacer l'élément 12 microns au retour atelier.", link: "3.1.2.A" },
  { name: "Door Interlock Actif", symbol: "✚ NOIR/BLANC (Croix)", normal: "Éteint", abnormal: "Jaune fixe", action: "Fermer correctement la porte de la cabine cabine.", link: "7.4.1.A" },
  { name: "Charge Alternateur 24V", symbol: "☼ ORANGE (Soleil)", normal: "Éteint", abnormal: "Rouge ou Orange en continu", action: "Vérifier la courroie d'accessoire ou l'alternateur.", link: "7.1.2.A" },
  { name: "Leak Detection Hydraulique", symbol: "◆ JAUNE (Losange)", normal: "Éteint", abnormal: "Orange clignotant", action: "Inspecter visuellement l'engin pour localiser la fuite.", link: "3.1.4.A" }
];

export const EPIROC_ST7_CUMMINS_CODES = [
  { code: "SPN 111 / FMI 2", desc: "Perte de signal du capteur de position de vilebrequin. Démarrage impossible." },
  { code: "SPN 157 / FMI 3", desc: "Tension trop élevée sur le capteur de pression de rampe HPCR. Mode dégradé." },
  { code: "SPN 100 / FMI 1", desc: "Pression d'huile moteur extrêmement basse détectée. Risque de serrage." },
  { code: "SPN 110 / FMI 0", desc: "Température de liquide de refroidissement élevée. Surchauffe." },
  { code: "SPN 629 / FMI 12", desc: "Erreur matérielle interne de l'ordinateur d'injection Cummins ECM." },
  { code: "SPN 190 / FMI 0", desc: "Régime de rotation Cummins en surrégime critique." },
  { code: "SPN 94 / FMI 1", desc: "Pression de livraison de la pompe de transfert de gazole basse." },
  { code: "SPN 102 / FMI 2", desc: "Donnée de capteur de pression d'admission d'air turbo erratique." },
  { code: "SPN 412 / FMI 3", desc: "Sonde de température des gaz d'échappement EGR en court-circuit." },
  { code: "SPN 5019 / FMI 4", desc: "Défaut de commande électrique du Grid Heater d'admission." }
];

export const EPIROC_ST7_RCS_CODES = [
  { code: "RCS-T01", desc: "Décalibrage de modulation d'embrayage Funk DF150. Secousses." },
  { code: "RCS-T02", desc: "Absence de signal du capteur magnétique de vitesse de sortie boîte." },
  { code: "RCS-T03", desc: "Court-circuit à la masse sur solénoïde de commande 1ère vitesse." },
  { code: "RCS-T07", desc: "Interrupteur de pression du bouton De-clutch inactif ou bloqué ouvert." },
  { code: "RCS-T09", desc: "Mesure de température d'huile de transmission supérieure à 120°C." },
  { code: "RCS-B01", desc: "Échec du test automatique de freinage dynamique ou de stationnement." },
  { code: "RCS-B02", desc: "Pression accumulateurs de freins inférieure à la plage d'alarme de 120 bar." },
  { code: "RCS-B03", desc: "Ventilateur de refroidissement forcé des freins (Fan cooling) inactif." },
  { code: "RCS-H01", desc: "Seuil d'alarme de détection de fuite hydraulique dépassé." },
  { code: "RCS-C01", desc: "Incohérence du signal de fin de course de porte cabine ROPS." },
  { code: "RCS-C04", desc: "Perte de liaison CAN avec le module de contrôle de traction." },
  { code: "RCS-CAN01", desc: "Panne générale de ligne bus CAN centrale. Mode de secours uniquement." }
];

export const EPIROC_ST7_ERRORS = [
  { id: 1, text: "Forcer la pénétration dans le front de taille sans activer le No-spin." },
  { id: 2, text: "Laisser tourner le moteur Cummins à plein régime à l'arrêt complet (chauffe turbo)." },
  { id: 3, text: "Démarrer l'engin avec une porte de cabine mal verrouillée (blocage door interlock)." },
  { id: 4, text: "Négliger de purger quotidiennement l'eau accumulée dans les préfiltres Cummins." },
  { id: 5, text: "Remplacer l'huile hydraulique Rexroth par de l'huile de récupération non filtrée." },
  { id: 6, text: "Ignorer un échec automatique de 'Brake-test' et descendre la rampe de mine." },
  { id: 7, text: "Laisser le ventilateur hydraulique à vitesse variable colmaté par les boues." },
  { id: 8, text: "Serrer les raccords hydrauliques haute pression de 24 MPa sous charge active." },
  { id: 9, text: "Débrancher la batterie ou couper l'isolation switch avec le moteur en marche (ECM grillé)." },
  { id: 10, text: "Forcer le passage des rapports manuellement si le RCS affiche un code d'erreur boîte." },
  { id: 11, text: "Remplir le réservoir d'huile hydraulique ST7 au-dessus de la jauge (débordement à chaud)." },
  { id: 12, text: "Démonter une bouteille d'accumulateur azote sans dépressurisation préalable." },
  { id: 13, text: "Surcharger le godet au-delà de 6 800 kg de charge utile en continu." },
  { id: 14, text: "Utiliser de la graisse standard non-EP sur les rotules de biellette de godet." },
  { id: 15, text: "Nettoyer les tubes radiateurs V-tube core au jet d'eau sous haute pression froide à chaud." },
  { id: 16, text: "Installer une version de firmware RCS non certifiée par l'équipe technique Epiroc." },
  { id: 17, text: "Effectuer un pontage électrique direct (shunter) sur le capteur de porte cabine." },
  { id: 18, text: "Tenter de rouler sans avoir attendu l'alarme de pression freinage (>140 bar)." },
  { id: 19, text: "Désactiver le Ride Control lors des transits rapides sur pistes bosselées." },
  { id: 20, text: "Ignorer les alertes d'usure des disques de frein multiples Kessler." }
];

export const EPIROC_ST7_STOCK = {
  jts: { desc: "Kit joints toriques hydrauliques HP (24 MPa)", qty: 3, ref: "SOU-ST7-JTS" },
  inj: { desc: "Injecteur Common Rail Cummins QSB6.7", qty: 2, ref: "SOU-ST7-INJ" },
  pump_hp: { desc: "Pompe d'injection HPCR Cummins", qty: 1, ref: "SOU-ST7-PHPC" },
  filt_air: { desc: "Filtre à air primaire Fleetguard", qty: 4, ref: "SOU-ST7-FAIR" },
  filt_fuel: { desc: "Filtres carburant 2μm primaire + 3μm secondaire", qty: 6, ref: "SOU-ST7-FFUE" },
  filt_hyd: { desc: "Cartouche de retour hydraulique 12μm", qty: 5, ref: "SOU-ST7-FHYD" },
  disc_sahr: { desc: "Jeu de disques de frein SAHR Kessler", qty: 2, ref: "SOU-ST7-DSAH" },
  plq_sahr: { desc: "Plaquettes d'étriers SAHR", qty: 3, ref: "SOU-ST7-PSAH" },
  accum_az: { desc: "Accumulateur à azote de secours frein", qty: 2, ref: "SOU-ST7-AAZO" },
  pump_rex: { desc: "Pompe pistons Rexroth A10VO reconditionnée", qty: 1, ref: "SOU-ST7-PREX" },
  capt_door: { desc: "Capteur magnétique de porte cabine", qty: 2, ref: "SOU-ST7-CDOO" },
  conv_funk: { desc: "Convertisseur de couple Funk DF150", qty: 1, ref: "SOU-ST7-CFUN" }
};

export const EPIROC_ST7_PROCEDURES = [
  {
    id: "PROC1",
    title: "Changement de filtre hydraulique 12μm (Plein-flux)",
    steps: [
      "Placer le Scooptram sur une aire plate et plane, baisser le godet à plat sur le sol.",
      "Arrêter le moteur Cummins QSB6.7 et retirer la clé de contact.",
      "Activer l'isolation de batterie générale (Lockout-tagout).",
      "Dévisser lentement le bouchon de purge du réservoir hydraulique de 111 L pour libérer la pression d'air interne.",
      "Placer un bac de vidange de 10 L sous le corps du filtre de retour.",
      "Dévisser le bol du filtre de retour à l'aide de la clé à sangle spécifique.",
      "Retirer la cartouche 12 microns saturée et inspecter le fond du bol pour détecter toute présence anormale de limaille d'acier.",
      "Nettoyer minutieusement le bol, remplacer le joint torique lubrifié d'huile propre.",
      "Insérer la nouvelle cartouche, remonter le bol et serrer fermement à la main.",
      "Rétablir l'alimentation, démarrer l'engin et tester l'absence de fuites au ralenti."
    ]
  },
  {
    id: "PROC2",
    title: "Dépose du vérin Hoist (Vérin de Levage Bras gauche)",
    steps: [
      "Caler solidement le châssis articulé et le godet à l'aide de madriers adaptés.",
      "Positionner le boom up lock mécanique de sécurité pour bloquer le bras en position haute sécurisée.",
      "Décharger complètement la pression hydraulique accumulée en effectuant des mouvements de joystick moteur coupé.",
      "Fermer la vanne quart-de-tour d'alimentation principale du réservoir hydraulique.",
      "Déconnecter les flexibles hydrauliques haute pression raccordés au vérin Hoist (attention au giclement résiduel). Placer des bouchons rigides.",
      "Dégager l'axe de liaison inférieur côté châssis en retirant sa goupille de blocage et son circlip.",
      "Élinguer solidement le corps du vérin à l'aide d'une sangle de levage reliée à un pont d'atelier.",
      "Chasser l'axe d'articulation supérieur en tapant à l'aide d'un jet en bronze pour ne pas marquer les filetages.",
      "Déposer doucement le vérin Hoist et le transférer sur un support d'atelier stable pour la réfection des joints."
    ]
  },
  {
    id: "PROC3",
    title: "Remplacement et Purge d'un Injecteur Cummins",
    steps: [
      "Mettre en place la procédure LOTO électrique et hydraulique complète.",
      "Nettoyer rigoureusement le couvre-culasse Cummins pour éviter l'entrée de poussière minérale dans les puits d'injection.",
      "Déposer le cache-culbuteurs et débrancher le connecteur électrique de solénoïde de l'injecteur défaillant.",
      "Dévisser l'écrou du raccord rigide d'alimentation haute pression et retirer le tube d'admission.",
      "Dévisser la bride de retenue de l'injecteur et extraire délicatement l'injecteur à l'aide d'un extracteur à inertie.",
      "Vérifier qu'aucune ancienne rondelle pare-feu en cuivre n'est restée bloquée au fond du puits.",
      "Installer le nouvel injecteur avec sa rondelle neuve lubrifiée d'un filet de graisse spéciale.",
      "Serrer la bride d'injecteur au couple d'usine de 35 Nm.",
      "Rebrancher les connexions, remonter le couvre-culasse avec un joint neuf.",
      "Purger l'air du circuit de livraison gazole à l'aide de la pompe de gavage avant démarrage."
    ]
  }
];

export const EPIROC_ST7_COUPLES = [
  { item: "Vis de roues Kessler (M22)", thread: "M22 x 1.5", torque: 680, spec: "Sans graisse, serrage en croix" },
  { item: "Boulons d'articulation centrale", thread: "M30 classe 10.9", torque: 1450, spec: "Loctite 243 requise" },
  { item: "Bride de fixation pompe Rexroth", thread: "M16", torque: 210, spec: "Serrage alterné" },
  { item: "Vis de culasse Cummins QSB6.7", thread: "M12 standard", torque: 120, spec: "Serrage angulaire final 90°" },
  { item: "Écrous de brides de vérins Hoist", thread: "M20", torque: 420, spec: "Contrôle visuel au feutre jaune" },
  { item: "Boulons support de cabine ROPS", thread: "M24 classe 8.8", torque: 710, spec: "Remplacement obligatoire si dépose" }
];

export const EPIROC_ST7_URGENCES = [
  { title: "13.1 Incendie compartiment moteur", desc: "Couper immédiatement le moteur Cummins. Déclencher instantanément le percuteur externe du système extincteur Ansul Checkfire. Évacuer la machine à l'opposé du foyer." },
  { title: "13.2 Perte de direction en marche", desc: "Serrer sans attendre l'interrupteur d'urgence du frein de parc SAHR. Stabiliser l'engin en frottant légèrement le godet contre le parement si nécessaire." },
  { title: "13.3 Fuite de carburant sur le Common Rail", desc: "Arrêter immédiatement l'engin. Interdiction stricte de relancer le moteur Cummins. Le carburant à 1600 bar est hautement inflammable sur les collecteurs chauds." },
  { title: "13.4 Échec du test automatique de frein", desc: "Serrer le frein mécanique de stationnement. Placer des cales physiques sur les deux essieux Kessler. Consigner l'engin et interdire l'utilisation immédiate." }
];

export const EPIROC_ST7_VALEURS = {
  press_oil_idle: { label: "Pression d'huile Cummins (au ralenti)", val: "1.2 - 1.5 bar", alerte: "< 1.0 bar" },
  press_oil_max: { label: "Pression d'huile Cummins (à 2200 RPM)", val: "3.5 - 4.2 bar", alerte: "< 2.8 bar" },
  temp_water_norm: { label: "Température de liquide de refroidissement", val: "83°C - 95°C", alerte: "> 102°C" },
  press_hyd_work: { label: "Pression de service hydraulique Rexroth", val: "22.0 - 24.0 MPa (220-240 bar)", alerte: "> 25.0 MPa" },
  press_hyd_pilot: { label: "Pression de pilotage des joysticks", val: "3.2 MPa (32 bar)", alerte: "< 2.8 MPa" },
  press_sahr_off: { label: "Pression de desserrage des freins SAHR", val: "14.5 - 16.0 MPa (145-160 bar)", alerte: "< 12.0 MPa" },
  charge_alt: { label: "Tension de charge de l'alternateur 140A", val: "27.5V - 28.2V", alerte: "< 25.5V" },
  press_pneu: { label: "Pression des pneus Michelin 17.5x25 L5S", val: "5.5 bar (80 psi)", alerte: "< 4.8 bar" }
};

export const EPIROC_ST7_OUTILS = [
  "Clé dynamométrique industrielle haute capacité (0 - 2000 Nm)",
  "Kit de manomètres d'atelier avec raccords rapides minimess (0-40 MPa)",
  "Appareil de mesure de précharge d'azote pour accumulateurs SAHR",
  "Outil de diagnostic électronique officiel Epiroc (RCS Service Tool)",
  "Extracteur mécanique lourd pour axes d'articulation centrale",
  "Console de programmation Cummins INSITE pour codes SPN/FMI",
  "Clé à sangle métallique robuste pour filtres Fleetguard",
  "Multimètre industriel ATEX certifié pour circuits électriques de mine"
];

export const EPIROC_ST7_SYMPTOMS_INDEX = {
  "Bruits anormaux": [
    "S01 Sifflement aigu à l'accélération (admission d'air turbo fuyarde)",
    "S02 Cognement métallique interne au bloc Cummins (bielle ou injecteur grippé)",
    "S03 Grincement strident lors des virages (articulation sèche ou paliers HS)",
    "S04 Grondement sourd continu sous la cabine (croisillon de cardan usé)"
  ],
  "Fumées d'échappement": [
    "S05 Émission de fumée noire épaisse continue (admission d'air bouchée ou injecteur fuyard)",
    "S06 Nuage de fumée blanche persistante au démarrage (présence d'eau ou préchauffage HS)",
    "S07 Fumée bleue à chaud (usure de segmentation ou palier turbo fuyard)"
  ],
  "Températures excessives": [
    "S08 Élévation rapide de la température d'eau (>100°C) (radiateur colmaté ou pompe à eau)",
    "S09 Échauffement brutal de l'huile de transmission Funk (>115°C) (embrayages fatigués)",
    "S10 Surchauffe localisée d'un réducteur de moyeu Kessler (manque d'huile d'engrenage)"
  ],
  "Comportements hydrauliques": [
    "S11 Lenteur généralisée de levage du bras sous charge (pompe Rexroth fatiguée)",
    "S12 Descente lente spontanée du bras godet chargé (fuite interne vérin Hoist)",
    "S13 Direction dure à chaud ou à faible régime (orbitrol ou valve de priorité)"
  ]
};

export const EPIROC_ST7_PANNES: EpirocSt7Panne[] = [
  {
    id: "1.1.1.A",
    system: "SYS1",
    title: "Le moteur Cummins QSB6.7 refuse de démarrer (Démarreur inactif)",
    severity: "ROUGE",
    repTime: 1.5,
    symptoms: "L'écran RCS est fonctionnel, mais le démarreur ne se lance pas à la clé.",
    cause: "Tension batterie < 21V, fusible d'alimentation démarreur grillé, ou sécurité d'interlock de porte active.",
    action: "Vérifier la tension aux bornes des batteries. S'assurer que le capteur de porte cabine détecte la fermeture complète. Contrôler le relais de démarrage dans la boîte électrique.",
    tip: "Si le voyant de porte cabine clignote sur le RCS, le démarreur est électroniquement inhibé par mesure de sécurité vitale.",
    casReel: "En 2025 à la mine de cuivre souterraine d'Akouta, un ST7 est resté immobilisé 4 heures parce que la patte métallique de contact de la porte cabine s'était tordue de 3 mm, empêchant le signal interlock de se fermer."
  },
  {
    id: "1.1.3.A",
    system: "SYS1",
    title: "Surchauffe moteur Cummins rapide sous charge (> 102°C)",
    severity: "ROUGE",
    repTime: 2.0,
    symptoms: "L'alarme sonore retentit en cabine, le RCS affiche une alerte critique.",
    cause: "Faisceaux extérieurs du radiateur V-tube colmatés par la poussière de galerie cimentée, ou ventilateur Fan Drive inactif.",
    action: "Souffler le radiateur à l'air comprimé depuis l'arrière. Ne pas projeter d'eau froide à haute pression directement sur le radiateur chaud. Vérifier l'état de la courroie de la pompe à eau.",
    tip: "Les radiateurs V-tube à tubes individuels accumulent facilement la poussière entre les ailettes. Le nettoyage doit être fait de l'intérieur vers l'extérieur.",
    casReel: "Sur un chantier aurifère au Mali, les mécaniciens ont nettoyé le radiateur à l'eau de mine boueuse, créant une croûte d'argile cuite insoluble qui a requis le remplacement complet des 40 tubes."
  },
  {
    id: "1.1.4.A",
    system: "SYS1",
    title: "Chute de pression d'huile moteur Cummins au ralenti (< 1.1 bar)",
    severity: "ROUGE",
    repTime: 3.5,
    symptoms: "Voyant rouge allumé au tableau de bord, message d'arrêt d'urgence Cummins.",
    cause: "Niveau d'huile extrêmement bas, filtre d'huile Fleetguard colmaté, ou pompe à engrenages usée prématurément.",
    action: "Couper le moteur immédiatement. Vérifier le niveau à la jauge. Remplacer les filtres d'huile moteur et inspecter la présence de résidus métalliques brillants.",
    tip: "Une huile trop fluide ou polluée par du gazole (injecteur fuyard) perd sa viscosité à chaud et fait chuter la pression.",
    casReel: "Un ST7 dans une mine d'argent au Mexique a serré son moteur suite à une dilution d'huile provoquée par un injecteur resté grippé ouvert pendant 3 postes de travail."
  },
  {
    id: "2.1.1.A",
    system: "SYS2",
    title: "Glissement ou patinage prononcé de la transmission Funk DF150",
    severity: "ROUGE",
    repTime: 4.5,
    symptoms: "Le régime moteur Cummins augmente mais la vitesse d'avancement reste anormalement faible sous charge.",
    cause: "Pression d'embrayage de boîte basse (< 15 bar) provoquée par une pompe de transmission fatiguée ou un joint spi interne détruit.",
    action: "Brancher un manomètre de 4 MPa sur le point de diagnostic 'Clutch Pressure'. Si la pression est faible, inspecter le tiroir de régulation.",
    tip: "Une huile de transmission noire et à l'odeur de brûlé indique une destruction complète des disques de friction en bronze.",
    casReel: "Après une réparation à la hâte sans remplacement des joints d'embrayages, un convertisseur s'est mis à surchauffer en moins d'un poste, détruisant la boîte Funk complète."
  },
  {
    id: "3.1.1.A",
    system: "SYS3",
    title: "Absence totale de mouvements hydrauliques (Bras & Godet)",
    severity: "ROUGE",
    repTime: 3.0,
    symptoms: "Les joysticks de cabine ne produisent aucune action, aucun bruit de charge hydraulique.",
    cause: "Arbre d'entraînement de la pompe Rexroth A10VO sectionné, ou rupture du flexible de pilotage principal 32 bar.",
    action: "Vérifier la pression de pilotage sur la valve pilote. Si elle est nulle, vérifier visuellement si l'arbre de transmission de pompe tourne.",
    tip: "La pompe principale est reliée à la boîte Funk par un accouplement cannelé qui peut s'user jusqu'au cisaillement total en cas de manque de lubrification.",
    casReel: "À la mine de phosphate de Taïba, un accouplement cannelé sec a cassé net lors de la pénétration du godet dans le front, entraînant 24h d'immobilisation de la chargeuse."
  },
  {
    id: "3.1.4.A",
    system: "SYS3",
    title: "Déclenchement intempestif de l'alarme Leak Detection",
    severity: "JAUNE",
    repTime: 1.0,
    symptoms: "Le RCS affiche un code RCS-H01 avec une alarme sonore saccadée en cabine.",
    cause: "Micro-fuite externe sur la ligne de retour hydraulique, ou décalibrage logiciel du capteur de niveau.",
    action: "Inspecter minutieusement tous les raccords d'articulation centrale et de vérins. Si aucun suintement n'est visible, recalibrer la sonde via le RCS.",
    tip: "La détection de fuite protège contre les ruptures de flexibles massives qui projettent de l'huile sous pression sur les parties chaudes du moteur.",
    casReel: "Grâce à cette alerte, un opérateur attentif a identifié une usure par frottement sur un flexible de 24 MPa juste avant qu'il ne se sectionne, évitant un incendie moteur certain."
  },
  {
    id: "5.1.1.A",
    system: "SYS5",
    title: "Bruit de raclement métallique au freinage sur essieu Kessler",
    severity: "ROUGE",
    repTime: 6.0,
    symptoms: "Un crissement sévère se fait entendre dans les roues lors des phases d'arrêt.",
    cause: "Disques de freins humides multiples usés au-delà de la limite nominale ou plaquettes SAHR détruites.",
    action: "Vidanger l'huile d'essieu Kessler et rechercher des particules de friction brillantes. Déposer le flasque de roue pour inspecter l'épaisseur résiduelle des disques.",
    tip: "Le système de freinage humide immergé dans l'huile prévient l'usure précoce, mais un niveau d'huile d'essieu trop bas détruit les disques en quelques heures.",
    casReel: "Un oubli de vidange d'essieu lors de la révision des 1000h a conduit à la destruction totale des arbres de roues d'un ST7 en rampe de mine de fer."
  },
  {
    id: "5.2.1.A",
    system: "SYS5",
    title: "Échec récurrent de la procédure automatique de 'Brake-Test'",
    severity: "ROUGE",
    repTime: 1.5,
    symptoms: "Le code RCS-B01 s'affiche en permanence sur l'écran multifonction.",
    cause: "Pression d'azote de l'accumulateur SAHR insuffisante (< 60 bar) ou capteur de pression défectueux.",
    action: "Mesurer la pression de précharge d'azote à l'aide de l'outil de gonflage approuvé. Remplacer l'accumulateur si la précharge est nulle.",
    tip: "Le test automatique de freinage applique un effort mécanique moteur tout en maintenant les freins serrés pour valider le couple de retenue.",
    casReel: "Une baisse d'efficacité détectée lors du brake test a permis de remplacer l'accumulateur HASR de secours avant que l'engin ne subisse une coupure moteur complète en descente de rampe à 15%."
  },
  {
    id: "6.1.1.A",
    system: "SYS6",
    title: "L'écran central du Rig Control System (RCS) reste noir",
    severity: "ROUGE",
    repTime: 1.0,
    symptoms: "L'engin est totalement inerte, aucun voyant de cabine ne s'allume au contact.",
    action: "Vérifier le fusible d'alimentation 10A dédié au RCS. Inspecter la connexion du faisceau d'alimentation 24V/12V derrière la console de bord.",
    cause: "Court-circuit sur le réseau électrique ou défaillance interne du module d'alimentation central de la cabine.",
    tip: "Sans le RCS actif, l'engin est bridé électroniquement et ne démarrera pas pour éviter d'opérer sans protections actives.",
    casReel: "En Zambie, une infiltration d'eau de mine acide par le toit cabine a court-circuité la prise d'alimentation arrière de l'écran RCS, nécessitant le remplacement complet de la dalle d'affichage."
  },
  {
    id: "7.4.1.A",
    system: "SYS7",
    title: "La machine s'arrête brutalement en marche (Door Interlock active)",
    severity: "ROUGE",
    repTime: 0.5,
    symptoms: "Le moteur Cummins tourne, mais l'avancement se coupe et les freins SAHR se serrent violemment.",
    cause: "Le capteur magnétique de porte cabine s'est desserré ou le câblage électrique associé est sectionné.",
    action: "Contrôler visuellement l'alignement du capteur de porte. Nettoyer les dépôts de boue minérale ferreuse collés sur l'aimant du capteur.",
    tip: "Les boues ferreuses de gisement se collent sur les capteurs magnétiques et perturbent la détection de fermeture, provoquant des arrêts intempestifs extrêmement brutaux.",
    casReel: "Un mécanicien a bypassé temporairement le capteur avec un aimant de haut-parleur trouvé dans l'atelier souterrain. Pratique dangereuse strictement interdite qui a causé un accident de pincement de jambe."
  }
];
