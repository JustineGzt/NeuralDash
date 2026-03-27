import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import {
  getScopedStorageItem,
  getScopedStorageKey,
  getStorageScopeId,
  setScopedStorageItem,
} from '../utils/userStorage';

export type UiThemeId = 'default' | 'blood-red' | 'royal-gold' | 'neon-green';

export type PremiumVisualTheme = {
  id: UiThemeId;
  name: string;
  accent: string;
  price: number;
  description: string;
};

export const PREMIUM_VISUAL_THEMES: PremiumVisualTheme[] = [
  {
    id: 'blood-red',
    name: 'Dark Blood Red',
    accent: 'from-red-700 via-red-500 to-black',
    price: 280,
    description: 'Ambiance rouge sombre agressive pour toute l interface.',
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    accent: 'from-yellow-500 via-amber-300 to-yellow-900',
    price: 260,
    description: 'Palette dorée premium type terminal elite.',
  },
  {
    id: 'neon-green',
    name: 'Neon Green',
    accent: 'from-emerald-300 via-lime-300 to-green-900',
    price: 240,
    description: 'Style neon cyber vert ultra lumineux.',
  },
];

const OWNED_THEMES_KEY = 'playerOwnedThemes';
const ACTIVE_THEME_KEY = 'playerActiveTheme';
const THEMES_EVENT = 'themes:updated';

const DEFAULT_OWNED_THEMES: UiThemeId[] = ['default'];
const DEFAULT_ACTIVE_THEME: UiThemeId = 'default';

const parseOwnedThemes = (raw: string | null): UiThemeId[] => {
  if (!raw) return DEFAULT_OWNED_THEMES;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_OWNED_THEMES;
    const valid = parsed.filter((id): id is UiThemeId =>
      id === 'default' || id === 'blood-red' || id === 'royal-gold' || id === 'neon-green'
    );
    return valid.length > 0 ? Array.from(new Set(valid)) : DEFAULT_OWNED_THEMES;
  } catch {
    return DEFAULT_OWNED_THEMES;
  }
};

const parseActiveTheme = (raw: string | null): UiThemeId => {
  if (raw === 'blood-red' || raw === 'royal-gold' || raw === 'neon-green' || raw === 'default') {
    return raw;
  }
  return DEFAULT_ACTIVE_THEME;
};

export function useVisualTheme() {
  const { user, loading: authLoading } = useAuth();

  const [ownedThemeIds, setOwnedThemeIds] = useState<UiThemeId[]>(DEFAULT_OWNED_THEMES);
  const [activeThemeId, setActiveThemeId] = useState<UiThemeId>(DEFAULT_ACTIVE_THEME);

  const storageScope = useMemo(() => getStorageScopeId(user?.uid), [user?.uid]);
  const ownedThemesStorageKey = useMemo(() => getScopedStorageKey(OWNED_THEMES_KEY, user?.uid), [user?.uid]);
  const activeThemeStorageKey = useMemo(() => getScopedStorageKey(ACTIVE_THEME_KEY, user?.uid), [user?.uid]);

  const readOwnedThemes = useCallback(() => {
    const raw = getScopedStorageItem(OWNED_THEMES_KEY, user?.uid);
    const parsed = parseOwnedThemes(raw);
    if (raw === null) {
      setScopedStorageItem(OWNED_THEMES_KEY, JSON.stringify(parsed), user?.uid);
    }
    return parsed;
  }, [user?.uid]);

  const readActiveTheme = useCallback(() => {
    const raw = getScopedStorageItem(ACTIVE_THEME_KEY, user?.uid);
    const parsed = parseActiveTheme(raw);
    if (raw === null) {
      setScopedStorageItem(ACTIVE_THEME_KEY, parsed, user?.uid);
    }
    return parsed;
  }, [user?.uid]);

  const broadcast = useCallback((themes: UiThemeId[], active: UiThemeId) => {
    window.dispatchEvent(new CustomEvent(THEMES_EVENT, {
      detail: { scope: storageScope, themes, active },
    }));
  }, [storageScope]);

  const persistOwnedThemes = useCallback((themes: UiThemeId[]) => {
    setScopedStorageItem(OWNED_THEMES_KEY, JSON.stringify(themes), user?.uid);
    setOwnedThemeIds(themes);
    broadcast(themes, activeThemeId);
  }, [activeThemeId, broadcast, user?.uid]);

  const persistActiveTheme = useCallback((themeId: UiThemeId) => {
    setScopedStorageItem(ACTIVE_THEME_KEY, themeId, user?.uid);
    setActiveThemeId(themeId);
    broadcast(ownedThemeIds, themeId);
  }, [broadcast, ownedThemeIds, user?.uid]);

  useEffect(() => {
    if (authLoading) return;

    const initialSync = window.setTimeout(() => {
      const themes = readOwnedThemes();
      const active = readActiveTheme();
      setOwnedThemeIds(themes);
      setActiveThemeId(themes.includes(active) ? active : 'default');
    }, 0);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== ownedThemesStorageKey && event.key !== activeThemeStorageKey) return;
      const themes = readOwnedThemes();
      const active = readActiveTheme();
      setOwnedThemeIds(themes);
      setActiveThemeId(themes.includes(active) ? active : 'default');
    };

    const handleThemeEvent = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      if (event.detail?.scope !== storageScope) return;
      const themes = Array.isArray(event.detail?.themes) ? event.detail.themes as UiThemeId[] : readOwnedThemes();
      const active = parseActiveTheme(event.detail?.active as string | null);
      setOwnedThemeIds(themes);
      setActiveThemeId(themes.includes(active) ? active : 'default');
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(THEMES_EVENT, handleThemeEvent);

    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(THEMES_EVENT, handleThemeEvent);
    };
  }, [
    activeThemeStorageKey,
    authLoading,
    ownedThemesStorageKey,
    readActiveTheme,
    readOwnedThemes,
    storageScope,
  ]);

  const unlockTheme = (themeId: UiThemeId) => {
    if (ownedThemeIds.includes(themeId)) return;
    const next = Array.from(new Set([...ownedThemeIds, themeId]));
    persistOwnedThemes(next);
  };

  const setActiveTheme = (themeId: UiThemeId) => {
    if (!ownedThemeIds.includes(themeId)) return false;
    persistActiveTheme(themeId);
    return true;
  };

  // Atomic: unlock + activate in one pass — avoids stale-state bug
  const unlockAndActivateTheme = (themeId: UiThemeId) => {
    const newOwned = ownedThemeIds.includes(themeId)
      ? ownedThemeIds
      : Array.from(new Set([...ownedThemeIds, themeId]));
    setScopedStorageItem(OWNED_THEMES_KEY, JSON.stringify(newOwned), user?.uid);
    setScopedStorageItem(ACTIVE_THEME_KEY, themeId, user?.uid);
    setOwnedThemeIds(newOwned);
    setActiveThemeId(themeId);
    broadcast(newOwned, themeId);
  };

  return {
    availableThemes: PREMIUM_VISUAL_THEMES,
    ownedThemeIds,
    activeThemeId,
    unlockTheme,
    setActiveTheme,
    unlockAndActivateTheme,
  };
}
