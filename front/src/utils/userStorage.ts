export const GUEST_STORAGE_SCOPE = 'guest';

export const getStorageScopeId = (userId?: string | null) => {
  const normalizedUserId = userId?.trim();
  return normalizedUserId ? normalizedUserId : GUEST_STORAGE_SCOPE;
};

export const getScopedStorageKey = (baseKey: string, userId?: string | null) => {
  return `${baseKey}::${getStorageScopeId(userId)}`;
};

export const migrateLegacyStorageKey = (baseKey: string, userId?: string | null) => {
  const scopedKey = getScopedStorageKey(baseKey, userId);

  if (typeof window === 'undefined') {
    return scopedKey;
  }

  if (localStorage.getItem(scopedKey) !== null) {
    return scopedKey;
  }

  const legacyValue = localStorage.getItem(baseKey);
  if (legacyValue === null) {
    return scopedKey;
  }

  localStorage.setItem(scopedKey, legacyValue);
  localStorage.removeItem(baseKey);
  return scopedKey;
};

export const getScopedStorageItem = (baseKey: string, userId?: string | null) => {
  const scopedKey = migrateLegacyStorageKey(baseKey, userId);
  return localStorage.getItem(scopedKey);
};

export const setScopedStorageItem = (baseKey: string, value: string, userId?: string | null) => {
  localStorage.setItem(getScopedStorageKey(baseKey, userId), value);
};

export const removeScopedStorageItem = (baseKey: string, userId?: string | null) => {
  localStorage.removeItem(getScopedStorageKey(baseKey, userId));
};