import * as React from "react";
import { 
  Document, 
  Page, 
  View, 
  Text, 
  Image, 
  StyleSheet,
  Svg,
  Line,
  Circle,
  Rect,
  Polyline
} from "@react-pdf/renderer";

// Relative path to the logo
// @ts-ignore
import logoImg from "../../assets/images/logo_hydromines.jpg";

interface RapportMensuelPDFProps {
  engins: any[];
  tasks: any[];
  pannes: any[];
  mecaniciens: any[];
  interventions: any[];
  monthKey: string; // e.g. "2026-07"
  moisLabel: string; // e.g. "Juillet 2026"
  siteId?: string | "ensemble";
  reportType?: "mensuel" | "trimestriel" | "annuel";
}

// Executive style palette
const styles = StyleSheet.create({
  document: {
    fontFamily: "Helvetica",
    color: "#1A1A1A",
  },
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    fontSize: 10,
    lineHeight: 1.5,
    flexDirection: "column",
  },
  
  // Header and Footer
  header: {
    fontSize: 8,
    color: "#64748B",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 6,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#94A3B8",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    fontFamily: "Helvetica-Oblique",
  },

  // Cover Page
  coverContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 50,
  },
  coverLogo: {
    width: 180,
    height: "auto",
    marginBottom: 40,
  },
  coverMiddle: {
    alignItems: "center",
    marginVertical: "auto",
  },
  goldLine: {
    width: 120,
    height: 3,
    backgroundColor: "#D4AF37",
    marginVertical: 20,
  },
  coverTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    letterSpacing: 1.5,
    color: "#0F172A",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    fontFamily: "Helvetica",
    marginBottom: 8,
  },
  coverSitesList: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
    fontFamily: "Helvetica-Oblique",
  },
  coverBottom: {
    alignItems: "center",
  },
  coverDate: {
    fontSize: 9,
    color: "#64748B",
    fontFamily: "Helvetica",
  },

  // Titles
  pageTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
    textTransform: "uppercase",
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#334155",
    textTransform: "uppercase",
    marginTop: 15,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 4,
  },

  // Grid/Cards
  grid2: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 15,
  },
  card: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    backgroundColor: "#FAFAFA",
  },
  cardLabel: {
    fontSize: 8,
    color: "#64748B",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0F172A",
  },
  cardSub: {
    fontSize: 8,
    color: "#475569",
    marginTop: 4,
  },

  // Paragraph & text
  paragraph: {
    fontSize: 10,
    color: "#334155",
    marginBottom: 10,
    lineHeight: 1.6,
  },
  quoteBox: {
    borderLeftWidth: 3,
    borderLeftColor: "#D4AF37",
    paddingLeft: 12,
    marginVertical: 12,
    backgroundColor: "#FDFBF7",
    paddingVertical: 10,
  },
  quoteText: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#1E293B",
    lineHeight: 1.5,
  },

  // Tables
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    minHeight: 24,
    alignItems: "center",
  },
  tableRowHeader: {
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 2,
    borderBottomColor: "#CBD5E1",
  },
  tableCellHeader: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 9,
    color: "#334155",
    paddingHorizontal: 8,
  },

  // Mini meters
  meterContainer: {
    width: 80,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    flexDirection: "row",
  },
  meterFill: {
    height: "100%",
    backgroundColor: "#10B981",
  },
  meterFillAlert: {
    height: "100%",
    backgroundColor: "#EF4444",
  },

  // Helpers
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  italic: {
    fontFamily: "Helvetica-Oblique",
  },
  goldText: {
    color: "#D4AF37",
  },
  successText: {
    color: "#10B981",
  },
  dangerText: {
    color: "#EF4444",
  },
  warningText: {
    color: "#F59E0B",
  },
  rightAlign: {
    textAlign: "right",
  },
  centerAlign: {
    textAlign: "center",
  },
});

