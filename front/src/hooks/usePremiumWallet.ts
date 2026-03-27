import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import {
  getScopedStorageItem,
  getScopedStorageKey,
  getStorageScopeId,
  setScopedStorageItem,
} from '../utils/userStorage';

const CRYSTALS_KEY = 'playerCrystals';
const CRYSTALS_EVENT = 'crystals:updated';
const DEFAULT_CRYSTALS = 0;

export function usePremiumWallet() {
  const { user, loading: authLoading } = useAuth();
  const [crystals, setCrystals] = useState(0);

  const storageScope = useMemo(() => getStorageScopeId(user?.uid), [user?.uid]);
  const crystalsStorageKey = useMemo(() => getScopedStorageKey(CRYSTALS_KEY, user?.uid), [user?.uid]);

  const readCrystals = useCallback(() => {
    const stored = getScopedStorageItem(CRYSTALS_KEY, user?.uid);
    if (stored !== null) {
      const value = Number(stored);
      return Number.isNaN(value) ? DEFAULT_CRYSTALS : value;
    }
    setScopedStorageItem(CRYSTALS_KEY, String(DEFAULT_CRYSTALS), user?.uid);
    return DEFAULT_CRYSTALS;
  }, [user?.uid]);

  const writeCrystals = useCallback((value: number) => {
    setScopedStorageItem(CRYSTALS_KEY, String(value), user?.uid);
    setCrystals(value);
    window.dispatchEvent(
      new CustomEvent(CRYSTALS_EVENT, { detail: { crystals: value, scope: storageScope } })
    );
  }, [storageScope, user?.uid]);

  useEffect(() => {
    if (authLoading) return;

    const initialSyncTimer = window.setTimeout(() => {
      setCrystals(readCrystals());
    }, 0);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== crystalsStorageKey) return;
      setCrystals(readCrystals());
    };

    const handleCrystalsEvent = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        event.detail?.scope === storageScope &&
        typeof event.detail?.crystals === 'number'
      ) {
        setCrystals(event.detail.crystals as number);
        return;
      }
      setCrystals(readCrystals());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(CRYSTALS_EVENT, handleCrystalsEvent);
    return () => {
      window.clearTimeout(initialSyncTimer);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CRYSTALS_EVENT, handleCrystalsEvent);
    };
  }, [authLoading, readCrystals, storageScope, crystalsStorageKey]);

  const addCrystals = (amount: number) => {
    if (amount <= 0) return;
    writeCrystals(readCrystals() + amount);
  };

  const spendCrystals = (amount: number) => {
    if (amount <= 0) return true;
    const current = readCrystals();
    if (current < amount) return false;
    writeCrystals(current - amount);
    return true;
  };

  return { crystals, addCrystals, spendCrystals };
}
