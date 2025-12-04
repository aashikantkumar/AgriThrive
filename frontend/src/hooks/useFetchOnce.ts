import { useRef, useEffect, useCallback } from 'react';

/**
 * A hook that ensures a fetch function only runs once per unique key,
 * preventing duplicate API calls when components remount (e.g., on tab switch return).
 * 
 * @param key - A unique key that identifies the fetch operation (e.g., JSON stringified filters)
 * @param fetchFn - The fetch function to run
 * @param deps - Dependencies that should trigger a new fetch when changed
 */
export function useFetchOnce(
    key: string,
    fetchFn: () => Promise<void> | void,
    deps: React.DependencyList = []
) {
    const hasFetchedRef = useRef<Set<string>>(new Set());
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        // If we've already fetched with this key, skip
        if (hasFetchedRef.current.has(key)) {
            return;
        }

        // Mark as fetched
        hasFetchedRef.current.add(key);

        // Run the fetch function
        const runFetch = async () => {
            try {
                await fetchFn();
            } catch (error) {
                // Remove from fetched set so it can be retried
                hasFetchedRef.current.delete(key);
            }
        };

        runFetch();
    }, [key, ...deps]);

    // Function to force a refetch
    const refetch = useCallback(() => {
        hasFetchedRef.current.delete(key);
        fetchFn();
        hasFetchedRef.current.add(key);
    }, [key, fetchFn]);

    // Function to clear all cached fetches
    const clearCache = useCallback(() => {
        hasFetchedRef.current.clear();
    }, []);

    return { refetch, clearCache };
}

/**
 * A simpler hook that just prevents the initial fetch from running twice
 * when the component remounts due to tab switching.
 */
export function useStableEffect(
    effect: () => void | (() => void),
    deps: React.DependencyList
) {
    const hasRunRef = useRef(false);
    const depsRef = useRef<React.DependencyList>(deps);

    // Check if deps have actually changed
    const depsChanged = deps.some((dep, i) => dep !== depsRef.current[i]);

    useEffect(() => {
        // If already run and deps haven't changed, skip
        if (hasRunRef.current && !depsChanged) {
            return;
        }

        hasRunRef.current = true;
        depsRef.current = deps;

        return effect();
    }, deps);
}

/**
 * Hook to prevent API calls when returning from a different browser tab.
 * Uses the document visibility API.
 */
export function usePreventRefetchOnTabReturn(fetchFn: () => void, deps: React.DependencyList = []) {
    const lastFetchTimeRef = useRef<number>(0);
    const MIN_REFETCH_INTERVAL = 30000; // 30 seconds minimum between fetches

    useEffect(() => {
        const now = Date.now();

        // Only fetch if enough time has passed since last fetch
        if (now - lastFetchTimeRef.current > MIN_REFETCH_INTERVAL) {
            lastFetchTimeRef.current = now;
            fetchFn();
        }
    }, deps);
}
