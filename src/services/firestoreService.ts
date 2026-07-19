import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  writeBatch,
  runTransaction,
  onSnapshot
} from 'firebase/firestore';
import { 
  ENGIN_STATUS, 
  WORKORDER_STATUS, 
  PRIORITY_LEVELS, 
  OfflineAction 
} from '../types';

// ==================================================================== 
// THE HARDENED ERROR HANDLING SYSTEM (Objective 3 of Firebase Skill)
// ====================================================================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Hardened Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==================================================================== 
// Adapters to map between Firestore raw docs and application records
// ====================================================================
export const firestoreAdapters = {
  // Maps engine doc standardizing to normalized 'enginId'
  normalizeEngin: (docId: string, data: any) => ({
    enginId: docId,
    id: docId,
    code: data.code || docId,
    name: data.name || '',
    type: data.type || '',
    status: (data.status as ENGIN_STATUS) || ENGIN_STATUS.DISPONIBLE,
    siteId: data.siteId || 'SMI',
    hours: Number(data.hours || 0),
    latestFuelLevel: Number(data.latestFuelLevel || 100),
    lastInspectionDate: data.lastInspectionDate || '',
    updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt) : null,
    deleted: data.deleted === true
  }),

  // Maps work order (BT) standardizing to 'workOrderId'
  normalizeWorkOrder: (docId: string, data: any) => ({
    workOrderId: docId,
    id: docId,
    title: data.title || '',
    machineCode: data.machineCode || data.enginId || '',
    enginId: data.enginId || data.machineCode || '',
    severity: (data.severity as PRIORITY_LEVELS) || PRIORITY_LEVELS.MINEUR,
    status: (data.status as WORKORDER_STATUS) || WORKORDER_STATUS.OUVERT,
    assignedTech: data.assignedTech || '',
    creationDate: data.creationDate || '',
    createdBy: data.createdBy || '',
    durationHours: Number(data.durationHours || 0),
    costEst: Number(data.costEst || 0),
    history: Array.isArray(data.history) ? data.history : [],
    idempotencyKey: data.idempotencyKey || null,
    updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt) : null,
    deleted: data.deleted === true,
    replacedParts: Array.isArray(data.replacedParts) ? data.replacedParts : [],
    checklist: Array.isArray(data.checklist) ? data.checklist : []
  }),

  // Maps anomaly or reported panne to normalized 'panneId'
  normalizeAnomalie: (docId: string, data: any) => ({
    panneId: docId,
    id: docId,
    title: data.title || '',
    machineCode: data.machineCode || data.enginId || '',
    enginId: data.enginId || data.machineCode || '',
    reportedBy: data.reportedBy || '',
    reportedDate: data.reportedDate || '',
    severity: (data.severity as PRIORITY_LEVELS) || PRIORITY_LEVELS.MINEUR,
    status: data.status || 'OUVERT',
    resolvedDate: data.resolvedDate || '',
    idempotencyKey: data.idempotencyKey || null,
    updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt) : null,
    deleted: data.deleted === true
  })
};

