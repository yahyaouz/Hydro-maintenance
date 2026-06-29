export interface EpirocSt2dPanne {
  id: string;
  system: string;
  title: string;
  severity: "VERT" | "JAUNE" | "ROUGE";
  symptoms: string;
  cause: string;
  action: string;
  repTime: number; // in hours
}

export const EPIROC_ST2D_SYSTEMS = [
  { id: "SYS1", label: "MOTEUR DEUTZ F4L912 AIR", icon: "Flame" },
  { id: "SYS2", label: "TRANSMISSION FUNK DF80 MÉCANIQUE", icon: "Shuffle" },
  { id: "SYS3", label: "HYDRAULIQUE GEAR PUMPS", icon: "Droplets" },
  { id: "SYS4", label: "DIRECTION & ARTICULATION", icon: "Compass" },
  { id: "SYS5", label: "FREINAGE TAMBOUR MÉCANIQUE À CÂBLE", icon: "ShieldAlert" },
  { id: "SYS6", label: "ÉLECTRIQUE MINIMALE (DÉMARRAGE MANUEL/PNEUMATIQUE)", icon: "Zap" },
  { id: "SYS7", label: "REFROIDISSEMENT AIR", icon: "ThermometerSnowflake" },
  { id: "SYS8", label: "ÉCHAPPEMENT CATALYTIQUE", icon: "Wind" },
  { id: "SYS9", label: "CHÂSSIS & ROUES", icon: "Disc" },
  { id: "SYS10", label: "GODET, BOOM & GRAISSAGE", icon: "Hammer" },
  { id: "SYS11", label: "SÉCURITÉ & ANSUL", icon: "ShieldCheck" }
];

