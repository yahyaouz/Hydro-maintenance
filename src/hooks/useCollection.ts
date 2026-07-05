import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  QueryConstraint, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  DocumentSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';

export interface CollectionOptions {
  limitNum?: number;
  orderByField?: string;
  orderByDirection?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export function useCollection<T>(
  collectionName: string, 
  filters: QueryConstraint[] = [],
  options: CollectionOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const limitCount = options.limitNum || 35;
  const orderByField = options.orderByField || 'updatedAt';
  const orderByDirection = options.orderByDirection || 'desc';

  const { user } = useAuthStore();

  // Master load query that handles query constraints and soft delete filters
  useEffect(() => {
    if (!user || user.active === false) {
      setLoading(false);
      return;
    }

    setLoading(true);
    lastDocRef.current = null;

    const activeFilters = [...filters];
    // Build base query constraints with limits as requested
    const qConstraints: any[] = [...activeFilters];
    
    // Check if orberBy exists
    qConstraints.push(orderBy(orderByField, orderByDirection));
    qConstraints.push(limit(limitCount));

    const q = query(collection(db, collectionName), ...qConstraints);
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          const docData = { id: doc.id, ...doc.data() } as any;
          if (options.includeDeleted || docData.deleted !== true) {
            result.push(docData);
          }
        });
        
        setData(result);
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
        setHasMore(snapshot.docs.length === limitCount);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching paginated ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(filters), limitCount, orderByField, orderByDirection, options.includeDeleted, user?.uid, user?.active]);

  // Cursor pagination dynamic load more for infinite history support
  const loadMore = useCallback(async () => {
    if (!hasMore || !lastDocRef.current || loading) return;
    
    try {
      const activeFilters = [...filters];
      const qConstraints: any[] = [
        ...activeFilters,
        orderBy(orderByField, orderByDirection),
        startAfter(lastDocRef.current),
        limit(limitCount)
      ];

      const q = query(collection(db, collectionName), ...qConstraints);
      const snapshot = await getDocs(q);
      
      if (snapshot.docs.length > 0) {
        const chunk: T[] = [];
        snapshot.forEach((doc) => {
          const docData = { id: doc.id, ...doc.data() } as any;
          if (options.includeDeleted || docData.deleted !== true) {
            chunk.push(docData);
          }
        });
        
        setData(prev => {
          // Deduplicate items just in case
          const ids = new Set(prev.map((item: any) => item.id));
          const filteredChunk = chunk.filter((item: any) => !ids.has(item.id));
          return [...prev, ...filteredChunk];
        });
        
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        setHasMore(snapshot.docs.length === limitCount);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error(`Failed loading next cursor page of ${collectionName}:`, err);
    }
  }, [collectionName, filters, hasMore, lastDocRef.current, loading, limitCount, orderByField, orderByDirection, options.includeDeleted]);

  return { data, loading, error, hasMore, loadMore };
}

