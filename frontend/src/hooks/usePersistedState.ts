import { useState, useEffect, useCallback } from 'react';

/**
 * A custom hook that persists state to localStorage.
 * State is automatically saved and restored across page reloads and tab switches.
 * 
 * @param key - The localStorage key to use for persistence
 * @param initialValue - The initial value to use if no persisted value exists
 * @returns A tuple of [state, setState] similar to useState
 */
export function usePersistedState<T>(
    key: string,
    initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    // Initialize state from localStorage or use initial value
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue !== null) {
                return JSON.parse(storedValue);
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
        return initialValue;
    });

    // Persist to localStorage whenever state changes
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.warn(`Error saving to localStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
}

/**
 * A custom hook that persists state to sessionStorage.
 * State is cleared when the browser tab is closed.
 * 
 * @param key - The sessionStorage key to use for persistence
 * @param initialValue - The initial value to use if no persisted value exists
 * @returns A tuple of [state, setState] similar to useState
 */
export function useSessionState<T>(
    key: string,
    initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = sessionStorage.getItem(key);
            if (storedValue !== null) {
                return JSON.parse(storedValue);
            }
        } catch (error) {
            console.warn(`Error reading sessionStorage key "${key}":`, error);
        }
        return initialValue;
    });

    useEffect(() => {
        try {
            sessionStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.warn(`Error saving to sessionStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
}

/**
 * Clear all persisted state for a specific prefix
 * Useful for logout or reset functionality
 */
export function clearPersistedState(prefix: string): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
}