export const EPIROC_ST2D_PANNES: EpirocSt2dPanne[] = [
  // SYSTEME 1 - MOTEUR DEUTZ F4L912 AIR REFROIDI (4 CYLINDRES) // CORRIGÉ V5 : F6L→F4L912
  {
    id: "1.1.1.A",
    system: "SYS1",
    title: "Moteur ne démarre pas (pas de préchauffage, pas d'injection)",
    severity: "ROUGE",
    symptoms: "Le starter pneumatique ou le lanceur manuel tourne normalement mais le moteur ne démarre pas. Pas d'odeur d'échappement.", // CORRIGÉ V5 : Pas de démarreur électrique sur F4L912
    cause: "Relais de préchauffage ou solénoïde d'arrêt de carburant défectueux/bloqué.",
    action: "Vérifier la tension au solénoïde d'arrêt d'injection. Nettoyer et ré-enclencher manuellement la tirette de coupure si grippée.",
    repTime: 1.2
  },
  {
    id: "1.1.1.B",
    system: "SYS1",
    title: "Démarrage difficile par temps froid (compression basse, starter pneumatique)", // CORRIGÉ V2 : Moteur à air sans préchauffage électrique
    severity: "JAUNE",
    symptoms: "Démarrage très long, fumée grise/blanche intermittente au démarreur, régime instable au début.",
    cause: "Compression basse due à l'usure des segments ou des soupapes, starter pneumatique défectueux ou pression d'air insuffisante, ou huile moteur trop épaisse (SAE 40 en dessous de -10°C).",
    action: "Mesurer la compression au démarrage (min 25 bar), vérifier le starter pneumatique et la pression d'air (min 6 bar), et utiliser de l'huile SAE 30 par temps froid.",
    repTime: 1.5
  },
  {
    id: "1.1.2.A",
    system: "SYS1",
    title: "Pompe d'injection mécanique déréglée (fumée excessive, ratés, manque de puissance)",
    severity: "JAUNE",
    symptoms: "Manque de puissance majeur en montée, fumée noire épaisse lors des accélérations soutenues.",
    cause: "Crémaillère de la pompe d'injection usée ou déphasage de l'accouplement de la pompe.",
    action: "Effectuer le calage de la pompe d'injection selon les repères Deutz et régler la vis de débit maximal.",
    repTime: 3.0
  },
  {
    id: "1.1.2.B",
    system: "SYS1",
    title: "Injecteur bouché / grippé (fumée noire, ratés, bruit métallique)",
    severity: "JAUNE",
    symptoms: "Le moteur tourne sur 5 cylindres avec un claquement métallique cyclique très prononcé.",
    cause: "Présence d'eau ou d'impuretés solides dans le gazole ayant grippé l'aiguille de l'injecteur.",
    action: "Effectuer un test de coupure cylindre par cylindre en desserrant les raccords haute pression pour localiser l'injecteur défaillant, puis le remplacer.",
    repTime: 1.0
  },
  {
    id: "1.1.2.C",
    system: "SYS1",
    title: "Injecteur fuite externe (carburant dans l'huile moteur, forte odeur)",
    severity: "ROUGE",
    symptoms: "Le niveau d'huile moteur monte anormalement au manomètre, l'huile est extrêmement fluide et sent le gazole.",
    cause: "Joint d'étanchéité de l'injecteur ou tuyau de retour de gazole interne à la culasse rompu.",
    action: "Déposer le cache-culbuteur, inspecter les retours d'injecteurs, remplacer le joint de cuivre d'étanchéité et vidanger immédiatement l'huile diluée.",
    repTime: 2.0
  },
  {
    id: "1.1.3.A",
    system: "SYS1",
    title: "Filtre à air principal colmaté (surchauffe, fumée noire, perte de puissance)",
    severity: "JAUNE",
    symptoms: "L'indicateur de restriction d'air est rouge. Température des culasses en hausse rapide en charge.",
    cause: "Accumulation extrême de poussière de mine de silice dans la cartouche filtrante sèche.",
    action: "Remplacer la cartouche filtrante principale. Nettoyer le boîtier de filtre. Ne jamais souffler la cartouche de sécurité.",
    repTime: 0.5
  },
  {
    id: "1.1.3.B",
    system: "SYS1",
    title: "Filtre à air bouché (filtre à sec / cyclone)", // CORRIGÉ V2 : Filtre à sec (cartouche papier) et cyclone de pré-filtrage
    severity: "JAUNE",
    symptoms: "Fumée noire à l'échappement, moteur étouffé, perte de puissance à l'accélération.",
    cause: "Cartouche papier du filtre à air saturée de poussière, ou cyclone de pré-filtrage bouché par des particules fines.",
    action: "Remplacer la cartouche papier du filtre à air, vérifier et nettoyer le cyclone de pré-filtrage.",
    repTime: 0.8
  },
  {
    id: "1.1.4.A",
    system: "SYS1",
    title: "Ailettes moteur colmatées (surchauffe progressive, ventilateur bruyant)",
    severity: "ROUGE",
    symptoms: "Température cylindre très élevée (>170°C sur bloc à air). Odeur de brûlé sous le capot.",
    cause: "Poussières et vapeurs d'huile amalgamées sur les ailettes des cylindres et culasses Deutz.",
    action: "Brosser les ailettes à la brosse métallique et nettoyer au jet haute pression de vapeur dégraissante.",
    repTime: 2.5
  },
  {
    id: "1.1.4.B",
    system: "SYS1",
    title: "Ventilateur moteur grippé / cassé (surchauffe ultra-rapide, risque de serrage)",
    severity: "ROUGE",
    symptoms: "Bruit de ferraille violent sous le capot ou absence totale de flux d'air au niveau de l'évacuation.",
    cause: "Rupture de la courroie de transmission du ventilateur ou roulement du moyeu de ventilateur grippé.",
    action: "Remplacer la courroie trapézoïdale de ventilateur ou changer le moyeu complet avec ses roulements.",
    repTime: 1.8
  },
  {
    id: "1.1.4.C",
    system: "SYS1",
    title: "Shroud (carter d'air) de refroidissement manquant ou cassé",
    severity: "JAUNE",
    symptoms: "Température inégale entre les cylindres avant et arrière. Surchauffe localisée des cylindres 3 et 4.", // CORRIGÉ V5 : F4L912 = 4 cylindres, pas 6
    cause: "Tôles de guidage d'air de refroidissement mal fixées, tordues ou absentes après une intervention.",
    action: "Réinstaller ou redresser les tôles du carter d'air pour assurer un flux d'air uniforme sur l'ensemble des 4 cylindres.", // CORRIGÉ V5 : F4L912 = 4 cylindres
    repTime: 1.0
  },
  {
    id: "1.1.5.A",
    system: "SYS1",
    title: "Pression d'huile moteur basse (manomètre faible, crépine colmatée)",
    severity: "ROUGE",
    symptoms: "Voyant rouge d'huile allumé au ralenti. Manomètre affiche moins de 1.0 bar à chaud.",
    cause: "Usure de la pompe à huile ou de la soupape de décharge, ou crépine d'aspiration bouchée par des boues.",
    action: "Vérifier le niveau d'huile, tester avec un manomètre d'atelier mécanique externe. Déposer le carter inférieur pour nettoyer la crépine.",
    repTime: 4.0
  },
  {
    id: "1.1.5.B",
    system: "SYS1",
    title: "Fuite d'huile moteur externe majeure (joints cache-culbuteurs ou carter)",
    severity: "JAUNE",
    symptoms: "Flaques d'huile continues sous le châssis moteur. Fumée bleue/noire grasse au contact de l'échappement.",
    cause: "Joints de cache-culbuteurs desséchés ou vis de carter inférieur desserrées par les vibrations.",
    action: "Remplacer les joints de cache-culbuteurs en liège ou resserrer le carter inférieur au couple recommandé.",
    repTime: 1.2
  },
  {
    id: "1.1.5.C",
    system: "SYS1",
    title: "Huile moteur noire / brûlée et surconsommation",
    severity: "JAUNE",
    symptoms: "Consommation excessive d'huile moteur (>2% du carburant). Fumée d'échappement bleue constante.",
    cause: "Segments racleurs usés ou guides de soupapes endommagés.",
    action: "Mesurer les compressions de chaque cylindre. Planifier le remplacement des segments et joints de guides de soupapes.",
    repTime: 8.0
  },
  {
    id: "1.1.6.A",
    system: "SYS1",
    title: "Compression basse sur plusieurs cylindres (usure générale)",
    severity: "JAUNE",
    symptoms: "Démarrage difficile même chaud, refoulement important de vapeurs d'huile par le reniflard (blow-by).",
    cause: "Usure prononcée des chemises de cylindres ou gommage des segments dû à des surchauffes passées.",
    action: "Déposer les culasses individuelles Deutz, mesurer l'alésage des chemises, remplacer l'ensemble pistons/segments/chemises usés.",
    repTime: 12.0
  },
  {
    id: "1.1.7.A",
    system: "SYS1",
    title: "Fumée blanche épaisse et persistante (infiltration d'humidité)",
    severity: "ROUGE",
    symptoms: "Fumée blanche dense à l'échappement avec odeur âcre, ratés d'allumage sévères sur un cylindre.",
    cause: "Fissure de la culasse au niveau de la chambre de combustion ou fuite de gasoil non brûlé.",
    action: "Faire tester l'étanchéité des injecteurs et tester la compression pour localiser la culasse fendue. Remplacer la culasse incriminée.",
    repTime: 5.0
  },

  // SYSTEME 2 - TRANSMISSION FUNK DF80 MÉCANIQUE (PAS DE CONVERTISSEUR) // CORRIGÉ V5 : Dana→Funk DF80, suppression convertisseur
  {
    id: "2.1.1.A",
    system: "SYS2",
    title: "Embrayage mécanique qui patine (vitesse lente, odeur de brûlé)", // CORRIGÉ V2 : Pas de convertisseur hydraulique, boîte mécanique Funk DF80
    severity: "ROUGE",
    symptoms: "Le régime moteur monte haut mais le Scooptram n'a aucune force de pénétration dans le tas, odeur de brûlé caractéristique.",
    cause: "Disques d'embrayage de la Funk DF80 usés ou vitrifiés, réglage incorrect du câble d'embrayage (jeu trop faible), ou huile de transmission SAE 80W-90 contaminée ou dégradée.",
    action: "Vérifier l'épaisseur des disques d'embrayage (min 2.5 mm), régler le jeu du câble d'embrayage (3-5 mm au levier), et remplacer l'huile de transmission SAE 80W-90 (12 L).",
    repTime: 8.0
  },
  {
    id: "2.1.1.B",
    system: "SYS2",
    title: "Embrayage mécanique grippé (démarrage brutal, blocage)", // CORRIGÉ V2 : Remplacé par embrayage mécanique Funk DF80
    severity: "ROUGE",
    symptoms: "Le moteur cale immédiatement dès qu'une vitesse est engagée ou au démarrage.",
    cause: "Disques d'embrayage de la Funk DF80 collés ou vitrifiés, roulement d'embrayage grippé, ou câble d'embrayage cassé ou bloqué.",
    action: "Déposer le carter d'embrayage et inspecter les disques, vérifier le roulement d'embrayage et le câble, puis remplacer les disques vitrifiés et régler le jeu.",
    repTime: 10.0
  },
  {
    id: "2.1.1.C",
    system: "SYS2",
    title: "Huile de transmission SAE 80W-90 contaminée (particules métalliques)", // CORRIGÉ V2 : Boîte Funk DF80 avec huile SAE 80W-90 pour engrenages
    severity: "ROUGE",
    symptoms: "Huile de couleur laiteuse ou présence de paillettes de bronze brillantes sur la jauge de transmission.",
    cause: "Usure des pignons et roulements de la boîte Funk DF80 (paillettes métalliques), usure des disques d'embrayage (poussière de friction), ou infiltration d'eau ou de poussière dans la boîte.",
    action: "Analyser l'huile SAE 80W-90 (présence de paillettes = usure engrenages), inspecter les pignons et roulements de la Funk DF80, puis remplacer l'huile et le filtre de la boîte (12 L).",
    repTime: 3.5
  },
  {
    id: "2.2.1.A",
    system: "SYS2",
    title: "Embrayage de 1ère vitesse usé (patine sévèrement au démarrage)",
    severity: "JAUNE",
    symptoms: "Le chargeur refuse d'avancer en 1ère sous charge, mais se déplace normalement en 2ème vitesse à vide.",
    cause: "Disques de friction de l'embrayage de 1ère brûlés ou pression hydraulique d'embrayage insuffisante.",
    action: "Mesurer la pression de l'embrayage de 1ère sur le bloc de vannes Dana. Si pression > 18 bars et patine toujours, changer les disques.",
    repTime: 14.0
  },
  {
    id: "2.2.1.B",
    system: "SYS2",
    title: "Embrayage de 2ème vitesse usé (patine en accélération moyenne)",
    severity: "JAUNE",
    symptoms: "Sensation de glissement et montée en régime anormale lors du passage automatique ou manuel en 2ème vitesse.",
    cause: "Usure prononcée des disques de friction de la 2ème vitesse.",
    action: "Prendre les pressions d'embrayage sur l'orifice de test de la 2ème vitesse. Réparer le pack d'embrayage.",
    repTime: 14.0
  },
  {
    id: "2.2.1.C",
    system: "SYS2",
    title: "Embrayage de 3ème vitesse usé (patine en montée de rampe)",
    severity: "JAUNE",
    symptoms: "Le Scooptram ralentit fortement et s'arrête presque lors des montées en rampe en 3ème vitesse.",
    cause: "Piston d'embrayage fuyard ou usure mécanique des disques.",
    action: "Vérifier le bon fonctionnement du limiteur de couple (blockout). Remplacer le pack d'embrayage de 3ème.",
    repTime: 14.0
  },
  {
    id: "2.2.1.D",
    system: "SYS2",
    title: "Embrayage de 4ème vitesse usé (patine en vitesse de croisière)",
    severity: "JAUNE",
    symptoms: "Glissement continu en vitesse maximale sur le plat de la galerie. Huile chauffe anormalement.",
    cause: "Disques de friction glacés ou usés prématurément.",
    action: "Remplacer les disques du pack d'embrayage de 4ème vitesse.",
    repTime: 14.0
  },
  {
    id: "2.2.2.A",
    system: "SYS2",
    title: "Boîte Funk DF80 ne passe aucune vitesse (levier inopérant)", // CORRIGÉ V2 : Boîte mécanique Funk DF80 avec commande par câble
    severity: "ROUGE",
    symptoms: "Le levier de vitesse est manipulé mais la boîte reste désespérément au point mort (Neutre).",
    cause: "Câble de commande de la boîte Funk DF80 cassé ou détendu, fourchette de sélecteur grippée ou usée, ou roulement d'arbre primaire grippé.",
    action: "Vérifier le câble de commande et le régler (jeu 2-3 mm), déposer le carter et inspecter les fourchettes de sélecteur, puis vérifier le roulement d'arbre primaire.",
    repTime: 2.0
  },
  {
    id: "2.2.2.B",
    system: "SYS2",
    title: "Boîte Funk DF80 passe les vitesses mais de façon très brutale", // CORRIGÉ V2 : Remplacé par boîte mécanique Funk DF80
    severity: "JAUNE",
    symptoms: "Chocs violents dans toute la transmission lors du changement de rapport, risquant de casser les cardans.",
    cause: "Embrayage mécanique mal réglé (jeu insuffisant), synchroniseurs de la Funk DF80 usés, ou câble de commande mal ajusté ou usé.",
    action: "Régler le jeu de l'embrayage mécanique (3-5 mm au levier), inspecter les synchroniseurs de la boîte Funk DF80, et remplacer le câble de commande si nécessaire.",
    repTime: 3.0
  },
  {
    id: "2.2.3.A",
    system: "SYS2",
    title: "Frein de parking de transmission usé (le loader avance en parking)",
    severity: "ROUGE",
    symptoms: "Le frein de parking est appliqué mais l'engin se déplace légèrement sur une pente faible.",
    cause: "Mauvais réglage de la tringlerie mécanique ou garnitures du disque de frein de parking usées.",
    action: "Ajuster la tension du câble de commande de frein de parking ou remplacer les plaquettes de frein d'arbre.",
    repTime: 1.5
  },
  {
    id: "2.2.4.A",
    system: "SYS2",
    title: "Fuite d'huile de transmission externe majeure",
    severity: "JAUNE",
    symptoms: "Niveau d'huile de boîte baisse rapidement. Présence d'huile sous le carter intermédiaire de la boîte.",
    cause: "Joint à lèvre d'arbre de sortie (joint spi) fuyard ou joint de carter rompu.",
    action: "Remplacer le joint spi d'arbre de transmission concerné et nettoyer le reniflard de boîte.",
    repTime: 2.5
  },
  {
    id: "2.2.5.A",
    system: "SYS2",
    title: "Bruits anormaux de sifflement ou de grognement dans la boîte",
    severity: "JAUNE",
    symptoms: "Bruit strident métallique proportionnel à la vitesse d'avancement de la machine.",
    cause: "Roulement d'arbre de transmission usé ou jeu d'engrènement dégradé.",
    action: "Analyser la présence de métal dans l'huile. Déposer la boîte Dana pour révision générale des roulements internes.",
    repTime: 16.0
  },

  // SYSTEME 3 - HYDRAULIQUE GEAR PUMPS (12 pannes)
  {
    id: "3.1.1.A",
    system: "SYS3",
    title: "Pompe hydraulique de levage/benne (Dump/Hoist) grippée",
    severity: "ROUGE",
    symptoms: "Le boom et le godet ne réagissent absolument pas. Bruit métallique sourd au niveau du moteur.",
    cause: "Arbre de la pompe hydraulique cassé ou engrenages grippés suite à une cavitation extrême.",
    action: "Remplacer la pompe à engrenages principale. Rincer le réservoir pour éliminer la limaille.",
    repTime: 4.5
  },
  {
    id: "3.1.1.B",
    system: "SYS3",
    title: "Pompe hydraulique Dump/Hoist - Fuite interne excessive",
    severity: "JAUNE",
    symptoms: "Le godet se lève très lentement à vide, et refuse de se lever lorsque chargé de minerai. L'huile chauffe très vite.",
    cause: "Usure prononcée des plaques de poussée latérales de la pompe hydraulique.",
    action: "Remplacer ou reconditionner la pompe hydraulique principale.",
    repTime: 4.0
  },
  {
    id: "3.1.1.C",
    system: "SYS3",
    title: "Pompe hydraulique de direction grippée",
    severity: "ROUGE",
    symptoms: "Le volant/orbitrol tourne sans opposer de résistance, mais le châssis ne s'articule pas d'un millimètre.",
    cause: "Casse de l'accouplement cannelé d'entraînement de la pompe de direction.",
    action: "Remplacer la pompe à engrenages de direction et vérifier l'état des cannelures de la prise de force.",
    repTime: 3.5
  },
  {
    id: "3.1.2.A",
    system: "SYS3",
    title: "Filtre de la conduite d'aspiration (suction line) colmaté",
    severity: "JAUNE",
    symptoms: "Crissements et sifflements très aigus dans les pompes (cavitation). Mouvements lents et saccadés.",
    cause: "Filtre d'aspiration de 25 microns colmaté par de la boue hydraulique ou de la limaille.",
    action: "Remplacer la cartouche du filtre d'aspiration et nettoyer le fond du réservoir hydraulique.",
    repTime: 1.5
  },
  {
    id: "3.1.3.A",
    system: "SYS3",
    title: "Niveau d'huile hydraulique insuffisant",
    severity: "JAUNE",
    symptoms: "Mouvements du boom saccadés en fin de course. Présence importante de mousse d'air dans le réservoir.",
    cause: "Fuite externe non détectée ayant vidé le réservoir sous le niveau de sécurité.",
    action: "Faire l'appoint en huile hydraulique ISO VG 46 et rechercher la fuite sur les flexibles de vérins.",
    repTime: 0.5
  },
  {
    id: "3.2.1.A",
    system: "SYS3",
    title: "Commande double levier de benne (Dump) grippée",
    severity: "JAUNE",
    symptoms: "Le levier de commande du godet est bloqué et refuse de bouger en avant ou en arrière.",
    cause: "Tringlerie mécanique grippée par la boue de mine ou tiroir de distributeur tordu.",
    action: "Nettoyer et lubrifier la tringlerie mécanique. Si le blocage persiste au distributeur, démonter le tiroir.",
    repTime: 1.5
  },
  {
    id: "3.2.1.B",
    system: "SYS3",
    title: "Commande double levier de bras (Hoist) cassée",
    severity: "JAUNE",
    symptoms: "Le levier bouge librement sans aucune résistance mécanique et le bras ne lève pas.",
    cause: "Rotule d'accouplement mécanique de la tringlerie de commande désaccouplée ou cassée.",
    action: "Remplacer la rotule mécanique d'extrémité de tringlerie sous la cabine.",
    repTime: 1.0
  },
  {
    id: "3.2.2.A",
    system: "SYS3",
    title: "Tiroir de distributeur hydraulique principal grippé",
    severity: "JAUNE",
    symptoms: "Une fonction hydraulique reste active en continu (le bras monte tout seul) ou est totalement inerte.",
    cause: "Particule métallique coincée entre le tiroir et le corps du distributeur.",
    action: "Déposer le distributeur principal, extraire soigneusement le tiroir, nettoyer et éliminer les rayures microscopiques au papier abrasif ultra-fin.",
    repTime: 3.0
  },
  {
    id: "3.3.1.A",
    system: "SYS3",
    title: "Vérin de direction - Fuite externe majeure",
    severity: "JAUNE",
    symptoms: "Flaques d'huile continues au niveau de l'articulation centrale lors des manoeuvres de braquage.",
    cause: "Joint de tige du vérin de direction rompu par l'abrasion des poussières de silice.",
    action: "Déposer le vérin de direction gauche ou droit, remplacer le kit complet de joints de tige.",
    repTime: 3.0
  },
  {
    id: "3.3.2.A",
    system: "SYS3",
    title: "Vérin de levage (Hoist) - Fuite interne du piston",
    severity: "JAUNE",
    symptoms: "Le bras de l'engin redescend lentement tout seul vers le sol lorsqu'il est chargé de minerai (dérive de charge).",
    cause: "Joint de piston interne du vérin de levage usé ou usure de l'alésage du tube de vérin.",
    action: "Changer le joint de piston interne du vérin de levage et vérifier l'absence de rayures internes au tube.",
    repTime: 4.5
  },
  {
    id: "3.3.3.A",
    system: "SYS3",
    title: "Vérin de benne (Dump) - Fuite interne",
    severity: "JAUNE",
    symptoms: "Le godet bascule vers le bas spontanément pendant les phases de transport de charge.",
    cause: "Joints d'étanchéité internes du piston du vérin de benne hors service.",
    action: "Démonter le vérin de benne et remplacer le jeu complet de joints d'étanchéité internes.",
    repTime: 4.0
  },
  {
    id: "3.3.4.A",
    system: "SYS3",
    title: "Tige de vérin profondément rayée",
    severity: "JAUNE",
    symptoms: "Fuite d'huile hydraulique persistante sur la tige même après remplacement récent du kit de joints.",
    cause: "Choc de roche direct ou usure par poussière siliceuse abrasive sur la tige chromée.",
    action: "Remplacer la tige de vérin rayée ou faire rechromer et rectifier en atelier externe.",
    repTime: 5.0
  },

  // SYSTEME 4 - DIRECTION & ARTICULATION (5 pannes)
  {
    id: "4.1.1.A",
    system: "SYS4",
    title: "Boîtier de direction Orbitrol grippé mécaniquement",
    severity: "ROUGE",
    symptoms: "Le volant de direction est extrêmement dur à tourner, voire totalement bloqué dans un sens.",
    cause: "Pollution métallique majeure de l'huile hydraulique bloquant les rotors internes de l'Orbitrol.",
    action: "Remplacer l'Orbitrol de direction. Vidanger et rincer abondamment le circuit de direction hydraulique pilote.",
    repTime: 4.0
  },
  {
    id: "4.1.2.A",
    system: "SYS4",
    title: "Vérin de direction gauche déséquilibré / fuyard",
    severity: "JAUNE",
    symptoms: "La direction tire fortement d'un côté et s'avère beaucoup plus lente à réagir lors des braquages à gauche.",
    cause: "Fuite interne sur les joints de piston du vérin de direction gauche.",
    action: "Remplacer les joints de piston du vérin gauche et purger l'air du circuit de direction.",
    repTime: 3.0
  },
  {
    id: "4.2.1.A",
    system: "SYS4",
    title: "Roulement d'articulation centrale fortement usé (jeu mécanique)",
    severity: "ROUGE",
    symptoms: "Claquement violent à chaque changement de direction. Jeu visuel important entre les demi-châssis.",
    cause: "Manque chronique de lubrification du pivot d'articulation centrale sous forte charge de travail.",
    action: "Déposer l'axe d'articulation centrale et remplacer les bagues et roulements sphériques usés.",
    repTime: 12.0
  },
  {
    id: "4.2.2.A",
    system: "SYS4",
    title: "Joint de cardan de l'articulation cassé ou fissuré",
    severity: "ROUGE",
    symptoms: "Vibrations destructrices dans toute la machine lors de l'avancement. Bruit de battement métallique cyclique sous le plancher.",
    cause: "Casse des aiguilles ou de la croix de cardan suite à un couple d'entraînement excessif sans graisse.",
    action: "Remplacer le joint de cardan intermédiaire d'articulation et les brides d'accouplement si endommagées.",
    repTime: 4.0
  },
  {
    id: "4.2.3.A",
    system: "SYS4",
    title: "Boulons de fixation d'articulation desserrés",
    severity: "JAUNE",
    symptoms: "Grincements structurels et apparition de jeu anormal au niveau du châssis.",
    cause: "Vibrations intenses sans contrôle périodique du serrage des brides.",
    action: "Resserrer l'ensemble de la boulonnerie d'articulation au couple prescrit et sécuriser au frein filet.",
    repTime: 2.0
  },

  // SYSTEME 5 - FREINAGE TAMBOUR MÉCANIQUE À CÂBLE (8 pannes)
  {
    id: "5.1.1.A",
    system: "SYS5",
    title: "Garnitures de frein tambour usées sous l'épaisseur minimale (mâchoires)", // CORRIGÉ V3 : Remplacement disques HASR par garnitures de frein tambour
    severity: "ROUGE",
    symptoms: "Le freinage de service est faible ou inefficace. Bruit de frottement métallique sur les tambours.", // CORRIGÉ V3 : Bruit métallique tambour au lieu de copeaux différentiel
    cause: "Usure naturelle des garnitures organiques des mâchoires de frein à tambour après plusieurs milliers d'heures.", // CORRIGÉ V3 : Garnitures organiques mâchoires tambour au lieu de disques
    action: "Remplacer le jeu de mâchoires de frein à tambour et ajuster le câble de commande mécanique.", // CORRIGÉ V3 : Remplacer mâchoires et ajuster câble
    repTime: 4.0 // CORRIGÉ V3 : Remplacement mâchoires tambour plus rapide
  },
  {
    id: "5.1.1.B",
    system: "SYS5",
    title: "Câble de frein de parking détendu ou usé", // CORRIGÉ V3 : Remplacement plaquettes HASR par câble de parking détendu
    severity: "JAUNE",
    symptoms: "Le levier de frein de parking monte trop haut sans résistance. L'engin roule légèrement sur pente.", // CORRIGÉ V3 : Levier monte trop haut, roulement en pente
    cause: "Étirement progressif du câble de frein de parking mécanique ou usure des garnitures de mâchoires.", // CORRIGÉ V3 : Étirement câble ou usure garnitures
    action: "Remplacer le câble de frein de parking Ø 4 mm ou ajuster la tension au tendeur. Vérifier l'état des mâchoires.", // CORRIGÉ V3 : Changer câble ou ajuster tendeur
    repTime: 2.0
  },
  {
    id: "5.1.2.A",
    system: "SYS5",
    title: "Mâchoires de frein tambour grippées (frein bloqué)", // CORRIGÉ V3 : Remplacement étriers hydrauliques grippés par mâchoires grippées
    severity: "ROUGE",
    symptoms: "La machine refuse de se déplacer même lorsque le frein de parking est relâché. Roue chaude anormalement.", // CORRIGÉ V3 : Roue chaude et frein bloqué
    cause: "Grippage des mâchoires de frein à tambour par accumulation de poussière de mine ou corrosion des ressorts de rappel.", // CORRIGÉ V3 : Poussière de mine et corrosion ressorts
    action: "Déposer le tambour, nettoyer les mâchoires et les ressorts de rappel, lubrifier les points de pivot. Remplacer si vitrifiées.", // CORRIGÉ V3 : Nettoyage et lubrification pivots ou remplacement mâchoires
    repTime: 4.0
  },
  {
    id: "5.1.2.B",
    system: "SYS5",
    title: "Câble de frein de service effiloché ou cassé", // CORRIGÉ V3 : Remplacement fuite liquide étriers par câble effiloché/cassé
    severity: "JAUNE",
    symptoms: "Pédale de frein de service molle ou sans résistance. Freinage asymétrique (tire d'un côté).", // CORRIGÉ V3 : Pédale molle et freinage asymétrique
    cause: "Effilochage ou rupture partielle du câble de frein mécanique à câble, ou gaine interne grippée.", // CORRIGÉ V3 : Effilochage câble ou gaine grippée
    action: "Remplacer le câble de frein de service complet (Ø 4 mm, longueur 2.5 m) et lubrifier la gaine.", // CORRIGÉ V3 : Remplacement câble de service complet et lubrification gaine
    repTime: 3.0
  },
  {
    id: "5.2.1.A",
    system: "SYS5",
    title: "Frein de parking tambour usé (danger de roulement en rampe)", // CORRIGÉ V3 : Remplacement frein de parking de transmission par frein de parking tambour
    severity: "ROUGE",
    symptoms: "L'engin descend lentement de sa position stationnaire même lorsque le frein de parking est serré à fond.",
    cause: "Usure des garnitures de mâchoires de frein à tambour ou câble de parking trop détendu.", // CORRIGÉ V3 : Usure garnitures mâchoires tambour ou câble détendu
    action: "Remplacer les mâchoires de frein à tambour et ajuster la tension du câble de parking.", // CORRIGÉ V3 : Remplacement mâchoires et réglage câble
    repTime: 2.5
  },
  {
    id: "5.3.1.A",
    system: "SYS5",
    title: "Ressort de rappel de mâchoires cassé ou détendu", // CORRIGÉ V3 : Remplacement accumulateur azote par ressort de rappel cassé
    severity: "ROUGE",
    symptoms: "Les freins restent partiellement engagés après relâchement de la pédale. Bruit de cliquetis au tambour.", // CORRIGÉ V3 : Freins engagés et cliquetis tambour
    cause: "Rupture d'un ressort de rappel de mâchoire ou détente excessive par fatigue thermique.", // CORRIGÉ V3 : Rupture ressort ou fatigue thermique
    action: "Remplacer les 4 ressorts de rappel de mâchoires (50 N) et vérifier l'alignement des mâchoires dans le tambour.", // CORRIGÉ V3 : Remplacement des 4 ressorts
    repTime: 2.0
  },
  {
    id: "5.3.2.A",
    system: "SYS5",
    title: "Tendeur de câble de frein grippé ou bloqué", // CORRIGÉ V3 : Remplacement pompe de charge de freinage par tendeur de câble grippé
    severity: "ROUGE",
    symptoms: "Impossible de desserrer le frein de parking au levier. Le câble reste sous tension permanente.", // CORRIGÉ V3 : Impossible de desserrer, câble sous tension
    cause: "Grippage du tendeur de câble fileté (écrou M10) par corrosion ou accumulation de poussière.", // CORRIGÉ V3 : Grippage filetage par corrosion
    action: "Démonter le tendeur de câble, nettoyer le filetage, lubrifier et remonter. Remplacer si filetage écrasé.", // CORRIGÉ V3 : Nettoyage filetage et lubrification ou changement tendeur
    repTime: 3.5
  },
  {
    id: "5.3.3.A",
    system: "SYS5",
    title: "Réglage du câble de frein de service déréglé", // CORRIGÉ V3 : Remplacement limiteur de pression par réglage câble de service
    severity: "JAUNE",
    symptoms: "Le freinage de service est trop agressif (blocage immédiat des roues) ou au contraire trop mou.",
    cause: "Tendeur de câble mal ajusté ou câble détendu, créant un jeu excessif ou une précharge trop forte.", // CORRIGÉ V3 : Tendeur mal ajusté ou câble détendu
    action: "Ajuster la tension du câble de frein au tendeur fileté (écrou M10) pour obtenir un jeu de 2-3 mm à la pédale.", // CORRIGÉ V3 : Réglage au tendeur fileté
    repTime: 1.5
  },

  // SYSTEME 6 - ÉLECTRIQUE MINIMALE (5 pannes modifiées)
  {
    id: "6.1.1.A",
    system: "SYS6",
    title: "Démarrage manuel/pneumatique impossible (compression basse ou starter grippé)", // CORRIGÉ V3 : Remplacement batteries déchargées par démarrage impossible
    severity: "JAUNE",
    symptoms: "Le moteur ne tourne pas du tout au lanceur manuel ou au starter pneumatique. Aucune combustion.", // CORRIGÉ V3 : Pas de rotation au lanceur ou starter pneumatique
    cause: "Compression basse due à l'usure des segments, starter pneumatique grippé, ou pression d'air insuffisante (< 6 bar).", // CORRIGÉ V3 : Usure segments, starter grippé, manque d'air
    action: "Mesurer la compression au démarrage (min 25 bar). Vérifier le starter pneumatique et la pression d'air. Si compression < 20 bar, révision moteur.", // CORRIGÉ V3 : Mesure compression et vérification starter/air
    repTime: 0.5
  },
  {
    id: "6.1.1.B",
    system: "SYS6",
    title: "Starter pneumatique grippé ou usé", // CORRIGÉ V3 : Remplacement batteries sulfatées par starter pneumatique grippé
    severity: "JAUNE",
    symptoms: "Le starter pneumatique tourne lentement ou bloque en fin de course. Bruit d'air qui s'échappe sans action.", // CORRIGÉ V3 : Tourne lentement ou sifflement d'air
    cause: "Usure des palettes du starter pneumatique ou grippage du pignon d'entraînement par la poussière de mine.", // CORRIGÉ V3 : Usure palettes ou pignon grippé
    action: "Démonter le starter pneumatique, nettoyer le pignon et les palettes, lubrifier. Remplacer si usure excessive des palettes.", // CORRIGÉ V3 : Démontage, nettoyage, lubrification ou remplacement palettes
    repTime: 0.8
  },
  {
    id: "6.1.2.A",
    system: "SYS6",
    title: "Manette de démarrage manuelle bloquée ou grippée", // CORRIGÉ V3 : Remplacement démarreur électrique par manette manuelle bloquée
    severity: "JAUNE",
    symptoms: "La manette de démarrage manuel ne bouge pas ou reste bloquée en position arrêt.", // CORRIGÉ V3 : Manette bloquée en position arrêt
    cause: "Grippage de la manette de démarrage par accumulation de poussière, corrosion du câble, ou ressort de rappel cassé.", // CORRIGÉ V3 : Grippage par poussière ou ressort cassé
    action: "Nettoyer la manette et le câble de commande, lubrifier. Remplacer le ressort de rappel si cassé.", // CORRIGÉ V3 : Nettoyage manette/câble, lubrification et remplacement ressort
    repTime: 2.0
  },
  {
    id: "6.1.3.A",
    system: "SYS6",
    title: "Alternateur option éclairage ne charge pas (si équipé)", // CORRIGÉ V3 : Remplacement alternateur standard par alternateur optionnel d'éclairage
    severity: "JAUNE",
    symptoms: "La tension mesurée au circuit éclairage est inférieure à 12V. Les phares faiblissent en charge.", // CORRIGÉ V3 : Circuit éclairage < 12V
    cause: "Courroie d'entraînement de l'alternateur option lâche/rompue ou régulateur interne HS.", // CORRIGÉ V3 : Courroie d'alternateur option lâche/rompue
    action: "Retendre ou remplacer la courroie trapézoïdale. Remplacer l'alternateur option si nécessaire. NOTE : La ST2D standard n'a PAS d'alternateur.", // CORRIGÉ V3 : Tension courroie ou remplacement alternateur optionnel
    repTime: 1.5
  },
  {
    id: "6.2.1.A",
    system: "SYS6",
    title: "Sonde ou jauge de pression d'huile moteur défectueuse",
    severity: "JAUNE",
    symptoms: "Voyant d'alerte allumé alors que la pression mécanique réelle testée au manomètre d'atelier est excellente.",
    cause: "Sonde de pression d'huile défaillante ou court-circuit du fil de signal à la masse.",
    action: "Tester la continuité du fil de sonde de pression d'huile et remplacer le capteur de pression d'huile.",
    repTime: 1.0
  },
  {
    id: "6.2.2.A",
    system: "SYS6",
    title: "Voyant de pression d'air starter inactif (si équipé starter pneumatique)", // CORRIGÉ V3 : Remplacement voyant préchauffage par voyant pression d'air starter
    severity: "JAUNE",
    symptoms: "Aucune indication de pression d'air au tableau de bord. Starter pneumatique inopérant.", // CORRIGÉ V3 : Pas d'indication pression d'air
    cause: "Fusible de commande grillé ou manostat de pression d'air HS.", // CORRIGÉ V3 : Fusible grillé ou manostat d'air HS
    action: "Changer le fusible de protection 15A ou remplacer le manostat de pression d'air (min 6 bar requis).", // CORRIGÉ V3 : Changer fusible ou manostat d'air
    repTime: 1.0
  },
  {
    id: "6.3.1.A",
    system: "SYS6",
    title: "Phares de travail morts (absence totale de lumière)",
    severity: "JAUNE",
    symptoms: "Impossible d'éclairer l'avant ou l'arrière pour le travail en galerie sombre.",
    cause: "Fusible d'éclairage grillé ou faisceau de cabine sectionné par un frottement contre le châssis.",
    action: "Remplacer l'ampoule halogène ou vérifier l'étanchéité des connecteurs de phares.",
    repTime: 0.5
  },
  {
    id: "6.5.1.A",
    system: "SYS6",
    title: "Alarme de recul inopérante",
    severity: "JAUNE",
    symptoms: "Aucun signal sonore émis lors de la marche arrière du chargeur (sécurité mine compromise).",
    cause: "Haut-parleur de recul endommagé par des projections de boue ou contacteur de marche arrière défectueux.",
    action: "Nettoyer ou remplacer le boîtier sonore d'alarme de recul à l'arrière du châssis.",
    repTime: 0.8
  },

  // SYSTEME 7 - REFROIDISSEMENT AIR (4 pannes)
  {
    id: "7.1.1.A",
    system: "SYS7",
    title: "Ailettes de refroidissement colmatées par la poussière de mine",
    severity: "JAUNE",
    symptoms: "Surchauffe thermique progressive du moteur lors des longs trajets en rampe.",
    cause: "Accumulation de poussière de roche sèche formant un écran isolant sur les cylindres refroidis par air.",
    action: "Nettoyer les espaces entre les ailettes de cylindres avec un grattoir et un jet d'air comprimé.",
    repTime: 1.5
  },
  {
    id: "7.1.1.B",
    system: "SYS7",
    title: "Ailettes de cylindres déformées ou cassées",
    severity: "JAUNE",
    symptoms: "Surchauffe ciblée d'un ou plusieurs cylindres (généralement les cylindres centraux 3 ou 4).",
    cause: "Chocs mécaniques directs d'outils ou débris métalliques projetés dans le flux de ventilation.",
    action: "Inspecter visuellement, redresser doucement les ailettes tordues pour rétablir un flux d'air laminaire.",
    repTime: 1.2
  },
  {
    id: "7.1.2.A",
    system: "SYS7",
    title: "Turbine de ventilation moteur grippée ou courroie cassée",
    severity: "ROUGE",
    symptoms: "Surchauffe critique en moins de 3 minutes d'utilisation avec fumée grasse.",
    cause: "Rupture de la courroie de turbine ou grippage du roulement du ventilateur centrifuge.",
    action: "Installer une nouvelle courroie de turbine de refroidissement et ajuster sa tension.",
    repTime: 1.5
  },
  {
    id: "7.1.2.B",
    system: "SYS7",
    title: "Turbine de ventilation excessivement bruyante",
    severity: "JAUNE",
    symptoms: "Sifflement strident ou grondement sourd provenant de l'avant du moteur.",
    cause: "Roulement interne du moyeu de turbine usé ou pales de turbine frotte contre le carter en tôle.",
    action: "Remplacer le roulement ou ajuster le carter en tôle pour éliminer les frottements physiques.",
    repTime: 2.0
  },

  // SYSTEME 8 — ÉCHAPPEMENT CATALYTIQUE (3 pannes)
  {
    id: "8.1.1.A",
    system: "SYS8",
    title: "Catalyseur d'échappement bouché (colmaté)",
    severity: "JAUNE",
    symptoms: "Moteur étouffé à haut régime, forte perte de réactivité sous charge et fumée noire abondante.",
    cause: "Accumulation extrême de suies de gazole non brûlées dans le nid d'abeille du catalyseur.",
    action: "Démonter le silencieux catalytique et procéder à une régénération par chauffage contrôlé ou nettoyage à contre-courant.",
    repTime: 3.5
  },
  {
    id: "8.1.1.B",
    system: "SYS8",
    title: "Catalyseur d'échappement fusionné en interne",
    severity: "JAUNE",
    symptoms: "Odeur chimique très forte, bruit d'échappement étouffé inhabituel et surchauffe des collecteurs d'échappement.",
    cause: "Injections de carburant imbrûlé répétées s'enflammant directement à l'intérieur du catalyseur.",
    action: "Remplacer l'élément catalytique interne fondu pour restaurer le débit de gaz d'échappement.",
    repTime: 4.0
  },
  {
    id: "8.2.1.A",
    system: "SYS8",
    title: "Silencieux catalytique fuyard ou fissuré (gaz toxiques cabine)",
    severity: "ROUGE",
    symptoms: "Bruit d'échappement très fort. Présence de fumées et de gaz nocifs (CO) dans la cabine opérateur.",
    cause: "Corrosion acide provoquée par la condensation des gaz et les vibrations du châssis.",
    action: "Déposer le silencieux fissuré et réaliser une soudure de réparation ou le remplacer immédiatement.",
    repTime: 2.0
  },

  // SYSTEME 9 — CHÂSSIS & ROUES (5 pannes)
  {
    id: "9.2.1.A",
    system: "SYS9",
    title: "Pneu avant éclaté ou déjanté sous charge",
    severity: "ROUGE",
    symptoms: "La machine s'affaisse brutalement d'un côté, direction impossible et danger de renversement.",
    cause: "Coupure profonde par une roche tranchante en galerie ou surpression d'utilisation.",
    action: "Mettre l'engin en sécurité avec cales, lever le châssis au vérin et remplacer la roue complète.",
    repTime: 3.0
  },
  {
    id: "9.2.1.B",
    system: "SYS9",
    title: "Pression des pneus insuffisante (pneus sous-gonflés)",
    severity: "JAUNE",
    symptoms: "Direction très lourde, échauffement anormal des flancs du pneu et usure prématurée des sculptures.",
    cause: "Crevaison lente par clou de mine ou valve de gonflage fuyarde.",
    action: "Rechercher la fuite, remplacer la valve ou injecter du produit d'étanchéité, et gonfler à 4.5 bars.",
    repTime: 1.0
  },
  {
    id: "9.2.3.A",
    system: "SYS9",
    title: "Boulons de roues desserrés (risque de perte de roue)",
    severity: "ROUGE",
    symptoms: "Vibrations anormales ressenties dans la direction, bruits d'impact métallique cyclique au niveau des moyeux.",
    cause: "Oubli de resserrage après un changement de roue ou couple de serrage insuffisant.",
    action: "Resserrer immédiatement tous les écrous de roue en étoile au couple prescrit de 650 Nm.",
    repTime: 0.8
  },
  {
    id: "9.3.1.A",
    system: "SYS9",
    title: "Structure de la cabine de protection MSHA fissurée",
    severity: "ROUGE",
    symptoms: "Fissure de fatigue visible sur les montants porteurs de la structure FOPS/ROPS de la cabine.",
    cause: "Vibrations répétées de la mine souterraine ou chocs légers de blocs de roche du toit.",
    action: "Interdire l'utilisation immédiate de l'engin. Réaliser une soudure certifiée de réparation structurelle.",
    repTime: 4.0
  },
  {
    id: "9.4.1.A",
    system: "SYS9",
    title: "Silentblocs supports moteur cassés",
    severity: "JAUNE",
    symptoms: "Vibrations extrêmement fortes se propageant dans toute la cabine au ralenti, chocs au démarrage.",
    cause: "Vieillissement thermique du caoutchouc des supports ou cisaillement sous fort couple.",
    action: "Soutenir le moteur par le dessous et remplacer l'ensemble des 4 silentblocs de fixation moteur.",
    repTime: 4.5
  },

  // SYSTEME 10 — GODET, BOOM & GRAISSAGE MANUEL (6 pannes)
  {
    id: "10.1.1.A",
    system: "SYS10",
    title: "Dents ou lame d'usure du godet cassées / usées",
    severity: "JAUNE",
    symptoms: "Le chargement de la roche est difficile, le godet glisse au lieu de pénétrer le tas de minerai.",
    cause: "Abrasion naturelle extrême contre la roche dure de la mine.",
    action: "Découper la lame d'usure émoussée au chalumeau et souder une nouvelle lame d'usure en acier Hardox.",
    repTime: 5.0
  },
  {
    id: "10.1.3.A",
    system: "SYS10",
    title: "Axe de pivot du godet ovalisé ou usé (jeu excessif)",
    severity: "JAUNE",
    symptoms: "Mouvements du godet bruyants et imprécis avec un décalage angulaire visible lors du déversement.",
    cause: "Manque chronique de graissage manuel des bagues en bronze.",
    action: "Déposer l'axe, extraire les bagues usées, recharger l'alésage par soudure et rectifier, puis poser des bagues neuves.",
    repTime: 8.0
  },
  {
    id: "10.2.1.A",
    system: "SYS10",
    title: "Fissures structurelles sur les bras de levage (Boom)",
    severity: "ROUGE",
    symptoms: "Fissure fine mais visible sur les soudures critiques de la structure du bras de levage.",
    cause: "Surcharges répétées en forçant sur des blocs de roche trop volumineux.",
    action: "Arrêter l'engin, chanfreiner la fissure à la meule, préchauffer la zone et réaliser une soudure de rechargement.",
    repTime: 6.0
  },
  {
    id: "10.3.1.A",
    system: "SYS10",
    title: "Pompe de graissage manuel centralisée grippée",
    severity: "JAUNE",
    symptoms: "Aucune graisse ne sort des répartiteurs lorsque l'on actionne le levier de la pompe manuelle.",
    cause: "Clapet antiretour de la pompe bloqué par des impuretés ou corps de pompe désamorcé.",
    action: "Démonter le clapet d'aspiration de la pompe à graisse manuelle, le nettoyer, purger l'air et remonter.",
    repTime: 1.5
  },
  {
    id: "10.3.1.B",
    system: "SYS10",
    title: "Conduite d'alimentation de graissage bouchée",
    severity: "JAUNE",
    symptoms: "Un point de pivot spécifique reste sec et brillant tandis que de la graisse déborde sur les autres points.",
    cause: "Graisse solidifiée bloquant le flexible de graissage de 1/4 pouce sous l'effet de la chaleur.",
    action: "Remplacer le flexible de graissage bouché et nettoyer le canal d'injection du pivot au fil de fer.",
    repTime: 1.0
  },
  {
    id: "10.3.2.A",
    system: "SYS10",
    title: "Graissage manuel périodique oublié",
    severity: "JAUNE",
    symptoms: "Grincements stridents lors des mouvements de levage. Axes de pivots secs et rouillés.",
    cause: "Négligence de l'équipe de conduite en début de poste de travail.",
    action: "Injecter de la graisse NLGI 2 au lithium EP à l'aide de la pompe sur l'ensemble des 14 points de graissage manuels.",
    repTime: 0.8
  },

  // SYSTEME 11 — SÉCURITÉ & ANSUL (5 pannes)
  {
    id: "11.1.2.A",
    system: "SYS11",
    title: "Cales de roues de secours manquantes sur le châssis",
    severity: "JAUNE",
    symptoms: "Absence de cales lors des phases obligatoires de consignation ou de stationnement en rampe.",
    cause: "Oubli ou perte des cales en polyuréthane lors du dernier déplacement.",
    action: "Fournir et arrimer à demeure un nouveau jeu de deux cales de roues sur les supports latéraux.",
    repTime: 0.2
  },
  {
    id: "11.2.1.A",
    system: "SYS11",
    title: "Bouteille du système anti-incendie Ansul vide ou déchargée",
    severity: "ROUGE",
    symptoms: "Manomètre de la bouteille Ansul de cabine dans la zone rouge d'alerte vide.",
    cause: "Fuite lente du gaz propulseur d'azote ou déclenchement accidentel partiel antérieur.",
    action: "Remplacer immédiatement la bouteille Ansul par une bouteille rechargée et certifiée conforme.",
    repTime: 1.0
  },
  {
    id: "11.2.2.A",
    system: "SYS11",
    title: "Détecteur thermique Ansul défectueux ou fil coupé",
    severity: "JAUNE",
    symptoms: "Voyant de défaut système Ansul allumé en cabine, empêchant un démarrage serein.",
    cause: "Rupture du câble de détection thermique sous l'effet de la chaleur excessive des collecteurs.",
    action: "Remplacer la section de fil de détection endommagée et tester la boucle de résistance électrique.",
    repTime: 1.5
  },
  {
    id: "11.3.1.A",
    system: "SYS11",
    title: "Axe de sécurité Boom Up Lock tordu ou manquant",
    severity: "ROUGE",
    symptoms: "Impossible de verrouiller mécaniquement le bras de levage en position haute pour travailler dessous.",
    cause: "Tentative de forçage mécanique en abaissant le bras alors que l'axe de verrouillage était engagé.",
    action: "Découper l'axe de sécurité tordu, redresser ses oreilles de guidage et installer un axe de sécurité d'origine neuf.",
    repTime: 2.0
  },
  {
    id: "11.3.2.A",
    system: "SYS11",
    title: "Alarme de recul inopérante (non fonctionnelle)",
    severity: "JAUNE",
    symptoms: "La machine recule sans avertisseur sonore, représentant un risque d'écrasement majeur pour le personnel à pied.",
    cause: "Haut-parleur détruit par l'infiltration d'eau minérale acide lors du lavage machine.",
    action: "Changer le haut-parleur d'avertissement de recul scellé IP69K à l'arrière.",
    repTime: 0.8
  }
];

