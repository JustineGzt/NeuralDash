import type { NeedEffects, NeedKey, PlayerNeeds } from '../types/needs';
import { NEED_KEYS } from '../types/needs';
import {
  getScopedStorageItem,
  getStorageScopeId,
  setScopedStorageItem,
} from './userStorage';

export const NEEDS_STORAGE_KEY = 'playerNeedsState';
export const NEEDS_EVENT = 'needs:updated';
const NEEDS_LAST_ACTIVITY_KEY = 'playerNeedsLastActivity';
const NEEDS_LAST_DECAY_AT_KEY = 'playerNeedsLastDecayAt';

const IDLE_GRACE_MS = 4 * 60 * 1000;

const DECAY_PER_MINUTE: Record<NeedKey, number> = {
  hunger: 0.45,
  thirst: 0.65,
  engagement: 0.55,
  productivity: 0.5,
  energy: 0.4,
  focus: 0.45,
  mood: 0.3,
};

export const DEFAULT_NEEDS: PlayerNeeds = {
  hunger: 78,
  thirst: 74,
  engagement: 70,
  productivity: 68,
  energy: 72,
  focus: 66,
  mood: 76,
};

const clampValue = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const sanitizeNeeds = (value: unknown): PlayerNeeds => {
  if (!value || typeof value !== 'object') return DEFAULT_NEEDS;

  const raw = value as Partial<PlayerNeeds>;
  return {
    hunger: clampValue(Number(raw.hunger ?? DEFAULT_NEEDS.hunger)),
    thirst: clampValue(Number(raw.thirst ?? DEFAULT_NEEDS.thirst)),
    engagement: clampValue(Number(raw.engagement ?? DEFAULT_NEEDS.engagement)),
    productivity: clampValue(Number(raw.productivity ?? DEFAULT_NEEDS.productivity)),
    energy: clampValue(Number(raw.energy ?? DEFAULT_NEEDS.energy)),
    focus: clampValue(Number(raw.focus ?? DEFAULT_NEEDS.focus)),
    mood: clampValue(Number(raw.mood ?? DEFAULT_NEEDS.mood)),
  };
};

const setTimestamp = (key: string, value: number, userId?: string | null) => {
  setScopedStorageItem(key, String(value), userId);
};

const getTimestamp = (key: string, fallback: number, userId?: string | null): number => {
  const raw = Number(getScopedStorageItem(key, userId));
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
};

const applyEffects = (base: PlayerNeeds, effects: NeedEffects): PlayerNeeds => {
  const next: PlayerNeeds = { ...base };

  for (const key of NEED_KEYS) {
    if (effects[key] === undefined) continue;
    next[key] = clampValue(base[key] + Number(effects[key]));
  }

  return next;
};

export const readNeedsState = (userId?: string | null): PlayerNeeds => {
  try {
    const raw = getScopedStorageItem(NEEDS_STORAGE_KEY, userId);
    if (!raw) return DEFAULT_NEEDS;
    return sanitizeNeeds(JSON.parse(raw));
  } catch {
    return DEFAULT_NEEDS;
  }
};

export const writeNeedsState = (
  needs: PlayerNeeds,
  reason = 'manual',
  userId?: string | null
): PlayerNeeds => {
  const safeNeeds = sanitizeNeeds(needs);
  setScopedStorageItem(NEEDS_STORAGE_KEY, JSON.stringify(safeNeeds), userId);
  window.dispatchEvent(
    new CustomEvent(NEEDS_EVENT, {
      detail: { needs: safeNeeds, reason, scope: getStorageScopeId(userId) },
    })
  );
  return safeNeeds;
};

export const markUserActivity = (timestamp = Date.now(), userId?: string | null) => {
  setTimestamp(NEEDS_LAST_ACTIVITY_KEY, timestamp, userId);
  setTimestamp(NEEDS_LAST_DECAY_AT_KEY, timestamp, userId);
};

export const initializeNeedsState = (userId?: string | null): PlayerNeeds => {
  const needs = readNeedsState(userId);

  if (!getScopedStorageItem(NEEDS_STORAGE_KEY, userId)) {
    writeNeedsState(needs, 'init', userId);
  }

  const now = Date.now();
  if (!getScopedStorageItem(NEEDS_LAST_ACTIVITY_KEY, userId)) {
    setTimestamp(NEEDS_LAST_ACTIVITY_KEY, now, userId);
  }
  if (!getScopedStorageItem(NEEDS_LAST_DECAY_AT_KEY, userId)) {
    setTimestamp(NEEDS_LAST_DECAY_AT_KEY, now, userId);
  }

  return needs;
};

export const applyNeedsBoost = (
  effects: NeedEffects,
  reason = 'mission',
  userId?: string | null
): PlayerNeeds => {
  const current = readNeedsState(userId);
  const next = applyEffects(current, effects);
  markUserActivity(Date.now(), userId);
  return writeNeedsState(next, reason, userId);
};

export const applyInactivityDecay = (now = Date.now(), userId?: string | null): PlayerNeeds => {
  const current = readNeedsState(userId);
  const lastActivity = getTimestamp(NEEDS_LAST_ACTIVITY_KEY, now, userId);
  const decayStartAt = lastActivity + IDLE_GRACE_MS;

  if (now <= decayStartAt) {
    return current;
  }

  const lastDecayAt = getTimestamp(NEEDS_LAST_DECAY_AT_KEY, decayStartAt, userId);
  const from = Math.max(lastDecayAt, decayStartAt);
  const elapsedMinutes = Math.floor((now - from) / 60000);

  if (elapsedMinutes <= 0) {
    return current;
  }

  const decayEffects: NeedEffects = {};
  for (const key of NEED_KEYS) {
    decayEffects[key] = -DECAY_PER_MINUTE[key] * elapsedMinutes;
  }

  const next = applyEffects(current, decayEffects);
  setTimestamp(NEEDS_LAST_DECAY_AT_KEY, now, userId);
  return writeNeedsState(next, 'inactivity', userId);
};
