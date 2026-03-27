import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import {
  getScopedStorageItem,
  getScopedStorageKey,
  getStorageScopeId,
  setScopedStorageItem,
} from '../utils/userStorage';

const WALLET_KEY = 'playerCredits';
const WALLET_EVENT = 'wallet:updated';
const DEFAULT_CREDITS = 120;

export function useWallet() {
  const { user, loading: authLoading } = useAuth();
  const [credits, setCredits] = useState(0);

  const storageScope = useMemo(() => getStorageScopeId(user?.uid), [user?.uid]);
  const walletStorageKey = useMemo(() => getScopedStorageKey(WALLET_KEY, user?.uid), [user?.uid]);

  const readCredits = useCallback(() => {
    const stored = getScopedStorageItem(WALLET_KEY, user?.uid);
    if (stored !== null) {
      const value = Number(stored);
      return Number.isNaN(value) ? DEFAULT_CREDITS : value;
    }

    setScopedStorageItem(WALLET_KEY, String(DEFAULT_CREDITS), user?.uid);
    return DEFAULT_CREDITS;
  }, [user?.uid]);

  const writeCredits = useCallback((value: number) => {
    setScopedStorageItem(WALLET_KEY, String(value), user?.uid);
    setCredits(value);
    window.dispatchEvent(
      new CustomEvent(WALLET_EVENT, { detail: { credits: value, scope: storageScope } })
    );
  }, [storageScope, user?.uid]);

  useEffect(() => {
    if (authLoading) return;

    setCredits(readCredits());

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== walletStorageKey) return;
      setCredits(readCredits());
    };

    const handleWalletEvent = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        event.detail?.scope === storageScope &&
        typeof event.detail?.credits === 'number'
      ) {
        setCredits(event.detail.credits as number);
        return;
      }
      setCredits(readCredits());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(WALLET_EVENT, handleWalletEvent);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(WALLET_EVENT, handleWalletEvent);
    };
  }, [authLoading, readCredits, storageScope, walletStorageKey]);

  const addCredits = (amount: number) => {
    if (amount <= 0) return;
    writeCredits(readCredits() + amount);
  };

  const spendCredits = (amount: number) => {
    if (amount <= 0) return true;
    const current = readCredits();
    if (current < amount) return false;
    writeCredits(current - amount);
    return true;
  };

  return { credits, addCredits, spendCredits };
}