export const EPIROC_ST2D_ERRORS = [
  { id: "1", text: "Graissage manuel oublié → Usure définitive des bagues et des pivots en seulement 2 semaines de travail continu." },
  { id: "2", text: "Nettoyage des ailettes de cylindres négligé → Surchauffe catastrophique du moteur Deutz à air en moins d'une semaine." },
  { id: "3", text: "Huile de transmission non remplacée → Patinage de la boîte Funk DF80 et disques d'embrayages brûlés." },
  { id: "4", text: "Démarreur sollicité de façon prolongée sur moteur grippé ou bloqué → Surchauffe et destruction électrique du démarreur." },
  { id: "5", text: "Filtre à air à bain d'huile non vidangé → Le moteur aspire directement l'huile usée accumulée, fumée noire violente." },
  { id: "6", text: "Rupture ou manque de tension du câble de frein tambour mécanique → Perte totale de freinage de secours en rampe." },
  { id: "7", text: "Utilisation prolongée avec embrayage Funk qui patine → Surchauffe de l'huile de boîte et destruction de la transmission Funk DF80." },
  { id: "8", text: "Embrayage de 3ème usé forcé par maintien constant du levier de cabine → Surcharge thermique destructive sur la transmission Funk." },
  { id: "9", text: "Démontage de vérin sous charge sans installer l'axe de sécurité (Boom Lock) → Chute brutale mortelle du bras de levage." },
  { id: "10", text: "Réutilisation d'un joint torique hydraulique usé lors d'un raccordement → Fuite garantie sous pression sous 24 heures." },
  { id: "11", text: "Serrage des boulons de roues sans respecter l'ordre croisé → Voilement irrémédiable du disque de fixation de moyeu." },
  { id: "12", text: "Omission volontaire de la procédure de consignation LOTO → Risque élevé de démarrage accidentel de l'engin par un collègue." },
  { id: "13", text: "Huile moteur non vidangée selon les intervalles de 250h → Chute de la compression et gommage destructif des segments." },
  { id: "14", text: "Catalyseur d'échappement percé ignoré → Intoxication grave des opérateurs par le monoxyde de carbone (CO) en cabine." },
  { id: "15", text: "Chaîne de transmission non tendue périodiquement → Saut de chaîne, blocage de roue instantané et rupture du carter." }
];

