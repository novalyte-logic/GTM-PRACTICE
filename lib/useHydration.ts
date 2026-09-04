'use client';

import { useSyncExternalStore, useCallback } from 'react';

const emptySubscribe = () => () => {};

export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function storageSubscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('gtm-storage-sync', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('gtm-storage-sync', callback);
  };
}

export function useStorageItem<T>(key: string, defaultValue: T): [T, (val: T | ((prev: T) => T)) => void, () => void] {
  const defaultJson = JSON.stringify(defaultValue);

  const getSnapshot = () => {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : defaultJson;
    } catch {
      return defaultJson;
    }
  };

  const getServerSnapshot = () => defaultJson;

  const raw = useSyncExternalStore(storageSubscribe, getSnapshot, getServerSnapshot);

  let parsed: T;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = defaultValue;
  }

  const setItem = useCallback((valOrFn: T | ((prev: T) => T)) => {
    try {
      const currentRaw = localStorage.getItem(key);
      let current = defaultValue;
      if (currentRaw !== null) {
        try {
          current = JSON.parse(currentRaw);
        } catch (_) {}
      }
      const next = typeof valOrFn === 'function' ? (valOrFn as (prev: T) => T)(current) : valOrFn;
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event('gtm-storage-sync'));
    } catch (e) {
      console.error('Error saving storage item for key', key, e);
    }
  }, [key, defaultValue]);

  const removeItem = useCallback(() => {
    try {
      localStorage.removeItem(key);
      window.dispatchEvent(new Event('gtm-storage-sync'));
    } catch (e) {
      console.error('Error removing storage item for key', key, e);
    }
  }, [key]);

  return [parsed, setItem, removeItem];
}
