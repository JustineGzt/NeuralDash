import { useEffect, useMemo, useState } from 'react';
import type { NeedEffects, PlayerNeeds } from '../types/needs';
import {
  DEFAULT_NEEDS,
  applyInactivityDecay,
  applyNeedsBoost,
  initializeNeedsState,
  markUserActivity,
  NEEDS_EVENT,
  readNeedsState,
} from '../utils/needsState';
import { useAuth } from './useAuth';
import { getStorageScopeId } from '../utils/userStorage';

const INACTIVITY_TICK_MS = 30000;
const ACTIVITY_THROTTLE_MS = 15000;

export function useNeeds() {
  const { user, loading: authLoading } = useAuth();
  const [needs, setNeeds] = useState<PlayerNeeds>(DEFAULT_NEEDS);
  const storageScope = useMemo(() => getStorageScopeId(user?.uid), [user?.uid]);

  useEffect(() => {
    if (authLoading) return;
    initializeNeedsState(user?.uid);
    setNeeds(applyInactivityDecay(Date.now(), user?.uid));
  }, [authLoading, user?.uid]);

  useEffect(() => {
    if (authLoading) return;

    const syncNeeds = () => setNeeds(readNeedsState(user?.uid));

    const onNeedsUpdated = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.scope !== storageScope) {
        return;
      }
      syncNeeds();
    };

    let lastActivityTs = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastActivityTs < ACTIVITY_THROTTLE_MS) return;
      lastActivityTs = now;
      markUserActivity(now, user?.uid);
    };

    const tick = window.setInterval(() => {
      const decayed = applyInactivityDecay(Date.now(), user?.uid);
      setNeeds(decayed);
    }, INACTIVITY_TICK_MS);

    window.addEventListener(NEEDS_EVENT, onNeedsUpdated as EventListener);
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('click', onActivity);
    window.addEventListener('touchstart', onActivity);

    return () => {
      window.clearInterval(tick);
      window.removeEventListener(NEEDS_EVENT, onNeedsUpdated as EventListener);
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('touchstart', onActivity);
    };
  }, [authLoading, storageScope, user?.uid]);

  const boostNeeds = (effects: NeedEffects, reason = 'manual') => {
    const next = applyNeedsBoost(effects, reason, user?.uid);
    setNeeds(next);
  };

  return {
    needs,
    boostNeeds,
  };
}