export const EPIROC_ST2D_STOCK: { [key: string]: { desc: string; qty: number } } = {
  joints: { desc: "Kit de joints toriques hydrauliques", qty: 2 },
  injecteur: { desc: "Injecteur Deutz F4L912 d'origine", qty: 2 },
  pompe_injection: { desc: "Pompe d'injection mécanique reconditionnée", qty: 1 },
  filtre_air: { desc: "Filtre à air principal (cartouche sèche)", qty: 4 },
  filtre_huile: { desc: "Filtre à huile moteur Deutz", qty: 4 },
  filtre_carb: { desc: "Filtre à carburant primaire + secondaire", qty: 2 },
  filtre_hyd: { desc: "Filtre hydraulique d'aspiration 25 microns", qty: 4 },
  disques_frein: { desc: "Garnitures et mâchoires de frein à tambour", qty: 2 },
  plaquettes_frein: { desc: "Câble de frein de secours en acier renforcé", qty: 2 },
  accumulateur: { desc: "Ressort de rappel d'ancrage de frein tambour", qty: 4 },
  pompe_charge: { desc: "Commande de frein mécanique à levier", qty: 1 },
  kit_embrayage: { desc: "Kit d'embrayage et disques Funk DF80", qty: 1 },
  convertisseur: { desc: "Arbre de transmission Funk reconditionné", qty: 1 },
  verin_dir: { desc: "Vérin de direction complet reconditionné", qty: 1 },
  verin_hoist: { desc: "Vérin de levage (Hoist) complet reconditionné", qty: 1 },
  verin_dump: { desc: "Vérin de benne (Dump) complet reconditionné", qty: 1 },
  chaine: { desc: "Chaîne de transmission renforcée (jeu)", qty: 1 },
  segments: { desc: "Segments de piston Deutz F4L912 (jeu de 4 cylindres)", qty: 2 }
};

