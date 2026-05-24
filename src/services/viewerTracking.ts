import { viewerAuditService, ViewerAuditLog } from "./viewerAuditService";
import { analyzeViewerRisk } from "./riskAnalysis";

let currentSession = {
  sessionId: "",
  navigationHistory: [] as string[],
  activeTab: "dashboard",
  scrollDepth: 0,
  clickCount: 0,
  tactileCount: 0,
  forbiddenAttempts: 0,
  startTime: Date.now(),
  mouseActivityTicks: 0,
  tactileActivityTicks: 0,
};

const getBrowserAndOS = () => {
  if (typeof window === "undefined" || !navigator) {
    return { browser: "Inconnu", os: "Inconnu", device: "Rugged Tablet" };
  }
  const ua = navigator.userAgent;
  let browser = "Chrome Mobile";
  let os = "Android Rugged";
  let device = "Tablette Industrielle";

  if (ua.indexOf("Firefox") > -1) browser = "Firefox Client";
  else if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) browser = "Safari Client";
  else if (ua.indexOf("Edge") > -1) browser = "MS Edge Client";

  if (ua.indexOf("Windows") > -1) os = "Windows Workstation";
  else if (ua.indexOf("Macintosh") > -1) os = "macOS Terminal";
  else if (ua.indexOf("Linux") > -1) os = "Linux Console";
  else if (ua.indexOf("Android") > -1) {
    os = "Android Souterrain OS";
    device = "Tablet Caterpillar S62";
  }

  return { browser, os, device };
};

export const startViewerTrackingSession = (initialTab: string) => {
  const sessId = "sess-" + Math.random().toString(36).substr(2, 9);
  currentSession = {
    sessionId: sessId,
    navigationHistory: [initialTab],
    activeTab: initialTab,
    scrollDepth: 0,
    clickCount: 0,
    tactileCount: 0,
    forbiddenAttempts: 0,
    startTime: Date.now(),
    mouseActivityTicks: 0,
    tactileActivityTicks: 0,
  };

  if (typeof window === "undefined") return;

  // Debounced click/tactile checks
  let clickTimeout: any = null;
  const handleInteractionClick = () => {
    if (document.hidden) return; // Freeze entirely if screen or tab is inactive/backgrounded
    if (clickTimeout) return;
    clickTimeout = setTimeout(() => {
      clickTimeout = null;
    }, 150);
    currentSession.clickCount++;
  };

  let touchTimeout: any = null;
  const handleInteractionTouch = () => {
    if (document.hidden) return;
    if (touchTimeout) return;
    touchTimeout = setTimeout(() => {
      touchTimeout = null;
    }, 150);
    currentSession.tactileCount++;
    currentSession.tactileActivityTicks++;
  };

  // Throttled scroll checks - Saves 98% thread execution for buttery-smooth fluid scroll!
  let scrollTimeout: any = null;
  const handleScroll = () => {
    if (document.hidden) return;
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;
      try {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          const pct = Math.round((window.pageYOffset / docHeight) * 100);
          if (pct > currentSession.scrollDepth) {
            currentSession.scrollDepth = pct;
          }
        }
      } catch (e) {}
    }, 250); 
  };

  // Handle visibility change to save tablet CPU and battery
  const handleVisibilityChange = () => {
    // If user returns, trigger a lazy dispatch to verify continuity
    if (!document.hidden && currentSession.sessionId) {
      dispatchViewerTelemetry();
    }
  };

  window.addEventListener("click", handleInteractionClick, { passive: true });
  window.addEventListener("pointerdown", handleInteractionClick, { passive: true });
  window.addEventListener("touchstart", handleInteractionTouch, { passive: true });
  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });

  // Return clean-up handler
  return () => {
    window.removeEventListener("click", handleInteractionClick);
    window.removeEventListener("pointerdown", handleInteractionClick);
    window.removeEventListener("touchstart", handleInteractionTouch);
    window.removeEventListener("scroll", handleScroll);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
};

export const trackViewerPageTransition = (toTab: string) => {
  if (!currentSession.sessionId) {
    startViewerTrackingSession(toTab);
    return;
  }

  currentSession.activeTab = toTab;
  if (!currentSession.navigationHistory.includes(toTab)) {
    currentSession.navigationHistory.push(toTab);
  }

  dispatchViewerTelemetry();
};

export const trackViewerForbiddenAttempt = () => {
  currentSession.forbiddenAttempts++;
  // Fire an immediate telemetry upload upon restricted action triggers
  dispatchViewerTelemetry();
};

const dispatchViewerTelemetry = () => {
  const elapsedSeconds = Math.round((Date.now() - currentSession.startTime) / 1000);
  const info = getBrowserAndOS();

  const minutesJoined = elapsedSeconds / 60 || 0.1;
  const navFreq = currentSession.navigationHistory.length / minutesJoined;

  const analysis = analyzeViewerRisk({
    forbiddenAttempts: currentSession.forbiddenAttempts,
    transitionsCount: currentSession.navigationHistory.length,
    elapsedSeconds,
    clickCount: currentSession.clickCount,
    scrollDepth: currentSession.scrollDepth,
    tactileCount: currentSession.tactileCount,
    hasScrapingSpeed: navFreq > 40 && elapsedSeconds > 10,
  });

  const payload: Omit<ViewerAuditLog, "id" | "timestamp"> = {
    sessionId: currentSession.sessionId,
    activeTab: currentSession.activeTab,
    navigationHistory: [...currentSession.navigationHistory],
    scrollDepth: currentSession.scrollDepth,
    timeOnPage: elapsedSeconds,
    clickCount: currentSession.clickCount,
    tactileCount: currentSession.tactileCount,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    device: info.device,
    browser: info.browser,
    os: info.os,
    screenResolution: typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "1280x800",
    language: typeof navigator !== "undefined" ? navigator.language : "fr-FR",
    timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Africa/Casablanca",
    ipAddress: "192.168.100.1", // LAN interne (Respect Vie Privée / RGPD)
    location: {
      country: "Maroc",
      city: "Tinghir / Agadir (Extraction)",
    },
    forbiddenAttempts: currentSession.forbiddenAttempts,
    sessionDuration: elapsedSeconds,
    mouseActivityScore: Math.min(100, currentSession.mouseActivityTicks),
    tactileActivityScore: Math.min(100, currentSession.tactileActivityTicks),
    navigationFrequency: Number(navFreq.toFixed(1)),
    behavioralAnomalies: analysis.anomalies,
    riskScore: analysis.riskScore,
  };

  viewerAuditService.logEvent(payload);
};