// ==================================================================== 
// Centralized, Decoupled Database & Firestore Execution State-Machine
// ====================================================================
export const dbService = {
  // Engins collection operations
  engines: {
    async fetchAll(siteId: string) {
      const collRef = collection(db, 'engins');
      try {
        const q = siteId === 'TOUS' 
          ? query(collRef) 
          : query(collRef, where('siteId', '==', siteId));
        
        const snapshot = await getDocs(q);
        return snapshot.docs
          .map(doc => firestoreAdapters.normalizeEngin(doc.id, doc.data()))
          .filter(e => !e.deleted);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'engins');
        return [];
      }
    },

    async fetchPage(siteId: string, limitNum: number = 30, lastVisibleDoc?: DocumentSnapshot) {
      const collRef = collection(db, 'engins');
      try {
        const constraints: any[] = [];
        if (siteId !== 'TOUS') {
          constraints.push(where('siteId', '==', siteId));
        }
        constraints.push(orderBy('updatedAt', 'desc'));
        if (lastVisibleDoc) {
          constraints.push(startAfter(lastVisibleDoc));
        }
        constraints.push(limit(limitNum));

        const q = query(collRef, ...constraints);
        const snapshot = await getDocs(q);
        const items = snapshot.docs
          .map(doc => firestoreAdapters.normalizeEngin(doc.id, doc.data()))
          .filter(item => !item.deleted);
        return {
          items,
          lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'engins_paginated');
        return { items: [], lastDoc: null };
      }
    },
    
    async get(id: string) {
      try {
        const ref = doc(db, 'engins', id);
        const res = await getDoc(ref);
        return res.exists() ? firestoreAdapters.normalizeEngin(res.id, res.data()) : null;
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `engins/${id}`);
        return null;
      }
    },

    async updateStatus(id: string, status: ENGIN_STATUS) {
      const ref = doc(db, 'engins', id);
      try {
        let statutVal = 'actif';
        let dispoVal = 100;
        if (status === ENGIN_STATUS.EN_PANNE) {
          statutVal = 'panne';
          dispoVal = 0;
        } else if (status === ENGIN_STATUS.EN_MAINTENANCE) {
          statutVal = 'maintenance';
          dispoVal = 0;
        } else if (status === ENGIN_STATUS.RESTREINT) {
          statutVal = 'actif';
          dispoVal = 50;
        }
        await updateDoc(ref, { 
          status: status,
          statut: statutVal,
          dispo: dispoVal,
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `engins/${id}`);
      }
    },

    async setHoursAndFuel(id: string, hours: number, fuel: number) {
      const ref = doc(db, 'engins', id);
      try {
        await updateDoc(ref, {
          hours: Number(hours),
          latestFuelLevel: Number(fuel),
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `engins/${id}`);
      }
    },

    async update(id: string, fields: any) {
      const ref = doc(db, 'engins', id);
      try {
        await updateDoc(ref, {
          ...fields,
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `engins/${id}`);
      }
    },

    async create(id: string, data: any) {
      const ref = doc(db, 'engins', id);
      try {
        await setDoc(ref, {
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `engins/${id}`);
      }
    },

    async delete(id: string) {
      const ref = doc(db, 'engins', id);
      try {
        await deleteDoc(ref);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `engins/${id}`);
      }
    }
  },

  // WorkOrders / BT collection operations
  workOrders: {
    async fetchAll(siteId: string) {
      const collRef = collection(db, 'maintenanceTasks');
      try {
        const q = siteId === 'TOUS' 
          ? query(collRef) 
          : query(collRef, where('siteId', '==', siteId));
        
        const snapshot = await getDocs(q);
        return snapshot.docs
          .map(doc => firestoreAdapters.normalizeWorkOrder(doc.id, doc.data()))
          .filter(wo => !wo.deleted);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'maintenanceTasks');
        return [];
      }
    },

    async fetchPage(siteId: string, limitNum: number = 35, lastVisibleDoc?: DocumentSnapshot) {
      const collRef = collection(db, 'maintenanceTasks');
      try {
        const constraints: any[] = [];
        if (siteId !== 'TOUS') {
          constraints.push(where('siteId', '==', siteId));
        }
        constraints.push(orderBy('updatedAt', 'desc'));
        if (lastVisibleDoc) {
          constraints.push(startAfter(lastVisibleDoc));
        }
        constraints.push(limit(limitNum));

        const q = query(collRef, ...constraints);
        const snapshot = await getDocs(q);
        const items = snapshot.docs
          .map(doc => firestoreAdapters.normalizeWorkOrder(doc.id, doc.data()))
          .filter(item => !item.deleted);
        return {
          items,
          lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
        };
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'maintenanceTasks_paginated');
        return { items: [], lastDoc: null };
      }
    },

    async create(workOrder: any, idempotencyKey: string) {
      try {
        if (idempotencyKey) {
          const q = query(collection(db, 'maintenanceTasks'), where('idempotencyKey', '==', idempotencyKey));
          const dupSnapshot = await getDocs(q);
          if (!dupSnapshot.empty) {
            console.warn("🔧 dbService.workOrders: Duplication détectée (idempotencyKey existe). Skip creation.");
            return dupSnapshot.docs[0].id;
          }
        }

        const collRef = collection(db, 'maintenanceTasks');
        const payload = {
          ...workOrder,
          deleted: false,
          idempotencyKey: idempotencyKey || `bt_${Math.random().toString(36).substring(2, 9)}`,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        const addedDoc = await addDoc(collRef, payload);
        return addedDoc.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'maintenanceTasks');
        return '';
      }
    },

    async createWithId(id: string, data: any) {
      const ref = doc(db, 'maintenanceTasks', id);
      try {
        await setDoc(ref, {
          ...data,
          deleted: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `maintenanceTasks/${id}`);
      }
    },

    async set(id: string, data: any) {
      const ref = doc(db, 'maintenanceTasks', id);
      try {
        await setDoc(ref, {
          ...data,
          updatedAt: Timestamp.now()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `maintenanceTasks/${id}`);
      }
    },

    async update(id: string, updates: any) {
      const ref = doc(db, 'maintenanceTasks', id);
      try {
        await updateDoc(ref, {
          ...updates,
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `maintenanceTasks/${id}`);
      }
    },

    async updateStatus(id: string, status: WORKORDER_STATUS, historyItem?: any) {
      const ref = doc(db, 'maintenanceTasks', id);
      const pathForWrite = `maintenanceTasks/${id}`;
      try {
        const updatePayload: any = { 
          status: status,
          updatedAt: Timestamp.now() 
        };
        
        if (historyItem) {
          updatePayload.history = historyItem;
        }
        
        await updateDoc(ref, updatePayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, pathForWrite);
      }
    },

    // Transactional flow which updates the workorder status and increments hours atomically
    async transitionStatusWithTransaction(orderId: string, status: WORKORDER_STATUS, changePayload: any, incrementHours?: { eId: string, hoursToAdd: number }) {
      const orderRef = doc(db, 'maintenanceTasks', orderId);
      const path = `maintenanceTasks/${orderId}`;
      try {
        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) {
            throw new Error("Le Bon de Travail n'existe pas.");
          }
          
          const orderData = orderSnap.data();
          if (orderData.status === 'CLOS') {
            throw new Error("Modification interdite : le BT est CLOS.");
          }
          
          transaction.update(orderRef, {
            ...changePayload,
            status,
            updatedAt: Timestamp.now()
          });
          
          if (incrementHours && incrementHours.eId) {
            const engineRef = doc(db, 'engins', incrementHours.eId);
            const engineSnap = await transaction.get(engineRef);
            if (engineSnap.exists()) {
              const currentHours = Number(engineSnap.data().hours || 0);
              transaction.update(engineRef, {
                hours: currentHours + Number(incrementHours.hoursToAdd),
                updatedAt: Timestamp.now()
              });
            }
          }
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    },

    // Batched write strategy for closing multiple workorders simultaneously
    async batchUpdateStatus(ids: string[], status: WORKORDER_STATUS) {
      const batchRef = writeBatch(db);
      try {
        for (const id of ids) {
          const ref = doc(db, 'maintenanceTasks', id);
          batchRef.update(ref, {
            status,
            updatedAt: Timestamp.now()
          });
        }
        await batchRef.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'maintenanceTasks_batch');
      }
    },

    // Soft delete implementation for compliant audits
    async delete(id: string) {
      const ref = doc(db, 'maintenanceTasks', id);
      try {
        await updateDoc(ref, {
          deleted: true,
          deletedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `maintenanceTasks/${id}`);
      }
    }
  },

  // Audit trailing collection
  auditLogs: {
    async create(log: any) {
      const collRef = collection(db, 'auditLogs');
      try {
        const payload = {
          ...log,
          timestamp: log.timestamp || Timestamp.now(),
          deleted: false
        };
        const ref = await addDoc(collRef, payload);
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'auditLogs');
        return '';
      }
    }
  },

  // Global LOTO Locks (HSE High-Safety Critical Verifications)
  lotoLocks: {
    async createOrUpdateLock(lockId: string, payload: {
      machineCode: string;
      lotoLocked: boolean;
      lotoOwner: string;
      lotoStartedAt: string;
      lotoReleasedAt: string | null;
      lotoWorkOrderId: string;
      lotoSupervisorValidation: boolean;
      lotoDetails: string;
      siteId: string;
    }) {
      const lockRef = doc(db, 'lotoLocks', lockId);
      try {
        await setDoc(lockRef, {
          ...payload,
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `lotoLocks/${lockId}`);
      }
    },

    async releaseLock(lockId: string, payload: {
      lotoReleasedAt: string;
      lotoDetails: string;
      siteId: string;
    }) {
      const lockRef = doc(db, 'lotoLocks', lockId);
      try {
        await updateDoc(lockRef, {
          lotoLocked: false,
          lotoReleasedAt: payload.lotoReleasedAt,
          lotoDetails: payload.lotoDetails,
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `lotoLocks/${lockId}`);
      }
    },

    onSyncLocks(siteId: string, onUpdate: (locks: Record<string, { statutLOTO: "ACTIF" | "INACTIF"; lotoDetails?: string; details?: any }>) => void) {
      const collRef = collection(db, 'lotoLocks');
      const q = siteId === 'TOUS' 
        ? query(collRef) 
        : query(collRef, where('siteId', '==', siteId));
      
      return onSnapshot(q, (snapshot) => {
        const locksMap: Record<string, any> = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          locksMap[doc.id] = {
            statutLOTO: data.lotoLocked ? "ACTIF" : "INACTIF",
            lotoDetails: data.lotoLocked ? (data.lotoDetails || `🔐 CADENASSÉ par ${data.lotoOwner}`) : "",
            details: data
          };
        });
        onUpdate(locksMap);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'lotoLocks_sync');
      });
    },

    async fetchLocks(siteId: string) {
      const collRef = collection(db, 'lotoLocks');
      try {
        const q = siteId === 'TOUS'
          ? query(collRef)
          : query(collRef, where('siteId', '==', siteId));
        const snapshot = await getDocs(q);
        const locksMap: Record<string, any> = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          locksMap[doc.id] = {
            statutLOTO: data.lotoLocked ? "ACTIF" : "INACTIF",
            lotoDetails: data.lotoLocked ? (data.lotoDetails || `🔐 CADENASSÉ par ${data.lotoOwner}`) : "",
            details: data
          };
        });
        return locksMap;
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'lotoLocks');
        return {};
      }
    }
  },

  // Demandes d'Intervention (DI) sub-system (Objective 1 & 2)
  demandesIntervention: {
    async create(di: any) {
      const collRef = doc(db, 'demandesIntervention', di.id);
      try {
        await setDoc(collRef, {
          ...di,
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `demandesIntervention/${di.id}`);
      }
    },

    async updateStatus(diId: string, status: string, comment?: string, convertedToOtId?: string) {
      const ref = doc(db, 'demandesIntervention', diId);
      try {
        const updates: Record<string, any> = { status, updatedAt: Timestamp.now() };
        if (comment !== undefined) updates.comment = comment;
        if (convertedToOtId !== undefined) updates.convertedToOtId = convertedToOtId;
        await updateDoc(ref, updates);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `demandesIntervention/${diId}`);
      }
    },

    onSyncDIs(siteId: string, onUpdate: (dis: any[]) => void) {
      const collRef = collection(db, 'demandesIntervention');
      const q = siteId === 'TOUS' 
        ? query(collRef) 
        : query(collRef, where('siteId', '==', siteId));
      
      return onSnapshot(q, (snapshot) => {
        const dis: any[] = [];
        snapshot.forEach((doc) => {
          dis.push(doc.data());
        });
        onUpdate(dis);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'demandesIntervention_sync');
      });
    },

    async fetchDIs(siteId: string) {
      const collRef = collection(db, 'demandesIntervention');
      try {
        const q = siteId === 'TOUS'
          ? query(collRef)
          : query(collRef, where('siteId', '==', siteId));
        const snapshot = await getDocs(q);
        const dis: any[] = [];
        snapshot.forEach((doc) => {
          dis.push(doc.data());
        });
        return dis;
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'demandesIntervention');
        return [];
      }
    }
  },

  // Rapports de Fin d'Intervention (RFI) sub-system (Objective 4 & 5)
  rapportsFinIntervention: {
    async create(rfi: any) {
      const collRef = doc(db, 'rapportsFinIntervention', rfi.id);
      try {
        await setDoc(collRef, {
          ...rfi,
          createdAt: rfi.createdAt || new Date().toISOString(),
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `rapportsFinIntervention/${rfi.id}`);
      }
    },

    onSyncRFIs(siteId: string, onUpdate: (rfis: any[]) => void) {
      const collRef = collection(db, 'rapportsFinIntervention');
      const q = siteId === 'TOUS' 
        ? query(collRef) 
        : query(collRef, where('siteId', '==', siteId));
      
      return onSnapshot(q, (snapshot) => {
        const rfis: any[] = [];
        snapshot.forEach((doc) => {
          rfis.push(doc.data());
        });
        onUpdate(rfis);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'rapportsFinIntervention_sync');
      });
    },

    async fetchRFIs(siteId: string) {
      const collRef = collection(db, 'rapportsFinIntervention');
      try {
        const q = siteId === 'TOUS'
          ? query(collRef)
          : query(collRef, where('siteId', '==', siteId));
        const snapshot = await getDocs(q);
        const rfis: any[] = [];
        snapshot.forEach((doc) => {
          rfis.push(doc.data());
        });
        return rfis;
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'rapportsFinIntervention');
        return [];
      }
    }
  },

  // Pannes collection operations
  pannes: {
    async create(panne: any) {
      try {
        const collRef = collection(db, 'pannes');
        const ref = await addDoc(collRef, {
          ...panne,
          createdAt: panne.createdAt || Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'pannes');
        return '';
      }
    },
    async update(id: string, updates: any) {
      try {
        const ref = doc(db, 'pannes', id);
        await updateDoc(ref, {
          ...updates,
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `pannes/${id}`);
      }
    }
  },

  // Checklists collection operations
  checklists: {
    async create(checklist: any) {
      try {
        const collRef = collection(db, 'checklists');
        const ref = await addDoc(collRef, {
          ...checklist,
          createdAt: checklist.createdAt || Timestamp.now()
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'checklists');
        return '';
      }
    },
    async update(id: string, updates: any) {
      try {
        const ref = doc(db, 'checklists', id);
        await updateDoc(ref, {
          ...updates,
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `checklists/${id}`);
      }
    }
  },

  // Alerts collection operations
  alerts: {
    async create(id: string, alert: any) {
      try {
        const ref = doc(db, 'alerts', id);
        await setDoc(ref, {
          ...alert,
          createdAt: alert.createdAt || Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `alerts/${id}`);
      }
    },
    async update(id: string, updates: any) {
      try {
        const ref = doc(db, 'alerts', id);
        await updateDoc(ref, {
          ...updates,
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `alerts/${id}`);
      }
    },
    async batchUpdateStatus(ids: string[], status: string) {
      const batchRef = writeBatch(db);
      try {
        for (const id of ids) {
          const ref = doc(db, 'alerts', id);
          batchRef.update(ref, {
            status,
            updatedAt: Timestamp.now()
          });
        }
        await batchRef.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'alerts_batch_update');
      }
    },
    async batchDelete(ids: string[]) {
      const batchRef = writeBatch(db);
      try {
        for (const id of ids) {
          const ref = doc(db, 'alerts', id);
          batchRef.delete(ref);
        }
        await batchRef.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'alerts_batch_delete');
      }
    }
  },

  mecaniciens: {
    async set(id: string, data: any) {
      try {
        const ref = doc(db, 'mecaniciens', id);
        await setDoc(ref, {
          ...data,
          updatedAt: Timestamp.now()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `mecaniciens/${id}`);
      }
    },
    async delete(id: string) {
      try {
        const ref = doc(db, 'mecaniciens', id);
        await deleteDoc(ref);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `mecaniciens/${id}`);
      }
    }
  },

  carnetSante: {
    async set(id: string, profile: any) {
      try {
        const ref = doc(db, 'carnetSante', id);
        await setDoc(ref, {
          ...profile,
          lastChecked: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `carnetSante/${id}`);
      }
    }
  },

  rca: {
    async set(id: string, data: any) {
      try {
        const ref = doc(db, 'rootCauseAnalysis', id);
        await setDoc(ref, {
          ...data,
          updatedAt: Timestamp.now()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `rootCauseAnalysis/${id}`);
      }
    },
    async delete(id: string) {
      try {
        const ref = doc(db, 'rootCauseAnalysis', id);
        await deleteDoc(ref);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `rootCauseAnalysis/${id}`);
      }
    }
  },

  annotationsEvenements: {
    async create(data: any) {
      try {
        const collRef = collection(db, 'annotationsEvenements');
        const ref = await addDoc(collRef, {
          ...data,
          createdAt: Timestamp.now()
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'annotationsEvenements');
        return '';
      }
    },
    async delete(id: string) {
      try {
        const ref = doc(db, 'annotationsEvenements', id);
        await deleteDoc(ref);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `annotationsEvenements/${id}`);
      }
    }
  },

  pneumatiques: {
    async set(enginId: string, data: any) {
      try {
        const ref = doc(db, 'pneumatiques', enginId);
        await setDoc(ref, {
          ...data,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `pneumatiques/${enginId}`);
      }
    }
  },

  systematicTaskConfigs: {
    async set(configId: string, data: any) {
      try {
        const ref = doc(db, 'systematicTaskConfigs', configId);
        await setDoc(ref, {
          ...data,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `systematicTaskConfigs/${configId}`);
      }
    }
  },

  systematicTasks: {
    async set(sheetId: string, data: any) {
      try {
        const ref = doc(db, 'systematicTasks', sheetId);
        await setDoc(ref, {
          ...data,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `systematicTasks/${sheetId}`);
      }
    },
    async update(sheetId: string, updates: any) {
      try {
        const ref = doc(db, 'systematicTasks', sheetId);
        await updateDoc(ref, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `systematicTasks/${sheetId}`);
      }
    }
  },

  chantiers: {
    async set(id: string, data: any) {
      try {
        const ref = doc(db, 'chantiers', id);
        await setDoc(ref, {
          ...data,
          updatedAt: Timestamp.now()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `chantiers/${id}`);
      }
    },
    async update(id: string, updates: any) {
      try {
        const ref = doc(db, 'chantiers', id);
        await updateDoc(ref, {
          ...updates,
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `chantiers/${id}`);
      }
    }
  },

  pmIntervalles: {
    async create(data: any) {
      try {
        const collRef = collection(db, 'pmIntervalles');
        const ref = await addDoc(collRef, {
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        return ref.id;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'pmIntervalles');
        return '';
      }
    },
    async update(id: string, updates: any) {
      try {
        const ref = doc(db, 'pmIntervalles', id);
        await updateDoc(ref, {
          ...updates,
          updatedAt: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `pmIntervalles/${id}`);
      }
    }
  },

  objectifsSites: {
    async set(siteId: string, data: any) {
      try {
        const ref = doc(db, 'objectifsSites', siteId);
        await setDoc(ref, {
          ...data,
          updatedAt: Timestamp.now()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `objectifsSites/${siteId}`);
      }
    }
  },

  importHistory: {
    async create(data: any) {
      try {
        const collRef = collection(db, 'config/imports/history');
        await addDoc(collRef, {
          ...data,
          timestamp: Timestamp.now()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'config/imports/history');
      }
    },
    async delete(id: string) {
      try {
        const ref = doc(db, 'config/imports/history', id);
        await deleteDoc(ref);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `config/imports/history/${id}`);
      }
    }
  },

  users: {
    async set(uid: string, data: any) {
      try {
        const ref = doc(db, 'users', uid);
        await setDoc(ref, {
          ...data,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }
    },
    async update(uid: string, updates: any) {
      try {
        const ref = doc(db, 'users', uid);
        await updateDoc(ref, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      }
    }
  },

  // Offline action log syncing & replay structures
  offlineQueue: {
    async replayAction(action: OfflineAction) {
      console.log(`Replaying offline local action with idempotencyKey ${action.idempotencyKey}:`, action);
      
      switch (action.actionType) {
        case 'DECLARE_STOP': {
          const { machineCode, stop, panne } = action.payload;
          const id = machineCode || panne?.enginId;
          if (id) {
            const ref = doc(db, 'engins', id);
            try {
              await updateDoc(ref, {
                status: ENGIN_STATUS.EN_PANNE,
                statut: 'panne',
                etat: 'En maintenance',
                dispo: 0,
                lastStopReason: stop?.reason || panne?.description || 'Saignement/Panne signalée hors-ligne',
                updatedAt: Timestamp.now()
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `engins/${id}`);
            }
          }
          if (panne) {
            try {
              await dbService.pannes.create(panne);
            } catch (err) {
              console.error("Failed to create panne during DECLARE_STOP replay:", err);
            }
          }
          break;
        }

        case 'UPDATE_BT': {
          const { id, updates } = action.payload;
          const taskRef = doc(db, 'maintenanceTasks', id);
          
          try {
            await runTransaction(db, async (transaction) => {
              const taskSnap = await transaction.get(taskRef);
              if (!taskSnap.exists()) {
                console.warn(`Task ${id} not found on replay. Creating/setting merged updates.`);
                transaction.set(taskRef, {
                  ...updates,
                  updatedAt: Timestamp.now()
                }, { merge: true });
                return;
              }
              const taskData = taskSnap.data() as any;
              
              const taskUpdates = {
                ...updates,
                updatedAt: Timestamp.now()
              };

              if (
                updates.statut === 'EN_COURS' &&
                taskData.type === 'CORRECTIF' &&
                updates.datePriseEnCharge === undefined &&
                !taskData.datePriseEnCharge
              ) {
                const now = Timestamp.now();
                taskUpdates.datePriseEnCharge = now;
                if (taskData.panneId) {
                  const panneRef = doc(db, 'pannes', taskData.panneId);
                  transaction.update(panneRef, {
                    datePriseEnCharge: now,
                    updatedAt: now
                  });
                }
              }

              transaction.update(taskRef, taskUpdates);

              const isCompletedNow = updates.statut === 'FAIT' || updates.statut === 'VALIDE';
              if (isCompletedNow) {
                if (taskData.type === 'CORRECTIF' && taskData.panneId) {
                  const panneRef = doc(db, 'pannes', taskData.panneId);
                  transaction.update(panneRef, {
                    statut: 'CLOS',
                    solution: updates.commentaire || "Fiche d'intervention validée.",
                    dateResolution: Timestamp.now(),
                    updatedAt: Timestamp.now()
                  });

                  if (taskData.enginId) {
                    const enginRef = doc(db, 'engins', taskData.enginId);
                    
                    const pannesQuery = query(collection(db, 'pannes'), where('enginId', '==', taskData.enginId));
                    const pSnap = await getDocs(pannesQuery);
                    let otherPannesOpen = 0;
                    pSnap.docs.forEach(d => {
                      if (d.id !== taskData.panneId && d.data().statut !== 'CLOS' && d.data().deleted !== true) {
                        otherPannesOpen++;
                      }
                    });

                    const tasksQuery = query(collection(db, 'maintenanceTasks'), where('enginId', '==', taskData.enginId));
                    const tSnap = await getDocs(tasksQuery);
                    let otherCorrectiveTasksOpen = 0;
                    tSnap.docs.forEach(d => {
                      if (d.id !== id && d.data().type === 'CORRECTIF' && !['FAIT', 'VALIDE'].includes(d.data().statut) && d.data().deleted !== true) {
                        otherCorrectiveTasksOpen++;
                      }
                    });

                    if (otherPannesOpen > 0) {
                      transaction.update(enginRef, {
                        statut: 'panne',
                        status: 'EN_PANNE',
                        etat: 'En maintenance',
                        dispo: 0,
                        updatedAt: Timestamp.now()
                      });
                    } else if (otherCorrectiveTasksOpen > 0) {
                      transaction.update(enginRef, {
                        statut: 'maintenance',
                        status: 'EN_MAINTENANCE',
                        etat: 'En maintenance',
                        dispo: 50,
                        updatedAt: Timestamp.now()
                      });
                    } else {
                      transaction.update(enginRef, {
                        statut: 'actif',
                        status: 'DISPONIBLE',
                        etat: 'Opérationnel',
                        dispo: 100,
                        updatedAt: Timestamp.now()
                      });
                    }
                  }
                } else if (taskData.type === 'PREVENTIF' && taskData.enginId) {
                  const enginRef = doc(db, 'engins', taskData.enginId);

                  const pannesQuery = query(collection(db, 'pannes'), where('enginId', '==', taskData.enginId));
                  const pSnap = await getDocs(pannesQuery);
                  let otherPannesOpen = 0;
                  pSnap.docs.forEach(d => {
                    if (d.data().statut !== 'CLOS' && d.data().deleted !== true) {
                      otherPannesOpen++;
                    }
                  });

                  const tasksQuery = query(collection(db, 'maintenanceTasks'), where('enginId', '==', taskData.enginId));
                  const tSnap = await getDocs(tasksQuery);
                  let otherCorrectiveTasksOpen = 0;
                  tSnap.docs.forEach(d => {
                    if (d.id !== id && d.data().type === 'CORRECTIF' && !['FAIT', 'VALIDE'].includes(d.data().statut) && d.data().deleted !== true) {
                      otherCorrectiveTasksOpen++;
                    }
                  });

                  if (otherPannesOpen > 0) {
                    transaction.update(enginRef, {
                      statut: 'panne',
                      status: 'EN_PANNE',
                      etat: 'En maintenance',
                      dispo: 0,
                      updatedAt: Timestamp.now()
                    });
                  } else if (otherCorrectiveTasksOpen > 0) {
                    transaction.update(enginRef, {
                      statut: 'maintenance',
                      status: 'EN_MAINTENANCE',
                      etat: 'En maintenance',
                      dispo: 50,
                      updatedAt: Timestamp.now()
                    });
                  } else {
                    transaction.update(enginRef, {
                      statut: 'actif',
                      status: 'DISPONIBLE',
                      etat: 'Opérationnel',
                      dispo: 100,
                      updatedAt: Timestamp.now()
                    });
                  }
                }
              }
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `maintenanceTasks/${id}`);
          }
          break;
        }

        case 'REMETTRE_EN_SERVICE': {
          const { machineCode } = action.payload;
          const ref = doc(db, 'engins', machineCode);
          try {
            await updateDoc(ref, {
              status: ENGIN_STATUS.DISPONIBLE,
              statut: 'actif',
              etat: 'Opérationnel',
              dispo: 100,
              updatedAt: Timestamp.now()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `engins/${machineCode}`);
          }
          break;
        }

        case 'CREATE_BT': {
          const newBT = action.payload;
          await dbService.workOrders.create(newBT, action.idempotencyKey || '');
          break;
        }

        case 'CREATE_CHECKLIST': {
          const newChecklist = action.payload;
          await dbService.checklists.create(newChecklist);
          break;
        }

        case 'PILOT_FEEDBACK': {
          const fbRef = collection(db, 'feedbacks');
          try {
            await addDoc(fbRef, {
              ...action.payload,
              idempotencyKey: action.idempotencyKey,
              createdAt: Timestamp.now()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, 'feedbacks');
          }
          break;
        }

        default:
          console.warn(`Type d'action offline inconnu ou non supporté : ${action.actionType}`);
      }
    }
  }
};