export const EPIROC_ST2D_PROCEDURES = [
  {
    id: "A",
    title: "LOTO complet ST2D (Consignation de sécurité)",
    steps: [
      "Arrêt du moteur et retrait de la clé de contact.",
      "Déconnexion du pack de batteries à l'aide des deux coupe-circuits (+ et -).",
      "Dépressurisation manuelle du réservoir d'huile hydraulique principal.",
      "Relâcher complètement la tension mécanique du câble de frein tambour de secours.",
      "Mise en place obligatoire des deux cales de roues de part et d'autre des pneus.",
      "Abaissement complet du bras et verrouillage mécanique à l'aide de l'axe Boom Lock.",
      "Pose du godet à plat sur le sol ferme de la galerie.",
      "Accrochage du panneau d'avertissement 'NE PAS DÉMARRER - INTERVENTION EN COURS'.",
      "Conservation exclusive de la clé de consignation par le mécanicien intervenant."
    ]
  },
  {
    id: "B",
    title: "Dépose et remplacement du vérin Hoist (Levage)",
    steps: [
      "Placer le bras en position haute et engager l'axe de sécurité physique Boom Lock.",
      "Purger et décharger la pression de la ligne hydraulique de levage.",
      "Placer un bac de récupération d'huile sous les raccords rigides du vérin.",
      "Désaccoupler les flexibles hydrauliques et installer des bouchons d'étanchéité.",
      "Soutenir le vérin à l'aide d'un palan ou d'une sangle de levage sécurisée.",
      "Extraire l'axe d'articulation inférieur du vérin à l'aide de l'extracteur à vis.",
      "Extraire l'axe d'articulation supérieur reliant le vérin au bras.",
      "Déposer le vérin usé et présenter le vérin reconditionné pour le remontage."
    ]
  },
  {
    id: "C",
    title: "Remplacement des mâchoires et garnitures de frein à tambour",
    steps: [
      "Sécuriser la machine au plat et appliquer la procédure LOTO.",
      "Déposer la roue et le tambour de frein pour accéder aux mâchoires de frein.",
      "Mesurer l'usure de la garniture de frein (remplacer si < épaisseur minimale).",
      "Remplacer les mâchoires de frein tambour usées par un jeu de mâchoires neuves d'origine.",
      "Vérifier l'état mécanique du cylindre de roue et des ressorts de rappel.",
      "Reposer le tambour de frein et régler le jeu à l'aide de la molette de réglage.",
      "Ajuster la tension du câble de commande mécanique au levier de cabine.",
      "Remonter la roue et faire un test d'efficacité de freinage à l'arrêt."
    ]
  },
  {
    id: "D",
    title: "Remplacement du câble de commande de frein à tambour",
    steps: [
      "Décharger la tension mécanique du câble de frein de secours en cabine.",
      "Désaccoupler le câble de la chape de liaison sur les mâchoires de frein.",
      "Détacher le câble de ses guides de châssis intermédiaire.",
      "Poser le câble neuf en acier renforcé et lubrifier ses gaines.",
      "Reconnecter le câble à l'étrier de tension et aux mâchoires.",
      "Ajuster la tension du câble pour obtenir une course de levier conforme.",
      "Démarrer la machine et effectuer un test d'arrêt complet sur rampe."
    ]
  },
  {
    id: "E",
    title: "Remplacement de la boîte de vitesses Funk DF80",
    steps: [
      "Vidanger intégralement l'huile de la transmission Funk DF80.",
      "Déposer les arbres de transmission de ponts pour libérer l'espace sous la boîte.",
      "Désaccoupler la tringlerie de vitesse mécanique et les commandes de sélection.",
      "Soutenir solidement l'ensemble boîte Funk à l'aide d'un cric de transmission lourd.",
      "Dévisser les boulons de la bride de fixation mécanique de la boîte.",
      "Reculer doucement la boîte Funk pour dégager l'arbre cannelé du volant moteur.",
      "Inspecter l'état des cannelures et du palier pilote avant le remontage."
    ]
  },
  {
    id: "F",
    title: "Démontage de l'embrayage mécanique Funk DF80",
    steps: [
      "Déposer la boîte de vitesses Funk DF80 complète de l'engin.",
      "Placer la boîte sur un berceau d'atelier approprié.",
      "Ouvrir le carter de boîte arrière pour accéder aux packs d'embrayage.",
      "Utiliser l'outillage de compression spécial Funk pour libérer le circlip de retenue.",
      "Extraire le pack de disques d'embrayage usés de la boîte Funk DF80.",
      "Inspecter l'état de surface des disques de friction (remplacer les disques brûlés).",
      "Poser les nouveaux disques après les avoir immergés dans l'huile Funk propre."
    ]
  },
  {
    id: "G",
    title: "Remplacement du filtre hydraulique d'aspiration (Suction)",
    steps: [
      "Fermer la vanne d'isolement de la conduite d'aspiration du réservoir hydraulique.",
      "Dévisser le couvercle supérieur du boîtier de filtre d'aspiration de 25 microns.",
      "Extraire délicatement la cartouche filtrante pour éviter de faire tomber des débris.",
      "Nettoyer l'intérieur du corps de filtre magnétique à l'aide d'un chiffon propre.",
      "Installer la cartouche d'aspiration neuve et remplacer le joint torique du couvercle.",
      "Ouvrir impérativement la vanne d'isolement du réservoir avant tout redémarrage."
    ]
  },
  {
    id: "H",
    title: "Remplacement d'un injecteur mécanique Deutz F4L912",
    steps: [
      "Nettoyer parfaitement la zone de culasse autour de l'injecteur à remplacer.",
      "Déposer le raccord haute pression métallique d'alimentation en gazole.",
      "Déposer la ligne de retour de gazole commune.",
      "Dévisser la bride de fixation de l'injecteur sur la culasse individuelle.",
      "Utiliser l'extracteur d'injecteur Deutz d'origine pour sortir l'injecteur grippé.",
      "Remplacer systématiquement la rondelle d'étanchéité en cuivre au fond du puits.",
      "Insérer l'injecteur taré neuf, serrer la bride au couple de 20 Nm, reconnecter les conduites."
    ]
  },
  {
    id: "I",
    title: "Nettoyage approfondi des ailettes du moteur à air Deutz",
    steps: [
      "Déposer les tôles de guidage et de protection d'air de refroidissement (shroud).",
      "Utiliser un grattoir métallique fin pour décoller la calamine d'huile et la poussière entre chaque ailette.",
      "Projeter un solvant dégraissant biodégradable sur l'ensemble du bloc moteur.",
      "Laisser agir 15 minutes, puis rincer au nettoyeur haute pression à vapeur d'eau chaude.",
      "Souffler le moteur complet à l'air comprimé sec.",
      "Reposer minutieusement les tôles shroud d'air pour garantir le bon canal de refroidissement."
    ]
  },
  {
    id: "J",
    title: "Réglage de la tension des chaînes de transmission",
    steps: [
      "Mettre la machine sur chandelles de sécurité pour libérer les roues du sol.",
      "Desserrer les boulons de blocage de l'arbre de roue excentrique.",
      "Faire pivoter l'axe excentrique à l'aide de la clé à fourche pour tendre la chaîne.",
      "Mesurer la flèche de la chaîne au point milieu (doit être comprise entre 15 et 20 mm).",
      "Resserrer les boulons d'excentrique au couple de serrage final requis.",
      "Lubrifier abondamment la chaîne avec de la graisse spéciale chaîne adhérente."
    ]
  },
  {
    id: "K",
    title: "Entretien du système de graissage manuel centralisé",
    steps: [
      "Remplir le réservoir de la pompe de graissage manuelle avec de la graisse NLGI 2 lithium EP.",
      "Vérifier la propreté de l'ensemble des 14 points de graissage raccordés.",
      "Actionner manuellement le levier de la pompe jusqu'à obtenir une pression constante.",
      "Vérifier visuellement le débordement de graisse fraîche sur chaque articulation de pivot.",
      "Si un pivot reste sec, démonter le raccord de flexible pour éliminer le bouchon de graisse sèche."
    ]
  }
];

