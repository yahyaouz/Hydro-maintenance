# Directives de Développement & Guide Architectural - Hydromines Espace Maintenance

Ce document définit les normes d'architecture, de sécurité, de performance et de développement applicables à ce projet. Tout agent de codage ou développeur intervenant sur ce projet doit respecter scrupuleusement ces règles.

---

## 1. Principes Fondamentaux d'Architecture

L'application est une GMAO (Gestion de Maintenance Assistée par Ordinateur) hautement résiliente conçue pour fonctionner dans des environnements industriels et isolés (mines). Elle repose sur un fonctionnement déconnecté (Offline-First) robuste.

### 🛑 REGLE ABSOLUE : Pas d'écritures directes vers Firestore dans l'UI
Les composants React de l'interface utilisateur ne doivent **jamais** appeler directement les fonctions d'écriture de Firestore (`addDoc`, `updateDoc`, `deleteDoc`, `setDoc`) pour les opérations de mutation de données métiers.
- **Pourquoi :** L'écriture directe contourne le gestionnaire de file d'attente hors-ligne (`OfflineQueueManager`), rompt la journalisation des audits (`auditLogger`) et empêche l'application des règles de validation de cohérence de données.
- **Solution technique :** Utiliser systématiquement l'abstraction centralisée offerte par `dbService` (dans `/src/services/firestoreService.ts`). Toutes les créations, mises à jour, transitions d'état et suppressions de Bons de Travail, pannes, ou engins doivent transiter par `dbService` ou par la queue hors-ligne si l'appareil n'a pas de réseau.

---

## 2. Abstractions Clés & Services

### 2.1 Services de Base de Données (`dbService`)
Situé dans `/src/services/firestoreService.ts`, ce service centralise :
- L'accès typé et sécurisé aux collections Firestore (`engines`, `workOrders`, etc.).
- L'injection automatique d'identifiants d'idempotence (`idempotencyKey`) pour éviter la duplication des requêtes réseau lors des reconnexions.
- La normalisation et l'adaptation des documents via des adapters (`normalizeWorkOrder`, `normalizeEngin`).

### 2.2 Gestion de la Queue Hors-ligne (`OfflineQueueManager`)
Situé dans `/src/services/offlineQueueManager.ts`, ce service gère :
- La sérialisation des actions de l'utilisateur lorsque le réseau est indisponible.
- Le stockage local des actions en attente de synchronisation.
- Le rejeu automatique ou manuel (`replayAction`) via les endpoints sécurisés de `dbService` une fois la connectivité restaurée.
- La gestion des conflits et le suivi du lignage des documents (`lineageId`).

### 2.3 Journalisation d'Audit (`auditLogger`)
Situé dans `/src/services/auditLogger.ts` :
- Chaque modification sensible (création de bon de travail, signalement de panne, mise à jour de statut, etc.) doit être enregistrée dans un journal d'audit (`auditLogs`).
- L'audit doit comporter : `userId`, `userRole`, `siteId`, `actionType`, `targetId`, `timestamp` et les détails de la mutation.

---

## 3. Sécurité & Contrôle d'Accès

- **Respect strict des rôles :** Les opérations de mutation doivent être contraintes selon le profil utilisateur (ADMIN, MECANICIEN, PILOTE, PLANIFICATEUR).
- **Règles Firestore (`firestore.rules`) :** Les règles de sécurité de la base de données Firestore à la racine du projet doivent être maintenues en parfaite synchronisation avec les types applicatifs pour rejeter toute opération frauduleuse ou incorrectement documentée directement au niveau serveur.

---

## 4. Gestion des Erreurs et Monitoring

- **Monitoring centralisé :** Les exceptions et erreurs levées au cours des transactions doivent être transmises à `errorMonitoring` (dans `/src/services/errorMonitoring.ts`).
- **Standardisation :** Toujours utiliser `handleFirestoreError` de `firestoreService` pour consigner et formater les erreurs Firestore.
- **Pas de plantage silencieux :** L'UI doit intégrer des barrières de sécurité visuelles (`ErrorBoundary`) et notifier l'utilisateur de manière ergonomique (via des toasts informatifs, sans jargon technique).

---

## 5. Performance React et Prévention des Re-renders Infinis

- **Stabilisation des Hooks (`useEffect`) :** Ne jamais inclure de tableaux, d'objets complexes ou de fonctions non mémoïsées dans les tableaux de dépendances de vos hooks `useEffect` (ceci cause des re-renders infinis qui saturent le processeur et la bande passante Firestore).
- **Utilisation de Primitive Values :** Préférer l'usage de chaînes de caractères, de nombres ou de booléens dans les dépendances, ou stabiliser les variables via `useMemo` ou `useCallback`.
- **Lecture Réactive :** Utiliser de préférence le hook personnalisé `useCollection` pour écouter les mises à jour Firestore en temps réel, tout en bénéficiant de la gestion automatique des abonnements et de la mémoire.

---

## 6. Ligne de Conduite de l'UI & UX (Anti-AI Slop)

- **Esthétique Professionnelle & Humanisée :** L'interface utilisateur doit rester sobre, propre, hautement lisible et digne d'une application industrielle fiable.
- **Pas de faux logs ni d'indicateurs de décorations vides :** Éviter l'ajout d'informations de débogage ou de pseudo-télémétries système en temps réel (ex: ne pas afficher `PORT: 3000`, `STATUS: ONLINE`, des lignes de logs serveurs artificiels, ou de faux écrans de console) sauf si cela a été explicitement demandé.
- **Champs tactiles adaptés :** Garantir que les cibles tactiles font au moins 44px (sur mobile) pour assurer l'utilisabilité sur les tablettes industrielles des mécaniciens en atelier ou sur site.

---

## 7. Règle absolue de collaboration avec l'Utilisateur

- **Prise d'initiative autorisée par défaut :** L'agent doit appliquer directement les modifications demandées sans demander de validation préalable, à moins que l'utilisateur n'ait explicitement demandé de patienter pour sa validation.
- **Clarté technique :** Expliquer brièvement les modifications apportées et leur intérêt fonctionnel lors de la livraison.
