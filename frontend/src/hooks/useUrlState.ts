import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

type ParamValue = string | number | boolean | null | undefined;

interface UrlStateOptions {
    /** Default values for URL parameters */
    defaults?: Record<string, ParamValue>;
    /** Whether to replace history instead of push */
    replace?: boolean;
}

/**
 * A custom hook that syncs state with URL search parameters.
 * This allows filter states to persist across page refreshes and be shareable via URL.
 * 
 * @param options - Configuration options
 * @returns Object with getParam, setParam, setParams, and clearParams functions
 */
export function useUrlState(options: UrlStateOptions = {}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const { defaults = {}, replace = true } = options;

    /**
     * Get a single parameter value from URL
     */
    const getParam = useCallback((key: string): string | null => {
        const value = searchParams.get(key);
        if (value !== null) return value;

        // Return default if exists
        const defaultValue = defaults[key];
        if (defaultValue !== undefined && defaultValue !== null) {
            return String(defaultValue);
        }
        return null;
    }, [searchParams, defaults]);

    /**
     * Get all current parameters as an object
     */
    const params = useMemo(() => {
        const result: Record<string, string> = {};

        // Start with defaults
        Object.entries(defaults).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                result[key] = String(value);
            }
        });

        // Override with URL params
        searchParams.forEach((value, key) => {
            result[key] = value;
        });

        return result;
    }, [searchParams, defaults]);

    /**
     * Set a single parameter in the URL
     */
    const setParam = useCallback((key: string, value: ParamValue) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);

            if (value === null || value === undefined || value === '') {
                newParams.delete(key);
            } else {
                newParams.set(key, String(value));
            }

            return newParams;
        }, { replace });
    }, [setSearchParams, replace]);

    /**
     * Set multiple parameters at once
     */
    const setParams = useCallback((newParams: Record<string, ParamValue>) => {
        setSearchParams(prev => {
            const updated = new URLSearchParams(prev);

            Object.entries(newParams).forEach(([key, value]) => {
                if (value === null || value === undefined || value === '') {
                    updated.delete(key);
                } else {
                    updated.set(key, String(value));
                }
            });

            return updated;
        }, { replace });
    }, [setSearchParams, replace]);

    /**
     * Clear all URL parameters
     */
    const clearParams = useCallback(() => {
        setSearchParams({}, { replace });
    }, [setSearchParams, replace]);

    /**
     * Check if user has made any selections (has any non-default params)
     */
    const hasActiveParams = useMemo(() => {
        let hasActive = false;
        searchParams.forEach((value, key) => {
            const defaultValue = defaults[key];
            if (defaultValue === undefined || String(defaultValue) !== value) {
                hasActive = true;
            }
        });
        return hasActive;
    }, [searchParams, defaults]);

    return {
        params,
        getParam,
        setParam,
        setParams,
        clearParams,
        hasActiveParams,
        searchParams
    };
}