export const EPIROC_ST2D_SYMPTOMS_INDEX: { [key: string]: string[] } = {
  "BRUITS": [
    "1.1.2.B Claquement métallique moteur (Cylindre défectueux)",
    "2.2.5.A Sifflement mécanique dans la transmission (Roulements)",
    "3.1.2.A Sifflement aigu des pompes hydrauliques (Cavitation)",
    "4.2.1.A Claquement violent au niveau du pivot central (Usure)",
    "10.3.2.A Grincement sec sur les bras de levage (Manque graisse)"
  ],
  "FUMÉES": [
    "1.1.2.A Fumée noire épaisse sous charge (Excès gazole)",
    "1.1.2.B Fumée noire intermittente au ralenti (Injecteur grippé)",
    "1.1.7.A Fumée blanche dense à l'échappement (Culasse fissurée)",
    "1.1.5.C Fumée bleue constante (Usure des segments d'huile)"
  ],
  "FUITES": [
    "1.1.2.C Gazole dilué dans l'huile moteur (Joint injecteur rompu)",
    "2.2.4.A Fuite d'huile sous la transmission (Joint spi)",
    "3.3.1.A Fuite d'huile de direction centrale (Joint vérin)",
    "3.3.4.A Fuite récurrente sur tige de vérin (Tige rayée)"
  ],
  "COMPORTEMENTS": [
    "1.1.1.A Le moteur ne démarre pas (Arrêt mécanique)",
    "2.1.1.A Pas de force de pénétration dans le tas de roche (Boîte Funk)",
    "3.3.2.A Le bras redescend tout seul sous charge (Dérive interne)",
    "4.1.1.A Volant de direction extrêmement dur (Orbitrol pollué)",
    "5.1.2.A Freins bloqués et refus de déplacement (Étrier grippé)"
  ]
};

