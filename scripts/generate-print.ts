import fs from 'fs';
import path from 'path';
import { cahierProcedures } from '../src/components/cahierPhotosData';

const srcFilePath = path.resolve('src/components/AssistantEpirocSt7.tsx');
const content = fs.readFileSync(srcFilePath, 'utf-8');

// 1. Evaluate COTES_DATA
let COTES_DATA: any[] = [];
const cotesStart = content.indexOf('const COTES_DATA = [');
if (cotesStart !== -1) {
  const cotesEnd = content.indexOf('export function AssistantEpirocSt7()');
  let cotesText = content.substring(cotesStart, cotesEnd).trim();
  if (cotesText.endsWith(';')) {
    cotesText = cotesText.substring(0, cotesText.length - 1);
  }
  COTES_DATA = new Function(`${cotesText}; return COTES_DATA;`)();
}

// 2. Evaluate OUTILS_LIST
let OUTILS_LIST: any[] = [];
const outilsStart = content.indexOf('const OUTILS_LIST = [');
if (outilsStart !== -1) {
  const outilsEnd = content.indexOf('];', outilsStart + 20) + 2;
  const outilsText = content.substring(outilsStart, outilsEnd).trim();
  OUTILS_LIST = new Function(`${outilsText}; return OUTILS_LIST;`)();
}

// Helper to parse Chapter 1 tables
const getTableRows = (tbodyId: string) => {
  const startIdx = content.indexOf(`id="${tbodyId}"`);
  if (startIdx === -1) return [];
  const endIdx = content.indexOf('</tbody>', startIdx);
  const tbodyText = content.substring(startIdx, endIdx);
  
  const rows: {no: string, name: string, ref: string, panne: string}[] = [];
  const trs = tbodyText.split('<tr>');
  for (const tr of trs) {
    if (!tr.includes('<td>')) continue;
    const tds = tr.split('</td>');
    if (tds.length < 4) continue;
    const no = tds[0].replace(/<[^>]+>/g, '').trim();
    const name = tds[1].replace(/<[^>]+>/g, '').trim();
    const ref = tds[2].replace(/<[^>]+>/g, '').trim();
    const panne = tds[3].replace(/<[^>]+>/g, '').trim();
    rows.push({no, name, ref, panne});
  }
  return rows;
};

