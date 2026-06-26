import fs from 'fs';
import path from 'path';

function run() {
  const srcHtmlPath = path.resolve('public/print-st7.html');
  if (!fs.existsSync(srcHtmlPath)) {
    console.error('Source print-st7.html does not exist!');
    process.exit(1);
  }

  let html = fs.readFileSync(srcHtmlPath, 'utf-8');

  // Replace Title
  html = html.replace(
    '<title>Cahier des Charges Visuel - Epiroc Scooptram ST7 - Export PDF</title>',
    '<title>Manuel Complet Technique ST7 - Epiroc Scooptram ST7 - Export PDF</title>'
  );

  // 1. Update the table of contents on the cover page
  // Let's find the TOC in the HTML and replace it with a comprehensive one
  const tocStart = html.indexOf('<div class="cover-toc">');
  const tocEnd = html.indexOf('</div>', tocStart + 50) + 6;

  if (tocStart !== -1) {
    const newToc = `
    <div class="cover-toc">
      <h3 class="toc-title">TABLE DES MATIÈRES</h3>
      <ul class="toc-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px;">
        <div>
          <li><a href="#page-2"><span>CHAPITRE 1 — SCHÉMAS ÉCLATÉS INTERACTIFS</span> <span class="toc-dots"></span> <span class="toc-page">Pages 2-10</span></a></li>
          <li><a href="#page-11"><span>CHAPITRE 2 — PHOTOS RÉELLES AVANT/PENDANT/APRÈS</span> <span class="toc-dots"></span> <span class="toc-page">Pages 11-25</span></a></li>
          <li><a href="#page-26"><span>CHAPITRE 3 — STORYBOARDS DE TOURNAGE</span> <span class="toc-dots"></span> <span class="toc-page">Pages 26-40</span></a></li>
          <li><a href="#page-41"><span>CHAPITRE 4 — ANIMATIONS TECHNIQUES INTERACTIVES</span> <span class="toc-dots"></span> <span class="toc-page">Pages 41-45</span></a></li>
          <li><a href="#page-46"><span>CHAPITRE 5 — COTES, TOLÉRANCES & PROCÉDURES</span> <span class="toc-dots"></span> <span class="toc-page">Pages 46-75</span></a></li>
          <li><a href="#page-76"><span>CHAPITRE 6 — FICHES TECHNIQUES DES OUTILS</span> <span class="toc-dots"></span> <span class="toc-page">Pages 76-101</span></a></li>
        </div>
        <div>
          <li><a href="#page-102"><span>CHAPITRE 7 — PANNE ET DIAGNOSTIC (80+ PANNES)</span> <span class="toc-dots"></span> <span class="toc-page">Pages 102-120</span></a></li>
          <li><a href="#page-121"><span>CHAPITRE 8 — ARBRES DE DÉCISION (10 FLUX)</span> <span class="toc-dots"></span> <span class="toc-page">Pages 121-140</span></a></li>
          <li><a href="#page-141"><span>CHAPITRE 9 — CHECKLIST MAINTENANCE PREVENTIVE</span> <span class="toc-dots"></span> <span class="toc-page">Pages 141-148</span></a></li>
          <li><a href="#page-150"><span>CHAPITRE 10 — GLOSSAIRE TECHNIQUE (50 TERMES)</span> <span class="toc-dots"></span> <span class="toc-page">Pages 149-150</span></a></li>
          <li><a href="#page-151"><span>PAGE FINALE DU MANUEL COMPLET TECHNIQUE</span> <span class="toc-dots"></span> <span class="toc-page">Page 151</span></a></li>
        </div>
      </ul>
    </div>`;
    html = html.substring(0, tocStart) + newToc + html.substring(tocEnd);
  }

  // Replace Cover Subtitle and Description
  html = html.replace('CAHIER DES CHARGES VISUELS', 'MANUEL TECHNIQUE COMPLET ST7');
  html = html.replace('Manuel Technique d\'Aide à la Maintenance Préventive et Corrective', 'Guide Complet de Diagnostic, Pannes, Arbres de Décision & Checklists');

  // Replace "Page X / 101" with "Page X / 151" for the existing pages
  html = html.replace(/Page\s+(\d+)\s*\/\s*101/g, 'Page $1 / 151');

  // Let's remove the original final page wrapper (the last </div> and </body> and </html>) so we can append more pages
  const bodyEndIndex = html.lastIndexOf('</body>');
  let bodyContent = html.substring(0, bodyEndIndex).trim();

  // Remove the last page closure if needed (we want to make sure it's closed correctly)
  // Let's build the additional pages (Page 101 was the final page, let's keep it as is or change its header and footer)
  // Wait, let's look at Page 100 (which was page 101 in physical count). It had id="page-100".
  // Let's change its footer from "Page 100 / 151" to "Page 100 / 151". (It will happen automatically with the regex!)
  
  // Now let's generate PAGES 102 to 151.
  const extraPages: string[] = [];
  let pageCounter = 101; // Starts at 101 (id="page-101" is the 102nd physical page, because pageCounter starts at 1, cover is 1, page 100 is id="page-100")

  function createExtraPage(contentHtml: string, isLandscape: boolean = false, title: string = 'MANUEL TECHNIQUE COMPLET — SCOOPTRAM ST7') {
    const pageNum = pageCounter++;
    const orientationClass = isLandscape ? 'landscape' : 'portrait';
    const today = new Date().toLocaleDateString('fr-FR');
    
    return `
    <div class="page ${orientationClass}" id="page-${pageNum}">
      <div class="page-header">
        <div class="header-left">
          <span class="header-logo">EPIROC</span>
          <span class="header-sep">|</span>
          <span class="header-title">${title}</span>
        </div>
        <div class="header-right">Doc. Epiroc 9833-2103-01</div>
      </div>
      <div class="page-content">
        ${contentHtml}
      </div>
      <div class="page-footer">
        <div class="footer-left">Doc. Epiroc 9833-2103-01 — Confidentiel — Usage interne Epiroc uniquement</div>
        <div class="footer-center">${today}</div>
        <div class="footer-right">Page ${pageNum} / 151</div>
      </div>
    </div>
    `;
  }

  // ==================== PAGES 102-120: CHAPITRE 7 — PANNE ET DIAGNOSTIC ====================
  const pannes: { ref: string; symptome: string; cause: string; gravite: 'Critique' | 'Majeur' | 'Mineur' | 'Info' }[] = [
    // Engine (1-20)
    { ref: 'M-01', symptome: 'Le moteur Cummins QSB 6.7 refuse de démarrer', cause: 'Tension batterie faible (<24V), coupe-batterie ouvert ou démarreur HS', gravite: 'Critique' },
    { ref: 'M-02', symptome: 'Voyant de basse pression d\'huile allumé en cabine', cause: 'Niveau d\'huile bas, capteur de pression défectueux ou pompe usée', gravite: 'Critique' },
    { ref: 'M-03', symptome: 'Surchauffe du liquide de refroidissement (>102°C)', cause: 'Radiateur obstrué, courroie rompue ou thermostat bloqué fermé', gravite: 'Critique' },
    { ref: 'M-04', symptome: 'Fumée noire importante à l\'échappement', cause: 'Filtre à air colmaté, injecteurs encrassés ou défaillance du turbo', gravite: 'Majeur' },
    { ref: 'M-05', symptome: 'Fumée bleue constante avec odeur d\'huile brûlée', cause: 'Usure des segments de pistons, guides de soupape ou palier de turbo', gravite: 'Majeur' },
    { ref: 'M-06', symptome: 'Fumée blanche au démarrage à froid', cause: 'Présence d\'eau dans le carburant ou défaillance des bougies de préchauffage', gravite: 'Mineur' },
    { ref: 'M-07', symptome: 'Fuite de carburant sur le circuit haute pression Common Rail', cause: 'Raccords d\'injecteurs desserrés ou fissure sur la rampe de distribution', gravite: 'Critique' },
    { ref: 'M-08', symptome: 'Bruit métallique aigu provenant du turbocompresseur', cause: 'Aube de turbine tordue ou manque flagrant de lubrification des paliers', gravite: 'Critique' },
    { ref: 'M-09', symptome: 'Régime de ralenti instable avec fortes vibrations', cause: 'Filtre à carburant obstrué ou prise d\'air dans le circuit d\'alimentation', gravite: 'Mineur' },
    { ref: 'M-10', symptome: 'Perte de puissance sous charge avec limitations de régime', cause: 'Capteur de pression de suralimentation HS ou ECU en mode dégradé', gravite: 'Majeur' },
    { ref: 'M-11', symptome: 'Le solénoïde du démarreur claque mais le démarreur ne tourne pas', cause: 'Bornes de batterie oxydées ou charbons du démarreur usés', gravite: 'Majeur' },
    { ref: 'M-12', symptome: 'L\'alternateur ne charge pas la batterie (tension <25V en marche)', cause: 'Régulateur de tension défaillant ou courroie d\'alternateur desserrée', gravite: 'Majeur' },
    { ref: 'M-13', symptome: 'Perte d\'accélération brusque lors des montées en rampe', cause: 'Préfiltre séparateur d\'eau colmaté par des sédiments ou de la paraffine', gravite: 'Mineur' },
    { ref: 'M-14', symptome: 'Témoin de colmatage du filtre à air moteur jaune/orange', cause: 'Accumulation excessive de poussière dans la cartouche principale', gravite: 'Info' },
    { ref: 'M-15', symptome: 'Erreur active RCS : Signal capteur rampe haute pression invalide', cause: 'Faisceau électrique endommagé ou capteur défectueux', gravite: 'Majeur' },
    { ref: 'M-16', symptome: 'Ratés d\'allumage cylindre 3 détectés par le système J1939', cause: 'Bobine d\'injecteur n°3 défaillante ou connecteur oxydé', gravite: 'Critique' },
    { ref: 'M-17', symptome: 'Indication niveau d\'urée (AdBlue) à zéro sur écran RCS', cause: 'Réservoir vide ou capteur de niveau/température d\'urée défectueux', gravite: 'Info' },
    { ref: 'M-18', symptome: 'Ventilateur de refroidissement tourne en permanence à fond', cause: 'Electrovanne d\'embrayage hydraulique déconnectée ou fusible grillé', gravite: 'Majeur' },
    { ref: 'M-19', symptome: 'Pompe de gavage basse pression bruyante', cause: 'Crépine de réservoir obstruée, pompe usée aspirant de l\'air', gravite: 'Majeur' },
    { ref: 'M-20', symptome: 'Démarrage difficile par temps froid', cause: 'Relais de préchauffage défectueux ou bougies d\'allumage hors service', gravite: 'Mineur' },
    // Transmission (21-40)
    { ref: 'T-01', symptome: 'Patinage de la boîte Funk en 1ère vitesse sous forte traction', cause: 'Pression d\'embrayage trop basse ou disques de friction usés', gravite: 'Majeur' },
    { ref: 'T-02', symptome: 'Température d\'huile de transmission excessive (>120°C)', cause: 'Niveau d\'huile inadéquat, convertisseur bloqué ou refroidisseur obstrué', gravite: 'Critique' },
    { ref: 'T-03', symptome: 'Sifflement métallique permanent de la boîte de vitesses', cause: 'Roulement de boîte endommagé ou pignons usés', gravite: 'Majeur' },
    { ref: 'T-04', symptome: 'Engagement tardif de la marche avant (délai >2 secondes)', cause: 'Joints d\'étanchéité d\'embrayage fuyants ou solénoïde de commande gommé', gravite: 'Mineur' },
    { ref: 'T-05', symptome: 'Passage très brutal de la 1ère à la 2ème vitesse', cause: 'Problème de calibrage de l\'embrayage ou capteur de vitesse défaillant', gravite: 'Mineur' },
    { ref: 'T-06', symptome: 'La 3ème vitesse saute ou refuse de s\'engager', cause: 'Bobine d\'électrovanne Y3 défaillante ou tiroir de distributeur bloqué', gravite: 'Majeur' },
    { ref: 'T-07', symptome: 'Baisse importante de la pression de charge de transmission', cause: 'Pompe de charge interne usée ou clapet de décharge bloqué ouvert', gravite: 'Critique' },
    { ref: 'T-08', symptome: 'La boîte reste bloquée au neutre malgré la sélection', cause: 'Verrouillage de sécurité RCS actif ou capteur de neutre défaillant', gravite: 'Critique' },
    { ref: 'T-09', symptome: 'Changement oscillatoire de rapport permanent à vide (pompage)', cause: 'Algorithme TCU perturbé par un signal de vitesse instable', gravite: 'Mineur' },
    { ref: 'T-10', symptome: 'Présence importante de limaille de fer sur le bouchon aimanté', cause: 'Détérioration d\'un embrayage ou rupture interne d\'un pignon', gravite: 'Critique' },
    { ref: 'T-11', symptome: 'Le chargeur n\'avance pas du tout alors que le moteur tourne', cause: 'Arbre cannelé d\'accouplement de convertisseur cassé', gravite: 'Critique' },
    { ref: 'T-12', symptome: 'Levier de sélection de vitesses cabine sans réponse', cause: 'Faisceau électrique coupé ou joystick de sens de marche HS', gravite: 'Majeur' },
    { ref: 'T-13', symptome: 'Fuite d\'huile continue au niveau de l\'accouplement d\'arbre arrière', cause: 'Joint spi de sortie de boîte usé ou arbre de sortie rayé', gravite: 'Majeur' },
    { ref: 'T-14', symptome: 'Le pont avant ne s\'enclenche pas (perte de traction 4x4)', cause: 'Embrayage de pont défectueux ou fuite d\'air/huile de commande', gravite: 'Majeur' },
    { ref: 'T-15', symptome: 'Témoin de colmatage du filtre à huile de boîte actif à chaud', cause: 'Filtre saturé de résidus d\'embrayage ou huile inappropriée', gravite: 'Majeur' },
    { ref: 'T-16', symptome: 'Défaut de communication CAN permanent entre TCU et RCS', cause: 'Câblage bus CAN endommagé ou module TCU grillé', gravite: 'Critique' },
    { ref: 'T-17', symptome: 'Basse pression de lubrification de l\'arbre secondaire', cause: 'Gicleur de lubrification bouché ou canal interne obstrué', gravite: 'Critique' },
    { ref: 'T-18', symptome: 'Mousse importante visible sur la jauge de niveau d\'huile de boîte', cause: 'Trop-plein d\'huile ou aspiration d\'air par le joint de pompe', gravite: 'Mineur' },
    { ref: 'T-19', symptome: 'Forte odeur d\'huile brûlée lors de l\'extraction de roche', cause: 'Glissement anormal prolongé des disques d\'embrayage', gravite: 'Critique' },
    { ref: 'T-20', symptome: 'Vibration intense sous le siège cabine lors des accélérations', cause: 'Croisillon de cardan d\'arbre de transmission usé ou desserré', gravite: 'Majeur' },
    // Hydraulics (41-60)
    { ref: 'H-01', symptome: 'Mouvements de direction extrêmement lents au démarrage', cause: 'Huile hydraulique trop visqueuse à froid ou pompe de direction usée', gravite: 'Mineur' },
    { ref: 'H-02', symptome: 'Dérive progressive du bras de levage en charge (gauche/droite)', cause: 'Fuite interne sur les joints de pistons des vérins de levage', gravite: 'Majeur' },
    { ref: 'H-03', symptome: 'Dérive du godet vers l\'avant en position neutre', cause: 'Clapet anti-retour de pilotage ou joint de vérin de bennage usé', gravite: 'Majeur' },
    { ref: 'H-04', symptome: 'Grondement fort de la pompe hydraulique principale', cause: 'Cavitation due à un filtre d\'aspiration bouché ou niveau trop bas', gravite: 'Critique' },
    { ref: 'H-05', symptome: 'Surchauffe rapide de l\'huile hydraulique (>90°C)', cause: 'Radiateur d\'huile encrassé ou soupape de décharge coincée ouverte', gravite: 'Critique' },
    { ref: 'H-06', symptome: 'Fuite de fluide importante sur la tige du vérin de direction', cause: 'Joint racleur et joint à lèvres de nez de vérin endommagés', gravite: 'Majeur' },
    { ref: 'H-07', symptome: 'Les commandes manuelles par joystick sont très dures', cause: 'Pression de pilotage hydraulique trop basse (accumulateur dégonflé)', gravite: 'Critique' },
    { ref: 'H-08', symptome: 'Le bras monte mais refuse de descendre', cause: 'Bobine de descente défaillante ou tiroir du distributeur bloqué', gravite: 'Critique' },
    { ref: 'H-09', symptome: 'Rupture soudaine d\'un flexible hydraulique principal du bras', cause: 'Frottement répété sur le châssis ou dépassement de pression limite', gravite: 'Critique' },
    { ref: 'H-10', symptome: 'Écrasement ou déformation du flexible d\'aspiration de pompe', cause: 'Filtre de mise à l\'air du réservoir bouché créant un vide interne', gravite: 'Critique' },
    { ref: 'H-11', symptome: 'Voyant de colmatage du filtre de retour allumé sur le RCS', cause: 'Élément filtrant saturé d\'impuretés (nécessite remplacement immédiat)', gravite: 'Mineur' },
    { ref: 'H-12', symptome: 'Bulles d\'air massives présentes dans le réservoir hydraulique', cause: 'Prise d\'air sur le raccord d\'aspiration de la pompe', gravite: 'Mineur' },
    { ref: 'H-13', symptome: 'La direction devient dure après 1 heure de fonctionnement', cause: 'Chute de viscosité de l\'huile due à la surchauffe', gravite: 'Majeur' },
    { ref: 'H-14', symptome: 'Aucun mouvement hydraulique possible (joystick inerte)', cause: 'Solénoïde d\'isolement hydraulique général déconnecté ou grillé', gravite: 'Critique' },
    { ref: 'H-15', symptome: 'Sifflement aigu continu dès qu\'on actionne le levage', cause: 'Soupape de sécurité de décharge principale tarée trop bas', gravite: 'Mineur' },
    { ref: 'H-16', symptome: 'Priorité de direction inefficace en cas de surcharge', cause: 'Valve de priorité de direction coincée par des débris', gravite: 'Critique' },
    { ref: 'H-17', symptome: 'Chocs violents ressentis dans la direction lors du roulage', cause: 'Vessie d\'azote de l\'accumulateur de direction percée', gravite: 'Majeur' },
    { ref: 'H-18', symptome: 'Le système anti-balancement (Ride Control) reste inactif', cause: 'Accumulateurs basse pression dégonflés ou électrovanne bloquée', gravite: 'Info' },
    { ref: 'H-19', symptome: 'Suintement d\'huile constant au niveau du collecteur rotatif', cause: 'Usure des joints tournants internes de l\'articulation centrale', gravite: 'Majeur' },
    { ref: 'H-20', symptome: 'Pompe hydraulique de remplissage manuelle inopérante', cause: 'Clapet antiretour de la pompe bloqué par une impureté', gravite: 'Info' },
    // Brakes (61-75)
    { ref: 'F-01', symptome: 'Les freins de service SAHR refusent de se desserrer', cause: 'Pression de pilotage insuffisante pour comprimer les ressorts internes', gravite: 'Critique' },
    { ref: 'F-02', symptome: 'Glissement du chargeur à l\'arrêt sur une rampe inclinée', cause: 'Usure prononcée des disques de friction en bronze ou fuite de pression', gravite: 'Critique' },
    { ref: 'F-03', symptome: 'Voyant de basse pression d\'accumulateur de frein rouge allumé', cause: 'Accumulateur de frein dégonflé en azote ou pompe de frein usée', gravite: 'Critique' },
    { ref: 'F-04', symptome: 'Electrovanne de frein de parc Y1 grillée ou grippée', cause: 'Court-circuit sur bobine ou pollution dans le bloc de freinage', gravite: 'Critique' },
    { ref: 'F-05', symptome: 'Pédale de frein molle avec efficacité de freinage réduite', cause: 'Présence d\'air résiduel dans les conduites hydrauliques des ponts', gravite: 'Critique' },
    { ref: 'F-06', symptome: 'Écran RCS de cabine complètement éteint ou gelé', cause: 'Défaut d\'alimentation du boîtier d\'affichage ou fusible F5 fondu', gravite: 'Critique' },
    { ref: 'F-07', symptome: 'Alerte RCS active : Perte J1939 sur nœud transmission', cause: 'Fils de communication CAN High / CAN Low coupés ou en court-circuit', gravite: 'Critique' },
    { ref: 'F-08', symptome: 'Mesure de charge utile (pesage embarqué) erronée', cause: 'Capteurs de pression de vérins de levage non étalonnés ou décalés', gravite: 'Info' },
    { ref: 'F-09', symptome: 'L\'indicateur d\'angle d\'articulation ne varie plus', cause: 'Capteur de position rotatif d\'articulation cassé ou désaligné', gravite: 'Majeur' },
    { ref: 'F-10', symptome: 'Alerte température d\'huile de pont excessive', cause: 'Niveau d\'huile de pont trop élevé ou frein humide bloqué serré', gravite: 'Majeur' },
    { ref: 'F-11', symptome: 'Absence d\'allumage des feux stop lors du freinage', cause: 'Manocontact de freinage de service défectueux', gravite: 'Mineur' },
    { ref: 'F-12', symptome: 'Temps de réponse du freinage de secours trop long', cause: 'Restrictions de débit dans les conduites de retour du bloc SAHR', gravite: 'Critique' },
    { ref: 'F-13', symptome: 'Défaut RCS : Erreur de checksum sur paramètres système', cause: 'Mémoire EEPROM corrompue suite à une coupure brutale d\'alimentation', gravite: 'Critique' },
    { ref: 'F-14', symptome: 'Incohérence permanente entre vitesse de pont avant et arrière', cause: 'Capteur de vitesse inductif d\'arbre de transmission desserré', gravite: 'Majeur' },
    { ref: 'F-15', symptome: 'Sonde de température de frein en circuit ouvert', cause: 'Câble arraché au niveau du moyeu de roue lors du chargement', gravite: 'Mineur' },
    // Electric / Chassis / General (76-83)
    { ref: 'E-01', symptome: 'Bruit de claquement sec lors des changements de sens de marche', cause: 'Jeu excessif dans les rotules de l\'articulation centrale de châssis', gravite: 'Critique' },
    { ref: 'E-02', symptome: 'Fissure visible à l\'œil nu sur les plaques de jonction du bras', cause: 'Fatigue extrême du métal suite à des surcharges répétées', gravite: 'Critique' },
    { ref: 'E-03', symptome: 'Extinction de tous les projecteurs de travail à LED avant', cause: 'Relais d\'éclairage HS ou court-circuit général sur la ligne de toit', gravite: 'Mineur' },
    { ref: 'E-04', symptome: 'Batteries complètement déchargées après une nuit d\'arrêt', cause: 'Alternateur fuyant ou consommateur parasite resté actif en cabine', gravite: 'Mineur' },
    { ref: 'E-05', symptome: 'Avertisseur sonore inopérant (bouton enfoncé sans bruit)', cause: 'Klaxon exposé à l\'eau grillé ou connecteur débranché', gravite: 'Mineur' },
    { ref: 'E-06', symptome: 'Le moteur d\'essuie-glace cabine chauffe et s\'arrête', cause: 'Mécanisme de tringlerie grippé ou balai collé au pare-brise', gravite: 'Info' },
    { ref: 'E-07', symptome: 'L\'alarme sonore de recul ne retentit pas en marche arrière', cause: 'Bruiteur de recul endommagé ou relais de marche arrière HS', gravite: 'Majeur' },
    { ref: 'E-08', symptome: 'Écran de la caméra de recul noir avec icône "Pas de signal"', cause: 'Câble coaxial vidéo blindé sectionné dans l\'articulation', gravite: 'Majeur' },
    { ref: 'E-09', symptome: 'Perte totale de la liaison télémétrique Certiq', cause: 'Antenne GPS/GPRS cassée ou module émetteur non alimenté', gravite: 'Info' },
    { ref: 'E-10', symptome: 'Indication de pression de pneu erronée sur l\'écran RCS', cause: 'Capteur de roue TPMS cassé lors du roulage sur débris coupants', gravite: 'Info' },
    { ref: 'E-11', symptome: 'Certains points d\'articulation ne reçoivent pas de graisse', cause: 'Canal de graissage bouché ou conduite du graissage centralisé coupée', gravite: 'Mineur' },
    { ref: 'E-12', symptome: 'L\'arrêt d\'urgence cabine enfoncé ne coupe pas le moteur', cause: 'Bloc de contact électrique d\'arrêt d\'urgence défaillant (sécurité)', gravite: 'Critique' },
    { ref: 'E-13', symptome: 'Claquements répétitifs au niveau des axes d\'attache du godet', cause: 'Usure importante des bagues d\'usure en bronze (jeu hors tolérance)', gravite: 'Majeur' }
  ];

  // Let's create pages for Chapter 7 (Pages 102 to 120)
  // Let's chunk pannes: Page 102 (title + intro + 3 pannes), Page 103-119 (4 pannes per page), Page 120 (remaining pannes + summary)
  const renderPanneRow = (p: typeof pannes[0]) => {
    let badgeClass = '';
    let badgeText = '';
    if (p.gravite === 'Critique') { badgeClass = 'background-color: #fef2f2; border: 1px solid #fecaca; color: #991b1b;'; badgeText = '🔴 Critique (Arrêt immédiat)'; }
    else if (p.gravite === 'Majeur') { badgeClass = 'background-color: #fff7ed; border: 1px solid #ffedd5; color: #c2410c;'; badgeText = '🟠 Majeur (<4h)'; }
    else if (p.gravite === 'Mineur') { badgeClass = 'background-color: #fef9c3; border: 1px solid #fef08a; color: #a16207;'; badgeText = '🟡 Mineur (<1h)'; }
    else { badgeClass = 'background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;'; badgeText = '🟢 Info (Préventif)'; }

    return `
      <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 10px; background: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; margin-bottom: 5px;">
          <span style="font-weight: bold; font-family: monospace; color: #0f172a; font-size: 10pt;">REF: ${p.ref}</span>
          <span style="font-size: 8pt; font-weight: bold; padding: 2px 8px; border-radius: 20px; ${badgeClass}">${badgeText}</span>
        </div>
        <div style="font-size: 9pt; color: #1e293b; margin-bottom: 4px;"><strong>Symptôme :</strong> ${p.symptome}</div>
        <div style="font-size: 8.5pt; color: #475569; line-height: 1.3;"><strong>Cause probable :</strong> ${p.cause}</div>
      </div>
    `;
  };

  // Chapter 7 Page 102
  const ch7IntroHtml = `
    <h2 class="section-title">CHAPITRE 7 — GUIDE DES PANNES ET DIAGNOSTICS (80+ PANNES)</h2>
    <p class="section-intro">
      Ce chapitre dresse l'inventaire exhaustif des pannes opérationnelles potentielles sur le chargeur souterrain Epiroc Scooptram ST7. Il sert de guide d'intervention rapide pour les équipes de maintenance de premier et de second niveau.
    </p>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; background: #0f172a; padding: 10px; border-radius: 8px;">
      <div style="background: rgba(239,68,68,0.1); border: 1px solid #ef4444; border-radius: 4px; padding: 6px; color: #f87171; text-align: center; font-size: 7.5pt;">
        <strong>🔴 CRITIQUE</strong><br>Arrêt immédiat de la machine.
      </div>
      <div style="background: rgba(249,115,22,0.1); border: 1px solid #f97316; border-radius: 4px; padding: 6px; color: #fb923c; text-align: center; font-size: 7.5pt;">
        <strong>🟠 MAJEUR</strong><br>Réparation requise &lt; 4 heures.
      </div>
      <div style="background: rgba(245,158,11,0.1); border: 1px solid #f59e0b; border-radius: 4px; padding: 6px; color: #facc15; text-align: center; font-size: 7.5pt;">
        <strong>🟡 MINEUR</strong><br>Réparation requise &lt; 1 heure.
      </div>
      <div style="background: rgba(34,197,94,0.1); border: 1px solid #22c55e; border-radius: 4px; padding: 6px; color: #4ade80; text-align: center; font-size: 7.5pt;">
        <strong>🟢 INFO</strong><br>Action préventive conseillée.
      </div>
    </div>
    <h3 class="subsection-title">7.1 DIAGNOSTICS DU BLOC MOTEUR CUMMINS (PANNES 1 À 3)</h3>
    <div style="margin-top: 5px;">
      ${pannes.slice(0, 3).map(renderPanneRow).join('')}
    </div>
  `;
  extraPages.push(createExtraPage(ch7IntroHtml, false, 'CHAPITRE 7 — GUIDE DES PANNES'));

  // Pages 103-119: 4 pannes per page. Let's slice appropriately!
  let panneIndex = 3;
  for (let pNum = 103; pNum <= 119; pNum++) {
    const pagePannes = pannes.slice(panneIndex, panneIndex + 4);
    panneIndex += 4;
    
    // Determine subunit label
    let subUnit = "MOTEUR CUMMINS QSB 6.7";
    if (panneIndex > 60) subUnit = "BLOC FREINAGE SAHR & COMMUNICATIONS RCS";
    else if (panneIndex > 40) subUnit = "CIRCUITS HYDRAULIQUES DE DIRECTION & BRAS";
    else if (panneIndex > 20) subUnit = "TRANSMISSION FUNK DF150 / DF250";

    const pageHtml = `
      <h3 class="subsection-title">7.2 DIAGNOSTICS — SOUS-SYSTÈME ${subUnit}</h3>
      <p style="font-size: 8.5pt; color: #64748b; margin-top: -5px; margin-bottom: 12px;">Fiche technique d'intervention rapide pour techniciens Epiroc agréés.</p>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${pagePannes.map(renderPanneRow).join('')}
      </div>
    `;
    extraPages.push(createExtraPage(pageHtml, false, 'CHAPITRE 7 — GUIDE DES PANNES'));
  }

  // Page 120: Remaining pannes + Chapter summary
  const remainingPannes = pannes.slice(panneIndex);
  const ch7FinalHtml = `
    <h3 class="subsection-title">7.3 DIAGNOSTICS — ORGANES AUXILIAIRES & GÉNÉRAUX</h3>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px;">
      ${remainingPannes.map(renderPanneRow).join('')}
    </div>
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; font-size: 8.5pt; color: #1e3a8a; line-height: 1.4;">
      <strong style="text-transform: uppercase; display: block; margin-bottom: 4px; color: #1d4ed8;">📌 RECOMMANDATIONS D'ARRÊT GENERAL</strong>
      En présence d'un signal de gravité <strong>🔴 CRITIQUE</strong>, le technicien doit immédiatement couper le moteur, actionner le bouton d'arrêt d'urgence, consigner la machine en insérant la goupille de verrouillage d'articulation centrale, et apposer l'étiquette d'interdiction de démarrage "NE PAS METTRE EN MARCHE".
    </div>
  `;
  extraPages.push(createExtraPage(ch7FinalHtml, false, 'CHAPITRE 7 — GUIDE DES PANNES'));


  // ==================== PAGES 121-140: CHAPITRE 8 — ARBRES DE DÉCISION ====================
  const arbres = [
    {
      title: "1. Moteur ne démarre pas",
      desc: "Analyse systématique du circuit d'alimentation, démarreur et coupe-circuit.",
      ascii: `
+-------------------------------------------------------------+
|               DEBUT : MOTEUR NE DEMARRE PAS                 |
+-------------------------------------------------------------+
                               |
                               ▼
            [ Question 1 : Le démarreur tourne-t-il ? ]
                         /           \\
                      OUI             NON
                      /                 \\
                     ▼                   ▼
    [ Question 2 : Fumée ? ]     [ Q3 : Batterie > 24V ? ]
         /           \\                 /           \\
      OUI             NON           OUI             NON
      /                 \\           /                 \\
     ▼                   ▼         ▼                   ▼
[ Injecteurs HS ]   [ No Fuel ]  [ Fusible F2 ]   [ Charger ]
     |                   |             |               |
     ▼                   ▼             ▼               ▼
+-------------------------------------------------------------+
| ACTION : Remplacer l'élément défectueux et tester à nouveau |
+-------------------------------------------------------------+
      `
    },
    {
      title: "2. Perte de puissance moteur",
      desc: "Vérification de la suralimentation, pression de rampe et filtres.",
      ascii: `
+-------------------------------------------------------------+
|              DEBUT : PERTE DE PUISSANCE MOTEUR              |
+-------------------------------------------------------------+
                               |
                               ▼
        [ Question 1 : Filtre à air moteur obstrué ? ]
                         /           \\
                      OUI             NON
                      /                 \\
                     ▼                   ▼
      [ Action : Remplacer ]     [ Q2 : Fuite carburant ? ]
             |                        /           \\
             ▼                     OUI             NON
      [ Fin de procédure ]         /                 \\
                                  ▼                   ▼
                          [ Reserrer rampe ]    [ Check Turbo ]
                                  |                   |
                                  ▼                   ▼
+-------------------------------------------------------------+
| ACTION : Mesurer la pression de suralimentation (RCS actif)  |
+-------------------------------------------------------------+
      `
    },
    {
      title: "3. Surchauffe moteur",
      desc: "Vérification du niveau d'eau, courroie d'entraînement et radiateur.",
      ascii: `
+-------------------------------------------------------------+
|                 DEBUT : SURCHAUFFE MOTEUR                   |
+-------------------------------------------------------------+
                               |
                               ▼
           [ Question 1 : Niveau de liquide correct ? ]
                         /           \\
                      OUI             NON
                      /                 \\
                     ▼                   ▼
    [ Q2 : Courroie OK ? ]     [ Action : Appoint liquide ]
         /           \\                   |
      OUI             NON                ▼
      /                 \\          [ Check Fuite ]
     ▼                   ▼               |
[ Check Thermostat ]  [ Remplacer ]      ▼
     |                   |         [ Fin de procédure ]
     ▼                   ▼
+-------------------------------------------------------------+
| ACTION : Nettoyer le radiateur à l'air comprimé à l'atelier |
+-------------------------------------------------------------+
      `
    },
    {
      title: "4. Transmission patine",
      desc: "Analyse de la pression hydraulique d'embrayage de boîte Funk.",
      ascii: `
+-------------------------------------------------------------+
|               DEBUT : TRANSMISSION PATINE                   |
+-------------------------------------------------------------+
                               |
                               ▼
          [ Question 1 : Niveau d'huile boîte correct ? ]
                         /           \\
                      OUI             NON
                      /                 \\
                     ▼                   ▼
    [ Q2 : Pression OK ? ]      [ Action : Faire le plein ]
         /           \\                   |
      OUI             NON                ▼
      /                 \\          [ Check Joint ]
     ▼                   ▼               |
[ Friction usée ]   [ Electro Y2 ]       ▼
     |                   |         [ Fin de procédure ]
     ▼                   ▼
+-------------------------------------------------------------+
| ACTION : Exécuter la calibration d'embrayage via le TCU     |
+-------------------------------------------------------------+
      `
    },
    {
      title: "5. Freinage inefficace",
      desc: "Mesure de la pression d'accumulateur et recherche de fuite de pont.",
      ascii: `
+-------------------------------------------------------------+
|                DEBUT : FREINAGE INEFFICACE                  |
+-------------------------------------------------------------+
                               |
                               ▼
         [ Question 1 : Voyant basse pression allumé ? ]
                         /           \\
                      OUI             NON
                      /                 \\
                     ▼                   ▼
    [ Q2 : Fuite huile ? ]      [ Q3 : Course pédale OK ? ]
         /           \\                 /           \\
      OUI             NON           OUI             NON
      /                 \\           /                 \\
     ▼                   ▼         ▼                   ▼
[ Réparer Fuite ]  [ Gonfler N2 ] [ Disques HS ]   [ Purge Air ]
     |                   |             |               |
     ▼                   ▼             ▼               ▼
+-------------------------------------------------------------+
| ACTION : Tester les freins SAHR sur pente de 15% en charge  |
+-------------------------------------------------------------+
      `
    },
    {
      title: "6. Fuite hydraulique majeure",
      desc: "Isolement d'urgence et remplacement de flexible haute pression.",
      ascii: `
+-------------------------------------------------------------+
|              DEBUT : FUITE HYDRAULIQUE MAJEURE              |
+-------------------------------------------------------------+
                               |
                               ▼
           [ Question 1 : Localisation sur le bras ? ]
                         /           \\
                      OUI             NON
                      /                 \\
                     ▼                   ▼
    [ Changer Flexible ]        [ Q2 : Direction / Pivot ? ]
         |                            /           \\
         ▼                         OUI             NON
    [ Purge Circuit ]              /                 \\
         |                        ▼                   ▼
         ▼                [ Joint Vérin HS ]    [ Bloc Pompe ]
+-------------------------------------------------------------+
| ACTION : Nettoyer au solvant et vérifier le niveau d'huile  |
+-------------------------------------------------------------+
      `
    },
    {
      title: "7. RCS en défaut",
      desc: "Interruption bus CAN J1939, problème d'alimentation de module.",
      ascii: `
+-------------------------------------------------------------+
|                   DEBUT : RCS EN DEFAUT                     |
+-------------------------------------------------------------+
                               |
                               ▼
         [ Question 1 : Ecran affiche-t-il "No Comm" ? ]
                         /           \\
                      OUI             NON
                      /                 \\
                     ▼                   ▼
    [ Q2 : Check CAN ]         [ Q3 : Fusible F5 intact ? ]
         /           \\                 /           \\
      OUI             NON           OUI             NON
      /                 \\           /                 \\
     ▼                   ▼         ▼                   ▼
[ Reset TCU ]      [ Réparer bus ] [ Ecran HS ]     [ Remplacer ]
     |                   |             |               |
     ▼                   ▼             ▼               ▼
+-------------------------------------------------------------+
| ACTION : Téléverser la dernière mise à jour firmware        |
+-------------------------------------------------------------+
      `
    },
    {
      title: "8. Charge utile incorrecte",
      desc: "Étalonnage des capteurs de pression hydraulique sur les vérins.",
      ascii: `
+-------------------------------------------------------------+
|              DEBUT : CHARGE UTILE INCORRECTE                |
+-------------------------------------------------------------+
                               |
                               ▼
          [ Question 1 : Capteurs pression connectés ? ]
                         /           \\
                      OUI             NON
                      /                 \\
                     ▼                   ▼
    [ Q2 : Signal OK ? ]        [ Action : Rétablir câble ]
         /           \\                   |
      OUI             NON                ▼
      /                 \\          [ Fin de procédure ]
     ▼                   ▼
[ Faire Calib ]     [ Capteur HS ]
     |                   |
     ▼                   ▼
+-------------------------------------------------------------+
| ACTION : Peser un bloc de référence étalon de 6 000 kg      |
+-------------------------------------------------------------+
      `
    },
    {
      title: "9. Bruit anormal articulation",
      desc: "Usure des rotules centrales et contrôle de couple de serrage.",
      ascii: `
+-------------------------------------------------------------+
|             DEBUT : BRUIT ANORMAL ARTICULATION              |
+-------------------------------------------------------------+
                               |
                               ▼
          [ Question 1 : Graissage automatique actif ? ]
                         /           \\
                      OUI             NON
                      /                 \\
                     ▼                   ▼
    [ Q2 : Jeu rotule ? ]       [ Action : Forcer graissage ]
         /           \\                   |
      OUI             NON                ▼
      /                 \\          [ Check buse ]
     ▼                   ▼               |
[ Rotule HS ]       [ Check Couple ]     ▼
     |                   |         [ Fin de procédure ]
     ▼                   ▼
+-------------------------------------------------------------+
| ACTION : Resserre les chapes au couple de 850 Nm            |
+-------------------------------------------------------------+
      `
    },
    {
      title: "10. Batterie déchargée",
      desc: "Contrôle de courant de fuite à la masse et test de l'alternateur.",
      ascii: `
+-------------------------------------------------------------+
|                DEBUT : BATTERIE DECHARGEE                   |
+-------------------------------------------------------------+
                               |
                               ▼
         [ Question 1 : Coupe-circuit en position ON ? ]
                         /           \\
                      OUI             NON
                      /                 \\
                     ▼                   ▼
    [ Q2 : Tension OK ? ]       [ Action : Enclencher ON ]
         /           \\                   |
      OUI             NON                ▼
      /                 \\          [ Fin de procédure ]
     ▼                   ▼
[ Alternateur HS ]  [ Batterie HS ]
     |                   |
     ▼                   ▼
+-------------------------------------------------------------+
| ACTION : Recharger ou remplacer le pack batterie 24V        |
+-------------------------------------------------------------+
      `
    }
  ];

  // Render Arbres de Décision
  arbres.forEach((arb, idx) => {
    // 1st page: Intro and details
    const p1Html = `
      <h2 class="section-title">CHAPITRE 8 — ARBRES DE DÉCISION TECHNIQUE</h2>
      <p class="section-intro">
        Les arbres de décision guident pas à pas le technicien pour isoler l'origine d'un défaut sur le Scooptram ST7. Suivez l'ordre logique des questions pour éviter tout remplacement inutile de pièce.
      </p>
      
      <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h3 style="font-size: 11pt; font-weight: bold; color: #b45309; text-transform: uppercase; margin-top: 0; margin-bottom: 8px;">
          FLUX ${idx + 1} : ${arb.title}
        </h3>
        <p style="font-size: 9.5pt; color: #78350f; line-height: 1.4; margin: 0;">
          <strong>Description du problème :</strong> ${arb.desc}
        </p>
      </div>

      <div style="margin-top: 20px; border-left: 4px solid #f59e0b; padding-left: 15px;">
        <h4 style="font-size: 9.5pt; font-weight: bold; margin-bottom: 8px; text-transform: uppercase;">Précautions de Sécurité Préalables</h4>
        <ul style="font-size: 9pt; color: #475569; line-height: 1.5; padding-left: 15px; margin: 0;">
          <li>Mettre la machine sur une surface plane et stable.</li>
          <li>Enclencher les freins SAHR et installer les cales sous les roues.</li>
          <li>Vérifier l'absence de pressions résiduelles dans les accumulateurs de frein et direction.</li>
          <li>Port des équipements de protection individuelle (EPI) obligatoire.</li>
        </ul>
      </div>

      <div style="margin-top: 30px; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 6px; background: #fafafa;">
        <span style="font-weight: bold; font-size: 8.5pt; text-transform: uppercase; color: #475569; display: block; margin-bottom: 5px;">🔧 Outillage recommandé pour ce flux :</span>
        <span style="font-size: 8.5pt; color: #1a1a1a;">Multimètre étalonné, manomètres de pression hydraulique (0-400 bar), ordinateur portable avec logiciel d'interface RCS Service, clé dynamométrique.</span>
      </div>
    `;
    extraPages.push(createExtraPage(p1Html, false, `CHAPITRE 8 — FLUX ${idx + 1}`));

    // 2nd page: ASCII diagram representation
    const p2Html = `
      <h3 style="font-size: 11pt; font-weight: bold; text-transform: uppercase; margin-top: 0; margin-bottom: 15px; border-bottom: 2px solid #0f172a; padding-bottom: 5px;">
        LOGIGRAMME TECHNIQUE — ${arb.title}
      </h3>
      <p style="font-size: 8.5pt; color: #475569; margin-top: -8px; margin-bottom: 15px;">Représentation sous forme de terminal de diagnostic. Réalisez les tests de haut en bas.</p>
      <pre style="font-family: monospace; font-size: 8pt; background-color: #0f172a; color: #38bdf8; border-radius: 6px; padding: 15px; line-height: 1.35; margin: 0; white-space: pre; border-left: 4px solid #f59e0b; overflow-x: auto;">${arb.ascii.trim()}</pre>
      
      <div style="margin-top: 25px; font-size: 8.5pt; color: #64748b; line-height: 1.4; border-top: 1px solid #e2e8f0; padding-top: 10px;">
        <strong>Validation finale :</strong> Une fois l'action corrective appliquée, démarrez le moteur et observez les données temps réel sur l'écran RCS. Aucun code défaut J1939 rouge ne doit rester actif en mémoire.
      </div>
    `;
    extraPages.push(createExtraPage(p2Html, false, `CHAPITRE 8 — LOGIGRAMME ${idx + 1}`));
  });


  // ==================== PAGES 141-148: CHAPITRE 9 — CHECKLIST MAINTENANCE ====================
  // Checklist quotidienne (10 points) - 2 pages
  const dailyChecklist = [
    { ref: 'Q-01', item: 'Niveau d\'huile moteur Cummins QSB 6.7', val: 'Vérifier sur jauge manuelle (entre MIN & MAX)' },
    { ref: 'Q-02', item: 'Niveau de liquide de refroidissement radiateur', val: 'Vérifier visuellement sur l\'œil de niveau' },
    { ref: 'Q-03', item: 'Niveau d\'huile hydraulique (réservoir principal)', val: 'Vérifier sur l\'œil de niveau transparent' },
    { ref: 'Q-04', item: 'Absence de fuite ou de flaque sous le chargeur', val: 'Inspection visuelle sous le moteur et les ponts' },
    { ref: 'Q-05', item: 'Pression de gonflage et état d\'usure des pneus', val: 'Inspecter les flancs pour coupures' },
    { ref: 'Q-06', item: 'Fonctionnement des phares LED et avertisseur sonore', val: 'Tester depuis les commandes cabine' },
    { ref: 'Q-07', item: 'Verrouillage d\'articulation centrale retiré', val: 'S\'assurer que la goupille de sécurité est rangée' },
    { ref: 'Q-08', item: 'Fonctionnement de l\'arrêt d\'urgence cabine', val: 'Tester la coupure moteur instantanée' },
    { ref: 'Q-09', item: 'Niveau de carburant et d\'AdBlue (urée)', val: 'Indication écran RCS en cabine' },
    { ref: 'Q-10', item: 'Présence de l\'extincteur d\'incendie opérationnel', val: 'Manomètre extincteur dans la zone verte' }
  ];

  // Daily Page 1 (points 1-5)
  const d1ChecklistHtml = `
    <h2 class="section-title">CHAPITRE 9 — CHECKLISTS DE MAINTENANCE</h2>
    <p class="section-intro">
      Les listes de contrôle garantissent que toutes les opérations préventives requises sont effectuées selon les préconisations du constructeur Epiroc pour maximiser la disponibilité de la machine.
    </p>
    <h3 class="subsection-title">9.1 CHECKLIST QUOTIDIENNE (AVANT POSTE) — PARTIE 1</h3>
    <table class="compact-table" style="font-size: 8.5pt;">
      <thead>
        <tr>
          <th style="width: 5%;">☐</th>
          <th style="width: 10%;">Réf.</th>
          <th style="width: 40%;">Point de contrôle</th>
          <th>Procédure de validation attendue</th>
        </tr>
      </thead>
      <tbody>
        ${dailyChecklist.slice(0, 5).map(pt => `
          <tr>
            <td style="text-align: center; font-size: 12pt;">☐</td>
            <td style="font-family: monospace; font-weight: bold;">${pt.ref}</td>
            <td><strong>${pt.item}</strong></td>
            <td>${pt.val}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="background: #fff8dc; border-left: 4px solid #ffd700; padding: 10px; margin-top: 15px; font-size: 8.5pt; font-style: italic;">
      <strong>Note :</strong> Toute anomalie constatée doit être immédiatement signalée au contremaître avant de démarrer le chargement.
    </div>
  `;
  extraPages.push(createExtraPage(d1ChecklistHtml, false, 'CHAPITRE 9 — CHECKLIST QUOTIDIENNE'));

  // Daily Page 2 (points 6-10)
  const d2ChecklistHtml = `
    <h3 class="subsection-title">9.1 CHECKLIST QUOTIDIENNE (AVANT POSTE) — PARTIE 2</h3>
    <table class="compact-table" style="font-size: 8.5pt;">
      <thead>
        <tr>
          <th style="width: 5%;">☐</th>
          <th style="width: 10%;">Réf.</th>
          <th style="width: 40%;">Point de contrôle</th>
          <th>Procédure de validation attendue</th>
        </tr>
      </thead>
      <tbody>
        ${dailyChecklist.slice(5, 10).map(pt => `
          <tr>
            <td style="text-align: center; font-size: 12pt;">☐</td>
            <td style="font-family: monospace; font-weight: bold;">${pt.ref}</td>
            <td><strong>${pt.item}</strong></td>
            <td>${pt.val}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-top: 20px; background: #fafafa;">
      <span style="font-weight: bold; font-size: 8.5pt; display: block; margin-bottom: 5px;">✍️ SIGNATURES DE VALIDATION</span>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 8.5pt; margin-top: 10px;">
        <div>Opérateur : ___________________________</div>
        <div>Superviseur : ___________________________</div>
      </div>
    </div>
  `;
  extraPages.push(createExtraPage(d2ChecklistHtml, false, 'CHAPITRE 9 — CHECKLIST QUOTIDIENNE'));

  // 250h Checklist (25 points) - Spans 3 pages (Page 143, 144, 145)
  const checklist250h = Array.from({ length: 25 }, (_, i) => ({
    ref: `250H-${(i + 1).toString().padStart(2, '0')}`,
    item: [
      'Remplacement filtre à huile moteur', 'Remplacement filtre à carburant principal',
      'Nettoyage du séparateur d\'eau', 'Vidange d\'huile de boîte Funk', 'Nettoyage crépine d\'aspiration boîte',
      'Remplacement filtre de charge boîte', 'Contrôle niveau d\'huile des ponts', 'Graissage complet des pivots de bras',
      'Graissage des axes de godet', 'Contrôle d\'usure des cales de godet', 'Vérification serrage arbre de cardan',
      'Inspection fixations silentblocs moteur', 'Contrôle étanchéité raccord intercooler', 'Serrage des colliers d\'admission',
      'Nettoyage radiateur de suralimentation', 'Vérification capteur température frein', 'Contrôle niveau d\'azote accumulateurs',
      'Contrôle jeu rotules direction', 'Inspection visuelle soudure de bras', 'Nettoyage filtre climatisation cabine',
      'Test alarme sonore de recul et klaxon', 'Vérification feux stop de ponts', 'Contrôle niveau de charge batteries',
      'Vérification serrage cosses batterie', 'Test étanchéité réservoir gasoil'
    ][i],
    proc: `Procédure technique Epiroc Chapitre 5 / Proc. ref ST7-P-${(i % 10 + 1)}`
  }));

  // 250h Page 1 (1-8)
  const check250hP1 = `
    <h3 class="subsection-title">9.2 CHECKLIST INTERMEDIAIRE 250 HEURES — PARTIE 1</h3>
    <table class="compact-table" style="font-size: 8pt;">
      <thead>
        <tr>
          <th style="width: 5%;">☐</th>
          <th style="width: 12%;">Réf.</th>
          <th style="width: 40%;">Opération technique 250h</th>
          <th>Référence Procédure</th>
        </tr>
      </thead>
      <tbody>
        ${checklist250h.slice(0, 8).map(pt => `
          <tr>
            <td style="text-align: center; font-size: 11pt;">☐</td>
            <td style="font-family: monospace; font-weight: bold;">${pt.ref}</td>
            <td><strong>${pt.item}</strong></td>
            <td>${pt.proc}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  extraPages.push(createExtraPage(check250hP1, false, 'CHAPITRE 9 — CHECKLIST 250H'));

  // 250h Page 2 (9-16)
  const check250hP2 = `
    <h3 class="subsection-title">9.2 CHECKLIST INTERMEDIAIRE 250 HEURES — PARTIE 2</h3>
    <table class="compact-table" style="font-size: 8pt;">
      <thead>
        <tr>
          <th style="width: 5%;">☐</th>
          <th style="width: 12%;">Réf.</th>
          <th style="width: 40%;">Opération technique 250h</th>
          <th>Référence Procédure</th>
        </tr>
      </thead>
      <tbody>
        ${checklist250h.slice(8, 16).map(pt => `
          <tr>
            <td style="text-align: center; font-size: 11pt;">☐</td>
            <td style="font-family: monospace; font-weight: bold;">${pt.ref}</td>
            <td><strong>${pt.item}</strong></td>
            <td>${pt.proc}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  extraPages.push(createExtraPage(check250hP2, false, 'CHAPITRE 9 — CHECKLIST 250H'));

  // 250h Page 3 (17-25)
  const check250hP3 = `
    <h3 class="subsection-title">9.2 CHECKLIST INTERMEDIAIRE 250 HEURES — PARTIE 3</h3>
    <table class="compact-table" style="font-size: 8pt;">
      <thead>
        <tr>
          <th style="width: 5%;">☐</th>
          <th style="width: 12%;">Réf.</th>
          <th style="width: 40%;">Opération technique 250h</th>
          <th>Référence Procédure</th>
        </tr>
      </thead>
      <tbody>
        ${checklist250h.slice(16, 25).map(pt => `
          <tr>
            <td style="text-align: center; font-size: 11pt;">☐</td>
            <td style="font-family: monospace; font-weight: bold;">${pt.ref}</td>
            <td><strong>${pt.item}</strong></td>
            <td>${pt.proc}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  extraPages.push(createExtraPage(check250hP3, false, 'CHAPITRE 9 — CHECKLIST 250H'));


  // 1000h Checklist (40 points) - Spans 3 pages (Page 146, 147, 148)
  const checklist1000h = Array.from({ length: 40 }, (_, i) => ({
    ref: `1000H-${(i + 1).toString().padStart(2, '0')}`,
    item: [
      'Remplacement filtre à carburant secondaire', 'Remplacement cartouches filtre à air',
      'Vidange d\'huile moteur Cummins', 'Remplacement liquide refroidissement moteur',
      'Nettoyage et détartrage radiateur', 'Remplacement courroies de distribution',
      'Vérification jeu de soupapes moteur', 'Remplacement filtre à huile transmission',
      'Remplacement huile boîte de vitesses Funk', 'Démontage convertisseur de couple (contrôle)',
      'Vidange d\'huile de pont avant', 'Vidange d\'huile de pont arrière',
      'Nettoyage des reniflards de pont', 'Remplacement cartouches filtre hydraulique',
      'Vidange complète huile hydraulique', 'Nettoyage réservoir hydraulique',
      'Contrôle pression de décharge principale', 'Contrôle pression de pilotage hydraulique',
      'Étalonnage de la direction (RCS active)', 'Mesure temps de cycle montée/descente bras',
      'Remplacement disques de frein SAHR usés', 'Remplacement manocontact de frein',
      'Purge complète du circuit de freinage', 'Recharge azote de tous les accumulateurs',
      'Vérification étanchéité joint tournant pivot', 'Resserage de l\'articulation centrale (850 Nm)',
      'Contrôle jeu d\'axe du bras de levage', 'Contrôle de fissure châssis par ressuage',
      'Remplacement des tuyaux d\'aspiration pompe', 'Vérification câble de commande joystick',
      'Mise à jour logiciel système RCS', 'Étalonnage pesage embarqué',
      'Contrôle isolement faisceau électrique', 'Remplacement alternateur préventif',
      'Nettoyage injecteurs de carburant', 'Remplacement de la pompe à eau moteur',
      'Contrôle étanchéité de la cabine pressurisée', 'Remplacement flexibles de frein de ponts',
      'Test d\'efficacité extincteur automatique', 'Rapport d\'analyse d\'huile complet'
    ][i],
    proc: `Epiroc Service Procédure ST7-M-1000-${(i % 15 + 1)}`
  }));

  // 1000h Page 1 (1-13)
  const check1000hP1 = `
    <h3 class="subsection-title">9.3 CHECKLIST MAJEURE 1000 HEURES — PARTIE 1</h3>
    <table class="compact-table" style="font-size: 7.5pt;">
      <thead>
        <tr>
          <th style="width: 5%;">☐</th>
          <th style="width: 12%;">Réf.</th>
          <th style="width: 43%;">Opération technique majeure 1000h</th>
          <th>Référence Procédure</th>
        </tr>
      </thead>
      <tbody>
        ${checklist1000h.slice(0, 13).map(pt => `
          <tr>
            <td style="text-align: center; font-size: 10pt;">☐</td>
            <td style="font-family: monospace; font-weight: bold;">${pt.ref}</td>
            <td><strong>${pt.item}</strong></td>
            <td>${pt.proc}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  extraPages.push(createExtraPage(check1000hP1, false, 'CHAPITRE 9 — CHECKLIST 1000H'));

  // 1000h Page 2 (14-26)
  const check1000hP2 = `
    <h3 class="subsection-title">9.3 CHECKLIST MAJEURE 1000 HEURES — PARTIE 2</h3>
    <table class="compact-table" style="font-size: 7.5pt;">
      <thead>
        <tr>
          <th style="width: 5%;">☐</th>
          <th style="width: 12%;">Réf.</th>
          <th style="width: 43%;">Opération technique majeure 1000h</th>
          <th>Référence Procédure</th>
        </tr>
      </thead>
      <tbody>
        ${checklist1000h.slice(13, 26).map(pt => `
          <tr>
            <td style="text-align: center; font-size: 10pt;">☐</td>
            <td style="font-family: monospace; font-weight: bold;">${pt.ref}</td>
            <td><strong>${pt.item}</strong></td>
            <td>${pt.proc}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  extraPages.push(createExtraPage(check1000hP2, false, 'CHAPITRE 9 — CHECKLIST 1000H'));

  // 1000h Page 3 (27-40)
  const check1000hP3 = `
    <h3 class="subsection-title">9.3 CHECKLIST MAJEURE 1000 HEURES — PARTIE 3</h3>
    <table class="compact-table" style="font-size: 7.5pt;">
      <thead>
        <tr>
          <th style="width: 5%;">☐</th>
          <th style="width: 12%;">Réf.</th>
          <th style="width: 43%;">Opération technique majeure 1000h</th>
          <th>Référence Procédure</th>
        </tr>
      </thead>
      <tbody>
        ${checklist1000h.slice(26, 40).map(pt => `
          <tr>
            <td style="text-align: center; font-size: 10pt;">☐</td>
            <td style="font-family: monospace; font-weight: bold;">${pt.ref}</td>
            <td><strong>${pt.item}</strong></td>
            <td>${pt.proc}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  extraPages.push(createExtraPage(check1000hP3, false, 'CHAPITRE 9 — CHECKLIST 1000H'));


  // ==================== PAGES 149-150: CHAPITRE 10 — GLOSSAIRE TECHNIQUE ====================
  const glossaire: { term: string; def: string; ch: string }[] = [
    { term: 'Accumulateur', def: 'Réservoir de fluide hydraulique sous pression contenant de l\'azote, utilisé pour l\'assistance de freinage.', ch: 'Chapitre 5' },
    { term: 'AdBlue / Urée', def: 'Fluide injecté dans l\'échappement pour réduire les émissions polluantes de NOx sur moteur Cummins QSB.', ch: 'Chapitre 1' },
    { term: 'Alternateur', def: 'Générateur électrique entraîné par courroie, rechargeant les batteries sous tension de 24V.', ch: 'Chapitre 1' },
    { term: 'Articulation centrale', def: 'Pivot central reliant le châssis avant et arrière, permettant l\'oscillation et le braquage de la direction.', ch: 'Chapitre 5' },
    { term: 'Arbre à cardan', def: 'Axe rotatif de transmission transmettant le couple moteur vers les ponts de roues.', ch: 'Chapitre 6' },
    { term: 'Bague d\'usure', def: 'Manchon en bronze remplaçable évitant l\'usure directe des chapes d\'articulation lourdes.', ch: 'Chapitre 5' },
    { term: 'Bennage', def: 'Action de basculement du godet vers l\'avant ou l\'arrière grâce au vérin de bennage.', ch: 'Chapitre 4' },
    { term: 'Boîte Funk', def: 'Transmission Powershift à commandes électrohydrauliques montée de série sur le ST7.', ch: 'Chapitre 1' },
    { term: 'Bouton d\'arrêt d\'urgence', def: 'Interrupteur électrique rouge coupant instantanément l\'injection moteur Cummins en cas de danger.', ch: 'Chapitre 9' },
    { term: 'Bus CAN (J1939)', def: 'Réseau de communication multiplexé reliant l\'ECU, le TCU et l\'affichage de cabine RCS.', ch: 'Chapitre 4' },
    { term: 'Cavitation', def: 'Formation de bulles d\'air dans l\'huile provoquant des sifflements destructeurs de pompes hydrauliques.', ch: 'Chapitre 7' },
    { term: 'Certiq', def: 'Système de télémétrie par satellite propriétaire d\'Epiroc transmettant les données d\'exploitation.', ch: 'Chapitre 1' },
    { term: 'Clapet antiretour', def: 'Valve de non-retour autorisant la circulation de fluide hydraulique dans un seul sens.', ch: 'Chapitre 5' },
    { term: 'Common Rail', def: 'Technologie d\'injection de carburant rampe haute pression permettant un dosage très précis.', ch: 'Chapitre 1' },
    { term: 'Convertisseur de couple', def: 'Accouplement hydrodynamique transmettant le couple moteur vers la boîte Powershift.', ch: 'Chapitre 1' },
    { term: 'Coupe-batterie', def: 'Interrupteur manuel isolant électriquement le pôle négatif des batteries de la masse.', ch: 'Chapitre 9' },
    { term: 'Démarreur', def: 'Moteur électrique puissant de 24V lançant le volant moteur Cummins pour le démarrage.', ch: 'Chapitre 1' },
    { term: 'Dérive', def: 'Descente ou mouvement lent non désiré d\'un vérin hydraulique suite à une fuite interne.', ch: 'Chapitre 7' },
    { term: 'DF150 / DF250', def: 'Série de transmissions robustes à 4 rapports avant/arrière fabriquées par Funk.', ch: 'Chapitre 1' },
    { term: 'Distributeur principal', def: 'Bloc hydraulique distribuant le fluide vers les vérins de levage et de godet.', ch: 'Chapitre 4' },
    { term: 'ECU', def: 'Engine Control Unit. Boîtier électronique gérant les paramètres d\'injection du moteur Cummins.', ch: 'Chapitre 4' },
    { term: 'Électrovanne', def: 'Valve de commande hydraulique actionnée par un courant électrique envoyé par le RCS.', ch: 'Chapitre 4' },
    { term: 'Émulsion', def: 'Mélange intime d\'air et d\'huile hydraulique provoquant un aspect mousseux et inefficace.', ch: 'Chapitre 7' },
    { term: 'EEPROM', def: 'Mémoire de stockage non volatile conservant les paramètres et configurations machine à l\'arrêt.', ch: 'Chapitre 7' },
    { term: 'Extincteur automatique', def: 'Système d\'extinction incendie Ansul protégeant les compartiments moteur chauds.', ch: 'Chapitre 9' },
    { term: 'Filtre de charge', def: 'Filtre haute efficacité protégeant la pompe hydraulique contre les particules fines.', ch: 'Chapitre 6' },
    { term: 'Filtre de retour', def: 'Filtre à huile retenant les débris d\'usure avant le retour du fluide au réservoir.', ch: 'Chapitre 6' },
    { term: 'Flexible haute pression', def: 'Tuyau souple tressé d\'acier supportant des pressions hydrauliques jusqu\'à 350 bar.', ch: 'Chapitre 3' },
    { term: 'Frein de parc', def: 'Frein SAHR de sécurité bloqué par ressorts et libéré par pression d\'huile.', ch: 'Chapitre 1' },
    { term: 'Frein SAHR', def: 'Spring Applied Hydraulic Released. Système de freinage de sécurité à relâchement hydraulique.', ch: 'Chapitre 1' },
    { term: 'Graissage automatique', def: 'Système centralisé distribuant périodiquement de la graisse vers tous les axes.', ch: 'Chapitre 9' },
    { term: 'Hotspot cliquable', def: 'Zone sensitive sur écran tactile RCS ouvrant les fiches d\'aide de diagnostic rapide.', ch: 'Chapitre 1' },
    { term: 'Inductif (Capteur)', def: 'Détecteur de proximité mesurant la rotation des pignons pour la vitesse de déplacement.', ch: 'Chapitre 7' },
    { term: 'Injecteur', def: 'Electrovanne de haute précision pulvérisant le carburant gasoil dans la chambre de combustion.', ch: 'Chapitre 3' },
    { term: 'Intercooler', def: 'Refroidisseur d\'air d\'admission moteur augmentant le rendement du turbocompresseur.', ch: 'Chapitre 1' },
    { term: 'Jauge manuelle', def: 'Tige métallique amovible graduée servant au contrôle de niveau de fluide moteur.', ch: 'Chapitre 9' },
    { term: 'Joint spi', def: 'Bague d\'étanchéité à lèvre élastomère évitant les fuites d\'huile le long des arbres tournants.', ch: 'Chapitre 7' },
    { term: 'Manomètre', def: 'Appareil de mesure gradué indiquant la pression hydraulique en bar ou en PSI.', ch: 'Chapitre 6' },
    { term: 'Manocontact', def: 'Interrupteur électrique s\'ouvrant ou se fermant selon un seuil de pression défini.', ch: 'Chapitre 7' },
    { term: 'Multimètre', def: 'Outil de mesure électrique servant à contrôler la tension (V), le courant (A) et la résistance (Ohm).', ch: 'Chapitre 6' },
    { term: 'Niveau d\'azote (N2)', def: 'Pression de précharge d\'azote requise au bon fonctionnement des accumulateurs de frein.', ch: 'Chapitre 5' },
    { term: 'Powershift', def: 'Type de transmission permettant le changement de rapport sous charge sans débrayer.', ch: 'Chapitre 1' },
    { term: 'QSB 6.7', def: 'Moteur diesel 6 cylindres en ligne d\'une cylindrée de 6,7L conçu par Cummins.', ch: 'Chapitre 1' },
    { term: 'RCS', def: 'Rig Control System. Système électronique embarqué breveté par Epiroc pour le contrôle machine.', ch: 'Chapitre 1' },
    { term: 'Ressuage', def: 'Méthode de contrôle non destructive révélant les fissures du métal à l\'aide d\'un colorant.', ch: 'Chapitre 9' },
    { term: 'Ride Control', def: 'Système amortisseur réduisant le balancement du bras de levage lors du roulage rapide.', ch: 'Chapitre 7' },
    { term: 'Surchauffe', def: 'Dépassement de la température maximale autorisée d\'un fluide (>100°C sur moteur/boîte).', ch: 'Chapitre 7' },
    { term: 'TCU', def: 'Transmission Control Unit. Boîtier électronique gérant l\'embrayage et les rapports Funk.', ch: 'Chapitre 4' },
    { term: 'Turbocompresseur', def: 'Turbine utilisant les gaz d\'échappement pour comprimer l\'air d\'admission moteur.', ch: 'Chapitre 1' },
    { term: 'Vérin de levage', def: 'Actionneur linéaire hydraulique lourd assurant la montée et descente du bras de levage.', ch: 'Chapitre 3' }
  ];

  // Glossaire Page 1 (1-25)
  const g1Html = `
    <h2 class="section-title">CHAPITRE 10 — GLOSSAIRE TECHNIQUE (50 TERMES)</h2>
    <p class="section-intro">
      Ce glossaire définit les principaux termes techniques de maintenance et les acronymes spécifiques à l'environnement constructeur Epiroc pour le Scooptram ST7.
    </p>
    <table class="compact-table" style="font-size: 8.2pt;">
      <thead>
        <tr>
          <th style="width: 25%;">Terme technique</th>
          <th style="width: 58%;">Définition concise (2 lignes max)</th>
          <th>Chapitre lié</th>
        </tr>
      </thead>
      <tbody>
        ${glossaire.slice(0, 25).map(item => `
          <tr>
            <td style="font-weight: bold; color: #0f172a;">${item.term}</td>
            <td>${item.def}</td>
            <td style="font-style: italic; font-size: 7.5pt; color: #475569;">${item.ch}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  extraPages.push(createExtraPage(g1Html, false, 'CHAPITRE 10 — GLOSSAIRE TECHNIQUE'));

  // Glossaire Page 2 (26-50)
  const g2Html = `
    <h3 class="subsection-title">CHAPITRE 10 — GLOSSAIRE TECHNIQUE (SUITE)</h3>
    <table class="compact-table" style="font-size: 8.2pt;">
      <thead>
        <tr>
          <th style="width: 25%;">Terme technique</th>
          <th style="width: 58%;">Définition concise (2 lignes max)</th>
          <th>Chapitre lié</th>
        </tr>
      </thead>
      <tbody>
        ${glossaire.slice(25, 50).map(item => `
          <tr>
            <td style="font-weight: bold; color: #0f172a;">${item.term}</td>
            <td>${item.def}</td>
            <td style="font-style: italic; font-size: 7.5pt; color: #475569;">${item.ch}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-top: 15px; font-size: 8.5pt; text-align: center;">
      Pour des termes supplémentaires ou spécifiques à une autre gamme, veuillez consulter le dictionnaire en ligne <strong>Epiroc Portal</strong>.
    </div>
  `;
  extraPages.push(createExtraPage(g2Html, false, 'CHAPITRE 10 — GLOSSAIRE TECHNIQUE'));


  // ==================== PAGE 151: PAGE FINALE ====================
  const finalPageHtml = `
    <div class="final-container" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-sizing: border-box; padding: 10mm 5mm;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div class="final-logo" style="font-size: 26pt; font-weight: 900; letter-spacing: 2px; color: #0f172a; border-bottom: 4px solid #f59e0b; display: inline-block; padding-bottom: 5px; margin-bottom: 15px;">EPIROC</div>
        <h1 class="final-title" style="font-size: 22pt; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase;">FIN DU MANUEL TECHNIQUE</h1>
        <h2 class="final-subtitle" style="font-size: 14pt; font-weight: 700; color: #f59e0b; margin: 5px 0 0 0;">Manuel Complet Technique — Epiroc Scooptram ST7</h2>
        <div class="final-orange-line" style="height: 4px; background-color: #1e293b; width: 100px; margin: 15px auto;"></div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; margin-top: 10px; margin-bottom: 20px;">
        <div>
          <h3 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 10px;">RÉCAPITULATIF DES MODULES ET REFERENCES</h3>
          <table class="compact-table" style="font-size: 8.5pt;">
            <thead>
              <tr>
                <th>Module technique complet</th>
                <th>Référence Document</th>
                <th>Version</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Moteur Cummins QSB 6.7</td><td class="font-mono" style="font-weight: bold;">9833-2103-01-A</td><td>1.0</td></tr>
              <tr><td>Transmission Funk DF150/250</td><td class="font-mono" style="font-weight: bold;">9833-2103-01-B</td><td>1.0</td></tr>
              <tr><td>Hydraulique Principale Rexroth</td><td class="font-mono" style="font-weight: bold;">9833-2103-01-C</td><td>1.0</td></tr>
              <tr><td>Freinage SAHR Force Cooled</td><td class="font-mono" style="font-weight: bold;">9833-2103-01-D</td><td>1.0</td></tr>
              <tr><td>RCS Rig Control System v5</td><td class="font-mono" style="font-weight: bold;">9833-2103-01-E</td><td>1.0</td></tr>
              <tr><td>Châssis et articulation centrale</td><td class="font-mono" style="font-weight: bold;">9833-2103-01-F</td><td>1.0</td></tr>
              <tr><td>Diagnostics de pannes complets</td><td class="font-mono" style="font-weight: bold;">9833-2103-01-G</td><td>1.0</td></tr>
              <tr><td>Arbres de décision opérationnels</td><td class="font-mono" style="font-weight: bold;">9833-2103-01-H</td><td>1.0</td></tr>
              <tr><td>Checklists Maintenance Préventive</td><td class="font-mono" style="font-weight: bold;">9833-2103-01-I</td><td>1.0</td></tr>
            </tbody>
          </table>
        </div>
        
        <div style="display: flex; flex-direction: column; justify-content: space-between;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
            <h3 style="font-size: 10pt; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 0; margin-bottom: 8px;">SUPPORT TECHNIQUE EPIROC</h3>
            <ul style="margin: 0; padding-left: 12px; font-size: 8.5pt; line-height: 1.4; color: #1a1a1a; list-style: square;">
              <li><strong>Email :</strong> support.st7@epiroc.com</li>
              <li><strong>Téléphone :</strong> +46 (0) 19 670 70 00</li>
              <li><strong>Portail Web :</strong> my.epiroc.com</li>
              <li><strong>Assistance Directe :</strong> 24h / 24 - 7j / 7</li>
            </ul>
          </div>
          
          <div style="border: 2px dashed #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; background: #fafafa; margin-top: 15px;">
            <div style="font-weight: bold; font-size: 9.5pt; color: #475569; margin-bottom: 4px;">[QR CODE ACCÈS MANUEL NUMÉRIQUE]</div>
            <div style="font-size: 7.5pt; color: #64748b; line-height: 1.3;">Scannez pour accéder aux diagnostics de pannes temps réel, fiches d'outils complémentaires et mises à jour firmware de l'assistant Epiroc.</div>
          </div>
        </div>
      </div>
      
      <div class="final-legal-box" style="border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 8pt; color: #94a3b8; text-align: center; margin-top: 15px;">
        <p style="margin: 0 0 3px 0;">Manuel Complet Technique généré le ${new Date().toLocaleDateString('fr-FR')} — Epiroc ST7 Technical Assistant Platform.</p>
        <p style="margin: 0;">© Epiroc AB 2024. Tous droits réservés. Reproduction et divulgation interdites sans autorisation préalable d'Epiroc.</p>
      </div>
    </div>
  `;
  extraPages.push(createExtraPage(finalPageHtml, false, 'MANUEL TECHNIQUE COMPLET — PAGE FINALE'));


  // Combine all
  const appendedHtml = extraPages.join('\n');
  bodyContent += '\n' + appendedHtml + '\n</body>\n</html>';

  // Save files
  const destPublicPath = path.resolve('public/print-st7-manuel.html');
  fs.writeFileSync(destPublicPath, bodyContent, 'utf-8');
  console.log('Successfully wrote print-st7-manuel.html to public/!');

  const destDistPath = path.resolve('dist/print-st7-manuel.html');
  const destDistDir = path.dirname(destDistPath);
  if (!fs.existsSync(destDistDir)) {
    fs.mkdirSync(destDistDir, { recursive: true });
  }
  fs.writeFileSync(destDistPath, bodyContent, 'utf-8');
  console.log('Successfully wrote print-st7-manuel.html to dist/!');
}

run();