export const EPIROC_ST2D_REFERENCES = {
  pression_huile_moteur: { normal: "3.5 - 4.5 bar", alarme: "< 1.5 bar", arret: "< 1.0 bar" },
  temperature_cylindres: { normal: "110°C - 150°C", alarme: "> 165°C", arret: "> 175°C" },
  pression_transmission: { normal: "18 - 21 bar", alarme: "< 15 bar", arret: "< 12 bar" },
  hydraulique_travail: { normal: "11.4 MPa (114 bar)", alarme: "< 10.0 MPa", arret: "N/A" },
  hydraulique_direction: { normal: "13.1 MPa (131 bar)", alarme: "< 11.5 MPa", arret: "N/A" },
  pression_freinage: { normal: "Mécanique à câble", alarme: "N/A", arret: "N/A" },
  pression_air_starter: { normal: "6.0 - 8.0 bar", alarme: "< 6.0 bar", arret: "N/A" }, // CORRIGÉ V5 : Remplacement tension batterie (inexistante) par pression air starter
  pression_pneus: { normal: "4.5 bar (65 psi)", alarme: "N/A", arret: "N/A" },
  epaisseur_machoires_min: { normal: "8.0 mm", limite: "3.0 mm", action: "Remplacement" },
  jeu_articulation_max: { normal: "< 0.5 mm", limite: "2.0 mm", action: "Réfection pivot" }
};

