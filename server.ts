import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Gemini Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes

  // 1. Event Bus & MQTT Broker Service
  interface EventMessage {
    id: string;
    time: string;
    topic: string;
    payload: string;
    type: 'PUB' | 'SUB' | 'ASYNC';
  }

  let eventBrokerQueue: EventMessage[] = [
    { id: "evt-01", time: "13:14:01", topic: "smi/st7_01/telemetry", payload: "{\"oil_temp\":88,\"vibration\":3.4}", type: "PUB" },
    { id: "evt-02", time: "13:14:02", topic: "smi/st7_01/engine_rpm", payload: "{\"rpm\":1850}", type: "PUB" },
    { id: "evt-03", time: "13:14:03", topic: "rules/evaluator", payload: "Match alarms: STATUS_NORMAL", type: "ASYNC" },
    { id: "evt-04", time: "13:25:12", topic: "oumejrane/st2g_03/hydraulic", payload: "{\"pressure\":168,\"valves\":[1,0,1]}", type: "PUB" },
    { id: "evt-05", time: "13:26:44", topic: "security/gateway/modbus", payload: "{\"ip\":\"10.14.2.19\",\"action\":\"READ_PLC_REGISTER\"}", type: "SUB" }
  ];

  app.get("/api/event-bus/messages", (req, res) => {
    res.json({ success: true, count: eventBrokerQueue.length, messages: eventBrokerQueue });
  });

  app.post("/api/event-bus/publish", (req, res) => {
    try {
      const { topic, payload, type } = req.body;
      const newMsg: EventMessage = {
        id: `evt-gen-${Math.floor(Math.random() * 90000) + 10000}`,
        time: new Date().toLocaleTimeString("fr-FR"),
        topic: topic || "telemetry/dynamic",
        payload: typeof payload === "object" ? JSON.stringify(payload) : String(payload),
        type: type || "PUB"
      };
      
      eventBrokerQueue.unshift(newMsg);
      if (eventBrokerQueue.length > 50) {
        eventBrokerQueue = eventBrokerQueue.slice(0, 50);
      }
      res.json({ success: true, message: "Événement publié au broker MQTT", data: newMsg });
    } catch (err: any) {
      res.status(400).json({ error: "Erreur de publication", details: err.message });
    }
  });

  app.post("/api/event-bus/clear", (req, res) => {
    eventBrokerQueue = [];
    res.json({ success: true, message: "Queue du broker vidée" });
  });

  // 2. Multi-site Distributed Architecture Synchronization
  interface SiteNode {
    id: string;
    cityName: string;
    status: "LOCAL_OPTIMAL" | "SYNCING" | "OFFLINE_STANDALONE";
    latencyMs: number;
    pendingSyncQueueCount: number;
    reliabilityScore: number;
    lastReplicationTimestamp: string;
  }

  const siteNodesDatabase: SiteNode[] = [
    { id: "SMI", cityName: "Imiter (Axe Solaire)", status: "LOCAL_OPTIMAL", latencyMs: 34, pendingSyncQueueCount: 0, reliabilityScore: 99.8, lastReplicationTimestamp: "2026-05-20T13:10:00Z" },
    { id: "OUMEJRANE", cityName: "Oumejrane (Axe Cuivre/Plomb)", status: "LOCAL_OPTIMAL", latencyMs: 58, pendingSyncQueueCount: 0, reliabilityScore: 98.4, lastReplicationTimestamp: "2026-05-20T13:05:00Z" },
    { id: "KOUDIA", cityName: "Koudia Al Aicha (Axe Plomb/Zinc)", status: "LOCAL_OPTIMAL", latencyMs: 42, pendingSyncQueueCount: 0, reliabilityScore: 99.2, lastReplicationTimestamp: "2026-05-20T13:15:00Z" },
    { id: "BOU-AZZER", cityName: "Bou-Azzer (Axe Cobalt)", status: "LOCAL_OPTIMAL", latencyMs: 40, pendingSyncQueueCount: 0, reliabilityScore: 99.1, lastReplicationTimestamp: "2026-07-03T15:44:36Z" },
    { id: "OUANSIMI", cityName: "Ouansimi (Axe Or/Argent)", status: "LOCAL_OPTIMAL", latencyMs: 45, pendingSyncQueueCount: 0, reliabilityScore: 98.7, lastReplicationTimestamp: "2026-07-03T15:44:36Z" }
  ];

  app.get("/api/sites/nodes", (req, res) => {
    res.json({ success: true, nodes: siteNodesDatabase });
  });

  app.post("/api/sites/sync", (req, res) => {
    const { siteId } = req.body;
    const site = siteNodesDatabase.find(s => s.id === siteId);
    if (site) {
      site.status = "LOCAL_OPTIMAL";
      site.latencyMs = Math.floor(Math.random() * 40) + 15;
      site.pendingSyncQueueCount = 0;
      site.lastReplicationTimestamp = new Date().toISOString();
      res.json({ success: true, message: `Synchronisation réussie pour le site ${siteId}`, node: site });
    } else {
      res.status(404).json({ error: "Site non trouvé" });
    }
  });

  // 3. Maintenance Knowledge Graph Data
  app.get("/api/knowledge-graph", (req, res) => {
    const nodes = [
      { id: "st7_chassis", label: "Scooptram ST7", group: "machinery", desc: "Chargeur de mines lourdes 6.8t" },
      { id: "hydr_pump", label: "Rexroth Axiale", group: "subsystem", desc: "Pompe hydraulique principale circuit fermé" },
      { id: "deutz_engine", label: "Deutz TCD Diesel", group: "subsystem", desc: "Générateur thermique minier" },
      { id: "posi_stop", label: "Posi-Stop", group: "subsystem", desc: "Dispositif de sécurité freinage hydraulique" },
      { id: "oil_cavitation", label: "Cavitation Huile", group: "anomaly", desc: "Présence de bulles d'air entraînant chutes de couple" },
      { id: "temp_drift", label: "Surchauffe Carter", group: "anomaly", desc: "Dépassement de la température critique hydro de 105°C" },
      { id: "seal_rupture", label: "Usure Joint d'Arbre", group: "root-cause", desc: "Détérioration du polymère de frottement du joint axial" },
      { id: "loto_lockout", label: "Verrou LOTO", group: "compliance", desc: "Signalisation de coupure mécanique par cadenas physique" }
    ];

    const edges = [
      { from: "st7_chassis", to: "hydr_pump", rel: "CONTIENT" },
      { from: "st7_chassis", to: "deutz_engine", rel: "CONTIENT" },
      { from: "hydr_pump", to: "posi_stop", rel: "ALIMENTE" },
      { from: "hydr_pump", to: "oil_cavitation", rel: "PROVOQUE_SI_FLUID_LOW" },
      { from: "seal_rupture", to: "hydr_pump", rel: "PROVOQUE_FUITE" },
      { from: "oil_cavitation", to: "temp_drift", rel: "DECELERE_REFROIDISSEMENT" },
      { from: "loto_lockout", to: "hydr_pump", rel: "SÉCURISE_POUR_INTERVENTION" }
    ];

    res.json({ success: true, nodes, edges });
  });

  // 4. OT Cybersecurity Configuration and Threat Logs
  const cyberThreatLogs = [
    { time: "13:02:11", event: "Vérification cryptographique de firmware automate", unit: "PLC-A19-ST7", status: "VERIFIED", integrity: "100%" },
    { time: "12:44:02", event: "Tentative de lecture registre non-autorisée", unit: "SCADA-GATEWAY-02", status: "BLOCKED", integrity: "SEGMENT_ISOLATED" },
    { time: "11:15:30", event: "Rotation des jetons rotatifs de sécurité", unit: "KEY-SEC-STORE", status: "ROTATED", integrity: "ACTIVE" }
  ];

  app.get("/api/cybersecurity/state", (req, res) => {
    res.json({
      success: true,
      otSegmentIsolation: true,
      activeThreatLevel: "LOW",
      scadaEncrypted: true,
      mfaRequired: true,
      integrityLogs: cyberThreatLogs
    });
  });

  app.post("/api/cybersecurity/mfa-verify", (req, res) => {
    const { token, role } = req.body;
    // Simulate interactive OTP verify
    if (token && token.length === 6) {
      res.json({ 
        success: true, 
        message: `MFA Jeton valide ré-authentifié pour l'accès de classe '${role}'`,
        sessionExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      });
    } else {
      res.status(400).json({ error: "Code d'authentification MFA incorrect ou expiré" });
    }
  });

  app.post("/api/agent/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: `Tu es l'Expert Mécanicien Minier "Hydromines IA".
            Tes compétences incluent :
            - Moteurs diesel miniers lourds (Caterpillar, Cummins, Deutz).
            - Systèmes hydrauliques haute pression (pompes, vérins, distributeurs).
            - Transmissions et trains de roulement miniers.
            - Diagnostic de pannes complexes (surchauffe, perte de puissance, fumée).
            - Maintenance préventive et corrective sur engins (ST2D, ST2G, ST7, etc.).
            
            Ton ton doit être professionnel, technique, précis et sécuritaire. 
            Quand on te pose une question sur une panne :
            1. Analyse les symptômes.
            2. Propose des causes probables par ordre de priorité.
            3. Donne une procédure de diagnostic étape par étape.
            4. Recommande des pièces à vérifier ou changer.
            5. Ajoute des consignes de sécurité si nécessaire (arrêt immédiat, consignation).
            
            Réponds toujours en Français.`,
          temperature: 0.7,
        }
      });

      const result = await chat.sendMessage({ message });
      res.json({ response: result.text });
    } catch (error: any) {
      console.error("Agent IA Error:", error);
      const status = error.status || 500;
      const message = error.message?.includes("quota") 
        ? "Quotas IA épuisés. Veuillez patienter quelques secondes." 
        : "Erreur Agent IA";
      res.status(status).json({ error: message });
    }
  });

  app.post("/api/ai/analyze-maintenance", async (req, res) => {
    try {
      const { data, context } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Analyses cette situation de maintenance minière : ${data}. Contexte : ${context}. Fournis un diagnostic et des conseils pratiques.`,
        config: {
          temperature: 0.7,
        }
      });
      res.json({ analysis: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Erreur d'analyse IA" });
    }
  });

  app.post("/api/ai/vision-analyze", async (req, res) => {
    try {
      const { image, prompt } = req.body; // image is base64
      
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: image,
        },
      };
      
      const textPart = {
        text: prompt || "Analyses cette photo technique d'un composant minier. Identifie les anomalies visibles (fuites, usure, fissures) et propose une action corrective.",
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          temperature: 0.4,
        }
      });

      res.json({ analysis: response.text });
    } catch (error) {
      console.error("Vision IA Error:", error);
      res.status(500).json({ error: "Erreur d'analyse Vision IA" });
    }
  });

  // Endpoint API pour vérifier les retards de tournée (appelable manuellement ou par cron)
  app.post("/api/systematic-alerts/check", async (req, res) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      // Logique de vérification des mécaniciens sans tournée
      // Retourner la liste des mécaniciens en retard
      const delayedMechanics = [
        { id: "meca-01", name: "Ahmed Mansouri", siteId: "SMI", status: "NON_FAIT", poste: "Poste 1" },
        { id: "meca-03", name: "Youssef Ait", siteId: "OUMEJRANE", status: "NON_FAIT", poste: "Poste 1" }
      ];
      res.json({ 
        success: true, 
        date: todayStr, 
        alertsTriggered: delayedMechanics 
      });
    } catch (err) {
      res.status(500).json({ error: "Erreur vérification alertes" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HYDROMINES server running on http://localhost:${PORT}`);
  });
}

startServer();
