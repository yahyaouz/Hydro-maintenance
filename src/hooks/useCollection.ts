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

  // Master load query that handles query constraints and soft delete filters
  useEffect(() => {
    setLoading(true);
    lastDocRef.current = null;

    // Apply soft delete filtering unless explicitly bypassed (Soft Delete Architecture)
    const activeFilters = [...filters];
    if (!options.includeDeleted) {
      activeFilters.push(where('deleted', '!=', true));
    }

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
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        
        setData(result);
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] || null;
        setHasMore(snapshot.docs.length === limitCount);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching paginated ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(filters), limitCount, orderByField, orderByDirection, options.includeDeleted]);

  // Cursor pagination dynamic load more for infinite history support
  const loadMore = useCallback(async () => {
    if (!hasMore || !lastDocRef.current || loading) return;
    
    try {
      const activeFilters = [...filters];
      if (!options.includeDeleted) {
        activeFilters.push(where('deleted', '!=', true));
      }

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
          chunk.push({ id: doc.id, ...doc.data() } as T);
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