export const EPIROC_ST2D_COUPLES = [
  { assemblage: "Boulons de culasse individuelle Deutz", filetage: "M12", couple: "45 Nm + 120°", freinage: "Lubrification fine", controle: "À chaque dépose" },
  { assemblage: "Écrous de roues avant et arrière", filetage: "M22", couple: "650 Nm", freinage: "Serrage croisé étoile", controle: "Toutes les 50 heures" },
  { assemblage: "Brides de fixation d'articulation centrale", filetage: "M20", couple: "480 Nm", freinage: "Frein filet fort Loctite 270", controle: "Toutes les 250 heures" },
  { assemblage: "Boulons de fixation de la boîte Funk DF80", filetage: "M10", couple: "85 Nm", freinage: "Rondelles grower", controle: "À la pose" },
  { assemblage: "Écrous de brides de joints de cardans", filetage: "M14", couple: "140 Nm", freinage: "Écrous nylstop neufs", controle: "Toutes les 100 heures" }
];

export const EPIROC_ST2D_KITS = [
  { frequence: "50 heures (Mise en route / Mine)", operations: "Graissage de tous les pivots, nettoyage du cyclone de pré-filtrage d'air, contrôle du serrage de roues." },
  { frequence: "100 heures (Périodique standard)", operations: "Niveau d'huile de boîte de vitesses Funk DF80, contrôle d'étanchéité des vérins, dépoussiérage des ailettes moteur." },
  { frequence: "250 heures (Vidange moteur)", operations: "Vidange de l'huile de carter Deutz F4L912 (15W-40), remplacement du filtre à huile et carburant primaire." },
  { frequence: "500 heures (Entretien intermédiaire)", operations: "Remplacement de la cartouche de filtre à air sèche, remplacement des filtres de transmission, réglage des culbuteurs." },
  { frequence: "1000 heures (Grande révision)", operations: "Vidange complète de l'huile de transmission Funk DF80, vidange hydraulique, lubrification des câbles de frein." }
];
