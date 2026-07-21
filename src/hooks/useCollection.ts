import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  unlimited?: boolean;
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
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  
  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const filtersRef = useRef(filters);
  const limitCount = options.unlimited ? undefined : (options.limitNum || 35);
  const orderByField = options.orderByField || 'updatedAt';
  const orderByDirection = options.orderByDirection || 'desc';

  const { user } = useAuthStore();

  // Sync filters to ref
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Safely serialize query filters for the dependency array to avoid JSON.stringify crashes or missing updates
  const filterKey = useMemo(() => {
    if (!filters || filters.length === 0) return '';
    return filters.map((f: any, idx) => {
      try {
        const type = f.type || '';
        const strValues: string[] = [];
        for (const k in f) {
          if (Object.prototype.hasOwnProperty.call(f, k)) {
            const val = f[k];
            if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
              strValues.push(`${k}:${val}`);
            }
          }
        }
        return `${type}[${idx}]:${strValues.join(',')}`;
      } catch (e) {
        return `constraint-${idx}`;
      }
    }).join(';');
  }, [filters]);

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
    
    // Check if an explicit orderBy already exists in filters
    const hasExplicitOrderBy = activeFilters.some((f: any) => f.type === 'orderBy');
    if (!hasExplicitOrderBy) {
      qConstraints.push(orderBy(orderByField, orderByDirection));
    }
    if (limitCount !== undefined) {
      qConstraints.push(limit(limitCount));
    }

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
        setHasMore(limitCount !== undefined && snapshot.docs.length === limitCount);
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
  }, [collectionName, filterKey, limitCount, orderByField, orderByDirection, options.includeDeleted, user?.uid, user?.active]);

  // Cursor pagination dynamic load more for infinite history support
  const loadMore = useCallback(async () => {
    if (!hasMore || !lastDocRef.current || loading) return;
    setLoadMoreError(null);
    
    try {
      const activeFilters = [...filtersRef.current];
      const qConstraints: any[] = [...activeFilters];
      const hasExplicitOrderBy = activeFilters.some((f: any) => f.type === 'orderBy');
      if (!hasExplicitOrderBy) {
        qConstraints.push(orderBy(orderByField, orderByDirection));
      }
      qConstraints.push(startAfter(lastDocRef.current));
      if (limitCount !== undefined) {
        qConstraints.push(limit(limitCount));
      }

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
        setHasMore(limitCount !== undefined && snapshot.docs.length === limitCount);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error(`Failed loading next cursor page of ${collectionName}:`, err);
      setLoadMoreError("Impossible de charger plus de résultats, réessayez.");
    }
  }, [collectionName, filterKey, hasMore, lastDocRef, loading, limitCount, orderByField, orderByDirection, options.includeDeleted]);

  return { data, loading, error, hasMore, loadMore, loadMoreError };
}

