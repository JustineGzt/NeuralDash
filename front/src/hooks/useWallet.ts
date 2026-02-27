import { useEffect, useState } from 'react';

const WALLET_KEY = 'playerCredits';
const WALLET_EVENT = 'wallet:updated';
const DEFAULT_CREDITS = 120;

export function useWallet() {
  const [credits, setCredits] = useState(0);

  const readCredits = () => {
    const stored = localStorage.getItem(WALLET_KEY);
    if (stored !== null) {
      const value = Number(stored);
      return Number.isNaN(value) ? DEFAULT_CREDITS : value;
    }
    localStorage.setItem(WALLET_KEY, String(DEFAULT_CREDITS));
    return DEFAULT_CREDITS;
  };

  const writeCredits = (value: number) => {
    localStorage.setItem(WALLET_KEY, String(value));
    setCredits(value);
    window.dispatchEvent(new CustomEvent(WALLET_EVENT, { detail: { credits: value } }));
  };

  useEffect(() => {
    setCredits(readCredits());

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== WALLET_KEY) return;
      setCredits(readCredits());
    };

    const handleWalletEvent = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail?.credits === 'number') {
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
  }, []);

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