// Parse Chapter 3 Storyboards
const storyboards: any[] = [];
const storyboardSectionStart = content.indexOf('{/* CHAPITRE 3 : STORYBOARDS */}');
const storyboardSectionEnd = content.indexOf('{/* CHAPITRE 4 : ANIMATIONS 3D TECHNIQUES */}');
if (storyboardSectionStart !== -1 && storyboardSectionEnd !== -1) {
  const sbSection = content.substring(storyboardSectionStart, storyboardSectionEnd);
  const blocks = sbSection.split('className="storyboard-procedure');
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    
    // Extract ID
    const idMatch = block.match(/id="storyboard-([^"]+)"/);
    const id = idMatch ? '3-' + idMatch[1] : `3-${i}`;
    
    // Extract Title
    const h3Match = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    let title = '';
    if (h3Match) {
      title = h3Match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    }
    
    // Extract Desc
    const descMatch = block.match(/<p className="text-xs text-slate-500 mt-0.5">([\s\S]*?)<\/p>/);
    const desc = descMatch ? descMatch[1].trim() : '';
    
    // Extract Durée & Specs
    const durationMatch = block.match(/⏱️ Durée[^<]*/);
    const duration = durationMatch ? durationMatch[0].trim() : '';
    
    const specsMatch = block.match(/🎥 [^<]*/);
    const specs = specsMatch ? specsMatch[0].trim() : '';
    
    // Parse plans
    const plans: any[] = [];
    const planBlocks = block.split('className="plan ');
    for (let j = 1; j < planBlocks.length; j++) {
      const planBlock = planBlocks[j];
      
      const planTitleMatch = planBlock.match(/<span>Plan \d+ (.*?)<\/span>/);
      const planTitle = planTitleMatch ? planTitleMatch[1].trim() : '';
      
      const planTypeMatch = planBlock.match(/<span className="font-mono text-\[10px\] [^>]+>([^<]+)<\/span>/);
      const planType = planTypeMatch ? planTypeMatch[1].trim() : '';
      
      const appareilMatch = planBlock.match(/<p className="font-mono text-\[10px\][^>]+>Appareil : (.*?)<\/p>/);
      const appareil = appareilMatch ? appareilMatch[1].trim() : '';
      
      const visuelMatch = planBlock.match(/<strong>Visuel :<\/strong>\s*([\s\S]*?)(?:<\/p>|<strong>|$)/);
      const visuel = visuelMatch ? visuelMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      
      const audioMatch = planBlock.match(/<strong>Audio :<\/strong>\s*([\s\S]*?)(?:<\/p>|<strong>|$)/);
      const audio = audioMatch ? audioMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      
      const overlayMatch = planBlock.match(/<span className="overlay-text[^>]+>([\s\S]*?)<\/span>/);
      const overlay = overlayMatch ? overlayMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      
      plans.push({
        no: j,
        title: planTitle,
        type: planType,
        appareil,
        visuel,
        audio,
        overlay
      });
    }
    
    // Specs footer
    const equipMatch = block.match(/🛠️ Équipement :<\/span>([\s\S]*?)<\/div>/);
    const equip = equipMatch ? equipMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    
    const secMatch = block.match(/⚠️ Sécurité :<\/span>([\s\S]*?)<\/div>/);
    const sec = secMatch ? secMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    
    const postMatch = block.match(/🎬 Post-Prod :<\/span>([\s\S]*?)<\/div>/);
    const post = postMatch ? postMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    
    storyboards.push({
      id,
      title,
      desc,
      duration,
      specs,
      plans,
      equip,
      sec,
      post
    });
  }
}

// Start HTML output generation
let pageCounter = 1;

function createPage(contentHtml: string, isLandscape: boolean = false, extraStyle: string = '') {
  const pageNum = pageCounter++;
  const orientationClass = isLandscape ? 'landscape' : 'portrait';
  
  let headerHtml = '';
  let footerHtml = '';
  
  if (pageNum > 1) {
    headerHtml = `
      <div class="page-header">
        <div class="header-left">
          <span class="header-logo">EPIROC</span>
          <span class="header-sep">|</span>
          <span class="header-title">CAHIER DES CHARGES VISUELS — SCOOPTRAM ST7</span>
        </div>
        <div class="header-right">Doc. Epiroc 9833-2103-01</div>
      </div>
    `;
    
    const today = new Date().toLocaleDateString('fr-FR');
    footerHtml = `
      <div class="page-footer">
        <div class="footer-left">Doc. Epiroc 9833-2103-01 — Confidentiel — Usage interne Epiroc uniquement</div>
        <div class="footer-center">${today}</div>
        <div class="footer-right">Page ${pageNum} / 101</div>
      </div>
    `;
  }
  
  return `
    <div class="page ${orientationClass}" id="page-${pageNum}" style="${extraStyle}">
      ${headerHtml}
      <div class="page-content">
        ${contentHtml}
      </div>
      ${footerHtml}
    </div>
  `;
}

// Accumulate HTML pages
const pages: string[] = [];

// ==================== PAGE 1: COVER PAGE ====================
const coverHtml = `
  <div class="cover-container">
    <div class="cover-top-bar"></div>
    <div class="cover-logo">EPIROC</div>
    <div class="cover-main-box">
      <h1 class="cover-title">CAHIER DES CHARGES VISUELS</h1>
      <h2 class="cover-subtitle">SCOOPTRAM ST7</h2>
      <div class="cover-orange-line"></div>
      <p class="cover-doc-type">Manuel Technique d'Aide à la Maintenance Préventive et Corrective</p>
    </div>
    
    <div class="cover-meta-grid">
      <div class="meta-item"><strong>Référence Document :</strong> Epiroc 9833-2103-01</div>
      <div class="meta-item"><strong>Version :</strong> 1.0</div>
      <div class="meta-item"><strong>Date d'émission :</strong> ${new Date().toLocaleDateString('fr-FR')}</div>
      <div class="meta-item"><strong>Statut :</strong> Confidentiel — Usage interne Epiroc uniquement</div>
    </div>
    
    <div class="cover-toc">
      <h3 class="toc-title">TABLE DES MATIÈRES</h3>
      <ul class="toc-list">
        <li><a href="#page-2"><span>CHAPITRE 1 — SCHÉMAS ÉCLATÉS INTERACTIFS</span> <span class="toc-dots"></span> <span class="toc-page">Pages 2-10</span></a></li>
        <li><a href="#page-11"><span>CHAPITRE 2 — PHOTOS RÉELLES AVANT/PENDANT/APRÈS</span> <span class="toc-dots"></span> <span class="toc-page">Pages 11-25</span></a></li>
        <li><a href="#page-26"><span>CHAPITRE 3 — STORYBOARDS DE TOURNAGE</span> <span class="toc-dots"></span> <span class="toc-page">Pages 26-40</span></a></li>
        <li><a href="#page-41"><span>CHAPITRE 4 — ANIMATIONS TECHNIQUES INTERACTIVES</span> <span class="toc-dots"></span> <span class="toc-page">Pages 41-45</span></a></li>
        <li><a href="#page-46"><span>CHAPITRE 5 — COTES, TOLÉRANCES ET PROCÉDURES DE CONTRÔLE</span> <span class="toc-dots"></span> <span class="toc-page">Pages 46-75</span></a></li>
        <li><a href="#page-76"><span>CHAPITRE 6 — FICHES TECHNIQUES DES OUTILS DE MAINTENANCE</span> <span class="toc-dots"></span> <span class="toc-page">Pages 76-100</span></a></li>
        <li><a href="#page-101"><span>RÉCAPITULATIF TECHNIQUE ET SUPPORT EPIROC</span> <span class="toc-dots"></span> <span class="toc-page">Page 101</span></a></li>
      </ul>
    </div>
    
    <div class="cover-footer">
      Propriété intellectuelle d'Epiroc AB. Tous droits réservés. L'usage de ce document est strictement réservé aux techniciens et partenaires agréés d'Epiroc.
    </div>
  </div>
`;
pages.push(createPage(coverHtml, false, 'padding: 0;'));

// ==================== PAGES 2-10: CHAPITRE 1 (SCHÉMAS ÉCLATÉS) ====================
// Page 2: Ch1 Intro + Table 1.1 Part 1 (Items 1-20)
const ch1Intro = `
  <h2 class="section-title">CHAPITRE 1 — SCHÉMAS ÉCLATÉS INTERACTIFS</h2>
  <p class="section-intro">
    Ce chapitre regroupe les 6 principaux schémas éclatés du chargeur souterrain Epiroc Scooptram ST7. Chaque composant possède une référence d'identification unique pour faciliter le diagnostic et la commande de pièces de rechange. Les liens vers les codes de pannes associés permettent une navigation croisée avec l'assistant numérique.
  </p>
  <div class="notice-box gray mb-4">
    <strong>[SCHÉMA ÉCLATÉ — Voir l'assistant numérique pour l'interactivité des hotspots cliquables et les zooms haute définition]</strong>
  </div>
  
  <h3 class="subsection-title">1.1 MOTEUR CUMMINS QSB 6.7 — PARTIE 1 (ÉLÉMENTS STRUCTURELS & ALIMENTATION)</h3>
`;
const rowsMoteur1 = getTableRows('tbody-moteur').slice(0, 20);
let tableMoteur1Html = `
  ${ch1Intro}
  <table class="compact-table">
    <thead>
      <tr>
        <th style="width: 8%;">N°</th>
        <th>Désignation de la pièce</th>
        <th style="width: 22%;">Référence Epiroc</th>
        <th style="width: 18%;">Lien Panne</th>
      </tr>
    </thead>
    <tbody>
      ${rowsMoteur1.map(r => `
        <tr>
          <td class="text-center font-bold font-mono">${r.no}</td>
          <td>${r.name}</td>
          <td class="font-mono text-center text-gray-500">${r.ref}</td>
          <td class="font-mono text-center text-red-600 font-bold">${r.panne}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;
pages.push(createPage(tableMoteur1Html));

// Page 3: Table 1.1 Part 2 (Items 21-40)
const rowsMoteur2 = getTableRows('tbody-moteur').slice(20, 40);
const tableMoteur2Html = `
  <h3 class="subsection-title">1.1 MOTEUR CUMMINS QSB 6.7 — PARTIE 2 (INJECTION, REFROIDISSEMENT & ÉLECTRIQUE)</h3>
  <table class="compact-table">
    <thead>
      <tr>
        <th style="width: 8%;">N°</th>
        <th>Désignation de la pièce</th>
        <th style="width: 22%;">Référence Epiroc</th>
        <th style="width: 18%;">Lien Panne</th>
      </tr>
    </thead>
    <tbody>
      ${rowsMoteur2.map(r => `
        <tr>
          <td class="text-center font-bold font-mono">${r.no}</td>
          <td>${r.name}</td>
          <td class="font-mono text-center text-gray-500">${r.ref}</td>
          <td class="font-mono text-center text-red-600 font-bold">${r.panne}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;
pages.push(createPage(tableMoteur2Html));

// Page 4: Table 1.2 (Transmission Funk DF150, 29 items)
const rowsTrans = getTableRows('tbody-transmission');
const tableTransHtml = `
  <h3 class="subsection-title">1.2 TRANSMISSION FUNK DF150</h3>
  <div class="notice-box gray mb-3">
    <strong>[SCHÉMA TRANSMISSION — Voir l'assistant numérique pour l'interactivité 3D et le flux hydraulique des embrayages]</strong>
  </div>
  <table class="compact-table" style="font-size: 8.5pt;">
    <thead>
      <tr>
        <th style="width: 8%;">N°</th>
        <th>Désignation de la pièce</th>
        <th style="width: 22%;">Référence Epiroc</th>
        <th style="width: 18%;">Lien Panne</th>
      </tr>
    </thead>
    <tbody>
      ${rowsTrans.map(r => `
        <tr>
          <td class="text-center font-bold font-mono">${r.no}</td>
          <td>${r.name}</td>
          <td class="font-mono text-center text-gray-500">${r.ref}</td>
          <td class="font-mono text-center text-red-600 font-bold">${r.panne}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;
pages.push(createPage(tableTransHtml));

// Page 5: Table 1.3 (Hydraulics, 33 items)
const rowsHydr = getTableRows('tbody-hydraulique');
const tableHydrHtml = `
  <h3 class="subsection-title">1.3 HYDRAULIQUE LOAD SENSING REXROTH A10VO</h3>
  <div class="notice-box gray mb-3">
    <strong>[SCHÉMA HYDRAULIQUE — Voir l'assistant numérique pour la simulation en temps réel des tiroirs et vérins]</strong>
  </div>
  <table class="compact-table" style="font-size: 8.2pt;">
    <thead>
      <tr>
        <th style="width: 8%;">N°</th>
        <th>Désignation de la pièce</th>
        <th style="width: 22%;">Référence Epiroc</th>
        <th style="width: 18%;">Lien Panne</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHydr.map(r => `
        <tr>
          <td class="text-center font-bold font-mono">${r.no}</td>
          <td>${r.name}</td>
          <td class="font-mono text-center text-gray-500">${r.ref}</td>
          <td class="font-mono text-center text-red-600 font-bold">${r.panne}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;
pages.push(createPage(tableHydrHtml));

// Page 6: Table 1.4 (Brakes SAHR, 19 items)
const rowsBrakes = getTableRows('tbody-freinage');
const tableBrakesHtml = `
  <h3 class="subsection-title">1.4 FREINAGE SAHR FORCE COOLED</h3>
  <div class="notice-box gray mb-4">
    <strong>[SCHÉMA FREINAGE — Voir l'assistant numérique pour l'explication interactive du desserrage hydraulique SAHR]</strong>
  </div>
  <table class="compact-table">
    <thead>
      <tr>
        <th style="width: 8%;">N°</th>
        <th>Désignation de la pièce</th>
        <th style="width: 22%;">Référence Epiroc</th>
        <th style="width: 18%;">Lien Panne</th>
      </tr>
    </thead>
    <tbody>
      ${rowsBrakes.map(r => `
        <tr>
          <td class="text-center font-bold font-mono">${r.no}</td>
          <td>${r.name}</td>
          <td class="font-mono text-center text-gray-500">${r.ref}</td>
          <td class="font-mono text-center text-red-600 font-bold">${r.panne}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;
pages.push(createPage(tableBrakesHtml));

// Page 7: Table 1.5 (RCS, 18 items)
const rowsRcs = getTableRows('tbody-rcs');
const tableRcsHtml = `
  <h3 class="subsection-title">1.5 RCS RIG CONTROL SYSTEM</h3>
  <div class="notice-box gray mb-4">
    <strong>[SCHÉMA RCS — Voir l'assistant numérique pour la topologie complète du bus CAN et le diagnostic d'entrées/sorties]</strong>
  </div>
  <table class="compact-table">
    <thead>
      <tr>
        <th style="width: 8%;">N°</th>
        <th>Désignation de la pièce</th>
        <th style="width: 22%;">Référence Epiroc</th>
        <th style="width: 18%;">Lien Panne</th>
      </tr>
    </thead>
    <tbody>
      ${rowsRcs.map(r => `
        <tr>
          <td class="text-center font-bold font-mono">${r.no}</td>
          <td>${r.name}</td>
          <td class="font-mono text-center text-gray-500">${r.ref}</td>
          <td class="font-mono text-center text-red-600 font-bold">${r.panne}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;
pages.push(createPage(tableRcsHtml));

// Page 8: Table 1.6 (Chassis, 15 items)
const rowsChassis = getTableRows('tbody-chassis');
const tableChassisHtml = `
  <h3 class="subsection-title">1.6 CHÂSSIS, ESSIEUX, ARTICULATION</h3>
  <div class="notice-box gray mb-4">
    <strong>[SCHÉMA CHÂSSIS — Voir l'assistant numérique pour l'analyse des contraintes structurelles et points d'articulation]</strong>
  </div>
  <table class="compact-table">
    <thead>
      <tr>
        <th style="width: 8%;">N°</th>
        <th>Désignation de la pièce</th>
        <th style="width: 22%;">Référence Epiroc</th>
        <th style="width: 18%;">Lien Panne</th>
      </tr>
    </thead>
    <tbody>
      ${rowsChassis.map(r => `
        <tr>
          <td class="text-center font-bold font-mono">${r.no}</td>
          <td>${r.name}</td>
          <td class="font-mono text-center text-gray-500">${r.ref}</td>
          <td class="font-mono text-center text-red-600 font-bold">${r.panne}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;
pages.push(createPage(tableChassisHtml));

// Page 9: Chapter 1 technical verification summary & legend guidelines
const ch1SummaryHtml = `
  <h3 class="subsection-title">GUIDELINES ET LÉGENDES POUR ILLUSTRATEUR TECHNIQUE</h3>
  <p class="mb-4">
    Les schémas éclatés de ce chapitre doivent respecter scrupuleusement la charte graphique industrielle Epiroc. Ce manuel imprimable fait foi pour l'exactitude des désignations et des renvois de pannes vers le système RCS.
  </p>
  
  <div class="notice-box border mb-4">
    <h4 class="font-bold text-gray-800 mb-2">Exigences pour la production des schémas :</h4>
    <ul class="list-disc pl-5 space-y-2 text-gray-700" style="font-size: 10pt;">
      <li><strong>Format vectoriel :</strong> Les schémas doivent être fournis en SVG pur avec des id uniques pour chaque pièce cliquable (format : <code>part-XXX</code>).</li>
      <li><strong>Repérage visuel :</strong> Chaque numéro d'article doit être entouré d'un cercle de diamètre 12px blanc avec une bordure de 1.5px orange Epiroc (<code>#f59e0b</code>).</li>
      <li><strong>Lignes de renvoi :</strong> Les lignes doivent être fines (0.75px) en couleur gris moyen (<code>#718096</code>), se terminant par une puce pleine de 2px de diamètre sur la face du composant.</li>
      <li><strong>Lien vers pannes :</strong> Les hotspots doivent renvoyer l'identifiant exact de panne (ex : <code>Pan. 1.1.6.A</code>) à la plateforme Web d'Epiroc.</li>
    </ul>
  </div>
  
  <div class="notice-box yellow">
    <strong>⚠️ ATTENTION :</strong> Toutes les références indiquées comme <code>[REF À VÉRIFIER]</code> doivent faire l'objet d'une validation finale dans le catalogue SAP d'Epiroc avant la publication définitive.
  </div>
`;
pages.push(createPage(ch1SummaryHtml));


// ==================== PAGES 11-25: CHAPITRE 2 (PHOTOS) ====================
// We need to place 20 procedures in 15 pages.
// Distribution: Pages 11-15 have 2 procedures each (Total 10). Pages 16-25 have 1 procedure each (Total 10). Total = 20 procedures.
let procIndex = 0;

for (let pNum = 11; pNum <= 25; pNum++) {
  const isTwoProcs = pNum <= 15;
  const numProcsOnPage = isTwoProcs ? 2 : 1;
  
  let pageContentHtml = '';
  if (pNum === 11) {
    pageContentHtml += `
      <h2 class="section-title">CHAPITRE 2 — PHOTOS RÉELLES AVANT/PENDANT/APRÈS</h2>
      <p class="section-intro">
        Ce chapitre présente un catalogue photographique rigoureux de 20 procédures clés de maintenance pour le Scooptram ST7. Pour chaque intervention, 4 étapes d'état sont explicitées : "Cassé" (ou défaut d'entrée), "Outil en place", "Résultat attendu", et "Mauvais montage/consignes rouges".
      </p>
    `;
  }
  
  for (let prIdx = 0; prIdx < numProcsOnPage; prIdx++) {
    const proc = cahierProcedures[procIndex++];
    if (!proc) break;
    
    pageContentHtml += `
      <div class="proc-photo-block mb-4">
        <h3 class="proc-photo-title">${proc.title}</h3>
        <div class="notice-box gray mb-2" style="font-size: 8.5pt; padding: 4px 8px;">
          <strong>[PHOTOS RÉELLES — Consulter le carnet numérique ou scanner le QR code pour visualiser les clichés DSLR correspondants]</strong>
        </div>
        
        <div class="photo-print-grid">
          ${proc.photos.map(ph => {
            const accentClass = ph.type === 'CASSÉ' ? 'red' : ph.type === 'MAUVAIS' ? 'yellow' : ph.type === 'RÉSULTAT' ? 'green' : 'blue';
            return `
              <div class="photo-print-card">
                <div class="photo-card-header ${accentClass}">
                  ${ph.title}
                </div>
                <div class="photo-card-body">
                  <div class="photo-meta-item"><strong>Cadrage :</strong> ${ph.cadrage}</div>
                  <div class="photo-meta-item"><strong>Sujet :</strong> ${ph.subject}</div>
                  ${ph.details ? `<div class="photo-meta-item"><strong>Détails :</strong> ${ph.details}</div>` : ''}
                  ${ph.contexte ? `<div class="photo-meta-item"><strong>Contexte :</strong> ${ph.contexte}</div>` : ''}
                  ${ph.message ? `<div class="photo-meta-item text-red-600 font-bold"><strong>⚠️ Message :</strong> ${ph.message}</div>` : ''}
                  ${ph.outils ? `<div class="photo-meta-item text-blue-700"><strong>🔧 Outils :</strong> ${ph.outils}</div>` : ''}
                  ${ph.validation ? `<div class="photo-meta-item text-green-700"><strong>✅ Validation :</strong> ${ph.validation}</div>` : ''}
                  ${ph.ligneRouge ? `<div class="photo-meta-item text-red-700 font-bold"><strong>🚨 Ligne rouge :</strong> ${ph.ligneRouge}</div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  pages.push(createPage(pageContentHtml));
}


// ==================== PAGES 26-40: CHAPITRE 3 (STORYBOARDS) ====================
// Exactly 15 storyboards, 1 per page. Pages 26-40.
storyboards.forEach((sb, idx) => {
  let sbHtml = '';
  if (idx === 0) {
    sbHtml += `
      <h2 class="section-title">CHAPITRE 3 — STORYBOARDS DE TOURNAGE</h2>
      <p class="section-intro">
        Séquences de tournage vidéo prescrites pour les 15 procédures clés. Ces storyboards guident les équipes vidéo de terrain pour assurer la clarté et la conformité pédagogique des contenus audiovisuels.
      </p>
    `;
  }
  
  sbHtml += `
    <div class="storyboard-header-print">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 5px; margin-bottom: 10px;">
        <h3 class="storyboard-main-title" style="margin: 0; font-size: 13pt; color: #f59e0b; font-weight: bold;">
          ${sb.title}
        </h3>
        <span class="storyboard-specs-badge" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 2px 6px; font-size: 8pt; font-family: monospace; font-weight: bold; border-radius: 4px;">
          ${sb.duration}
        </span>
      </div>
      <p style="font-size: 9pt; color: #475569; margin: 0 0 10px 0; font-style: italic;">${sb.desc}</p>
      <div style="font-size: 8pt; font-family: monospace; color: #64748b; margin-bottom: 10px;"><strong>Spécifications techniques vidéo :</strong> ${sb.specs}</div>
    </div>
    
    <div class="notice-box gray mb-3" style="font-size: 8pt; padding: 4px 8px;">
      <strong>[STORYBOARD — Voir le carnet de tournage numérique interactif pour les transitions et animations animées en temps réel]</strong>
    </div>
    
    <div class="plans-container-print">
      ${sb.plans.map((p: any) => `
        <div class="plan-card-print">
          <div class="plan-header-print">
            <span class="plan-title-text">PLAN ${p.no} — ${p.title}</span>
            <span class="plan-type-badge">${p.type}</span>
          </div>
          <div class="plan-body-print">
            <div style="font-size: 8pt; font-family: monospace; color: #64748b; margin-bottom: 4px;"><strong>Technique :</strong> ${p.appareil}</div>
            <div style="margin-bottom: 4px;"><strong class="text-amber-600">Visuel :</strong> ${p.visuel}</div>
            <div style="margin-bottom: 4px;"><strong class="text-blue-600">Audio :</strong> ${p.audio}</div>
            <div class="overlay-print-box">
              <span class="overlay-tag">OVERLAY :</span> ${p.overlay}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="storyboard-specs-footer-print">
      <div class="footer-spec-col"><strong>🛠️ ÉQUIPEMENTS DE TOURNAGE :</strong> ${sb.equip}</div>
      <div class="footer-spec-col"><strong>⚠️ DIRECTIVES DE SÉCURITÉ :</strong> ${sb.sec}</div>
      <div class="footer-spec-col"><strong>🎬 POST-PRODUCTION CONSEILLÉE :</strong> ${sb.post}</div>
    </div>
  `;
  
  pages.push(createPage(sbHtml));
});


// ==================== PAGES 41-45: CHAPITRE 4 (ANIMATIONS) ====================
// Page 41: Introduction
const ch4Page1 = `
  <h2 class="section-title">CHAPITRE 4 — ANIMATIONS TECHNIQUES INTERACTIVES</h2>
  <p class="section-intro">
    Ce chapitre décrit les structures, fonctionnements cinématiques, et comportements internes de 3 systèmes techniques fondamentaux du Scooptram ST7 : le moteur Cummins QSB 6.7, le circuit hydraulique Load Sensing Rexroth A10VO, et le système de freinage SAHR (Spring Applied Hydraulically Released).
  </p>
  
  <div class="notice-box gray mb-4">
    <strong>[ANIMATION INTERACTIVE — Ouvrir le carnet numérique interactif pour faire tourner la cinématique 3D vectorielle SVG + CSS, déclencher les pannes, et commander le régulateur de vitesse en temps réel]</strong>
  </div>
  
  <div class="notice-box border" style="margin-top: 30px;">
    <h3 class="subsection-title" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px;">COMPORTEMENT CINÉMATIQUE ATTENDU</h3>
    <p class="text-gray-700" style="font-size: 10pt; line-height: 1.5;">
      Les animations vectorielles intègrent un moteur physique simplifié permettant aux techniciens d'observer les flux internes en temps réel :
    </p>
    <ul class="list-disc pl-5 space-y-3 text-gray-700" style="font-size: 9.5pt; margin-top: 10px;">
      <li><strong>Cinématique Moteur :</strong> Représentation à l'échelle de la rotation du vilebrequin, mouvement des pistons, et distribution d'injection Common Rail à 1600 bar.</li>
      <li><strong>Flux Hydraulique :</strong> Couleur dynamique des conduites (rouge pour la haute pression 24 MPa, bleu pour le retour réservoir, vert pour le signal Load Sensing de commande).</li>
      <li><strong>Freinage SAHR :</strong> Visualisation mécanique de la force de précontrainte des ressorts d'étrier contre la force de dépression hydraulique de desserrage de 180 bar.</li>
    </ul>
  </div>
`;
pages.push(createPage(ch4Page1));

// Page 42: Animation 4.1 - Engine QSB 6.7 description
const ch4Page2 = `
  <h3 class="subsection-title">4.1 MOTEUR CUMMINS QSB 6.7 — CINÉMATIQUE INTERACTIVE</h3>
  <p class="text-gray-700 mb-4" style="font-size: 10pt; line-height: 1.5;">
    L'animation cinématique vectorielle illustre le cycle de combustion interne d'un cylindre à 4 temps. Elle est synchronisée avec la distribution de carburant haute pression Common Rail.
  </p>
  
  <div class="ascii-diagram">
+-----------------------------------------------------------+
|               CHEMISE DU CYLINDRE                         |
|    +---+                                          +---+   |
|    | S |===[ INJECTEUR COMMON RAIL (1600 bar) ]===| S |   |
|    +---+                                          +---+   |
|               CHAMBRE DE COMBUSTION                       |
|                                                           |
|                  +=============+                          |
|                  |   PISTON    |  <-- PMH / PMB           |
|                  +=============+                          |
|                         ||                                |
|                         ||  <-- AXE PISTON                |
|                      +======+                             |
|                      |BIELLE|                             |
|                      +======+                             |
|                         ||                                |
|                         ||                                |
|                       +====+                              |
|                       | O  | <-- MANETON / VILEBREQUIN    |
|                       +====+                              |
|                                                           |
|             <-  ROTATION VILEBREQUIN  ->                  |
+-----------------------------------------------------------+
  </div>
  
  <h4 class="font-bold text-gray-800 mt-4 mb-2">Comportement mécanique et commandes :</h4>
  <ul class="list-disc pl-5 space-y-2 text-gray-700" style="font-size: 9.5pt;">
    <li><strong>Vitesse de rotation :</strong> Régulation de 0 à 2500 rpm. L'animation de la bielle et du piston s'accélère au rythme de la commande du technicien.</li>
    <li><strong>Distribution d'injection :</strong> Pulvérisation verte de carburant représentée exactement au Point Mort Haut (PMH) avec modification de couleur de la chambre (bleu → rouge de combustion).</li>
    <li><strong>Simulation de panne :</strong> Panne de perte de compression par grippage de segment, visualisée par un échappement de gaz noir latéral (fuite dans le carter).</li>
  </ul>
`;
pages.push(createPage(ch4Page2));

// Page 43: Animation 4.2 - Hydraulics LS Rexroth description
const ch4Page3 = `
  <h3 class="subsection-title">4.2 HYDRAULIQUE LOAD SENSING REXROTH A10VO</h3>
  <p class="text-gray-700 mb-4" style="font-size: 10pt; line-height: 1.5;">
    L'animation vectorielle décrit le fonctionnement régulé de la pompe pistons axiaux A10VO. Le plateau oscillant s'ajuste dynamiquement en fonction du signal Load Sensing provenant du bloc distributeur.
  </p>
  
  <div class="ascii-diagram">
+-----------------------------------------------------------+
|          CIRCUIT HYDRAULIQUE LOAD SENSING                 |
|                                                           |
|    [RÉSERVOIR] --> [POMPE A10VO] =======> [DISTRIBUTEUR]  |
|                         ||  ^                  ||         |
|   Plateau Oscillant     ||  |                  ||         |
|   Inclinaison variable  ||  +-- (Signal LS) ---++         |
|                         ||      Canal vert                |
|                         \/                                |
|                    [VÉRIN HOIST]                          |
|                    Chambre haute pression (Rouge)         |
|                    Retour réservoir (Bleu)                |
+-----------------------------------------------------------+
  </div>
  
  <h4 class="font-bold text-gray-800 mt-4 mb-2">Comportement mécanique et commandes :</h4>
  <ul class="list-disc pl-5 space-y-2 text-gray-700" style="font-size: 9.5pt;">
    <li><strong>Plateau oscillant :</strong> Son angle varie de 0° (standby, débit nul) à 18° (débit max). L'axe d'inclinaison est couplé à la position du levier de commande.</li>
    <li><strong>Régulation LS :</strong> En cas de charge du vérin de levage, le canal LS passe de 0 bar à la pression de travail (ex : 150 bar), forçant la pompe à s'incliner pour fournir le débit requis.</li>
    <li><strong>Simulation de panne :</strong> Fuite interne de tiroir ou colmatage du filtre de retour, visualisée par des zones de surchauffe orange et une chute de vitesse de sortie du vérin.</li>
  </ul>
`;
pages.push(createPage(ch4Page3));

// Page 44: Animation 4.3 - Brakes SAHR description
const ch4Page4 = `
  <h3 class="subsection-title">4.3 FREINAGE SAHR FORCE COOLED — MÉCANIQUE CINÉMATIQUE</h3>
  <p class="text-gray-700 mb-4" style="font-size: 10pt; line-height: 1.5;">
    L'animation détaille la balance physique au cœur de l'étrier de sécurité SAHR. Les freins sont appliqués par ressorts mécaniques en cas d'absence de pression, et desserrés par pression hydraulique.
  </p>
  
  <div class="ascii-diagram">
+-----------------------------------------------------------+
|                 ÉTRIER DE SÉCURITÉ SAHR                   |
|                                                           |
|             +==+   [ CHAMBRE DE PRESSION ]   +==+         |
|             |R |====>   Piston SAHR   <====|R |         |
|             |E |     Pression de release     |E |         |
|             |S |         (0-180 bar)         |S |         |
|             |S |                             |S |         |
|             |O |   +=====================+   |O |         |
|             |R |---|  GARNITURES DE      |---|R |         |
|             |T |---|  FRICTION (DISQUE)  |---|T |         |
|             +==+   +=====================+   +==+         |
|                                                           |
|    SANS PRESSION = RESSORTS SERRÉS = ARRÊT IMMÉDIAT       |
+-----------------------------------------------------------+
  </div>
  
  <h4 class="font-bold text-gray-800 mt-4 mb-2">Comportement mécanique et commandes :</h4>
  <ul class="list-disc pl-5 space-y-2 text-gray-700" style="font-size: 9.5pt;">
    <li><strong>Pression de release :</strong> Le curseur permet de simuler la pression de 0 à 180 bar. À 0 bar, les ressorts appliquent une force de serrage totale. À 120 bar, le frein commence à se libérer.</li>
    <li><strong>Système Force Cooling :</strong> Visualisation du débit de refroidissement liquide à l'intérieur de la cloche en fonction de la température simulée des freins.</li>
    <li><strong>Simulation de panne :</strong> Rupture de ressort de rappel ou fuite de joint torique de piston de release, entraînant un freinage résiduel destructeur et une alarme cabine RCS.</li>
  </ul>
`;
pages.push(createPage(ch4Page4));

// Page 45: Chapter 4 summary and evaluation
const ch4Page5 = `
  <h3 class="subsection-title">CHAPITRE 4 — SYNTHÈSE DE SÉCURITÉ OPÉRATIONNELLE</h3>
  <p class="text-gray-700 mb-4" style="font-size: 10pt; line-height: 1.5;">
    Les animations interactives ont pour but d'inculquer le réflexe de sécurité absolue chez le technicien. La compréhension des pannes dynamiques permet un diagnostic rapide et prévient les accidents en environnement souterrain.
  </p>
  
  <div class="notice-box red mb-4">
    <h4 class="font-bold mb-2">DANGER CRITIQUE DE SÉCURITÉ — PROCÉDURE SAHR :</h4>
    <p style="font-size: 9.5pt; line-height: 1.4;">
      N'intervenez JAMAIS sur un étrier de frein SAHR sans avoir préalablement installé le dispositif mécanique d'annulation de la force des ressorts (vis de force). Les ressorts précontraints à 900 N accumulent une énergie mortelle en cas de libération involontaire durant la dépose.
    </p>
  </div>
  
  <div class="notice-box green mb-4">
    <h4 class="font-bold mb-2">CRITÈRES DE VALIDATION DU BRAKE TEST RCS :</h4>
    <p style="font-size: 9.5pt; line-height: 1.4;">
      Le test de frein de parc automatique réalisé toutes les 4 heures par le RCS applique une pression de release de 180 bar, puis mesure la chute de pression sur 5 minutes. Une perte supérieure à 5 bar indique une fuite de joint et invalide immédiatement la machine (RCS lock).
    </p>
  </div>
`;
pages.push(createPage(ch4Page5));


// ==================== PAGES 46-75: CHAPITRE 5 (COTES ET TOLÉRANCES) ====================
// Exactly 30 tables of tolerances. 1 table per page. Pages 46-75.
// We map sections and their tables.
let tableCounter = 0;
COTES_DATA.forEach((section) => {
  section.tables.forEach((tbl: any) => {
    tableCounter++;
    
    let tableHtml = '';
    if (tableCounter === 1) {
      tableHtml += `
        <h2 class="section-title">CHAPITRE 5 — COTES, TOLÉRANCES ET PROCÉDURES DE CONTRÔLE</h2>
        <p class="section-intro">
          Ce chapitre fournit les 30 tableaux de tolérances de précision, les instructions d'inspection, et les diagnostics de pannes associés pour chaque élément fonctionnel de la chargeuse Epiroc ST7.
        </p>
      `;
    }
    
    tableHtml += `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f59e0b; padding-bottom: 5px; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 11pt; font-weight: bold; color: #111;">
          TABLEAU ${tbl.id} — ${tbl.title}
        </h3>
        <span style="background: #fffbeb; border: 1px solid #fef3c7; color: #b45309; padding: 2px 6px; font-size: 8.5pt; font-family: monospace; font-weight: bold; border-radius: 4px;">
          Réf Procédure : ${tbl.ref}
        </span>
      </div>
      
      <table class="compact-table" style="font-size: 8.2pt; margin-bottom: 15px;">
        <thead>
          <tr>
            <th style="width: 6%;">N°</th>
            <th style="width: 35%;">Point de contrôle</th>
            <th style="width: 10%;">Nominal</th>
            <th style="width: 10%;">Tol min</th>
            <th style="width: 10%;">Tol max</th>
            <th style="width: 8%;">Unité</th>
            <th style="width: 18%;">Instrument de mesure</th>
            <th style="width: 8%;">Fréq.</th>
          </tr>
        </thead>
        <tbody>
          ${tbl.rows.map((row: any) => `
            <tr>
              <td class="text-center font-mono font-bold">${row[0]}</td>
              <td class="font-bold">${row[1]}</td>
              <td class="text-center font-bold text-amber-600" style="background-color: #fffbeb;">${row[2]}</td>
              <td class="text-center font-mono">${row[3]}</td>
              <td class="text-center font-mono">${row[4]}</td>
              <td class="text-center font-mono font-bold">${row[5]}</td>
              <td>${row[6]}</td>
              <td class="text-center font-mono font-bold" style="background-color: #f8fafc;">${row[7]}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="proc-check-list-print" style="margin-bottom: 15px; background: #fafafa; border: 1px solid #e2e8f0; padding: 10px; border-radius: 5px;">
        <h4 style="font-size: 9pt; font-weight: bold; margin: 0 0 8px 0; color: #475569; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          📋 PROCÉDURE DE CONTRÔLE OPÉRATIONNEL — ${tbl.ref}
        </h4>
        <ol style="margin: 0; padding-left: 15px; font-size: 8.5pt; line-height: 1.5; color: #334155;">
          <li><strong>Préparation :</strong> ${tbl.prep}</li>
          <li><strong>Positionnement :</strong> ${tbl.pos}</li>
          <li><strong>Mesure :</strong> ${tbl.mesure}</li>
          <li><strong>Enregistrement :</strong> ${tbl.reg}</li>
          <li><strong>Décision :</strong> ${tbl.dec}</li>
        </ol>
      </div>
      
      <div class="diag-panne-print" style="background: #fef2f2; border: 1px solid #fee2e2; padding: 10px; border-radius: 5px;">
        <h4 style="font-size: 9pt; font-weight: bold; margin: 0 0 6px 0; color: #991b1b; text-transform: uppercase;">
          🚨 PANNE SI HORS TOLÉRANCE : ${tbl.diagnostic.panne}
        </h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-family: monospace; font-size: 8pt; color: #7f1d1d; border-top: 1px solid #fecaca; padding-top: 6px;">
          <div><strong>Réf. Panne :</strong> ${tbl.diagnostic.ref}</div>
          <div><strong>Arbre Décision :</strong> ${tbl.diagnostic.arbre}</div>
          <div><strong>Action requise :</strong> <span style="font-weight: bold; color: #b91c1c;">${tbl.diagnostic.action}</span></div>
        </div>
      </div>
    `;
    
    pages.push(createPage(tableHtml));
  });
});


// ==================== PAGES 76-100: CHAPITRE 6 (OUTILS) ====================
// Exactly 25 tools, 1 per page. Pages 76-100.
OUTILS_LIST.forEach((otl, idx) => {
  let otlHtml = '';
  if (idx === 0) {
    otlHtml += `
      <h2 class="section-title">CHAPITRE 6 — FICHES TECHNIQUES DES OUTILS DE MAINTENANCE</h2>
      <p class="section-intro">
        Catalogue complet des 25 outils spécifiques requis pour la maintenance du Scooptram ST7. Chaque fiche détaille les caractéristiques, les procédures de mise en service, l'entretien, et l'emplacement de stockage en atelier.
      </p>
    `;
  }
  
  otlHtml += `
    <div class="outil-fiche-print">
      <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #111; padding-bottom: 6px; margin-bottom: 12px;">
        <div>
          <h3 style="margin: 0; font-size: 13pt; font-weight: bold; color: #f59e0b; text-transform: uppercase;">
            ${otl.name}
          </h3>
          <div style="font-size: 9pt; color: #64748b; font-weight: bold; margin-top: 2px;">
            <span>${otl.cat}</span> &nbsp;|&nbsp; <span style="color: #1a1a1a; font-family: monospace;">Fabricant : ${otl.mfr}</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 3px;">
          <span style="background: #111; color: #fff; padding: 2px 6px; font-family: monospace; font-size: 8.5pt; font-weight: bold; border-radius: 4px;">
            REF: ${otl.ref}
          </span>
          <span style="font-size: 8pt; font-family: monospace; font-weight: bold; color: #64748b;">FICHE ${otl.id}</span>
        </div>
      </div>
      
      <div class="outil-grid-layout" style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 15px; margin-bottom: 15px;">
        <div>
          <!-- Schematic Drawing Box -->
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: #0a0a0a; height: 160px; display: flex; justify-content: center; align-items: center; margin-bottom: 12px;">
            <svg viewBox="0 0 200 150" style="width: 100%; height: 100%; max-height: 150px;">
              ${otl.svg}
            </svg>
          </div>
          
          <h4 style="font-size: 8.5pt; font-weight: bold; text-transform: uppercase; margin: 0 0 6px 0; color: #475569; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px;">
            📋 Caractéristiques techniques
          </h4>
          <table class="compact-table" style="font-size: 8pt; margin: 0;">
            <tbody>
              ${otl.specs.map((spc: any) => `
                <tr>
                  <td style="width: 35%; font-weight: bold; background: #f8fafc; padding: 4px 6px;">${spc[0]}</td>
                  <td style="font-family: monospace; padding: 4px 6px; color: #334155;">${spc[1]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div>
          <div style="background: #fafafa; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; margin-bottom: 12px;">
            <h4 style="font-size: 8.5pt; font-weight: bold; text-transform: uppercase; margin: 0 0 6px 0; color: #475569; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px;">
              ▶ Procédure d'utilisation
            </h4>
            <ol style="margin: 0; padding-left: 15px; font-size: 8.2pt; line-height: 1.4; color: #334155;">
              ${otl.proc.map((step: any) => `<li>${step}</li>`).join('')}
            </ol>
          </div>
          
          <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 8px 10px; border-radius: 6px; margin-bottom: 12px; font-size: 8.2pt; color: #78350f;">
            <strong style="color: #b45309; text-transform: uppercase; font-size: 8pt; display: block; margin-bottom: 3px;">🔧 Entretien & Étalonnage</strong>
            ${otl.maint}
          </div>
          
          <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 8px 10px; border-radius: 6px; font-size: 8.2pt; color: #065f46;">
            <strong style="color: #047857; text-transform: uppercase; font-size: 8pt; display: block; margin-bottom: 3px;">📍 Stockage d'atelier</strong>
            ${otl.loc}
          </div>
        </div>
      </div>
    </div>
  `;
  
  pages.push(createPage(otlHtml));
});


// ==================== PAGE 101: FINAL PAGE ====================
const finalHtml = `
  <div class="final-container">
    <div class="final-logo">EPIROC</div>
    <div class="final-title-box">
      <h1 class="final-title">FIN DE DOCUMENT</h1>
      <h2 class="final-subtitle">Cahier des Charges Visuel — Epiroc Scooptram ST7</h2>
      <div class="final-orange-line"></div>
    </div>
    
    <div class="final-content-grid" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 30px; margin-top: 30px; margin-bottom: 40px;">
      <div>
        <h3 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px;">RÉCAPITULATIF DES RÉFÉRENCES</h3>
        <table class="compact-table" style="font-size: 9pt;">
          <thead>
            <tr>
              <th>Module technique</th>
              <th>Référence Epiroc</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Moteur Cummins QSB 6.7</td><td class="font-mono">9833-2103-01-A</td><td>1.0</td></tr>
            <tr><td>Transmission Funk DF150</td><td class="font-mono">9833-2103-01-B</td><td>1.0</td></tr>
            <tr><td>Hydraulique Rexroth A10VO</td><td class="font-mono">9833-2103-01-C</td><td>1.0</td></tr>
            <tr><td>Freinage SAHR Force Cooled</td><td class="font-mono">9833-2103-01-D</td><td>1.0</td></tr>
            <tr><td>RCS Rig Control System</td><td class="font-mono">9833-2103-01-E</td><td>1.0</td></tr>
            <tr><td>Châssis et articulation</td><td class="font-mono">9833-2103-01-F</td><td>1.0</td></tr>
          </tbody>
        </table>
      </div>
      
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 style="font-size: 11pt; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px;">EPIROC SUPPORT TECHNIQUE</h3>
          <p style="font-size: 9.5pt; line-height: 1.5; color: #475569; margin: 0 0 10px 0;">
            Pour toute assistance ou demande d'approvisionnement en pièces d'origine, contactez votre support régional :
          </p>
          <ul style="margin: 0; padding-left: 15px; font-size: 9pt; line-height: 1.5; color: #1a1a1a;">
            <li><strong>Email :</strong> support.st7@epiroc.com</li>
            <li><strong>Téléphone :</strong> +46 (0) 19 670 70 00</li>
            <li><strong>Portail Web :</strong> my.epiroc.com</li>
          </ul>
        </div>
        
        <div style="border: 2px dashed #cbd5e1; border-radius: 8px; padding: 12px; text-align: center; background: #fafafa; margin-top: 15px;">
          <div style="font-weight: bold; font-size: 10pt; color: #475569; margin-bottom: 4px;">[QR CODE ACCÈS CAHIER NUMÉRIQUE]</div>
          <div style="font-size: 8pt; color: #64748b; line-height: 1.3;">Scannez pour accéder aux vidéos réelles, aux animations interactives, et au diagnostic de pannes direct.</div>
        </div>
      </div>
    </div>
    
    <div class="final-legal-box" style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 8.5pt; color: #94a3b8; text-align: center; margin-top: 40px;">
      <p style="margin: 0 0 5px 0;">Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} — Epiroc ST7 Technical Assistant Platform.</p>
      <p style="margin: 0;">© Epiroc AB 2024. Tous droits réservés.</p>
    </div>
  </div>
`;
pages.push(createPage(finalHtml));


// ==================== COMPILE FULL HTML DOCUMENT ====================
const fullHtmlOutput = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Cahier des Charges Visuel - Epiroc Scooptram ST7 - Export PDF</title>
  <style>
    /* Common layout styling */
    body {
      background-color: #f1f5f9;
      color: #1e293b;
      font-family: "Inter", Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 20px 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .page {
      background-color: #ffffff;
      width: 210mm;
      height: 297mm;
      margin: 0 auto 30px auto;
      padding: 20mm 15mm 20mm 15mm;
      box-sizing: border-box;
      position: relative;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .page.landscape {
      width: 297mm;
      height: 210mm;
      padding: 15mm 15mm 15mm 15mm;
    }
    
    .page-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    /* Header and footer styling */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #f59e0b;
      padding-bottom: 6px;
      margin-bottom: 15px;
      height: 10mm;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .header-logo {
      font-family: Arial, sans-serif;
      font-weight: 900;
      font-size: 13pt;
      letter-spacing: 1px;
      color: #1e293b;
    }
    
    .header-sep {
      color: #cbd5e1;
      font-weight: 300;
      font-size: 11pt;
    }
    
    .header-title {
      font-size: 8.5pt;
      font-weight: bold;
      color: #475569;
    }
    
    .header-right {
      font-family: monospace;
      font-size: 8pt;
      font-weight: bold;
      color: #64748b;
    }
    
    .page-footer {
      position: absolute;
      bottom: 20mm;
      left: 15mm;
      right: 15mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      height: 8mm;
      font-size: 7.5pt;
      color: #94a3b8;
    }
    
    .page.landscape .page-footer {
      bottom: 15mm;
      left: 15mm;
      right: 15mm;
    }
    
    .footer-left {
      font-weight: bold;
    }
    
    .footer-center {
      font-family: monospace;
    }
    
    .footer-right {
      font-weight: bold;
      color: #475569;
    }
    
    /* Typography & Structure elements */
    .section-title {
      font-size: 16pt;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 10px 0;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    
    .section-intro {
      font-size: 9.5pt;
      line-height: 1.5;
      color: #475569;
      margin: 0 0 15px 0;
    }
    
    .subsection-title {
      font-size: 11.5pt;
      font-weight: bold;
      color: #1e293b;
      margin: 0 0 10px 0;
      text-transform: uppercase;
      letter-spacing: -0.2px;
    }
    
    /* Table styling */
    .compact-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin-bottom: 15px;
    }
    
    .compact-table th {
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      font-weight: bold;
      color: #334155;
      text-align: left;
      font-size: 8pt;
      text-transform: uppercase;
    }
    
    .compact-table td {
      border: 1px solid #e2e8f0;
      padding: 5px 8px;
      color: #334155;
      line-height: 1.3;
    }
    
    .compact-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    
    .text-center {
      text-align: center;
    }
    
    .font-mono {
      font-family: monospace;
    }
    
    .font-bold {
      font-weight: bold;
    }
    
    /* Notices & Alerts */
    .notice-box {
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 9pt;
      line-height: 1.4;
      margin-bottom: 15px;
    }
    
    .notice-box.gray {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      color: #475569;
      text-align: center;
    }
    
    .notice-box.yellow {
      background-color: #fffbeb;
      border: 1px solid #fef3c7;
      color: #92400e;
    }
    
    .notice-box.red {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    
    .notice-box.green {
      background-color: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
    }
    
    /* Cover page styling */
    .cover-container {
      padding: 30mm 15mm 20mm 15mm;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    
    .cover-top-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6mm;
      background-color: #f59e0b;
    }
    
    .cover-logo {
      font-size: 26pt;
      font-weight: 900;
      letter-spacing: 2px;
      color: #0f172a;
      border-bottom: 4px solid #f59e0b;
      display: inline-block;
      padding-bottom: 5px;
      margin-bottom: 40px;
    }
    
    .cover-main-box {
      margin-bottom: 40px;
    }
    
    .cover-title {
      font-size: 28pt;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.1;
      margin: 0;
      letter-spacing: -1px;
    }
    
    .cover-subtitle {
      font-size: 22pt;
      font-weight: 800;
      color: #f59e0b;
      margin: 5px 0 0 0;
      letter-spacing: -0.5px;
    }
    
    .cover-orange-line {
      height: 5px;
      background-color: #1e293b;
      width: 100px;
      margin: 20px 0;
    }
    
    .cover-doc-type {
      font-size: 12pt;
      color: #475569;
      font-weight: bold;
      margin: 0;
    }
    
    .cover-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 40px;
      font-size: 9.5pt;
    }
    
    .meta-item {
      color: #334155;
    }
    
    .cover-toc {
      margin-bottom: 40px;
    }
    
    .toc-title {
      font-size: 11pt;
      font-weight: 900;
      color: #0f172a;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 4px;
      margin: 0 0 12px 0;
      letter-spacing: 0.5px;
    }
    
    .toc-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .toc-list li a {
      display: flex;
      justify-content: space-between;
      color: #334155;
      text-decoration: none;
      font-size: 9pt;
      font-weight: bold;
      align-items: center;
    }
    
    .toc-list li a:hover {
      color: #f59e0b;
    }
    
    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #cbd5e1;
      margin: 0 10px;
    }
    
    .toc-page {
      font-family: monospace;
      color: #64748b;
    }
    
    .cover-footer {
      font-size: 8pt;
      color: #94a3b8;
      line-height: 1.4;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
    
    /* Chapter 2: Photos Styling */
    .photo-print-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .photo-print-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      font-size: 8.5pt;
      background: #ffffff;
    }
    
    .photo-card-header {
      padding: 6px 10px;
      font-weight: bold;
      color: #fff;
      font-size: 8.5pt;
      text-transform: uppercase;
    }
    
    .photo-card-header.red { background-color: #dc2626; }
    .photo-card-header.yellow { background-color: #ca8a04; }
    .photo-card-header.green { background-color: #16a34a; }
    .photo-card-header.blue { background-color: #2563eb; }
    
    .photo-card-body {
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .photo-meta-item {
      line-height: 1.3;
      color: #334155;
    }
    
    /* Chapter 3 Storyboards printing */
    .plan-card-print {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      margin-bottom: 10px;
      overflow: hidden;
      background-color: #fafafa;
    }
    
    .plan-header-print {
      background-color: #e2e8f0;
      padding: 5px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #cbd5e1;
    }
    
    .plan-title-text {
      font-weight: bold;
      font-size: 9pt;
      color: #1e293b;
    }
    
    .plan-type-badge {
      background-color: #475569;
      color: #ffffff;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 7.5pt;
      font-family: monospace;
      font-weight: bold;
    }
    
    .plan-body-print {
      padding: 8px 10px;
      font-size: 8.5pt;
      line-height: 1.3;
    }
    
    .overlay-print-box {
      margin-top: 6px;
      background: #0f172a;
      color: #fbbf24;
      font-family: monospace;
      font-size: 8pt;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: bold;
    }
    
    .overlay-tag {
      color: #94a3b8;
    }
    
    .storyboard-specs-footer-print {
      margin-top: 15px;
      border-top: 1px solid #cbd5e1;
      padding-top: 10px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      font-size: 8pt;
    }
    
    .footer-spec-col {
      line-height: 1.4;
      color: #475569;
    }
    
    /* Chapter 4 ASCII diagrams */
    .ascii-diagram {
      font-family: monospace;
      font-size: 8.5pt;
      background-color: #0f172a;
      color: #38bdf8;
      border-radius: 6px;
      padding: 15px;
      line-height: 1.35;
      margin: 15px 0;
      white-space: pre;
      border-left: 4px solid #f59e0b;
      overflow-x: auto;
    }
    
    /* Page print layout options */
    @media print {
      body {
        background-color: transparent;
        padding: 0;
        margin: 0;
      }
      
      .page {
        margin: 0;
        box-shadow: none;
        page-break-after: always;
        break-after: page;
        width: 210mm;
        height: 297mm;
        overflow: hidden;
      }
      
      .page.landscape {
        width: 297mm;
        height: 210mm;
      }
      
      /* Webkit printing fixes */
      @page {
        size: A4 portrait;
        margin: 0;
      }
      
      @page landscape {
        size: A4 landscape;
        margin: 0;
      }
      
      .page.landscape {
        page: landscape;
      }
    }
  </style>
</head>
<body>
  ${pages.join('\n')}
</body>
</html>
`;

// Save outputs
const targetPublicDir = path.resolve('public');
if (!fs.existsSync(targetPublicDir)) {
  fs.mkdirSync(targetPublicDir, { recursive: true });
}

fs.writeFileSync(path.join(targetPublicDir, 'print-st7.html'), fullHtmlOutput, 'utf-8');
console.log('Successfully wrote print-st7.html to public/ directory!');

const targetDistDir = path.resolve('dist');
if (fs.existsSync(targetDistDir)) {
  fs.writeFileSync(path.join(targetDistDir, 'print-st7.html'), fullHtmlOutput, 'utf-8');
  console.log('Successfully wrote print-st7.html to dist/ directory!');
}
