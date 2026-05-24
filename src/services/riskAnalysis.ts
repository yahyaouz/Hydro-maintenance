import { ViewerAuditLog } from "./viewerAuditService";

export interface RiskAnalysisResult {
  riskScore: "NORMAL" | "SURVEILLANCE" | "SUSPECT" | "CRITIQUE";
  anomalies: string[];
}

export const analyzeViewerRisk = (
  metrics: {
    forbiddenAttempts: number;
    transitionsCount: number;
    elapsedSeconds: number;
    clickCount: number;
    scrollDepth: number;
    tactileCount: number;
    hasMultiTabs?: boolean;
    hasScrapingSpeed?: boolean;
  }
): RiskAnalysisResult => {
  const anomalies: string[] = [];
  let scorePoints = 0;

  const {
    forbiddenAttempts,
    transitionsCount,
    elapsedSeconds,
    clickCount,
    scrollDepth,
    tactileCount,
    hasMultiTabs,
    hasScrapingSpeed,
  } = metrics;

  // Rule 1: Attempting forbidden operations (e.g. creating BT, editing engine parameters)
  if (forbiddenAttempts > 0) {
    if (forbiddenAttempts >= 3) {
      scorePoints += 60;
      anomalies.push(`Tentatives répétées d'écriture interdites (${forbiddenAttempts} essaies)`);
    } else {
      scorePoints += 30;
      anomalies.push("Tentatives d'écriture bloquées en mode Consultation");
    }
  }

  // Rule 2: Hyperactive Navigation (Robotic Speed)
  const durationMinutes = elapsedSeconds / 60 || 0.1;
  const navigationFrequency = transitionsCount / durationMinutes;
  
  if (navigationFrequency > 45 && elapsedSeconds > 15) {
    scorePoints += 45;
    anomalies.push(`Fréquence de navigation robotique (${navigationFrequency.toFixed(1)} changements/min)`);
  } else if (navigationFrequency > 25 && elapsedSeconds > 15) {
    scorePoints += 20;
    anomalies.push(`Activité de navigation élevée (${navigationFrequency.toFixed(1)} changements/min)`);
  }

  // Rule 3: Click Spamming / Scraping
  if (clickCount > 150 && elapsedSeconds < 30) {
    scorePoints += 40;
    anomalies.push(`Clics frénétiques suspectés de Scraping (${clickCount} clics en moins de 30s)`);
  } else if (clickCount > 80 && elapsedSeconds < 60) {
    scorePoints += 15;
    anomalies.push(`Cadence de clics inhabituelle (${clickCount} clics/minute)`);
  }

  // Rule 4: Suspicious Simultaneous Tabs
  if (hasMultiTabs) {
    scorePoints += 25;
    anomalies.push("Multi-onglets simultanés actifs avec la même session");
  }

  // Rule 5: Pure speed crawling (scraping speed)
  if (hasScrapingSpeed) {
    scorePoints += 50;
    anomalies.push("Pattern de scanning rapide détecté : Vitesse automatisée");
  }

  // Final Grade selection
  let riskScore: "NORMAL" | "SURVEILLANCE" | "SUSPECT" | "CRITIQUE" = "NORMAL";
  if (scorePoints >= 70) {
    riskScore = "CRITIQUE";
  } else if (scorePoints >= 40) {
    riskScore = "SUSPECT";
  } else if (scorePoints >= 15) {
    riskScore = "SURVEILLANCE";
  }

  return {
    riskScore,
    anomalies,
  };
};