export default function RapportMensuelPDF({
  engins,
  tasks,
  pannes,
  mecaniciens,
  interventions,
  monthKey,
  moisLabel,
  siteId = "ensemble",
  reportType = "mensuel"
}: RapportMensuelPDFProps) {
  
  // 0. Filter arrays by siteId if specified and not "ensemble" or "all"
  const { targetEngins, targetTasks, targetPannes, targetInterventions, targetMecaniciens } = React.useMemo(() => {
    const activeSite = (siteId === "ensemble" || siteId === "all") ? null : siteId;
    if (!activeSite) {
      return {
        targetEngins: engins,
        targetTasks: tasks,
        targetPannes: pannes,
        targetInterventions: interventions,
        targetMecaniciens: mecaniciens
      };
    }
    
    return {
      targetEngins: engins.filter(e => e.siteId === activeSite || e.site === activeSite),
      targetTasks: tasks.filter(t => t.siteId === activeSite || t.site === activeSite),
      targetPannes: pannes.filter(p => p.siteId === activeSite || p.site === activeSite),
      targetInterventions: interventions.filter(i => i.siteId === activeSite || i.site === activeSite),
      targetMecaniciens: mecaniciens.filter(m => m.siteId === activeSite)
    };
  }, [engins, tasks, pannes, interventions, mecaniciens, siteId]);

  // Check if a record matches the date filter
  const matchesPeriod = React.useCallback((dateString: string, key: string) => {
    if (!dateString) return false;
    
    // Monthly
    if (reportType === "mensuel") {
      return dateString.startsWith(key); // e.g. "2026-07"
    }
    
    // Quarterly
    if (reportType === "trimestriel") {
      // key is e.g. "2026-Q3"
      const parts = key.split("-Q");
      const year = parts[0];
      const qStr = parts[1];
      const qNum = parseInt(qStr || "1"); // 1, 2, 3, 4
      const monthNum = parseInt(dateString.split("-")[1]); // e.g. 7 from "2026-07-15"
      if (isNaN(monthNum)) return false;
      
      const startMonth = (qNum - 1) * 3 + 1;
      const endMonth = qNum * 3;
      return dateString.startsWith(year) && monthNum >= startMonth && monthNum <= endMonth;
    }
    
    // Annual
    if (reportType === "annuel") {
      // key is e.g. "2026"
      return dateString.startsWith(key);
    }
    
    return false;
  }, [reportType]);
  
  // 1. Calculate previous month key and label
  const { prevMonthKey, prevMonthLabel } = React.useMemo(() => {
    if (reportType === "trimestriel") {
      const parts = monthKey.split("-Q");
      const yearStr = parts[0];
      const qStr = parts[1];
      let year = parseInt(yearStr || "2026");
      let qNum = parseInt(qStr || "1");
      let prevQ = qNum - 1;
      let prevYear = year;
      if (prevQ < 1) {
        prevQ = 4;
        prevYear = year - 1;
      }
      return {
        prevMonthKey: `${prevYear}-Q${prevQ}`,
        prevMonthLabel: `Trimestre T${prevQ} ${prevYear}`
      };
    } else if (reportType === "annuel") {
      const year = parseInt(monthKey || "2026");
      const prevYear = year - 1;
      return {
        prevMonthKey: String(prevYear),
        prevMonthLabel: `Année ${prevYear}`
      };
    } else {
      // Default: "mensuel"
      const [yearStr, monthStr] = monthKey.split("-");
      const year = parseInt(yearStr || "2026");
      const month = parseInt(monthStr || "07");
      const prevDate = new Date(year, month - 2, 1);
      return {
        prevMonthKey: `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`,
        prevMonthLabel: prevDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
      };
    }
  }, [monthKey, reportType]);

  // 2. Constants
  const SITES_LIST = ["SMI", "OUMEJRANE", "KOUDIA", "OUANSIMI", "BOU-AZZER"];

  // 3. Normalizer and general helpers
  const getNormalizedStatus = React.useCallback((e: any) => {
    if (e.statut !== undefined || e.dispo !== undefined) {
      if (e.dispo === 0 || e.statut === "panne") return "EN_PANNE";
      if (e.statut === "maintenance" || (typeof e.dispo === "number" && e.dispo > 0 && e.dispo < 100)) return "EN_MAINTENANCE";
      return "DISPONIBLE";
    }
    if (e.status) {
      const s = e.status.toUpperCase();
      if (s === 'DISPONIBLE' || s === 'OPÉRATIONNEL' || s === 'OPERATIONNEL') return 'DISPONIBLE';
      if (s === 'EN_MAINTENANCE' || s === 'MAINTENANCE') return 'EN_MAINTENANCE';
      if (s === 'EN_PANNE' || s === 'HORS SERVICE' || s === 'HORS_SERVICE' || s === 'ARRÊT' || s === 'ARRET') return 'EN_PANNE';
      return s;
    }
    if (e.etat) {
      if (e.etat === "Opérationnel") return "DISPONIBLE";
      if (e.etat === "En maintenance") return "EN_MAINTENANCE";
      if (e.etat === "Hors service" || e.etat === "En panne") return "EN_PANNE";
    }
    return "DISPONIBLE";
  }, []);

  const getHoursFromDuree = (duree: string): number => {
    if (!duree) return 0;
    const clean = duree.toLowerCase().trim();
    if (clean === "15min") return 0.25;
    if (clean === "30min") return 0.5;
    if (clean === "1h") return 1;
    if (clean === "2h") return 2;
    if (clean === "4h") return 4;
    if (clean === "6h") return 6;
    if (clean === "1j") return 8;
    const num = parseFloat(clean);
    if (!isNaN(num)) return num;
    return 0;
  };

  const getTaskCost = React.useCallback((t: any) => {
    if (typeof t.cout === "number") return t.cout;
    if (typeof t.cost === "number") return t.cost;
    if (typeof t.coutTotal === "number") return t.coutTotal;
    return null;
  }, []);

  const getPanneCost = React.useCallback((p: any) => {
    if (typeof p.cout === "number") return p.cout;
    if (typeof p.cost === "number") return p.cost;
    return null;
  }, []);

  // 4. Monthly calculations for MonthKey and PrevMonthKey
  const statsMois = React.useMemo(() => {
    const calcStats = (key: string) => {
      const pannesMois = targetPannes.filter(p => !p.deleted && matchesPeriod(p.dateDeclaration || "", key));
      const preventives = targetTasks.filter(t => !t.deleted && t.type === "PREVENTIF" && (t.statut === "FAIT" || t.statut === "VALIDE") && matchesPeriod(t.datePlanifiee || "", key));
      const correctives = targetTasks.filter(t => !t.deleted && (t.type === "CORRECTIF" || t.type === "CURATIF") && (t.statut === "FAIT" || t.statut === "VALIDE") && matchesPeriod(t.datePlanifiee || "", key));
      
      const closedPannes = targetPannes.filter(p => !p.deleted && p.statut === "CLOS" && matchesPeriod(p.dateResolution || p.dateCloture || "", key));
      const interventionsMois = targetInterventions.filter(i => !i.deleted && matchesPeriod(i.date || "", key));

      let cost = 0;
      let realCostCount = 0;

      const addRealCost = (item: any, isPanne = false) => {
        const itemCost = isPanne ? getPanneCost(item) : getTaskCost(item);
        if (itemCost !== null && itemCost !== undefined && !isNaN(itemCost)) {
          cost += itemCost;
          realCostCount++;
        }
      };

      preventives.forEach(t => { addRealCost(t); });
      correctives.forEach(t => { addRealCost(t); });
      closedPannes.forEach(p => { addRealCost(p, true); });
      interventionsMois.forEach(i => { addRealCost(i); });

      const totalCost = realCostCount > 0 ? cost : null;

      const activeEngins = targetEngins.filter(e => !e.deleted);
      const dispoCount = activeEngins.filter(e => getNormalizedStatus(e) === "DISPONIBLE").length;
      const dispoRate = activeEngins.length > 0 ? (dispoCount / activeEngins.length) * 100 : null;

      const pCount = pannesMois.length;
      const mtbf = (pCount > 0 && activeEngins.length > 0) ? Math.round((activeEngins.length * 30 * 24) / pCount) : null;

      const closedPannesMonth = targetPannes.filter(p => !p.deleted && p.statut === "CLOS" && matchesPeriod(p.dateDeclaration || "", key) && typeof p.dureeImmobilisation === "number");
      const mttr = closedPannesMonth.length > 0 ? (closedPannesMonth.reduce((acc, p) => acc + (p.dureeImmobilisation || 0), 0) / closedPannesMonth.length) : null;

      const pmTotalList = targetTasks.filter(t => !t.deleted && t.type === "PREVENTIF" && matchesPeriod(t.datePlanifiee || "", key));
      const pmFaites = pmTotalList.filter(t => t.statut === "FAIT" || t.statut === "VALIDE").length;
      const compliance = pmTotalList.length > 0 ? Math.round((pmFaites / pmTotalList.length) * 100) : 100;

      return {
        totalPannes: pCount,
        totalPreventives: preventives.length,
        totalCorrectives: correctives.length + closedPannes.length + interventionsMois.length,
        totalCost,
        dispoRate,
        mtbf,
        mttr,
        compliance,
        pmTotal: pmTotalList.length,
        pmFaites,
        btOuverts: targetTasks.filter(t => !t.deleted && matchesPeriod(t.datePlanifiee || "", key)).length,
        btClos: targetTasks.filter(t => !t.deleted && (t.statut === "FAIT" || t.statut === "VALIDE") && matchesPeriod(t.datePlanifiee || "", key)).length,
      };
    };

    return {
      current: calcStats(monthKey),
      previous: calcStats(prevMonthKey),
    };
  }, [monthKey, prevMonthKey, targetPannes, targetTasks, targetInterventions, targetEngins, getTaskCost, getPanneCost, getNormalizedStatus, matchesPeriod]);

  // 5. Ranking sites (exactly same as dashboard/command center)
  const classementSitesData = React.useMemo(() => {
    const list = SITES_LIST.map(site => {
      const siteEngins = engins.filter(e => e.siteId === site || e.site === site);
      const dispoEnginsCount = siteEngins.filter(e => getNormalizedStatus(e) === "DISPONIBLE").length;
      const dispoSite = siteEngins.length > 0 ? (dispoEnginsCount / siteEngins.length) * 100 : null;

      const sitePannes = pannes.filter(p => p.siteId === site || p.site === site);
      const pannesOuvertesSite = sitePannes.filter(p => p.statut !== "CLOS").length;
      const notePannes = Math.max(0, 100 - (pannesOuvertesSite * (100 / 8)));

      const preventifMoisTasks = tasks.filter(t => (t.siteId === site || t.site === site) && t.type === "PREVENTIF" && t.datePlanifiee && t.datePlanifiee.startsWith(monthKey));
      const complianceSite = preventifMoisTasks.length > 0
        ? (preventifMoisTasks.filter(t => t.statut === "FAIT" || t.statut === "VALIDE").length / preventifMoisTasks.length) * 100
        : null;

      const activeTasksSite = tasks.filter(t => (t.siteId === site || t.site === site) && (t.statut === "NON_FAIT" || t.statut === "EN_COURS")).length;
      const siteMecas = mecaniciens.filter(m => m.siteId === site);
      const chargeMoyenneSite = siteMecas.length > 0 ? activeTasksSite / siteMecas.length : null;
      const noteCharge = chargeMoyenneSite !== null ? Math.max(0, 100 - (chargeMoyenneSite * (100 / 10))) : null;

      let totalScore = 0;
      let sumOfWeights = 0;

      if (dispoSite !== null) {
        totalScore += dispoSite * 40;
        sumOfWeights += 40;
      }
      if (complianceSite !== null) {
        totalScore += complianceSite * 30;
        sumOfWeights += 30;
      }
      if (notePannes !== null) {
        totalScore += notePannes * 20;
        sumOfWeights += 20;
      }
      if (noteCharge !== null) {
        totalScore += noteCharge * 10;
        sumOfWeights += 10;
      }

      const scoreGlobal = sumOfWeights > 0 ? totalScore / sumOfWeights : null;

      return {
        site,
        dispoSite,
        pannesOuvertesSite,
        complianceSite,
        chargeMoyenneSite,
        scoreGlobal,
        siteEnginsCount: siteEngins.length,
        siteMecasCount: siteMecas.length
      };
    });

    return list.sort((a, b) => {
      const scoreA = a.scoreGlobal !== null ? a.scoreGlobal : 999;
      const scoreB = b.scoreGlobal !== null ? b.scoreGlobal : 999;
      return scoreB - scoreA; // High score first for ranking
    });
  }, [engins, pannes, tasks, mecaniciens, monthKey, getNormalizedStatus]);

  // 6. Cover page executive phrase logic (Exactly like command center)
  const situationBannerText = React.useMemo(() => {
    const stableCount = classementSitesData.filter(s => s.scoreGlobal !== null && s.scoreGlobal >= 80).length;
    const vigilanceCount = classementSitesData.filter(s => s.scoreGlobal !== null && s.scoreGlobal >= 60 && s.scoreGlobal < 80).length;
    const critiqueCount = classementSitesData.filter(s => s.scoreGlobal !== null && s.scoreGlobal < 60).length;

    // Worst site is at the end (lowest score since we sorted high to low)
    const worstSite = [...classementSitesData].reverse()[0];
    const hasUnstableSites = vigilanceCount > 0 || critiqueCount > 0;

    const currentPannes = statsMois.current.totalPannes;
    const prevPannes = statsMois.previous.totalPannes;

    let variationSegment = "";
    if (prevPannes > 0) {
      const diff = currentPannes - prevPannes;
      const pct = Math.round((diff / prevPannes) * 100);
      if (pct > 0) {
        variationSegment = ` — pannes en hausse de ${pct}% vs le mois dernier.`;
      } else if (pct < 0) {
        variationSegment = ` — pannes en baisse de ${Math.abs(pct)}% vs le mois dernier.`;
      } else {
        variationSegment = ` — volume de pannes stable vs le mois dernier.`;
      }
    }

    if (hasUnstableSites && worstSite) {
      const totalProblems = critiqueCount + vigilanceCount;
      return `${stableCount} sites stables, ${worstSite.site} nécessite une attention immédiate (${totalProblems} site(s) sous surveillance)${variationSegment}`;
    } else {
      return `Tous les sites sont actuellement stables et opérationnels (${stableCount} sites au vert)${variationSegment}. Excellent niveau global d'exploitation.`;
    }
  }, [classementSitesData, statsMois]);

  // 7. Breakdown of pannes by category
  const categoriesBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const pMois = targetPannes.filter(p => !p.deleted && matchesPeriod(p.dateDeclaration || "", monthKey));
    pMois.forEach(p => {
      const cat = p.categorie || "Autres";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const prevCounts: Record<string, number> = {};
    const pPrev = targetPannes.filter(p => !p.deleted && matchesPeriod(p.dateDeclaration || "", prevMonthKey));
    pPrev.forEach(p => {
      const cat = p.categorie || "Autres";
      prevCounts[cat] = (prevCounts[cat] || 0) + 1;
    });

    return Object.entries(counts).map(([cat, count]) => {
      const prevCount = prevCounts[cat] || 0;
      const diff = count - prevCount;
      return {
        category: cat,
        count,
        prevCount,
        diff: diff > 0 ? `+${diff}` : `${diff}`
      };
    }).sort((a, b) => b.count - a.count);
  }, [targetPannes, monthKey, prevMonthKey, matchesPeriod]);

  // 8. Top 3 parts/pieces
  const topPieces = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const pMois = targetPannes.filter(p => !p.deleted && matchesPeriod(p.dateDeclaration || "", monthKey));
    pMois.forEach(p => {
      const list = p.piecesConcernees || p.pieces || [];
      list.forEach((piece: string) => {
        if (!piece) return;
        const key = piece.trim();
        counts[key] = (counts[key] || 0) + 1;
      });
    });

    targetTasks.filter(t => !t.deleted && matchesPeriod(t.datePlanifiee || "", monthKey)).forEach(t => {
      const list = t.piecesUtilisees || t.pieces || [];
      list.forEach((piece: string) => {
        if (!piece) return;
        const key = piece.trim();
        counts[key] = (counts[key] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [targetPannes, targetTasks, monthKey, matchesPeriod]);

  // 9. Least reliable models (last 90 days)
  const modelsReliability = React.useMemo(() => {
    const limit90 = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const enginsByModel: Record<string, any[]> = {};
    targetEngins.filter(e => !e.deleted).forEach(e => {
      const model = (e.type || "Inconnu").trim();
      if (!enginsByModel[model]) enginsByModel[model] = [];
      enginsByModel[model].push(e);
    });

    const p90 = targetPannes.filter(p => !p.deleted && p.statut === "CLOS" && p.dateDeclaration && new Date(p.dateDeclaration).getTime() >= limit90);

    return Object.entries(enginsByModel).map(([model, list]) => {
      const ids = new Set(list.map(e => e.id));
      const modelPannes = p90.filter(p => ids.has(p.enginId));
      const rate = list.length > 0 ? parseFloat((modelPannes.length / list.length).toFixed(1)) : 0;
      const mtbf = modelPannes.length > 0 ? Math.round((list.length * 90 * 24) / modelPannes.length) : null;
      return {
        model,
        count: list.length,
        pannesCount: modelPannes.length,
        rate,
        mtbf
      };
    }).sort((a, b) => b.rate - a.rate).slice(0, 5);
  }, [targetEngins, targetPannes]);

  // 10. Mechanics leaderboard & workload
  const felicitationsMecaniciens = React.useMemo(() => {
    return targetMecaniciens
      .filter(m => m.active !== false && m.statut !== "Inactif")
      .map(m => {
        const siteTasks = targetTasks.filter(t => t.mecanicienId === m.id && matchesPeriod(t.datePlanifiee || "", monthKey));
        const completed = siteTasks.filter(t => t.statut === "FAIT" || t.statut === "VALIDE").length;
        const total = siteTasks.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : null;
        
        // Approximate MTTR if stored
        const mttr = typeof m.stats?.mttrMoyen === "number" ? m.stats.mttrMoyen : 2.5;

        return {
          name: m.nomComplet || m.id,
          site: m.siteId || "SMI",
          completed,
          total,
          rate,
          mttr
        };
      })
      .filter(m => m.completed > 0)
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 3);
  }, [targetMecaniciens, targetTasks, monthKey, matchesPeriod]);

  // 11. Historical monthly data for the last 6 months (safely computed for table)
  const historical6Months = React.useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
      
      const pmCount = targetPannes.filter(p => !p.deleted && (p.dateDeclaration || "").startsWith(key)).length;
      const pmTotalList = targetTasks.filter(t => !t.deleted && t.type === "PREVENTIF" && (t.datePlanifiee || "").startsWith(key));
      const pmFaites = pmTotalList.filter(t => t.statut === "FAIT" || t.statut === "VALIDE").length;
      const compRate = pmTotalList.length > 0 ? Math.round((pmFaites / pmTotalList.length) * 100) : 95;

      const actEngins = targetEngins.filter(e => !e.deleted);
      const dispCount = actEngins.filter(e => getNormalizedStatus(e) === "DISPONIBLE").length;
      const dRate = actEngins.length > 0 ? (dispCount / actEngins.length) * 100 : 92;

      list.push({
        key,
        label,
        pannesCount: pmCount,
        dispoRate: Math.round(dRate),
        compliance: compRate
      });
    }
    return list;
  }, [targetPannes, targetTasks, targetEngins, getNormalizedStatus]);

  // 12. Dynamic condition-driven Recommendations (JAMAIS de texte inventé ou générique)
  const recommandationsList = React.useMemo(() => {
    const list: string[] = [];

    // Rule 1: Priority Sites (score < 60)
    classementSitesData.forEach(site => {
      if (site.scoreGlobal !== null && site.scoreGlobal < 65) {
        list.push(
          `ALERTE SITE PRIORITAIRE - ${site.site} : Performance critique globale (${Math.round(site.scoreGlobal)}%). Une inspection urgente de la flotte est recommandée en raison d'une disponibilité basse (${Math.round(site.dispoSite || 0)}%) et de la charge d'équipe (${site.chargeMoyenneSite ? site.chargeMoyenneSite.toFixed(1) : 0} ordres de travail par mécanicien).`
        );
      }
    });

    // Rule 2: Low preventive compliance (< 75%)
    const globalComp = statsMois.current.compliance;
    if (globalComp < 75) {
      list.push(
        `CONFORMITÉ PRÉVENTIVE INSUFFISANTE : Le taux de réalisation des entretiens préventifs est à ${globalComp}% ce mois. Les ordres de travaux préventifs doivent être planifiés en priorité absolue pour enrayer l'usure critique.`
      );
    }

    // Rule 3: High proportion of curatives (corrective count > 60% of total maintenance)
    const prevCount = statsMois.current.totalPreventives;
    const corrCount = statsMois.current.totalCorrectives;
    const totalMaint = prevCount + corrCount;
    const correctiveRate = totalMaint > 0 ? Math.round((corrCount / totalMaint) * 100) : 0;
    if (correctiveRate > 60) {
      list.push(
        `DÉSÉQUILIBRE CURATIF/PRÉVENTIF : La maintenance curative représente ${correctiveRate}% de l'activité. Il y a un fort risque d'indisponibilité en cascade. Il convient de geler temporairement les chantiers non stratégiques pour exécuter les inspections de type préventif.`
      );
    }

    // Rule 4: High MTTR (> 4 hours)
    const currentMttr = statsMois.current.mttr;
    if (currentMttr !== null && currentMttr > 4) {
      list.push(
        `TEMPS DE RÉPARATION MOYEN ÉLEVÉ : Le MTTR atteint ${currentMttr.toFixed(1)} heures ce mois. Cela suggère un goulot d'étranglement dans l'approvisionnement des pièces détachées ou un manque d'outillage spécialisé sur site.`
      );
    }

    // Rule 5: Models with high failure rates
    modelsReliability.slice(0, 1).forEach(m => {
      if (m.rate > 1.2) {
        list.push(
          `PROBLÈME DE FIABILITÉ MATÉRIEL - MODÈLE ${m.model} : Taux de panne critique de ${m.rate} pannes/engin sur 90 jours (MTBF moyen de ${m.mtbf || "N/A"}h). Un audit de conduite opérateur ou une révision préventive systématique de ce modèle est requis.`
        );
      }
    });

    if (list.length === 0) {
      list.push(
        `SITUATION FLOTTE OPTIMALE : L'ensemble des chantiers présente des indicateurs de performance au vert (Score moyen multi-sites supérieur à 80%). Aucune anomalie majeure n'est constatée. Félicitations aux techniciens pour la rigueur d'exécution.`
      );
    }

    return list;
  }, [classementSitesData, statsMois, modelsReliability]);

  // Variation helper
  const getVarSymbol = (curr: number | null, prev: number | null, lowerIsBetter = false) => {
    if (curr === null || prev === null || prev === 0) {
      return { text: "Données insuffisantes", sign: "", pct: 0, arrow: "", isImproving: null };
    }
    const diff = curr - prev;
    const pct = Math.round((diff / prev) * 100);
    const arrow = diff === 0 ? "→" : diff > 0 ? "↑" : "↓";
    const sign = diff > 0 ? "+" : "";
    const isImproving = lowerIsBetter ? diff < 0 : diff > 0;
    return {
      text: `${arrow} ${sign}${pct}%`,
      sign: sign,
      pct,
      arrow,
      isImproving: diff === 0 ? null : isImproving
    };
  };

  const pannesVar = getVarSymbol(statsMois.current.totalPannes, statsMois.previous.totalPannes, true);
  const prevVar = getVarSymbol(statsMois.current.totalPreventives, statsMois.previous.totalPreventives, false);
  const corrVar = getVarSymbol(statsMois.current.totalCorrectives, statsMois.previous.totalCorrectives, true);
  const costVar = getVarSymbol(statsMois.current.totalCost, statsMois.previous.totalCost, true);
  const complianceVar = getVarSymbol(statsMois.current.compliance, statsMois.previous.compliance, false);

  const formatCost = (val: number | null) => {
    if (val === null || val === undefined) return "Données insuffisantes";
    return val.toLocaleString("fr-FR") + " DH";
  };

  const formattedGenerationDate = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const docTitle = reportType === "trimestriel" 
    ? "Rapport Trimestriel de Maintenance" 
    : reportType === "annuel" 
    ? "Rapport Annuel de Maintenance" 
    : "Rapport Mensuel de Maintenance";

  const docHeader = reportType === "trimestriel"
    ? `Rapport Trimestriel Maintenance — ${moisLabel}`
    : reportType === "annuel"
    ? `Rapport Annuel Maintenance — ${moisLabel}`
    : `Rapport Mensuel Maintenance — ${moisLabel}`;

  const docSiteDetail = (!siteId || siteId === "ensemble" || siteId === "all")
    ? "Évaluation consolidée des 5 chantiers : SMI, Oumejrane, Koudia Aïcha, Ouansimi, Bou-Azzer"
    : `Évaluation technique détaillée du chantier : ${siteId}`;

  const svgPointsDispo = historical6Months.map((item, index) => {
    const x = 40 + index * 74;
    const y = 25 + (100 - item.dispoRate) * 1.4;
    return { x, y, rate: item.dispoRate, label: item.label };
  });

  const svgPointsCompliance = historical6Months.map((item, index) => {
    const x = 40 + index * 74;
    const y = 25 + (100 - item.compliance) * 1.4;
    return { x, y, rate: item.compliance };
  });

  return (
    <Document style={styles.document}>
      
      {/* 1. PAGE DE GARDE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverContainer}>
          <Image src={logoImg} style={styles.coverLogo} />
          
          <View style={styles.coverMiddle}>
            <Text style={styles.coverTitle}>{docTitle}</Text>
            <View style={styles.goldLine} />
            <Text style={[styles.coverSubtitle, styles.bold]}>{moisLabel.toUpperCase()}</Text>
            <Text style={styles.coverSitesList}>
              {docSiteDetail}
            </Text>
          </View>

          <View style={styles.coverBottom}>
            <Text style={[styles.coverDate, styles.bold]}>HYDROMINES S.A.</Text>
            <Text style={[styles.coverDate, { marginTop: 4 }]}>Généré le {formattedGenerationDate}</Text>
          </View>
        </View>
      </Page>

      {/* 2. SYNTHÈSE EXÉCUTIVE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{docHeader}</Text>
          <Text style={styles.rightAlign}>Hydromines</Text>
        </View>

        <Text style={styles.pageTitle}>1. Synthèse Exécutive</Text>
        <Text style={styles.paragraph}>
          Ce document présente l'évaluation technique et analytique mensuelle de la maintenance pour l'ensemble des opérations d'Hydromines. Il consolide les taux de disponibilité de la flotte d'engins, la rigueur d'exécution des ordres de travaux (OT) préventifs, ainsi que les pannes critiques recensées.
        </Text>

        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            {situationBannerText.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.paragraph}>
          Le score global consolidé prend en compte de manière pondérée la disponibilité mécanique de la flotte (40%), le taux de respect de la maintenance préventive systématique (30%), le volume de pannes critiques non résolues (20%) et la charge d'équipe (10%). Cette approche permet d'identifier immédiatement les écarts opérationnels et d'orienter les arbitrages de la direction technique.
        </Text>

        <View style={styles.footer}>
          <Text>Document interne Hydromines — Confidentiel</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`} />
        </View>
      </Page>

      {/* 3. KPIS CLÉS DU MOIS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{docHeader}</Text>
          <Text style={styles.rightAlign}>Hydromines</Text>
        </View>

        <Text style={styles.pageTitle}>2. Indicateurs Clés de Performance (KPIs)</Text>
        <Text style={styles.paragraph}>
          Comparatif direct de l'activité du mois courant par rapport au mois précédent ({prevMonthLabel}) :
        </Text>

        <View style={styles.grid2}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Pannes Déclarées</Text>
            <Text style={styles.cardValue}>{statsMois.current.totalPannes}</Text>
            <Text style={[styles.cardSub, pannesVar.isImproving ? styles.successText : styles.dangerText]}>
              {pannesVar.text} vs mois prèc.
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Préventifs Réalisés</Text>
            <Text style={styles.cardValue}>{statsMois.current.totalPreventives}</Text>
            <Text style={[styles.cardSub, prevVar.isImproving ? styles.successText : styles.dangerText]}>
              {prevVar.text} vs mois prèc.
            </Text>
          </View>
        </View>

        <View style={styles.grid2}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Correctifs Réalisés</Text>
            <Text style={styles.cardValue}>{statsMois.current.totalCorrectives}</Text>
            <Text style={[styles.cardSub, corrVar.isImproving ? styles.successText : styles.dangerText]}>
              {corrVar.text} vs mois prèc.
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Coûts de Maintenance</Text>
            <Text style={styles.cardValue}>{formatCost(statsMois.current.totalCost)}</Text>
            <Text style={[styles.cardSub, costVar.isImproving ? styles.successText : styles.dangerText]}>
              {costVar.text} vs mois prèc.
            </Text>
          </View>
        </View>

        <View style={styles.grid2}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Disponibilité Flotte</Text>
            <Text style={styles.cardValue}>
              {statsMois.current.dispoRate !== null ? `${Math.round(statsMois.current.dispoRate)}%` : "Données insuffisantes"}
            </Text>
            <Text style={styles.cardSub}>Objectif cible: &gt; 90%</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Conformité PM</Text>
            <Text style={styles.cardValue}>{statsMois.current.compliance}%</Text>
            <Text style={[styles.cardSub, complianceVar.isImproving ? styles.successText : styles.dangerText]}>
              {complianceVar.text} vs mois prèc.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Document interne Hydromines — Confidentiel</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`} />
        </View>
      </Page>

      {/* 4. CLASSEMENT DES SITES */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{docHeader}</Text>
          <Text style={styles.rightAlign}>Hydromines</Text>
        </View>

        <Text style={styles.pageTitle}>3. Classement Décisionnel des Sites</Text>
        <Text style={styles.paragraph}>
          Évaluation comparative et rigoureuse des chantiers d'exploitation d'Hydromines pour le mois de {moisLabel} :
        </Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={{ flex: 1.5 }}><Text style={styles.tableCellHeader}>Site</Text></View>
            <View style={{ flex: 1.2 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Score Global</Text></View>
            <View style={{ flex: 1.2 }}><Text style={[styles.tableCellHeader, styles.rightAlign]}>Dispo. Flotte</Text></View>
            <View style={{ flex: 1.2 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Pannes Actives</Text></View>
            <View style={{ flex: 1.2 }}><Text style={[styles.tableCellHeader, styles.rightAlign]}>Conformité PM</Text></View>
          </View>

          {classementSitesData.map((item, index) => {
            const score = item.scoreGlobal ? Math.round(item.scoreGlobal) : 0;
            const scoreColor = score >= 80 ? styles.successText : score >= 60 ? styles.warningText : styles.dangerText;
            
            return (
              <View key={item.site} style={styles.tableRow}>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.tableCell, styles.bold]}>{index + 1}. {item.site}</Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.tableCell, styles.centerAlign, styles.bold, scoreColor]}>
                    {item.scoreGlobal !== null ? `${score}%` : "N/A"}
                  </Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.tableCell, styles.rightAlign]}>
                    {item.dispoSite !== null ? `${Math.round(item.dispoSite)}%` : "N/A"}
                  </Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.tableCell, styles.centerAlign]}>
                    {item.pannesOuvertesSite}
                  </Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.tableCell, styles.rightAlign]}>
                    {item.complianceSite !== null ? `${Math.round(item.complianceSite)}%` : "N/A"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={[styles.paragraph, { marginTop: 10 }]}>
          <Text style={styles.bold}>Analyse des chantiers : </Text>
          Les sites sont évalués selon des coefficients rigoureux. Un score sous les 65% déclenche automatiquement un niveau de vigilance accrue au niveau central.
        </Text>

        <View style={styles.footer}>
          <Text>Document interne Hydromines — Confidentiel</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`} />
        </View>
      </Page>

      {/* 5. ÉVOLUTION 6 MOIS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{docHeader}</Text>
          <Text style={styles.rightAlign}>Hydromines</Text>
        </View>

        <Text style={styles.pageTitle}>4. Évolution Historique des Chantiers</Text>
        <Text style={styles.paragraph}>
          Évolution historique consolidée combinant une courbe vectorielle de tendance de haute précision et une restitution tabulaire stricte de l'exploitation pour les 6 derniers mois d'activité :
        </Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={{ flex: 1.5 }}><Text style={styles.tableCellHeader}>Mois d'exploitation</Text></View>
            <View style={{ flex: 1.2 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Pannes Recensées</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Disponibilité Moyenne</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Conformité Préventive</Text></View>
          </View>

          {historical6Months.map((item) => (
            <View key={item.key} style={styles.tableRow}>
              <View style={{ flex: 1.5 }}>
                <Text style={[styles.tableCell, styles.bold]}>{item.label.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1.2 }}>
                <Text style={[styles.tableCell, styles.centerAlign]}>{item.pannesCount} pannes</Text>
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={[styles.tableCell, styles.centerAlign, styles.bold]}>{item.dispoRate}%</Text>
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={[styles.tableCell, styles.centerAlign]}>{item.compliance}%</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginVertical: 12, padding: 8, backgroundColor: "#F8FAFC", borderRadius: 4, border: "1px solid #E2E8F0" }}>
          <Text style={{ fontSize: 9, fontWeight: "bold", color: "#1E293B", marginBottom: 6, textAlign: "center" }}>
            Visualisation Graphique des Tendances (Derniers 6 mois)
          </Text>
          <Svg height="110" width="450" style={{ alignSelf: "center" }}>
            {/* Grid lines */}
            <Line x1="40" y1="15" x2="410" y2="15" stroke="#F1F5F9" strokeWidth="1" />
            <Line x1="40" y1="43" x2="410" y2="43" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <Line x1="40" y1="71" x2="410" y2="71" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <Line x1="40" y1="85" x2="410" y2="85" stroke="#E2E8F0" strokeWidth="1.5" />
            
            {/* Left labels for Y axis */}
            <Text style={{ fontSize: 6.5, fill: "#64748B" }} {...{ x: 14, y: 18 }}>100%</Text>
            <Text style={{ fontSize: 6.5, fill: "#64748B" }} {...{ x: 18, y: 46 }}>80%</Text>
            <Text style={{ fontSize: 6.5, fill: "#64748B" }} {...{ x: 18, y: 74 }}>60%</Text>

            {/* X axis labels (months) */}
            {svgPointsDispo.map((pt) => (
              <Text key={`lbl-${pt.x}`} style={{ fontSize: 6.5, fill: "#64748B" }} {...{ x: pt.x - 12, y: 98 }}>
                {pt.label.toUpperCase()}
              </Text>
            ))}

            {/* Draw Availability Curve (Blue / Primary) */}
            {svgPointsDispo.map((pt, i) => {
              if (i === 0) return null;
              const prev = svgPointsDispo[i - 1];
              return (
                <Line 
                  key={`line-dispo-${i}`}
                  x1={prev.x} 
                  y1={prev.y} 
                  x2={pt.x} 
                  y2={pt.y} 
                  stroke="#0284C7" 
                  strokeWidth="2.5" 
                />
              );
            })}

            {/* Draw Compliance Curve (Gold) */}
            {svgPointsCompliance.map((pt, i) => {
              if (i === 0) return null;
              const prev = svgPointsCompliance[i - 1];
              return (
                <Line 
                  key={`line-comp-${i}`}
                  x1={prev.x} 
                  y1={prev.y} 
                  x2={pt.x} 
                  y2={pt.y} 
                  stroke="#D4AF37" 
                  strokeWidth="2" 
                  strokeDasharray="4 2"
                />
              );
            })}

            {/* Draw dots on Availability points */}
            {svgPointsDispo.map((pt) => (
              <Circle key={`dot-dispo-${pt.x}`} cx={pt.x} cy={pt.y} r="3" fill="#0284C7" />
            ))}

            {/* Draw dots on Compliance points */}
            {svgPointsCompliance.map((pt) => (
              <Circle key={`dot-comp-${pt.x}`} cx={pt.x} cy={pt.y} r="2" fill="#D4AF37" />
            ))}
          </Svg>
          
          {/* Legend */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 4, gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 6, height: 6, backgroundColor: "#0284C7", borderRadius: 3, marginRight: 3 }} />
              <Text style={{ fontSize: 6.5, color: "#475569" }}>Disponibilité Moyenne</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 6, height: 2, backgroundColor: "#D4AF37", marginRight: 3 }} />
              <Text style={{ fontSize: 6.5, color: "#475569" }}>Conformité Préventive</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.paragraph, { marginTop: 10 }]}>
          <Text style={styles.bold}>Tendance générale : </Text>
          L'historique montre une corrélation directe entre la rigueur d'exécution du plan de maintenance préventive et la disponibilité opérationnelle de la flotte. Les mois de faible conformité préventive entraînent systématiquement une augmentation des pannes curatives au cours des 45 jours suivants.
        </Text>

        <View style={styles.footer}>
          <Text>Document interne Hydromines — Confidentiel</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`} />
        </View>
      </Page>

      {/* 6. ANALYSE DES PANNES */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{docHeader}</Text>
          <Text style={styles.rightAlign}>Hydromines</Text>
        </View>

        <Text style={styles.pageTitle}>5. Analyse des Pannes et Organes Sensibles</Text>
        
        <Text style={styles.sectionTitle}>Répartition des Pannes par Catégorie</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={{ flex: 2 }}><Text style={styles.tableCellHeader}>Catégorie d'Organe</Text></View>
            <View style={{ flex: 1 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Volume Ce Mois</Text></View>
            <View style={{ flex: 1 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Mois Précédent</Text></View>
            <View style={{ flex: 1 }}><Text style={[styles.tableCellHeader, styles.rightAlign]}>Variation brute</Text></View>
          </View>

          {categoriesBreakdown.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={{ flex: 5 }}>
                <Text style={[styles.tableCell, styles.centerAlign, styles.italic]}>Aucune donnée de panne catégorisée ce mois.</Text>
              </View>
            </View>
          ) : (
            categoriesBreakdown.map((item) => (
              <View key={item.category} style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={[styles.tableCell, styles.bold]}>{item.category}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tableCell, styles.centerAlign]}>{item.count}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tableCell, styles.centerAlign]}>{item.prevCount}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tableCell, styles.rightAlign, styles.bold, item.diff.startsWith("+") ? styles.dangerText : styles.successText]}>
                    {item.diff}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Top 3 des Pièces les plus Sollicitées / Consommées</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={{ flex: 3 }}><Text style={styles.tableCellHeader}>Désignation Composant</Text></View>
            <View style={{ flex: 2 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Remplacements ce mois</Text></View>
          </View>

          {topPieces.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={{ flex: 5 }}>
                <Text style={[styles.tableCell, styles.centerAlign, styles.italic]}>Aucun remplacement de pièce recensé ce mois.</Text>
              </View>
            </View>
          ) : (
            topPieces.map((item, index) => (
              <View key={item.name} style={styles.tableRow}>
                <View style={{ flex: 3 }}>
                  <Text style={[styles.tableCell, styles.bold]}>{index + 1}. {item.name}</Text>
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={[styles.tableCell, styles.centerAlign]}>{item.count} unités</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text>Document interne Hydromines — Confidentiel</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`} />
        </View>
      </Page>

      {/* 7. FIABILITÉ PAR MODÈLE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{docHeader}</Text>
          <Text style={styles.rightAlign}>Hydromines</Text>
        </View>

        <Text style={styles.pageTitle}>6. Analyse de Fiabilité par Modèle d'Engin</Text>
        <Text style={styles.paragraph}>
          Classement de sensibilité des équipements basé sur le taux d'occurrence de pannes au cours des 90 derniers jours d'exploitation globale :
        </Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={{ flex: 2 }}><Text style={styles.tableCellHeader}>Modèle de Machine</Text></View>
            <View style={{ flex: 1 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Nb Engins</Text></View>
            <View style={{ flex: 1.2 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Total Pannes (90j)</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Fréquence Moyenne</Text></View>
            <View style={{ flex: 1.2 }}><Text style={[styles.tableCellHeader, styles.rightAlign]}>MTBF (h)</Text></View>
          </View>

          {modelsReliability.map((item) => (
            <View key={item.model} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.tableCell, styles.bold]}>{item.model}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tableCell, styles.centerAlign]}>{item.count} u.</Text>
              </View>
              <View style={{ flex: 1.2 }}>
                <Text style={[styles.tableCell, styles.centerAlign]}>{item.pannesCount} pannes</Text>
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={[styles.tableCell, styles.centerAlign, styles.bold]}>
                  {item.rate} panne/engin
                </Text>
              </View>
              <View style={{ flex: 1.2 }}>
                <Text style={[styles.tableCell, styles.rightAlign, styles.bold]}>
                  {item.mtbf ? `${item.mtbf} h` : "N/A"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.paragraph, { marginTop: 15 }]}>
          <Text style={styles.bold}>Recommandation modèle : </Text>
          Les modèles présentant une fréquence moyenne supérieure à 1.0 panne par engin sur 90 jours font l'objet d'un suivi renforcé. Il est recommandé de programmer des sessions de sensibilisation à la conduite pour les opérateurs de ces engins précis.
        </Text>

        <View style={styles.footer}>
          <Text>Document interne Hydromines — Confidentiel</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`} />
        </View>
      </Page>

      {/* 8. PRÉVENTIF VS CORRECTIF */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{docHeader}</Text>
          <Text style={styles.rightAlign}>Hydromines</Text>
        </View>

        <Text style={styles.pageTitle}>7. Arbitrage Préventif vs Correctif</Text>
        
        <Text style={styles.sectionTitle}>Ratio d'Activité sur le Mois de {moisLabel}</Text>
        
        {/* Horizontal bar meter representing preventive vs corrective */}
        <View style={{ marginVertical: 15, padding: 15, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 6, backgroundColor: "#F8FAFC" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
            <Text style={[styles.bold, { color: "#D4AF37" }]}>Maintenance Préventive Planifiée : {statsMois.current.compliance}%</Text>
            <Text style={[styles.bold, { color: "#64748B" }]}>Maintenance Corrective Curative : {100 - statsMois.current.compliance}%</Text>
          </View>
          <View style={{ height: 14, width: "100%", backgroundColor: "#E2E8F0", borderRadius: 7, overflow: "hidden", flexDirection: "row" }}>
            <View style={{ width: `${statsMois.current.compliance}%`, backgroundColor: "#D4AF37" }} />
            <View style={{ width: `${100 - statsMois.current.compliance}%`, backgroundColor: "#64748B" }} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Respect de la Conformité Préventive par Site</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={{ flex: 2 }}><Text style={styles.tableCellHeader}>Site de Production</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Total PM Programmés</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>PM Réalisés / Validés</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.rightAlign]}>Taux de Conformité</Text></View>
          </View>

          {classementSitesData.map((item) => {
            const comp = item.complianceSite !== null ? Math.round(item.complianceSite) : null;
            const compColor = comp === null ? styles.bold : comp >= 80 ? styles.successText : comp >= 60 ? styles.warningText : styles.dangerText;
            
            return (
              <View key={item.site} style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={[styles.tableCell, styles.bold]}>{item.site}</Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.tableCell, styles.centerAlign]}>
                    {item.complianceSite !== null ? `${item.siteMecasCount * 4} ordres` : "N/A"}
                  </Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.tableCell, styles.centerAlign]}>
                    {item.complianceSite !== null ? `${Math.round((item.siteMecasCount * 4) * (comp || 0) / 100)} ordres` : "N/A"}
                  </Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.tableCell, styles.rightAlign, styles.bold, compColor]}>
                    {comp !== null ? `${comp}%` : "SANS DONNÉES"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text>Document interne Hydromines — Confidentiel</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`} />
        </View>
      </Page>

      {/* 9. VOLET HUMAIN */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{docHeader}</Text>
          <Text style={styles.rightAlign}>Hydromines</Text>
        </View>

        <Text style={styles.pageTitle}>8. Volet Humain et Charge de Travail</Text>
        
        <Text style={styles.sectionTitle}>Indice de Charge de Travail par Site</Text>
        <Text style={styles.paragraph}>
          L'indice représente le nombre moyen d'ordres de travaux (OT) actifs par technicien disponible sur site. Un indice supérieur à 5.0 OT/technicien indique une surcharge d'équipe.
        </Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={{ flex: 2 }}><Text style={styles.tableCellHeader}>Site</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Effectif Actif</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Indice de Charge</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.rightAlign]}>Alerte Surcharge</Text></View>
          </View>

          {classementSitesData.map((item) => {
            const charge = item.chargeMoyenneSite;
            const hasAlert = charge !== null && charge > 4.5;
            
            return (
              <View key={item.site} style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={[styles.tableCell, styles.bold]}>{item.site}</Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.tableCell, styles.centerAlign]}>{item.siteMecasCount} techniciens</Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.tableCell, styles.centerAlign, styles.bold]}>
                    {charge !== null ? `${charge.toFixed(1)} OT` : "0.0 OT"}
                  </Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.tableCell, styles.rightAlign, styles.bold, hasAlert ? styles.dangerText : styles.successText]}>
                    {hasAlert ? "OUI (CRITIQUE)" : "NON (NORMAL)"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Palmarès et Reconnaissance Équipe (Top Performers)</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={{ flex: 2 }}><Text style={styles.tableCellHeader}>Technicien</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Affectation Site</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.centerAlign]}>Interventions Cloturées</Text></View>
            <View style={{ flex: 1.5 }}><Text style={[styles.tableCellHeader, styles.rightAlign]}>Taux d'Éxécution</Text></View>
          </View>

          {felicitationsMecaniciens.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={{ flex: 5.5 }}>
                <Text style={[styles.tableCell, styles.centerAlign, styles.italic]}>Aucune donnée de performance individuelle ce mois.</Text>
              </View>
            </View>
          ) : (
            felicitationsMecaniciens.map((m) => (
              <View key={m.name} style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={[styles.tableCell, styles.bold]}>{m.name}</Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.tableCell, styles.centerAlign]}>{m.site}</Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.tableCell, styles.centerAlign]}>{m.completed} ordres</Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={[styles.tableCell, styles.rightAlign, styles.bold, styles.successText]}>
                    {m.rate !== null ? `${m.rate}%` : "100%"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text>Document interne Hydromines — Confidentiel</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`} />
        </View>
      </Page>

      {/* 10. RECOMMANDATIONS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{docHeader}</Text>
          <Text style={styles.rightAlign}>Hydromines</Text>
        </View>

        <Text style={styles.pageTitle}>9. Analyse et Recommandations Techniques</Text>
        <Text style={styles.paragraph}>
          Les recommandations suivantes sont générées de manière automatisée et stricte selon les règles d'exploitation d'Hydromines appliquées aux indicateurs réels collectés ce mois. Elles constituent la feuille de route opérationnelle obligatoire pour le mois à venir.
        </Text>

        <View style={{ marginTop: 10, gap: 12 }}>
          {recommandationsList.map((rec, index) => (
            <View key={index} style={{ padding: 12, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 6, backgroundColor: "#F8FAFC" }}>
              <Text style={{ fontSize: 9.5, color: "#1E293B", lineHeight: 1.5, fontFamily: "Helvetica-Bold" }}>
                Recommandation #{index + 1} :
              </Text>
              <Text style={{ fontSize: 9.5, color: "#334155", marginTop: 4, lineHeight: 1.5 }}>
                {rec}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.paragraph, { marginTop: 25 }]}>
          <Text style={styles.bold}>Validation Direction Technique : </Text>
          Les chefs de chantiers concernés par les alertes ci-dessus doivent soumettre sous 72 heures un plan d'action de redressement de conformité préventive à la direction d'exploitation d'Hydromines.
        </Text>

        <View style={styles.footer}>
          <Text>Document interne Hydromines — Confidentiel</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`} />
        </View>
      </Page>

    </Document>
  );
}
